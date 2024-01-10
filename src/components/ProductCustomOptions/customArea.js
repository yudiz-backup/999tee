import React from 'react';

function CustomArea(props) {
    const {
        setCustomOptionId,
        setCustomOptionString,
        optionType,
        setCustomArea,
        setCustomOptionArray,
        setCustomOptionArray1
    } = props;
    if (optionType && optionType.areaValue) {
        return (
            <textarea
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
                    if (optionType.areaValue.price_type == 'FIXED') {
                        value
                            ? setCustomArea(optionType.areaValue.price)
                            : setCustomArea(0);
                    }
                    if (optionType.areaValue.price_type == 'FIXED') {
                        value
                            ? setCustomArea(optionType.areaValue.price)
                            : setCustomArea(0);
                    }
                }}
            />
        );
    } else {
        return null;
    }
}

export default CustomArea;
