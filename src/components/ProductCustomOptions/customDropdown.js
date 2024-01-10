import React from 'react';
import productClasses from '../ProductFullDetail/productFullDetail.css';

function CustomDropdown(props) {
    const {
        optionType,
        setCustomOptionId,
        setCustomOptionString,
        setCustomPriceDropdown,
        setCustomPercDropDown,
        customOptionId,
        setCustomOptionArray,
        setCustomOptionArray1
    } = props;
    return (
        <div className={productClasses.field_wrap}>
            <select
                defaultValue={0}
                id="customOptions"
                onBlur={el => {
                    const { value } = el.target;

                    setCustomOptionArray(prevState => {
                        return setCustomOptionArray1(
                            prevState,
                            optionType.option_id,
                            value,
                            optionType.title
                        );
                    });
                    setCustomOptionId(optionType.option_id);
                    setCustomOptionString(el.target.value);
                    var test = optionType.value.filter(
                        ele => ele.option_type_id == el.target.value
                    );
                    if (test[0].price_type == 'FIXED') {
                        setCustomPriceDropdown(test[0].price);
                    }
                    if (test[0].price_type == 'PERCENT') {
                        setCustomPercDropDown(test[0].price / 100);
                    }
                }}
                className={productClasses.custom_options}
            >
                {
                    <option disabled value={0}>
                        please select option
                    </option>
                }
                {optionType &&
                    optionType.value &&
                    optionType.value.map((val, ind) => {
                        if (
                            ind == 0 &&
                            !customOptionId &&
                            !customOptionString
                        ) {
                            setCustomOptionId(optionType.option_id);
                            setCustomOptionString(val.option_type_id);
                        }
                        return (
                            <option
                                key={ind}
                                value={val.option_type_id}
                                data-price={val.price}
                                id={'customOptions1'}
                            >
                                {val.title + ' + ' + val.price}
                            </option>
                        );
                    })}
            </select>
        </div>
    );
}

export default CustomDropdown;
