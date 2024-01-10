import React from 'react';
import { arrayOf, func, number, shape, string } from 'prop-types';

import { mergeClasses } from '@magento/venia-ui/lib/classify';
import SuggestedCategory from './suggestedCategory';
import defaultClasses from './suggestedCategories.css';

const SuggestedCategories = props => {
    const {
        categories,
        limit,
        onNavigate,
        value,
        handleSearchTriggerClick
    } = props;
    const classes = mergeClasses(defaultClasses, props.classes);

    const items = categories
        .slice(0, limit)
        .map(({ label, value: categoryId }) => (
            <li key={categoryId} className={classes.item}>
                <SuggestedCategory
                    categoryId={categoryId}
                    label={label}
                    onNavigate={onNavigate}
                    value={value}
                    handleSearchTriggerClick={handleSearchTriggerClick}
                />
            </li>
        ));

    return <ul className={classes.root}>{items}</ul>;
};

export default SuggestedCategories;

SuggestedCategories.defaultProps = {
    limit: 4
};

SuggestedCategories.propTypes = {
    categories: arrayOf(
        shape({
            label: string.isRequired,
            value: string.isRequired
        })
    ).isRequired,
    classes: shape({
        item: string,
        root: string
    }),
    limit: number.isRequired,
    onNavigate: func,
    value: string
};
