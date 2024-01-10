import React, { useState } from 'react';
import { bool, func, shape, string } from 'prop-types';
// import { ArrowRight as ArrowRightIcon } from 'react-feather';
import { FormattedMessage/* , useIntl  */ } from 'react-intl';
import { useAuthBar } from '../../peregrine/lib/talons/AuthBar/useAuthBar';
import { useDashboard } from '../../peregrine/lib/talons/MyAccount/useDashboard';
import { mergeClasses } from '../../classify';
// import Icon from '../Icon';
import defaultClasses from './authBar.css';
import navdefaultClasses from '../Navigation/navigation.css';
import { useAccountMenu } from '../../peregrine/lib/talons/Header/useAccountMenu';
import SIGN_OUT_MUTATION from '../../queries/signOut.graphql';
import AccountGreeting from '../MyAccount/accountGreeting.js'
import myclasses from '../MyAccount/myAccount.css'
const AuthBar = props => {
    // const { formatMessage } = useIntl();

    const {
        // handleShowMyAccount,
        handleSignIn,
        isDisabled,
        isUserSignedIn,
        // handleShowCreateAccount
    } = useAuthBar(props);
    const { name } = useDashboard();
    const [accountMenuIsOpen, setAccountMenuIsOpen] = useState(false);
    const { handleSignOut } = useAccountMenu({
        mutations: { signOut: SIGN_OUT_MUTATION },
        accountMenuIsOpen,
        setAccountMenuIsOpen
    });

    var shortName;
    if (name) {
        var nameArray = name.split(' ');
        shortName =
            nameArray[0].charAt(0).toUpperCase() +
            '' +
            (nameArray.length > 1 ? nameArray[1].charAt(0).toUpperCase() : '');
    }
    const classes = mergeClasses(defaultClasses, myclasses, props.classes);

    const buttonElement = isUserSignedIn ? (
        // Show My Account button.
        <div className={navdefaultClasses.mob_nav_cust_details}>
            <div className={navdefaultClasses.nav_cust_wrap}>
                {/* <span>{shortName}</span> */}
                <div className={classes.mobile_profile}>
                    <AccountGreeting />
                </div>
                {/* <button
                    onClick={handleSignOut}
                    className={navdefaultClasses.signout_btn}
                    aria-label="Signout"
                >
                    {' '}
                    <FormattedMessage
                        id={'authBar.signout_btn'}
                        defaultMessage="Sign out"
                    />
                </button> */}
            </div>
            {/* <div className={navdefaultClasses.nav_signin_wrap}>
                <button
                    className={classes.button}
                    disabled={isDisabled}
                    onClick={handleShowMyAccount}
                    aria-label="user account"
                >
                    <span className={classes.contents}>
                        <span>
                            {formatMessage(
                                {
                                    id: 'authBar.userAccount',
                                    defaultMessage: 'Hello, {name}!'
                                },
                                { name: name }
                            )}
                        </span>
                        <span className={classes.icon}>
                            <Icon src={ArrowRightIcon} />
                        </span>
                    </span>
                </button>
            </div> */}
        </div>
    ) : (
        // Sign In button.
        <div className={navdefaultClasses.mob_nav_cust_details}>
            <div className={navdefaultClasses.nav_signin_wrap}>
                <button
                    className={classes.button}
                    disabled={isDisabled}
                    aria-label="user account"
                >
                    <span className={classes.contents}>
                        <div>
                            <span
                                role="button"
                                className={navdefaultClasses.signin_text}
                                onClick={handleSignIn}
                                onKeyDown={handleSignIn}
                                tabIndex={0}
                                id="openSignin"
                            >
                                <FormattedMessage
                                    id={'authBar.signin_text'}
                                    defaultMessage={'Sign in / Register'}
                                />
                            </span>
                            {/* <span className={navdefaultClasses.divider} /> */}
                            {/* <span
                                role="button"
                                className={navdefaultClasses.signin_text}
                                onClick={handleShowCreateAccount}
                                onKeyDown={handleShowCreateAccount}
                                tabIndex={0}
                            >
                                <FormattedMessage
                                    id={'authBar.register_text'}
                                    defaultMessage={'Register'}
                                />
                            </span> */}
                        </div>
                        <div className={navdefaultClasses.arrow_right} onClick={handleSignIn}>
                            <img
                                className={navdefaultClasses.arrow_right_img}
                                src="/cenia-static/images/select.png"
                                alt="select"
                                width="14"
                                height="8"
                            />
                        </div>
                    </span>
                </button>
            </div>
        </div>
    );

    return <div className={classes.root}>{buttonElement}</div>;
};

export default AuthBar;

AuthBar.propTypes = {
    classes: shape({
        root: string,
        button: string,
        contents: string,
        icon: string,
        signIn: string
    }),
    disabled: bool,
    showMyAccount: func.isRequired,
    showSignIn: func.isRequired
};
