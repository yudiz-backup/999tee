import { useEffect } from 'react';
import { useQuery } from '@apollo/client';

export const useFeaturedProducts = props => {
    const { query } = props;
    const { error, loading, data } = useQuery(query, {
        variables: {
            categoryId: props.category_id
        },
        fetchPolicy: 'network-only'
    });
    useEffect(() => {
        if (error) {
            console.error(error);
        }
    }, [error]);
    return {
        featuredProduct:
            data && data.featuredProducts && data.featuredProducts.data,
        loading
    };
};
