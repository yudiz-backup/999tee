import React, { useEffect } from 'react';
import { func, shape, string } from 'prop-types';
import { useRegion } from '@magento/peregrine/lib/talons/Region/useRegion';

import { mergeClasses } from '../../classify';
import Field from '../Field';
import Select from '../Select';
import TextInput from '../TextInput';
import defaultClasses from './region.css';
import { GET_REGIONS_QUERY } from './region.gql';
// import { useCountry } from '@magento/peregrine/lib/talons/Country/useCountry';

/**
 * Form component for Region that is seeded with backend data.
 *
 * @param {string} props.optionValueKey - Key to use for returned option values. In a future release, this will be removed and hard-coded to use "id" once GraphQL has resolved MC-30886.
 */
const Region = props => {
    const {
        classes: propClasses,
        fieldInput,
        fieldSelect,
        label,
        optionValueKey,
        countryCode,
        setRegions = () => {},
        regions: propsRegion,
        initialValue,
        ...inputProps
    } = props;
    
    // const countryTalonProps = useCountry();
    // const { countries } = countryTalonProps;
   
    const talonProps = useRegion({
        countryCodeField: countryCode,
        fieldInput,
        fieldSelect,
        optionValueKey,
        queries: { getRegionsQuery: GET_REGIONS_QUERY }
    });
    const { loading, regions } = talonProps;

    const classes = mergeClasses(defaultClasses, propClasses);
    const regionProps = {
        classes,
        disabled: loading,
        ...inputProps
    };

    useEffect(() => {
        if(JSON.stringify(propsRegion) !== JSON.stringify(regions)) {
            setRegions(regions)
        }
    }, [regions])

    const regionField =
        regions.length || loading ? (
            <Select {...regionProps} field={fieldSelect} items={regions} initialValue={initialValue} />
        ) : (
            <TextInput {...regionProps} field={fieldInput} />
        );

    const fieldId = regions.length ? fieldSelect : fieldInput;

    return (
        <Field id={fieldId} label={label} classes={{ root: classes.root }}>
            {regionField}
        </Field>
    );
};

export default Region;

Region.defaultProps = {
    fieldInput: 'region',
    fieldSelect: 'region',
    label: 'State*',
    optionValueKey: 'code'
};

Region.propTypes = {
    classes: shape({
        root: string
    }),
    fieldInput: string,
    fieldSelect: string,
    label: string,
    optionValueKey: string,
    validate: func,
    initialValue: string
};
