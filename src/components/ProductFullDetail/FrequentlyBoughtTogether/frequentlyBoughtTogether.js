import React, { useState, useEffect } from 'react';
// import { useIntl, FormattedMessage } from 'react-intl';
import Button from '@magento/venia-ui/lib/components/Button';
import { Link, resourceUrl } from 'src/drivers';
import Icon from '@magento/venia-ui/lib/components/Icon';
import { Plus as PlusIcon } from 'react-feather';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './frequentlyBoughtTogether.css';
import homeCss from '../../CedHome/home.css';
import btnCss from '../../Button/button.css';
import { /* Items, */ Price } from '@magento/peregrine';
import Checkbox from '../../Checkbox';
// import { useCartContext } from '@magento/peregrine/lib/context/cart';
import { useMutation } from '@apollo/client';
import addProductsToCart from '../../../queries/frequentlyBoughtTogether/addAllToCart.graphql';
import LoadingIndicator from '../../LoadingIndicator';
const Options = React.lazy(() => import('../../ProductOptions'));

// export const url = `${process.env.MAGENTO_BACKEND_URL}/media/catalog/product/cache/5b38d6933e0e4ff8050c4fa86d90dac9`
export const url = `${process.env.MAGENTO_BACKEND_URL}/pub/media/catalog/product/cache/5b38d6933e0e4ff8050c4fa86d90dac9`

