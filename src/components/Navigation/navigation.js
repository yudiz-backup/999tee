import React, { Suspense, useEffect, useState } from 'react';
import { shape, string } from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { mergeClasses } from '../../classify';
import AuthBar from '../AuthBar';
import CategoryTree from '../CategoryTree';
import LoadingIndicator from '../LoadingIndicator';
import CurrencySwitcher from '../Header/currencySwitcher';
import StoreSwitcher from '../Header/storeSwitcher';
import NavHeader from './navHeader';
import defaultClasses from './navigation.css';
import GET_CUSTOMER_QUERY from '../../queries/getCustomer.graphql';
// import AccountMenuItems from '../AccountMenu/accountMenuItems';
import { useAccountMenu } from '../../peregrine/lib/talons/Header/useAccountMenu';
import SIGN_OUT_MUTATION from '../../queries/signOut.graphql';
import GET_CMSBLOCK_QUERY from '../../queries/getCmsBlocks.graphql';
import GET_HOMEPAGECONFIG_DATA from '../../queries/getHomeConfig.graphql';
import RichContent from '../../components/RichContent';
import {
    useFooterData,
    useHome
} from '../../peregrine/lib/talons/Home/useHome';
import NewsLetter from '../NewsLetter';
import { useQuery } from '@apollo/client';
import storeConfig from '../../queries/addFooterImgCard.graphql'
import AccountMenuItems from '../AccountMenu/accountMenuItems';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { Accordion, Section } from '../Accordion';
import { useNavigation } from '../../peregrine/lib/talons/Navigation/useNavigation';

const AuthModal = React.lazy(() => import('../AuthModal'));

const Navigation = props => {
    const {
        catalogActions,
        categories,
        categoryId,
        handleBack,
        handleClose,
        hasModal,
        isOpen,
        isTopLevel,
        setCategoryId,
        showCreateAccount,
        showForgotPassword,
        showMainMenu,
        showMyAccount,
        showSignIn,
        view,
        drawer
    } = useNavigation({ customerQuery: GET_CUSTOMER_QUERY });

    const talonProps = useAccountMenu({
        mutations: { signOut: SIGN_OUT_MUTATION },
        accountMenuIsOpen: isOpen,
        setAccountMenuIsOpen: (drawer === 'sign-in' || drawer === null) ? showSignIn : showMainMenu,
        drawer
    });

    const [drawerClose, setDrawerClose] = useState(false)
    const { formatMessage } = useIntl();

    const [{ isSignedIn }] = useUserContext();
    const { handleSignOut } = talonProps;
    const classes = mergeClasses(defaultClasses, props.classes);
    const rootClassName = isOpen ? classes.root_open : classes.root;
    const modalClassName = hasModal ? classes.modal_open : classes.modal;
    const bodyClassName = hasModal ? classes.body_masked : classes.body;
    const body = document.querySelector('html')

    useEffect(() => {
        if (isOpen) {
            body.classList.add('scroll-hidden-cart')
        } else {
            body.classList.remove('scroll-hidden-cart')
        }
    }, [isOpen])

    const homepageData = useHome({
        query: GET_HOMEPAGECONFIG_DATA
    });

    const { HomeConfigData } = homepageData;
    let footerIdentifier = 'mobile-footer';
    if (typeof HomeConfigData != 'undefined') {
        for (var i = 0; i < HomeConfigData.length; i++) {
            if (HomeConfigData[i]['name'] == 'mobile-footer')
                footerIdentifier = HomeConfigData[i]['value'];
        }
    }

    const footerDatas = useFooterData({
        footerQuery: GET_CMSBLOCK_QUERY,
        footerIdentifiers: footerIdentifier
    });
    const { footerData } = footerDatas;
    const { data } = useQuery(storeConfig)

    // Lazy load the auth modal because it may not be needed.
    const authModal = hasModal ? (
        <Suspense fallback={<LoadingIndicator />}>
            <AuthModal
                closeDrawer={handleClose}
                showCreateAccount={showCreateAccount}
                showForgotPassword={showForgotPassword}
                showMainMenu={showMainMenu}
                showMyAccount={showMyAccount}
                showSignIn={showSignIn}
                view={view}
            />
        </Suspense>
    ) : null;

    const { isMobile } = props;

    useEffect(() => {
        if (drawerClose) {
            handleClose()
            setDrawerClose(false)
        }
    }, [drawerClose])

    if (!isMobile) {
        return (
            <aside className={rootClassName}>
                <CategoryTree
                    categoryId={categoryId}
                    categories={categories}
                    onNavigate={handleClose}
                    setCategoryId={setCategoryId}
                    updateCategories={catalogActions.updateCategories}
                />
            </aside>
        );
    }
    return (
        <aside className={rootClassName}>
            <header className={classes.header}>
                <NavHeader
                    isTopLevel={isTopLevel}
                    onBack={handleBack}
                    view={view}
                />
            </header>
            <div className={bodyClassName}>
                <AuthBar
                    disabled={hasModal}
                    showMyAccount={showMyAccount}
                    showCreateAccount={showCreateAccount}
                    showSignIn={showSignIn}
                    handleClose={handleClose}
                />
                <div className={defaultClasses.switchers}>
                    <StoreSwitcher />
                    <CurrencySwitcher />
                </div>
                <CategoryTree
                    categoryId={categoryId}
                    categories={categories}
                    onNavigate={handleClose}
                    setCategoryId={setCategoryId}
                    updateCategories={catalogActions.updateCategories}
                />
                {isSignedIn &&
                    <Accordion drawerClose={drawerClose}>
                        <div className={defaultClasses.accountDetailsMenu}>
                            <Section
                                id="spend_your_points"
                                title={formatMessage(
                                    {
                                        id:
                                            'checkoutPage.accountDeatils',
                                        defaultMessage:
                                            'Account Section'
                                    }
                                )}
                            >
                                <AccountMenuItems onSignOut={handleSignOut} setDrawerClose={setDrawerClose} />
                            </Section>
                        </div>
                    </Accordion>
                }
                <RichContent html={footerData} />
                <div className={defaultClasses.mobile_newsletter}>
                    <NewsLetter />
                    <div className={'col-lg-12'}>
                        <div className={classes.copyright}>
                            <ul className={classes.payment_icons + ' ' + 'mt-4'}>
                                <RichContent html={data && data.storeConfig && data.storeConfig.absolute_footer} />
                            </ul>
                            <p className='mt-3'>© 2023 999Tee All Rights Reserved</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={classes.footer}>
                <FormattedMessage
                    id={'navigation.footer'}
                    defaultMessage={'no footer will exist'}
                />
                {/* <AuthBar disabled={hasModal} showMyAccount={showMyAccount} showSignIn={showSignIn} /> */}
            </div>
            <div className={modalClassName}>{authModal}</div>
        </aside>
    );
};

export default Navigation;

Navigation.propTypes = {
    classes: shape({
        body: string,
        form_closed: string,
        form_open: string,
        footer: string,
        header: string,
        root: string,
        root_open: string,
        signIn_closed: string,
        signIn_open: string
    })
};
