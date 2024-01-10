import React/* , { useEffect, useState } */ from 'react';
import { gql } from '@apollo/client';
import { Price } from '@magento/peregrine';

import { mergeClasses } from '../../../classify';
/**
 * A component that renders the shipping summary line item after address and
 * method are selected
 *
 * @param {Object} props.classes
 * @param {Object} props.data fragment response data
 */
const ShippingSummary = props => {
    const classes = mergeClasses({}, props.classes);
    const { data, isCheckout/* , cartDetails, type  */ } = props;

    // Don't render estimated shipping until an address has been provided and
    // a method has been selected.
    if (!data?.length || !data?.[0]?.selected_shipping_method) {
        return null;
    }
    // useEffect(() => {
    //     if (data) {
    //         data.map((d) => {
    //            return d &&  d.available_shipping_methods.map((availableMethods) => {
    //                 setDataset(availableMethods)
    //             })
    //         })
    //     }
    // }, [data])

    // const shipping = type === 'minicart' ?  cartDetails && cartDetails.shipping_addresses[0]    : data[0].selected_shipping_method.amount;
    const shipping = data?.[0]?.selected_shipping_method?.amount;

    // For a value of "0", display "FREE".
    const price = shipping.value ? (
        <Price value={shipping.value} currencyCode={shipping?.currency || "INR"} />
    ) : (
        <span>{'FREE'}</span>
    );
    return (
        <>
            <span className={classes.lineItemLabel}>
                {isCheckout ? 'Shipping Charges' : 'Shipping Charges'}
            </span>
            <span className={classes.price}>{price}</span>
        </>
    );
};

export const ShippingSummaryFragment = gql`
    fragment ShippingSummaryFragment on Cart {
        id
        shipping_addresses {
            selected_shipping_method {
                amount {
                    currency
                    value
                }
                carrier_code
                carrier_title
                method_code
                method_title
            }
            street
        }
    }
`;

export default ShippingSummary;
