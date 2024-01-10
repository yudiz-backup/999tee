import { useCallback, useState, useMemo, useEffect } from 'react';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { useCartContext } from '@magento/peregrine/lib/context/cart';
import { appendOptionsToPayload } from '@magento/peregrine/lib/util/appendOptionsToPayload';
import { findMatchingVariant } from '@magento/peregrine/lib/util/findMatchingProductVariant';
import { isProductConfigurable } from '@magento/peregrine/lib/util/isProductConfigurable';
import { deriveErrorMessage } from '@magento/peregrine/lib/util/deriveErrorMessage';
import { useAwaitQuery } from '@magento/peregrine/lib/hooks/useAwaitQuery';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { clearCustomerDataFromCache } from '@magento/peregrine/lib/Apollo/clearCustomerDataFromCache';

const INITIAL_OPTION_CODES = new Map();
const INITIAL_OPTION_SELECTIONS = new Map();
const INITIAL_QUANTITY = 1;

const deriveOptionCodesFromProduct = product => {
    // If this is a simple product it has no option codes.
    if (!isProductConfigurable(product)) {
        return INITIAL_OPTION_CODES;
    }

    // Initialize optionCodes based on the options of the product.
    const initialOptionCodes = new Map();

    if (Array.isArray(product.configurable_options)) {
        for (const {
            attribute_id,
            attribute_code
        } of product.configurable_options) {
            initialOptionCodes.set(attribute_id, attribute_code);
        }
    }
    return initialOptionCodes;
};

// Similar to deriving the initial codes for each option.
const deriveOptionSelectionsFromProduct = product => {
    if (!isProductConfigurable(product)) {
        return INITIAL_OPTION_SELECTIONS;
    }

    const initialOptionSelections = new Map();

    // Check if product.configurable_options is an array before iterating
    if (Array.isArray(product.configurable_options)) {
        for (const { attribute_id } of product.configurable_options) {
            initialOptionSelections.set(attribute_id, undefined);
        }
    }

    return initialOptionSelections;
};
const getIsMissingOptions = (product, optionSelections) => {
    // Non-configurable products can't be missing options.
    if (!isProductConfigurable(product)) {
        return false;
    }

    // Configurable products are missing options if we have fewer
    // option selections than the product has options.
    const { configurable_options } = product;
    const numProductOptions = configurable_options?.length || 0;
    const numProductSelections = Array.from(optionSelections.values()).filter(
        value => !!value
    )?.length;

    return numProductSelections < numProductOptions;
};

const getMediaGalleryEntries = (product, optionCodes, optionSelections) => {
    let value = [];

    const { media_gallery_entries, variants } = product;
    const isConfigurable = isProductConfigurable(product);

    // Selections are initialized to "code => undefined". Once we select a value, like color, the selections change. This filters out unselected options.
    const optionsSelected =
        Array.from(optionSelections.values()).filter(value => !!value).length >
        0;

    if (!isConfigurable || !optionsSelected) {
        value = media_gallery_entries;
    } else {
        // If any of the possible variants matches the selection add that
        // variant's image to the media gallery. NOTE: This _can_, and does,
        // include variants such as size. If Magento is configured to display
        // an image for a size attribute, it will render that image.
        const item = findMatchingVariant({
            optionCodes,
            optionSelections,
            variants
        });
        // const mergedItem = []
        // if(item && item.product && item.product.media_gallery_entries) {
        //     mergedItem.push(item.product.media_gallery_entries)
        // }
        // if(media_gallery_entries) {
        //     mergedItem.push(media_gallery_entries)
        // }
        value = item
            ? [...item.product.media_gallery_entries, ...media_gallery_entries]
            : // ? mergedItem
              media_gallery_entries;
    }

    return value;
};

