import React, {
    Suspense,
    useEffect,
    useRef,
    useState,
    useContext
} from 'react';
import { arrayOf, bool, number, shape, string } from 'prop-types';
import { Form } from 'informed';
import { isProductConfigurable } from '@magento/peregrine/lib/util/isProductConfigurable';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import Breadcrumbs from '../Breadcrumbs/breadcrumbs';
import Button from '@magento/venia-ui/lib/components/Button';
import FormError from '@magento/venia-ui/lib/components/FormError';
import { fullPageLoadingIndicator } from '../LoadingIndicator';
import RichText from '@magento/venia-ui/lib/components/RichText';
import { Modal } from '../Modal';
import { useCedContext } from 'src/peregrine/lib/context/ced';
import CustomSlider from '../Slider';
import {
    ADD_CONFIGURABLE_MUTATION,
    ADD_SIMPLE_MUTATION,
    ADD_SIMPLE_CUSTOM_MUTATION,
    ADD_BUNDLE_MUTATION
} from './productFullDetail.gql';
import PhotoSwipeLightbox from 'photoswipe/dist/photoswipe-lightbox.esm.js';
import 'photoswipe/dist/photoswipe.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faStar,
    faHeart,
    faCubes,
    faSearch
} from '@fortawesome/free-solid-svg-icons';
import {
    useAddItemToWishlist,
    useProductMoreInfo,
    isCutomOptionPresent,
    isBundleOptionPresent,
    useProductFullDetail
} from '../../peregrine/lib/talons/ProductFullDetail/useProductFullDetail';
import moreInfoProductsGraphql from '../../queries/getMoreInfoProducts.graphql';
import GET_CUSTOMER_QUERY from '../../queries/getCustomer.graphql';
import pincodeAvailability from '../../queries/pincodeChecker/pincodeAvailability.graphql'
import Icon from '../Icon';
import {
    ChevronDown as ChevronDownIcon,
    Copy as CopyIcon
} from 'react-feather';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { useToasts } from '@magento/peregrine';
import cedClasses from './productFullDetail.css';
import {
    useWishlist,
    useDeleteFromWishlist
} from '../../peregrine/lib/talons/MyAccount/useDashboard';
import ADD_TO_WISHLIST_MUTATION from '../../queries/addItemToWishlist.graphql';
import REMOVE_FROM_WISHLIST_MUTATION from '../../queries/removeFromWishlist.graphql';
import WishListQuery from '../../queries/getWishlist.graphql';
import { QuantityFields } from '../CartPage/ProductListing/quantity';
import { FormattedMessage, useIntl } from 'react-intl';
import PriceRange from '../PriceRange';
import StockAlert from '../StockAlert';
import stockAlerts from '../../queries/stockAlert.graphql';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import stockAlertGuestUser from '../../queries/stockAlertGuestUser.graphql';
import stockAlertCustmer from '../../queries/stockAlertCustmer.graphql';
import secure_base_media_url from '../../queries/baseMediaUrl.graphql'
import {
    guestWishlistAddToLocalStorage,
    guestWishlistRemoveFromLocalStorage,
    guestWishlistGetFromLocalStorage,
    handleCartNotification
} from '../../util/helperFunction';
import { globalContext } from '../../peregrine/lib/context/global.js';
import getFrequentlyBoughtTogetherProduct from '../../queries/frequentlyBoughtTogether/getFrequentlyBoughtTogetherProduct.graphql';
import FrequentlyBoughtTogether from './FrequentlyBoughtTogether';
import PinCodeChecker from './PinCodeChecker/pinCodeChecker';
import { postalCodeMaxLength } from '../../util/formValidators';
import { useLocation } from 'react-router-dom';

const chevrondownIcon = <Icon src={ChevronDownIcon} size={18} />;
const LinkedProducts = React.lazy(() => import('./linkedProducts'));
const Options = React.lazy(() => import('../ProductOptions'));
const CustomOptions = React.lazy(() => import('../ProductCustomOptions'));
const ProductReviews = React.lazy(() => import('./productReviews'));
const BundleOptions = React.lazy(() => import('../ProductBundleOptions'));
const ProductSharingIcons = React.lazy(() => import('./productSharingIcons'));

function areSameArrays(arr1, arr2) {
    if (!Array.isArray(arr1) && !Array.isArray(arr2)) return false;
    return JSON.stringify(arr1) === JSON.stringify(arr2);
}

