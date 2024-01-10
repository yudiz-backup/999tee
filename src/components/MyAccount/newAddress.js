import React, { useState, useEffect, useRef } from 'react';
import { shape, string } from 'prop-types';

import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './myAccount.css';
import accountClasses from './accountinformation.css';
import { Form, TextArea } from 'informed';
import Sidebar from './sidebar.js';
import Button from '../Button';
// import Select from '../Select';
import Field from '../Field';
import Checkbox from '../Checkbox';
import { FormattedMessage, useIntl } from 'react-intl';
import TextInput from '@magento/venia-ui/lib/components/TextInput';
import createAddressQuery from '../../queries/createAddress.graphql';
import getAddressData from '../../queries/getAddressData.graphql';
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
    validateNotNumber,
    checkOnlyNumberAllowForPinCode
} from '../../util/formValidators';
import {
    useCreateAddress,
    useAddressData
} from '../../peregrine/lib/talons/MyAccount/useDashboard';
import getCountriesQuery from '../../queries/getCountries.graphql';
import LoadingIndicator from '../LoadingIndicator';
import { useToasts } from '@magento/peregrine';
import { useHistory } from 'react-router-dom';
// import TextArea from '@magento/venia-ui/lib/components/TextArea';
import combine from '../../util/combineValidators';
import Country from '../Country';
import Region from '../Region';
// import GooglePlaces from '../GooglePlaces';
import Postcode from '../Postcode/postcode';

