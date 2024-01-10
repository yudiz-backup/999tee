import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { useCartPage } from '../../peregrine/lib/talons/CartPage/useCartPage.js';
import { FormattedMessage } from 'react-intl';
import { mergeClasses } from '../../classify';
import { Title } from '../Head';
import LinkButton from '../LinkButton';
import { useLocation } from 'react-router-dom';
import { fullPageLoadingIndicator } from '../LoadingIndicator';
import StockStatusMessage from '../StockStatusMessage';
import PriceAdjustments from './PriceAdjustments';
import ProductListing from './ProductListing';
import PriceSummary from './PriceSummary';
import defaultClasses from './cartPage.css';
import { GET_CART_DETAILS } from './cartPage.gql';
import searchClasses from '../SearchPage/searchPage.css';
import productClasses from './ProductListing/product.css'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { useCrossSellProduct } from '../../peregrine/lib/talons/ProductFullDetail/useProductFullDetail';
import crossSellQuery from '../../queries/getCrossSellProducts.graphql';
import CrossSellProducts from './linkedProducts';
import RewardPoints from './rewardPoints'
import getRewardPrice from '../../queries/rewardPoint/rewardPointPrice.graphql'
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import rewardPointCalculation from '../../queries/rewardPoint/rewardPointCalculation.graphql'
import { globalContext } from '../../peregrine/lib/context/global.js';
import getRewardPointConfig from '../../queries/rewardPoint/rewardPointConfig.graphql'
import giftWrapperStatus from '../../queries/giftWarp/giftWrapperStatus.graphql'
// import GiftModal from '../ProductFullDetail/GiftModal/giftModel.js';
import GiftModal from '../ProductFullDetail/GiftModal/giftWrapper.js';
import Button from '../Button/button.js';
import getGiftWrapperData from '../../queries/giftWarp/getGiftWrapperData.graphql'
import { useWishlist } from '../../peregrine/lib/talons/MyAccount/useDashboard';
import WishListQuery from '../../queries/getWishlist.graphql';
import { guestWishlistGetFromLocalStorage } from '../../util/helperFunction';
import EMPTY_CART from '../../queries/emptyCart.graphql'
import LoadingIndicator from '../LoadingIndicator/indicator.js';
import { MINI_CART_QUERY } from '../MiniCart/miniCart.gql'
/**
 * Structural page component for the shopping cart.
 * This is the main component used in the `/cart` route in Venia.
 * It uses child components to render the different pieces of the cart page.
 *
 * @see {@link https://venia.magento.com/cart}
 *
 * @param {Object} props
 * @param {Object} props.classes CSS className overrides for the component.
 * See [cartPage.css]{@link https://github.com/magento/pwa-studio/blob/develop/packages/venia-ui/lib/components/CartPage/cartPage.css}
 * for a list of classes you can override.
 *
 * @returns {React.Element}
 *
 * @example <caption>Importing into your project</caption>
 * import CartPage from "@magento/venia-ui/lib/components/CartPage";
 */

