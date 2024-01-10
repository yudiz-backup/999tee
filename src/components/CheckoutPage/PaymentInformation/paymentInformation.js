import React, { Suspense } from 'react';
import { FormattedMessage } from 'react-intl';
import { Form } from 'informed';
import { shape, func, string, bool, instanceOf, number } from 'prop-types';
import { usePaymentInformation } from 'src/peregrine/lib/talons/CheckoutPage/PaymentInformation/usePaymentInformation';
import CheckoutError from '@magento/peregrine/lib/talons/CheckoutPage/CheckoutError';
import PaymentMethods from './paymentMethods';
import { mergeClasses } from '../../../classify';
import paymentInformationOperations from './paymentInformation.gql';
import defaultClasses from './paymentInformation.css';
import LoadingIndicator from '../../LoadingIndicator';
import { CHECKOUT_STEP } from 'src/peregrine/lib/talons/CheckoutPage/useCheckoutPage';
const EditModal = React.lazy(() => import('./editModal'));

const PaymentInformation = props => {
    const {
        classes: propClasses,
        resetShouldSubmit,
        setCheckoutStep = () => { },
        shouldSubmit,
        checkoutError,
        checkoutStep,
        setPaymentMethodMutationLoading = () => { },
        selectedAddress,
        setSelectedPaymentMethod = () => { },
        cartDetails,
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

    const classes = mergeClasses(defaultClasses, propClasses);

    const talonProps = usePaymentInformation({
        checkoutError,
        resetShouldSubmit,
        setCheckoutStep,
        shouldSubmit,
        ...paymentInformationOperations,
        cartDetails
    });

    const {
        doneEditing,
        handlePaymentError,
        handlePaymentSuccess,
        hideEditModal,
        isLoading,
        isEditModalActive,
        selectedPaymentMethod
    } = talonProps;

    if (isLoading) {
        return (
            <LoadingIndicator classes={{ root: classes.loading }}>
                <FormattedMessage
                    id={'checkoutPage.loadingPaymentInformation'}
                    defaultMessage={'Fetching Payment Information'}
                />
            </LoadingIndicator>
        );
    }

    const paymentInformation = (<Form onValueChange={() => {
        if (checkoutStep > CHECKOUT_STEP.PAYMENT) {
            setCheckoutStep(CHECKOUT_STEP.PAYMENT)
        }
    }}>
        <PaymentMethods
            onPaymentError={handlePaymentError}
            onPaymentSuccess={handlePaymentSuccess}
            resetShouldSubmit={resetShouldSubmit}
            shouldSubmit={shouldSubmit}
            setCheckoutStep={setCheckoutStep}
            selectedPaymentMethod={selectedPaymentMethod}
            setPaymentMethodMutationLoading={setPaymentMethodMutationLoading}
            checkoutStep={checkoutStep}
            selectedAddress={selectedAddress}
            setSelectedPaymentMethod={setSelectedPaymentMethod}
            paymentMethod={paymentMethod}
            handleSubmit={handleSubmit}
            stripePaymentConfirmation={stripePaymentConfirmation}
            setStripePaymentConfirmation={setStripePaymentConfirmation}
            handlePlaceOrderClick={handlePlaceOrderClick}
            setAddStripePaymentLoading={setAddStripePaymentLoading}
            setSetStripePaymentLoading={setSetStripePaymentLoading}
            setEmptyCardElement={setEmptyCardElement}
            isSignedIn={isSignedIn}
            razorPayBannerInfo={razorPayBannerInfo}
        />
    </Form>
    );

    const editModal = doneEditing ? (
        <Suspense fallback={null}>
            <EditModal onClose={hideEditModal} isOpen={isEditModalActive} />
        </Suspense>
    ) : null;

    return (
        <div className={classes.root}>
            <div className={classes.payment_info_container}>
                {paymentInformation}
            </div>
            {editModal}
        </div>
    );
};

export default PaymentInformation;

PaymentInformation.propTypes = {
    classes: shape({
        container: string,
        payment_info_container: string,
        review_order_button: string
    }),
    checkoutError: instanceOf(CheckoutError),
    resetShouldSubmit: func.isRequired,
    shouldSubmit: bool,
    checkoutStep: number,
    setCheckoutStep: func
};
