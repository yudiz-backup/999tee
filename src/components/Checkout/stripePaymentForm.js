import React, { useState, useEffect } from 'react'
import addStripePaymentMethod from '../../queries/stripe/addStripePaymentMethod.graphql'
import setPaymentMethodOnCart from '../../queries/stripe/setPaymentMethodOnCart.graphql'
import {
    CardElement,
    useStripe,
    useElements,
    // PaymentElement
} from "@stripe/react-stripe-js";
import { useMutation } from '@apollo/client';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { useToasts } from '@magento/peregrine';
import { useHistory } from 'react-router-dom';


export default function StripePaymentForm({
    handleSubmit,
    stripePaymentConfirmation,
    setStripePaymentConfirmation,
    paymentMethod,
    handlePlaceOrderClick,
    setAddStripePaymentLoading,
    setSetStripePaymentLoading,
    setEmptyCardElement
}) {
    const stripe = useStripe();
    const elements = useElements();
    const [{ isSignedIn }] = useUserContext()
    const [, { addToast }] = useToasts();
    const history = useHistory();

    const [addPaymentMethod, setAddPaymentMethod] = useState('')

    const [addStripePayment] = useMutation(addStripePaymentMethod, {
        onCompleted: (data) => {
            if (data) {
                setAddStripePaymentLoading(false)
                setStripePayment({
                    variables: {
                        cart_id: localStorage.getItem('cart_id'),
                        code: paymentMethod,
                        payment_methodId: addPaymentMethod?.id
                    }
                })
            } else {
                setAddStripePaymentLoading(false)
            }
        },
        onError: error => {
            setAddStripePaymentLoading(false)
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

    const [setStripePayment] = useMutation(setPaymentMethodOnCart, {
        onCompleted: (data) => {
            if (data) {
                setAddStripePaymentLoading(false)
                handlePlaceOrderClick()
            } else {
                setAddStripePaymentLoading(false)
            }
        },
        onError: error => {
            setAddStripePaymentLoading(false)
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
        if (isSignedIn && addPaymentMethod?.id) {
            setAddStripePaymentLoading(true)
            addStripePayment({
                variables: {
                    payment_method: addPaymentMethod?.id
                }
            })
        }
    }, [addPaymentMethod, isSignedIn])

    // // useEffect(() => {
    // //     if (addPaymentMethod) {
    // //         handlePlaceOrderClick()
    // //         setAddPaymentMethod('')
    // //     }
    // // }, [addPaymentMethod])

    useEffect(() => {
        if (addPaymentMethod?.id && paymentMethod && localStorage.getItem('cart_id') && !isSignedIn) {
            setSetStripePaymentLoading(true)
            setStripePayment({
                variables: {
                    cart_id: localStorage.getItem('cart_id'),
                    code: paymentMethod,
                    payment_methodId: addPaymentMethod?.id
                }
            })
            setAddPaymentMethod('')
        }

    }, [addPaymentMethod, paymentMethod, isSignedIn])

    async function confirmPayment() {
        if (!stripe || !elements) {
            return;
        }

        const cardElement = elements.getElement(CardElement);

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });
        setAddPaymentMethod(paymentMethod)

        if (error) {
            history.push('/checkout')
        }
        // stripe
        //     .confirmCardPayment(clientSecret, {
        //         payment_method: {
        //             type: 'card',
        //             card: cardElement
        //         },
        //     })
        //     .then(function (result) {
        //         // Handle result.error or res
        //         handlePlaceOrderClick()
        //     });
    }

    useEffect(() => {
        if (stripePaymentConfirmation) {
            confirmPayment()
            setStripePaymentConfirmation(false)
        }
    }, [stripe, elements, stripePaymentConfirmation])

    // const paymentElementOptions = {
    //     layout: "tabs"
    // }

    const options = {
        style: {
            base: {
                color: "#32325d",
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: "antialiased",
                fontSize: "16px",
                "::placeholder": {
                    color: "#aab7c4",
                },
            },
            invalid: {
                color: "#fa755a",
                iconColor: "#fa755a",
            },
        },
        hidePostalCode: true
    }

    const handleCardElementChange = (e) => {
        setEmptyCardElement(e.complete)
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <CardElement options={options} onChange={handleCardElementChange} />
                {/* <PaymentElement options={paymentElementOptions} /> */}
            </form>
        </>
    );
}
