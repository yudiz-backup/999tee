import React, { useEffect, useMemo, useState } from 'react'; //Suspense, , { useState, useEffect, useRef }
import linkedProductsGraphql from '../../queries/linkedProducts.graphql';
import {
    //useCategoryAddToCart,
    useLinkedProduct
    // useProductFullDetail
} from '../../peregrine/lib/talons/ProductFullDetail/useProductFullDetail';
import OwlCarousel from 'react-owl-carousel';

import 'owl.carousel/dist/assets/owl.carousel.css';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import 'owl.carousel/dist/assets/owl.theme.default.css';
import cedClasses from './productFullDetail.css';
import LinkedProductsItem from './LinkedProductsItem';

export const RelatedProducColors = (props) => {
    const {
        uniqueColorAttributeId,
        product,
        onColorClick,
        setSelectColor,
        selectColor,
        defaultClasses,
        mappedArr,
    } = props;

    useEffect(() => {
        if (!selectColor && mappedArr?.length) {
            setSelectColor(mappedArr[0])
        }
    }, [mappedArr])

    const colorHandleClick = index => {
        const productItemData = product && product[index];
        let newImageSrc = '';
        if (productItemData) {
            newImageSrc =
                productItemData.relatedchildImage ||
                productItemData.upsellchildImage;
        }

        onColorClick({
            imageSrc: newImageSrc,
            attrId:
                productItemData?.configurable_options?.map(attId =>
                    attId)?.filter(item =>
                        item.Attribute_code === 'color')[0].Attribute_id,
            valueId:
                productItemData?.configurable_options?.map(attId =>
                    attId)?.filter(item =>
                        item.Attribute_code === 'color')[0].attribute_options[0].value
        });
        setSelectColor(productItemData?.configurable_options?.map(attId =>
            attId)?.filter(item =>
                item.Attribute_code === 'color')[0].attribute_options[0].code);
    };

    return (
        mappedArr.map((color, index) => {
            return (
                <div
                    className={
                        selectColor === color
                            ? defaultClasses.colors_box
                            : defaultClasses.colors_inner_unselect
                    }
                >
                    <button
                        onClick={() =>
                            colorHandleClick(index, uniqueColorAttributeId)
                        }
                        className={defaultClasses.colors_inner}
                        style={{
                            backgroundColor: color,
                            width: '20px',
                            height: '20px'
                        }}
                    />
                </div>
            );
        })
    );
};

export const RelatedProducSizes = React.memo(props => {
    const { uniqueColor, uniqueSizeAttributeId, onSizeClick, product, selectColor, productVariantKeys } = props;
    const inStockUniqueSize = product?.filter(item => {
        if (item[productVariantKeys.childStockStatus] !== 'OUT_OF_STOCK' && item?.configurable_options?.length && item.configurable_options.some(element => {
            if (element.Attribute_code === 'color' && element?.attribute_options?.length && element.attribute_options[0].code === selectColor) {
                return true;
            }
            return false;
        })) {
            return true;
        }
        return false;
    }).map(item => {
        if (item?.configurable_options?.length) {
            const resultsizeDetail = item.configurable_options.find(element => (element.Attribute_code !== 'color'))
            if (resultsizeDetail?.attribute_options?.length && resultsizeDetail?.attribute_options[0].code) {
                return resultsizeDetail?.attribute_options[0].code;
            }
        }
        return undefined;
    }).filter(item => item)

    const sizeHandleClick = index => {
        const productItemData = product && product[index];
        onSizeClick({
            attrId:
                productItemData?.configurable_options?.map(attId =>
                    attId)?.filter(item =>
                        item.Attribute_code !== 'color')[0].Attribute_id,
            valueId:
                productItemData?.configurable_options?.map(attId =>
                    attId)?.filter(item =>
                        item.Attribute_code !== 'color')[0].attribute_options[0].value
        });
    };

    return (
        <ul className={cedClasses.size_wrap}>
            {product && uniqueColor && uniqueColor?.length !== 0 &&
                uniqueColor.map((size, index) => (
                    <li>
                        <button
                            type="button"
                            onClick={() => {
                                if (inStockUniqueSize.includes(size)) {
                                    sizeHandleClick(index, uniqueSizeAttributeId)
                                }
                            }} //,configOptions.attribute_id
                            className={
                                inStockUniqueSize.includes(size)
                                    ? ''
                                    : cedClasses.sizes_disable
                            }
                        >
                            {size}
                        </button>
                    </li>
                ))}
        </ul>
    );
});

