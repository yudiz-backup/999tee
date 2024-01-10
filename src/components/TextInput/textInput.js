import React, { Component, Fragment/* , useEffect  */ } from 'react';
import { node, number, oneOfType, shape, string } from 'prop-types';
import { BasicText, asField } from 'informed';
import { compose } from 'redux';

import classify from '../../classify';
import { FieldIcons, Message } from '../Field';
import defaultClasses from './textInput.css';
import Button from '../Button';
import {
    Check
} from 'react-feather';
export class TextInput extends Component {
    checkButton() {
        <Button
            className={defaultClasses.passwordButton}
            // onClick={togglePasswordVisibility}
            type="button"
        >

            <Check style={{ color: '#00853d' }} />
        </Button>
    }
    static propTypes = {
        after: node,
        before: node,
        classes: shape({
            input: string
        }),
        fieldState: shape({
            value: oneOfType([string, number])
        }),
        message: node
    };

    render() {
        const {
            after,
            before,
            classes,
            fieldState,
            message,
            id,
            field,
            isIgnoreValidationMessag = false,
            char,
            lowercase,
            uppercase,
            number,
            formtype,
            // mobileNumber,
            // setError = () => {},
            disabled,
            ...rest
        } = this.props;
        // const inputClass = fieldState.error 
        //     ? classes.input_error
        //     : classes.input;
        // input_success
        // Latest-Condition
        const inputClass = fieldState.error === undefined && fieldState.value && fieldState.value.length > 0 && (formtype === 'forget' || formtype === 'register' || formtype === 'login'
            || formtype === 'checkout' || formtype === 'checkoutCustomer' || formtype === 'checkoutEmail' || formtype === 'loginMobile' || formtype === 'editAccount' || formtype === 'accountInfo' || formtype === 'editAccount'
            || formtype === 'accountInfo' || formtype === 'registerWithMobile')
            ? classes.input : (fieldState.error) ? classes.input_error : classes.input;
        // const inputClass=fieldState.value === undefined ? classes.input :fieldState.error ? classes.input_error :  classes.input_success
        // const inputClass=fieldState.error ? classes.input_error : fieldState.error === undefined ?classes.input:classes.input_success   
        //  const passClass = char || uppercase || lowercase || number  && fieldState.value &&  fieldState.value.length > 0 
        //  ? classes.input_success :( !char || !uppercase || !lowercase || !number) ? classes.input_error: classes.input;
        // const inputClass = fieldState.error
        // ? classes.input_error
        // : classes.input;

        const passClass = char && uppercase && lowercase && number
            ? classes.input_success : fieldState.error ? classes.input_error : fieldState.value === undefined ? classes.input : classes.input_error
        // useEffect(() => {
        //     if(fieldState.error) {
        //     }
        // }, [fieldState])
        return (
            <Fragment>
                <FieldIcons
                    after={
                        //     formtype === 'register' || formtype === 'login' || formtype === 'checkout'|| formtype === 'forget' || formtype === 'loginMobile' || formtype === 'checkoutEmail'
                        // || formtype === 'editAccount' || formtype === 'checkoutCustomer' || formtype === 'accountInfo' || formtype === 'editAccount'|| formtype === 'accountInfo' || formtype === 'registerWithMobile' ? <>
                        // {
                        //     fieldState.error === undefined && fieldState.value &&  fieldState.value.length > 0 &&  <Button
                        //     className={defaultClasses.passwordButton}
                        //     type="button"
                        //     tabindex="-1"
                        // >
                        // <Check style={{color: '#00853d'}} />
                        // </Button>
                        // }
                        // </> : 

                        after
                    } before={before}>
                    <BasicText
                        {...rest}
                        fieldState={fieldState}
                        className={field === 'new_password' ? passClass : inputClass}
                        id={id}
                        field={field}
                        disabled={disabled}
                    // Value={this.props?.formvalue}
                    />
                </FieldIcons>
                {
                    !isIgnoreValidationMessag && <Message fieldState={fieldState}>{message}</Message>
                }
                {this.checkButton()}
            </Fragment>
        );
    }
}

export default compose(
    classify(defaultClasses),
    asField
)(TextInput);
