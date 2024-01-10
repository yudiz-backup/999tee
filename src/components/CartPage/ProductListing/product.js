import React, { useMemo, useEffect, useState, useContext } from 'react';
import { gql } from '@apollo/client';
import { Link, resourceUrl } from 'src/drivers';
import { useProduct } from 'src/peregrine/lib/talons/CartPage/ProductListing/useProduct';
import { Price, useToasts } from '@magento/peregrine';
import CustomProductOptions from './productOptions';
import BundleProductOptions from './bundleOptions';
import { mergeClasses } from '../../../classify';
// import Kebab from '../../LegacyMiniCart/kebab';
import ProductOptions from '../../LegacyMiniCart/productOptions';
import Quantity from './quantity';
// import Section from '../../LegacyMiniCart/section';
import Image from '../../Image';
import Icon from '../../Icon';
import {
    Edit2 as Edit2Icon,
    Trash as TrashIcon,
    Heart as HeartIcon,
    Check
} from 'react-feather';
import defaultClasses from './product.css';
import { CartPageFragment } from '../cartPageFragments.gql';
import { AvailableShippingMethodsCartFragment } from '../PriceAdjustments/ShippingMethods/shippingMethodsFragments.gql';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { FormattedMessage/* , useIntl */ } from 'react-intl';
const IMAGE_SIZE = 100;
import ADD_TO_WISHLIST_MUTATION from '../../../queries/addItemToWishlist.graphql';
import GET_CUSTOMER_QUERY from '../../../queries/getCustomer.graphql';
import { useAddItemToWishlist } from '../../../peregrine/lib/talons/ProductFullDetail/useProductFullDetail';
import { useDeleteFromWishlist } from '../../../peregrine/lib/talons/MyAccount/useDashboard';
import REMOVE_FROM_WISHLIST_MUTATION from '../../../queries/removeFromWishlist.graphql';
import Button from '../../Button';
import IFrameModal from '../../DesignTool';
import Checkbox from '../../Checkbox';
import { globalContext } from '../../../peregrine/lib/context/global';
// import { useCartContext } from '@magento/peregrine/lib/context/cart';
import DeleteModal from '../../DeleteModal';
import { guestWishlistAddToLocalStorage, guestWishlistRemoveFromLocalStorage, guestWishlistGetFromLocalStorage } from '../../../util/helperFunction';
import { stockStatusLabel } from '../../../util/constant';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Product = props => {
    const { dispatch } = useContext(globalContext);
    // const [categoryFlag, setCategoryFlag] = useState(false);
    // const [deleteModalFlag, setDeleteModalFlag] = useState(false);
    const [shown, setShown] = useState(false);
    const [deleteModelFlag, setDeleteModelFlag] = useState(false);
    const [itemAddedToGuestWishlist, setItemAddedToGuestWishlist] = useState();
    const [itemRemovedFromGuestWishlist, setItemRemovedFromGuestWishlist] = useState();

    const {
        item,
        setActiveEditItem,
        isCartUpdating,
        setIsCartUpdating,
        setSelectedItem,
        openModal,
        setOpenModel,
        giftWrapperData,
        wrapperStatusPerItem,
        wrapperStatusEnabled,
        cartItems,
        giftWrap,
        // setGiftWrapperData,
        // setIsChecked ,
        wishlistData
    } = props;

    const matchedWrapperItem =
        giftWrapperData &&
        giftWrapperData?.find(
            wrapperData => (wrapperData?.mpGiftWrapWrapperSet?.item_id == item.id) || (+wrapperData?.id === +item.id)
        );

    const matchedWrapperData = matchedWrapperItem
        ? matchedWrapperItem
        : '';

    // const { formatMessage } = useIntl();
    const [, { addToast }] = useToasts();

    let productUrlSuffix = '';
    const [{ isSignedIn }] = useUserContext();
    const { customizable_options, bundle_options } = item;
    const talonProps = useProduct({
        item,
        mutations: {
            removeItemMutation: REMOVE_ITEM_MUTATION,
            updateItemQuantityMutation: UPDATE_QUANTITY_MUTATION
        },
        setActiveEditItem,
        setIsCartUpdating
    });

    const {
        errorMessage,
        handleEditItem,
        handleRemoveFromCart,
        // handleToggleFavorites,
        handleUpdateItemQuantity,
        // isEditable,
        isFavorite,
        product,
        setIsFavorite
    } = talonProps;

    const { item_image = '', item_design_url = '' } = item || {};

    const {
        currency,
        name,
        options,
        quantity,
        stockStatus,
        unitPrice,
        urlKey,
        urlSuffix
    } = product;
    if (urlSuffix && urlSuffix != 'null') {
        productUrlSuffix = urlSuffix;
    }
    const classes = mergeClasses(defaultClasses, props.classes);

    // const editItemSection =
    //     isEditable || item_design_url ? (
    //         <Section
    //             text={formatMessage({
    //                 id: 'product.editItem',
    //                 defaultMessage: 'Edit item'
    //             })}
    //             onClick={() => {
    //                 if (item_design_url) {
    //                     setShown(true);
    //                 } else {
    //                     handleEditItem();
    //                 }
    //             }}
    //             icon="Edit2"
    //             classes={{ text: classes.sectionText }}
    //         />
    //     ) : null;

    const itemLink = useMemo(
        () => resourceUrl(`/${urlKey}${productUrlSuffix}`),
        [urlKey, productUrlSuffix]
    );

    const stockStatusMessage =
        stockStatus === 'OUT_OF_STOCK' ? 'Out-of-stock' : '';
    const addItemToWishlistTalonProps = useAddItemToWishlist({
        customerQuery: GET_CUSTOMER_QUERY,
        query: ADD_TO_WISHLIST_MUTATION
    });
    const {
        addItemToWishlist,
        wishlistResponse
        // addingToWishlist
    } = addItemToWishlistTalonProps;
    // const addtowishlist = async product_id => {
    //     await addItemToWishlist({
    //         product_id: product_id
    //     });
    //     // setAddedWishlistMsg(true);
    // };
    const deleteData = useDeleteFromWishlist({
        query: REMOVE_FROM_WISHLIST_MUTATION,
        customerQuery: GET_CUSTOMER_QUERY
    });
    const { handleRemoveItem, removeResponse } = deleteData;
    // const removeFromWishlist = async product_id => {
    //     await handleRemoveItem({
    //         product_id: product_id
    //     });
    //     // setRemoveWishlistMsg(true);
    // };

    const handleWishlistButton = async () => {
        try {
            if (isFavorite) {
                if (isSignedIn) {
                    await handleRemoveItem({
                        product_id: product.id
                    });
                } else {
                    guestWishlistRemoveFromLocalStorage(product.id);
                    setItemRemovedFromGuestWishlist(product);
                }
                setIsFavorite(false);
            } else {
                if (isSignedIn) {
                    await addItemToWishlist({
                        product_id: product.id
                    });
                } else {
                    guestWishlistAddToLocalStorage(product);
                    setItemAddedToGuestWishlist(product);
                }
                setIsFavorite(true);
            }
        } catch (error) {
            console.log('[Error] -> handleWishlistButton() : ', error)
        }
    };

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
            setIsFavorite(wishlistData.some(item => item.id === product.id && item.sku === product.sku))
        } else {
            setIsFavorite(false)
        }
    }, [wishlistData])

    useEffect(() => {
        if (!isSignedIn) {
            const result = guestWishlistGetFromLocalStorage();
            dispatch({
                type: 'WISHLIST_COUNT',
                payload: result && result.length ? result.length : 0
            });
        }
    }, [isFavorite])

    const handleModelOpen = (e) => {
        if ((e.target.checked && giftWrap === 2) || e.target.checked) {
            setOpenModel(true)
        } else {
            setOpenModel(false);
        }
        setSelectedItem(item);
    };
    localStorage.setItem('isChecked', openModal);

    const matchedItemName =
        matchedWrapperData?.mp_gift_wrap_data?.name;

    const matchedItemPrice =
        matchedWrapperData?.mp_gift_wrap_data?.price;

    useEffect(() => {
        if (item && matchedWrapperData) {
            dispatch({
                type: 'ITEM_DATA',
                payload: { itemData: matchedWrapperData.item_id === +item.id }
            });
        }
    }, [item, matchedWrapperData]);

    useEffect(() => {
        if (shown) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'visible';
        }

        function handleClick(e) {
            if (
                shown &&
                document.getElementById('iFrameWrapper') &&
                !document.getElementById('iFrameWrapper').contains(e.target)
            ) {
                setShown(true);
            }
        }
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [shown]);

    const rootClass = isCartUpdating ? classes.root_disabled : classes.root;

    // const otherGiftWrapperData = giftWrapperData.filter(item =>
    //     cartItems.find(
    //         id => +id.id === item?.item_id
    //     )
    // );
    // localStorage.setItem('giftWrapper', JSON.stringify(otherGiftWrapperData));
    return (
        <>
            {deleteModelFlag && (
                <>
                    <div className={defaultClasses.checkout_modal}>
                        <DeleteModal
                            categoryFlag={deleteModelFlag}
                            setCategoryFlag={setDeleteModelFlag}
                            id={item.id}
                            handleDeleteItem={handleRemoveFromCart}
                        />
                    </div>
                </>
            )}
            <li className={item?.configured_variant?.stock_status === "OUT_OF_STOCK" || item.product.stock_status === 'OUT_OF_STOCK' ? `${rootClass} ${classes.out_of_stock_product}` : rootClass}>

                <div className={classes.item}>
                    {shown ? (
                        <IFrameModal src={item_design_url} setShown={setShown} />
                    ) : (
                        <></>
                    )}
                    <Link to={itemLink} className={classes.imageContainer}>
                        <Image
                            alt={name}
                            classes={{
                                root: classes.imageRoot,
                                image: classes.image
                            }}
                            width={IMAGE_SIZE}
                            resource={item_image}
                        />
                    </Link>
                    <div className={classes.shop_details_wrapper}>
                        <div className={classes.shop_details}>
                            <Link to={itemLink} className={classes.name}>
                                {name}
                            </Link>
                            <div className={classes.shop_details_sec}>
                                <div className={classes.shop_detail_title}>

                                    <ProductOptions
                                        options={options}
                                        classes={{
                                            options: classes.options,
                                            optionLabel: classes.optionLabel
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

                                    <span className={classes.stockStatusMessage}>
                                        {stockStatusMessage}
                                    </span>
                                    <span className={classes.price}>
                                        <Price currencyCode={currency || "INR"} value={unitPrice} />
                                    </span>
                                </div>

                                <div className={classes.quantity}>
                                    <Quantity
                                        itemId={item.id}
                                        initialValue={quantity}
                                        onChange={handleUpdateItemQuantity}
                                    />
                                </div>
                                <div className={classes.shop_btn_edit}>
                                    <button
                                        onClick={() => handleWishlistButton()}
                                        type="button"
                                        className={classes.wishlist_button}
                                    >
                                        <Icon
                                            size={16}
                                            src={HeartIcon}
                                            className={
                                                isFavorite
                                                    ? classes.wishlist_button_icon_red
                                                    : classes.wishlist_button_icon
                                            }
                                        />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (item_design_url) {
                                                setShown(true);
                                            } else {
                                                handleEditItem();
                                            }
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
                                    </button>
                                    <button
                                        onClick={() => {
                                                setDeleteModelFlag(!deleteModelFlag)
                                                dispatch({ type: "SCROLL_DISABLE", payload: { scrollDisable: true } })
                                            }
                                        }
                                        type="button"
                                        className={classes.deleteButton}
                                        // disabled={isDeleting}
                                        data-toggle="modal"
                                        data-target="#staticBackdrop"
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
                            {wrapperStatusEnabled === 'enabled' &&
                                giftWrap === 1 ? <span className='ms-2'>Gift wrap to all items</span> : null}

                            <span>{item?.configured_variant?.stock_status === "OUT_OF_STOCK" ?
                                <span className='text-danger'>
                                    {stockStatusLabel[item?.configured_variant?.stock_status]}
                                </span> : ""}
                            </span>

                        </div>
                        {wrapperStatusEnabled === 'enabled' &&
                            ((cartItems && cartItems.length === 1) ||
                                giftWrap === 2) &&
                            (wrapperStatusPerItem === 'Per Item' ||
                                wrapperStatusPerItem === 'Both') && (
                                <div className={classes.giftwraper + ' ' + 'text-left w-full d-flex align-items-center'} >
                                    <Checkbox
                                        id="gift_wrapper"
                                        onClick={e => handleModelOpen(e)}
                                        field="gift_wrapper"
                                        isDisplayOwnLabel={true}
                                        fieldState={{
                                            value:
                                                (+matchedWrapperData?.id ===
                                                    +item?.id) || (matchedWrapperData?.mpGiftWrapWrapperSet?.item_id == item.id)
                                        }}
                                    />
                                    <Button className={classes.popupbtn + ' ' + classes.gift_wrap_btn + ' ' + 'w-100 m-0'}>
                                        <div
                                            className={defaultClasses.popupbtn_icon}
                                        >
                                            <img
                                                src="/cenia-static/images/gift-box.png"
                                                className="img-fluid"
                                                alt="login"
                                                width="20px"
                                                height="20px"
                                            />{' '}
                                            {matchedWrapperData &&
                                                matchedWrapperData.item_id ===
                                                +item.id ? (
                                                <span
                                                    className={
                                                        classes.gift_wripper_appiled_wrapper + ' ' + 'w-100'
                                                    }
                                                >
                                                    <b style={{ marginRight: 5 }}>
                                                        Wrapper :{' '}
                                                    </b>{' '}
                                                    {matchedItemName} |{' '}
                                                    {matchedItemPrice}{' '}
                                                    <span
                                                        className={
                                                            classes.gift_wripper_appiled_tick
                                                        }
                                                    >
                                                        {/* <Check /> */}
                                                    </span>
                                                </span>
                                            ) : (
                                                <span >
                                                    <FormattedMessage
                                                        id={'giftModel.addGiftwrap'}
                                                        defaultMessage={
                                                            'Add Gift Wrap'
                                                        }
                                                    />
                                                </span>
                                            )}
                                        </div>
                                    </Button>
                                </div>
                            )}

                    </div>

                </div >
                {(item?.configured_variant?.stock_status === "OUT_OF_STOCK" || item.product.stock_status === 'OUT_OF_STOCK') && <div className={classes.out_stock_btn}>
                    <button
                        onClick={() => {
                            setDeleteModelFlag(!deleteModelFlag)
                            dispatch({ type: "SCROLL_DISABLE", payload: { scrollDisable: true } })
                        }}
                        type="button"
                        className={classes.deleteButton}
                        // disabled={isDeleting}
                        data-toggle="modal"
                        data-target="#staticBackdrop"
                    >
                        <Icon
                            size={16}
                            src={TrashIcon}
                            classes={{ icon: classes.editIcon }}
                            className={classes.deleteBtn}
                        />
                    </button>
                </div>}
                {wrapperStatusEnabled === 'enabled' &&
                    ((cartItems && cartItems.length === 1) ||
                        giftWrap === 2) &&
                    (wrapperStatusPerItem === 'Per Item' ||
                        wrapperStatusPerItem === 'Both') && (
                        <div className={classes.giftwraperMobile + ' ' + 'text-left w-full d-flex align-items-center'} >
                            <Checkbox
                                id="gift_wrapper"
                                onClick={e => handleModelOpen(e)}
                                field="gift_wrapper"
                                isDisplayOwnLabel={true}
                                fieldState={{
                                    value:
                                        (+matchedWrapperData?.id ===
                                            +item?.id) || (matchedWrapperData?.mpGiftWrapWrapperSet?.item_id == item.id)
                                }}
                            />
                            <Button className={classes.popupbtn + ' ' + classes.gift_wrap_btn + ' ' + 'w-100 m-0'}>
                                <div
                                    className={defaultClasses.popupbtn_icon}
                                >
                                    <img
                                        src="/cenia-static/images/gift-box.png"
                                        className="img-fluid"
                                        alt="login"
                                        width="20px"
                                        height="20px"
                                    />{' '}
                                    {matchedWrapperData &&
                                        matchedWrapperData.item_id ===
                                        +item.id ? (
                                        <span
                                            className={
                                                classes.gift_wripper_appiled_wrapper + ' ' + 'w-100'
                                            }
                                        >
                                            <b style={{ marginRight: 5 }}>
                                                Wrapper :{' '}
                                            </b>{' '}
                                            {matchedItemName} |{' '}
                                            {matchedItemPrice}{' '}
                                            <span
                                                className={
                                                    classes.gift_wripper_appiled_tick
                                                }
                                            >
                                                <Check />
                                            </span>
                                        </span>
                                    ) : (
                                        <span >
                                            <FormattedMessage
                                                id={'giftModel.addGiftwrap'}
                                                defaultMessage={
                                                    'Add Gift Wrap'
                                                }
                                            />
                                        </span>
                                    )}
                                </div>
                            </Button>
                        </div>
                    )}
                <span className={classes.errorText}>{errorMessage}</span>
            </li>
        </>

    );
};

export default Product;

export const REMOVE_ITEM_MUTATION = gql`
    mutation removeItem($cartId: String!, $itemId: Int!) {
        removeItemFromCart(input: { cart_id: $cartId, cart_item_id: $itemId })
            @connection(key: "removeItemFromCart") {
            cart {
                id
                ...CartPageFragment
                ...AvailableShippingMethodsCartFragment
            }
        }
    }
    ${CartPageFragment}
    ${AvailableShippingMethodsCartFragment}
`;

export const UPDATE_QUANTITY_MUTATION = gql`
    mutation updateItemQuantity(
        $cartId: String!
        $itemId: Int!
        $quantity: Float!
    ) {
        updateCartItems(
            input: {
                cart_id: $cartId
                cart_items: [{ cart_item_id: $itemId, quantity: $quantity }]
            }
        ) @connection(key: "updateCartItems") {
            cart {
                id
                ...CartPageFragment
                ...AvailableShippingMethodsCartFragment
            }
        }
    }
    ${CartPageFragment}
    ${AvailableShippingMethodsCartFragment}
`;
