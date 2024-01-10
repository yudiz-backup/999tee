import React from 'react';
import { FormattedMessage } from 'react-intl';
import { func, shape, string } from 'prop-types';
import { Link } from 'src/drivers';
import { useSuggestedCategory } from 'src/peregrine/lib/talons/SearchBar';

import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './suggestedCategory.css';

const SuggestedCategory = props => {
    const { categoryId, label, onNavigate, value } = props;
    const talonProps = useSuggestedCategory({
        categoryId,
        label,
        onNavigate,
        searchValue: value
    });
    const { destination, handleClick } = talonProps;
    const classes = mergeClasses(defaultClasses, props.classes);

    return (
        <Link
            className={classes.root}
            to={destination}
            onClick={v => {
                handleClick(v);
            }}
        >
            <button
                onClick={() => document.getElementById('close-button').click()}
            >
                <strong className={classes.value}>{value}</strong>
                <span className={classes.label}>
                    <FormattedMessage
                        id={' in {label}'}
                        values={{ label: label }}
                    />
                </span>
            </button>
        </Link>
    );
};

export default SuggestedCategory;

SuggestedCategory.propTypes = {
    categoryId: string,
    classes: shape({
        label: string,
        root: string,
        value: string
    }),
    label: string.isRequired,
    onNavigate: func,
    value: string.isRequired
};
