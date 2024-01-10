import { useQuery } from '@apollo/client';

export const usePaymentMethods = props => {
    const { queries, selectedPaymentMethod = '' } = props;
    const { getPaymentMethodsQuery } = queries;

    const { data, loading } = useQuery(getPaymentMethodsQuery, {
        skip: !localStorage.getItem('cart_id'),
        variables: { cartId: localStorage.getItem('cart_id') }
    });
   
    
    const availablePaymentMethods =
        (data && data.cart.available_payment_methods) || [];

        const initialSelectedMethod = selectedPaymentMethod ? selectedPaymentMethod : (availablePaymentMethods.length && availablePaymentMethods[0].code) ? availablePaymentMethods[0].code : null;

    return {
        availablePaymentMethods,
        currentSelectedPaymentMethod: initialSelectedMethod,
        initialSelectedMethod,
        isLoading: loading
    };
};
