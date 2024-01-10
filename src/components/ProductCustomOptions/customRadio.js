import React from 'react';
import productClasses from '../ProductFullDetail/productFullDetail.css';

function CustomRadio(props) {
    const {
        setCustomOptionId,
        setCustomOptionString,
        setCustomPriceRadio,
        setCustomPricePercentRadio,
        optionType,
        customOptionId,
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
                        <div
                            className={
                                productClasses.field_wrap +
                                ' ' +
                                productClasses.radio_custom_option
                            }
                            key={optionType.option_id + val.option_type_id}
                        >
                            <input
                                type="radio"
                                name="customOptionRadio"
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
                                    setCustomOptionId(optionType.option_id);
                                    setCustomOptionString(e.target.value);
                                    if (val.price_type == 'FIXED') {
                                        setCustomPriceRadio(val.price);
                                    }
                                    if (val.price_type == 'PERCENT') {
                                        setCustomPricePercentRadio(
                                            val.price / 100
                                        );
                                    }
                                }}
                            />
                            <label
                                className={productClasses.radio_option_heading}
                                htmlFor={val.option_type_id}
                            >
                                <span>{`${val.title} + ${val.price}`}</span>
                            </label>
                        </div>
                    );
                })}
        </>
    );
}

export default CustomRadio;
