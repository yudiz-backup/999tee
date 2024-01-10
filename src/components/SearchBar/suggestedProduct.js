import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { func, number, shape, string } from 'prop-types';
import { Price, useToasts } from '@magento/peregrine';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import { Link, resourceUrl } from 'src/drivers';
import defaultClasses from './suggestedProduct.css';
import getCrossSellProduct from '../../queries/getCrossSellProduct.graphql';
import { useQuery } from '@apollo/client';
import { useProductFullDetail } from '../../peregrine/lib/talons/ProductFullDetail/useProductFullDetail';
import {
    ADD_BUNDLE_MUTATION,
    ADD_CONFIGURABLE_MUTATION,
    ADD_SIMPLE_CUSTOM_MUTATION,
    ADD_SIMPLE_MUTATION
} from '../ProductFullDetail/productFullDetail.gql';
import mapProduct from '@magento/venia-ui/lib/util/mapProduct';
import { useIntl } from 'react-intl';
// import sizeOptions from '../../queries/sizeOptions';
import { useHandleMore } from '../../peregrine/lib/talons/HandleMore/useHandleMore';
import { colorPerRow, plusIcon } from '../Gallery/item';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import preloader from '../../../cenia-static/images/preloader.gif'
// Components
import AddToCartSection from '../AddToCart';
import { globalContext } from '../../peregrine/lib/context/global';
import { handleCartNotification } from '../../util/helperFunction';

