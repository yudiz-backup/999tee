import React from 'react';
import { bool, shape, string } from 'prop-types';
import { useAccountChip } from 'src/peregrine/lib/talons/AccountChip/useAccountChip';
import { mergeClasses } from '@magento/venia-ui/lib/classify';

import defaultClasses from './accountChip.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { useMobile } from '../../peregrine/lib/talons/Mobile/useMobile';

import { User as UserIcon } from 'react-feather';
import Icon from '@magento/venia-ui/lib/components/Icon';

const userIcon = <Icon src={UserIcon} size={20} />;

/**
 * The AccountChip component shows an icon next to some text.
 * Sometimes the text is static, sometimes it is dynamic based on the user's name,
 * and it can also be a loading icon to indicate that we're fetching the user's name.
 *
 * @param {Object} props
 * @param {Object} props.classes - CSS classes to override element styles.
 * @param {String} props.fallbackText - The text to display when the user is not signed in
 *  or when we're loading details but don't want to show a loading icon.
 * @param {Boolean} props.shouldIndicateLoading - Whether we should show a loading icon or
 *  not when the user is signed in but we don't have their details (name) yet.
 */
const AccountChip = props => {
    const { mobileView } = useMobile();

    const talonProps = useAccountChip();
    const { isUserSignedIn } = talonProps;

    const classes = mergeClasses(defaultClasses, props.classes);

    return (
        <div>
            <span className={classes.root}>
                {userIcon}
                {isUserSignedIn && !mobileView && (
                    <FontAwesomeIcon icon={faAngleDown} />
                )}
            </span>
        </div>
    );
};

export default AccountChip;

AccountChip.propTypes = {
    classes: shape({
        root: string,
        loader: string,
        text: string
    }),
    fallbackText: string,
    shouldIndicateLoading: bool
};

AccountChip.defaultProps = {
    fallbackText: 'Account',
    shouldIndicateLoading: false
};
