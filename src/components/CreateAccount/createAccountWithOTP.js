import React, { useEffect, useState, useContext, useRef } from 'react';
import { Form } from 'informed';
import { FormattedMessage, useIntl } from 'react-intl';
import { mergeClasses } from '../../classify';
import { checkOnlyNumberAllow, isRequired, mobileNumberLength } from '../../util/formValidators';
import Button from '../Button';
import Field from '../Field';
import TextInput from '../TextInput';
import defaultClasses from '../SignIn/signIn.css';
import combine from '../../util/combineValidators';
import { useLazyQuery, useMutation } from '@apollo/client';
import sendCreateAccountOTP from '../../queries/signInWithOTP/sendCreateAccountOTP.graphql'
import verifyCreateAccountOTP from '../../queries/signInWithOTP/verifyCreateAccountOTP.graphql'
import { globalContext } from '../../peregrine/lib/context/global';
import Countdown from '../../util/timer';
import GoogleCaptcha from '../GoogleCaptcha/googleCaptcha';

export default function CreateAccountWithOTP(props) {
    const { setOTPRegister,
        handleCreateAccount,
        // OTPRegister,
        setIsSelectedPassword,
        setIsSelectedOTP } = props

    const [sendCreateAccountOtp, setCreateAccountOtp] = useState()
    const [mobileNumber, setMobileNumber] = useState()
    const [verifyOTP, setVerifyOTP] = useState()
    // const [verifyCreateAccountOtp, setVerifyCreateAccountOtp] = useState()
    // const [isDisplayTimer, setIsDisplayTimer] = useState(false)
    const [resetTimer, setResetTimer] = useState(false)
    const [message, setMessage] = useState('')

    const captchaToken = useRef(null)

    // const { handleCreateAccount } = props

    const classes = mergeClasses(defaultClasses, props.classes);
    const { formatMessage } = useIntl();

    const [sendOtp] = useMutation(sendCreateAccountOTP, {
        onCompleted: (data) => {
            if (data) {
                setCreateAccountOtp(data)
                if (data?.createAccountOTP?.status !== false) {
                    setResetTimer(true)
                }
            }
        }
    })

    const [verifyOtp] = useLazyQuery(verifyCreateAccountOTP, {
        onCompleted: (data) => {
            if (data) {
                // setVerifyCreateAccountOtp(data)
                handleCreateAccount()
            }
        }
    })

    const handleChange = (e) => {
        setMobileNumber(e.target.value)
        if (e.target.value?.length === 0) {
            setMessage("")
        }
    }

    const handleVerifyOTP = (e) => {
        setVerifyOTP(e.target.value)
    }

    const vaildMobileNumber = checkOnlyNumberAllow(mobileNumber)
    const handleSendLoginOtp = () => {
        if (mobileNumber.length === mobileNumberLength) {
            sendOtp({
                variables: {
                    mobileNumber: mobileNumber,
                    websiteId: 1
                }
            })

        }
    }

    const handleSignOtp = () => {
        setOTPRegister(false)
        setIsSelectedPassword(false)
        setIsSelectedOTP(true)
    }

    const handleSubmit = (e) => {
        if (verifyOTP) {
            verifyOtp({
                variables: {
                    mobileNumber: mobileNumber,
                    otp: e?.otp,
                    websiteId: 1
                }
            })
        }
    }

    const { dispatch } = useContext(globalContext)

    useEffect(() => {
        if (mobileNumber && verifyOTP) {
            dispatch({ type: "MOBILE_NUMBER", payload: { mobileNumber: mobileNumber, otpNumber: verifyOTP } })
        }
    }, [mobileNumber, verifyOTP])

    useEffect(() => {
        if (sendCreateAccountOtp && sendCreateAccountOtp.createAccountOTP &&
            sendCreateAccountOtp.createAccountOTP.message) {
            setMessage(sendCreateAccountOtp.createAccountOTP.message)
        }
    }, [sendCreateAccountOtp])

    useEffect(() => {
        if (resetTimer) {
            setTimeout(() => {
                setMessage('')
            }, 10000)
        }
    }, [resetTimer])

    async function handleFormSubmit(e) {
        const resultToken = await captchaToken.current.getToken()
        handleSubmit(e, resultToken)
    }

    return (
        <>
            <h2 className={classes.title}>
                <FormattedMessage
                    id="signIn.register"
                    defaultMessage={`Register with Mobile`}
                />
            </h2>
            <div>
                {message && <div className={sendCreateAccountOtp &&
                    sendCreateAccountOtp.createAccountOTP &&
                    sendCreateAccountOtp.createAccountOTP.status !== false ? "text-success" : "text-danger"}>
                    {message}
                </div>}
                <Form
                    className={classes.form}
                    onSubmit={async (e) => {
                        await handleFormSubmit(e)
                    }}
                >
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
                                value => checkOnlyNumberAllow(value, 'Mobile Number'),
                                value => isRequired(value, 'Mobile Number', mobileNumberLength),
                            ])}
                            maxLength={mobileNumberLength}
                            validateOnBlur
                            validateOnChange
                            id="customer_telephone"
                            onChange={handleChange}
                            disabled={resetTimer && sendCreateAccountOtp &&
                                sendCreateAccountOtp.createAccountOTP &&
                                sendCreateAccountOtp.createAccountOTP.status !== false}
                            formtype={'registerWithMobile'}
                        />
                    </Field>
                    <div>
                        <GoogleCaptcha
                            ref={captchaToken}
                        />
                        {resetTimer && sendCreateAccountOtp &&
                            sendCreateAccountOtp.createAccountOTP &&
                            sendCreateAccountOtp.createAccountOTP.status !== false &&
                            <>
                                <span>Resend OTP in <Countdown
                                    second={59}
                                    setResetTimer={setResetTimer}
                                    setMessage={setMessage}
                                    setVerifyOTP={setVerifyOTP}
                                />
                                </span>
                            </>}

                        {(!vaildMobileNumber
                            && mobileNumber?.length === mobileNumberLength) && !resetTimer && <span>
                                {<Button priority='high' type='submit' onClick={handleSendLoginOtp}>
                                    {sendCreateAccountOtp &&
                                        sendCreateAccountOtp.createAccountOTP &&
                                        sendCreateAccountOtp.createAccountOTP.status !== false ?
                                        !resetTimer && "Resend Otp" :
                                        "Send Otp"
                                    }
                                </Button>
                                }
                            </span>}
                        {/* } */}
                    </div>
                    {sendCreateAccountOtp &&
                        sendCreateAccountOtp.createAccountOTP &&
                        sendCreateAccountOtp.createAccountOTP.status !== false &&
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
                                validateOnChange
                                validateOnBlur
                                id="customer_telephone"
                                onChange={handleVerifyOTP}
                            />
                        </Field>}
                    {sendCreateAccountOtp &&
                        sendCreateAccountOtp.createAccountOTP &&
                        sendCreateAccountOtp.createAccountOTP.status !== false &&
                        resetTimer &&
                        <div className={'mt-3' + ' ' + classes.button_wrap}>
                            <Button priority="high" type="submit">
                                <FormattedMessage
                                    id="signIn.Submit"
                                    defaultMessage={'Submit'}
                                />
                            </Button>
                        </div>}
                    <div className={classes.create_account_div}>
                        <h2 className={classes.title}>
                            <FormattedMessage
                                id="signIn.title.otp"
                                defaultMessage={`Sign In`}
                            />
                        </h2>
                        <p className={classes.title_subtext}>
                            <FormattedMessage
                                id="signIn.title_subtext"
                                defaultMessage="Welcome! It's quick and easy to set up an account"
                            />
                        </p>
                        <div className={classes.buttonsContainer}>
                            <Button
                                priority="normal"
                                type="button"
                                onClick={handleSignOtp}
                            >
                                <FormattedMessage
                                    id="signIn.SigninWithOTP"
                                    defaultMessage={'Sign In With OTP'}
                                />
                            </Button>
                        </div>
                    </div>
                </Form>
            </div>
        </>
    )
}
