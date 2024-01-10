import React, { useState, useEffect, Suspense, useContext } from 'react';
import { Link, resourceUrl } from 'src/drivers';
import {
    useAddItemToWishlist,
    useProductFullDetail
} from '../../peregrine/lib/talons/ProductFullDetail/useProductFullDetail';
import ADD_SIMPLE_MUTATION from '../../queries/addSimpleProductsToCart.graphql';
import ADD_TO_WISHLIST_MUTATION from '../../queries/addItemToWishlist.graphql';
import REMOVE_FROM_WISHLIST_MUTATION from '../../queries/removeFromWishlist.graphql';
import WishListQuery from '../../queries/getWishlist.graphql';
import {
    useWishlist,
    useDeleteFromWishlist
} from '../../peregrine/lib/talons/MyAccount/useDashboard';
import { useToasts, Price } from '@magento/peregrine';
import { gql, useQuery } from '@apollo/client';
import { ProductListingFragment } from '../CartPage/ProductListing/productListingFragments';
import defaultClasses from '../CedHome/home.css';
import cedClasses from '../MyWishlist/wishlist.css';
// import cartClasses from './cartPage.css';
import proClasses from '../ProductFullDetail/productFullDetail.css';
import { fullPageLoadingIndicator } from '../LoadingIndicator/';
import getCrossSellProduct from '../../queries/getCrossSellProduct.graphql';
import {
    ADD_BUNDLE_MUTATION,
    ADD_CONFIGURABLE_MUTATION,
    ADD_SIMPLE_CUSTOM_MUTATION
} from '../ProductFullDetail/productFullDetail.gql';
import mapProduct from '@magento/venia-ui/lib/util/mapProduct';
// import sizeOptions from '../../queries/sizeOptions';
import { useHandleMore } from '../../peregrine/lib/talons/HandleMore/useHandleMore';
import { colorPerRow, plusIcon } from '../Gallery/item';
import AddToCartSection from '../AddToCart'
import Wishlist from '../MyWishlist/wishlist';
import { handleCartNotification } from '../../util/helperFunction';
import { globalContext } from '../../peregrine/lib/context/global';
// import cedClasses from '../ProductFullDetail/productFullDetail.css';

