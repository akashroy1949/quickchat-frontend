import {
    EXPORT_CHAT_REQUEST,
    EXPORT_CHAT_SUCCESS,
    EXPORT_CHAT_FAILURE
} from "../actions/actionTypes";

const initialState = {
    loading: false,
    data: null,
    error: null,
};

const exportChatReducer = (state = initialState, action) => {
    switch (action.type) {
        case EXPORT_CHAT_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case EXPORT_CHAT_SUCCESS:
            return {
                ...state,
                loading: false,
                data: action.payload,
                error: null,
            };
        case EXPORT_CHAT_FAILURE:
            return {
                ...state,
                loading: false,
                data: null,
                error: action.payload,
            };
        default:
            return state;
    }
};

export default exportChatReducer;