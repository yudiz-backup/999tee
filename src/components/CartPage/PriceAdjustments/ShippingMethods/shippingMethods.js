import React, { Fragment } from 'react';
import { Form } from 'informed';
import { useShippingMethods } from '@magento/peregrine/lib/talons/CartPage/PriceAdjustments/ShippingMethods/useShippingMethods';

import { mergeClasses } from '../../../../classify';
import Button from '../../../Button';
import ShippingForm from './shippingForm';
import defaultClasses from './shippingMethods.css';
import ShippingMethodsOperations from './shippingMethods.gql';
import ShippingRadios from './shippingRadios';
import { FormattedMessage, useIntl } from 'react-intl';

/**
 * A child component of the PriceAdjustments component.
 * This component renders the form for adding the shipping method for the cart.
 *
 * @param {Object} props
 * @param {Function} props.setIsCartUpdating Function for setting the updating state of the cart.
 * @param {Object} props.classes CSS className overrides.
 * See [shippingMethods.css]{@link https://github.com/magento/pwa-studio/blob/develop/packages/venia-ui/lib/components/CartPage/PriceAdjustments/ShippingMethods/shippingMethods.css}
 * for a list of classes you can override.
 *
 * @returns {React.Element}
 *
 * @example <caption>Importing into your project</caption>
 * import ShippingMethods from "@magento/venia-ui/lib/components/CartPage/PriceAdjustments/ShippingMethods";
 */
const ShippingMethods = props => {
    const { setIsCartUpdating } = props;
    const {
        hasMethods,
        isShowingForm,
        selectedShippingFields,
        selectedShippingMethod,
        shippingMethods,
        showForm
    } = useShippingMethods({ ...ShippingMethodsOperations });
    const { formatMessage } = useIntl();

    const classes = mergeClasses(defaultClasses, props.classes);

    const radios =
        isShowingForm && hasMethods ? (
            <Fragment>
                <h3 className={classes.prompt}>
                    {formatMessage({
                        id: 'shippingMethod.shippingMethod',
                        defaultMessage: 'Shipping Methods'
                    })}
                </h3>
                <Form>
                    <ShippingRadios
                        selectedShippingMethod={selectedShippingMethod}
                        setIsCartUpdating={setIsCartUpdating}
                        shippingMethods={shippingMethods}
                    />
                </Form>
            </Fragment>
        ) : null;

    const formOrPlaceholder = isShowingForm ? (
        <Fragment>
            <ShippingForm
                hasMethods={hasMethods}
                selectedShippingFields={selectedShippingFields}
                setIsCartUpdating={setIsCartUpdating}
            />
            {radios}
        </Fragment>
    ) : (
        <div className={classes.action_btn}>
            <Button
                priority="high"
                type="button"
                classes={{ root_normalPriority: classes.estimateButton }}
                onClick={showForm}
            >
                {formatMessage({
                    id: 'shippingMethod.estimate',
                    defaultMessage: 'I want to estimate my delivery'
                })}
            </Button>
        </div>
    );

    return (
        <div className={classes.root}>
            <p className={classes.message}>
                <FormattedMessage     
                    id={'shippingMethod.message'}
                    defaultMessage={
                        ' For shipping estimates before proceeding to checkout, please provide the Country, State, and Pincode for the destination of your order.'
                    }
                />
            </p>
            {formOrPlaceholder}
        </div>
    );
};

export default ShippingMethods;
