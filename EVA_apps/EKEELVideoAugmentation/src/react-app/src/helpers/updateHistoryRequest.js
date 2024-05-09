import handleFetchHttpErrors from './handleFetchHttpErrors'

/**
 * funtion that send an http request to the update_user_history method of the backend
 * @param  request the content of the http request
 * @param tokenContext object containig the authentication token
 * @returns 
 */
async function updateHistoryRequest(request, tokenContext){
    let response=null;
    try{
        response = await fetch('/api/update_user_history', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Basic ' + btoa(tokenContext.token+':unused')
            },
            body: JSON.stringify(request)
          })
          .then(handleFetchHttpErrors)
          .then(res => res.json())
    }
    catch(err){
        console.log(err)
        if(err.message==="401"){
            alert('Your session have expired, please re-login')
            tokenContext.setToken('')
            return
        }
        else  {
            alert('Unknown Error')
            return
        }
    }
    if(response===undefined){
        alert('Unknown Server Error')
        return
    }
};

export default updateHistoryRequest