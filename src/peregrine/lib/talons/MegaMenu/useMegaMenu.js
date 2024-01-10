import { useEffect } from 'react';
import { useCedContext } from '../../context/ced';

export const useNavigation = () => {
    const [details, { getNavigationDetails }] = useCedContext();
    const { getHomenavigationDetails: navdetails } = details;

    useEffect(() => {
        (async function anyNameFunction() {
            await getNavigationDetails();
        })();
    }, [getNavigationDetails]);
    return {
        navdetails
    };
};
