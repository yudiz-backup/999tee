import React, { /* useEffect, */ useState } from 'react';
import { shape, string } from 'prop-types';

import { mergeClasses } from '@magento/venia-ui/lib/classify';
import { useAccountMenu } from '../../peregrine/lib/talons/Header/useAccountMenu';

import CreateAccount from '../CreateAccount';
import SignIn from '../SignIn/signIn';
import AccountMenuItems from './accountMenuItems';
import ForgotPassword from '../ForgotPassword';

import SIGN_OUT_MUTATION from '../../queries/signOut.graphql';

import defaultClasses from './accountMenu.css';
// import productDefaultClasses from '../ProductFullDetail/productFullDetail.css';
// import { Modal } from '../Modal';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { useCedContext } from 'src/peregrine/lib/context/ced';
import GET_CMSBLOCK_QUERY from '../../queries/getCmsBlocks.graphql';
import GET_HOMEPAGECONFIG_DATA from '../../queries/getHomeConfig.graphql';
import { useFooterData, useHome } from '../../peregrine/lib/talons/Home/useHome';
import RichContent from '../RichContent/richContent';
import { useQuery } from '@apollo/client';
import B2BConfigStore from '../../queries/registerWIthB2B/b2bConfigStore.graphql'
import LoadingIndicator from '../LoadingIndicator/indicator';
import rewardPointStoreConfig from '../../queries/rewardPoint/rewardPointStoreConfig.graphql'
import rmaStoreConfig from '../../queries/RMA/rmaStoreConfig.graphql';
//import signup from './image/signup.jpg'

const AccountMenu = React.forwardRef((props, ref) => {
    const [{ isSignedIn }] = useUserContext();
    const {
        accountMenuIsOpen,
        setAccountMenuIsOpen,
        handleTriggerClick,
        // faHeart
    } = props;
    const talonProps = useAccountMenu({
        mutations: { signOut: SIGN_OUT_MUTATION },
        accountMenuIsOpen,
        setAccountMenuIsOpen
    });

    const { data: b2bConfigStoreInfo, loading: b2bConfigStoreLoading } = useQuery(B2BConfigStore, {
        fetchPolicy: "no-cache",
        onCompleted: () => {
            if (b2bConfigStoreInfo?.bssB2bRegistrationStoreConfig?.display_minimum_qty) {
                localStorage.setItem("b2b-min-quantity", b2bConfigStoreInfo?.bssB2bRegistrationStoreConfig?.display_minimum_qty)
            }
        }
    })

    const { data: rewardPointStoreConfigInfo} = useQuery(rewardPointStoreConfig, {
        fetchPolicy: "no-cache"
    })
    const { data: rmaStoreConfigInfo } = useQuery(rmaStoreConfig, {
        fetchPolicy: "no-cache"
    })

    const {
        view,
        // setView,
        username,
        handleAccountCreation,
        handleSignOut,
        handleForgotPassword,
        handleCancel,
        handleCreateAccount,
        updateUsername
    } = talonProps;

    const classes = mergeClasses(defaultClasses, props.classes);
    // const rootClass = accountMenuIsOpen ? classes.root_open : classes.root;

    const homepageData = useHome({
        query: GET_HOMEPAGECONFIG_DATA
    });

    const { HomeConfigData } = homepageData;
    let siginPageIdentifier = 'login-page-image';
    if (typeof HomeConfigData != 'undefined') {
        for (var i = 0; i < HomeConfigData.length; i++) {
            if (HomeConfigData[i]['name'] == 'login-page-image')
            siginPageIdentifier = HomeConfigData[i]['value'];
        }
    }

    const signinPageBanner = useFooterData({
        footerQuery: GET_CMSBLOCK_QUERY,
        footerIdentifiers: siginPageIdentifier
    });

    const { footerData : banner } = signinPageBanner

    let dropdownContents = null;
    const [overlayAdded, setOverlayAdded] = useState(false);
    const [signUpSuccessMessage, setSignUpSuccessMessage] = useState('');
    const [{ overlay: backgroundOverlay }] = useCedContext();
    const [, { setOverlay }] = useCedContext();

    if (!backgroundOverlay && accountMenuIsOpen && !isSignedIn) {
        setOverlay(true);
        if (!overlayAdded) {
            setOverlayAdded(true);
        }
    }
    if (
        (backgroundOverlay &&
            !accountMenuIsOpen &&
            overlayAdded &&
            !isSignedIn) ||
        (backgroundOverlay && isSignedIn)
    ) {
        setOverlay(false);
        if (overlayAdded) {
            setOverlayAdded(false);
        }
    }

    switch (view) {
        case 'ACCOUNT': {
            dropdownContents = <AccountMenuItems 
            onSignOut={handleSignOut} 
            rewardPointStoreConfigInfo={rewardPointStoreConfigInfo} 
            rmaStoreConfigInfo={rmaStoreConfigInfo}
            />;

            break;
        }
        case 'FORGOT_PASSWORD': {
            dropdownContents = (
                <ForgotPassword
                    handleTriggerClick={handleTriggerClick}
                    initialValues={{ email: username }}
                    onCancel={handleCancel}
                />
            );

            break;
        }
        case 'CREATE_ACCOUNT': {
            dropdownContents = (
                <CreateAccount
                    classes={{ root: classes.createAccount }}
                    initialValues={{ email: username }}
                    isCancelButtonHidden={false}
                    onSubmit={handleAccountCreation}
                    onCancel={handleCancel}
                    handleTriggerClick={handleTriggerClick}
                    setSignUpSuccessMessage={setSignUpSuccessMessage}
                />
            );

            break;
        }
        case 'SIGNIN':
        default: {
            dropdownContents = (
                <SignIn
                    classes={{
                        modal_active: classes.loading
                    }}
                    setDefaultUsername={updateUsername}
                    showCreateAccount={handleCreateAccount}
                    showForgotPassword={handleForgotPassword}
                    handleTriggerClick={handleTriggerClick}
                    accountMenuIsOpen={accountMenuIsOpen}
                    signUpSuccessMessage={signUpSuccessMessage}
                    setSignUpSuccessMessage={setSignUpSuccessMessage}
                    onCancel={handleCancel}
                    b2bConfigStoreInfo={b2bConfigStoreInfo}
                    b2bConfigStoreLoading={b2bConfigStoreLoading}
                />
            );

            break;
        }
    }

    return (
        <>
            {(view == 'SIGNIN' ||
                view == 'FORGOT_PASSWORD' ||
                view == 'CREATE_ACCOUNT') && (
                    <div className='container-fluid p-0'>
                        {!b2bConfigStoreLoading ?<div className={`row m-0 ${classes.min_h_100}`}>
                            <div className='col-md-6 p-0'>
                                <div className={classes.login_img}>
                                  <RichContent html={ banner } />
                                </div>
                            </div>
                            <div className='col-md-6'>
                                {dropdownContents}
                            </div>
                        </div> : <LoadingIndicator/>}
                    </div>
                )}
            {view == 'ACCOUNT' && (
                    <div className={classes.signedin_menu} ref={ref}>
                        <div className={classes.account_modal}>
                            {accountMenuIsOpen ? dropdownContents : null}
                        </div>
                    </div>
            )}
        </>
    );
});

export default AccountMenu;

AccountMenu.propTypes = {
    classes: shape({
        root: string,
        root_open: string,
        link: string
    })
};
