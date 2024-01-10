import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { func } from 'prop-types';
import TextArea from '../../TextArea';
import defaultClasses from './priceAdjustments.css';

const PriceAdjustments = () => {
    const [textValue, setTextValue] = useState(' ');

    const { formatMessage } = useIntl();

    return (
        <div className={defaultClasses.root}>
            <TextArea
                id="cardMessage"
                field="cardMessage"
                placeholder={formatMessage({
                    id: 'giftOption.placeholder',
                    defaultMessage: 'Enter your message here'
                })}
                initialValue=""
                onChange={e => {
                    setTextValue(e.target.value);
                }}
                onBlur={() => {
                    localStorage.setItem('cardMessage', textValue);
                }}
            />
        </div>
    );
};

export default PriceAdjustments;

PriceAdjustments.propTypes = {
    setPageIsUpdating: func
};
