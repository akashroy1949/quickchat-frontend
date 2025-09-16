import {
    DELETE_CONVERSATION_REQUEST,
    DELETE_CONVERSATION_SUCCESS,
    DELETE_CONVERSATION_FAILURE
} from "../actionTypes";
import API from "../../../services/api";

// Thunk action creator for deleting conversation
export const deleteConversation = (conversationId, successCB, errorCB) => async (dispatch) => {
    dispatch({ type: DELETE_CONVERSATION_REQUEST });
    try {
        const res = await API.deleteConversation(conversationId);
        dispatch({
            type: DELETE_CONVERSATION_SUCCESS,
            payload: { conversationId }
        });
        if (successCB) successCB(res?.data);
    } catch (err) {
        const errorMsg = err?.response?.data?.message || "Failed to delete conversation";
        dispatch({
            type: DELETE_CONVERSATION_FAILURE,
            payload: errorMsg
        });
        if (errorCB) errorCB(errorMsg);
    }
};