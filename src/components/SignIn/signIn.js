import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { bool, func, shape, string } from 'prop-types';
import { Form } from 'informed';
import { useSignIn } from '../../peregrine/lib/talons/SignIn/useSignIn';
import { FormattedMessage, useIntl } from 'react-intl';
import { mergeClasses } from '../../classify';
import CREATE_CART_MUTATION from '../../queries/createCart.graphql';
import GET_CUSTOMER_QUERY from '../../queries/getCustomer.graphql';
import verifyMobileOTP from '../../queries/signInWithOTP/verifyMobileOTP.graphql'
import SIGN_IN_MUTATION from '../../queries/signIn.graphql';
import { mergeCartsMutation } from '../../queries/mergeCarts.gql';
import { validateEmail, isRequired } from '../../util/formValidators';
import Button from '../Button';
import Field from '../Field';
// import LoadingIndicator from '../LoadingIndicator';
import TextInput from '../TextInput';
import defaultClasses from './signIn.css';
import { GET_CART_DETAILS_QUERY } from './signIn.gql';
import LinkButton from '../LinkButton';
import Password from '../Password';
import FormError from '../FormError/formError';
import AssignToCustomerMutation from '../../queries/assignCompareListToCustomer.graphql';

import { globalContext } from '../../peregrine/lib/context/global';
// import Icon from '../Icon';
// import { X as ClearIcon } from 'react-feather';
import SocialLogin from '../SocialLogin'
import SignInWithOTP from './signInWithOTP';
import CreateAccountWithOTP from '../CreateAccount/createAccountWithOTP';
import { useHistory, useLocation } from 'react-router-dom';
import GoogleCaptcha from '../GoogleCaptcha/googleCaptcha';
import SignUpWithB2B from '../CreateAccount/createAccountWithB2B';
import { useUserContext } from '@magento/peregrine/lib/context/user';

// import SignUpWithB2B from '../CreateAccount/createAccountWithB2B'
// const clearIcon = <Icon src={ClearIcon} size={30} />;

