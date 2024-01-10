import React from 'react';
import defaultClasses from './home.css';
import { Link } from 'src/drivers';
import OwlCarousel from 'react-owl-carousel';
import redesignCss from '../../components/asset/changes.css'
export default function FeaturedProduct({ featuredInfo }) {
    const responsive1 = {
        0: { autoWidth:true, loop:true, items: 1 },
        // 575: { items: 2 },
        768: { items: 2 },
        1200: { items: 3 },
    };
    return (
        <div className={defaultClasses.featured_product}>
            <div className="homepage_sections_head container-fluid">
                <h2 className="homepage_section_heading">Featured Product</h2>
            </div>
            <div className="container-fluid">
                <div className={redesignCss.feature_slider}>
                    <OwlCarousel
                        className={
                            'owl-theme' + ' ' + defaultClasses.owl_thme_design
                        }
                        // loop={false}
                        rewind={false}
                        margin={10}
                        nav={true}
                        dots={false}
                        autoplay={false}
                        autoplayTimeout={2000}
                        // items={4}
                        responsive={responsive1}
                        smartSpeed={1000}
                    >
                        {featuredInfo
                            ?.sort((a, b) => b?.id - a?.id)
                            ?.map(item => (
                                <div
                                    className={
                                        defaultClasses.products_grid_item +
                                        ' ' +
                                        'h-100'
                                    }
                                >
                                    <div
                                        className={
                                            defaultClasses.noo_product_item +
                                            ' ' +
                                            'h-100'
                                        }
                                    >
                                        <div
                                            className={
                                                defaultClasses.noo_product_inner +
                                                ' ' +
                                                'h-100'
                                            }
                                        >
                                            <div
                                                className={
                                                    defaultClasses.noo_product_image
                                                }
                                            >
                                                {/* <Link to="/women.html"> */}
                                                <Link to={item?.link}>
                                                    <img
                                                        src={item?.image}
                                                        alt="linked products"
                                                        className="product_image"
                                                        title=""
                                                    />
                                                </Link>
                                            </div>
                                            <div
                                                className={
                                                    defaultClasses.noo_details_wrapper
                                                }
                                            >
                                                <h3
                                                    className={
                                                        defaultClasses.product_name
                                                    }
                                                >
                                                    <Link to={item?.link}>
                                                        {item?.title}
                                                    </Link>
                                                </h3>
                                                <div
                                                    className={
                                                        defaultClasses.vendor_price_wrap +
                                                        ' ' +
                                                        defaultClasses.vendor_price_wrap_item
                                                    }
                                                >
                                                    {/* <span className={defaultClasses.price}>WOMENS</span> */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </OwlCarousel>


                    <OwlCarousel
                        className={
                            'owl-theme' + ' ' + defaultClasses.owl_thme_design
                        }
                        // loop={false}
                        rewind={false}
                        margin={10}
                        nav={true}
                        dots={false}
                        autoplay={false}
                        autoplayTimeout={2000}
                        // items={4}
                        responsive={responsive1}
                        smartSpeed={1000}
                    >
                    </OwlCarousel>
                </div>
            </div>
        </div>
    );
}
