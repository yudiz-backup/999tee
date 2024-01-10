import React, { Fragment, useRef, useState, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Form, Text } from 'informed';
import { arrayOf, bool, func, number, shape, string } from 'prop-types';
import { useCustomerForm } from 'src/peregrine/lib/talons/CheckoutPage/ShippingInformation/AddressForm/useCustomerForm';
import { CHECKOUT_STEP } from 'src/peregrine/lib/talons/CheckoutPage/useCheckoutPage';
import { mergeClasses } from '../../../../classify';
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
    validateNotNumber
} from '../../../../util/formValidators';
import combine from '../../../../util/combineValidators';
import Button from '../../../Button';
import Checkbox from '../../../Checkbox';
import Country from '../../../Country';
import Field, { Message } from '../../../Field';
import FormError from '../../../FormError';
import Region from '../../../Region';
import Postcode from '../../../Postcode';
import TextInput from '../../../TextInput';
import defaultClasses from './customerForm.css';
import CustomerFormOperations from './customerForm.gql';
import LoadingIndicator from '../../../LoadingIndicator';
// import GooglePlaces from '../../../GooglePlaces';

const CustomerForm = props => {
    // const [addressData, setAddressData] = useState();
    const [regions, setRegions] = useState([]);
    // const [googleApiData, setGoogleApiData] = useState({
    //     state: '',
    //     city: '',
    //     pincode: '',
    // })

    const formRef = useRef(null);
    const {
        afterSubmit,
        classes: propClasses,
        onCancel,
        shippingData,
        setCheckoutStep = () => { },
        isDisableSubmitButton = false
    } = props;

    const talonProps = useCustomerForm({
        afterSubmit,
        ...CustomerFormOperations,
        onCancel,
        shippingData
    });
    const {
        errors,
        handleCancel,
        handleSubmit,
        hasDefaultShipping,
        initialValues,
        isLoading,
        isSaving,
        isUpdate
    } = talonProps;
    const { formatMessage } = useIntl();
    const [pincodeStatus, setPincodeStatus] = useState(false)

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
    //                 placeApiStreetAddress && placeApiStreetAddress1 ? `${placeApiStreetAddress}, ${placeApiStreetAddress1}` : placeApiStreetAddress ? placeApiStreetAddress : placeApiStreetAddress1 ? placeApiStreetAddress1 : ''
    //             );

    //             setGoogleApiData({
    //                 state: placeAPiState && placeAPiState.short_name ? placeAPiState.short_name : '',
    //                 city: placeAPiCity && placeAPiCity.long_name ? placeAPiCity.long_name : '',
    //                 pincode: placeAPiPinCode && placeAPiPinCode.long_name ? placeAPiPinCode.long_name : '',
    //             })

    //         }
    //     }
    // }, [addressData]);

    // useEffect(() => {
    //     if (googleApiData && googleApiData.state) {
    //         regions && regions.length && googleApiData.state &&
    //             formRef.current.setValue(
    //                 'region[region_id]',
    //                 googleApiData.state
    //             );

    //         googleApiData.city &&
    //             formRef.current.setValue('city', googleApiData.city);

    //         googleApiData.pincode &&
    //             formRef.current.setValue(
    //                 'postcode',
    //                 googleApiData.pincode
    //             );
    //         setGoogleApiData({
    //             state: '',
    //             city: '',
    //             pincode: '',
    //         })
    //     }
    // }, [googleApiData])

    if (isLoading) {
        return (
            <LoadingIndicator>
                <FormattedMessage
                    id={'customerForm.loading'}
                    defaultMessage={'Fetching Customer Details...'}
                />
            </LoadingIndicator>
        );
    }

    const classes = mergeClasses(defaultClasses, propClasses);

    const emailRow = !hasDefaultShipping ? (
        <div className={classes.email}>
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
                    validateOnChange
                    // validateOnBlur
                    formtype={'checkoutCustomer'}
                />
            </Field>
        </div>
    ) : null;

    const formMessageRow = !hasDefaultShipping ? (
        <div className={classes.formMessage}>
            <Message>
                <FormattedMessage
                    id={'customerForm.formMessage'}
                    defaultMessage={
                        'The shipping address you enter will be saved to your address book and set as your default for future purchases.'
                    }
                />
            </Message>
        </div>
    ) : null;

    const cancelButton = isUpdate ? (
        <Button disabled={isSaving} onClick={handleCancel} priority="low">
            <FormattedMessage
                id={'global.cancelButton'}
                defaultMessage={'Cancel'}
            />
        </Button>
    ) : null;

    const submitButtonText = !hasDefaultShipping
        ? formatMessage({
            id: 'global.saveAndContinueButton',
            defaultMessage: 'Save and Continue'
        })
        : isUpdate
            ? formatMessage({
                id: 'global.updateButton',
                defaultMessage: 'Update'
            })
            : formatMessage({
                id: 'global.addButton',
                defaultMessage: 'Add'
            });
    const submitButtonProps = {
        disabled: isSaving || isDisableSubmitButton || !pincodeStatus,
        priority: !hasDefaultShipping ? 'high' : 'high',
        type: 'submit'
    };

    const defaultShippingElement = hasDefaultShipping ? (
        <div className={classes.defaultShipping}>
            <Checkbox
                disabled={!!initialValues.default_shipping}
                id="default_shipping"
                field="default_shipping"
                label={formatMessage({
                    id: 'customerForm.defaultShipping',
                    defaultMessage: 'Make this my default address'
                })}
                isDisplayOwnLabel={true}
            />
        </div>
    ) : (
        <Text type="hidden" field="default_shipping" initialValue={true} />
    );

    return (
        <Fragment>
            <FormError errors={Array.from(errors.values())} />
            <Form
                className={classes.root}
                initialValues={initialValues}
                onSubmit={formValues => {
                    const regionDetail =
                        formValues &&
                        formValues.region &&
                        formValues.region.region_id &&
                        regions.find(
                            item => item.value === formValues.region.region_id
                        );
                    const resultFormValues = {
                        ...formValues,
                        region: {
                            region_id:
                                regionDetail && regionDetail.key
                                    ? regionDetail.key
                                    : ''
                        }
                    };
                    handleSubmit(resultFormValues);
                }}
                onValueChange={() => {
                    if (isDisableSubmitButton) {
                        setCheckoutStep(CHECKOUT_STEP.SHIPPING_ADDRESS);
                    }
                }}
                ref={formRef}
                getApi={value => (formRef.current = value)}
            >
                {formMessageRow}
                {emailRow}
                <div className={classes.firstname}>
                    <Field
                        id="customer_firstname"
                        label={formatMessage({
                            id: 'global.firstName',
                            defaultMessage: 'First Name*'
                        })}
                    >
                        <TextInput
                            field="firstname"
                            id="customer_firstname"
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
                <div className={classes.lastname}>
                    <Field
                        id="customer_lastname"
                        label={formatMessage({
                            id: 'global.lastName',
                            defaultMessage: 'Last Name*'
                        })}
                    >
                        <TextInput
                            field="lastname"
                            id="customer_lastname"
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
                <div className={classes.telephone}>
                    <Field
                        id="customer_telephone"
                        label={formatMessage({
                            id: 'global.phoneNumber',
                            defaultMessage: 'Mobile Number'
                        })}
                    >
                        <TextInput
                            field="telephone"
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
                            validateOnChange
                            validateOnBlur
                            id="customer_telephone"
                            formtype={'checkoutCustomer'}
                            maxLength={mobileNumberLength}
                        />
                    </Field>
                </div>
                <div className={classes.street0}>
                    <Field
                        id="customer_street0"
                        label={formatMessage({
                            id: 'global.streetAddress',
                            defaultMessage: 'Street Address'
                        })}
                    >
                        <TextInput
                            field="street[0]"
                            validate={value =>
                                isRequired(value, 'Street Address')
                            }
                            validateOnBlur
                            id="customer_street0"
                        />
                    </Field>
                    {/* <GooglePlaces setAddressData={setAddressData} /> */}
                </div>
                <div className={classes.street1}>
                    <Field
                        id="customer_street1"
                        label={formatMessage({
                            id: 'global.streetAddress2',
                            defaultMessage: 'Street Address 2'
                        })}
                    >
                        <TextInput field="street[1]" id="customer_street1" placeholder='Optional' />
                    </Field>
                </div>
                <div className={classes.postcode}>
                    <Postcode
                        validate={value =>
                            isRequired(value, 'Pincode', postalCodeMaxLength)
                        }
                        validateOnChange
                        validateOnBlur
                        // googleApiData={googleApiData} 
                        setPincodeStatus={setPincodeStatus}
                    />
                </div>
                <div className={classes.city}>
                    <Field
                        id="customer_city"
                        label={formatMessage({
                            id: 'global.city',
                            defaultMessage: 'City'
                        })}
                    >
                        <TextInput
                            field="city"
                            validate={combine([
                                validateNotNumber,
                                value => isRequired(
                                    value,
                                    'Street Address'
                                ),
                            ])}
                            validateOnBlur
                            id="customer_city"
                        />
                    </Field>
                </div>
                <div className={classes.region}>
                    <Region
                        validate={value => isRequired(value, 'State')}
                        validateOnBlur
                        fieldInput={'region[region]'}
                        fieldSelect={'region[region_id]'}
                        setRegions={setRegions}
                        regions={regions}
                    />
                </div>
                <div className={classes.country}>
                    <Country
                        field='country'
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
                {defaultShippingElement}
                <div className={classes.buttons}>
                    {/* {cancelButton} */}
                    <Button priority='high' {...submitButtonProps}><span>{submitButtonText}</span></Button>
                </div>
            </Form>
        </Fragment>
    );
};

export default CustomerForm;

CustomerForm.defaultProps = {
    shippingData: {
        country: {
            code: DEFAULT_COUNTRY_CODE
        },
        region: {
            id: null
        }
    }
};

CustomerForm.propTypes = {
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
        formMessage: string,
        defaultShipping: string
    }),
    onCancel: func,
    shippingData: shape({
        city: string,
        country: shape({
            code: string.isRequired
        }).isRequired,
        default_shipping: bool,
        email: string,
        firstname: string,
        id: number,
        lastname: string,
        postcode: string,
        region: shape({
            id: number
        }).isRequired,
        street: arrayOf(string),
        telephone: string
    }),
    setCheckoutStep: func,
    isDisableSubmitButton: bool
};
