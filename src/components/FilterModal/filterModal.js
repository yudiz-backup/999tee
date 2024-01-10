import React, { useMemo } from 'react';
import { array, arrayOf, shape, string } from 'prop-types';
import { X as CloseIcon } from 'react-feather';
import { useFilterModal } from '../../peregrine/lib/talons/FilterModal/useFilterModal';
import { FormattedMessage } from 'react-intl';

import { mergeClasses } from '../../classify';
import Icon from '../Icon';
import LinkButton from '../LinkButton';
import { Portal } from '../Portal';
import FilterBlock from './filterBlock';
import FilterFooter from './filterFooter';
import defaultClasses from './filterModal.css';

import FILTER_INTROSPECTION from '../../queries/introspection/filterIntrospectionQuery.graphql';
import { FilterColorIcon } from '../FilterSidebar/filterSidebar';
import CurrentFilters from './CurrentFilters';

/**
 * A view that displays applicable and applied filters.
 *
 * @param {Object} props.filters - filters to display
 */
const FilterModal = props => {
    const { filters } = props;
    const talonProps = useFilterModal({
        filters,
        queries: { filterIntrospection: FILTER_INTROSPECTION }
    });
    const {
        filterApi,
        filterItems,
        filterNames,
        filterState,
        handleApply,
        handleClose,
        handleReset,
        isOpen,
        isApplying
    } = talonProps;

    const classes = mergeClasses(defaultClasses, props.classes);
    const modalClass = isOpen ? classes.root_open : classes.root;
    const filtersList = useMemo(
        () =>
            Array.from(filterItems, ([group, items], index) => {
                const blockState = filterState.get(group);
                const groupName = filterNames.get(group);
                // if (group !== 'category_id') {
                return (
                    <FilterBlock
                        key={index}
                        filterApi={filterApi}
                        filterState={blockState}
                        group={group}
                        items={items}
                        name={groupName}
                        filterColorIcon={
                            groupName === "Colour" && FilterColorIcon
                        }
                        isApplying={isApplying}
                        filter={filters}
                    />
                );
                // } 
                // else {
                //     return <></>;
                // }
            }),
        [filterApi, filterItems, filterNames, filterState]
    );

    const clearAll = filterState.size ? (
        <div className={classes.reset_btn_wrap}>
            <LinkButton type="button" onClick={handleReset}>
                <FormattedMessage
                    id={'filterModal.handleReset'}
                    defaultMessage={'Clear all'}
                />
            </LinkButton>
        </div>
    ) : null;
    
    return (
        <Portal>
            <aside className={modalClass}>
                <div className={classes.body}>
                    <div className={classes.header}>
                        <div className={classes.header_box}>
                            <h2 className={classes.headerTitle}>
                                <FormattedMessage
                                    id={'filterModal.headerTitle'}
                                    defaultMessage={'Filters'}
                                />
                            </h2>
                            <button onClick={handleClose}>
                                <Icon src={CloseIcon} />
                            </button>
                        </div>
                        <div className={classes.menu_root}>
                            {clearAll}
                            <CurrentFilters
                                filterApi={filterApi}
                                filterNames={filterNames}
                                filterState={filterState}
                                applyFilters={() => { }}
                                onApply={handleApply}
                            />
                        </div>

                    </div>
                    <ul className={classes.blocks}>{filtersList}</ul>
                </div>
                <FilterFooter
                    applyFilters={handleApply}
                    hasFilters={!!filterState.size}
                    isOpen={isOpen}
                />
            </aside>
        </Portal>
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
