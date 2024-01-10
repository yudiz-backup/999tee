import React from 'react'
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from '../Checkout/stripePaymentForm'
import { loadStripe } from '@stripe/stripe-js';
import stripePubilcKeyConfig from '../../queries/storeConfigStirpe/stripePubilcKeyConfig.graphql'
import { useQuery } from '@apollo/client';

const StripePayment = ({
    handleSubmit,
    stripePaymentConfirmation,
    setStripePaymentConfirmation,
    paymentMethod,
    handlePlaceOrderClick,
    setAddStripePaymentLoading,
    setSetStripePaymentLoading,
    setEmptyCardElement
}) => {
    const { data } = useQuery(stripePubilcKeyConfig)

    const paymentStripe = data?.storeConfig?.stripeconfig?.[0]?.stripe_mode === "test" ?
        data?.storeConfig?.stripeconfig?.[0]?.stripe_test_pk?.toString() :
        data?.storeConfig?.stripeconfig?.[0]?.stripe_live_pk?.toString()

    const stripePromise = loadStripe(`${paymentStripe}`);

    return (
        <div>
            {paymentStripe && <Elements stripe={stripePromise}>
                <StripePaymentForm
                    handleSubmit={handleSubmit}
                    stripePaymentConfirmation={stripePaymentConfirmation}
                    setStripePaymentConfirmation={setStripePaymentConfirmation}
                    paymentMethod={paymentMethod}
                    handlePlaceOrderClick={handlePlaceOrderClick}
                    setAddStripePaymentLoading={setAddStripePaymentLoading}
                    setSetStripePaymentLoading={setSetStripePaymentLoading}
                    setEmptyCardElement={setEmptyCardElement}
                />
            </Elements>}
        </div >
    );
};

export default StripePayment;