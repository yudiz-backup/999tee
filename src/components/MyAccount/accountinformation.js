import React, { useState, useEffect } from 'react';
import { shape, string } from 'prop-types';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './myAccount.css';
import accountClasses from './accountinformation.css';
import { Form } from 'informed';
import Sidebar from './sidebar.js';
// import { useLocation } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import Button from '@magento/venia-ui/lib/components/Button';
import Checkbox from '@magento/venia-ui/lib/components/Checkbox';
import Field from '@magento/venia-ui/lib/components/Field';
import TextInput from '@magento/venia-ui/lib/components/TextInput';
import combine from '@magento/venia-ui/lib/util/combineValidators';
import CustomerQuery from '../../queries/getCustomer.graphql';
import updateCustomerQuery from '../../queries/updateCustomer.graphql';
import changeCustomerPasswordQuery from '../../queries/changePassword.graphql';
import Password from '../Password';
import {
    validateEmail,
    isRequired,
    validateConfirmPassword,
    validateNewConfirmPassword,
    hasLengthAtLeast,
    passwordMaxLength,
    mobileNumberLength,
    validateName,
    nameMinLength,
    nameMaxLength,
    hasLengthAtMost,
    checkOnlyNumberAllow,
    validateGstNumber,
    gstNumberLength,
    cinNumberLength,
    validateCINNumber
} from '../../util/formValidators';
import {
    useCustomer,
    useUpdateCustomer
} from '../../peregrine/lib/talons/MyAccount/useDashboard';
import { Redirect } from 'src/drivers';
import LoadingIndicator from '../LoadingIndicator';
import { useToasts } from '@magento/peregrine';
import { Title } from '../Head';
import { useLocation } from 'react-router-dom';

