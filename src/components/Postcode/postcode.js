import React, { useEffect, useState } from 'react';
import { shape, string } from 'prop-types';
import { useIntl } from 'react-intl';
import { usePostcode } from '../../peregrine/lib/talons/Postcode/usePostcode';
import { useFormApi } from 'informed';
import { mergeClasses } from '../../classify';
import Field from '../Field';
import TextInput from '../TextInput';
import defaultClasses from './postcode.css';
import combine from '../../util/combineValidators';
import { /* checkOnlyNumberAllow, */ checkOnlyNumberAllowForPinCode, isRequired, postalCodeMaxLength } from '../../util/formValidators';
import { /* useQuery, useMutation,  */useLazyQuery } from '@apollo/client';
import pincodeAvailability from '../../queries/pincodeChecker/pincodeAvailability.graphql'
const Postcode = props => {
    const formApi = useFormApi();
    const { classes: propClasses, fieldInput, label, initialValue, googleApiData, setPincodeStatus = () => { }/* , validate = () => { } */, ...inputProps } = props;
    const inputValue = formApi.getValue(fieldInput);
    const [pincodeData, setPincodeData] = useState()
    const [pincode, setPincode] = useState()
    const [errMsg, setErrMsg] = useState()
    const [successMsg, setSuccessMsg] = useState()
    // const [deliveryMsg, setDeliveryMsg] = useState()
    const [status, setStatus] = useState()
    const classes = mergeClasses(defaultClasses, propClasses);
    const postcodeProps = {
        classes,
        ...inputProps
    };
    const pincodeDataAvailability = pincodeData

    useEffect(() => {
        if (pincodeDataAvailability) {
            setErrMsg(pincodeDataAvailability.pincodecheck.message)
            setSuccessMsg(pincodeDataAvailability.pincodecheck.message)
            setStatus(pincodeDataAvailability.pincodecheck.status)
            setPincodeStatus(pincodeDataAvailability.pincodecheck.status)
            // setDeliveryMsg(pincodeDataAvailability.days_to_deliver_message)
        }
    }, [pincodeDataAvailability])
    useEffect(() => {
        if (pincode && pincode.length < 6) {
            setErrMsg("")
            setSuccessMsg("")
            setStatus()
            setPincodeStatus(false)
            // setDeliveryMsg("")
        }
    }, [pincode])

    const { formatMessage } = useIntl();
    const [pincodeAvailabityCode] = useLazyQuery(pincodeAvailability, {
        fetchPolicy: 'no-cache',
        onCompleted: (data) => {
            setPincodeData(data)
        }
    })
    useEffect(() => {
        if (inputValue) {
            if (inputValue && !inputValue.startsWith("0") && inputValue.length === postalCodeMaxLength) {
                pincodeAvailabityCode({
                    variables: {
                        pincode: inputValue,
                        // product_id: +productId
                    }
                })
            }
        }
    }, [inputValue])
    const fieldLabel =
        label ||
        formatMessage({
            id: 'postcode.label',
            defaultMessage: 'Pincode*'
        });

    usePostcode({ fieldInput });
    useEffect(() => {
        if (googleApiData && googleApiData.pincode) {
            setPincode(googleApiData.pincode)
        }
    }, [googleApiData])
    useEffect(() => {
        if (pincode && !pincode.startsWith("0") && pincode.length === postalCodeMaxLength) {
            pincodeAvailabityCode({
                variables: {
                    pincode: pincode,
                    // product_id: +productId
                }
            })
        }
    }, [pincode || postalCodeMaxLength])
    const handlePincodeSetter = (e) => {
        setPincode(e.target.value)
    }

    return (
        <>
            <Field
                id={classes.root}
                label={fieldLabel}
                classes={{ root: classes.root }}
            >
                <TextInput
                    {...postcodeProps}
                    field={fieldInput}
                    id={classes.root}
                    // validate={combine([
                    //     validate,
                    //     value =>
                    //         checkOnlyNumberAllow(value, 'Pincode')
                    // ])}
                    // field="myInput"
                    validate={combine([
                        value => isRequired(value, 'Pincode', postalCodeMaxLength),
                        value => checkOnlyNumberAllowForPinCode(value, 'Pincode')
                    ])}
                    formtype={'checkoutCustomer'}
                    maxLength={postalCodeMaxLength}
                    onChange={(e) => handlePincodeSetter(e)}
                    initialValue={initialValue}
                />
            </Field>
            {
                status
                    ? <div>
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
            }
        </>


    );
};

export default Postcode;

Postcode.defaultProps = {
    fieldInput: 'postcode'
};

Postcode.propTypes = {
    classes: shape({
        root: string
    }),
    fieldInput: string,
    label: string
};
