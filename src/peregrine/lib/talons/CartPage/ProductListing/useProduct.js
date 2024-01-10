import { useCallback, useEffect, useMemo, useState, useContext } from 'react';
import { useMutation } from '@apollo/client';
import { useAppContext } from '@magento/peregrine/lib/context/app';
// import { useCartContext } from '@magento/peregrine/lib/context/cart';
import { deriveErrorMessage } from '@magento/peregrine/lib/util/deriveErrorMessage';
import { globalContext } from '../../../context/global.js';
import { SET_SHIPPING_METHOD_MUTATION } from '../../../../../components/CartPage/PriceAdjustments/ShippingMethods/shippingRadios'
/**
 * This talon contains logic for a product component used in a product listing component.
 * It performs effects and returns prop data for that component.
 *
 * This talon performs the following effects:
 *
 * - Manage the updating state of the cart while a product is being updated or removed
 * - Reset the current item being edited item when the app drawer is closed
 *
 * @function
 *
 * @param {Object} props
 * @param {ProductItem} props.item Product item data
 * @param {ProductMutations} props.mutations GraphQL mutations for a product in a cart
 * @param {function} props.setActiveEditItem Function for setting the actively editing item
 * @param {function} props.setIsCartUpdating Function for setting the updating state of the cart
 *
 * @return {ProductTalonProps}
 *
 * @example <caption>Importing into your project</caption>
 * import { useProduct } from '@magento/peregrine/lib/talons/CartPage/ProductListing/useProduct';
 */
