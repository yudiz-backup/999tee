import React, { useState } from 'react';
import Options from './options';
import defaultClasses from './options.css';
import { FormattedMessage } from 'react-intl';
import Button from '@magento/venia-ui/lib/components/Button';

const BundleOptions = props => {
    const {
        options,
        product,
        handleAddToCart,
        isAddToCartDisabled,
        showBundleOptions,
        setShowBundleOptions,
        handleSetOverlay
    } = props;
    const [bundleOptiondata, setBundleOptiondata] = useState([]);
    const [validate, setValidate] = useState(false);

    const customItems = [];
    const setBundleOptions = (options, mergeData = true) => {
        if (mergeData) {
            const mergedArray = merge(bundleOptiondata, [options], 'id');
            setBundleOptiondata(mergedArray);
        } else {
            setBundleOptiondata(options);
        }
    };
    const merge = (a, b, prop) => {
        var reduced = a.filter(function (aitem) {
            return !b.find(function (bitem) {
                return aitem[prop] === bitem[prop];
            });
        });
        return reduced.concat(b);
    };

    const handleSubmit = async () => {
        setValidate(true);
        await handleAddToCart({
            quantity: document.getElementById('bundle-option-qty-input').value,
            bundleOptionsVar: bundleOptiondata
        });
        await closePopup();
    };

    const closePopup = () => {
        if (showBundleOptions) {
            setShowBundleOptions(false);
        }
        handleSetOverlay(false);
        document
            .getElementsByTagName('html')[0]
            .setAttribute('data-scroll-lock', 'false');
    };

    customItems.push(
        <div
            className={defaultClasses.custom_bundle_product_inner_Wrap}
            key={'customised_options'}
        >
            <h2
                className={
                    defaultClasses.bundle_head_label + ' ' + 'text-left mt-4'
                }
            >
                Your Customization
            </h2>
            <div className={defaultClasses.control + ' ' + 'mb-3'}>
                <label
                    htmlFor="bundle-option-qty-input"
                    className={defaultClasses.label}
                >
                    <span>Quantity</span>
                </label>
                <div className={defaultClasses.control}>
                    <input
                        className={defaultClasses.qty_input}
                        id="bundle-option-qty-input"
                        defaultValue="1"
                    />
                </div>
            </div>
            <div className={'text-center mb-4'}>
                {product && product.stock_status == 'IN_STOCK' && (
                    <Button
                        priority="high"
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isAddToCartDisabled}
                    >
                        <FormattedMessage
                            id={'ProductFullDetail.addToCart'}
                            defaultMessage={'Add to Cart'}
                        />
                    </Button>
                )}
            </div>
        </div>
    );

    return (
        <div className={defaultClasses.bundle_product_inner_Wrap}>
            <button
                className={defaultClasses.close_popup + ' ' + 'text-right'}
                onClick={closePopup}
            >
                <span>
                    <img
                        src="/cenia-static/images/cross.png"
                        alt="icon"
                        width="30"
                    />
                </span>
            </button>
            <span className={defaultClasses.bundle_head_label}>
                {'Customize ' + product.name}
            </span>
            <div
                className={
                    defaultClasses.bundle_options_wrap_outer + ' ' + 'clearfix'
                }
            >
                {options.map(value => {
                    return (
                        <div
                            className={defaultClasses.bundle_options_wrap}
                            key={value.option_id}
                        >
                            {value.option_id && (
                                <Options
                                    setBundleOptions={setBundleOptions}
                                    data={value}
                                    bundleOptiondata={bundleOptiondata}
                                    validate={validate}
                                    setValid={(value = () => { })}
                                    valid={1}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
            <div className={defaultClasses.bundle_customization_wrap}>
                {customItems}
            </div>
        </div>
    );
};

export default BundleOptions;