const SuggestedProduct = props => {
    const { seeMore, handleMoreColor } = useHandleMore()
    const classes = mergeClasses(defaultClasses, props.classes); // homeClasses,
    const {
        url_key,
        __typename,
        name,
        onNavigate,
        price,
        url_suffix,
        handleSearchTriggerClick,
        id
    } = props;

    const { dispatch } = useContext(globalContext);

    let productUrlSuffix = '';
    if (url_suffix && url_suffix != 'null') {
        productUrlSuffix = url_suffix;
    }

    const handleClick = useCallback(() => {
        if (typeof onNavigate === 'function') {
            onNavigate();
        }
    }, [onNavigate]);
    const [, { addToast }] = useToasts();
    const { data, loading } = useQuery(getCrossSellProduct, {
        variables: {
            id: id
        }
    });

    // const { data: sizesData } = useQuery(sizeOptions);
    // const { sizeoptions } = sizesData || {};
    // const { data: sizeOptionsData = [] } = sizeoptions || {};

    const resultSizeCongifgOption =
        data?.configurableoption?.data?.map(items => items?.configChild?.map(item =>
            item?.configurable_options?.find(items =>
                items?.Attribute_code !== "color")))


    const localStorageAttribute = JSON.parse(localStorage.getItem('attribute'))

    const resultSize =
        localStorageAttribute &&
        Object.values(localStorageAttribute)?.length &&
        Object.values(localStorageAttribute).find(item => item.Attribute_id === (resultSizeCongifgOption && resultSizeCongifgOption[0] && resultSizeCongifgOption[0][0]?.Attribute_id))

    const uniqueSize = data?.configurableoption?.__typename === 'ConfigurableOption' && resultSize &&
        resultSize.attribute_options &&
        resultSize.attribute_options.length &&
        resultSize.attribute_options.map(item => item.label).filter(item => item !== null) || []

    const uniqueSizeValueId = data?.configurableoption?.__typename === 'ConfigurableOption' && resultSize &&
        resultSize.attribute_options &&
        resultSize.attribute_options.length &&
        resultSize.attribute_options.map(item => item.value).filter(item => item !== null) || [];

    const talonProps = useProductFullDetail({
        addConfigurableProductToCartMutation: ADD_CONFIGURABLE_MUTATION,
        addSimpleProductToCartMutation: ADD_SIMPLE_MUTATION,
        addSimpleCustomMutation: ADD_SIMPLE_CUSTOM_MUTATION,
        addBundleProductToCartMutation: ADD_BUNDLE_MUTATION,
        product: data
            ? mapProduct(
                data.configurableoption.data &&
                data.configurableoption.data[0]
            )
            : {}
    });
    const {
        handleAddToCart,
        handleSelectionChange,
        isAddingItem,
        success,
        errorMessage
    } = talonProps;
    const { formatMessage } = useIntl();
    const [simpleimageFile, setsimpleImageFile] = useState([]);

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
    }, [success, isAddingItem, errorMessage, addToast, name, formatMessage, dispatch]);

    const initialValue = {
        allColor: [],
        allSize: [],
        allImage: [],
        uniqueColorId: [],
        uniqueColorAttrId: [],
        uniqueSizeId: [],
        uniqueSizeAttrId: []
    };
    useEffect(() => {
        if (data && data.configurableoption && data.configurableoption.data) {
            data.configurableoption.data.map((product) => {
                if (product.type === 'simple') {
                    setsimpleImageFile(product.image)
                }
            })
        }
    }, [data])
    const uniqueConfigFileReduced = useMemo(() => {
        if (
            !data ||
            (!data.configurableoption && !data.configurableoption.data)
        )
            return initialValue;
        return data.configurableoption.data.reduce(
            (prev, product) => {
                const allColor = product.type === 'configurable' ? product.configChild.map(
                    color_code =>
                        color_code?.configurable_options?.map(attId => attId)?.filter(item =>
                            item?.Attribute_code === 'color')[0]?.attribute_options[0]?.code
                ) : ''
                const uniqueColorId = product.type === 'configurable' ? product.configChild.map(
                    color_code =>
                        color_code?.configurable_options?.map(attId => attId)?.filter(item =>
                            item?.Attribute_code === 'color')[0]?.attribute_options[0]?.value
                ) : ''
                const uniqueColorAttrId = product.type === 'configurable' ? product.configChild.map(
                    color_code => color_code?.configurable_options?.map(attId => attId)?.filter(item =>
                        item.Attribute_code === 'color')[0].Attribute_id
                ) : ''
                const allSize = product.type === 'configurable' ? product.configChild.map(
                    color_code =>
                        color_code?.configurable_options?.map(attId => attId)?.filter(item =>
                            item?.Attribute_code !== 'color')[0]?.attribute_options[0]?.code
                ) : ''
                const uniqueSizeId = product.type === 'configurable' ? product.configChild.map(
                    color_code =>
                        color_code?.configurable_options?.map(attId => attId)?.filter(item =>
                            item?.Attribute_code !== 'color')[0]?.attribute_options[0]?.value
                ) : ''
                const uniqueSizeAttrId = product.type === 'configurable' ? product.configChild.map(
                    color_code => color_code?.configurable_options?.map(attId => attId)?.filter(item =>
                        item.Attribute_code !== 'color')[0]?.Attribute_id
                ) : ''
                const allImage = product.type === 'configurable' ? product.configChild.filter(
                    (value, index, self) =>
                        index ===
                        self.findIndex(
                            (t) => {
                                const hashCode = t && t.configurable_options && t.configurable_options.map(attId => attId)[0].attribute_options[0].code
                                const valueHashCode = value && value.configurable_options && value.configurable_options.map(attId => attId)[0].attribute_options[0].code
                                return hashCode === valueHashCode

                            })
                ) : ''
                // product.type === 'simple' && setsimpleImageFile(product.image)

                const merged = { ...prev };
                merged.allColor.push([...new Set(allColor)]);
                merged.allSize.push([...new Set(allSize)]);
                merged.allImage.push([...new Set(allImage)]);
                merged.uniqueColorId.push([...new Set(uniqueColorId)]);
                merged.uniqueColorAttrId.push([...new Set(uniqueColorAttrId)]);
                merged.uniqueSizeId.push([...new Set(uniqueSizeId)]);
                merged.uniqueSizeAttrId.push([...new Set(uniqueSizeAttrId)]);

                return merged;
            },
            {
                allColor: [],
                allSize: [],
                allImage: [],
                uniqueColorId: [],
                uniqueColorAttrId: [],
                uniqueSizeId: [],
                uniqueSizeAttrId: []
            }
        );
    }, [data, initialValue]);
    const inStockSize =
        uniqueConfigFileReduced &&
            uniqueConfigFileReduced.allSize &&
            uniqueConfigFileReduced.allSize.length
            ? uniqueConfigFileReduced.allSize[0]
            : [];

    const image_file =
        !loading &&
        uniqueConfigFileReduced.allImage.map(images =>
            images.map(img => img.configImage)
        );
    const [imageFile, setImageFile] = useState(!loading && image_file[0][0]);
    const [colorFile, setColorFile] = useState(
        !loading && uniqueConfigFileReduced.uniqueColorId[0][0]
    );
    const [isImg, setIsImg] = useState(false);


    useEffect(() => {
        if (!loading && !isImg) {
            setImageFile(image_file[0][0]);
            setColorFile(uniqueConfigFileReduced?.uniqueColorId[0][0]);
            setIsImg(true);
        }
    }, [image_file, uniqueConfigFileReduced, loading, isImg]);
    const [selectColor, setSelectColor] = useState(0);

    // Color hanldeClick
    const colorHandleClick = (index, attrID) => {
        setImageFile(image_file[0][index]);
        setColorFile(+uniqueConfigFileReduced.uniqueColorId[0][index]);
        handleSelectionChange(attrID[0], colorFile);
        setSelectColor(index);
    };

    //Size handleClick
    const sizeHandleClick = index => {
        handleSelectionChange(
            uniqueConfigFileReduced.uniqueSizeAttrId[0][0],
            +uniqueSizeValueId[index]
        );
        handleAddToCart({
            quantity: 1,
            customSelections: {
                optionId:
                    data.configurableoption.data &&
                    data.configurableoption.data[0],
                selection: uniqueSizeValueId[index],
                colorFile: colorFile
            }
        });
    };

    // Item Colors
    const item_color = (
        <>
            {uniqueConfigFileReduced.allColor &&
                uniqueConfigFileReduced.allColor.map((item, index) => {
                    const colorArr = seeMore.includes(id) ? item : item.slice(0, colorPerRow)
                    return <div key={index} className={classes.colors_wrap}>
                        {colorArr.map((color, index) => (
                            <div
                                className={
                                    selectColor === index
                                        ? classes.colors_box
                                        : classes.colors_inner_unselect
                                }
                                key={index}
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        colorHandleClick(
                                            index,
                                            uniqueConfigFileReduced.uniqueColorAttrId
                                        )
                                    } //,configOptions.attribute_id
                                    className={classes.colors_inner}
                                    style={{
                                        backgroundColor: color,
                                        width: 20,
                                        height: 20
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                }
                )}
        </>
    );

    //Item Sizes
    const item_size = (
        <>
            <ul
                className={
                    classes.size_wrap + ' ' + classes.suggested_size_wrap
                }
            >
                {uniqueSize.map((size, index) => (
                    <li key={index}>
                        <button
                            type="button"
                            onClick={() => {
                                if (inStockSize.includes(size)) {
                                    sizeHandleClick(index);
                                }
                            }}
                            className={
                                inStockSize.includes(size)
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

    const uri = useMemo(() => resourceUrl(`/${url_key}${productUrlSuffix}`), [
        url_key,
        productUrlSuffix
    ])
    const Loader = () => {
        return (
            <>
            </>
        )
    }

    const imageUrl = imageFile || (simpleimageFile?.length !== 0 && simpleimageFile) || preloader;
    const isImageLoaded = !!imageFile || !!simpleimageFile;
    return (
        <>
            <div className={classes.noo_product_image}>
                <Link
                    className={classes.root}
                    to={uri}
                    onClick={v => {
                        handleClick(v);
                        handleSearchTriggerClick(v);
                    }}>
                    <LazyLoadImage
                        src={imageUrl}
                        beforeLoad={Loader}
                        showLowResImages={true}
                        threshold={10}
                        placeholder={
                            <img
                                src={imageUrl}
                                className="product_image"
                                height={isImageLoaded ? '300' : '50'}
                                width={isImageLoaded ? '300' : '50'}
                                loading="lazy"
                            />
                        }
                        height={isImageLoaded ? '300' : '50'}
                        width={isImageLoaded ? '300' : '50'}
                    />
                </Link>
                {
                    __typename === 'ConfigurableProduct' && uniqueSize?.length !== 0 && <>
                        {item_size}
                    </>
                }
            </div>
            <div className={classes.product_details_Wrap}>
                <div className={classes.name}>
                    <Link
                        to={uri}
                        onClick={v => {
                            handleClick(v);
                            handleSearchTriggerClick(v);
                        }}
                    >
                        {name}
                    </Link>
                </div>

                <div className={classes.price}>
                    <Price
                        currencyCode={price?.regularPrice?.amount?.currency || "INR"}
                        value={price.regularPrice.amount.value}
                    />
                </div>
            </div>
            {
                __typename === 'SimpleProduct' && (__typename === 'ConfigurableProduct' && uniqueSize?.length !== 0)
                    ?
                    <div className={defaultClasses.colors_stars_wrap}>
                        <AddToCartSection product={props} uniqueSize={uniqueSize} __typename={__typename}/>
                    </div>
                    : <>
                        <div className={defaultClasses.colors_stars_wrap}>
                            {item_color}
                            {!seeMore.includes(id) && uniqueConfigFileReduced.allColor[0] && colorPerRow < uniqueConfigFileReduced.allColor[0].length && (
                                <h5
                                    // className={classes.loadmore}
                                    onClick={(e) => handleMoreColor(id, e)}
                                >
                                    {plusIcon}
                                </h5>
                            )}
                        </div>
                    </>
            }

        </>
    );
};

SuggestedProduct.propTypes = {
    url_key: string.isRequired,
    small_image: string.isRequired,
    name: string.isRequired,
    onNavigate: func,
    price: shape({
        regularPrice: shape({
            amount: shape({
                currency: string,
                value: number
            })
        })
    }).isRequired,
    classes: shape({
        root: string,
        image: string,
        name: string,
        price: string,
        thumbnail: string
    })
};

export default SuggestedProduct;
