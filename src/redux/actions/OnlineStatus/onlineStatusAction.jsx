import {
    GET_ONLINE_USERS_REQUEST,
    GET_ONLINE_USERS_SUCCESS,
    GET_ONLINE_USERS_FAILURE,
    SET_USER_ONLINE,
    SET_USER_OFFLINE
} from "../actionTypes";
import API from "../../../services/api";

// Action creators
export const get_online_users_request = () => ({
    type: GET_ONLINE_USERS_REQUEST,
});

export const get_online_users_success = (payload) => ({
    type: GET_ONLINE_USERS_SUCCESS,
    payload,
});

export const get_online_users_failure = (payload) => ({
    type: GET_ONLINE_USERS_FAILURE,
    payload,
});

export const set_user_online = (userId) => ({
    type: SET_USER_ONLINE,
    payload: userId,
});

export const set_user_offline = (userId, lastSeen) => ({
    type: SET_USER_OFFLINE,
    payload: userId,
    lastSeen,
});

// Thunk action creator for getting online users
export const getOnlineUsersAction = (successCB, errorCB) => async (dispatch) => {
    dispatch(get_online_users_request());
    try {
        const res = await API.getOnlineUsers();
        dispatch(get_online_users_success(res.data.onlineUsers || []));
        if (successCB) successCB(res.data);
    } catch (err) {
        const errorMsg = err?.response?.data?.message || "Failed to get online users";
        dispatch(get_online_users_failure(errorMsg));
        if (errorCB) errorCB(errorMsg);
    }
};