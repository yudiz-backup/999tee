import React, { useState, useRef, useEffect, useContext } from 'react';
import { Form } from 'informed';
import { func, shape, string, bool, number } from 'prop-types';
import { Redirect } from 'src/drivers';
import { FormattedMessage, useIntl } from 'react-intl';
import { useCreateAccount } from '../../peregrine/lib/talons/CreateAccount/useCreateAccount';
import signClasses from '../SignIn/signIn.css';
import { mergeClasses } from '../../classify';
import CREATE_ACCOUNT_MUTATION from '../../queries/createAccount.graphql';
import CREATE_CART_MUTATION from '../../queries/createCart.graphql';
import GET_CART_DETAILS_QUERY from '../../queries/getCartDetails.graphql';
import GET_CUSTOMER_QUERY from '../../queries/getCustomer.graphql';
import SIGN_IN_MUTATION from '../../queries/signIn.graphql';
import { mergeCartsMutation } from '../../queries/mergeCarts.gql';
import combine from '../../util/combineValidators';
import {
    hasLengthAtLeast,
    isRequired,
    // validatePassword,
    validateConfirmPassword,
    validateEmail,
    mobileNumberLength,
    validateName,
    nameMinLength,
    nameMaxLength,
    hasLengthAtMost,
    checkOnlyNumberAllow,
    passwordMaxLength
} from '../../util/formValidators';
import Button from '../Button';
import Checkbox from '../Checkbox';
import Field, { Message } from '../Field';
import TextInput from '../TextInput';
import defaultClasses from './createAccount.css';
import FormError from '../FormError';
import Password from '../Password';
import AssignToCustomerMutation from '../../queries/assignCompareListToCustomer.graphql';
import Icon from '../Icon';
import { X as ClearIcon/* , Check  */ } from 'react-feather';
import { globalContext } from '../../peregrine/lib/context/global';
import GoogleCaptcha from '../GoogleCaptcha/googleCaptcha';

export const clearIcon = <Icon src={ClearIcon} size={30} />;

