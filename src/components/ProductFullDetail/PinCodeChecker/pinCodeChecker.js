import React, { useEffect, useState } from 'react'
import Field from '../../Field';
import TextInput from '@magento/venia-ui/lib/components/TextInput';
// import { FormattedMessage } from 'react-intl';
// import pincodeConfiguration from '../../../queries/pincodeChecker/pincodeConfiguration.graphql'
import defaultClasses from './pinCodeChecker.css';

// import { useQuery } from '@apollo/client';
import { checkOnlyNumberAllowForPinCode, isRequired, postalCodeMaxLength } from '../../../util/formValidators';
import combine from '../../../util/combineValidators';


export default function PinCodeChecker(props) {
    const [errMsg, setErrMsg] = useState()
    const [successMsg, setSuccessMsg] = useState()
    // const [deliveryMsg, setDeliveryMsg] = useState()
    const [status, setStatus] = useState()
    const {
        // productId,
        pincode,
        setPincode,
        pincodeData,
        // setPincodeData,
        // require,
        // setRequire
    } = props

    // const { data } = useQuery(pincodeConfiguration)

    const pincodeDataAvailability = pincodeData

    const handleChange = (e) => {
        setPincode(e.target.value)
    }
    useEffect(() => {
        if (pincodeDataAvailability) {
            setErrMsg(pincodeDataAvailability.pincodecheck.message)
            setSuccessMsg(pincodeDataAvailability.pincodecheck.message)
            setStatus(pincodeDataAvailability.pincodecheck.status)
            // setDeliveryMsg(pincodeDataAvailability.days_to_deliver_message)
        }
    }, [pincodeDataAvailability])

    useEffect(() => {
        if (pincode && pincode.length === postalCodeMaxLength) {
            setErrMsg("")
            setSuccessMsg("")
            setStatus()
            // setDeliveryMsg("")
        }
    }, [pincode])

    useEffect(() => {
        var el = document.getElementById("pincodeChecker");
        el.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
            }
        });
    }, [])
    return (
        <>
            <div className={defaultClasses.pinCodeChecker}>
                <Field
                    required={true}
                >
                    <TextInput
                        id="pincodeChecker"
                        field="pincodeChecker"
                        autoComplete="given-name"
                        validate={combine([
                            value => isRequired(value, 'Pincode', postalCodeMaxLength),
                            value => checkOnlyNumberAllowForPinCode(value, 'Pincode')
                        ])}
                        validateOnChange
                        validateOnBlur
                        onChange={handleChange}
                        placeholder="Enter Pincode"
                        maxLength={postalCodeMaxLength}
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
                <div>
                    {/* {pincode && pincode.length === postalCodeMaxLength &&
                     <span className='text-success'>
                         {successMsg}
                     </span>} */}
                </div>


                <div>
                    {/* {pincode && pincode.length === postalCodeMaxLength &&
                        <span className='text-success'>
                            {deliveryMsg}
                        </span>} */}
                </div>
            </div>
        </>
    )
}
