import {
    DELETE_CONVERSATION_REQUEST,
    DELETE_CONVERSATION_SUCCESS,
    DELETE_CONVERSATION_FAILURE
} from "../actions/actionTypes";

const initialState = {
    loading: false,
    data: null,
    error: null,
};

const deleteConversationReducer = (state = initialState, action) => {
    switch (action.type) {
        case DELETE_CONVERSATION_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case DELETE_CONVERSATION_SUCCESS:
            return {
                ...state,
                loading: false,
                data: action.payload,
                error: null,
            };
        case DELETE_CONVERSATION_FAILURE:
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

export default deleteConversationReducer;