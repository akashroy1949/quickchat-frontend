import {
    GET_CHAT_STATISTICS_REQUEST,
    GET_CHAT_STATISTICS_SUCCESS,
    GET_CHAT_STATISTICS_FAILURE
} from "../actions/actionTypes";

const initialState = {
    loading: false,
    data: null,
    error: null,
};

const chatStatisticsReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_CHAT_STATISTICS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case GET_CHAT_STATISTICS_SUCCESS:
            return {
                ...state,
                loading: false,
                data: action.payload,
                error: null,
            };
        case GET_CHAT_STATISTICS_FAILURE:
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

export default chatStatisticsReducer;