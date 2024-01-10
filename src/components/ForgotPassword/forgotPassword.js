import React, { Fragment, useState } from 'react';
import { shape, string } from 'prop-types';
import { mergeClasses } from '../../classify';
import ForgotPasswordForm from './ForgotPasswordForm';
import defaultClasses from './forgotPassword.css';
import { useForgotPassword } from '../../peregrine/lib/talons/ForgotPassword/useForgotPassword';
import forgotPasswordMutation from '../../queries/forgotPassword.graphql';
import resetPasswordWithOTP from '../../queries/signInWithOTP/resetPasswordWithOTP.graphql'

const ForgotPassword = props => {
    const [verifyOTP, setVerifyOTP] = useState()
    const [mobileNumber, setMobileNumber] = useState()
    const [newPassword, setNewPassword] = useState()
    const [message, setMessage] = useState('')

    const { initialValues, onClose, onCancel, handleTriggerClick } = props;
    const talonProps = useForgotPassword({
        onClose,
        query: forgotPasswordMutation,
        setMessage
    });

    const { handleFormSubmit, inProgress, forgotPasswordResponse } = talonProps;

    const classes = mergeClasses(defaultClasses, props.classes);
    return (
        <div className={classes.root}>
            <Fragment>
                <ForgotPasswordForm
                    handleTriggerClick={handleTriggerClick}
                    initialValues={initialValues}
                    onSubmit={handleFormSubmit}
                    isResettingPassword={inProgress}
                    otpResponse={forgotPasswordResponse}
                    setShowForgot={onCancel}
                    setVerifyOTP={setVerifyOTP}
                    verifyOTP={verifyOTP}
                    mobileNumber={mobileNumber}
                    setMobileNumber={setMobileNumber}
                    setNewPassword={setNewPassword}
                    newPassword={newPassword}
                    resetPasswordWithOTP={resetPasswordWithOTP}
                    message={message}
                    setMessage={setMessage}
                />
            </Fragment>
        </div>
    );
};

export default ForgotPassword;

ForgotPassword.propTypes = {
    classes: shape({
        instructions: string,
        root: string
    }),
    email: string,
    initialValues: shape({
        email: string
    })
};
