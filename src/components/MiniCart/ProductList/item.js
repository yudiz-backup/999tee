import React, { useMemo, useState, useEffect, Suspense } from 'react';
import { string, number, shape, func, arrayOf } from 'prop-types';
import { Price, useToasts } from '@magento/peregrine';
import { Link, resourceUrl } from 'src/drivers';
import { useItem } from '@magento/peregrine/lib/talons/MiniCart/useItem';
import CustomProductOptions from '../../CartPage/ProductListing/productOptions';
import BundleProductOptions from '../../CartPage/ProductListing/bundleOptions';
import { useMutation, gql } from '@apollo/client';
import ProductOptions from '../../LegacyMiniCart/productOptions';
import Image from '../../Image';
import Icon from '../../Icon';
import { mergeClasses } from '../../../classify';
import QuantityFields from '../../CartPage/ProductListing/quantity';
import defaultClasses from './item.css';
import { useIntl } from 'react-intl';
import { UPDATE_QUANTITY_MUTATION } from '../../CartPage/ProductListing/product'
import { useCartContext } from '@magento/peregrine/lib/context/cart';
import DeleteModal from '../../DeleteModal';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import {
    Edit2 as Edit2Icon,
    Trash as TrashIcon,
    Heart as HeartIcon
} from 'react-feather';
// import EditModal from '../../CartPage/ProductListing/EditModal/editModal';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { guestWishlistAddToLocalStorage, guestWishlistRemoveFromLocalStorage } from '../../../util/helperFunction';
import { useAddItemToWishlist } from '../../../peregrine/lib/talons/ProductFullDetail/useProductFullDetail';
import GET_CUSTOMER_QUERY from '../../../queries/getCustomer.graphql';
import ADD_TO_WISHLIST_MUTATION from '../../../queries/addItemToWishlist.graphql';
import { useDeleteFromWishlist } from '../../../peregrine/lib/talons/MyAccount/useDashboard';
import REMOVE_FROM_WISHLIST_MUTATION from '../../../queries/removeFromWishlist.graphql';
import { SET_SHIPPING_METHOD_MUTATION } from '../../CartPage/PriceAdjustments/ShippingMethods/shippingRadios'

import { stockStatusLabel } from '../../../util/constant';

