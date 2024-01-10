import React, { useContext, useRef, useState, useEffect } from 'react'
import { Form, TextArea } from 'informed';
import { FormattedMessage, useIntl } from 'react-intl';
import { mergeClasses } from '../../classify';
import defaultClasses from './createAccount.css';
import signClasses from '../SignIn/signIn.css';
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
    gstNumberLength,
    // taxNumberLength,
    // validateUrlLink,
    validateGstNumber,
    passwordMaxLength,
    validateNotNumber,
    postalCodeMaxLength,
    checkOnlyNumberAllowForPinCode,
    validateCINNumber,
    cinNumberLength
} from '../../util/formValidators';
import Button from '../Button';
import Checkbox from '../Checkbox';
import Field, { Message } from '../Field';
import TextInput from '../TextInput';
import FormError from '../FormError';
import Password from '../Password';
// import Icon from '../Icon';
// import { X as ClearIcon, Check } from 'react-feather';
import { globalContext } from '../../peregrine/lib/context/global';
import GoogleCaptcha from '../GoogleCaptcha/googleCaptcha';
// import { useUserContext } from '@magento/peregrine/lib/context/user';
import CREATE_ACCOUNT_MUTATION from '../../queries/createAccount.graphql';
import CREATE_CART_MUTATION from '../../queries/createCart.graphql';
import GET_CART_DETAILS_QUERY from '../../queries/getCartDetails.graphql';
import GET_CUSTOMER_QUERY from '../../queries/getCustomer.graphql';
import SIGN_IN_MUTATION from '../../queries/signIn.graphql';
import { mergeCartsMutation } from '../../queries/mergeCarts.gql';
import AssignToCustomerMutation from '../../queries/assignCompareListToCustomer.graphql';
import { useCreateAccount } from '../../peregrine/lib/talons/CreateAccount/useCreateAccount';
// import GooglePlaces from '../GooglePlaces';
import Region from '../Region';
import Country from '../Country';
import Postcode from '../Postcode';

