import React, { useState, useEffect, useContext } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import wrapperCategoryData from '../../../queries/giftWarp/wrapperCategorydata.graphql'
import wrapperCategoryId from '../../../queries/giftWarp/wrapperCategoryId.graphql'
import getGiftWrapperDataById from '../../../queries/giftWarp/getGiftWrapperDataById.graphql'
import setWrapperAllCart from '../../../queries/giftWarp/setWrapperAllCart.graphql'
import giftWrapSpecifiedItem from '../../../queries/giftWarp/giftWrapSpecifiedItem.graphql'
import removeWrapperCartItem from '../../../queries/giftWarp/removeWrapperCartItem.graphql'
import removeWrapperAllCart from '../../../queries/giftWarp/removeWrapperAllCart.graphql'
import { useCartContext } from '@magento/peregrine/lib/context/cart';
import removeGiftWrapperSpecificIAlltem from '../../../queries/giftWarp/removeGiftWrapperSpecificIAlltem.graphql'
import { GET_CART_DETAILS } from '../../CartPage/cartPage.gql';
// import { globalContext } from '../../../peregrine/lib/context/global.js';
import { globalContext } from '../../../peregrine/lib/context/global.js';


export default function GiftModal(props) {
    const [{ cartId }] = useCartContext();
    const { dispatch } = useContext(globalContext)

    const { item,
        openModal,
        setGiftWrapperData,
        priceSummaryGiftWrapper,
        giftWrapperData,
        setAllCartGiftWrapper,
        giftWrapper,
        setIsCartUpdating,
        giftWrap,
        setClearAllCartWrapper,
        clearAllCartWrapper,
        removeSpicifieAllItems,
        setRemoveSpicifieAllItem,
        cartDetails,
        cartDetailsRefetch = () => { },
        cartItems
    } = props

    const [categoryId, setCategoryId] = useState()


    const [wrapperCategory, { data: categoryAllData }] = useLazyQuery(wrapperCategoryData, {
        fetchPolicy: "no-cache"
    })
    const [wrapperCategoryIds] = useLazyQuery(wrapperCategoryId, {
        fetchPolicy: "no-cache"
    })
    const [giftWrapperIds, { data: giftWrapperId }] = useLazyQuery(getGiftWrapperDataById, {
        fetchPolicy: "no-cache"
    })

    const [updateCartDetails] = useLazyQuery(GET_CART_DETAILS, {
        fetchPolicy: 'no-cache',
        // nextFetchPolicy: 'cache-first',
        skip: !localStorage.getItem('cart_id'),
        variables: { cartId: localStorage.getItem('cart_id') },
        onCompleted: (data) =>
            // console.log("data", data)

            dispatch({
                type: 'PRICE_SUMMARY_DETAIL',
                priceSummaryDetail: {
                    grandTotal: data.cart.prices.grand_total.value ? Math.floor(data.cart.prices.grand_total.value) : undefined,
                    // subTotal: priceDetail.subtotal ? priceDetail.subtotal : undefined
                }
            })
    });

    // const imageURL = "https://staging.999tee.com/pub/media/"

    const [wrapperAllCart, { loading: setWrapperLoading }] = useMutation(setWrapperAllCart, {
        fetchPolicy: "no-cache",
        onCompleted: (data) => {
            // updateCartDetails()
            cartDetailsRefetch()
            // localStorage.setItem("allCartGiftWrapper", JSON.stringify(data))
            setAllCartGiftWrapper(data)
        }
    })


    useEffect(() => {
        if (setWrapperLoading === true) {
            setIsCartUpdating(true)
        } else {
            setTimeout(() => {
                setIsCartUpdating(false)
            }, 2000)
        }
    }, [setWrapperLoading])

    const [specifiedItem, { loading: specificItemLoading }] = useMutation(giftWrapSpecifiedItem, {
        fetchPolicy: "no-cache",
        onCompleted: (data) => {
            // updateCartDetails()
            cartDetailsRefetch()
            if (data && data?.mpGiftWrapWrapperSet && data?.mpGiftWrapWrapperSet.item_id) {
                const otherGiftWrapperData = giftWrapperData?.filter(item => item && +item.id !== data.mpGiftWrapWrapperSet.item_id)
                // localStorage.setItem("giftWrapper", JSON.stringify([...otherGiftWrapperData, data]))
                setGiftWrapperData([...otherGiftWrapperData, data])
            }
        }
    })
    useEffect(() => {
        if (specificItemLoading === true) {
            setIsCartUpdating(true)
        } else {
            setTimeout(() => {
                setIsCartUpdating(false)
            }, 2000)
        }
    }, [specificItemLoading])

    const [removeWrapperSpecifieCartItem, { loading: removeLoading }] = useMutation(removeWrapperCartItem, {
        fetchPolicy: "no-cache",
        onCompleted: (data) => {
            // updateCartDetails()
            cartDetailsRefetch()
            if (data && data.mpGiftWrapWrapperRemove && data.mpGiftWrapWrapperRemove.item_id) {
                // const otherGiftWrapperData = giftWrapperData.filter(item => item.mpGiftWrapWrapperSet.item_id !== data.mpGiftWrapWrapperRemove.item_id)
                const otherGiftWrapperData = giftWrapperData?.filter(item => +item?.id !== data?.mpGiftWrapWrapperRemove?.item_id)
                setGiftWrapperData(otherGiftWrapperData)
                // localStorage.setItem("giftWrapper", JSON.stringify(otherGiftWrapperData))
                // const giftWrapperStorageData = JSON.parse(localStorage.getItem("giftWrapper"))
                // if (!giftWrapperStorageData || !giftWrapperStorageData.length) {
                //     localStorage.removeItem("giftWrapper")
                //     localStorage.removeItem('isChecked')
                // }

            }
        }
    })
    useEffect(() => {
        if (removeLoading === true) {
            setIsCartUpdating(true)
        } else {
            setTimeout(() => {
                setIsCartUpdating(false)
            }, 2000)
        }
    }, [removeLoading])
    const [removeAllCartWrapper, { loading: removeAllLoading }] = useMutation(removeWrapperAllCart, {
        fetchPolicy: "no-cache",
        onCompleted: (data) => {
            // updateCartDetails()
            cartDetailsRefetch()
            if (data || data.length) {
                // setAllCartGiftWrapper(localStorage.removeItem("allCartGiftWrapper"))
                setAllCartGiftWrapper([])
                localStorage.removeItem('isCheckedAllCart')
                setClearAllCartWrapper(false)
            }
        }
    })
    useEffect(() => {
        if (removeAllLoading === true) {
            setIsCartUpdating(true)
        } else {
            setTimeout(() => {
                setIsCartUpdating(false)
            }, 2000)
        }
    }, [removeAllLoading])
    const categoryData = categoryAllData &&
        categoryAllData?.mpGiftWrapCategories &&
        categoryAllData?.mpGiftWrapCategories?.items &&
        categoryAllData?.mpGiftWrapCategories?.items?.filter(status => status.status == 1)

    useEffect(() => {
        if (categoryData) {
            setCategoryId(categoryData[0].category_id)
        }
    }, [categoryData])

    useEffect(() => {
        if (categoryAllData) {
            wrapperCategoryIds({
                variables: {
                    id: Number(categoryId)
                }
            })
            giftWrapperIds({
                variables: {
                    id: Number(categoryId)
                }
            })
        }
    }, [categoryAllData, categoryId])



    useEffect(() => {
        if (giftWrap === 1) {
            giftWrapper()
            wrapperCategory()
            if (cartDetails) {
                wrapperAllCart({
                    variables: {
                        // cart_id: cartId.toString(),
                        cart_id: localStorage.getItem('cart_id'),
                        wrap_id: +wrapId || 1
                    }
                })

            }
        } else if (giftWrap !== 1) {
            giftWrapper()
            wrapperCategory()
            if (giftWrap === 1) setClearAllCartWrapper(true)
            if (giftWrap === 2) setClearAllCartWrapper(true)

            // removeAllCartWrapper({
            //     variables: {
            //         // cart_id: cartId.toString()
            //         cart_id: localStorage.getItem('cart_id')
            //     }
            // })
        }
    }, [giftWrap])

    const wrapId = giftWrapperId &&
        giftWrapperId?.mpGiftWrapWrapper &&
        +giftWrapperId?.mpGiftWrapWrapper?.wrap_id

    const [removeSpicifieAllItem] = useMutation(removeGiftWrapperSpecificIAlltem, {
        fetchPolicy: "no-cache",
        onCompleted: (data) => {
            // updateCartDetails()
            cartDetailsRefetch()
            if (giftWrap === 1 && localStorage.getItem('cart_id')) {
                wrapperAllCart({
                    variables: {
                        // cart_id: cartId.toString(),
                        cart_id: localStorage.getItem('cart_id'),
                        wrap_id: +wrapId || 1
                    }
                })
            }
            // localStorage.setItem("giftWrapper", JSON.stringify(data.mpGiftWrapWrapperRemoveItems))
            setGiftWrapperData([])
            setRemoveSpicifieAllItem(false)
            // if (!removeSpicifieAllItems) {
            localStorage.removeItem("giftWrapper")
            // }
        }
    })
    // useEffect(() => {
    //     if (giftWrap === 1 && wrapId && localStorage.getItem('cart_id')) {
    //         wrapperAllCart({
    //             variables: {
    //                 // cart_id: cartId.toString(),
    //                 cart_id: localStorage.getItem('cart_id'),
    //                 wrap_id: +wrapId
    //             }
    //         })
    //     }
    // }, [giftWrap])

    useEffect(() => {
        if ((giftWrap !== 1 && clearAllCartWrapper) || (giftWrap === null && clearAllCartWrapper) && cartItems?.length !== 1) {
            removeAllCartWrapper({
                variables: {
                    // cart_id: cartId.toString()
                    cart_id: localStorage.getItem('cart_id')
                }
            })
        }
    }, [giftWrap, clearAllCartWrapper])

    useEffect(() => {
        if (item && wrapId && localStorage.getItem("isChecked") === "true" && !priceSummaryGiftWrapper) {
            specifiedItem({
                variables: {
                    // cart_id: cartId.toString(),
                    cart_id: localStorage.getItem('cart_id'),
                    item_id: +item.id,
                    wrap_id: +wrapId,
                    message: ""
                }
            })
        }
    }, [openModal, wrapId, localStorage.getItem('cart_id'), item, priceSummaryGiftWrapper])

    useEffect(() => {
        if (((localStorage.getItem("isChecked") === "false") && localStorage.getItem('cart_id') && item)) {
            removeWrapperSpecifieCartItem({
                variables: {
                    // cart_id: cartId.toString(),
                    cart_id: localStorage.getItem('cart_id'),
                    item_id: +item.id || +item,
                }
            })
        }
    }, [localStorage.getItem('cart_id'), item, openModal])

    const dataIdAll = giftWrapperData.map(i => i &&
        +i?.id || (i?.mpGiftWrapWrapperSet &&
            i?.mpGiftWrapWrapperSet?.item_id))


    useEffect(() => {
        if (removeSpicifieAllItems === true) {
            removeSpicifieAllItem({
                variables: {
                    cart_id: cartId.toString(),
                    item_id: dataIdAll.filter(item => cartDetails?.items?.some(i => +i.id === item))
                }
            })
        }
    }, [removeSpicifieAllItems])

    return (
        <section>
        </section>
    )
}