import React, { useState, useEffect, Suspense, useContext } from 'react';
import defaultClasses from '../CedHome/home.css';
import { useProductFullDetail } from '../../peregrine/lib/talons/ProductFullDetail/useProductFullDetail';
import {
    ADD_BUNDLE_MUTATION,
    ADD_CONFIGURABLE_MUTATION,
    ADD_SIMPLE_CUSTOM_MUTATION
} from '../ProductFullDetail/productFullDetail.gql';
import ADD_SIMPLE_MUTATION from '../../queries/addSimpleProductsToCart.graphql';
import mapProduct from '@magento/venia-ui/lib/util/mapProduct';
import { useToasts } from '@magento/peregrine';
import { useIntl } from 'react-intl';
import { Link, resourceUrl } from 'src/drivers';
import { useHandleMore } from '../../peregrine/lib/talons/HandleMore/useHandleMore';
import { colorPerRow, plusIcon } from '../Gallery/item';
const Wishlist = React.lazy(() => import('../MyWishlist/wishlist'));
import AddToCartSection from '../AddToCart';
import { handleCartNotification } from '../../util/helperFunction';
import { globalContext } from '../../peregrine/lib/context/global';

export default function SaleProduct(props) {
    const { seeMore, handleMoreColor } = useHandleMore();
    const { value } = props;
    const { sizeAtrr = [], variants = [], colors = [] } = value || {};
    const localStorageAttribute = JSON.parse(localStorage.getItem('attribute'));
    const resultSize =
        sizeAtrr &&
        sizeAtrr.length &&
        localStorageAttribute &&
        Object.values(localStorageAttribute).length &&
        Object.values(localStorageAttribute).find(
            item => item.Attribute_id === sizeAtrr[0]
        );

    const [itemElements, setItemElements] = useState();

    const { dispatch } = useContext(globalContext);

    const uniqueSize =
        value.type === 'configurable' &&
        resultSize &&
        resultSize.attribute_options &&
        resultSize.attribute_options.length &&
        resultSize.attribute_options
            .map(item => item.label)
            .filter(item => item !== null);
    const uniqueSizeValueId =
        value.type === 'configurable' &&
        resultSize &&
        resultSize.attribute_options &&
        resultSize.attribute_options.length &&
        resultSize.attribute_options
            .map(item => item.value)
            .filter(item => item !== null);

    const talonProps = useProductFullDetail({
        addConfigurableProductToCartMutation: ADD_CONFIGURABLE_MUTATION,
        addSimpleProductToCartMutation: ADD_SIMPLE_MUTATION,
        addSimpleCustomMutation: ADD_SIMPLE_CUSTOM_MUTATION,
        addBundleProductToCartMutation: ADD_BUNDLE_MUTATION,
        product: mapProduct(value)
    });

    const {
        handleAddToCart,
        handleSelectionChange,
        isAddingItem,
        success,
        errorMessage
    } = talonProps;

    const [, { addToast }] = useToasts();
    const { formatMessage } = useIntl();

    useEffect(() => {
        if (success && !isAddingItem) {
            // addToast({
            //     type: 'info',
            //     message:
            //         value.name +
            //         formatMessage({
            //             id: 'cart.message',
            //             defaultMessage: ' added to the cart.'
            //         }),
            //     dismissable: true,
            //     timeout: 5000
            // });
            handleCartNotification(true, dispatch, value?.name)
        }
        if (errorMessage && !isAddingItem) {
            addToast({
                type: 'error',
                message: errorMessage ? errorMessage : 'error',
                dismissable: true,
                timeout: 5000
            });
        }
    }, [addToast, success, errorMessage, isAddingItem, formatMessage, dispatch, value]);

    const [selectColor, setSelectColor] = useState(0);

    const image_file =
        value.type === 'configurable' &&
        value.uniqueProductItem &&
        value.uniqueProductItem.map(images => images.childImage);
    const color_file =
        value.uniqueProductItem &&
        value.uniqueProductItem.map(
            images =>
                images.configurable_options
                    .map(attId => attId)
                    .filter(item => item.Attribute_code === 'color')[0]
                    .attribute_options[0].value
        );

    const [imageFile, setImageFile] = useState(image_file[0]);
    const [colorFile, setColorFile] = useState(color_file[0]);

    const colorHandleClick = index => {
        setImageFile(image_file[index]);
        setColorFile(color_file[index]);
        handleSelectionChange(value.colorAttr[0], colorFile);
        setSelectColor(index);
    };

    const sizeHandleClick = index => {
        handleSelectionChange(value.sizeAtrr[0], +uniqueSizeValueId[index]);
        handleAddToCart({
            quantity: 1,
            customSelections: {
                optionId: +value.sizeAtrr[0],
                selection: +uniqueSizeValueId[index],
                colorFile: +colorFile
            }
        });
    };

    const inStockUniqueSize = [];
    if (variants?.length) {
        variants.forEach(variantItem => {
            if (variantItem?.configurable_options?.length) {
                const sizeConfigurableDetail = variantItem.configurable_options.find(
                    i => i.Attribute_code !== 'color'
                );
                if (sizeConfigurableDetail?.attribute_options?.[0]?.code) {
                    const sizeValue =
                        sizeConfigurableDetail.attribute_options[0].value;
                    if (!inStockUniqueSize.some(i => i.value === sizeValue)) {
                        inStockUniqueSize.push(
                            sizeConfigurableDetail.attribute_options[0]
                        );
                    }
                }
            }
        });
    }

    const checkProductInStock = sizeArgument => {
        const resultSizeDetail = inStockUniqueSize.find(
            item => item?.code === sizeArgument
        );
        if (resultSizeDetail?.value) {
            const resultVariant = variants.find(variantItem =>
                variantItem?.configurable_options?.every(
                    i =>
                        (i?.Attribute_code === 'color' &&
                            i?.attribute_options?.some(
                                attributeItem =>
                                    attributeItem.code === colors[selectColor]
                            )) ||
                        (i?.Attribute_code !== 'color' &&
                            i?.attribute_options?.some(
                                attributeItem =>
                                    attributeItem.value ===
                                    resultSizeDetail?.value
                            ))
                )
            );
            if (
                resultVariant?.childStockStatus === 'IN_STOCK' ||
                resultVariant?.childStockStatus === 'LOW_STOCK'
            ) {
                return true;
            }
        }
        return false;
    };

    useEffect(() => {
        const mappedArr = seeMore.includes(value.id)
            ? value.colors
            : value.colors.slice(0, colorPerRow);
        setItemElements(
            <div className={defaultClasses.colors_wrap}>
                {mappedArr.map((color, index) => (
                    <div
                        key={index}
                        className={
                            selectColor === index
                                ? defaultClasses.colors_box
                                : defaultClasses.colors_inner_unselect
                        }
                    >
                        <button
                            onClick={() => colorHandleClick(index)} //,configOptions.attribute_id
                            className={defaultClasses.colors_inner}
                            style={{
                                backgroundColor: color,
                                width: 20,
                                height: 20
                            }}
                            key={index}
                        />
                    </div>
                ))}
            </div>
        );
    }, [seeMore, value, selectColor]);

    //Item Sizes
    const item_size = (
        <>
            <ul className={defaultClasses.size_wrap}>
                {value.type === 'configurable' &&
                    uniqueSize?.map((size, index) => (
                        <li key={index}>
                            <button
                                type="button"
                                onClick={() => {
                                    if (
                                        value.sizes.includes(size) &&
                                        checkProductInStock(size)
                                    ) {
                                        sizeHandleClick(index);
                                    }
                                }}
                                className={
                                    value.sizes.includes(size) &&
                                        checkProductInStock(size)
                                        ? ''
                                        : defaultClasses.sizes_disable
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
        <div className={defaultClasses.noo_product_inner + ' ' + 'h-100'}>
            <div className={defaultClasses.noo_product_image}>
                <Link to={resourceUrl(value.urlkey)}>
                    <img
                        src={imageFile || value.image}
                        alt="product_name"
                        className="product_image"
                        height="300"
                        width="300"
                        title=""
                    />
                </Link>
                <Suspense fallback={<div>Loading...</div>}>
                    <Wishlist value={value} />
                </Suspense>
                {value.type === 'configurable' && uniqueSize?.length !== 0 ? item_size : ''}
            </div>
            <div className={defaultClasses.noo_details_wrapper}>
                <h3 className={defaultClasses.product_name}>
                    <Link to={resourceUrl(value.urlkey)}>{value.name}</Link>
                </h3>
                {value.type === 'configurable' && (
                    <>
                        <div className={defaultClasses.vendor_price_wrap}>
                            {value.specialPrice ? (
                                <>
                                    <span
                                        className={defaultClasses.specialPrice}
                                    >
                                        ₹
                                        {parseFloat(value.specialPrice).toFixed(
                                            2
                                        )}
                                    </span>
                                    <span
                                        className={defaultClasses.regularPrice}
                                    >
                                        ₹
                                        {parseFloat(value.regularPrice).toFixed(
                                            2
                                        )}
                                    </span>
                                </>
                            ) : (
                                <span>
                                    ₹{parseFloat(value.regularPrice).toFixed(2)}
                                </span>
                            )}
                        </div>
                    </>
                )}

                {value.type === 'simple' && (
                    <>
                        <span>{value.final_price}</span>
                    </>
                )}
                {value.type === 'configurable' ? (
                    <>
                        <div className={defaultClasses.colors_stars_wrap}>
                            {itemElements}
                            <div>
                                {!seeMore.includes(value.id) &&
                                    value &&
                                    value.colors &&
                                    value.colors.length &&
                                    colorPerRow < value.colors.length && (
                                        <h5
                                            onClick={() =>
                                                handleMoreColor(value.id)
                                            }
                                        >
                                            {plusIcon}
                                        </h5>
                                    )}
                            </div>
                        </div>
                    </>
                ) : (
                    <AddToCartSection product={value} />
                )}
            </div>
        </div>
    );
}