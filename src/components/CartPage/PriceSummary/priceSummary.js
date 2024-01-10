import React, { useContext, useEffect, useState } from 'react';
// import { gql, useLazyQuery } from '@apollo/client';
import { Price } from '@magento/peregrine';
import { usePriceSummary } from '../../../peregrine/lib/talons/CartPage/PriceSummary/usePriceSummary';
import Button from '../../Button';
import { mergeClasses } from '../../../classify';
import defaultClasses from './priceSummary.css';
import DiscountSummary from './discountSummary';
import GiftCardSummary from './giftCardSummary';
import ShippingSummary from './shippingSummary';
// import TaxSummary from './taxSummary';
import { FormattedMessage, useIntl } from 'react-intl';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { globalContext } from '../../../peregrine/lib/context/global.js';
import GstTaxSummary from './gstTaxSummary';
import { GET_CART_DETAILS } from '../cartPage.gql';
import CouponModal from '../../CouponModal/CouponModal';
// import { reduce } from 'lodash';
import { GET_PAYMENT_INFORMATION } from '../../CheckoutPage/PaymentInformation/paymentInformation.gql';
import LoadingIndicator from '../../LoadingIndicator/indicator';

// import { useToasts } from '@magento/peregrine';
// import DeleteModal from '../../DeleteModal';
// import CouponModal from '../../CouponModal/CouponModal';

/**
 * A child component of the CartPage component.
 * This component fetches and renders cart data, such as subtotal, discounts applied,
 * gift cards applied, tax, shipping, and cart total.
 *
 * @param {Object} props
 * @param {Object} props.classes CSS className overrides.
 * See [priceSummary.css]{@link https://github.com/magento/pwa-studio/blob/develop/packages/venia-ui/lib/components/CartPage/PriceSummary/priceSummary.css}
 * for a list of classes you can override.
 *
 * @returns {React.Element}
 *
 * @example <caption>Importing into your project</caption>
 * import PriceSummary from "@magento/venia-ui/lib/components/CartPage/PriceSummary";
 */
