import {
    EXPORT_CHAT_REQUEST,
    EXPORT_CHAT_SUCCESS,
    EXPORT_CHAT_FAILURE
} from "../actionTypes";
import API from "../../../services/api";

// Thunk action creator for exporting chat
export const exportChat = (conversationId, format = 'pdf', successCB, errorCB) => async (dispatch) => {
    dispatch({ type: EXPORT_CHAT_REQUEST });
    try {
        const res = await API.exportChat(conversationId, format);

        // Create blob and download
        const blob = new Blob([res.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `chat-export-${conversationId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        dispatch({
            type: EXPORT_CHAT_SUCCESS,
            payload: { conversationId, format }
        });
        if (successCB) successCB(res?.data);
    } catch (err) {
        const errorMsg = err?.response?.data?.message || "Failed to export chat";
        dispatch({
            type: EXPORT_CHAT_FAILURE,
            payload: errorMsg
        });
        if (errorCB) errorCB(errorMsg);
    }
};