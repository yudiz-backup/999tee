import React, { Suspense, useState, useEffect, useContext } from 'react'
import { useToasts } from '@magento/peregrine';
import {
    // FormattedMessage,
    useIntl
} from 'react-intl';
import { Link, resourceUrl } from 'src/drivers';
import { useProductFullDetail } from '../../peregrine/lib/talons/ProductFullDetail/useProductFullDetail';
import { RelatedProducColors, RelatedProducSizes } from './linkedProducts'
import { ADD_BUNDLE_MUTATION, ADD_CONFIGURABLE_MUTATION, ADD_SIMPLE_CUSTOM_MUTATION, ADD_SIMPLE_MUTATION } from './productFullDetail.gql';
import { useHandleMore } from '../../peregrine/lib/talons/HandleMore/useHandleMore';
import { colorPerRow, plusIcon } from '../Gallery/item';
const Wishlist = React.lazy(() => import('../MyWishlist/wishlist'));

import AddToCartSection from '../AddToCart'
import { handleCartNotification } from '../../util/helperFunction';
import { globalContext } from '../../peregrine/lib/context/global';

function LinkedProductsItem({
    // images,
    product,
    productType,
    defaultClasses,
    // product_url_suffix,
    uniqueColorFileReduced,
    lProductIndex,
}) {
    const { seeMore, handleMoreColor/* , colorLength  */ } = useHandleMore()
    // const [productName, setProductName] = useState('');
    const [productImages, setProductImages] = useState({ selected: '', all: [] })
    const [colorValueID, setColorValueID] = useState({ colorValueID: '' })
    const [colorFileReduce, setColorFileReduce] = useState()
    const [selectColor, setSelectColor] = useState(0)

    const { dispatch } = useContext(globalContext);

    const [, { addToast }] = useToasts();
    const { formatMessage } = useIntl();

    const productVariantKeys = React.useMemo(() => {
        let returnKeys = {
            childKey: 'relatedChild',
            childIdKey: 'relatedChildId',
            childColorKey: 'relatedchildColor',
            childImageKey: 'relatedchildImage',
            childColorAttrIdKey: 'relatedchildColorAttrId',
            childSizeAttrIdKey: 'relatedchildSizeAttrId',
            childColorValueIdKey: 'relatedchildColorValueId',
            childSizeValueIdKey: 'relatedchildSizeValueId',
            childSizeKey: 'relatedchildSize',
            childStockStatus: 'relatedchildstockstatus',
        }
        if (productType === 'upsell') {
            returnKeys = {
                childKey: 'upsellChild',
                childIdKey: 'upsellChildId',
                childColorKey: 'upsellchildColor',
                childImageKey: 'upsellchildImage',
                childColorAttrIdKey: 'upsellchildColorAttrId',
                childSizeAttrIdKey: 'upsellchildSizeAttrId',
                childColorValueIdKey: 'upsellchildColorValueId',
                childSizeValueIdKey: 'upsellchildSizeValueId',
                childSizeKey: 'upsellchildSize',
                childStockStatus: 'upsellchildstockstatus'
            }
        }
        return returnKeys
    }, [productType])

    const resultVariantOptions = product?.[productVariantKeys.childKey]

    const resultSizeConfigDetail = resultVariantOptions?.[0]?.configurable_options?.find(item => item.Attribute_code !== "color")

    const localStorageAttribute = JSON.parse(localStorage.getItem('attribute'))

    const resultSize = resultSizeConfigDetail?.Attribute_id &&
        localStorageAttribute &&
        Object.values(localStorageAttribute)?.length &&
        Object.values(localStorageAttribute).find(item => item.Attribute_id === resultSizeConfigDetail?.Attribute_id)

    const uniqueSize = product.type === 'configurable' &&
        resultSize?.attribute_options?.length &&
        resultSize?.attribute_options.map(item => item.label).filter(item => item !== null) || [];

    useEffect(() => {
        const uniqueColorFileReduced = {}
        const sizeReduced = []

        if (!product) return
        const productTypeItemList = product.type === 'configurable' && product[productVariantKeys.childKey]
        const color = product.type === 'configurable' && productTypeItemList && productTypeItemList.filter(
            (value, index, self) => (
                index ===
                self.findIndex(
                    (t) => {
                        const hashCode = t && t.configurable_options && t.configurable_options.map(attId => attId)[0]?.attribute_options[0].code
                        const valueHashCode = value && value.configurable_options && value.configurable_options.map(attId => attId)[0]?.attribute_options[0].code
                        return hashCode === valueHashCode
                    })
            )
        )

        product.type === 'configurable' && productTypeItemList.forEach((color_code) => {
            uniqueColorFileReduced['colorId'] = color_code[productVariantKeys.childIdKey]
            uniqueColorFileReduced['attrId'] = color_code?.configurable_options?.map(attId => attId)?.filter(item => item.Attribute_code === 'color')[0]?.Attribute_id
            uniqueColorFileReduced['sizeAttrId'] = color_code?.configurable_options?.map(attId => attId)?.filter(item => item.Attribute_code !== 'color')[0]?.Attribute_id
            uniqueColorFileReduced['allColor'] = color_code?.configurable_options?.map(attId => attId)?.filter(item => item.Attribute_code === 'color')[0]?.attribute_options[0].code
            uniqueColorFileReduced['valueId'] = color_code?.configurable_options?.map(attId => attId)?.filter(item => item.Attribute_code === 'color')[0]?.attribute_options[0].value
            uniqueColorFileReduced['sizeValueId'] = color_code?.configurable_options?.map(attId => attId)?.filter(item => item.Attribute_code !== 'color')[0]?.attribute_options[0].value
            if (!sizeReduced.length || !sizeReduced.includes(color_code[productVariantKeys.childSizeKey])) {
                sizeReduced.push(color_code?.configurable_options?.map(attId => attId)?.filter(item => item.Attribute_code !== 'color')[0]?.attribute_options[0].code)
            }
        })

        product.type === 'configurable' && setProductImages({ selected: color[0][productVariantKeys.childImageKey], all: [...new Set(color)] })
        setColorFileReduce(uniqueColorFileReduced)
    }, [product, productVariantKeys])

    function handleProductSizeClick({ attrId, valueId }) {
        handleAddToCart({
            quantity: 1,
            customSelections: {
                optionId: attrId,
                selection: valueId,
                colorFile: colorValueID.colorValueID ||
                    productImages?.all[0]?.configurable_options?.map(attId =>
                        attId)?.filter(item =>
                            item.Attribute_code === 'color')[0]?.attribute_options[0].value
            },

        })
    }

    function handleProductColorClick({ imageSrc, attrId, valueId }) {
        if (!imageSrc) return
        setProductImages({ ...productImages, selected: imageSrc })
        setColorValueID({ colorValueID: valueId })
        handleSelectionChange(attrId, valueId)
    }

    const talonProps = useProductFullDetail({
        addConfigurableProductToCartMutation: ADD_CONFIGURABLE_MUTATION,
        addSimpleProductToCartMutation: ADD_SIMPLE_MUTATION,
        addSimpleCustomMutation: ADD_SIMPLE_CUSTOM_MUTATION,
        addBundleProductToCartMutation: ADD_BUNDLE_MUTATION,
        product
    });

    const { handleAddToCart, handleSelectionChange, isAddingItem, success, errorMessage } = talonProps;

    useEffect(() => {
        if (success && !isAddingItem) {
            // addToast({
            //     type: 'info',
            //     message:
            //         product.name +
            //         formatMessage({
            //             id: 'cart.message',
            //             defaultMessage: ' added to the cart.'
            //         }),
            //     dismissable: true,
            //     timeout: 5000
            // });
            handleCartNotification(true, dispatch, product?.name)
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
        addToast,
        product,
        success,
        errorMessage,
        isAddingItem,
        formatMessage,
        dispatch
    ])

    return (
        <div
            className="item h-100"
        >
            <div
                className={
                    defaultClasses.products_grid_item + ' ' + 'h-100'
                }
            >
                <div
                    className={
                        defaultClasses.noo_product_item + ' ' + 'h-100'
                    }
                >
                    <div
                        className={
                            defaultClasses.noo_product_inner + ' ' + 'h-100'
                        }
                    >
                        <div
                            className={
                                defaultClasses.noo_product_image
                            }
                        >
                            <Link
                                to={resourceUrl(
                                    product[
                                    'urlkey'
                                    ]
                                )}
                                aria-label="linked products"
                            >
                                <img
                                    src={product.type === 'configurable' && productImages.selected || product.image}
                                    alt="linked products"
                                    className="product_image"
                                    height="422"
                                    width="422"
                                />
                            </Link>

                            {
                                product.type === 'configurable' && uniqueSize?.length !== 0 && <>
                                    <RelatedProducSizes
                                        uniqueColor={uniqueSize}
                                        uniqueSizeAttributeId={colorFileReduce && colorFileReduce.sizeAttrId}
                                        onSizeClick={handleProductSizeClick}
                                        image_file={uniqueColorFileReduced.allSize}
                                        product={product[productVariantKeys.childKey]}
                                        selectColor={selectColor}
                                        productVariantKeys={productVariantKeys}
                                    />
                                </>
                            }

                            {/* wishlist section */}
                            <Suspense
                                fallback={
                                    ''
                                }
                            >
                                <Wishlist
                                    value={
                                        product
                                    }
                                />
                            </Suspense>
                        </div>
                        <div
                            className={
                                defaultClasses.noo_details_wrapper
                            }
                        >
                            <p
                                className={
                                    defaultClasses.product_name
                                }
                            >
                                <Link
                                    to={resourceUrl(
                                        product[
                                        'urlkey'
                                        ]
                                    )}
                                    aria-label="linked products"
                                >
                                    {
                                        product.name
                                    }
                                </Link>
                            </p>
                            <div className={defaultClasses.vendor_price_wrap}>
                                <span className={defaultClasses.price}>{product.final_price}</span>
                            </div>
                            {
                                product.type === 'configurable'&& uniqueSize?.length !== 0 
                                    ? <div className={defaultClasses.colors_stars_wrap}>
                                        <div className={defaultClasses.colors_wrap}>
                                            <RelatedProducColors
                                                selectColor={selectColor}
                                                setSelectColor={setSelectColor}
                                                uniqueColor={uniqueColorFileReduced.allColor[lProductIndex]}
                                                uniqueColorAttributeId={colorFileReduce && colorFileReduce.attrId}
                                                product={productImages.all}
                                                clickedProductIndex={lProductIndex}
                                                onColorClick={handleProductColorClick}
                                                defaultClasses={defaultClasses}
                                                mappedArr={
                                                    seeMore.includes(product.id) ? uniqueColorFileReduced.allColor[lProductIndex] : uniqueColorFileReduced.allColor[lProductIndex].slice(0, colorPerRow)
                                                }
                                            />
                                        </div>
                                        {!seeMore.includes(product.id) && uniqueColorFileReduced.allColor[lProductIndex] && colorPerRow < uniqueColorFileReduced.allColor[lProductIndex].length && (
                                            <h5
                                                // className={classes.loadmore}
                                                onClick={() => handleMoreColor(product.id)}
                                            >
                                                {plusIcon}
                                            </h5>
                                        )}
                                    </div>
                                    : (product.type === 'simple' || product.type === 'configurable') && uniqueSize?.length === 0  && <div className={defaultClasses.colors_stars_wrap}>
                                        <AddToCartSection product={product} uniqueSize={uniqueSize}/>
                                    </div>
                            }

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default React.memo(LinkedProductsItem)