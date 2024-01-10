import React, { useState, useEffect, useRef, useContext } from 'react';
import { Form } from 'informed';
import { FormattedMessage, useIntl } from 'react-intl';
import { mergeClasses } from '../../classify';
import { checkOnlyNumberAllow, isRequired, mobileNumberLength } from '../../util/formValidators';
import Button from '../Button';
import Field from '../Field';
import TextInput from '../TextInput';
import defaultClasses from './signIn.css';
import LinkButton from '../LinkButton';
import combine from '../../util/combineValidators';
import { useMutation } from '@apollo/client';
import sendMobileOTP from '../../queries/signInWithOTP/sendMobileOTP.graphql'
// import CreateAccountWithOTP from '../CreateAccount/createAccountWithOTP';
import Countdown from '../../util/timer';
import GoogleCaptcha from '../GoogleCaptcha/googleCaptcha';
import RichContent from '@magento/venia-ui/lib/components/RichContent';
import SignUpWithB2B from '../CreateAccount/createAccountWithB2B';
import LoadingIndicator from '../LoadingIndicator/indicator';
import { globalContext } from '../../peregrine/lib/context/global';
// import RichContent from '../../components/RichContent';



export default function SignInWithOTP(props) {
    const [sendLoginOtp, setSendLoginOtp] = useState()
    const [resetTimer, setResetTimer] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const { dispatch } = useContext(globalContext);

    const captchaToken = useRef(null)

    const { handleCreateAccount,
        handleForgotPassword,
        mobileNumber,
        setMobileNumber,
        setVerifyOTP,
        handleSubmit,
        otpLogin,
        setOTPRegister,
        OTPRegister,
        handleRegister,
        verifyOTPData,
        B2BRegister,
        setB2BRegister,
        b2bConfigStoreInfo,
        b2bConfigStoreLoading } = props

    const classes = mergeClasses(defaultClasses, props.classes);
    const { formatMessage } = useIntl();

    const [sendOtp] = useMutation(sendMobileOTP, {
        fetchPolicy: 'no-cache',
        onCompleted: (data) => {
            if (data) {
                setSendLoginOtp(data)
                if (data?.loginOTP?.status !== false) {
                    setResetTimer(true)
                }
            }
        }
    })

    // useEffect(() => {
    //     dispatch({
    //         type: 'GOOGLE_CAPTCHA',
    //         payload: {captchaToken : captchaToken}
    //     })
    // },[captchaToken])

    async function handleFormSubmit(e) {
        const resultToken = await captchaToken.current.getToken()
        handleSubmit({ ...e, cpatchaToken: resultToken })
    }

    const handleChange = (e) => {
        setMobileNumber(e.target.value)
    }

    const vaildMobileNumber = checkOnlyNumberAllow(mobileNumber)
    const handleSendLoginOtp = () => {
        if (mobileNumber && mobileNumber.length === mobileNumberLength) {
            sendOtp({
                variables: {
                    mobileNumber: mobileNumber,
                    websiteId: 1
                }
            })
        }
        setError("")
    }

    const handleVerifyOtp = (e) => {
        setVerifyOTP(e.target.value)
    }

    const handleRagisterAsB2B = () => {
        setB2BRegister(true)
    }

    useEffect(() => {
        if (sendLoginOtp && sendLoginOtp.loginOTP &&
            sendLoginOtp.loginOTP.message) {
            setMessage(sendLoginOtp.loginOTP.message)
            setError("")
        }
    }, [sendLoginOtp])

    useEffect(() => {
        setError(verifyOTPData?.loginOTPVerify?.message)
        setMessage("")
    }, [verifyOTPData])

    return (
        <>
            {!OTPRegister && !B2BRegister ? <>
                <h3 className={classes.title + ' ' + 'text-center'}>
                    <FormattedMessage
                        id="signIn.signinwithotp"
                        defaultMessage={`Sign In to Your Account With Mobile`}
                    />
                </h3>
                {message && <div className={sendLoginOtp &&
                    sendLoginOtp.loginOTP &&
                    sendLoginOtp.loginOTP.status !== false ? "text-success" : "text-danger"}>
                    {message}
                </div>}
                {verifyOTPData?.loginOTPVerify?.message && <div className={sendLoginOtp &&
                    verifyOTPData?.loginOTPVerify?.status !== false ? "text-success" + ' ' + classes.text_success : "text-danger" + ' ' + classes.text_danger}>
                    <RichContent className='text-danger' html={error} />
                </div>}
                <Form
                    className={classes.form}
                    onSubmit={async (e) => {
                        await handleFormSubmit(e)
                    }}
                >
                    <GoogleCaptcha
                        ref={captchaToken}
                    />
                    <Field
                        id="customer_telephone"
                        label={formatMessage({
                            id: 'signinwithotp.phoneNumber',
                            defaultMessage: 'Mobile Number'
                        })}
                    >
                        <TextInput
                            field="telephone"
                            validate={combine([
                                value => checkOnlyNumberAllow(value, 'Mobile Number'),
                                value => isRequired(value, 'Mobile Number', mobileNumberLength)
                            ])}
                            maxLength={mobileNumberLength}
                            validateOnBlur
                            validateOnChange
                            id="customer_telephone"
                            onChange={handleChange}
                            disabled={resetTimer && sendLoginOtp &&
                                sendLoginOtp.loginOTP &&
                                sendLoginOtp.loginOTP.status !== false}
                            formtype={'loginMobile'}
                        />
                    </Field>
                    {resetTimer &&
                        sendLoginOtp &&
                        sendLoginOtp.loginOTP &&
                        sendLoginOtp.loginOTP.status !== false &&
                        <>
                            <span>Resend OTP in <Countdown
                                second={59}
                                setResetTimer={setResetTimer}
                                setMessage={setMessage}
                                setError={setError}
                                setVerifyOTP={setVerifyOTP}
                            /></span>
                        </>
                    }
                    {(!vaildMobileNumber && mobileNumber.length === mobileNumberLength && !resetTimer) && <span>
                        <Button priority='high' type='submit' onClick={handleSendLoginOtp}>
                            {sendLoginOtp &&
                                sendLoginOtp.loginOTP &&
                                sendLoginOtp.loginOTP.status !== false ?
                                !resetTimer && <span>{"Resend Otp"}</span>
                                :
                                "Send Otp"
                            }
                        </Button>
                    </span>}
                    {sendLoginOtp &&
                        sendLoginOtp.loginOTP &&
                        sendLoginOtp.loginOTP.status !== false &&
                        resetTimer &&
                        <Field
                            id="otp"
                            label={formatMessage({
                                id: 'signinwithotp.otp',
                                defaultMessage: 'OTP'
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
                                onChange={handleVerifyOtp}
                            // OnKeyPress={(event) => isNumber(event)}

                            />
                        </Field>}
                    {sendLoginOtp &&
                        sendLoginOtp.loginOTP &&
                        sendLoginOtp.loginOTP.status !== false &&
                        resetTimer &&
                        <div className={'mt-3' + ' ' + classes.button_wrap}>
                            <Button priority="high" type="submit">
                                <FormattedMessage
                                    id="signIn.Submit"
                                    defaultMessage={'Submit'}
                                />
                            </Button>
                        </div>
                    }
                    <div className={classes.forgotPasswordButtonContainer}>
                        <LinkButton
                            // classes={forgotPasswordClasses}
                            type="button"
                            onClick={handleForgotPassword}
                        >
                            <FormattedMessage
                                id="signIn.forgotPasswordButton"
                                defaultMessage={'Forgot Password?'}
                            />
                        </LinkButton>
                    </div>
                    {!b2bConfigStoreLoading ? <div className={classes.create_account_div}>
                        <h3 className={classes.title}>
                            <FormattedMessage
                                id="signIn.title"
                                defaultMessage={`Sign Up`}
                            />
                        </h3>
                        <p className={classes.title_subtext}>
                            <FormattedMessage
                                id="signIn.title_subtext"
                                defaultMessage="Welcome! It's quick and easy to set up an account"
                            />
                        </p>
                        <div className={classes.login_btn + ' ' + 'd-flex align-items-center justify-content-center'}>
                            <div className={classes.buttonsContainer}>
                                <Button
                                    priority="normal"
                                    type="button"
                                    onClick={handleCreateAccount}
                                >
                                    <FormattedMessage
                                        id="signIn.signup_button"
                                        defaultMessage={'Register with Email'}
                                    />
                                </Button>
                            </div>
                            <div className={classes.buttonsContainer}>
                                <Button
                                    priority="normal"
                                    type="button"
                                    onClick={handleRegister}
                                >
                                    <FormattedMessage
                                        id="signIn.register"
                                        defaultMessage={'Register with Mobile'}
                                    />
                                </Button>
                            </div>
                        </div>
                        {b2bConfigStoreInfo?.bssB2bRegistrationStoreConfig?.enable !== 0 &&
                            <div div className={classes.create_account_div}>
                                <h3 className={classes.title}>
                                    <FormattedMessage
                                        id="signIn.titleB2B"
                                        defaultMessage={`Sign up with Reseller Program`}
                                    />
                                </h3>
                                <p className={classes.title_subtext}>
                                    <FormattedMessage
                                        id="signIn.title_subtext"
                                        defaultMessage="Welcome! It's quick and easy to set up an account"
                                    />
                                </p>
                                <div className={classes.login_btn + ' ' + 'd-flex align-items-center justify-content-center'}>
                                    <div className={classes.buttonsContainer}>
                                        <Button
                                            priority="normal"
                                            type="button"
                                            onClick={handleRagisterAsB2B}
                                        >
                                            <FormattedMessage
                                                id="signIn.registerB2B"
                                                defaultMessage={'Register as a Reseller'}
                                            />
                                        </Button>
                                    </div>
                                </div>
                            </div>}
                    </div> : <LoadingIndicator />}

                </Form>
            </> : <>
                {B2BRegister && <SignUpWithB2B />}
            </>
            }
        </>
    )
}
