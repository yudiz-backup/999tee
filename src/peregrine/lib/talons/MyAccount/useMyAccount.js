import { useCallback } from 'react';
import { useUserContext } from '../../context/user';
import { useAppContext } from '@magento/peregrine/lib/context/app';

const DEFAULT_TITLE = 'My Account';
const UNAUTHED_TITLE = 'Signing Out';
const UNAUTHED_SUBTITLE = 'Please wait...';

export const useMyAccount = props => {
    const { onSignOut } = props;
    const [{ currentUser }] = useUserContext();
    const { email, firstname, lastname } = currentUser;
    const name = `${firstname} ${lastname}`.trim() || DEFAULT_TITLE;
    const title = email ? name : UNAUTHED_TITLE;
    const subtitle = email ? email : UNAUTHED_SUBTITLE;
    const [, { closeDrawer }] = useAppContext();

    const handleSignOut = useCallback(() => {
        onSignOut();
    }, [onSignOut]);

    const myaccountHandle = useCallback(() => {
        onSignOut();
    }, [onSignOut]);

    return {
        handleSignOut,
        subtitle,
        title,
        myaccountHandle,
        closeDrawer
    };
};
