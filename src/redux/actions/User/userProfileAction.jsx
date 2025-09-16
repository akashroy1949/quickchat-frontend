import {
    SET_USER_PROFILE_REQUEST,
    SET_USER_PROFILE_SUCCESS,
    SET_USER_PROFILE_FAILURE,
    CLEAR_USER_PROFILE
} from "../actionTypes";
import API from "../../../services/api";

// Thunk action creator for fetching user profile
export const fetchUserProfile = (successCB, errorCB) => async (dispatch) => {
    dispatch({ type: SET_USER_PROFILE_REQUEST });
    try {
        const res = await API.getProfile();
        dispatch({
            type: SET_USER_PROFILE_SUCCESS,
            payload: res?.data?.data || res?.data
        });
        if (successCB) successCB(res?.data);
    } catch (err) {
        const errorMsg = err?.response?.data?.message || "Failed to fetch user profile";
        dispatch({
            type: SET_USER_PROFILE_FAILURE,
            payload: errorMsg
        });
        if (errorCB) errorCB(errorMsg);
    }
};

// Action creator to clear user profile
export const clearUserProfile = () => ({
    type: CLEAR_USER_PROFILE
});