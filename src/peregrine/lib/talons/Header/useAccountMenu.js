import { useState, useCallback, useEffect, useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useApolloClient, useMutation } from '@apollo/client';

import { useUserContext } from '@magento/peregrine/lib/context/user';

import { clearCartDataFromCache } from '@magento/peregrine/lib/Apollo/clearCartDataFromCache';
import { clearCustomerDataFromCache } from '@magento/peregrine/lib/Apollo/clearCustomerDataFromCache';
import { globalContext } from '../../context/global.js';

import { Util } from '@magento/peregrine';
const { BrowserPersistence } = Util;
const storage = new BrowserPersistence();

/**
 * The useAccountMenu talon complements the AccountMenu component.
 *
 * @param {Object} props
 * @param {DocumentNode} props.mutations.signOutMutation - Mutation to be called for signout.
 * @param {Boolean} props.accountMenuIsOpen - Boolean to notify if the account menu dropdown is open.
 * @param {Function} props.setAccountMenuIsOpen - Function to set the value of accountMenuIsOpen
 *
 * @returns {Object}    talonProps
 * @returns {String}    talonProps.view - Current view.
 * @returns {String}  talonProps.username - Username of the current user trying to login / logged in.
 * @returns {Boolean}   talonProps.isUserSignedIn - Boolean to notify if the user is signed in.
 * @returns {Function}  talonProps.handleSignOut - Function to handle the signout workflow.
 * @returns {Function}  talonProps.handleForgotPassword - Function to handle forgot password workflow.
 * @returns {Function}  talonProps.handleCreateAccount - Function to handle create account workflow.
 * @returns {Function}  talonProps.setUsername - Function to set the username.
 */

export const useAccountMenu = props => {
    const { mutations, accountMenuIsOpen, setAccountMenuIsOpen } = props;
    const { signOut: signOutMutation } = mutations;

    const { dispatch } = useContext(globalContext);

    const [view, setView] = useState('SIGNIN');
    const [username, setUsername] = useState('');

    const apolloClient = useApolloClient();
    const history = useHistory();
    const location = useLocation();
    const [revokeToken] = useMutation(signOutMutation);
    const [{ isSignedIn: isUserSignedIn }, { signOut }] = useUserContext()

    const handleSignOut = useCallback(async () => {
        setView('SIGNIN');
        setAccountMenuIsOpen(false)
        await signOut({ revokeToken });

        // Delete cart/user data from the redux store.
        await clearCartDataFromCache(apolloClient);
        await clearCustomerDataFromCache(apolloClient);
        if (storage.getItem('compare_uid')) storage.removeItem('compare_uid');

        const resultGuestWishlistData = localStorage.getItem('guest_wishlist');
        const guestWishlistData = resultGuestWishlistData
            ? JSON.parse(resultGuestWishlistData)
            : [];
        if (guestWishlistData && guestWishlistData.length) {
            localStorage.removeItem('guest_wishlist');
        }

        if (JSON.parse(localStorage.getItem('giftWrapper')) &&
            JSON.parse(localStorage.getItem('giftWrapper')).length) {
            localStorage.removeItem('giftWrapper')
        }
        localStorage.removeItem('isChecked')
        localStorage.removeItem('isCheckedAllCart')

        const allCartGiftWrapper = JSON.parse(localStorage.getItem('allCartGiftWrapper'))

        if (allCartGiftWrapper &&
            allCartGiftWrapper.mpGiftWrapWrapperSetAll &&
            allCartGiftWrapper.mpGiftWrapWrapperSetAll.length) {
            localStorage.removeItem('allCartGiftWrapper')
        }

        dispatch({
            type: 'WISHLIST_COUNT',
            payload: 0
        });

        localStorage.removeItem('token')
        localStorage.removeItem('customer_id')

        history.push('/');

        history.go(0);

    }, [apolloClient, history, revokeToken, setAccountMenuIsOpen, signOut]);

    const handleForgotPassword = useCallback(() => {
        setView('FORGOT_PASSWORD');
    }, []);

    const handleCancel = useCallback(() => {
        setView('SIGNIN');
    }, []);

    const handleCreateAccount = useCallback(() => {
        setView('CREATE_ACCOUNT');
    }, []);

    const handleAccountCreation = useCallback(() => {
        setView('ACCOUNT');
    }, []);

    // Close the Account Menu on page change.
    // This includes even when the page "changes" to the current page.
    // This can happen when clicking on a link to a page you're already on, for example.
    useEffect(() => {
        setAccountMenuIsOpen(false);
    }, [location, setAccountMenuIsOpen]);

    // Update view based on user status everytime accountMenuIsOpen has changed.
    useEffect(() => {
        if (isUserSignedIn) {
            setView('ACCOUNT');
        } else {
            setView('SIGNIN');
        }
    }, [accountMenuIsOpen, isUserSignedIn]);

    return {
        handleAccountCreation,
        handleCreateAccount,
        handleForgotPassword,
        handleCancel,
        handleSignOut,
        updateUsername: setUsername,
        username,
        view
    };
};
0