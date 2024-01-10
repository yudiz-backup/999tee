import React from 'react';
import { string, bool, shape, func } from 'prop-types';
import { Eye, EyeOff } from 'react-feather';

import { mergeClasses } from '@magento/venia-ui/lib/classify';
import { usePassword } from '@magento/peregrine/lib/talons/Password/usePassword';

import Button from '../Button';
import Field from '../Field';
import TextInput from '../TextInput';
import { isRequired } from '../../util/formValidators';

import defaultClasses from './password.css';

const Password = props => {
    const {
        classes: propClasses,
        label,
        fieldName,
        isToggleButtonHidden,
        autoComplete,
        validate,
        // passwordFieldValue,
        type,
        setChar,
        setLowerCase,
        setNumber,
        setUppercase,
        isIgnoreValidationMessag = false,
        char,
        uppercase,
        lowercase,
        number,
        handleChangeNewPassword,
        passwordCheck,
        ...otherProps
    } = props;
    const talonProps = usePassword();
    const { visible, togglePasswordVisibility } = talonProps;
    const classes = mergeClasses(defaultClasses, propClasses);
    const passwordButton = (
        <Button
            className={classes.passwordButton}
            onClick={togglePasswordVisibility}
            type="button"
            tabIndex="-1"
        >
            {visible ? <Eye /> : <EyeOff />}
        </Button>
    );

    const fieldType = visible ? 'text' : 'password';
    const handlePassword = (e) => {
        if (type === 'passwordField') {
            const passwordFieldValue = e.target.value;
            const isLengthValid = passwordFieldValue.length >= 8;
            const hasLowerCase = /[a-z]/.test(passwordFieldValue);
            const hasUpperCase = /[A-Z]/.test(passwordFieldValue);
            const hasNumber = /\d/.test(passwordFieldValue);

            setChar(isLengthValid);
            setLowerCase(hasLowerCase);
            setUppercase(hasUpperCase);
            setNumber(hasNumber);
        }
    }

    return (
        <Field label={label} classes={{ root: classes.root }}>
            <TextInput
                after={!isToggleButtonHidden && passwordButton}
                autoComplete={autoComplete}
                field={fieldName}
                type={fieldType}
                validate={type !== 'checkoutPassword' && validate}
                {...otherProps}
                onChange={(e) => {
                    handlePassword(e)
                    if (passwordCheck === true) {
                        handleChangeNewPassword(e)
                    }
                }}
                char={char}
                number={number}
                uppercase={uppercase}
                lowercase={lowercase}
                isIgnoreValidationMessag={isIgnoreValidationMessag}
            />
        </Field>
    );
};

Password.propTypes = {
    autoComplete: string,
    classes: shape({
        root: string
    }),
    label: string,
    fieldName: string,
    isToggleButtonHidden: bool,
    validate: func
};

Password.defaultProps = {
    isToggleButtonHidden: true,
    validate: isRequired
};

export default Password;
