import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { object, shape, string } from 'prop-types';
// import { useOrderConfirmationPage } from '@magento/peregrine/lib/talons/CheckoutPage/OrderConfirmationPage/useOrderConfirmationPage';
// import SAVE_MESSAGE from '../../../queries/saveOrderComment.graphql';
import { mergeClasses } from '../../../classify';
import { Title } from '../../../components/Head';
import CreateAccount from './createAccount';
import ItemsReview from '../ItemsReview';
import defaultClasses from './orderConfirmationPage.css';
import { globalContext } from '../../../peregrine/lib/context/global';
import { useParams } from 'react-router-dom';
import ORDER_CONFIRMATION from '../../../queries/orderPlacedDetails.graphql'
import { useApolloClient, useLazyQuery, useMutation } from '@apollo/client';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import authToken from '../../../queries/authToken.graphql';
import { BrowserPersistence } from '@magento/peregrine/lib/util';
// import { setToken } from '@magento/peregrine/lib/store/actions/user/asyncActions';
import { useCartContext } from '@magento/peregrine/lib/context/cart';
import { clearCartDataFromCache } from '@magento/peregrine/lib/Apollo/clearCartDataFromCache';
import createCartMutation from '../../../queries/createCart.graphql';
import { retrieveCartId } from '@magento/peregrine/lib/store/actions/cart';
import LoadingIndicator from '../../LoadingIndicator';

