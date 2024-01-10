import { handleActions } from 'redux-actions';

import actions from '../actions/ced';

export const name = 'ced';

const initialState = {
    currentUser: {
        email: '',
        firstname: '',
        lastname: '',
        mobile_number: ''
    },
    getDetailsError: null,
    isGettingDetails: false,
    isResettingPassword: false,
    resetPasswordError: null,
    overlay: false
};

const reducerMap = {
    [actions.getHomenavigationDetails.receive]: (state, { payload }) => {
        return {
            ...state,
            getHomenavigationDetails: payload
        };
    },
    [actions.contactForm.receive]: (state, { payload }) => {
        return {
            ...state,
            contactForm: payload
        };
    },
    [actions.overlay.receive]: (state, { payload }) => {
        return {
            ...state,
            overlay: payload
        };
    }
};

export default handleActions(reducerMap, initialState);
