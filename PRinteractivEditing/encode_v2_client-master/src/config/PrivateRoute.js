import React from 'react';
import {Redirect, Route} from 'react-router-dom/';

export const PrivateRoute = ({
    component: Component,
    ...rest
}) => (
    <Route {...rest} render = {props => (
        localStorage.getItem('user')
            ? <Component key={props.match.params.topicId || "empty"} {...props}/>
            : <Redirect to = {{pathname: '/', state:{from: props.location}}} />
    )} />
);

export * from './PrivateRoute';