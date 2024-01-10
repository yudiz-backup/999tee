import React, { useEffect, useMemo, useState } from 'react';
import { fromReactIntl, toReactIntl } from '../../util/formatLocale';
import { IntlProvider } from 'react-intl';
import { gql, useQuery } from '@apollo/client';

const GET_LOCALE = gql`
    query getLocale {
        storeConfig {
            id
            locale
        }
    }
`;

const LocaleProvider = props => {
    const [messages, setMessages] = useState(null);
    const { data, loading } = useQuery(GET_LOCALE, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
    });

    const language = useMemo(() => {
        return data && data.storeConfig.locale
            ? toReactIntl(data.storeConfig.locale)
            : STORE_VIEW_LOCALE;
    }, [data]);
    const locale = fromReactIntl(language);
    useEffect(() => {
        if (language && !loading) {
            import(`../../i18n/${locale}.json`)
                .then(data => {
                    setMessages(data.default);
                })
                .catch(error => {
                    console.error(
                        `Unable to load translation file. \n${error}`
                    );
                });
        }
    }, [locale, setMessages, loading, language]);

    const onIntlError = error => {
        if (messages) {
            if (error.code === 'MISSING_TRANSLATION') {
                console.warn('Missing translation', error.message);
                return;
            }
            throw error;
        }
    };

    return (
        <IntlProvider
            key={language}
            {...props}
            defaultLocale="en-US"
            locale={language}
            messages={messages}
            onError={onIntlError}
        />
    );
};

export default LocaleProvider;