const CreateAccount = props => {
    const formRef = useRef(null);
    const { formatMessage } = useIntl();

    // props-Data
    const { onCancel, setSignUpSuccessMessage } = props;
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();
    const newDate = yyyy + '-' + mm + '-' + dd;
    // useState
    const [isChecked, setIsChecked] = useState(false);
    const [genderCheck, setGenderCheck] = useState(1)
    const [char, setChar] = useState(false)
    const [uppercase, setUppercase] = useState(false)
    const [lowercase, setLowerCase] = useState(false)
    const [number, setNumber] = useState(false)
    const [maxDate, setMaxDate] = useState('');

    const captchaToken = useRef(null)

    const handleDateChange = (event) => {
        // update the max date based on the selected date
        setMaxDate(event.target.value);
    };

    // const [passwordValidators, setPasswordValidators] = useState({
    //     char: false,
    //     uppercase: false,
    //     lowercase: false,
    //     number: false
    // })

    //  const todayDateInStringYYYYMMDD = `${new Date().getFullYear()}-${new Date().getMonth() + 1 < 10 ? `0${new Date().getMonth()}` + 1 : new Date().getMonth() + 1}-${new Date().getDate() < 10 ? `0${new Date().getDate()}` : new Date().getDate()}`
    // const todayDateInStringYYYYMMDD = new Date()

    const { state, dispatch } = useContext(globalContext);
    const mobileNumber = state?.mobileNumber
    const otpNumber = state?.otpNumber
    const talonProps = useCreateAccount({
        queries: {
            customerQuery: GET_CUSTOMER_QUERY,
            getCartDetailsQuery: GET_CART_DETAILS_QUERY
        },
        mutations: {
            createAccountMutation: CREATE_ACCOUNT_MUTATION,
            createCartMutation: CREATE_CART_MUTATION,
            signInMutation: SIGN_IN_MUTATION,
            mergeCartsMutation,
            assignMutation: AssignToCustomerMutation
        },
        initialValues: props.initialValues,
        onSubmit: props.onSubmit,
        onCancel: props.onCancel,
        genderCheck: genderCheck,
        formRef,
        setGenderCheck,
        isChecked,
        redirectToSign: onCancel,
        mobileNumber,
        otpNumber,
        dispatch,
    });

    const handleChange = (e) => {
        setGenderCheck(Number(e.target.value))
    }

    const {
        errors,
        handleSubmit,
        isDisabled,
        isSignedIn,
        initialValues,
        confirmation_required,
    } = talonProps;

    async function handleFormSubmit(e) {
        const resultToken = await captchaToken.current.getToken()
        handleSubmit(e, resultToken, [], maxDate)
        // handleSubmit(e, resultToken)
    }

    const classes = mergeClasses(defaultClasses, props.classes);
    const submitButton = (
        <Button
            className={classes.submitButton}
            disabled={isDisabled || !char || !uppercase || !lowercase || !number}
            type="submit"
            priority="high"
        >
            <FormattedMessage
                id={'createAccount.submitButton'}
                defaultMessage={'Submit'}
            />
        </Button>
    );

    useEffect(() => {
        if (confirmation_required) {
            setSignUpSuccessMessage('Please check your email and confirm your account.')
        }
    }, [confirmation_required, setSignUpSuccessMessage])

    if (isSignedIn) {
        return <Redirect to="/" />
    }

    // const checkButton = (
    //     <Button
    //         className={classes.passwordButton}
    //         // onClick={togglePasswordVisibility}
    //         type="button"
    //     >

    //         <Check style={{ color: '#00853d' }} />
    //     </Button>
    // );
    return (
        <div className={signClasses.root}>
            <h3 className={signClasses.title}>
                <FormattedMessage
                    id={'createAccount.title'}
                    defaultMessage={`Create An Account`}
                />
            </h3>
            <Form
                className={classes.root}
                initialValues={initialValues}
                onSubmit={async (e) => {
                    if (maxDate && new Date(newDate) > new Date(maxDate)) {
                        await handleFormSubmit(e)
                    }
                    else if (!maxDate) {
                        await handleFormSubmit(e)
                    }
                }}
                ref={formRef}
                getApi={value => formRef.current = value}
            >
                {confirmation_required && (
                    <div className={defaultClasses.success_msg}>
                        Please check your email and confirm your account.
                    </div>
                )}
                <FormError errors={Array.from(errors.values())} />
                <div className="row form_row">
                    <div className="col-12 col-sm-6 col-md-12 col-lg-6">
                        <div className='form-group mb-0'>
                            <Field
                                label={formatMessage({
                                    id: 'createAccount.firstName',
                                    defaultMessage: 'First Name*'
                                })}
                            >
                                <TextInput
                                    // after={value &&  value.length > 0  && checkButton}
                                    field="customer.firstname"
                                    autoComplete="given-name"
                                    validate={combine([
                                        (value) => isRequired(value, 'First Name'),
                                        [hasLengthAtMost, nameMaxLength],
                                        [hasLengthAtLeast, nameMinLength],
                                        validateName
                                    ])}
                                    validateOnBlur
                                    validateOnChange
                                    // onChange={e => {
                                    //     const val = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1)
                                    //     fieldApi.setValue(val);
                                    //     if (onChange) {
                                    //       onChange(e);
                                    //     }
                                    //   }}
                                    formtype={'register'}
                                />
                            </Field>
                        </div>
                    </div>
                    <div className="col-12 col-sm-6 col-md-12 col-lg-6">
                        <div className='form-group mb-0'>
                            <Field
                                label={formatMessage({
                                    id: 'createAccount.lastName',
                                    defaultMessage: 'Last Name*'
                                })}
                            >
                                <TextInput
                                    field="customer.lastname"
                                    autoComplete="family-name"
                                    validate={combine([
                                        (value) => isRequired(value, 'Last Name'),
                                        [hasLengthAtMost, nameMaxLength],
                                        [hasLengthAtLeast, nameMinLength],
                                        validateName
                                    ])}
                                    validateOnBlur
                                    validateOnChange
                                    formtype={'register'}
                                />
                            </Field>
                        </div>

                    </div>
                    <div className="col-12 col-sm-6 col-md-12 col-lg-6">
                        <div className='form-group mb-0'>
                            <Field
                                label={formatMessage({
                                    id: 'createAccount.email',
                                    defaultMessage: 'Email*'
                                })}
                            >
                                <TextInput
                                    field="customer.Email"
                                    name='Email'
                                    autoComplete="Email"
                                    validate={combine([
                                        (value) => isRequired(value, 'Email'),
                                        validateEmail
                                    ])}
                                    validateOnBlur
                                    maxLength={70}
                                    validateOnChange
                                    formtype={'register'}
                                />
                            </Field>
                        </div>
                    </div>
                    <div className="col-12 col-sm-6 col-md-12 col-lg-6">
                        <div className='form-group mb-0'>
                            <Field
                                label={formatMessage({
                                    id: 'createAccount.mobile_number',
                                    defaultMessage: 'Mobile Number*'
                                })}
                            >
                                <TextInput
                                    field="customer.mobilenumber"
                                    autoComplete="phone"
                                    validate={combine([
                                        value => isRequired(value, 'Moblie Number', mobileNumberLength),
                                        value => checkOnlyNumberAllow(value, 'Moblie Number')
                                    ])}
                                    validateOnBlur
                                    validateOnChange
                                    maxLength={mobileNumberLength}
                                    formtype={'register'}
                                    disabled={mobileNumber}
                                />
                            </Field>
                        </div>
                    </div>
                    <div className="col-12 col-sm-6 col-md-12 col-lg-6">
                        <div className="form-group mb-0">
                            <GoogleCaptcha
                                ref={captchaToken}
                            />
                            <Field
                                label={formatMessage({
                                    id: 'createAccount.date_of_birth',
                                    defaultMessage: 'Date Of Birth'
                                })}
                            >
                                {/* <TextInput
                            type='date'
                            field="customer.bod"
                            autoComplete="brith-of-date"
                            validate={(value) => isRequired(value, 'Date Of Birth', null, newDate)}
                            validateOnBlur
                            max={newDate}
                        /> */}
                                <input type='date' field="customer.bod" max={newDate} onChange={(e) => handleDateChange(e)}
                                    className={`${defaultClasses.input} ${maxDate && new Date(newDate) < new Date(maxDate) && defaultClasses.input_error}`} />
                                {/* <p>{new Date(newDate) < new Date(maxDate) && "InValid Date"}</p> */}
                                {
                                    maxDate && new Date(newDate) < new Date(maxDate) && <Message dateError="Invalid date." />
                                }
                            </Field>
                        </div>
                    </div>
                    <div className="col-12 col-sm-6 col-md-12 col-lg-6">
                        <div className="form-group mb-0">
                            <Field
                                label={formatMessage({
                                    id: 'createAccount.gender',
                                    defaultMessage: 'Gender',
                                    autoComplete: "gender",
                                    validate: { isRequired },
                                })}
                            >
                                <div className={classes.gender} onChange={handleChange}>
                                    <div className={classes.formCheck}>
                                        <input className="form-check-input" type="radio" name="exampleRadios" id="male" value={1} checked={genderCheck === 1} />
                                        <label className="form-check-label" htmlFor="male">male</label>
                                    </div>
                                    <div className={classes.formCheck}>
                                        <input className="form-check-input" type="radio" name="exampleRadios" id="female" value={2} checked={genderCheck === 2} />
                                        <label className="form-check-label" htmlFor="female" style={{ marginRight: '28px' }}>female</label>
                                    </div>
                                    <div className={classes.formCheck} >
                                        <input className="form-check-input" type="radio" name="exampleRadios" id="other" value={3} checked={genderCheck === 3} />
                                        <label className="form-check-label" htmlFor="other" >Other</label>
                                    </div>
                                </div>
                            </Field>
                        </div>

                    </div>
                    <div className="col-12">
                        <div className="form-group mb-0">
                            <Password
                                // autoComplete="new-password"
                                fieldName="new_password"
                                isToggleButtonHidden={false}
                                label={formatMessage({
                                    id: 'createAccount.password',
                                    defaultMessage: 'Password*'
                                })}
                                validate={combine([
                                    (value) => isRequired(value, 'Password'),
                                    // [hasLengthAtLeast, passwordMaxLength],
                                    // (value) => validatePassword(value, char, number, uppercase, lowercase, 'password'),
                                    validateConfirmPassword
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
                                validateOnChange
                            />
                            <div className='row pt-2'>
                                <div className="col-md-12">
                                    <div className={classes.password_message}>
                                        <p className={char ? classes.passGreenTick : classes.passValidations} >8 Characters

                                        </p>
                                        <p className={uppercase ? classes.passGreenTick : classes.passValidations}>1 Uppercase


                                        </p>
                                        <p className={lowercase ? classes.passGreenTick : classes.passValidations}>1 Lowercase

                                        </p>
                                        <p className={number ? classes.passGreenTick : classes.passValidations}>1 Number </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12">
                        <div className="form-group mb-0">
                            <Password
                                // autoComplete="new-password"
                                fieldName="password"
                                // isToggleButtonHidden={false}
                                label={formatMessage({
                                    id: 'createAccount.confirmPassword',
                                    defaultMessage: 'Confirm Password'
                                })}
                                validate={combine([
                                    (value) => isRequired(value, 'Confirm Password'),
                                    // [hasLengthAtLeast, passwordMaxLength],
                                    // (value) => validatePassword(value, char, number, uppercase, lowercase, 'cPassword'),
                                    validateConfirmPassword
                                ])}
                                validateOnBlur
                                maxLength={passwordMaxLength}
                                validateOnChange
                                formtype={'register'}

                            />
                        </div>
                    </div>
                </div>



                <div className={classes.subscribe}>
                </div>
                <div className="form-group mb-0">
                    <div className={classes.checkbox_input}>
                        <div className={classes.t_and_c}>
                            <Checkbox
                                id="terms_conditions"
                                onClick={() => {
                                    setIsChecked(!isChecked);
                                }}
                                // validate={(value) => isRequired(value, ' Terms & Conditions')}
                                field="terms_conditions"
                                label={<span className={classes.condiotion_text}>Yes, email me offers, styles updates and special invites to sales and events.</span>}
                                isDisplayOwnLabel={true}
                            />
                        </div>
                    </div>
                    <p>To give you the full membership experience, we will process your personal data in accordance with the 999Tee's <a href="/privacy-policy" target="_blank" className={classes.create_account_term_and_condition}>Privacy Policy</a> Notice.</p>
                    <div className={classes.subscribe} validate={(value) => isRequired(value, 'Checked')}>
                        <p className='pt-2'>By clicking SUBMIT button, I agree to the <a href="/terms-conditions" target="_blank" className={classes.create_account_term_and_condition}>Terms & Conditions</a> of the 999Tee.</p>
                    </div>
                </div>
                <div className="form-group mb-0">
                    <div className={classes.actions}>{submitButton}</div>
                </div>

                {/* <div className={classes.subscribe} validate={isRequired}>
                    <Checkbox
                        id="assistance_allowed"
                        onClick={() => {
                            setIsChecked(!isChecked);
    
    .                    }}
                        field="assistance_allowed"
                        label={formatMessage({
                            id: 'createAccount.assistance',
                            defaultMessage: 'Allow remote shopping assistance'
                        })}
                    />
                </div> */}

            </Form>
            <div className={signClasses.create_account_div}>
                <h3 className={signClasses.title}>
                    <FormattedMessage
                        id={'createAccount.checkSignIn'}
                        defaultMessage={`Already a Member?`}
                    />
                </h3>
                <div className={signClasses.buttonsContainer}>
                    <Button
                        priority="normal"
                        type="button"
                        onClick={() => {
                            onCancel()
                            dispatch({ type: "MOBILE_NUMBER", payload: { mobileNumber: "" } })
                        }}
                    >
                        <FormattedMessage
                            id={'createAccount.signup_button'}
                            defaultMessage={'Sign In'}
                        />
                    </Button>
                </div>
            </div>
        </div>
    );
};

CreateAccount.propTypes = {
    classes: shape({
        actions: string,
        lead: string,
        root: string,
        subscribe: string
    }),
    initialValues: shape({
        Email: string,
        firstName: string,
        lastName: string,
        mobile_number: string,
        gender: number
    }),
    isCancelButtonHidden: bool,
    onSubmit: func.isRequired,
    onCancel: func
};

CreateAccount.defaultProps = {
    onCancel: () => { },
    isCancelButtonHidden: true
};

export default CreateAccount;