export const useProduct = props => {
    const {
        item,
        mutations: { removeItemMutation, updateItemQuantityMutation },
        setActiveEditItem,
        setIsCartUpdating
    } = props;
    const { dispatch } = useContext(globalContext);
    const flatProduct = flattenProduct(item);

    const [
        setShippingMethod,
        { /* called: setShippingMethodCalled,  */loading: setShippingMethodLoading }
    ] = useMutation(SET_SHIPPING_METHOD_MUTATION);
    const [
        removeItem,
        {
            called: removeItemCalled,
            error: removeItemError,
            loading: removeItemLoading
        }
    ] = useMutation(removeItemMutation, {
        onCompleted: (data) => {
            if ((Array.isArray(data.removeItemFromCart.cart.items)) && data.removeItemFromCart.cart.items.length > 0) {
                if (data.removeItemFromCart.cart.shipping_addresses.length > 0) {
                    if (data.removeItemFromCart.cart.shipping_addresses[0].selected_shipping_method !== null) {
                        if (data.removeItemFromCart.cart.shipping_addresses[0].selected_shipping_method.carrier_code !== data.removeItemFromCart.cart.shipping_addresses[0].available_shipping_methods[0].carrier_code) {
                            setShippingMethod({
                                variables: {
                                    cartId: localStorage.getItem('cart_id'),
                                    shippingMethod: {
                                        carrier_code: data.removeItemFromCart.cart.shipping_addresses[0].available_shipping_methods[0].carrier_code,
                                        method_code: data.removeItemFromCart.cart.shipping_addresses[0].available_shipping_methods[0].method_code
                                    }
                                }
                            });
                        }
                    }
                    else if ((data.removeItemFromCart.cart.shipping_addresses[0].selected_shipping_method === null && data.removeItemFromCart.cart.shipping_addresses[0].available_shipping_methods.length > 0)) {
                        setShippingMethod({
                            variables: {
                                cartId: localStorage.getItem('cart_id'),
                                shippingMethod: {
                                    carrier_code: data.removeItemFromCart.cart.shipping_addresses[0].available_shipping_methods[0].carrier_code,
                                    method_code: data.removeItemFromCart.cart.shipping_addresses[0].available_shipping_methods[0].method_code
                                }
                            }
                        });
                    }
                }
                // setShippingMethod({
                //     variables: {
                //         cartId: localStorage.getItem('cart_id'),
                //         shippingMethod: {
                //             carrier_code: data.removeItemFromCart.cart.shipping_addresses[0].available_shipping_methods[0].carrier_code,
                //             method_code: data.removeItemFromCart.cart.shipping_addresses[0].available_shipping_methods[0].method_code
                //         }
                //     }   
                // });
            }
        }
    });

    const [
        updateItemQuantity,
        {
            loading: updateItemLoading,
            error: updateError,
            called: updateItemCalled
        }
    ] = useMutation(updateItemQuantityMutation, {
        onCompleted: (data) => {
            // if(data.updateCartItems.cart.shipping_addresses.length > 0){
            //     setShippingMethod({
            //         variables: {
            //             cartId: localStorage.getItem('cart_id'),
            //             shippingMethod: {
            //                 carrier_code: data.updateCartItems.cart.shipping_addresses[0].available_shipping_methods[0].carrier_code,
            //                 method_code: data.updateCartItems.cart.shipping_addresses[0].available_shipping_methods[0].method_code
            //             }
            //         }   
            //     });
            // }
            if (data.updateCartItems.cart.shipping_addresses.length > 0) {
                if (data.updateCartItems.cart.shipping_addresses[0].selected_shipping_method !== null) {
                    if (data.updateCartItems.cart.shipping_addresses[0].selected_shipping_method.carrier_code !== data.updateCartItems.cart.shipping_addresses[0].available_shipping_methods[0].carrier_code) {
                        setShippingMethod({
                            variables: {
                                cartId: localStorage.getItem('cart_id'),
                                shippingMethod: {
                                    carrier_code: data.updateCartItems.cart.shipping_addresses[0].available_shipping_methods[0].carrier_code,
                                    method_code: data.updateCartItems.cart.shipping_addresses[0].available_shipping_methods[0].method_code
                                }
                            }
                        });
                    }
                }
                else if ((data.updateCartItems.cart.shipping_addresses[0].selected_shipping_method === null && data.updateCartItems.cart.shipping_addresses[0].available_shipping_methods.length > 0)) {
                    setShippingMethod({
                        variables: {
                            cartId: localStorage.getItem('cart_id'),
                            shippingMethod: {
                                carrier_code: data.updateCartItems.cart.shipping_addresses[0].available_shipping_methods[0].carrier_code,
                                method_code: data.updateCartItems.cart.shipping_addresses[0].available_shipping_methods[0].method_code
                            }
                        }
                    });
                }
            }
        }
    });
    useEffect(() => {
        if (updateItemCalled || removeItemCalled || setShippingMethodLoading) {
            // If a product mutation is in flight, tell the cart.
            setIsCartUpdating(updateItemLoading || removeItemLoading || setShippingMethodLoading);
        }

        // Reset updating state on unmount
        return () => setIsCartUpdating(false);
    }, [
        removeItemCalled,
        removeItemLoading,
        setIsCartUpdating,
        updateItemCalled,
        updateItemLoading
    ]);

    // const [{ cartId }] = useCartContext();
    const [{ drawer }, { toggleDrawer }] = useAppContext();

    const [isFavorite, setIsFavorite] = useState(false);

    // Use local state to determine whether to display errors or not.
    // Could be replaced by a "reset mutation" function from apollo client.
    // https://github.com/apollographql/apollo-feature-requests/issues/170
    const [displayError, setDisplayError] = useState(false);
    const derivedErrorMessage = useMemo(() => {
        dispatch({
            type: "DISABLE_CHECKOUT_BUTTON",
            payload: { disable: (displayError &&
                deriveErrorMessage([updateError, removeItemError])) ||
            '' }
        })
        return (
            (displayError &&
                deriveErrorMessage([updateError, removeItemError])) ||
            ''
        );
    }, [displayError, removeItemError, updateError]);

    const handleToggleFavorites = useCallback(() => {
        setIsFavorite(!isFavorite);
    }, [isFavorite]);

    const handleEditItem = useCallback(() => {
        setActiveEditItem(item);
        toggleDrawer('product.edit');

        // If there were errors from removing/updating the product, hide them
        // when we open the modal.
        setDisplayError(false);
    }, [item, setActiveEditItem, toggleDrawer]);

    useEffect(() => {
        if (drawer === null) {
            setActiveEditItem(null);
        }
    }, [drawer, setActiveEditItem]);

    const handleRemoveFromCart = useCallback(() => {
        try {
            removeItem({
                variables: {
                    cartId: localStorage.getItem('cart_id'),
                    itemId: item.id
                }
            });
        } catch (err) {
            // Make sure any errors from the mutation are displayed.
            setDisplayError(true);
        }
    }, [localStorage.getItem('cart_id'), item.id, removeItem]);

    const handleUpdateItemQuantity = useCallback(
        async quantity => {
            try {
                await updateItemQuantity({
                    variables: {
                        cartId: localStorage.getItem('cart_id'),
                        itemId: item.id,
                        quantity
                    }
                });
            } catch (err) {
                // Make sure any errors from the mutation are displayed.
                setDisplayError(true);
            }
        },
        [localStorage.getItem('cart_id'), item.id, updateItemQuantity]
    );

    return {
        errorMessage: derivedErrorMessage,
        handleEditItem,
        handleRemoveFromCart,
        handleToggleFavorites,
        handleUpdateItemQuantity,
        isEditable: !!flatProduct.options.length,
        isFavorite,
        product: flatProduct,
        setIsFavorite
    };
};

