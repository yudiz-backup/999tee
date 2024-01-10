import React, { Fragment, Suspense, useMemo, useState, useEffect } from 'react';
import { shape, string } from 'prop-types';
import { useStyle } from '../../classify';
import defaultClasses from '../../RootComponents/Category/category.css';
// import FeaturedQuery from '../../queries/featuredProducts.graphql';
// import { useFeaturedProducts } from '../../peregrine/lib/talons/FeaturedProduct/useFeaturedProduct';
import { useCategory, useCategoryContent } from '../../peregrine/lib/talons/RootComponents/Category';
import Gallery, { GalleryShimmer } from '../../components/Gallery';
import { GET_PAGE_SIZE } from './category.gql';
import { useParams } from 'react-router-dom';
import { useNavigation } from '../../peregrine/lib/talons/MegaMenu/useMegaMenu';
import { isMobileView } from '../../util/helperFunction';
import NoProductsFound from './NoProductsFound/noProductsFound';

const FeaturesProdouctContent = (props) => {
    const [categoryId, setCategoryId] = useState()
    const talonsProps = useNavigation();
    const mobileView = isMobileView();
    const { navdetails } = talonsProps;
    const { categoryName } = useParams()

    useEffect(() => {
        if(typeof navdetails != 'undefined' && navdetails && !mobileView){
            const elements = JSON.parse(navdetails)?.categories;
            if(elements){
                $.each(elements, function (i, v){
                    if(v?.main_category_name == categoryName.charAt(0).toUpperCase() + categoryName.slice(1))
                    setCategoryId(+i)
                })
            }
        }
    },[navdetails,mobileView])

    const talonProps = useCategory({
        id: categoryId,
        queries: {
            getPageSize: GET_PAGE_SIZE
        }
    });

    const {
        categoryData: data,
        // pageSize
    } = talonProps;

    const talonProp = useCategoryContent({
        categoryId,
        data,
        //pageSize
    });
    const {
        items,
    } = talonProp;


    // If there are no products we can hide the sort button.
    const classes = useStyle(defaultClasses, props.classes);

    const content = useMemo(() => {
        if (!items) {
            return <div className={classes.noproduct_avlb + ' ' + classes.empty_product} ><NoProductsFound categoryId={categoryId} /></div>;
        }

        const gallery = (
            <Gallery items={items} />
        ) || (
                <GalleryShimmer items={items} />
            );
        return (
            <Fragment>
                {
                    <Suspense fallback={''}>
                        {/* <SliderProduct
                            featuredData={featuredProduct}
                        /> */}
                        <section className={classes.gallery + ' ' + classes.featuredGallery}>{gallery}</section>
                    </Suspense>
                }
            </Fragment>
        );
    }, [
        items,
        classes
    ]);

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
        <div className='container-fluid'>
            <div className={classes.features_prodouct_content_root}>
                {banner}
                {content}
            </div>
        </div>
    );
};

export default FeaturesProdouctContent;

FeaturesProdouctContent.propTypes = {
    classes: shape({
        root: string,
    }),
};
