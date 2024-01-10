import { useCallback } from 'react';
import { useAppContext } from '@magento/peregrine/lib/context/app';

export const useModalSignIn = () => {
    const [{ drawer }, { closeDrawer }] = useAppContext();
    const [, { toggleDrawer }] = useAppContext();
    const openDrawer = useCallback(async () => {
        toggleDrawer('sign-in');
    }, [toggleDrawer]);
    const isOpen = drawer === 'sign-in';
    const handleClose = useCallback(async () => {
        closeDrawer();
    }, [closeDrawer]);

    return {
        isOpen,
        openDrawer,
        handleClose
    };
};