const SignInForm = (props) => {
    const [isSelectedPassword, setIsSelectedPassword] = useState(false)
    const [isSelectedOTP, setIsSelectedOTP] = useState(false)
    const [otpLogin, setOtpLogin] = useState(false)
    const { state } = useContext(globalContext);
    const [isDisplayTimer, setIsDisplayTimer] = useState(false)
    const [OTPRegister, setOTPRegister] = useState(false)
    const [B2BRegister, setB2BRegister] = useState(false)
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState("")
    const location = useLocation();
    const history = useHistory();

    const [{ isSignedIn }] = useUserContext();
    const captchaToken = useRef(null)

    useEffect(() => {
        if (location.state) {
            setMsg(location.state.confirmation_msg && location.state.confirmation_msg)
        }
    }, [location.state])

    const {
        // handleTriggerClick,
        formatMessage,
        errors,
        setFormApi,
        forgotPasswordClasses,
        handleCreateAccount,
        handleForgotPassword,
        handleSubmit,
        classes,
        signUpSuccessMessage,
        setSignUpSuccessMessage,
        verifyOTP,
        setVerifyOTP,
        mobileNumber,
        setMobileNumber,
        handleOtpSubmit,
        verifyOTPData,
        onCancel,
        createAccountWithB2BError,
        b2bConfigStoreInfo,
        b2bConfigStoreLoading
    } = props

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

    // setTimeout(() => {
    //     setSignUpSuccessMessage('')
    //     setMsg('')
    //     history.replace({ state: {} })
    // }, 10000);

    const handleEmailLogin = () => {
        setOtpLogin(false)
        setIsSelectedPassword(true)
        setIsSelectedOTP(false)
        setVerifyOTP()
    }

    const handleRedirectToLogin = useCallback(() => {
        onCancel()
        if (createAccountWithB2BError) {
            setB2BRegister(false)
        }
    }, [createAccountWithB2BError])

    const handleOtpLogin = () => {
        setOtpLogin(true)
        setIsSelectedPassword(false)
        setIsSelectedOTP(true)
    }

    const passwordLoginpriority = isSelectedPassword || !otpLogin ? "high" : "normal"
    const otpLoginpriority = isSelectedOTP ? "high" : "normal"

    const handleRegister = () => {
        setOTPRegister(true)
        setOtpLogin(true)
    }

    const handleRagisterAsB2B = () => {
        setB2BRegister(true)
    }
    useEffect(() => {
        if (isSignedIn && window.location.pathname === "/login") {
            history.push('/')
        } else {
            setLoading(false)
        }
    }, [isSignedIn])

    useEffect(() => {
        if (state && state.registeredData && state.registeredData.registeredData && state.registeredData.registeredData.createCustomer) {

            setSignUpSuccessMessage(state.registeredData.registeredData.createCustomer.message)
        }
        if (state && state.registeredData && state.registeredData.registeredData && state.registeredData.registeredData.message) {

            setSignUpSuccessMessage(state.registeredData.registeredData.message)
        }
    }, [state])

    return (
        <>
            {(!otpLogin || !OTPRegister) && !B2BRegister &&
                <div className={classes.button_wrap_tabs + ' ' + 'justify-content-center'}>
                    <Button priority={passwordLoginpriority} onClick={handleEmailLogin}>
                        <FormattedMessage
                            id="signIn.emiallogin"
                            defaultMessage={'Login With Email'}
                        />
                    </Button>
                    <Button priority={otpLoginpriority} onClick={handleOtpLogin}>
                        <FormattedMessage
                            id="signIn.otplogin"
                            defaultMessage={'Login With Mobile'}
                        />
                    </Button>
                </div>}
            {!otpLogin && !B2BRegister ? <>
                {/* {isBusy &&
                    (<div className={classes.modal_active}>
                        <LoadingIndicator>{'Signing In'}</LoadingIndicator>
                    </div>)} */}
                <h3 className={classes.title + ' ' + 'text-center'}>
                    <FormattedMessage
                        id="signIn.titleMessage"
                        defaultMessage={`Sign In to Your Account With Email`}
                    />
                </h3>
                <div>
                    <div className={defaultClasses.success_msg}>
                        {signUpSuccessMessage || msg}
                        <FormError errors={Array.from(errors.values())} rich={true} />
                    </div>
                    <Form
                        getApi={setFormApi}
                        className={classes.form}
                        onSubmit={async (e) => {
                            await handleFormSubmit(e)
                            setLoading(true)
                        }}
                        onChange={() => setSignUpSuccessMessage('')}
                    >

                        <Field
                            label={formatMessage({
                                id: 'signIn.EmailAddress',
                                defaultMessage: 'Email Address'
                            })}
                        >
                            <TextInput
                                autoComplete="email"
                                field="email"
                                // validateOn="change-submit"
                                validate={validateEmail}
                                validateOnChange
                                // onChange={validateEmail}
                                validateOnBlur
                                formtype={'login'}
                            />
                        </Field>
                        <Password
                            fieldName="password"
                            label={formatMessage({
                                id: 'signIn.Password',
                                defaultMessage: 'Password'
                            })}
                            // validate={(value) => validatePassword(value, '', '', '', '', 'signInPassword')}
                            validate={(value) => isRequired(value, 'Password')}
                            // autoComplete="current-password"
                            isToggleButtonHidden={false}
                            validateOnBlur
                            validateOnChange
                        />
                        <div className={'mt-3' + ' ' + classes.button_wrap}>
                            <Button priority="high" type="submit" >
                                <FormattedMessage
                                    id="signIn.Submit"
                                    defaultMessage={'Submit'}
                                />{loading && <div class="spinner-border spinner-border-sm text-light" role="status">
                                </div>}
                            </Button>
                        </div>
                        <div className={classes.forgotPasswordButtonContainer}>
                            <LinkButton
                                classes={forgotPasswordClasses}
                                type="button"
                                onClick={handleForgotPassword}
                            >
                                <FormattedMessage
                                    id="signIn.forgotPasswordButton"
                                    defaultMessage={'Forgot Password?'}
                                />
                            </LinkButton>
                        </div>
                        <>
                            <div className={classes.create_account_div}>
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
                            </div>
                            <div>
                                <SocialLogin />
                            </div>
                            {b2bConfigStoreInfo?.bssB2bRegistrationStoreConfig?.enable !== 0 &&
                                <div className={classes.create_account_div}>
                                    <h3 className={classes.title}>
                                        <FormattedMessage
                                            id="signIn.registerB2B"
                                            defaultMessage={"Sign Up for the Reseller Program"}
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
                                                    defaultMessage={b2bConfigStoreInfo?.bssB2bRegistrationStoreConfig?.shortcut_link_text}
                                                />
                                            </Button>
                                        </div>
                                    </div>
                                    <GoogleCaptcha
                                        ref={captchaToken}
                                    />
                                </div>}
                        </>

                    </Form>
                </div>
            </> :
                OTPRegister ?
                    <CreateAccountWithOTP
                        setOTPRegister={setOTPRegister}
                        handleCreateAccount={handleCreateAccount}
                        OTPRegister={OTPRegister}
                        setIsSelectedPassword={setIsSelectedPassword}
                        setIsSelectedOTP={setIsSelectedOTP}
                    />
                    :
                    !B2BRegister ? <>
                        <SignInWithOTP
                            handleCreateAccount={handleCreateAccount}
                            handleForgotPassword={handleForgotPassword}
                            setVerifyOTP={setVerifyOTP}
                            verifyOTP={verifyOTP}
                            mobileNumber={mobileNumber}
                            setMobileNumber={setMobileNumber}
                            handleSubmit={handleOtpSubmit}
                            otpLogin={otpLogin}
                            isDisplayTimer={isDisplayTimer}
                            setIsDisplayTimer={setIsDisplayTimer}
                            handleRegister={handleRegister}
                            setOTPRegister={setOTPRegister}
                            OTPRegister={OTPRegister}
                            verifyOTPData={verifyOTPData}
                            B2BRegister={B2BRegister}
                            setB2BRegister={setB2BRegister}
                            b2bConfigStoreInfo={b2bConfigStoreInfo}
                            b2bConfigStoreLoading={b2bConfigStoreLoading}
                        />
                    </> :
                        <SignUpWithB2B
                            handleRedirectToLogin={handleRedirectToLogin}
                            B2BRegister={B2BRegister}
                            setSignUpSuccessMessage={setSignUpSuccessMessage}
                            setB2BRegister={setB2BRegister}
                            onCancel={onCancel}
                            b2bConfigStoreInfo={b2bConfigStoreInfo}
                        />
            }
            {/* <>
                {B2BRegister &&
                    <SignUpWithB2B />
                }
            </> */}
        </>
    )

}

