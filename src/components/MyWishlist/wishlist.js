import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useToasts } from '@magento/peregrine';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import React, { useEffect, useState, /* Suspense, */ useContext } from 'react';
import {
    useDeleteFromWishlist,
    useWishlist
} from '../../peregrine/lib/talons/MyAccount/useDashboard';
import { useAddItemToWishlist } from '../../peregrine/lib/talons/ProductFullDetail/useProductFullDetail';
import ADD_TO_WISHLIST_MUTATION from '../../queries/addItemToWishlist.graphql';
import REMOVE_FROM_WISHLIST_MUTATION from '../../queries/removeFromWishlist.graphql';
import GET_CUSTOMER_QUERY from '../../queries/getCustomer.graphql';
import WishListQuery from '../../queries/getWishlist.graphql';
import cedClasses from './wishlist.css';
import { useAccountTrigger } from '@magento/peregrine/lib/talons/Header/useAccountTrigger';
import { guestWishlistAddToLocalStorage, guestWishlistRemoveFromLocalStorage, guestWishlistGetFromLocalStorage } from '../../util/helperFunction';
import { globalContext } from '../../peregrine/lib/context/global.js';

// const AccountMenu = React.lazy(() => import('../AccountMenu'));

export default function Wishlist(props) {
    const { value, isOpen } = props;
    const classes = mergeClasses(cedClasses, props.classes);

    const { dispatch } = useContext(globalContext);
    const [{ isSignedIn }] = useUserContext();
    const [, { addToast }] = useToasts();
    const [addWisList, setAddWishList] = useState(false);
    const [guestUserAddedWishlistProduct, setGuestUserAddedWishlistProduct] = useState();
    const [guestUserRemovedWishlistProduct, setGuestUserRemovedWishlistProduct] = useState();

    const guestWishListData = localStorage.getItem('guest_wishlist')

    useEffect(() => {
        if (!isSignedIn) {
            const result = JSON.parse(guestWishListData)?.some(item => item?.sku === value?.sku)
            setAddWishList(result)
        }
    }, [isOpen, isSignedIn])

    const talonProps = useAccountTrigger();
    const { accountMenuTriggerRef } = talonProps;

    const wishlistProps = useWishlist({
        query: WishListQuery
    });
    const { data, refetch } = wishlistProps;

    const addItemToWishlistTalonProps = useAddItemToWishlist({
        customerQuery: GET_CUSTOMER_QUERY,
        query: ADD_TO_WISHLIST_MUTATION
    });
    const { addItemToWishlist, wishlistResponse } = addItemToWishlistTalonProps;

    const addtowishlist = async product_id => {
        await addItemToWishlist({
            product_id: product_id
        });
    };

    const deleteData = useDeleteFromWishlist({
        query: REMOVE_FROM_WISHLIST_MUTATION,
        customerQuery: GET_CUSTOMER_QUERY
    });
    const { handleRemoveItem, removeResponse } = deleteData;
    const removeFromWishlist = async product_id => {
        await handleRemoveItem({
            product_id: product_id
        });
    };

    useEffect(() => {
        if (typeof data != 'undefined' && data?.length && isSignedIn && value?.id) {
            const isExistInWishlist = data.some(
                itemDetail => itemDetail?.product?.id === +value?.id &&
                    itemDetail?.product?.sku === value?.sku
            );
            setAddWishList(isExistInWishlist);
        } else if (!isSignedIn && value && value.id) {
            const result = guestWishlistGetFromLocalStorage(value.id)
            setAddWishList(typeof result === 'boolean' ? result : typeof result === 'object' && result && result.length ? true : false)
        }
    }, [data, isSignedIn, value])

    useEffect(() => {
        let hasRun = false;

        const runEffectOnce = () => {
            if (!hasRun) {
                const response = addWisList
                    ? wishlistResponse?.addItemToWishlist
                    : removeResponse?.removeFromWishlist;

                if (response?.success) {
                    addToast({
                        type: 'info',
                        message: response.message,
                        dismissable: true,
                        timeout: 5000
                    });
                    refetch();
                    setAddWishList(addWisList);
                }

                hasRun = true;
            }
        };

        runEffectOnce();
    }, [addToast, wishlistResponse, removeResponse, refetch, addWisList]);

    useEffect(() => {
        if (!isSignedIn) {
            let message = '';

            if (guestUserAddedWishlistProduct?.name) {
                message = `${guestUserAddedWishlistProduct.name} added to wishlist.`;
                setGuestUserAddedWishlistProduct();
            } else if (guestUserRemovedWishlistProduct?.name) {
                message = `${guestUserRemovedWishlistProduct.name} removed from wishlist.`;
                setGuestUserRemovedWishlistProduct();
            }

            if (message) {
                addToast({
                    type: 'info',
                    message,
                    dismissable: true,
                    timeout: 5000
                });
            }
        }
    }, [guestUserAddedWishlistProduct, guestUserRemovedWishlistProduct, isSignedIn]);

    useEffect(() => {
        if (!isSignedIn) {
            const resultGuestWishlistData = localStorage.getItem('guest_wishlist');
            const guestWishlistData = resultGuestWishlistData ? JSON.parse(resultGuestWishlistData) : []
            dispatch({
                type: 'WISHLIST_COUNT',
                payload: guestWishlistData.length
            });
        }
    }, [addWisList])

    return (
        <>
            <div className={classes.wishlist_carousel_Wrap}>
                <section
                    className={
                        addWisList
                            ? classes.wishlist_addition +
                            ' ' +
                            classes.wishlist_added
                            : classes.wishlist_addition
                    }
                    ref={accountMenuTriggerRef}
                >
                    <button
                        className={classes.wishlist_icon_wrap}
                        onClick={() => {
                            if (isSignedIn) {
                                if (!addWisList) {
                                    addtowishlist(value.id);
                                    setAddWishList(true);
                                } else {
                                    removeFromWishlist(value.id);
                                    setAddWishList(false);
                                }
                            } else {
                                const guestAction = addWisList
                                    ? guestWishlistRemoveFromLocalStorage
                                    : guestWishlistAddToLocalStorage;

                                if (!addWisList) {
                                    setGuestUserAddedWishlistProduct(value);
                                } else {
                                    setGuestUserRemovedWishlistProduct(value);
                                }

                                guestAction(addWisList ? value?.id : value);
                                setAddWishList(!addWisList);
                            }
                        }}
                    >
                        <FontAwesomeIcon
                            color={addWisList ? 'red' : ''}
                            icon={faHeart}
                        />
                    </button>
                </section>
                {/* <Suspense fallback={null}>
                    <AccountMenu
                        ref={accountMenuRef}
                        accountMenuIsOpen={accountMenuIsOpen}
                        setAccountMenuIsOpen={setAccountMenuIsOpen}
                        handleTriggerClick={handleTriggerClick}
                        faHeart={faHeart}
                    />
                </Suspense> */}
            </div>
        </>
    );
}
