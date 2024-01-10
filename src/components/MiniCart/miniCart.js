import React, { Fragment, useEffect, useState, Suspense } from 'react';
import {
    Lock as LockIcon,
    AlertCircle as AlertCircleIcon,
    X as ClearIcon,
    Trash as TrashIcon,
} from 'react-feather';
import { ShoppingCart as ShoppingCartIcon } from 'react-feather';
import { bool, shape, string } from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import MiniCartSkeleton from './miniCartSkeleton'
import { useScrollLock, Price, useToasts } from '@magento/peregrine';
import { useMiniCart } from 'src/peregrine/lib/talons/MiniCart/useMiniCart';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import Button from '../Button';
import Icon from '../Icon';
import StockStatusMessage from '../StockStatusMessage';
import ProductList from './ProductList';
import WishListQuery from '../../queries/getWishlist.graphql';
import defaultClasses from './miniCart.css';
import MiniCartOperations from './miniCart.gql';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { useCartPage } from '../../peregrine/lib/talons/CartPage/useCartPage';
import { GET_CART_DETAILS } from '../CartPage/cartPage.gql';
import { useCrossSellProduct } from '../../peregrine/lib/talons/ProductFullDetail/useProductFullDetail';
import crossSellQuery from '../../queries/getCrossSellProducts.graphql';
import CrossSellProducts from '../CartPage/linkedProducts';
import PriceSummary from '../CartPage/PriceSummary/priceSummary';
import { globalContext } from '../../peregrine/lib/context/global';
import FreeShippingBar from '../FreeShippingBar';
import { Accordion, Section } from '../Accordion';
import { GET_CART_DETAILS_QUERY } from '../SignIn/signIn.gql';
// import EditModal from '../CartPage/ProductListing/EditModal';
import { guestWishlistGetFromLocalStorage } from '../../util/helperFunction';
// import { useLazyQuery, useMutation } from '@apollo/client';
import EMPTY_CART from '../../queries/emptyCart.graphql'
// import GET_PRODUCTS_BY_SKU from '../../queries/getProductsBySku.graphql';
// import { MINI_CART_QUERY } from './miniCart.gql'
// import MyOrderSkelton from '../MyAccount/MyOrderSkeleton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingBag, faShoppingBasket } from '@fortawesome/free-solid-svg-icons';
import { useWishlist } from '../../peregrine/lib/talons/MyAccount/useDashboard';
import { gql } from '@apollo/client';
import DeleteModal from '../DeleteModal';
import EditModal from '../CartPage/ProductListing/EditModal';
import EmptyBag from '../EmptyBag';

// import { GET_CART_DETAILS } from '../CartPage/cartPage.gql';
const clearIcon = <Icon src={ClearIcon} size={24} />;
const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

/**
 * The MiniCart component shows a limited view of the user's cart.
 *
 * @param {Boolean} props.isOpen - Whether or not the MiniCart should be displayed.
 * @param {Function} props.setIsOpen - Function to toggle mini cart
 */