const getLowStockQty = (product, optionCodes, optionSelections) => {
    let value = [];

    const { only_x_left_in_stock, variants } = product;
    const isConfigurable = isProductConfigurable(product);

    // Selections are initialized to "code => undefined". Once we select a value, like color, the selections change. This filters out unselected options.
    const optionsSelected =
        Array.from(optionSelections.values()).filter(value => !!value).length >
        0;

    if (!isConfigurable || !optionsSelected) {
        value = only_x_left_in_stock;
    } else {
        // If any of the possible variants matches the selection add that
        // variant's image to the media gallery. NOTE: This _can_, and does,
        // include variants such as size. If Magento is configured to display
        // an image for a size attribute, it will render that image.
        const item = findMatchingVariant({
            optionCodes,
            optionSelections,
            variants
        });

        value = item ? item.product.only_x_left_in_stock : only_x_left_in_stock;
    }

    return value;
};

// We only want to display breadcrumbs for one category on a PDP even if a
// product has multiple related categories. This function filters and selects
// one category id for that purpose.
const getBreadcrumbCategoryId = categories => {
    // Exit if there are no categories for this product.
    if (!categories || !categories.length) {
        return;
    }
    const breadcrumbSet = new Set();
    categories.forEach(({ breadcrumbs }) => {
        // breadcrumbs can be `null`...
        (breadcrumbs || []).forEach(({ category_id }) =>
            breadcrumbSet.add(category_id)
        );
    });

    // Until we can get the single canonical breadcrumb path to a product we
    // will just return the first category id of the potential leaf categories.
    const leafCategory = categories.find(
        category => !breadcrumbSet.has(category.id)
    );

    // If we couldn't find a leaf category then just use the first category
    // in the list for this product.
    return leafCategory.id || categories[0].id;
};

const getConfigPrice = (product, optionCodes, optionSelections) => {
    let value;

    const { variants } = product;
    const isConfigurable = isProductConfigurable(product);

    const optionsSelected =
        Array.from(optionSelections.values()).filter(value => !!value).length >
        0;
    if (!isConfigurable || !optionsSelected) {
        value =
            product.__typename === 'OnsaleData'
                ? product.specialPrice
                : product.price_range;
    } else {
        const item = findMatchingVariant({
            optionCodes,
            optionSelections,
            variants
        });
        value = item ? item.product.price_range : product.price_range;
    }
    return value;
};

const SUPPORTED_PRODUCT_TYPES = [
    'SimpleProduct',
    'ConfigurableProduct',
    'BundleProduct',
    'LatestProductsData',
    'RelatedProductsData',
    'UpsellProductsData',
    'ConfigurableOptionData',
    'OnsaleData'
];

/**
 * @param {GraphQLQuery} props.addConfigurableProductToCartMutation - configurable product mutation
 * @param {GraphQLQuery} props.addSimpleProductToCartMutation - configurable product mutation
 * @param {Object} props.product - the product, see RootComponents/Product
 *
 * @returns {{
 *  breadcrumbCategoryId: string|undefined,
 *  errorMessage: string|undefined,
 *  handleAddToCart: func,
 *  handleSelectionChange: func,
 *  handleSetQuantity: func,
 *  isAddToCartDisabled: boolean,
 *  mediaGalleryEntries: array,
 *  productDetails: object,
 *  quantity: number
 * }}
 */
