import React from 'react';

import AppContextProvider from '@magento/peregrine/lib/context/app';
import CartContextProvider from '@magento/peregrine/lib/context/cart';
import CatalogContextProvider from '@magento/peregrine/lib/context/catalog';
import CheckoutContextProvider from '@magento/peregrine/lib/context/checkout';
import ErrorContextProvider from '@magento/peregrine/lib/context/unhandledErrors';
import UserContextProvider from '@magento/peregrine/lib/context/user';
import RootComponentsProvider from '@magento/peregrine/lib/context/rootComponents';
import CedContextProvider from '../context/ced';

/**
 * List of essential context providers that are required to run Peregrine
 *
 * @property {React.Component[]} contextProviders
 */
const contextProviders = [
    ErrorContextProvider,
    AppContextProvider,
    UserContextProvider,
    CatalogContextProvider,
    CartContextProvider,
    CheckoutContextProvider,
    RootComponentsProvider,
    CedContextProvider
];

const PeregrineContextProvider = ({ children }) => {
    return contextProviders.reduceRight((memo, ContextProvider) => {
        return <ContextProvider>{memo}</ContextProvider>;
    }, children);
};

export default PeregrineContextProvider;
