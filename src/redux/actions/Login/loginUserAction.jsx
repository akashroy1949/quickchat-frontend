import { set_login_user_failure, set_login_user_request, set_login_user_success } from "@/redux/reducers/loginUserReducer";
import API from "../../../services/api";

// Thunk action creator for login
export const loginUserAction = (data, successCB, errorCB) => async (dispatch) => {
    dispatch(set_login_user_request());
    try {
        const res = await API.loginUser(data);
        // Save JWT token and user data to localStorage
        if (res?.data?.token) {
            localStorage.setItem("token", res.data.token);
        }
        if (res?.data?.userId || res?.data?.data?._id) {
            const userId = res.data.userId || res.data.data._id;
            localStorage.setItem("userId", userId);
        }
        dispatch(set_login_user_success(res?.data));
        if (successCB) successCB(res?.data);
    } catch (err) {
        // Remove token and userId on failure
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        const errorMsg = err?.response?.data?.message || "Login failed";
        dispatch(set_login_user_failure(errorMsg));
        if (errorCB) errorCB(errorMsg);
    }
};
