import React, { Fragment, Suspense, useContext, useEffect, useState } from 'react';
import { useProductListing } from 'src/peregrine/lib/talons/CartPage/ProductListing/useProductListing';
import { mergeClasses } from '../../../classify';
// import LoadingIndicator from '../../LoadingIndicator';
import defaultClasses from './productListing.css';
import Product from './product';
import { ProductListingFragment } from './productListingFragments';
import Button from '../../Button/button.js';
import { FormattedMessage } from 'react-intl';
import { Check, Trash as TrashIcon, } from 'react-feather';
// import Checkbox from '../../Checkbox';
import Icon from '../../Icon';
import DeleteModal from '../../DeleteModal'
import { useMutation, gql } from '@apollo/client';
// import { stockStatusLabel } from '../../../util/constant';
import { REMOVE_COUPON_MUTATION } from '../PriceAdjustments/CouponCode/couponCode';
import { globalContext } from '../../../peregrine/lib/context/global';
import EmptyBag from '../../EmptyBag';


/**
 * A child component of the CartPage component.
 * This component renders the product listing on the cart page.
 *
 * @param {Object} props
 * @param {Function} props.setIsCartUpdating Function for setting the updating state of the cart.
 * @param {Object} props.classes CSS className overrides.
 * See [productListing.css]{@link https://github.com/magento/pwa-studio/blob/develop/packages/venia-ui/lib/components/CartPage/ProductListing/productListing.css}
 * for a list of classes you can override.
 *
 * @returns {React.Element}
 *
 * @example <caption>Importing into your project</caption>
 * import ProductListing from "@magento/venia-ui/lib/components/CartPage/ProductListing";
 */
const EditModal = React.lazy(() => import('./EditModal'));

