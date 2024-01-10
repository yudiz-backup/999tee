import React, { useState, useEffect, Suspense, useContext } from 'react';
import { string, shape } from 'prop-types';
import { Link, resourceUrl } from 'src/drivers';
import Price from '@magento/venia-ui/lib/components/Price';
import { UNCONSTRAINED_SIZE_KEY } from '@magento/peregrine/lib/talons/Image/useImage';
import { useGalleryItem } from '@magento/peregrine/lib/talons/Gallery/useGalleryItem';
import { FormattedMessage, useIntl } from 'react-intl';
import mapProduct from '@magento/venia-ui/lib/util/mapProduct';
import { useStyle } from '../../classify';
import Image from '../Image';
import GalleryItemShimmer from './item.shimmer';
import defaultClasses from './item.css';
import homeClasses from '../CedHome/home.css';
import { useProductFullDetail } from '../../peregrine/lib/talons/ProductFullDetail/useProductFullDetail';
import {
    ADD_SIMPLE_CUSTOM_MUTATION,
    ADD_CONFIGURABLE_MUTATION,
    ADD_SIMPLE_MUTATION,
    ADD_BUNDLE_MUTATION
} from '../ProductFullDetail/productFullDetail.gql';
import { useToasts } from '@magento/peregrine';
// import { useQuery } from '@apollo/client';
// import sizeOptions from '../../queries/sizeOptions';
import { useHandleMore } from '../../peregrine/lib/talons/HandleMore/useHandleMore';
import 'react-lazy-load-image-component/src/effects/blur.css';

// Components
import AddToCartSection from '../AddToCart'
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { globalContext } from '../../peregrine/lib/context/global';
import { handleCartNotification } from '../../util/helperFunction';
const Wishlist = React.lazy(() => import('../MyWishlist/wishlist'));
// The placeholder image is 4:5, so we should make sure to size our product
// images appropriately.
const IMAGE_WIDTH = 300;
const IMAGE_HEIGHT = 375;

// Gallery switches from two columns to three at 640px.
const IMAGE_WIDTHS = new Map()
    .set(640, IMAGE_WIDTH)
    .set(UNCONSTRAINED_SIZE_KEY, 840);

export const colorPerRow = 5;
export const plusIcon = (
    <img
        src={'../../../cenia-static/images/colorIcon.png'}
        height={20}
        width={20}
        alt={'Color'}
    />
);