export const useProductFullDetail = props => {
    const {
        addConfigurableProductToCartMutation,
        addSimpleProductToCartMutation,
        addBundleProductToCartMutation,
        product,
        addSimpleCustomMutation,
        setCurrentDisplaySlider
        // productSliderRef
    } = props;

    const productType = product && product.__typename;
    const isSupportedProductType = SUPPORTED_PRODUCT_TYPES.includes(
        productType
    );

    // const [{ cartId }] = useCartContext();

    const [
        addConfigurableProductToCart,
        {
            error: errorAddingConfigurableProduct,
            loading: isAddConfigurableLoading,
            data: addConfigurableProductsToCartData
        }
    ] = useMutation(addConfigurableProductToCartMutation);

    const [
        addSimpleProductToCart,
        {
            error: errorAddingSimpleProduct,
            loading: isAddSimpleLoading,
            data: addSimpleProductsToCartData
        }
    ] = useMutation(addSimpleProductToCartMutation);

    const [
        addSimpleCustomProductToCart,
        {
            error: errorAddingSimpleCustomProduct,
            loading: isAddSimpleCustomLoading,
            data: addSimpleCustomProductsToCartData
        }
    ] = useMutation(addSimpleCustomMutation);

    const [
        addBundleProductToCart,
        {
            error: errorAddingBundleProduct,
            loading: isAddBundleLoading,
            data: addBundleProductsToCartData
        }
    ] = useMutation(addBundleProductToCartMutation);

    const [quantity, setQuantity] = useState(INITIAL_QUANTITY);
    const [productVariant, setProductVariant] = useState();

    const breadcrumbCategoryId = useMemo(
        () => getBreadcrumbCategoryId(product.categories),
        [product.categories]
    );

    const derivedOptionSelections = useMemo(
        () => deriveOptionSelectionsFromProduct(product),
        [product]
    );

    const [optionSelections, setOptionSelections] = useState(
        derivedOptionSelections
    );

    const derivedOptionCodes = useMemo(
        () => deriveOptionCodesFromProduct(product),
        [product]
    );
    const [optionCodes] = useState(derivedOptionCodes);

    const isMissingOptions = useMemo(
        () => getIsMissingOptions(product, optionSelections),
        [product, optionSelections]
    );
    const mediaGalleryEntries = useMemo(
        () => getMediaGalleryEntries(product, optionCodes, optionSelections),
        [product, optionCodes, optionSelections]
    );
    1;
    const only_x_left_in_stock = useMemo(
        () => getLowStockQty(product, optionCodes, optionSelections),
        [product, optionCodes, optionSelections]
    );

    const productVariantKeys = useMemo(() => {
        let returnKeys = {
            childKey: 'latestChild',
            childColorValueId: 'latestchildColorValueId',
            childSizeValueId: 'latestchildSizeValueId',
            childSku: 'latestchildSku'
        };
        if (productType === 'RelatedProductsData') {
            returnKeys = {
                childKey: 'relatedChild',
                childColorValueId: 'relatedchildColorValueId',
                childSizeValueId: 'relatedchildSizeValueId',
                childSku: 'relatedchildSku'
            };
        } else if (productType === 'UpsellProductsData') {
            returnKeys = {
                childKey: 'upsellChild',
                childColorValueId: 'upsellchildColorValueId',
                childSizeValueId: 'upsellchildSizeValueId',
                childSku: 'upsellchildSku'
            };
        } else if (productType === 'ConfigurableOptionData') {
            returnKeys = {
                childKey: 'configChild',
                childColorValueId: 'configColorValueId',
                childSizeValueId: 'configsizevalueId',
                childSku: 'configSku'
            };
        } else if (productType === 'OnsaleData') {
            returnKeys = {
                childKey: 'variants',
                childColorValueId: 'childColorValue',
                childSizeValueId: 'childsizevalue',
                childSku: 'childSku'
            };
        }
        return returnKeys;
    }, [productType]);

    const handleAddToCart = useCallback(
        async formValues => {
            const {
                quantity,
                customOptionId,
                customOptionString,
                customArrayVar,
                bundleOptionsVar,
                customSelections
            } = formValues;
            const payload = {
                item: product,
                productType,
                quantity: quantity ? quantity : 1
            };
            // setProductVariant(payload)
            const skuID =
                payload.item.type === 'configurable' &&
                payload.item[productVariantKeys.childKey] &&
                payload.item[productVariantKeys.childKey].find(e => {
                    const colorID =
                        e &&
                        e.configurable_options &&
                        e.configurable_options
                            .map(attId => attId)
                            .filter(item => item.Attribute_code === 'color')[0]
                            .attribute_options[0].value;
                    const sizeID =
                        e &&
                        e.configurable_options &&
                        e.configurable_options
                            .map(attId => attId)
                            .filter(item => item.Attribute_code !== 'color')[0]
                            .attribute_options[0].value;

                    return payload.item.__typename === 'OnsaleData' ||
                        payload.item.__typename === 'LatestProductsData' ||
                        payload.item.__typename === 'RelatedProductsData' ||
                        payload.item.__typename === 'UpsellProductsData' ||
                        payload.item.__typename === 'ConfigurableOptionData'
                        ? colorID.toString() ===
                              customSelections.colorFile.toString() &&
                              sizeID.toString() ===
                                  customSelections.selection.toString()
                        : e[productVariantKeys.childColorValueId] ===
                              customSelections.colorFile.toString() &&
                              e[productVariantKeys.childSizeValueId] ===
                                  customSelections.selection.toString();
                });

            if (isProductConfigurable(product)) {
                const nextOptionSelections = new Map([...optionSelections]);
                if (customSelections) {
                    nextOptionSelections.set(
                        customSelections.optionId,
                        customSelections.selection
                    );
                }
                appendOptionsToPayload(
                    payload,
                    nextOptionSelections || optionSelections,
                    optionCodes
                );
            }

            if (isSupportedProductType) {
                const variables = {
                    cartId: localStorage.getItem('cart_id'),
                    parentSku:
                        productType === 'LatestProductsData' ||
                        productType === 'RelatedProductsData' ||
                        productType === 'UpsellProductsData' ||
                        productType === 'ConfigurableOptionData' ||
                        productType === 'OnsaleData'
                            ? payload.item.sku
                            : payload.parentSku,
                    product: payload.item,
                    quantity: payload.quantity,
                    sku:
                        productType === 'LatestProductsData' ||
                        productType === 'RelatedProductsData' ||
                        productType === 'UpsellProductsData' ||
                        productType === 'ConfigurableOptionData' ||
                        productType === 'OnsaleData'
                            ? payload.item.type === 'simple'
                                ? payload.item.sku
                                : skuID[productVariantKeys.childSku]
                            : payload.item.sku,
                    customOptionId,
                    customOptionString,
                    customArrayVar,
                    bundleOptionsVar
                };

                window.dataLayer.push({
                    event: 'add_to_cart',
                    data: [
                        {
                            name: product?.name || '',
                            sku: product?.sku || '',
                            id: product?.id || '',
                            URL: window?.location?.pathname || '',
                            size: formValues?.customSelections?.sizeName || '',
                            size_value: formValues?.customSelections?.sizeValue || '',
                            color: formValues?.customSelections?.colorName || '',
                            color_value: formValues?.customSelections?.colorValue || '',
                            cart_id: localStorage.getItem('cart_id') || ''
                        }
                    ]
                });

                // Use the proper mutation for the type.
                if (
                    productType === 'SimpleProduct' &&
                    customOptionId &&
                    customOptionString
                ) {
                    try {
                        await addSimpleCustomProductToCart({
                            variables
                        });
                    } catch {
                        return;
                    }
                } else if (
                    productType === 'SimpleProduct' ||
                    (payload.item.type === 'simple' &&
                        productType === 'LatestProductsData') ||
                    (payload.item.type === 'simple' &&
                        productType === 'RelatedProductsData') ||
                    (payload.item.type === 'simple' &&
                        productType === 'UpsellProductsData') ||
                    (payload.item.type === 'simple' &&
                        productType === 'ConfigurableOptionData') ||
                    (payload.item.type === 'simple' &&
                        productType === 'OnsaleData')
                ) {
                    try {
                        await addSimpleProductToCart({
                            variables
                        });
                    } catch {
                        return;
                    }
                } else if (
                    productType === 'ConfigurableProduct' ||
                    productType === 'LatestProductsData' ||
                    productType === 'RelatedProductsData' ||
                    productType === 'UpsellProductsData' ||
                    productType === 'ConfigurableOptionData' ||
                    productType === 'OnsaleData'
                ) {
                    try {
                        await addConfigurableProductToCart({
                            variables
                        });
                    } catch {
                        return;
                    }
                } else if (productType === 'BundleProduct') {
                    try {
                        await addBundleProductToCart({
                            variables
                        });
                    } catch {
                        return;
                    }
                }
            } else {
                console.error('Unsupported product type. Cannot add to cart.');
            }
        },
        [
            product,
            productType,
            isSupportedProductType,
            optionSelections,
            optionCodes,
            localStorage.getItem('cart_id'),
            productVariantKeys,
            addSimpleCustomProductToCart,
            addSimpleProductToCart,
            addConfigurableProductToCart,
            addBundleProductToCart
        ]
    );

    const handleSelectionChange = (
        optionId,
        selection,
        initialConfigurableOptions
    ) => {
        // We must create a new Map here so that React knows that the value
        // of optionSelections has changed.
        const nextOptionSelections = new Map([...optionSelections]);
        if (optionId && selection) {
            nextOptionSelections.set(optionId, selection);
            if (setCurrentDisplaySlider) {
                setCurrentDisplaySlider(0);
            }
            // if (productSliderRef?.current) {
            //     productSliderRef?.current?.slickGoTo(0)
            // }
        } else if (
            !optionId &&
            !selection &&
            initialConfigurableOptions &&
            initialConfigurableOptions.length
        ) {
            initialConfigurableOptions.forEach(item => {
                nextOptionSelections.set(item.attributeId, item.attributeValue);
            });
        }
        setOptionSelections(nextOptionSelections);
    };

    const handleSetQuantity = useCallback(
        value => {
            setQuantity(value);
        },
        [setQuantity]
    );
    const productPrice = useMemo(
        () => getConfigPrice(product, optionCodes, optionSelections),
        [product, optionCodes, optionSelections]
    );
    // Normalization object for product details we need for rendering.
    const productDetails = {
        description: product.description,
        name: product.name,
        price: productPrice,
        sku: product.sku
    };

    const derivedErrorMessage = useMemo(
        () =>
            deriveErrorMessage([
                errorAddingSimpleProduct,
                errorAddingSimpleCustomProduct,
                errorAddingConfigurableProduct,
                errorAddingBundleProduct
            ]),
        [
            errorAddingConfigurableProduct,
            errorAddingSimpleCustomProduct,
            errorAddingSimpleProduct,
            errorAddingBundleProduct
        ]
    );

    useEffect(() => {
        if (
            product &&
            product.configurable_options &&
            product.configurable_options.length &&
            product.variants &&
            product.variants.length
        ) {
            const configurableOptions = product.configurable_options.map(
                item => ({
                    attribute_code: item.attribute_code,
                    attribute_id: item.attribute_id
                })
            );
            const filterOptions = [];
            optionSelections.forEach((value, key) => {
                if (value) {
                    const resultConfigurableOptions = configurableOptions.find(
                        item => item.attribute_id === key
                    );
                    if (
                        resultConfigurableOptions &&
                        resultConfigurableOptions.attribute_code
                    ) {
                        filterOptions.push({
                            attribute_id: key,
                            attribute_code:
                                resultConfigurableOptions.attribute_code,
                            value
                        });
                    }
                }
            });
            if (filterOptions.length === configurableOptions.length) {
                const selectedVariant = product.variants.find(item =>
                    filterOptions.every(itemDetail => {
                        if (item && item.attributes && item.attributes.length) {
                            const resultAttributeValue = item.attributes.find(
                                attributeDetail =>
                                    attributeDetail.code ===
                                    itemDetail.attribute_code
                            );
                            if (resultAttributeValue) {
                                return Boolean(
                                    resultAttributeValue.value_index ===
                                        itemDetail.value
                                );
                            }
                        }
                    })
                );
                if (
                    selectedVariant &&
                    selectedVariant.product &&
                    selectedVariant.product.id
                ) {
                    setProductVariant(selectedVariant);
                } else {
                    setProductVariant();
                }
            }
        }
    }, [optionSelections]);

    return {
        breadcrumbCategoryId,
        errorMessage: derivedErrorMessage,
        handleAddToCart,
        optionSelections,
        handleSelectionChange,
        handleSetQuantity,
        isAddToCartDisabled:
            !isSupportedProductType ||
            isMissingOptions ||
            isAddSimpleCustomLoading ||
            isAddConfigurableLoading ||
            isAddSimpleLoading ||
            isAddBundleLoading,
        mediaGalleryEntries,
        productDetails,
        quantity,
        productVariant,
        isAddingItem:
            isAddConfigurableLoading ||
            isAddSimpleLoading ||
            isAddBundleLoading ||
            isAddSimpleCustomLoading,
        only_x_left_in_stock,
        success:
            (addConfigurableProductsToCartData &&
                addConfigurableProductsToCartData.addConfigurableProductsToCart) ||
            (addSimpleProductsToCartData &&
                addSimpleProductsToCartData.addSimpleProductsToCart) ||
            (addSimpleCustomProductsToCartData &&
                addSimpleCustomProductsToCartData.addSimpleProductsToCart) ||
            (addBundleProductsToCartData &&
                addBundleProductsToCartData.addBundleProductsToCart)
    };
};
export const isCutomOptionPresent = product =>
    product && product.options && product.options.length > 0;

