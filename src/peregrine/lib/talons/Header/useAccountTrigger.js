import { useCallback, /* useEffect, */ useState } from 'react';

import { useDropdown } from '@magento/peregrine/lib/hooks/useDropdown';
import { useHistory/* , useLocation  */ } from 'react-router-dom'
// import { useAccountMenu } from '@magento/peregrine/lib/talons/Header/useAccountMenu';
import { useUserContext } from '@magento/peregrine/lib/context/user';
// import SIGN_OUT_MUTATION from '../../../../queries/signOut.graphql';

/**
 * The useAccountTrigger talon complements the AccountTrigger component.
 *
 * @returns {Object}    talonProps
 * @returns {Boolean}   talonProps.accountMenuIsOpen - Whether the menu that this trigger toggles is open or not.
 * @returns {Function}  talonProps.setAccountMenuIsOpen  - Set the value of accoutMenuIsOpen.
 * @returns {Ref}       talonProps.accountMenuRef - A React ref to the menu that this trigger toggles.
 * @returns {Ref}       talonProps.accountMenuTriggerRef - A React ref to the trigger element itself.
 * @returns {Function}  talonProps.handleTriggerClick - A function for handling when the trigger is clicked.
 */
export const useAccountTrigger = () => {
    const [totalhight, setTotalhight] = useState(0)
    const history = useHistory()
    const [{ isSignedIn: isUserSignedIn }] = useUserContext();
    const {
        elementRef: accountMenuRef,
        expanded: accountMenuIsOpen,
        setExpanded: setAccountMenuIsOpen,
        triggerRef: accountMenuTriggerRef
    } = useDropdown();
    // const talonPro = useAccountMenu({
    //     mutations: { signOut: SIGN_OUT_MUTATION },
    //     // accountMenuIsOpen,
    //     setAccountMenuIsOpen
    // });
    // const {view}=talonPro

    const handleTriggerClick = useCallback(() => {
        let total = window.pageYOffset;
        setTotalhight(total)
        // Toggle the Account Menu.
        if (isUserSignedIn) {
            // setAccountMenuIsOpen(isOpen => !isOpen);
            setAccountMenuIsOpen(isOpen => !isOpen);
        } else {
            history.push('/login')
        }
        // setAccountMenuIsOpen(isOpen => !isOpen);

    }, [isUserSignedIn]);

    return {
        accountMenuIsOpen,
        accountMenuRef,
        accountMenuTriggerRef,
        setAccountMenuIsOpen,
        totalhight,
        handleTriggerClick
    };

};
