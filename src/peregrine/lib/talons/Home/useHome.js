import { useEffect, useCallback, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useCedContext } from '../../context/ced';
import { Util } from '@magento/peregrine';
/**
 * @param {*} props.query the footer data query
 */
export const useHome = props => {
    const { query } = props;
    const { error, data } = useQuery(query, { fetchPolicy: 'cache-first' });
    useEffect(() => {
        if (error) {
            console.log('Error fetching Home Page Configurations.');
        }
    }, [error]);

    return {
        HomeConfigData: data && data.homepageConfig.configData
    };
};

export const useSliderProducts = props => {
    const { query, showProducts } = props;
    const { error, data } = useQuery(query, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        skip: !showProducts
    });
    useEffect(() => {
        if (error) {
            console.log('Error fetching Slider Product data.');
        }
    }, [error]);
    let sliderProduct;
    if (data && data.latestProducts && data.latestProducts.data) {
        sliderProduct = data.latestProducts.data;
    }
    if (data && data.bestSeller && data.bestSeller.data) {
        sliderProduct = data.bestSeller.data;
    }
    return {
        sliderProduct
    };
};

export const useCmsBlock = props => {
    const { query, identifier, showBanner } = props;
    const { error, data } = useQuery(query, {
        variables: {
            identifiers: identifier
        },
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        skip: !showBanner
    });
    useEffect(() => {
        if (error) {
            console.log('Error fetching banners.');
        }
    }, [error]);

    return {
        cmsBlock: data && data.cmsBlocks.items[0]['content']
    };
};

export const useContactUs = () => {
    const [details, { submitContactForm }] = useCedContext();
    const { contactForm } = details;
    const handleSubmit = useCallback(
        async ({ name, lastname, email, telephone, comment }, cpatchaToken) => {
            const payload = {
                name,
                lastname,
                email,
                telephone,
                comment,
                cpatchaToken
            };
            try {
                await submitContactForm(payload, cpatchaToken);
                document.getElementById('contact-form').reset();
            } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    console.error(error);
                }
            }
        },
        [submitContactForm]
    );
    return {
        handleSubmit,
        responseData: contactForm
    };
};

export const useCountries = props => {
    const { countriesQuery } = props;

    const {
        loading: isLoadingCountries,
        error: countriesError,
        data: countriesData
    } = useQuery(countriesQuery);
    const { countries } = countriesData || {};

    return {
        countries,
        hasError: !!countriesError,
        isLoading: !!isLoadingCountries
    };
};

export const useFooterData = props => {
    const { footerQuery, footerIdentifiers } = props;
    const { error, data } = useQuery(footerQuery, {
        variables: {
            identifiers: footerIdentifiers
        }
    });

    useEffect(() => {
        if (error) {
            console.log('Error fetching footer data.');
        }
    }, [error]);

    return {
        footerData: data && data.cmsBlocks.items[0]['content'],
        footerDataTitle: data && data.cmsBlocks.items[0]['title']
    };
};

export const useScopeData = props => {
    const { query } = props;
    const { error, data } = useQuery(query, {
        fetchPolicy: 'cache-first',
        errorPolicy: 'all'
    });
    useEffect(() => {
        if (error) {
            console.log(error);
        }
    }, [error]);

    return {
        scopeData: data && data.storeConfig
    };
};

export const useGetScopeCache = () => {
    const { BrowserPersistence } = Util;
    const storage = new BrowserPersistence();
    const scopeData = storage.getItem('scope_data');
    return {
        config: scopeData
    };
};

export const useSetGuestEmail = props => {
    const { mutation } = props;
    const [setGuestEmail, { data }] = useMutation(mutation);

    const [inProgress, setInProgress] = useState(false);
    const handleSetGuestEmail = useCallback(
        async ({ cart_id, email }) => {
            setInProgress(true);
            await setGuestEmail({ variables: { cart_id, email } });
            setInProgress(false);
        },
        [setGuestEmail]
    );

    return {
        handleSetGuestEmail,
        inProgress,
        paymentMethodResponse: data && data.setGuestEmailOnCart
    };
};
