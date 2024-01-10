import { useCallback, /* useEffect,  */useMemo/* , useState  */ } from 'react';
import { useHistory } from 'react-router-dom';
import { useQuery, useMutation/* , useLazyQuery */ } from '@apollo/client';
// import { useCartContext } from '@magento/peregrine/lib/context/cart';
import { deriveErrorMessage } from '@magento/peregrine/lib/util/deriveErrorMessage';
// import { SET_SHIPPING_METHOD_MUTATION } from '../../CartPage/PriceAdjustments/ShippingMethods/shippingRadios'
import { SET_SHIPPING_METHOD_MUTATION } from '../../../../components/CartPage/PriceAdjustments/ShippingMethods/shippingRadios'

/**
 *
 * @param {Function} props.setIsOpen - Function to toggle the mini cart
 * @param {DocumentNode} props.queries.miniCartQuery - Query to fetch mini cart data
 * @param {DocumentNode} props.mutations.removeItemMutation - Mutation to remove an item from cart
 *
 * @returns {
 *      closeMiniCart: Function,
 *      errorMessage: String,
 *      handleEditCart: Function,
 *      handleProceedToCheckout: Function,
 *      handleRemoveItem: Function,
 *      loading: Boolean,
 *      productList: Array<>,
 *      subTotal: Number,
 *      totalQuantity: Number
 *  }
 */
export const useMiniCart = props => {
    const { setIsOpen, queries, mutations, EMPTY_CART,/*  GET_CART_DETAILS,  */setIsCartEmptyFlag, /* setShippingAddressOnCartMutation,qtyupdate, */ setIsItemLoadingWhileShippingApplied = () => { } } = props;
    const { miniCartQuery } = queries;
    const { removeItemMutation } = mutations;
    // const [{ cartId }] = useCartContext();
    const history = useHistory();
    // const [data,setData]=useState([])
    const [
        setShippingMethod
    ] = useMutation(SET_SHIPPING_METHOD_MUTATION, {
        onCompleted: () => {
            setIsItemLoadingWhileShippingApplied(false)
        }
    });
    const { data: miniCartData, loading: miniCartLoading, refetch: miniCartRefect } = useQuery(
        miniCartQuery,
        {
            // fetchPolicy: 'cache-and-network',
            // nextFetchPolicy: 'cache-first',
            notifyOnNetworkStatusChange: true,
            fetchPolicy: 'network-only',
            variables: { cartId: localStorage.getItem('cart_id') },
            skip: !localStorage.getItem('cart_id'),
            onCompleted: (data) => {
                setIsItemLoadingWhileShippingApplied(true)
                if (data.cart.shipping_addresses.length > 0) {
                    if (data.cart.shipping_addresses[0].selected_shipping_method !== null) {
                        if (data.cart.shipping_addresses[0].selected_shipping_method.carrier_code !== data.cart.shipping_addresses[0].available_shipping_methods[0].carrier_code) {
                            setShippingMethod({
                                variables: {
                                    cartId: localStorage.getItem('cart_id'),
                                    shippingMethod: {
                                        carrier_code: data.cart.shipping_addresses[0].available_shipping_methods[0].carrier_code,
                                        method_code: data.cart.shipping_addresses[0].available_shipping_methods[0].method_code
                                    }
                                }
                            });
                        } else {
                            setIsItemLoadingWhileShippingApplied(false)
                        }
                    }
                    else if ((data.cart.shipping_addresses[0].selected_shipping_method === null && data.cart.shipping_addresses[0].available_shipping_methods.length > 0)) {
                        setShippingMethod({
                            variables: {
                                cartId: localStorage.getItem('cart_id'),
                                shippingMethod: {
                                    carrier_code: data.cart.shipping_addresses[0].available_shipping_methods[0].carrier_code,
                                    method_code: data.cart.shipping_addresses[0].available_shipping_methods[0].method_code
                                }
                            }
                        });
                    } else {
                        setIsItemLoadingWhileShippingApplied(false)
                    }
                } else {
                    setIsItemLoadingWhileShippingApplied(false)
                }
            }
        }
    );
    //   const [runQuery, { data: miniCartData, loading: miniCartLoading, refetch: miniCartRefect }] = useLazyQuery(miniCartQuery, {
    //     fetchPolicy: 'network-only',
    //         variables: { cartId: localStorage.getItem('cart_id') },
    //         skip: !localStorage.getItem('cart_id'),
    //         notifyOnNetworkStatusChange: true,
    //   }); 
    //   useEffect(()=>{   
    //     runQuery()
    //   },[localStorage.getItem('cart_id')])

    const [emptyCart, { loading: emptycartLoading, data: emptyCartMessage }] = useMutation(
        EMPTY_CART,
        {
            onCompleted: data => {
                if (data) {
                    setIsCartEmptyFlag(true)
                }
            }
        }
    );

    // useEffect(()=>{

    // },[emptyCartMessage])

    const [
        removeItem,
        {
            loading: removeItemLoading,
            called: removeItemCalled,
            error: removeItemError
        }
    ] = useMutation(removeItemMutation);

    const totalQuantity = useMemo(() => {
        if (!miniCartLoading && miniCartData) {
            return miniCartData.cart.total_quantity;
        }
        else if (miniCartData?.cart?.total_quantity) {
            return miniCartData?.cart?.total_quantity;
        }
    }, [miniCartData, miniCartLoading]);

    const subTotal = useMemo(() => {
        if (!miniCartLoading && miniCartData) {
            try {
                return miniCartData.cart.prices.subtotal_excluding_tax;
            } catch (error) {

                ('[Error] -> subTotal : ', error)
            }
        }
        else if (miniCartData?.cart?.prices?.subtotal_excluding_tax) {
            return miniCartData.cart.prices.subtotal_excluding_tax
        }
    }, [miniCartData, miniCartLoading]);

    const productList = useMemo(() => {
        if (!miniCartLoading && miniCartData) {
            return miniCartData.cart.items;
        }
        else if (miniCartData?.cart?.items) {
            return miniCartData?.cart?.items;
        }
    }, [miniCartData, miniCartLoading]);

    const closeMiniCart = useCallback(() => {
        setIsOpen(false);
    }, [setIsOpen]);

    const handleRemoveItem = useCallback(
        async (id) => {
            try {
                await removeItem({
                    variables: {
                        cartId: localStorage.getItem('cart_id'),
                        itemId: id
                    }
                });
            } catch (e) {
                // Error is logged by apollo link - no need to double log.
            }
        },
        [localStorage.getItem('cart_id'), removeItem]
    );

    const handleProceedToCheckout = useCallback(async () => {
        await setIsOpen(false);
        history.push('/checkout');
    }, [history, setIsOpen]);

    const handleEditCart = useCallback(async () => {
        await setIsOpen(false);
        history.push('/cart');
    }, [history, setIsOpen]);

    const derivedErrorMessage = useMemo(
        () => deriveErrorMessage([removeItemError]),
        [removeItemError]
    );

    return {
        closeMiniCart,
        errorMessage: derivedErrorMessage,
        handleEditCart,
        handleProceedToCheckout,
        handleRemoveItem,
        loading: miniCartLoading || (removeItemCalled && removeItemLoading),
        loader: miniCartLoading,
        productList,
        subTotal,
        totalQuantity,
        miniCartData,
        emptyCart,
        emptycartLoading,
        emptyCartMessage,
        miniCartRefect
    };
};
