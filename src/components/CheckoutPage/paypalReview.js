import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import SET_PAYMENT_METHOD from '../../queries/setPaymentMethod.graphql';
import LoadingIndicator from '../LoadingIndicator';
import SET_GUEST_EMAIL from '../../queries/setGuestEmailOnCart.graphql';
import CheckoutPageOperations from './checkoutPage.gql.js';
import {
    useSetPaymentMethod,
    usePaypalCheckout
} from '../../peregrine/lib/talons/CheckoutPage/usePaypalPayment';
import { useSetGuestEmail } from '../../peregrine/lib/talons/Home/useHome';

const { parse } = require('querystring');

const PaypalReview = () => {
    const talonProps = usePaypalCheckout({ ...CheckoutPageOperations });
    const { handlePlaceOrder, orderNumber, orderDetailsData } = talonProps;
    const queryString = window.location.search;
    const parsed = parse(queryString.replace(/^\?/, ''));
    const { token, PayerID } = parsed;
    const [payFlag, setPayFlag] = useState(false);
    const [emailFlag, setEmailFlag] = useState(false);
    const [orderFlag, setOrderFlag] = useState(true);
    const {
        handleSetPaymentMethod,
        paymentMethodResponse
    } = useSetPaymentMethod({ mutation: SET_PAYMENT_METHOD });

    const { handleSetGuestEmail } = useSetGuestEmail({
        mutation: SET_GUEST_EMAIL
    });

    if (!payFlag && token && PayerID) {
        handleSetPaymentMethod({
            payment_method: 'paypal_express',
            payer_id: PayerID,
            token: token
        });
        setPayFlag(true);
    }

    if (!emailFlag && localStorage.getItem('customerEmail')) {
        handleSetGuestEmail({
            email: localStorage.getItem('customerEmail')
        });
        setEmailFlag(true);
    }

    if (paymentMethodResponse == 'paypal_express' && orderFlag) {
        handlePlaceOrder();
        setOrderFlag(false);
    }

    if (orderNumber && orderDetailsData) {
        return (
            <Redirect
                to={{
                    pathname: '/checkout',
                    state: {
                        orderDetailsData: orderDetailsData,
                        orderNumber: orderNumber
                    }
                }}
            />
        );
    } else {
        return (
            <div>
                <LoadingIndicator>{`Please wait...`}</LoadingIndicator>
            </div>
        );
    }
};

export default PaypalReview;
