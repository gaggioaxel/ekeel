import {useState} from 'react'
import handleFetchHttpErrors from '../../../helpers/handleFetchHttpErrors'

async function finishUserRegistration(email_and_code) {
    return fetch('/api/register/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(email_and_code)
      })
        .then(handleFetchHttpErrors)
        .then(data => data.json())
}

/**
 * React component used in the RegisterMenu Component to display the RegisterMenu instead
 * @param email mail of the user
 * @param setSwitchToRegisterMenu function passed by the LoginMenu to come back to the LoginMenu
 * @param setShowConfirmRegisterMenu function passed by the RegisterMenu to come back to the RegisterMenu
 */
const ConfirmRegisterMenu = ({email, setSwitchToRegisterMenu, setShowConfirmRegisterMenu}) => {

    const [code, setCode] = useState('')


    const onSubmit = async (e) => {
        e.preventDefault()
        
        if(!code){
            alert('Please enter your Verification Code')
            return
        }
        let response=null
        
        try{
            response = await finishUserRegistration({email,code})
        }
        catch(err){
            console.log(err)
            if(err.message==="401"){
                alert('Wrong code')
                return
            }
            else if (err.message==="403") {
                alert('Too many Wrong codes, please restart Registration from beginning')
                setShowConfirmRegisterMenu(false)
                return
            }
            else  {
                alert('Unknown Error, Please Try Again')
                return
            }
        };
        console.log(response)
        if(response===undefined){
            return
        }
        else if (response.email=== email){
            alert('Your account has been created, you can now login')
            setSwitchToRegisterMenu()
            return
        }
        else return
        

    }

    return(
        <form className='login-form' onSubmit={onSubmit} >
                <h2>Email validation :</h2>
                <div className='form-control'>
                    <label>A verification code has been sent to your email adress to ensure your identity. Please Enter the code</label>
                    <div className='form-password'>
                        <input type="text" className="inputText"
                        value={code} onChange={(e)=> setCode(e.target.value)}/>
                    </div>
                </div>
                <input type="submit" value="Finish Registration" className='btn btn-block'/>
            </form>
    )
}


export default ConfirmRegisterMenu