const ProductFullDetail = props => {
    const { product } = props;
    const productSliderRef = useRef('0')
    const { state } = useLocation()
    const { dispatch } = useContext(globalContext);
    // const [scrollFlag, setScrollFlag] = useState(false);
    // const [pincodeErrorMessage, setPincodeErrorMessage] = useState('')
    const [alertBoxClose, setAlertBoxClose] = useState(false);
    const [emailAlert, setEmailAlert] = useState();
    const [stockNotification, setStockNotification] = useState({
        stockAlertGuestUsers: '',
        stockAlertCustmers: '',
        stockErrorMsg: ''
    });
    const [currentDisplaySlider, setCurrentDisplaySlider] = useState(0);
    const [addedToWishlist, setAddedToWishlist] = useState(false);
    const [
        frequentlyBoughtTogetherProducts,
        setFrequentlyBoughtTogetherProducts
    ] = useState([]);

    const { data: frequentlyBoughtTogetherProductData } = useQuery(
        getFrequentlyBoughtTogetherProduct,
        {
            variables: { sku: product.sku },
            fetchPolicy: 'network-only',
            skip: product.sku ? false : true
        }
    );

    const { data: baseMediaUrl } = useQuery(secure_base_media_url)

    const isMobileView = window && window.innerWidth < 786 ? true : false;

    const { data: stockData } = useQuery(stockAlerts);
    const [MpProductAlertNotifyInStock] = useMutation(stockAlertGuestUser, {
        onCompleted(stockAlertGuestUsers) {
            setStockNotification({
                ...stockNotification,
                stockAlertGuestUsers: stockAlertGuestUsers
            });
        }
    });
    const [MpProductAlertCustomerNotifyInStock] = useMutation(
        stockAlertCustmer,
        {
            onCompleted(stockAlertCustmers) {
                setStockNotification({
                    ...stockNotification,
                    stockAlertCustmers: stockAlertCustmers
                });
            }
        }
    );

    // const handleClick = () => {
    //     if (!scrollFlag) setScrollFlag(true);
    // };

    // useEffect(() => {
    //     document.addEventListener('scroll', handleClick);
    //     return () => {
    //         document.removeEventListener('scroll', handleClick);
    //     };
    // });
    let targetRef = useRef(' ');

    const [, { addToast }] = useToasts();
    const [{ isSignedIn }] = useUserContext();
    const talonProps = useProductFullDetail({
        addConfigurableProductToCartMutation: ADD_CONFIGURABLE_MUTATION,
        addSimpleProductToCartMutation: ADD_SIMPLE_MUTATION,
        addSimpleCustomMutation: ADD_SIMPLE_CUSTOM_MUTATION,
        addBundleProductToCartMutation: ADD_BUNDLE_MUTATION,
        setCurrentDisplaySlider,
        productSliderRef,
        product
    });

    const { formatMessage } = useIntl();

    const { productMoreInfo } = useProductMoreInfo({
        query: moreInfoProductsGraphql,
        sku: product.sku
    });

    const wishlistProps = useWishlist({
        query: WishListQuery
    });

    const { data, refetch } = wishlistProps;

    const addItemToWishlistTalonProps = useAddItemToWishlist({
        customerQuery: GET_CUSTOMER_QUERY,
        query: ADD_TO_WISHLIST_MUTATION
    });
    const { addItemToWishlist, wishlistResponse } = addItemToWishlistTalonProps;

    const [removeWishlistMsg, setRemoveWishlistMsg] = useState(false);
    const [addedWishlistMsg, setAddedWishlistMsg] = useState(false);
    const [customOptionId, setCustomOptionId] = useState(' ');
    const [customOptionString, setCustomOptionString] = useState(' ');
    const [customPrice, setCustomPriceCheckbox] = useState(0);
    const [customPriceRadio, setCustomPriceRadio] = useState(0);
    const [customPriceMultiple, setCustomPriceMultiple] = useState(0);
    const [customPriceDropdown, setCustomPriceDropdown] = useState(0);
    const [customPricePercentRadio, setCustomPricePercentRadio] = useState(0);
    const [customPercDropDown, setCustomPercDropDown] = useState(0);
    const [customPercCheckbox, setCustomPercCheckbox] = useState(0);
    const [customField, setCustomField] = useState(0);
    const [customOptionArray, setCustomOptionArray] = useState([]);
    const [customArea, setCustomArea] = useState(0);
    const [showBundleOptions, setShowBundleOptions] = useState(false);
    const [pincode, setPincode] = useState()
    const [pincodeData, setPincodeData] = useState()
    const [require, setRequire] = useState(false)
    const [
        guestUserAddedWishlistProduct,
        setGuestUserAddedWishlistProduct
    ] = useState();
    const [
        guestUserRemovedWishlistProduct,
        setGuestUserRemovedWishlistProduct
    ] = useState();

    const optionSelectionRef = useRef([]);

    const sizeChartContent =
        product && product.mp_sizeChart && product.mp_sizeChart.rule_content;

    const customArrayVar = [];
    customOptionArray &&
        customOptionArray.map(ele => {
            customArrayVar.push(Object.values(ele)[0]);
        });

    const {
        breadcrumbCategoryId,
        errorMessage,
        handleAddToCart,
        handleSelectionChange,
        isAddToCartDisabled,
        mediaGalleryEntries,
        productDetails,
        isAddingItem,
        only_x_left_in_stock,
        success,
        productVariant,
        optionSelections
    } = talonProps;

    const [pincodeAvailabityCode] = useLazyQuery(pincodeAvailability, {
        fetchPolicy: 'no-cache',
        onCompleted: (data) => {
            setPincodeData(data)
        }
    })

    const classes = mergeClasses(cedClasses, props.classes);

    const [, { setOverlay }] = useCedContext();

    const stockAlertData =
        stockData &&
        stockData.MpProductAlertsConfigs &&
        stockData.MpProductAlertsConfigs.stock_alert;
    const productSku =
        productVariant && productVariant.product && productVariant.product.sku;

    function handleOptionsChange(optionId, selection) {
        handleSelectionChange(optionId, selection);
        setStockNotification({
            ...stockNotification,
            stockAlertGuestUsers: '',
            stockAlertCustmers: '',
            stockErrorMsg: ''
        });
        setAlertBoxClose(false);
    }

    const copyCurrentURL = () => {
        const el = document.createElement('input');
        el.value = window.location.href;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);

        addToast({
            type: 'info',
            message: 'URL Copied!',
            dismissable: true,
            timeout: 5000
        });
    };
    const options = isProductConfigurable(product) ? (
        <Suspense fallback={fullPageLoadingIndicator}>
            <Options
                onSelectionChange={handleOptionsChange}
                options={product.configurable_options}
                selectedValues={optionSelections}
                product={product}
                sizeChartContent={sizeChartContent}
            />
        </Suspense>
    ) : null;

    const bundleOptions = isBundleOptionPresent(product) ? (
        <Suspense fallback={fullPageLoadingIndicator}>
            <BundleOptions
                options={product.bundleItems}
                product={product}
                handleAddToCart={handleAddToCart}
                isAddingItem={isAddingItem}
                isAddToCartDisabled={isAddToCartDisabled}
                showBundleOptions={showBundleOptions}
                setShowBundleOptions={setShowBundleOptions}
                handleSetOverlay={setOverlay}
            />
        </Suspense>
    ) : null;

    const customOptions = isCutomOptionPresent(product) ? (
        <Suspense>
            <CustomOptions
                setCustomOptionArray={setCustomOptionArray}
                customOptionArray={customOptionArray}
                classes={classes}
                customPrice={customPrice}
                customOptionId={customOptionId}
                customOptionString={customOptionString}
                options={product.options}
                setCustomOptionId={setCustomOptionId}
                setCustomOptionString={setCustomOptionString}
                setCustomPriceCheckbox={setCustomPriceCheckbox}
                setCustomPriceRadio={setCustomPriceRadio}
                setCustomPriceMultiple={setCustomPriceMultiple}
                setCustomPriceDropdown={setCustomPriceDropdown}
                setCustomPricePercentRadio={setCustomPricePercentRadio}
                setCustomPercDropDown={setCustomPercDropDown}
                setCustomPercCheckbox={setCustomPercCheckbox}
                customPercCheckbox={customPercCheckbox}
                setCustomField={setCustomField}
                setCustomArea={setCustomArea}
            />
        </Suspense>
    ) : null;

    const breadcrumbs = breadcrumbCategoryId ? (
        <Breadcrumbs
            categoryId={state && state.categoryId ? state.categoryId : breadcrumbCategoryId}
            currentProduct={productDetails.name}
        />
    ) : null;
    // Fill a map with field/section -> error.
    const errors = new Map();
    var stockAlert = '';

    const addtowishlist = async product => {
        await addItemToWishlist({
            product_id: product.id
        });
        setAddedWishlistMsg(true);
    };
    const deleteData = useDeleteFromWishlist({
        query: REMOVE_FROM_WISHLIST_MUTATION,
        customerQuery: GET_CUSTOMER_QUERY
    });
    const { handleRemoveItem, removeResponse } = deleteData;
    const removeFromWishlist = async product => {
        await handleRemoveItem({
            product_id: product.id
        });
        setRemoveWishlistMsg(true);
        setAddedToWishlist(false)
    };

    const productId = productVariant &&
        productVariant.product &&
        productVariant.product.id

    const handleCheckPincode = () => {
        if (!pincode) {
            addToast({
                type: 'error',
                message: 'Pincode is required',
                dismissable: true,
                timeout: 5000
            });
        }
        if (pincode && !pincode.startsWith("0") && pincode.length === postalCodeMaxLength)
            pincodeAvailabityCode({
                variables: {
                    pincode: pincode,
                    // product_id: +productId
                }
            })
        setRequire(true)
    }

    useEffect(() => {
        if (optionSelections) {
            optionSelectionRef.current = new Map(optionSelections);
        }
    }, [optionSelections]);

    useEffect(() => {
        if (
            removeResponse &&
            removeResponse.removeFromWishlist &&
            removeResponse.removeFromWishlist.success &&
            removeWishlistMsg
        ) {
            addToast({
                type: 'info',
                message: removeResponse.removeFromWishlist.message,
                dismissable: true,
                timeout: 5000
            });
            refetch();
            setRemoveWishlistMsg(false);
        } else {
            if (
                wishlistResponse &&
                wishlistResponse.addItemToWishlist &&
                wishlistResponse.addItemToWishlist.success &&
                addedWishlistMsg
            ) {
                addToast({
                    type: 'info',
                    message: wishlistResponse.addItemToWishlist.message,
                    dismissable: true,
                    timeout: 5000
                });
                refetch();
                setAddedWishlistMsg(false);
            }
        }
    }, [
        addToast,
        setAddedWishlistMsg,
        wishlistResponse,
        refetch,
        setRemoveWishlistMsg,
        removeResponse,
        addedWishlistMsg,
        removeWishlistMsg
    ]);

    useEffect(() => {
        if (!isSignedIn) {
            if (
                guestUserAddedWishlistProduct &&
                guestUserAddedWishlistProduct.name
            ) {
                addToast({
                    type: 'info',
                    message: `${guestUserAddedWishlistProduct.name
                        } added to wishlist.`,
                    dismissable: true,
                    timeout: 5000
                });
                setGuestUserAddedWishlistProduct();
            } else if (
                guestUserRemovedWishlistProduct &&
                guestUserRemovedWishlistProduct.name
            ) {
                addToast({
                    type: 'info',
                    message: `${guestUserRemovedWishlistProduct.name
                        } removed from wishlist.`,
                    dismissable: true,
                    timeout: 5000
                });
                setGuestUserRemovedWishlistProduct();
            }
        }
    }, [
        guestUserAddedWishlistProduct,
        guestUserRemovedWishlistProduct,
        isSignedIn
    ]);

    useEffect(() => {
        if (success && !isAddingItem) {
            // addToast({
            //     type: 'info',
            //     message:
            //         productDetails.name +
            //         formatMessage({
            //             id: 'cart.message',
            //             defaultMessage: 'added to the cart.'
            //         }),
            //     dismissable: true,
            //     timeout: 5000
            // });
            handleCartNotification(true, dispatch, productDetails?.name)
        }
        if (errorMessage && !isAddingItem) {
            addToast({
                type: 'error',
                message: errorMessage ? errorMessage : 'error',
                dismissable: true,
                timeout: 5000
            });
        }
    }, [
        addToast,
        success,
        errorMessage,
        isAddingItem,
        productDetails.name,
        formatMessage,
        dispatch
    ]);

    useEffect(() => {
        if (
            product &&
            product.configurable_options &&
            product.configurable_options.length
        ) {
            const initialConfigurableOptions = [];
            product.configurable_options.forEach(itemDetail => {
                if (
                    itemDetail.values &&
                    itemDetail.values.length &&
                    itemDetail.values[0].value_index
                ) {
                    initialConfigurableOptions.push({
                        attributeId: itemDetail.attribute_id,
                        attributeValue: itemDetail.values[0].value_index
                    });
                }
            });
            if (initialConfigurableOptions.length) {
                handleSelectionChange(
                    undefined,
                    undefined,
                    initialConfigurableOptions
                );
            }
        }
    }, [product]);

    const leftArrowSVGString =
        '<svg height="1792" viewBox="0 0 1792 1792" width="1792" xmlns="http://www.w3.org/2000/svg"><path d="M1203 544q0 13-10 23l-393 393 393 393q10 10 10 23t-10 23l-50 50q-10 10-23 10t-23-10l-466-466q-10-10-10-23t10-23l466-466q10-10 23-10t23 10l50 50q10 10 10 23z"/></svg>';
    const rightArrowSVGString =
        '<svg height="1792" viewBox="0 0 1792 1792" width="1792" xmlns="http://www.w3.org/2000/svg"><path d="M1171 960q0 13-10 23l-466 466q-10 10-23 10t-23-10l-50-50q-10-10-10-23t10-23l393-393-393-393q-10-10-10-23t10-23l50-50q10-10 23-10t23 10l466 466q10 10 10 23z"/></svg>';

    useEffect(() => {
        let lightbox = new PhotoSwipeLightbox({
            gallery: '.slick-track',
            children: 'div a',
            mouseMovePan: true,
            imageClickAction: 'zoom',
            initialZoomLevel: '1',
            secondaryZoomLevel: '2',
            maxZoomLevel: 5,
            arrowPrevSVG: leftArrowSVGString,
            arrowNextSVG: rightArrowSVGString,

            pswpModule: () => import('photoswipe/dist/photoswipe.esm')
        });
        lightbox.init();

        return () => {
            lightbox.destroy();
            lightbox = null;
        };
    }, [currentDisplaySlider]);

    useEffect(() => {
        if (typeof data != 'undefined' && isSignedIn) {
            data.forEach(function (value) {
                if (value.product.id == product.id) {
                    setAddedToWishlist(true);
                }
            });
        } else if (!isSignedIn && product && product.id) {
            const result = guestWishlistGetFromLocalStorage(product.id);
            setAddedToWishlist(
                typeof result === 'boolean'
                    ? result
                    : typeof result === 'object' && result && result.length
                        ? true
                        : false
            );
        }
    }, [data, isSignedIn]);

    useEffect(() => {
        if (!isSignedIn) {
            const resultGuestWishlistData = localStorage.getItem('guest_wishlist');
            const guestWishlistData = resultGuestWishlistData ? JSON.parse(resultGuestWishlistData) : []
            dispatch({
                type: 'WISHLIST_COUNT',
                payload: guestWishlistData.length
            });
        }
    }, [addedToWishlist]);

    useEffect(() => {
        if (frequentlyBoughtTogetherProductData?.products?.items?.length &&
            frequentlyBoughtTogetherProductData?.products?.items?.[0]?.fbt_products
                ?.length
        ) {
            setFrequentlyBoughtTogetherProducts(
                frequentlyBoughtTogetherProductData.products.items?.[0]?.fbt_products
            );
        } else {
            setFrequentlyBoughtTogetherProducts([]);
        }
    }, [frequentlyBoughtTogetherProductData]);

    var stockClass = '';
    var stockStatus = '';
    var animationStockClass = '';
    const productVariantStatus =
        productVariant?.product?.stock_status_data?.stock_status
            ? productVariant?.product?.stock_status_data?.stock_status
            : product?.__typename === "SimpleProduct" &&
                product?.stock_status_data?.stock_status ?
                product?.stock_status_data?.stock_status :
                'OUT_OF_STOCK';

    if (productVariantStatus) {
        if ((product?.__typename === "SimpleProduct" &&
            product?.stock_status_data?.stock_status === 'OUT_OF_STOCK') ||
            productVariantStatus === 'OUT_OF_STOCK') {
            stockStatus = 'Out Of Stock';
            stockClass = classes.stock_info + ' ' + classes.out_of_stock;
            stockAlert = (
                <>
                    <button type='button' data-toggle="modal" data-target=".bd-example-modal-lg">
                        <span className={classes.notify_me}> Notify Me</span>
                        <img
                            className={classes.popupbtn_img}
                            src="/cenia-static/icons/icons8-alarm-50.png"
                            alt="bell"
                            height="20"
                            width="20"
                        />
                    </button>
                </>
            );
            animationStockClass = classes.animation_out_of_stock;
        }
        else if (productVariantStatus === 'IN_STOCK') {
            stockClass = classes.stock_info + ' ' + classes.in_stock;
            stockStatus = 'In Stock';
            animationStockClass = classes.animation_in_stock;
        } else if (productVariantStatus === 'LOW_STOCK') {
            stockStatus = `Low stock - ${productVariant.product
                .stock_status_data.qty || 0} items left`;
            stockClass = classes.stock_info + ' ' + classes.low_stock;
            animationStockClass = classes.animation_low_stock;
        }
    }

    const ratingSummary = product && product.rating_summary;
    const reviewCount = product && product.review_count;
    let reviewMessage = '';
    if (parseInt(reviewCount) < 1) {
        reviewMessage = formatMessage({
            id: 'productFullDetail.noReview',
            defaultMessage: 'No Reviews '
        });
    } else if (parseInt(reviewCount) == 1) {
        reviewMessage = '1 Review ';
    } else {
        reviewMessage = reviewCount + ' ' + 'Reviews';
    }

    let image = '';
    if (
        mediaGalleryEntries &&
        mediaGalleryEntries[0] &&
        mediaGalleryEntries[0]['file']
    ) {
        image = mediaGalleryEntries[0]['file'];
    }

    const subscribedMsg =
        stockData &&
        stockData.MpProductAlertsConfigs &&
        stockData.MpProductAlertsConfigs.stock_alert &&
        stockData.MpProductAlertsConfigs.stock_alert.subscribed_text;

    const displayStockAlert =
        stockNotification &&
        (stockNotification.stockAlertGuestUsers ||
            stockNotification.stockAlertCustmers) &&
        areSameArrays(
            Array.from(optionSelectionRef.current),
            optionSelections ? Array.from(optionSelections) : []
        );

    const notifyGuestUser = async emailAlert => {
        try {
            await MpProductAlertNotifyInStock({
                variables: {
                    email: emailAlert,
                    productSku: productVariant &&
                        productVariant.product.stock_status === 'OUT_OF_STOCK'
                        ? productVariant.product.sku
                        : product.sku
                }
            });
        } catch (error) {
            console.log(error.message);
            setStockNotification({
                ...stockNotification,
                stockErrorMsg: error.message
            });
        }
    };

    const notifyCustmer = async () => {
        try {
            await MpProductAlertCustomerNotifyInStock({
                variables: {
                    productSku:
                        product.stock_status === 'OUT_OF_STOCK'
                            ? product.sku
                            : productSku
                }
            });
        } catch (error) {
            console.log(error.message);
            setStockNotification({
                ...stockNotification,
                stockErrorMsg: error.message
            });
        }
    };

    const imgURL = baseMediaUrl?.storeConfig?.secure_base_media_url

    return (
        <>
            <div className={classes.product_page_container}>
                <div className="container-fluid">
                    <div className="row flex-column">
                        <div className="col-12 mx-auto">
                            <div className={classes.breadcrimbstext}>
                                {breadcrumbs}
                            </div>
                        </div>
                        <div className="col-lg-10 col-md-12 mx-auto ">
                            <Form className={classes.root}>
                                {/* product image carousel section */}
                                <section
                                    className={
                                        classes.imageCarousel +
                                        ' ' +
                                        classes.shadow_section
                                    }
                                >
                                    <div
                                        className={`${classes.imageCarousel_inner
                                            } pswp-gallery`}
                                    >
                                        {isMobileView ? (
                                            <CustomSlider
                                                settings={{
                                                    dots: true,
                                                    infinite: true,
                                                    speed: 500,
                                                    slidesToShow: 1,
                                                    slidesToScroll: 1
                                                }}
                                                items={mediaGalleryEntries.map(
                                                    (item, index) => {
                                                        return <div
                                                            className={
                                                                classes.imageCarousel_item_img
                                                            }
                                                        >
                                                            <img
                                                                src={`${imgURL}catalog/product${item.file
                                                                    }`}
                                                                alt={`image_${index}`}
                                                                height={650}
                                                                width="100%"
                                                            />
                                                            <a
                                                                href={`${imgURL}catalog/product${item.file
                                                                    }`}
                                                                data-pswp-width={
                                                                    400
                                                                }
                                                                data-pswp-height={
                                                                    400
                                                                }
                                                                key={index}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            >
                                                                <FontAwesomeIcon
                                                                    icon={
                                                                        faSearch
                                                                    }
                                                                />
                                                            </a>
                                                        </div>
                                                    }
                                                )}
                                            />
                                        ) : (
                                            <CustomSlider
                                                ref={slider => { productSliderRef.current = slider }}
                                                settings={{
                                                    customPaging: function (i) {
                                                        const item = mediaGalleryEntries.find(
                                                            (_, index) => index === i);
                                                        if (item && item.file) {
                                                            return (
                                                                <img
                                                                    src={`${imgURL}catalog/product${item.file
                                                                        }`}
                                                                    alt={`image_${i}`}
                                                                />
                                                            );
                                                        } else {
                                                            return <></>;
                                                        }
                                                    },
                                                    afterChange: function (
                                                        index
                                                    ) {
                                                        setCurrentDisplaySlider(
                                                            index
                                                        );
                                                    },
                                                    dots: true,
                                                    dotsClass:
                                                        'slick-dots slick-thumb',
                                                    infinite: true,
                                                    speed: 500,
                                                    slidesToShow: 1,
                                                    slidesToScroll: 1,
                                                    nextArrow: <></>,
                                                    prevArrow: <></>
                                                }}
                                                items={mediaGalleryEntries.map(
                                                    (item, index) => (
                                                        <a
                                                            href={`${imgURL}catalog/product${item.file
                                                                }`}
                                                            data-pswp-width={
                                                                1024
                                                            }
                                                            data-pswp-height={
                                                                1024
                                                            }
                                                            key={index}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            <img
                                                                src={`${imgURL}catalog/product${item.file
                                                                    }`}
                                                                alt={`image_${index}`}
                                                                height={650}
                                                                width="100%"
                                                            />
                                                        </a>
                                                    )
                                                )}
                                            />
                                        )}

                                        {/* wishlist section */}
                                        <div
                                            className={
                                                classes.wishlist_carousel_Wrap
                                            }
                                        >
                                            <section
                                                className={
                                                    addedToWishlist || removeWishlistMsg
                                                        ? cedClasses.wishlist_addition +
                                                        ' ' +
                                                        cedClasses.wishlist_added
                                                        : null
                                                }
                                            >
                                                {!addedToWishlist || removeWishlistMsg ? (
                                                    <button
                                                        type='button'
                                                        className={
                                                            classes.wishlist_icon_wrap
                                                        }
                                                        onClick={() => {
                                                            if (isSignedIn) {
                                                                addtowishlist(
                                                                    product
                                                                );
                                                            } else {
                                                                setGuestUserAddedWishlistProduct(
                                                                    product
                                                                );
                                                                guestWishlistAddToLocalStorage(
                                                                    product
                                                                );
                                                                setAddedToWishlist(
                                                                    true
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <FontAwesomeIcon
                                                            color={
                                                                addedToWishlist
                                                                    ? 'red'
                                                                    : ''
                                                            }
                                                            icon={faHeart}
                                                        />
                                                    </button>
                                                ) : (
                                                    <button
                                                        type='button'
                                                        className={
                                                            classes.wishlist_icon_wrap
                                                        }
                                                        onClick={() => {
                                                            if (isSignedIn) {
                                                                removeFromWishlist(
                                                                    product
                                                                );
                                                            } else {
                                                                setGuestUserRemovedWishlistProduct(
                                                                    product
                                                                );
                                                                guestWishlistRemoveFromLocalStorage(
                                                                    product.id
                                                                );
                                                                setAddedToWishlist(
                                                                    false
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <FontAwesomeIcon
                                                            color={
                                                                addedToWishlist
                                                                    ? 'red'
                                                                    : ''
                                                            }
                                                            icon={faHeart}
                                                        />
                                                    </button>
                                                )}
                                            </section>
                                        </div>
                                    </div>
                                </section>
                                {/* product right section */}
                                <section
                                    className={classes.product_details_right}
                                >
                                    <div
                                        className={
                                            classes.produtc_right_section
                                        }
                                    >
                                        <section
                                            className={
                                                classes.title +
                                                ' ' +
                                                classes.shadow_section
                                            }
                                        >
                                            <div
                                                className={
                                                    classes.product_name_wrapper
                                                }
                                            >
                                                <h1
                                                    className={
                                                        classes.productName
                                                    }
                                                >
                                                    {productDetails.name}
                                                </h1>
                                                <div
                                                    className={
                                                        classes.sku_details
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            classes.sku_details_label
                                                        }
                                                    >
                                                        SKU :
                                                    </span>
                                                    <span
                                                        className={
                                                            classes.sku_details_sku
                                                        }
                                                    >
                                                        {' '}
                                                        {product && product.sku}
                                                    </span>
                                                </div>
                                            </div>
                                            <PriceRange
                                                price={productDetails.price}
                                                optionFlag={
                                                    productDetails.optionFlag
                                                }
                                                product={product}
                                                customPrice={
                                                    customPrice +
                                                    customPriceRadio +
                                                    customPriceMultiple +
                                                    customPriceDropdown +
                                                    customField +
                                                    customArea
                                                }
                                                customPricePercent={
                                                    customPricePercentRadio +
                                                    customPercDropDown +
                                                    customPercCheckbox
                                                }
                                            />
                                            <div
                                                className={
                                                    classes.review_section +
                                                    ' ' +
                                                    'd-flex' +
                                                    ' ' +
                                                    'flex-wrap'
                                                }
                                            >
                                                <div
                                                    className={
                                                        classes.review_stars_wrapper +
                                                        ' ' +
                                                        'position-relative'
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            classes.not_reviewed
                                                        }
                                                        style={{
                                                            width:
                                                                ratingSummary +
                                                                '%'
                                                        }}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faStar}
                                                        />
                                                        <FontAwesomeIcon
                                                            icon={faStar}
                                                        />
                                                        <FontAwesomeIcon
                                                            icon={faStar}
                                                        />
                                                        <FontAwesomeIcon
                                                            icon={faStar}
                                                        />
                                                        <FontAwesomeIcon
                                                            icon={faStar}
                                                        />
                                                    </span>
                                                    <span
                                                        className={
                                                            classes.reviewed
                                                        }
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faStar}
                                                        />
                                                        <FontAwesomeIcon
                                                            icon={faStar}
                                                        />
                                                        <FontAwesomeIcon
                                                            icon={faStar}
                                                        />
                                                        <FontAwesomeIcon
                                                            icon={faStar}
                                                        />
                                                        <FontAwesomeIcon
                                                            icon={faStar}
                                                        />
                                                    </span>
                                                </div>
                                                <span
                                                    className={
                                                        classes.total_reviews +
                                                        ' ' +
                                                        'pl-3 ml-3'
                                                    }
                                                >
                                                    <button
                                                        type='button'
                                                        onClick={() => {
                                                            setTimeout(() => {
                                                                targetRef.scrollIntoView(
                                                                    {
                                                                        behavior:
                                                                            'smooth'
                                                                    }
                                                                );
                                                            }, 300);
                                                        }}
                                                    >
                                                        <button
                                                            type="button"
                                                            data-toggle="collapse"
                                                            data-target="#collapseThree"
                                                            aria-expanded="false"
                                                            aria-controls="collapseThree"
                                                        >
                                                            <span>
                                                                {reviewMessage}
                                                            </span>
                                                        </button>
                                                    </button>
                                                </span>
                                            </div>
                                            <hr className={classes.hr_line} />
                                            {product &&
                                                product.short_description && (
                                                    <div>
                                                        <RichText
                                                            content={
                                                                product
                                                                    .short_description
                                                                    .html
                                                            }
                                                        />
                                                    </div>
                                                )}


                                            {/* {giftWrapperId && (
                                                <p className="text-capitalize">
                                                    Wrapper:{' '}
                                                    <b>
                                                        {giftWrapperId &&
                                                            giftWrapperId.mpGiftWrapWrapper &&
                                                            giftWrapperId
                                                                .mpGiftWrapWrapper
                                                                .name}{' '}
                                                        (₹
                                                        {giftWrapperId &&
                                                            giftWrapperId.mpGiftWrapWrapper &&
                                                            giftWrapperId
                                                                .mpGiftWrapWrapper
                                                                .amount}
                                                    </b>
                                                    )
                                                </p>
                                            )}
                                            <button
                                                onClick={() =>
                                                    setCategoryFlag(
                                                        !categoryFlag
                                                    )
                                                }
                                            >
                                                <GiftModal
                                                    categoryFlag={categoryFlag}
                                                    setCategoryFlag={
                                                        setCategoryFlag
                                                    }
                                                />
                                            </button> */}
                                        </section>

                                        {(!stockNotification.stockAlertGuestUsers ||
                                            !stockNotification.stockAlertCustmers) &&
                                            areSameArrays(
                                                Array.from(
                                                    optionSelectionRef.current
                                                ),
                                                optionSelections
                                                    ? Array.from(
                                                        optionSelections
                                                    )
                                                    : []
                                            ) &&
                                            !alertBoxClose && (
                                                <>
                                                    <div
                                                        className={
                                                            classes.form_wrror +
                                                            ' ' +
                                                            classes.shadow_section
                                                        }
                                                    >
                                                        <FormError
                                                            classes={{
                                                                root:
                                                                    classes.formErrors
                                                            }}
                                                            errors={
                                                                errors.get(
                                                                    'form'
                                                                ) || []
                                                            }
                                                        />
                                                    </div>
                                                </>
                                            )}

                                        {displayStockAlert &&
                                            errors.size !== 0 && (
                                                <div>
                                                    <span>{subscribedMsg}</span>
                                                </div>
                                            )}
                                        {stockNotification.stockErrorMsg &&
                                            !displayStockAlert && (
                                                <div>
                                                    <span
                                                        className={
                                                            classes.stock_error_msg
                                                        }
                                                    >
                                                        You have already
                                                        subscribed this
                                                        product.
                                                    </span>
                                                </div>
                                            )}
                                        {(stockNotification.stockAlertCustmers || stockNotification.stockAlertGuestUsers) &&
                                            displayStockAlert && (
                                                <div>
                                                    <span
                                                        className={
                                                            classes.stock_success_msg
                                                        }
                                                    >
                                                        Congratulations! You will receive a notification email when this product has just come back to stock.
                                                    </span>
                                                </div>
                                            )}


                                        {only_x_left_in_stock && (
                                            <div
                                                className={
                                                    classes.quantity_wrap +
                                                    ' ' +
                                                    classes.shadow_section
                                                }
                                            >
                                                <span
                                                    className={classes.qty_icon}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faCubes}
                                                    />
                                                </span>
                                                <span
                                                    className={
                                                        classes.qty_number
                                                    }
                                                >
                                                    {only_x_left_in_stock +
                                                        ' ' +
                                                        'quantity left only.'}
                                                </span>
                                            </div>
                                        )}

                                        <div className={classes.options_wrap}>
                                            {bundleOptions &&
                                                showBundleOptions && (
                                                    <section
                                                        className={
                                                            classes.options +
                                                            ' ' +
                                                            classes.shadow_section
                                                        }
                                                    >
                                                        <Modal>
                                                            <div
                                                                id="bundle-option-overlay"
                                                                className={
                                                                    classes.bundle_form_popup
                                                                }
                                                            >
                                                                <div
                                                                    className={
                                                                        classes.overlay
                                                                    }
                                                                />
                                                                {bundleOptions}
                                                            </div>
                                                        </Modal>
                                                    </section>
                                                )}

                                            {customOptions && (
                                                <section
                                                    className={
                                                        classes.options +
                                                        ' ' +
                                                        classes.shadow_section
                                                    }
                                                >
                                                    {customOptions}
                                                </section>
                                            )}
                                            {options && product.stock_status !== 'OUT_OF_STOCK' && (
                                                <section
                                                    className={
                                                        classes.options +
                                                        ' ' +
                                                        classes.shadow_section
                                                    }
                                                >
                                                    {options}
                                                </section>
                                            )}
                                        </div>
                                        <div
                                            className={
                                                classes.stock_display_section_wrapper
                                            }
                                        >
                                            <div className={classes.stock_display_section_sub_wrapper}>
                                                <span
                                                    className={animationStockClass}
                                                />
                                                <span className={stockClass}>
                                                    {stockStatus}
                                                </span>
                                            </div>
                                            {(!stockNotification.stockAlertGuestUsers ||
                                                !stockNotification.stockAlertCustmers) &&
                                                areSameArrays(
                                                    Array.from(
                                                        optionSelectionRef.current
                                                    ),
                                                    optionSelections
                                                        ? Array.from(
                                                            optionSelections
                                                        )
                                                        : []
                                                ) &&
                                                !alertBoxClose && (
                                                    <div
                                                        className={
                                                            stockClass +
                                                            ' ' +
                                                            classes.notificationMsg
                                                        }
                                                    >
                                                        <span>
                                                            {stockAlert}
                                                        </span>
                                                    </div>
                                                )}
                                        </div>
                                        {product.__typename !=
                                            'BundleProduct' && (
                                                <>
                                                    <div className={classes.shadow_section}>
                                                        <div className={classes.qty_cart_wrap}>

                                                            <div className={classes.quantity}>
                                                                <QuantityFields
                                                                    itemId={'qty'}
                                                                    classes={{
                                                                        root:
                                                                            classes.quantityRoot
                                                                    }}
                                                                    min={1}
                                                                    message={errors.get(
                                                                        'quantity'
                                                                    )}
                                                                    name="hekllo"
                                                                    disabled={productVariantStatus === 'OUT_OF_STOCK' || product.stock_status ===
                                                                        'OUT_OF_STOCK'}
                                                                />
                                                            </div>
                                                            <div className={classes.cartActions + ' ' + classes.loader_case_wrapp}>
                                                                {product &&
                                                                    product.stock_status ==
                                                                    'IN_STOCK' && (
                                                                        <Button
                                                                            priority="high"
                                                                            onClick={() => {
                                                                                handleAddToCart(
                                                                                    {
                                                                                        quantity: document.getElementById(
                                                                                            'qty'
                                                                                        )
                                                                                            .value,
                                                                                        customOptionId,
                                                                                        customOptionString,
                                                                                        customArrayVar
                                                                                    }
                                                                                );
                                                                            }}
                                                                            disabled={
                                                                                isAddToCartDisabled ||
                                                                                productVariantStatus ===
                                                                                'OUT_OF_STOCK'
                                                                            }
                                                                        >
                                                                            <FormattedMessage
                                                                                id={
                                                                                    'ProductFullDetail.addToCart'
                                                                                }
                                                                                defaultMessage={
                                                                                    'Add to Cart'
                                                                                }
                                                                            />
                                                                        </Button>
                                                                    )}

                                                                {isAddingItem && (
                                                                    <div
                                                                        className={
                                                                            classes.modal +
                                                                            ' ' +
                                                                            classes.modal_active +
                                                                            ' ' +
                                                                            classes.galler_modal_active
                                                                        }
                                                                    >
                                                                        <div
                                                                            className={
                                                                                classes.loader_div
                                                                            }
                                                                        >
                                                                            <div
                                                                                className={
                                                                                    classes.ball_pulse
                                                                                }
                                                                            >
                                                                                <div />
                                                                                <div />
                                                                                <div />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Form>
                                                            <div className={classes.pincode_section}>
                                                                <PinCodeChecker
                                                                    productId={productVariant &&
                                                                        productVariant.product &&
                                                                        productVariant.product.id
                                                                    }
                                                                    pincode={pincode}
                                                                    setPincode={setPincode}
                                                                    pincodeData={pincodeData}
                                                                    setPincodeData={setPincodeData}
                                                                    require={require}
                                                                    setRequire={setRequire}
                                                                />
                                                                <div className={classes.pincode_button}>
                                                                    <Button
                                                                        priority="high"
                                                                        onClick={handleCheckPincode}
                                                                    >
                                                                        <FormattedMessage
                                                                            id={
                                                                                'pincode.checkButton'
                                                                            }
                                                                            defaultMessage={
                                                                                'Check'
                                                                            }
                                                                        />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </Form>

                                                        {/* {errorMessage ? (
                                                            <div className={classes.error_message}>{errorMessage}</div>
                                                        ) : (<></>)} */}
                                                        <Suspense fallback={''}>
                                                            <div
                                                                className={`${classes.sharing_icon_wrapper} ${errorMessage ? classes.sharing_icon_wrapper_when_error_message : ''}`}
                                                            >
                                                                <ProductSharingIcons
                                                                    classes={
                                                                        classes
                                                                    }
                                                                    productDetails={
                                                                        productDetails
                                                                    }
                                                                    image={image}
                                                                />
                                                                <span className={classes.copy_link}>
                                                                    <Icon
                                                                        src={
                                                                            CopyIcon
                                                                        }
                                                                        size={25}
                                                                        classes={
                                                                            classes.copy_icon
                                                                        }
                                                                        onClick={
                                                                            copyCurrentURL
                                                                        }
                                                                    />
                                                                </span>
                                                            </div>
                                                        </Suspense>
                                                    </div>
                                                </>
                                            )}

                                        {product.__typename ==
                                            'BundleProduct' && (
                                                <section
                                                    className={
                                                        classes.loader_case_wrapp +
                                                        ' ' +
                                                        classes.bundle_rpoduct_wrap
                                                    }
                                                >
                                                    {product &&
                                                        product.stock_status ==
                                                        'IN_STOCK' && (
                                                            <Button
                                                                priority="high"
                                                                onClick={() => {
                                                                    if (
                                                                        !showBundleOptions
                                                                    ) {
                                                                        setShowBundleOptions(
                                                                            true
                                                                        );
                                                                    }
                                                                    setOverlay(
                                                                        true
                                                                    );
                                                                    document
                                                                        .getElementsByTagName(
                                                                            'html'
                                                                        )[0]
                                                                        .setAttribute(
                                                                            'data-scroll-lock',
                                                                            'true'
                                                                        );
                                                                }}
                                                                disabled={
                                                                    showBundleOptions
                                                                }
                                                            >
                                                                <FormattedMessage
                                                                    id={
                                                                        'ProductFullDetail.customizeAddToCart'
                                                                    }
                                                                    defaultMessage={
                                                                        'Customize and Add to Cart'
                                                                    }
                                                                />
                                                            </Button>
                                                        )}
                                                </section>
                                            )}

                                        {/* tabs structure */}
                                        <div
                                            className={
                                                classes.tabs_wrap +
                                                ' ' +
                                                classes.shadow_section
                                            }
                                            id="tabs_wrap"
                                        >
                                            <div
                                                className="accordion"
                                                id="accordionExample"
                                            >
                                                {/* description tab */}
                                                <div
                                                    className={
                                                        classes.details_tab +
                                                        ' ' +
                                                        classes.tab_list +
                                                        ' ' +
                                                        'card'
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            'card-header' +
                                                            ' ' +
                                                            classes.card_header
                                                        }
                                                        id="headingOne"
                                                    >
                                                        <div
                                                            className={
                                                                'btn btn-link collapsed' +
                                                                ' ' +
                                                                classes.product_tabs_list
                                                            }
                                                            data-toggle="collapse"
                                                            data-target="#collapseOne"
                                                            aria-expanded="false"
                                                            aria-controls="collapseOne"
                                                        >
                                                            <span>
                                                                <FormattedMessage
                                                                    id={
                                                                        'ProductFullDetail.ProductDescription'
                                                                    }
                                                                    defaultMessage={
                                                                        'Product Description'
                                                                    }
                                                                />
                                                            </span>
                                                            <span
                                                                className={
                                                                    classes.tabs_arrow
                                                                }
                                                            >
                                                                {
                                                                    chevrondownIcon
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div
                                                        id="collapseOne"
                                                        className="collapse"
                                                        aria-labelledby="headingOne"
                                                        data-parent="#accordionExample"
                                                    >
                                                        <div
                                                            className={
                                                                classes.tabs_content_custom +
                                                                ' ' +
                                                                'card-body'
                                                            }
                                                        >
                                                            <RichText
                                                                content={
                                                                    typeof productDetails?.description === "string" ?
                                                                        productDetails?.description :
                                                                        typeof productDetails?.description?.html === "string" &&
                                                                        productDetails?.description?.html ||
                                                                        "No description available."

                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* details tab */}
                                                <div
                                                    className={
                                                        classes.moreinfo_tab +
                                                        ' ' +
                                                        classes.tab_list +
                                                        ' ' +
                                                        'card'
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            'card-header' +
                                                            ' ' +
                                                            classes.card_header
                                                        }
                                                        id="headingTwo"
                                                    >
                                                        <div
                                                            className={
                                                                'btn btn-link collapsed' +
                                                                ' ' +
                                                                classes.product_tabs_list
                                                            }
                                                            data-toggle="collapse"
                                                            data-target="#collapseTwo"
                                                            aria-expanded="false"
                                                            aria-controls="collapseTwo"
                                                        >
                                                            <span>
                                                                <FormattedMessage
                                                                    id={
                                                                        'ProductFullDetail.ProductDetails'
                                                                    }
                                                                    defaultMessage={
                                                                        'Product Attribute'
                                                                    }
                                                                />
                                                            </span>
                                                            <span
                                                                className={
                                                                    classes.tabs_arrow
                                                                }
                                                            >
                                                                {
                                                                    chevrondownIcon
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div
                                                        id="collapseTwo"
                                                        className="collapse"
                                                        aria-labelledby="headingTwo"
                                                        data-parent="#accordionExample"
                                                    >
                                                        <div
                                                            className={
                                                                classes.tabs_content_custom +
                                                                ' ' +
                                                                'card-body'
                                                            }
                                                        >
                                                            <strong>
                                                                <FormattedMessage
                                                                    id={
                                                                        'ProductFullDetail.sku'
                                                                    }
                                                                    defaultMessage={
                                                                        'SKU : '
                                                                    }
                                                                />
                                                            </strong>
                                                            {productDetails.sku}
                                                        </div>
                                                        {productMoreInfo.length >
                                                            0 &&
                                                            productMoreInfo.map(
                                                                (v, i) => {
                                                                    return (
                                                                        <div
                                                                            key={
                                                                                i +
                                                                                'more_info'
                                                                            }
                                                                            className={
                                                                                classes.tabs_content_custom +
                                                                                ' ' +
                                                                                'card-body'
                                                                            }
                                                                        >
                                                                            <strong>
                                                                                {v.label +
                                                                                    ' : '}
                                                                            </strong>
                                                                            {
                                                                                v.value
                                                                            }
                                                                        </div>
                                                                    );
                                                                }
                                                            )}
                                                    </div>
                                                </div>
                                                {/* reviews tab */}
                                                <div
                                                    id="target-section"
                                                    ref={ref => {
                                                        targetRef = ref;
                                                    }}
                                                >
                                                    <Suspense fallback={''}>
                                                        <ProductReviews
                                                            product={
                                                                product
                                                            }
                                                            image={image}
                                                        />
                                                    </Suspense>
                                                </div>
                                                {frequentlyBoughtTogetherProducts.length ? (<div
                                                    className={
                                                        classes.moreinfo_tab +
                                                        ' ' +
                                                        classes.tab_list +
                                                        ' ' +
                                                        'card test_card'
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            'card-header' +
                                                            ' ' +
                                                            classes.card_header
                                                        }
                                                        id="headingTwo"
                                                    >
                                                        <div
                                                            className={
                                                                'btn btn-link collapsed' +
                                                                ' ' +
                                                                classes.product_tabs_list
                                                            }
                                                            data-toggle="collapse"
                                                            data-target="#collapseTwosss"
                                                            aria-expanded="false"
                                                            aria-controls="collapseTwosss"
                                                        >
                                                            <span>
                                                                Frequently Bought Together
                                                            </span>
                                                            <span
                                                                className={
                                                                    classes.tabs_arrow
                                                                }
                                                            >
                                                                {
                                                                    chevrondownIcon
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div
                                                        id="collapseTwosss"
                                                        className="collapse"
                                                        aria-labelledby="headingTwo"
                                                        data-parent="#accordionExample"
                                                    >
                                                        <div
                                                            className={
                                                                classes.tabs_content_custom +
                                                                ' ' +
                                                                'card-body'
                                                            }
                                                        >
                                                            <div>
                                                                <Suspense fallback={''}>
                                                                    <FrequentlyBoughtTogether
                                                                        productId={product.id}
                                                                        frequentlyBoughtTogetherProducts={[
                                                                            product
                                                                        ]?.concat(
                                                                            frequentlyBoughtTogetherProducts
                                                                        )}
                                                                    />
                                                                </Suspense>
                                                            </div>

                                                        </div>
                                                    </div>
                                                </div>) : (
                                                    <></>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </Form>
                        </div>
                        <StockAlert
                            product={product}
                            productVariant={productVariant}
                            data={stockData}
                            MpProductAlertNotifyInStock={
                                MpProductAlertNotifyInStock
                            }
                            MpProductAlertCustomerNotifyInStock={
                                MpProductAlertCustomerNotifyInStock
                            }
                            alertBoxClose={alertBoxClose}
                            setAlertBoxClose={setAlertBoxClose}
                            isSignedIn={isSignedIn}
                            stockAlertData={stockAlertData}
                            productSku={productSku}
                            emailAlert={emailAlert}
                            setEmailAlert={setEmailAlert}
                            notifyGuestUser={notifyGuestUser}
                            notifyCustmer={notifyCustmer}
                        />
                    </div>
                </div>
                <>

                    <div className={classes.h_products_wrap}>
                        <Suspense fallback={''}>
                            <LinkedProducts
                                suffix={product.url_suffix}
                                sku={product.sku}
                                title={formatMessage({
                                    id: 'home.relatedProductTitle',
                                    defaultMessage: 'Related Products'
                                })}
                                type={'related'}
                                product={product}
                            />
                        </Suspense>
                    </div>
                    <div className={classes.h_products_wrap}>
                        <Suspense fallback={''}>
                            <LinkedProducts
                                suffix={product.url_suffix}
                                sku={product.sku}
                                title={formatMessage({
                                    id: 'home.linkedProductTitle',
                                    defaultMessage:
                                        'You may also be interested in the following products'
                                })}
                                description={'description'}
                                type={'upsell'}
                                product={product}
                            />
                        </Suspense>
                    </div>
                </>
            </div>
        </>
    );
};

ProductFullDetail.propTypes = {
    classes: shape({
        cartActions: string,
        description: string,
        descriptionTitle: string,
        details: string,
        detailsTitle: string,
        imageCarousel: string,
        options: string,
        productName: string,
        productPrice: string,
        quantity: string,
        quantityTitle: string,
        root: string,
        title: string
    }),
    product: shape({
        __typename: string,
        id: number,
        sku: string.isRequired,
        media_gallery_entries: arrayOf(
            shape({
                label: string,
                position: number,
                disabled: bool,
                file: string.isRequired
            })
        ),
        description: string
    }).isRequired
};

export default ProductFullDetail;
