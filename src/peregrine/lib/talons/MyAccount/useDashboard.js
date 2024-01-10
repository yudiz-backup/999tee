import React, { useCallback, useEffect, useState, useContext } from 'react';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { useQuery, useMutation, useApolloClient, useLazyQuery } from '@apollo/client';
import { useAwaitQuery } from '@magento/peregrine/lib/hooks/useAwaitQuery';
import { clearCustomerDataFromCache } from '@magento/peregrine/lib/Apollo/clearCustomerDataFromCache';
import cancleOrder from '../../../../queries/cancleOrder.graphql';
import { globalContext } from '../../context/global';

const DEFAULT_TITLE = 'My Account';
const UNAUTHED_TITLE = 'Signing Out';
const UNAUTHED_SUBTITLE = 'Please wait...';
const INITIAL_QUANTITY = 1;

export const useDashboard = () => {
    const [{ currentUser, isSignedIn }] = useUserContext();
    const {
        email,
        company,
        firstname,
        lastname,
        addresses,
        mobilenumber,
        default_billing,
        default_shipping,
        is_subscribed
    } = currentUser;
    const name = `${firstname} ${lastname}`.trim() || DEFAULT_TITLE;
    const title = email ? name : UNAUTHED_TITLE;
    const subtitle = email ? email : UNAUTHED_SUBTITLE;
    let billingAddress;
    let shippingAddress;

    if (typeof addresses != 'undefined') {
        addresses.forEach(element => {
            if (element.id == default_billing) {
                billingAddress = element;
            }
            if (element.id == default_shipping) {
                shippingAddress = element;
            }
        });
    }

    return {
        name,
        email,
        subtitle,
        title,
        mobilenumber,
        billingAddress,
        shippingAddress,
        default_billing,
        isSignedIn,
        is_subscribed,
        lastname,
        firstname,
        company
    };
};

export const useCustomerOrder = props => {
    const [{ isSignedIn }] = useUserContext();
    const { query, customerQuery, current_page, limit } = props;
    const apolloClient = useApolloClient();
    const [, { getUserDetails }] = useUserContext();
    const fetchUserDetails = useAwaitQuery(customerQuery);


    const [custermerOrderData, { error, data, loading, fetchMore }] = useLazyQuery(query, {
        variables: {
            current_page: current_page,
            limit: limit
        },
        fetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: true
    });

    const [cancleOrderData, { data: orderCancleMsg }] = useMutation(cancleOrder, {
        onCompleted: (data) => {
            if (data) {
                custermerOrderData()
            }
        }
    })

    useEffect(() => {
        custermerOrderData()
    }, [])

    useEffect(() => {
        clearCustomerDataFromCache(apolloClient);
        getUserDetails({ fetchUserDetails });
        if (error) {
            console.log(error);
        }
    }, [error, apolloClient, fetchUserDetails, getUserDetails]);
    const loadMore = async params => {
        fetchMore({
            variables: {
                current_page: params.current_page,
                limit: params.limit
            },
            updateQuery: (pv, { fetchMoreResult }) => {
                if (!fetchMoreResult) {
                    return pv;
                }
                return {
                    customerOrderList: {
                        __typename: 'CustomerOrderList',
                        items: [
                            ...pv.customerOrderList.items,
                            ...fetchMoreResult.customerOrderList.items
                        ],
                        total_count:
                            fetchMoreResult.customerOrderList.total_count,
                        current_page: params.current_page,
                        limit: params.limit
                    }
                };
            }
        });
    };
    return {
        loading,
        isSignedIn,
        data: data && data.customerOrderList,
        loadMore,
        cancleOrderData,
        orderCancleMsg,
    };
};

export const useCustomerTransactionDetails = props => {
    const [{ isSignedIn }] = useUserContext();

    const { query, customerQuery, current_page, limit } = props;
    const apolloClient = useApolloClient();
    const [, { getUserDetails }] = useUserContext();
    const fetchUserDetails = useAwaitQuery(customerQuery);
    const { error, data, loading, fetchMore } = useQuery(query, {
        variables: {
            current_page: current_page,
            limit: limit
        },
        fetchPolicy: 'network-only'
    });
    useEffect(() => {
        clearCustomerDataFromCache(apolloClient);
        getUserDetails({ fetchUserDetails });
        if (error) {
            console.log(error);
        }
    }, [error, apolloClient, fetchUserDetails, getUserDetails]);
    const loadMore = async params => {
        fetchMore({
            variables: {
                current_page: params.current_page,
                limit: params.limit
            },
            updateQuery: (pv, { fetchMoreResult }) => {
                if (!fetchMoreResult) {
                    return pv;
                }
                return {
                    customerOrderList: {
                        __typename: 'CustomerOrderList',
                        items: [
                            ...pv.customerOrderList.items,
                            ...fetchMoreResult.customerOrderList.items
                        ],
                        total_count:
                            fetchMoreResult.customerOrderList.total_count,
                        current_page: params.current_page,
                        limit: params.limit
                    }
                };
            }
        });
    };
    return {
        loading,
        isSignedIn,
        data: data && data.customerOrderList,
        loadMore
    };
};