const FrequentlyBoughtTogether = props => {
    const { productId, frequentlyBoughtTogetherProducts } = props;

    const classes = mergeClasses(
        defaultClasses,
        homeCss,
        btnCss,
        props.classes
    );
    // const { formatMessage } = useIntl();
    // const [{ cartId }] = useCartContext();

    const [stateProducts, setStateProducts] = useState([]);

    const [addAllToCart, { loading: addAllToCartLoading }] = useMutation(
        addProductsToCart
    );

    let priceCurrency = 'INR';
    const totalPrice = stateProducts.reduce((acc, item) => {
        if (item.productCurrency) {
            priceCurrency = item.productCurrency;
        }
        if (item.productPrice && item.isChecked) {
            return acc + item.productPrice;
        }
        return acc;
    }, 0);


    const handleClick = (updateFieldName, value, index) => {
        setStateProducts(
            stateProducts.map((item, itemIndex) => {
                if (itemIndex === index) {
                    item[updateFieldName] = value;
                    if (!value && item.__typename === 'ConfigurableProduct') {
                        item.errors = item.errors.map((i) => {
                            return { ...i, message: "" }
                        })
                        // )
                    }
                    else if (value && item.__typename === 'ConfigurableProduct') {

                        item.errors = item.errors.map((i) => {
                            return { ...i, message: item.selectConfigurableOptions.get(i.attributeId) !== null ? "" : "This is a required field." }
                        })
                    }
                }
                return item;
            })
        );
    };
    const handleOptionsChange = (optionId, selection, index) => {
        setStateProducts(
            stateProducts.map((item, itemIndex) => {
                const updatedSelectConfigurableOptions = new Map();
                if (itemIndex === index && item.selectConfigurableOptions) {
                    item.selectConfigurableOptions.forEach(
                        (elementValue, elementKey) => {
                            if (elementKey === optionId) {
                                const objIndex = item.errors.findIndex((obj => obj.attributeId === optionId));
                                //Update object's error property.
                                if (item?.errors[objIndex]?.message) item.errors[objIndex].message = ""
                                updatedSelectConfigurableOptions.set(
                                    elementKey,
                                    selection
                                );
                            } else {
                                updatedSelectConfigurableOptions.set(
                                    elementKey,
                                    elementValue
                                );
                            }
                        }
                    );
                    item.selectConfigurableOptions.set(optionId, selection);
                }

                let updateIsOutOfStock = false;
                let resultVariantImage = '';
                if (
                    updatedSelectConfigurableOptions &&
                    updatedSelectConfigurableOptions.size
                ) {
                    const selectedOption = [];
                    updatedSelectConfigurableOptions.forEach(
                        (elementValue, elementKey) => {
                            let attributeCode = '';
                            const resultConfigurableOptions = item.configurable_options.find(
                                itemDetail =>
                                    itemDetail.attribute_id === elementKey
                            );
                            if (
                                resultConfigurableOptions &&
                                resultConfigurableOptions.attribute_code
                            ) {
                                attributeCode =
                                    resultConfigurableOptions.attribute_code;
                            }

                            selectedOption.push({
                                attributeId: elementKey,
                                attributeCode,
                                value: elementValue
                            });
                        }
                    );
                    if (
                        item.variants &&
                        item.variants.length &&
                        selectedOption.length
                    ) {
                        const resultVariant = item.variants.find(element =>
                            element.attributes.every(ele =>
                                selectedOption.some(
                                    s =>
                                        s.attributeCode === ele.code &&
                                        s.value === ele.value_index
                                )
                            )
                        );

                        if (resultVariant?.product?.media_gallery_entries[0]?.file) {
                            resultVariantImage = resultVariant?.product?.media_gallery_entries[0]?.file
                        }
                        if (
                            resultVariant &&
                            resultVariant.product &&
                            resultVariant.product.stock_status &&
                            resultVariant.product.stock_status ===
                            'OUT_OF_STOCK'
                        ) {
                            updateIsOutOfStock = true;
                        }
                    }
                }

                return {
                    ...item,
                    selectConfigurableOptionsImage: resultVariantImage,
                    selectConfigurableOptions: updatedSelectConfigurableOptions.length
                        ? updatedSelectConfigurableOptions
                        : item.selectConfigurableOptions,
                    isOutOfStock: updateIsOutOfStock,
                    isChecked: updateIsOutOfStock
                        ? false
                        : itemIndex === index
                            ? true
                            : item.isChecked
                };
            })
        );
    };

    const handleAddAllToCart = async () => {
        try {
            let isError = false;
            const resultErrors = [];
            stateProducts.forEach((item, index) => {
                if (!item.isChecked) {
                    return;
                } else {
                    const notSelectedError = [];
                    if (item.__typename === 'ConfigurableProduct') {
                        item.selectConfigurableOptions.forEach(
                            (elementValue, elementKey) => {
                                if (elementValue === null) {
                                    isError = true;
                                    notSelectedError.push({
                                        attributeId: elementKey,
                                        message: 'This is a required field.'
                                    });
                                }
                            }
                        );
                    }
                    if (notSelectedError.length) {
                        resultErrors.push({
                            index,
                            errors: notSelectedError
                        });
                    }
                }
            });
            const checkedProduct = stateProducts.filter(item => item.isChecked);
            if (isError) {
                setStateProducts(
                    stateProducts.map((item, index) => {
                        const errors = resultErrors.find(
                            itemDetail => itemDetail.index === index
                        );
                        if (errors && errors.errors) {
                            return {
                                ...item,
                                errors: errors.errors,
                                isShowDetail: true
                            };
                        }
                        return item;
                    })
                );
                return;
            }
            else {
                const cartItems = checkedProduct.map(item => {
                    if (item.__typename === 'ConfigurableProduct') {
                        let variantSku = '';
                        const selectedOption = [];
                        item.selectConfigurableOptions.forEach(
                            (elementValue, elementKey) => {
                                let attributeCode = '';
                                const resultConfigurableOptions = item.configurable_options.find(
                                    itemDetail =>
                                        itemDetail.attribute_id === elementKey
                                );
                                if (
                                    resultConfigurableOptions &&
                                    resultConfigurableOptions.attribute_code
                                ) {
                                    attributeCode =
                                        resultConfigurableOptions.attribute_code;
                                }

                                selectedOption.push({
                                    attributeId: elementKey,
                                    attributeCode,
                                    value: elementValue
                                });
                            }
                        );
                        if (
                            item.variants &&
                            item.variants.length &&
                            selectedOption.length
                        ) {
                            const resultVariant = item.variants.find(element =>
                                element.attributes.every(ele =>
                                    selectedOption.some(
                                        s =>
                                            s.attributeCode === ele.code &&
                                            s.value === ele.value_index
                                    )
                                )
                            );
                            if (
                                resultVariant &&
                                resultVariant.product &&
                                resultVariant.product.sku
                            ) {
                                variantSku = resultVariant.product.sku;
                            }
                        }

                        return {
                            quantity: 1,
                            parent_sku: item.sku,
                            sku: variantSku
                        };
                    } else {
                        return {
                            quantity: 1,
                            sku: item.sku
                        };
                    }
                });

                await addAllToCart({
                    variables: {
                        cartId: localStorage.getItem('cart_id'),
                        cartItems
                    }
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const result = frequentlyBoughtTogetherProducts.map(item => {
            const productPrice =
                    item?.price_range?.maximum_price?.regular_price?.value
                    ? item?.price_range?.maximum_price?.regular_price?.value
                    : item?.price?.regularPrice?.amount?.value
                        ? item?.price?.regularPrice?.amount?.value
                        : 0;

            const productCurrency =
                item &&
                    item.price_range &&
                    item.price_range.maximum_price &&
                    item.price_range.maximum_price.regular_price &&
                    item.price_range.maximum_price.regular_price.currency
                    ? item.price_range.maximum_price.regular_price.currency
                    : item &&
                        item.price &&
                        item.price.regularPrice &&
                        item.price.regularPrice &&
                        item.price.regularPrice.amount &&
                        item.price.regularPrice.amount.currency
                        ? item.price.regularPrice.amount.currency
                        : 0;

            const imageURL =
                item && item.thumbnail && item.thumbnail.url
                    ? item.thumbnail.url
                    : item && item.small_image
                        ? item.small_image
                        : '';

            const selectConfigurableOptions = new Map();
            if (
                item &&
                item.configurable_options &&
                item.configurable_options.length
            ) {
                item.configurable_options.forEach(element => {
                    if (element && element.attribute_id) {
                        selectConfigurableOptions.set(
                            element.attribute_id,
                            null
                        );
                    }
                });
            }

            return {
                ...item,
                isChecked: true,
                productId: item?.id,
                productName: item?.name,
                productPrice,
                productCurrency,
                imageURL,
                urlKey: item?.url_key,
                urlSuffix: item?.url_suffix,
                productType: item?.__typename,
                isShowDetail: true,
                selectConfigurableOptions,
                errors: [],
                isOutOfStock: false
            };
        });
        setStateProducts(result);
    }, [frequentlyBoughtTogetherProducts]);

    return (
        <div>
            {addAllToCartLoading ? <LoadingIndicator /> : <></>}
            <div className="mt-0 mb-0 mt-md-4 mb-md-3">
                <div className={classes.image_total_button_wrapper}>
                    <div className={classes.image_section_wrapper}>
                        {stateProducts.map((item, index) => {
                            return (
                                <div
                                    className={
                                        classes.image_block_wrapper +
                                        ' ' +
                                        classes.test_class
                                    }
                                >
                                    <div>
                                        {index > 0 ? (
                                            <Icon src={PlusIcon} size={25} />
                                        ) : (
                                            <></>
                                        )}
                                    </div>
                                    {item && <div>
                                        <Link
                                            to={resourceUrl(
                                                item?.urlKey + item?.urlSuffix
                                            )}
                                        >
                                            <img
                                                src={item?.imageURL || ''}
                                                alt={item.productName}
                                                width={100}
                                                height={125}
                                            />
                                        </Link>
                                    </div>}
                                </div>
                            );
                        })}
                    </div>
                    <div className={classes.frq_action}>
                        <div>
                            <span>{`Total price: `}</span>
                            <span>
                                <Price
                                    value={totalPrice}
                                    currencyCode={priceCurrency}
                                />
                            </span>
                        </div>
                        <div className={classes.freq_add_all_to_cart}>
                            <Button
                                onClick={handleAddAllToCart}
                                priority="high"
                                type="button"
                                disabled={
                                    stateProducts.filter(
                                        i => i.isChecked === true
                                    ).length === 0
                                }
                            >
                                {stateProducts.filter(i => i.isChecked === true)
                                    .length === stateProducts.length
                                    ? 'ADD ALL ITEMS TO CART'
                                    : stateProducts.filter(
                                        i => i.isChecked === true
                                    ).length > 1
                                        ? `ADD  ${stateProducts.filter(
                                            i => i.isChecked === true
                                        ).length
                                        } ITEMS TO CART`
                                        : 'ADD TO CART'}
                                {/* <FormattedMessage
                                id={'productFullDetail.addAllToCart'}
                                defaultMessage={'Add all to Cart'}
                            /> */}
                            </Button>
                        </div>
                        {/* <div>
                        <Button onClick={() => {}}>
                            <FormattedMessage
                                id={'productFullDetail.addAllToWishlist'}
                                defaultMessage={'Add all to Wishlist'}
                            />
                        </Button>
                    </div> */}
                    </div>
                </div>
            </div>
            <div className={classes.frq_checkbox}>
                {stateProducts.map((item, index) => {
                    return (
                        <div>
                            <div style={{ display: 'flex' }}>
                                <div>
                                    <Checkbox
                                        id={`checkbox_${index}`}
                                        onClick={event =>
                                            handleClick(
                                                'isChecked',
                                                event.target.checked,
                                                index
                                            )
                                        }
                                        field={`checkbox_${index}`}
                                        fieldState={{
                                            value: item.isChecked
                                        }}
                                        disabled={item.isOutOfStock}
                                    />
                                </div>
                                <div className={classes.frq_data}>
                                    {item.productId === productId ? (
                                        <div>
                                            <span
                                                style={{ fontWeight: 'bold' }}
                                            >{`This item: `}</span>
                                            <span>{item.productName}</span>
                                        </div>
                                    ) : (
                                        <>
                                        {item && <div>
                                            <Link
                                                className={classes.frq_link}
                                                to={resourceUrl(
                                                    item?.urlKey + item?.urlSuffix
                                                )}
                                            >
                                                {item.productName}
                                            </Link>
                                        </div>}
                                        </>
                                    )}
                                    <div style={{ marginLeft: 8 }}>
                                        {item && item.productPrice ? (
                                            <Price
                                                value={item.productPrice}
                                                currencyCode={
                                                    item.productCurrency
                                                }
                                            />
                                        ) : (
                                            <></>
                                        )}
                                    </div>
                                    {item.isOutOfStock ? (
                                        <div className={classes.outof_stock_text}>Out of stock</div>
                                    ) : (
                                        <></>
                                    )}
                                    {item &&
                                        item.productType ===
                                        'ConfigurableProduct' ? (
                                        // eslint-disable-next-line jsx-a11y/anchor-is-valid
                                        <a
                                            href="javascript:void(0)"
                                            className={classes.frq_link}
                                            onClick={() => {
                                                handleClick(
                                                    'isShowDetail',
                                                    !item.isShowDetail,
                                                    index
                                                );
                                            }}
                                        >
                                            {item.isShowDetail
                                                ? 'Hide details'
                                                : 'Show details'}
                                        </a>
                                    ) : (
                                        <></>
                                    )}
                                </div>
                            </div>
                            {item &&
                                item.productType === 'ConfigurableProduct' &&
                                item.isShowDetail ?
                                <>

                                    <div className={classes._frq_togle_sec}>
                                        {/* {item &&
                                            item.productType === 'ConfigurableProduct' &&
                                            item.isShowDetail ? ( */}
                                       {item && <div className={classes._frq_togle_sec_img}>
                                            <Link
                                                to={resourceUrl(
                                                    item?.urlKey + item?.urlSuffix
                                                )}
                                            >
                                                <img
                                                    src={item?.imageURL || ''}
                                                    alt={item.productName}
                                                    width={100}
                                                    height={125}
                                                />
                                            </Link>
                                        </div>}
                                        <div className={classes._frq_togle_sec_details}>
                                            <Options
                                                onSelectionChange={(
                                                    optionId,
                                                    selection
                                                ) =>
                                                    handleOptionsChange(
                                                        optionId,
                                                        selection,
                                                        index
                                                    )
                                                }
                                                options={item.configurable_options}
                                                selectedValues={
                                                    item.selectConfigurableOptions
                                                }
                                                product={item}
                                                errors={item.errors}
                                                setStateProducts={setStateProducts}
                                                stateProducts={stateProducts}
                                            />
                                        </div>
                                        {/* ) : (
                                            <></>
                                        )} */}
                                    </div>
                                </> : <></>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FrequentlyBoughtTogether;
