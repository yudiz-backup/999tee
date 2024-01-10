import { useCallback, useEffect, useState } from 'react';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { clearCartDataFromCache } from '@magento/peregrine/lib/Apollo/clearCartDataFromCache';
import { useCartContext } from '@magento/peregrine/lib/context/cart';
import Paypal_Token from '../../../../queries/createPaypalExpressToken.graphql';

export const CHECKOUT_STEP = {
    SHIPPING_ADDRESS: 1,
    SHIPPING_METHOD: 2,
    PAYMENT: 3,
    REVIEW: 4
};

export const usePaypal = () => {
    const hostOrigin = window.location.origin;
    // const [{ cartId }] = useCartContext();

    const [createToken, { data }] = useMutation(Paypal_Token);

    const handleCreateToken = useCallback(async () => {
        try {
            await createToken({
                variables: {
                    cart_id: localStorage.getItem('cart_id'),
                    return_url: hostOrigin + '/paypal-review',
                    cancel_url: hostOrigin + '/checkout'
                }
            });
        } catch (err) {
            console.log(err);
        }
    }, [localStorage.getItem('cart_id'), createToken, hostOrigin]);

    return {
        handleCreateToken,
        tokenResponse: data && data.createPaypalExpressToken
    };
};

export const useSetPaymentMethod = props => {
    const { mutation } = props;
    // const [{ cartId }] = useCartContext();
    const [setPayMethod, { data }] = useMutation(mutation);

    const [inProgress, setInProgress] = useState(false);
    const handleSetPaymentMethod = useCallback(
        async ({ payment_method, payer_id, token }) => {
            setInProgress(true);
            await setPayMethod({
                variables: { cart_id: localStorage.getItem('cart_id'), payment_method, payer_id, token }
            });
            setInProgress(false);
        },
        [localStorage.getItem('cart_id'), setPayMethod]
    );
    return {
        handleSetPaymentMethod,
        inProgress,
        paymentMethodResponse:
            data &&
            data.setPaymentMethodOnCart &&
            data.setPaymentMethodOnCart.cart &&
            data.setPaymentMethodOnCart.cart.selected_payment_method &&
            data.setPaymentMethodOnCart.cart.selected_payment_method.code
    };
};
export const usePaypalCheckout = props => {
    const {
        mutations: { createCartMutation, placeOrderMutation },
        queries: { getOrderDetailsQuery }
    } = props;
    const [/* { cartId }, */ { createCart, removeCart }] = useCartContext();

    const apolloClient = useApolloClient();
    const [fetchCartId] = useMutation(createCartMutation);
    const [
        placeOrder,
        { data: placeOrderData, called: placeOrderCalled }
    ] = useMutation(placeOrderMutation);
    const { data: orderDetailsData, loading: orderDetailsLoading } = useQuery(
        getOrderDetailsQuery,
        {
            // We use this query to fetch details _just_ before submission, so we
            // want to make sure it is fresh. We also don't want to cache this data
            // because it may contain PII.
            variables: { cartId: localStorage.getItem('cart_id') },
            fetchPolicy: 'no-cache'
        }
    );

    const handlePlaceOrder = () => {
        // Fetch order details and then use an effect to actually place the
        // order. If/when Apollo returns promises for invokers from useLazyQuery
        // we can just await this function and then perform the rest of order
        // placement.
    };

    useEffect(() => {
        async function placeOrderAndCleanup() {
            try {
                await placeOrder({
                    variables: {
                        cartId: localStorage.getItem('cart_id')
                    }
                });

                // Cleanup stale cart and customer info.
                await removeCart();
                await clearCartDataFromCache(apolloClient);

                await createCart({
                    fetchCartId
                });
            } catch (err) {
                console.error(
                    'An error occurred during when placing the order',
                    err
                );
                setReviewOrderButtonClicked(false);
                setCheckoutStep(CHECKOUT_STEP.PAYMENT);
            }
        }

        if (orderDetailsData && !placeOrderCalled) {
            placeOrderAndCleanup();
        }
    }, [
        apolloClient,
        localStorage.getItem('cart_id'),
        createCart,
        fetchCartId,
        orderDetailsData,
        placeOrder,
        placeOrderCalled,
        removeCart
    ]);

    return {
        handlePlaceOrder,
        orderDetailsData,
        orderDetailsLoading,
        orderNumber:
            (placeOrderData && placeOrderData.placeOrder.order.order_number) ||
            null
    };
};
