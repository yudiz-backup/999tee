import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLazyQuery, useQuery } from '@apollo/client';

import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { usePagination } from '@magento/peregrine/lib/hooks/usePagination';
import { useSort } from '@magento/peregrine/lib/hooks/useSort';
import {
    getFiltersFromSearch,
    getFilterInput
} from '@magento/peregrine/lib/talons/FilterModal/helpers';

import DEFAULT_OPERATIONS from './category.gql';
import { useMobile } from '../../Mobile/useMobile';

/**
 * A [React Hook]{@link https://reactjs.org/docs/hooks-intro.html} that
 * controls the logic for the Category Root Component.
 *
 * @kind function
 *
 * @param {object}      props
 * @param {number}      props.id - Category Id.
 * @param {GraphQLAST}  props.operations.getCategoryQuery - Fetches category using a server query
 * @param {GraphQLAST}  props.operations.getFilterInputsQuery - Fetches "allowed" filters using a server query
 * @param {GraphQLAST}  props.queries.getStoreConfig - Fetches store configuration using a server query
 *
 * @returns {object}    result
 * @returns {object}    result.error - Indicates a network error occurred.
 * @returns {object}    result.categoryData - Category data.
 * @returns {bool}      result.isLoading - Category data loading.
 * @returns {string}    result.metaDescription - Category meta description.
 * @returns {object}    result.pageControl - Category pagination state.
 * @returns {array}     result.sortProps - Category sorting parameters.
 * @returns {number}    result.pageSize - Category total pages.
 */
