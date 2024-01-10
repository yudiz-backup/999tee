import React, { useMemo, useState } from 'react';
import { mergeClasses } from '../../classify';
import {
    useGetScopeCache,
    useSliderProducts
} from '../../peregrine/lib/talons/Home/useHome';
import GET_LATESTPRODUCTS_DATA from '../../queries/getLatestProducts.graphql';
import GET_BESTSELLER_DATA from '../../queries/getBestSeller.graphql';
// import FeaturedQuery from '../../queries/featuredProducts.graphql'
import defaultClasses from './home.css';
import Product from './product';
import OwlCarousel from 'react-owl-carousel';

export default function SliderProduct(props) {
    const classes = mergeClasses(defaultClasses, props.classes);
    const { showLinkedProduct, type, data } = props;
    const { config } = useGetScopeCache();
    const [startPosition, setStartPosition] = useState(0);

    const updateCarouselPosition = (newPosition) => {
        setStartPosition(newPosition);
    };

    const { sliderProduct } = useSliderProducts({
        showProducts: showLinkedProduct,
        query:
            (type == 'Trending Product' ? GET_LATESTPRODUCTS_DATA : '') ||
            (type == 'BestSeller Product' ? GET_BESTSELLER_DATA : '')
    });

    const responsive1 = {
        0: { autoWidth: true, items: 1, loop: sliderProduct?.length > 1 },
        // 575: { items: 2 },
        768: { items: 2, loop: sliderProduct?.length > 2 },
        1200: { items: 3, loop: sliderProduct?.length > 3 },
        1600: { items: 4, loop: sliderProduct?.length > 4 }
    };

    const productComponents = useMemo(
        () =>
            sliderProduct &&
            sliderProduct.map((value, index) => {
                return (
                    <Product
                        key={index}
                        defaultClasses={defaultClasses}
                        value={value}
                        config={config}
                        classes={classes}
                        data={data}
                    />
                );
            }),
        [config, classes, sliderProduct, data]
    );
    const sliderProducts = useMemo(() => {
        return <React.Fragment>
            {sliderProduct &&
                typeof sliderProduct != 'undefined' && (
                    <OwlCarousel
                        className={
                            'owl-theme' +
                            ' ' +
                            defaultClasses.owl_thme_design
                        }
                        loop={true}
                        rewind={false}
                        margin={10}
                        nav={true}
                        dots={false}
                        slideBy={1}
                        autoplay={false}
                        autoplayTimeout={2000}
                        // items={4}
                        responsive={responsive1}
                        startPosition={startPosition}
                        smartSpeed={1000}
                    // onChanged={(event) => {
                    //     updateCarouselPosition(event.item.index)
                    // }}
                    >
                        {sliderProduct
                            ? productComponents
                            : ''}
                    </OwlCarousel>
                )}
        </React.Fragment>
    }, [sliderProduct, data]);

    return (
        <>
            {showLinkedProduct != 0 && sliderProduct && (
                <section
                    className={
                        defaultClasses.h_products +
                        ' ' +
                        ' m-0 ' +
                        defaultClasses.homepage_sections
                    }
                >
                    <div className="container-fluid">
                        <div className="row">
                            <div
                                className={
                                    defaultClasses.h_products_column +
                                    ' ' +
                                    'col-xs-12 col-lg-12 col-sm-12 col-md-12'
                                }
                            >
                                {/* <div className={defaultClasses.section_heading}>
                                    <h3
                                        className={
                                            defaultClasses.homepage_section_heading
                                        }
                                    >
                                        {name}
                                    </h3>
                                </div> */}
                                {sliderProducts}
                                {/* 
<React.Fragment>
        {sliderProduct &&
            typeof sliderProduct != 'undefined' && (
                <OwlCarousel
                    className={
                        'owl-theme' +
                        ' ' +
                        defaultClasses.owl_thme_design
                    }
                    loop={true}
                    rewind={false}
                    margin={10}
                    nav={true}
                    dots={false}
                    slideBy= {1}
                    autoplay={false}
                    autoplayTimeout={2000}
                    // items={4}
                    responsive={responsive1}
                    startPosition={startPosition}
                    smartSpeed= {1000}
                    onChanged={(event) => {
                        updateCarouselPosition(event.item.index)
                    }}
                >
                    {sliderProduct
                        ? productComponents
                        : ''}
                </OwlCarousel>
            )}
    </React.Fragment> */}
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
