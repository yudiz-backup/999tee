import React, { useState, useEffect } from 'react';
import ACC_CONFIRMATION_MUTATION from './accountConfirmation.graphql';
import LoadingIndicator from '../LoadingIndicator';
import { useAccountConfirmation } from '../../peregrine/lib/talons/AccountConfirmation/useAccountConfirmation';
import CREATE_CART_MUTATION from '../../queries/createCart.graphql';
import GET_CART_DETAILS_QUERY from '../../queries/getCartDetails.graphql';
import GET_CUSTOMER_QUERY from '../../queries/getCustomer.graphql';
import { Redirect } from 'src/drivers';
import { useLocation } from 'react-router-dom';
import { useToasts } from '@magento/peregrine';

const AccountConfirmation = () => {
    const [confirm, setConfirm] = useState(false);
    const [, { addToast }] = useToasts();
    const location = useLocation();
    const { search } = location;
    const searchData = new URLSearchParams(search);
    const id = searchData.get('id');
    const key = searchData.get('key');
    const {
        inProgress,
        handleAccountConfirm,
        accountConfirmResponse
    } = useAccountConfirmation({
        accountConfirmationMutation: ACC_CONFIRMATION_MUTATION,
        createCartMutation: CREATE_CART_MUTATION,
        getCartDetailsQuery: GET_CART_DETAILS_QUERY,
        customerQuery: GET_CUSTOMER_QUERY
    });

    useEffect(() => {
        if (id && key && !confirm) {
            handleAccountConfirm({ id, key });
            setConfirm(true);
        }
    }, [id, key, confirm, handleAccountConfirm]);
    if (inProgress) {
        return <LoadingIndicator />;
    }

    if (
        typeof accountConfirmResponse != 'undefined' &&
        accountConfirmResponse.accountConfirmation.success == false
    ) {
        addToast({
            type: 'error',
            message: accountConfirmResponse.accountConfirmation.message,
            dismissable: true,
            timeout: 5000
        });
        return <Redirect to="/" />;
    } else if (
        typeof accountConfirmResponse != 'undefined' &&
        accountConfirmResponse.accountConfirmation.success == true
    ) {
        addToast({
            type: 'info',
            message: accountConfirmResponse.accountConfirmation.message,
            dismissable: true,
            timeout: 5000
        });
        return <Redirect to="/" />;
    }

    return <></>;
};
export default AccountConfirmation;
