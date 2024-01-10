import { useCallback, useMemo, useState/* , useContext, useEffect */ } from 'react';
import { useApolloClient, useMutation } from '@apollo/client';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { useCartContext } from '@magento/peregrine/lib/context/cart';
import { useAwaitQuery } from '@magento/peregrine/lib/hooks/useAwaitQuery';
import { clearCartDataFromCache } from '@magento/peregrine/lib/Apollo/clearCartDataFromCache';
import { clearCustomerDataFromCache } from '@magento/peregrine/lib/Apollo/clearCustomerDataFromCache';
import { retrieveCartId } from '@magento/peregrine/lib/store/actions/cart';
import { useSaveToken } from '../PushNotification/usePushNotification';
import SAVE_TOKEN from '../../../../queries/saveToken.graphql';
// import { globalContext } from '../../context/global';
import createAccountWithOTP from '../../../../queries/signInWithOTP/createAccountWithOTP.graphql'
import registerWithB2B from '../../../../queries/registerWIthB2B/registerWithB2B.graphql'

/**
 * Returns props necessary to render CreateAccount component. In particular this
 * talon handles the submission flow by first doing a pre-submisson validation
 * and then, on success, invokes the `onSubmit` prop, which is usually the action.
 *
 * @param {CreateAccountQueries} props.queries queries used by the talon
 * @param {CreateAccountMutations} props.mutations mutations used by the talon
 * @param {InitialValues} props.initialValues initial values to sanitize and seed the form
 * @param {Function} props.onSubmit the post submit callback
 * @param {Function} props.onCancel the cancel callback
 *
 * @returns {CreateAccountProps}
 *
 * @example <caption>Importing into your project</caption>
 * import { useForgotPassword } from '@magento/peregrine/lib/talons/CreateAccount/useCreateAccount.js';
 */
