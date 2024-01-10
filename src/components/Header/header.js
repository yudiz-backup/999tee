import React, { useState, useEffect, Fragment, Suspense, useRef } from 'react';
import { shape, string } from 'prop-types';
import Logo from '../Logo';
import { Link, resourceUrl, Route } from 'src/drivers';
import { NavLink, useHistory } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import AccountTrigger from './accountTrigger';
import NavTrigger from './navTrigger';
import SearchTrigger from './searchTrigger';
// import DarkTheme from './darkMode';
import { useHeader } from 'src/peregrine/lib/talons/Header/useHeader';
import { mergeClasses } from '../../classify';
import defaultClasses from './header.css';
// import DarkMode from './darkMode';
import SCOPE_CONFIG_DATA from '../../queries/getScopeConfigData.graphql';
import {
    useFooterData,
    useHome,
    useScopeData
} from 'src/peregrine/lib/talons/Home/useHome';
import { Util } from '@magento/peregrine';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { useSlider } from '../../peregrine/lib/talons/Slider/useSlider';
import GET_SLIDER_DATA from '../../queries/getSliderDetails.graphql';
import { Heart as HeartIcon, Bell as BellIcon } from 'react-feather';
import Icon from '@magento/venia-ui/lib/components/Icon';
import GET_CMSBLOCK_QUERY from '../../queries/getCmsBlocks.graphql';
import GET_HOMEPAGECONFIG_DATA from '../../queries/getHomeConfig.graphql';
import RichContent from '@magento/venia-ui/lib/components/RichContent';
import Button from '../Button';
import { globalContext } from '../../peregrine/lib/context/global.js';
import { isMobileView } from '../../util/helperFunction';
import { useLazyQuery, useQuery } from '@apollo/client';
import { useCartContext } from '@magento/peregrine/lib/context/cart';
import notificationList from '../../queries/notificationModule/notificationList.graphql';
import readAllNotification from '../../queries/notificationModule/readAllNotification.graphql';
import NotificationModule from './notificationModule';
import IFrameModal from '../DesignTool';
// import { useAwaitQuery } from '@magento/peregrine/lib/hooks/useAwaitQuery';
// import GET_CUSTOMER_QUERY from '../../queries/getCustomer.graphql';
import SIGN_OUT_MUTATION from '../../queries/signOut.graphql';
import { useAccountMenu } from '../../peregrine/lib/talons/Header/useAccountMenu';
import onsale from '../../queries/onSale.graphql'
// import * as asyncActions from '@magento/peregrine/lib/store/actions/user/asyncActions';

const bellIcon = <Icon src={BellIcon} size={30} />;

const heartIcon = <Icon src={HeartIcon} size={18} />;
const SearchBar = React.lazy(() => import('../SearchBar'));
const MegaMenu = React.lazy(() => import('../MegaMenu'));
const CompareLink = React.lazy(() => import('../Compare/compareLink'));
const CartTrigger = React.lazy(() => import('./cartTrigger'));
// const VisitorId = React.lazy(() => import('../RecentProducts/visitorId.js'));
// const PushNotification = React.lazy(() => import('./pushNotification.js'));
// const StoreSwitcher = React.lazy(() => import('./storeSwitcher'));
// const CurrencySwitcher = React.lazy(() => import('./currencySwitcher'));

