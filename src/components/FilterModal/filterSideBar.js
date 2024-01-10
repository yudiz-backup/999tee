import React, { useMemo, useState } from 'react';
import { array, arrayOf, shape, string } from 'prop-types';
import { useFilterModal } from '../../peregrine/lib/talons/FilterModal/useFilterModal';
import { FormattedMessage } from 'react-intl';
import { mergeClasses } from '../../classify';
import FilterBlock from './filterBlock';
import defaultClasses from './filterModal.css';
import FILTER_INTROSPECTION from '../../queries/introspection/filterIntrospectionQuery.graphql';
import CurrentFilters from './CurrentFilters';

/**
 * A view that displays applicable and applied filters.
 *
 * @param {Object} props.filters - filters to display
 */
const FilterModal = props => {
    const { filters, enablePriceSlider } = props;
    const [blockFilter, setBlockFilter] = useState(false)
    const talonProps = useFilterModal({
        filters,
        queries: { filterIntrospection: FILTER_INTROSPECTION },
        enablePriceSlider,
        setBlockFilter
    });
    const {
        filterApi,
        filterItems,
        filterNames,
        filterState,
        handleApply,
        isApplying
    } = talonProps;

    const classes = mergeClasses(defaultClasses, props.classes);

    const filtersList = useMemo(
        () =>
            Array.from(filterItems, ([group, items]) => {
                const blockState = filterState.get(group);
                const groupName = filterNames.get(group);
                // if(group !== 'category_id') {
                return (
                    <FilterBlock
                        key={group}
                        filterApi={filterApi}
                        filterState={blockState}
                        group={group}
                        items={items}
                        name={groupName}
                        applyFilters={handleApply}
                        enablePriceSlider={enablePriceSlider}
                        isApplying={isApplying}
                        blockFilter={blockFilter}
                        setBlockFilter={setBlockFilter}
                    />
                );
                // } else {
                //     return (<></>)
                // }
            }),
        [
            enablePriceSlider,
            filterApi,
            filterItems,
            filterNames,
            filterState,
            handleApply,
            isApplying,
            blockFilter,
            setBlockFilter
        ]
    );

    return (
        <div className={classes.filters_wrapper_inner}>
            {filters && filters.length > 0 && (
                <>
                    {' '}
                    <h2 className={classes.filters_heading}>
                        <FormattedMessage
                            id={'filterSidebar.filters_heading'}
                            defaultMessage={'Filters'}
                        />
                    </h2>
                    <CurrentFilters
                        filterApi={filterApi}
                        filterNames={filterNames}
                        filterState={filterState}
                        applyFilters={handleApply}
                        hasFilters={!!filterState.size}
                        resetFilters={handleReset}
                    />
                    <ul className={classes.blocks}>{filtersList}</ul>
                </>
            )}
        </div>
    );
};

FilterModal.propTypes = {
    classes: shape({
        action: string,
        blocks: string,
        body: string,
        header: string,
        headerTitle: string,
        root: string,
        root_open: string
    }),
    filters: arrayOf(
        shape({
            attribute_code: string,
            items: array
        })
    )
};

export default FilterModal;
