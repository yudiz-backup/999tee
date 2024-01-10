import React from 'react';
import { shape, string } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import defaultClasses from './myAccount.css';
import { Link } from 'src/drivers';
import AccountGreeting from './accountGreeting';
import { NavLink } from 'react-router-dom';
import getRewardPointIcon from '../../queries/rewardPoint/rewardPointIcon.graphql'
import rewardPointStoreConfig from '../../queries/rewardPoint/rewardPointStoreConfig.graphql'
import rmaStoreConfig from '../../queries/RMA/rmaStoreConfig.graphql'
import { useQuery } from '@apollo/client';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faUser } from '@fortawesome/free-solid-svg-icons';
import Icon from '@magento/venia-ui/lib/components/Icon';
import {
    // Home as HomeIcon,
    // Menu as ShoppingBag,
    User as UserIcon,
    Heart as HeartIcon
} from 'react-feather';
import LoadingIndicator from '../LoadingIndicator/indicator';
const Sidebar = props => {
    const { onClose } = props;

    const { data } = useQuery(getRewardPointIcon)
    const { data: rewardPointStoreConfigInfo, loading: rewardPointStoreConfigLoading } = useQuery(rewardPointStoreConfig, {
        fetchPolicy: "no-cache"
    })

    const { data: rmaStoreConfigInfo, loading: rmaStoreConfigLoading } = useQuery(rmaStoreConfig, {
        fetchPolicy: "no-cache"
    })

    const reawrdPointIcon = data && data.MpRewardIcon && data.MpRewardIcon.url

    let path = '';
    if (typeof props.activePath != 'undefined') {
        path = props.activePath;
    } else if (typeof props.history != 'undefined') {
        path = props.history.location.pathname;
    }


    return (
        <div className={defaultClasses.sideBar_wrapper}>
            <AccountGreeting />
            {(!rewardPointStoreConfigLoading || !rmaStoreConfigLoading) ?
                <ul className={defaultClasses.list}>
                    <li
                        className={
                            path == '/customer/account'
                                ? defaultClasses.item + ' ' + defaultClasses.active : defaultClasses.item}>
                        {' '}
                        <span className={defaultClasses.dashboard_links_images}>
                            <Icon src={UserIcon} size={20} />
                        </span>
                        <Link to="/customer/account" onClick={onClose}>
                            <FormattedMessage
                                id={'sidebar.MyAccount'}
                                defaultMessage={'My Account'}
                            />
                        </Link>
                    </li>
                    <li
                        className={
                            path == '/order/history'
                                ? defaultClasses.item + ' ' + defaultClasses.active
                                : defaultClasses.item
                        }
                    >
                        <span className={defaultClasses.dashboard_links_images}>
                            <img
                                src="/cenia-static/images/sent.png"
                                width="20"
                                height="20"
                                alt="sent"
                            />
                        </span>
                        <Link to="/order/history" onClick={onClose}>
                            <FormattedMessage
                                id={'sidebar.MyOrders'}
                                defaultMessage={'My Orders'}
                            />
                        </Link>
                    </li>
                    <li
                        className={
                            path == '/wishlist'
                                ? defaultClasses.item + ' ' + defaultClasses.active
                                : defaultClasses.item
                        }
                    >
                        {' '}
                        <span className={defaultClasses.dashboard_links_images}>
                            <Icon src={HeartIcon} size={20} />
                        </span>
                        <Link to="/wishlist" onClick={onClose}>
                            <FormattedMessage
                                id={'sidebar.MyWishlist'}
                                defaultMessage={'My Orders'}
                            />
                        </Link>
                    </li>
                    <li
                        className={
                            path == '/customer/address/'
                                ? defaultClasses.item + ' ' + defaultClasses.active
                                : defaultClasses.item
                        }
                    >
                        {' '}
                        <span className={defaultClasses.dashboard_links_images}>
                            <img
                                src="/cenia-static/images/home.png"
                                width="20"
                                height="20"
                                alt="home"
                            />
                        </span>
                        <Link to="/customer/address/" onClick={onClose}>
                            <FormattedMessage
                                id={'sidebar.AddressBook'}
                                defaultMessage={'Address Book'}
                            />
                        </Link>
                    </li>
                    <li
                        className={
                            path == '/accountinformation'
                                ? defaultClasses.item + ' ' + defaultClasses.active
                                : defaultClasses.item
                        }
                    >
                        {' '}
                        <span className={defaultClasses.dashboard_links_images}>
                            <img
                                src="/cenia-static/images/information.png"
                                width="20"
                                height="20"
                                alt="information"
                            />
                        </span>
                        <Link to="/customer/account/edit/" onClick={onClose}>
                            <FormattedMessage
                                id={'sidebar. AccountInformation'}
                                defaultMessage={'Account Information'}
                            />
                        </Link>
                    </li>
                    <li
                        className={
                            path == '/review/customer/'
                                ? defaultClasses.item + ' ' + defaultClasses.active
                                : defaultClasses.item
                        }
                    >
                        {' '}
                        <span className={defaultClasses.dashboard_links_images}>
                            <img
                                src="/cenia-static/images/like.png"
                                width="20"
                                height="20"
                                alt="like"
                            />
                        </span>
                        <Link to="/review/customer/" onClick={onClose}>
                            <FormattedMessage
                                id={'sidebar.Reviews'}
                                defaultMessage={'My Reviews & Ratings'}
                            />
                        </Link>
                    </li>
                    <li
                        className={
                            path == '/newsletter/manage/'
                                ? defaultClasses.item + ' ' + defaultClasses.active
                                : defaultClasses.item
                        }
                    >
                        <span className={defaultClasses.dashboard_links_images}>
                            <img
                                src="/cenia-static/images/email.png"
                                width="20"
                                height="20"
                                alt="email"
                            />
                        </span>
                        <Link to="/newsletter/manage/" onClick={onClose}>
                            <FormattedMessage
                                id={'sidebar.NewsletterSubscriptions'}
                                defaultMessage={'Newsletter Subscriptions'}
                            />
                        </Link>
                    </li>
                    {rewardPointStoreConfigInfo?.MpRewardStatus !== false &&
                        <li
                            className={
                                path == '/customer/rewards/'
                                    ? defaultClasses.item + ' ' + defaultClasses.active
                                    : defaultClasses.item
                            }
                        >
                            <span className={defaultClasses.dashboard_links_images}>
                                <img
                                    src={reawrdPointIcon}
                                    width="20"
                                    height="20"
                                    alt="RewardPoint"
                                />
                            </span>
                            <NavLink to="/customer/rewards/" onClick={onClose}>
                                <FormattedMessage
                                    id={'sidebar.RewardPoint'}
                                    defaultMessage={'Reward Point'}
                                />
                            </NavLink>
                        </li>}
                    {rmaStoreConfigInfo?.mpRMAStatus !== false &&
                        <li
                            className={
                                path == '/mprma/customer/'
                                    ? defaultClasses.item + ' ' + defaultClasses.active
                                    : defaultClasses.item
                            }
                        >
                            <span className={defaultClasses.dashboard_links_images}>
                                <img
                                    src={"/cenia-static/images/returnRefund.png"}
                                    width="20"
                                    height="20"
                                    alt="RMA"
                                />
                            </span>
                            <NavLink to="/mprma/customer/" onClick={onClose}>
                                <FormattedMessage
                                    id={'sidebar.RAM'}
                                    defaultMessage={'Return and Refund'}
                                />
                            </NavLink>
                        </li>}
                    <li
                        className={
                            path == '/jobboard/jobs'
                                ? defaultClasses.item + ' ' + defaultClasses.active
                                : defaultClasses.item
                        }
                    >
                        <span className={defaultClasses.dashboard_links_images}>
                            <img
                                src={"/cenia-static/images/jobApplication.png"}
                                width="20"
                                height="20"
                                alt="jobapplication"
                            />
                        </span>
                        <NavLink to="/jobboard/jobs" onClick={onClose}>
                            <FormattedMessage
                                id={'sidebar.jobapplication'}
                                defaultMessage={'Applied Jobs'}
                            />
                        </NavLink>
                    </li>
                    <li
                        className={
                            path == '/storecredit'
                                ? defaultClasses.item + ' ' + defaultClasses.active
                                : defaultClasses.item
                        }
                    >
                        <span className={defaultClasses.dashboard_links_images}>
                            <img
                                src={"/cenia-static/images/storeCredit.png"}
                                width="20"
                                height="20"
                                alt="Store Credit"
                            />
                        </span>
                        <NavLink to="/storecredit" onClick={onClose}>
                            <FormattedMessage
                                id={'sidebar.storeCredit'}
                                defaultMessage={'My Store Credit'}
                            />
                        </NavLink>
                    </li>
                    {/* <li
                    className={
                        path == '/mobilelogin/index/updatemobile/'
                            ? defaultClasses.item + ' ' + defaultClasses.active
                            : defaultClasses.item
                    }
                >
                    <span className={defaultClasses.dashboard_links_images+ ' ' + defaultClasses.phone_dark_icon}>
                        <img
                            src={"/cenia-static/images/updatemobile.png"}
                            width="20"
                            height="20"
                            alt="updateMobiel"
                        />
                    </span>
                    <NavLink to="/mobilelogin/index/updatemobile/" onClick={onClose}>
                        <FormattedMessage
                            id={'sidebar.updateMobile'}
                            defaultMessage={'Update Mobile Number'}
                        />
                    </NavLink>
                </li> */}
                </ul> :
                <LoadingIndicator/>}
        </div>
    );
};

export default Sidebar;

Sidebar.propTypes = {
    classes: shape({
        actions: string,
        root: string,
        subtitle: string,
        title: string,
        user: string
    })
};
