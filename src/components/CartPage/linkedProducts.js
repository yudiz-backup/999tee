import React, { useState, useMemo } from 'react';
import OwlCarousel from 'react-owl-carousel';
import 'owl.carousel/dist/assets/owl.carousel.css';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import 'owl.carousel/dist/assets/owl.theme.default.css';
import homeClasses from '../CedHome/home.css';
import Product from './product';
import cartClasses from './cartPage.css';
const LinkedProducts = props => {
    const { linkedProducts, isOpen, closeMiniCart = () => { } } = props;
    const [products, setProducts] = useState([]);
    //const { config } = useGetScopeCache();
    const [startPosition, setStartPosition] = useState(0);

    const updateCarouselPosition = (newPosition) => {
        setStartPosition(newPosition);
    };

    // const cartResponsive = {
    //     0: { items: 1 },
    //     576: { items: 2 },
    //     1200: { items: 2 },
    //     1400: { items: 2 },
    //     1600: { items: 2 }
    // };
    var productArray = [];
    if (products.length == 0) {
        linkedProducts.forEach(element => {
            var elementData = element.crosssell_products;
            elementData.forEach(elem => {
                productArray.push(elem);
            });
        });
        if (productArray.length) setProducts(productArray);
    }
    const defaultClasses = mergeClasses(homeClasses, props.classes);

    const productComponents = useMemo(
        () =>
            products &&
            products.map((value, index) => {
                return (
                    <>

                        <Product
                            key={index}
                            defaultClasses={defaultClasses}
                            value={value}
                            closeMiniCart={closeMiniCart}
                            isOpen={isOpen}
                        />
                    </>

                );
            }),
        [defaultClasses, products]
    );

    const responsive1 = {
        0: { autoWidth: true, items: 1, loop: productComponents?.length > 1 },
        // 575: { items: 2 },
        768: { items: 2, loop: productComponents?.length > 2 },
        1200: { items: 3, loop: productComponents?.length > 3 },
        1600: { items: 4, loop: productComponents?.length > 4 }
    };

    const sliderProducts = useMemo(() => {
        return <React.Fragment>
            <div className="slider_product">
                {productComponents &&
                    typeof productComponents != 'undefined' && (
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
                            {productComponents}
                        </OwlCarousel>
                    )}
            </div>
        </React.Fragment>
    }, [products]);



    if (typeof products != 'undefined' && products.length > 0) {
        return (
            <section
                className={
                    'py-3' +
                    ' ' +
                    homeClasses.h_products +
                    ' ' +
                    cartClasses.h_products
                }
            >
                <div className="container-fluid p-0">
                    <div className="row">
                        <div
                            className={
                                homeClasses.h_products_column +
                                ' ' +
                                'col-xs-12 col-lg-12 col-sm-12 col-md-12'
                            }
                        >
                            <div className={homeClasses.section_heading}>
                                <h3
                                    className={
                                        homeClasses.homepage_section_heading
                                    }
                                >
                                    You might also like
                                </h3>
                            </div>
                            {/* <React.Fragment> */}
                            {/* <div className="slider_product"> */}
                            {/* <OwlCarousel
                                        className={
                                            products && products.length >= 4 ? 'owl-theme' +
                                                ' ' +
                                                homeClasses.owl_thme_design +
                                                ' ' +
                                                cartClasses.owl_thme_design : ''

                                        }
                                        // loop={products && products.length >= 4}
                                        rewind={true}
                                        loop={false}
                                        nav={true}
                                        dots={false}
                                        autoplay={false}
                                        autoplayTimeout={2000}
                                        items={isOpen ? 2 : 5}
                                        responsive={
                                            isOpen ? cartResponsive : responsive1
                                        }
                                        startPosition={startPosition}
                                        onChanged={(event) => {
                                            updateCarouselPosition(event.item.index)
                                        }}
                                    >
                                        {productComponents}
                                    </OwlCarousel> */}
                            {sliderProducts}
                            {/* </div> */}
                            {/* </React.Fragment> */}
                            {/* end
                             */}
                        </div>
                    </div>
                </div>
            </section>
        );
    } else {
        return <div />;
    }
};

LinkedProducts.propTypes = {};

export default LinkedProducts;
