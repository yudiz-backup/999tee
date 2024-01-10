import React, { useMemo } from 'react';
import { shape, string } from 'prop-types';

import { mergeClasses } from '../../../classify';
import CurrentFilter from './currentFilter';
import defaultClasses from './currentFilters.css';

const CurrentFilters = props => {
    const { filterApi, filterState, hasFilters, resetFilters, onApply, filterNames } = props;
    const { removeItem } = filterApi;
    const classes = mergeClasses(defaultClasses, props.classes);

    // create elements and params at the same time for efficiency
    const filterElements = useMemo(() => {
        const elements = [];
        for (const [group, items] of filterState) {
            for (const item of items) {
                const { title, value } = item || {};
                const key = `${group}::${title}_${value}`;
                const label = filterNames ? filterNames.get(group) : '';
                
                elements.push(
                    <li key={key} className={classes.item}>
                        <CurrentFilter
                            group={group}
                            item={item}
                            removeItem={removeItem}
                            onApply={onApply}
                            label={label}
                        />
                    </li>
                );
            }
        }

        return elements;
    }, [onApply, classes.item, filterState, removeItem]);

    return (
        <div>
            {hasFilters && (
                <span
                    role="button"
                    className={classes.reset_button}
                    onClick={resetFilters}
                    onKeyDown={resetFilters}
                    tabIndex={0}
                >
                    Reset Filter
                </span>
            )}
            <ul className={classes.root}>{filterElements}</ul>
        </div>
    );
};

CurrentFilters.propTypes = {
    classes: shape({
        root: string,
        item: string,
        button: string,
        icon: string
    })
};

export default CurrentFilters;