const AccountInformation = props => {
    const [, { addToast }] = useToasts();
    const { formatMessage } = useIntl();

    const [errorShow, setErrorShow] = useState(false);
    const [showMsg, setShowMsg] = useState(false);
    const [char, setChar] = useState(false);
    const [uppercase, setUppercase] = useState(false);
    const [lowercase, setLowerCase] = useState(false);
    const [number, setNumber] = useState(false);
    const location = useLocation()

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();
    const newDate = yyyy + '-' + mm + '-' + dd;

    const passwordChange = props?.location?.state?.password
        ? props.location.state.password
        : false;
    const classes = mergeClasses(defaultClasses, props.classes, accountClasses);
    const customerInfo = useCustomer({
        query: CustomerQuery
    });
    const [changePassword, setChangePassword] = useState(location?.state?.password === true ? !passwordChange : passwordChange);
    const { errors, handleSubmit, isBusy, responseData } = useUpdateCustomer({
        query: updateCustomerQuery,
        changeCustomerPasswordQuery,
        updatePassword: changePassword
    });
    const { data, isSignedIn } = customerInfo;

    const comapnyName = data?.addresses?.find(company_name => company_name?.default_billing === true)

    useEffect(() => {
        if (responseData?.customer && showMsg) {
            addToast({
                type: 'info',
                message: 'You saved the account information.',
                dismissable: true,
                timeout: 10000
            });
            setShowMsg(false);
        }

        if (errors.length > 0 && errorShow) {
            errors.forEach(element => {
                addToast({
                    type: 'error',
                    message: element.message,
                    dismissable: true,
                    timeout: 10000
                });
            });
            setErrorShow(false);
        }
    }, [addToast, errors, errorShow, setErrorShow, responseData, showMsg, setShowMsg]);

    var errorMessage = '';
    const [changeEmail, setChangeEmail] = useState(false);
    const [emailInitialValue, setEmailInitialValue] = useState(data?.email);

    useEffect(() => {
        setEmailInitialValue(data?.email);
    }, [data]);

    const handleSubmitForm = v => {
        handleSubmit(v);
        setErrorShow(true);
        setShowMsg(true);
        setChangePassword(false)
        setChar(false)
        setUppercase(false)
        setLowerCase(false)
        setNumber(false)
        setChangeEmail(false)
    };
    if (!isSignedIn) {
        return <Redirect to="/" />;
    }
    return (
        <div className={defaultClasses.columns}>
            {isBusy && (
                <div className={accountClasses.indicator_loader}>
                    <LoadingIndicator />
                </div>
            )}
            <div className="container-fluid">
                <Title>{`My Account Information`}</Title>
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
                                                id={
                                                    'accountInformation.page_title'
                                                }
                                                defaultMessage={
                                                    'Edit Account Information'
                                                }
                                            />
                                        </span>
                                    </h1>
                                </div>
                                {data && (
                                    <div
                                        className={
                                            classes.new_form_wrap +
                                            ' ' +
                                            accountClasses.account_form
                                        }
                                    >
                                        <Form
                                            onSubmit={v => handleSubmitForm(v)}
                                            className={
                                                accountClasses.account_form_inner
                                            }
                                        >
                                            <div className="row form_row">
                                                <div className="col-md-6">
                                                    <div
                                                        className={
                                                            accountClasses.field_inner_wrap
                                                        }
                                                    >
                                                        <Field
                                                            label={formatMessage(
                                                                {
                                                                    id:
                                                                        'accountInformation.FirstName',
                                                                    defaultMessage:
                                                                        'First Name*'
                                                                }
                                                            )}
                                                            required={true}
                                                        >
                                                            <TextInput
                                                                field="firstname"
                                                                autoComplete="given-name"
                                                                validate={combine(
                                                                    [
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
                                                                    ]
                                                                )}
                                                                validateOnBlur
                                                                initialValue={
                                                                    data.firstname
                                                                }
                                                            />
                                                        </Field>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div
                                                        className={
                                                            accountClasses.field_inner_wrap
                                                        }
                                                    >
                                                        <Field
                                                            label={formatMessage(
                                                                {
                                                                    id:
                                                                        'accountInformation.LastName',
                                                                    defaultMessage:
                                                                        'Last Name*'
                                                                }
                                                            )}
                                                            required={true}
                                                        >
                                                            <TextInput
                                                                field="lastname"
                                                                autoComplete="family-name"
                                                                validate={combine(
                                                                    [
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
                                                                    ]
                                                                )}
                                                                validateOnBlur
                                                                initialValue={
                                                                    data.lastname
                                                                }
                                                            />
                                                        </Field>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-group mb-0">
                                                        <Field
                                                            label={formatMessage(
                                                                {
                                                                    id:
                                                                        'accountInformation.MobileNumber',
                                                                    defaultMessage:
                                                                        'Mobile Number*'
                                                                }
                                                            )}
                                                            required={true}
                                                        >
                                                            <TextInput
                                                                field="mobilenumber"
                                                                autoComplete="family-name"
                                                                validate={combine(
                                                                    [
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
                                                                    ]
                                                                )}
                                                                // validate={value => checkOnlyNumberAllow(value, 'Moblie Number')}
                                                                validateOnChange
                                                                validateOnBlur
                                                                initialValue={
                                                                    data.mobilenumber
                                                                }
                                                                formtype={
                                                                    'accountInfo'
                                                                }
                                                                maxLength={
                                                                    mobileNumberLength
                                                                }
                                                            // minLength={mobileNumberLength}
                                                            />
                                                        </Field>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-group mb-0">
                                                        <Field
                                                            label={formatMessage(
                                                                {
                                                                    id:
                                                                        'accountInfo.date_of_birth',
                                                                    defaultMessage:
                                                                        'Date Of Birth'
                                                                }
                                                            )}
                                                        >
                                                            <TextInput
                                                                type="date"
                                                                field="dob"
                                                                autoComplete="brith-of-date"
                                                                // validate={(value) => isRequired(value, 'Date Of Birth', null, newDate)}
                                                                validateOnBlur
                                                                max={newDate}
                                                                initialValue={
                                                                    data?.dob
                                                                }
                                                            />
                                                        </Field>
                                                    </div>
                                                </div>
                                            </div>
                                            {data?.b2b_activasion_status
                                                ?.value === 2 && (
                                                    <>
                                                        <h4 className="mt-4">
                                                            <FormattedMessage
                                                                id="signIn.registerBusinessAddressInfo"
                                                                defaultMessage={`Company Information`}
                                                            />
                                                        </h4>
                                                        <div>
                                                            <div className="row form_row">
                                                                <div className="col-sm-4">
                                                                    <Field
                                                                        label={formatMessage(
                                                                            {
                                                                                id:
                                                                                    'createAccount.company',
                                                                                defaultMessage:
                                                                                    'Company Name*'
                                                                            }
                                                                        )}
                                                                    >
                                                                        <TextInput
                                                                            field="company"
                                                                            autoComplete="given-name"
                                                                            validate={value =>
                                                                                isRequired(
                                                                                    value,
                                                                                    'Comapny Name'
                                                                                )
                                                                            }
                                                                            validateOnBlur
                                                                            initialValue={
                                                                                comapnyName?.company
                                                                            }
                                                                            validateOnChange
                                                                            formtype={
                                                                                'register'
                                                                            }
                                                                            disabled={
                                                                                true
                                                                            }
                                                                        />
                                                                    </Field>
                                                                </div>
                                                                <div className="col-sm-4">
                                                                    <Field
                                                                        label={formatMessage(
                                                                            {
                                                                                id:
                                                                                    'createAccount.gst_number',
                                                                                defaultMessage:
                                                                                    'GSTIN/UNI Number*'
                                                                            }
                                                                        )}
                                                                    >
                                                                        <TextInput
                                                                            field="gst_number"
                                                                            autoComplete="gst_number"
                                                                            validate={combine(
                                                                                [
                                                                                    validateGstNumber,
                                                                                    value =>
                                                                                        isRequired(
                                                                                            value,
                                                                                            'GSTIN/UNI Number',
                                                                                            gstNumberLength
                                                                                        )
                                                                                ]
                                                                            )}
                                                                            initialValue={
                                                                                data?.gst_number
                                                                            }
                                                                            validateOnBlur
                                                                            maxLength={
                                                                                gstNumberLength
                                                                            }
                                                                            formtype={
                                                                                'register'
                                                                            }
                                                                            validateOnChange
                                                                        // disabled={mobileNumber}
                                                                        />
                                                                    </Field>
                                                                </div>
                                                                <div className="col-sm-4">
                                                                    <Field
                                                                        label={formatMessage(
                                                                            {
                                                                                id:
                                                                                    'createAccount.cin',
                                                                                defaultMessage:
                                                                                    'CIN Number'
                                                                            }
                                                                        )}
                                                                    >
                                                                        <TextInput
                                                                            field="cin_number"
                                                                            name="CIN Number"
                                                                            autoComplete="CIN Number"
                                                                            validate={combine(
                                                                                [
                                                                                    validateCINNumber
                                                                                ]
                                                                            )}
                                                                            initialValue={
                                                                                data?.cin_number
                                                                            }
                                                                            validateOnBlur
                                                                            maxLength={
                                                                                cinNumberLength
                                                                            }
                                                                            formtype={
                                                                                'register'
                                                                            }
                                                                            validateOnChange
                                                                        />
                                                                    </Field>
                                                                </div>

                                                            </div>
                                                        </div>

                                                    </>
                                                )}
                                            <div className={classes.checkbox}>
                                                <Checkbox
                                                    hideAnchor={true}
                                                    field="change_email"
                                                    fieldState={{
                                                        value: changeEmail
                                                    }}
                                                    label={formatMessage({
                                                        id:
                                                            'accountInformation.ChangeEmail',
                                                        defaultMessage:
                                                            'Change Email'
                                                    })}
                                                    onChange={() => {
                                                        setChangeEmail(!changeEmail)
                                                    }}
                                                    isDisplayOwnLabel={true}
                                                />
                                            </div>
                                            <div
                                                className={
                                                    accountClasses.change_email_password
                                                }
                                            >
                                                {changeEmail && (
                                                    <Field
                                                        label={formatMessage({
                                                            id:
                                                                'accountInformation.changeEmail',
                                                            defaultMessage:
                                                                'Change Email'
                                                        })}
                                                    />
                                                )}
                                            </div>
                                            <div
                                                className={
                                                    accountClasses.field_inner_wrap
                                                }
                                            >
                                                {changeEmail && (
                                                    <Field
                                                        label={formatMessage({
                                                            id:
                                                                'accountInformation.Email',
                                                            defaultMessage:
                                                                'Email*'
                                                        })}
                                                        required={true}
                                                    >
                                                        <TextInput
                                                            field="email"
                                                            autoComplete="email"
                                                            validate={combine([
                                                                value =>
                                                                    isRequired(
                                                                        value,
                                                                        'Email'
                                                                    ),
                                                                validateEmail
                                                            ])}
                                                            validateOnBlur
                                                            initialValue={emailInitialValue}
                                                        />
                                                    </Field>
                                                )}
                                            </div>
                                            <div
                                                className={
                                                    accountClasses.field_inner_wrap
                                                }
                                            >
                                                {changeEmail && (
                                                    <Field
                                                        label={formatMessage({
                                                            id:
                                                                'accountInformation.CurrentPassword',
                                                            defaultMessage:
                                                                'Current Password*'
                                                        })}
                                                        required={true}
                                                    >
                                                        <TextInput
                                                            field="password"
                                                            type="password"
                                                            validate={combine([
                                                                value => isRequired(value, 'Current Password')
                                                            ])}
                                                            validateOnChange
                                                            validateOnBlur
                                                        />
                                                    </Field>
                                                )}
                                            </div>

                                            <div className={classes.checkbox}>
                                                <Checkbox
                                                    hideAnchor={true}
                                                    initialValue={
                                                        changePassword
                                                    }
                                                    field="change_password"
                                                    fieldState={{
                                                        value: changePassword
                                                    }}
                                                    fildeState
                                                    label={formatMessage({
                                                        id:
                                                            'accountInformation.ChangePassword',
                                                        defaultMessage:
                                                            'Change Password'
                                                    })}
                                                    onChange={() => {
                                                        setChangePassword(
                                                            !changePassword
                                                        )
                                                    }
                                                    }
                                                    isDisplayOwnLabel={true}
                                                />
                                            </div>
                                            <div
                                                className={
                                                    accountClasses.change_email_password
                                                }
                                            >
                                                {changePassword && (
                                                    <Field
                                                        label={formatMessage({
                                                            id:
                                                                'accountInformation.ChangeNewPassword',
                                                            defaultMessage:
                                                                'Change Password'
                                                        })}
                                                        required={true}
                                                    />
                                                )}
                                            </div>
                                            <div
                                                className={
                                                    accountClasses.field_inner_wrap
                                                }
                                            >
                                                {changePassword && (
                                                    <Field
                                                        label={formatMessage({
                                                            id:
                                                                'accountInformation.CurrentPassword',
                                                            defaultMessage:
                                                                'Current Password*'
                                                        })}
                                                        required={true}
                                                    >
                                                        <TextInput
                                                            field="password"
                                                            type="password"
                                                            validate={combine([
                                                                value =>
                                                                    isRequired(
                                                                        value,
                                                                        'Current Password'
                                                                    )
                                                            ])}
                                                            validateOnChange
                                                            validateOnBlur
                                                        />
                                                    </Field>
                                                )}
                                            </div>
                                            <div
                                                className={
                                                    accountClasses.field_inner_wrap
                                                }
                                            >
                                                {changePassword && (
                                                    <>
                                                        <Password
                                                            fieldName="new_password"
                                                            isToggleButtonHidden={false}
                                                            label={formatMessage({
                                                                id:
                                                                    'accountInformation.NewPassword',
                                                                defaultMessage:
                                                                    'New Password*'
                                                            })}
                                                            validate={combine([
                                                                value =>
                                                                    isRequired(
                                                                        value,
                                                                        'Password'
                                                                    ),
                                                                validateConfirmPassword
                                                            ])}
                                                            validateOnBlur
                                                            maxLength={
                                                                passwordMaxLength
                                                            }
                                                            type="passwordField"
                                                            setChar={setChar}
                                                            setNumber={
                                                                setNumber
                                                            }
                                                            setUppercase={
                                                                setUppercase
                                                            }
                                                            setLowerCase={
                                                                setLowerCase
                                                            }
                                                            char={char}
                                                            lowercase={
                                                                lowercase
                                                            }
                                                            uppercase={
                                                                uppercase
                                                            }
                                                            number={number}
                                                            isIgnoreValidationMessag={
                                                                true
                                                            }
                                                            validateOnChange
                                                        />
                                                        <div
                                                            className={
                                                                classes.divFlex
                                                            }
                                                        >
                                                            <p
                                                                className={
                                                                    char
                                                                        ? classes.passGreenTick
                                                                        : classes.passValidations
                                                                }
                                                            >
                                                                8 Characters
                                                            </p>
                                                            <p
                                                                className={
                                                                    uppercase
                                                                        ? classes.passGreenTick
                                                                        : classes.passValidations
                                                                }
                                                            >
                                                                1 Uppercase
                                                            </p>
                                                            <p
                                                                className={
                                                                    lowercase
                                                                        ? classes.passGreenTick
                                                                        : classes.passValidations
                                                                }
                                                            >
                                                                1 Lowercase
                                                            </p>
                                                            <p
                                                                className={
                                                                    number
                                                                        ? classes.passGreenTick
                                                                        : classes.passValidations
                                                                }
                                                            >
                                                                1 Number{' '}
                                                            </p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <div
                                                className={
                                                    accountClasses.field_inner_wrap
                                                }
                                            >
                                                {changePassword && (
                                                    <Field
                                                        label={formatMessage({
                                                            id:
                                                                'accountInformation.ConfirmNewPassword',
                                                            defaultMessage:
                                                                'Confirm New Password*'
                                                        })}
                                                        required={true}
                                                    >
                                                        <TextInput
                                                            field="confirm"
                                                            type="password"
                                                            validate={combine([
                                                                value =>
                                                                    isRequired(
                                                                        value,
                                                                        'Confirm New Password'
                                                                    ),
                                                                validateNewConfirmPassword
                                                            ])}
                                                            validateOnBlur
                                                            validateOnChange
                                                        />
                                                    </Field>
                                                )}
                                            </div>
                                            <div className={classes.error}>
                                                {errorMessage}
                                            </div>
                                            <div
                                                className={classes.edit_acc_btn}
                                            >
                                                <Button
                                                    type="submit"
                                                    priority="high"
                                                    disabled={(changePassword && (!char || !uppercase || !lowercase || !number))}
                                                >
                                                    <FormattedMessage
                                                        id={
                                                            'accountInformation.edit_acc_btn'
                                                        }
                                                        defaultMessage={
                                                            'Save Changes'
                                                        }
                                                    />
                                                </Button>
                                            </div>
                                        </Form>
                                    </div>
                                )}
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
