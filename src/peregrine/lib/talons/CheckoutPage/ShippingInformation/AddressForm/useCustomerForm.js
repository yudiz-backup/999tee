import { useCallback, useMemo } from 'react';
import { useMutation, useQuery } from '@apollo/client';

export const useCustomerForm = props => {
    const {
        afterSubmit,
        mutations: {
            createCustomerAddressMutation,
            updateCustomerAddressMutation
        },
        onCancel,
        queries: {
            getCustomerQuery,
            getCustomerAddressesQuery,
            getDefaultShippingQuery
        },
        shippingData
    } = props;

    const [
        createCustomerAddress,
        {
            error: createCustomerAddressError,
            loading: createCustomerAddressLoading
        }
    ] = useMutation(createCustomerAddressMutation);

    const [
        updateCustomerAddress,
        {
            error: updateCustomerAddressError,
            loading: updateCustomerAddressLoading
        }
    ] = useMutation(updateCustomerAddressMutation);

    const { data: customerData, loading: getCustomerLoading } = useQuery(
        getCustomerQuery
    );

    const isSaving =
        createCustomerAddressLoading || updateCustomerAddressLoading;

    // Simple heuristic to indicate form was submitted prior to this render
    const isUpdate = !!shippingData.city;

    const { country } = shippingData;
    const { code: countryCode } = country;

    let initialValues = {
        ...shippingData,
        country: countryCode,
        region: {
            region_id: shippingData && shippingData.region && shippingData.region.region_code ?shippingData.region.region_code : ''
        }
    };

    const hasDefaultShipping =
        !!customerData && !!customerData.customer.default_shipping;

    // For first time creation pre-fill the form with Customer data
    if (!isUpdate && !getCustomerLoading && !hasDefaultShipping) {
        const { customer } = customerData || {};
        const { email, firstname, lastname, mobilenumber } = customer || {};
        const defaultUserData = { email, firstname, lastname, telephone: mobilenumber ? mobilenumber : '' };
        initialValues = {
            ...initialValues,
            ...defaultUserData
        };
    }

    const handleSubmit = useCallback(
        async formValues => {
            // eslint-disable-next-line no-unused-vars
            const { country, email, ...address } = formValues;
            let result;
            try {
                const customerAddress = {
                    ...address,
                    country_code: country
                };

                if (isUpdate) {
                    const { id: addressId } = shippingData;
                    result = await updateCustomerAddress({
                        variables: {
                            addressId,
                            address: customerAddress
                        },
                        refetchQueries: [{ query: getCustomerAddressesQuery }]
                    });
                } else {
                    result = await createCustomerAddress({
                        variables: {
                            address: customerAddress
                        },
                        refetchQueries: [
                            { query: getCustomerAddressesQuery },
                            { query: getDefaultShippingQuery }
                        ]
                    });
                }
            } catch {
                return;
            }

            if (afterSubmit) {
                const resultAddressId =
                    result &&
                    result.data &&
                    result.data.updateCustomerAddress &&
                    (result.data.updateCustomerAddress.id ||
                        result.data.updateCustomerAddress.id === 0)
                        ? result.data.updateCustomerAddress.id
                        : result &&
                          result.data &&
                          result.data.createCustomerAddress &&
                          (result.data.createCustomerAddress.id ||
                              result.data.createCustomerAddress.id === 0)
                        ? result.data.createCustomerAddress.id
                        : undefined;
                        
                afterSubmit(resultAddressId);
            }
        },
        [
            afterSubmit,
            createCustomerAddress,
            getCustomerAddressesQuery,
            getDefaultShippingQuery,
            isUpdate,
            shippingData,
            updateCustomerAddress
        ]
    );

    const handleCancel = useCallback(() => {
        onCancel();
    }, [onCancel]);

    const errors = useMemo(
        () =>
            new Map([
                ['createCustomerAddressMutation', createCustomerAddressError],
                ['updateCustomerAddressMutation', updateCustomerAddressError]
            ]),
        [createCustomerAddressError, updateCustomerAddressError]
    );

    return {
        errors,
        handleCancel,
        handleSubmit,
        hasDefaultShipping,
        initialValues,
        isLoading: getCustomerLoading,
        isSaving,
        isUpdate
    };
};
