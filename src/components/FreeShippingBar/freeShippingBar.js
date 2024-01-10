import React from 'react'
import storeConfigData from '../../queries/getStoreConfigData.graphql'
import { useQuery } from '@apollo/client';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from '../MiniCart/miniCart.css';
import { Price } from '@magento/peregrine';

export default function FreeShippingBar(props) {
    const { minicartTotal } = props

    const classes = mergeClasses(defaultClasses, props.classes);
    const { data: freeShipping } = useQuery(storeConfigData)

    const freeShippingBar = minicartTotal * 100 / (freeShipping && freeShipping.storeConfig && freeShipping.storeConfig.free_shipping && +freeShipping.storeConfig.free_shipping.min_order_amount)

    return (
        <div className={classes.progress_box}>
            {(freeShipping &&
                freeShipping.storeConfig &&
                freeShipping.storeConfig.free_shipping &&
                +freeShipping.storeConfig.free_shipping.min_order_amount) > minicartTotal ? <p>
                You're only <Price
                    value={freeShipping && freeShipping.storeConfig && freeShipping.storeConfig.free_shipping && +freeShipping.storeConfig.free_shipping.min_order_amount - minicartTotal}
                    currencyCode={"INR"}
                /> away from free shipping
            </p> : <p>You qualify for <b>free shipping!</b></p>}
            <div className="progress">
                <div
                    className="progress-bar"
                    role="progressbar"
                    aria-label="Basic example"
                    style={{ width: freeShippingBar + "%" }}
                    aria-valuemin="0"
                    aria-valuemax="100"
                />
            </div>
        </div>
    )
}
