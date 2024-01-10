import { useCallback, useContext, useEffect } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { useLazyQuery/* , useQuery */ } from '@apollo/client';
import { globalContext } from '../../../context/global.js';

/**
 * @ignore
 *
 * Flattens query data into a simple object. We create this here rather than
 * having each line summary line component destructure its own data because
 * only the parent "price summary" component knows the data structure.
 *
 * @param {Object} data query data
 */
const flattenData = data => {
    if (!data) return {};
    try {
        return {
            subtotal: data.prices.subtotal_excluding_tax,
            total: data.prices.grand_total,
            discounts: data.prices.discounts,
            giftCards: data.applied_gift_cards,
            taxes: data.prices.applied_taxes,
            shipping: data.shipping_addresses
        };
    } catch (error) {
        console.log('[Error] -> flattenData in usePriceSummary : ', error)
        return {};
    }
};

/**
 * This talon contains logic for a price summary component.
 * It performs effects and returns prop data for rendering the component.
 *
 * This talon performs the following effects:
 *
 * - Log a GraphQL error if it occurs when getting the price summary
 *
 * @function
 *
 * @param {Object} props
 * @param {PriceSummaryQueries} props.queries GraphQL queries for a price summary component.
 *
 * @returns {PriceSummaryTalonProps}
 *
 * @example <caption>Importing into your project</caption>
 * import { usePriceSummary } from '@magento/peregrine/lib/talons/CartPage/PriceSummary/usePriceSummary';
 */
export const usePriceSummary = props => {
    const {
        setIsDeleting,
        // queries: { getCartDetails },
        cartDetails,
        getPaymentInformation
    } = props;

    const { dispatch } = useContext(globalContext);
    const history = useHistory();
    // We don't want to display "Estimated" or the "Proceed" button in checkout.
    const match = useRouteMatch('/checkout');
    const isCheckout = !!match;
    const [paymentInformation] = useLazyQuery(getPaymentInformation
        , {
            fetchPolicy: "cache-and-network",
            nextFetchPolicy: 'cache-first',
            skip: !localStorage.getItem('cart_id') || !cartDetails || cartDetails?.total_quantity === 0,
            variables: { cartId: localStorage.getItem('cart_id') }
        });

    // const [updateCartDetails] = useLazyQuery(GET_CART_DETAILS, {
    //         fetchPolicy: 'cache-and-network',
    //         nextFetchPolicy: 'cache-first',
    //         skip: !localStorage.getItem('cart_id'),
    //         variables: { cartId: localStorage.getItem('cart_id') }
    //     });

    // const { error, loading, data } = useQuery(getCartDetails, {
    //     fetchPolicy: 'cache-and-network',
    //     nextFetchPolicy: 'cache-first',
    //     skip: !localStorage.getItem('cart_id'),
    //     variables: {
    //         cartId: localStorage.getItem('cart_id')
    //     },
    //     onCompleted: data => {
    //         if (data) {
    //             setIsDeleting(true)
    //             const priceDetail = data?.cart?.prices.mp_reward_segments?.reduce((acc, item) => {
    //                 return {
    //                     ...acc,
    //                     [item.code]: item.value
    //                 }
    //             }, {})
    //             if (data.cart && data.cart.prices && data.cart.prices.__typename) {
    //                 dispatch({
    //                     type: 'PRICE_SUMMARY_DETAIL',
    //                     priceSummaryDetail: {
    //                         grandTotal: data.cart.prices.grand_total && data.cart.prices.grand_total.value ? data.cart.prices.grand_total.value : undefined,
    //                         subTotal: data.cart.prices.subtotal_including_tax && data.cart.prices.subtotal_including_tax.value ? data.cart.prices.subtotal_including_tax.value : undefined,
    //                     },
    //                     priceSummaryData: {
    //                         mp_reward_discount: priceDetail?.mp_reward_discount ? priceDetail?.mp_reward_discount :undefined,
    //                         mp_reward_earn: priceDetail?.mp_reward_earn ? priceDetail?.mp_reward_earn :undefined,
    //                         mp_reward_spent:priceDetail?.mp_reward_spent ? priceDetail?.mp_reward_spent :undefined
    //                     }
    //                 });
    //             }
    //         }
    //     }
    // });
    useEffect(() => {
        if (cartDetails) {
            setIsDeleting(true)
            const priceDetail = cartDetails?.prices.mp_reward_segments?.reduce((acc, item) => {
                return {
                    ...acc,
                    [item.code]: item.value
                }
            }, {})
            if (cartDetails && cartDetails.prices && cartDetails.prices.__typename) {
                dispatch({
                    type: 'PRICE_SUMMARY_DETAIL',
                    priceSummaryDetail: {
                        grandTotal: cartDetails?.prices?.grand_total?.value ? Math.floor(cartDetails.prices.grand_total.value) : undefined,
                        subTotal: cartDetails?.prices?.subtotal_excluding_tax?.value ? Math.floor(cartDetails?.prices?.subtotal_excluding_tax?.value) : undefined,
                    },
                    priceSummaryData: {
                        mp_reward_discount: priceDetail?.mp_reward_discount ? priceDetail?.mp_reward_discount : undefined,
                        mp_reward_earn: priceDetail?.mp_reward_earn ? priceDetail?.mp_reward_earn : undefined,
                        mp_reward_spent: priceDetail?.mp_reward_spent ? priceDetail?.mp_reward_spent : undefined
                    }
                });
            }
        }
    }, [])

    useEffect(() => {
        if (isCheckout) {
            paymentInformation()
        }
    }, [isCheckout])

    const handleProceedToCheckout = useCallback(() => {
        history.push('/checkout');
    }, [history]);

    return {
        handleProceedToCheckout,
        // hasError: !!error,
        hasItems: cartDetails && !!cartDetails.items.length,
        isCheckout,
        // isLoading: loading,
        flatData: flattenData(cartDetails)
    };
};

/** JSDocs type definitions */

/**
 * Query data flattened into a simple object.
 *
 * @typedef {Object} FlattenedData
 *
 * @property {String} subtotal Cart subtotal (excluding tax)
 * @property {String} total Cart grand total
 * @property {Array<Object>} discounts Discounts applied to the cart
 * @property {Array<Object>} giftCards Gift cards applied to the cart
 * @property {Array<Object>} taxes Taxes applied to the cart
 * @property {Array<Object>} shipping Shipping addresses associated with this cart
 */

/**
 * GraphQL queries for price summary component.
 *
 * @typedef {Object} PriceSummaryQueries
 *
 * @property {GraphQLAST} getCartDetails Query to get the price summary for a cart
 *
 * @see [priceSummary.js]{@link https://github.com/magento/pwa-studio/blob/develop/packages/venia-ui/lib/components/CartPage/PriceSummary/priceSummary.js}
 * for the queries used in Venia.
 */

/**
 * Props used for rendering a price summary component.
 *
 * @typedef {Object} PriceSummaryTalonProps
 *
 * @property {function} handleProceedToCheckout Callback function which navigates the browser to the checkout
 * @property {boolean} hasError True if a GraphQL query returns an error. False otherwise.
 * @property {boolean} hasItems True if the cart has any items. False otherwise.
 * @property {boolean} isLoading True while the GraphQL query is still in flight. False otherwise.
 * @property {FlattenedData} flatData Query data that has been flattened into a simple object
 *
 */
