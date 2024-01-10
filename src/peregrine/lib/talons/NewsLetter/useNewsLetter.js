import { useCallback, useRef, useState } from 'react';
import { useMutation } from '@apollo/client';
import { useUserContext } from '@magento/peregrine/lib/context/user';

export const useNewsLetter = props => {
    const { query } = props;
    const [{ isSignedIn, currentUser }] = useUserContext();
    const [subscribing, setSubscribing] = useState(false);
    const [responseData, setResponseData] = useState({});
    const [subscribeNewsLetter, { message: newsLetterError }] = useMutation(
        query
    );

    const { extension_attributes } = currentUser;

    const errors = [];
    if (newsLetterError) {
        errors.push(newsLetterError.graphQLErrors[0]);
    }

    const formRef = useRef(null);

    const handleSubmit = useCallback(
        async ({ email_id }) => {
            setSubscribing(true);
            try {
                // Sign in and save the token
                const response = await subscribeNewsLetter({
                    variables: { email: email_id, subscribe: true }
                });
                setResponseData(response.data.newsletter);
                setSubscribing(false);
            } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    console.error(error);
                }
                setSubscribing(false);
            }
        },
        [subscribeNewsLetter]
    );

    return {
        errors,
        formRef,
        handleSubmit,
        isBusy: subscribing,
        responseData,
        isSignedIn,
        currentUser,
        extension_attributes
    };
};