const MiniCart = React.forwardRef((props, ref) => {
    const { isOpen, setIsOpen, setIsCartEmptyFlag } = props;
    const [deleteFlag, setDeleteFlag] = useState(false);
    const [activeEditItem, setActiveEditItem] = useState();
    const [id, setId] = useState();
    const [isCartUpdating, setIsCartUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPriceUpdating, setIsPriceUpdating] = useState(false);
    const [isItemLoadingWhileShippingApplied, setIsItemLoadingWhileShippingApplied] = useState(false)
    // const [proData, setProData] = useState([]);
    const [wishlistData, setWishlistData] = useState([]);
    const [modal, setModal] = useState(false)
    const [{ isSignedIn }] = useUserContext();
    const { formatMessage } = useIntl();
    // Prevent the page from scrolling in the background
    // when the MiniCart is open.
    // useScrollLock(isOpen);

    const talonProps = useMiniCart({
        setIsOpen,
        EMPTY_CART,
        GET_CART_DETAILS,
        setIsCartEmptyFlag,
        setShippingAddressOnCartMutation: SET_SHIPPING_ADDRESS_MUTATION,
        ...MiniCartOperations,
        setIsItemLoadingWhileShippingApplied
    });

    // const cartProp = useCartPage({
    //     queries: {
    //         getCartDetails: GET_CART_DETAILS
    //     }
    // });

    // const { cartItems } = cartProp;

    // useEffect(() => {
    //     if(crossLoading === true) {
    //         setIsPriceUpdating(true)
    //     } else {
    //         setIsPriceUpdating(false)
    //     }
    // }, [crossLoading])
    const talonPropsPriceSummery = useCartPage({
        queries: {
            getCartDetails: GET_CART_DETAILS_QUERY
        }
    });

    const { cartDetails } = talonPropsPriceSummery;

    useEffect(() => {
        if (cartDetails) {
            dispatch({
                type: 'PRICE_SUMMARY_DETAIL',
                priceSummaryDetail: {
                    grandTotal: cartDetails?.prices?.grand_total ? Math.floor(cartDetails?.prices?.grand_total?.value) : undefined,
                    subTotal: cartDetails?.prices?.subtotal_excluding_tax ? cartDetails?.prices?.subtotal_excluding_tax?.value : undefined,
                }
            });
            if (cartDetails?.storecredit_applied?.base_bss_storecredit_amount) {
                dispatch({ type: "STORE_CREDIT", payload: { amount: cartDetails?.storecredit_applied?.base_bss_storecredit_amount } })
            }
        }
    }, [cartDetails])

    const { crossSellData,/*  loading: crossLoading */ } = useCrossSellProduct({
        query: crossSellQuery,
        cartItems: cartDetails && cartDetails.items
    });

    const { state, dispatch } = React.useContext(globalContext);

    const allowGuestCheckout = 1;

    const {
        closeMiniCart,
        // errorMessage,
        handleEditCart,
        handleProceedToCheckout,
        handleRemoveItem,
        loading,
        productList,
        subTotal,
        totalQuantity,
        miniCartData,
        // miniCartLoading,
        // loader,
        emptyCart,
        emptycartLoading,
        emptyCartMessage,
        miniCartRefect = () => { },
    } = talonProps;

    const grandAmount = state && state.priceSummaryDetail && state.priceSummaryDetail.grandTotal ? state.priceSummaryDetail.grandTotal : 0;

    const classes = mergeClasses(defaultClasses, props.classes);
    const rootClass = isOpen ? classes.root_open : classes.root;
    const body = document.querySelector('body')
    const contentsClass = isOpen ? classes.contents_open + ' ' + classes.hidden_modal + ' ' : classes.contents;
    useEffect(() => {
        if (isOpen) {
            body.classList.add('scroll-hidden-cart')
        } else {
            body.classList.remove('scroll-hidden-cart')

        }
    }, [isOpen])
    // const quantityClassName = loading
    //     ? classes.quantity_loading
    //     : classes.quantity;
    // const priceClassName = loading ? classes.price_loading : classes.price;
    const isCartEmpty = !(productList && productList.length);

    const wishlistProps = useWishlist({
        query: WishListQuery
    });

    const { refetch } = wishlistProps;

    // const talonPropss = useCartPage({
    //     queries: {
    //         getCartDetails: GET_CART_DETAILS
    //     }
    // });
    // const {
    //     getCartDetailLoading
    // } = talonPropss;
    // const cartid = miniCartData && miniCartData.cart.id
    // const [cartDetailss, { loading: getCartDetailLoading }] = useLazyQuery(GET_CART_DETAILS, {
    //     fetchPolicy: 'cache-and-network',
    //     nextFetchPolicy: 'cache-first',
    //     skip: !cartid,
    //     variables: { cartid },
    //     onCompleted: (data) => {
    //         setProData(data)
    //     }
    // });
    // useEffect(() => {
    //     if (getCartDetailLoading === true) {
    //         setIsDeleting(true)
    //     } else {
    //         setTimeout(() => {
    //             setIsDeleting(false)
    //         }, 2000)
    //     }
    //    }, [getCartDetailLoading])

    useEffect(() => {
        if (isCartEmpty === false) {
            setIsCartEmptyFlag(false)
        }
    }, [isCartEmpty])

    const isProductStockStatus =
        productList &&
        productList.map(
            stockStauts =>
                stockStauts &&
                stockStauts.product &&
                stockStauts.product.stock_status
        );

    const [, { addToast }] = useToasts();
    useEffect(() => {
        // Let the cart page know it is updating while we're waiting on network data.
        setIsCartUpdating(loading);
    }, [loading]);
    // console.log('errorMessage', errorMessage)
    // useEffect(() => {
    //     if (errorMessage) {
    //         addToast({
    //             type: 'error',

    //             icon: errorIcon,
    //             message: errorMessage,
    //             dismissable: true,
    //             timeout: 7000
    //         });
    //     }
    // }, [addToast, errorMessage]);

    useEffect(() => {
        if (!isOpen && !isSignedIn) {
            const result = guestWishlistGetFromLocalStorage();
            dispatch({
                type: 'WISHLIST_COUNT',
                payload: result && result.length ? result.length : 0
            });
        }
        async function fetchWishlistData() {
            try {
                if (isOpen && isSignedIn) {
                    const result = await refetch();
                    if (result && result.data && result.data.wishlist && result.data.wishlist.items && result.data.wishlist.items.length) {
                        const resultWishlistProduct = result.data.wishlist.items.map(item => item.product)
                        setWishlistData(resultWishlistProduct)
                    } else {
                        setWishlistData([])
                    }
                } else if (isOpen && !isSignedIn) {
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
    }, [isOpen]);

    const stockStatusOutOfStock = productList?.filter(item => item?.configured_variant?.stock_status === "OUT_OF_STOCK")?.length !== 0
    const stockStatusOutOfStockSimpleProduct = productList?.filter(item => item?.product?.stock_status === "OUT_OF_STOCK")?.length !== 0

    const header = subTotal ? (
        <Fragment>
            <Accordion>
                <Section
                    id="spend_your_points"
                    title={
                        <div className={classes.grand_total_wrapper}>
                            <span>
                                {formatMessage({
                                    id: 'checkoutPage.grandTotal',
                                    defaultMessage: 'Total'
                                })}
                            </span>
                            <span>
                                <Price
                                    value={grandAmount}
                                    currencyCode={'INR'}
                                />
                            </span>
                        </div>
                    }
                >

                    <PriceSummary
                        couponCode={state?.coupon_code?.coupon_code}
                        isFromMiniCart={true}
                        state={state}
                        minicartTotal={subTotal && subTotal.value}
                        cartDetails={cartDetails}
                        giftWrapperData={
                            JSON.parse(localStorage.getItem('giftWrapper')) ||
                            []
                        }
                        allCartGiftWrapper={
                            JSON.parse(
                                localStorage.getItem('allCartGiftWrapper')
                            ) || ''
                        }
                        giftWrap={JSON.parse(
                            localStorage.getItem('wrapperRadioButtonValue')
                        ) || ''}
                        setIsDeleting={setIsDeleting}
                        message={emptyCartMessage && emptyCartMessage.emptyCartAllItems && emptyCartMessage.emptyCartAllItems.success_message}
                        modal={modal}
                        setModal={setModal}
                    />
                </Section>
            </Accordion>
        </Fragment>
    ) : null;

    const handleLoginTrigger = () => {
        document.getElementById('user_account').click();
    };

    const checkoutPageTrigger = () => {
        if (isSignedIn) {
            handleProceedToCheckout();
        } else {
            {
                if (typeof allowGuestCheckout != 'undefined') {
                    allowGuestCheckout == 1
                        ? handleProceedToCheckout()
                        : handleLoginTrigger();
                } else {
                    handleProceedToCheckout();
                }
            }
        }
    };


    const disableClass = loading || emptycartLoading || isPriceUpdating || isItemLoadingWhileShippingApplied ? classes.root_disabled : "";
    // const { loading: dataLoader, error, data } = useQuery(GET_PRODUCTS_BY_SKU, {
    //     variables: { skus }
    // });

    useEffect(() => {
        if (emptyCartMessage && emptyCartMessage.emptyCartAllItems && emptyCartMessage.emptyCartAllItems.success_message) {
            addToast({
                type: 'info',
                message:
                    emptyCartMessage.emptyCartAllItems.success_message,
                dismissable: true,
                timeout: 5000
            });
            // cartDetailss()
            miniCartRefect()

        }
    }, [emptyCartMessage])

    const handleEmptyCart = () => {
        setDeleteFlag(true)
        // if (miniCartData.cart.id) {
        //     emptyCart({ variables: { cartId: miniCartData.cart.id } })
        // }
    }
    const handleEmptyCartDelete = (id) => {
        setDeleteFlag(false)
        if (miniCartData.cart.id) {
            emptyCart({ variables: { cartId: id } })
        }
    }

    const contents = ((productList && productList.length <= 0 && !loading) || (!productList && !loading)) ? (
        <div className={classes.emptyCart + ' ' + classes.body}>
            <div className={classes.header + ' ' + classes.minicarT_header}>
                <span>
                    <FormattedMessage
                        id={'minicart.myCart'}
                        defaultMessage={'My Bag'}
                    />
                    <span><FontAwesomeIcon style={{ minHeight: '24px', marginLeft: '8px' }} icon={faShoppingBag} /></span>
                </span>
                <button onClick={closeMiniCart}>{clearIcon}</button>
            </div>
            <div className={classes.emptyMessage}>
                <div className={classes.no_cart_items}>


                    <img
                        className={classes.popupbtn_img}
                        src="/cenia-static/icons/noItems.png"
                        alt="no items"
                        width="100"
                        height="100"
                    />
                    <div>
                        <FormattedMessage
                            id={'miniCart.emptyMessage'}
                            defaultMessage={'There are no items in your cart.'}
                        />
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <Fragment>
            <div className={classes.header + ' ' + classes.minicarT_header}>
                <span>
                    {' '}
                    <FormattedMessage
                        id={'minicart.myCart'}
                        defaultMessage={'My Bag'}
                    />
                    <span><FontAwesomeIcon style={{ minHeight: '24px', marginLeft: '8px' }} icon={faShoppingBag} /></span>
                </span>

                <button onClick={closeMiniCart}>{clearIcon}</button>
            </div>
            {
                // getCartDetailLoading
                // isDeleting
                <>
                    <FreeShippingBar
                        miniCartData={miniCartData}
                        minicartTotal={subTotal && subTotal.value}
                    />
                    <div className={classes.stockStatusMessageContainer}>
                        <StockStatusMessage cartItems={productList} />
                    </div>
                    <div className={classes.emptycardButton}>
                        <div className={classes.totalItemCountWrapper}>
                            <span style={{ fontWeight: '600' }}> {totalQuantity}</span>
                            {formatMessage({
                                id: 'minicart.Items',
                                defaultMessage: ' Items'
                            })}
                        </div>
                        <EmptyBag
                            handleEmptyCart={handleEmptyCart}
                            classes={classes}
                            loading={loading}
                            emptycartLoading={emptycartLoading}
                            isPriceUpdating={isPriceUpdating}
                            isItemLoadingWhileShippingApplied={isItemLoadingWhileShippingApplied}
                        />
                    </div>

                    <div className={classes.body + ' ' + disableClass}>
                        <ProductList
                            items={productList}
                            loading={loading}
                            handleRemoveItem={handleRemoveItem}
                            closeMiniCart={closeMiniCart}
                            setIsOpen={setIsOpen}
                            setActiveEditItem={setActiveEditItem}
                            activeEditItem={activeEditItem}
                            setIsCartUpdating={setIsCartUpdating}
                            setId={setId}
                            setIsPriceUpdating={setIsPriceUpdating}
                            miniCartRefect={miniCartRefect}
                            wishlistData={wishlistData}
                            setIsItemLoadingWhileShippingApplied={setIsItemLoadingWhileShippingApplied}
                        // cartDetails={cartDetails}
                        />
                        {/* {crossSellData   && (
                                <CrossSellProducts
                                    title="You can also like these products"
                                    linkedProducts={crossSellData}
                                    isOpen={isOpen}
                                    closeMiniCart={closeMiniCart}
                                />
                            )} */}
                        {
                            crossSellData && productList && productList.length >= 0
                                ? <span className={classes.minicart_slider}>
                                    <CrossSellProducts
                                        title="You can also like these products"
                                        linkedProducts={crossSellData}
                                        isOpen={isOpen}
                                        closeMiniCart={closeMiniCart}
                                    />
                                </span>
                                : <></>
                        }
                    </div>
                    <div className={classes.header}>{header}</div>
                    <div className={classes.footer}>
                        <Button
                            onClick={handleEditCart}
                            priority="high"
                            className={classes.editCartButton}
                            disabled={loading || emptycartLoading || isPriceUpdating || isItemLoadingWhileShippingApplied}
                        >
                            <span><FontAwesomeIcon style={{ margin: '1px 0px 0px', marginLeft: '0px', minHeight: '16px' }} icon={faShoppingBag} /></span>

                            <FormattedMessage
                                id={'miniCart.editCartButton'}
                                defaultMessage={'Shopping Bag'}
                            />
                        </Button>
                        <Button
                            onClick={checkoutPageTrigger}
                            priority="high"
                            className={classes.checkoutButton + ' ' + classes.miniCart_btn_checkout}
                            disabled={
                                loading ||
                                isCartEmpty ||
                                isProductStockStatus === 'IN_STOCK' ||
                                stockStatusOutOfStock ||
                                stockStatusOutOfStockSimpleProduct || isItemLoadingWhileShippingApplied || isPriceUpdating || emptycartLoading
                                || stockStatusOutOfStockSimpleProduct || isItemLoadingWhileShippingApplied || isPriceUpdating || emptycartLoading
                                || (isSignedIn && JSON.parse(localStorage.getItem('userDetails'))?.value === 2 && totalQuantity < +localStorage.getItem('b2b-min-quantity'))
                            }
                        >
                            <Icon
                                size={16}
                                src={ShoppingCartIcon}
                                classes={{ icon: classes.checkoutIcon }}
                            />
                            <FormattedMessage
                                id={'miniCart.CHECKOUT'}
                                defaultMessage={'CHECKOUT'}
                            />
                        </Button>
                    </div>

                </>
            }
            {deleteFlag &&
                <DeleteModal
                    categoryFlag={deleteFlag}
                    setCategoryFlag={setDeleteFlag}
                    id={miniCartData.cart.id}
                    handleDeleteItem={handleEmptyCartDelete}
                    type="minicart"
                />}
        </Fragment>
    );
    // Prevent the page from scrolling in the background

    return (
        <>
            <aside className={rootClass}>
                <div ref={ref} className={contentsClass} >
                    {contents}
                </div>
            </aside>

            <Suspense fallback={null}>
                {activeEditItem &&
                    <EditModal
                        item={activeEditItem}
                        setIsCartUpdating={setIsCartUpdating}
                    />}
            </Suspense>
        </>
    );
});

export default MiniCart;

MiniCart.propTypes = {
    classes: shape({
        root: string,
        root_open: string,
        contents: string,
        contents_open: string,
        header: string,
        body: string,
        footer: string,
        checkoutButton: string,
        editCartButton: string,
        emptyCart: string,
        emptyMessage: string,
        stockStatusMessageContainer: string
    }),
    isOpen: bool
};

export const SET_SHIPPING_ADDRESS_MUTATION = gql`
    mutation setShippingAddress(
        $cartId: String!
        $firstname: String!
        $lastname: String!
        $street: [String]!
        $city: String!
        $country_id: String!
        $region_code: String!
        $postcode: String!
        $telephone: String!
    ) {
        setShippingAddressesOnCart(
            input: {
                cart_id: $cartId
                shipping_addresses: [
                    {
                        address: {
                            firstname: $firstname
                            lastname: $lastname
                            street: $street
                            city: $city
                            region: $region_code
                            postcode: $postcode
                            telephone: $telephone
                            country_code: $country_id
                            save_in_address_book: false
                        }
                    }
                ]
            }
        ) @connection(key: "setShippingAddressesOnCart") {
            cart {
                id
                shipping_addresses {
                    available_shipping_methods {
                        carrier_code
                        carrier_title
                        method_code
                        method_title
                    }
                }
            }
        }
    }
`;
