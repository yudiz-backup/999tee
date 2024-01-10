import React, { useEffect, useState, useRef, Suspense, useContext } from 'react';
import { gql, useQuery } from '@apollo/client';
import { AlertCircle as AlertCircleIcon } from 'react-feather';
import { useToasts } from '@magento/peregrine';
import { deriveErrorMessage } from '@magento/peregrine/lib/util/deriveErrorMessage';
import { useCouponCode } from '@magento/peregrine/lib/talons/CartPage/PriceAdjustments/useCouponCode';
import { useIntl } from 'react-intl';
import { mergeClasses } from '../../../../classify';

import Button from '../../../Button';
import { Form } from 'informed';
import Field from '../../../Field';
import Icon from '../../../Icon';
import TextInput from '../../../TextInput';

import { CartPageFragment } from '../../cartPageFragments.gql';
import { AppliedCouponsFragment } from './couponCodeFragments';

import defaultClasses from './couponCode.css';
import getAllCouponCodes from '../../../../queries/allCouponCode.graphql';
import AllCouponCodeSlidebar from '../AllCouponCodeSlidebar/allCouponCodeSlidebar';
import { useAllCouponCodeSlidebarTrigger } from '../AllCouponCodeSlidebar';
import {/*  hasLengthAtLeast, */ hasLengthAtLeastCouponcode/* , isRequired  */ } from '../../../../util/formValidators';
import combine from '../../../../util/combineValidators';
import CouponModal from '../../../CouponModal/CouponModal';
import { globalContext } from '../../../../peregrine/lib/context/global';

const errorIcon = <Icon src={AlertCircleIcon} attrs={{ width: 18 }} />;

const GET_APPLIED_COUPONS = gql`
    query getAppliedCoupons($cartId: String!) {
        cart(cart_id: $cartId) {
            id
            ...AppliedCouponsFragment
        }
    }
    ${AppliedCouponsFragment}
`;

const APPLY_COUPON_MUTATION = gql`
    mutation applyCouponToCart($cartId: String!, $couponCode: String!) {
        applyCouponToCart(
            input: { cart_id: $cartId, coupon_code: $couponCode }
        ) @connection(key: "applyCouponToCart") {
            cart {
                id
                ...CartPageFragment
                # If this mutation causes "free" to become available we need to know.
                available_payment_methods {
                    code
                    title
                }
            }
        }
    }
    ${CartPageFragment}
`;

export const REMOVE_COUPON_MUTATION = gql`
    mutation removeCouponFromCart($cartId: String!) {
        removeCouponFromCart(input: { cart_id: $cartId })
            @connection(key: "removeCouponFromCart") {
            cart {
                id
                ...CartPageFragment
                # If this mutation causes "free" to become available we need to know.
                available_payment_methods {
                    code
                    title
                }
            }
        }
    }
    ${CartPageFragment}
`;

/**
 * A child component of the PriceAdjustments component.
 * This component renders a form for addingg a coupon code to the cart.
 *
 * @param {Object} props
 * @param {Function} props.setIsCartUpdating Function for setting the updating state for the cart.
 * @param {Object} props.classes CSS className overrides.
 * See [couponCode.css]{@link https://github.com/magento/pwa-studio/blob/develop/packages/venia-ui/lib/components/CartPage/PriceAdjustments/CouponCode/couponCode.css}
 * for a list of classes you can override.
 *
 * @returns {React.Element}
 *
 * @example <caption>Importing into your project</caption>
 * import CouponCode from "@magento/venia-ui/lib/components/CartPage/PriceAdjustments/CouponCode";
 */
