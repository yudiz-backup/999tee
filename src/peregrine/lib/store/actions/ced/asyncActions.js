import { Magento2 } from '@magento/peregrine/lib/RestApi';
import BrowserPersistence from '@magento/peregrine/lib/util/simplePersistence';
import actions from './actions';

const { request } = Magento2;
const storage = new BrowserPersistence();

export const getNavigationDetails = () => {
    return async function thunk(...args) {
        const [dispatch] = args;
        var storeview = getStoreview();
        try {
            if (storage.getItem('nav_details')) {
                const navDetails = storage.getItem('nav_details');
                dispatch(actions.getHomenavigationDetails.receive(navDetails));
            } else {
                const navDetails = await request('rest/' + storeview + 'V1/getNavigation',
                    {
                        method: 'GET'
                    }
                );
                setNavDetails(navDetails);
                dispatch(actions.getHomenavigationDetails.receive(navDetails));
            }
        } catch (error) {
            dispatch(actions.getHomenavigationDetails.receive(error));
        }
    };
};

export const submitContactForm = (details, cpatchaToken) =>
    async function thunk(...args) {
        const [dispatch] = args;
        try {
            if (typeof details === 'undefined') {
                details = '';
            }
            const response = await request('rest/V1/saveContactForm', {
                method: 'POST',
                body: JSON.stringify(details),
                headers: {
                    'X-ReCaptcha': cpatchaToken ? cpatchaToken : ""
                }
            });

            var responseData = response[0];
            dispatch(actions.contactForm.receive(responseData));
        } catch (error) {
            dispatch(actions.contactForm.receive(error));
            throw error;
        }
    };

async function setNavDetails(navDetails) {
    return storage.setItem('nav_details', navDetails, 360000);
}

function getStoreview() {
    var storeview = storage.getItem('store_view_code');
    if (!storeview) {
        storeview = '';
    } else {
        storeview = storeview + '/';
    }
    return storeview;
}

export const setOverlay = option =>
    async function thunk(dispatch) {
        await dispatch(actions.overlay.receive(option));
    };
