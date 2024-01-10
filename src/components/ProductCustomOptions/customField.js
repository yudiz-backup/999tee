import React from 'react';

function CustomField(props) {
    const {
        setCustomOptionId,
        setCustomOptionString,
        optionType,
        setCustomField,
        setCustomOptionArray,
        setCustomOptionArray1
    } = props;

    if (optionType && optionType.textValue) {
        return (
            <input
                type="text"
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
                    setCustomOptionString(value);
                    if (optionType.textValue.price_type == 'FIXED') {
                        value
                            ? setCustomField(optionType.textValue.price)
                            : setCustomField(0);
                    }
                    if (optionType.textValue.price_type == 'PERCENTAGE') {
                        value
                            ? setCustomField(optionType.textValue.price / 100)
                            : setCustomField(0);
                    }
                }}
            />
        );
    } else {
        return null;
    }
}

export default CustomField;
