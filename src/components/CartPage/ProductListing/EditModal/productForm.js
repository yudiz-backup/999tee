import React, { Fragment, useEffect } from 'react';
import { gql } from '@apollo/client';
import { Form } from 'informed';
// import { useProductForm } from '@magento/peregrine/lib/talons/CartPage/ProductListing/EditModal/useProductForm';
import { useProductForm } from '../../../../peregrine/lib/talons/CartPage/ProductListing/EditModal/useProductForm';
import { mergeClasses } from '../../../../classify';
import Button from '../../../Button';
import FormError from '../../../FormError';
import LoadingIndicator from '../../../LoadingIndicator';
import Options from '../../../ProductOptions';
import { QuantityFields } from '../quantity';
import defaultClasses from './productForm.css';
import { CartPageFragment } from '../../cartPageFragments.gql';
import cedClasses from '../../../ProductFullDetail/productFullDetail.css';

const ProductForm = props => {
    const { item: cartItem, setIsCartUpdating, setVariantPrice, handleCloseEvent, setImg } = props;

    const talonProps = useProductForm({
        cartItem,
        getConfigurableOptionsQuery: GET_CONFIGURABLE_OPTIONS,
        setIsCartUpdating,
        setVariantPrice,
        updateConfigurableOptionsMutation: UPDATE_CONFIGURABLE_OPTIONS_MUTATION,
        updateQuantityMutation: UPDATE_QUANTITY_MUTATION,
        handleCloseEvent
    });
    const {
        configItem,
        errors,
        handleOptionSelection,
        handleSubmit,
        isLoading,
        isSaving,
        selectedVariant,
    } = talonProps;

    useEffect(()=>{
if(selectedVariant?.product?.media_gallery_entries?.[0]?.file){
    setImg(selectedVariant?.product?.media_gallery_entries?.[0]?.file)
}
    },[selectedVariant])

    const classes = mergeClasses(defaultClasses, props.classes);

    const getSelectedOptions = configurableOptions => {
        const resultSelectedOptionMap = new Map();
        configurableOptions.forEach(item => {
            resultSelectedOptionMap.set(item.id.toString(), item.value_id);
        });
        return resultSelectedOptionMap;
    };

    if (isLoading || isSaving) {
        const message = isLoading
            ? 'Fetching Product Options...'
            : 'Updating Cart...';
        return (
            <div>
                <LoadingIndicator classes={{ root: classes.loading }}>
                    {message}
                </LoadingIndicator>
            </div>
        );
    }

    if (!configItem) {
        return (
            <span className={classes.dataError}>
                Something went wrong. Please refresh and try again.
            </span>
        );
    }

    var stockStatus = '';
    var animationStockClass = '';
    var stockClass = '';
    const selectedVariantStatus =
        selectedVariant &&
        selectedVariant.product &&
        selectedVariant.product.stock_status_data &&
        selectedVariant.product.stock_status_data.stock_status
            ? selectedVariant.product.stock_status_data.stock_status
            : undefined;

    if (selectedVariantStatus) {
        if (selectedVariantStatus === 'IN_STOCK') {
            stockClass = cedClasses.stock_info + ' ' + cedClasses.in_stock;
            stockStatus = 'In Stock';
            animationStockClass = cedClasses.animation_in_stock;
        } else if (selectedVariantStatus === 'LOW_STOCK') {
            stockStatus = `Low stock - ${selectedVariant.product
                .stock_status_data.qty || 0} items left`;
            stockClass = cedClasses.stock_info + ' ' + cedClasses.low_stock;
            animationStockClass = cedClasses.animation_low_stock;
        } else if (selectedVariantStatus === 'OUT_OF_STOCK') {
            stockStatus = 'Out Of Stock';
            stockClass = cedClasses.stock_info + ' ' + cedClasses.out_of_stock;
            // stockAlert = (
            //     <>
            //         <button type='button' data-toggle="modal" data-target=".bd-example-modal-lg">
            //             <span className={classes.notify_me}> Notify Me</span>
            //             <img
            //                 className={classes.popupbtn_img}
            //                 src="/cenia-static/icons/icons8-alarm-50.png"
            //                 alt="bell"
            //             />
            //         </button>
            //     </>
            // );
            animationStockClass = classes.animation_out_of_stock;
        }
    }

    return (
        <Fragment>
            <FormError
                classes={{ root: classes.errorContainer }}
                errors={Array.from(errors.values())}
                scrollOnError={false}
            />
            <div className={cedClasses.stock_display_section_sub_wrapper + ' ' + cedClasses.edit_indicator}>
                <span className={animationStockClass} />
                <span className={stockClass}>{stockStatus}</span>
            </div>
            <Form onSubmit={handleSubmit}>
                {configItem &&
                configItem.__typename === 'ConfigurableProduct' ? (
                    <>
                        <Options
                            classes={{ root: classes.optionRoot }}
                            onSelectionChange={handleOptionSelection}
                            options={configItem.configurable_options}
                            selectedValues={getSelectedOptions(
                                cartItem.configurable_options
                            )}
                        />
                    </>
                ) : (
                    <></>
                )}
                <h3 className={classes.quantityLabel}>Quantity</h3>
                <QuantityFields
                    classes={{ root: classes.quantityRoot }}
                    initialValue={cartItem.quantity}
                    itemId={cartItem.id}
                />
                <div className={classes.submit}>
                    <Button
                        priority="high"
                        type="submit"
                        disabled={selectedVariantStatus === 'OUT_OF_STOCK'}
                    >
                        Update
                    </Button>
                </div>
            </Form>
        </Fragment>
    );
};

