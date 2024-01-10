import React, { useMemo } from 'react';
import { arrayOf, shape, string } from 'prop-types';

import { mergeClasses } from '../../classify';

import defaultClasses from './productOptions.css';

const ProductOptions = props => {
    const { options = [] } = props;

    const classes = mergeClasses(defaultClasses, props.classes);
    const displayOptions = useMemo(
        () =>
            options.map((option) => {
                // { option_label, value_label }
                const key = `${option?.option_label ? option?.option_label : option?.value_label}${option?.value_label ? option?.value_label : option?.option_label}`;

                return (
                    <div key={key} className={classes.optionLabel}>
                        <dt
                            className={classes.optionName}
                        ></dt>
                        <dd className={classes.optionValue}>{option ? option?.value_label : option?.option_label}</dd>
                    </div>
                );
            }),
        [classes, options]
    );

    if (displayOptions.length === 0) {
        return null;
    }

    return <dl className={classes.options}>{displayOptions}</dl>;
};

ProductOptions.propTypes = {
    options: arrayOf(
        shape({
            label: string,
            value: string
        })
    )
};

export default ProductOptions;
