import React from 'react';
import { Modal } from '../Modal';
import { mergeClasses } from '../../classify';
import defaultClasses from './designToolIFrame.css';
import { X as ClearIcon } from 'react-feather';
import Icon from '@magento/venia-ui/lib/components/Icon';
import { Util } from '@magento/peregrine';
import { useScopeData } from 'src/peregrine/lib/talons/Home/useHome';
import SCOPE_CONFIG_DATA from '../../queries/getScopeConfigData.graphql';
import { useSlider } from '../../peregrine/lib/talons/Slider/useSlider';
import GET_SLIDER_DATA from '../../queries/getSliderDetails.graphql';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { useHistory } from 'react-router-dom';
import { useApolloClient, useMutation, useLazyQuery, useQuery } from '@apollo/client';
import { clearCartDataFromCache } from '@magento/peregrine/lib/Apollo/clearCartDataFromCache';
import { clearCustomerDataFromCache } from '@magento/peregrine/lib/Apollo/clearCustomerDataFromCache';
import { useCartContext } from '@magento/peregrine/lib/context/cart';
import { useSaveToken } from '../../peregrine/lib/talons/PushNotification/usePushNotification';
import SAVE_TOKEN from '../../queries/saveToken.graphql';
import CREATE_CART_MUTATION from '../../queries/createCart.graphql';
import { mergeCartsMutation } from '../../queries/mergeCarts.gql';
import { retrieveCartId } from '@magento/peregrine/lib/store/actions/cart';
import { useAwaitQuery } from '@magento/peregrine/lib/hooks/useAwaitQuery';
import { GET_CART_DETAILS_QUERY } from '../SignIn/signIn.gql';
import GET_CUSTOMER_QUERY from '../../queries/getCustomer.graphql';
import AssignToCustomerMutation from '../../queries/assignCompareListToCustomer.graphql';
import { useAccountMenu } from '../../peregrine/lib/talons/Header/useAccountMenu';
import SIGN_OUT_MUTATION from '../../queries/signOut.graphql';
// import { MINI_CART_QUERY_TEST } from '../MiniCart/miniCart.gql';
import CART_DETAILS from '../../queries/getCartDetails.graphql'

const clearIcon = <Icon src={ClearIcon} size={30} />;

const DesignToolIframe = props => {
    const history = useHistory();
    const apolloClient = useApolloClient();

    const { src = '', setShown = () => { } } = props;

    const classes = mergeClasses(defaultClasses);

    const [, { getUserDetails, setToken }] = useUserContext();

    const [{ cartId }, { createCart, removeCart, getCartDetails }] = useCartContext();

    const { BrowserPersistence } = Util;
    const storage = new BrowserPersistence();
    const scopeConfigData = useScopeData({
        query: SCOPE_CONFIG_DATA
    });

    const sliderData = useSlider({
        query: GET_SLIDER_DATA
    });

    const { saveToken } = useSaveToken({
        query: SAVE_TOKEN
    });

    const { handleSignOut } = useAccountMenu({
        mutations: { signOut: SIGN_OUT_MUTATION },
        accountMenuIsOpen: false,
        setAccountMenuIsOpen: () => { }
    });

    const [fetchCartId] = useMutation(CREATE_CART_MUTATION);
    const [mergeCarts] = useMutation(mergeCartsMutation);
    const [assignToCustomer] = useMutation(AssignToCustomerMutation);
    const fetchUserDetails = useAwaitQuery(GET_CUSTOMER_QUERY);
    const fetchCartDetails = useAwaitQuery(GET_CART_DETAILS_QUERY);
    // const [cartDetails, { data: emptyCartMessage }] = useQuery(
    //     CART_DETAILS,
    //     {
    //         // refetchQueries: [
    //         //     { query: GET_CART_DETAILS,  variables: { cartId:miniCartData &&  miniCartData.cart && miniCartData.cart.id }  }
    //         //   ],
    //         onCompleted: data => {
    //             console.log('data------', data)
    //         }
    //     }
    // );
    // const [fetchMiniCartDetails] = useLazyQuery(MINI_CART_QUERY_TEST, {
    //     fetchPolicy: 'network-only'
    // });
    const updateUid = uid => {
        storage.removeItem('compare_uid');
        storage.setItem('compare_uid', uid);
    };

    const { scopeData } = scopeConfigData;

    storage.setItem('slider_data', sliderData);

    if (!storage.getItem('scope_data') && scopeData) {
        storage.setItem('scope_data', scopeData);
    }
    const handleCloseDesignTool = async () => {
        try {
            setShown(false);
            const resultToken = localStorage.getItem('token');
            const resultCustomerId = localStorage.getItem('customer_id');
            const resultCartId = localStorage.getItem('cart_id');

            if (resultCustomerId && resultCustomerId !== 'null') {
                // Get source cart id (guest cart id).
                // const sourceCartId = resultCartId;
                var uid = storage.getItem('compare_uid')
                    ? storage.getItem('compare_uid')
                    : '';

                // Sign in and set the token.
                // const signInResponse = await signIn({
                //     variables: { email, password }
                // });
                // const token = signInResponse.data.generateCustomerToken.token;
                await setToken(resultToken);
                // if (token) {
                history.push('/');
                // }

                // Clear all cart/customer data from cache and redux.
                await clearCartDataFromCache(apolloClient);
                await clearCustomerDataFromCache(apolloClient);
                // await removeCart();
                const NotificationToken = localStorage.getItem(
                    'notification-token'
                );
                if (NotificationToken) {
                    saveToken({ tokenId: NotificationToken });
                }
                // Create and get the customer's cart id.
                // await createCart({
                //     fetchCartId
                // });
                // const destinationCartId = await retrieveCartId();
                await getUserDetails({ fetchUserDetails });
                // Merge the guest cart into the customer cart.
                // if(destinationCartId !== sourceCartId){
                //     await mergeCarts({
                //         variables: {
                //             destinationCartId,
                //             sourceCartId
                //         }
                //     });
                // }
                let comData = false;
                if (uid != '') {
                    comData = await assignToCustomer({
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
                // Ensure old stores are updated with any new data.
                // await getUserDetails({ fetchUserDetails });
                // await getCartDetails({fetchCartId, fetchCartDetails });
                // await cartDetails({ variables: { cartId: resultCartId } })
            } else if (resultCustomerId === 'null') {
                handleSignOut();
            } else {
                storage.setItem('cartId', resultCartId)
                await getCartDetails({ resultCartId, fetchCartDetails });
            }
        } catch (error) {
            setShown(false);
        }
    };

    return (
        <Modal>
            <div className={classes.customiframe}>
                <div className={classes.designer_tool_wrapper}>
                    <iframe
                        title={src}
                        allowFullScreen
                        frameBorder="0"
                        src={src}
                        width="100%"
                        height="98%"
                        id="iFrameWrapper"
                    />
                    <div>
                        <div className={classes.designer_tool_close}>
                            <span
                                role="button"
                                onClick={handleCloseDesignTool}
                                tabIndex={0}
                                className={classes.close}
                            >
                                {clearIcon}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default DesignToolIframe;
