import { useCallback, useRef, useState, useMemo, useEffect, useContext } from 'react';
import { useApolloClient, useMutation, useLazyQuery } from '@apollo/client';
import { useHistory } from 'react-router-dom';
import { retrieveCartId } from '@magento/peregrine/lib/store/actions/cart';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { useCartContext } from '@magento/peregrine/lib/context/cart';
import { useAwaitQuery } from '@magento/peregrine/lib/hooks/useAwaitQuery';
import { clearCartDataFromCache } from '@magento/peregrine/lib/Apollo/clearCartDataFromCache';
import { clearCustomerDataFromCache } from '@magento/peregrine/lib/Apollo/clearCustomerDataFromCache';
import { useSaveToken } from '../PushNotification/usePushNotification';
import SAVE_TOKEN from '../../../../queries/saveToken.graphql';
import { globalContext } from '../../../../peregrine/lib/context/global';

import { Util } from '@magento/peregrine';
const { BrowserPersistence } = Util;
const storage = new BrowserPersistence();

export const useSignIn = props => {
    const history = useHistory()
    const { dispatch } = useContext(globalContext);
    // const refCaptcha = useRef(null)
    const {
        createCartMutation,
        customerQuery,
        getCartDetailsQuery,
        mergeCartsMutation,
        setDefaultUsername,
        showCreateAccount,
        showForgotPassword,
        signInMutation,
        assignMutation,
        verifyMobileOTP,
        verifyOTP,
        mobileNumber,
        verifyOTPData,
        setVerifyOTPData,
        // refCaptcha,
        setSignUpSuccessMessage = () => { },
        setIsValid = () => { },
        // setError
    } = props;

    const apolloClient = useApolloClient();
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [signInError, setSignInError] = useState();

    const [
        { cartId },
        { createCart, removeCart, getCartDetails }
    ] = useCartContext();

    const [
        { isGettingDetails, getDetailsError },
        { getUserDetails, setToken }
    ] = useUserContext();

    const [signIn, { /* error, */ loading: signinLoading }] = useMutation(signInMutation, {
        fetchPolicy: 'no-cache',
        onError: setSignInError
    });
    const [assignToCustomer] = useMutation(assignMutation);

    // const [verifySigninOTP] = useLazyQuery(verifyMobileOTP, {
    //     fetchPolicy: "cache-and-network",
    //     onCompleted: (data) => {
    //         setVerifyOTPData(data)
    //         const tokenId = data && data.loginOTPVerify && data.loginOTPVerify.token
    //         if (tokenId) {
    //             localStorage.setItem('token', tokenId)
    //         }
    //         setToken(tokenId)
    //         if (tokenId) {
    //             history.push('/')
    //         }
    //     }
    // })

    const [verifySigninOTP] = useLazyQuery(verifyMobileOTP, {
        fetchPolicy: 'no-cache',
        onCompleted: (data) => {
            setVerifyOTPData(data)
        }
    })
    const OTPToken = verifyOTPData && verifyOTPData.loginOTPVerify && verifyOTPData.loginOTPVerify.token
    const OtpCartId = verifyOTPData && verifyOTPData.loginOTPVerify && verifyOTPData.loginOTPVerify.cart_id
    if (OTPToken) {
        window.dataLayer.push({
            event: 'customer_login',
            data: {
                mobileNumber,
                cart_id: destinationCartId
            }
        });

        localStorage.setItem('cart_id', OtpCartId)
        storage.setItem('cartId', OtpCartId);
        setToken(OTPToken)
        history.push("/")
    }

    const [fetchCartId] = useMutation(createCartMutation);
    const [mergeCarts] = useMutation(mergeCartsMutation);
    const fetchUserDetails = useAwaitQuery(customerQuery);
    const fetchCartDetails = useAwaitQuery(getCartDetailsQuery);

    const formApiRef = useRef(null);
    const setFormApi = useCallback(api => (formApiRef.current = api), []);
    const updateUid = uid => {
        storage.removeItem('compare_uid');
        storage.setItem('compare_uid', uid);
    };
    const { saveToken } = useSaveToken({
        query: SAVE_TOKEN
    });

    const NotificationToken = localStorage.getItem('notification-token');

    useEffect(() => {
        const sourceCartId = cartId;
        if (OTPToken && sourceCartId) {
            mergeCarts({
                variables: {
                    destinationCartId: localStorage.getItem('cart_id', OtpCartId),
                    sourceCartId
                }
            });
        }
    }, [OTPToken])



    const handleOtpSubmit = async ({ cpatchaToken }) => {
        setIsSigningIn(true);
        localStorage.removeItem('isChecked')
        localStorage.removeItem('isCheckedAllCart')
        if (JSON.parse(localStorage.getItem('giftWrapper')) &&
            JSON.parse(localStorage.getItem('giftWrapper')).length) {
            localStorage.removeItem('giftWrapper')
        }
        localStorage.removeItem('isChecked')
        localStorage.removeItem('isCheckedAllCart')

        const allCartGiftWrapper = JSON.parse(localStorage.getItem('allCartGiftWrapper'))
        if (allCartGiftWrapper &&
            allCartGiftWrapper.mpGiftWrapWrapperSetAll &&
            allCartGiftWrapper.mpGiftWrapWrapperSetAll.length) {
            localStorage.removeItem('allCartGiftWrapper')
        }
        if (verifyOTP) {
            verifySigninOTP({
                variables: {
                    mobileNumber: mobileNumber,
                    otp: +verifyOTP,
                    websiteId: 1
                },
                context: {
                    headers: {
                        "X-ReCaptcha": cpatchaToken ? cpatchaToken : ""
                    }
                }
            })
        }
    }

    const handleSubmit = useCallback(
        async ({ email, password, type, cpatchaToken }) => {
            if (!email || !password) {
                setIsValid(true)
                dispatch({
                    type: 'IS_SIGNIN_FROM_CHECKOUT_PAGE',
                    payload: false
                });
                return
            } else {
                setIsValid(false)
                setIsSigningIn(true);
                setSignUpSuccessMessage('')
                localStorage.removeItem('isChecked')
                localStorage.removeItem('isCheckedAllCart')
                if (JSON.parse(localStorage.getItem('giftWrapper')) &&
                    JSON.parse(localStorage.getItem('giftWrapper')).length) {
                    localStorage.removeItem('giftWrapper')
                }
                localStorage.removeItem('isChecked')
                localStorage.removeItem('isCheckedAllCart')

                const allCartGiftWrapper = JSON.parse(localStorage.getItem('allCartGiftWrapper'))
                if (allCartGiftWrapper &&
                    allCartGiftWrapper.mpGiftWrapWrapperSetAll &&
                    allCartGiftWrapper.mpGiftWrapWrapperSetAll.length) {
                    localStorage.removeItem('allCartGiftWrapper')
                }
                try {
                    // Get source cart id (guest cart id).
                    const sourceCartId = cartId;
                    var uid = storage.getItem('compare_uid')
                        ? storage.getItem('compare_uid')
                        : '';

                    if (email && password) {

                        const signInResponse = await signIn({
                            variables: { email, password },
                            context: {
                                headers: {
                                    "X-ReCaptcha": cpatchaToken ? cpatchaToken : ""
                                }
                            }
                        });
                        const token = signInResponse.data.generateCustomerToken.token;
                        await setToken(token);
                        if (token && type !== 'checkout') {
                            history.push('/')
                        } else {
                            history.push('/checkout')
                        }

                    } else {
                        if (verifyOTP) {
                            verifySigninOTP({
                                variables: {
                                    mobileNumber: mobileNumber,
                                    otp: +verifyOTP,
                                    websiteId: 1
                                }
                            })
                        }
                    }

                    // Clear all cart/customer data from cache and redux.
                    await clearCartDataFromCache(apolloClient);
                    await clearCustomerDataFromCache(apolloClient);
                    await removeCart();

                    // Create and get the customer's cart id.
                    await createCart({
                        fetchCartId
                    });

                    const destinationCartId = await retrieveCartId();
                    localStorage.setItem('cart_id', destinationCartId)

                    window.dataLayer.push({
                        event: 'customer_login',
                        data: {
                            email,
                            cart_id: destinationCartId
                        }
                    });

                    await mergeCarts({
                        variables: {
                            destinationCartId,
                            sourceCartId
                        }
                    });
                    if (NotificationToken) {
                        saveToken({ tokenId: NotificationToken });
                    }
                    // await getUserDetails({ fetchUserDetails });
                    // Merge the guest cart into the customer cart.


                    if (uid != '') {
                        var comData = await assignToCustomer({
                            variables: {
                                uid: uid
                            },

                            skip: uid != '' ? false : true
                        });
                    }
                    if (
                        comData &&
                        comData.data.assignCompareListToCustomer &&
                        comData.data.assignCompareListToCustomer &&
                        comData.data.assignCompareListToCustomer.result == true
                    ) {
                        updateUid(
                            comData.data.assignCompareListToCustomer.compare_list
                                .uid
                        );
                    }
                    // await refCaptcha.current.executeAsync();
                    // const captchaToken = refCaptcha.current.getValue();
                    // captchaRef.current.reset();
                    // Ensure old stores are updated with any new data.
                    await getUserDetails({ fetchUserDetails });
                    await getCartDetails({ destinationCartId, fetchCartDetails });
                    localStorage.setItem('isCheckout', true)
                    // const userToken = localStorage.getItem('token')
                    if (type === 'checkout') {
                        refetch()
                    }
                    if (type === 'checkout') {
                        localStorage.setItem('isCheckout', true)
                        history.push('/checkout')
                    }
                    setIsSignInCheckout(true)
                    dispatch({
                        type: 'IS_SIGNIN_FROM_CHECKOUT_PAGE',
                        payload: false
                    });

                } catch (error) {
                    // if (process.env.NODE_ENV !== 'production') {
                    //     setError(error)
                    // }
                    setIsSigningIn(false);
                    dispatch({
                        type: 'IS_SIGNIN_FROM_CHECKOUT_PAGE',
                        payload: false
                    });
                }
            }
        },
        [
            cartId,
            signIn,
            setToken,
            apolloClient,
            removeCart,
            NotificationToken,
            createCart,
            fetchCartId,
            mergeCarts,
            assignToCustomer,
            getUserDetails,
            fetchUserDetails,
            getCartDetails,
            fetchCartDetails,
            saveToken,
            mobileNumber,
            verifyOTP
            // refCaptcha
        ]
    );

    const handleForgotPassword = useCallback(() => {
        const { current: formApi } = formApiRef;

        if (formApi) {
            setDefaultUsername(formApi.getValue('email'));
        }

        showForgotPassword();
    }, [setDefaultUsername, showForgotPassword]);

    const handleCreateAccount = useCallback(() => {
        const { current: formApi } = formApiRef;

        if (formApi) {
            setDefaultUsername(formApi.getValue('email'));
        }

        showCreateAccount();
    }, [setDefaultUsername, showCreateAccount]);

    const errors = useMemo(
        () =>
            new Map([
                ['getUserDetailsQuery', getDetailsError],
                ['signInMutation', signInError]
            ]),
        [getDetailsError, signInError]
    );

    return {
        errors,
        handleCreateAccount,
        handleForgotPassword,
        handleSubmit,
        handleOtpSubmit,
        isBusy: isGettingDetails || isSigningIn,
        setFormApi,
        formApiRef,
        setSignInError,
        signinLoading
        // refCaptcha: refCaptcha && refCaptcha.current
    };
};