const flattenProduct = item => {
    const {
        configurable_options: options = [],
        prices,
        product,
        quantity
    } = item;

    const { price } = prices;
    const { value: unitPrice, currency } = price;

    const {
        name,
        small_image,
        stock_status: stockStatus,
        url_key: urlKey,
        url_suffix: urlSuffix,
        id,
        sku
    } = product;
    const { url: image } = small_image;

    return {
        currency,
        image,
        name,
        options,
        quantity,
        stockStatus,
        unitPrice,
        urlKey,
        urlSuffix,
        id,
        sku
    };
};

/** JSDocs type definitions */

/**
 * GraphQL mutations for a product in a cart.
 * This is a type used by the {@link useProduct} talon.
 *
 * @typedef {Object} ProductMutations
 *
 * @property {GraphQLAST} removeItemMutation Mutation for removing an item in a cart
 * @property {GraphQLAST} updateItemQuantityMutation Mutation for updating the item quantity in a cart
 *
 * @see [product.js]{@link https://github.com/magento/pwa-studio/blob/develop/packages/venia-ui/lib/components/CartPage/ProductListing/product.js}
 * to see the mutations used in Venia
 */

/**
 * Object type returned by the {@link useProduct} talon.
 * It provides prop data for rendering a product component on a cart page.
 *
 * @typedef {Object} ProductTalonProps
 *
 * @property {String} errorMessage Error message from an operation perfored on a cart product.
 * @property {function} handleEditItem Function to use for handling when a product is modified.
 * @property {function} handleRemoveFromCart Function to use for handling the removal of a cart product.
 * @property {function} handleToggleFavorites Function to use for handling favorites toggling on a cart product.
 * @property {function} handleUpdateItemQuantity Function to use for handling updates to the product quantity in a cart.
 * @property {boolean} isEditable True if a cart product is editable. False otherwise.
 * @property {boolean} isFavorite True if the cart product is a favorite product. False otherwise.
 * @property {ProductItem} product Cart product data
 */

/**
 * Data about a product item in the cart.
 * This type is used in the {@link ProductTalonProps} type returned by the {@link useProduct} talon.
 *
 * @typedef {Object} ProductItem
 *
 * @property {String} currency The currency associated with the cart product
 * @property {String} image The url for the cart product image
 * @property {String} name The name of the product
 * @property {Array<Object>} options A list of configurable option objects
 * @property {number} quantity The quantity associated with the cart product
 * @property {number} unitPrice The product's unit price
 * @property {String} urlKey The product's url key
 * @property {String} urlSuffix The product's url suffix
 */
