import React, { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl';
import combine from '../../util/combineValidators';
import { isRequired/* , validateName */, validateNotNumber } from '../../util/formValidators';
import Field from '../Field';
import TextInput from '../TextInput';

export default function GooglePlaces(props) {

    const { setAddressData, address } = props

    const { formatMessage } = useIntl();

    const autoCompleteRef = useRef();
    const options = {
        componentRestrictions: { country: "in" },
        fields: ["address_components", "geometry", "icon", "name", "vicinity"],
        types: ["establishment"]
    };

    useEffect(() => {
        const input = document.getElementById("google_text_input");
        autoCompleteRef.current = new window.google.maps.places.Autocomplete(
            input,
            options
        );
        autoCompleteRef.current.addListener("place_changed", async function () {
            const place = await autoCompleteRef.current.getPlace();
            setAddressData(place)
        });
    }, []);

    return (
        <Field
            label={formatMessage({
                id:
                    'newAddress.StreetAddress',
                defaultMessage:
                    'Street Address*'
            })}
            required={true}
        >
            <TextInput
                field="street[0]"
                autoComplete="family-name"
                id="google_text_input"
                type="text"
                placeholder=''
                validate={combine([
                    validateNotNumber,
                    value => isRequired(
                        value,
                        'Street Address'
                    ),
                ])}
                validateOnBlur
                initialValue={address?.street?.split('\n')[0]}
            />
        </Field>
    )
}
