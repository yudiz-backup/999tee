import React, { useState, useEffect } from 'react'
import { FormattedMessage, useIntl } from 'react-intl';
import { mergeClasses } from '../../../classify';
import { checkOnlyNumberAllow, isRequired, mobileNumberLength } from '../../../util/formValidators'
import defaultClasses from './forgotPasswordForm.css';
import { Form } from 'informed';
import Button from '../../Button';
import Field from '../../Field';
import TextInput from '../../TextInput';
import combine from '../../../util/combineValidators';
import { useMutation } from '@apollo/client';
import sendForgetPasswordOTP from '../../../queries/signInWithOTP/sendForgetPasswordOTP.graphql'
import Countdown from '../../../util/timer';

export default function ForgetPasswordFormWithOTP(props) {

    const [/* isDisplayTimer, */, setIsDisplayTimer] = useState(false)
    const [resetTimer, setResetTimer] = useState(false)

    const { sendForgetPassword,
        setSendForgetPasswordOtp,
        // verifyOTP,
        setVerifyOTP,
        mobileNumber,
        setMobileNumber,
        handleSubmitEmail,
        verifyOTPData,
        forgetPasswordCheckTimer,
        setVerifyOTPData,
        message,
        setMessage } = props


    const { setShowForgot } = props
    const classes = mergeClasses(defaultClasses, props.classes);
    const { formatMessage } = useIntl();

    const [sendOtp] = useMutation(sendForgetPasswordOTP, {
        onCompleted: (data) => {
            if (data) {
                setSendForgetPasswordOtp(data)
                setVerifyOTPData()
            }
            if (data?.forgotPassworOTP?.status !== false) {
                setResetTimer(true)
            }
        }
    })

    const handleChange = (e) => {
        setMobileNumber(e.target.value)
        if (e.target.value?.length === 0) {
            setMessage("")
        }
    }

    const handleSendForgetPasswordOtp = () => {
        if (mobileNumber && mobileNumber.length === mobileNumberLength) {
            sendOtp({
                variables: {
                    mobileNumber: mobileNumber,
                    websiteId: 1
                }
            })
        }
    }

    const handleVerifyOTP = (e) => {
        setVerifyOTP(e.target.value)
    }

    useEffect(() => {
        if (resetTimer) {
            setIsDisplayTimer(forgetPasswordCheckTimer)
        }
    }, [forgetPasswordCheckTimer, resetTimer])


    useEffect(() => {
        if (sendForgetPassword && sendForgetPassword.forgotPassworOTP &&
            sendForgetPassword.forgotPassworOTP.message) {
            setMessage(sendForgetPassword.forgotPassworOTP.message)
        }
    }, [sendForgetPassword])

    useEffect(() => {
        if (resetTimer) {
            setTimeout(() => {
                setMessage('')
            }, 10000)
        }
    }, [resetTimer])

    const vaildMobileNumber = checkOnlyNumberAllow(mobileNumber)

    return (
        <div>
            <div className={sendForgetPassword &&
                sendForgetPassword.forgotPassworOTP &&
                sendForgetPassword.forgotPassworOTP.status !== false ? "text-success" : "text-danger"}>
                {/* {sendForgetPassword &&
                    sendForgetPassword.forgotPassworOTP &&
                    sendForgetPassword.forgotPassworOTP.message} */}
                {message}
            </div>
            <div className={verifyOTPData &&
                verifyOTPData.forgotPassworOTPVerify &&
                verifyOTPData.forgotPassworOTPVerify.status !== false ? "text-success" : "text-danger"}>
                {verifyOTPData &&
                    verifyOTPData.forgotPassworOTPVerify &&
                    verifyOTPData.forgotPassworOTPVerify.message}
            </div>
            <Form className={classes.root} onSubmit={handleSubmitEmail}>
                <div className={defaultClasses.form_field}>
                    <Field
                        id="customer_telephone"
                        label={formatMessage({
                            id: 'global.phoneNumber',
                            defaultMessage: 'Mobile Number*'
                        })}
                    >
                        <TextInput
                            field="telephone"
                            validate={combine([
                                value => isRequired(value, 'Mobile Number', mobileNumberLength),
                                value => checkOnlyNumberAllow(value, 'Mobile Number')
                            ])}
                            validateOnBlur
                            id="customer_telephone"
                            onChange={handleChange}
                            maxLength={mobileNumberLength}
                            disabled={resetTimer &&
                                sendForgetPassword?.forgotPassworOTP?.status !== false}
                        />
                    </Field>
                    {resetTimer &&
                        sendForgetPassword?.forgotPassworOTP?.status !== false &&
                        <>
                            <span>Resend OTP in <Countdown
                                second={59}
                                setResetTimer={setResetTimer}
                                setIsDisplayTimer={setIsDisplayTimer}
                                setMessage={setMessage}
                                setVerifyOTP={setVerifyOTP}
                                setVerifyOTPData={setVerifyOTPData}
                            />
                            </span>
                        </>}
                    <div className='mt-3'>
                        {(!vaildMobileNumber
                            && mobileNumber?.length === mobileNumberLength) && !resetTimer &&
                            <Button priority='high' type='button' onClick={handleSendForgetPasswordOtp}>
                                {sendForgetPassword &&
                                    sendForgetPassword.forgotPassworOTP &&
                                    sendForgetPassword.forgotPassworOTP.status !== false ?
                                    !resetTimer && <span>{"Resend Otp"}</span> :
                                    "Send Otp"
                                }
                            </Button>}
                    </div>
                </div>

                {sendForgetPassword &&
                    sendForgetPassword.forgotPassworOTP &&
                    sendForgetPassword.forgotPassworOTP.status !== false &&
                    resetTimer &&
                    <Field
                        id="otp"
                        label={formatMessage({
                            id: ' ',
                            defaultMessage: 'OTP*'
                        })}
                    >
                        <TextInput
                            field="otp"
                            validate={combine([
                                value => isRequired(value, 'OTP'),
                                value => checkOnlyNumberAllow(value, 'OTP')
                            ])}
                            validateOnBlur
                            id="customer_telephone"
                            onChange={handleVerifyOTP}
                        />
                    </Field>}
                {sendForgetPassword &&
                    sendForgetPassword.forgotPassworOTP &&
                    sendForgetPassword.forgotPassworOTP.status !== false &&
                    resetTimer &&
                    <div >
                        <Button
                            // disabled={isResettingPassword}
                            type="submit"
                            priority="high"
                        >
                            <FormattedMessage
                                id={'forgotPasswordForm.isResettingPassword'}
                                defaultMessage={'Submit'}
                            />
                        </Button>
                    </div>}
                <div className={defaultClasses.back_login_btn}>
                    <span
                        role="button"
                        className={defaultClasses.instructions}
                        onClick={() => setShowForgot(false)}
                        onKeyDown={() => setShowForgot(false)}
                        tabIndex={0}
                    >
                        <span>
                            <img
                                src="/cenia-static/images/icon_arrow_left.png"
                                alt="icon_arrow_left"
                                width="25"
                                height="25"
                            />
                        </span>
                        <FormattedMessage
                            id={'forgotPasswordForm.BackToLogin'}
                            defaultMessage={'Back to Login'}
                        />
                    </span>
                </div>
            </Form>
        </div>
    )
}
