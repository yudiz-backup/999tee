import { useCallback, useMemo, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { useUserContext } from '@magento/peregrine/lib/context/user';
// import { useCartContext } from '@magento/peregrine/lib/context/cart';
import getCountriesQuery from '../../../../../../queries/getCountries.graphql';
import { useAddressData } from '../../../MyAccount/useDashboard';
import getAddressData from '../../../../../../queries/getAddressData.graphql';

export const useGuestForm = props => {
    const [{ currentUser, isSignedIn }] = useUserContext();
    const {
        afterSubmit,
        mutations: { setGuestShippingMutation },
        onCancel,
        shippingData,
        formRef,
        derivedPrimaryEmail = ''
    } = props;

    // const [{ cartId }] = useCartContext();
    const { countries } = useAddressData({
        query: getAddressData,
        id: '',
        addressQuery: getCountriesQuery
    });

    const [setGuestShipping, { error, loading }] = useMutation(
        setGuestShippingMutation
    );

    const { country, region } = shippingData || {};
    const { code: countryCode } = country || {};
    const { code: regionCode } = region || {};
    const loginEmailAddress = isSignedIn && currentUser && currentUser.email ? currentUser.email : '';

    const initialValues = {
        ...shippingData,
        country: countries && countries.length && countries[0].id ? countries[0].id : countryCode,
        region: regionCode,
        email: shippingData && shippingData.email ? shippingData.email : derivedPrimaryEmail ? derivedPrimaryEmail : loginEmailAddress,
        confirmEmail: derivedPrimaryEmail ? derivedPrimaryEmail : ''
    };

    useEffect(() => {
        if (formRef && formRef.current && isSignedIn && currentUser && currentUser.email) {
            const existEmail = formRef.current.getValue('email')
            if (!existEmail) {
                formRef.current.setValue('email', currentUser.email)
            }
        }
    }, [formRef, isSignedIn, currentUser])

    // Simple heuristic to indicate form was submitted prior to this render
    const isUpdate = !!(shippingData && shippingData.city);

    const handleSubmit = useCallback(
        async formValues => {
            const { country, email, ...address } = formValues;
            try {
                await setGuestShipping({
                    variables: {
                        cartId: localStorage.getItem('cart_id'),
                        email,
                        address: {
                            firstname: address.firstname.charAt(0).toUpperCase() + address.firstname.slice(1),
                            lastname: address.lastname.charAt(0).toUpperCase() + address.lastname.slice(1),
                            street: address.street,
                            region: address.region,
                            city: address.city,
                            postcode: address.postcode,
                            telephone: address.telephone,
                            country_code: country
                        },
                        country_code: country,
                        confirmEmail: undefined
                    }
                });
            } catch {
                return;
            }

            if (afterSubmit) {
                afterSubmit();
            }
        },
        [afterSubmit, localStorage.getItem('cart_id'), setGuestShipping]
    );

    const handleCancel = useCallback(() => {
        onCancel();
    }, [onCancel]);

    const errors = useMemo(
        () => new Map([['setGuestShippingMutation', error]]),
        [error]
    );

    return {
        errors,
        handleCancel,
        handleSubmit,
        initialValues,
        isSaving: loading,
        isUpdate
    };
};
