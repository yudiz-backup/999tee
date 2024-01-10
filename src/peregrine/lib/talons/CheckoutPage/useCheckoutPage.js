import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    useApolloClient,
    useLazyQuery,
    useMutation,
    useQuery
} from '@apollo/client';

import { clearCartDataFromCache } from '@magento/peregrine/lib/Apollo/clearCartDataFromCache';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { useCartContext } from '@magento/peregrine/lib/context/cart';
import CheckoutError from './CheckoutError';
import { retrieveCartId } from '@magento/peregrine/lib/store/actions/cart';
// import {
//     paymentCodeWithPaymentMode,
//     onlinePaymentMode
// } from '../../../../util/constant';
import { useHistory } from 'react-router-dom';
// import ONLINE_PAYMENT from '../../../../queries/payupayment.graphql';
import getUseStripeSdkUrl from '../../../../queries/stripe/getUseStripeSdkUrl.graphql'
import placeRazorpayOrder from '../../../../queries/razorpay/placeRazorpayOrder.graphql'
import setRzpPaymentDetailsForOrder from '../../../../queries/razorpay/setRzpPaymentDetailsForOrder.graphql'
export const CHECKOUT_STEP = {
    SHIPPING_ADDRESS: 1,
    SHIPPING_METHOD: 2,
    PAYMENT: 3,
    REVIEW: 4
};
import { useToasts } from '@magento/peregrine';
import { displayRazorpay } from '../../../../util/razorPay';