const AccountInformation = props => {
    const formRef = useRef(null);
    const [billingAddressCheck, setBillingAddressCheck] = useState(false);
    const [shippingAddressCheck, setShippingAddressCheck] = useState(false);
    // const [addressData, setAddressData] = useState()
    const [regions, setRegions] = useState([]);
    const [pincodeStatus, setPincodeStatus] = useState(false)

    const history = useHistory();
    const { formatMessage } = useIntl();
    const [, { addToast }] = useToasts();
    const classes = mergeClasses(defaultClasses, props.classes, accountClasses);

    // const [googleApiData, setGoogleApiData] = useState({
    //     state: '',
    //     city: '',
    //     pincode: '',
    // })

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
    //         googleApiData.state &&
    //             formRef.current.setValue(
    //                 'region',
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

    const { handleSubmit, isBusy, responseData } = useCreateAddress({
        query: createAddressQuery
    });
    var errorMessage = '';
    const { countries } = useAddressData({
        query: getAddressData,
        id: '',
        addressQuery: getCountriesQuery
    });

    let selectableCountries = [];
    let selectableState = [];

    const [country, setCountry] = useState('IN');

    if (countries && typeof countries != 'undefined' && countries.length) {
        {
            countries.map((value, index) => {
                selectableCountries[index] = {
                    label: value.full_name_english,
                    value: value.id
                };
                if (value.id == country) {
                    if (
                        typeof value.available_regions != 'undefined' &&
                        value.available_regions
                    ) {
                        selectableState = value.available_regions.map(
                            ({ id, name }) => ({
                                label: name,
                                value: id
                            })
                        );
                    } else {
                        selectableState = [];
                    }
                }
            });
        }
    } else {
        selectableCountries = [];
    }

    // const showRegion = () => {
    //     if (
    //         document.getElementById('country_id') &&
    //         country != document.getElementById('country_id').value
    //     ) {
    //         var sel = document.getElementById('country_id').value;
    //         setCountry(sel);
    //     }
    // };

    const handleSubmitForm = fields => {
        const country_id = fields.country;
        const resultRegion = regions.find(item => item.value === fields.region);
        const region = {
            region:
                resultRegion && resultRegion.label ? resultRegion.label : '',
            region_id: resultRegion && resultRegion.key ? resultRegion.key : ''
        };
        handleSubmit({
            city: fields.city,
            firstname: fields.firstname.charAt(0).toUpperCase() + fields.firstname.slice(1),
            lastname: fields.lastname.charAt(0).toUpperCase() + fields.lastname.slice(1),
            postcode: fields.postcode,
            telephone: fields.telephone,
            street: [fields.street[0], fields.street_address_2 ? fields.street_address_2 : ''],
            country_id,
            region,
            country: undefined,
            default_billing: fields.default_billing,
            default_shipping: fields.default_shipping
        });
    };

    useEffect(() => {
        if (
            responseData &&
            responseData.createCustomerAddress &&
            responseData.createCustomerAddress.id
        ) {
            addToast({
                type: 'info',
                message: 'New address is saved.',
                dismissable: true,
                timeout: 5000
            });
            history.push('/customer/address/');
        }
    }, [addToast, history, responseData]);

    return (
        <div className={defaultClasses.columns}>
            {isBusy && (
                <div className={accountClasses.indicator_loader}>
                    <LoadingIndicator />
                </div>
            )}
            <div className="container-fluid">
                <div className="row">
                    <div className="col-lg-12">
                        <div
                            className={
                                defaultClasses.column +
                                ' ' +
                                defaultClasses.main
                            }
                        >
                            <div className={defaultClasses.account_sideBar}>
                                <Sidebar history={props.history} />
                            </div>
                            <div className={defaultClasses.account_contentBar}>
                                <div
                                    className={
                                        defaultClasses.page_title_wrapper
                                    }
                                >
                                    <h1 className={defaultClasses.page_title}>
                                        <span className={defaultClasses.base}>
                                            <FormattedMessage
                                                id={'newAddress.page_title'}
                                                defaultMessage={
                                                    'New Address Information'
                                                }
                                            />
                                        </span>
                                    </h1>
                                </div>
                                <div className={accountClasses.account_form}>
                                    <Form
                                        className={
                                            classes.root +
                                            ' ' +
                                            classes.new_form_wrap +
                                            ' ' +
                                            'p-3'
                                        }
                                        onSubmit={handleSubmitForm}
                                        ref={formRef}
                                        getApi={value =>
                                            (formRef.current = value)
                                        }
                                    >
                                        <div className={classes.field_wrapper}>
                                            <Field
                                                label={formatMessage({
                                                    id: 'newAddress.firstName',
                                                    defaultMessage:
                                                        'First Name*'
                                                })}
                                                required={true}
                                            >
                                                <TextInput
                                                    field="firstname"
                                                    autoComplete="given-name"
                                                    validate={combine([
                                                        value =>
                                                            isRequired(
                                                                value,
                                                                'First Name'
                                                            ),
                                                        [
                                                            hasLengthAtMost,
                                                            nameMaxLength
                                                        ],
                                                        [
                                                            hasLengthAtLeast,
                                                            nameMinLength
                                                        ],
                                                        validateName
                                                    ])}
                                                    validateOnBlur
                                                />
                                            </Field>
                                        </div>
                                        <div className={classes.field_wrapper}>
                                            <Field
                                                label={formatMessage({
                                                    id: 'newAddress.lastName',
                                                    defaultMessage: 'Last Name*'
                                                })}
                                                required={true}
                                            >
                                                <TextInput
                                                    field="lastname"
                                                    autoComplete="family-name"
                                                    validate={combine([
                                                        value =>
                                                            isRequired(
                                                                value,
                                                                'Last Name'
                                                            ),
                                                        [
                                                            hasLengthAtMost,
                                                            nameMaxLength
                                                        ],
                                                        [
                                                            hasLengthAtLeast,
                                                            nameMinLength
                                                        ],
                                                        validateName
                                                    ])}
                                                    validateOnBlur
                                                />
                                            </Field>
                                        </div>
                                        <div className={classes.field_wrapper}>
                                            <Field
                                                label={formatMessage({
                                                    id:
                                                        'newAddress.PhoneNumber',
                                                    defaultMessage:
                                                        'Mobile Number*'
                                                })}
                                                required={true}
                                            >
                                                <TextInput
                                                    field="telephone"
                                                    autoComplete="family-name"
                                                    validate={combine([
                                                        value =>
                                                            isRequired(
                                                                value,
                                                                'Moblie Number',
                                                                mobileNumberLength
                                                            ),
                                                        value =>
                                                            checkOnlyNumberAllow(
                                                                value,
                                                                'Moblie Number'
                                                            )
                                                    ])}
                                                    validateOnChange
                                                    validateOnBlur
                                                    formtype={'editAccount'}
                                                    maxLength={mobileNumberLength}
                                                />
                                            </Field>
                                        </div>
                                        {/* <div className={classes.street_add}>
                                            <GooglePlaces
                                                setAddressData={setAddressData}
                                            />
                                        </div> */}
                                        <div className={classes.street_add}>
                                            <Field
                                                label={formatMessage({
                                                    id:
                                                        'newAddress.StreetAddress',
                                                    defaultMessage:
                                                        'Street Address*'
                                                })}
                                                required={true}
                                            >
                                                <TextInput
                                                    field="street[0]"
                                                    autoComplete="family-name"
                                                    // ref={inputRef}
                                                    validate={value =>
                                                        isRequired(
                                                            value,
                                                            'Street Address'
                                                        )
                                                    }
                                                    validateOnBlur
                                                />
                                            </Field>
                                        </div>
                                        <div className={classes.field_wrapper}>
                                            <Field
                                                label={formatMessage({
                                                    id: 'newAddress.company',
                                                    defaultMessage: 'Street Address 2'
                                                })}
                                            >
                                                <TextInput
                                                    field="street_address_2"
                                                    autoComplete="family-name"
                                                    validateOnBlur
                                                    placeholder='Optional'
                                                />
                                            </Field>
                                        </div>

                                        <div className={classes.field_wrapper}>
                                            <Postcode
                                                validateOnChange
                                                validate={combine([
                                                    value => isRequired(value, 'Pincode', postalCodeMaxLength),
                                                    value => checkOnlyNumberAllowForPinCode(value, 'Pincode')
                                                ])}
                                                validateOnBlur
                                                setPincodeStatus={setPincodeStatus}
                                                // googleApiData={googleApiData}
                                                maxLength={postalCodeMaxLength}
                                            // initialValue={address.postcode}
                                            />
                                        </div>

                                        <div className={classes.field_wrapper}>
                                            <Field
                                                label={formatMessage({
                                                    id: 'newAddress.city',
                                                    defaultMessage: 'City*'
                                                })}
                                                required={true}
                                            >
                                                <TextInput
                                                    field="city"
                                                    autoComplete="family-name"
                                                    validate={combine([
                                                        validateNotNumber,
                                                        value => isRequired(
                                                            value,
                                                            'Street Address'
                                                        ),
                                                    ])}
                                                    validateOnBlur
                                                />
                                            </Field>
                                        </div>

                                        <div className={classes.field_wrapper}>
                                            <Region
                                                label="State*"
                                                validate={value =>
                                                    isRequired(value, 'State')
                                                }
                                                validateOnBlur
                                                required={true}
                                                setRegions={setRegions}
                                                regions={regions}
                                                validateOnChange
                                            />
                                        </div>

                                        <div className={classes.field_wrapper}>
                                            <Country
                                                label="Country*"
                                                validate={value =>
                                                    isRequired(value, 'Country')
                                                }
                                                validateOnChange
                                                validateOnBlur
                                                initialValue={country}
                                                required={true}
                                                onValueChange={() => {
                                                    if (formRef && formRef.current) {
                                                        formRef.current.setValue('region', '')
                                                    }
                                                }}
                                            />
                                        </div>



                                        {/* <Field
                                                label={formatMessage({
                                                    id:
                                                        'newAddress.State/Zip/PostalCode',
                                                    defaultMessage: 'Pincode*'
                                                })}
                                                required={true}
                                            >
                                                <TextInput
                                                    field="postcode"
                                                    autoComplete="family-name"
                                                    validate={combine([
                                                        value =>
                                                            isRequired(
                                                                value,
                                                                'Pincode',
                                                                postalCodeMaxLength
                                                            ),
                                                        value =>
                                                            checkOnlyNumberAllow(
                                                                value,
                                                                'Pincode'
                                                            )
                                                    ])}
                                                    validateOnBlur
                                                    maxLength={postalCodeMaxLength}
                                                />
                                            </Field> */}
                                        <div className={classes.error}>
                                            {errorMessage}
                                        </div>
                                        <div
                                            className={
                                                classes.field_wrapper +
                                                ' ' +
                                                classes.checkbox_wrap
                                            }
                                        >
                                            <Field id="billing_address">
                                                <Checkbox
                                                    field="default_billing"
                                                    label={formatMessage({
                                                        id:
                                                            'newAddress.default_billing',
                                                        defaultMessage:
                                                            'Use as my default billing address'
                                                    })}
                                                    onClick={() =>
                                                        setBillingAddressCheck(
                                                            !billingAddressCheck
                                                        )
                                                    }
                                                    value={billingAddressCheck}
                                                    isDisplayOwnLabel={true}
                                                />
                                            </Field>
                                        </div>
                                        <div
                                            className={
                                                classes.field_wrapper +
                                                ' ' +
                                                classes.checkbox_wrap
                                            }
                                        >
                                            <Field id="shipping_address">
                                                <Checkbox
                                                    field="default_shipping"
                                                    label={formatMessage({
                                                        id:
                                                            'newAddress.default_shipping',
                                                        defaultMessage:
                                                            'Use as my default shipping address'
                                                    })}
                                                    onClick={() =>
                                                        setShippingAddressCheck(
                                                            !shippingAddressCheck
                                                        )
                                                    }
                                                    value={shippingAddressCheck}
                                                    isDisplayOwnLabel={true}
                                                />
                                            </Field>
                                        </div>
                                        <div className={'mt-3'}>
                                            <Button
                                                type="submit"
                                                priority="high"
                                                disabled={!pincodeStatus}
                                            >
                                                <FormattedMessage
                                                    id={'newAddress.submit'}
                                                    defaultMessage={
                                                        'Save Address'
                                                    }
                                                />
                                            </Button>
                                        </div>
                                    </Form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountInformation;

AccountInformation.propTypes = {
    classes: shape({
        actions: string,
        root: string,
        subtitle: string,
        title: string,
        user: string
    })
};
