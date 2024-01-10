import { useCallback } from 'react';
import { useAppContext } from '@magento/peregrine/lib/context/app';

export const useNavigationTrigger = () => {
    const [, { toggleDrawer }] = useAppContext();

    const handleOpenNavigation = useCallback((state) => {
        if (state === 'sign-in') {
            toggleDrawer('sign-in')
        } else {
            toggleDrawer('nav');
        }
    }, [toggleDrawer]);

    return {
        handleOpenNavigation
    };
};
