import React, { Fragment, Suspense/* , useEffect */ } from 'react';
import { useIntl } from 'react-intl';
import { /* func, */ shape, string } from 'prop-types';
import { useAccountTrigger } from 'src/peregrine/lib/talons/Header/useAccountTrigger.js';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import AccountChip from '../AccountChip';
import defaultClasses from './accountTrigger.css';
// import { useAccountMenu } from '../../peregrine/lib/talons/Header/useAccountMenu';
// import SIGN_OUT_MUTATION from '../../queries/signOut.graphql';
const AccountMenu = React.lazy(() => import('../AccountMenu'));
import { useUserContext } from '@magento/peregrine/lib/context/user';

/**
 * The AccountTrigger component is the call to action in the site header
 * that toggles the AccountMenu dropdown.
 *
 * @param {Object} props
 * @param {Object} props.classes - CSS classes to override element styles.
 */
const AccountTrigger = props => {
    const talonProps = useAccountTrigger();
    const [{ isSignedIn: isUserSignedIn }] = useUserContext();

    const {
        accountMenuIsOpen,
        accountMenuRef,
        accountMenuTriggerRef,
        setAccountMenuIsOpen,
        handleTriggerClick,
        // totalhight
    } = talonProps;
    const classes = mergeClasses(defaultClasses, props.classes);

    const rootClassName = accountMenuIsOpen ? classes.root_open : classes.root;
    const { formatMessage } = useIntl();
    if (accountMenuIsOpen) {
        document
            .getElementsByTagName('html')[0]
            .setAttribute('data-scroll-lock', 'false');
    } else {
        document
            .getElementsByTagName('html')[0]
            .setAttribute('data-scroll-lock', 'false');
    }

    // let finalscroll = totalhight;

    // window.addEventListener('scroll', function(){

    //   let scroll = Math.abs(finalscroll - window.pageYOffset);
    //   if ( scroll >= 100 ) {
    //       setAccountMenuIsOpen(false)
    //       console.log( 'diff' , scroll)
    //       console.log("hello world")
    //       }
    // })

    window.addEventListener('scroll', function () {
        window.addEventListener('scroll', function () {
            if (window.scrollY >= 100) {
                setAccountMenuIsOpen(false)
            }
        })
    })

    return (
        <Fragment>
            <div className={rootClassName} ref={accountMenuTriggerRef}>
                <button
                    id="user_account"
                    aria-label={formatMessage({
                        id: 'accountTrigger.ariaLabel',
                        defaultMessage: 'Toggle My Account Menu'
                    })}
                    className={classes.trigger}
                    onClick={handleTriggerClick}
                // onClick={() => {
                //   history.push('/login')
                // }}
                >
                    <AccountChip
                        fallbackText={formatMessage({
                            id: 'accountTrigger.buttonFallback',
                            defaultMessage: 'Sign In'
                        })}
                        shouldIndicateLoading={true}
                    />
                </button>
            </div>
            {
                isUserSignedIn && <Suspense fallback={null}>
                    <AccountMenu
                        ref={accountMenuRef}
                        accountMenuIsOpen={accountMenuIsOpen}
                        setAccountMenuIsOpen={setAccountMenuIsOpen}
                        handleTriggerClick={handleTriggerClick}
                    />
                </Suspense>

            }

        </Fragment>
    );
};

export default AccountTrigger;

AccountTrigger.propTypes = {
    classes: shape({
        root: string,
        root_open: string,
        trigger: string
    })
};
