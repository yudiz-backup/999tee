import React, { Suspense, useEffect, useState } from 'react';
import { shape, string, number } from 'prop-types';
import { mergeClasses } from '../../classify';
import defaultClasses from './home.css';
import { useSlider } from '../../peregrine/lib/talons/Slider/useSlider';
import GET_SLIDER_DATA from '../../queries/getSliderDetails.graphql';
// import { Link, resourceUrl } from 'src/drivers';
// import { useMobile } from '../../peregrine/lib/talons/Mobile/useMobile';
// import Image from '../Image';
// import BannerSkelton from './bannerSkeleton';
// import FeaturesProdouctContent from '../../RootComponents/Category/featuresProdouctContent';
import { useCategory } from '../../peregrine/lib/talons/RootComponents/Category';
import { GET_PAGE_SIZE } from '../../RootComponents/Category/category.gql';
import { useQuery } from '@apollo/client';
import cmsPageQuery from '../../queries/getCmsPage.graphql';
import RichContent from '@magento/venia-ui/lib/components/RichContent';
import InstaSection from './instaSection';
import insta from '../../queries/instaSection.graphql';
// import { Link } from 'src/drivers';
// import Men from '../../../cenia-static/images/men.png';
// import Women from '../../../cenia-static/images/women.png';
// import Kids from '../../../cenia-static/images/kids.png';
import { globalContext } from '../../peregrine/lib/context/global.js';
import ErrorView from '@magento/venia-ui/lib/components/ErrorView';
import FeaturedProduct from './featuredProduct';
import getFeaturedProductdata from '../../queries/featuredProduct.graphql';
import Testimonials from '../Testimonials/testimonials';
import getTestimonialdata from '../../queries/testtimonials/getTestimonialdata.graphql';
import LoadingIndicator from '../LoadingIndicator/indicator';

const Banner = React.lazy(() => import('./banner'));
const SliderProduct = React.lazy(() => import('./sliderProduct'));

const imagePerRow = 6;

