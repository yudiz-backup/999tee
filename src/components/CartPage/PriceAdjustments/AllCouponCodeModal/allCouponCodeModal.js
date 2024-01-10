import React, { useState } from 'react';
import Button from '../../../Button';
import Icon from '../../../Icon';
import { X as ClearIcon } from 'react-feather';
import RadioGroup from '../../../RadioGroup';
import { mergeClasses } from '../../../../classify';
import defaultClasses from './allCouponCodeModal.css';

const AllCouponCodeModal = props => {
    const { allCouponCodeData = [], handlePopupApplyButton = () => {} } = props;

    const [selectedCouponCode, setSelectedCouponCode] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const classes = mergeClasses(defaultClasses);
    const radioGroupClasses = {
        radioLabel: classes.radioContents,
        root: classes.radioRoot
    };

    return (
        <div
            className={`${classes.coupon_code_modal_main_wrappper} modal fade`}
            id="staticBackdrop"
            data-backdrop="static"
            data-keyboard="false"
            tabindex="-1"
            aria-labelledby="staticBackdropLabel"
            aria-hidden="true"
        >
            <div className={'modal-dialog modal-dialog-centered'}>
                <div className={'modal-content'}>
                    <div className={classes.header + ' ' + "modal-header"}>
                        <span className="modal-title" id="staticBackdropLabel">
                            Coupon Code
                        </span>
                        <div className={'text-right'}>
                            <button type="submit" data-dismiss="modal">
                                <Icon src={ClearIcon} size={30} />
                            </button>
                        </div>
                    </div>
                    {errorMessage ? <div className={classes.error_message}>{errorMessage}</div> : <></>}
                    <div className={classes.couponCode_radio}>
                        <RadioGroup
                            classes={radioGroupClasses}
                            field="method"
                            items={allCouponCodeData.map(item => {
                                return {
                                    label: (
                                        <div>
                                            <span className={classes.coupon_code}>{item.couponCode}</span>
                                            <span>
                                                {` : ${item.couponDescription}`}
                                            </span>
                                        </div>
                                    ),
                                    value: item.couponCode
                                };
                            })}
                            onValueChange={value => {
                                setSelectedCouponCode(value);
                                if (value) {
                                    setErrorMessage('');
                                }
                            }}
                        />
                    </div>
                    <div className={'modal-footer mr-auto w-100 justify-content-start'}>
                        <Button
                            priority="high"
                            onClick={() => {
                                if (!selectedCouponCode) {
                                    setErrorMessage('Select Coupon Code');
                                } else {
                                    handlePopupApplyButton(selectedCouponCode)
                                }
                            }}
                        >
                            Apply
                        </Button>
                        <Button type="reset" data-dismiss="modal">
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllCouponCodeModal;
