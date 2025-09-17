import {
    GET_CHAT_STATISTICS_REQUEST,
    GET_CHAT_STATISTICS_SUCCESS,
    GET_CHAT_STATISTICS_FAILURE
} from "../actionTypes";
import API from "../../../services/api";

// Thunk action creator for fetching chat statistics
export const fetchChatStatistics = (conversationId, successCB, errorCB) => async (dispatch) => {
    dispatch({ type: GET_CHAT_STATISTICS_REQUEST });
    try {
        const res = await API.getChatStatistics(conversationId);
        dispatch({
            type: GET_CHAT_STATISTICS_SUCCESS,
            payload: res?.data?.data || res?.data
        });
        if (successCB) successCB(res?.data);
    } catch (err) {
        const errorMsg = err?.response?.data?.message || "Failed to fetch chat statistics";
        dispatch({
            type: GET_CHAT_STATISTICS_FAILURE,
            payload: errorMsg
        });
        if (errorCB) errorCB(errorMsg);
    }
};