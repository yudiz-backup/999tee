import { useState, useLayoutEffect } from "react";

const guestWishlistKeyNameInLocalStorage = 'guest_wishlist';

export const guestWishlistAddToLocalStorage = (productDetail) => {
    if (productDetail && productDetail.id) {
        const existData = localStorage.getItem(guestWishlistKeyNameInLocalStorage)
        const parsedData = JSON.parse(existData)
        if (parsedData && parsedData.length) {
            const isAlreadyExist = parsedData.some(item => item.id === productDetail.id)
            if (!isAlreadyExist) {
                localStorage.setItem(guestWishlistKeyNameInLocalStorage, JSON.stringify([...parsedData, productDetail]))
            }
        } else {
            localStorage.setItem(guestWishlistKeyNameInLocalStorage, JSON.stringify([productDetail]))
        }
    }
}

export const guestWishlistRemoveFromLocalStorage = (productId) => {
    if (productId) {
        const existData = localStorage.getItem(guestWishlistKeyNameInLocalStorage)
        const parsedData = JSON.parse(existData)
        if (parsedData && parsedData.length) {
            const filteredData = parsedData.filter(item => item.id !== productId)
            localStorage.setItem(guestWishlistKeyNameInLocalStorage, JSON.stringify(filteredData))
        }
    }
}

export const guestWishlistGetFromLocalStorage = (productId) => {
    const existData = localStorage.getItem(guestWishlistKeyNameInLocalStorage)
    const parsedData = JSON.parse(existData)
    if (productId && parsedData && parsedData.length) {
        return parsedData.some(item => item.id === productId)
    }
    return parsedData
}

export const isMobileView = () => {
    const [screenWidth, setScreenWidth] = useState(1024);
    const mobileView = screenWidth <= 767 ? true : false;

    useLayoutEffect(() => {
        function updateWidth() {
            setScreenWidth(window.innerWidth);
        }
        window.addEventListener('resize', updateWidth);
        updateWidth();
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    return mobileView;
}

export const handleCartNotification = (flag ,dispatch, name) => {
            dispatch({
                type: 'ADD_TO_CART_NOTIFICATION',
                payload: {addToCartNotification : flag,  productName : name}
            })
}