const Header = props => {
    const history = useHistory();
    const { scroll } = props
    useEffect(() => {
        const body = document.querySelector('body');
        const header = document.querySelector('header');
        if (header.classList.contains('header-open-1Mb')) {
            body.classList.add('scroll-hidden');
        } else {
            body.classList.remove('scroll-hidden');
        }
    });

    const { data: onSaleItem } = useQuery(onsale)

    const promotionBarWrapperRef = useRef();
    const [{ currentUser, isSignedIn }, userContextApi] = useUserContext();
    const [{ cartId }] = useCartContext();

    const [show, handleShow] = useState(false);
    const [showSearchBar, setShowSearchBar] = useState(false);
    const [accountMenuIsOpen, setAccountMenuIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [readMsgLength, setReadMsgLength] = useState();
    const { state, dispatch } = React.useContext(globalContext);
    const { wishlistCount = 0 } = state || {};
    const mobileView = isMobileView();
    const [
        notificationDataList,
        { data: notificationData, loading }
    ] = useLazyQuery(notificationList, {
        fetchPolicy: 'no-cache'
    });

    const [readAllnotificationDataList] = useLazyQuery(readAllNotification, {
        fetchPolicy: 'no-cache',
        onCompleted: () => {
            setReadMsgLength([]);
            notificationDataList()
        }
    });

    // const fetchUserDetails = useAwaitQuery(GET_CUSTOMER_QUERY);

    useEffect(() => {
        dispatch({
            type: 'USER_DETAILS',
            payload: currentUser
        });
        if (currentUser?.b2b_activasion_status && isSignedIn) {
            localStorage.setItem('userDetails', JSON.stringify(currentUser.b2b_activasion_status))
        }
        else if (!isSignedIn) {
            localStorage.removeItem('userDetails')
        }
    }, [currentUser, isSignedIn])

    useEffect(() => {
        notificationDataList()
    }, [notificationDataList])

    useEffect(() => {
        if (notificationData) {
            setInterval(() => {
                notificationDataList();
            }, 300000);
        }
    }, [notificationData]);

    useEffect(() => {
        if (notificationData) {
            const isRead = notificationData?.notificationList
                .sort()
                .reverse()
                .filter(isReaded => isReaded?.is_read === false)

            setReadMsgLength(isRead);
        }
    }, [notificationData]);

    useEffect(() => {
        window.addEventListener('scroll', () => {
            if (
                window.scrollY >
                (promotionBarWrapperRef &&
                    promotionBarWrapperRef.current &&
                    promotionBarWrapperRef.current.offsetHeight
                    ? promotionBarWrapperRef.current.offsetHeight
                    : 41)
            ) {
                handleShow(true);
            } else {
                handleShow(false);
            }
        });
    }, []);

    useEffect(() => {
        dispatch({
            type: 'UPDATE_HEADER_PROMOTION_BAR_VISIBLE',
            payload: !show
        });
    }, [show]);

    const { formatMessage } = useIntl();

    const scopeConfigData = useScopeData({
        query: SCOPE_CONFIG_DATA
    });

    const sliderData = useSlider({
        query: GET_SLIDER_DATA
    });

    const { scopeData } = scopeConfigData;
    const { BrowserPersistence } = Util;
    const storage = new BrowserPersistence();

    if (scopeData && scopeData.rtl == '1') {
        document.body.classList.add('rtl_view');
    }

    storage.setItem('slider_data', sliderData);

    if (!storage.getItem('scope_data') && scopeData) {
        storage.setItem('scope_data', scopeData);
    }
    const { handleSearchTriggerClick, searchOpen } = useHeader();

    const classes = mergeClasses(defaultClasses, props.classes);
    const rootClass = searchOpen ? classes.open : classes.closed;
    const searchBarFallback = (
        <div className={classes.searchFallback}>
            <div className={classes.input}>
                <div className={classes.loader} />
            </div>
        </div>
    );
    const searchBar = searchOpen ? (
        <Suspense fallback={searchBarFallback}>
            <Route>
                <SearchBar
                    isOpen={searchOpen}
                    handleSearchTriggerClick={handleSearchTriggerClick}
                />{' '}
            </Route>
        </Suspense>
    ) : null;

    const { HomeConfigData } = useHome({
        query: GET_HOMEPAGECONFIG_DATA
    });

    let contactUsIdentifier = 'promotion-bar';
    if (typeof HomeConfigData != 'undefined') {
        for (var i = 0; i < HomeConfigData.length; i++) {
            if (HomeConfigData[i]['name'] == 'promotion-bar')
                contactUsIdentifier = HomeConfigData[i]['value'];
        }
    }

    const promotionBar = useFooterData({
        footerQuery: GET_CMSBLOCK_QUERY,
        footerIdentifiers: contactUsIdentifier
    });

    const { footerData } = promotionBar;
    const [shown, setShown] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setShowSearchBar(searchOpen);
    }, [searchOpen]);

    useEffect(() => {
        function handleClick(e) {
            if (
                showSearchBar &&
                document.getElementById('mainWrapper') &&
                !document.getElementById('mainWrapper').contains(e.target)
            ) {
                setShowSearchBar(false);
                handleSearchTriggerClick();
            }
        }
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [showSearchBar]);

    useEffect(() => {
        function handleClick(e) {
            if (
                isOpen &&
                document.getElementById('notificationModal') &&
                !document.getElementById('notificationModal').contains(e.target)
            ) {
                setIsOpen(false);
            }
        }
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [isOpen]);

    useEffect(() => {
        async function fetchWishlistCount() {
            if (!isSignedIn) {
                const resultGuestWishlistData = localStorage.getItem(
                    'guest_wishlist'
                );
                const guestWishlistData = resultGuestWishlistData
                    ? JSON.parse(resultGuestWishlistData)
                    : [];
                dispatch({
                    type: 'WISHLIST_COUNT',
                    payload: guestWishlistData.length
                });
            } else if (isSignedIn && currentUser && currentUser.wishlist) {
                dispatch({
                    type: 'WISHLIST_COUNT',
                    payload: currentUser.wishlist.items_count || 0
                });
            } else if (isSignedIn && !(currentUser && currentUser.wishlist)) {
                try {
                    await userContextApi.getUserDetails({ fetchUserDetails });
                } catch (error) {
                    console.log('[Error] -> fetchWishlistCount()', error);
                }
            }
        }
        fetchWishlistCount();
    }, [isSignedIn, currentUser]);

    useEffect(() => {
        if (cartId && !isSignedIn) {
            // const cart_id = localStorage.getItem('cart_id')
            localStorage.setItem('cart_id', cartId);
        }
    }, [cartId]);

    const tokenData = JSON.parse(
        localStorage.getItem('M2_VENIA_BROWSER_PERSISTENCE__signin_token')
    );
    const token = tokenData && tokenData?.value;
    if (token) {
        localStorage.setItem('token', token.replace(/"/g, ''));
    }
    else {
        localStorage.removeItem("token")
    }

    const talonProps = useAccountMenu({
        mutations: { signOut: SIGN_OUT_MUTATION },
        accountMenuIsOpen,
        setAccountMenuIsOpen
    });

    const { handleSignOut } = talonProps


    // useEffect(() => {
    //     if (isSignedIn) {
    //         notificationDataList();

    //         // check if the user's token is not expired
    //         const storage = new BrowserPersistence();
    //         const item = storage.getRawItem('signin_token');

    //         if (item) {
    //             const { ttl, timeStored } = JSON.parse(item);
    //             const timeoutMultiplier = 990
    //             const timoutDur = ttl * timeoutMultiplier / 30
    //             const timoutInterval = setInterval(() => {

    //                 const now = Date.now();
    //                 // if the token's TTYL has expired, we need to sign out
    //                 if (ttl && now - timeStored > ttl * timeoutMultiplier) {
    //                     clearInterval(timoutInterval)
    //                     handleSignOut()
    //                 }
    //             }, timoutDur)
    //         }
    //     }
    // }, [isSignedIn]);

    const handleNotification = () => {
        setIsOpen(!isOpen);
        if (!isOpen && readMsgLength?.length !== 0) {
            // notificationDataList()
            readAllnotificationDataList();
        }
    };

    useEffect(() => {
        if (shown) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'visible';
        }

        async function handleClick(e) {
            if (
                shown &&
                document.getElementById('iFrameWrapper') &&
                !document.getElementById('iFrameWrapper').contains(e.target)
            ) {
                setShown(true);
            }
        }
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [shown]);

    const handleLogoClick = () => {
        scroll?.setPosition(0,0)
        dispatch({ type: 'MOBILE_NUMBER', payload: { mobilenumber: '' } });
    };

    return (
        <Fragment>
            <header className={rootClass}>
                <div>
                    <div
                        className={classes.top_header_wrap}
                        ref={promotionBarWrapperRef}
                    >
                        <div className={'container-fluid'}>
                            <div className={classes.switcher_offer_Wrap}>
                                <div className={classes.switchers_wrap}>
                                    {!mobileView && (
                                        <Suspense fallback={null}>
                                            {/* <StoreSwitcher />
                                        <CurrencySwitcher /> */}
                                        </Suspense>
                                    )}

                                    <Suspense fallback={null}>
                                        {/* <PushNotification />
                                    <VisitorId /> */}
                                    </Suspense>
                                </div>
                                <Suspense fallback={null}>
                                    <RichContent html={footerData} />
                                </Suspense>
                            </div>
                        </div>
                    </div>
                    <div
                        className={
                            `${show ? classes.header_active : classes.middle_header} ${classes.main_header}`
                        }
                        id="middle_header"
                    >
                        <div className={'row'}>
                            <div
                                className={
                                    'col-lg-7 col-md-7' +
                                    ' ' +
                                    classes.search_desktop
                                }
                            >
                                {!mobileView && (
                                    <Suspense fallback={null}>
                                        <MegaMenu />
                                        {/* {onSaleItem?.onsale?.data?.length != 0 && <div className={classes.header_item}>
                                            <NavLink to="/sale.html">
                                                <FormattedMessage
                                                    id={'header.sale'}
                                                    defaultMessage={'Sale'}
                                                />
                                            </NavLink>
                                        </div>} */}
                                    </Suspense>
                                )}
                            </div>
                            {/* {shown ? <IFrameModal src="https://designer-magento.brushyourideas.com/productdesigner/index/index/id/1525/template/MzQz"/> : null}
                        <button onClick={() => setShown(!shown)}>Cutsom Tool</button> */}
                            <div
                                className={classes.logo_wrap}
                                onClick={handleLogoClick}
                            >
                                <Link to={resourceUrl('/')}>
                                    <span aria-hidden="true">
                                        <FormattedMessage
                                            id={'header.logo'}
                                            defaultMessage={' logo'}
                                        />
                                    </span>
                                    <Logo classes={{ logo: classes.logo }} />
                                </Link>
                            </div>
                            <div className={'col-lg-5 col-md-5'}>
                                <div className={classes.secondaryActions}>
                                    {shown ? (
                                        isSignedIn ? (
                                            <IFrameModal
                                                src={`${process.env.MAGENTO_BACKEND_URL}/productdesigner/index/index/id/200/cart_id/${cartId}/token/${token.replace(/"/g, '')}`}
                                                setShown={setShown}
                                            />
                                        ) : (
                                            <IFrameModal
                                                src={`${process.env.MAGENTO_BACKEND_URL}/productdesigner/index/index/id/200/cart_id/${cartId}`}
                                                setShown={setShown}
                                            />
                                        )
                                    ) : null}
                                    <span className={classes.designTool_button}>
                                        <Button
                                            onClick={() => {
                                                // history.push('/design-tool')
                                                dispatch({
                                                    type: 'DESIGN_TOOL_NOTIFICATION',
                                                    payload: {designToolNotification : true}
                                                })
                                            }
                                                // setShown(!shown) 
                                            }
                                            priority="high"
                                            type="submit"
                                        >
                                            Design Tool
                                        </Button>
                                    </span>
                                    <span
                                        className={
                                            classes.language_switch_image +
                                            ' ' +
                                            classes.header_Actions_image
                                        }
                                        title="Country switcher"
                                    >
                                        <img
                                            src="/cenia-static/images/home.png"
                                            alt="location"
                                            title={formatMessage({
                                                id: 'logo.title'
                                            })}
                                            width="20"
                                            height="20"
                                        />
                                    </span>
                                    <div className={classes.search_mobile}>
                                        <Suspense fallback={null}>
                                            <CompareLink
                                                currentUser={currentUser}
                                                isSignedIn={isSignedIn}
                                            />
                                        </Suspense>
                                        <div
                                            className={
                                                classes.search_image +
                                                ' ' +
                                                classes.header_Actions_image
                                            }
                                            title="Search"
                                        >
                                            <SearchTrigger
                                                active={searchOpen}
                                                onClick={
                                                    handleSearchTriggerClick
                                                }
                                            />
                                        </div>
                                    </div>
                                    {isSignedIn && (
                                        <>
                                            <button type='button' onClick={() => { window.open("https://www.shiprocket.in/shipment-tracking/", '_blank') }}>
                                                <img
                                                    src="/cenia-static/images/sent.png"
                                                    width="18"
                                                    height="18"
                                                    alt="sent"
                                                />
                                            </button>

                                            <div
                                                className={
                                                    classes.notification_toggle
                                                }
                                            >
                                                <button
                                                    title=""
                                                    id="notificationModal"
                                                    type="button"
                                                    onClick={handleNotification}
                                                    className={
                                                        classes.popupbtn_img +
                                                        ' ' +
                                                        classes.notify_svg
                                                    }
                                                >
                                                    <small>
                                                        {readMsgLength &&
                                                            readMsgLength.length !== 0
                                                            ? readMsgLength.length
                                                            : ''}
                                                    </small>
                                                    {bellIcon}
                                                </button>
                                                <NotificationModule
                                                    isOpen={isOpen}
                                                    classes={classes}
                                                    notificationData={
                                                        notificationData
                                                    }
                                                    notificationDataList={
                                                        notificationDataList
                                                    }
                                                    loading={loading}
                                                    setIsOpen={setIsOpen}
                                                    readMsgLength={readMsgLength}
                                                />
                                            </div>
                                        </>
                                    )}
                                    <div
                                        className={
                                            classes.user_icon_image +
                                            ' ' +
                                            classes.header_Actions_image
                                        }
                                    >
                                        <AccountTrigger
                                            isLoggedIn={isLoggedIn}
                                            setIsLoggedIn={setIsLoggedIn}
                                        />
                                    </div>
                                    <Link
                                        title=""
                                        className={
                                            classes.wishlist_image +
                                            ' ' +
                                            classes.header_Actions_image
                                        }
                                        to={
                                            isSignedIn
                                                ? '/wishlist'
                                                : '/guest-wishlist'
                                        }
                                    >
                                        <span aria-hidden="true">
                                            <FormattedMessage
                                                id={'header.Wishlist'}
                                                defaultMessage={'Wishlist'}
                                            />
                                        </span>
                                        <span title="">
                                            {heartIcon}
                                            {wishlistCount ? (
                                                <span
                                                    className={
                                                        classes.wishlist_counter
                                                    }
                                                >
                                                    {wishlistCount || 0}
                                                </span>
                                            ) : (
                                                <></>
                                            )}
                                        </span>
                                    </Link>
                                    <div
                                        className={
                                            classes.cart_image +
                                            ' ' +
                                            classes.header_Actions_image
                                        }
                                    // title="Cart"
                                    >
                                        <Suspense fallback={null}>
                                            <CartTrigger />
                                        </Suspense>
                                    </div>
                                    {/* <div className={classes.dark_mode_theme}>
                                        <DarkTheme />
                                    </div> */}
                                    {!mobileView && (
                                        <div className={classes.primaryActions}>
                                            <NavTrigger />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {searchBar}
            </header>
        </Fragment >
    );
};

Header.propTypes = {
    classes: shape({
        closed: string,
        logo: string,
        open: string,
        primaryActions: string,
        secondaryActions: string,
        toolbar: string
    })
};

export default Header;
