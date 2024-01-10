import React, { useContext, useEffect } from 'react'
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, resourceUrl } from 'src/drivers';
// Button-Component
import Button from '@magento/venia-ui/lib/components/Button';

// Css Style Classes
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import cedClasses from '../ProductFullDetail/productFullDetail.css';

// Hooks
import {
    useProductFullDetail
} from '../../peregrine/lib/talons/ProductFullDetail/useProductFullDetail';

import { useToasts } from '@magento/peregrine';

import {
    ADD_CONFIGURABLE_MUTATION,
    ADD_SIMPLE_MUTATION,
    ADD_SIMPLE_CUSTOM_MUTATION,
    ADD_BUNDLE_MUTATION
} from '../ProductFullDetail/productFullDetail.gql';
import { globalContext } from '../../peregrine/lib/context/global';
import { handleCartNotification } from '../../util/helperFunction';

export default function AddToCartSection(props) {
    const classes = mergeClasses(cedClasses);
    // const errors = new Map();
    const { formatMessage } = useIntl();
    const [, { addToast }] = useToasts();
    const { dispatch } = useContext(globalContext);


    // Props Data
    const { product,uniqueSize,__typename } = props;

    const talonProps = useProductFullDetail({
        addConfigurableProductToCartMutation: ADD_CONFIGURABLE_MUTATION,
        addSimpleProductToCartMutation: ADD_SIMPLE_MUTATION,
        addSimpleCustomMutation: ADD_SIMPLE_CUSTOM_MUTATION,
        addBundleProductToCartMutation: ADD_BUNDLE_MUTATION,
        product
    });

    // Custom Hook
    const {
        handleAddToCart,
        isAddingItem,
        success,
        errorMessage
    } = talonProps;

    useEffect(() => {
        if (success && !isAddingItem) {
            // addToast({
            //     type: 'info',
            //     message:
            //         product.name +
            //         formatMessage({
            //             id: 'cart.message',
            //             defaultMessage: ' added to the cart.'
            //         }),
            //     dismissable: true,
            //     timeout: 5000
            // });
            handleCartNotification(true, dispatch, product?.name)
        }
        if (errorMessage && !isAddingItem) {
            addToast({
                type: 'error',
                message: errorMessage ? errorMessage : 'error',
                dismissable: true,
                timeout: 5000
            });
        }
    }, [addToast, success, errorMessage, isAddingItem, name, formatMessage]);
    return (
        <>
            {
                product && <div className={classes.galler_modal_button_wrapper}>
                    {(product?.type === 'simple' || 
                    product?.type_id === 'simple' || 
                    __typename === 'SimpleProduct' ||
                    product?.__typename === 'SimpleProduct'
                    ) ?
                    <Button
                        priority="high"
                        type="submit"
                        onClick={(e) => {
                            e.preventDefault()
                            handleAddToCart(
                                {
                                    quantity: 1,
                                }
                            );
                        }}

                        disabled={
                            product?.stock_status_data?.stock_status === 'OUT_OF_STOCK'
                        }
                    >
                        {
                            product?.stock_status_data?.stock_status === 'OUT_OF_STOCK'
                                ? 'Out of Stock'
                                : <FormattedMessage
                                    id={
                                        'ProductFullDetail.addToCart'
                                    }
                                    defaultMessage={
                                        'Add to Cart'
                                    }
                                />
                        }

                    </Button>
                     :
                     ((product?.type === 'configurable' || 
                     product?.type_id === 'configurable' || 
                     __typename === 'ConfigurableProduct' ||
                     product?.__typename === 'ConfigurableProduct'
                     ) && uniqueSize?.length === 0) && 
                     <Link
                        to={product?.type_id ? resourceUrl(product['url_key']) + resourceUrl(product['url_suffix']) :  resourceUrl(product['urlkey']) || resourceUrl(`${product['url_key']}.html`)}
                    >
                     <Button
                        priority="high"
                        type="submit"
                    > <FormattedMessage
                                    id={
                                        'ProductFullDetail.goToDeatilsPage'
                                    }
                                    defaultMessage={
                                        'View Details'
                                    }
                                />

                    </Button>
                    </Link>
                     }
                    {isAddingItem && (
                        <div
                            className={classes.galler_modal_active}>
                            <div
                                className={
                                    classes.loader_div
                                }
                            >
                                <div
                                    className={
                                        classes.ball_pulse
                                    }
                                >
                                    <div />
                                    <div />
                                    <div />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            }
        </>
    )
}