export const Product = props => {
    const { value, closeMiniCart = () => { }, isOpen } = props;
    const { seeMore, handleMoreColor } = useHandleMore()
    const [, { addToast }] = useToasts();
    const [removeWishlistMsg, setRemoveWishlistMsg] = useState(false);
    const [addedWishlistMsg, setAddedWishlistMsg] = useState(false);
    const [showAlertMsg, setShowAlertMsg] = useState(false);

    const { dispatch } = useContext(globalContext);

    const { data, loading } = useQuery(getCrossSellProduct, {
        // fetchPolicy: "cache-and-network",
        variables: {
            id: value.id
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
        success
    } = talonProps;

    const initialValue = {
        allColor: [],
        allSize: [],
        allImage: [],
        uniqueColorId: [],
        uniqueColorAttrId: [],
        uniqueSizeId: [],
        uniqueSizeAttrId: []
    }

    const uniqueConfigFileReduced = React.useMemo(() => {
        if (
            !data ||
            (!data.configurableoption && !data.configurableoption.data)
        )
            return initialValue;
        return data.configurableoption.data.reduce(
            (prev, product) => {
                const allColor = product.__typename === 'ConfigurableOptionData' && product?.type !== 'simple' && product?.configChild ? product?.configChild?.map(
                    color_code =>
                        color_code?.configurable_options?.map(attId => attId)?.filter(item =>
                            item?.Attribute_code === 'color')[0]?.attribute_options[0]?.code
                ) : []
                const uniqueColorId = product.__typename === 'ConfigurableOptionData' && product?.type !== 'simple' && product?.configChild ? product.configChild.map(
                    color_code =>
                        color_code?.configurable_options?.map(attId => attId)?.filter(item =>
                            item?.Attribute_code === 'color')[0]?.attribute_options[0]?.value
                ) : ''
                const uniqueColorAttrId = product.__typename === 'ConfigurableOptionData' && product?.type !== 'simple' && product?.configChild ? product.configChild.map(
                    color_code => color_code?.configurable_options?.map(attId => attId)?.filter(item =>
                        item.Attribute_code === 'color')[0].Attribute_id
                ) : ''
                const allSize = product.__typename === 'ConfigurableOptionData' && product?.type !== 'simple' && product?.configChild ? product.configChild.map(
                    color_code =>
                        color_code?.configurable_options?.map(attId => attId)?.filter(item =>
                            item?.Attribute_code !== 'color')[0]?.attribute_options[0]?.code
                ) : ''
                const uniqueSizeId = product.__typename === 'ConfigurableOptionData' && product?.type !== 'simple' && product?.configChild ? product.configChild.map(
                    color_code =>
                        color_code?.configurable_options?.map(attId => attId)?.filter(item =>
                            item?.Attribute_code !== 'color')[0]?.attribute_options[0]?.value
                ) : ''
                const uniqueSizeAttrId = product.__typename === 'ConfigurableOptionData' && product?.type !== 'simple' && product?.configChild ? product.configChild.map(
                    color_code => color_code?.configurable_options?.map(attId => attId)?.filter(item =>
                        item?.Attribute_code !== 'color')[0]?.Attribute_id
                ) : ''
                const allImage =
                    product.__typename === 'ConfigurableOptionData' && product?.type !== 'simple' && product?.configChild ? product?.configChild &&
                        product.configChild.filter(
                            (value, index, self) =>
                                index ===
                                self.findIndex(
                                    (t) => {
                                        const hashCode = t && t.configurable_options && t.configurable_options.map(attId => attId)[0].attribute_options[0].code
                                        const valueHashCode = value && value.configurable_options && value.configurable_options.map(attId => attId)[0].attribute_options[0].code
                                        return hashCode === valueHashCode

                                    })
                        ) : ''
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
        )
    }, [data, initialValue]);

    const inStockSize =
        uniqueConfigFileReduced &&
            uniqueConfigFileReduced.allSize &&
            uniqueConfigFileReduced.allSize.length
            ? uniqueConfigFileReduced.allSize[0]
            : [];

    const image_file = value.__typename === 'ConfigurableProduct' && uniqueConfigFileReduced.allImage && uniqueConfigFileReduced.allImage.map(images => images.map(img => img.configImage))
    const [imageFile, setImageFile] = useState(data?.configurableoption?.__typename === 'ConfigurableOption' && !loading && image_file?.[0]?.[0]);
    const [colorFile, setColorFile] = useState(data?.configurableoption?.__typename === 'ConfigurableOption' && !loading && uniqueConfigFileReduced?.uniqueColorId?.[0]?.[0]);
    const [isImg, setIsImg] = useState(false)

    useEffect(() => {
        if (!loading && !isImg) {
            setImageFile(image_file && image_file[0] && image_file[0][0])
            setColorFile((data?.configurableoption?.__typename === 'ConfigurableOption' || value.__typename === 'ConfigurableProduct') && uniqueConfigFileReduced.uniqueColorId && uniqueConfigFileReduced.uniqueColorId[0] && uniqueConfigFileReduced.uniqueColorId[0][0])
            setIsImg(true)
        }
    }, [image_file, uniqueConfigFileReduced, loading, isImg])

    const [selectColor, setSelectColor] = useState(0);

    // Color hanldeClick
    const colorHandleClick = (index, attrID) => {
        setImageFile(image_file[0][index]);
        setColorFile(+uniqueConfigFileReduced.uniqueColorId[0][index]);
        handleSelectionChange(attrID[0][0], colorFile);
        setSelectColor(index);
    };

    //Size handleClick
    const sizeHandleClick = index => {
        setShowAlertMsg(true)
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
            {value.__typename === 'ConfigurableProduct' && uniqueConfigFileReduced.allColor &&
                uniqueConfigFileReduced?.allColor?.map((item, index) => {
                    const colorArr = seeMore.includes(value.id) ? item : item.slice(0, colorPerRow)
                    return <div key={index} className={defaultClasses.colors_wrap}>
                        {colorArr.map((color, index) => (
                            <div
                                key={index}
                                className={
                                    selectColor === index
                                        ? defaultClasses.colors_box
                                        : defaultClasses.colors_inner_unselect
                                }
                            >
                                <button
                                    onClick={() =>
                                        colorHandleClick(
                                            index,
                                            uniqueConfigFileReduced.uniqueColorAttrId
                                        )
                                    } //,configOptions.attribute_id
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
                })}
        </>
    );

    let inStockUniqueSize = [];
    if (data?.configurableoption?.data?.[0]?.configChild) {
        data?.configurableoption?.data?.[0]?.configChild?.forEach(configOptions => {
            const sizeConfigurableDetail = configOptions.configurable_options.find(
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
        });
    }

    const checkProductInStock = sizeArgument => {
        const resultSizeDetail = inStockUniqueSize.find(
            item => item?.code === sizeArgument
        );

        if (resultSizeDetail?.value) {
            const resultVariant = data?.configurableoption?.data?.[0]?.configChild?.find(variantItem => {
                return variantItem?.configurable_options?.every(
                    i =>
                        (i?.Attribute_code === 'color' &&
                            i?.attribute_options?.some(
                                attributeItem => attributeItem?.code ===
                                    uniqueConfigFileReduced?.allColor?.[0]?.[selectColor]

                            )) ||
                        (i?.Attribute_code !== 'color' &&
                            i?.attribute_options?.some(
                                attributeItem => attributeItem?.value ===
                                    resultSizeDetail?.value
                            ))
                )
            }
            );
            if (
                resultVariant?.configstockstatus === 'IN_STOCK' ||
                resultVariant?.configstockstatus === 'LOW_STOCK'
            ) {
                return true;
            }
        }
        return false;
    };

    //Item Sizes
    const item_size = (
        <>
            <ul className={defaultClasses.size_wrap}>
                {value.__typename === 'ConfigurableProduct' && uniqueSize.map((size, index) => (
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
                                    && checkProductInStock(size)
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

    const wishlistProps = useWishlist({
        query: WishListQuery
    });

    const { refetch } = wishlistProps;

    const addItemToWishlistTalonProps = useAddItemToWishlist({
        query: ADD_TO_WISHLIST_MUTATION
    });
    const {
        wishlistResponse
    } = addItemToWishlistTalonProps;

    const deleteData = useDeleteFromWishlist({
        query: REMOVE_FROM_WISHLIST_MUTATION
    });
    const { removeResponse } = deleteData;


    useEffect((removeResponse) => {
        if (
            removeResponse &&
            removeResponse.removeFromWishlist &&
            removeResponse.removeFromWishlist.success &&
            removeWishlistMsg
        ) {
            addToast({
                type: 'info',
                message: removeResponse.removeFromWishlist.message,
                dismissable: true,
                timeout: 5000
            });
            refetch();
            setRemoveWishlistMsg(false);
        } else {
            if (
                wishlistResponse &&
                wishlistResponse.addItemToWishlist &&
                wishlistResponse.addItemToWishlist.success &&
                addedWishlistMsg
            ) {
                addToast({
                    type: 'info',
                    message: wishlistResponse.addItemToWishlist.message,
                    dismissable: true,
                    timeout: 5000
                });
                refetch();
                setAddedWishlistMsg(false);
            }
        }
    }, [
        addToast,
        setAddedWishlistMsg,
        wishlistResponse,
        refetch,
        setRemoveWishlistMsg,
        removeResponse,
        addedWishlistMsg,
        removeWishlistMsg
    ]);

    if (success && showAlertMsg) {
        // addToast({
        //     type: 'info',
        //     message: value.name + ' added to the cart.',
        //     dismissable: true,
        //     timeout: 5000
        // });
        handleCartNotification(true, dispatch, value?.name)
        setShowAlertMsg(false);
    }

    return (
        <div className={defaultClasses.products_grid_item + ' ' + 'h-100'}>
            <div className={defaultClasses.noo_product_item + ' ' + 'h-100'}>
                <div className={defaultClasses.noo_product_inner + ' ' + 'h-100'}>
                    <div className={defaultClasses.noo_product_image}>
                        <Link title='' to={resourceUrl(`${value['url_key']}.html`)} onClick={() => closeMiniCart()}>
                            <img
                                src={imageFile || value.small_image.url}
                                alt="product_name"
                                className="product_image"
                                height="300"
                                width="300"
                                title=''
                            />
                        </Link>
                        {
                            value.__typename === 'ConfigurableProduct' && uniqueSize?.length !== 0  && item_size
                        }
                        <Suspense fallback={''}>
                            <Wishlist value={value} isOpen={isOpen} />
                        </Suspense>
                        {false && isSignedIn && (
                            <div className={cedClasses.wishlist_carousel_Wrap}>
                                <section
                                    className={
                                        addedToWishlist || removeWishlistMsg
                                            ? cedClasses.wishlist_addition +
                                            ' ' +
                                            cedClasses.wishlist_added
                                            : cedClasses.wishlist_addition
                                    }
                                >
                                    {addedToWishlist && (
                                        <div className={cedClasses.loader_Wrap}>
                                            {fullPageLoadingIndicator}
                                        </div>
                                    )}
                                    {!addedToWishlist || removeWishlistMsg ? (
                                        <span
                                            role="button"
                                            className={
                                                cedClasses.wishlist_icon_wrap
                                            }
                                            onKeyDown={() =>
                                                addtowishlist(value.id)
                                            }
                                            tabIndex={0}
                                            onClick={() =>
                                                addtowishlist(value.id)
                                            }
                                        >
                                            <FontAwesomeIcon
                                                fill={
                                                    addedToWishlist ? 'red' : ''
                                                }
                                                icon={faHeart}
                                            />
                                        </span>
                                    ) : (
                                        <span
                                            role="button"
                                            className={
                                                cedClasses.wishlist_icon_wrap
                                            }
                                            onClick={() =>
                                                removeFromWishlist(value.id)
                                            }
                                            onKeyDown={() =>
                                                removeFromWishlist(value.id)
                                            }
                                            tabIndex={0}
                                        >
                                            <FontAwesomeIcon
                                                fill={
                                                    addedToWishlist ? 'red' : ''
                                                }
                                                icon={faHeart}
                                            />
                                        </span>
                                    )}
                                </section>
                            </div>
                        )}
                    </div>
                    <div className={defaultClasses.noo_details_wrapper}>
                        <h3 className={defaultClasses.product_name}>
                            <Link className={defaultClasses.product_name_title} to={resourceUrl(`${value['url_key']}.html`)}>
                                {value.name}
                            </Link>
                        </h3>
                        <div className={defaultClasses.vendor_price_wrap}>
                            <Price
                                value={value.price.regularPrice.amount.value}
                                currencyCode={
                                    value?.price?.regularPrice?.amount?.currency || "INR"
                                }
                            />
                        </div>
                        {
                            value.__typename === 'ConfigurableProduct' && uniqueSize?.length !== 0
                                ? <>
                                    <div className={defaultClasses.colors_stars_wrap}>
                                        {item_color}
                                        {!seeMore.includes(value.id) && uniqueConfigFileReduced.allColor[0] && colorPerRow < uniqueConfigFileReduced.allColor[0].length && (
                                            <h5
                                                // className={classes.loadmore}
                                                onClick={() => handleMoreColor(value.id)}
                                            >
                                                {plusIcon}
                                            </h5>
                                        )}
                                        {/* {addTocartHtml()} */}
                                    </div>
                                </>
                                : <div className={proClasses.galler_modal_button_wrapper}>
                                    <AddToCartSection product={value} uniqueSize={uniqueSize}/>
                                </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};
export const GET_PRODUCT_LISTING = gql`
    query getProductListing($cartId: String!) {
        cart(cart_id: $cartId) {
            id
            ...ProductListingFragment
        }
    }
    ${ProductListingFragment}
`;

export default Product;
