import {useState} from 'react'
import Button from '../Button';
import PasswordResetMenu from '../password-reset/PasswordResetMenu'
import handleFetchHttpErrors from '../../../helpers/handleFetchHttpErrors'
import { useHistory, useLocation } from "react-router-dom";
import {
    Link,
  } from "react-router-dom";

/**
 * function that send http request to the backend server to get the authentication token of the user
 * @param credentials email and password entered by the user
 * @returns the http response of the backend server (containing the token, name and surname if the login in successful)
 */
async function loginUser(credentials) {
    return fetch('/api/token', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(credentials.email+':'+credentials.password)
      }
    })
    .then(handleFetchHttpErrors)
    .then(data => data.json())
   }


/**
 * React Component that is used in the LoginPage Component
 * @param setToken method passed by the LoginPage component to store the authentication token of the logged user in the app context (TokenContext)
 * @param setNameSurname method passed by the LoginPage component to store the name and surname of the logged user in the app context (TokenContext)
 * @param setContextEmail method passed by the LoginPage component to store the mail of the logged user in the app context (TokenContext)
 */

const LoginMenu = ({setToken, setNameSurname, setContextEmail}) => {
    
    let history = useHistory();
    let location = useLocation();
    let { from } = location.state || { from: { pathname: "/" } };

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword,setShowPassword ] = useState(false)
    const [showPasswordResetMenu, setShowPasswordResetMenu] = useState(false)

    const onSubmit = async (e) => {
        e.preventDefault()

        //check if all requiered fields are not empty
        if(!email){
            alert('Please Enter Email')
            return
        }
        if(!password){
            alert('Please Enter Password')
            return
        }
        let response=null

        try{
            response = await loginUser({email,password})
        }
        catch(err){
            console.log(err)
            if(err.message==="401"){
                alert('Invalid Authentication, please try different credentials')
                return
            }
            else  {
                alert('Unknown Server Error, Please Try Again')
                return
            }
        }
        console.log("login",response)
        if(response===undefined){
            alert('Unknown Server Error, Please Try Again')
            return
        }
        setEmail('')
        setPassword('')
        setToken(response);
        setNameSurname(response);
        setContextEmail(email);
        history.replace('/dashboard');

        response.email=email
        localStorage.setItem('user', JSON.stringify(response))
        

        return
    }
    
    if(!showPasswordResetMenu){
        return (
            <div>
                <form className='login-form' onSubmit={onSubmit} >
                <h2>Login </h2>
                <div className='form-control'>
                    <label>Email</label>
                    <div className='form-password'>
                        <input type="text" className="inputText"
                        value={email} onChange={(e)=> setEmail(e.target.value)}/>
                    </div>
                </div>
                <div className='form-control'>
                    <label>Password</label>
                    <div className='form-password'>
                        <input type={showPassword ? "text" : "password"}  className="inputText"
                        value={password} onChange={(e)=> setPassword(e.target.value)}/>
                        <button type="button" onClick={()=>setShowPassword(!showPassword)} >{showPassword ? "Hide" : "Show"}</button>
                    </div>
                </div>
                
                
                <div className="footerLogin">
                <input type="submit" value="Login" className='btn btn-block'/>
                </div> 
                </form>
                
            </div> 
        )
    }
    else return(
        <div>
            <PasswordResetMenu setShowPasswordResetMenu={setShowPasswordResetMenu} />
            <Button label='Back to Login Menu' color='grey' onClick={()=>setShowPasswordResetMenu(!showPasswordResetMenu)} />
        </div>
    )
    
}

export default LoginMenu