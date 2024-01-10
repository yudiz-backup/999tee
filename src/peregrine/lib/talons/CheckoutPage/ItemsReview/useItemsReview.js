import { useEffect, useState } from 'react';
import { useLazyQuery } from '@apollo/client';

// import { useCartContext } from '@magento/peregrine/lib/context/cart';

export const useItemsReview = props => {
    const [showAllItems, setShowAllItems] = useState(false);
    const [itmeInCart, setItemInCart] = useState()
    const {
        queries: { getItemsInCart },
        isItemDeleted,
        setIsItemDeleted = () => { },
        isItemUpdated,
        setIsItemUpdates = () => { }
    } = props;

    // const [{ cartId }] = useCartContext();

    const [
        fetchItemsInCart,
        { error, /* loading,  */refetch }
    ] = useLazyQuery(getItemsInCart, {
        // fetchPolicy: 'cache-and-network',
        fetchPolicy: 'network-only',
        // fetchPolicy: 'no-cache',
        // nextFetchPolicy: "no-cache",
        onCompleted: (data) => {
            setItemInCart(data)
            setIsItemDeleted(false)
            setIsItemUpdates(false)
        }
    });
    // If static data was provided, use that instead of query data.
    const data = props.data || itmeInCart;

    // const setShowAllItemsFlag = useCallback(() => setShowAllItems(true), [
    //     setShowAllItems
    // ]);
    useEffect(() => {
        if (localStorage.getItem('cart_id') || !data || isItemDeleted === true || isItemUpdated === true) {
            fetchItemsInCart({
                variables: {
                    cartId: localStorage.getItem('cart_id')
                }
            });
        }
    }, [localStorage.getItem('cart_id'), data, isItemDeleted, isItemUpdated]);

    useEffect(() => {
        /**
         * If there are 2 or less than 2 items in cart
         * set show all items to `true`.
         */
        if (data && data.cart && data.cart.items.length > 1) {
            setShowAllItems(true);
        }
        if (data && data?.items > 1) {
            setShowAllItems(true);

        }
    }, [data]);
    const items = data && data?.cart ? data?.cart?.items : props?.data;

    const totalQuantity = data ? +data?.cart?.total_quantity : 0;
    return {
        // isLoading: !!loading,
        items,
        hasErrors: !!error,
        totalQuantity,
        showAllItems,
        setShowAllItems: setShowAllItems,
        refetch
    };
};
