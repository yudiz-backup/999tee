import React, { useEffect, useState } from 'react';
import { useScrollLock, useToasts } from '@magento/peregrine';
import { FormattedMessage } from 'react-intl';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './main.css';
import headerClasses from '../Header/header.css';
import { useNavigationTrigger } from '../../peregrine/lib/talons/NavigationTrigger/useNavigationTrigger.js';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { useHistory } from 'react-router-dom';
import { Home as HomeIcon, Menu as MenuIcon, User as UserIcon, Heart as HeartIcon } from 'react-feather';
import Icon from '@magento/venia-ui/lib/components/Icon';

const homeIcon = <Icon src={HomeIcon} size={18} />;
const userIcon = <Icon src={UserIcon} size={18} />;
const heartIcon = <Icon src={HeartIcon} size={18} />;
const menuIcon = <Icon src={MenuIcon} size={18} />;

const MobileLinks = props => {
    const [activeClass, setActiveClass] = useState('home');
    const [{ currentUser, isSignedIn }] = useUserContext();
    // const [scrollFlag, setScrollFlag] = useState(false);
    const [guestUserAddedWishlistProduct, setGuestUserAddedWishlistProduct] = useState();
    const [guestUserRemovedWishlistProduct, setGuestUserRemovedWishlistProduct] = useState();
    const [, { addToast }] = useToasts();
    useEffect(() => {
        if (!isSignedIn) {
            if (guestUserAddedWishlistProduct && guestUserAddedWishlistProduct.name) {
                addToast({
                    type: 'info',
                    message: `${guestUserAddedWishlistProduct.name} added to wishlist.`,
                    dismissable: true,
                    timeout: 5000
                });
                setGuestUserAddedWishlistProduct();
            } else if (guestUserRemovedWishlistProduct && guestUserRemovedWishlistProduct.name) {
                addToast({
                    type: 'info',
                    message: `${guestUserRemovedWishlistProduct.name} removed from wishlist.`,
                    dismissable: true,
                    timeout: 5000
                });
                setGuestUserRemovedWishlistProduct();
            }
        }
    }, [guestUserAddedWishlistProduct, guestUserRemovedWishlistProduct, isSignedIn])

    const guestWishListData = JSON.parse(localStorage.getItem('guest_wishlist'))

    // const handleClick = () => {
    //     if (!scrollFlag) setScrollFlag(true);
    // };
    // useEffect(() => {
    //     document.addEventListener('scroll', handleClick);
    //     return () => {
    //         document.removeEventListener('scroll', handleClick);
    //     };
    // });
    const { isMasked } = props;
    const classes = mergeClasses(defaultClasses, props.classes);
    // const [wishlistRender, setWishlistRender] = useState(false);
    // const [, { addToast }] = useToasts();
    // useEffect(() => {
    //     if (wishlistRender && !isSignedIn) {
    //         addToast({
    //             type: 'info',
    //             message: 'Please Register or Signin to create your wishlist.',
    //             dismissable: true,
    //             timeout: 5000
    //         });
    //     }
    //     setWishlistRender(false);
    // }, [addToast, isSignedIn, wishlistRender]);

    const history = useHistory();
    const { handleOpenNavigation } = useNavigationTrigger();

    const wishlistCount =
        currentUser.wishlist && currentUser.wishlist.items_count
            ? currentUser.wishlist.items_count
            : '';
    useScrollLock(isMasked);

    const handleProfile = () => {
        if (isSignedIn) {
            history.push('/customer/account');
            setActiveClass('profile');
        } else {
            // handleOpenNavigation("sign-in");
            history.push('login');

        }
    };
    const handleWishlist = () => {
        if (isSignedIn) {
            history.push('/wishlist'), setActiveClass('wishlist');
        } else {
            history.push('/guest-wishlist'),
                setActiveClass('wishlist')
            // handleOpenNavigation();
        }
    };
    const handleHome = () => {
        history.push('/');
    };
    return (
        <div className={defaultClasses.bottom_toolbar}>
            <div className={defaultClasses.bottom_tool_inner}>
                <button
                    onClick={() => {
                        handleHome(), setActiveClass('home');
                    }}
                    className={
                        defaultClasses.toolbar_items +
                        ' ' +
                        (activeClass == 'home' ? defaultClasses.active : '')
                    }
                >
                    <span
                        className={
                            defaultClasses.language_switch_image +
                            ' ' +
                            classes.header_Actions_image
                        }
                        title="Home"
                    >
                        {homeIcon}
                    </span>
                    <p className={defaultClasses.images_label}>
                        <FormattedMessage
                            id={'main.Home'}
                            defaultMessage={'Home'}
                        />
                    </p>
                </button>
                <button
                    onClick={handleOpenNavigation}
                    className={defaultClasses.toolbar_items}
                >
                    <span
                        className={
                            defaultClasses.language_switch_image +
                            ' ' +
                            classes.header_Actions_image
                        }
                        title="Country switcher"
                    >
                        {menuIcon}
                    </span>
                    <p className={defaultClasses.images_label}>
                        <FormattedMessage
                            id={'main.Menu'}
                            defaultMessage={'Menu'}
                        />
                    </p>
                </button>
                <button
                    onClick={() => {
                        // setWishlistRender(true);
                        handleWishlist();
                    }}
                    className={
                        defaultClasses.toolbar_items +
                        ' ' +
                        (activeClass == 'wishlist' ? defaultClasses.active : '')
                    }
                >
                    <span
                        className={
                            defaultClasses.wishlist_image +
                            ' ' +
                            classes.header_Actions_image
                        }
                        title=""
                    >
                        {heartIcon}
                        <span className={headerClasses.wishlist_counter}>
                            {isSignedIn ?
                                wishlistCount :
                                guestWishListData?.length !== 0 ?
                                    guestWishListData?.length :
                                    ''}
                        </span>
                    </span>
                    <p className={defaultClasses.images_label}>
                        <FormattedMessage
                            id={'main.Wishlist'}
                            defaultMessage={'Wishlist'}
                        />
                    </p>
                </button>
                <button
                    onClick={() => {
                        handleProfile();
                    }}
                    className={
                        defaultClasses.toolbar_items +
                        ' ' +
                        (activeClass == 'profile' ? defaultClasses.active : '')
                    }
                >
                    <span
                        className={
                            defaultClasses.user_icon_image +
                            ' ' +
                            classes.header_Actions_image
                        }
                        title=""
                    >
                        {/* <AccountTrigger /> */}
                        {userIcon}
                    </span>
                    <p className={defaultClasses.images_label}>
                        <FormattedMessage
                            id={'main.Profile'}
                            defaultMessage={'Profile'}
                        />
                    </p>
                </button>
            </div>
        </div>
    );
};

export default MobileLinks;
