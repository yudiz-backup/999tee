import React, { useEffect } from 'react';
import { arrayOf, shape, string } from 'prop-types';
import { ChevronDown as ArrowDown, ChevronUp as ArrowUp } from 'react-feather';
import { Form } from 'informed';
import { useFilterBlock } from 'src/peregrine/lib/talons/FilterModal';
import setValidator from '@magento/peregrine/lib/validators/set';

import { mergeClasses } from '../../classify';
import Icon from '../Icon';
import FilterList from './FilterList';
import defaultClasses from './filterBlock.css';
import FilterPrice from './FilterList/FilterPrice';

const FilterBlock = props => {
    const {
        filterApi,
        filterState,
        group,
        items,
        name,
        onApply,
        enablePriceSlider,
        filterColorIcon,
        filter,
        isApplying,
        blockFilter,
        setBlockFilter
    } = props;

    let iconShow = true;
    const talonProps = useFilterBlock();
    const { handleClick, isExpanded } = talonProps;
    const iconSrc = isExpanded ? ArrowUp : ArrowDown;
    const classes = mergeClasses(defaultClasses, props.classes);
    const listClass = isExpanded
        ? classes.list_expanded
        : classes.list_collapsed;

    useEffect(() => {
        if (isExpanded && blockFilter) {
            handleClick()
            setBlockFilter(false)
        }
    }, [isExpanded, blockFilter])

    return (
        <li className={group == "printful_size" || group == "kids_size" ? classes.root + ' ' + classes.size_root : classes.root + ' ' + classes.search_root}>
            <button
                className={classes.trigger}
                onClick={handleClick}
                type="button"
            >
                <span className={classes.header}>
                    <span className={classes.name}>{name}</span>
                    {iconShow && <Icon src={iconSrc} />}
                </span>
            </button>
            <Form className={blockFilter ? classes.list_collapsed : listClass}>
                {group == 'price' ? (
                    <FilterPrice
                        onApply={onApply}
                        filterApi={filterApi}
                        filterState={filterState}
                        group={group}
                        items={items}
                        name={name}
                        filter={filter}
                        isApplying={isApplying}
                    />
                ) : (
                    <FilterList
                        filterApi={filterApi}
                        filterState={filterState}
                        group={group}
                        items={items}
                        onApply={onApply}
                        filterColorIcon={filterColorIcon}
                    />
                )}
            </Form>
        </li>
    );
};

export default FilterBlock;

FilterBlock.propTypes = {
    classes: shape({
        header: string,
        list_collapsed: string,
        list_expanded: string,
        name: string,
        root: string,
        trigger: string
    }),
    filterApi: shape({}).isRequired,
    filterState: setValidator,
    group: string.isRequired,
    items: arrayOf(shape({})),
    name: string.isRequired
};