import React, { useCallback, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Form } from 'informed';
import { func, shape, string } from 'prop-types';
import { useToasts } from '@magento/peregrine';
import { useCreateAccount } from '../../../peregrine/lib/talons/CheckoutPage/OrderConfirmationPage/useCreateAccount';

import combine from '../../../util/combineValidators';
import { mergeClasses } from '../../../classify';
import {
    // hasLengthAtLeast,
    isRequired,
    // validatePassword,
    validateEmail,
    checkOnlyNumberAllow,
    validateConfirmPassword,
    passwordMaxLength,
    mobileNumberLength
} from '../../../util/formValidators';

import Button from '../../Button';
import Checkbox from '../../Checkbox';
import Field from '../../Field';
import FormError from '../../FormError';
import TextInput from '../../TextInput';
import Password from '../../Password';
import defaultClasses from './createAccount.css';
import { useHistory } from 'react-router-dom';
// import { Check } from 'react-feather'


const CreateAccount = props => {
    const { formatMessage } = useIntl();
    const history = useHistory();
    const classes = mergeClasses(defaultClasses, props.classes);
    // const [isChecked, setIsChecked] = useState(false);
    const [, { addToast }] = useToasts();
    const [char, setChar] = useState(false)
    const [uppercase, setUppercase] = useState(false)
    const [lowercase, setLowerCase] = useState(false)
    const [number, setNumber] = useState(false)
    const onSubmit = useCallback(() => {
        // TODO: Redirect to account/order page when implemented.
        window.scrollTo({
            left: 0,
            top: 0,
            behavior: 'smooth'
        });

        addToast({
            type: 'info',
            message: formatMessage({
                id: 'createAccount.accountSuccessfullyCreated',
                defaultMessage: 'Account successfully created.'
            }),
            timeout: 5000
        });
    }, [addToast, formatMessage]);

    const talonProps = useCreateAccount({
        initialValues: {
            email: props.email,
            firstName: props.firstname,
            lastName: props.lastname,
            subscribe: true,

            // assistance_allowed: false,
        },
        onSubmit
    });


    const { errors, handleSubmit, isDisabled, initialValues, /* createAccountData, createAccountResponse,  */confirmation_msg } = talonProps;
    useEffect(() => {
        if (confirmation_msg) {
            history.push("/login", { confirmation_msg })
        }
    }, [confirmation_msg])

    return (
        <div className={classes.root}>
            <h2 className='m-0'>
                <FormattedMessage
                    id={'createAccount.quickCheckout'}
                    defaultMessage={'Quick Checkout When You Return'}
                />
            </h2 >
            <p className='m-0'>
                <FormattedMessage
                    id={'createAccount.setAPasswordAndSave'}
                    defaultMessage={
                        'Set a password and save your information for next time in one easy step!'
                    }
                />
            </p>
            <FormError errors={Array.from(errors.values())} />
            <Form
                className={classes.form}
                initialValues={initialValues}
                onSubmit={handleSubmit}
            >
                <Field
                    label={formatMessage({
                        id: 'global.firstName',
                        defaultMessage: 'First Name*'
                    })}
                >
                    <TextInput
                        field="customer.firstname"
                        autoComplete="given-name"
                        validate={value => isRequired(value, 'First Name')}
                        validateOnBlur
                        formvalue={props?.firstName}
                    // value={props?.firstName}
                    />
                </Field>
                <Field
                    label={formatMessage({
                        id: 'global.lastName',
                        defaultMessage: 'Last Name*'
                    })}
                >
                    <TextInput
                        field="customer.lastname"
                        autoComplete="family-name"
                        validate={value => isRequired(value, 'Last Name')}
                        validateOnBlur
                        formvalue={props?.lastname}
                    />
                </Field>
                <Field
                    label={formatMessage({
                        id: 'global.email',
                        defaultMessage: 'Email*'
                    })}
                >
                    <TextInput
                        field="email"
                        autoComplete="email"
                        validate={combine([
                            (value) => isRequired(value, 'Email'),
                            validateEmail
                        ])}
                        validateOnChange
                        validateOnBlur
                        formtype={'checkoutEmail'}
                    // initialValue='he'
                    />
                </Field>
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
                            value => isRequired(value, 'Moblie Number', 10),
                            value => checkOnlyNumberAllow(value, 'Moblie Number')
                        ])}
                        validateOnBlur
                        validateOnChange
                        maxLength={mobileNumberLength}
                        formtype={'register'}
                    // disabled={mobileNumber}
                    />
                </Field>
                <Password
                    autoComplete="new-password"
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
                            <p className={char ? classes.passGreenTick : classes.passValidations} >8 Charaters
                            </p>
                            <p className={uppercase ? classes.passGreenTick : classes.passValidations}>1 Uppercase
                            </p>
                            <p className={lowercase ? classes.passGreenTick : classes.passValidations}>1 Lowercase
                            </p>
                            <p className={number ? classes.passGreenTick : classes.passValidations}>1 Number  </p>
                        </div>
                    </div>
                </div>
                <div className="">
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

                <div className={classes.subscribe}>
                    <Checkbox
                        field="subscribe"
                        label={formatMessage({
                            id: 'createAccount.subscribe',
                            defaultMessage: 'Subscribe to news and updates*'
                        })}
                        isDisplayOwnLabel={true}
                    />
                    <div className={classes.actions}>
                        <Button
                            disabled={isDisabled}
                            type="submit"
                            className={classes.create_account_button}
                        >
                            <FormattedMessage
                                id={'createAccount.createAccount'}
                                defaultMessage={'Create Account'}
                            />
                        </Button>
                    </div>
                </div>
                {/* <div className={classes.subscribe} validate={value => isRequired(value, 'Allow remote shopping assistance')}>
                    <Checkbox
                        id="assistance_allowed"
                        onClick={() => {
                            setIsChecked(!isChecked);
                        }}
                        field="assistance_allowed"
                        label={formatMessage({
                            id: 'createAccount.assistance',
                            defaultMessage: 'Allow remote shopping assistance*'
                        })}
                        isDisplayOwnLabel={true}
                    />
                </div> */}

            </Form>
        </div>
    );
};

export default CreateAccount;

CreateAccount.propTypes = {
    classes: shape({
        actions: string,
        create_account_button: string,
        form: string,
        root: string,
        subscribe: string
    }),
    initialValues: shape({
        email: string,
        firstName: string,
        lastName: string
    }),
    onSubmit: func
};
