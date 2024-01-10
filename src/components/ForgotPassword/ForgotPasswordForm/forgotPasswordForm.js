import React, { useState, useEffect, useRef } from 'react';
import { func } from 'prop-types';
import { Form } from 'informed';
import { FormattedMessage, useIntl } from 'react-intl';
// import signClasses from '../../SignIn/signIn.css';
import Button from '../../Button';
import Field from '../../Field';
import TextInput from '../../TextInput';
import combine from '../../../util/combineValidators';
import {
    validateEmail,
    // hasLengthAtLeast,
    isRequired,
    // validatePassword,
    validateConfirmPassword,
    checkOnlyNumberAllow,
    passwordMaxLength
} from '../../../util/formValidators';
// import {
//     Check
// } from 'react-feather';

import { mergeClasses } from '../../../classify';
import defaultClasses from './forgotPasswordForm.css';
import { useResetPassword } from '../../../peregrine/lib/talons/ForgotPassword/useForgotPassword';
import resetPasswordMutation from '../../../queries/resetPassword.graphql';
import verifyForgetPassword from '../../../queries/signInWithOTP/verifyForgetPassword.graphql'
import Password from '../../Password';
import ForgetPasswordFormWithOTP from './forgetPasswordFormWithOTP';
import { useLazyQuery, useMutation } from '@apollo/client';
import GoogleCaptcha from '../../GoogleCaptcha/googleCaptcha';
import { useToasts } from '@magento/peregrine';