const SignIn = props => {
    const [verifyOTP, setVerifyOTP] = useState()
    const [mobileNumber, setMobileNumber] = useState()
    const [verifyOTPData, setVerifyOTPData] = useState()
    // const [{ isSignedIn }] = useUserContext();

    // const refCaptcha = useRef(null)

    const classes = mergeClasses(defaultClasses, props.classes);
    const {
        setDefaultUsername,
        showCreateAccount,
        showForgotPassword,
        handleTriggerClick,
        accountMenuIsOpen,
        signUpSuccessMessage,
        setSignUpSuccessMessage,
        onCancel,
        b2bConfigStoreInfo,
        b2bConfigStoreLoading
    } = props;
    const { formatMessage } = useIntl();

    const talonProps = useSignIn({
        createCartMutation: CREATE_CART_MUTATION,
        customerQuery: GET_CUSTOMER_QUERY,
        getCartDetailsQuery: GET_CART_DETAILS_QUERY,
        signInMutation: SIGN_IN_MUTATION,
        assignMutation: AssignToCustomerMutation,
        mergeCartsMutation,
        setDefaultUsername,
        showCreateAccount,
        showForgotPassword,
        verifyMobileOTP,
        verifyOTP,
        mobileNumber,
        verifyOTPData,
        setVerifyOTPData,
        setVerifyOTP,
        // refCaptcha,
        setSignUpSuccessMessage
    });

    const {
        errors,
        handleCreateAccount,
        handleForgotPassword,
        handleSubmit,
        isBusy,
        setFormApi,
        formApiRef,
        setSignInError,
        handleOtpSubmit,
        createAccountWithB2BError,
        signinLoading
        // refCaptcha
    } = talonProps;

    useEffect(() => {
        if (!accountMenuIsOpen && formApiRef.current) {
            formApiRef.current.reset();
            setSignInError();
            setSignUpSuccessMessage('');
        }
    }, [accountMenuIsOpen, formApiRef, setSignInError, setSignUpSuccessMessage])

    const forgotPasswordClasses = {
        root: classes.forgotPasswordButton
    };

    return (
        <div className={classes.root}>
            <SignInForm
                handleTriggerClick={handleTriggerClick}
                formatMessage={formatMessage}
                errors={errors}
                setFormApi={setFormApi}
                forgotPasswordClasses={forgotPasswordClasses}
                handleCreateAccount={handleCreateAccount}
                handleForgotPassword={handleForgotPassword}
                handleSubmit={handleSubmit}
                classes={classes}
                signUpSuccessMessage={signUpSuccessMessage}
                setSignUpSuccessMessage={setSignUpSuccessMessage}
                setVerifyOTP={setVerifyOTP}
                verifyOTP={verifyOTP}
                mobileNumber={mobileNumber}
                setMobileNumber={setMobileNumber}
                handleOtpSubmit={handleOtpSubmit}
                verifyOTPData={verifyOTPData}
                onCancel={onCancel}
                isBusy={isBusy}
                createAccountWithB2BError={createAccountWithB2BError}
                signinLoading={signinLoading}
                b2bConfigStoreInfo={b2bConfigStoreInfo}
                b2bConfigStoreLoading={b2bConfigStoreLoading}
            />
        </div>
    );
};

export default SignIn;

SignIn.propTypes = {
    classes: shape({
        buttonsContainer: string,
        form: string,
        forgotPasswordButton: string,
        forgotPasswordButtonContainer: string,
        root: string,
        title: string
    }),
    setDefaultUsername: func,
    showCreateAccount: func,
    showForgotPassword: func,
    accountMenuIsOpen: bool
};

SignIn.defaultProps = {
    setDefaultUsername: () => { },
    showCreateAccount: () => { },
    showForgotPassword: () => { }
};