export const isBundleOptionPresent = product =>
    product && product.bundleItems && product.bundleItems.length > 0;

export const useProductReviews = props => {
    const { query } = props;
    const { error, data, loading, fetchMore } = useQuery(query, {
        variables: {
            product_id: props.product_id,
            current_page: props.current_page,
            limit: props.limit
        },
        fetchPolicy: 'network-only',
        skip: !props.product_id,
        notifyOnNetworkStatusChange: true
    });
    useEffect(() => {
        if (error) {
            console.log(error);
        }
    }, [error]);

    const loadMoreReviews = async params => {
        fetchMore({
            variables: {
                product_id: params.product_id,
                current_page: params.current_page,
                limit: params.limit
            },
            updateQuery: (pv, { fetchMoreResult }) => {
                if (!fetchMoreResult) {
                    return pv;
                }
                return {
                    productReviews: {
                        __typename: 'ProductReviews',
                        data: [
                            ...pv.productReviews.data,
                            ...fetchMoreResult.productReviews.data
                        ],
                        avgRating: fetchMoreResult.productReviews.avgRating,
                        totalRating: fetchMoreResult.productReviews.totalRating,
                        totalStarts: fetchMoreResult.productReviews.totalStarts,
                        current_page: params.current_page,
                        limit: params.limit,
                        ratingStarCount:
                            fetchMoreResult.productReviews.ratingStarCount,
                        total_count: fetchMoreResult.productReviews.total_count
                    }
                };
            }
        });
    };

    if (typeof data != 'undefined') {
        return {
            productReviews: data.productReviews,
            loadMoreReviews,
            loading
        };
    } else {
        return { productReviews: '', loadMoreReviews, loading };
    }
};

