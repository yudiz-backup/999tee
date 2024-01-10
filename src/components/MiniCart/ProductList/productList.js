import React, { useMemo, /* Suspense */ } from 'react';
import { string, func, arrayOf, shape, number } from 'prop-types';

import Item from './item';
import { mergeClasses } from '../../../classify';
import defaultClasses from './productList.css';
// import EditModal from '../../CartPage/ProductListing/EditModal';
// import { stockStatusLabel } from '../../../util/constant';
const ProductList = props => {
    const {
        items,
        handleRemoveItem,
        classes: propClasses,
        closeMiniCart,
        setIsOpen,
        loading,
        setActiveEditItem,
        activeEditItem,
        // setIsCartUpdating,
        setIsPriceUpdating = () => { },
        setId,
        miniCartRefect = () => { },
        wishlistData = [],
        setIsItemLoadingWhileShippingApplied = () => { }
        // cartDetails
    } = props;
    const classes = mergeClasses(defaultClasses, propClasses);


    const cartItems = useMemo(() => {
        if (items) {
            return items?.slice(0)?.sort((a, b) =>
                b?.id - a?.id)?.map(item => (
                    <>
                        <Item
                            activeEditItem={activeEditItem}
                            key={item.id}
                            data={item}
                            {...item}
                            ItemID={item.id}
                            closeMiniCart={closeMiniCart}
                            handleRemoveItem={handleRemoveItem}
                            setIsOpen={setIsOpen}
                            loading={loading}
                            setActiveEditItem={setActiveEditItem}
                            setId={setId}
                            setIsPriceUpdating={setIsPriceUpdating}
                            miniCartRefect={miniCartRefect}
                            wishlistData={wishlistData}
                            setIsItemLoadingWhileShippingApplied={setIsItemLoadingWhileShippingApplied}
                        // cartDetails={cartDetails}
                        />
                    </>

                ));
        }
    }, [items, handleRemoveItem, closeMiniCart, wishlistData]);

    return <>
        {/* <div style={{padding: '0px 15px'}}>
            {
                items?.filter(item => item?.configured_variant?.stock_status === "OUT_OF_STOCK")?.length !== 0 ?
                    <p className='text-danger m-0'>
                        Some of your items in cart are {stockStatusLabel["OUT_OF_STOCK"]}. Please remove them to proceed further.
                    </p>
                    : ""
            }
        </div> */}
        <div className={classes.root}>{cartItems}</div>
        {/* <Suspense fallback={null}>
                    <EditModal
                        item={activeEditItem}
                        setIsCartUpdating={setIsCartUpdating}
                    />
                </Suspense> */}
    </>;
};

export default ProductList;

ProductList.propTypes = {
    classes: shape({ root: string }),
    items: arrayOf(
        shape({
            product: shape({
                name: string,
                thumbnail: shape({
                    url: string
                })
            }),
            id: string,
            quantity: number,
            configurable_options: arrayOf(
                shape({
                    label: string,
                    value: string
                })
            ),
            prices: shape({
                price: shape({
                    value: number,
                    currency: string
                })
            })
        })
    ),
    handleRemoveItem: func
};