const ForgotPasswordForm = props => {
    const [meassageOTP, setMeassageOTP] = useState('');
    const [, { addToast }] = useToasts();
    const [forgetPasswordCheck, setForgetPasswordCheck] = useState(1)
    const [forgetPasswordCheckTimer, setForgetPasswordCheckTimer] = useState(false)
    const classes = mergeClasses(defaultClasses, props.classes);
    const { formatMessage } = useIntl();
    const [char, setChar] = useState(false)
    const [uppercase, setUppercase] = useState(false)
    const [lowercase, setLowerCase] = useState(false)
    const [number, setNumber] = useState(false)
    const [sendForgetPassword, setSendForgetPasswordOtp] = useState()
    const [forgetPasswordOtpData, setForgetPasswordOtpData] = useState()
    const [passwordCheck, setPasswordCheck] = useState(false)
    const [verifyOTPData, setVerifyOTPData] = useState()
    const {
        email,
        isResettingPassword,
        onSubmit,
        otpResponse,
        setShowForgot,
        verifyOTP,
        setVerifyOTP,
        mobileNumber,
        setMobileNumber,
        setNewPassword,
        newPassword,
        resetPasswordWithOTP,
        message,
        setMessage
    } = props;
    const [emailData, setEmailData] = useState('');
    const [otp, setotp] = useState('')

    const captchaToken = useRef(null)

    const [verifyForgetPasswordOTP] = useLazyQuery(verifyForgetPassword, {
        fetchPolicy: 'no-cache',
        onCompleted: (data) => {
            setVerifyOTPData(data)
            if (data?.forgotPassworOTPVerify?.status === false) {
                setMessage("")
            }
        }
    })

    const [resetPasswordOTP] = useMutation(resetPasswordWithOTP, {
        onCompleted: (data) => {
            setForgetPasswordOtpData(data)
            addToast({
                type: 'info',
                message: data?.resetPasswordOtp?.message,
                dismissable: true,
                timeout: 5000
            });
        }
    })

    const {
        submitResetForm,
        resetPasswordResponse,
        inProgress
    } = useResetPassword({
        query: resetPasswordMutation
    });

    const handleSubmitEmail = v => {
        setotp(v?.otp)
        if (!v['email']) {
            verifyForgetPasswordOTP({
                variables: {
                    mobileNumber: mobileNumber,
                    otp: v?.otp,
                    websiteId: 1,
                }
            })
            setPasswordCheck(true)
        } else {
            setEmailData(v['email']);
            onSubmit(v);
        }
    };

    async function handleFormSubmit(v) {
        const resultToken = await captchaToken.current.getToken()
        if (!mobileNumber) {
            v['email'] = emailData;
            submitResetForm(v, resultToken);
        } else {
            resetPasswordOTP({
                variables: {
                    mobileNumber: mobileNumber,
                    otp: otp,
                    password: newPassword,
                    websiteId: 1
                },
                context: {
                    headers: {
                        "X-ReCaptcha": resultToken ? resultToken : ""
                    }
                }
            })
        }
    }

    const handleChange = (e) => {
        setForgetPasswordCheck(Number(e.target.value))
        if (Number(e.target.value) !== 1) {
            setForgetPasswordCheckTimer(true)
        }
    }

    const handleChangeNewPassword = (e) => {
        setNewPassword(e.target.value)
    }

    useEffect(() => {
        if (
            (resetPasswordResponse &&
                resetPasswordResponse.resetForgotPassword &&
                resetPasswordResponse.resetForgotPassword.success) ||
            (forgetPasswordOtpData &&
                forgetPasswordOtpData.resetPasswordOtp &&
                forgetPasswordOtpData.resetPasswordOtp.status === true)
        ) {
            setShowForgot(false);
        } else if (
            (resetPasswordResponse &&
                resetPasswordResponse.resetForgotPassword &&
                resetPasswordResponse.resetForgotPassword.success === false &&
                resetPasswordResponse.resetForgotPassword.message) ||
            (forgetPasswordOtpData &&
                forgetPasswordOtpData.resetPasswordOtp &&
                forgetPasswordOtpData.resetPasswordOtp.status === false)
        ) {
            setMeassageOTP((resetPasswordResponse.resetForgotPassword.message) ||
                (forgetPasswordOtpData.resetPasswordOtp.message));
        }
    }, [resetPasswordResponse, setShowForgot, forgetPasswordOtpData]);

    if (
        ((otpResponse &&
            otpResponse.forgotPassword &&
            otpResponse.forgotPassword.success) ||
            (verifyOTPData &&
                verifyOTPData.forgotPassworOTPVerify &&
                verifyOTPData.forgotPassworOTPVerify.status !== false))
    ) {
        return (
            <Form className={classes.root}
                onSubmit={async (e) => {
                    await handleFormSubmit(e)
                }}
            >
                <div className={'text-right'}>
                    {/* <span
                        role="button"
                        onClick={handleTriggerClick}
                        onKeyDown={handleTriggerClick}
                        tabIndex={0}
                        className={signClasses.close}
                    >
                        <img
                            src="/cenia-static/images/cross.png"
                            alt="icon"
                            width="30"
                        />
                    </span> */}
                </div>
                <h2 className={defaultClasses.title}>
                    <FormattedMessage
                        id={'forgotPasswordForm.titleSuccess'}
                        defaultMessage={'Password Reset'}
                    />
                </h2>
                {!verifyOTP && <div className={classes.form_field}>
                    <Field label="OTP*" required={true}>
                        <TextInput
                            field="otp"
                            maxLength={4}
                            validate={combine([
                                (value) => isRequired(value, 'OTP'),
                                (value) => checkOnlyNumberAllow(value, 'OTP')
                            ])}
                            validateOnBlur
                            validateOnChange
                        />
                        <span className='text-danger'>{meassageOTP}</span>
                    </Field>
                </div>}

                <div className={classes.form_field}>
                    <Password
                        // autoComplete="new-password"
                        fieldName="new_password"
                        isToggleButtonHidden={false}
                        label={formatMessage({
                            id: 'forgotPasswordForm.newPassword',
                            defaultMessage: 'New Password*'
                        })}
                        validate={combine([
                            (value) => isRequired(value, 'Password'),
                            // [hasLengthAtLeast, passwordMaxLength],
                            // (value) => validatePassword(value, char, number, uppercase, lowercase, 'password'),
                        ])}
                        validateOnBlur
                        maxLength={passwordMaxLength}
                        type='passwordField'
                        setChar={setChar}
                        setNumber={setNumber}
                        setUppercase={setUppercase}
                        setLowerCase={setLowerCase}
                        char={char}
                        lowercase={lowercase}
                        uppercase={uppercase}
                        number={number}
                        isIgnoreValidationMessag={true}
                        handleChangeNewPassword={handleChangeNewPassword}
                        passwordCheck={passwordCheck}
                    />
                    <div className={classes.reset_lavel}>
                        <p className={char ? classes.passGreenTick : classes.passValidations} >8 Characters
                        </p>
                        <p className={uppercase ? classes.passGreenTick : classes.passValidations}>1 Uppercase
                        </p>
                        <p className={lowercase ? classes.passGreenTick : classes.passValidations}>1 Lowercase
                        </p>
                        <p className={number ? classes.passGreenTick : classes.passValidations}>1 Number  </p>
                    </div>
                </div>
                <div className={classes.form_field}>
                    <Password
                        // autoComplete="new-password"
                        fieldName="password"
                        label={formatMessage({
                            id: 'createAccount.confirmPassword',
                            defaultMessage: 'Confirm Password*'
                        })}
                        validate={combine([
                            value => isRequired(value, 'Confirm Password'),
                            // [hasLengthAtLeast, 8],
                            // validatePassword,
                            validateConfirmPassword
                        ])}
                        validateOnBlur
                        maxLength={passwordMaxLength}
                        handleChangeNewPassword={handleChangeNewPassword}
                        validateOnChange

                    />
                </div>
                <GoogleCaptcha
                    ref={captchaToken}
                />
                <div className={classes.signInError}>
                    {resetPasswordResponse &&
                        resetPasswordResponse.resetPassword &&
                        resetPasswordResponse.resetPassword.message}
                </div>

                <div className={classes.buttonContainer}>
                    <Button disabled={inProgress || !char || !number || !uppercase || !lowercase} type="submit" priority="high">
                        <FormattedMessage
                            id={'forgotPasswordForm.submit'}
                            defaultMessage={'Submit'}
                        />
                    </Button>
                </div>
                <div className={'text-center'}>
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
                            id={'forgotPasswordForm.BackToLoginSuccess'}
                            defaultMessage={'Back to Login'}
                        />
                    </span>
                </div>
            </Form>
        );
    } else {
        return (
            <>
                <div className={classes.forgot_pass_wrapper}>
                    <div>
                        {/* <span
                        role="button"
                        tabIndex={0}
                        onClick={handleTriggerClick}
                        onKeyDown={handleTriggerClick}
                        className={signClasses.close}
                    >
                        <img
                            src="/cenia-static/images/cross.png"
                            alt="icon"
                            width="30"
                        />
                    </span> */}
                        <div className={classes.forgot_radio_btn}>
                            <Field
                                label={formatMessage({
                                    id: 'global.forgetPasswordWithOTP',
                                    defaultMessage: 'I want to Reset Password Using',
                                    validate: { isRequired },
                                })}
                            >
                                <div className={classes.gender} onChange={handleChange}>
                                    <div className={classes.formCheck}>
                                        <input className="form-check-input" type="radio" name="exampleRadios" id="male" value={1} checked={forgetPasswordCheck === 1} />
                                        <label className="form-check-label" htmlFor="male">Email</label>
                                    </div>
                                    <div className={classes.formCheck}>
                                        <input className="form-check-input" type="radio" name="exampleRadios" id="female" value={2} checked={forgetPasswordCheck === 2} />
                                        <label className="form-check-label" htmlFor="female">Mobile OTP</label>
                                    </div>
                                </div>
                            </Field>
                        </div>
                    </div>
                    <h2 className={defaultClasses.title}>
                        <FormattedMessage
                            id={'forgotPasswordForm.title'}
                            defaultMessage={'Password Reset'}
                        />
                    </h2>
                    <>
                        {forgetPasswordCheck === 1 ? <>

                            <Form className={classes.root} onSubmit={handleSubmitEmail}>
                                <div className={defaultClasses.form_field}>
                                    <Field
                                        className={'mb-0'}
                                        label={formatMessage({
                                            id: 'forgotPassword.email',
                                            defaultMessage: 'Email Address*'
                                        })}
                                        required={true}
                                    >
                                        <TextInput
                                            autoComplete="email"
                                            field="email"
                                            validate={validateEmail}
                                            validateOnChange
                                            validateOnBlur
                                            initialValue={email}
                                            formtype={'forget'}
                                        />
                                    </Field>
                                </div>

                                <div className={defaultClasses.signInError}>
                                    {otpResponse &&
                                        otpResponse.forgotPassword &&
                                        otpResponse.forgotPassword.message}
                                </div>
                                <div className='text-center'>
                                    <Button
                                        disabled={isResettingPassword}
                                        type="submit"
                                        priority="high"
                                    >
                                        <FormattedMessage
                                            id={'forgotPasswordForm.isResettingPassword'}
                                            defaultMessage={'Submit'}
                                        />
                                    </Button>
                                </div>
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
                        </> : <ForgetPasswordFormWithOTP
                            email={email}
                            setShowForgot={setShowForgot}
                            setSendForgetPasswordOtp={setSendForgetPasswordOtp}
                            sendForgetPassword={sendForgetPassword}
                            setVerifyOTP={setVerifyOTP}
                            verifyOTP={verifyOTP}
                            mobileNumber={mobileNumber}
                            setMobileNumber={setMobileNumber}
                            handleSubmitEmail={handleSubmitEmail}
                            verifyOTPData={verifyOTPData}
                            forgetPasswordCheckTimer={forgetPasswordCheckTimer}
                            setVerifyOTPData={setVerifyOTPData}
                            message={message}
                            setMessage={setMessage}
                        />}

                    </>

                </div>
            </>
        );
    }
};

ForgotPasswordForm.propTypes = {
    onSubmit: func.isRequired
};

export default ForgotPasswordForm;