const PriceSummary = props => {
    const {
        isUpdating,
        couponCode,
        calculation,
        isFromMiniCart = false,
        state,
        cartDetails,
        rewardPointCalculationLoading,
        giftWrapperData = [],
        // allCartGiftWrapper,
        cartItems,
        // giftWrap,
        // setCartGrandTotal = () => { },
        setIsDeleting = () => { },
        // setDiscount = () => { },
        modal,
        setModal
    } = props;


    const [{ isSignedIn }] = useUserContext();
    // const [, { addToast }] = useToasts();
    const classes = mergeClasses(defaultClasses, props.classes);

    const talonProps = usePriceSummary({
        // message,
        setIsDeleting,
        queries: {
            getCartDetails: GET_CART_DETAILS
        },
        cartDetails,
        getPaymentInformation: GET_PAYMENT_INFORMATION
    });
    const { state: priceSummaryState } = useContext(globalContext);
    const [gstTaxTotal, setGstTaxTotal] = useState(0);
    const [stateGiftWrapDetail, setStateGiftWrapDetail] = useState([]);

    const rangeValue = sessionStorage.getItem('rangeValue');

    const {
        handleProceedToCheckout,
        // hasError,
        // hasItems,
        isCheckout,
        // isLoading,
        flatData
    } = talonProps;

    const { formatMessage } = useIntl();

    const { subtotal, discounts, giftCards, /* taxes, */ shipping } = flatData;
    const stockStatusOutOfStock =
        cartItems?.filter(
            item => item?.configured_variant?.stock_status === 'OUT_OF_STOCK'
        )?.length !== 0;
    const stockStatusOutOfStockSimpleProduct =
        cartItems?.filter(
            item => item?.product?.stock_status === 'OUT_OF_STOCK'
        )?.length !== 0;
    const isPriceUpdating = isUpdating;
    const priceClass = isPriceUpdating ? classes.priceUpdating : classes.price;
    const totalPriceClass = isPriceUpdating
        ? classes.priceUpdating
        : classes.totalPrice;

    const proceedToCheckoutButton = !isCheckout ? (
        <div className={classes.checkoutButton_container}>
            <Button
                disabled={
                    isPriceUpdating ||
                    stockStatusOutOfStock ||
                    stockStatusOutOfStockSimpleProduct ||
                    priceSummaryState?.disable?.disable
                    || (isSignedIn && JSON.parse(localStorage.getItem('userDetails'))?.value === 2 && cartDetails?.total_quantity < +localStorage.getItem('b2b-min-quantity'))

                }
                priority={'high'}
                onClick={handleProceedToCheckout}
            >
                <FormattedMessage
                    id={'priceSummary.checkoutButton_container'}
                    defaultMessage={'Proceed to Checkout'}
                />
            </Button>
        </div>
    ) : null;


    // const priceData =
    //     giftWrapperData &&
    //     giftWrapperData[0] &&
    //     giftWrapperData[0].mpGiftWrapWrapperSet &&
    //     giftWrapperData[0].mpGiftWrapWrapperSet.mp_gift_wrap_data &&
    //     giftWrapperData[0].mpGiftWrapWrapperSet.mp_gift_wrap_data.amount;

    useEffect(() => {
        if (discounts && discounts?.[0]?.label !== 'Discount') {
            if (localStorage.getItem('couponApplied') === '0') {
                setModal(true);
            }

            localStorage.setItem('couponApplied', 1);
        } else if (discounts === undefined) {
            localStorage.setItem('couponApplied', 1);
        } else {
            localStorage.setItem('couponApplied', 0);
            // setModal(false)
        }
    }, [discounts]);

    // const giftWrapperPrice =
    //     giftWrapperData &&
    //     giftWrapperData.reduce((acc, item) => {
    //         if (
    //             item &&
    //             item.mpGiftWrapWrapperSet &&
    //             item.mpGiftWrapWrapperSet.mp_gift_wrap_data &&
    //             item.mpGiftWrapWrapperSet.mp_gift_wrap_data.amount
    //         ) {
    //             return acc + item.mpGiftWrapWrapperSet.mp_gift_wrap_data.amount;
    //         } else {
    //             return acc;
    //         }
    //     }, 0);

    // const allCart =
    //     allCartGiftWrapper &&
    //     allCartGiftWrapper?.mpGiftWrapWrapperSetAll &&
    //     allCartGiftWrapper?.mpGiftWrapWrapperSetAll?.filter(
    //         all_cart =>
    //             all_cart &&
    //             all_cart?.mp_gift_wrap_data &&
    //             all_cart?.mp_gift_wrap_data?.all_cart === true
    //     )[0];

    // const allCartWrapperAmount =
    //     allCart &&
    //     allCart?.mp_gift_wrap_data &&
    //     allCart?.mp_gift_wrap_data?.amount;

    const grandAmount = Math.floor(priceSummaryState?.priceSummaryDetail?.grandTotal);

    useEffect(() => {
        const giftWrapperDataStringify = JSON.stringify(giftWrapperData);
        const stateGiftWrapDetailStringify = JSON.stringify(
            stateGiftWrapDetail
        );
        if (giftWrapperDataStringify !== stateGiftWrapDetailStringify) {
            setStateGiftWrapDetail(giftWrapperData);
            // updateCartDetails()
        }
    }, [giftWrapperData, stateGiftWrapDetail]);

    useEffect(() => {
        if (cartDetails && cartDetails.prices) {
            setGstTaxTotal(
                ((cartDetails?.prices?.sgst?.length &&
                    cartDetails?.prices?.sgst?.[0]?.value) ||
                    0) +
                ((cartDetails?.prices?.cgst?.length &&
                    cartDetails?.prices?.cgst?.[0]?.value) ||
                    0) +
                ((cartDetails?.prices?.igst?.length &&
                    cartDetails?.prices?.igst?.[0]?.value) ||
                    0) +
                ((cartDetails?.prices?.utgst?.length &&
                    cartDetails?.prices?.utgst?.[0]?.value) ||
                    0) +
                ((cartDetails?.prices?.shipping_sgst?.length &&
                    cartDetails?.prices?.shipping_sgst?.[0]?.value) ||
                    0) +
                ((cartDetails?.prices?.shipping_cgst?.length &&
                    cartDetails?.prices?.shipping_cgst?.[0]?.value) ||
                    0) +
                ((cartDetails?.prices?.shipping_igst?.length &&
                    cartDetails?.prices?.shipping_igst?.[0]?.value) ||
                    0) +
                ((cartDetails?.prices?.shipping_utgst?.length &&
                    cartDetails?.prices?.shipping_utgst?.[0]?.value) ||
                    0)
            );
        } else {
            setGstTaxTotal(0);
        }
    }, [cartDetails]);

    // if (hasError) {
    //     return (
    //         <div className={classes.root}>
    //             <span className={classes.errorText}>
    //                 <FormattedMessage
    //                     id={'priceSummary.errorText'}
    //                     defaultMessage={
    //                         'Something went wrong. Please refresh and try again.'
    //                     }
    //                 />
    //             </span>
    //         </div>
    //     );
    // } else if (!hasItems) {
    //     return null;
    // }
    const individualGiftWrapQty = cartDetails?.items &&
        cartDetails?.items?.filter(element => element.mp_gift_wrap_data?.all_cart === null)?.reduce((a, b) => a + b.quantity, 0)
    const individualGiftWrapAmount = cartDetails?.items &&
        cartDetails?.items?.find(element => element.mp_gift_wrap_data?.all_cart === null)?.mp_gift_wrap_data?.amount

    return (
        <>
            <div className={classes.root}>
                {calculation ||
                    (talonProps &&
                        cartDetails &&
                        !isUpdating &&
                        !rewardPointCalculationLoading) ||
                    state ? (
                    <div className={classes.lineItems}>
                        {isSignedIn &&
                            (state?.priceSummaryData?.mp_reward_earn ||
                                calculation?.mp_reward_earn) && (
                                <>
                                    <span className={classes.lineItemLabel}>
                                        <FormattedMessage
                                            id={'priceSummary.rewardPointsEarn'}
                                            defaultMessage={'You Will Earn'}
                                        />
                                    </span>
                                    <span className={priceClass}>
                                        <span>
                                            {(calculation &&
                                                calculation.mp_reward_earn) ||
                                                (state &&
                                                    state.priceSummaryData &&
                                                    state.priceSummaryData
                                                        .mp_reward_earn)}
                                            {(calculation &&
                                                calculation.mp_reward_earn) ||
                                                (state &&
                                                    state.priceSummaryData &&
                                                    state.priceSummaryData
                                                        .mp_reward_earn)
                                                ? ' Points'
                                                : '-'}
                                        </span>
                                    </span>
                                </>
                            )}
                        {isSignedIn &&
                            ((calculation && calculation.mp_reward_spent) ||
                                (state &&
                                    state.priceSummaryData &&
                                    state.priceSummaryData
                                        .mp_reward_spent)) && (
                                <>
                                    <span className={classes.lineItemLabel}>
                                        <FormattedMessage
                                            id={'priceSummary.rewardPoints'}
                                            defaultMessage={'You Will Spend'}
                                        />
                                    </span>
                                    <span className={priceClass}>
                                        <span>
                                            {(calculation &&
                                                calculation.mp_reward_spent) ||
                                                (state &&
                                                    state.priceSummaryData &&
                                                    state.priceSummaryData
                                                        .mp_reward_spent)}
                                            {(calculation &&
                                                calculation.mp_reward_spent) ||
                                                (state &&
                                                    state.priceSummaryData &&
                                                    state.priceSummaryData
                                                        .mp_reward_spent)
                                                ? ' Points'
                                                : '-'}
                                        </span>
                                    </span>
                                </>
                            )}
                        <span className={classes.lineItemLabel}>
                            <FormattedMessage
                                id={'priceSummary.lineItemLabel'}
                                defaultMessage={'Subtotal'}
                            />
                        </span>
                        <span className={priceClass}>
                            <Price
                                value={priceSummaryState?.priceSummaryDetail?.subTotal}
                                currencyCode={'INR'}
                            />
                        </span>

                        {gstTaxTotal ? (
                            <GstTaxSummary
                                cartDetails={cartDetails}
                                classes={classes}
                                priceClass={priceClass}
                                gstTaxTotal={gstTaxTotal}
                            />
                        ) : (
                            <></>
                        )}

                        {cartDetails &&
                            cartDetails.prices &&
                            cartDetails.prices.mp_extra_fee_segments &&
                            cartDetails.prices.mp_extra_fee_segments[0] &&
                            cartDetails.prices.mp_extra_fee_segments[0]
                                .value !== 0 &&
                            cartDetails.prices.mp_extra_fee_segments?.length !==
                            0 && (
                                <>
                                    <span className={classes.lineItemLabel}>
                                        {cartDetails &&
                                            cartDetails.prices &&
                                            cartDetails.prices.mp_extra_fee_segments.map(
                                                title => title.title
                                            )}
                                    </span>
                                    <span className={priceClass}>
                                        <Price
                                            value={
                                                cartDetails &&
                                                cartDetails.prices &&
                                                cartDetails.prices.mp_extra_fee_segments.map(
                                                    value => value.value
                                                )
                                            }
                                            currencyCode={'INR'}
                                        />
                                    </span>
                                </>
                            )}

                        {rangeValue !== 0 &&
                            isSignedIn &&
                            (state?.priceSummaryData?.mp_reward_spent ||
                                calculation?.mp_reward_discount) && (
                                <>
                                    <span className={classes.lineItemLabel}>
                                        <FormattedMessage
                                            id={
                                                'priceSummary.lineItemLabelDiscount'
                                            }
                                            defaultMessage={'Reward Points'}
                                        />
                                    </span>
                                    <span className={priceClass}>
                                        {(calculation &&
                                            calculation.mp_reward_spent) ||
                                            (state &&
                                                state.priceSummaryData &&
                                                state.priceSummaryData
                                                    .mp_reward_spent) ? (
                                            <Price
                                                value={
                                                    (calculation &&
                                                        calculation.mp_reward_discount) ||
                                                    (state &&
                                                        state.priceSummaryData &&
                                                        state.priceSummaryData
                                                            .mp_reward_discount)
                                                }
                                                currencyCode={
                                                    subtotal?.currency || 'INR'
                                                }
                                            />
                                        ) : (
                                            '-'
                                        )}
                                    </span>
                                </>
                            )}


                        <DiscountSummary
                            classes={{
                                lineItemLabel: classes.lineItemLabel,
                                price: priceClass
                            }}
                            data={discounts}
                            couponCode={couponCode}
                        />
                        <GiftCardSummary
                            classes={{
                                lineItemLabel: classes.lineItemLabel,
                                price: priceClass
                            }}
                            data={giftCards}
                        />

                        <GiftCardSummary
                            classes={{
                                lineItemLabel: classes.lineItemLabel,
                                price: priceClass
                            }}
                            data={giftCards}
                        />


                        {(
                            // allCartWrapperAmount ||
                            // (priceData &&
                            //     JSON.parse(localStorage.getItem('giftWrapper'))
                            //         ?.length >= 1 &&
                            //     giftWrap === 2) ||
                            // (priceData &&
                            //     JSON.parse(localStorage.getItem('giftWrapper'))
                            //         ?.length >= 1 &&
                            //     isFromMiniCart) ||  
                            // (priceData && cartItems?.length === 1))
                            (cartDetails?.items?.[0]?.mp_gift_wrap_data?.all_cart === true)
                            || (cartDetails?.items?.some(element => element.mp_gift_wrap_data?.all_cart === null)))
                            && (
                                <>
                                    <span className={classes.lineItemLabel}>
                                        <FormattedMessage
                                            id={'priceSummary.giftWrapper'}
                                            defaultMessage={'Gift Wrapper'}
                                        />
                                    </span>
                                    <span className={priceClass}>
                                        <Price
                                            value={
                                                cartDetails?.items?.[0]?.mp_gift_wrap_data?.all_cart === true ? cartDetails?.items?.[0]?.mp_gift_wrap_data?.amount
                                                    * cartDetails?.total_quantity : cartDetails?.items?.some(element => element.mp_gift_wrap_data?.all_cart === null)
                                                    ? individualGiftWrapAmount * individualGiftWrapQty : 0

                                                // giftWrap === 1 && allCartGiftWrapper?.mpGiftWrapWrapperSetAll?.[0]?.mp_gift_wrap_data?.all_cart
                                                // ? allCartGiftWrapper?.mpGiftWrapWrapperSetAll?.[0]?.mp_gift_wrap_data?.amount * cartDetails?.total_quantity : null


                                                // giftWrap === 2 ||
                                                // JSON.parse(
                                                //     localStorage.getItem(
                                                //         'giftWrapper'
                                                //     )
                                                // )?.length === 1
                                                //     ? JSON.parse(
                                                //           localStorage.getItem(
                                                //               'giftWrapper'
                                                //           )
                                                //       )?.length * priceData
                                                //     : +allCartWrapperAmount
                                            }
                                            currencyCode={'INR'}
                                        />
                                    </span>
                                </>
                            )}

                        {/* <TaxSummary
                       classes={{
                           lineItemLabel: classes.lineItemLabel,
                           price: priceClass
                       }}
                       data={taxes}
                       isCheckout={isCheckout}
                   /> */}
                        <ShippingSummary
                            classes={{
                                lineItemLabel: classes.lineItemLabel,
                                price: priceClass
                            }}
                            data={shipping}
                            isCheckout={isCheckout}
                            type="minicart"
                        />

                        {(priceSummaryState?.store_credit?.amount ||
                            cartDetails?.storecredit_applied?.base_bss_storecredit_amount) &&
                            (
                                <>
                                    <span className={classes.lineItemLabel}>
                                        <FormattedMessage
                                            id={'priceSummary.CreditInfo'}
                                            defaultMessage={'Store Credit '}
                                        />
                                    </span>
                                    <span className={priceClass}>
                                        -{' '}
                                        <Price
                                            value={
                                                cartDetails?.storecredit_applied
                                                    ?.base_bss_storecredit_amount || priceSummaryState?.store_credit?.amount
                                            }
                                            currencyCode={'INR'}
                                        />
                                    </span>
                                </>
                            )}
                        <span className={classes.totalLabel}>
                            {isCheckout
                                ? formatMessage({
                                    id: 'priceSummary.Total',
                                    defaultMessage: 'Grand Total'
                                })
                                : formatMessage({
                                    id: 'priceSummary.estimatedTotal',
                                    defaultMessage: 'Total'
                                })}
                        </span>
                        <span className={totalPriceClass}>
                            <Price value={grandAmount} currencyCode={'INR'} />
                        </span>
                    </div>
                ) : (
                    <LoadingIndicator />
                )}
                {!isFromMiniCart && proceedToCheckoutButton}
            </div>
            {modal && (
                <>
                    <div className={defaultClasses.checkout_modal}>
                        <CouponModal
                            discount={discounts?.[0]?.amount?.value}
                            label={discounts?.[0]?.label}
                            categoryFlag={modal}
                            setCategoryFlag={setModal}
                        />
                    </div>
                </>
            )}
        </>
    );
};

export default PriceSummary;
