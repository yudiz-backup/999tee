import { useCallback, useState } from 'react';
import { useApolloClient, useMutation } from '@apollo/client';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { useCartContext } from '@magento/peregrine/lib/context/cart';
import { useAwaitQuery } from '@magento/peregrine/lib/hooks/useAwaitQuery';
import { retrieveCartId } from '@magento/peregrine/lib/store/actions/cart';
import { clearCartDataFromCache } from '@magento/peregrine/lib/Apollo/clearCartDataFromCache';
import { clearCustomerDataFromCache } from '@magento/peregrine/lib/Apollo/clearCustomerDataFromCache';

/**
 * Returns props necessary to render a ForgotPassword form.
 * @param {function} props.onClose callback function to invoke when closing the form
 */
export const useAccountConfirmation = props => {
    const apolloClient = useApolloClient();

    const {
        accountConfirmationMutation,
        createCartMutation,
        getCartDetailsQuery,
        customerQuery
    } = props;
    const [accountConfirm, { data: accountConfirmResponse }] = useMutation(
        accountConfirmationMutation
    );

    const [inProgress, setInProgress] = useState(false);

    const [, { createCart, getCartDetails, removeCart }] = useCartContext();
    const [, { getUserDetails, setToken }] = useUserContext();
    const [fetchCartId] = useMutation(createCartMutation);
    const fetchUserDetails = useAwaitQuery(customerQuery);
    const fetchCartDetails = useAwaitQuery(getCartDetailsQuery);

    const handleAccountConfirm = useCallback(
        async ({ id, key }) => {
            setInProgress(true);
            const response = await accountConfirm({ variables: { id, key } });
            if (response && response.data.accountConfirmation.success) {
                const token =
                    response &&
                    response.data.accountConfirmation.success &&
                    response.data.accountConfirmation.token;

                await setToken(token);

                await clearCartDataFromCache(apolloClient);
                await clearCustomerDataFromCache(apolloClient);
                await removeCart();

                await getUserDetails({ fetchUserDetails });

                await createCart({
                    fetchCartId
                });

                const destinationCartId = await retrieveCartId();
                localStorage.setItem('cart_id', destinationCartId)

                await getCartDetails({
                    fetchCartId,
                    fetchCartDetails
                });
            }
            setInProgress(false);
        },
        [
            accountConfirm,
            setToken,
            getUserDetails,
            fetchUserDetails,
            removeCart,
            createCart,
            fetchCartId,
            getCartDetails,
            fetchCartDetails
        ]
    );

    return {
        inProgress,
        handleAccountConfirm,
        accountConfirmResponse
    };
};

export const useSendConfirmationLink = props => {
    const { accountConfirmationLinkMutation } = props;
    const [confirmLink, { data: confirmLinkData }] = useMutation(
        accountConfirmationLinkMutation
    );

    const [inProgress, setInProgress] = useState(false);

    const SendAccountConfirmLink = useCallback(
        async ({ email }) => {
            setInProgress(true);
            await confirmLink({ variables: { email } });
            setInProgress(false);
        },
        [confirmLink, setInProgress]
    );

    return {
        inProgress,
        SendAccountConfirmLink,
        confirmLinkData
    };
};
