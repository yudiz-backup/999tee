import React, { useMemo } from 'react';

import { mergeClasses } from '../../../classify';
import defaultClasses from '../../LegacyMiniCart/productOptions.css';

const BundleOptions = props => {
    const { options = [] } = props;
    const classes = mergeClasses(defaultClasses, props.classes);
    const displayOptions = useMemo(
        () =>
            options.map(({ label, values }) => {
                const key = `${label}`;

                const val = values.map(val => (
                    <div key={key} className={classes.optionLabel}>
                        <dd className={classes.optionValue}>
                            <span>{val.quantity + ' x '}</span>
                            {val.label ? val.label : val.value}
                        </dd>
                    </div>
                ));
                return (
                    <>
                        <dt className={classes.optionName}>{`${label} :`}</dt>
                        {val}
                    </>
                );
            }),
        [classes, options]
    );

    if (displayOptions.length === 0) {
        return null;
    }

    return <dl className={classes.options}>{displayOptions}</dl>;
};

export default BundleOptions;
