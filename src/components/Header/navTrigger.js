import React from 'react';
import { node, shape, string } from 'prop-types';
import { Menu as MenuIcon } from 'react-feather';
import { FormattedMessage, useIntl } from 'react-intl';

import Icon from '../Icon';
import { mergeClasses } from '../../classify';
import defaultClasses from './navTrigger.css';
import { useNavigationTrigger } from '../../peregrine/lib/talons/NavigationTrigger/useNavigationTrigger.js'
/**
 * A component that toggles the navigation menu.
 */
const NavigationTrigger = props => {
    const { formatMessage } = useIntl();
    const { handleOpenNavigation } = useNavigationTrigger();

    const classes = mergeClasses(defaultClasses, props.classes);
    return (
        <button
            className={classes.root}
            aria-label={formatMessage({
                id: 'navigationTrigger.ariaLabel',
                defaultMessage: 'Toggle navigation panel'
            })}
            onClick={handleOpenNavigation}
        >
            <span aria-hidden="true">
                <FormattedMessage
                    id={'navigationTrigger.navigation'}
                    defaultMessage={' navigation'}
                />
            </span>
            <Icon src={MenuIcon} />
        </button>
    );
};

NavigationTrigger.propTypes = {
    children: node,
    classes: shape({
        root: string
    })
};

export default NavigationTrigger;
