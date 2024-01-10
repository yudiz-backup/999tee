import React, { Suspense, useState, useEffect, useContext } from 'react';
import { string, shape } from 'prop-types';
import { Link, resourceUrl } from 'src/drivers';
import { useProductFullDetail } from '../../peregrine/lib/talons/ProductFullDetail/useProductFullDetail';
import {
    ADD_BUNDLE_MUTATION,
    ADD_CONFIGURABLE_MUTATION,
    ADD_SIMPLE_CUSTOM_MUTATION,
    ADD_SIMPLE_MUTATION
} from '../../components/ProductFullDetail/productFullDetail.gql';
import { useToasts } from '@magento/peregrine';
import defaultClasses from './home.css';
import { mergeClasses } from '../../classify';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';
import { useIntl } from 'react-intl'; //FormattedMessage,
import Price from '@magento/venia-ui/lib/components/Price';
import mapProduct from '@magento/venia-ui/lib/util/mapProduct';

const Wishlist = React.lazy(() => import('../MyWishlist/wishlist'));

// Components
import AddToCartSection from '../AddToCart'
import { globalContext } from '../../peregrine/lib/context/global';
import { handleCartNotification } from '../../util/helperFunction';

const Product = props => {
    // const { data } = useQuery(sizeOptions);
    // const { sizeoptions } = data || {};
    // const { data: sizeOptionsData = [] } = sizeoptions || {};
    const { dispatch } = useContext(globalContext);

    const classes = mergeClasses(defaultClasses, props.classes);
    const { value, /* config, */ index } = props;

    const [, { addToast }] = useToasts();
    // let productUrlSuffix = '';

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
    } = talonProps; //handleAddToCart,
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
    }, [
        success,
        isAddingItem,
        errorMessage,
        addToast,
        value.name,
        formatMessage,
        dispatch
    ]);

    // if (config.product_url_suffix && config.product_url_suffix != 'null') {
    //     productUrlSuffix = config.product_url_suffix;
    // }

    const resultSizeCongifgOption = value?.latestChild?.length &&
        value.latestChild[0].configurable_options?.length &&
        value.latestChild[0].configurable_options.find(items =>
            items.Attribute_code !== "color")

    const localStorageAttribute = JSON.parse(localStorage.getItem('attribute'))

    //Color
    const color = value.type === 'configurable' && value.latestChild.map(
        color_code => color_code.configurable_options &&
            color_code.configurable_options.map(attId => attId).filter(item => item.Attribute_code === 'color')[0].attribute_options[0].code
    );
    const uniqueColor = value.type === 'configurable' && [...new Set(color)];
    const colorValueId = value.type === 'configurable' && value.latestChild.map(
        value_id => value_id.configurable_options &&
            value_id.configurable_options.map(attId => attId).filter(item => item.Attribute_code === 'color')[0].attribute_options[0].value
    );
    const uniqueColorId = value.type === 'configurable' && [...new Set(colorValueId)];
    const color_attribute_id = value.type === 'configurable' && value.latestChild.map(
        value_id => value_id.configurable_options &&
            value_id.configurable_options.map(attId => attId).filter(item => item.Attribute_code === 'color')[0].Attribute_id
    );
    const uniqueColorAttributeId = value.type === 'configurable' && [...new Set(color_attribute_id)];

    const [colorFile, setColorFile] = useState(uniqueColorId[0]);
    //Size

    const resultSize = resultSizeCongifgOption?.Attribute_id &&
        localStorageAttribute &&
        Object.values(localStorageAttribute)?.length &&
        Object.values(localStorageAttribute).find(item => item.Attribute_id === resultSizeCongifgOption.Attribute_id)

    const inStockUniqueSize = value.type === 'configurable' &&
        value?.latestChild?.length &&
        value.latestChild.filter(item => {
            if (item.latestchildstockstatus !== 'OUT_OF_STOCK' && item?.configurable_options?.length && item.configurable_options.some(element => {
                if (element.Attribute_code === 'color' && element?.attribute_options?.length && element.attribute_options[0].value === colorFile) {
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

    const uniqueSizeId = value.type === 'configurable' &&
        resultSize?.attribute_options?.length &&
        resultSize.attribute_options.map(item => item.value).filter(item => item !== null) || [];

    const uniqueSize = value.type === 'configurable' &&
        resultSize?.attribute_options?.length &&
        resultSize.attribute_options.map(item => item.label).filter(item => item !== null) || [];

    //image
    const uniqueColorImage = value.type === 'configurable' ? value.latestChild.filter(
        (value, index, self) =>
            index ===
            self.findIndex(
                (t) => {
                    const hashCode = t && t.configurable_options && t.configurable_options.map(attId => attId)[0].attribute_options[0].code
                    const valueHashCode = value && value.configurable_options && value.configurable_options.map(attId => attId)[0].attribute_options[0].code
                    return hashCode === valueHashCode

                })
    ) : [];

    const image_file = value.type === 'configurable' && uniqueColorImage.map(image => image.latestchildImage);

    const [imageFile, setImageFile] = useState(image_file[0]);
    const [selectColor, setSelectColor] = useState(0);

    // const selectedColorCode = uniqueColor[selectColor]
    // const selectedColorDetail = selectedColorCode&& value && value.type === 'configurable' &&value.latestChild && value.latestChild.length ?
    //     value.latestChild.find(color_code => color_code.configurable_options &&
    //         color_code.configurable_options.map(attId => attId).filter(item => item.Attribute_code === 'color')[0].attribute_options[0].code === selectedColorCode) :
    //     undefined;

    //Color hanldeClick
    const colorHandleClick = (index, attrID) => {
        setImageFile(image_file[index]);
        setColorFile(+uniqueColorId[index]);
        handleSelectionChange(attrID[0], colorFile);
        setSelectColor(index);
    };

    //Size handleClick
    const sizeHandleClick = index => {

        const latestChildDetails = value?.latestChild?.length ? value?.latestChild.find(
            item => (
                item?.configurable_options?.length &&
                item?.configurable_options?.every(element => {
                    if ((element?.Attribute_code === 'color' && element?.attribute_options?.length && element?.attribute_options[0].value === colorFile) || (element?.Attribute_code !== 'color' && element?.attribute_options?.length && element?.attribute_options[0].value === uniqueSizeId[index])) {
                        return true;
                    }
                    return false;
                })
            )
        ) : undefined;

        const latestChildSizeDetail = latestChildDetails?.configurable_options?.length && latestChildDetails.configurable_options.find(element => {
            if (element.Attribute_code !== 'color') {
                return true;
            }
            return false;
        })

        if (latestChildSizeDetail?.Attribute_id) {
            handleSelectionChange(
                latestChildSizeDetail?.Attribute_id,
                +uniqueSizeId[index]
            );
            handleAddToCart({
                quantity: 1,
                customSelections: {
                    optionId: latestChildSizeDetail,
                    selection: uniqueSizeId[index],
                    colorFile: colorFile
                }
            });
        }
    };

    //Item Colors
    const element = (
        <>
            {value.type === 'configurable' && uniqueColor.map((color, index) => (
                <div
                    key={index}
                    className={
                        selectColor === index
                            ? classes.colors_box
                            : classes.colors_inner_unselect
                    }
                >
                    <button
                        onClick={() =>
                            colorHandleClick(index, uniqueColorAttributeId)
                        } //,configOptions.attribute_id
                        className={classes.colors_inner}
                        style={{
                            backgroundColor: color,
                            width: '20px',
                            height: '20px'
                        }}
                    />
                </div>
            ))}
        </>
    );

    //Item Sizes
    const element_size = (
        <>
            <ul className={classes.size_wrap}>
                {value.type === 'configurable' && uniqueSize.map((size, index) => (
                    <li key={index}>
                        <button
                            type="button"
                            onClick={() => {
                                if (inStockUniqueSize.includes(size)) {
                                    sizeHandleClick(index);
                                }
                            }} //,configOptions.attribute_id
                            className={
                                inStockUniqueSize.includes(size)
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
        <>
            <div key={index} className="item h-100">
                <div className={defaultClasses.products_grid_item + ' ' + 'h-100'}>
                    <div className={defaultClasses.noo_product_item + ' ' + 'h-100'}>
                        <div className={defaultClasses.noo_product_inner + ' ' + 'h-100'} >
                            <div className={defaultClasses.noo_product_image}>
                                <Link
                                    to={resourceUrl(
                                        value['urlkey']
                                    )}
                                >
                                    <img
                                        src={value.type === 'configurable' && imageFile ? imageFile : value.image}
                                        alt={value.name}
                                        className="product_image"
                                        height="300"
                                        width="300"
                                        title=''
                                    />
                                </Link>
                                {
                                    value.type === 'configurable' && uniqueSize?.length !== 0 && element_size
                                }
                                {/* <Suspense fallback={''}> */}
                                <Wishlist value={value} />
                                {/* </Suspense> */}
                            </div>
                            <div className={defaultClasses.desc_wrapper}>
                                <div className={defaultClasses.noo_details_wrapper}>
                                    <h3 className={defaultClasses.product_name}>
                                        <Link
                                            to={resourceUrl(
                                                value['urlkey']
                                            )}
                                        >
                                            {value.name}
                                        </Link>
                                    </h3>
                                    <div className={defaultClasses.vendor_price_wrap}>
                                        <div className={defaultClasses.price}>
                                            <Price
                                                value={value?.price_range.minimum_price?.final_price?.value}
                                                currencyCode={
                                                    value?.price_range?.minimum_price?.final_price?.currency || "INR"
                                                }
                                                price_range={value?.price_range}
                                            />
                                        </div>
                                    </div>
                                    {
                                        (value.type === 'configurable' && uniqueSize?.length !== 0) && <div className={classes.colors_wrap}>{element}</div>
                                    }

                                </div>
                                {
                                    (value.type === 'simple' || (value.type === 'configurable' && uniqueSize?.length === 0)) && <div className={defaultClasses.add_to_cart_section}>
                                        <AddToCartSection product={value} uniqueSize={uniqueSize} />
                                    </div>
                                }
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </>
    );
};

Product.propTypes = {
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

export default Product;
