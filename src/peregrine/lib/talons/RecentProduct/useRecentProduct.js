import { useEffect } from 'react';
import { useQuery } from '@apollo/client';

export const useVisitorId = props => {
    const { query } = props;
    const { error, data } = useQuery(query, {
        variables: {
            visitor_id: props.visitor_id
        }
    });
    useEffect(() => {
        if (error) {
            console.log(error);
        }
    }, [error]);

    return { visitor_id: data && data.visitorId && data.visitorId.visitor_id };
};

export const useRecentProducts = props => {
    const { query } = props;
    const { error, data } = useQuery(query, {
        variables: {
            visitorId: props.visitor_id,
            productId: props.product_id
        },
        fetchPolicy: 'network-only'
    });
    useEffect(() => {
        if (error) {
            console.log(error)
        }
    }, [error]);

    return {
        sliderProduct:
            data && data.saveRecentProducts && data.saveRecentProducts.data
    };
};