const ProductListing = props => {
    const { setIsCartUpdating,
        isCartUpdating,
        setOpenModel,
        giftWrapperData,
        setSelectedItem,
        giftModel,
        openModal,
        selectedItem,
        wrapperStatusPerItem,
        giftWrapperClasses,
        // productClasses,
        // allCartGiftWrapper,
        allCart,
        cartItems,
        // setAllCartGiftData,
        // allCartGiftData,
        // isChecked,
        // setIsChecked,
        wrapperStatusEnabled,
        // setPriceSummaryGiftWrapper,
        priceSummaryGiftWrapper,
        setGiftWrapperData,
        giftWrap,
        setGiftWrap,
        setClearAllCartWrapper,
        // clearAllCartWrapper,
        setRemoveSpicifieAllItem,
        wishlistData,
        emptyCart
    } = props;
    const { state, dispatch } = useContext(globalContext);
    const [deleteFlag, setDeleteFlag] = useState(false);
    const allCartWrapperName = allCart &&
        allCart.mp_gift_wrap_data &&
        allCart.mp_gift_wrap_data.name

    const allCartWrapperPrice = allCart &&
        allCart.mp_gift_wrap_data &&
        allCart.mp_gift_wrap_data.price

    const talonProps = useProductListing({
        queries: {
            getProductListing: GET_PRODUCT_LISTING
        }
    });

    const { activeEditItem, /* isLoading,  */items, setActiveEditItem } = talonProps;

    const classes = mergeClasses(defaultClasses, props.classes)

    const [
        removeCoupon
    ] = useMutation(REMOVE_COUPON_MUTATION);
    useEffect(() => {
        if (cartItems && cartItems.length === 1) {
            setGiftWrap(null)
            localStorage.removeItem("allCartGiftWrapper")
        }
    }, [cartItems])

    // if (isLoading || getProductsLoading ) {
    //     return <LoadingIndicator>{`Fetching Cart...`}</LoadingIndicator>;
    // }

    if (items.length) {
        const productComponents = items?.slice()?.sort((a, b) =>
            b?.id - a?.id)?.map(product => (
                <Product
                    isCartUpdating={isCartUpdating}
                    item={product}
                    key={product.id}
                    setActiveEditItem={setActiveEditItem}
                    setIsCartUpdating={setIsCartUpdating}
                    setSelectedItem={setSelectedItem}
                    selectedItem={selectedItem}
                    giftWrapperData={giftWrapperData}
                    setOpenModel={setOpenModel}
                    openModal={openModal}
                    wrapperStatusPerItem={wrapperStatusPerItem}
                    wrapperStatusEnabled={wrapperStatusEnabled}
                    setGiftWrapperData={setGiftWrapperData}
                    priceSummaryGiftWrapper={priceSummaryGiftWrapper}
                    cartItems={cartItems}
                    giftWrap={giftWrap}
                    wishlistData={wishlistData}
                />
            ));

        const handleChange = (e) => {
            if (+e.target.value === 1 && giftWrap === 2) {
                setRemoveSpicifieAllItem(true)
            }
            setGiftWrap(Number(e.target.value))

        }
        localStorage.setItem("wrapperRadioButtonValue", +giftWrap)

        const handleClear = () => {
            setGiftWrap(null)
            if (giftWrap === 1) {
                setClearAllCartWrapper(true)
            }
            else {
                setRemoveSpicifieAllItem(true)
            }
        }

        const handleEmptyCart = () => {
            setDeleteFlag(true)
            dispatch({ type: "SCROLL_DISABLE", payload: { scrollDisable: true } })
        }
        const handleEmptyCartDelete = () => {
            setDeleteFlag(false)
            const cart_id = localStorage.getItem('cart_id')
            if (cart_id) {
                emptyCart({ variables: { cartId: cart_id } })
                if (state?.coupon_code?.coupon_code) {
                    removeCoupon({
                        variables: {
                            cartId: localStorage.getItem('cart_id')
                        }
                    });
                    dispatch({ type: "COUPON_CODE", payload: { coupon_code: '' } })
                }
            }
        }
        return (
            <Fragment>
                <ul className={classes.root}>
                    <div className={classes.gift_text + ' ' + classes.gift_wrapper}>
                        {wrapperStatusEnabled === "enabled" ? <div div className={classes.gender} onChange={handleChange}>
                            {cartItems && cartItems.length !== 1 && <>
                                <div className={classes.formCheck}>
                                    <input className="form-check-input" type="radio" name="exampleRadios" id="male" value={1} checked={giftWrap === 1} />
                                    <label className="form-check-label" htmlFor="male">{giftWrap === 1 ?
                                        <>
                                            {(allCartWrapperName && allCartWrapperPrice) ? <span>
                                                <b>Wrapper : </b> {allCartWrapperName} | {allCartWrapperPrice} <span className={giftWrapperClasses.gift_wripper_appiled_tick}><Check /> </span>
                                            </span> :
                                                <span><FormattedMessage
                                                    id={'cartPage.addGiftWrapToAllItem'}
                                                    defaultMessage={'Add Gift Wrap to all items'}
                                                /></span>}
                                        </>
                                        :
                                        <span><FormattedMessage
                                            id={'cartPage.addGiftWrapToAllItem'}
                                            defaultMessage={'Add Gift Wrap to all items'}
                                        /></span>
                                    }</label>
                                </div>
                                <div style={{ minWidth: 'auto' }} className={classes.formCheck}>
                                    <input className="form-check-input" type="radio" name="exampleRadios" id="female" value={2} checked={giftWrap === 2} />
                                    <label className="form-check-label" htmlFor="female" >Add Gift Wrap per items</label>
                                </div>


                            </>}
                        </div> : <span>&nbsp;</span>}
                        <div className={classes.gift_btn_wrap}>
                            {wrapperStatusEnabled === "enabled" && (giftWrap !== 0 && giftWrap !== null) && <div>
                                {(giftWrap !== 0 && giftWrap !== null) && <Button
                                    onClick={handleClear}
                                    priority="high"
                                    type="submit">
                                    <FormattedMessage id={'giftbtn'} defaultMessage={'CLEAR WRAP'} />
                                </Button>}
                            </div>}
                            <EmptyBag handleEmptyCart={handleEmptyCart} classes={classes}/>
                        </div>
                    </div>
                    {/* <span>
                        {
                            items?.filter(item => item?.configured_variant?.stock_status === "OUT_OF_STOCK")?.length !== 0 ?
                                <span className='text-danger'>
                                    Some of your items in cart are {stockStatusLabel["OUT_OF_STOCK"]}. Please remove them to proceed further.
                                </span>
                                : ""
                        }
                    </span> */}
                    {productComponents}
                </ul>
                {giftModel}
                <Suspense fallback={null}>
                    <EditModal
                        item={activeEditItem}
                        setIsCartUpdating={setIsCartUpdating}
                    />
                </Suspense>
                {deleteFlag &&
                    <DeleteModal
                        categoryFlag={deleteFlag}
                        setCategoryFlag={setDeleteFlag}
                        // id={miniCartData.cart.id}
                        handleDeleteItem={handleEmptyCartDelete}
                        type='shopping'
                    />}
            </Fragment >
        );
    }

    return null;
};

export const GET_PRODUCT_LISTING = gql`
    query getProductListing($cartId: String!) {
        cart(cart_id: $cartId) {
            id
            ...ProductListingFragment
        }
    }
    ${ProductListingFragment}
`;

export default ProductListing;