export const useOrderDetails = props => {
    const [{ isSignedIn }] = useUserContext();
    const { query, orderId } = props;
    var id = orderId;

    const { error, data } = useQuery(query, {
        variables: { id: id },
        fetchPolicy: 'network-only'
    });
    useEffect(() => {
        window.scrollTo(0, 0);
        if (error) {
            console.log(error);
        }
    }, [error]);

    return {
        orderId: id,
        isSignedIn,
        data: data && data.orderDetails
    };
};
export const useDeleteFromWishlist = props => {
    const { query, customerQuery } = props;
    const apolloClient = useApolloClient();

    const [removeItem, { data: removeResponse }] = useMutation(query);
    const [, { getUserDetails }] = useUserContext();
    const fetchUserDetails = useAwaitQuery(customerQuery);
    const [{ isSignedIn }] = useUserContext();

    const [removing, setRemoving] = useState(false);
    const handleRemoveItem = useCallback(
        async ({ product_id }) => {
            try {
                setRemoving(true);
                await removeItem({ variables: { product_id } });
                await clearCustomerDataFromCache(apolloClient);
                getUserDetails({ fetchUserDetails });
                setRemoving(false);
            } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    console.error(error);
                    setRemoving(false);
                }
            }
        },
        [removeItem, apolloClient, fetchUserDetails, getUserDetails]
    );
    return {
        isSignedIn,
        handleRemoveItem,
        removing,
        removeResponse
    };
};

export const useWishlist = props => {
    const { query, customerQuery } = props;
    const apolloClient = useApolloClient();

    const [{ currentUser, isSignedIn }, { getUserDetails }] = useUserContext();
    const fetchUserDetails = useAwaitQuery(customerQuery);

    const { dispatch } = useContext(globalContext)

    const { error, data, loading, refetch } = useQuery(query, {
        fetchPolicy: 'network-only',
        skip: !isSignedIn
    });
    const [quantity, setQuantity] = useState(INITIAL_QUANTITY);
    useEffect(() => {
        if (error) {
            console.log(error);
        }
    }, [error]);

    useEffect(() => {
        if (data && isSignedIn) {
            dispatch({
                type: 'WISHLIST_COUNT',
                payload: data?.wishlist?.items_count
            })
        }
    }, [data, isSignedIn]);

    const handleSetQuantity = useCallback(
        value => {
            getUserDetails({ fetchUserDetails });
            setQuantity(value);
        },
        [fetchUserDetails, getUserDetails]
    );

    return {
        fetchUserDetails,
        apolloClient,
        getUserDetails,
        isSignedIn,
        data: data && data?.wishlist?.items,
        handleSetQuantity,
        quantity,
        currentUser,
        loading,
        refetch
    };
};

export const useProductReviews = props => {
    const [{ isSignedIn }] = useUserContext();
    const { query, current_page, limit } = props;
    const { error, data, fetchMore } = useQuery(query, {
        variables: {
            current_page: current_page,
            limit: limit
        },
        fetchPolicy: 'network-only'
    });

    useEffect(() => {
        if (error) {
            console.log(error);
        }
    }, [error]);
    const loadMore = async params => {
        fetchMore({
            variables: {
                current_page: params.current_page,
                limit: params.limit
            },
            updateQuery: (pv, { fetchMoreResult }) => {
                if (!fetchMoreResult) {
                    return pv;
                }
                return {
                    productReviews: {
                        __typename: 'productReviewsData',
                        data: [
                            ...pv.productReviews.data,
                            ...fetchMoreResult.productReviews.data
                        ],
                        total_count: fetchMoreResult.productReviews.total_count,
                        current_page: params.current_page,
                        limit: params.limit
                    }
                };
            }
        });
    };
    if (typeof data != 'undefined') {
        return { isSignedIn, productReviews: data.productReviews, loadMore };
    } else {
        return { isSignedIn, productReviews: '' };
    }
};

export const useCustomer = props => {
    const { query } = props;
    const [{ isSignedIn }] = useUserContext();
    const { error, data } = useQuery(query, { fetchPolicy: 'network-only' });
    useEffect(() => {
        if (error) {
            console.log(error);
        }
    }, [error]);

    return {
        isSignedIn,
        data: data && data.customer
    };
};

