
/**
 * function to handle http errors
 * @param response http response
 * @returns the response if the response status is ok or throw an error 
 */
function handleFetchHttpErrors(response) {
    if (!response.ok) {
        throw Error(response.status);
    }
    return response;
}

export default handleFetchHttpErrors