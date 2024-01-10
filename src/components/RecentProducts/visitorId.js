import { useVisitorId } from '../../peregrine/lib/talons/RecentProduct/useRecentProduct';
import VisitorQuery from '../../queries/visitorId.graphql';

const VisitorId = () => {
    const tokenProps = useVisitorId({
        query: VisitorQuery,
        visitor_id: localStorage.getItem('visitor_id')
            ? localStorage.getItem('visitor_id')
            : ''
    });
    const { visitor_id } = tokenProps;
    if (visitor_id) {
        localStorage.setItem('visitor_id', visitor_id);
    }
    return null;
};

export default VisitorId;
