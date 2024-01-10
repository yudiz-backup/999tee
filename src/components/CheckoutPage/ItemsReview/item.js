import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useMutation } from '@apollo/client';
import ProductOptions from '../../LegacyMiniCart/productOptions';
import CustomProductOptions from '../../CartPage/ProductListing/productOptions';
import BundleProductOptions from '../../CartPage/ProductListing/bundleOptions';
// import { useCartContext } from '@magento/peregrine/lib/context/cart';
// import { REMOVE_ITEM_MUTATION } from '../../LegacyMiniCart/cartOptions.gql';
import Image from '../../Image';
import { mergeClasses } from '../../../classify';
import defaultClasses from './item.css';
import { Form } from 'informed';
import QuantityFields from '../../CartPage/ProductListing/quantity';
import { UPDATE_QUANTITY_MUTATION } from '../../CartPage/ProductListing/product';
import DeleteModal from '../../DeleteModal';
import { Trash as TrashIcon } from 'react-feather';
import Icon from '../../Icon';
import { useHistory } from 'react-router-dom';
// import { useItem } from '@magento/peregrine/lib/talons/MiniCart/useItem';
import { REMOVE_ITEM_MUTATION } from '../../MiniCart/miniCart.gql'
import { useToasts } from '@magento/peregrine';
import { deriveErrorMessage } from '@magento/peregrine/lib/util/deriveErrorMessage';
import { SET_SHIPPING_METHOD_MUTATION } from '../../CartPage/PriceAdjustments/ShippingMethods/shippingRadios';
import { globalContext } from '../../../peregrine/lib/context/global';

