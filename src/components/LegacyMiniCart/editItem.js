import React from 'react';
import { bool, func, object, string } from 'prop-types';

import LoadingIndicator from '../LoadingIndicator';
import PRODUCT_DETAILS from '../../queries/getProductDetailBySku.graphql';
import { FormattedMessage } from 'react-intl';

import CartOptions from './cartOptions';
import { useEditItem } from '@magento/peregrine/lib/talons/LegacyMiniCart/useEditItem';

const loadingIndicator = (
    <LoadingIndicator>{`Fetching Item Options...`}</LoadingIndicator>
);

const EditItem = props => {
    const { currencyCode, endEditItem, isUpdatingItem, item } = props;

    const talonProps = useEditItem({
        item,
        query: PRODUCT_DETAILS
    });

    const { configItem, hasError, isLoading, itemHasOptions } = talonProps;
    if (hasError) {
        return (
            <span>
                <FormattedMessage
                    id={'editItem.hasError'}
                    defaultMessage={' Unable to fetch item options.'}
                />
            </span>
        );
    }

    // If we are loading, or if we know we have options but haven't received
    // them from the query, render a loading indicator.
    if (isLoading || (itemHasOptions && !configItem)) {
        return loadingIndicator;
    }

    return (
        <CartOptions
            cartItem={item}
            configItem={configItem || {}}
            currencyCode={currencyCode || "INR"}
            endEditItem={endEditItem}
            isUpdatingItem={isUpdatingItem}
        />
    );
};

EditItem.propTypes = {
    currencyCode: string,
    endEditItem: func,
    isUpdatingItem: bool,
    item: object.isRequired
};

export default EditItem;
