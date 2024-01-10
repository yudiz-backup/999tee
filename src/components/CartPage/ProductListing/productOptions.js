import React, { useMemo } from 'react';
import { mergeClasses } from '../../../classify';
import defaultClasses from '../../LegacyMiniCart/productOptions.css';

const ProductOptions = props => {
    const { options = [] } = props;
    const classes = mergeClasses(defaultClasses, props.classes);
    const displayOptions = useMemo(
        () =>
            options.map(({ label, values }) => {
                const key = `${label}`;
                const val = values[0];
                return (
                    <div key={key} className={classes.optionLabel}>
                        <dt className={classes.optionName}>{`${label} :`}</dt>
                        <dd className={classes.optionValue}>
                            {val.label ? val.label : val.value}
                        </dd>
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

export default ProductOptions;
