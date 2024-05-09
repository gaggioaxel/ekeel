import constants from '../constants/constants';

export const userService = {
    login,
    logout,
    getAll,
    registration,
    refreshToken
};

function login(email, password){
    const requestOptions = {
        method: 'POST',
        headers: constants.API_HEADERS,
        body: JSON.stringify({
            email,
            password
        })
    };

    return fetch(`${constants.API_URL}/public/v1/login`, requestOptions)
        .then(handleResponse)
        .then(user => {
            if(user.token){
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('userId', email);
                user.email = email;
            }
            return user;
        })
}

function registration(username, password, email, firstName, lastName){
    let timestamp = new window.Date().getTime();
    return fetch(`${constants.API_URL}/public/v1/registration`,{
        method: 'POST',
        headers: constants.API_HEADERS,
        body: JSON.stringify({
            creationDate: timestamp,
            username,
            password,
            email,
            firstName,
            lastName,
            enabled: true
        })
    })
        .then(handleResponse)
    /*.catch(error => {
        window.alert(error);
        return error;
    });*/
}

function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
}

function getAll() {

}

function refreshToken(user){
    return fetch(`${constants.API_URL}/public/v1/refresh-token`,{
        method: 'GET',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        }
    })
        .then(handleResponse)
}

function handleResponse(response){
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        if(response.status < 200 || response.status >= 300){
            if(response.status === 401){
                logout();
                window.location.reload(true);
            }

            if(Array.isArray(data)){
                return Promise.reject(data);
            }else{
                const error = (data && data.message) || response.statusText;
                return Promise.reject(error);
            }
        }
        return data;
    });
}

export * from './user.services';