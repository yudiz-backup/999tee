import React, { useState, Suspense, useEffect, useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Icon from '../Icon';
import defaultClasses from './checkoutPage.css';
import AddressBookOperations from './AddressBook/addressBook.gql';
import { useAddressBook } from 'src/peregrine/lib/talons/CheckoutPage/AddressBook/useAddressBook';
import { Edit2 as EditIcon } from 'react-feather';
import PriceSummary from '../CartPage/PriceSummary/priceSummary';
import PaymentInformation from '../CheckoutPage/PaymentInformation/paymentInformation';
import {
    CHECKOUT_STEP,
    useCheckoutPage
} from 'src/peregrine/lib/talons/CheckoutPage/useCheckoutPage';
import CheckoutPageOperations from './checkoutPage.gql.js';
import { useShippingMethod } from 'src/peregrine/lib/talons/CheckoutPage/useShippingMethod';
import shippingMethodOperations from './ShippingMethod/shippingMethod.gql';
import ShippingRadios from './ShippingMethod/shippingRadios';
import CouponCode from '../CartPage/PriceAdjustments/CouponCode';
import PriceAdjustments from './PriceAdjustments';
import ItemsReview from './ItemsReview';
import Button from '../Button';
import Checkbox from '../Checkbox';
import { Form } from 'informed';
// import OrderConfirmationPage from './OrderConfirmationPage';
import { useHistory } from 'react-router-dom';
import { useAddressCard } from '@magento/peregrine/lib/talons/CheckoutPage/AddressBook/useAddressCard';
import GuestForm from './ShippingInformation/AddressForm/guestForm';
import LinkButton from '../LinkButton';
import LoadingIndicator from '../LoadingIndicator';
import { useAccountTrigger } from '@magento/peregrine/lib/talons/Header/useAccountTrigger';
import RewardPoints from '../CartPage/rewardPoints';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { useMutation, useQuery } from '@apollo/client';
import getRewardPrice from '../../queries/rewardPoint/rewardPointPrice.graphql';
import rewardPointCalculation from '../../queries/rewardPoint/rewardPointCalculation.graphql';
import { globalContext } from '../../peregrine/lib/context/global';
import CustomerForm from './ShippingInformation/AddressForm/customerForm';
import { Accordion, Section } from '../Accordion';
import ShowAllButton from './ItemsReview/showAllButton';
import getRewardPointConfig from '../../queries/rewardPoint/rewardPointConfig.graphql';
import creditBalanceInfo from '../../queries/creditAmount/creditBalanceInfo.graphql'
import applyStoreCredit from '../../queries/creditAmount/applyStoreCredit.graphql'
import removeStoreCredit from '../../queries/creditAmount/removeStoreCredit.graphql'
import giftWrapperStatus from '../../queries/giftWarp/giftWrapperStatus.graphql';
import { useCartPage } from '../../peregrine/lib/talons/CartPage/useCartPage';
import { GET_CART_DETAILS } from '../CartPage/cartPage.gql';
import GiftModal from '../ProductFullDetail/GiftModal';
import Cartclasses from '../CartPage/cartPage.css';
// import productClasses from '../CartPage/ProductListing/product.css'
// import NEWSLETTER_MUTATION from '../../queries/subscribeNewsLetter.graphql';
import { Price, useToasts } from '@magento/peregrine';
import Field, { Message } from '../Field';
// import TextInput from '../TextInput';
import Textcss from '../../components/TextInput/textInput.css'
import { checkOnlyDecimalNumberAllow } from '../../util/formValidators';
import { isMobileView } from '../../util/helperFunction';
import { useFooterData, useHome } from '../../peregrine/lib/talons/Home/useHome';
import GET_HOMEPAGECONFIG_DATA from '../../queries/getHomeConfig.graphql';
import GET_CMSBLOCK_QUERY from '../../queries/getCmsBlocks.graphql';
// import { isEmpty } from 'lodash';
// import StripeCheckoutPage from './stripeCheckoutPage';


const EditModal = React.lazy(() =>
    import('../CheckoutPage/ShippingInformation/editModal')
);
// const AccountMenu = React.lazy(() => import('../AccountMenu'));

const CheckoutPage = () => {
    const [{ isSignedIn }] = useUserContext();
    const isMountedCartPage = useRef(false)
    // const formRef = useRef(null);
    const [, { addToast }] = useToasts();
    const [/* emailNewsLetter, */, setemailNewsLetter] = useState('')
    const [subscribenewsLetter, setSubscribeNewsLetter] = useState(false)
    const [storeCreditValue, setStoreCreditValue] = useState('');
    const [isEmail, setIsEmail] = useState(false)
    const [totalqty, setTotalQty] = useState()
    const { data } = useQuery(getRewardPointConfig, {
        fetchPolicy: 'no-cache',
        enabled: isSignedIn
    });

    const { data: rewardPrice } = useQuery(getRewardPrice);
    const { data: creditBalance } = useQuery(creditBalanceInfo, {
        fetchPolicy: 'no-cache',
        enabled: isSignedIn
    })
    const { formatMessage } = useIntl();
    const [value, setRangeValue] = useState(
        sessionStorage.getItem('rangeValue') || 0
    );
    const [allCartGiftWrapper, setAllCartGiftWrapper] = useState(
        JSON.parse(localStorage.getItem('allCartGiftWrapper')) || ''
    );
    const [openModal, setOpenModel] = useState(false);
    const [calculation, setCalculation] = useState('');
    const [giftWrapperData, setGiftWrapperData] = useState(
        JSON.parse(localStorage.getItem('giftWrapper')) || []
    );
    const [selectedItem, setSelectedItem] = useState();
    const [priceSummaryGiftWrapper, setPriceSummaryGiftWrapper] = useState(
        false
    );
    const [modal, setModal] = useState(false)
    const [stripePaymentConfirmation, setStripePaymentConfirmation] = useState(false)
    const [addStripePaymentLoading, setAddStripePaymentLoading] = useState(false)
    const [setStripePaymentLoading, setSetStripePaymentLoading] = useState(false)
    const [emptyCardElement, setEmptyCardElement] = useState()
    const history = useHistory();
    const propsData = history.location.state;
    const talonPropsAccountTrigger = useAccountTrigger();
    const {
        // accountMenuIsOpen,
        // accountMenuRef,
        // setAccountMenuIsOpen,
        handleTriggerClick
    } = talonPropsAccountTrigger;

    const [selectedAddress, setSelectedAddress] = useState();
    const [couponCode, setCouponCode] = useState('');
    const [
        isCheckedTermsAndConditions,
        setIsCheckedTermsAndConditions
    ] = useState(false);
    const [isShowAllAddressSection, setIsShowAllAddressSection] = useState(
        false
    );
    const [
        paymentMethodMutationLoading,
        setPaymentMethodMutationLoading
    ] = useState(false);
    const [isPriceSummaryLoading, setIsPriceSummaryLoading] = useState(false);
    const [isDeleteItemLoading, setIsDeleteItemLoading] = useState(false);
    const [updatedShippingAddressId, setUpdatedShippingAddressId] = useState();
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [selectedShippingMethodState, setSelectedShippingMethodState] = useState('');
    const [storeCreditApplybtn, setStoreCreditApplyBtn] = useState(false)

    const rewardPointData = data && data.customer && data.customer.mp_reward;
    const point_balance = rewardPointData && rewardPointData.point_balance;

    const pointValues =
        rewardPrice &&
        rewardPrice.MpRewardConfig &&
        rewardPrice.MpRewardConfig.spending &&
        rewardPrice.MpRewardConfig.spending.maximum_point_per_order;

    const { state, dispatch } = React.useContext(globalContext);
    const { isSignInFromCheckoutPage } = state || {};

    useEffect(() => {
        if (state?.store_credit?.amount) {
            setStoreCreditApplyBtn(true)
        }
    }, [state?.store_credit?.amount])

    const talonPropsCheckoutPage = useCheckoutPage({
        ...CheckoutPageOperations,
        selectedPaymentMethod,
        setAddStripePaymentLoading,
        setSetStripePaymentLoading
    });

    const {
        isUpdating,
        setIsUpdating,
        handlePlaceOrder,
        placeOrderLoading,
        orderDetailsLoading,
        error,
        resetReviewOrderButtonClicked,
        setCheckoutStep,
        reviewOrderButtonClicked,
        checkoutStep,
        handleReviewOrder,
        orderNumber,
        isGuestCheckout,
        cartId,
        onlinePaymentLoading,
        confirmationLoading,
        razorpayOrderLoading,
        paymentDetailForOrderLoading
    } = talonPropsCheckoutPage;

    React.useEffect(() => {
        if (calculation) {
            dispatch({
                type: 'UPDATE_PRICE_SUMMARY_DATA',
                payload: { priceSummaryData: calculation }
            });
        }
    }, [calculation]);

    const talonProps = useAddressBook({
        ...AddressBookOperations,
        toggleActiveContent: () => { },
        setCheckoutStep
    });

    function onChange(rangeValue) {
        setRangeValue(rangeValue);
    }

    const [rewardCalculation, { loading: rewardPointCalculationLoading }] = useMutation(rewardPointCalculation, {
        onCompleted: data => {
            const priceDetail = data.MpRewardSpendingPoint.reduce(
                (acc, item) => {
                    return {
                        ...acc,
                        [item.code]: item.value
                    };
                },
                {}
            );
            setCalculation(priceDetail);
            if (
                priceDetail &&
                (priceDetail.grand_total || priceDetail.subtotal)
            ) {
                console.log({ priceDetail })
                dispatch({
                    type: 'PRICE_SUMMARY_DETAIL',
                    priceSummaryDetail: {
                        grandTotal: priceDetail.grand_total
                            ? Math.floor(priceDetail.grand_total)
                            : undefined,
                        subTotal: priceDetail.subtotal
                            ? priceDetail.subtotal
                            : undefined
                    }
                });
            }
        }
    });

    const {
        customerAddresses = [],
        activeAddress,
        handleAddAddress,
        handleEditAddress,
        handleSelectAddress,
        handleApplyAddress,
        isLoading: addressBookLoading
    } = talonProps;

    const { data: wrapperStatus } = useQuery(giftWrapperStatus);

    const wrapperStatusPerItem =
        wrapperStatus &&
        wrapperStatus.mpGiftWrapConfigSetting &&
        wrapperStatus.mpGiftWrapConfigSetting.gift_wrap_type;

    const talonPropsPriceSummery = useCartPage({
        queries: {
            getCartDetails: GET_CART_DETAILS
        },
        storeCreditApplybtn
    });

    const {
        cartDetails,
        hasItems,
        loading: cartDetailsLoading,
        updateCartDetails,
        refetch
    } = talonPropsPriceSummery;

    const homepageData = useHome({
        query: GET_HOMEPAGECONFIG_DATA
    });

    const { HomeConfigData } = homepageData;
    let razorPayBanner = 'razorpay-section';
    if (typeof HomeConfigData != 'undefined') {
        for (var i = 0; i < HomeConfigData.length; i++) {
            if (HomeConfigData[i]['name'] == 'razorpay-section')
                razorPayBanner = HomeConfigData[i]['value'];
        }
    }

    const razorPayBannerData = useFooterData({
        footerQuery: GET_CMSBLOCK_QUERY,
        footerIdentifiers: razorPayBanner
    });

    const { footerData: razorPayBannerInfo } = razorPayBannerData;

    const [applyCreditAmount] = useMutation(applyStoreCredit, {
        fetchPolicy: 'no-cache',
        onCompleted: () => {
            updateCartDetails()
            refetch()
            // if (data) {
            //     dispatch({ type: "STORE_CREDIT", payload: { amount: storeCreditValue } })
            // }
        }
    })

    const [removeCreditAmount] = useMutation(removeStoreCredit, {
        onCompleted: () => {
            updateCartDetails()
            setStoreCreditApplyBtn(false)
            refetch()
            dispatch({ type: "STORE_CREDIT", payload: { amount: '' } })
            setStoreCreditValue("")
        }
    })

    const { id: cartDetailsId, shipping_addresses = [], items: cartItems = [] } = cartDetails || {};

    useEffect(() => {
        if (cartDetails?.prices?.mp_reward_segments?.length > 1) {
            sessionStorage.setItem('rangeValue', cartDetails?.prices?.mp_reward_segments.find(i => i.code === 'mp_reward_spent').value)
            // isMountedCartPage.current=true
            setRangeValue(cartDetails?.prices?.mp_reward_segments.find(i => i.code === 'mp_reward_spent').value)
            const priceDetail = cartDetails?.prices?.mp_reward_segments?.reduce((acc, item) => {
                return {
                    ...acc,
                    [item.code]: item.value
                }
            }, {})
            setCalculation(priceDetail)
            setCalculation({
                ...calculation,
                "subtotal": cartDetails?.prices?.subtotal_excluding_tax?.value,
                "mp_reward_discount": priceDetail.mp_reward_discount,
                "mp_reward_spent": priceDetail.mp_reward_spent,
                "mp_reward_earn": priceDetail.mp_reward_earn
            })
        }
        else {
            const priceDetail = cartDetails?.prices?.mp_reward_segments?.reduce((acc, item) => {
                return {
                    ...acc,
                    [item.code]: item.value
                }
            }, {})
            setCalculation({
                "subtotal": cartDetails?.prices?.subtotal_excluding_tax?.value,
                "mp_reward_earn": priceDetail?.mp_reward_earn
            })
        }
    }, [cartDetails, rewardPointData])

    const showToastMessageWhenStepBackInCheckoutProcess = () => {
        addToast({
            type: 'info',
            message: 'Please update your shipping method',
            dismissable: true,
            timeout: 10000
        });
    }

    useEffect(() => {
        if (shipping_addresses && shipping_addresses.length && shipping_addresses[0].selected_shipping_method && shipping_addresses[0].selected_shipping_method.carrier_code && shipping_addresses[0].selected_shipping_method.method_code) {
            if (shipping_addresses[0].available_shipping_methods && shipping_addresses[0].available_shipping_methods.length) {
                const isExistShippingMethod = shipping_addresses[0].available_shipping_methods.some(item => item.carrier_code && item.method_code && item.carrier_code === shipping_addresses[0].selected_shipping_method.carrier_code && item.method_code === shipping_addresses[0].selected_shipping_method.method_code)
                if (!isExistShippingMethod && checkoutStep > CHECKOUT_STEP.PAYMENT) {
                    console.log("1")
                    showToastMessageWhenStepBackInCheckoutProcess()
                    setCheckoutStep(CHECKOUT_STEP.PAYMENT)
                }
            } else {
                console.log("2")
                showToastMessageWhenStepBackInCheckoutProcess()
                setCheckoutStep(CHECKOUT_STEP.SHIPPING_ADDRESS)
            }
        } else {
            if (shipping_addresses && shipping_addresses.length && shipping_addresses[0].available_shipping_methods && shipping_addresses[0].available_shipping_methods.length && checkoutStep > CHECKOUT_STEP.PAYMENT) {
                console.log("3")
                showToastMessageWhenStepBackInCheckoutProcess()
                setCheckoutStep(CHECKOUT_STEP.PAYMENT)
            }
        }
    }, [shipping_addresses])

    useEffect(() => {
        if (cartDetails) {
            dispatch({
                type: 'PRICE_SUMMARY_DETAIL',
                priceSummaryDetail: {
                    grandTotal: cartDetails?.prices?.grand_total ? Math.floor(cartDetails?.prices?.grand_total?.value) : undefined,
                    subTotal: cartDetails?.prices?.subtotal_excluding_tax ? cartDetails?.prices?.subtotal_excluding_tax?.value : undefined,
                }
            });
            if (cartDetails?.storecredit_applied?.base_bss_storecredit_amount) {
                dispatch({ type: "STORE_CREDIT", payload: { amount: cartDetails?.storecredit_applied?.base_bss_storecredit_amount } })
                setStoreCreditValue(cartDetails?.storecredit_applied?.base_bss_storecredit_amount)

            }
        }
    }, [cartDetails])

    useEffect(() => {
        if (!hasItems && cartDetails?.items?.length === 0) {
            if (
                JSON.parse(localStorage.getItem('giftWrapper')) &&
                JSON.parse(localStorage.getItem('giftWrapper')).length
            ) {
                localStorage.removeItem('giftWrapper');
            }

            const allCartGiftWrapper = JSON.parse(
                localStorage.getItem('allCartGiftWrapper')
            );

            if (
                allCartGiftWrapper &&
                allCartGiftWrapper.mpGiftWrapWrapperSetAll &&
                allCartGiftWrapper.mpGiftWrapWrapperSetAll.length
            ) {
                localStorage.removeItem('allCartGiftWrapper');
            }
        }
    }, [hasItems]);

    const talonPropsShippingMethod = useShippingMethod({
        setPageIsUpdating: setIsUpdating,
        setCheckoutStep,
        checkoutStep,
        selectedPaymentMethod,
        handleReviewOrder,
        ...shippingMethodOperations
    });

    const {
        shippingMethods = [],
        handleSubmit: shippingMethodHandleSubmit,
        isLoading: shippingMethodIsLoading,
        derivedPrimaryShippingAddress,
        derivedPrimaryEmail,
        selectedShippingMethod
    } = talonPropsShippingMethod;

    const talonPropsAddressCard = useAddressCard({
        address: selectedAddress,
        onEdit: handleEditAddress,
        onSelection: () => { }
    });

    const {
        handleClick,
        handleEditAddress: handleEditAddressCard,
        handleKeyPress
    } = talonPropsAddressCard;

    const lowestCostShippingMethodSerializedValue =
        shippingMethods.length && shippingMethods[0].serializedValue
            ? shippingMethods[0].serializedValue
            : '';
    const lowestCostShippingMethod = {
        shipping_method: lowestCostShippingMethodSerializedValue
    };

    const reviewOrderButton = (
        <Button
            onClick={() => {
                shippingMethodHandleSubmit({ shipping_method: selectedShippingMethodState }, shippingMethods)
            }}
            priority="high"
            className={defaultClasses.review_order_button}
            disabled={
                reviewOrderButtonClicked ||
                isUpdating ||
                checkoutStep !== CHECKOUT_STEP.PAYMENT ||
                (emptyCardElement === false &&
                    (selectedPaymentMethod === "stripe_payments_checkout" || selectedPaymentMethod === "stripe_payments"))
            }
        >
            <FormattedMessage
                id={'checkoutPage.reviewOrder'}
                defaultMessage={'Review Order'}
            />
        </Button>
    );

    const handleApplyCredit = () => {
        applyCreditAmount({
            variables: {
                cart_id: localStorage.getItem('cart_id'),
                amount: +storeCreditValue
            }
        })
    }
    const handleApplyCreditCancle = () => {
        // formRef.current.setValue('storeCredit', '');
        removeCreditAmount({
            variables: {
                cart_id: localStorage.getItem('cart_id')
            }
        })
    }

    const applyCreditButton = (
        <Button
            onClick={handleApplyCredit}
            priority="high"
            className={defaultClasses.review_order_button}
            // disabled={+formRef?.current?.getValue('storeCredit') === 0}
            disabled={
                !storeCreditValue ||
                isNaN(storeCreditValue) ||
                storeCreditApplybtn ||
                +storeCreditValue <= 0 ||
                storeCreditValue > +creditBalance?.customer?.storecredit_credit?.balance_amount
            }
        >
            <FormattedMessage
                id={'checkoutPage.applyCreditButton'}
                defaultMessage={'Apply'}
            />
        </Button>
    )

    const applyCreditButtonCancle = (
        <Button
            onClick={handleApplyCreditCancle}
            priority="normal"
            className={defaultClasses.review_order_button}
            disabled={
                // reviewOrderButtonClicked ||
                // isUpdating ||
                // checkoutStep !== CHECKOUT_STEP.PAYMENT ||
                !storeCreditApplybtn
            }
        >
            <FormattedMessage
                id={'checkoutPage.applyCreditButtonCancle'}
                defaultMessage={'Cancel'}
            />
        </Button>
    )

    useEffect(() => {
        if (customerAddresses.length > 2) {
            setIsShowAllAddressSection(true);
        } else {
            setIsShowAllAddressSection(false);
        }
        if (customerAddresses.length && !selectedAddress) {
            const defaultAddress = customerAddresses.find(
                item => item.default_shipping
            );
            if (defaultAddress && defaultAddress.id) {
                setSelectedAddress(defaultAddress);
            } else {
                const initialAddress = customerAddresses.find(item => item.id);
                if (initialAddress && initialAddress.id) {
                    setSelectedAddress(initialAddress);
                }
            }
        } else if (selectedAddress && selectedAddress.id) {
            const resultAddress = customerAddresses.find(
                item => item.id === selectedAddress.id
            );
            if (resultAddress && resultAddress.id) {
                setSelectedAddress(resultAddress);
            }
        }
        //eslint-disable-next-line
    }, [customerAddresses]);

    useEffect(() => {
        if (selectedAddress && selectedAddress.id) {
            handleSelectAddress(selectedAddress.id);
            handleApplyAddress(selectedAddress.id);
        }
        //eslint-disable-next-line
    }, [selectedAddress]);


    useEffect(() => {
        if (selectedAddress &&
            selectedAddress.id &&
            selectedShippingMethod &&
            selectedShippingMethod.method_code &&
            checkoutStep === CHECKOUT_STEP.SHIPPING_ADDRESS) {
            setCheckoutStep(CHECKOUT_STEP.SHIPPING_METHOD)
        }
    }, [selectedShippingMethod, checkoutStep, selectedAddress])

    useEffect(() => {
        if (customerAddresses.length && (updatedShippingAddressId || updatedShippingAddressId === 0)) {
            const resultAddressDetail = customerAddresses.find(item => item.id === updatedShippingAddressId)
            if (resultAddressDetail && resultAddressDetail.id) {
                setSelectedAddress(resultAddressDetail)
            }
        }
    }, [updatedShippingAddressId, customerAddresses])

    useEffect(() => {
        if (lowestCostShippingMethod?.shipping_method) {
            setSelectedShippingMethodState(lowestCostShippingMethod.shipping_method)
        }
    }, [lowestCostShippingMethod])

    // const [subscribeNewsLetter/* , { message: newsLetterError } */] = useMutation(
    //     NEWSLETTER_MUTATION
    // );

    const handlePlaceOrderClick = () => {
        if (subscribenewsLetter) {
            // const response = subscribeNewsLetter({
            //     variables: { email: emailNewsLetter, subscribe: subscribenewsLetter }
            // });
        }
        sessionStorage.removeItem('rangeValue');
        sessionStorage.removeItem('isMaxCheckboxSelected');
        handlePlaceOrder();
    }

    const getEditButton = item => {
        if (selectedAddress && selectedAddress.id === item.id) {
            return (
                <button
                    className={defaultClasses.editButton}
                    onClick={handleEditAddressCard}
                >
                    <Icon
                        classes={{
                            icon: defaultClasses.editIcon
                        }}
                        size={16}
                        src={EditIcon}
                    />
                </button>
            );
        }
        return <></>;
    };

    const getDefaultBadge = item => {
        if (item.default_shipping) {
            return (
                <span className={defaultClasses.defaultBadge}>
                    <FormattedMessage
                        id={'addressCard.defaultText'}
                        defaultMessage={'Default'}
                    />
                </span>
            );
        }
        return <></>;
    };

    const getStreetRows = item => {
        if (item.street && item.street.length) {
            return item.street.map((row, index) => {
                return <span key={index}>{row}</span>;
            });
        }
        return <></>;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setStripePaymentConfirmation(true)
    }

    const [errorMsg, setErrorMsg] = useState()

    const placeOrderButton = (
        <Button
            onClick={(event) => {
                if (isCheckedTermsAndConditions) {
                    setErrorMsg(false)
                    if (selectedPaymentMethod === 'stripe_payments_checkout' || selectedPaymentMethod === 'stripe_payments') {
                        handleSubmit(event)
                    } else if (selectedPaymentMethod !== 'stripe_payments_checkout' && selectedPaymentMethod !== 'stripe_payments') {
                        handlePlaceOrderClick()
                    }
                } else {
                    setErrorMsg(true)
                }
            }}

            type={(selectedPaymentMethod === 'stripe_payments_checkout' || selectedPaymentMethod === 'stripe_payments') ? 'submit' : 'button'}
            className={defaultClasses.place_order_button}
            disabled={
                isUpdating ||
                placeOrderLoading ||
                orderDetailsLoading ||
                checkoutStep !== CHECKOUT_STEP.REVIEW ||
                (isSignedIn && JSON.parse(localStorage.getItem('userDetails'))?.value === 2 && totalqty < +localStorage.getItem('b2b-min-quantity')) ||
                (emptyCardElement === false &&
                    (selectedPaymentMethod === "stripe_payments_checkout" || selectedPaymentMethod === "stripe_payments")) ||
                razorpayOrderLoading ||
                paymentDetailForOrderLoading
            }
        >
            <FormattedMessage
                id={'checkoutPage.placeOrder'}
                defaultMessage={'Place Order'}
            />
        </Button>
    );

    const showAllAddresses = (
        <ShowAllButton
            setShowAllItems={setIsShowAllAddressSection}
            showAllItems={isShowAllAddressSection}
            suffixMessage={
                isShowAllAddressSection
                    ? 'Show All Address'
                    : 'Show Less Address'
            }
            isArrowDownIcon={isShowAllAddressSection}
        />
    );

    const giftModal = hasItems ? (
        <div className={Cartclasses.product_modal}>
            <GiftModal
                item={selectedItem}
                openModal={openModal}
                setOpenModel={setOpenModel}
                setAllCartGiftWrapper={setAllCartGiftWrapper}
                setGiftWrapperData={setGiftWrapperData}
                giftWrapperData={giftWrapperData}
                setPriceSummaryGiftWrapper={setPriceSummaryGiftWrapper}
                priceSummaryGiftWrapper={priceSummaryGiftWrapper}
                allCartGiftWrapper={allCartGiftWrapper}
            />
        </div>
    ) : null;
    if (!(orderNumber || propsData && propsData.orderNumber) && !(cartItems && cartItems.length) && cartDetailsId && !cartDetailsLoading && !isSignInFromCheckoutPage) {
        history.push('/')
    }

    if (placeOrderLoading && !isMobileView) {
        window &&
            window.scrollTo({
                left: 0,
                top: 0,
                behavior: 'smooth'
            });
        // return <LoadingIndicator />;
    }

    // if (selectedPaymentMethod !== 'payu' && propsData ) {
    //     console.log('propsData', propsData)
    //     return (
    //         <OrderConfirmationPage
    //             data={propsData.orderDetailsData}
    //             orderNumber={propsData.orderNumber}
    //         />
    //     );
    // }

    // if (selectedPaymentMethod !== 'payu' && orderNumber) {
    //     console.log('orderNumber', orderNumber)

    //     return (
    //         <OrderConfirmationPage
    //             data={orderDetailsData}
    //             orderNumber={orderNumber}
    //         />
    //     );


    // }

    // const handleModelOpen = () => {
    //     setOpenModel(!openModal)
    //     setPriceSummaryGiftWrapper(!priceSummaryGiftWrapper)
    // }

    // const allCart = allCartGiftWrapper &&
    //     allCartGiftWrapper.mpGiftWrapWrapperSetAll &&
    //     allCartGiftWrapper.mpGiftWrapWrapperSetAll.filter((all_cart =>
    //         all_cart &&
    //         all_cart.mp_gift_wrap_data &&
    //         all_cart.mp_gift_wrap_data.all_cart === true))[0]

    // const allCartWrapperName = allCart &&
    //     allCart.mp_gift_wrap_data &&
    //     allCart.mp_gift_wrap_data.name

    // const allCartWrapperPrice = allCart &&
    //     allCart.mp_gift_wrap_data &&
    //     allCart.mp_gift_wrap_data.price

    return (
        <div className={defaultClasses.root}>
            <div className="container-fluid">
                {addressBookLoading ||
                    shippingMethodIsLoading ||
                    paymentMethodMutationLoading ||
                    placeOrderLoading ||
                    onlinePaymentLoading ||
                    addStripePaymentLoading ||
                    setStripePaymentLoading ||
                    confirmationLoading ||
                    razorpayOrderLoading ||
                    paymentDetailForOrderLoading ? (
                    <LoadingIndicator />
                ) : (
                    <></>
                )}
                {isGuestCheckout && !isEmail ? (
                    <div className={defaultClasses.sign_in_section_wrapper}>
                        <span>{`Already have an account?  `}</span>
                        <LinkButton
                            // classes={{ root: classes.signInLink }}
                            onClick={handleTriggerClick}
                        >
                            <Button priority='high'>
                                <FormattedMessage
                                    id={'cartPage.signInLink'}
                                    defaultMessage={'Sign In'}
                                />
                            </Button>
                        </LinkButton>
                    </div>
                ) : (
                    <></>
                )}
                <div className="row">
                    <div className="col-xl-4 col-lg-6 col-md-6">
                        <div
                            className={
                                defaultClasses.shipping_address_main_wrapper
                            }
                        >
                            <div className={defaultClasses.checkout_heading}>
                                <h4>1. Shipping Address</h4>
                            </div>
                            {customerAddresses.length ? (
                                <>
                                    <div
                                        className={
                                            customerAddresses.length > 2 &&
                                                !isShowAllAddressSection
                                                ? defaultClasses.all_addresses_section
                                                : ''
                                        }
                                    >
                                        {[...customerAddresses].sort((a, b) => b.default_shipping - a.default_shipping).map(
                                            (itemDetail, index) => {
                                                return (
                                                    <div
                                                        className={
                                                            isShowAllAddressSection &&
                                                                index >= 2
                                                                ? defaultClasses.root_hidden
                                                                : selectedAddress &&
                                                                    selectedAddress.id ===
                                                                    itemDetail.id
                                                                    ? defaultClasses.address_wrapper_selected
                                                                    : defaultClasses.address_wrapper
                                                        }
                                                        key={
                                                            index.toString() +
                                                            JSON.stringify(
                                                                itemDetail
                                                            )
                                                        }
                                                        onClick={() => {
                                                            setCheckoutStep(
                                                                CHECKOUT_STEP.SHIPPING_ADDRESS
                                                            );
                                                            setSelectedAddress(
                                                                itemDetail
                                                            );
                                                            if (
                                                                itemDetail &&
                                                                itemDetail.id
                                                            ) {
                                                                handleClick(
                                                                    itemDetail.id
                                                                );
                                                            }
                                                        }}
                                                        onKeyPress={
                                                            handleKeyPress
                                                        }
                                                    >
                                                        {getEditButton(
                                                            itemDetail
                                                        )}
                                                        {getDefaultBadge(
                                                            itemDetail
                                                        )}
                                                        <span
                                                            className={
                                                                defaultClasses.name
                                                            }
                                                        >
                                                            {`${itemDetail?.firstname?.charAt(0)?.toUpperCase() + itemDetail?.firstname?.slice(1)
                                                                } ${itemDetail?.lastname?.charAt(0)?.toUpperCase() + itemDetail?.lastname?.slice(1)
                                                                }`}
                                                        </span>
                                                        {getStreetRows(
                                                            itemDetail
                                                        )}
                                                        <span>{` ${itemDetail.city
                                                            }, ${itemDetail.region
                                                                .region || ''} ${itemDetail.postcode
                                                            } ${itemDetail.country_code === "IN" && 'India'
                                                            }`}</span>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                    {customerAddresses.length > 2 ? (
                                        <div
                                            className={
                                                defaultClasses.show_all_address_button_wrapper
                                            }
                                        >
                                            {showAllAddresses}
                                        </div>
                                    ) : (
                                        <></>
                                    )}
                                    <div
                                        className={
                                            defaultClasses.shipping_address
                                        }
                                    >
                                        <button onClick={handleAddAddress}>
                                            + New Address
                                        </button>
                                    </div>
                                </>
                            ) : isSignedIn ? (
                                <CustomerForm
                                    afterSubmit={() => {
                                        setCheckoutStep(
                                            CHECKOUT_STEP.SHIPPING_METHOD
                                        );
                                        // window &&
                                        //     window.scrollTo({
                                        //         left: 0,
                                        //         top: 0,
                                        //         behavior: 'smooth'
                                        //     });
                                    }}
                                    isDisableSubmitButton={
                                        checkoutStep !==
                                        CHECKOUT_STEP.SHIPPING_ADDRESS
                                    }
                                    setCheckoutStep={setCheckoutStep}
                                />
                            ) : (
                                <GuestForm
                                    afterSubmit={() => {
                                        console.log("4")
                                        setCheckoutStep(
                                            CHECKOUT_STEP.PAYMENT
                                        );
                                        // window &&
                                        //     window.scrollTo({
                                        //         left: 0,
                                        //         top: 0,
                                        //         behavior: 'smooth'
                                        //     });
                                    }}
                                    isDisableSubmitButton={
                                        checkoutStep !==
                                        CHECKOUT_STEP.SHIPPING_ADDRESS
                                    }
                                    setCheckoutStep={setCheckoutStep}
                                    setemailNewsLetter={setemailNewsLetter}
                                    setSubscribeNewsLetter={setSubscribeNewsLetter}
                                    shippingData={derivedPrimaryShippingAddress}
                                    derivedPrimaryEmail={derivedPrimaryEmail}
                                    setIsEmail={setIsEmail}
                                />
                            )}
                        </div>
                    </div>
                    <div className="col-xl-4 col-lg-6 col-md-6">
                        <div
                            className={
                                defaultClasses.shipping_and_payment_method_main_wrapper
                            }
                        >
                            {/* <div>
                                <div
                                    className={defaultClasses.checkout_heading}
                                >
                                    <h4>2. Shipping Method</h4>
                                </div>
                                <div>
                                    <Form
                                        onValueChange={(value) => {
                                            setSelectedShippingMethodState(value?.shipping_method || '')
                                            if (
                                                checkoutStep >
                                                CHECKOUT_STEP.SHIPPING_METHOD
                                            ) {
                                                setCheckoutStep(
                                                    CHECKOUT_STEP.SHIPPING_METHOD
                                                );
                                            }
                                        }}
                                        initialValues={lowestCostShippingMethod}
                                    >
                                        <ShippingRadios
                                            disabled={
                                                isUpdating ||
                                                shippingMethodIsLoading
                                            }
                                            shippingMethods={shippingMethods}
                                        />
                                        {shippingMethods.length ? (
                                            <div
                                                className={
                                                    defaultClasses.shipping_method_formButtons
                                                }
                                            >
                                                <Button
                                                    priority="high"
                                                    disabled={
                                                        isUpdating ||
                                                        shippingMethodIsLoading ||
                                                        checkoutStep !==
                                                        CHECKOUT_STEP.SHIPPING_METHOD
                                                    }
                                                    onClick={() => shippingMethodHandleSubmit({ shipping_method: selectedShippingMethodState }, shippingMethods)}
                                                >
                                                    <FormattedMessage
                                                        id={
                                                            'shippingMethod.continueToNextStep'
                                                        }
                                                        defaultMessage={
                                                            'Continue to Payment Method'
                                                        }
                                                    />
                                                </Button>
                                            </div>
                                        ) : (
                                            <></>
                                        )}
                                    </Form>
                                </div>
                            </div> */}
                            <div className={defaultClasses.payment_method}>
                                <div
                                    className={defaultClasses.checkout_heading}
                                >
                                    <h4>2. Payment Method</h4>
                                </div>
                                <div>
                                    <PaymentInformation
                                        checkoutError={error}
                                        resetShouldSubmit={
                                            resetReviewOrderButtonClicked
                                        }
                                        setCheckoutStep={setCheckoutStep}
                                        shouldSubmit={reviewOrderButtonClicked}
                                        checkoutStep={checkoutStep}
                                        setPaymentMethodMutationLoading={
                                            setPaymentMethodMutationLoading
                                        }
                                        selectedAddress={selectedAddress}
                                        setSelectedPaymentMethod={setSelectedPaymentMethod}
                                        paymentMethod={selectedPaymentMethod}
                                        handleSubmit={handleSubmit}
                                        stripePaymentConfirmation={stripePaymentConfirmation}
                                        setStripePaymentConfirmation={setStripePaymentConfirmation}
                                        handlePlaceOrderClick={handlePlaceOrderClick}
                                        cartDetails={cartDetails}
                                        setAddStripePaymentLoading={setAddStripePaymentLoading}
                                        setSetStripePaymentLoading={setSetStripePaymentLoading}
                                        setEmptyCardElement={setEmptyCardElement}
                                        isSignedIn={isSignedIn}
                                        razorPayBannerInfo={razorPayBannerInfo}
                                    />
                                </div>
                                <div
                                    className={
                                        defaultClasses.review_order_button_wrapper
                                    }
                                >
                                    {reviewOrderButton}
                                </div>
                            </div>
                            {isSignedIn && creditBalance?.customer?.storecredit_credit?.balance_amount > 0 &&
                                <div className='pt-3'>
                                    <Accordion>
                                        <Section
                                            id="order_commment"
                                            title=

                                            {<div className={defaultClasses.checkout_heading + ' ' + 'mb-0'}><h4>Apply Store Credit</h4></div>}
                                        >
                                            <Suspense
                                                fallback={
                                                    <LoadingIndicator />
                                                }
                                            >
                                                {/* <label
                                                    className={
                                                        defaultClasses.label
                                                    }
                                                >
                                                    Order Comment
                                                </label> */}
                                                {isSignedIn && creditBalance?.customer?.storecredit_credit?.balance_amount > 0 &&
                                                    // <Form
                                                    //     ref={formRef}
                                                    //     getApi={value => formRef.current = value}
                                                    // >
                                                    <div className={defaultClasses.payment_method + ' ' + defaultClasses.apply_store}>
                                                        <h6>
                                                            <FormattedMessage
                                                                id={'storecrdeit.balance'}
                                                                defaultMessage={'Your Balance is'}
                                                            /> : <Price
                                                                value={creditBalance?.customer?.storecredit_credit?.balance_amount}
                                                                currencyCode={"INR"}
                                                            />
                                                        </h6>
                                                        <Field
                                                            id="storeCredit"
                                                        >
                                                            <input
                                                                field="storeCredit"
                                                                type='text'
                                                                className={Textcss.input}
                                                                value={storeCreditValue}
                                                                onChange={(e) => setStoreCreditValue(e.target.value)}
                                                                // formvalue={creditAmount}
                                                                validateOnBlur
                                                                id="storeCredit"
                                                                disabled={storeCreditApplybtn}
                                                                validate={
                                                                    (value) => checkOnlyDecimalNumberAllow(value, 'Credit')
                                                                }
                                                                onValueChange={value => setStoreCreditValue(value)}
                                                            // initialValue={+formRef?.current?.getValue('storeCredit')}
                                                            />
                                                            {+storeCreditValue > +creditBalance?.customer?.storecredit_credit?.balance_amount ? <Message dateError="Amount exceeds Balance" /> :
                                                                isNaN(storeCreditValue) ? <Message dateError="Contain must only numeric value" /> : (+storeCreditValue <= 0 && storeCreditValue) ? <Message dateError="Enter valid credit" /> : null}
                                                        </Field>
                                                        <div className={defaultClasses.btn_wrpper}>
                                                            {applyCreditButton}{applyCreditButtonCancle}
                                                            {/* {applyCreditButton} {applyCreditButtonCancle} */}
                                                        </div>
                                                    </div>
                                                    // </Form>
                                                }
                                            </Suspense>
                                        </Section>
                                    </Accordion>
                                </div>
                            }
                        </div>
                    </div>
                    <div
                        className={
                            'col-xl-4 col-lg-6' +
                            ' ' +
                            defaultClasses.order_summary_main_wrapper
                        }
                    >
                        <div
                            className={
                                defaultClasses.coupon_code_section_wrapper
                            }
                        >
                            <CouponCode
                                setCouponCode={setCouponCode}
                                couponCode={couponCode}
                                checkoutStep={checkoutStep}
                            />
                        </div>
                        <div className="row">


                            <div className="col-lg-12 col-md-6">
                                <ItemsReview
                                    allCartGiftWrapper={allCartGiftWrapper}
                                    openModal={openModal}
                                    setOpenModel={setOpenModel}
                                    giftModal={giftModal}
                                    setSelectedItem={setSelectedItem}
                                    selectedItem={selectedItem}
                                    setGiftWrapperData={setGiftWrapperData}
                                    giftWrapperData={giftWrapperData}
                                    wrapperStatusPerItem={
                                        wrapperStatusPerItem
                                    }
                                    setIsPriceSummaryLoading={
                                        setIsPriceSummaryLoading
                                    }
                                    setIsDeleteItemLoading={setIsDeleteItemLoading}
                                    isDeleteItemLoading={isDeleteItemLoading}
                                    itemData={cartDetails && cartDetails.items}
                                    setTotalQty={setTotalQty}
                                />
                                <div
                                    className={
                                        defaultClasses.order_summary_main_wrapper_box
                                    }
                                >
                                    <div
                                        className={
                                            defaultClasses.checkout_heading
                                        }
                                    >
                                        <h4>Order Summary</h4>
                                    </div>

                                    {/* {!isDeleteItemLoading &&  <ItemsReview
                                        allCartGiftWrapper={allCartGiftWrapper}
                                        openModal={openModal}
                                        setOpenModel={setOpenModel}
                                        giftModal={giftModal}
                                        setSelectedItem={setSelectedItem}
                                        selectedItem={selectedItem}
                                        setGiftWrapperData={setGiftWrapperData}
                                        giftWrapperData={giftWrapperData}
                                        wrapperStatusPerItem={
                                            wrapperStatusPerItem
                                        }
                                        setIsPriceSummaryLoading={
                                            setIsPriceSummaryLoading
                                        }
                                        setIsDeleteItemLoading={setIsDeleteItemLoading}
                                    /> */}


                                    {isSignedIn && (
                                        <>
                                            {pointValues <= point_balance ? (
                                                <>
                                                    <div className={defaultClasses.checkout_spend}>
                                                        <Accordion>
                                                            <Section
                                                                id="spend_your_points"
                                                                title={formatMessage(
                                                                    {
                                                                        id:
                                                                            'checkoutPage.spendYourPoints',
                                                                        defaultMessage:
                                                                            'Spend Your Points'
                                                                    }
                                                                )}
                                                            >
                                                                <Suspense
                                                                    fallback={
                                                                        <LoadingIndicator />
                                                                    }
                                                                />
                                                                <RewardPoints
                                                                    value={value}
                                                                    onChange={
                                                                        onChange
                                                                    }
                                                                    rewardPrice={
                                                                        rewardPrice
                                                                    }
                                                                    cartId={cartId}
                                                                    rewardCalculation={
                                                                        rewardCalculation
                                                                    }
                                                                    calculation={
                                                                        calculation
                                                                    }
                                                                    data={data}
                                                                    isMountedCartPage={isMountedCartPage}
                                                                />
                                                            </Section>
                                                        </Accordion>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <Accordion>
                                                        <Suspense
                                                            fallback={
                                                                <LoadingIndicator />
                                                            }
                                                        />
                                                        <RewardPoints
                                                            value={value}
                                                            onChange={onChange}
                                                            rewardPrice={
                                                                rewardPrice
                                                            }
                                                            cartId={cartId}
                                                            rewardCalculation={
                                                                rewardCalculation
                                                            }
                                                            calculation={
                                                                calculation
                                                            }
                                                            data={data}
                                                            isMountedCartPage={isMountedCartPage}
                                                        />
                                                    </Accordion>
                                                </>
                                            )}
                                        </>
                                    )}
                                    {/* {hasItems && <>
                                        {allCartGiftWrapper && allCart && <span>
                                            <b>Wrapper : </b> {allCartWrapperName} ({allCartWrapperPrice})
                                        </span>}
                                        {
                                            (cartItems && giftWrapperData && cartItems.length === giftWrapperData.length) && <span className='text-danger'>{"All the products are already gift-wrapped"}</span>
                                        }
                                        {(wrapperStatusPerItem !== "Per Item" || wrapperStatusPerItem === "Both") && <div className="text-left w-full">
                                            <Button className={productClasses.popupbtn} onClick={handleModelOpen} data-toggle="modal" data-target="#giftWrapper">
                                                <span>
                                                    {allCartGiftWrapper && allCart ?
                                                        <FormattedMessage
                                                            id={'giftModel.giftwrap'}
                                                            defaultMessage={'Change Your Gift Wrap'}
                                                        /> :
                                                        <FormattedMessage
                                                            id={'giftModel.addGiftwrap'}
                                                            defaultMessage={'Add Gift Wrap'}
                                                        />
                                                    }
                                                </span>
                                            </Button>
                                        </div>}
                                    </>} */}
                                    {isPriceSummaryLoading ? (
                                        <LoadingIndicator />
                                    ) : (
                                        <PriceSummary
                                            couponCode={couponCode}
                                            values={value}
                                            onChange={onChange}
                                            rewardPrice={rewardPrice}
                                            rewardPointCalculationLoading={
                                                rewardPointCalculationLoading
                                            }
                                            calculation={calculation}
                                            data={data}
                                            cartDetails={cartDetails}
                                            giftWrapperData={giftWrapperData}
                                            allCartGiftWrapper={
                                                allCartGiftWrapper
                                            }
                                            giftWrap={JSON.parse(
                                                localStorage.getItem('wrapperRadioButtonValue')
                                            ) || ''}
                                            modal={modal}
                                            setModal={setModal}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="col-lg-12 col-md-6">
                                <div
                                    className={
                                        defaultClasses.order_summary_comment
                                    }
                                >
                                    <div
                                        id={
                                            defaultClasses.checkout_ordercomment
                                        }
                                    >
                                        <Accordion>
                                            <Section
                                                id="order_commment"
                                                title={formatMessage({
                                                    id:
                                                        'checkoutPage.orderComment',
                                                    defaultMessage:
                                                        'Order Comment'
                                                })}
                                            >
                                                <Suspense
                                                    fallback={
                                                        <LoadingIndicator />
                                                    }
                                                >
                                                    {/* <label
                                                    className={
                                                        defaultClasses.label
                                                    }
                                                >
                                                    Order Comment
                                                </label> */}
                                                    <PriceAdjustments />
                                                </Suspense>
                                            </Section>
                                        </Accordion>
                                    </div>

                                    <Form className={`${(errorMsg && !isCheckedTermsAndConditions) ? defaultClasses.check_box_error : ''}`}>
                                        <div
                                            className={defaultClasses.subscribe}
                                        >
                                            <Checkbox
                                                id="terms_conditions"
                                                onClick={value =>
                                                    setIsCheckedTermsAndConditions(
                                                        value.target.checked
                                                    )
                                                }
                                                value={
                                                    isCheckedTermsAndConditions
                                                }
                                                field="terms_conditions"
                                                label={
                                                    <span className={defaultClasses.label_span}>
                                                        I accept the{' '}
                                                        <a
                                                            href="/terms-conditions"
                                                            target="_blank"
                                                            className={
                                                                defaultClasses.term_and_condition_link
                                                            }
                                                        >
                                                            Terms & Conditions
                                                        </a>{' '}
                                                        and{' '}
                                                        <a
                                                            href="/privacy-policy"
                                                            target="_blank"
                                                            className={
                                                                defaultClasses.term_and_condition_link
                                                            }
                                                        >
                                                            Privacy Policy
                                                        </a>
                                                        *
                                                    </span>
                                                }
                                                isDisplayOwnLabel={true}
                                            />
                                        </div>
                                        <div
                                            className={
                                                defaultClasses.return_policy_wrapper

                                            }
                                        >
                                            30 days withdrawal and free returns.
                                            Read more about{' '}
                                            <a
                                                href="/return-policy"
                                                target="_blank"
                                                className={
                                                    defaultClasses.return_policy_link
                                                }
                                            >
                                                return and refund policy
                                            </a>
                                        </div>
                                        {isSignedIn && JSON.parse(localStorage.getItem('userDetails'))?.value === 2 && totalqty < +localStorage.getItem('b2b-min-quantity') ?
                                            <p className='text-danger'>Add 50 or more items into the cart to proceed checkout as a business user</p> : null
                                        }
                                        {/* {(errorMsg && !isCheckedTermsAndConditions) && <div className='text-danger mt-2'>Can't proceed as you didn't agree to the terms!</div>} */}
                                        <div className={Cartclasses.place_btn_wrap}>{placeOrderButton}</div>
                                    </Form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <Suspense fallback={<LoadingIndicator />}>
                    <AccountMenu
                        ref={accountMenuRef}
                        accountMenuIsOpen={accountMenuIsOpen}
                        setAccountMenuIsOpen={setAccountMenuIsOpen}
                        handleTriggerClick={handleTriggerClick}
                    />
                </Suspense> */}
                <Suspense fallback={null}>
                    <EditModal shippingData={activeAddress} afterSubmit={data => setUpdatedShippingAddressId(data)} />
                </Suspense>
                {/* <StripeCheckoutPage /> */}
            </div>
        </div>
    );
};

export default CheckoutPage;
