import React from 'react';
import { array, func } from 'prop-types';
import Option from './option';
import { useOptions } from '@magento/peregrine/lib/talons/ProductOptions/useOptions';

const Options = props => {
    const {
        classes,
        onSelectionChange,
        options,
        selectedValues = new Map(),
        product,
        sizeChartContent,
        errors = []
    } = props;

    const talonProps = useOptions({
        onSelectionChange,
        selectedValues
    });
    const { handleSelectionChange } = talonProps
    // Render a list of options passing in any pre-selected values.
    return options && options.map(option => (
        <>
            <Option
                {...option}
                classes={classes}
                key={option.attribute_id}
                onSelectionChange={handleSelectionChange}
                selectedValue={selectedValues.get(option.attribute_id)}
                product={product}
                sizeChartContent={sizeChartContent}
                errors={errors}
            />
        </>

    ));
};

Options.propTypes = {
    onSelectionChange: func,
    options: array.isRequired,
    selectedValues: array
};

export default Options;
