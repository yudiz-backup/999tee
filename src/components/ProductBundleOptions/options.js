import React from 'react';
import { FormattedMessage } from 'react-intl';
import defaultClasses from './options.css';

const Options = props => {
    const {
        data,
        setBundleOptions,
        bundleOptiondata,
        validate,
        setValid,
        valid
    } = props;
    // const [bundleOption,setBundleOption] = useState([]);
    const intlFormats = {
        USD: {
            symbol: '$',
            decimal: '.',
            groupDelim: ','
        },
        GBP: {
            symbol: '£',
            decimal: '.',
            groupDelim: ','
        },
        EUR: {
            symbol: '€',
            decimal: '.',
            groupDelim: ','
        }
    };
    const handleChange = async (el, type, id) => {
        let selectedValues = [];
        let optionsData = {};
        const { value, options } = el.target;
        if (type == 'select' || type == 'multi') {
            optionsData = JSON.parse(
                options[el.target.selectedIndex].getAttribute('options')
            );
        } else {
            optionsData = JSON.parse(el.target.getAttribute('options'));
        }

        var elementId = 'bundle-option-' + id + '-qty-input';
        if (optionsData && 'can_change_quantity' in optionsData) {
            document.getElementById(
                elementId
            ).disabled = !optionsData.can_change_quantity;
            document.getElementById(elementId).value = optionsData.quantity;
        } else {
            document.getElementById(elementId).disabled = true;
            document.getElementById(elementId).value = 0;
        }
        if (value) {
            if (type == 'select' || type == 'multi') {
                selectedValues = Array.from(options)
                    .filter(option => option.selected)
                    .map(option => option.value);
            } else if (type == 'radio') {
                selectedValues = [value];
            } else if (type == 'checkbox') {
                var checkboxes = document.getElementsByName('checkbox_' + id);
                var ii = 0;
                for (var checkbox of checkboxes) {
                    if (checkbox.checked) {
                        selectedValues[ii] = checkbox.value;
                        ii++;
                    }
                }
            }

            // await setBundleOption({ id: id, value: selectedValues });
            setBundleOptions({
                id: parseInt(id),
                value: selectedValues,
                quantity: 1
            });
        } else {
            var qtyOptions = bundleOptiondata;
            var i;
            for (i = 0; i < qtyOptions.length; i++) {
                if (qtyOptions[i].id == id) {
                    qtyOptions.splice(i, 1);
                    break;
                }
            }
            setBundleOptions(qtyOptions, false);
        }
    };

    const handleQtyChange = optionId => {
        var e = window.event;
        var qtyOptions = bundleOptiondata;
        var i;
        let optionObject = {};
        for (i = 0; i < qtyOptions.length; i++) {
            if (qtyOptions[i].id == optionId) {
                optionObject = qtyOptions[i];
                break;
            }
        }
        if (optionObject && optionObject.quantity) {
            optionObject.quantity = e.target.value;
            setBundleOptions(optionObject);
        }
    };

    const handleValidation = optionId => {
        var qtyOptions = bundleOptiondata;
        let optionObject = false;
        var i;
        for (i = 0; i < qtyOptions.length; i++) {
            if (qtyOptions[i].id == optionId) {
                optionObject = true;
                break;
            }
        }
        if (valid != optionObject) {
            setValid(optionObject);
        }
        return optionObject;
    };

    const formatPrice = value => {
        let price = '';
        if (value) {
            var currency = value?.price_range?.minimum_price?.final_price?.currency || "INR";
            let priceValue = value.price_range.minimum_price.final_price.value;
            priceValue = Math.round(priceValue * 100) / 100;
            if (intlFormats.hasOwnProperty(currency)) {
                price = '+' + intlFormats[currency].symbol + priceValue;
            } else {
                price = '+' + currency + priceValue;
            }
        }
        return price;
    };

    const options = data.options;

    return (
        <div
            className={
                defaultClasses.field +
                ' ' +
                defaultClasses.option +
                ' ' +
                'required'
            }
        >
            <label className={defaultClasses.label} htmlFor="bundle-option-5">
                <span>{data.title}</span>
                {data.required && (
                    <span className={defaultClasses.req_field}>{' *'}</span>
                )}
            </label>
            <div className={defaultClasses.control}>
                {data.type == 'select' && (
                    <select
                        id={data.option_id}
                        onBlur={e => handleChange(e, data.type, data.option_id)}
                    >
                        <option value="">Choose a selection...</option>
                        {options.map(v => {
                            if (!v.product) {
                                return null;
                            }
                            return (
                                <option
                                    key={v.id}
                                    value={v.id}
                                    options={JSON.stringify(v)}
                                >
                                    {v.label + ' ' + formatPrice(v.product)}
                                </option>
                            );
                        })}
                    </select>
                )}
                {data.type == 'multi' && (
                    <select
                        className={defaultClasses.multi_select}
                        id={data.option_id}
                        onBlur={e => handleChange(e, data.type, data.option_id)}
                        multiple
                    >
                        <option value="">Choose a selection...</option>
                        {options.map(v => {
                            if (!v.product) {
                                return null;
                            }
                            return (
                                <option
                                    key={v.id}
                                    value={v.id}
                                    options={JSON.stringify(v)}
                                >
                                    {v.label + ' ' + formatPrice(v.product)}
                                </option>
                            );
                        })}
                    </select>
                )}
                {data.type == 'radio' && (
                    <div className={defaultClasses.bundle_input_wrap}>
                        {options.map((v, i) => {
                            if (!v.product) {
                                return null;
                            }
                            return (
                                <div
                                    className={
                                        defaultClasses.bundle_input_inner
                                    }
                                    key={v.id + i}
                                >
                                    <input
                                        type="radio"
                                        name={data.option_id}
                                        id={data.option_id + v.id}
                                        value={v.id}
                                        options={JSON.stringify(v)}
                                        onChange={e =>
                                            handleChange(
                                                e,
                                                data.type,
                                                data.option_id
                                            )
                                        }
                                    />
                                    <label
                                        className={
                                            defaultClasses.bundle_input_label
                                        }
                                        htmlFor={data.option_id + v.id}
                                    >
                                        {v.label + ' ' + formatPrice(v.product)}
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                )}
                {data.type == 'checkbox' && (
                    <div
                        className={defaultClasses.bundle_input_wrap}
                        id={data.option_id}
                    >
                        {options.map((v, i) => {
                            if (!v.product) {
                                return null;
                            }
                            return (
                                <div
                                    className={
                                        defaultClasses.bundle_input_inner
                                    }
                                    key={v.id + i}
                                >
                                    <input
                                        type="checkbox"
                                        name={'checkbox_' + data.option_id}
                                        id={data.option_id + v.id}
                                        key={v.id + i}
                                        value={v.id}
                                        options={JSON.stringify(v)}
                                        onChange={e =>
                                            handleChange(
                                                e,
                                                data.type,
                                                data.option_id
                                            )
                                        }
                                    />
                                    <label
                                        className={
                                            defaultClasses.bundle_input_label
                                        }
                                        htmlFor={data.option_id + v.id}
                                    >
                                        {v.label + ' ' + formatPrice(v.product)}
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                )}

                {validate &&
                    data.required &&
                    !handleValidation(data.option_id) && (
                        <div className={defaultClasses.error_msg}>
                            {'This is a required field.'}
                        </div>
                    )}
                <div className={defaultClasses.nested}>
                    <div
                        className={
                            defaultClasses.field +
                            ' ' +
                            defaultClasses.qty +
                            ' ' +
                            defaultClasses.qty_holder
                        }
                    >
                        <label
                            className={defaultClasses.label}
                            htmlFor={
                                'bundle-option-' + data.option_id + '-qty-input'
                            }
                        >
                            <span>
                                <FormattedMessage
                                    id={'cartOptions.quantityTitle'}
                                    defaultMessage={' Quantity'}
                                />
                            </span>
                        </label>
                        <div className={defaultClasses.control}>
                            <input
                                disabled="disabled"
                                id={
                                    'bundle-option-' +
                                    data.option_id +
                                    '-qty-input'
                                }
                                defaultValue="0"
                                onChange={() => handleQtyChange(data.option_id)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Options;