const CouponCode = props => {
    const formRef = useRef();
    const { data: couponCodeData } = useQuery(getAllCouponCodes);
    const { allcouponcodes } = couponCodeData || {};
    const { data: allCouponCodeData = [] } = allcouponcodes || {};

    const {
        setIsCartUpdating = () => { },
        setCouponCode = () => { },
        classes: propsClasses,
        couponCode
    } = props;

    const classes = mergeClasses(defaultClasses, propsClasses);
    const { formatMessage } = useIntl();

    const [couponCodeValue, setCouponCodeValue] = useState('');
    const [modal, setModal] = useState(false)
    const [discountPrice, setDiscountPrice] = useState()

    const { dispatch } = useContext(globalContext);

    const {
        handleTriggerClick,
        isOpenAllCouponCodeSlidebar,
        setIsOpenAllCouponCodeSlidebar,
        allCouponCodeSlidebarRef
    } = useAllCouponCodeSlidebarTrigger();

    const talonProps = useCouponCode({
        setIsCartUpdating: setIsCartUpdating,
        mutations: {
            applyCouponMutation: APPLY_COUPON_MUTATION,
            removeCouponMutation: REMOVE_COUPON_MUTATION
        },
        queries: {
            getAppliedCouponsQuery: GET_APPLIED_COUPONS
        },
        setModal,
        setDiscountPrice
    });
    const [, { addToast }] = useToasts();
    const {
        applyingCoupon,
        data,
        errors,
        handleApplyCoupon,
        handleRemoveCoupon,
        removingCoupon
    } = talonProps;

    const removeCouponError = deriveErrorMessage([
        errors.get('removeCouponMutation')
    ]);

    const handlePopupApplyButton = selectedCouponCode => {
        // if(couponCode) {
        //     handleRemoveCoupon(couponCode);
        // }
        formRef.current.setValue('couponCode', selectedCouponCode);
        handleApplyCoupon({ couponCode: selectedCouponCode });
        setIsOpenAllCouponCodeSlidebar(false);
        // $('#staticBackdrop').modal('hide');
    };

    const handleRemoveCouponCode = code => {
        handleRemoveCoupon(code);
        setIsOpenAllCouponCodeSlidebar(false);
        setCouponCode('');
        if (formRef && formRef.current) {
            formRef.current.setValue('couponCode', '');
        }
    };

    useEffect(() => {
        if (removeCouponError) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: removeCouponError,
                dismissable: true,
                timeout: 10000
            });
        }
    }, [addToast, removeCouponError]);

    useEffect(() => {
        if (
            data &&
            data.cart &&
            data.cart.applied_coupons &&
            data.cart.applied_coupons.length &&
            data.cart.applied_coupons[0].code
        ) {
            setCouponCode(data.cart.applied_coupons[0].code);
        } else {
            setCouponCode('');
        }
    }, [data, setCouponCode]);

    useEffect(() => {
        if (couponCode && formRef && formRef.current) {
            const couponCodeInputValue = formRef.current.getValue('couponCode');
            if (!couponCodeInputValue) {
                formRef.current.setValue('couponCode', couponCode);
            }
        }
    }, [formRef, couponCode]);

    const errorMessage = deriveErrorMessage([
        errors.get('applyCouponMutation')
    ]);

    const formClass = errorMessage ? classes.entryFormError : classes.entryForm;

    if (!data) {
        return null;
    }

    if (errors.get('getAppliedCouponsQuery')) {
        return (
            <div className={classes.errorContainer}>
                {'Something went wrong. Please refresh and try again.'}
            </div>
        );
    }

    return (
        <div className={classes.form_coupon}>

            <Form
                className={formClass}
                onSubmit={value => {
                    if (couponCode) {
                        handleRemoveCouponCode(couponCode);
                    } else {
                        handleApplyCoupon(value);
                        // localStorage.setItem("couponApplied",1)
                    }
                }}
                ref={formRef}
                getApi={value => (formRef.current = value)}
            >

                <Field
                    id="couponCode"
                    label={
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                width: '100%'
                            }}
                        >
                            <span>
                                {formatMessage({
                                    id: 'couponCode.couponCode',
                                    defaultMessage: 'Coupon Code'
                                })}
                            </span>

                        </div>
                    }
                >
                    <TextInput
                        field="couponCode"
                        id={'couponCode'}
                        placeholder={formatMessage({
                            id: 'couponCode.enterCode',
                            defaultMessage: 'Enter code'
                        })}
                        validate={combine([
                            // value => isRequired(value, 'Coupon Code'),)
                            value => hasLengthAtLeastCouponcode(value, 3)
                        ])}
                        validateOnChange
                        mask={value => value && value.trim()}
                        // maskOnBlur={true}
                        message={errorMessage}
                        disabled={
                            couponCode || applyingCoupon || removingCoupon
                        }
                        onValueChange={value => setCouponCodeValue(value)}
                    />
                </Field>
                <div className={classes.apply_cupon_wrap}>
                    <span
                        className={classes.cupon_btn}
                        onClick={ () => {
                            // handleTriggerClick()
                            dispatch({
                                type: 'COUPON_CODE_MODAL',
                                payload: {couponCodeModal : true, 
                                    allCouponCodeData: allCouponCodeData, 
                                    couponCode: couponCode,
                                    handlePopupApplyButton: handlePopupApplyButton,
                                    handleRemoveCouponCode:handleRemoveCouponCode

                                }
                            })
                        }
                        }
                    >
                        Show All Coupon
                    </span>
                    <Button
                        className={defaultClasses.apply_or_remove_button}
                        disabled={applyingCoupon || removingCoupon || couponCodeValue?.length < 3 || !couponCodeValue}
                        priority={'normal'}
                        type={'submit'}
                    >
                        {couponCode
                            ? formatMessage({
                                id: 'couponCode.Remove',
                                defaultMessage: 'Remove'
                            })
                            : formatMessage({
                                id: 'couponCode.Apply',
                                defaultMessage: 'Apply'
                            })}
                    </Button>
                </div>
                {/* <Suspense fallback={null}>
                    <AllCouponCodeSlidebar
                        isOpen={isOpenAllCouponCodeSlidebar}
                        setIsOpen={setIsOpenAllCouponCodeSlidebar}
                        ref={allCouponCodeSlidebarRef}
                        allCouponCodeData={allCouponCodeData}
                        handlePopupApplyButton={handlePopupApplyButton}
                        couponCode={couponCode}
                        handleRemoveCouponCode={handleRemoveCouponCode}
                    />
                </Suspense> */}
                {modal && (
                    <>
                        <div className={defaultClasses.checkout_modal}>
                            <CouponModal
                                discount={discountPrice}
                                categoryFlag={modal}
                                setCategoryFlag={setModal}
                            />
                        </div>
                    </>
                )}
                {/* {allCouponCodeData.length ? (
                <AllCouponCodeModal
                    allCouponCodeData={allCouponCodeData}
                    handlePopupApplyButton={handlePopupApplyButton}
                />
            ) : (
                <></>
            )} */}
            </Form>
        </div>
    );
};

export default CouponCode;
