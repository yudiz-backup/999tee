/**
 * @fileoverview This file houses functions that can be used for
 * validation of form fields.
 *
 * Note that these functions should return a string error message
 * when they fail, and `undefined` when they pass.
 */

const SUCCESS = undefined;

export const hasLengthAtLeast = (value, minimumLength) => {
    if (!value || value.length < minimumLength) {
        return `Must contain at least ${minimumLength} character(s).`;
    }

    return SUCCESS;
};

export const hasLengthAtLeastCouponcode = (value, minimumLength) => {

    if (value && value?.length < minimumLength) {
        return `Must contain at least ${minimumLength} character(s).`;
    }

    return SUCCESS;
};

export const hasLengthAtMost = (value, values, maximumLength) => {
    if (value && value.length > maximumLength) {
        return `Must not exceed ${maximumLength} character(s).`;
    } else if (value === values.password) {
        return 'password does not match';
    }

    return SUCCESS;
};

export const hasLengthExactly = (value, values, length) => {
    if (value && value.length !== length) {
        return `Must contain exactly ${length} character(s).`;
    }

    return SUCCESS;
};

/**
 * isRequired is provided here for convenience but it is inherently ambiguous and therefore we don't recommend using it.
 * Consider using more specific validators such as `hasLengthAtLeast` or `mustBeChecked`.
 */
export const isRequired = (value, prefixMessage, lengthCheck = 0, newdate) => {
    const FAILURE = prefixMessage
        ? `${prefixMessage} is required.`
        : 'Is required.';

    // The field must have a value (no null or undefined) and
    // if it's a boolean, it must be `true`.
    if (!value) return FAILURE;
    if (value && lengthCheck && value.length !== lengthCheck)
        return `${prefixMessage} required ${lengthCheck} digits.`;
    if (prefixMessage === 'OTP' && value.length > 4)
        return `${prefixMessage} length should not be greater than 4`;
    if (prefixMessage === 'OTP' && value.length < 4)
        return `${prefixMessage} length should not be less than 4`;
    if (prefixMessage === 'Date Of Birth') {
        if (new Date(newdate) < new Date(value)) {
            return 'Invalid Date'
        }
    }
    // If it is a number or string, it must have at least one character of input (after trim).
    const stringValue = String(value).trim();
    const measureResult = hasLengthAtLeast(stringValue, null, 1);
    if (measureResult) return FAILURE;
    return SUCCESS;
};


export const mustBeChecked = value => {
    if (!value) return 'Must be checked.';

    return SUCCESS;
};

export const validatePassword = (value, charr, uppercase, lowercase, number, prefixMessage) => {
    if (!value) {
        return 'Please enter Password.';
    } else {
        const count = {
            upperCase: 0,
            lowerCase: 0,
            digit: 0,
        };
        if (typeof value !== 'undefined') {
            if (prefixMessage === 'password') {
                for (const char of value) {
                    if (prefixMessage === 'password') {
                        if (!charr || !uppercase || !lowercase || !number) {
                            return 'Password must contain at least eight characters, at least one number and atleast one lower and uppercase letter.';
                        }
                    }
                }
            } else {
                // if(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(value)) {
                //     return 'Password must contain at least eight characters, at least one number and atleast one lower and uppercase letter.';
                // }
                if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(value) === false) {
                    return 'Password must contain at least eight characters, at least one number and atleast one lower and uppercase letter.';

                }
                //  if (/[A-Z]/.test(char)) count.upperCase++;
                //  else if (/\d/.test(char)) count.digit++;
                //  else if (/[a-z]/.test(char)) count.lowerCase++;
                //  if (Object.values(count).filter(Boolean).length <= 1) {
                //  }
            }

        }



        return SUCCESS;
    }
};

export const validateMobileNumber = value => {
    if (!value) {
        return 'Please enter Mobile Number.';
    } else {
        const count = {
            digit: 0
        };
        if (typeof value !== 'undefined') {
            for (const char of value) {
                if (/[0-9]/.test(char)) count.digit++;
            }
        }

        if (Object.values(count).filter(Boolean).length <= 0) {
            return 'Contain must only numeric value.';
        }

        return SUCCESS;
    }
};

