import React, { useState, useEffect, useRef } from 'react'
import { mergeClasses } from '../../classify';
import defaultClasses from './cartPage.css';
import Checkbox from '../Checkbox/checkbox.js';
import { Form } from 'informed';
import { FormattedMessage, useIntl } from 'react-intl';
import Field from '../Field';
import InputRange from 'react-input-range';
import 'react-input-range/lib/css/index.css';
import LoadingIndicator from '../LoadingIndicator/indicator';
export default function RewardPoints(props) {
    const {
        rewardPrice,
        // cartDetails,
        rewardCalculation,
        // cartId,
        value: rangeValue,
        onChange: onChangeRange,
        calculation,
        data,
        isMountedCartPage
    } = props

    const rewardPointData = data && data.customer && data.customer.mp_reward
    const point_balance = rewardPointData && rewardPointData.point_balance

    const pointValues = rewardPrice &&
        rewardPrice.MpRewardConfig &&
        rewardPrice.MpRewardConfig.spending &&
        rewardPrice.MpRewardConfig.spending.maximum_point_per_order

    const maximum_point_type = rewardPrice &&
        rewardPrice.MpRewardConfig &&
        rewardPrice.MpRewardConfig.spending &&
        rewardPrice.MpRewardConfig.spending.maximum_point_type

    const maximum_point_per_order = rewardPrice &&
        rewardPrice.MpRewardConfig &&
        rewardPrice.MpRewardConfig.spending &&
        rewardPrice.MpRewardConfig.spending.maximum_point_per_order

    const exchange_rates = rewardPointData &&
        rewardPointData.current_exchange_rates &&
        rewardPointData.current_exchange_rates.spend_points

    const practagePointValue = (calculation && calculation.subtotal) * maximum_point_per_order / 100 * +exchange_rates

    const [isMaxCheckboxSelected, setIsMaxCheckboxSelected] = useState(sessionStorage.getItem('isMaxCheckboxSelected') === 'true' ? true : false)
    const isMounted = useRef(false)
    const classes = mergeClasses(defaultClasses, props.classes);
    const { formatMessage } = useIntl();

    useEffect(() => {
        if ((!sessionStorage.getItem('rangeValue') && rangeValue) || (sessionStorage.getItem('rangeValue'))) {
            sessionStorage.setItem('rangeValue', +rangeValue)
        }
    }, [rangeValue])
    // useEffect(() => {
    //     if ((window.location.pathname === '/checkout' || window.location.pathname === '/cart') && (pointValues || rewardPointData)) {
    //         if (sessionStorage.getItem('isMaxCheckboxSelected') === 'true') {
    //             setIsMaxCheckboxSelected(true)
    //             rewardCalculation({
    //                 variables: {
    //                     // cart_id: cartDetails === undefined ? localStorage.getItem('cart_id') : cartDetails.id,
    //                     cart_id: localStorage.getItem('cart_id'),
    //                     points: pointValues === 0 || pointValues === '' ? rewardPointData && rewardPointData.point_balance : +pointValues,
    //                     rule_id: "rate",
    //                 }
    //             })

    //         }
    //         else if (sessionStorage.getItem('rangeValue')) {
    //             rewardCalculation({
    //                 variables: {
    //                     // cart_id: cartDetails === undefined ? cartId : cartDetails.id,
    //                     cart_id: localStorage.getItem('cart_id'),
    //                     points: +sessionStorage.getItem('rangeValue'),
    //                     rule_id: "rate",
    //                 }
    //             })
    //         }
    //     }
    // }, [window.location.pathname, pointValues, rewardPointData])

    useEffect(() => {
        const ele = document.querySelector('.buble');
        if (ele) {
            ele.style.left = `${Number(rangeValue / 4)}px`;
        }
    })

    useEffect(() => {
        if (isMounted.current) {
            sessionStorage.setItem('isMaxCheckboxSelected', isMaxCheckboxSelected)
            if (isMaxCheckboxSelected) {
                sessionStorage.setItem('isMaxCheckboxSelected', isMaxCheckboxSelected)
                onChangeRange(pointValues === 0 || pointValues === '' ? pointValues : rewardPointData?.point_balance)
                rewardCalculation({
                    variables: {
                        // cart_id: cartDetails === undefined ? cartId : cartDetails.id,
                        cart_id: localStorage.getItem('cart_id'),

                        points: pointValues === 0 || pointValues === '' ? pointValues : rewardPointData?.point_balance,
                        rule_id: "rate",
                    }
                })
            } else if (!isMountedCartPage.current && isMaxCheckboxSelected === false) {
                // if(isMaxCheckboxSelected === false) {
                onChangeRange(+"0")
                rewardCalculation({
                    variables: {
                        // cart_id: cartDetails === undefined ? cartId : cartDetails.id,
                        cart_id: localStorage.getItem('cart_id'),

                        points: +"0",
                        rule_id: "rate",
                    }
                })
                // }
            }
        }
        isMounted.current = true
    }, [isMaxCheckboxSelected, rewardPointData])

    return <>
        {pointValues <= point_balance ? <div className={classes.spend}>
            <h6 className={classes.totalLabel}>
                <FormattedMessage
                    id={'rewardPoints.spendlabel'}
                    defaultMessage={'Spend your points'}
                />
            </h6>
            <p>
                <FormattedMessage
                    id={'rewardPoints.spendlabelPoint'}
                    defaultMessage={`you have ${rewardPointData?.point_balance} points`}
                />
            </p>
            {/* <b>
                <p>
                    <FormattedMessage
                        id={'rewardPoints.spendlabelspend'}
                        defaultMessage={'Choose how many points to spend'}
                    />
                </p>
            </b> */}
            <p>
                <FormattedMessage
                    id={'rewardPoints.spendlabeldiscount'}
                    defaultMessage={rewardPointData &&
                        rewardPointData.current_exchange_rates &&
                        rewardPointData.current_exchange_rates.spending_rate}
                />
            </p>
            {point_balance ?
                <Form
                    className={classes.form}
                >
                    <div className={classes.sliderParent}>
                        <div className={classes.rangenumber}>
                            <div className="buble">
                                {/* {pointminiValues} */}
                                0
                            </div>
                            <div className="buble">
                                {
                                    maximum_point_type === 0 ?
                                        (
                                            pointValues === 0 ||
                                                pointValues === '' ?
                                                point_balance >= (calculation && calculation.subtotal + discount) * +exchange_rates ? (calculation && calculation.subtotal + discount) * +exchange_rates : point_balance :
                                                pointValues
                                        )
                                        :
                                        (
                                            pointValues === 0 ||
                                                pointValues === '' ?
                                                point_balance >= (calculation && calculation.subtotal) * +exchange_rates ? (calculation && calculation.subtotal) * +exchange_rates : point_balance :
                                                point_balance >= practagePointValue ? practagePointValue : point_balance
                                        )
                                }
                            </div>
                        </div>
                        {/* <input
                            type="range"
                            min="0"
                            max={
                                maximum_point_type === 0 ?
                                    (
                                        pointValues === 0 ||
                                            pointValues === '' ?
                                            point_balance >= (calculation && calculation.subtotal + (discount || 0)) * +exchange_rates ? (calculation && calculation.subtotal + discount) * +exchange_rates : point_balance :
                                            pointValues
                                    )
                                    :
                                    (
                                        pointValues === 0 ||
                                            pointValues === '' ?
                                            point_balance >= (calculation && calculation.subtotal + (discount || 0)) * +exchange_rates ? (calculation && calculation.subtotal + (discount || 0)) * +exchange_rates : point_balance :
                                            point_balance >= practagePointValue ? practagePointValue : point_balance
                                    )
                            }
                            onChange={({ target: { value: radius } }) => {
                                onChangeRange(radius);
                                if (radius < practagePointValue) {
                                    setIsMaxCheckboxSelected(false)
                                }

                            }}
                            value={rangeValue}
                            onMouseUp={(e) => {
                                rewardCalculation({
                                    variables: {
                                        // cart_id: cartDetails === undefined ? cartId : cartDetails.id,
                                        cart_id: localStorage.getItem('cart_id'),
                                        points: +e.target.value,
                                        rule_id: "rate",
                                    }
                                })
                            }
                            }
                            className={classes.hue_slider} /> */}
                    </div>
                    <div className={classes.single_dote_range}>
                        <InputRange
                            minValue="0"
                            maxValue={
                                maximum_point_type === 0 ?
                                    (
                                        pointValues === 0 ||
                                            pointValues === '' ?
                                            point_balance >= (calculation && calculation.subtotal + (discount || 0)) * +exchange_rates ? (calculation && calculation.subtotal + discount) * +exchange_rates : point_balance :
                                            pointValues
                                    )
                                    :
                                    (
                                        pointValues === 0 ||
                                            pointValues === '' ?
                                            point_balance >= (calculation && calculation.subtotal + (discount || 0)) * +exchange_rates ? (calculation && calculation.subtotal + (discount || 0)) * +exchange_rates : point_balance :
                                            point_balance >= practagePointValue ? practagePointValue : point_balance
                                    )
                            }
                            value={rangeValue}
                            onChange={value => {
                                onChangeRange(value);
                                if (value < practagePointValue) {
                                    setIsMaxCheckboxSelected(false)
                                }
                            }}
                            onChangeComplete={(value) => {
                                rewardCalculation({
                                    variables: {
                                        // cart_id: cartDetails === undefined ? cartId : cartDetails.id,
                                        cart_id: localStorage.getItem('cart_id'),
                                        points: +value,
                                        rule_id: "rate",
                                    }
                                })
                            }
                            }
                            className={classes.hue_slider}
                        />
                    </div>

                    {+rangeValue !== 0 &&
                        <div className={"form-group" + ' ' + classes.spendpoint} >
                            <Field
                                label={formatMessage({
                                    id: 'rewardPoints.spendpoint',
                                    defaultMessage: 'You Will Spend'
                                })}
                            >
                                <span
                                    // className={classes.inputSpendPoints}
                                    onChange={({ target: { value: radius } }) => {
                                        onChangeRange(radius);
                                    }}
                                >   {isMaxCheckboxSelected && rangeValue < practagePointValue ? rangeValue : !isMaxCheckboxSelected ? rangeValue : practagePointValue} </span>
                                <span>{+rangeValue === 1 ? "Point" : "Points"}</span>
                            </Field>
                        </div>}
                    <Checkbox field="isPoint"
                        label={
                            <FormattedMessage
                                id={'rewardPoints.spendcheckbox'}
                                defaultMessage={'Maximize my discount with points'}
                            />
                        }
                        fieldState={{ value: isMaxCheckboxSelected }}
                        onValueChange={
                            value => {
                                setIsMaxCheckboxSelected(value)
                                if (!value) {
                                    isMountedCartPage.current = false
                                }
                            }
                        }
                        isDisplayOwnLabel={true}
                    />
                </Form> : <LoadingIndicator/>}
        </div> : ""}
    </>
}
