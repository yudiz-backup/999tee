import React, { useEffect, useState } from 'react';
import { shape, string, bool, func } from 'prop-types';
import { RadioGroup } from 'informed';
import { usePaymentMethods } from '@magento/peregrine/lib/talons/CheckoutPage/PaymentInformation/usePaymentMethods';
import { mergeClasses } from '../../../classify';
import Radio from '../../RadioGroup/radio';
import OfflinePayment from './offlinePayment';
import paymentMethodOperations from './paymentMethods.gql';
import defaultClasses from './paymentMethods.css';
import RichContent from '../../RichContent';
import { useQuery } from '@apollo/client';
import storeConfig from '../../../queries/addFooterImgCard.graphql';
import { CHECKOUT_STEP } from '@magento/peregrine/lib/talons/CheckoutPage/useCheckoutPage';
import StripePayment from '../stripePayment';


const PaymentMethods = props => {
    const {
        classes: propClasses,
        onPaymentError,
        onPaymentSuccess,
        resetShouldSubmit,
        shouldSubmit,
        setCheckoutStep = () => { },
        selectedPaymentMethod = '',
        setPaymentMethodMutationLoading = () => { },
        checkoutStep,
        selectedAddress,
        setSelectedPaymentMethod = () => { },
        paymentMethod,
        handleSubmit,
        stripePaymentConfirmation,
        setStripePaymentConfirmation,
        handlePlaceOrderClick,
        setAddStripePaymentLoading,
        setSetStripePaymentLoading,
        setEmptyCardElement,
        isSignedIn,
        razorPayBannerInfo
    } = props;

    const [
        currentSelectedPaymentMethod,
        setCurrentSelectedPaymentMethod
    ] = useState('');
    const classes = mergeClasses(defaultClasses, propClasses);

    const { data: paymentImageData } = useQuery(storeConfig);
    const talonProps = usePaymentMethods({
        ...paymentMethodOperations,
        selectedPaymentMethod
    });

    const {
        availablePaymentMethods,
        initialSelectedMethod,
        isLoading
    } = talonProps;

    useEffect(() => {
        if (initialSelectedMethod) {
            setCurrentSelectedPaymentMethod(initialSelectedMethod);
            if (checkoutStep === CHECKOUT_STEP.SHIPPING_ADDRESS && selectedAddress && selectedAddress.id) {
                setCheckoutStep(CHECKOUT_STEP.PAYMENT)
            }
        }
    }, [initialSelectedMethod]);

    const availablePaymentMethod = availablePaymentMethods?.find(code => code?.code === paymentMethod)

    useEffect(() => {
        if (!availablePaymentMethod && isSignedIn) {
            setSelectedPaymentMethod('')
            setCheckoutStep(CHECKOUT_STEP.PAYMENT)
        }
    }, [availablePaymentMethod, isSignedIn])

    useEffect(() => {
        setSelectedPaymentMethod(currentSelectedPaymentMethod)
    }, [currentSelectedPaymentMethod])
    const radios = availablePaymentMethods.map(({ code, title }) => (
        <div key={code} className={classes.payment_method}>
            <Radio
                label={title}
                value={code}
                name="gfgf"
                classes={{
                    label: classes.radio_label
                }}
                checked={currentSelectedPaymentMethod === code}
            />

        </div>
    ));

    const noPaymentMethodMessage = !radios.length ? (
        <div className={classes.payment_errors}>
            <span>
                Please ensure a shipping address is set with availability delivery Pincode.
            </span>
        </div>
    ) : null;

    if (isLoading) {
        return null;
    }

    return (
        <div className={classes.root}>
            <RadioGroup
                field="selectedPaymentMethod"
                initialValue={initialSelectedMethod}
                onValueChange={value => setCurrentSelectedPaymentMethod(value)}
            >
                {radios}
            </RadioGroup>
            {noPaymentMethodMessage}
            <div className='mb-3'>
                {(paymentMethod === 'stripe_payments_checkout' || paymentMethod === 'stripe_payments') &&
                    <StripePayment
                        handleSubmit={handleSubmit}
                        stripePaymentConfirmation={stripePaymentConfirmation}
                        setStripePaymentConfirmation={setStripePaymentConfirmation}
                        handlePlaceOrderClick={handlePlaceOrderClick}
                        paymentMethod={paymentMethod}
                        setAddStripePaymentLoading={setAddStripePaymentLoading}
                        setSetStripePaymentLoading={setSetStripePaymentLoading}
                        setEmptyCardElement={setEmptyCardElement}
                    />
                }
            </div>
            {paymentMethod === 'razorpay' && <RichContent html={razorPayBannerInfo} />}
            {radios.length ? (
                <div className={classes.copyright}>
                    <ul className={classes.payment_icons}>
                        <RichContent
                            html={paymentImageData?.storeConfig?.absolute_footer}
                        />
                    </ul>
                </div>
            ) : <></>}
            {radios.length ? (
                <OfflinePayment
                    onPaymentSuccess={onPaymentSuccess}
                    onPaymentError={onPaymentError}
                    resetShouldSubmit={resetShouldSubmit}
                    shouldSubmit={shouldSubmit}
                    paymentCode={currentSelectedPaymentMethod}
                    setCheckoutStep={setCheckoutStep}
                    setPaymentMethodMutationLoading={setPaymentMethodMutationLoading}
                />
            ) : (<></>)}
        </div>
    );
};

export default PaymentMethods;

PaymentMethods.propTypes = {
    classes: shape({
        root: string,
        payment_method: string,
        radio_label: string
    }),
    onPaymentSuccess: func,
    onPaymentError: func,
    resetShouldSubmit: func,
    selectedPaymentMethod: string,
    shouldSubmit: bool,
    setCheckoutStep: func
};
