import React, {
    Fragment,
    useEffect,
    useRef,
    useState,
    useContext
} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Form/* , useFieldState */ } from 'informed';
import { func, shape, string, arrayOf, bool } from 'prop-types';
import { useGuestForm } from 'src/peregrine/lib/talons/CheckoutPage/ShippingInformation/AddressForm/useGuestForm';
import Checkbox from '../../../Checkbox';
import { useLazyQuery } from '@apollo/client';
import { mergeClasses } from '../../../../classify';
import { useSignIn } from '../../../../peregrine/lib/talons/SignIn/useSignIn';
import {
    isRequired,
    validateName,
    nameMinLength,
    nameMaxLength,
    hasLengthAtMost,
    hasLengthAtLeast,
    mobileNumberLength,
    postalCodeMaxLength,
    checkOnlyNumberAllow,
    validateEmail,
    validateConfirmEmail,
    checkOnlyNumberAllowForPinCode,
    validateNotNumber
} from '../../../../util/formValidators';
import combine from '../../../../util/combineValidators';
import Button from '../../../Button';
import Country from '../../../Country';
import Field, { Message } from '../../../Field';
import FormError from '../../../FormError';
import Region from '../../../Region';
import Postcode from '../../../Postcode';
import TextInput from '../../../TextInput';
import defaultClasses from './guestForm.css';
import GuestFormOperations from './guestForm.gql';
import { CHECKOUT_STEP } from 'src/peregrine/lib/talons/CheckoutPage/useCheckoutPage';
// import GooglePlaces from '../../../GooglePlaces';
import EMAIL_AVAILABLE from '../../../../queries/emailAvailable.graphql';
import Password from '../../../Password';
import CREATE_CART_MUTATION from '../../../../queries/createCart.graphql';
import GET_CUSTOMER_QUERY from '../../../../queries/getCustomer.graphql';
import { GET_CART_DETAILS_QUERY } from '../../../SignIn/signIn.gql';
import SIGN_IN_MUTATION from '../../../../queries/signIn.graphql';
import AssignToCustomerMutation from '../../../../queries/assignCompareListToCustomer.graphql';
import { mergeCartsMutation } from '../../../../queries/mergeCarts.gql';
import GoogleCaptcha from '../../../GoogleCaptcha/googleCaptcha';
import { globalContext } from '../../../../peregrine/lib/context/global';

