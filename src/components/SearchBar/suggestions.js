import React, { Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import { useSuggestions } from 'src/peregrine/lib/talons/SearchBar';

import { mergeClasses } from '@magento/venia-ui/lib/classify';
import SuggestedCategories from './suggestedCategories';
import SuggestedProducts from './suggestedProducts';
import defaultClasses from './suggestions.css';

const Suggestions = props => {
    const {
        displayResult,
        filters,
        products,
        searchValue,
        setVisible,
        visible,
        handleSearchTriggerClick,
        setTriggerSearch
    } = props;
    const { items } = products;

    const talonProps = useSuggestions({
        displayResult,
        filters,
        items,
        setVisible,
        visible
    });
    const { categories, onNavigate, shouldRender } = talonProps;

    // render null without data
    if (!shouldRender) {
        return null;
    }

    const classes = mergeClasses(defaultClasses, props.classes);

    return (
        <Fragment>
            <div className={classes.suggestions}>
                <div className={classes.searchItemsLeft}>

                    <SuggestedCategories
                        categories={categories}
                        onNavigate={onNavigate}
                        value={searchValue}
                        handleSearchTriggerClick={handleSearchTriggerClick} />

                </div>
                <div className={classes.searchShowItems}>
                    <h2 className={classes.heading}>
                        <span><FormattedMessage id={'Product Suggestions'} /></span>
                    </h2>
                    <div className={classes.searchItemsGrid}>
                        <SuggestedProducts
                            onNavigate={onNavigate}
                            products={items}
                            handleSearchTriggerClick={handleSearchTriggerClick}
                        />
                    </div>
                </div>
            </div>
            <div className={classes.view_more_box}>
                <button
                    className={classes.view_more_button}
                    onClick={() => setTriggerSearch(true)}
                >
                    View All Products 
                </button>
            </div>
        </Fragment>
    );
};

export default Suggestions;

Suggestions.propTypes = {
    classes: shape({
        heading: string
    }),
    products: shape({
        filters: arrayOf(
            shape({
                filter_items: arrayOf(shape({})),
                name: string.isRequired
            }).isRequired
        ),
        items: arrayOf(shape({}))
    }),
    searchValue: string,
    setVisible: func,
    visible: bool
};
