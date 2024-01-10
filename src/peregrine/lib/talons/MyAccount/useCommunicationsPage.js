import { useCallback, useMemo } from 'react';
import { useLazyQuery, useMutation/* , useQuery  */ } from '@apollo/client';

import { useUserContext } from '@magento/peregrine/lib/context/user';

export const useCommunicationsPage = props => {
    const {
        afterSubmit,
        setIsSubscribe,
        isSubscribe,
        mutations: { setNewsletterSubscriptionMutation },
        queries: { getCustomerSubscriptionQuery }
    } = props;

    const [{ isSignedIn }] = useUserContext();

    const [isSubscribeData, { data: subscriptionData, error: subscriptionDataError, loading: subscriptionLoading }] = useLazyQuery(
        getCustomerSubscriptionQuery,
        {
            fetchPolicy: "no-cache",
            onCompleted: (data) => {
                localStorage.setItem("isSubscribeNewSletter", data?.customer?.is_subscribed)
                setIsSubscribe(data?.customer?.is_subscribed)
            }
        },
        { skip: !isSignedIn }
    );

    const initialValues = useMemo(() => {
        return { isSubscribed: subscriptionData?.customer?.is_subscribed || false };
    }, [subscriptionData]);

    const [
        setNewsletterSubscription,
        { error: setNewsletterSubscriptionError, loading: isSubmitting }
    ] = useMutation(setNewsletterSubscriptionMutation);

    const handleSubmit = useCallback(
        async () => {
            try {
                await setNewsletterSubscription({
                    variables: {
                        isSubscribed: isSubscribe
                    }
                })
                isSubscribeData()
            } catch {
                // we have an onError link that logs errors, and FormError already renders this error, so just return
                // to avoid triggering the success callback
                return;
            }
            if (afterSubmit) {
                afterSubmit();
            }
        },
        [setNewsletterSubscription, afterSubmit, isSubscribe]
    );

    return {
        formErrors: [setNewsletterSubscriptionError, subscriptionDataError],
        initialValues,
        handleSubmit,
        isDisabled: isSubmitting,
        isSignedIn,
        isSubscribeData,
        subscriptionLoading
    };
};