export const useCreateAccount = props => {
    const {
        queries: { customerQuery, getCartDetailsQuery },
        mutations: {
            createAccountMutation,
            createCartMutation,
            signInMutation,
            mergeCartsMutation,
            assignMutation
        },
        initialValues = {},
        onSubmit,
        onCancel,
        genderCheck,
        formRef,
        setGenderCheck,
        redirectToSign,
        isChecked,
        mobileNumber,
        otpNumber,
        dispatch,
        B2BRegister,
        handleRedirectToLogin,
        setB2BRegister
    } = props;
    const apolloClient = useApolloClient();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [B2BData, setB2BData] = useState(false)
    const [
        { cartId },
        { createCart, removeCart, getCartDetails }
    ] = useCartContext();
    const [
        { isGettingDetails, isSignedIn },
        { getUserDetails, setToken }
    ] = useUserContext();

    const { saveToken } = useSaveToken({
        query: SAVE_TOKEN
    });
    const NotificationToken = localStorage.getItem('notification-token');

    const [assignToCustomer] = useMutation(assignMutation);

    const [fetchCartId] = useMutation(createCartMutation);

    const [mergeCarts] = useMutation(mergeCartsMutation);
    const [createAccountOTP, { error: createAccountWithOTPError }] = useMutation(createAccountWithOTP, {
        onCompleted: (data) => {
            if (data.createCustomerAccount) {
                dispatch({
                    type: 'REGISTER_DATA',
                    payload: {
                        registeredData: data.createCustomerAccount
                    }
                });
            }
        }
    })

    const [createAccountWithB2B, { error: createAccountWithB2BError, loading: createAccountWithB2BLoading }] = useMutation(registerWithB2B, {
        fetchPolicy: 'no-cache',
        onCompleted: (data) => {
            setB2BData(data)
            if (handleRedirectToLogin) {
                handleRedirectToLogin();
            }
            if (setB2BRegister) {
                setB2BRegister(false)
            }
        },
    })
    // For create account and sign in mutations, we don't want to cache any
    // personally identifiable information (PII). So we set fetchPolicy to 'no-cache'.
    const [
        createAccount,
        { error: createAccountError, data: createAccountData }
    ] = useMutation(createAccountMutation, {
        fetchPolicy: 'no-cache'
    });
    const [signIn, { error: signInError }] = useMutation(signInMutation, {
        fetchPolicy: 'no-cache'
    });

    const fetchUserDetails = useAwaitQuery(customerQuery);
    const fetchCartDetails = useAwaitQuery(getCartDetailsQuery);

    const handleCancel = useCallback(() => {
        onCancel();
    }, [onCancel]);

    const updateUid = uid => {
        storage.removeItem('compare_uid');
        storage.setItem('compare_uid', uid);
    };
    const handleSubmit = useCallback(
        async (formValues, cpatchaToken, regionInfo, maxdate) => {
            const regionData = regionInfo?.find(i => i?.value === formValues?.region)
            if (regionData?.key) {
                formValues.region = {
                    region_code: regionData?.value,
                    region: regionData?.label,
                    region_id: regionData?.key
                }
            }
            let assistanceAllowedInt = 1;
            if (formValues?.assistance_allowed) {
                assistanceAllowedInt = 2;
            }
            setIsSubmitting(true);



            try {
                // Get source cart id (guest cart id).
                const sourceCartId = cartId;
                if (mobileNumber) {
                    await createAccountOTP({
                        variables: {
                            input: {
                                email: formValues.customer.Email,
                                firstname: formValues.customer.firstname.charAt(0).toUpperCase() + formValues.customer.firstname.slice(1),
                                lastname: formValues.customer.lastname.charAt(0).toUpperCase() + formValues.customer.lastname.slice(1),
                                password: formValues.password === formValues.new_password && formValues.password,
                                date_of_birth: maxdate || formValues?.customer?.bod,
                                // date_of_birth: formValues.customer.bod,
                                terms_conditions: !!terms_conditions,
                                is_subscribed: isChecked
                            },
                            mobileNumber: mobileNumber,
                            otp: otpNumber,
                            websiteId: 1,

                        },
                        context: {
                            headers: {
                                "X-ReCaptcha": cpatchaToken ? cpatchaToken : ""
                            }
                        }
                    })

                } else if (B2BRegister) {
                    await createAccountWithB2B({
                        variables: {
                            // input: {
                            email: formValues.customer.Email?.toString(),
                            firstname: formValues.customer.firstname?.charAt(0)?.toUpperCase() + formValues.customer.firstname?.slice(1),
                            lastname: formValues.customer.lastname?.charAt(0)?.toUpperCase() + formValues.customer.lastname?.slice(1),
                            password: formValues.password === formValues.new_password && formValues.password,
                            mobilenumber: formValues.customer.mobilenumber || mobileNumber,
                            date_of_birth: maxdate || formValues?.customer?.bod,
                            gender: genderCheck,
                            terms_conditions: !!terms_conditions,
                            is_subscribed: true,
                            assistance_allowed: 0,
                            // twitter_link: formValues.customer.twitter_link,
                            // facebook_link: formValues.customer.facebook_link,
                            // instagram_link: formValues.customer.insta_link,
                            gst_number: formValues.customer.gst_number,
                            cin_number: formValues.customer.cin_number,
                            bfirstname: formValues.customer.firstname?.charAt(0)?.toUpperCase() + formValues.customer.firstname?.slice(1),
                            blastname: formValues.customer.lastname?.charAt(0)?.toUpperCase() + formValues.customer.lastname?.slice(1),
                            company: formValues?.customer?.company,
                            city: formValues?.city,
                            street: formValues?.street[0],
                            country_code: formValues?.country,
                            // region: {
                            region_code: formValues?.region?.region_code,
                            region: formValues?.region?.region,
                            region_id: formValues?.region?.region_id,
                            default_billing: true,
                            default_shipping: true,
                            postcode: formValues?.postcode,
                            telephone: formValues?.customer?.mobilenumber || mobileNumber
                            // }
                            /* b2b_registration_address: {
                                firstname: formValues.customer.firstname?.charAt(0)?.toUpperCase() + formValues.customer.firstname?.slice(1),
                                lastname: formValues.customer.lastname?.charAt(0)?.toUpperCase() + formValues.customer.lastname?.slice(1),
                                company: formValues?.customer?.company,
                                city: formValues?.city,
                                street: formValues?.street[0],
                                country_code: formValues?.country,
                                region: {
                                    region_code: formValues?.region?.region_code,
                                    region: formValues?.region?.region,
                                    region_id: formValues?.region?.region_id
                                }
                            } */
                            // }

                        },
                        context: {
                            headers: {
                                "X-ReCaptcha": cpatchaToken ? cpatchaToken : ""
                            }
                        }
                    })
                }
                const createAccountResponse = !mobileNumber && !B2BRegister && await createAccount({
                    variables: {
                        email: formValues.customer.Email,
                        firstname: formValues.customer.firstname?.charAt(0)?.toUpperCase() + formValues.customer.firstname?.slice(1),
                        lastname: formValues.customer.lastname?.charAt(0)?.toUpperCase() + formValues.customer.lastname?.slice(1),
                        password: formValues.password === formValues.new_password && formValues.password,
                        mobilenumber: formValues.customer.mobilenumber || mobileNumber,
                        date_of_birth: maxdate || formValues?.customer?.bod,
                        gender: genderCheck,
                        terms_conditions: !!terms_conditions,
                        is_subscribed: isChecked,
                        assistance_allowed: assistanceAllowedInt
                    },
                    context: {
                        headers: {
                            "X-ReCaptcha": cpatchaToken ? cpatchaToken : ""
                        }
                    }
                });
                // Create the account and then sign in.
                if (formRef && formRef.current) {
                    setGenderCheck(1);
                    formRef.current.reset();
                    // if (handleRedirectToLogin) {
                    //     console.log("true")
                    //     handleRedirectToLogin();
                    // }
                    // if (setB2BRegister ) {
                    //     console.log("b2b true")
                    //     setB2BRegister(false)
                    // }
                    redirectToSign();
                    dispatch({ type: "MOBILE_NUMBER", payload: { mobilenumber: "" } })
                }
                if (createAccountResponse || B2BData) {
                    dispatch({
                        type: 'REGISTER_DATA',
                        payload: {
                            registeredData: createAccountResponse.data ||
                                B2BData?.bssB2bCustomerRegistration
                        }
                    });
                }
                const signInResponse = createAccountResponse?.data?.createCustomer?.confirmation_required == false ||
                    B2BData?.bssB2bCustomerRegistration?.status == false
                    ? await signIn({
                        variables: {
                            email: formValues.customer.email,
                            password: formValues.password
                        }
                    })
                    : null;

                const token = signInResponse?.data?.generateCustomerToken?.token;
                if (token) {
                    await setToken(token);
                }

                // Clear all cart/customer data from cache and redux.
                await clearCartDataFromCache(apolloClient);
                await clearCustomerDataFromCache(apolloClient);
                await removeCart();
                if (NotificationToken) {
                    saveToken({ tokenId: NotificationToken });
                }

                // Create and get the customer's cart id.
                await createCart({
                    fetchCartId
                });
                const destinationCartId = await retrieveCartId();

                // Merge the guest cart into the customer cart.
                await mergeCarts({
                    variables: {
                        destinationCartId,
                        sourceCartId
                    }
                });

                const comData = await assignToCustomer({
                    variables: {
                        uid: uid
                    },
                    skip: uid != '' ? false : true
                });
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

                // Ensure old stores are updated with any new data.
                await getUserDetails({ fetchUserDetails });
                await getCartDetails({
                    fetchCartId,
                    fetchCartDetails
                });

                // Finally, invoke the post-submission callback.
                if (onSubmit) {
                    onSubmit();
                }
            } catch (error) {
                if (process.env.NODE_ENV !== 'production') {
                    console.error(error);
                }
                setIsSubmitting(false);
            }
        },
        [
            cartId,
            createAccount,
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
            onSubmit,
            saveToken,
            genderCheck,
            formRef,
            setGenderCheck,
            isChecked,
            redirectToSign,
            mobileNumber,
            dispatch,
            B2BRegister,
            B2BData,
            otpNumber,
            createAccountOTP,
            handleRedirectToLogin,
            setB2BRegister,
            createAccountWithB2B
        ]
    );

    const sanitizedInitialValues = useMemo(() => {
        const {
            email,
            firstName,
            lastName,
            mobile_number,
            terms_conditions,
            date_of_birth,
            gender,
            ...rest
        } = initialValues;
        return {
            customer: {
                email,
                firstname: firstName,
                lastname: lastName,
                mobilenumber: mobile_number || mobileNumber,
                terms_conditions: terms_conditions,
                dob: date_of_birth,
                gender: gender
            },
            ...rest
        };
    }, [initialValues, mobileNumber]);

    const errors = useMemo(
        () =>
            new Map([
                ['createAccountQuery', createAccountError],
                ['signInMutation', signInError],
                ['createAccountB2B', createAccountWithB2BError],
                ['createAccountOTP', createAccountWithOTPError],
            ]),
        [createAccountError, signInError, createAccountWithB2BError, createAccountWithOTPError]
    );

    return {
        errors,
        handleCancel,
        handleSubmit,
        initialValues: sanitizedInitialValues,
        isDisabled: isSubmitting || isGettingDetails || createAccountWithB2BLoading,
        isSignedIn,
        confirmation_required:
            createAccountData &&
            createAccountData.createCustomer.confirmation_required ||
            B2BData?.bssB2bCustomerRegistration?.status
        ,
        createAccountData,
    };
};

