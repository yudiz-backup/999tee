import React, { useMemo, useState } from 'react';
import { mergeClasses } from '../../classify';
import { useGetScopeCache } from '../../peregrine/lib/talons/Home/useHome';
import defaultClasses from '../../components/CedHome/home.css';
import Product from '../../components/CedHome/product';
import OwlCarousel from 'react-owl-carousel';

export default function FeaturedProduct(props) {
    const classes = mergeClasses(defaultClasses, props.classes);
    const { featuredData } = props;
    const responsive1 = {
        0: { items: 1 },
        576: { items: 2 },
        1200: { items: 3 },
        1400: { items: 3 },
        1600: { items: 4 }
    };

    const [startPosition, setStartPosition] = useState(0);
    const updateCarouselPosition = (newPosition) => {
        setStartPosition(newPosition);
    };

    const { config } = useGetScopeCache();
    const productComponents = useMemo(
        () =>
            featuredData &&
            featuredData.map((value, index) => {
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
        [config, classes, featuredData]
    );

    return (
        <>
            {featuredData && (
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
                                <React.Fragment>
                                    {featuredData &&
                                        typeof featuredData != 'undefined' && (
                                            <OwlCarousel
                                                className={
                                                    'owl-theme' +
                                                    ' ' +
                                                    defaultClasses.owl_thme_design
                                                }
                                                loop={false}
                                                rewind={true}
                                                margin={5}
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
                                                {featuredData
                                                    ? productComponents
                                                    : ''}
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
}