export const useProductRatings = props => {
    const { query } = props;
    const { error, data } = useQuery(query);
    useEffect(() => {
        if (error) {
            console.log(error);
        }
    }, [error]);

    if (typeof data != 'undefined') {
        return { productRatings: data.getProductRatings };
    } else {
        return { productRatings: '' };
    }
};

export const useSubmitProductReview = props => {
    const { query } = props;
    const [reviewResponseData, setReviewResponseData] = useState({});
    const [showReviewLoader, setShowReviewLoader] = useState(false);
    const [submit] = useMutation(query);
    const submitReview = async details => {
        setShowReviewLoader(true);
        const response = await submit({
            variables: details
        });
        setReviewResponseData(response.data.submitProductReview);
        setShowReviewLoader(false);
    };
    return {
        submitReview,
        reviewResponseData,
        showReviewLoader
    };
};

export const useAddItemToWishlist = props => {
    const { query, customerQuery } = props;
    const apolloClient = useApolloClient();

    const [addItem, { data: wishlistResponse }] = useMutation(query);
    const [adding, setAdding] = useState(false);
    const [, { getUserDetails }] = useUserContext();
    const fetchUserDetails = useAwaitQuery(customerQuery);
    const addItemToWishlist = useCallback(
        async ({ product_id }) => {
            try {
                setAdding(true);
                await addItem({ variables: { product_id } });
                setAdding(false);
                await clearCustomerDataFromCache(apolloClient);
                getUserDetails({ fetchUserDetails });
            } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    console.error(error);
                    setAdding(false);
                }
            }
        },
        [addItem, apolloClient, fetchUserDetails, getUserDetails]
    );
    return {
        addItemToWishlist,
        wishlistResponse,
        addingToWishlist: adding
    };
};

