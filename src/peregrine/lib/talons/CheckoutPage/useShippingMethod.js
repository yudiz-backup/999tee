import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';

import { useCartContext } from '@magento/peregrine/lib/context/cart';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { CHECKOUT_STEP } from './useCheckoutPage';

export const displayStates = {
    DONE: 'done',
    EDITING: 'editing',
    INITIALIZING: 'initializing'
};

const serializeShippingMethod = method => {
    if (!method) return '';

    const { carrier_code, method_code } = method;

    return `${carrier_code}|${method_code}`;
};

const deserializeShippingMethod = serializedValue => {
    return serializedValue?.split('|');
};

// Sorts available shipping methods by price.
const byPrice = (a, b) => a.amount.value - b.amount.value;

// Adds a serialized property to shipping method objects
// so they can be selected in the radio group.
const addSerializedProperty = shippingMethod => {
    if (!shippingMethod) return shippingMethod;

    const serializedValue = serializeShippingMethod(shippingMethod);

    return {
        ...shippingMethod,
        serializedValue
    };
};

const DEFAULT_SELECTED_SHIPPING_METHOD = null;
const DEFAULT_AVAILABLE_SHIPPING_METHODS = [];

export const useShippingMethod = props => {
    const {
        mutations: { setShippingMethod },
        queries: { getSelectedAndAvailableShippingMethods },
        setPageIsUpdating,
        setCheckoutStep = () => { },
        checkoutStep,
        selectedPaymentMethod,
        handleReviewOrder,
    } = props;

    const [{ cartId }] = useCartContext();
    const [{ isSignedIn }] = useUserContext();

    /*
     *  Apollo Hooks.
     */
    const [
        setShippingMethodCall,
        { error: setShippingMethodError, loading: isSettingShippingMethod }
    ] = useMutation(setShippingMethod);

    const { data, loading: isLoadingShippingMethods } = useQuery(
        getSelectedAndAvailableShippingMethods,
        {
            fetchPolicy: 'cache-and-network',
            nextFetchPolicy: 'cache-first',
            skip: !localStorage.getItem('cart_id'),
            variables: { cartId: localStorage.getItem('cart_id') }
        }
    );

    /*
     *  State / Derived state.
     */
    const [isUpdateMode, setIsUpdateMode] = useState(false);

    const derivedPrimaryShippingAddress =
        data && data.cart &&
            data.cart.shipping_addresses &&
            data.cart.shipping_addresses.length
            ? data.cart.shipping_addresses[0]
            : null;

    const derivedPrimaryEmail =
        data && data.cart &&
            data.cart.email
            ? data.cart.email
            : null;

    const derivedSelectedShippingMethod = derivedPrimaryShippingAddress
        ? addSerializedProperty(
            derivedPrimaryShippingAddress.selected_shipping_method
        )
        : DEFAULT_SELECTED_SHIPPING_METHOD;

    const derivedShippingMethods = useMemo(() => {
        if (!derivedPrimaryShippingAddress)
            return DEFAULT_AVAILABLE_SHIPPING_METHODS;

        // Shape the list of available shipping methods.
        // Sort them by price and add a serialized property to each.
        const rawShippingMethods =
            derivedPrimaryShippingAddress.available_shipping_methods;
        const shippingMethodsByPrice = [...rawShippingMethods].sort(byPrice);
        const result = shippingMethodsByPrice.map(addSerializedProperty);

        return result;
    }, [derivedPrimaryShippingAddress]);

    // Determine the component's display state.
    const isBackgroundAutoSelecting =
        isSignedIn &&
        !derivedSelectedShippingMethod &&
        Boolean(derivedShippingMethods.length);
    const displayState = derivedSelectedShippingMethod
        ? displayStates.DONE
        : isLoadingShippingMethods ||
            (isSettingShippingMethod && isBackgroundAutoSelecting)
            ? displayStates.INITIALIZING
            : displayStates.EDITING;

    /*
     *  Callbacks.
     */
    const handleSubmit = useCallback(
        async (value, shippingMethods) => {
            const [carrierCode, methodCode] = deserializeShippingMethod(
                value.shipping_method
            );
            const isExistShippingMethod = shippingMethods.some(item => item.carrier_code === carrierCode && item.method_code === methodCode)
            if (isExistShippingMethod) {
                try {
                    const resultShippingMethodCall = await setShippingMethodCall({
                        variables: {
                            cartId: localStorage.getItem('cart_id'),
                            shippingMethod: {
                                carrier_code: carrierCode,
                                method_code: methodCode
                            }
                        }
                    });
                    if (resultShippingMethodCall?.data?.setShippingMethodsOnCart?.cart?.id) {
                        setCheckoutStep(CHECKOUT_STEP.REVIEW);
                    }
                    if (checkoutStep === CHECKOUT_STEP.PAYMENT && selectedPaymentMethod) {
                        handleReviewOrder();
                    }
                } catch {
                    return;
                }
            }

            setIsUpdateMode(false);
        },
        //eslint-disable-next-line
        [localStorage.getItem('cart_id'), setIsUpdateMode, setShippingMethodCall, selectedPaymentMethod, checkoutStep]
    );

    const handleCancelUpdate = useCallback(() => {
        setIsUpdateMode(false);
    }, []);

    const showUpdateMode = useCallback(() => {
        setIsUpdateMode(true);
    }, []);

    /*
     *  Effects.
     */

    useEffect(() => {
        setPageIsUpdating(isSettingShippingMethod);
    }, [isLoadingShippingMethods, isSettingShippingMethod, setPageIsUpdating]);

    // If an authenticated user does not have a preferred shipping method,
    // auto-select the least expensive one for them.
    useEffect(() => {
        if (!data) return;
        if (!cartId) return;
        if (!isSignedIn) return;

        if (!derivedSelectedShippingMethod) {
            // The shipping methods are sorted by price.
            const leastExpensiveShippingMethod = derivedShippingMethods[0];

            if (leastExpensiveShippingMethod) {
                const {
                    carrier_code,
                    method_code
                } = leastExpensiveShippingMethod;

                setShippingMethodCall({
                    variables: {
                        cartId: localStorage.getItem('cart_id'),
                        shippingMethod: {
                            carrier_code,
                            method_code
                        }
                    }
                });
            }
        }
    }, [
        localStorage.getItem('cart_id'),
        data,
        derivedSelectedShippingMethod,
        derivedShippingMethods,
        isSignedIn,
        setShippingMethodCall
    ]);

    const errors = useMemo(
        () => new Map([['setShippingMethod', setShippingMethodError]]),
        [setShippingMethodError]
    );

    return {
        displayState,
        errors,
        handleCancelUpdate,
        handleSubmit,
        isLoading: isLoadingShippingMethods || isSettingShippingMethod,
        isUpdateMode,
        selectedShippingMethod: derivedSelectedShippingMethod,
        shippingMethods: derivedShippingMethods,
        showUpdateMode,
        derivedPrimaryShippingAddress,
        derivedPrimaryEmail
    };
};
