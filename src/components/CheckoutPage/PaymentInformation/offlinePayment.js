import React, { useMemo, useCallback, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useOfflinePayment } from '../../../peregrine/lib/talons/CheckoutPage/PaymentInformation/useOfflinePayment';
import { isRequired, mobileNumberLength, postalCodeMaxLength, checkOnlyNumberAllow, checkOnlyNumberAllowForPinCode } from '../../../util/formValidators';
import Country from '../../Country';
import Region from '../../Region';
import Postcode from '../../Postcode';
import Checkbox from '../../Checkbox';
import Field from '../../Field';
import TextInput from '../../TextInput';
import LoadingIndicator from '../../LoadingIndicator';
import { mergeClasses } from '../../../classify';
import combine from '../../../util/combineValidators';
import offlinePaymentOperations from './offlinePayment.gql';

import defaultClasses from './creditCard.css';
import FormError from '../../FormError';

const STEP_DESCRIPTIONS = [
    { defaultMessage: 'Loading Payment', id: 'checkoutPage.step0' },
    {
        defaultMessage: 'Checking Payment Method Information',
        id: 'checkoutPage.step1'
    },
    {
        defaultMessage: 'Checking Payment Method Information',
        id: 'checkoutPage.step2'
    },
    {
        defaultMessage: 'Checking Payment Method Information',
        id: 'checkoutPage.step3'
    },
    {
        defaultMessage: 'Saved Payment Method Information Successfully',
        id: 'checkoutPage.step4'
    }
];

