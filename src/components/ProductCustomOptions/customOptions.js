import React from 'react';
import CustomCheckbox from './customCheckbox';
import CustomDropdown from './customDropdown';
import CustomMultiSelect from './customMultiSelect';
import CustomRadio from './customRadio';
import CustomField from './customField';
import CustomArea from './customArea';
import productClasses from '../ProductFullDetail/productFullDetail.css';

function CustomOptions(props) {
    const { options, classes } = props;

    const setCustomOptionArray1 = (prevState, optionType, value, type1) => {
        let flagPointer = false;
        Object.keys(prevState).forEach(eIndex => {
            if (prevState[eIndex][type1]) {
                flagPointer = eIndex;
            }
        });
        if (flagPointer !== false) {
            prevState.splice(flagPointer, 1);
        }

        return [
            {
                [type1]: {
                    id: optionType,
                    value_string: value
                }
            },
            ...prevState
        ];
    };
    return (
        <>
            {options.map(optionType => {
                return (
                    <div className={classes.options} key={optionType.option_id}>
                        <h4 className={productClasses.option_heading}>
                            {optionType && optionType.title}
                            {optionType && optionType.required && '*'}
                        </h4>

                        {true &&
                            options.length > 0 &&
                            optionType.__typename ==
                                'CustomizableDropDownOption' && (
                                <CustomDropdown
                                    {...props}
                                    optionType={optionType}
                                    setCustomOptionArray1={
                                        setCustomOptionArray1
                                    }
                                />
                            )}

                        {true &&
                            options.length > 0 &&
                            optionType.__typename ==
                                'CustomizableFieldOption' && (
                                <>
                                    <CustomField
                                        {...props}
                                        optionType={optionType}
                                        setCustomOptionArray1={
                                            setCustomOptionArray1
                                        }
                                    />
                                </>
                            )}
                        {true &&
                            options.length > 0 &&
                            optionType.__typename ==
                                'CustomizableAreaOption' && (
                                <>
                                    <CustomArea
                                        {...props}
                                        optionType={optionType}
                                        setCustomOptionArray1={
                                            setCustomOptionArray1
                                        }
                                    />
                                </>
                            )}

                        {true &&
                            options.length > 0 &&
                            optionType.__typename ==
                                'CustomizableRadioOption' && (
                                <CustomRadio
                                    {...props}
                                    optionType={optionType}
                                    setCustomOptionArray1={
                                        setCustomOptionArray1
                                    }
                                />
                            )}

                        {true &&
                            options.length > 0 &&
                            optionType.__typename ==
                                'CustomizableCheckboxOption' && (
                                <CustomCheckbox
                                    {...props}
                                    optionType={optionType}
                                    setCustomOptionArray1={
                                        setCustomOptionArray1
                                    }
                                />
                            )}

                        {true &&
                            options.length > 0 &&
                            optionType.__typename ==
                                'CustomizableMultipleOption' && (
                                <CustomMultiSelect
                                    {...props}
                                    optionType={optionType}
                                    setCustomOptionArray1={
                                        setCustomOptionArray1
                                    }
                                />
                            )}
                    </div>
                );
            })}
        </>
    );
}

export default CustomOptions;
