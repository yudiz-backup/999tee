import React, { useMemo } from 'react';
import { useQuery, gql } from '@apollo/client';
export { default as HeadProvider } from './headProvider';
import { Helmet } from 'react-helmet-async';
Helmet.defaultProps.defer = false;

export const Link = props => {
    const { children, ...tagProps } = props;
    return (
        <Helmet>
            <link {...tagProps}>{children}</link>
        </Helmet>
    );
};

export const Meta = props => {
    const { children, ...tagProps } = props;
    return (
        <Helmet>
            <meta {...tagProps}>{children}</meta>
        </Helmet>
    );
};

export const Style = props => {
    const { children, ...tagProps } = props;
    return (
        <Helmet>
            <style {...tagProps}>{children}</style>
        </Helmet>
    );
};

export const Title = props => {
    const { children, ...tagProps } = props;
    return (
        <Helmet>
            <title {...tagProps}>{`${children} | ${STORE_NAME}`}</title>
        </Helmet>
    );
};

const STORE_NAME_QUERY = gql`
    query getStoreName {
        storeConfig {
            id
            store_name
        }
    }
`;

export const StoreTitle = props => {
    const { children, ...tagProps } = props;

    const { data: storeNameData } = useQuery(STORE_NAME_QUERY);

    const storeName = useMemo(() => {
        return storeNameData
            ? storeNameData.storeConfig.store_name
            : STORE_NAME;
    }, [storeNameData]);

    let titleText;
    if (children) {
        titleText = `${children} | ${storeName}`;
    } else {
        titleText = storeName;
    }

    return (
        <Helmet>
            <title {...tagProps}>{titleText}</title>
        </Helmet>
    );
};
