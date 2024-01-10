import React, { Fragment, useEffect, useRef, useState } from 'react';
import { gql } from '@apollo/client';
import { Form } from 'informed';
import { func, shape, string } from 'prop-types';
import { useShippingForm } from 'src/components/CartPage/PriceAdjustments/ShippingMethods/useShippingForm.js';
import { /* PlusSquare, */ AlertCircle as AlertCircleIcon } from 'react-feather';

import { mergeClasses } from '../../../../classify';
import { isRequired, checkOnlyNumberAllowForPinCode, postalCodeMaxLength } from '../../../../util/formValidators';
import combine from '../../../../util/combineValidators';
import Button from '../../../Button';
import { ShippingInformationFragment } from '../../../CheckoutPage/ShippingInformation/shippingInformationFragments.gql';
import Country from '../../../Country';
import Field from '../../../Field';
import FormError from '../../../FormError';
import Region from '../../../Region';
import TextInput from '../../../TextInput';
import { CartPageFragment } from '../../cartPageFragments.gql';
import defaultClasses from './shippingForm.css';
import { GET_SHIPPING_METHODS } from './shippingMethods.gql';
import { ShippingMethodsCartFragment } from './shippingMethodsFragments.gql';
import { FormattedMessage, useIntl } from 'react-intl';
// import combine from "../../../../../src/util/combineValidators"

// import PinCodeChecker from '../../../ProductFullDetail/PinCodeChecker/pinCodeChecker';
import { useToasts } from '@magento/peregrine';
import Icon from '../../../Icon';
const ShippingForm = props => {
    const formRef = useRef(null);
    const [, { addToast }] = useToasts();

    const { hasMethods, selectedShippingFields, setIsCartUpdating } = props;
    const { formatMessage } = useIntl();
    const [status, setStatus] = useState()

    const talonProps = useShippingForm({
        selectedValues: selectedShippingFields,
        setIsCartUpdating,
        mutations: {
            setShippingAddressMutation: SET_SHIPPING_ADDRESS_MUTATION
        },
        queries: {
            shippingMethodsQuery: GET_SHIPPING_METHODS
        },
        setStatus
    });
    const {
        errors,
        handleOnSubmit,
        handleZipChange,
        isSetShippingLoading,
        pincodeData,
        pincode,
        setErrMsg,
        setSuccessMsg,
        errMsg,
        successMsg
    } = talonProps;
    const errorIcon = (
        <Icon
            src={AlertCircleIcon}
            attrs={{
                width: 18
            }}
        />
    );
    useEffect(() => {
        if (pincodeData && pincodeData?.pincodecheck) {
            setStatus(pincodeData?.pincodecheck?.status)
            setErrMsg(pincodeData.pincodecheck.message)
            setSuccessMsg(pincodeData.pincodecheck.message)
        }
    }, [pincodeData])

    useEffect(() => {
        if (pincode && pincode.length < 6) {
            setErrMsg("")
            setSuccessMsg("")
            setStatus()
            // setDeliveryMsg("")
        }
    }, [pincode])
    useEffect(() => {
        if (status && successMsg) {
            addToast({
                type: 'info',
                message: successMsg,
                dismissable: true,
                timeout: 5000
            });
        } else if (!status && errMsg) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: errMsg,
                dismissable: true,
                timeout: 10000
            });
        }
    }, [successMsg])
    const classes = mergeClasses(defaultClasses, props.classes);
    return (
        <Fragment>
            <h3 className={classes.formTitle}>
                <FormattedMessage
                    id={'shippingForm.Destination'}
                    defaultMessage={'Destination'}
                />
            </h3>
            <FormError errors={Array.from(errors.values)} />
            <Form
                className={classes.root}
                initialValues={selectedShippingFields}
                onSubmit={handleOnSubmit}
                ref={formRef}
                getApi={value => (formRef.current = value)}
            >
                <Country
                    validate={value => isRequired(value, 'Country')}
                    onValueChange={() => {
                        if (formRef && formRef.current) {
                            formRef.current.setValue('region', '');
                        }
                    }}
                />
                <Region validate={value => isRequired(value, 'State')} />
                {/* <PinCodeChecker /> */}
                <Field
                    id="zip"
                    label={formatMessage({
                        id: 'shippingForm.zip',
                        defaultMessage: 'Pincode'
                    })}
                    classes={{ root: classes.zip }}
                >
                    <TextInput
                        field="zip"
                        // validate={value => isRequired(value, 'Pincode')}
                        validate={combine([
                            value => isRequired(value, 'Pincode', postalCodeMaxLength),
                            value => checkOnlyNumberAllowForPinCode(value, 'Pincode')
                        ])}
                        onValueChange={handleZipChange}
                        validateOnChange
                        maxLength={postalCodeMaxLength}

                    />
                </Field>
                {/* {
                    status  
                    ?  <div>
                    {pincode && pincode.length === postalCodeMaxLength &&
                        <span className='text-success'>
                            {successMsg}
                        </span>}
                    </div>
                : <div>
                {pincode && pincode.length === postalCodeMaxLength &&
                    <span className='text-danger'>
                        {errMsg}
                    </span>}
                    </div>
                } */}
                {!hasMethods ? (
                    <Button
                        classes={{ root_normalPriority: classes.submit }}
                        disabled={isSetShippingLoading || !status}
                        priority="normal"

                        type="submit"

                    >
                        {isSetShippingLoading
                            ? formatMessage({
                                id: 'shippingForm.loading',
                                defaultMessage: 'Loading Methods...'
                            })
                            : formatMessage({
                                id: 'shippingForm.getOption',
                                defaultMessage: 'Get Shipping Options'
                            })}
                    </Button>
                ) : null}
            </Form>
        </Fragment>
    );
};

export default ShippingForm;

ShippingForm.propTypes = {
    classes: shape({
        zip: string
    }),
    selectedShippingFields: shape({
        country: string.isRequired,
        region: string.isRequired,
        zip: string.isRequired
    }),
    setIsFetchingMethods: func
};

export const SET_SHIPPING_ADDRESS_MUTATION = gql`
    mutation SetShippingAddressForEstimate(
        $cartId: String!
        $address: CartAddressInput!
    ) {
        setShippingAddressesOnCart(
            input: {
                cart_id: $cartId
                shipping_addresses: [{ address: $address }]
            }
        ) @connection(key: "setShippingAddressesOnCart") {
            cart {
                id
                ...CartPageFragment
                ...ShippingMethodsCartFragment
                ...ShippingInformationFragment
            }
        }
    }
    ${CartPageFragment}
    ${ShippingMethodsCartFragment}
    ${ShippingInformationFragment}
`;
