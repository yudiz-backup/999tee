import React, { useMemo, useState } from 'react';
import { useRecentProducts } from '../../peregrine/lib/talons/RecentProduct/useRecentProduct';
import RecentQuery from '../../queries/recentProducts.graphql';
import { mergeClasses } from '../../classify';
import defaultClasses from '../CedHome/home.css';
import Product from '../CedHome/product';
import OwlCarousel from 'react-owl-carousel';
import { useGetScopeCache } from '../../peregrine/lib/talons/Home/useHome';

const RecentProduct = props => {
    const { product, title } = props;
    const tokenProps = useRecentProducts({
        query: RecentQuery,
        visitor_id: localStorage.getItem('visitor_id')
            ? localStorage.getItem('visitor_id')
            : '',
        product_id: product.id
    });
    const { config } = useGetScopeCache();
    const { sliderProduct } = tokenProps;

    const [startPosition, setStartPosition] = useState(0);
    const updateCarouselPosition = (newPosition) => {
        setStartPosition(newPosition);
    };

    const classes = mergeClasses(defaultClasses, props.classes);

    const responsive1 = {
        0: { items: 1 },
        576: { items: 2 },
        1200: { items: 3 },
        1400: { items: 3 },
        1600: { items: 4 }
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
                    />
                );
            }),
        [config, classes, sliderProduct]
    );

    if (sliderProduct && sliderProduct.length < 3) {
        return <div />;
    }

    return (
        <>
            {sliderProduct && (
                <section
                    className={
                        defaultClasses.h_products +
                        ' ' +
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
                                <div className={defaultClasses.section_heading}>
                                    <h3
                                        className={
                                            defaultClasses.homepage_section_heading
                                        }
                                    >
                                        {title}
                                    </h3>
                                </div>
                                <React.Fragment>
                                    {sliderProduct &&
                                        typeof sliderProduct != 'undefined' && (
                                            <OwlCarousel
                                                className={
                                                    'owl-theme' +
                                                    ' ' +
                                                    defaultClasses.owl_thme_design
                                                }
                                                loop={false}
                                                rewind={true}
                                                margin={10}
                                                nav={true}
                                                dots={false}
                                                autoplay={false}
                                                autoplayTimeout={2000}
                                                items={4}
                                                responsive={responsive1}
                                                startPosition={startPosition}
                                                onChanged={(event) => {
                                                    updateCarouselPosition(event.item.index)
                                                }}
                                            >
                                                {productComponents}
                                            </OwlCarousel>
                                        )}
                                </React.Fragment>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </>
    );
};

export default RecentProduct;
