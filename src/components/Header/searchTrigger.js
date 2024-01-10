import React from 'react';
import { shape, string } from 'prop-types';
import { useIntl } from 'react-intl';
import { mergeClasses } from '../../classify';
import defaultClasses from './searchTrigger.css';
import { useSearchTrigger } from '@magento/peregrine/lib/talons/Header/useSearchTrigger';
import { Search as SearchIcon } from 'react-feather';
import Icon from '@magento/venia-ui/lib/components/Icon';

const searchIcon = <Icon src={SearchIcon} size={20} />;

const SearchTrigger = props => {
    const { active, onClick } = props;
    const talonProps = useSearchTrigger({
        onClick
    });
    const { handleClick } = talonProps;
    const classes = mergeClasses(defaultClasses, props.classes);
    const searchClass = active ? classes.open : classes.root;
    const { formatMessage } = useIntl();

    return (
        <button title=''
            className={searchClass}
            aria-label={formatMessage({
                id: 'searchTrigger.ariaLabel',
                defaultMessage: 'Search'
            })}
            onClick={handleClick}
        >
            {searchIcon}
        </button>
    );
};

SearchTrigger.propTypes = {
    classes: shape({
        root: string,
        open: string
    })
};

export default SearchTrigger;
