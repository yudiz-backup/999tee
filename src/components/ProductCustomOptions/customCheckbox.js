import React from 'react';
import productClasses from '../ProductFullDetail/productFullDetail.css';

function CustomCheckbox(props) {
    const {
        optionType,
        setCustomOptionId,
        setCustomOptionString,
        setCustomPercCheckbox,
        setCustomPriceCheckbox,
        customOptionId,
        customOptionString,
        customPrice,
        customPercCheckbox,
        setCustomOptionArray,
        setCustomOptionArray1
    } = props;
    return (
        <>
            {optionType &&
                optionType.value &&
                optionType.value.map((val, ind) => {
                    if (ind == 0 && !customOptionId && !customOptionString) {
                        setCustomOptionId(optionType.option_id);
                        setCustomOptionString(val.option_type_id);
                    }
                    return (
                        <>
                            <input
                                type="checkbox"
                                name="customOption"
                                id="customOption"
                                value={val.option_type_id}
                                onClick={e => {
                                    const { value } = e.target;
                                    e.target.checked &&
                                        val.price_type == 'FIXED' &&
                                        (setCustomOptionArray(prevState => {
                                            return setCustomOptionArray1(
                                                prevState,
                                                optionType.option_id,
                                                value,
                                                optionType.title
                                            );
                                        }),
                                        setCustomOptionId(optionType.option_id),
                                        setCustomOptionString(e.target.value),
                                        setCustomPriceCheckbox(
                                            customPrice + val.price
                                        ));
                                    e.target.checked &&
                                        val.price_type == 'PERCENT' &&
                                        (setCustomOptionId(
                                            optionType.option_id
                                        ),
                                        setCustomOptionString(e.target.value),
                                        setCustomPercCheckbox(
                                            customPercCheckbox + val.price / 100
                                        ));
                                    !e.target.checked &&
                                        val.price_type == 'PERCENT' &&
                                        (setCustomOptionId(
                                            optionType.option_id
                                        ),
                                        setCustomOptionString(e.target.value),
                                        setCustomPercCheckbox(
                                            customPercCheckbox - val.price / 100
                                        ));
                                    !e.target.checked &&
                                        val.price_type == 'FIXED' &&
                                        (setCustomOptionId(
                                            optionType.option_id
                                        ),
                                        setCustomOptionString(e.target.value),
                                        setCustomPriceCheckbox(
                                            customPrice - val.price
                                        ));
                                }}
                            />
                            <label className={productClasses.option_heading}>
                                <span>{`${val.title} + ${val.price}`}</span>
                            </label>
                            <br />
                        </>
                    );
                })}
        </>
    );
}

export default CustomCheckbox;
