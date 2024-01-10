import React, { useState, useEffect, useRef } from 'react';
import { shape, string } from 'prop-types';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './myAccount.css';
import accountClasses from './accountinformation.css';
import { Form, TextArea } from 'informed';
import Sidebar from './sidebar.js';
import Button from '../Button';
import Field from '../Field';
import TextInput from '@magento/venia-ui/lib/components/TextInput';
import { FormattedMessage, useIntl } from 'react-intl';
import updateAddressQuery from '../../queries/updateAddress.graphql';
import getAddressData from '../../queries/getAddressData.graphql';
import getCountriesQuery from '../../queries/getCountries.graphql';
import AddressSkeleton from './editAddressSkeleton.js';
import Checkbox from '../Checkbox';
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
import combine from '../../util/combineValidators';
import {
    useUpdateAddress,
    useAddressData
} from '../../peregrine/lib/talons/MyAccount/useDashboard';
import LoadingIndicator from '../LoadingIndicator';
import { useToasts } from '@magento/peregrine';
import { useHistory, useParams } from 'react-router-dom';
// import TextArea from '@magento/venia-ui/lib/components/TextArea';
import Country from '../Country';
import Region from '../Region';
// import GooglePlaces from '../GooglePlaces';
import Postcode from '../Postcode/postcode';


