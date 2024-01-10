import React, { Fragment, Suspense, useMemo } from 'react';
import { array, number, shape, string } from 'prop-types';
import { useCategoryContent } from '../../peregrine/lib/talons/RootComponents/Category';
import { useMobile } from '../../peregrine/lib/talons/Mobile/useMobile';
import { useStyle } from '../../classify';
import Breadcrumbs from '../../components/Breadcrumbs';
import FilterModalOpenButton, {
    FilterModalOpenButtonShimmer
} from '../../components/FilterModalOpenButton';
import { FilterSidebarShimmer } from '../../components/FilterSidebar';
import Gallery, { GalleryShimmer } from '../../components/Gallery';
import { StoreTitle } from '../../components/Head';
import ProductSort, { ProductSortShimmer } from '../../components/ProductSort';
import defaultClasses from './category.css';
import NoProductsFound from './NoProductsFound';
import RichContent from '@magento/venia-ui/lib/components/RichContent';
import { FormattedMessage } from 'react-intl';
import Button from '../../components/Button';
// import LoadingIndicator from '../../components/LoadingIndicator/indicator';

const FilterModal = React.lazy(() => import('../../components/FilterModal'));
const FilterSidebar = React.lazy(() =>
    import('../../components/FilterSidebar')
);

const CategoryContent = props => {
    const { mobileView } = useMobile();
    const {
        categoryId,
        data,
        isLoading,
        sortProps,
        pageSize,
        pageControl,
        categoryDataLoading
    } = props;

    const { currentPage, setPage, totalPages } = pageControl;

    const talonProps = useCategoryContent({
        categoryId,
        data,
        pageSize,
        pageControl
    });

    const {
        categoryName,
        categoryDescription,
        filters,
        items,
        totalPagesFromData
    } = talonProps;

    const classes = useStyle(defaultClasses, props.classes);

    const shouldShowFilterButtons = filters && filters.length;
    const shouldShowFilterShimmer = filters === null;

    // If there are no products we can hide the sort button.
    const shouldShowSortButtons = totalPagesFromData;
    const shouldShowSortShimmer = !totalPagesFromData && isLoading;

    const maybeFilterButtons = shouldShowFilterButtons ? (
        <FilterModalOpenButton filters={filters} data={data} />
    ) : shouldShowFilterShimmer ? (
        <FilterModalOpenButtonShimmer />
    ) : null;

    const filtersModal = shouldShowFilterButtons ? (
        <FilterModal filters={filters} data={data} />
    ) : null;

    const sidebar = shouldShowFilterButtons ? (
        <FilterSidebar filters={filters} data={data} />
    ) : shouldShowFilterShimmer ? (
        <FilterSidebarShimmer />
    ) : null;

    const maybeSortButton = shouldShowSortButtons ? (
        <ProductSort sortProps={sortProps} data={data} />
    ) : shouldShowSortShimmer ? (
        <ProductSortShimmer />
    ) : null;

    const categoryDescriptionElement = categoryDescription ? (
        <RichContent html={categoryDescription} />
    ) : null;

    const content = useMemo(() => {
        if (!totalPagesFromData && !isLoading) {
            return <div className={sidebar ? classes.noproduct_avlb_with_sidebar : classes.noproduct_avlb} ><NoProductsFound categoryId={categoryId} /></div>;
        }

        const gallery = totalPagesFromData ? (
            <Gallery items={items} categoryId={categoryId} />
        ) : (
            <GalleryShimmer items={items} categoryId={categoryId} />
        );

        return (
            <Fragment>
                <section className={classes.gallery}>{gallery}</section>
            </Fragment>
        );
    }, [categoryId, classes, isLoading, items, totalPagesFromData]);

    const banner =
        data && data.category && data.category.image ? (
            <img
                alt="categoryBanner"
                src={data.category.image}
                className={'img-fluid' + ' ' + classes.categoyrpage_banner}
            />
        ) : (
            ''
        );

    return (
        <div className={classes.categoryContent_section}>
            <div className={'container-fluid'} id="categoryContentMainWrapper">
                <StoreTitle>{categoryName}</StoreTitle>
                <article className={classes.root}>
                    {banner}

                    <div className={classes.categoryHeader}>
                        <div className={classes.title}>
                            <div className={classes.categoryTitle}>
                                <Breadcrumbs categoryId={categoryId} />
                            </div>
                            <div className={classes.filter_box}>
                                {!mobileView && (
                                    <div>
                                        <div className={classes.headerButtons}>
                                            {maybeFilterButtons}
                                        </div>
                                    </div>
                                )}
                                {!mobileView && (
                                    <div
                                        className={
                                            classes.sidebar +
                                            ' ' +
                                            classes.sidebarWrapper +
                                            ' ' +
                                            classes.sortWrapper
                                        }
                                    >
                                        {maybeSortButton}
                                    </div>
                                )}
                            </div>
                        </div>
                        {categoryDescriptionElement}
                    </div>
                    <div className={classes.categoryBox}>
                        {!mobileView && (
                            <div
                                className={
                                    classes.sidebar +
                                    ' ' +
                                    classes.sidebarWrapper
                                }
                            >
                                <Suspense fallback={<FilterSidebarShimmer />}>
                                    {sidebar}
                                </Suspense>
                            </div>
                        )}
                        <div className={classes.categoryContent}>
                            {mobileView && (
                                <div className={classes.mobile_headerButtons}>
                                    <div
                                        className={
                                            classes.mobile_headerButtons_inner
                                        }
                                    >
                                        {maybeFilterButtons}
                                        <div
                                            className={classes.sort_btn_mobile}
                                        >
                                            {maybeSortButton}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div >
                                {content}
                            </div>
                            {currentPage < totalPages && (
                                <div
                                    className={classes.add_to_cart_btn_wrapper}
                                >

                                    <Button priority='high' onClick={() => setPage(currentPage + 1)}>
                                        <FormattedMessage
                                            id={'categoryContent.load_more'}
                                            defaultMessage={'Load More'}
                                        />
                                        {categoryDataLoading && <div class="spinner-border spinner-border-sm text-light" role="status"></div>}
                                    </Button>
                                </div>
                            )}
                            <Suspense fallback={null}>{filtersModal}</Suspense>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    );
};

export default CategoryContent;

CategoryContent.propTypes = {
    classes: shape({
        gallery: string,
        pagination: string,
        root: string,
        categoryHeader: string,
        title: string,
        categoryTitle: string,
        sidebar: string,
        categoryContent: string,
        heading: string,
        categoryInfo: string,
        headerButtons: string
    }),
    // sortProps contains the following structure:
    // [{sortDirection: string, sortAttribute: string, sortText: string},
    // React.Dispatch<React.SetStateAction<{sortDirection: string, sortAttribute: string, sortText: string}]
    sortProps: array,
    pageSize: number
};
