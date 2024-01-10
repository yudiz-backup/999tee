import { useCallback, useContext, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useToasts } from '@magento/peregrine';
import { globalContext } from '../../../context/global';

/**
 * This talon contains the logic for a coupon code form component.
 * It performs effects and returns props data for rendering the component.
 *
 * This talon performs the following effects:
 *
 * - Fetch all coupons associated with the cart
 * - Manage the updating state of the cart while a coupon is being applied or removed
 *
 * @function
 *
 * @param {Object} props
 * @param {function} props.setIsCartUpdating Callback function for setting the update state for the cart.
 * @param {CouponCodeMutations} props.mutations GraphQL mutations for a cart's coupon code.
 * @param {CouponCodeQueries} props.queries GraphQL queries for a cart's coupon code.
 *
 * @return {CouponCodeTalonProps}
 *
 * @example <caption>Importing into your project</caption>
 * import { useCouponCode } from '@magento/peregrine/lib/talons/CartPage/PriceAdjustments/useCouponCode';
 */
export const useCouponCode = props => {
    const {
        setIsCartUpdating,
        mutations: { applyCouponMutation, removeCouponMutation },
        queries: { getAppliedCouponsQuery },
        setModal = () => { },
        setDiscountPrice = () => { },
    } = props;
    const { dispatch } = useContext(globalContext)

    const [, { addToast }] = useToasts();

    const { data, error: fetchError/* , refetch:getAppliedCouponRefetch */ } = useQuery(getAppliedCouponsQuery, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        skip: !localStorage.getItem('cart_id'),
        variables: {
            cartId: localStorage.getItem('cart_id')
        }
    });

    const [
        applyCoupon,
        {
            called: applyCouponCalled,
            error: applyError,
            loading: applyingCoupon
        }
    ] = useMutation(applyCouponMutation, {
        onCompleted: (data) => {
            setModal(true)
            setDiscountPrice(data?.applyCouponToCart?.cart?.prices?.discounts?.[0]?.amount?.value)
            if (data?.applyCouponToCart?.cart?.applied_coupons?.[0]?.code) {
                dispatch({ type: "COUPON_CODE", payload: { coupon_code: data.applyCouponToCart.cart.applied_coupons[0].code } })
            }
        }
    });

    const [
        removeCoupon,
        {
            called: removeCouponCalled,
            error: removeCouponError,
            loading: removingCoupon
        }
    ] = useMutation(removeCouponMutation);

    const handleApplyCoupon = useCallback(
        async ({ couponCode }) => {
            if (!couponCode) return;
            try {
                const resultApplied = await applyCoupon({
                    variables: {
                        cartId: localStorage.getItem('cart_id'),
                        couponCode
                    }
                });
                if (resultApplied?.data?.applyCouponToCart?.cart?.applied_coupons?.length
                ) {
                    addToast({
                        type: 'info',
                        message: 'Coupon code applied to cart.',
                        dismissable: true,
                        timeout: 5000
                    });
                }
            } catch (e) {
                // Error is logged by apollo link - no need to double log.
            }
        },
        [applyCoupon, localStorage.getItem('cart_id')]
    );

    const handleRemoveCoupon = useCallback(
        async couponCode => {
            try {
                const resultRemoved = await removeCoupon({
                    variables: {
                        cartId: localStorage.getItem('cart_id'),
                        couponCode
                    }
                });
                if ((resultRemoved?.data?.removeCouponFromCart?.cart?.applied_coupons === null ||
                    resultRemoved?.data?.removeCouponFromCart?.cart?.applied_coupons.length === 0)
                ) {
                    addToast({
                        type: 'info',
                        message: 'Applied coupon code is removed.',
                        dismissable: true,
                        timeout: 5000
                    });
                }
            } catch (e) {
                // Error is logged by apollo link - no need to double log.
            }
        },
        [localStorage.getItem('cart_id'), removeCoupon]
    );

    useEffect(() => {
        if (applyCouponCalled || removeCouponCalled) {
            // If a coupon mutation is in flight, tell the cart.
            setIsCartUpdating(applyingCoupon || removingCoupon);
        }
    }, [
        applyCouponCalled,
        applyingCoupon,
        removeCouponCalled,
        removingCoupon,
        setIsCartUpdating
    ]);

    // Create a memoized error map and toggle individual errors when they change
    const errors = useMemo(
        () =>
            new Map([
                ['getAppliedCouponsQuery', fetchError],
                ['applyCouponMutation', applyError],
                ['removeCouponMutation', removeCouponError]
            ]),
        [applyError, fetchError, removeCouponError]
    );

    return {
        applyingCoupon,
        data,
        errors,
        handleApplyCoupon,
        handleRemoveCoupon,
        removingCoupon
    };
};

/** JSDocs type definitions */

/**
 * GraphQL mutations for a cart's coupon code.
 * This is a type used by the {@link useCouponCode} talon.
 *
 * @typedef {Object} CouponCodeMutations
 *
 * @property {GraphQLAST} applyCouponMutation Mutation for applying a coupon code to a cart.
 * @property {GraphQLAST} removeCouponMutation Mutation for removing a coupon code from a cart.
 *
 * @see [CouponCode.js]{@link https://github.com/magento/pwa-studio/blob/develop/packages/venia-ui/lib/components/CartPage/PriceAdjustments/CouponCode/couponCode.js}
 * for the queries used Venia
 */

/**
 * GraphQL queries for a cart's coupon code.
 * This is a type used by the {@link useCouponCode} talon.
 *
 * @typedef {Object} CouponCodeQueries
 *
 * @property {GraphQLAST} getAppliedCouponsQuery Query to fetch the currently applied coupons for a cart.
 *
 * @see [CouponCode.js]{@link https://github.com/magento/pwa-studio/blob/develop/packages/venia-ui/lib/components/CartPage/PriceAdjustments/CouponCode/couponCode.js}
 * for the queries used Venia
 */

/**
 * Object type returned by the {@link useCouponCode} talon.
 * It provides props data to use when rendering a coupon code component.
 *
 * @typedef {Object} CouponCodeTalonProps
 *
 * @property {boolean} applyingCoupon True if a coupon is currently being applied. False otherwise.
 * @property {Object} data Data returned from the `getAppliedCouponsQuery`.
 * @property {String} errorMessage If GraphQL error occurs, this value is set.
 * @property {Object} fetchError The error data object returned by a GraphQL query.
 * @property {function} handleApplyCoupon Function to call for handling the application of a coupon code to a cart.
 * @property {function} handleRemoveCoupon Function to call for handling the removal of a coupon code from a cart
 * @property {boolean} removingCoupon True if a coupon code is currently being removed. False otherwise.
 */
