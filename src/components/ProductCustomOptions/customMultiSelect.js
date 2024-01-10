import React from 'react';
import productClasses from '../ProductFullDetail/productFullDetail.css';

function CustomMultiSelect(props) {
    const {
        optionType,
        setCustomOptionId,
        setCustomOptionString,
        setCustomPriceMultiple,
        customOptionId,
        customOptionString,
        setCustomOptionArray1,
        setCustomOptionArray
    } = props;
    return (
        <>
            {optionType &&
                optionType.value &&
                optionType.value.map((val, ind) => {
                    if (ind == 0 && !customOptionId && !customOptionString) {
                        setCustomOptionId(e.option_id);
                        setCustomOptionString(val.option_type_id);
                    }
                    return (
                        <>
                            <div
                                className={
                                    productClasses.field_wrap +
                                    ' ' +
                                    productClasses.radio_custom_option
                                }
                            >
                                <input
                                    type="radio"
                                    name="customOptionMultiple"
                                    id={val.option_type_id}
                                    value={val.option_type_id}
                                    onChange={e => {
                                        const { value } = e.target;
                                        setCustomOptionArray(prevState => {
                                            return setCustomOptionArray1(
                                                prevState,
                                                optionType.option_id,
                                                value,
                                                optionType.title
                                            );
                                        });
                                        val.price_type == 'FIXED' &&
                                            (setCustomOptionId(
                                                optionType.option_id
                                            ),
                                            setCustomOptionString(
                                                e.target.value
                                            ),
                                            setCustomPriceMultiple(val.price));
                                    }}
                                />
                                <label
                                    className={
                                        productClasses.radio_option_heading
                                    }
                                >
                                    <span>{`${val.title} + ${val.price}`}</span>
                                </label>
                                <br />
                            </div>
                        </>
                    );
                })}
        </>
    );
}

export default CustomMultiSelect;