const Item = props => {
    // const { formatMessage } = useIntl();
    // const [{ cartId }] = useCartContext();
    const [{ isSignedIn }] = useUserContext();
    const [, { addToast }] = useToasts();
    const [{ drawer }, { toggleDrawer }] = useAppContext();
    const [displayError, setDisplayError] = useState(false);
    const [isCartUpdating, setIsCartUpdating] = useState(false);
    const [itemAddedToGuestWishlist, setItemAddedToGuestWishlist] = useState();
    const [itemRemovedFromGuestWishlist, setItemRemovedFromGuestWishlist] = useState();
    const [addWisList, setAddWishList] = useState(false);
    const [isErrorQty, setIsErrorQty] = useState(false);


    // Props
    const {
        classes: propClasses,
        product,
        id,
        quantity: initialValue,
        configurable_options,
        handleRemoveItem,
        prices,
        closeMiniCart,
        customizable_options,
        bundle_options,
        item_image,
        ItemID,
        setIsOpen,
        data,
        loading,
        setActiveEditItem,
        setIsPriceUpdating = () => { },
        miniCartRefect = () => { },
        // activeEditItem,
        wishlistData = [],
    } = props;
    
    const [
        setShippingMethod,
    ] = useMutation(SET_SHIPPING_METHOD_MUTATION, {
        // onCompleted: () => {
        //     setIsItemLoadingWhileShippingApplied(false)
        // }
    });

    const { addItemToWishlist, wishlistResponse } = useAddItemToWishlist({
        customerQuery: GET_CUSTOMER_QUERY,
        query: ADD_TO_WISHLIST_MUTATION
    });

    const deleteData = useDeleteFromWishlist({
        query: REMOVE_FROM_WISHLIST_MUTATION,
        customerQuery: GET_CUSTOMER_QUERY
    });
    const { handleRemoveItem: removeItemFromWishlist, removeResponse } = deleteData;

    const handleEditItem = () => {
        setIsOpen(false)
        setActiveEditItem(data);
        toggleDrawer('product.edit');

        // If there were errors from removing/updating the product, hide them
        // when we open the modal.
        setDisplayError(false);
    }
    const classes = mergeClasses(defaultClasses, propClasses);

    // useState
    const [categoryFlag, setCategoryFlag] = useState(false);
    // const [deleteModalFlag, setDeleteModalFlag] = useState(false);

    let productUrlSuffix = '';
    if (product.url_suffix && product.url_suffix != 'null') {
        productUrlSuffix = product.url_suffix;
    }
    const itemLink = useMemo(
        () => resourceUrl(`/${product.url_key}${productUrlSuffix}`),
        [product.url_key, productUrlSuffix]
    );
    const stockStatusText =
        product.stock_status === 'OUT_OF_STOCK' ? 'Out-of-stock' : '';

    const { isDeleting, removeItem } = useItem({
        id,
        handleRemoveItem
    });

    const rootClass = isDeleting ? classes.root_disabled : classes.root;

    const [
        updateItemQuantity,
        {
            loading: updateItemLoading,
            // error: updateError,
            // called: updateItemCalled,
        }
    ] = useMutation(UPDATE_QUANTITY_MUTATION, {
        onCompleted: () => {
            setIsPriceUpdating(false)
        },
        onError: async (error) => {
            setIsErrorQty(true);
            error.graphQLErrors.map(error => {
                addToast({
                    type: 'error',
                    message: error.message,
                    dismissable: true,
                    timeout: 5000
                });
            });
            // await handleUpdateItemQuantity(initialValue)
            setDisplayError(true)
            setIsPriceUpdating(false)
        }
    });

    useEffect(() => {
        setIsPriceUpdating(updateItemLoading)
    }, [updateItemLoading])

    const handleUpdateItemQuantity = async (qty) => {
        try {
            await updateItemQuantity({
                variables: {
                    cartId: localStorage.getItem('cart_id'),
                    itemId: ItemID,
                    quantity: qty
                }
            });
        } catch (err) {
            console.log(err)
        }
    }
    const handleIncrement = async (qty) => {
        // try {
        //     await updateItemQuantity({
        //         variables: {
        //             cartId,
        //             itemId: ItemID,
        //             quantity: qty
        //         }
        //     });
        // } catch (err) {
        //     console.log(err)
        // }
    }
    const handleDecrement = async (qty) => {
        // try {
        //     await updateItemQuantity({
        //         variables: {
        //             cartId,
        //             itemId: ItemID,
        //             quantity: qty
        //         }
        //     });
        // } catch (err) {
        //     console.log(err)
        // }
    }

    const handleWishlistButton = async () => {
        try {
            if (addWisList) {
                if (isSignedIn) {
                    await removeItemFromWishlist({
                        product_id: product.id
                    });
                } else {
                    guestWishlistRemoveFromLocalStorage(product.id);
                    setItemRemovedFromGuestWishlist(product)
                }
                setAddWishList(false)
            } else {
                if (isSignedIn) {
                    await addItemToWishlist({
                        product_id: product.id
                    })
                } else {
                    guestWishlistAddToLocalStorage(product)
                    setItemAddedToGuestWishlist(product)
                }
                setAddWishList(true)
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        // Let the cart page know it is updating while we're waiting on network data.
        setIsCartUpdating(loading);
    }, [loading]);

    useEffect(() => {
        if ((itemAddedToGuestWishlist && itemAddedToGuestWishlist.name) || (wishlistResponse &&
            wishlistResponse.addItemToWishlist &&
            wishlistResponse.addItemToWishlist.success)) {
            addToast({
                type: 'info',
                message: itemAddedToGuestWishlist && itemAddedToGuestWishlist.name ? `${itemAddedToGuestWishlist.name || ''} added to wishlist` : wishlistResponse && wishlistResponse.addItemToWishlist && wishlistResponse.addItemToWishlist.message ? `${wishlistResponse.addItemToWishlist.message}` : 'Product added to wishlist',
                dismissable: true,
                timeout: 5000
            });
            setItemAddedToGuestWishlist();
        }
    }, [wishlistResponse, itemAddedToGuestWishlist])

    useEffect(() => {
        if ((itemRemovedFromGuestWishlist && itemRemovedFromGuestWishlist.name) || (removeResponse &&
            removeResponse.removeFromWishlist &&
            removeResponse.removeFromWishlist.success)) {
            addToast({
                type: 'info',
                message: itemRemovedFromGuestWishlist && itemRemovedFromGuestWishlist.name ? `${itemRemovedFromGuestWishlist.name || ''} removed from wishlist` : removeResponse && removeResponse.removeFromWishlist && removeResponse.removeFromWishlist.message ? `${removeResponse.removeFromWishlist.message}` : 'Product removed from wishlist',
                dismissable: true,
                timeout: 5000
            });
            setItemRemovedFromGuestWishlist();
        }
    }, [removeResponse, itemRemovedFromGuestWishlist])

    useEffect(() => {
        if (wishlistData && wishlistData.length) {
            setAddWishList(wishlistData.some(item => item.id === product.id && item.sku === product.sku))
        } else {
            setAddWishList(false)
        }
    }, [wishlistData])
    return (
        <div className={classes.product_item_container}>
            <div className={data?.configured_variant?.stock_status === "OUT_OF_STOCK" || data.product.stock_status === 'OUT_OF_STOCK' ? `${rootClass} ${classes.out_of_stock_product}` : rootClass}>
                <div className={classes.mini_cart_item_img}>
                    <Link
                        className={classes.thumbnailContainer}
                        to={itemLink}
                        onClick={closeMiniCart}
                    >
                        <Image
                            alt={product.name}
                            classes={{ root: classes.thumbnail }}
                            width={100}
                            resource={item_image}
                        />
                    </Link>
                </div>
                <div >
                    <div className={classes.mini_cart_item_counter}>
                        <div className={classes.delete_item}>
                            <Link
                                className={classes.name}
                                to={itemLink}
                                onClick={closeMiniCart}
                            >
                                {product.name}
                            </Link>
                            <div className={defaultClasses.iconBlock_mini}>
                                {/* {
                    data.__typename === 'ConfigurableCartItem' && <>
                        <div className={classes.iconBlock + ' ' + 'test'}>
                        <div className={classes.edit_btn}>
                        <button 
                                onClick={handleEditItem}
                                type="button"
                                className={classes.wishlist_button + ' ' + 'edit_btn'}
                            >
                                <Icon
                                    size={16}
                                    src={Edit2Icon}
                                    classes={{ icon: classes.editIcon }}
                                />
                            </button>

                        </div>
                        </div>
                    </>
                } */}
                                <button
                                    onClick={() => handleWishlistButton()}
                                    type="button"
                                    className={classes.wishlist_button}
                                >
                                    <Icon
                                        size={16}
                                        src={HeartIcon}
                                        className={addWisList ? classes.wishlist_button_icon_red : classes.wishlist_button_icon}
                                    />
                                </button>
                                {data?.__typename === 'ConfigurableCartItem' &&
                                    <button
                                        onClick={() => {
                                            handleEditItem();
                                        }}
                                        type="button"
                                        className={classes.deleteButton}
                                        // disabled={isDeleting}
                                        data-toggle="modal"
                                        data-target="#staticBackdrop"
                                    >
                                        <Icon
                                            size={16}
                                            src={Edit2Icon}
                                            classes={{ icon: classes.editIcon }}
                                            className={classes.deleteBtn}
                                        />
                                    </button>}
                                <button
                                    onClick={() => setCategoryFlag(!categoryFlag)}
                                    type="button"
                                    className={classes.deleteButton}
                                    disabled={isDeleting}
                                    data-toggle="modal" data-target="#staticBackdrop"
                                >
                                    <Icon
                                        size={16}
                                        src={TrashIcon}
                                        classes={{ icon: classes.editIcon }}
                                        className={classes.deleteBtn}
                                    />
                                </button>

                            </div>
                        </div>
                        <div className={classes.product_details}>
                            <div className={classes.product_details_minicart}>
                                <ProductOptions
                                    options={configurable_options}
                                    classes={{
                                        options: classes.options
                                    }}
                                />
                                {customizable_options && (
                                    <CustomProductOptions
                                        options={customizable_options}
                                        classes={{
                                            options: classes.options
                                        }}
                                    />
                                )}
                                {bundle_options && (
                                    <BundleProductOptions
                                        options={bundle_options}
                                        classes={{
                                            options: classes.options
                                        }}
                                    />
                                )}

                            </div>
                            {/* <div className={classes.border_div}></div> */}
                            <div className={classes.miniCart_qnty_wrap}>
                                <span className={classes.price}>
                                    <Price
                                        currencyCode={prices?.price?.currency || "INR"}
                                        value={prices?.price?.value}
                                    />
                                </span>
                                <div className={classes.miniCartCounter}>
                                    <QuantityFields
                                        classes={{
                                            root:
                                                classes.quantityRoot
                                        }}
                                        min={1}
                                        message={'Error'}
                                        initialValue={initialValue}
                                        itemId={ItemID}
                                        onChange={handleUpdateItemQuantity}
                                        handleDecrement={handleDecrement}
                                        handleIncrement={handleIncrement}
                                        setIsErrorQty={setIsErrorQty}
                                        isErrorQty={isErrorQty}
                                    />

                                </div>
                                {/* <div className={classes.border_div}></div> */}
                                {/* {stockStatusText ? <span className={'text-danger'}>{stockStatusText}</span> : null} */}
                                <span>{data?.configured_variant?.stock_status === "OUT_OF_STOCK" || data.product.stock_status === 'OUT_OF_STOCK' ?
                                    <span className='text-danger' style={{ fontSize: '12px' }}>
                                        {/* {stockStatusLabel[data?.configured_variant?.stock_status]} */}
                                        OUT OF STOCK
                                    </span> : ""}
                                </span>

                            </div>
                        </div>
                        {/* <Suspense fallback={loading}>
                <EditModal
                        item={activeEditItem}
                        setIsCartUpdating={setIsCartUpdating}
                    />
                </Suspense> */}
                    </div>
                </div>
                {(data?.configured_variant?.stock_status === "OUT_OF_STOCK" || data.product.stock_status === 'OUT_OF_STOCK') && <div className={classes.out_stock_btn}>
                    <button
                        onClick={() => setCategoryFlag(!categoryFlag)}
                        type="button"
                        className={classes.deleteButton}
                        disabled={isDeleting}
                        data-toggle="modal" data-target="#staticBackdrop"
                    >
                        <Icon
                            size={16}
                            src={TrashIcon}
                            classes={{ icon: classes.editIcon }}
                            className={classes.deleteBtn}
                        />
                    </button>
                </div>}
                {categoryFlag &&

                    <DeleteModal
                        categoryFlag={categoryFlag}
                        setCategoryFlag={setCategoryFlag}
                        id={data.id}
                        handleDeleteItem={removeItem}
                        isDeleteFromMinicart={true}
                        product={product}
                        configurable_options={configurable_options}
                    />}
            </div>
        </div>
    );
};

export default Item;

Item.propTypes = {
    classes: shape({
        root: string,
        thumbnail: string,
        name: string,
        options: string,
        initialValue: string,
        price: string,
        editButton: string,
        editIcon: string
    }),
    product: shape({
        name: string,
        thumbnail: shape({
            url: string
        })
    }),
    id: string,
    initialValue: number,
    configurable_options: arrayOf(
        shape({
            id: number,
            option_label: string,
            value_id: number,
            value_label: string
        })
    ),
    handleRemoveItem: func,
    prices: shape({
        price: shape({
            value: number,
            currency: string
        })
    })
};