export const useLinkedProduct = props => {
    const { query, sku } = props;
    const { error, data } = useQuery(query, {
        variables: {
            sku
        },
        fetchPolicy: 'network-only'
    });
    useEffect(() => {
        if (error) {
            console.log(error);
        }
    }, [error]);

    return {
        relatedProducts:
            data && data.linkedProducts && data.linkedProducts.related_product,
        upsell_products:
            data && data.linkedProducts && data.linkedProducts.upsell_products,
        crossell_products:
            data && data.linkedProducts && data.linkedProducts.crossell_products
    };
};

export const useProductMoreInfo = props => {
    const { query, sku } = props;
    const { error, data } = useQuery(query, {
        variables: {
            sku
        },
        fetchPolicy: 'network-only'
    });
    useEffect(() => {
        if (error) {
            console.log(error);
        }
    }, [error]);

    if (typeof data != 'undefined') {
        return {
            productMoreInfo: data.moreInfoProducts && data.moreInfoProducts.data
        };
    } else {
        return { productMoreInfo: '' };
    }
};

export const useCategoryAddToCart = props => {
    const {
        addSimpleProductToCartMutation,
        createCartMutation,
        getCartDetailsQuery,
        setShowAlertMsg
    } = props;

    const [{ isAddingItem }, { addItemToCart }] = useCartContext();

    const [
        addSimpleProductToCart,
        { error: errorAddingSimpleProduct, data: addSimpleProductsToCartData }
    ] = useMutation(addSimpleProductToCartMutation);

    const [fetchCartId] = useMutation(createCartMutation);

    const fetchCartDetails = useAwaitQuery(getCartDetailsQuery);

    const [quantity] = useState(INITIAL_QUANTITY);

    const handleAddToCart = useCallback(
        async product => {
            const productType = product.__typename;
            const payload = {
                item: product,
                productType,
                quantity
            };

            let addItemMutation;
            // Use the proper mutation for the type.
            if (
                productType === 'SimpleProduct' ||
                productType === 'VirtualProduct'
            ) {
                addItemMutation = addSimpleProductToCart;
            } else if (product.type === 'simple') {
                addItemMutation = addSimpleProductToCart;
            }

            await addItemToCart({
                ...payload,
                addItemMutation,
                fetchCartDetails,
                fetchCartId
            });
            setShowAlertMsg(true);

            // toggleDrawer("cart");
        },
        [
            addItemToCart,
            addSimpleProductToCart,
            fetchCartDetails,
            fetchCartId,
            quantity,
            setShowAlertMsg
        ]
    );
    const SuccessMessage =
        addSimpleProductsToCartData &&
        addSimpleProductsToCartData.addSimpleProductsToCart;
    const derivedErrorMessage = useMemo(() => {
        return deriveErrorMessage([errorAddingSimpleProduct]) || '';
    }, [errorAddingSimpleProduct]);
    return {
        handleAddToCart,
        isAddingItem,
        errorMessage: derivedErrorMessage,
        success: SuccessMessage
    };
};
export const useCrossSellProduct = props => {
    const { query, cartItems } = props;
    const skus = [];
    if (cartItems) {
        cartItems.forEach(function(value) {
            skus.push(value.product.sku);
        });
    }
    const { error, data, loading } = useQuery(query, {
        variables: {
            skus,
            pageSize: 10
        },
        fetchPolicy: 'network-only',
        skip: skus.length ? false : true
    });
    useEffect(() => {
        if (error) {
            console.log(error);
        }
    }, [error]);
    return {
        crossSellData: data && data.products && data.products.items,
        loading
    };
};
