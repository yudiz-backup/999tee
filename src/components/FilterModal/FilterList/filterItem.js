import React, { useCallback, useMemo } from 'react';
import { func, number, oneOfType, shape, string } from 'prop-types';
import setValidator from '@magento/peregrine/lib/validators/set';
import { useQuery } from '@apollo/client';
import coloroptions from '../../../queries/getColorOptions'

import FilterDefault from './filterDefault';

const FilterItem = props => {
    let { data } = useQuery(coloroptions);
    const { filterApi, filterState, group, item, onApply, filterColorIcon } = props;
    const { toggleItem, removeItem } = filterApi;
    const { title, value, count } = item;
    const isSelected = filterState && filterState.has(item);
    // const isSelected = filterState && !![...filterState].find(e => e.value === item.value)
    // create and memoize an item that matches the tile interface
    if (!data || !data.coloroptions) {
        data = { coloroptions: {} }
    }
    const tileItem = useMemo(
        () => ({
            count: count,
            label: title,
            value_index: value,
            group: group,
            data: data.coloroptions.data || []
        }),
        [title, value, count, group, data]
    );

    const handleClick = useCallback((e) => {
        toggleItem({ group, item });
        if (typeof onApply != 'undefined') {
            if (e.target.checked) {
                onApply();
            } else {
                removeItem({ group, item })
                onApply();
            }
        }
    }, [group, item, toggleItem, onApply, removeItem]);

    return (
        <FilterDefault
            isSelected={isSelected}
            item={tileItem}
            onClick={handleClick}
            title={title}
            value={value}
            filterColorIcon={filterColorIcon}
        />
    );
};

export default FilterItem;

FilterItem.propTypes = {
    filterApi: shape({
        toggleItem: func.isRequired
    }).isRequired,
    filterState: setValidator,
    group: string.isRequired,
    item: shape({
        title: string.isRequired,
        value: oneOfType([number, string]).isRequired
    }).isRequired
};
