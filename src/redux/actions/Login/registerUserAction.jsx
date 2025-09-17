import { set_register_user_failure, set_register_user_request, set_register_user_success } from "@/redux/reducers/registerUserReducer";
import API from "../../../services/api";

// Thunk action creator for registration
export const registerUserAction = (data, successCB, errorCB) => async (dispatch) => {
    dispatch(set_register_user_request());
    try {
        const res = await API.registerUser(data);
        dispatch(set_register_user_success(res?.data));

        // If registration returns user data and token, store them in localStorage
        if (res?.data?.token) {
            localStorage.setItem("token", res.data.token);
        }
        if (res?.data?.data?._id) {
            localStorage.setItem("userId", res.data.data._id);
        }

        if (successCB) successCB(res?.data);
    } catch (err) {
        const errorMsg = err?.response?.data?.message || "Registration failed";
        dispatch(set_register_user_failure(errorMsg));
        if (errorCB) errorCB(errorMsg);
    }
};
