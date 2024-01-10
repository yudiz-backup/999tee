import React, { /* useState, */ Suspense } from 'react'

// components
// import SignIn from '../SignIn/signIn'
import AccountMenu from '../AccountMenu'
// import { useAccountMenu } from '../../peregrine/lib/talons/Header/useAccountMenu';
import { useAccountTrigger } from 'src/peregrine/lib/talons/Header/useAccountTrigger.js';
// import { mergeClasses } from '@magento/venia-ui/lib/classify';
// import defaultClasses from '../AccountMenu/accountMenu.css';
// import productDefaultClasses from '../ProductFullDetail/productFullDetail.css';
export default function index(/* props */) {
  // const [signUpSuccessMessage, setSignUpSuccessMessage] = useState('');
  const talonProps = useAccountTrigger();
  const {
    accountMenuIsOpen,
    accountMenuRef,
    // accountMenuTriggerRef,
    setAccountMenuIsOpen,
    handleTriggerClick
  } = talonProps;
  // const classes = mergeClasses(defaultClasses, props.classes);/
  // const rootClass = accountMenuIsOpen ? classes.root_open : classes.root;
  return (
    <>

      <Suspense fallback={null}>
        <AccountMenu
          ref={accountMenuRef}
          accountMenuIsOpen={accountMenuIsOpen}
          setAccountMenuIsOpen={setAccountMenuIsOpen}
          handleTriggerClick={handleTriggerClick}

        />
      </Suspense>

    </>
  )
}
