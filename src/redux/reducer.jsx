import { combineReducers } from "redux";
import { loginUserReducer } from "./reducers/loginUserReducer";
import { registerUserReducer } from "./reducers/registerUserReducer";
import { LOGOUT } from "./actions/actionTypes";

// Combine all reducers
const appReducer = combineReducers({
    loginUser: loginUserReducer,
    registerUser: registerUserReducer,
});

// Root reducer with logout handling
const rootReducer = (state, action) => {
    // When logout action is dispatched, reset all state
    if (action.type === LOGOUT) {
        // This will reset all reducers to their initial states
        state = undefined;
    }
    
    return appReducer(state, action);
};

export default rootReducer;