const OfflinePayment = props => {
    const {
        classes: propClasses,
        onPaymentSuccess: onSuccess,
        resetShouldSubmit,
        shouldSubmit,
        paymentCode,
        setCheckoutStep = () => { },
        setPaymentMethodMutationLoading = () => { }
    } = props;
    const { formatMessage } = useIntl();

    const classes = mergeClasses(defaultClasses, propClasses);

    const talonProps = useOfflinePayment({
        onSuccess,
        shouldSubmit,
        resetShouldSubmit,
        paymentCode,
        setCheckoutStep,
        ...offlinePaymentOperations
    });

    const {
        errors,
        isBillingAddressSame,
        stepNumber,
        initialValues,
        paymentMethodMutationLoading,
        billingAddressMutationLoading
    } = talonProps;
    const isLoading = false;

    const billingAddressFieldsClassName = isBillingAddressSame
        ? classes.billing_address_fields_root_hidden
        : classes.billing_address_fields_root;

    /**
     * Instead of defining classes={root: classes.FIELD_NAME}
     * we are using useMemo to only do it once (hopefully).
     */
    const fieldClasses = useMemo(() => {
        return [
            'first_name',
            'last_name',
            'country',
            'street1',
            'street2',
            'city',
            'region',
            'postal_code',
            'phone_number'
        ].reduce((acc, fieldName) => {
            acc[fieldName] = { root: classes[fieldName] };

            return acc;
        }, {});
    }, [classes]);

    /**
     * These 2 functions are wrappers around the `isRequired` function
     * of `formValidators`. They perform validations only if the
     * billing address is different from shipping address.
     *
     * We write this function in `venia-ui` and not in the `peregrine` talon
     * because it references `isRequired` which is a `venia-ui` function.
     */
    const isFieldRequired = useCallback(
        (value, prefixMessage, length) => {
            if (isBillingAddressSame) {
                /**
                 * Informed validator functions return `undefined` is
                 * validation is `true`
                 */
                return undefined;
            } else {
                return isRequired(value, prefixMessage, length);
            }
        },
        [isBillingAddressSame]
    );

    const stepTitle = STEP_DESCRIPTIONS[stepNumber].defaultMessage
        ? formatMessage({
            id: STEP_DESCRIPTIONS[stepNumber].id,
            defaultMessage: STEP_DESCRIPTIONS[stepNumber].defaultMessage
        })
        : formatMessage({
            id: 'checkoutPage.loadingPayment',
            defaultMessage: 'Loading Payment'
        });

    useEffect(() => {
        setPaymentMethodMutationLoading(paymentMethodMutationLoading || billingAddressMutationLoading)
    }, [paymentMethodMutationLoading, billingAddressMutationLoading])

    const loadingIndicator = isLoading ? (
        <LoadingIndicator>{stepTitle}</LoadingIndicator>
    ) : null;

    return (
        <div className={classes.root}>
            <div>
                <FormError
                    classes={{ root: classes.formErrorContainer }}
                    errors={Array.from(errors.values())}
                />
                <div className={classes.address_check}>
                    <Checkbox
                        field="isBillingAddressSame"
                        label={formatMessage({
                            id: 'checkoutPage.billingAddressSame',
                            defaultMessage:
                                'Billing address same as shipping address'
                        })}
                        initialValue={initialValues.isBillingAddressSame}
                        isDisplayOwnLabel={true}
                    />
                </div>
                <div className={billingAddressFieldsClassName}>
                    <Field
                        id="firstName"
                        classes={fieldClasses.first_name}
                        label={formatMessage({
                            id: 'global.firstName',
                            defaultMessage: 'First Name'
                        })}
                    >
                        <TextInput
                            id="firstName"
                            field="firstName"
                            validate={value => isFieldRequired(value, 'First Name')}
                            validateOnBlur
                            initialValue={initialValues.firstName}
                        />
                    </Field>
                    <Field
                        id="lastName"
                        classes={fieldClasses.last_name}
                        label={formatMessage({
                            id: 'global.lastName',
                            defaultMessage: 'Last Name'
                        })}
                    >
                        <TextInput
                            id="lastName"
                            field="lastName"
                            validate={value => isFieldRequired(value, 'Last Name')}
                            validateOnBlur
                            initialValue={initialValues.lastName}
                        />
                    </Field>
                    <Field
                        id="phoneNumber"
                        classes={fieldClasses.phone_number}
                        label={formatMessage({
                            id: 'global.phoneNumber',
                            defaultMessage: 'Mobile Number'
                        })}
                    >
                        <TextInput
                            id="phoneNumber"
                            field="phoneNumber"
                            validate={combine([
                                value =>
                                    isFieldRequired(
                                        value,
                                        'Mobile Number',
                                        mobileNumberLength
                                    ),
                                value =>
                                    checkOnlyNumberAllow(value, 'Mobile Number')
                            ])}
                            validateOnBlur
                            initialValue={initialValues.phoneNumber}
                            maxLength={mobileNumberLength}
                        />
                    </Field>
                    <Field
                        id="street1"
                        classes={fieldClasses.street1}
                        label={formatMessage({
                            id: 'global.streetAddress',
                            defaultMessage: 'Street Address'
                        })}
                    >
                        <TextInput
                            id="street1"
                            field="street1"
                            validate={value => isFieldRequired(value, 'Street Address')}
                            validateOnBlur
                            initialValue={initialValues.street1}
                        />
                    </Field>
                    <Field
                        id="street2"
                        classes={fieldClasses.street2}
                        label={formatMessage({
                            id: 'global.streetAddress2',
                            defaultMessage: 'Street Address 2'
                        })}
                    >
                        <TextInput
                            id="street2"
                            field="street2"
                            initialValue={initialValues.street2}
                            placeholder='Optional'
                        />
                    </Field>
                    <Postcode
                        classes={fieldClasses.postal_code}
                        validate={combine([
                            value => isRequired(value, 'Pincode', postalCodeMaxLength),
                            value => checkOnlyNumberAllowForPinCode(value, 'Pincode')
                        ])}
                        validateOnChange
                        initialValue={initialValues.postcode}
                        maxLength={postalCodeMaxLength}
                    />
                    <Field
                        id="city"
                        classes={fieldClasses.city}
                        label={formatMessage({
                            id: 'global.city',
                            defaultMessage: 'City'
                        })}
                    >
                        <TextInput
                            id="city"
                            field="city"
                            validate={value => isFieldRequired(value, 'City')}
                            validateOnBlur
                            initialValue={initialValues.city}
                        />
                    </Field>
                    <Region
                        classes={fieldClasses.region}
                        initialValue={initialValues.region}
                        validate={value => isFieldRequired(value, 'State')}
                        validateOnBlur
                    />

                    <Country
                        classes={fieldClasses.country}
                        validate={value => isFieldRequired(value, 'Country')}
                        validateOnBlur
                    />

                </div>
            </div>
            {loadingIndicator}
        </div>
    );
};

export default OfflinePayment;
