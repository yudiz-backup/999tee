import React from 'react';
import { arrayOf, func, number, oneOfType, shape, string } from 'prop-types';

import { mergeClasses } from '@magento/venia-ui/lib/classify';
import mapProduct from '@magento/venia-ui/lib/util/mapProduct';
import SuggestedProduct from './suggestedProduct';
import defaultClasses from './suggestedProducts.css';

const SuggestedProducts = props => {
    const { limit, onNavigate, products, handleSearchTriggerClick } = props;

    const classes = mergeClasses(defaultClasses, props.classes);

    const items = products.slice(0, limit).map(product => (
        <div className={classes.searchItem}>
            <div key={product.id} className={classes.item}>
                <SuggestedProduct
                    {...mapProduct(product)}
                    onNavigate={onNavigate}
                    handleSearchTriggerClick={handleSearchTriggerClick}
                    id={product.id}
                />
            </div>
        </div>
    ));

    return items
};

export default SuggestedProducts;

SuggestedProducts.defaultProps = {
    limit: 4
};

SuggestedProducts.propTypes = {
    classes: shape({
        item: string,
        root: string
    }),
    limit: number.isRequired,
    onNavigate: func,
    products: arrayOf(
        shape({
            id: oneOfType([number, string]).isRequired
        })
    ).isRequired
};
