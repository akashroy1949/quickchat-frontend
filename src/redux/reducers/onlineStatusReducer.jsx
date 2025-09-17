import {
    GET_ONLINE_USERS_REQUEST,
    GET_ONLINE_USERS_SUCCESS,
    GET_ONLINE_USERS_FAILURE,
    SET_USER_ONLINE,
    SET_USER_OFFLINE,
    LOGOUT
} from "../actions/actionTypes";

const initialState = {
    loading: false,
    onlineUsers: [], // Array of online user IDs
    userLastSeen: {}, // Object mapping userId to last seen timestamp
    error: null,
};

const onlineStatusReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_ONLINE_USERS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case GET_ONLINE_USERS_SUCCESS: {
            const userLastSeen = {};
            action.payload.forEach(user => {
                userLastSeen[user._id.toString()] = user.lastSeen;
            });
            return {
                ...state,
                loading: false,
                onlineUsers: action.payload.filter(user => user.isOnline).map(user => user._id.toString()),
                userLastSeen,
                error: null,
            };
        }
        case GET_ONLINE_USERS_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        case SET_USER_ONLINE: {
            const userId = action.payload.toString();
            return {
                ...state,
                onlineUsers: state.onlineUsers.includes(userId)
                    ? state.onlineUsers
                    : [...state.onlineUsers, userId],
            };
        }
        case SET_USER_OFFLINE: {
            const userId = action.payload.toString();
            return {
                ...state,
                onlineUsers: state.onlineUsers.filter(id => id !== userId),
                userLastSeen: {
                    ...state.userLastSeen,
                    [userId]: action.lastSeen || new Date().toISOString()
                },
            };
        }
        case LOGOUT:
            return initialState;
        default:
            return state;
    }
};

export default onlineStatusReducer;