export default function SignUpWithB2B(props) {
    const [isChecked, setIsChecked] = useState(false);
    const [genderCheck, setGenderCheck] = useState(1)
    const [char, setChar] = useState(false)
    const [uppercase, setUppercase] = useState(false)
    const [lowercase, setLowerCase] = useState(false)
    const [number, setNumber] = useState(false)
    // const [addressData, setAddressData] = useState();
    const [pincodeStatus, setPincodeStatus] = useState(false)
    // const [googleApiData, setGoogleApiData] = useState({
    //     state: '',
    //     city: '',
    //     pincode: '',
    // })
    const [regionInfo, setRegionInfo] = useState([])
    const [maxDate, setMaxDate] = useState('');

    const handleDateChange = (event) => {
        // update the max date based on the selected date
        setMaxDate(event.target.value);
    };

    const { onCancel,
        B2BRegister,
        setSignUpSuccessMessage,
        handleRedirectToLogin,
        setB2BRegister,
        b2bConfigStoreInfo
    } = props

    const classes = mergeClasses(defaultClasses, props.classes);
    const { formatMessage } = useIntl();

    const captchaToken = useRef(null)
    const formRef = useRef(null);

    const { state, dispatch } = useContext(globalContext);
    const mobileNumber = state && state.mobileNumber && state.mobileNumber.mobileNumber

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
        dispatch,
        B2BRegister,
        handleRedirectToLogin,
        setB2BRegister
    });

    const {
        errors,
        handleSubmit,
        isDisabled,
        isSignedIn,
        initialValues,
        confirmation_required,
        B2BData
    } = talonProps;

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();
    const newDate = yyyy + '-' + mm + '-' + dd;

    const handleChange = (e) => {
        setGenderCheck(Number(e.target.value))
    }

    async function handleFormSubmit(e) {
        const resultToken = await captchaToken.current.getToken()
        handleSubmit(e, resultToken, regionInfo, maxDate)
    }

    const submitButton = (
        <Button
            className={classes.submitButton}
            disabled={!char || !uppercase || !lowercase || !number || !pincodeStatus}
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

    // useEffect(() => {
    //     if (
    //         addressData &&
    //         addressData.address_components &&
    //         addressData.address_components.length
    //     ) {
    //         const placeApiStreetAddress = addressData.name;
    //         const placeApiStreetAddress1 = addressData.vicinity;

    //         const placeAPiState = addressData.address_components.find(
    //             state => state.types[0] === 'administrative_area_level_1'
    //         );

    //         const placeAPiCity = addressData.address_components.find(
    //             city => city.types[0] === 'locality'
    //         );

    //         const placeAPiPinCode = addressData.address_components.find(
    //             pincode => pincode.types[0] === 'postal_code'
    //         );

    //         const placeAPiCountry = addressData.address_components.find(
    //             country => country.types[0] === 'country'
    //         );

    //         if (formRef && formRef.current) {
    //             placeAPiCountry &&
    //                 placeAPiCountry.short_name &&
    //                 formRef.current.setValue(
    //                     'country',
    //                     placeAPiCountry.short_name
    //                 );

    //             formRef.current.setValue(
    //                 'street[0]',
    //                 placeApiStreetAddress && placeApiStreetAddress1
    //                     ? `${placeApiStreetAddress}, ${placeApiStreetAddress1}`
    //                     : placeApiStreetAddress
    //                         ? placeApiStreetAddress
    //                         : placeApiStreetAddress1
    //                             ? placeApiStreetAddress1
    //                             : ''
    //             );

    //             setGoogleApiData({
    //                 state:
    //                     placeAPiState && placeAPiState.short_name
    //                         ? placeAPiState.short_name
    //                         : '',
    //                 city:
    //                     placeAPiCity && placeAPiCity.long_name
    //                         ? placeAPiCity.long_name
    //                         : '',
    //                 pincode:
    //                     placeAPiPinCode && placeAPiPinCode.long_name
    //                         ? placeAPiPinCode.long_name
    //                         : ''
    //             });
    //         }
    //     }
    // }, [addressData]);

    // useEffect(() => {
    //     if (googleApiData && googleApiData.state) {
    //         googleApiData.state &&
    //             formRef.current.setValue('region', googleApiData.state);

    //         googleApiData.city &&
    //             formRef.current.setValue('city', googleApiData.city);

    //         googleApiData.pincode &&
    //             formRef.current.setValue('postcode', googleApiData.pincode);
    //         setGoogleApiData({
    //             state: '',
    //             city: '',
    //             pincode: ''
    //         });
    //     }
    // }, [googleApiData]);

    if (isSignedIn) {
        return <Redirect to="/" />;
    }

    return (
        <div>
            <h2 className={classes.title}>
                <FormattedMessage
                    id="signIn.registerB2B"
                    defaultMessage={b2bConfigStoreInfo?.bssB2bRegistrationStoreConfig?.title}
                />
            </h2>
            <Form
                className={classes.root + ' ' + 'p-0'}
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
                {confirmation_required || B2BData && (
                    <div className={defaultClasses.success_msg}>
                        Please check your email and confirm your account.
                    </div>
                )}
                <h4 className={classes.title}>
                    <FormattedMessage
                        id="signIn.registerBusinessAddressInfo"
                        defaultMessage={`Personal Information`}
                    />
                </h4>
                {/* <span>error:
                    {createAccountWithB2BError?.message}
                </span> */}
                <FormError errors={Array.from(errors.values())} />
                <GoogleCaptcha
                    ref={captchaToken}
                />
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
                            <Field
                                label={formatMessage({
                                    id: 'createAccount.date_of_birth',
                                    defaultMessage: 'Date Of Birth'
                                })}
                            >
                                {/* <TextInput type='date'
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
                <h4 className={classes.title}>
                    <FormattedMessage
                        id="signIn.registerBusinessAddressInfo"
                        defaultMessage={`Company Information`}
                    />
                </h4>
                {/* <Field
                    label={formatMessage({
                        id: 'createAccount.twitter_link',
                        defaultMessage: 'Twitter Link'
                    })}
                >
                    <TextInput
                        field="customer.twitter_link"
                        name='Twitter Link'
                        autoComplete="Twitter Link"
                        validate={validateUrlLink}
                        validateOnBlur
                        // maxLength={70}
                        validateOnChange
                        formtype={'register'}
                    />
                </Field>
                <Field
                    label={formatMessage({
                        id: 'createAccount.facebook_link',
                        defaultMessage: 'Facebook Link'
                    })}
                >
                    <TextInput
                        field="customer.facebook_link"
                        name='Facebook Link'
                        autoComplete="Facebook Link"
                        validate={validateUrlLink}
                        validateOnBlur
                        // maxLength={70}
                        validateOnChange
                        formtype={'register'}
                    />
                </Field>
                <Field
                    label={formatMessage({
                        id: 'createAccount.insta_link',
                        defaultMessage: 'Instagram Link'
                    })}
                >
                    <TextInput
                        field="customer.insta_link"
                        name='Instagram Link'
                        autoComplete="Instagram Link"
                        validate={validateUrlLink}
                        validateOnBlur
                        // maxLength={70}
                        validateOnChange
                        formtype={'register'}
                    />
                </Field> */}
                <div className="row form_row">
                    <div className="col-12">
                        <Field
                            label={formatMessage({
                                id: 'createAccount.company',
                                defaultMessage: 'Company Name*'
                            })}
                        >
                            <TextInput
                                field="customer.company"
                                autoComplete="given-name"
                                validate={
                                    (value) => isRequired(value, 'Comapny Name')
                                }
                                validateOnBlur
                                validateOnChange
                                formtype={'register'}
                            />
                        </Field>
                    </div>
                    <div className="col-12 col-sm-6 col-md-12 col-lg-6">
                        <Field
                            label={formatMessage({
                                id: 'createAccount.gst_number',
                                defaultMessage: 'GSTIN/UNI Number'
                            })}
                        >
                            <TextInput
                                field="customer.gst_number"
                                autoComplete="gst_number"
                                validate={combine([
                                    validateGstNumber
                                ])}
                                validateOnBlur
                                maxLength={gstNumberLength}
                                formtype={'register'}
                                validateOnChange
                            // disabled={mobileNumber}
                            />
                        </Field>
                    </div>
                    <div className="col-12 col-sm-6 col-md-12 col-lg-6">
                        <Field
                            label={formatMessage({
                                id: 'createAccount.cin',
                                defaultMessage: 'CIN Number'
                            })}
                        >
                            <TextInput
                                field="customer.cin_number"
                                name='CIN Number'
                                autoComplete="CIN Number"
                                validate={combine([
                                    validateCINNumber,
                                    // value => isRequired(value, 'CNI Number', cniNumberLength),
                                ])}
                                validateOnBlur
                                maxLength={cinNumberLength}
                                formtype={'register'}
                                validateOnChange
                            />
                        </Field>
                    </div>
                    <div className="col-12">
                        {/* <GooglePlaces setAddressData={setAddressData} /> */}
                        <Field
                            label="Street Address*"
                            required={true}>
                            <TextInput
                                field="street[0]"
                                autoComplete="family-name"
                                validate={value => isRequired(value, 'Street Address')}
                                validateOnBlur
                            />
                        </Field>
                    </div>
                    <div className="col-12 col-sm-6 col-md-12 col-lg-6">
                        <Postcode
                            validateOnChange
                            validate={combine([
                                value => isRequired(value, 'Pincode', postalCodeMaxLength),
                                value => checkOnlyNumberAllowForPinCode(value, 'Pincode')
                            ])}
                            validateOnBlur formtype={'checkout'}
                            setPincodeStatus={
                                setPincodeStatus
                            }
                            // googleApiData={googleApiData}
                            maxLength={postalCodeMaxLength}
                        />
                    </div>
                    <div className="col-12 col-sm-6 col-md-12 col-lg-6">
                        <Field
                            id="city"
                            label={formatMessage({
                                id: 'global.city',
                                defaultMessage: 'City*'
                            })}
                        >
                            <TextInput
                                field="city"
                                id="city"
                                validate={combine([
                                    validateNotNumber,
                                    value => isRequired(
                                        value,
                                        'Street Address'
                                    ),
                                ])}
                                validateOnChange
                                validateOnBlur
                            />
                        </Field>
                    </div>

                    <div className="col-12 col-sm-6 col-md-12 col-lg-6">
                        <Region
                            validate={value => isRequired(value, 'State')}
                            validateOnBlur
                            validateOnChange
                            setRegions={setRegionInfo}
                            regions={regionInfo}
                        />
                    </div>
                    <div className="col-12 col-sm-6 col-md-12 col-lg-6">
                        <Country
                            validate={value => isRequired(value, 'Country')}
                            validateOnBlur
                            validateOnChange
                            onValueChange={() => {
                                if (formRef && formRef.current) {
                                    formRef.current.setValue('region', '');
                                }
                            }}
                        />
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

            </Form>
            <div className={signClasses.create_account_div}>
                <h3 className={signClasses.title + ' ' + 'mt-2'}>
                    <FormattedMessage
                        id={'createAccount.checkSignIn'}
                        defaultMessage={`Already a Member?`}
                    />
                </h3>
                <div className={signClasses.buttonsContainer}>
                    <Button
                        priority="normal"
                        type="button"
                        disabled={isDisabled}
                        onClick={() => {
                            handleRedirectToLogin()
                            setB2BRegister(false)
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
    )
}