export default ProductForm;

export const GET_CONFIGURABLE_OPTIONS = gql`
    query productDetailBySku($sku: String) {
        products(filter: { sku: { eq: $sku } }) {
            items {
                id
                sku
                ... on ConfigurableProduct {
                    configurable_options {
                        attribute_code
                        attribute_id
                        id
                        label
                        values {
                            default_label
                            label
                            store_label
                            use_default_value
                            value_index
                            swatch_data {
                                ... on ImageSwatchData {
                                    thumbnail
                                }
                                value
                            }
                        }
                    }
                    variants {
                        attributes {
                            code
                            value_index
                        }
                        product {
                            id
                             media_gallery_entries {
                            id
                            disabled
                            file
                            label
                            position
                        }
                            price {
                                regularPrice {
                                    amount {
                                        currency
                                        value
                                    }
                                }
                            }
                            sku
                            stock_status
                            only_x_left_in_stock
                            stock_status_data {
                                qty
                                low_stock_qty
                                stock_status
                            }
                        }
                    }
                }
            }
        }
    }
`;

export const UPDATE_QUANTITY_MUTATION = gql`
    mutation UpdateCartItemQuantity(
        $cartId: String!
        $cartItemId: Int!
        $quantity: Float!
    ) {
        updateCartItems(
            input: {
                cart_id: $cartId
                cart_items: [{ cart_item_id: $cartItemId, quantity: $quantity }]
            }
        ) @connection(key: "updateCartItems") {
            cart {
                id
                ...CartPageFragment
            }
        }
    }
    ${CartPageFragment}
`;

export const UPDATE_CONFIGURABLE_OPTIONS_MUTATION = gql`
    mutation UpdateConfigurableOptions(
        $cartId: String!
        $cartItemId: Int!
        $parentSku: String!
        $variantSku: String!
        $quantity: Float!
    ) {
        addConfigurableProductsToCart(
            input: {
                cart_id: $cartId
                cart_items: [
                    {
                        data: { quantity: $quantity, sku: $variantSku }
                        parent_sku: $parentSku
                    }
                ]
            }
        ) @connection(key: "addConfigurableProductsToCart") {
            cart {
                id
            }
        }

        removeItemFromCart(
            input: { cart_id: $cartId, cart_item_id: $cartItemId }
        ) @connection(key: "removeItemFromCart") {
            cart {
                id
                ...CartPageFragment
            }
        }
    }
    ${CartPageFragment}
`;