const OrderConfirmationPage = props => {
    const classes = mergeClasses(defaultClasses, props.classes);
    const [messageSaved, setMessageSaved] = useState(false);
    const [authTokenInfo, setAuthTokenInfo] = useState()
    const { /* data, */ orderNumber } = props;
    const id = useParams()
    const { formatMessage } = useIntl();
    var cardMessage = localStorage.getItem('cardMessage');
    const [orderDetailsData, setOrderDetailsData] = useState()
    const [{ isSignedIn }] = useUserContext();
    const [, { createCart, removeCart }] = useCartContext();
    const storage = new BrowserPersistence();
    const apolloClient = useApolloClient();
    const [fetchCartId] = useMutation(createCartMutation);

    const [authTokenData] = useLazyQuery(authToken, {
        fetchPolicy: "no-cache",
        onCompleted: async (data) => {
            localStorage.setItem('token', data?.getAuthToken)
            storage.setItem("signin_token", data?.getAuthToken, 3600)
            await removeCart();
            await clearCartDataFromCache(apolloClient);

            await createCart({
                fetchCartId
            });
            const newCartId = await retrieveCartId();
            localStorage.setItem('cart_id', newCartId);
            setAuthTokenInfo(data)
        }
    })

    // const talonProps = useOrderConfirmationPage({
    //     data,
    //     query: SAVE_MESSAGE
    // });

    // const { SaveMessage } = talonProps;

    useEffect(() => {
        if (authTokenInfo?.getAuthToken && !isSignedIn) {
            window.location.reload()
        }
    }, [authTokenInfo, isSignedIn])

    const [orderPlacedDetails, { data: orderDetails }] = useLazyQuery(
        ORDER_CONFIRMATION,
        {
            fetchPolicy: 'no-cache',
            // variables: {
            //     increment_id:'1223'
            // },
            onCompleted: (data) => {
                window.dataLayer.push({
                    event: 'place_order',
                    data: {
                        order_number: data?.orderPlacedDetails?.increment_id || '',
                        payment_mode: data?.orderPlacedDetails?.payment || '',
                        shipping_method: data?.orderPlacedDetails?.shipping_method || '',
                        cartItems: data?.orderPlacedDetails?.items?.length ? data?.orderPlacedDetails?.items : [],    
                    }
                });
                if (data.orderPlacedDetails) {
                    setOrderDetailsData(data.orderPlacedDetails)
                }
                if (data?.orderPlacedDetails?.payment === "Stripe") {
                    authTokenData()
                }
            }
        }
    );

    useEffect(() => {
        if (props?.orderNumber) {
            orderPlacedDetails({ variables: { increment_id: props.orderNumber } });
        }
        if (id?.id) {
            orderPlacedDetails({ variables: { increment_id: id?.id } });
        }
    }, [props?.orderNumber || id])

    if (
        orderNumber &&
        cardMessage &&
        cardMessage != 'null' &&
        cardMessage != ' ' &&
        !messageSaved
    ) {
        SaveMessage({ orderNumber: orderNumber, cardMessage: cardMessage });
        setMessageSaved(true);
    }

    const { state, dispatch } = React.useContext(globalContext);

    React.useEffect(() => {
        if (props.orderNumber) {
            dispatch({
                type: 'ORDER_NUMBER',
                payload: { orderNumberInfo: props.orderNumber }
            });
        }
    }, [props.orderNumber]);

    const streetRows = <div dangerouslySetInnerHTML={{ __html: orderDetailsData?.shipping_address }}></div>
    useEffect(() => {
        window.scrollTo({
            left: 0,
            top: 0,
            behavior: 'smooth'
        });
    }, []);
    const firstName = orderDetailsData?.customer_firstname
        ? orderDetailsData?.customer_firstname
        : orderDetailsData?.customer_firstname
    const lastName = orderDetailsData?.customer_lastname ? orderDetailsData?.customer_lastname : orderDetailsData?.customer_lastname
    const Email = orderDetailsData?.customer_email ? orderDetailsData?.customer_email : orderDetailsData?.customer_email
    const createAccountForm = !isSignedIn ? (
        <CreateAccount
            firstname={firstName}
            lastname={lastName}
            email={Email}
        />
    ) : null;

    // const nameString = `${firstname} ${lastname}`;
    // const nameString = orderDetailsData?.customer_name ? orderDetailsData?.customer_name : orderDetailsData?.customer_name
    // const additionalAddressString = `${city}, ${region} ${postcode} ${country}`;

    return (
        <>
            {(orderDetailsData || authTokenInfo) ? <div
                className='container pt-4 pb-4'
            >
                <Title>
                    {formatMessage(
                        {
                            id: 'checkoutPage.titleReceipt',
                            defaultMessage: 'Receipt'
                        },
                        // { name: STORE_NAME }
                    )}
                </Title>
                <div className='row'>
                    <div className='col-md-8'>
                        <div className={classes.mainContainer}>
                            <h3 className={classes.heading}>
                                <FormattedMessage
                                    id={'checkoutPage.thankYou'}
                                    defaultMessage={'Thank you for your order!'}
                                />
                            </h3>
                            <div className={classes.additionalText}>
                                <FormattedMessage
                                    id={'checkoutPage.additionalText'}
                                    defaultMessage={
                                        'You will also receive an email with the details and we will let you know when your order has shipped.'
                                    }
                                />
                            </div>
                            <div className={classes.orderNumber}>
                                <strong>
                                    <span>Order Number: </span>
                                </strong>
                                #{props?.orderNumber}

                            </div>
                            <div className={defaultClasses.order_confirm_page}>
                                <div className={defaultClasses.order_confirm} >
                                    <div className={classes.shippingInfoHeading}>
                                        <strong>
                                            <FormattedMessage
                                                id={'global.ahippingAddress'}
                                                defaultMessage={'Shipping Address'}
                                            />
                                        </strong>
                                    </div>
                                    <div dangerouslySetInnerHTML={{ __html: orderDetails?.shipping_address }} />
                                    <div style={{ maxWidth: '400px' }} className={classes.shippingInfo}>
                                        <strong> <span className={classes.email}>{
                                        }</span></strong>
                                        <strong>
                                            {/* <span className={classes.name}>{nameString}</span> */}
                                        </strong>
                                        <div className={defaultClasses.confirm_details}>
                                            {streetRows}
                                        </div>
                                        <span className={classes.addressAdditional}>
                                            {/* {additionalAddressString} */}
                                        </span>
                                    </div>
                                </div>
                                <div className={classes.shippingMethodHeading}>
                                    <strong>
                                        <FormattedMessage
                                            id={'global.shippingMethod'}
                                            defaultMessage={'Shipping Method'}
                                        />
                                    </strong>
                                    <div className={classes.shippingMethod}>
                                        {/* {shippingMethod} */}
                                        {orderDetails?.orderPlacedDetails?.shipping_method}
                                    </div>
                                </div>
                            </div>

                            <div className={classes.itemsReview}>
                                <ItemsReview data={orderDetails?.orderPlacedDetails?.items} isDisplayOnlyMode={true} />
                            </div>

                        </div>
                    </div>
                    <div className='col-md-4'>
                        <div className={classes.sidebarContainer}>
                            {createAccountForm}
                        </div>
                    </div>
                </div>
            </div> :
                <LoadingIndicator />
            }
        </>
    );
};

export default OrderConfirmationPage;

OrderConfirmationPage.propTypes = {
    classes: shape({
        addressStreet: string,
        mainContainer: string,
        heading: string,
        orderNumber: string,
        shippingInfoHeading: string,
        shippingInfo: string,
        email: string,
        name: string,
        addressAdditional: string,
        shippingMethodHeading: string,
        shippingMethod: string,
        itemsReview: string,
        additionalText: string,
        sidebarContainer: string
    }),
    data: object.isRequired,
    orderNumber: string
};