const LinkedProducts = props => {
    const { sku, title, type, suffix } = props;
    let product_url_suffix = '';
    if (suffix && suffix != 'null') {
        product_url_suffix = suffix;
    }

    const [startPosition, setStartPosition] = useState(0);
    const updateCarouselPosition = (newPosition) => {
        setStartPosition(newPosition);
    };

    const defaultClasses = mergeClasses(cedClasses, props.classes);
    const { relatedProducts, upsell_products } = useLinkedProduct({
        query: linkedProductsGraphql,
        sku: sku
    });

    let linkedProducts;
    if (type == 'related') {
        linkedProducts = relatedProducts;
    } else if (type == 'upsell') {
        linkedProducts = upsell_products;
    }

    const responsive1 = {
        0: { autoWidth: true, items: 1, loop: linkedProducts?.length > 1 },
        // 575: { items: 2 },
        768: { items: 2, loop: linkedProducts?.length > 2 },
        1200: { items: 3, loop: linkedProducts?.length > 3 },
        1600: { items: 4, loop: linkedProducts?.length > 4 }
    };

    //Color &  Size

    const uniqueColorFileReduced =
        linkedProducts &&
        linkedProducts.reduce(
            (prev, product) => {
                const childKey =
                    type === 'related' ? 'relatedChild' : 'upsellChild';
                const allColor = product.type === 'configurable' ? product[childKey].map(
                    color_code => color_code?.configurable_options?.map(attId => attId).filter(item => item.Attribute_code === 'color')[0].attribute_options[0].code
                ) : ''
                const allSize = product.type === 'configurable' ? product[childKey].map(
                    color_code => color_code?.configurable_options?.map(attId => attId).filter(item => item.Attribute_code !== 'color')[0]?.attribute_options[0]?.code
                ) : ''
                const merged = { ...prev };
                merged.allColor.push([...new Set(allColor)]);
                merged.allSize.push([...new Set(allSize)]);
                return merged;
            },
            { allColor: [], allSize: [] }
        );
    // keep old imageFile track to find difference and re-render OwlCarousel

    const sliderProducts = useMemo(() => {
        return <React.Fragment>
            {linkedProducts &&
                typeof linkedProducts != 'undefined' && (
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
                        {linkedProducts?.map(
                            (value, lProductIndex) => {
                                return (
                                    <LinkedProductsItem
                                        product={value}
                                        productType={type}
                                        defaultClasses={
                                            defaultClasses
                                        }
                                        lProductIndex={
                                            lProductIndex
                                        }
                                        uniqueColorFileReduced={
                                            uniqueColorFileReduced
                                        }
                                        product_url_suffix={
                                            product_url_suffix
                                        }
                                    />
                                );
                            }
                        )}
                    </OwlCarousel>
                )}
        </React.Fragment>
    }, [linkedProducts])

    if (typeof linkedProducts != 'undefined' && linkedProducts.length > 0) {
        return (
            <section className={cedClasses.h_products + ' ' + 'mb-3'}>
                <div className={'container-fluid'}>
                    <div className="row">
                        <div className="'col-xs-12 col-lg-12 col-sm-12 col-md-12'">
                            <div className="homepage_sections_head">
                                <h2 className="homepage_section_heading">
                                    {title}
                                </h2>
                            </div>
                            {/* <React.Fragment>
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
                                    {linkedProducts.map(
                                        (value, lProductIndex) => {
                                            return (
                                                <LinkedProductsItem
                                                    product={value}
                                                    productType={type}
                                                    defaultClasses={
                                                        defaultClasses
                                                    }
                                                    lProductIndex={
                                                        lProductIndex
                                                    }
                                                    uniqueColorFileReduced={
                                                        uniqueColorFileReduced
                                                    }
                                                    product_url_suffix={
                                                        product_url_suffix
                                                    }
                                                />
                                            );
                                        }
                                    )}
                                </OwlCarousel>
                            </React.Fragment> */}
                            {sliderProducts}
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