const AccountInformation = props => {
    const formRef = useRef(null);
    const history = useHistory();
    const { who } = useParams();
    const { formatMessage } = useIntl();
    // const [addressData, setAddressData] = useState()
    const [shippingAddressCheck, setShippingAddressCheck] = useState(false);
    const [pincodeStatus, setPincodeStatus] = useState(false)
    const addressId = who;
    const { address } = useAddressData({
        query: getAddressData,
        id: addressId,
        addressQuery: getCountriesQuery
    });

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

    const [, { addToast }] = useToasts();
    const classes = mergeClasses(defaultClasses, props.classes, accountClasses);
    const { handleSubmit, isBusy, responseData } = useUpdateAddress({
        query: updateAddressQuery
    });


    var errorMessage = '';
    const [country, setCountry] = useState('IN');
    const [initialcountry, setInitialcountry] = useState(false);
    const [regions, setRegions] = useState([]);
    const [initialRegion, setInitialRegion] = useState('');


    if (address && country != address.country_id && !initialcountry) {
        setCountry(address.country_id);
        setInitialcountry(true);
    }

    const handleSubmitForm = fields => {
        const country_id = fields.country;
        const resultRegion = regions.find(item => item.value === fields.region);
        const region = {
            region:
                resultRegion && resultRegion.label ? resultRegion.label : '',
            region_id: resultRegion && resultRegion.key ? resultRegion.key : ''
        };
        handleSubmit(addressId, {
            city: fields.city,
            firstname: fields.firstname,
            lastname: fields.lastname,
            postcode: fields.postcode,
            telephone: fields.telephone,
            street: [fields.street[0], fields.street_address_2 ? fields.street_address_2 : ""],
            country_id,
            region,
            country: undefined,
            default_shipping: fields.default_shipping
        });
    };

    useEffect(() => {
        if (
            responseData &&
            responseData.updateCustomerAddress &&
            responseData.updateCustomerAddress.id
        ) {
            addToast({
                type: 'info',
                message: 'You saved the address.',
                dismissable: true,
                timeout: 5000
            });
            history.push('/customer/address/');
        }
    }, [addToast, history, responseData]);

    useEffect(() => {
        if (regions.length && address && address.region_id && !initialRegion) {
            const resultRegion = regions.find(
                item => item.key == address.region_id
            );
            if (resultRegion && resultRegion.value) {
                setInitialRegion(resultRegion.value);
            }
        }
    }, [regions, address]);

    useEffect(() => {
        if (initialRegion && formRef && formRef.current) {
            formRef.current.setValue('region', initialRegion);
        }
    }, [initialRegion]);

    if (addressId && address) {
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
                                    <Sidebar
                                        history={props.history}
                                        activePath={'/customer/address/'}
                                    />
                                </div>
                                <div
                                    className={
                                        defaultClasses.account_contentBar
                                    }
                                >
                                    <div
                                        className={
                                            defaultClasses.page_title_wrapper
                                        }
                                    >
                                        <h1
                                            className={
                                                defaultClasses.page_title
                                            }
                                        >
                                            <span
                                                className={defaultClasses.base}
                                            >
                                                <FormattedMessage
                                                    id={'editAddress.title'}
                                                    defaultMessage={
                                                        'Edit Address Information'
                                                    }
                                                />
                                            </span>
                                        </h1>
                                    </div>
                                    <div
                                        className={
                                            classes.new_form_wrap +
                                            ' ' +
                                            accountClasses.account_form
                                        }
                                    >
                                        <Form
                                            className={
                                                accountClasses.account_form_inner
                                            }
                                            onSubmit={handleSubmitForm}
                                            ref={formRef}
                                            getApi={value =>
                                                (formRef.current = value)
                                            }
                                        >
                                            <Field
                                                label="First Name*"
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
                                                    initialValue={
                                                        address.firstname
                                                    }
                                                />
                                            </Field>
                                            <Field
                                                label="Last Name*"
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
                                                    initialValue={
                                                        address.lastname
                                                    }
                                                />
                                            </Field>
                                            {address?.company !== null &&
                                                <Field
                                                    label="Company Name*"
                                                >
                                                    <TextInput
                                                        field="street_address_2"
                                                        autoComplete="family-name"
                                                        validate={value => isRequired(value, "Company Name")}
                                                        validateOnBlur
                                                        initialValue={
                                                            address.company
                                                        }
                                                    />
                                                </Field>}
                                            <Field
                                                label="Mobile Number*"
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
                                                    initialValue={
                                                        address.telephone
                                                    }
                                                    formtype={'accountInfo'}
                                                    maxLength={mobileNumberLength}
                                                />
                                            </Field>
                                            {/* <div className={classes.street_add}>
                                                <GooglePlaces
                                                    setAddressData={setAddressData}
                                                    address={address}
                                                />
                                            </div> */}
                                            <Field
                                                label="Street Address*"
                                                required={true}>
                                                <TextInput
                                                    field="street[0]"
                                                    autoComplete="family-name"
                                                    validate={value => isRequired(value, 'Street Address')}
                                                    validateOnBlur
                                                    initialValue={
                                                        address.street
                                                    } />
                                            </Field>
                                            <Field
                                                label="Street Address 2"
                                            >
                                                <TextInput
                                                    field="street_address_2"
                                                    autoComplete="family-name"
                                                    validateOnBlur
                                                    initialValue={address.street.split('\n')[1]}
                                                    placeholder='Optional'
                                                />
                                            </Field>

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
                                                initialValue={address.postcode}
                                            />

                                            <Field
                                                label="City*"
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
                                                    initialValue={address.city}
                                                />
                                            </Field>

                                            <Region
                                                label="State*"
                                                validate={value =>
                                                    isRequired(value, 'State')
                                                }
                                                validateOnBlur
                                                initialValue={initialRegion}
                                                required={true}
                                                setRegions={setRegions}
                                                regions={regions}
                                                validateOnChange
                                            />

                                            <Country
                                                label="Country*"
                                                validate={value =>
                                                    isRequired(value, 'Country')
                                                }
                                                validateOnBlur
                                                validateOnChange
                                                initialValue={country}
                                                required={true}
                                                onValueChange={() => {
                                                    if (
                                                        formRef &&
                                                        formRef.current
                                                    ) {
                                                        formRef.current.setValue(
                                                            'region',
                                                            ''
                                                        );
                                                    }
                                                }}
                                            />

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
                                                <Field id="shipping_address">
                                                    <Checkbox
                                                        field="default_shipping"
                                                        label={formatMessage({
                                                            id:
                                                                'newAddress.default_shipping',
                                                            defaultMessage:
                                                                'Make this my default address'
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
                                                        id={
                                                            'editAddress.submitButton'
                                                        }
                                                        defaultMessage={
                                                            'Update'
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
    } else {
        return (
            <div>
                <AddressSkeleton />
            </div>
        );
    }
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
