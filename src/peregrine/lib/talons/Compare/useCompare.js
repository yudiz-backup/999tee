import { useCallback, useEffect } from 'react';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';

import { Util } from '@magento/peregrine';
const { BrowserPersistence } = Util;
const storage = new BrowserPersistence();
import { useAwaitQuery } from '@magento/peregrine/lib/hooks/useAwaitQuery';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import GET_CUSTOMER_QUERY from '../../../../queries/getCustomer.graphql';
import { clearCustomerDataFromCache } from '@magento/peregrine/lib/Apollo/clearCustomerDataFromCache';

export const useCompare = props => {
    const apolloClient = useApolloClient();
    const { createCompareMutation, addToCompareMutation } = props;
    const [createCompareList, { data: compareData }] = useMutation(
        createCompareMutation
    );

    const [addtoCompareList, { data: addcompareData }] = useMutation(
        addToCompareMutation
    );

    const [, { getUserDetails }] = useUserContext();
    const fetchUserDetails = useAwaitQuery(GET_CUSTOMER_QUERY);

    const handleCreateCompare = useCallback(
        async productId => {
            try {
                await createCompareList({
                    variables: {
                        products: productId
                    }
                });
                await clearCustomerDataFromCache(apolloClient);
                getUserDetails({ fetchUserDetails });
            } catch (err) {
                console.log(err);
            }
        },
        [createCompareList, apolloClient, fetchUserDetails, getUserDetails]
    );

    var uid = storage.getItem('compare_uid')
        ? storage.getItem('compare_uid')
        : '';

    const handleAddCompare = useCallback(
        async productId => {
            try {
                await addtoCompareList({
                    variables: {
                        products: productId,
                        uid: uid
                    },
                    skip: uid != '' ? false : true
                });
                await clearCustomerDataFromCache(apolloClient);
                getUserDetails({ fetchUserDetails });
            } catch (err) {
                storage.removeItem('compare_uid');
                handleCreateCompare(productId);
                console.log(err);
            }
        },
        [
            addtoCompareList,
            uid,
            apolloClient,
            getUserDetails,
            fetchUserDetails,
            handleCreateCompare
        ]
    );

    return {
        handleCreateCompare,
        createCompareData: compareData && compareData.createCompareList,
        handleAddCompare,
        compareResponse:
            (compareData && compareData.createCompareList) || addcompareData
    };
};

export const useRemoveCompare = props => {
    const { removeCompareMutation, CustomerQuery } = props;
    const apolloClient = useApolloClient();

    const [, { getUserDetails }] = useUserContext();
    const fetchUserDetails = useAwaitQuery(CustomerQuery);

    const [removeompareList, { data: compareData }] = useMutation(
        removeCompareMutation
    );

    var uid = storage.getItem('compare_uid')
        ? storage.getItem('compare_uid')
        : '';

    const handleRemoveCompare = useCallback(
        async productId => {
            try {
                await removeompareList({
                    variables: {
                        products: productId,
                        uid: uid
                    }
                });
                await clearCustomerDataFromCache(apolloClient);
                getUserDetails({ fetchUserDetails });
            } catch (err) {
                console.log(err);
            }
        },
        [removeompareList, uid, apolloClient, getUserDetails, fetchUserDetails]
    );

    return {
        handleRemoveCompare,
        removeResponse: compareData && compareData.removeProductsFromCompareList
    };
};

export const useCompareList = props => {
    const { query } = props;
    var uid = storage.getItem('compare_uid')
        ? storage.getItem('compare_uid')
        : '';
    const { error, data, refetch, loading } = useQuery(query, {
        variables: { uid: uid },
        fetchPolicy: 'no-cache',
        skip: uid != '' ? false : true
    });
    useEffect(() => {
        if (error) {
            console.log(error);
        }
    }, [error]);

    return {
        data: data && data.compareList,
        refetch,
        loading
    };
};

export const useAssignToCustomer = props => {
    const { assignMutation } = props;
    const [assignToCustomer] = useMutation(assignMutation);

    var uid = storage.getItem('compare_uid')
        ? storage.getItem('compare_uid')
        : '';

    const handleAssignToCustomer = useCallback(async () => {
        try {
            await assignToCustomer({
                variables: {
                    uid: uid
                },
                skip: uid != '' ? false : true
            });
        } catch (err) {
            console.log(err);
        }
    }, [assignToCustomer, uid]);

    return {
        handleAssignToCustomer
    };
};
