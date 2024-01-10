import React, { Fragment, useState } from 'react';
import { useIntl } from 'react-intl';
import { Form } from 'informed';
import { func, number, string } from 'prop-types';
import { Minus as MinusIcon, Plus as PlusIcon } from 'react-feather';
import { useQuantity } from '@magento/peregrine/lib/talons/CartPage/ProductListing/useQuantity';

import { mergeClasses } from '../../classify';
import Icon from '../Icon';
import TextInput from '../TextInput';
import defaultClasses from './quantity.css';

import { gql } from '@apollo/client';
import { useProduct } from '../../peregrine/lib/talons/CartPage/ProductListing/useProduct';
import { CartPageFragment } from '../CartPage/cartPageFragments.gql';
import { AvailableShippingMethodsCartFragment } from '../CartPage/PriceAdjustments/ShippingMethods/shippingMethodsFragments.gql';
import { useToasts } from '@magento/peregrine';
export const QuantityFields = props => {
    const [, { addToast }] = useToasts();
    const { itemId, label, min, productData, setShowButton } = props;
    const [activeEditItem, setActiveEditItem] = useState();
    const [isCartUpdating, setIsCartUpdating] = useState(false);
    const [showAlertMsg, setShowAlertMsg] = useState(false);
    const [showErrorMsg, setShowErrorMsg] = useState(false);
    const cartProductTalonProps = useProduct({
        item: productData,
        mutations: {
            removeItemMutation: REMOVE_ITEM_MUTATION,
            updateItemQuantityMutation: UPDATE_QUANTITY_MUTATION
        },
        setActiveEditItem,
        setIsCartUpdating,
        activeEditItem,
        isCartUpdating
    });

    const {
        handleUpdateItemQuantity,
        product,
        handleRemoveFromCart,
        errorMessage,
        inProgress,
        setDisplayError,
        displayError,
        setInProgress
    } = cartProductTalonProps;
    const { quantity: initialValue } = product;
    const onChange = handleUpdateItemQuantity;
    const { formatMessage } = useIntl();
    const classes = mergeClasses(defaultClasses, props.classes);
    const iconClasses = { root: classes.icon };

    const talonProps = useQuantity({
        initialValue,
        min,
        onChange
    });

    const {
        isDecrementDisabled,
        isIncrementDisabled,
        handleBlur,
        handleDecrement,
        handleIncrement,
        maskInput
    } = talonProps;

    if (!errorMessage && showAlertMsg && !inProgress) {
        addToast({
            type: 'info',
            message:
                productData.product.name + ' quantity updated in the cart.',
            dismissable: true,
            timeout: 5000
        });
        setShowAlertMsg(false);
        setShowErrorMsg(false);
    }
    if (errorMessage && showErrorMsg && !inProgress && displayError) {
        addToast({
            type: 'error',
            message: errorMessage,
            dismissable: true,
            timeout: 5000
        });
        setShowErrorMsg(false);
        setShowAlertMsg(false);
        setDisplayError(false);
    }
    return (
        <Fragment>
            <div className={classes.root}>
                <label className={classes.label} htmlFor={itemId}>
                    {label}
                </label>
                {!isDecrementDisabled && (
                    <button
                        aria-label={formatMessage({
                            id: 'quantity.buttonDecrement',
                            defaultMessage: 'Decrease Quantity'
                        })}
                        className={classes.button_decrement}
                        disabled={isDecrementDisabled}
                        onClick={v => {
                            setInProgress(true);
                            handleDecrement(v);
                            setShowAlertMsg(true);
                            setShowErrorMsg(true);
                        }}
                        type="button"
                    >
                        <Icon classes={iconClasses} src={MinusIcon} size={22} />
                    </button>
                )}
                {isDecrementDisabled && (
                    <button
                        aria-label={formatMessage({
                            id: 'quantity.buttonDecrement',
                            defaultMessage: 'Decrease Quantity'
                        })}
                        className={classes.button_decrement}
                        onClick={() => {
                            setInProgress(true);
                            setShowButton(true);
                            handleRemoveFromCart();
                            setShowAlertMsg(true);
                            setShowErrorMsg(true);
                        }}
                        type="button"
                    >
                        <Icon classes={iconClasses} src={MinusIcon} size={22} />
                    </button>
                )}
                <TextInput
                    aria-label={formatMessage({
                        id: 'quantity.input',
                        defaultMessage: 'Item Quantity'
                    })}
                    classes={{ input: classes.input }}
                    field="quantity"
                    id={itemId}
                    inputMode="numeric"
                    mask={maskInput}
                    min={min}
                    onBlur={() => {
                        handleBlur();
                        setShowAlertMsg(true);
                        setShowErrorMsg(true);
                        setInProgress(true);
                    }}
                    pattern="[0-9]*"
                />
                <button
                    aria-label={formatMessage({
                        id: 'quantity.buttonIncrement',
                        defaultMessage: 'Increase Quantity'
                    })}
                    className={classes.button_increment}
                    disabled={isIncrementDisabled}
                    onClick={v => {
                        setInProgress(true);
                        handleIncrement(v);
                        setShowAlertMsg(true);
                        setShowErrorMsg(true);
                    }}
                    type="button"
                >
                    <Icon classes={iconClasses} src={PlusIcon} size={20} />
                </button>
            </div>
        </Fragment>
    );
};

const Quantity = props => {
    return (
        <Form
            initialValues={{
                quantity: props.initialValue
            }}
        >
            <QuantityFields {...props} />
        </Form>
    );
};

Quantity.propTypes = {
    initialValue: number,
    itemId: string,
    label: string,
    min: number,
    onChange: func,
    message: string
};

Quantity.defaultProps = {
    label: 'Quantity',
    min: 0,
    initialValue: 1,
    onChange: () => {}
};

QuantityFields.defaultProps = {
    min: 0,
    initialValue: 1,
    onChange: () => {}
};

export default Quantity;

export const REMOVE_ITEM_MUTATION = gql`
    mutation removeItem($cartId: String!, $itemId: Int!) {
        removeItemFromCart(input: { cart_id: $cartId, cart_item_id: $itemId })
            @connection(key: "removeItemFromCart") {
            cart {
                id
                ...CartPageFragment
                ...AvailableShippingMethodsCartFragment
            }
        }
    }
    ${CartPageFragment}
    ${AvailableShippingMethodsCartFragment}
`;

export const UPDATE_QUANTITY_MUTATION = gql`
    mutation updateItemQuantity(
        $cartId: String!
        $itemId: Int!
        $quantity: Float!
    ) {
        updateCartItems(
            input: {
                cart_id: $cartId
                cart_items: [{ cart_item_id: $itemId, quantity: $quantity }]
            }
        ) @connection(key: "updateCartItems") {
            cart {
                id
                ...CartPageFragment
                ...AvailableShippingMethodsCartFragment
            }
        }
    }
    ${CartPageFragment}
    ${AvailableShippingMethodsCartFragment}
`;
