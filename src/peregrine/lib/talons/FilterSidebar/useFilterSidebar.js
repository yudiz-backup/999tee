import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useHistory, useLocation } from 'react-router-dom';

import { useAppContext } from '@magento/peregrine/lib/context/app';

import mergeOperations from '../../util/shallowMerge';
import { useFilterState } from '@magento/peregrine/lib/talons/FilterModal';
import {
    getSearchFromState,
    getStateFromSearch,
    stripHtml
} from '@magento/peregrine/lib/talons/FilterModal/helpers';

import DEFAULT_OPERATIONS from '@magento/peregrine/lib/talons/FilterModal/filterModal.gql';

const DRAWER_NAME = 'filter';

export const useFilterSidebar = props => {
    const { filters, setBlockFilter } = props;

    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const { getFilterInputsQuery } = operations;

    const [isApplying, setIsApplying] = useState(false);
    const [{ drawer }, { toggleDrawer, closeDrawer }] = useAppContext();
    const [filterState, filterApi] = useFilterState();
    const prevDrawer = useRef(null);
    const isOpen = drawer === DRAWER_NAME;

    const history = useHistory();
    const { pathname, search } = useLocation();

    const { data: introspectionData } = useQuery(getFilterInputsQuery);

    const inputFields = introspectionData
        ? introspectionData.__type.inputFields
        : [];

    const attributeCodes = useMemo(
        () => filters.map(({ attribute_code }) => attribute_code),
        [filters]
    );

    // Create a set of disabled filters.
    const DISABLED_FILTERS = useMemo(() => {
        const disabled = new Set();
        // Disable category filtering when not on a search page.
        // if (pathname !== '/search.html') {
        disabled.add('category_id');
        // disabled.add('');
        // }

        return disabled;
    }, [pathname]);

    // Get "allowed" filters by intersection of filter attribute codes and
    // schema input field types. This restricts the displayed filters to those
    // that the api will understand.
    const possibleFilters = useMemo(() => {
        const nextFilters = new Set();

        // perform mapping and filtering in the same cycle
        for (const { name } of inputFields) {
            const isValid = attributeCodes.includes(name);
            const isEnabled = !DISABLED_FILTERS.has(name);

            if (isValid && isEnabled) {
                nextFilters.add(name);
            }
        }

        return nextFilters;
    }, [DISABLED_FILTERS, attributeCodes, inputFields]);

    // iterate over filters once to set up all the collections we need
    const [filterNames, filterKeys, filterItems] = useMemo(() => {
        const names = new Map();
        const keys = new Set();
        const itemsByGroup = new Map();

        for (const filter of filters) {
            const { options, label: name, attribute_code: group } = filter;

            // If this aggregation is not a possible filter, just back out.
            if (possibleFilters.has(group)) {
                const items = [];

                // add filter name
                names.set(group, name);

                // add filter key permutations
                keys.add(`${group}[filter]`);

                // add items

                for (const { label, value, count } of options) {
                    items.push({ title: stripHtml(label), value, count });
                }
                itemsByGroup.set(group, items);
            }
        }

        return [names, keys, itemsByGroup];
    }, [filters, possibleFilters]);

    // on apply, write filter state to location
    useEffect(() => {
        if (isApplying) {
            const nextSearch = getSearchFromState(
                search,
                filterKeys,
                filterState
            );

            // write filter state to history
            history.push({ pathname, search: nextSearch });

            // mark the operation as complete
            setIsApplying(false);
        }
    }, [filterKeys, filterState, history, isApplying, pathname, search]);

    const handleOpen = useCallback(() => {
        toggleDrawer(DRAWER_NAME);
    }, [toggleDrawer]);

    const handleClose = useCallback(() => {
        closeDrawer();
    }, [closeDrawer]);

    const handleApply = useCallback(() => {
        setIsApplying(true);
        handleClose();
    }, [handleClose]);

    const handleReset = useCallback(() => {
        filterApi.clear();
        setIsApplying(true);
        setBlockFilter(true)
    }, [filterApi, setIsApplying, setBlockFilter]);

    const handleKeyDownActions = useCallback(
        event => {
            // do not handle keyboard actions when the modal is closed
            if (!isOpen) {
                return;
            }

            switch (event.keyCode) {
                // when "Esc" key fired -> close the modal
                case 27:
                    handleClose();
                    break;
            }
        },
        [isOpen, handleClose]
    );

    useEffect(() => {
        const justOpened =
            prevDrawer.current === null && drawer === DRAWER_NAME;
        const justClosed =
            prevDrawer.current === DRAWER_NAME && drawer === null;

        // on drawer toggle, read filter state from location
        if (justOpened || justClosed) {
            const nextState = getStateFromSearch(
                search,
                filterKeys,
                filterItems
            );

            filterApi.setItems(nextState);
        }

        // on drawer close, update the modal visibility state
        if (justClosed) {
            handleClose();
        }

        prevDrawer.current = drawer;
    }, [drawer, filterApi, filterItems, filterKeys, search, handleClose]);

    useEffect(() => {
        const params = new URLSearchParams(search).getAll('price[filter]');
        const updateFilterItems = new Map(filterItems)
        const oldPriceValues = updateFilterItems.get('price')
        if (params.length && params[0].split(',')[0] && params[0].split(',')[1]) {
            updateFilterItems.set("price", oldPriceValues.concat([{ title: params[0].split(',')[0], value: params[0].split(',')[1] }]))
        }
        const nextState = getStateFromSearch(search, filterKeys, updateFilterItems);
        filterApi.setItems(nextState);
    }, [filterApi, filterItems, filterKeys, search]);

    return {
        filterApi,
        filterItems,
        filterKeys,
        filterNames,
        filterState,
        handleApply,
        handleClose,
        handleKeyDownActions,
        handleOpen,
        handleReset,
        isApplying,
        isOpen,
    };
};
