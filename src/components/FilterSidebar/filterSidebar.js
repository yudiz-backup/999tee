import React, { useMemo, useCallback, useRef, useState } from 'react'; // useEffect, useState,
import { FormattedMessage } from 'react-intl';
import { array, arrayOf, shape, string, number } from 'prop-types';
// import { useFilterSidebar } from '@magento/peregrine/lib/talons/FilterSidebar';
import { useFilterSidebar } from '../../peregrine/lib/talons/FilterSidebar/useFilterSidebar';

import { useStyle } from '../../classify';
import LinkButton from '../LinkButton';
import FilterBlock from '../FilterModal/filterBlock';
import defaultClasses from './filterSidebar.css';
import CurrentFilters from '../FilterModal/CurrentFilters';

const SCROLL_OFFSET = 150;


export function FilterColorIcon(props) {
    const classes = useStyle(defaultClasses, props.classes);
    const { color, checked, ...rest } = props
    return <span className={"rounded-circle d-inline-block" + ' ' + classes.filterColor} style={{ width: '35px', height: '35px', backgroundColor: color, borderWidth: checked ? 0 : "2px" }} {...rest}></span>
}
//  function UnCheckedColor(props) {
//     const {color, ...rest} = props
//     return <span className='rounded-circle' style={{width: '20px', height: '20px', backgroundColor: color}} {...rest}></span>
// } 

/**
 * A view that displays applicable and applied filters.
 *
 * @param {Object} props.filters - filters to display
 */
const FilterSidebar = props => {
    const { filters, filterCountToOpen } = props; //, style

    const [blockFilter, setBlockFilter] = useState(false)
    const classes = useStyle(defaultClasses, props.classes);
    const talonProps = useFilterSidebar({ filters, setBlockFilter });
    const {
        filterApi,
        filterItems,
        filterNames,
        filterState,
        handleApply,
        handleReset,
        isApplying,
    } = talonProps;

    const filterRef = useRef();
    // const itemElements = useRef();
    // const [itemElements, setItemElements] = useState();

    const handleApplyFilter = useCallback(
        (...args) => {
            const filterElement = filterRef.current;
            if (
                filterElement &&
                typeof filterElement.getBoundingClientRect === 'function'
            ) {
                const filterTop = filterElement.getBoundingClientRect().top;
                const windowScrollY =
                    window.scrollY + filterTop - SCROLL_OFFSET;
                window.scrollTo(0, windowScrollY);
            }
            handleApply(...args);
        },
        [handleApply, filterRef]
    );

    const filtersList = useMemo(
        () =>
            //Array.from(allFilterItems, ([group, items], iteration) => {
            //Array.from(CustomfilterItems, ([group, items], iteration) => {
            Array.from(filterItems, ([group, items], iteration) => {
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
                        filter={filters}
                        name={groupName}
                        onApply={handleApplyFilter}
                        initialOpen={iteration < filterCountToOpen}
                        enablePriceSlider
                        // cc={group === 'color' ? TestChk : null}
                        filterColorIcon={groupName === "Colour" && FilterColorIcon}
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
            filterApi,
            filterItems,
            filterNames,
            filterState,
            //allFilterItems,
            filterCountToOpen,
            handleApplyFilter,
            filters,
            isApplying,
            blockFilter,
            setBlockFilter
            //itemElements
        ]
    );
    // const handleReset = () => {

    // }
    const clearAll = filterState.size ? (
        <div className={classes.reset_btn_wrap}>
            <LinkButton type="button" onClick={handleReset}>
                <FormattedMessage
                    id={'filterModal.action'}
                    defaultMessage={'Clear all'}
                />
            </LinkButton>
        </div>
    ) : <></>;

    return (
        <aside
            className={classes.root}
            ref={filterRef}
            aria-live="polite"
            aria-busy="false"
        >
            <div className={classes.body}>
                {
                    filterState.size
                        ? <>
                            <div className={classes.menu_root}>
                                {clearAll}
                                <CurrentFilters
                                    filterApi={filterApi}
                                    filterNames={filterNames}
                                    filterState={filterState}
                                    onRemove={handleApplyFilter}
                                    onApply={handleApplyFilter}
                                />
                            </div>
                        </> : ''
                }

                <ul className={classes.blocks}>{filtersList}</ul>
            </div>
        </aside>
    );
};

FilterSidebar.defaultProps = {
    filterCountToOpen: 3
};

FilterSidebar.propTypes = {
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
    ),
    filterCountToOpen: number
};

export default FilterSidebar;