export const useUpdateCustomer = props => {
    const { query, changeCustomerPasswordQuery, updatePassword } = props;
    const [updating, setUpdating] = useState(false);
    const { dispatch } = React.useContext(globalContext);

    const [
        updateCustomer,
        { error: updateError, data: responseData }
    ] = useMutation(query);

    const [changePassword, { error: pUpdateError }] = useMutation(
        changeCustomerPasswordQuery
    );

    const errors = [];
    if (updateError) {
        errors.push(updateError.graphQLErrors[0]);
    }
    if (pUpdateError) {
        errors.push(pUpdateError.graphQLErrors[0]);
    }
    const handleSubmit = useCallback(
        async ({
            firstname,
            lastname,
            email,
            mobilenumber,
            password,
            new_password,
            // change_password,
            cin_number,
            gst_number,
            // company,
            // twitter_link,
            // facebook_link,
            // insta_link,
            dob
        }) => {
            setUpdating(true);
            try {
                // Sign in and save the token
                if (
                    // change_password &&
                    // change_password == true &&
                    updatePassword &&
                    password &&
                    new_password
                ) {
                    await changePassword({
                        variables: {
                            currentPassword: password,
                            newPassword: new_password
                        }
                    });
                }

                const updateCustomerResult = await updateCustomer({
                    variables: {
                        firstname,
                        lastname,
                        email,
                        mobilenumber,
                        password,
                        cin_number: cin_number || "",
                        gst_number: gst_number || "",
                        // company: company,
                        // twitter_link: twitter_link || "",
                        // facebook_link: facebook_link || "",
                        // insta_link: insta_link || "",
                        dob
                    }
                });
                if (updateCustomerResult?.data?.updateCustomer?.customer?.firstname) {
                    dispatch({
                        type: 'USER_DETAILS',
                        payload: {
                            firstname: updateCustomerResult?.data?.updateCustomer?.customer?.firstname,
                            lastname: updateCustomerResult?.data?.updateCustomer?.customer?.lastname,
                        }
                    });
                }
                setUpdating(false);
            } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    console.error(error);
                }
                setUpdating(false);
            }
        },
        [changePassword, updateCustomer]
    );

    return {
        errors,
        handleSubmit,
        isBusy: updating,
        responseData: responseData && responseData.updateCustomer
    };
};

export const useCreateAddress = props => {
    const [{ isSignedIn }] = useUserContext();
    const { query } = props;
    const [updating, setUpdating] = useState(false);
    const [
        updateCustomer,
        { message: updateError, data: responseData }
    ] = useMutation(query);

    const errors = [];
    if (updateError) {
        errors.push(updateError.graphQLErrors[0]);
    }

    const handleSubmit = useCallback(
        async fields => {
            setUpdating(true);
            try {
                // Sign in and save the token
                await updateCustomer({
                    variables: { input: fields }
                });
                setUpdating(false);
            } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    console.error(error);
                }
                setUpdating(false);
            }
        },
        [updateCustomer]
    );

    return {
        isSignedIn,
        errors,
        handleSubmit,
        isBusy: updating,
        responseData
    };
};

export const useInvoiceDetails = props => {
    const [{ isSignedIn }] = useUserContext();
    const { query, orderId } = props;

    const { error, data } = useQuery(query, {
        variables: { order_id: orderId },
        fetchPolicy: 'network-only'
    });
    useEffect(() => {
        if (error) {
            console.log(error);
        }
    }, [error]);

    return {
        isSignedIn,
        data: data && data.invoiceDetails
    };
};

export const useAdditionalAddress = props => {
    const { query, customerQuery, current_page, limit } = props;
    const apolloClient = useApolloClient();

    const [{ currentUser, isSignedIn }, { getUserDetails }] = useUserContext();

    const { default_billing, default_shipping } = currentUser;
    const { error, data, refetch: refetchAddress, fetchMore } = useQuery(
        query,
        {
            variables: {
                default_billing: default_billing,
                default_shipping: default_shipping,
                current_page: current_page,
                limit: limit
            },
            fetchPolicy: 'network-only',
        }
    );

    const fetchUserDetails = useAwaitQuery(customerQuery);
    useEffect(() => {
        clearCustomerDataFromCache(apolloClient);
        getUserDetails({ fetchUserDetails });
        if (error) {
            console.log(error);
        }
    }, [error, apolloClient, fetchUserDetails, getUserDetails]);
    const loadMore = async params => {
        fetchMore({
            variables: {
                current_page: params.current_page,
                limit: params.limit
            },
            updateQuery: (pv, { fetchMoreResult }) => {
                if (!fetchMoreResult) {
                    return pv;
                }
                return {
                    addressCollection: {
                        __typename: 'addressCollectionData',
                        item: [
                            ...pv.addressCollection.item,
                            ...fetchMoreResult.addressCollection.item
                        ],
                        total_count:
                            fetchMoreResult.addressCollection.total_count,
                        current_page: params.current_page,
                        limit: params.limit
                    }
                };
            }
        });
    };
    return {
        isSignedIn,
        addresses: data && data.addressCollection,
        refetchAddress,
        loadMore
    };
};
export const useAddressData = props => {
    const [{ isSignedIn }] = useUserContext();
    const { query, id, addressQuery } = props;
    const { error, data } = useQuery(query, {
        variables: { id: id },
        fetchPolicy: 'network-only',
        skip: id ? false : true
    });
    const { data: countryData } = useQuery(addressQuery, {
        fetchPolicy: 'network-only'
    });
    useEffect(() => {
        if (error) {
            console.log(error);
        }
    }, [error]);
    return {
        isSignedIn,
        address: data && data.addressData,
        countries: countryData && countryData.countries
    };
};

