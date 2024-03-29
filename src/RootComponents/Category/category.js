import React, { Fragment } from 'react';
import { number, shape, string } from 'prop-types';
import { useCategory } from '../../peregrine/lib/talons/RootComponents/Category';
import { useStyle } from '../../classify';
import CategoryContent from './categoryContent';
import defaultClasses from './category.css';
import { Meta } from '../../components/Head';
import { GET_PAGE_SIZE } from './category.gql';
import ErrorView from '@magento/venia-ui/lib/components/ErrorView';
// import LoadingIndicator from '../../components/LoadingIndicator/indicator';

const Category = props => {
    const { id } = props

    const talonProps = useCategory({
        id,
        queries: {
            getPageSize: GET_PAGE_SIZE
        }
    });

    const {
        error,
        metaDescription,
        loading,
        categoryData,
        pageControl,
        sortProps,
        categoryDataLoading
    } = talonProps;

    const classes = useStyle(defaultClasses, props.classes);

    if (!categoryData) {
        if (error && pageControl.currentPage === 1) {
            if (process.env.NODE_ENV !== 'production') {
                console.error(error);
            }

            return <ErrorView />;
        }
    }

    return (
        <Fragment>
            <Meta name="description" content={metaDescription} />
                {/* {categoryDataLoading ? (
                    <LoadingIndicator/>
                ) : (<></>)} */}
            <CategoryContent
                categoryId={id}
                classes={classes}
                data={categoryData}
                isLoading={loading}
                pageControl={pageControl}
                sortProps={sortProps}
                pageSize={6}
                categoryDataLoading={categoryDataLoading}
            />
        </Fragment>
    );
};

Category.propTypes = {
    classes: shape({
        gallery: string,
        root: string,
        title: string
    }),
    id: number
};

Category.defaultProps = {
    id: 8
};

export default Category;
