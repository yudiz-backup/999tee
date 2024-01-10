import React, { useEffect/* , useState */ } from 'react';
import { Form, useFieldApi } from 'informed';
import { func, number, string } from 'prop-types';
import { Minus as MinusIcon, Plus as PlusIcon } from 'react-feather';
// import { useQuantity } from '@magento/peregrine/lib/talons/CartPage/ProductListing/useQuantity';
import { useQuantity } from '../../../peregrine/lib/talons/CartPage/ProductListing/useQuantity';

import { mergeClasses } from '../../../classify';
import Icon from '../../Icon';
import TextInput from '../../TextInput';
import defaultClasses from './quantity.css';

export const QuantityFields = props => {
    const { initialValue, itemId, label, min, onChange, handleDecrement: propHandleDecrement = () => { }, handleIncrement: propHandleIncrement = () => { }, disabled = false, setIsErrorQty = () => { }, isErrorQty = false } = props;
    const classes = mergeClasses(defaultClasses, props.classes);
    const iconClasses = { root: classes.icon };
    const quantityFieldApi = useFieldApi('quantity');

    const talonProps = useQuantity({
        initialValue,
        min,
        onChange,
        propHandleDecrement,
        propHandleIncrement,
    });
    const {
        isDecrementDisabled,
        isIncrementDisabled,
        handleBlur,
        handleDecrement,
        handleIncrement,
        maskInput
    } = talonProps;


    useEffect(() => {
        var el = document.getElementById(itemId);
        el.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                document.getElementById("increase_quantity").focus();
                event.preventDefault();
            }
        });
    }, [])

    useEffect(() => {
        if (isErrorQty) {
            quantityFieldApi.setValue(initialValue);
            setIsErrorQty(false)
        }
    }, [isErrorQty])

    return (
        <div className={classes.root}>
            <label className={classes.label} htmlFor={itemId}>
                {label}
            </label>
            <div className={classes.qty_inner_wrap + ' ' + classes.wrap}>
                <button
                    aria-label={'Decrease Quantity'}
                    className={classes.button_decrement}
                    disabled={isDecrementDisabled || disabled}
                    onClick={handleDecrement}
                    type="button"
                >
                    <Icon classes={iconClasses} src={MinusIcon} size={22} />
                </button>
                <div className={classes.qty_field_wrap}>
                    <TextInput
                        aria-label="Item Quantity"
                        classes={{ input: classes.input }}
                        field="quantity"
                        id={itemId}
                        inputMode="numeric"
                        mask={maskInput}
                        min='1'
                        onBlur={handleBlur}
                        maxLength={4}
                        pattern="[0-9]*"
                        disabled={disabled}
                    />
                </div>
                <button
                    aria-label={'Increase Quantity'}
                    className={classes.button_increment}
                    disabled={isIncrementDisabled || disabled}
                    onClick={handleIncrement}
                    type="button"
                    id='increase_quantity'
                >
                    <Icon classes={iconClasses} src={PlusIcon} size={20} />
                </button>
            </div>
        </div>
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
    onChange: func
};

Quantity.defaultProps = {
    label: 'Quantity',
    min: 0,
    initialValue: 1,
    onChange: () => { }
};

QuantityFields.defaultProps = {
    min: 0,
    initialValue: 1,
    onChange: () => { }
};

export default Quantity;
