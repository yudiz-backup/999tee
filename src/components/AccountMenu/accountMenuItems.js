import React from 'react';
import { func, shape, string } from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { Link } from 'src/drivers';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import { useAccountMenuItems } from '@magento/peregrine/lib/talons/AccountMenu/useAccountMenuItems';
import { useDashboard } from '../../peregrine/lib/talons/MyAccount/useDashboard';
import defaultClasses from './accountMenuItems.css';
import { useUserContext } from '@magento/peregrine/lib/context/user';


const AccountMenuItems = props => {
    const { 
        onSignOut, 
        setDrawerClose,
        rewardPointStoreConfigInfo,
        rmaStoreConfigInfo 
    } = props;
    const { name } = useDashboard();
    const talonProps = useAccountMenuItems({ onSignOut });
    const { handleSignOut, menuItems } = talonProps;
    const [{ isSignedIn: isUserSignedIn }] = useUserContext();
    const classes = mergeClasses(defaultClasses, props.classes);

    const menu = menuItems.map(item => {
        return (
            <React.Fragment key={item.name + item.id}>
                {typeof isUserSignedIn != 'undefined' && isUserSignedIn && (
                    <Link
                        title=''
                        className={classes.link}
                        key={item.name}
                        to={item.url}
                    >
                        <FormattedMessage id={item.name} />
                    </Link>
                )}
                {typeof isUserSignedIn != 'undefined' && !isUserSignedIn && (
                    <button
                        className={classes.link}
                        key={item.name}
                        onClick={() => OpenSignIn()}
                    >
                        <FormattedMessage id={item.name} />
                    </button>
                )}

            </React.Fragment>
        );
    });

    return (
        <div
            className={classes.root}
            onClick={() => {
                if (setDrawerClose) {
                    setDrawerClose(true)
                }
            }}
        >
                    <span title='' className={classes.customer_mail}>{name}</span>
                    {menu}
                    {rewardPointStoreConfigInfo?.MpRewardStatus !== false &&
                        <Link
                            title=''
                            className={classes.link}
                            to='/customer/rewards/'>
                            Reward Point
                        </Link>
                    }
                    {rmaStoreConfigInfo?.mpRMAStatus !== false &&
                        <Link
                            title=''
                            className={classes.link}
                            to='/mprma/customer/'>
                            Return and Refund
                        </Link>
                    }
                    <Link title='' className={classes.link} to='/jobboard/jobs'>Applied Jobs</Link>
                    <Link title='' className={classes.link} to='/storecredit'>My Store Credit</Link>
                    {/* <Link className={classes.link} to='/mobilelogin/index/updatemobile/'>Update Mobile Number</Link> */}
                    <button title=''
                        className={classes.signOut}
                        onClick={handleSignOut}
                        type="button"
                        key={'signout'}
                    >
                        <FormattedMessage id={`SIGN OUT`} />
                    </button>
        </div>
    );
};

export default AccountMenuItems;

AccountMenuItems.propTypes = {
    classes: shape({
        link: string,
        signOut: string
    }),
    onSignOut: func
};
