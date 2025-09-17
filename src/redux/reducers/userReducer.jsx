import {
    SET_USER_PROFILE_REQUEST,
    SET_USER_PROFILE_SUCCESS,
    SET_USER_PROFILE_FAILURE,
    CLEAR_USER_PROFILE,
    LOGOUT
} from "../actions/actionTypes";

const initialState = {
    loading: false,
    data: null,
    error: null,
};

const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_USER_PROFILE_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case SET_USER_PROFILE_SUCCESS:
            return {
                ...state,
                loading: false,
                data: action.payload,
                error: null,
            };
        case SET_USER_PROFILE_FAILURE:
            return {
                ...state,
                loading: false,
                data: null,
                error: action.payload,
            };
        case CLEAR_USER_PROFILE:
        case LOGOUT:
            return initialState;
        default:
            return state;
    }
};

export default userReducer;