export const useCheckoutPage = props => {
    const history = useHistory();
    const [, { addToast }] = useToasts();
    const [paymentMode, setPaymentMode] = useState('');
    const {
        mutations: { createCartMutation, placeOrderMutation },
        queries: {
            getCheckoutDetailsQuery,
            getCustomerQuery,
            getOrderDetailsQuery
        },
        setAddStripePaymentLoading,
        setSetStripePaymentLoading,
        selectedPaymentMethod
    } = props;

    const [reviewOrderButtonClicked, setReviewOrderButtonClicked] = useState(
        false
    );

    const apolloClient = useApolloClient();
    const [isUpdating, setIsUpdating] = useState(false);
    const [isWantToCallPlaceOrderAPI, setIsWantToCallPlaceOrderAPI] = useState(false);
    const [placedOrderNumber, setPlacedOrderNumber] = useState(null);
    // const [stripeSdkUrl, setStripeSdkUrl] = useState(null);
    const [activeContent, setActiveContent] = useState('checkout');
    const [loading, setLoading] = useState(false);
    const [razorPayOrderDetail, setRazonPayOrderDetail] = useState()
    const [razoerPaymnetDetail, setRazoerPaymentDetail] = useState()
    const [modalClosed, setModalClosed] = useState(false)
    const [checkoutStep, setCheckoutStep] = useState(
        CHECKOUT_STEP.SHIPPING_ADDRESS
    );
    const [, { toggleDrawer }] = useAppContext();
    const [{ isSignedIn }] = useUserContext();
    const [, { createCart, removeCart }
    ] = useCartContext();
    const cartId = localStorage.getItem('cart_id');

    // const [payUMoneyPayment, { loading: onlinePaymentLoading }] = useLazyQuery(ONLINE_PAYMENT, {
    //     variables: {
    //         order_id: placedOrderNumber
    //     },
    //     skip: !placedOrderNumber,
    //     fetchPolicy: 'no-cache',
    //     onCompleted: data => {
    //         // setPlacedOrderNumber(null)   
    //         if (data && paymentMode === 'payu') {
    //             history.push('/payment-form', data?.payUPayment);
    //         }
    //     }
    // });

    // useEffect(() => {
    //     if (paymentMode === 'payu') {
    //         payUMoneyPayment()
    //     }
    // }, [paymentMode])
    const [fetchCartId] = useMutation(createCartMutation);

    const [confirmStirpePayment, { loading: confirmStirpePaymentLoading, data: confirmStirpePaymentInfo }] = useLazyQuery(getUseStripeSdkUrl, {
        fetchPolicy: 'network-only',
        onCompleted: data => {
            try {
                setLoading(true)
                if (data?.getUseStripeSdkUrl) {
                    setAddStripePaymentLoading(false)
                    setSetStripePaymentLoading(false)
                    window.location.assign(data?.getUseStripeSdkUrl)
                } else {
                    history.push('/payment/failure/')
                }
            } catch (error) {
                setLoading(false)
                return addToast({
                    type: 'error',
                    message: error.message,
                    dismissable: true,
                    timeout: 5000
                });
            }
        },
        onError: error => {
            error.graphQLErrors.map(error => {
                addToast({
                    type: 'error',
                    message: error.message,
                    dismissable: true,
                    timeout: 5000
                });
            });
        }
    })

    useEffect(() => {
        return () => {
            setLoading(false)
        }
    }, [])

    const [razorpayOrder, { loading: razorpayOrderLoading }] = useMutation(placeRazorpayOrder, {
        onCompleted: (data) => {
            displayRazorpay(
                {
                    amount: data?.placeRazorpayOrder?.amount,
                    name: razorPayOrderDetail?.cart?.shipping_addresses?.[0]?.firstname,
                    currency: data?.placeRazorpayOrder?.currency,
                    rzpOrderId: data?.placeRazorpayOrder?.rzp_order_id,
                    email: razorPayOrderDetail?.cart?.email,
                    address: razorPayOrderDetail?.cart?.shipping_addresses,
                    referrer: `${process.env.MAGENTO_BACKEND_URL}cart`,
                    setRazoerPaymentDetail,
                    setModalClosed
                }
            )
        }
    })

    const [paymentDetailForOrder, { loading: paymentDetailForOrderLoading }] = useMutation(setRzpPaymentDetailsForOrder, {
        onCompleted: async (data) => {
            await removeCart()
            await clearCartDataFromCache(apolloClient);

            await createCart({
                fetchCartId
            });
            const newCartId = await retrieveCartId();
            localStorage.setItem('cart_id', newCartId);
            history.push(
                `/order/success/${data?.setRzpPaymentDetailsForOrder?.order?.order_id}`
            )
        }
    })

    useEffect(() => {
        async function createCartId() {
            await removeCart()
            await createCart({
                fetchCartId
            });
            const newCartId = await retrieveCartId();
            localStorage.setItem('cart_id', newCartId);
            history.push("/")
        }
        if (modalClosed) {
            createCartId();
        }
    }, [modalClosed, apolloClient, createCart, fetchCartId, removeCart])

    useEffect(() => {
        if (razoerPaymnetDetail) {
            paymentDetailForOrder({
                variables: {
                    order_id: placedOrderNumber,
                    rzp_payment_id: razoerPaymnetDetail?.razorpayPaymentId,
                    rzp_signature: razoerPaymnetDetail?.razorpaySignature
                }
            })
        }
    }, [razoerPaymnetDetail])

    const [
        placeOrder,
        {
            data: placeOrderData,
            error: placeOrderError,
            loading: placeOrderLoading,
            called: placeOrderCalled,
        }
    ] = useMutation(placeOrderMutation, {
        onCompleted: data => {
            if (data &&
                (paymentMode === 'stripe_payments_checkout' ||
                    paymentMode === 'stripe_payments')) {
                setPlacedOrderNumber(data.placeOrder.order.order_number)
                confirmStirpePayment({
                    variables: {
                        order_id: data?.placeOrder?.order?.order_number
                    }
                })
            } else if (!(paymentMode === 'stripe_payments_checkout' ||
                paymentMode === 'stripe_payments' ||
                paymentMode === 'razorpay')) {
                history.push(
                    `/order/success/${data?.placeOrder?.order?.order_number}`,
                    // data?.payUPayment
                );
            } else if (paymentMode === "razorpay") {
                const order_id = data?.placeOrder?.order?.order_number
                setPlacedOrderNumber(order_id)
                razorpayOrder({
                    variables: {
                        order_id: order_id,
                        referrer: `${process.env.MAGENTO_BACKEND_URL}/cart`,
                    }
                })
            } else {
                history.push('/checkout')
            }
        },
        onError: (error) => {
            history.push('/checkout')
            error.graphQLErrors.map(error => {
                addToast({
                    type: 'error',
                    message: error.message,
                    dismissable: true,
                    timeout: 5000
                });
            });
        }
    });

    const { data: orderDetailsData, loading: orderDetailsLoading } = useQuery(getOrderDetailsQuery, {
        // We use this query to fetch details _just_ before submission, so we
        // want to make sure it is fresh. We also don't want to cache this data
        // because it may contain PII.
        variables: {
            cartId
        },
        fetchPolicy: 'no-cache',
        skip: !isWantToCallPlaceOrderAPI,
        onCompleted: data => {
            setIsWantToCallPlaceOrderAPI(false)
            if (
                data &&
                data.cart &&
                data.cart.selected_payment_method &&
                data.cart.selected_payment_method.code
            ) {
                if (data.cart.selected_payment_method.code === 'payu' ||
                    data.cart.selected_payment_method.code === 'stripe_payments_checkout' ||
                    data.cart.selected_payment_method.code === 'stripe_payments' ||
                    data.cart.selected_payment_method.code === 'razorpay') {
                    setPaymentMode(data.cart.selected_payment_method.code);
                    setRazonPayOrderDetail(data)
                    //  history.push('/payment-form')
                }
            } else {
                // offline payment method
            }
        },
        onError: () => {
            // offline payment method
        }
    });

    const { data: customerData, loading: customerLoading } = useQuery(
        getCustomerQuery,
        { skip: !isSignedIn }
    );

    const {
        data: checkoutData,
        networkStatus: checkoutQueryNetworkStatus
    } = useQuery(getCheckoutDetailsQuery, {
        /**
         * Skip fetching checkout details if the `cartId`
         * is a falsy value.
         */
        skip: !cartId,
        notifyOnNetworkStatusChange: true,
        variables: {
            cartId
        }
    });

    const cartItems = useMemo(() => {
        return (checkoutData && checkoutData.cart.items) || [];
    }, [checkoutData]);

    /**
     * For more info about network statues check this out
     *
     * https://www.apollographql.com/docs/react/data/queries/#inspecting-loading-states
     */
    const isLoading = useMemo(() => {
        const checkoutQueryInFlight = checkoutQueryNetworkStatus
            ? checkoutQueryNetworkStatus < 7
            : true;

        return checkoutQueryInFlight || customerLoading;
    }, [checkoutQueryNetworkStatus, customerLoading]);

    const customer = customerData && customerData.customer;

    const toggleActiveContent = useCallback(() => {
        const nextContentState =
            activeContent === 'checkout' ? 'addressBook' : 'checkout';
        setActiveContent(nextContentState);
    }, [activeContent]);

    const checkoutError = useMemo(() => {
        if (placeOrderError) {
            setAddStripePaymentLoading(false)
            return new CheckoutError(placeOrderError);
        }
    }, [placeOrderError]);

    const handleSignIn = useCallback(() => {
        // TODO: set navigation state to "SIGN_IN". useNavigation:showSignIn doesn't work.
        toggleDrawer('nav');
    }, [toggleDrawer]);

    const handleReviewOrder = useCallback(() => {
        setReviewOrderButtonClicked(true);
    }, []);

    const resetReviewOrderButtonClicked = useCallback(() => {
        setReviewOrderButtonClicked(false);
    }, [setReviewOrderButtonClicked]);

    // const handlePlaceOrder = useCallback(async () => {
    //     // Fetch order details and then use an effect to actually place the
    //     // order. If/when Apollo returns promises for invokers from useLazyQuery
    //     // we can just await this function and then perform the rest of order
    //     // placement.
    //     console.log('check 3');
    //     getOrderDetails({
    //         variables: {
    //             cartId
    //         }
    //     });
    //     console.log('check 5');
    // }, [cartId, getOrderDetails]);

    const handlePlaceOrder = async () => {
        setIsWantToCallPlaceOrderAPI(true)
        // await getOrderDetails({
        //     variables: {
        //         cartId
        //     }
        // });
    };

    useEffect(() => {
        if ((paymentMode === 'stripe_payments_checkout' ||
            paymentMode === 'stripe_payments')) {
            placeOrder({
                variables: {
                    cartId
                }
            })
        }
    }, [paymentMode])

    // useEffect(() => {
    //     async function cleanupApi() {
    //         await removeCart();
    //         await clearCartDataFromCache(apolloClient);

    //         await createCart({
    //             fetchCartId
    //         });
    //         const newCartId = await retrieveCartId();
    //         localStorage.setItem('cart_id', newCartId);
    //         setPlacedOrderNumber(null)
    //     }
    //     if (placedOrderNumber &&
    //         !(paymentMode === 'stripe_payments_checkout' ||
    //             paymentMode === 'stripe_payments')) {
    //         cleanupApi()
    //     }
    // }, [placedOrderNumber, paymentMode])


    // useEffect(async()=>{
    //      if(!placedOrderNumber && placeOrderData){
    //             await removeCart();
    //             await clearCartDataFromCache(apolloClient);

    //             await createCart({
    //                 fetchCartId
    //             });
    //             const newCartId = await retrieveCartId();
    //             localStorage.setItem('cart_id', newCartId);
    //         }
    // },[placeOrderData,placedOrderNumber])

    useEffect(() => {
        async function placeOrderAndCleanup() {
            try {
                await placeOrder({
                    variables: {
                        cartId
                    }
                });

            } catch (err) {
                console.error(
                    'An error occurred during when placing the order',
                    err
                );
            }
        }

        if (orderDetailsData?.cart?.selected_payment_method?.code === 'razorpay') {
            // if (orderDetailsData && !placeOrderCalled) {
            placeOrderAndCleanup();
        }
    }, [
        cartId,
        orderDetailsData,
        placeOrder,
        paymentMode,
        placeOrderCalled
        // 
    ]);



    useEffect(() => {
        async function placeOrderAndCleanup() {
            try {
                await placeOrder({
                    variables: {
                        cartId
                    }
                });
                if (!placedOrderNumber) {
                    await removeCart();
                    await clearCartDataFromCache(apolloClient);

                    await createCart({
                        fetchCartId
                    });
                    const newCartId = await retrieveCartId();
                    localStorage.setItem('cart_id', newCartId);
                }
            } catch (err) {
                console.error(
                    'An error occurred during when placing the order',
                    err
                );
                setReviewOrderButtonClicked(false);
                setCheckoutStep(CHECKOUT_STEP.PAYMENT);
            }
        }

        if (orderDetailsData &&
            !(orderDetailsData?.cart?.selected_payment_method?.code === 'stripe_payments_checkout' ||
                orderDetailsData?.cart?.selected_payment_method?.code === 'stripe_payments' ||
                orderDetailsData?.cart?.selected_payment_method?.code === 'razorpay')) {
            // if (orderDetailsData && !placeOrderCalled) {
            placeOrderAndCleanup();
        }
    }, [
        apolloClient,
        cartId,
        createCart,
        fetchCartId,
        orderDetailsData,
        placeOrder,
        placeOrderCalled,
        removeCart,
        placedOrderNumber,
        confirmStirpePaymentInfo,
        paymentMode
        // 
    ]);
    return {
        activeContent,
        cartItems,
        checkoutStep,
        customer,
        error: checkoutError,
        handleSignIn,
        handlePlaceOrder,
        paymentMode,
        hasError: !!checkoutError,
        isCartEmpty: !(checkoutData && checkoutData.cart.total_quantity),
        isGuestCheckout: !isSignedIn,
        isLoading,
        isUpdating,
        orderDetailsData,
        orderDetailsLoading,
        orderNumber:
            (placeOrderData && placeOrderData?.placeOrder?.order?.order_number) ||
            null,
        placeOrderLoading,
        setCheckoutStep,
        setIsUpdating,
        resetReviewOrderButtonClicked,
        handleReviewOrder,
        reviewOrderButtonClicked,
        toggleActiveContent,
        cartId,
        onlinePaymentLoading: confirmStirpePaymentLoading,
        placedOrderNumber,
        setIsWantToCallPlaceOrderAPI,
        confirmationLoading: loading,
        razorpayOrderLoading,
        paymentDetailForOrderLoading
    };
};
