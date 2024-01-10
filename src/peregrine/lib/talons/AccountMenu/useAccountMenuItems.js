import { useCallback } from 'react';

/**
 * @param {Object}      props
 * @param {Function}    props.onSignOut - A function to call when sign out occurs.
 *
 * @returns {Object}    result
 * @returns {Function}  result.handleSignOut - The function to handle sign out actions.
 */
export const useAccountMenuItems = props => {
    const { onSignOut } = props;

    const handleSignOut = useCallback(() => {
        onSignOut();
    }, [onSignOut]);

    const MENU_ITEMS = [
        {
            name: 'My Account',
            id: 'My Account',
            url: '/customer/account'
        },
        {
            name: 'My Orders',
            id: 'My Orders',
            url: '/order/history'
        },
        {
            name: 'My Wishlist',
            id: 'My Wishlist',
            url: '/wishlist'
        },
        {
            name: 'Address Book',
            id: 'Address Book',
            url: '/customer/address/'
        },
        {
            name: 'Account Information',
            id: 'Account Information',
            url: '/customer/account/edit/'
        },
        {
            name: 'My Reviews & Ratings',
            id: 'My Reviews',
            url: '/review/customer/'
        },
        {
            name: 'Newsletter Subscriptions',
            id: 'Newsletter Subscriptions',
            url: '/newsletter/manage/'
        }
    ];

    return {
        handleSignOut,
        menuItems: MENU_ITEMS
    };
};
