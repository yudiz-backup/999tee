import { useCallback, useState } from 'react';
import { useMutation } from '@apollo/client';

/**
 * Returns props necessary to render a ForgotPassword form.
 * @param {function} props.onClose callback function to invoke when closing the form
 */
export const useForgotPassword = props => {
    const { onClose, query } = props;
    const [forgotPassword, { data: forgotPasswordResponse }] = useMutation(
        query
    );

    const [inProgress, setInProgress] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState(null);

    const handleFormSubmit = useCallback(
        async ({ email }) => {
            setInProgress(true);
            setForgotPasswordEmail(email);
            await forgotPassword({ variables: { email } });
            setInProgress(false);
        },
        [forgotPassword]
    );

    const handleContinue = useCallback(() => {
        setInProgress(false);
        onClose();
    }, [onClose]);

    return {
        forgotPasswordEmail,
        handleContinue,
        handleFormSubmit,
        inProgress,
        forgotPasswordResponse
    };
};

export const useResetPassword = props => {
    const { query } = props;
    const [resetPassword, { data: resetPasswordResponse }] = useMutation(query);

    const [inProgress, setInProgress] = useState(false);

    const submitResetForm = useCallback(
        async (value, cpatchaToken) => {
            setInProgress(true);
            await resetPassword({
                variables: value,
                context: {
                    headers: {
                        "X-ReCaptcha": cpatchaToken ? cpatchaToken : ""
                    }
                }
            },
            );
            setInProgress(false);
        },
        [resetPassword]
    );

    return {
        submitResetForm,
        inProgress,
        resetPasswordResponse
    };
};
