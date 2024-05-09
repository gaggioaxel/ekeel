import {useState} from 'react'
import ConfirmRegisterMenu from './ConfirmRegisterMenu'
import handleFetchHttpErrors from '../../../helpers/handleFetchHttpErrors'


async function registerUser(credentials) {
    return fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })
      .then(handleFetchHttpErrors)
      .then(data => data.json())
   }


/**
 * React Component that is used in the LoginPage Component
 * @param setSwitchToRegisterMenu function passed by the LoginMenu to come back to the LoginMenu
 */
const RegisterMenu = ({setSwitchToRegisterMenu}) => {
    
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [surname, setSurname] = useState('')
    const [password, setPassword] = useState('')
    const [confirmedPassword, setConfirmedPassword] = useState('')
    const [showPassword,setShowPassword ] = useState(false)
    const [showConfirmedPassword,setShowConfirmedPassword ] = useState(false)
    const [storedEmail, setStoredEmail] = useState('')
    const [showConfirmRegisterMenu, setShowConfirmRegisterMenu] = useState(false)

    const onSubmit = async (e) => {
        e.preventDefault()
        if(!email){
            alert('Please enter your Email')
            return
        }
        if(!name){
            alert('Please enter your Name')
            return
        }
        if(!surname){
            alert('Please enter your Surname')
            return
        }
        if(!password){
            alert('Please enter your Password')
            return
        }
        if(!confirmedPassword){
            alert('Please confirm your Password')
            return
        }
        if(confirmedPassword!==password){
            alert('Your password confirmation doesn\'t match, please change it')
            return
        }

        let response=null
        try{
            response = await registerUser({email,name,surname,password});
        }
        catch(err){
            console.log(err)
            if(err.message==="409"){
                alert('An account have already been created with this mail')
                return
            }
            if(err.message==="406"){
                alert('Invalid Mail, Please try with another one')
                return
            }
            if(err.message==="503"){
                alert('Server Error while sending your confirmation code by mail, Please try again later')
                return
            }
            else  {
                alert('Unknown Server Error, Please Try Again')
                return
            }
        };
        console.log(response)
        if (response.email=== email){
            setStoredEmail(email)
            setEmail('')
            setName('')
            setSurname('')
            setPassword('')
            setConfirmedPassword('')
            setShowConfirmRegisterMenu(true)
        }
        return

    }

    if (!showConfirmRegisterMenu){
        return (
            <form className='login-form' onSubmit={onSubmit} >
                <h2>Sign Up</h2>
                <div className='form-name'>
                    <div className='form-control'>
                        <label>First name</label>
                        <div className='form-password'>
                            <input type="text"  className="inputText"
                            value={name} onChange={(e)=> setName(e.target.value)}/>
                        </div>
                    </div>
                    <div className='form-control'>
                        <label>Last name</label>
                        <div className='form-password'>
                            <input type="text"  className="inputText"
                            value={surname} onChange={(e)=> setSurname(e.target.value)}/>
                        </div>
                    </div>
                </div>
                <div className='form-control form-email'>
                    <label>Email</label>
                    <div className='form-password'>
                        <input type="text"  className="inputText"
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
                <div className='form-control'>
                    <label>Confirm Password</label>
                    <div className='form-password'>
                        <input type={showConfirmedPassword ? "text" : "password"}  className="inputText"
                        value={confirmedPassword} onChange={(e)=> setConfirmedPassword(e.target.value)}/>
                        <button type="button" onClick={()=>setShowConfirmedPassword(!showConfirmedPassword)} >{showConfirmedPassword ? "Hide" : "Show"}</button>
                    </div>
                </div>
                <input type="submit" value="Register" className='btn btn-block'/>
            </form>
        )
    }
    else{
        return(
            <ConfirmRegisterMenu email={storedEmail} setSwitchToRegisterMenu={setSwitchToRegisterMenu}
             setShowConfirmRegisterMenu={setShowConfirmRegisterMenu} />
        )
    }
    
}

export default RegisterMenu
