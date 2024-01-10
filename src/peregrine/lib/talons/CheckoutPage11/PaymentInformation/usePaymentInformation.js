import { useCallback, useState, useEffect } from 'react';
import { useQuery, useApolloClient, useMutation } from '@apollo/client';
// import { useCartContext } from '@magento/peregrine/lib/context/cart';
import CheckoutError from '@magento/peregrine/lib/talons/CheckoutPage/CheckoutError';
import { CHECKOUT_STEP } from '@magento/peregrine/lib/talons/CheckoutPage/useCheckoutPage';

/**
 *
 * @param {Object} props.checkoutError an instance of the `CheckoutError` error that has been generated using the error from the place order mutation
 * @param {DocumentNode} props.queries.getPaymentNonceQuery query to fetch and/or clear payment nonce from cache
 * @param {Boolean} props.shouldSubmit property telling us to proceed to next step
 * @param {Function} props.resetShouldSubmit callback to reset the review order button flag
 * @param {DocumentNode} props.queries.getPaymentInformation query to fetch data to render this component
 * @param {DocumentNode} props.mutation.setBillingAddressMutation
 * @param {DocumentNode} props.mutation.setFreePaymentMethodMutation
 *
 * @returns {PaymentInformationTalonProps}
 */
export const usePaymentInformation = props => {
    const {
        mutations,
        checkoutError,
        queries,
        resetShouldSubmit,
        setCheckoutStep
    } = props;
    const {
        setFreePaymentMethodMutation,
        setBillingAddressMutation
    } = mutations;
    const { getPaymentInformation, getPaymentNonceQuery } = queries;

    /**
     * Definitions
     */

    const [doneEditing, setDoneEditing] = useState(false);
    const [isEditModalActive, setIsEditModalActive] = useState(false);
    // const [{ cartId }] = useCartContext();
    const client = useApolloClient();

    /**
     * Helper Functions
     */

    const showEditModal = useCallback(() => {
        setIsEditModalActive(true);
    }, []);

    const hideEditModal = useCallback(() => {
        setIsEditModalActive(false);
    }, []);

    const handlePaymentSuccess = useCallback(() => {
        setDoneEditing(true);
    }, []);

    const handlePaymentError = useCallback(() => {
        resetShouldSubmit();
        setDoneEditing(false);
    }, [resetShouldSubmit]);

    /**
     * Queries
     */
    const {
        data: paymentInformationData,
        loading: paymentInformationLoading
    } = useQuery(getPaymentInformation, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        skip: !localStorage.getItem('cart_id'),
        variables: { cartId: localStorage.getItem('cart_id') }
    });

    const [
        setFreePaymentMethod,
        { loading: setFreePaymentMethodLoading }
    ] = useMutation(setFreePaymentMethodMutation);

    const clearPaymentDetails = useCallback(() => {
        client.writeQuery({
            query: getPaymentNonceQuery,
            data: {
                cart: {
                    __typename: 'Cart',
                    id: localStorage.getItem('cart_id'),
                    paymentNonce: null
                }
            }
        });
    }, [localStorage.getItem('cart_id'), client, getPaymentNonceQuery]);

    const [setBillingAddress] = useMutation(setBillingAddressMutation);

    // We must wait for payment method to be set if this is the first time we
    // are hitting this component and the total is $0. If we don't wait then
    // the CC component will mount while the setPaymentMethod mutation is in flight.
    const isLoading = paymentInformationLoading || setFreePaymentMethodLoading;

    /**
     * Effects
     */

    const availablePaymentMethods = paymentInformationData
        ? paymentInformationData.cart.available_payment_methods
        : [];

    const selectedPaymentMethod =
        (paymentInformationData &&
            paymentInformationData.cart.selected_payment_method.code) ||
        null;

    // If free is ever available and not selected, automatically select it.
    useEffect(() => {
        const setFreeIfAvailable = async () => {
            const freeIsAvailable = !!availablePaymentMethods.find(
                ({ code }) => code === 'free'
            );
            if (freeIsAvailable) {
                if (selectedPaymentMethod !== 'free') {
                    await setFreePaymentMethod({
                        variables: {
                            cartId: localStorage.getItem('cart_id')
                        }
                    });
                    setDoneEditing(true);
                } else {
                    setDoneEditing(true);
                }
            }
        };
        setFreeIfAvailable();
    }, [
        availablePaymentMethods,
        localStorage.getItem('cart_id'),
        selectedPaymentMethod,
        setDoneEditing,
        setFreePaymentMethod
    ]);

    const shippingAddressOnCart =
        (paymentInformationData &&
            paymentInformationData.cart.shipping_addresses.length &&
            paymentInformationData.cart.shipping_addresses[0]) ||
        null;

    // If the selected payment method is "free" keep the shipping address
    // synced with billing address.This _requires_ the UI does not allow payment
    // information before shipping address.
    useEffect(() => {
        if (selectedPaymentMethod === 'free' && shippingAddressOnCart) {
            const {
                firstname,
                lastname,
                street,
                city,
                region,
                postcode,
                country,
                telephone
            } = shippingAddressOnCart;
            const regionCode = region.code;
            const countryCode = country.code;

            setBillingAddress({
                variables: {
                    cartId: localStorage.getItem('cart_id'),
                    firstname,
                    lastname,
                    street,
                    city,
                    regionCode,
                    postcode,
                    countryCode,
                    telephone
                }
            });
        }
    }, [
        localStorage.getItem('cart_id'),
        selectedPaymentMethod,
        setBillingAddress,
        shippingAddressOnCart
    ]);

    const handleExpiredPaymentError = useCallback(() => {
        setDoneEditing(false);
        clearPaymentDetails({ variables: { cartId: localStorage.getItem('cart_id') } });
        resetShouldSubmit();
        setCheckoutStep(CHECKOUT_STEP.PAYMENT);
    }, [resetShouldSubmit, setCheckoutStep, clearPaymentDetails, localStorage.getItem('cart_id')]);

    useEffect(() => {
        if (
            checkoutError instanceof CheckoutError &&
            checkoutError.hasPaymentExpired()
        ) {
            handleExpiredPaymentError();
        }
    }, [checkoutError, handleExpiredPaymentError]);

    return {
        doneEditing,
        handlePaymentError,
        handlePaymentSuccess,
        hideEditModal,
        isEditModalActive,
        isLoading,
        showEditModal
    };
};

/**
 * Props data to use when rendering a cart page component.
 *
 * @typedef {Object} PaymentInformationTalonProps
 *
 * @property {boolean} doneEditing Indicates payment information has been provided
 * @property {function} handlePaymentError Error handler passed to payment methods
 * @property {function} handlePaymentSuccess Success handler passed to payment methods
 * @property {function} hideEditModal Callback to close the edit dialog
 * @property {boolean} isEditModalActive State for keeping track of edit dialog visibility
 * @property {boolean} isLoading Derived state that keeps track if any mutation is in flight
 * @property {function} showEditModal Callback to display the edit dialog
 */
