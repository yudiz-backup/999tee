import React, { Suspense } from 'react';
import { shape, string } from 'prop-types';
import { useSearchPage } from '../../peregrine/lib/talons/SearchPage/useSearchPage';
import { FormattedMessage } from 'react-intl';
import { mergeClasses } from '../../classify';
import Gallery from '../Gallery';
// import FilterSideBar from '../FilterModal/filterSideBar.js';
import { fullPageLoadingIndicator } from '../LoadingIndicator';
import Pagination from '../../components/Pagination';
import defaultClasses from './searchPage.css';
import PRODUCT_SEARCH from '../../queries/productSearch.graphql';
import FILTER_INTROSPECTION from '../../queries/introspection/filterIntrospectionQuery.graphql';
import GET_PRODUCT_FILTERS_BY_SEARCH from '../../queries/getProductFiltersBySearch.graphql';
import ProductSort from '../ProductSort';
import catDefaultClasses from './category.css';
import { useMobile } from '../../peregrine/lib/talons/Mobile/useMobile';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import GET_HOMEPAGECONFIG_DATA from '../../queries/getHomeConfig.graphql';
import { useHome } from '../../peregrine/lib/talons/Home/useHome';
import FilterSidebar, { FilterSidebarShimmer } from '../FilterSidebar';

import FilterModalOpenButton, {
    FilterModalOpenButtonShimmer
} from '../FilterModalOpenButton';
const FilterModal = React.lazy(() => import('../FilterModal'));
const SearchPage = props => {
    const { mobileView } = useMobile();
    const classes = mergeClasses(defaultClasses, props.classes);

    const talonProps = useSearchPage({
        queries: {
            filterIntrospection: FILTER_INTROSPECTION,
            getProductFiltersBySearch: GET_PRODUCT_FILTERS_BY_SEARCH,
            productSearch: PRODUCT_SEARCH
        }
    });

    const {
        data,
        error,
        filters,
        loading,
        // openDrawer,
        pageControl,
        sortProps
    } = talonProps;
    const homepageData = useHome({
        query: GET_HOMEPAGECONFIG_DATA
    });
    const { HomeConfigData } = homepageData;
    let enablePriceSlider = false;
    if (typeof HomeConfigData != 'undefined') {
        for (var i = 0; i < HomeConfigData.length; i++) {
            if (HomeConfigData[i]['name'] == 'enable_product_price_slider')
                enablePriceSlider = HomeConfigData[i]['value'];
        }
    }
    const shouldShowFilterShimmer = filters === null;
    const shouldShowFilterButtons = filters && filters.length;

    const sidebar = shouldShowFilterButtons ? (
        <FilterSidebar filters={filters} />
    ) : shouldShowFilterShimmer ? (
        <FilterSidebarShimmer />
    ) : null;
    
    if (error) {
        return (
            <div className={classes.noResult}>
                <FormattedMessage
                    id="SearchPage.noResult"
                    defaultMessage="No results found. The search term may be missing or invalid."
                />
            </div>
        );
    }
    const totalCount = data ? data.products.total_count : 0;
    const maybeSortButton = totalCount ? (
        <ProductSort
            sortProps={sortProps}
            enablePriceSlider={enablePriceSlider}
        />
    ) : null;

    // const maybeFilterButtons =
    //     filters && filters.length ? (
    //         <button
    //             onClick={openDrawer}
    //             className={catDefaultClasses.filterButton}
    //         >
    //             <span className={catDefaultClasses.filter_img + ' ' + 'mr-2'}>
    //                 <img
    //                     alt="filter"
    //                     src="/cenia-static/images/filter.png"
    //                     width="15"
    //                 />
    //             </span>
    //             <FormattedMessage
    //                 id="SearchPage.Filter"
    //                 defaultMessage={'Filter'}
    //             />
    //         </button>
    //     ) : null;
    const maybeFilterButtons = shouldShowFilterButtons ? (
        <FilterModalOpenButton filters={filters} />
    ) : shouldShowFilterShimmer ? (
        <FilterModalOpenButtonShimmer />
    ) : null;
    const maybeFilterModal =
        filters && filters.length ? (
            <Suspense fallback={null}>
                <FilterModal
                    filters={filters}
                    enablePriceSlider={enablePriceSlider}
                />
            </Suspense>
        ) : null;
    let content;

    // const maybeFilterSidebar =
    //     filters && filters.length && !mobileView ? (
    //         <FilterSideBar
    //             filters={filters}
    //             enablePriceSlider={enablePriceSlider}
    //         />
    //     ) : null;
    if ((!data || data.products.items.length === 0) && !loading) {
        content = (
            <div className={classes.noResult}>
                <span className={classes.noResult_icon}>
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                </span>
                <span className={'ml-2' + ' ' + classes.noResult_text}>
                    <FormattedMessage
                        id="SearchPage.noResult_text"
                        defaultMessage={'No results found!'}
                    />
                </span>
            </div>
        );
    } else {
        content = (
            <section className={classes.search_gallery}>
                <div className={catDefaultClasses.gallery}>
                    <div className={catDefaultClasses.filters_wrapper}>
                        <div
                            className={catDefaultClasses.filters_wrapper_inner}
                        >

                            {/* <Suspense fallback={null}>
                                {maybeFilterSidebar}
                            </Suspense> */}
                            <Suspense fallback={<FilterSidebarShimmer />}>
                                {sidebar}
                            </Suspense>
                        </div>
                    </div>

                    {mobileView && (
                        <div className={catDefaultClasses.mobile_headerButtons}>
                            <div
                                className={
                                    catDefaultClasses.mobile_headerButtons_inner
                                }
                            >
                                {maybeFilterButtons}
                                <div
                                    className={
                                        catDefaultClasses.sort_btn_mobile
                                    }
                                >
                                    {maybeSortButton}
                                </div>
                            </div>
                        </div>
                    )}
                    {loading ? (
                        fullPageLoadingIndicator
                    ) : (<div className={catDefaultClasses.gallery_wrap + ' ' + classes.search_gallery_wrap}>
                        <Gallery items={data.products.items} />
                        <section
                            className={
                                catDefaultClasses.pagination + ' ' + 'mt-2'
                            }
                        >
                            <Pagination pageControl={pageControl} />
                        </section>
                    </div>)}
                </div>
            </section>
        );
    }

    return (
        <section className={classes.root}>
            <div className='container-fluid'>
                <div className={classes.categoryTop}>
                    <h1 className={catDefaultClasses.title + ' ' + classes.title}>
                        <div >
                           <h4> {`${totalCount} results`}</h4>
                        </div>
                        <div className={classes.sortWrapper}>{maybeSortButton}</div>
                    </h1>
                </div>
                {content}
                <Suspense fallback={null}>{maybeFilterModal}</Suspense>
            </div>
        </section>
    );
};

export default SearchPage;

SearchPage.propTypes = {
    classes: shape({
        noResult: string,
        root: string,
        totalPages: string
    })
};