export const useCategory = props => {
    const {
        id,
        queries: { getPageSize }
    } = props;

    const { mobileView } = useMobile();

    const [updatedCategoryData, setUpdatedCategoryData] = useState();
    // const [categoryId, setCategoryId] = useState()

    const categoryIdRef = useRef()

    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const { getCategoryQuery, getFilterInputsQuery } = operations;

    const { data: pageSizeData } = useQuery(getPageSize, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
    });

    const pageSize = pageSizeData && pageSizeData.storeConfig.grid_per_page;

    const [paginationValues, paginationApi] = usePagination();
    const { currentPage, totalPages } = paginationValues;
    const { setCurrentPage, setTotalPages } = paginationApi;

    const sortProps = useSort();
    const [currentSort] = sortProps;

    // Keep track of the sort criteria so we can tell when they change.
    const previousSort = useRef(currentSort);

    const pageControl = {
        currentPage,
        setPage: setCurrentPage,
        totalPages
    };

    const [
        ,
        {
            actions: { setPageLoading }
        }
    ] = useAppContext();

    const [runQuery, queryResponse] = useLazyQuery(getCategoryQuery, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
    });
    const {
        called: categoryCalled,
        loading: categoryLoading,
        error,
        data
    } = queryResponse;
    const { search } = useLocation();

    const isBackgroundLoading = !!data && categoryLoading;

    // Update the page indicator if the GraphQL query is in flight.
    useEffect(() => {
        setPageLoading(isBackgroundLoading);
    }, [isBackgroundLoading, setPageLoading]);

    // Keep track of the search terms so we can tell when they change.
    const previousSearch = useRef(search);

    // Get "allowed" filters by intersection of schema and aggregations
    const {
        called: introspectionCalled,
        data: introspectionData,
        loading: introspectionLoading
    } = useQuery(getFilterInputsQuery, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
    });

    // Create a type map we can reference later to ensure we pass valid args
    // to the graphql query.
    // For example: { category_id: 'FilterEqualTypeInput', price: 'FilterRangeTypeInput' }
    const filterTypeMap = useMemo(() => {
        const typeMap = new Map();
        if (introspectionData) {
            introspectionData.__type.inputFields.forEach(({ name, type }) => {
                typeMap.set(name, type.name);
            });
        }
        return typeMap;
    }, [introspectionData]);

    // Run the category query immediately and whenever its variable values change.
    useEffect(() => {
        // Wait until we have the type map to fetch product data.
        if (!filterTypeMap.size || !pageSize) {
            return;
        }

        const filters = getFiltersFromSearch(search);

        // Construct the filter arg object.
        const newFilters = {};
        filters.forEach((values, key) => {
            newFilters[key] = getFilterInput(values, filterTypeMap.get(key));
        });

        // Use the category id for the current category page regardless of the
        // applied filters. Follow-up in PWA-404.
        newFilters['category_id'] = { eq: String(id) };

        runQuery({
            variables: {
                currentPage: Number(currentPage),
                id: Number(id),
                filters: newFilters,
                pageSize: mobileView ? Number(24) : Number(6),
                sort: { [currentSort.sortAttribute]: currentSort.sortDirection }
            }
        });
    }, [
        currentPage,
        currentSort,
        filterTypeMap,
        id,
        pageSize,
        runQuery,
        search,
        mobileView
    ]);

    useEffect(() => {
        if (data && data.products && data.products.page_info && data.products.page_info.total_pages) {
            setTotalPages(data.products.page_info.total_pages)
        }
        return () => {
            setTotalPages(1);
        };
    }, [setTotalPages, data]);

    // If we get an error after loading we should try to reset to page 1.
    // If we continue to have errors after that, render an error message.
    useEffect(() => {
        if (error && !categoryLoading && !data && currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [currentPage, error, categoryLoading, setCurrentPage, data]);

    // Reset the current page back to one (1) when the search string, filters
    // or sort criteria change.
    useEffect(() => {
        // We don't want to compare page value.
        const prevSearch = new URLSearchParams(previousSearch.current);
        const nextSearch = new URLSearchParams(search);
        prevSearch.delete('page');
        nextSearch.delete('page');

        if (
            prevSearch.toString() !== nextSearch.toString() ||
            previousSort.current.sortAttribute.toString() !==
            currentSort.sortAttribute.toString() ||
            previousSort.current.sortDirection.toString() !==
            currentSort.sortDirection.toString()
        ) {
            // The search term changed.
            setCurrentPage(1, true);
            // And update the ref.
            previousSearch.current = search;
            previousSort.current = currentSort;
        }
    }, [currentSort, previousSearch, search, setCurrentPage]);

    useEffect(() => {
        if (data && data.category && categoryIdRef.current &&
            categoryIdRef.current !== data.category.id) {
            setCurrentPage(1);
        }
    }, [JSON.stringify(data)])

    useEffect(() => {
        if (data &&
            data.products &&
            data.products.items) {
            if (currentPage === 1 || (currentPage > 1 &&
                updatedCategoryData &&
                updatedCategoryData.products &&
                updatedCategoryData.products.items)) {
                setUpdatedCategoryData({
                    ...data,
                    products: {
                        ...data.products,
                        items: currentPage === 1 ||
                            (categoryIdRef.current &&
                                categoryIdRef.current !== data.category.id) ?
                            data.products.items : updatedCategoryData.products.items.concat(
                                data.products.items
                            )
                    }
                })
                categoryIdRef.current = data.category.id
            }
        }


    }, [JSON.stringify(data)]);

    const categoryData =
        categoryLoading && !updatedCategoryData ? null : updatedCategoryData;
    const metaDescription =
        updatedCategoryData &&
            updatedCategoryData.category &&
            updatedCategoryData.category.meta_description
            ? updatedCategoryData.category.meta_description
            : META_DESCRIPTION;

    // When only categoryLoading is involved, noProductsFound component flashes for a moment
    const loading =
        (introspectionCalled && !categoryCalled) ||
        (categoryLoading && !updatedCategoryData) ||
        introspectionLoading;

    return {
        error,
        categoryData,
        loading,
        metaDescription,
        pageControl,
        sortProps,
        pageSize,
        categoryDataLoading: categoryLoading
    };
};
