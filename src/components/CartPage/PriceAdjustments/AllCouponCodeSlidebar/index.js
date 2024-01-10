import { useCallback } from 'react';
import { useDropdown } from '@magento/peregrine/lib/hooks/useDropdown';

export const useAllCouponCodeSlidebarTrigger = () => {
    const {
        elementRef: allCouponCodeSlidebarRef,
        expanded: isOpenAllCouponCodeSlidebar,
        setExpanded: setIsOpenAllCouponCodeSlidebar
    } = useDropdown();

    const handleTriggerClick = useCallback(() => {
        // Open the mini cart.
        setIsOpenAllCouponCodeSlidebar(true);
    }, [setIsOpenAllCouponCodeSlidebar]);

    return {
        handleTriggerClick,
        isOpenAllCouponCodeSlidebar,
        allCouponCodeSlidebarRef,
        setIsOpenAllCouponCodeSlidebar
    };
};
