import {
    SET_REGISTER_USER_REQUEST,
    SET_REGISTER_USER_SUCCESS,
    SET_REGISTER_USER_FAILURE,
} from "../actions/actionTypes";

const initialState = {
    data: null,
    loading: false,
    error: null,
};

export const registerUserReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_REGISTER_USER_REQUEST:
            return { ...state, data: null, loading: true, error: null };
        case SET_REGISTER_USER_SUCCESS:
            return { ...state, loading: false, data: action.payload, error: null };
        case SET_REGISTER_USER_FAILURE:
            return { ...state, data: null, loading: false, error: action.payload };
        default:
            return state;
    }
};

export const set_register_user_request = () => ({
    type: SET_REGISTER_USER_REQUEST,
});

export const set_register_user_success = (payload) => ({
    type: SET_REGISTER_USER_SUCCESS,
    payload,
});

export const set_register_user_failure = (payload) => ({
    type: SET_REGISTER_USER_FAILURE,
    payload,
});
