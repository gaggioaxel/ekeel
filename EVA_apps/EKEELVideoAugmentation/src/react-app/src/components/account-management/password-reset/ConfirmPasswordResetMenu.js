import {useState} from 'react'
import handleFetchHttpErrors from '../../../helpers/handleFetchHttpErrors'

/**
 * function that send http request to the backend server to finalize the password change
 * @param email_code_and_new_password verification code (sent to the user by email) and the new password entered by the user
 * @returns the http response of the backend server
 */
async function finishResetPassword(email_code_and_new_password) {
    return fetch('/api/retrieve_password/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(email_code_and_new_password)
      })
        .then(handleFetchHttpErrors)
        .then(data => data.json())
}

/**
 * React component used in the LoginMenu Component to display the PasswordResetMenu instead
 * @param setShowPasswordResetMenu function passed by the LoginMenu to come back to the LoginMenu
 * @param setShowPasswordResetMenu function passed by the PasswordResetMenu to come back to the PasswordResetMenu
 */
const ConfirmPasswordResetMenu = ({email, setShowPasswordResetMenu, setShowConfirmPasswordResetMenu}) => {

    const [code, setCode] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword,setShowPassword ] = useState(false)

    const onSubmit = async (e) => {
        e.preventDefault()
        
        if(!code){
            alert('Please enter your Verification Code')
            return
        }
        let response=null
        
        try{
            response = await finishResetPassword({email,code,password})
        }
        catch(err){
            console.log(err)
            if(err.message==="401"){
                alert('Wrong code')
                return
            }
            else if (err.message==="403") {
                alert('Too many Wrong codes, please restart the password retrieval procedure')
                setCode('')
                setPassword('')
                setShowConfirmPasswordResetMenu(false)
                return
            }
            else  {
                alert('Unknown Server Error, Please Try Again')
                return
            }
        };
        console.log(response)
        if(response===undefined){
            return
        }
        else if (response.email=== email){
            alert('Your password has been changed, you can now login')
            setCode('')
            setPassword('')
            setShowPasswordResetMenu()
            return
        }
        else return
        

    }

    return(
        <form className='login-form' onSubmit={onSubmit} >
                <h2>Password Reset :</h2>
                <div className='form-control'>
                    <label>A verification code has been sent to your email adress to ensure your identity. Please Enter the code</label>
                    <div className='form-password'>
                        <input type="text" className="inputText"
                        value={code} onChange={(e)=> setCode(e.target.value)}/>
                    </div>
                </div>
                <div className='form-control'>
                    <label>New Password</label>
                    <div className='form-password'>
                        <input type={showPassword ? "text" : "password"} className="inputText"
                        value={password} onChange={(e)=> setPassword(e.target.value)}/>
                        <button type="button" onClick={()=>setShowPassword(!showPassword)} >{showPassword ? "Hide" : "Show"}</button>
                    </div>
                </div>
                <input type="submit" value="Change password" className='btn btn-block'/>
            </form>
    )
}


export default ConfirmPasswordResetMenu