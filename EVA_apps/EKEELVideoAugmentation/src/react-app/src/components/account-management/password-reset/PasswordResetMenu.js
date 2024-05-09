import {useState} from 'react'
import ConfirmPasswordResetMenu from './ConfirmPasswordResetMenu'
import handleFetchHttpErrors from '../../../helpers/handleFetchHttpErrors'


async function sendResetPasswordRequest(email) {
    return fetch('/api/retrieve_password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(email)
      })
        .then(handleFetchHttpErrors)
        .then(data => data.json())
}

/**
 * React component used in the LoginMenu Component to display the PasswordResetMenu Instead
 * @param setShowPasswordResetMenu function passed by the LoginMenu hide the PasswordResetMenu and show the LoginMenu instead
 */
const PasswordResetMenu = ({setShowPasswordResetMenu}) => {

    const [email, setEmail] = useState('')
    const [storedEmail, setStoredEmail] = useState('')
    const [showConfirmPasswordResetMenu, setShowConfirmPasswordResetMenu] = useState(false)

    const onSubmit = async (e) => {
        e.preventDefault()
        
        if(!email){
            alert('Please enter your Email')
            return
        }
        let response=null
        
        try{
            response = await sendResetPasswordRequest({email})
        }
        catch(err){
            console.log(err)
            if(err.message==="409"){
                alert('There is no account associated with this mail')
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
            setStoredEmail(email)
            setEmail('')
            setShowConfirmPasswordResetMenu(true)
            return
        }
        else
            return
    }

    if(!showConfirmPasswordResetMenu){
        return(
            <form className='login-form' onSubmit={onSubmit} >
                    <h2>Reset Password</h2>
                    <div className='form-control'>
                        <label>Email</label>
                        <div className='form-password'>
                            <input type="text" className="inputText"
                            value={email} onChange={(e)=> setEmail(e.target.value)}/>
                        </div>
                    </div>
                    <input type="submit" value="Reset my Password" className='btn btn-block'/>
                </form>
        )
    }
    else{
        return(
            <ConfirmPasswordResetMenu email={storedEmail} setShowPasswordResetMenu={setShowPasswordResetMenu}
            setShowConfirmPasswordResetMenu={setShowConfirmPasswordResetMenu} />
        )
    }
    
}

export default PasswordResetMenu