const GalleryItem = props => {
    // const { data } = useQuery(sizeOptions);
    const { seeMore, handleMoreColor, colorLength } = useHandleMore();
    // const { sizeoptions } = data || {};
    // const { data: sizeOptionsData = [] } = sizeoptions || {};
    const { style, categoryId } = props;
    const { dispatch } = useContext(globalContext);


    // useState
    const [itemElements, setItemElements] = useState();
    const [selectColor, setSelectColor] = useState(0);
    const { handleLinkClick, item } = useGalleryItem(props);
    const resultSizeCongifgOption = item &&
        item.configurable_options &&
        item.configurable_options.find(items => items.attribute_code !== "color")

    const localStorageAttribute = JSON.parse(localStorage.getItem('attribute'))

    const resultSize = resultSizeCongifgOption &&
        resultSizeCongifgOption.attribute_code &&
        localStorageAttribute &&
        Object.values(localStorageAttribute).length &&
        Object.values(localStorageAttribute).find(item => item.Attribute_id === resultSizeCongifgOption.attribute_id)

    const uniqueSize = item.type_id === 'configurable' &&
        resultSize &&
        resultSize.attribute_options &&
        resultSize.attribute_options.length &&
        resultSize.attribute_options.map(item => item.label).filter(item => item !== null) || [];
    const uniqueSizeId = item.type_id === 'configurable' &&
        resultSize &&
        resultSize.attribute_options &&
        resultSize.attribute_options.length &&
        resultSize.attribute_options.map(item => item.value).filter(item => item !== null) || [];

    const classes = useStyle(defaultClasses, homeClasses, props.classes);

    const [imageFile, setImageFile] = useState('');

    const attribute_index_color_value_index =
        item.type_id === 'configurable' &&
        item?.configurable_options?.filter(i =>
            i?.attribute_code === 'color')?.[0]?.['values'].map(i =>
                i?.value_index)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (item.configurable_options) {
            item.configurable_options.forEach(configOptions => {
                if (configOptions.attribute_code == 'color') {
                    colorLength.current = configOptions.values.length;
                    const mappedArr = seeMore.includes(item.id)
                        ? configOptions.values
                        : configOptions.values.slice(0, colorPerRow);
                    setItemElements(
                        mappedArr.map((swatches, index) => {
                            const { value_index } = swatches;
                            const finalStyle = Object.assign({}, style, {
                                backgroundColor: swatches.swatch_data.value
                            });
                            const element = (
                                <div
                                    key={value_index}
                                    className={
                                        selectColor === index
                                            ? classes.colors_box
                                            : classes.colors_inner_unselect
                                    }
                                >
                                    <button
                                        // to={productLink}
                                        onClick={() => {
                                            colorHandleClick(
                                                index,
                                                configOptions.attribute_id
                                            );
                                        }}
                                        // onMouseEnter={() => handleClick(index)}
                                        className={classes.colors_inner}
                                        style={finalStyle}
                                    >
                                        <FormattedMessage
                                            id={'item.colors_inner'}
                                            defaultMessage={'color name'}
                                        />
                                    </button>
                                </div>
                            );
                            return element;
                        })
                    );
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seeMore, item, selectColor]);

    const options_index =
        item.type_id === 'configurable' &&
        item.configurable_options[0].values.map(v => v['value_index']);
    const attribute_index =
        item.type_id === 'configurable' &&
        item.variants.map(i => i.attributes[0].value_index);

    const value_index =
        item.type_id === 'configurable' &&
        options_index.length > 0 &&
        options_index.map(item => attribute_index.filter(i => i === item)[0]);
    const image_file =
        item.type_id === 'configurable' &&
        value_index &&
        value_index.map(
            i =>
                item.variants
                    .map(
                        item =>
                            item.attributes[0].value_index === i &&
                            item.product.media_gallery_entries[0].file
                    )
                    .filter(f => typeof f === 'string')[0]
        );
    useEffect(() => {
        setImageFile(image_file[0]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const colorHandleClick = (index, attrID) => {
        setImageFile(image_file[index]);
        handleSelectionChange(attrID, attribute_index_color_value_index[index]);
        setSelectColor(index);
    };
    // useEffect(() => {
    //    if (optionsIndex) {
    //     const value_index = optionsIndex.length > 0 && optionsIndex.map(
    //         item => attributeIndex && attributeIndex.filter(i => i === item)[0]
    //     );
    //     setValueIndex(value_index)
    //    }
    // // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [optionsIndex]);

    //Image_file

    let productUrlSuffix = '';
    if (item && item.url_suffix) {
        productUrlSuffix = item.url_suffix;
    }

    const [, { addToast }] = useToasts();
    const { formatMessage } = useIntl();
    const talonProps = useProductFullDetail({
        addConfigurableProductToCartMutation: ADD_CONFIGURABLE_MUTATION,
        addSimpleProductToCartMutation: ADD_SIMPLE_MUTATION,
        addSimpleCustomMutation: ADD_SIMPLE_CUSTOM_MUTATION,
        addBundleProductToCartMutation: ADD_BUNDLE_MUTATION,
        product: mapProduct(getProductWithGallery(item))
    });

    function getProductWithGallery(p) {
        return {
            ...p,
            media_gallery_entries:
                p && p.variants
                    ? p.variants.map(e => {
                        return e.product.media_gallery_entries[0];
                    })
                    : []
        };
    }
    const {
        handleAddToCart,
        handleSelectionChange,
        isAddingItem,
        success,
        errorMessage
    } = talonProps;
    // handleAddToCart, success, errorMessage, isAddToCartDisabled

    const { name, price_range, url_key, variants = [] } = item;

    useEffect(() => {
        if (success && !isAddingItem) {
            // addToast({
            //     type: 'info',
            //     message:
            //         name +
            //         formatMessage({
            //             id: 'cart.message',
            //             defaultMessage: ' added to the cart.'
            //         }),
            //     dismissable: true,
            //     timeout: 5000
            // });
            handleCartNotification(true, dispatch, name)
        }
        if (errorMessage && !isAddingItem) {
            addToast({
                type: 'error',
                message: errorMessage ? errorMessage : 'error',
                dismissable: true,
                timeout: 5000
            });
        }
    }, [addToast, success, errorMessage, isAddingItem, name, formatMessage, dispatch]);

    if (!item) {
        return <GalleryItemShimmer classes={classes} />;
    }
    // small_image,id, stock_status

    //Image_file End

    const productLink = resourceUrl(`/${url_key}${productUrlSuffix || ''}`);

    let inStockUniqueSize = [];
    let sizeSwatchLength = 0;
    let sizeAttributeId = '';
    if (item.configurable_options) {
        item.configurable_options.forEach(configOptions => {
            if (configOptions.attribute_code !== 'color') {
                sizeAttributeId = configOptions.attribute_id;
                inStockUniqueSize = configOptions.values.filter(
                    item => item && item.swatch_data && item.swatch_data.value
                );
                sizeSwatchLength = configOptions.values.length;
            }
        });
    }
    const inStockUniqueSizeLabels = inStockUniqueSize
        .filter(item => item && item.swatch_data && item.swatch_data.value)
        .map(item => item.swatch_data.value);

    const sizeHandleClick = index => {
        if (sizeAttributeId) {
            handleSelectionChange(sizeAttributeId, uniqueSizeId[index]);
            handleAddToCart({
                quantity: 1,
                customSelections: {
                    optionId: sizeAttributeId,
                    selection: uniqueSizeId[index],
                    colorName: item?.configurable_options?.filter(i =>
                        i?.attribute_code === 'color')?.[0]?.['values']?.[selectColor]?.label || '' ,
                    colorValue: item?.configurable_options?.filter(i =>
                        i?.attribute_code === 'color')?.[0]?.['values']?.[selectColor]?.swatch_data?.value || '',
                    sizeName: item?.configurable_options?.filter(i =>
                        i?.attribute_code === 'printful_size')?.[0]?.['values']?.[selectColor]?.label || '' ,
                    sizeValue: item?.configurable_options?.filter(i =>
                        i?.attribute_code === 'printful_size')?.[0]?.['values']?.[selectColor]?.swatch_data?.value || ''
                }
            });
        }
    };

    const checkProductInStock = sizeArgument => {
        const resultSizeDetail = inStockUniqueSize.find(
            item =>
                item.swatch_data &&
                item.swatch_data.value &&
                item.swatch_data.value === sizeArgument
        );
        if (
            resultSizeDetail &&
            resultSizeDetail.swatch_data &&
            resultSizeDetail.swatch_data.value
        ) {
            const resultVariant = variants.find(item => {
                if (item && item.attributes) {
                    return (
                        item.attributes.find(
                            attributesItem =>
                                attributesItem.code === 'color' &&
                                attributesItem.value_index ===
                                attribute_index_color_value_index[
                                selectColor
                                ]
                        ) &&
                        item.attributes.find(
                            attributesItem =>
                                attributesItem.code !== 'color' &&
                                attributesItem.value_index ===
                                resultSizeDetail.value_index
                        )
                    );
                }
                return false;
            });
            if ((resultVariant?.product?.stock_status_data?.stock_status === 'IN_STOCK' ||
                resultVariant?.product?.stock_status_data?.stock_status === 'LOW_STOCK')
            ) {
                return true;
            }
        }
        return false;
    };

    //Item Sizes
    const element_size = (
        <>
            <ul className={classes.size_wrap}>
                {uniqueSize.map((size, index) => (
                    <li key={index}>
                        <button
                            type="button"
                            onClick={() => {
                                if (
                                    inStockUniqueSizeLabels.includes(size) &&
                                    checkProductInStock(size)
                                ) {
                                    sizeHandleClick(index);
                                }
                            }}
                            className={
                                inStockUniqueSizeLabels.includes(size) &&
                                    checkProductInStock(size)
                                    ? ''
                                    : classes.sizes_disable
                            }
                        >
                            {size}
                        </button>
                    </li>
                ))}
            </ul>
        </>
    );

    return (
        <div className={classes.root} aria-live="polite" aria-busy="false">
            <div className={classes.noo_product_image}>
                {
                    imageFile || item.small_image.url
                        ? <>

                            <Link
                                onClick={handleLinkClick}
                                to={{ pathname: productLink, state: { categoryId } }}
                                className={classes.images}
                            >
                                <LazyLoadImage
                                    showLowResImages={true}
                                    threshold={10}
                                    alt="hello"
                                    placeholder={<> <Image
                                        alt={name}
                                        classes={{
                                            image: classes.image,
                                            loaded: classes.imageLoaded,
                                            notLoaded: classes.imageNotLoaded,
                                            root: classes.imageContainer
                                        }}
                                        height={IMAGE_HEIGHT}
                                        resource={item.type_id === 'configurable' ? imageFile : item.small_image.url}
                                        widths={IMAGE_WIDTHS}
                                        src=''
                                    /></>}

                                />

                            </Link>
                        </>
                        : <>
                            {/* <div className="text-center" style={{ marginBottom: 25 }}>
                                <img
                                    src={
                                        '/cenia-static/images/priceSummery.gif'
                                    }
                                    className="img-fluid"
                                    alt={''}
                                    height="50"
                                    width="50"
                                />
                            </div> */}
                        </>
                }

                <Suspense fallback={<div>Loading...</div>}>
                    <Wishlist value={item} />
                </Suspense>
                {uniqueSize && uniqueSize.length > 0 && element_size}
            </div>
            <div
                className={
                    classes.noo_details_wrapper +
                    ' ' +
                    classes.new_details_wrapper
                }
            >
                <div
                    className={
                        defaultClasses.add_to_cart_Wrap +
                        ' ' +
                        'position-relative'
                    }
                >
                    {item && item.stock_status != 'IN_STOCK' && (
                        <div className={classes.out_of_stock}>
                            <span>
                                <FormattedMessage
                                    id={'ProductFullDetail.OutOfStock'}
                                    defaultMessage={'This item is out of stock'}
                                />
                            </span>
                        </div>
                    )}
                    {isAddingItem && (
                        <div
                            className={
                                classes.modal +
                                ' ' +
                                classes.modal_active +
                                ' ' +
                                classes.galler_modal_active
                            }
                        >
                            <div className={classes.loader_div}>
                                <div className={classes.ball_pulse}>
                                    <div />
                                    <div />
                                    <div />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <p className={classes.product_name}>
                    <Link
                        onClick={handleLinkClick}
                        to={productLink}
                        className={classes.name}
                    >
                        <span>{name}</span>
                    </Link>
                </p>

                <div
                    className={classes.vendor_price_wrap + ' ' + classes.price}
                >
                    <Price
                        value={price_range.minimum_price.final_price.value}
                        currencyCode={
                            price_range?.minimum_price?.final_price?.currency
                        }
                        price_range={price_range}
                    />
                </div>
                <br />
                {(item.type_id === 'simple' || (item.type_id === 'configurable' && uniqueSize?.length === 0)) ? (
                    <>
                        {/* <div className={wishlistClasses.actions_wrapper}>
                                        <div className={wishlistClasses.btn_style_cart}>
                                            {item.type_id === 'simple' && (
                                                <Link
                                                    to={resourceUrl(
                                                        item["url_key"] +
                                                        productUrlSuffix
                                                    )}
                                                    className={wishlistClasses.add_btn}
                                                >
                                                    <FormattedMessage
                                                        id={"myWishlist.moveToCartBtn"}
                                                        defaultMessage={"Move to cart"}
                                                    />
                                                </Link>
                                            )}
                                            .

                                            
                                        </div>
                                    </div> */}
                        <AddToCartSection product={item} uniqueSize={uniqueSize}/>
                    </>
                ) : (
                    <>
                        <div className={defaultClasses.colors_stars_wrap}>
                            <div className={defaultClasses.colors_wrap}>
                                {itemElements}
                            </div>
                            <div>
                                {!seeMore.includes(item.id) &&
                                    colorLength &&
                                    colorPerRow < colorLength.current && (
                                        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
                                        <h5
                                            // cl assName={classes.loadmore}
                                            onClick={() =>
                                                handleMoreColor(item.id)
                                            }
                                        >
                                            {plusIcon}
                                        </h5>
                                    )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

GalleryItem.propTypes = {
    classes: shape({
        image: string,
        imageLoaded: string,
        imageNotLoaded: string,
        imageContainer: string,
        images: string,
        name: string,
        price: string,
        root: string
    })
};

export default GalleryItem;
