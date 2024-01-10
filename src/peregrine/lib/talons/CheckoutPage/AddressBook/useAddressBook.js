import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { useMutation, useQuery } from '@apollo/client';

import { useAppContext } from '@magento/peregrine/lib/context/app';
// import { useCartContext } from '@magento/peregrine/lib/context/cart';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { deriveErrorMessage } from '@magento/peregrine/lib/util/deriveErrorMessage';
import {
    CHECKOUT_STEP
} from 'src/peregrine/lib/talons/CheckoutPage/useCheckoutPage';

export const useAddressBook = props => {
    const {
        mutations: { setCustomerAddressOnCartMutation },
        queries: { getCustomerAddressesQuery, getCustomerCartAddressQuery },
        toggleActiveContent,
        setCheckoutStep = () => { }
    } = props;

    const [, { toggleDrawer }] = useAppContext();
    // const [{ cartId }] = useCartContext();
    const [{ isSignedIn }] = useUserContext();

    const addressCount = useRef();
    const [activeAddress, setActiveAddress] = useState();
    const [selectedAddress, setSelectedAddress] = useState();

    const [
        setCustomerAddressOnCart,
        {
            error: setCustomerAddressOnCartError,
            loading: setCustomerAddressOnCartLoading
        }
    ] = useMutation(setCustomerAddressOnCartMutation);

    const {
        data: customerAddressesData,
        loading: customerAddressesLoading
    } = useQuery(getCustomerAddressesQuery, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        skip: !isSignedIn
    });

    const {
        data: customerCartAddressData,
        loading: customerCartAddressLoading
    } = useQuery(getCustomerCartAddressQuery, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        skip: !isSignedIn
    });

    const derivedErrorMessage = useMemo(
        () => deriveErrorMessage([setCustomerAddressOnCartError]),
        [setCustomerAddressOnCartError]
    );

    const isLoading =
        customerAddressesLoading ||
        customerCartAddressLoading ||
        setCustomerAddressOnCartLoading;

    const customerAddresses =
        (customerAddressesData && customerAddressesData.customer.addresses) ||
        [];

    useEffect(() => {
        if (customerAddresses.length !== addressCount.current) {
            // Auto-select newly added address when count changes
            if (addressCount.current) {
                const newestAddress =
                    customerAddresses[customerAddresses.length - 1];
                if (newestAddress && newestAddress.id) {
                    setSelectedAddress(newestAddress.id);
                }
            }

            addressCount.current = customerAddresses.length;
        }
    }, [customerAddresses]);

    const handleEditAddress = useCallback(
        address => {
            setActiveAddress(address);
            toggleDrawer('shippingInformation.edit');
        },
        [toggleDrawer]
    );

    const handleAddAddress = useCallback(() => {
        handleEditAddress();
    }, [handleEditAddress]);

    const handleSelectAddress = useCallback(addressId => {
        setSelectedAddress(addressId);
    }, []);

    // GraphQL doesn't return which customer address is selected, so perform
    // a simple search to initialize this selected address value.
    if (
        customerAddresses.length &&
        customerCartAddressData &&
        !selectedAddress
    ) {
        const { customerCart } = customerCartAddressData;
        const { shipping_addresses: shippingAddresses } = customerCart;
        if (shippingAddresses.length) {
            const primaryCartAddress = shippingAddresses[0];

            const foundSelectedAddress = customerAddresses.find(
                customerAddress =>
                    customerAddress.street[0] ===
                    primaryCartAddress.street[0] &&
                    customerAddress.firstname ===
                    primaryCartAddress.firstname &&
                    customerAddress.lastname === primaryCartAddress.lastname
            );

            if (foundSelectedAddress) {
                setSelectedAddress(foundSelectedAddress.id);
            }
        }
    }

    const handleApplyAddress = useCallback(async (id) => {
        try {
            const result = await setCustomerAddressOnCart({
                variables: {
                    cartId: localStorage.getItem('cart_id'),
                    addressId: id || selectedAddress
                }
            });
            if (result && result.data && result.data.setShippingAddressesOnCart && result.data.setShippingAddressesOnCart.cart && result.data.setShippingAddressesOnCart.cart.shipping_addresses && result.data.setShippingAddressesOnCart.cart.shipping_addresses.length && result.data.setShippingAddressesOnCart.cart.shipping_addresses[0].selected_shipping_method && result.data.setShippingAddressesOnCart.cart.shipping_addresses[0].selected_shipping_method.method_title) {
                setCheckoutStep(CHECKOUT_STEP.PAYMENT)
            }
        } catch {
            return;
        }

        toggleActiveContent();
    }, [
        localStorage.getItem('cart_id'),
        selectedAddress,
        setCustomerAddressOnCart,
        toggleActiveContent
    ]);

    const handleCancel = useCallback(() => {
        setSelectedAddress();
        toggleActiveContent();
    }, [toggleActiveContent]);

    return {
        activeAddress,
        customerAddresses,
        errorMessage: derivedErrorMessage,
        isLoading,
        handleAddAddress,
        handleApplyAddress,
        handleCancel,
        handleSelectAddress,
        handleEditAddress,
        selectedAddress
    };
};
