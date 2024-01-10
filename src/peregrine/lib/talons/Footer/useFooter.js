import { useQuery } from '@apollo/client';

/**
 *
 * @param {*} props.query the footer data query
 */
export const useFooter = props => {
    const { query } = props;
    const { data } = useQuery(query);

    return {
        copyrightText: data && data.storeConfig && data.storeConfig.copyright,
        cookieRestriction:
            data &&
            data.storeConfig &&
            data.storeConfig.enable_cookie_restriction,
        cookieLifetime:
            data && data.storeConfig && data.storeConfig.cookie_lifetime
    };
};
