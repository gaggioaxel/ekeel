import {applyMiddleware, createStore} from "redux";
import thunkMiddleware from 'redux-thunk';
import {createLogger} from "redux-logger/src";
import rootReducer from "../reducers/rootReducer";


const loggerMiddleware = createLogger();

export const store = createStore(
    rootReducer,
    applyMiddleware(
        thunkMiddleware,
        loggerMiddleware
    )
);

export * from './store';