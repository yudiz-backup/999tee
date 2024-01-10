import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { GET_ORDER_DETAILS } from '../checkoutPage.gql'
import {
    useLazyQuery,
} from '@apollo/client';
import OrderConfirmationPage from '../OrderConfirmationPage/orderConfirmationPage'
export default function ThankYouPage() {
    let { id } = useParams();
    const [
        getOrderDetails,
        { data: orderDetailsData }
    ] = useLazyQuery(GET_ORDER_DETAILS, {
        // We use this query to fetch details _just_ before submission, so we
        // want to make sure it is fresh. We also don't want to cache this data
        // because it may contain PII.
        fetchPolicy: 'no-cache',
        onCompleted: () => {

        },
        onError: () => {
            // offline payment method
        }
    });
    useEffect(() => {
        if (id) {
            getOrderDetails({
                variables: {
                    cartId: localStorage.getItem('cart_id')
                }
            });
        }
    }, [id])

    return (
        <>
            <OrderConfirmationPage
                data={orderDetailsData}
                orderNumber={id}
            />
        </>
    )
}