/** JSDocs type definitions */

/**
 * GraphQL queries for the create account form.
 * This is a type used by the {@link useCreateAccount} talon.
 *
 * @typedef {Object} CreateAccountQueries
 *
 * @property {GraphQLAST} customerQuery query to fetch customer details
 * @property {GraphQLAST} getCartDetailsQuery query to get cart details
 */

/**
 * GraphQL mutations for the create account form.
 * This is a type used by the {@link useCreateAccount} talon.
 *
 * @typedef {Object} CreateAccountMutations
 *
 * @property {GraphQLAST} createAccountMutation mutation for creating new account
 * @property {GraphQLAST} createCartMutation mutation for creating new cart
 * @property {GraphQLAST} mergeCartsMutation mutation for merging carts
 * @property {GraphQLAST} signInMutation mutation for signing
 */

/**
 * Initial values for the create account form.
 * This is a type used by the {@link useCreateAccount} talon.
 *
 * @typedef {Object} InitialValues
 *
 * @property {String} email email id of the user
 * @property {String} firstName first name of the user
 * @property {String} lastName last name of the user
 * @property {String} mobile_number mobile number of the user
 * @property {Boolean} terms_conditions terms & conditions of the user
 * @property {String} dob dob of the user
 * @property {Int} gender gender of the user
 */

/**
 * Sanitized initial values for the create account form.
 * This is a type used by the {@link useCreateAccount} talon.
 *
 * @typedef {Object} SanitizedInitialValues
 *
 * @property {String} email email id of the user
 * @property {String} firstname first name of the user
 * @property {String} lastname last name of the user
 * @property {String} mobile_number mobile number of the user
 * @property {Boolean} terms_conditions terms & conditions of the user
 * @property {String} dob dob of the user
 * @property {Int} gender gender of the user
 */

/**
 * Object type returned by the {@link useCreateAccount} talon.
 * It provides props data to use when rendering the create account form component.
 *
 * @typedef {Object} CreateAccountProps
 *
 * @property {Map} errors a map of errors to their respective mutations
 * @property {Function} handleCancel callback function to handle form cancellations
 * @property {Function} handleSubmit callback function to handle form submission
 * @property {SanitizedInitialValues} initialValues initial values for the create account form
 * @property {Boolean} isDisabled true if either details are being fetched or form is being submitted. False otherwise.
 * @property {Boolean} isSignedIn true if user is signed in. False otherwise.
 */