export const useUpdateAddress = props => {
    const [{ isSignedIn }] = useUserContext();
    const { query } = props;
    const [updating, setUpdating] = useState(false);
    const [
        updateCustomer,
        { message: updateError, data: responseData }
    ] = useMutation(query);

    const errors = [];
    if (updateError) {
        errors.push(updateError.graphQLErrors[0]);
    }

    const handleSubmit = useCallback(
        async (id, fields) => {
            setUpdating(true);
            try {
                await updateCustomer({
                    variables: { id: id, input: fields }
                });
                setUpdating(false);
            } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    console.error(error);
                }
                setUpdating(false);
            }
        },
        [updateCustomer]
    );

    return {
        isSignedIn,
        errors,
        handleSubmit,
        isBusy: updating,
        responseData
    };
};

export const useDeleteAddress = props => {
    const [{ isSignedIn }] = useUserContext();
    const { query } = props;
    const [updating, setUpdating] = useState(false);
    const [
        deleteCustomer,
        { message: updateError, data: deleteResponse }
    ] = useMutation(query);

    const errors = [];
    if (updateError) {
        errors.push(updateError.graphQLErrors[0]);
    }

    const handleDelete = useCallback(
        async id => {
            setUpdating(true);
            try {
                await deleteCustomer({
                    variables: { id: id }
                });
                setUpdating(false);
            } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    console.error(error);
                }
                setUpdating(false);
            }
        },
        [deleteCustomer]
    );

    return {
        isSignedIn,
        errors,
        handleDelete,
        isBusy: updating,
        deleteResponse
    };
};

export const useUpdateNewsletter = props => {
    const { query } = props;
    const [updating, setUpdating] = useState(false);
    const [
        updateCustomer,
        { error: updateError, data: responseData }
    ] = useMutation(query);
    const [{ isSignedIn, currentUser }, { getUserDetails }] = useUserContext();
    const { extension_attributes } = currentUser;

    const errors = [];
    if (updateError) {
        errors.push(updateError.graphQLErrors[0]);
    }

    const handleSubmit = useCallback(
        async ({ subscribe }) => {
            setUpdating(true);
            try {
                await updateCustomer({
                    variables: { is_subscribed: subscribe }
                });
                await getUserDetails();
                setUpdating(false);
            } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    console.error(error);
                }
                setUpdating(false);
            }
        },
        [updateCustomer, getUserDetails]
    );

    return {
        errors,
        handleSubmit,
        isBusy: updating,
        responseData: responseData && responseData.updateCustomer,
        isSignedIn,
        extension_attributes
    };
};

export const useShipmentDetails = props => {
    const [{ isSignedIn }] = useUserContext();
    const { query, orderId } = props;

    const { error, data } = useQuery(query, {
        variables: { order_id: orderId },
        fetchPolicy: 'network-only'
    });
    useEffect(() => {
        if (error) {
            console.log(error);
        }
    }, [error]);

    return {
        isSignedIn,
        data: data && data.shipmentDetails
    };
};

export const useRefunds = props => {
    const [{ isSignedIn }] = useUserContext();
    const { query, orderId } = props;

    const { error, data } = useQuery(query, {
        variables: { order_id: orderId },
        fetchPolicy: 'network-only'
    });
    useEffect(() => {
        if (error) {
            console.log(error);
        }
    }, [error]);

    return {
        isSignedIn,
        data: data && data.creditMemoDetails
    };
};
export const useReorder = props => {
    const { query } = props;
    const [reorder, { data: reoderResponse }] = useMutation(query, {
        fetchPolicy: "no-cache"
    });
    const [{ isSignedIn }] = useUserContext();
    const [orderFlag, setOrderFlag] = useState(false);
    const handleReorder = useCallback(
        async ({ orderNumber }) => {
            try {
                setOrderFlag(true);
                await reorder({ variables: { orderNumber } });
                setOrderFlag(false);
            } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    console.error(error);
                    setOrderFlag(false);
                }
            }
        },
        [reorder]
    );

    return {
        isSignedIn,
        handleReorder,
        orderFlag,
        reoderResponse
    };
};
