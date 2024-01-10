import React, { useMemo } from 'react';
import {
    arrayOf,
    func,
    number,
    object,
    oneOfType,
    shape,
    string
} from 'prop-types';

import { mergeClasses } from '../../classify';
import getOptionType from './getOptionType';
import SwatchList from './swatchList';
import TileList from './tileList';
import defaultClasses from './option.css';
import { useOption } from '@magento/peregrine/lib/talons/ProductOptions/useOption';
import SizeChart from '../ProductFullDetail/SizeChart';

const getItemKey = ({ value_index }) => value_index;

// TODO: get an explicit field from the API
// that identifies an attribute as a swatch
const getListComponent = (attribute_code, values) => {
    const optionType = getOptionType({ attribute_code, values });

    return optionType === 'swatch' ? SwatchList : TileList;
};

const Option = props => {
    const {
        attribute_code,
        attribute_id,
        label,
        onSelectionChange,
        selectedValue,
        values,
        product,
        sizeChartContent,
        errors = []
    } = props;

    const error = errors.find(item => item.attributeId === attribute_id)
    const errorMessage = error && error.message ? error.message : ''

    const talonProps = useOption({
        attribute_id,
        label,
        onSelectionChange,
        selectedValue,
        values
    });

    const {
        handleSelectionChange,
        initialSelection,
        selectedValueLabel,
        selectedValueDescription
    } = talonProps;

    const ValueList = useMemo(() => getListComponent(attribute_code, values), [
        attribute_code,
        values
    ]);

    const classes = mergeClasses(defaultClasses, props.classes);

    return (
        <div className={classes.root}>
            <div className={classes.title}>
                <div className={classes.label_value_wrapper}>
                    <span className={classes.label_title}>{label} : </span>
                    <div className={classes.selection}>
                        <span className={classes.selectionLabel}>
                            {selectedValueLabel}
                        </span>
                        <span className={classes.selectionLabel}>
                            {selectedValueDescription}
                        </span>
                    </div>
                </div>
                <div>
                    {product &&
                        product.id &&
                        sizeChartContent
                        &&

                        attribute_code !== 'color'
                        ? (
                            <SizeChart
                                sizeChartContent={sizeChartContent}
                            />
                        ) : (
                            <></>
                        )}
                </div>
            </div>
            <ValueList
                getItemKey={getItemKey}
                selectedValue={initialSelection}
                items={values}
                onSelectionChange={handleSelectionChange}
            />
            {errorMessage ? (
                <div className={classes.error_message}>{errorMessage}</div>
            ) : (<></>)}
        </div>
    );
};

Option.propTypes = {
    attribute_code: string.isRequired,
    attribute_id: string,
    classes: shape({
        root: string,
        title: string
    }),
    label: string.isRequired,
    onSelectionChange: func,
    selectedValue: oneOfType([number, string]),
    values: arrayOf(object).isRequired
};

export default Option;
