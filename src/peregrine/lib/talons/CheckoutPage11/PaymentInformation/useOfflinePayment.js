import { useCallback, useEffect, useState, useMemo } from 'react';
import { useFormState, useFormApi } from 'informed';
import { useQuery, useApolloClient, useMutation } from '@apollo/client';

import { useCartContext } from '@magento/peregrine/lib/context/cart';

export const mapAddressData = rawAddressData => {
    if (rawAddressData) {
        const {
            firstName,
            lastName,
            city,
            postcode,
            phoneNumber,
            street,
            country,
            region
        } = rawAddressData;

        return {
            firstName,
            lastName,
            city,
            postcode,
            phoneNumber,
            street1: street[0],
            street2: street[1],
            country: country.code,
            region: region.code
        };
    } else {
        return {};
    }
};

export const useOfflinePayment = props => {
    const {
        onSuccess,
        queries,
        mutations,
        shouldSubmit,
        resetShouldSubmit,
        paymentCode
    } = props;

    const {
        getBillingAddressQuery,
        getIsBillingAddressSameQuery,
        getShippingAddressQuery
    } = queries;

    const {
        setBillingAddressMutation,
        setPaymentMethodDetailsOnCartMutation
    } = mutations;

    const [stepNumber, setStepNumber] = useState(0);

    const client = useApolloClient();
    const formState = useFormState();
    const { validate: validateBillingAddressForm } = useFormApi();
    const [{ cartId }] = useCartContext();

    const isLoading = stepNumber >= 1 && stepNumber <= 3;

    const { data: billingAddressData } = useQuery(getBillingAddressQuery, {
        skip: !localStorage.getItem('cart_id'),
        variables: { cartId: localStorage.getItem('cart_id') }
    });
    const { data: shippingAddressData } = useQuery(getShippingAddressQuery, {
        skip: !localStorage.getItem('cart_id'),
        variables: { cartId: localStorage.getItem('cart_id') }
    });
    const { data: isBillingAddressSameData } = useQuery(
        getIsBillingAddressSameQuery,
        { skip: !localStorage.getItem('cart_id'), variables: { cartId: localStorage.getItem('cart_id') } }
    );
    const [
        updateBillingAddress,
        {
            error: billingAddressMutationError,
            called: billingAddressMutationCalled,
            loading: billingAddressMutationLoading
        }
    ] = useMutation(setBillingAddressMutation);

    const [updatePMDetails, { error: pmMutationError }] = useMutation(
        setPaymentMethodDetailsOnCartMutation
    );

    const shippingAddressCountry =
        shippingAddressData && shippingAddressData.cart.shippingAddresses[0]
            ? shippingAddressData.cart.shippingAddresses[0].country.code
            : 'IN';
    const isBillingAddressSame = formState.values.isBillingAddressSame;

    const initialValues = useMemo(() => {
        const isBillingAddressSame = isBillingAddressSameData
            ? isBillingAddressSameData.cart.isBillingAddressSame
            : true;

        let billingAddress = {};
        /**
         * If billing address is same as shipping address, do
         * not auto fill the fields.
         */
        if (billingAddressData && !isBillingAddressSame) {
            if (billingAddressData.cart.billingAddress) {
                const {
                    // eslint-disable-next-line no-unused-vars
                    __typename,
                    ...rawBillingAddress
                } = billingAddressData.cart.billingAddress;
                billingAddress = mapAddressData(rawBillingAddress);
            }
        }

        return { isBillingAddressSame, ...billingAddress };
    }, [isBillingAddressSameData, billingAddressData]);

    /**
     * Helpers
     */

    /**
     * This function sets the boolean isBillingAddressSame
     * in cache for future use. We use cache because there
     * is no way to save this on the cart in remote.
     */
    const setIsBillingAddressSameInCache = useCallback(() => {
        client.writeQuery({
            query: getIsBillingAddressSameQuery,
            data: {
                cart: {
                    __typename: 'Cart',
                    id: localStorage.getItem('cart_id'),
                    isBillingAddressSame
                }
            }
        });
    }, [client, localStorage.getItem('cart_id'), getIsBillingAddressSameQuery, isBillingAddressSame]);

    /**
     * This function sets the billing address on the cart using the
     * shipping address.
     */
    const setShippingAddressAsBillingAddress = useCallback(() => {
        const shippingAddress = shippingAddressData
            ? mapAddressData(shippingAddressData.cart.shippingAddresses[0])
            : {};

        updateBillingAddress({
            variables: {
                cartId: localStorage.getItem('cart_id'),
                ...shippingAddress,
                sameAsShipping: true
            }
        });
    }, [updateBillingAddress, shippingAddressData, localStorage.getItem('cart_id')]);

    /**
     * This function sets the billing address on the cart using the
     * information from the form.
     */
    const setBillingAddress = useCallback(() => {
        const {
            firstName,
            lastName,
            country,
            street1,
            street2,
            city,
            region,
            postcode,
            phoneNumber
        } = formState.values;

        updateBillingAddress({
            variables: {
                cartId: localStorage.getItem('cart_id'),
                firstName,
                lastName,
                country,
                street1,
                street2,
                city,
                region,
                postcode,
                phoneNumber,
                sameAsShipping: false
            }
        });
    }, [formState.values, updateBillingAddress, cartId]);

    const updatePMDetailsOnCart = useCallback(() => {
        if (paymentCode && (paymentCode !== 'stripe_payments_checkout' && paymentCode !== 'stripe_payments')) {
            updatePMDetails({
                variables: {
                    cartId: localStorage.getItem('cart_id'),
                    paymentMethod: paymentCode
                }
            });
        }
    }, [updatePMDetails, localStorage.getItem('cart_id'), paymentCode]);

    /**
     * Effects
     */

    /**
     * Step 1 effect
     *
     * User has clicked the update button
     */
    useEffect(() => {
        try {
            if (shouldSubmit) {
                validateBillingAddressForm();

                const hasErrors = Object.keys(formState.errors).length;

                if (!hasErrors) {
                    setStepNumber(1);
                    if (isBillingAddressSame) {
                        setShippingAddressAsBillingAddress();
                    } else {
                        setBillingAddress();
                    }
                    setIsBillingAddressSameInCache();
                } else {
                    throw new Error('Errors in the billing address form');
                }
            }
        } catch (err) {
            console.error(err);
            setStepNumber(0);
            resetShouldSubmit();
        }
    }, [
        shouldSubmit,
        isBillingAddressSame,
        setShippingAddressAsBillingAddress,
        setBillingAddress,
        setIsBillingAddressSameInCache,
        resetShouldSubmit,
        validateBillingAddressForm,
        formState.errors
    ]);

    /**
     * Step 2 effect
     *
     * Billing address mutation has completed
     */
    useEffect(() => {
        try {
            const billingAddressMutationCompleted =
                billingAddressMutationCalled && !billingAddressMutationLoading;

            if (
                billingAddressMutationCompleted &&
                !billingAddressMutationError
            ) {
                setStepNumber(4);
                if (onSuccess) {
                    onSuccess();
                }
                resetShouldSubmit();
                setStepNumber(4);
                updatePMDetailsOnCart();
            }

            if (
                billingAddressMutationCompleted &&
                billingAddressMutationError
            ) {
                /**
                 * Billing address save mutation is not successful.
                 * Reset update button clicked flag.
                 */
                throw new Error('Billing address mutation failed');
            }
        } catch (err) {
            console.error(err);
            setStepNumber(0);
            resetShouldSubmit();
        }
    }, [
        billingAddressMutationError,
        billingAddressMutationCalled,
        billingAddressMutationLoading,
        resetShouldSubmit,
        onSuccess,
        updatePMDetailsOnCart
    ]);

    const errors = useMemo(
        () =>
            new Map([
                ['setBillingAddressMutation', billingAddressMutationError],
                ['setPaymentMethodDetailsOnCartMutation', pmMutationError]
            ]),
        [billingAddressMutationError, pmMutationError]
    );

    return {
        errors,
        isBillingAddressSame,
        isLoading,
        stepNumber,
        initialValues,
        shippingAddressCountry
    };
};