const Item = props => {
    const history = useHistory();
    const [, { addToast }] = useToasts();
    // const [{ cartId }] = useCartContext();
    const [categoryFlag, setCategoryFlag] = useState(false);
    const [isErrorQty, setIsErrorQty] = useState(false);
    const { dispatch } = useContext(globalContext);
    const [errorMes, setErrorMes] = useState('')
    const {
        classes: propClasses,
        product,
        itme,
        quantity: initialValue,
        configurable_options,
        isHidden,
        customizable_options,
        bundle_options,
        // item_image,
        id,
        ItemID,
        prices,
        isDisplayOnlyMode = false,
        quantity,
        setIsPriceSummaryLoading = () => { },
        setIsDeleteItemLoading,
        options,
        setIsItemDeleted = () => { },
        setIsItemUpdates = () => { }
    } = props;

    useEffect(() => {
        if (itme?.configured_variant?.stock_status === "OUT_OF_STOCK") {
            history.push("/")
        }
    }, [itme])

    const [
        setShippingMethod,
    ] = useMutation(SET_SHIPPING_METHOD_MUTATION, {
        // onCompleted: () => {
        //     setShippingcalled(true)
        // }
    });
    const [updateItemQuantity, { loading: updateItemQuantityLoading/* , error: updateErrorMessage  */ }] = useMutation(UPDATE_QUANTITY_MUTATION, {
        onCompleted: (data) => {
            // miniCartRefect()
            // setIsCartUpdating(true)
            // setIsPriceUpdating(false)
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
        }
    });
    const classes = mergeClasses(defaultClasses, propClasses);
    const className = isHidden ? classes.root_hidden : classes.root;
    const handleUpdateItemQuantity = async qty => {
        try {
            await updateItemQuantity({
                variables: {
                    cartId: localStorage.getItem('cart_id'),
                    itemId: ItemID,
                    quantity: qty
                }
            });
        } catch (err) {
            setErrorMes(err)
        }
    };
    const derivedErrorMessage = useMemo(() => {
        return (
            (errorMes &&
                deriveErrorMessage([errorMes])) ||
            ''
        );
    }, [errorMes]);
    useEffect(() => {
        if (derivedErrorMessage) {
            addToast({
                type: 'error',
                message: derivedErrorMessage,
                dismissable: true,
                timeout: 5000
            });
        }
    }, [derivedErrorMessage])
    useEffect(() => {
        if (updateItemQuantityLoading) {
            setIsItemUpdates(updateItemQuantityLoading)
        }
    }, [updateItemQuantityLoading])
    const [
        removeItem,
        {
            loading

            // loading: removeItemLoading,
            // called: removeItemCalled,
            // error: removeItemError
        }

    ] = useMutation(REMOVE_ITEM_MUTATION, {
        onCompleted: data => {
            setIsItemDeleted(true)
        }
    });


    const handleRemoveItem = async (id) => {
        try {
            const result = await removeItem({
                variables: {
                    cartId: localStorage.getItem('cart_id'),
                    itemId: id
                }
            });
            if (!result || !result.data || !result.data.removeItemFromCart || !result.data.removeItemFromCart.cart || !result.data.removeItemFromCart.cart.items || !result.data.removeItemFromCart.cart.items.length) {
                history.push('/');
            }
        } catch (e) {
            console.log('e', e)
            // Error is logged by apollo link - no need to double log.
        }
    }

    const rootClass = loading ? classes.root_disabled : classes.root;

    useEffect(() => {
        setIsPriceSummaryLoading(updateItemQuantityLoading)
    }, [updateItemQuantityLoading])

    useEffect(() => {
        setIsDeleteItemLoading(loading)
    }, [loading])
    return (
        <div className={`${className} ${rootClass}`}>
            <Image
                alt={itme?.name}
                classes={{ root: classes.thumbnail }}
                width={100}
                resource={itme?.item_image || itme?.image}
            />

            {/* <span className={classes.name}>{product.name}</span> */}
            <div className={classes.checkout_section}>
                <div>
                    {!isDisplayOnlyMode ? (
                        <div className={classes.delete_item}>
                            <span className={classes.name}>{itme?.name || product?.name}</span>
                            <div className={classes.iconBlock}>
                                <button
                                    onClick={() =>{
                                        setCategoryFlag(!categoryFlag)
                                        dispatch({ type: "SCROLL_DISABLE", payload: { scrollDisable: true } })
                                    }}
                                    type="button"
                                    className={classes.deleteButton}
                                    data-toggle="modal"
                                    data-target="#staticBackdrop"
                                >
                                    <Icon
                                        size={16}
                                        src={TrashIcon}
                                        classes={{ icon: classes.editIcon }}
                                    />
                                </button>
                                {categoryFlag && (
                                    <>
                                        <DeleteModal
                                            categoryFlag={categoryFlag}
                                            setCategoryFlag={setCategoryFlag}
                                            id={itme?.id}
                                            handleDeleteItem={() => handleRemoveItem(id)}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <strong>  <span style={{ paddingBottom: '6px', display: 'inline-block' }} className={''}>{itme?.name || product?.name}</span></strong>
                    )}
                    <div>
                        <div className={classes.product_details}>
                            <div className={classes.product_details_left}>
                                {/* <ProductOptions
                                    options={configurable_options}
                                    classes={{
                                        options: classes.options
                                    }}
                                /> */}
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
                                <ProductOptions
                                    options={configurable_options ? configurable_options || options : itme?.options}
                                    classes={{
                                        options: classes.options
                                    }}
                                />
                                <span className={classes.quantity}>
                                    {prices && prices.price ? '₹' + prices.price.value : itme?.price}
                                </span>
                            </div>
                            <div className={classes.qnty_price}>

                                {!isDisplayOnlyMode ? (
                                    <Form className={classes.checkout_qnty}>
                                        <QuantityFields
                                            classes={{
                                                root: classes.quantityRoot
                                            }}
                                            min={1}
                                            message={'Error'}
                                            initialValue={initialValue}
                                            itemId={ItemID}
                                            onChange={handleUpdateItemQuantity}
                                            setIsErrorQty={setIsErrorQty}
                                            isErrorQty={isErrorQty}
                                        />
                                    </Form>
                                ) : (
                                    <span className={classes.quantity}>
                                        {`Quantity :`} <span >{quantity || itme?.qty_ordered}</span>
                                    </span>
                                )}

                            </div>
                            <p>&nbsp;</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Item;
