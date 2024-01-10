import React, { Fragment, useMemo } from 'react';
import { array, shape, string } from 'prop-types';
import { useFieldState } from 'informed';
import setValidator from '@magento/peregrine/lib/validators/set';

import { mergeClasses } from '../../../classify';
import FilterItem from './filterItem';
import defaultClasses from './filterList.css';

const labels = new WeakMap();

const FilterList = props => {
    const { filterApi, filterState, group, items, filterColorIcon, onApply } = props;
    const classes = mergeClasses(defaultClasses, props.classes);

    const { value: searchValue } = useFieldState('filter_search');
    const normalizedSearch = (searchValue || '').toUpperCase();
    // memoize item creation
    // search value is not referenced, so this array is stable
    const itemElements = useMemo(
        () => {
            let convertedFilterState = [];
            if (filterState) {
                convertedFilterState = Array.from(filterState)
            }

            return items.map(item => {
                const { title, value } = item;
                const key = `item-${group}-${value}`;
                const colorDataItem = convertedFilterState.find(i => {
                    return i.value.toString() === value.toString()
                })
                // create an element for each item
                const element = (
                    <li
                        key={key}
                        className={((colorDataItem) && (colorDataItem.value === value || group === "printful_size" ? classes.seletedItem : classes.item))}
                    // className={value === colorDataItem ? classes.seletedItem : classes.item }    
                    >
                        <FilterItem
                            onApply={onApply}
                            filterApi={filterApi}
                            filterState={filterState}
                            group={group}
                            item={item}
                            filterColorIcon={filterColorIcon}
                        />
                    </li>
                );

                // associate each element with its normalized title
                // titles are not unique, so use the element as the key
                labels.set(element, title.toUpperCase() || '');

                return element;
            })
        },
        [onApply, filterApi, filterState, group, items, filterColorIcon, classes]
    );

    // filter item elements after creating them
    // this runs after each keystroke, but it's quick
    const filteredItemElements = normalizedSearch
        ? itemElements.filter(element =>
            labels.get(element).includes(normalizedSearch)
        )
        : itemElements;

    return (
        <Fragment>
            <ul className={group === 'color' ? `${classes.items} color` : classes.items}>{filteredItemElements}</ul>
            
        </Fragment>
    );
};

FilterList.propTypes = {
    classes: shape({
        item: string,
        items: string
    }),
    filterApi: shape({}),
    filterState: setValidator,
    group: string,
    items: array
};

export default FilterList;
