import { useCallback, useEffect, useMemo, useState, useContext } from 'react';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';

import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useUserContext } from '@magento/peregrine/lib/context/user';
// import { useCartContext } from '@magento/peregrine/lib/context/cart';
import { globalContext } from '../../context/global.js';
// import { result } from 'lodash';
import { SET_SHIPPING_METHOD_MUTATION } from '../../../../components/CartPage/PriceAdjustments/ShippingMethods/shippingRadios.js';

/**
 * This talon contains logic for a cart page component.
 * It performs effects and returns prop data for rendering the component.
 *
 * This talon performs the following effects:
 *
 * - Manages the updating state of the cart while cart details data is being fetched
 *
 * @function
 *
 * @param {Object} props
 * @param {CartPageQueries} props.queries GraphQL queries
 *
 * @returns {CartPageTalonProps}
 *
 * @example <caption>Importing into your project</caption>
 * import { useCartPage } from '@magento/peregrine/lib/talons/CartPage/useCartPage';
 */
export const useCartPage = props => {
    const {
        queries: { getCartDetails }
    } = props;

    const [, { toggleDrawer }] = useAppContext();
    const [{ isSignedIn }] = useUserContext();
    // const [{ cartId }] = useCartContext();
    const { dispatch } = useContext(globalContext);

    const [isCartUpdating, setIsCartUpdating] = useState(false);

    const { called, data, loading, refetch } = useQuery(getCartDetails, {
        fetchPolicy: 'no-network',
        // nextFetchPolicy: 'cache-first',
        skip: !localStorage.getItem('cart_id'),
        variables: { cartId: localStorage.getItem('cart_id') }
    });

    const [
        setShippingMethod,
    ] = useMutation(SET_SHIPPING_METHOD_MUTATION, {
        // onCompleted: () => {
        //     miniCartRefect()
        // }
    });

    const [updateCartDetails] = useLazyQuery(getCartDetails, {
        fetchPolicy: 'no-cache',
        // nextFetchPolicy: 'cache-first',
        skip: !localStorage.getItem('cart_id'),
        variables: { cartId: localStorage.getItem('cart_id') },
        onCompleted: (data) => {
            dispatch({
                type: 'PRICE_SUMMARY_DETAIL',
                priceSummaryDetail: {
                    grandTotal: data.cart.prices.grand_total.value ? Math.floor(data?.cart?.prices?.grand_total?.value) : undefined,
                    // subTotal: priceDetail.subtotal ? priceDetail.subtotal : undefined
                }
            },
            )
            dispatch({ type: "STORE_CREDIT", payload: { amount: data?.cart?.storecredit_applied?.base_bss_storecredit_amount } })
        }
    });


    /* const [runQuery, { data, loading }] = useLazyQuery(getSocAccountDataQuery, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        skip: !isSignedIn || !isEnabled
      }); */

    // const [runGetCartDetails, { called, data, loading }] = useLazyQuery(getCartDetails, {
    //     fetchPolicy: 'network-only',
    //     // nextFetchPolicy: 'cache-first',
    //     skip: !localStorage.getItem('cart_id'),
    //     variables: { cartId: localStorage.getItem('cart_id') }
    // });

    // useEffect(()=>{
    //     runGetCartDetails()
    // },[localStorage.getItem('cart_id'),miniCartData?.cart?.total_quantity])

    const cartDetails = data && data.cart
    const handleSignIn = useCallback(() => {
        // TODO: set navigation state to "SIGN_IN". useNavigation:showSignIn doesn't work.
        toggleDrawer('nav');
    }, [toggleDrawer]);

    useEffect(() => {
        if (data && data.cart && data.cart.prices && data.cart.prices) {
            dispatch({
                type: 'PRICE_SUMMARY_DETAIL',
                priceSummaryDetail: {
                    grandTotal: data?.cart?.prices?.grand_total?.value ? Math.floor(data?.cart?.prices?.grand_total?.value) : undefined,
                    subTotal: data?.cart?.prices?.subtotal_excluding_tax?.value ? data?.cart?.prices?.subtotal_excluding_tax?.value : undefined
                }
            });
        }
        if (data?.cart?.shipping_addresses?.length > 0) {
            if (data.cart.shipping_addresses[0].selected_shipping_method !== null) {
                if (data.cart.shipping_addresses[0].selected_shipping_method.carrier_code !== data?.cart.shipping_addresses[0]?.available_shipping_methods[0]?.carrier_code) {
                    setShippingMethod({
                        variables: {
                            cartId: localStorage.getItem('cart_id'),
                            shippingMethod: {
                                carrier_code: data.cart.shipping_addresses[0].available_shipping_methods[0].carrier_code,
                                method_code: data.cart.shipping_addresses[0].available_shipping_methods[0].method_code
                            }
                        }
                    });
                }
            }
            else if ((data?.cart?.shipping_addresses[0]?.selected_shipping_method === null && data?.cart.shipping_addresses[0]?.available_shipping_methods?.length > 0)) {
                setShippingMethod({
                    variables: {
                        cartId: localStorage.getItem('cart_id'),
                        shippingMethod: {
                            carrier_code: data.cart.shipping_addresses[0].available_shipping_methods[0].carrier_code,
                            method_code: data.cart.shipping_addresses[0].available_shipping_methods[0].method_code
                        }
                    }
                });
            }
        }
    }, [data?.cart?.items?.length])

    useEffect(() => {
        // Let the cart page know it is updating while we're waiting on network data.
        setIsCartUpdating(loading);
    }, [loading]);

    // useEffect(() => {
    //     runGetCartDetails()
    // },[] )

    const hasItems = !!(data && data.cart.total_quantity);
    const shouldShowLoadingIndicator = called && loading && !hasItems;

    const cartItems = useMemo(() => {
        return (data && data.cart.items) || [];
    }, [data]);

    return {
        cartItems,
        hasItems,
        handleSignIn,
        isSignedIn,
        isCartUpdating,
        setIsCartUpdating,
        shouldShowLoadingIndicator,
        cartDetails,
        loading,
        refetch,
        updateCartDetails
    };
};

/** JSDoc type definitions */

/**
 * GraphQL formatted string queries used in this talon.
 *
 * @typedef {Object} CartPageQueries
 *
 * @property {GraphQLAST} getCartDetails Query for getting the cart details.
 *
 * @see [cartPage.gql.js]{@link https://github.com/magento/pwa-studio/blob/develop/packages/venia-ui/lib/components/CartPage/cartPage.gql.js}
 * for queries used in Venia
 */

/**
 * Props data to use when rendering a cart page component.
 *
 * @typedef {Object} CartPageTalonProps
 *
 * @property {Array<Object>} cartItems An array of item objects in the cart.
 * @property {boolean} hasItems True if the cart has items. False otherwise.
 * @property {function} handleSignIn Callback function to call for handling a sign in event.
 * @property {boolean} isSignedIn True if the current user is signed in. False otherwise.
 * @property {boolean} isCartUpdating True if the cart is updating. False otherwise.
 * @property {function} setIsCartUpdating Callback function for setting the updating state of the cart page.
 * @property {boolean} shouldShowLoadingIndicator True if the loading indicator should be rendered. False otherwise.
 */