export const validateName = value => {
    if (!value) {
        return `Street Address is Required.`;
    } else {
        const regex = /^[a-zA-Z]+$/;
        return regex.test(value) ?
            SUCCESS :
            'Use only letters and avoid numbers, special characters, and spaces.';
    }
};

export const validateNotNumber = value => {
    if (!value) {
        return `Street Address is Required.`;
    } else {
        const count = {
            digit: 0,
            string: 0
        };
        if (typeof value !== 'undefined') {
            for (const char of value) {
                if (!/[0-9]/.test(char)) count.digit++;
                if (!/[!"`'#%&,:;<>=@{}~\$\(\)\*\+\/\\\?\[\]\^\|]+/.test(char))
                    count.string++;
            }
        }

        if (Object.values(count).filter(Boolean).length <= 1) {
            return 'Numbers and Special characters are not allowed in this field.';
        }

        return SUCCESS;
    }
};

export const validateConfirmPassword = (
    value,
    values,
    passwordKey = 'new_password'
) => {
    return value === values[passwordKey]
        ? SUCCESS
        : `New password and confirm password doesn't match.`;
};

/***
 * Adding new validators
 */

export const validateEmail = value => {
    if (!value) {
        return '';
    } else {
        const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        return regex.test(value) ? SUCCESS : 'Please enter a valid Email Id.';
    }
};

export const validateUrlLink = value => {
    if (value) {
        const regex = new RegExp('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?');
        return regex.test(value) ? SUCCESS : 'Please enter Valid URL Link.';
    }
};

export const validateGstNumber = value => {
    if (value) {
        const regex = new RegExp(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/);
        return regex.test(value) ? SUCCESS : 'Please enter Valid GSTIN/UNI Number.';
    }
};

export const validateCINNumber = value => {
    if (value) {
        const regex = new RegExp(/^([LUu]{1})([0-9]{5})([A-Za-z]{2})([0-9]{4})([A-Za-z]{3})([0-9]{6})$/);
        return regex.test(value) ? SUCCESS : 'Please enter Valid CIN Number.';
    }
};

export const validateNewConfirmPassword = (
    value,
    values,
    passwordKey = 'new_password'
) => {
    return value === values[passwordKey] ? SUCCESS : `New password and confirm password doesn't match.`;
};

export const validateConfirmEmail = (value,
    values,
    passwordKey = 'email') => {
    return value === values[passwordKey] ? SUCCESS : 'Email must match.';
}

export const forceTextInputAsNumber = e => {
    isNaN(parseInt(e.key, 10)) &&
        !['Backspace', 'Enter', 'Tab'].includes(e.key) &&
        e.preventDefault();
};

export const checkOnlyNumberAllow = (value, prefixMessage) => {
    const FAILURE = prefixMessage
        ? `${prefixMessage} is required.`
        : 'Is required.';
    if (!value || (value && !value.trim())) return FAILURE;

    const regex = /^\d+$/;

    return regex.test(value)
        ? SUCCESS
        : 'Only Numbers are allowed for this input field';
};

export const checkOnlyDecimalNumberAllow = (value, prefixMessage) => {
    const FAILURE = prefixMessage
        ? `${prefixMessage} is required.`
        : 'Is required.';
    if (!value || (value && !value.trim())) return FAILURE;

    const regex = /^\d*\.?\d*$/;

    return regex.test(value)
        ? SUCCESS
        : 'Only Numbers are allowed for this input field';
};

export const checkOnlyNumberAllowForPinCode = (value, prefixMessage) => {
    const FAILURE = prefixMessage
        ? `${prefixMessage} is required.`
        : 'Is required.';
    const NOTALLOWED = `"Zero" is not allowed at first position`
    if (!value || (value && !value.trim())) return FAILURE;
    if (value.startsWith("0")) {
        return NOTALLOWED
    }
    const regex = /^\d+$/;

    return regex.test(value)
        ? SUCCESS
        : `Enter valid ${prefixMessage}.`;
};

export const passwordMaxLength = 15;
export const postalCodeMaxLength = 6;
export const mobileNumberLength = 10;
export const nameMaxLength = 25;
export const nameMinLength = 2;
export const gstNumberLength = 15;
export const cinNumberLength = 21;
