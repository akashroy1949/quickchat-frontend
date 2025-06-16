import { combineReducers } from "redux";
import { loginUserReducer } from "./reducers/loginUserReducer";
import { registerUserReducer } from "./reducers/registerUserReducer";

const rootReducer = combineReducers({
    loginUser: loginUserReducer,
    registerUser: registerUserReducer,
});

export default rootReducer;