const Home = props => {
    // const history = useHistory();
    const classes = mergeClasses(defaultClasses, props.classes);
    // const [scrollFlag, setScrollFlag] = useState(false);
    const { HomepageConfig } = props;
    const [id /* , setFeaturedId */] = useState(6);
    const { state } = React.useContext(globalContext);
    const [imageLoaded, setImageLoaded] = useState(false);

    const { data: featuredData, loading: featuredLoading } = useQuery(
        getFeaturedProductdata,
        {
            fetchPolicy: 'no-cache'
        }
    );
    const featuredInfo = featuredData?.getFeaturedProductdata?.data;

    const { data: testimonialdata, loading: testimonialLoading } = useQuery(
        getTestimonialdata,
        {
            fetchPolicy: 'no-cache'
        }
    );

    // const handleClick = () => {
    //     if (!scrollFlag) setScrollFlag(true);
    // };

    // useEffect(() => {
    //     document.addEventListener('scroll', handleClick);
    //     return () => {
    //         document.removeEventListener('scroll', handleClick);
    //     };
    // });

    const talonProps = useSlider({
        query: GET_SLIDER_DATA
    });

    const { data: instaDetails, loading: instaLoading } = useQuery(insta);

    useEffect(() => { }, [instaDetails]);

    let showCategoryIcons = false;
    let showCategoryBanners = false;
    // let showOfferBanners = false;
    let showHomeSlider = false;
    let showLatestProducts = false;

    for (var i = 0; i < HomepageConfig.length; i++) {
        // if (HomepageConfig[i]['name'] == 'categories_icon_block')
        //     var catIconIdentifier = HomepageConfig[i]['value'];
        if (HomepageConfig[i]['name'] == 'categories_banner_block')
            var categoryBannerIdentifier = HomepageConfig[i]['value'];
        // if (HomepageConfig[i]['name'] == 'offer_banner_block')
        //     var offerBannersIdentifier = HomepageConfig[i]['value'];
        if (HomepageConfig[i]['name'] == 'show_latest_products')
            showLatestProducts = parseInt(HomepageConfig[i]['value']);
        if (HomepageConfig[i]['name'] == 'show_category_icon')
            showCategoryIcons = parseInt(HomepageConfig[i]['value']);
        if (HomepageConfig[i]['name'] == 'show_category_banner')
            showCategoryBanners = parseInt(HomepageConfig[i]['value']);
        // if (HomepageConfig[i]['name'] == 'show_offer_banner')
        //     showOfferBanners = parseInt(HomepageConfig[i]['value']);
        if (HomepageConfig[i]['name'] == 'show_home_slider')
            showHomeSlider = parseInt(HomepageConfig[i]['value']);
    }

    const { sliderData } = talonProps;

    // const { mobileView } = useMobile();

    // let sliderImgWidth = 1351;
    // if (mobileView) {
    //     sliderImgWidth = screen.availWidth;
    // }

    const { data, loading: cmsPageLoading } = useQuery(cmsPageQuery, {
        variables: {
            id: Number(2),
            onServer: true
        }
    });

    // const bannerSkelton = <BannerSkelton mobileView={mobileView} />;

    const talonProp = useCategory({
        id,
        queries: {
            getPageSize: GET_PAGE_SIZE
        }
    });
    const { error, categoryData, pageControl, categoryLoading } = talonProp;

    useEffect(() => {
        if (data && data.cmsPage && data.cmsPage.content) {
            const parser = new DOMParser();
            const parsedHtml = parser.parseFromString(
                data.cmsPage.content,
                'text/html'
            );
            const imgSrc = parsedHtml.querySelector('img').getAttribute('src');
            if (imgSrc) {
                const img = new Image();
                img.src = imgSrc;

                img.onload = () => {
                    setImageLoaded(true);
                };
            } else {
                setTimeout(() => setImageLoaded(true), 5000)
            }
        }
    }, [data]);

    if (!categoryData) {
        if (error && pageControl.currentPage === 1) {
            if (process.env.NODE_ENV !== 'production') {
                console.error(error);
            }

            return <ErrorView />;
        }
    }

    return (
        <React.Fragment>
            {/* <div> */}
            {!(
                cmsPageLoading &&
                categoryLoading &&
                testimonialLoading &&
                featuredLoading &&
                instaLoading
            ) && imageLoaded ? (
                <>
                    <Suspense fallback={''}>
                        {showHomeSlider != 0 &&
                            typeof sliderData != 'undefined' && (
                                <div
                                    className={
                                        defaultClasses.main_homepage_sections
                                    }
                                >
                                    <RichContent html={data.cmsPage.content} />
                                </div>
                            )}
                    </Suspense>

                    {/* Trending product section */}
                    <Suspense fallback={''}>
                        {showLatestProducts !== 0 && (
                            <div style={{ paddingBottom: '20px' }}>
                                <div className="homepage_sections_head container-fluid">
                                    <h2 className="homepage_section_heading">
                                        SPOTLIGHT
                                    </h2>
                                </div>
                                <SliderProduct
                                    showLinkedProduct={showLatestProducts}
                                    data={categoryData}
                                    type="Trending Product"
                                    // name={formatMessage({
                                    //     id: 'home.latest',
                                    //     defaultMessage: 'Trending Product'
                                    // })}
                                    classes={classes}
                                />
                            </div>
                        )}
                    </Suspense>
                    {/* Trending product section end */}

                    {/* mid banner section start */}
                    <Suspense fallback={''}>
                        {showCategoryBanners != 0 && (
                            <section
                                className={
                                    defaultClasses.homepage_sections +
                                    ' ' +
                                    defaultClasses.static_blocks +
                                    ' ' +
                                    defaultClasses.mid_banner_sec_wrap
                                }
                            >
                                <Banner
                                    identifier={categoryBannerIdentifier}
                                    showBanner={showCategoryBanners}
                                />
                            </section>
                        )}
                    </Suspense>
                    {/* mid banner section END */}

                    {/*Testimonials Section*/}
                    {testimonialdata && <Suspense fallback={''}>
                        <Testimonials data={testimonialdata} />
                    </Suspense>}

                    {/* {Fetures Product Section} */}
                    {
                        <Suspense fallback={''}>
                            <FeaturedProduct featuredInfo={featuredInfo} />
                        </Suspense>
                    }
                    {
                        <Suspense fallback={''}>
                            <section
                                className={
                                    defaultClasses.homepage_sections +
                                    ' ' +
                                    defaultClasses.feature_block
                                }
                            >
                                <InstaSection
                                    data={instaDetails}
                                    imagePerRow={imagePerRow}
                                />
                            </section>
                        </Suspense>
                    }
                </>
            ) : (
                <LoadingIndicator />
            )}
        </React.Fragment>
    );
};

Home.propTypes = {
    classes: shape({
        copyright: string,
        root: string,
        tile: string,
        tileBody: string,
        tileTitle: string,
        gallery: string,
        title: string
    }),
    id: number
};

export default Home;
