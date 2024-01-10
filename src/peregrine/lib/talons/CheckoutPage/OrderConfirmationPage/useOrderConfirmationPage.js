import { useMutation } from '@apollo/client';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { useState, useCallback } from 'react';

export const flatten = data => {
    const { cart } = data;
    const { shipping_addresses } = cart;
    const address = shipping_addresses[0];

    const shippingMethod = `${
        address?.selected_shipping_method?.carrier_title
    } - ${address?.selected_shipping_method?.method_title}`;

    return {
        city: address?.city,
        country: address?.country.label,
        email: cart?.email,
        firstname: address?.firstname,
        lastname: address?.lastname,
        postcode: address?.postcode,
        region: address?.region.label,
        shippingMethod,
        street: address?.street,
        totalItemQuantity: cart?.total_quantity
    };
};

export const useOrderConfirmationPage = props => {
    const { data, query } = props;
    const [
        handleSave,
        { error: messageError, data: messageData }
    ] = useMutation(query);
    const [inProgress, setInProgress] = useState(false);

    const SaveMessage = useCallback(
        async ({ orderNumber, cardMessage }) => {
            try {
                setInProgress(true);

                await handleSave({
                    variables: {
                        order_id: orderNumber,
                        comment: cardMessage
                    }
                });
                setInProgress(false);
            } catch (err) {
                console.error(
                    'An error occurred during when placing the order',
                    err
                );
            }
        },
        [handleSave]
    );
    const [{ isSignedIn }] = useUserContext();
    if (messageError || messageData) {
        localStorage.removeItem('cardMessage');
    }
    return {
        flatData: flatten(data),
        isSignedIn,
        SaveMessage,
        inProgress
    };
};