const GuestForm = props => {
    const formRef = useRef(null);
    const captchaToken = useRef(null);
    const { dispatch } = useContext(globalContext);

    const [isChecked, setIsChecked] = useState(false);
    // const [addressData, setAddressData] = useState();
    // const [googleApiData, setGoogleApiData] = useState({
    //     state: '',
    //     city: '',
    //     pincode: '',
    // })
    const [isEmailExists, setEmailExists] = useState(true)
    const [isValid, setIsValid] = useState(false)
    const [/* error, */ setError] = useState('')
    const [pincodeStatus, setPincodeStatus] = useState(false)

    const {
        afterSubmit,
        classes: propClasses,
        onCancel,
        shippingData,
        isDisableSubmitButton = false,
        setCheckoutStep = () => { },
        setemailNewsLetter = () => { },
        setSubscribeNewsLetter = () => { },
        derivedPrimaryEmail = '',
        setIsEmail = () => { },
        setIsSignInCheckout = () => { }
    } = props;

    const talonProps = useGuestForm({
        afterSubmit,
        ...GuestFormOperations,
        onCancel,
        shippingData,
        formRef,
        isChecked,
        derivedPrimaryEmail
    });
    const {
        errors,
        handleCancel,
        handleSubmit,
        initialValues,
        isSaving,
        isUpdate
    } = talonProps;

    const { formatMessage } = useIntl();
    const classes = mergeClasses(defaultClasses, propClasses);
    const signInTalonProps = useSignIn({
        createCartMutation: CREATE_CART_MUTATION,
        customerQuery: GET_CUSTOMER_QUERY,
        getCartDetailsQuery: GET_CART_DETAILS_QUERY,
        signInMutation: SIGN_IN_MUTATION,
        assignMutation: AssignToCustomerMutation,
        mergeCartsMutation,
        setIsValid,
        setError,
        setIsSignInCheckout
    });
    useEffect(() => {
        if (!isEmailExists) {
            setIsEmail(true);
        } else if (isEmailExists) {
            setIsEmail(false);
        }
    }, [isEmailExists]);

    const {
        handleSubmit: handleSignInSubmit,
        errors: signInError
    } = signInTalonProps;

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

    const guestEmailMessage = !isUpdate ? (
        <Message>
            <FormattedMessage
                id={'guestForm.emailMessage'}
                defaultMessage={
                    'Set a password at the end of guest checkout to create an account in one easy step.'
                }
            />
        </Message>
    ) : null;

    // const cancelButton = isUpdate ? (
    //     <Button disabled={isSaving} onClick={handleCancel} priority="low">
    //         <FormattedMessage
    //             id={'global.cancelButton'}
    //             defaultMessage={'Cancel'}
    //         />
    //     </Button>
    // ) : null;
    const submitButtonText = isUpdate
        ? formatMessage({
            id: 'global.updateButton',
            defaultMessage: 'Update'
        })
        : formatMessage({
            id: 'guestForm.continueToNextStep',
            defaultMessage: 'Save Address'
        });
    const submitButtonProps = {
        disabled: isSaving || isDisableSubmitButton || !pincodeStatus,
        priority: isUpdate ? 'high' : 'high',
        type: 'submit'
    };
    useEffect(() => {
        if (
            formRef &&
            formRef.current &&
            formRef.current.getValue('email') &&
            isChecked === true
        ) {
            setemailNewsLetter(
                formRef.current && formRef.current.getValue('email')
            );
            setSubscribeNewsLetter(isChecked);
        }
    }, [
        formRef &&
        formRef.current &&
        formRef.current.getValue('email') &&
        isChecked === true
    ]);
    const [emailAvailable, { data: emailAvailableFlag }] = useLazyQuery(
        EMAIL_AVAILABLE,
        {
            fetchPolicy: 'no-cache',
            variables: {
                email:
                    formRef &&
                    formRef.current &&
                    formRef.current.getValue('email')
            }
            // onCompleted: (data) => {
            //     console.log('data', data)
            //     if (data && data.isEmailAvailable && data.isEmailAvailable.is_email_available ) {
            //         setEmailExists(data.isEmailAvailable.is_email_available)
            //     }
            // }
        }
    );
    useEffect(() => {
        if (emailAvailableFlag && emailAvailableFlag.isEmailAvailable) {
            setEmailExists(
                emailAvailableFlag.isEmailAvailable.is_email_available
            );
        }
    }, [emailAvailableFlag]);
    const handleEmailExists = email => {
        if (email) {
            emailAvailable({ variables: { email } });
        }
    };

    useEffect(() => {
        if (isValid) {
            setTimeout(() => {
                setIsValid(false);
            }, 2000);
        }
    }, [isValid]);

    // useEffect(() => {
    //     dispatch({
    //         type: 'GOOGLE_CAPTCHA',
    //         payload: {captchaToken : captchaToken}
    //     })
    // },[captchaToken])

    async function handleFormSubmit(e) {
        const resultToken = await captchaToken.current.getToken();
        handleSignInSubmit({
            ...e,
            email: formRef.current.getValue('email'),
            password: formRef.current.getValue('password'),
            type: 'checkout',
            cpatchaToken: resultToken
        });
    }

    return (
        <Fragment>
            <FormError errors={Array.from(errors.values())} />
            <FormError errors={Array.from(signInError.values())} rich={true} />

            <Form
                className={classes.root}
                initialValues={initialValues}
                onValueChange={() => {
                    if (isDisableSubmitButton) {
                        setCheckoutStep(CHECKOUT_STEP.SHIPPING_ADDRESS);
                    }
                }}
                onSubmit={handleSubmit}
                ref={formRef}
                getApi={value => (formRef.current = value)}
            >
                <GoogleCaptcha ref={captchaToken} />
                <div className={classes.email + ' ' + classes.shop_login}>
                    <Field
                        id="email"
                        label={formatMessage({
                            id: 'global.email',
                            defaultMessage: 'Email*'
                        })}
                    >
                        <TextInput
                            field="email"
                            id="email"
                            // validate={value => isRequired(value, 'Email')}
                            validate={combine([
                                value => isRequired(value, 'Email'),
                                validateEmail
                            ])}
                            // validateOnBlur
                            validateOnChange
                            validateOnBlur
                            formtype={'checkout'}
                        />
                    </Field>
                    {!isEmailExists ? (
                        <>
                            <Password
                                fieldName="password"
                                label={formatMessage({
                                    id: 'signIn.Password',
                                    defaultMessage: 'Password'
                                })}
                                // validate={(value) => validatePassword(value, '', '', '', '', 'signInPassword')}
                                // validate={(value) => isRequired(value, 'Password')}
                                autoComplete="password"
                                isToggleButtonHidden={false}
                                // validateOnBlur
                                // validateOnChange
                                type="checkoutPassword"
                            />
                            <div
                                className={
                                    defaultClasses.sign_in_section_wrapper
                                }
                            >
                                <Button
                                    priority="high"
                                    onClick={async e => {
                                        dispatch({
                                            type:
                                                'IS_SIGNIN_FROM_CHECKOUT_PAGE',
                                            payload: true
                                        });
                                        await handleFormSubmit(e);
                                    }}
                                    disabled={isValid}
                                >
                                    <FormattedMessage
                                        id={'cartPage.signInLink'}
                                        defaultMessage={'Sign In'}
                                    />
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Field
                                id="confirmEmail"
                                label={formatMessage({
                                    id: 'global.confirmEmail',
                                    defaultMessage: 'Confirm Email*'
                                })}
                            >
                                <TextInput
                                    field="confirmEmail"
                                    id="confirmEmail"
                                    validate={combine([
                                        value =>
                                            isRequired(value, 'Confirm Email'),
                                        validateConfirmEmail
                                    ])}
                                    validateOnChange
                                    validateOnBlur
                                    formtype={'checkout'}
                                    onPaste={e => e.preventDefault()}
                                    autoComplete="new-password"
                                    onBlur={() => {
                                        if (
                                            formRef.current &&
                                            !formRef.current.getError(
                                                'confirmEmail'
                                            )
                                        ) {
                                            handleEmailExists(
                                                formRef.current.getValue(
                                                    'email'
                                                )
                                            );
                                        }
                                    }}
                                />
                            </Field>
                        </>
                    )}

                    <Checkbox
                        //   id="is_subscribe1"
                        className={classes.is_subscribe1}
                        field=""
                        label={
                            <span>For daily updates, please subscribe.</span>
                        }
                        isDisplayOwnLabel={true}
                        onClick={() => {
                            setIsChecked(!isChecked);
                        }}
                    />
                    {guestEmailMessage}
                </div>
                <div style={{ display: 'flex', gap: '10px', }}>
                    <div style={{ width: '50%' }} className={classes.firstname}>
                        <Field
                            id="firstname"
                            label={formatMessage({
                                id: 'global.firstName',
                                defaultMessage: 'First Name*'
                            })}
                        >
                            <TextInput
                                field="firstname"
                                id="firstname"
                                validate={combine([
                                    value => isRequired(value, 'First Name'),
                                    [hasLengthAtMost, nameMaxLength],
                                    [hasLengthAtLeast, nameMinLength],
                                    validateName
                                ])}
                                validateOnBlur
                            />
                        </Field>
                    </div>
                    <div style={{ width: '50%' }} className={classes.lastname}>
                        <Field
                            id="lastname"
                            label={formatMessage({
                                id: 'global.lastName',
                                defaultMessage: 'Last Name*'
                            })}
                        >
                            <TextInput
                                field="lastname"
                                id="lastname"
                                validate={combine([
                                    value => isRequired(value, 'Last Name'),
                                    [hasLengthAtMost, nameMaxLength],
                                    [hasLengthAtLeast, nameMinLength],
                                    validateName
                                ])}
                                validateOnBlur
                            />
                        </Field>
                    </div>
                </div>
                <div className={classes.telephone}>
                    <Field
                        id="telephone"
                        label={formatMessage({
                            id: 'global.phoneNumber',
                            defaultMessage: 'Mobile Number*'
                        })}
                    >
                        <TextInput
                            field="telephone"
                            id="telephone"
                            validate={combine([
                                value =>
                                    isRequired(
                                        value,
                                        'Mobile Number',
                                        mobileNumberLength
                                    ),
                                value =>
                                    checkOnlyNumberAllow(value, 'Mobile Number')
                            ])}
                            validateOnBlur
                            validateOnChange
                            formtype={'checkout'}
                            maxLength={mobileNumberLength}
                        />
                    </Field>

                </div>

                <div className={classes.street0}>
                    <Field
                        id="street0"
                        label={formatMessage({
                            id: 'global.streetAddress',
                            defaultMessage: 'Street Address*'
                        })}
                    >
                        <TextInput
                            field="street[0]"
                            id="street0"
                            validate={value =>
                                isRequired(value, 'Street Address')
                            }
                            validateOnBlur
                        />
                    </Field>
                    {/* <GooglePlaces setAddressData={setAddressData} /> */}
                </div>
                <div className={classes.street1}>
                    <Field
                        id="street1"
                        label={formatMessage({
                            id: 'global.streetAddress2',
                            defaultMessage: 'Street Address 2'
                        })}
                    >
                        <TextInput
                            field="street[1]"
                            id="street1"
                            placeholder="Optional"
                        />
                    </Field>
                </div>
                <div className={classes.postcode}>
                    <Postcode
                        validateOnChange
                        validate={combine([
                            value => isRequired(value, 'Pincode', postalCodeMaxLength),
                            value => checkOnlyNumberAllowForPinCode(value, 'Pincode')
                        ])}
                        validateOnBlur
                        formtype={'checkout'}
                        setPincodeStatus={
                            setPincodeStatus
                        }
                        // googleApiData={googleApiData}
                        maxLength={postalCodeMaxLength}
                    />
                </div>
                <div className={classes.city}>
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
                <div className={classes.region}>
                    <Region
                        validate={value => isRequired(value, 'State')}
                        validateOnBlur
                        validateOnChange
                    />
                </div>
                <div className={classes.country}>
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
                <div className={classes.shop_button_wrap}>
                    {/* {cancelButton} */}
                    <Button {...submitButtonProps}>
                        {submitButtonText}
                    </Button>
                </div>
            </Form>
        </Fragment>
    );
};

export default GuestForm;

GuestForm.defaultProps = {
    shippingData: {
        country: {
            code: DEFAULT_COUNTRY_CODE
        },
        region: {
            code: ''
        }
    }
};

GuestForm.propTypes = {
    afterSubmit: func,
    classes: shape({
        root: string,
        field: string,
        email: string,
        firstname: string,
        lastname: string,
        country: string,
        street0: string,
        street1: string,
        city: string,
        region: string,
        postcode: string,
        telephone: string,
        buttons: string,
        submit: string,
        submit_update: string
    }),
    onCancel: func,
    shippingData: shape({
        city: string,
        country: shape({
            code: string.isRequired
        }).isRequired,
        email: string,
        firstname: string,
        lastname: string,
        postcode: string,
        region: shape({
            code: string.isRequired
        }).isRequired,
        street: arrayOf(string),
        telephone: string
    }),
    isDisableSubmitButton: bool,
    setCheckoutStep: func
};
