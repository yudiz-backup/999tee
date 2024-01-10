import React, { useState } from 'react';
import { arrayOf, number, shape, string } from 'prop-types';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './myAccount.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';

const Quantity = props => {
    const { initialValue, classes: propClasses } = props;
    const classes = mergeClasses(defaultClasses, propClasses);
    const [quantityInstance, setQuantityInstance] = useState(1);

    const handleDecreaseClick = () => {
        let qty = 1;
        if (quantityInstance - 1 < 1) {
            qty = 1;
        } else {
            qty = quantityInstance - 1;
        }

        props.onValueChange(qty);
        setQuantityInstance(qty);
    };
    const handleIncreaseClick = () => {
        let qty = 1;
        if (quantityInstance + 1 > 100) {
            qty = 100;
        } else {
            qty = quantityInstance + 1;
        }
        props.onValueChange(qty);
        setQuantityInstance(qty);
    };

    const handleChange = () => {
        var value = parseInt(document.getElementById('quantity').value);
        const { initialValue } = props;
        if (isNaN(value)) {
            value = initialValue;
        } else if (value < 0) {
            value = 1;
        }
        props.onValueChange(value);
        setQuantityInstance(qty);
    };

    if (quantityInstance < 1) {
        props.onValueChange(initialValue);
        setQuantityInstance(qty);
    }
    return (
        <div className={classes.wishlist_qyanty_wrap}>
            <div className={classes.qty_control_wrap + ' ' + 'clearfix'}>
                <button
                    className={classes.qty_control + ' ' + classes.minus}
                    title="Decrease Quantity"
                    priority="high"
                    onClick={handleDecreaseClick}
                >
                    <FontAwesomeIcon icon={faMinus} />
                </button>
                <input
                    type="text"
                    id="quantity"
                    name="quantity"
                    value={quantityInstance}
                    onChange={handleChange}
                />
                <button
                    className={classes.qty_control + ' ' + classes.plus}
                    title="Increase Quantity"
                    priority="high"
                    onClick={handleIncreaseClick}
                >
                    <FontAwesomeIcon icon={faPlus} />
                </button>
            </div>
        </div>
    );
};
Quantity.propTypes = {
    classes: shape({
        root: string
    }),
    items: arrayOf(
        shape({
            value: number
        })
    )
};

Quantity.defaultProps = {
    selectLabel: "product's quantity"
};

export default Quantity;
