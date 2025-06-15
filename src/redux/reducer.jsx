import { combineReducers } from "redux";
import { loginUserReducer } from "./reducers/loginUserReducer";

const rootReducer = combineReducers({
    loginUser: loginUserReducer,
});

export default rootReducer;