const CartPage = props => {
    const [selectedItem, setSelectedItem] = useState()
    const location = useLocation();
    const [/* discounts, */ setDiscount] = useState()
    const [openModal, setOpenModel] = useState(localStorage.getItem("isChecked") || null)
    const [giftWrapperData, setGiftWrapperData] = useState([])
    const [priceSummaryGiftWrapper, setPriceSummaryGiftWrapper] = useState(false)
    const [allCartGiftWrapper, setAllCartGiftWrapper] = useState([])
    const [isChecked, setIsChecked] = useState(localStorage.getItem("isCheckedAllCart") || false);
    const [allCartGiftData, setAllCartGiftData] = useState(false)
    // const [giftWrap, setGiftWrap] = useState(!allCartGiftWrapper && giftWrapperData?.length === 0 ? null : +localStorage.getItem("wrapperRadioButtonValue") || null)
    const [giftWrap, setGiftWrap] = useState(null)
    const [clearAllCartWrapper, setClearAllCartWrapper] = useState(false)
    const [removeSpicifieAllItem, setRemoveSpicifieAllItem] = useState(false)
    const [wishlistData, setWishlistData] = useState([]);
    const [couponCode, setCouponCode] = useState('');
    const [modal, setModal] = useState(false)
    const isMountedCartPage = useRef(false)

    useEffect(() => {
        if (giftWrap !== 2) {
            setSelectedItem()
            setOpenModel(null)
        }
    }, [giftWrap])

    const [giftWrapper] = useLazyQuery(getGiftWrapperData, {
        fetchPolicy: "no-cache",
    })

    const { data: rewardPrice } = useQuery(getRewardPrice)
    const { data } = useQuery(getRewardPointConfig, {
        fetchPolicy: "no-cache",
    })

    const { refetch : minCartRefetch , loading: miniCartLoading } = useQuery(
        MINI_CART_QUERY,
        {
            // fetchPolicy: 'cache-and-network',
            // nextFetchPolicy: 'cache-first',
            notifyOnNetworkStatusChange: true,
            fetchPolicy: 'network-only',
            variables: { cartId: localStorage.getItem('cart_id') },
            skip: !localStorage.getItem('cart_id')
        }
    );

    const [emptyCart, { loading: emptycartLoading} ] = useMutation( EMPTY_CART, {
        onCompleted: data => {
            if (data) {
                minCartRefetch()
            }
        }
    }
);

    const [value, onChange] = useState(sessionStorage.getItem('rangeValue') || 0);
    const [calculation, setCalculation] = useState('');
    const talonProps = useCartPage({
        queries: {
            getCartDetails: GET_CART_DETAILS
        }
    });

    const [wrapperStatusData, { data: wrapperStatus }] = useLazyQuery(giftWrapperStatus, {
        fetchPolicy: 'no-cache'
    })

    const wishlistProps = useWishlist({
        query: WishListQuery
    });

    const { refetch = () => { } } = wishlistProps;

    useEffect(() => {
        wrapperStatusData()
    }, [])

    const wrapperStatusPerItem = wrapperStatus &&
        wrapperStatus.mpGiftWrapConfigSetting &&
        wrapperStatus.mpGiftWrapConfigSetting.gift_wrap_type

    const wrapperStatusEnabled = wrapperStatus &&
        wrapperStatus.mpGiftWrapConfigSetting &&
        wrapperStatus.mpGiftWrapConfigSetting.gift_wrap_module_status

    const { dispatch } = useContext(globalContext)

    useEffect(() => {
        if (couponCode) {
            dispatch({ type: "COUPON_CODE", payload: { coupon_code: couponCode } })
        }
    }, [couponCode])

    useEffect(() => {
        if (calculation) {
            dispatch({ type: "UPDATE_PRICE_SUMMARY_DATA", payload: { priceSummaryData: calculation } })
        }
    }, [calculation])

    const [rewardCalculation, { loading: rewardPointCalculationLoading }] = useMutation(rewardPointCalculation,
        {
            onCompleted: (data) => {
                const priceDetail = data.MpRewardSpendingPoint.reduce((acc, item) => {
                    return {
                        ...acc,
                        [item.code]: item.value
                    }
                }, {})
                setCalculation(priceDetail)
                if (priceDetail && (priceDetail.grand_total || priceDetail.subtotal)) {
                    dispatch({
                        type: 'PRICE_SUMMARY_DETAIL',
                        priceSummaryDetail: {
                            grandTotal: priceDetail.grand_total ? Math.floor(priceDetail.grand_total) : undefined,
                            subTotal: priceDetail.subtotal ? priceDetail.subtotal : undefined
                        }
                    });
                }
            },
            fetchPolicy: 'no-cache'
        });


    const {
        cartItems,
        hasItems,
        isSignedIn,
        isCartUpdating,
        setIsCartUpdating,
        shouldShowLoadingIndicator,
        cartDetails,
        refetch: cartDetailsRefetch = () => { }
    } = talonProps;


    useEffect(() => {
        if (location?.state?.reOrder && !hasItems) {
            cartDetailsRefetch()
        }
    }, [location.state])


    useEffect(() => {
        if (!hasItems) {
            // if (JSON.parse(localStorage.getItem('giftWrapper')) &&
            //     JSON.parse(localStorage.getItem('giftWrapper')).length) {
            //     localStorage.removeItem('giftWrapper')
            // }
            setGiftWrap(null)
            // const allCartGiftWrapper = JSON.parse(localStorage.getItem('allCartGiftWrapper'))

            // if (allCartGiftWrapper &&
            //     allCartGiftWrapper.mpGiftWrapWrapperSetAll &&
            //     allCartGiftWrapper.mpGiftWrapWrapperSetAll.length) {
            //     localStorage.removeItem('allCartGiftWrapper')
            //     localStorage.removeItem("isCheckedAllCart")
            // }
        }

    }, [hasItems])

    const totalQuantity = useMemo(() => {
        if (cartDetails) {
            return cartDetails.total_quantity;
        }
        else if (cartDetails?.total_quantity) {
            return cartDetails?.total_quantity;
        }
    }, [cartDetails]);

    useEffect(() => {
        if (cartDetails?.prices?.mp_reward_segments?.length > 1) {
            sessionStorage.setItem('rangeValue', cartDetails?.prices?.mp_reward_segments.find(i => i.code === 'mp_reward_spent').value)
            isMountedCartPage.current = true
            onChange(cartDetails?.prices?.mp_reward_segments.find(i => i.code === 'mp_reward_spent').value)
            rewardCalculation({
                variables: {
                    // cart_id: cartDetails === undefined ? cartId : cartDetails.id,
                    cart_id: localStorage.getItem('cart_id'),

                    points: cartDetails?.prices?.mp_reward_segments.find(i => i.code === 'mp_reward_spent').value,
                    rule_id: "rate",
                }
            })
        }
        else {
            const priceDetail = cartDetails?.prices?.mp_reward_segments?.reduce((acc, item) => {
                return {
                    ...acc,
                    [item.code]: item.value
                }
            }, {})
            setCalculation({
                "subtotal": cartDetails?.prices?.subtotal_excluding_tax?.value,
                "mp_reward_earn": priceDetail?.mp_reward_earn
            })
        }

        //gift wrapper 
        if (cartDetails?.items.some(element => element.mp_gift_wrap_data?.all_cart === true)) {
            if (cartDetails?.items?.[0]?.mp_gift_wrap_data?.all_cart) {
                setGiftWrap(1)
            }
        }
        else {
            if (cartDetails?.items.some(element => element.mp_gift_wrap_data?.all_cart === null)) {
                if (cartItems?.length !== 1) {
                    setGiftWrap(2)
                }
                setGiftWrapperData(cartDetails?.items && cartDetails?.items?.filter(element => element.mp_gift_wrap_data?.all_cart === null))
            }
        }
    }, [cartDetails])


    useEffect(() => {
        if (cartItems?.length !== 1 && giftWrapperData?.length === 1 && !giftWrap) {
            setGiftWrap(2)
        }
    }, [cartItems, giftWrapperData, giftWrap])

    useEffect(() => {
        async function fetchWishlistData() {
            try {
                if (isSignedIn) {
                    const result = await refetch();
                    if (result && result.data && result.data.wishlist && result.data.wishlist.items && result.data.wishlist.items.length) {
                        const resultWishlistProduct = result.data.wishlist.items.map(item => item.product)
                        setWishlistData(resultWishlistProduct)
                    } else {
                        setWishlistData([])
                    }
                } else if (!isSignedIn) {
                    const result = guestWishlistGetFromLocalStorage();
                    if (result && result.length) {
                        setWishlistData(result)
                    } else {
                        setWishlistData([])
                    }
                }
            } catch (error) {
                console.log('[Error] -> fetchWishlistData() : ', error)
            }
        }
        fetchWishlistData();
    }, [])

    const classes = mergeClasses(defaultClasses, props.classes);
    const { crossSellData } = useCrossSellProduct({
        query: crossSellQuery,
        cartItems
    });

    if (shouldShowLoadingIndicator) {
        return fullPageLoadingIndicator;
    }
    const linkClick = document.getElementById('user_account');

    const signInDisplay = !isSignedIn ? (
        <LinkButton
            classes={{ root: classes.signInLink }}
            onClick={() => linkClick.click()}
        >
            <Button priority='high'>
                <FormattedMessage
                    id={'cartPage.signInLink'}
                    defaultMessage={'Sign In'}
                />
            </Button>

        </LinkButton>
    ) : null;

    const handleModelOpen = () => {
        setOpenModel(!openModal)
        setPriceSummaryGiftWrapper(!priceSummaryGiftWrapper)
    }

    const allCart = allCartGiftWrapper &&
        allCartGiftWrapper?.mpGiftWrapWrapperSetAll &&
        allCartGiftWrapper?.mpGiftWrapWrapperSetAll?.filter((all_cart =>
            all_cart &&
            all_cart.mp_gift_wrap_data &&
            all_cart.mp_gift_wrap_data.all_cart === true))[0]





    const giftModal = hasItems ? <div className={classes.product_modal}>
        <GiftModal
            item={selectedItem}
            openModal={openModal}
            setGiftWrapperData={setGiftWrapperData}
            giftWrapperData={giftWrapperData}
            setPriceSummaryGiftWrapper={setPriceSummaryGiftWrapper}
            priceSummaryGiftWrapper={priceSummaryGiftWrapper}
            setAllCartGiftWrapper={setAllCartGiftWrapper}
            allCartGiftWrapper={allCartGiftWrapper}
            isChecked={isChecked}
            giftWrapper={giftWrapper}
            allCartGiftData={allCartGiftData}
            allCart={allCart}
            setIsCartUpdating={setIsCartUpdating}
            giftWrap={giftWrap}
            setGiftWrap={setGiftWrap}
            setClearAllCartWrapper={setClearAllCartWrapper}
            clearAllCartWrapper={clearAllCartWrapper}
            removeSpicifieAllItems={removeSpicifieAllItem}
            setRemoveSpicifieAllItem={setRemoveSpicifieAllItem}
            cartDetails={cartDetails}
            cartDetailsRefetch={cartDetailsRefetch}
            cartItems={cartItems}
        />
    </div> : null

    const productListing = ( hasItems && !emptycartLoading && !miniCartLoading) ? (
        <ProductListing
            isCartUpdating={isCartUpdating}
            setIsCartUpdating={setIsCartUpdating}
            openModal={openModal}
            setOpenModel={setOpenModel}
            setGiftWrapperData={setGiftWrapperData}
            giftWrapperData={giftWrapperData}
            setSelectedItem={setSelectedItem}
            selectedItem={selectedItem}
            giftModel={giftModal}
            wrapperStatusPerItem={wrapperStatusPerItem}
            hasItems={hasItems}
            giftWrapperClasses={classes}
            productClasses={productClasses}
            allCartGiftWrapper={allCartGiftWrapper}
            allCart={allCart}
            cartItems={cartItems}
            handleModelOpen={handleModelOpen}
            isChecked={isChecked}
            setIsChecked={setIsChecked}
            setAllCartGiftData={setAllCartGiftData}
            allCartGiftData={allCartGiftData}
            wrapperStatusEnabled={wrapperStatusEnabled}
            setPriceSummaryGiftWrapper={setPriceSummaryGiftWrapper}
            giftWrap={giftWrap}
            setGiftWrap={setGiftWrap}
            setClearAllCartWrapper={setClearAllCartWrapper}
            clearAllCartWrapper={clearAllCartWrapper}
            setRemoveSpicifieAllItem={setRemoveSpicifieAllItem}
            wishlistData={wishlistData}
            emptyCart={emptyCart}
        />
    ) : (
        <div className={searchClasses.noResult}>
            <div className={searchClasses.noResult_cart_page}>
                <div>
                    <h3 className={'ml-2' + ' ' + searchClasses.noResult_text}>
                        <FormattedMessage
                            id={'cartPage.noResult_text'}
                            defaultMessage={'There are no items in your cart.'}
                        />

                    </h3>
                </div>
                <img
                    src="/cenia-static/icons/noItems.png"
                    alt="no items"
                />
            </div>
        </div>
    );

    const priceAdjustments = hasItems ? (
        <PriceAdjustments
            setIsCartUpdating={setIsCartUpdating}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
        />
    ) : null;

    const priceSummary = hasItems ? (
        <PriceSummary
            isUpdating={isCartUpdating}
            rewardPrice={rewardPrice}
            cartDetails={cartDetails}
            rewardPointCalculationLoading={rewardPointCalculationLoading}
            calculation={calculation}
            data={data}
            giftWrapperData={giftWrapperData}
            allCartGiftWrapper={allCartGiftWrapper}
            cartItems={cartItems}
            giftWrap={giftWrap}
            couponCode={couponCode}
            setDiscount={setDiscount}
            modal={modal}
            setModal={setModal}
        />
    ) : null;

    // useEffect(() => {
    //     if (priceSummaryGiftWrapper === true) {
    //         setTimeout(() => {
    //             setPriceSummaryGiftWrapper(false)
    //         }, 4000)
    //     }
    // }, [priceSummaryGiftWrapper])


    return (
        <div className={'container-fluid' + ' ' + defaultClasses.cart_page_container}>
            {(!emptycartLoading && !miniCartLoading) ? <div className="row">
                <div className="col-lg-11 mx-auto">
                    <div className={classes.root}>
                        <Title>{`Cart`}</Title>
                        <div className={classes.heading_container}>
                            <h1 className={classes.heading}>
                                <FormattedMessage
                                    id={'cartPage.heading'}
                                    defaultMessage={'Shopping Bag'}
                                />
                            </h1>
                            {signInDisplay}
                            <div className={classes.stockStatusMessageContainer}>
                                <StockStatusMessage cartItems={cartItems} />
                            </div>
                        </div>
                        <div className={classes.cart_inner}>
                            <div className={classes.body}>
                                <div className={classes.item_container_wrap}>
                                    <div className={classes.items_container}>
                                        {productListing}
                                    </div>
                                    <div
                                        className={classes.price_adjustments_container}
                                    >
                                        {priceAdjustments}
                                    </div>
                                </div>
                                {hasItems && <div className={classes.summary_container}>
                                    <div className={classes.summary_contents}>
                                        {/* {!calculation ? <> */}
                                        {(isSignedIn && hasItems) && <RewardPoints
                                            rewardPrice={rewardPrice}
                                            cartDetails={cartDetails}
                                            rewardCalculation={rewardCalculation}
                                            calculation={calculation}
                                            value={value}
                                            onChange={onChange}
                                            data={data}
                                            isMountedCartPage={isMountedCartPage}
                                        />

                                        }
                                        {isSignedIn && JSON.parse(localStorage.getItem('userDetails'))?.value === 2 && totalQuantity < +localStorage.getItem('b2b-min-quantity') ?
                                            <p className='p-2 text-danger'>Add 50 or more items into the cart to proceed checkout as a business user</p> : null
                                        }
                                        {priceSummary}
                                    </div>
                                </div>}
                            </div>
                        </div>

                    </div>
                </div>
                <div className="col-lg-12 mx-auto">
                    <div className={classes.cartpage_crosssellslider}>
                        {crossSellData && (
                            <CrossSellProducts
                                title="You can also like these products"
                                linkedProducts={crossSellData}
                            />
                        )}
                    </div>
                </div>
            </div> : <LoadingIndicator/> }
        </div>
    );
};

export default CartPage;