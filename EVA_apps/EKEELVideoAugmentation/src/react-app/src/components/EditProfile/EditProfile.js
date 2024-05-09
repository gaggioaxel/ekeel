import React from 'react';
import './EditProfile.css'
import { TouchableOpacity, TextInput } from 'react-native-web';
import Header from '../Header/Header';
import {TokenContext} from '../account-management/TokenContext'
import handleFetchHttpErrors from '../../helpers/handleFetchHttpErrors'
import { FiEdit3 } from 'react-icons/fi'
import { MdDelete, MdCheckCircle } from 'react-icons/md'
import { RiAlertFill } from 'react-icons/ri'

{/*
  This component allow th euser to edit his name and/or surname and/or delete his account
  Here are its' components:
    * Header:
      - this is a component from where you can logout, go back to the dasboard and edit your profile
    * InfoToEdit:
      - this component is a field where the user writes his new name and/or surname
      - if it's empty the border becomes red
      - the user can't save changes if one of the fields is empty
      - the maximum length of the inputs is 20 characters
*/}

const InfoToEdit = (props) => {
  return(
      <div className="editInfo">
        <text>{props.info}</text>
        <input
          value={props.loading ? null : props.fieldValue}
          style={{width: '60%', borderColor: props.borderColor}}
          disabled={props.disabled}
          onChange={props.onChange}
          maxLength="20"
        />
    </div>
  )
}
export default class EditProfile extends React.Component {
  state = {
    // loading of the info got with the back end
    loading: true,
    // edition mode
    edition: false,
    // current name
    name: this.context.nameSurname.split(' ')[0],
    // current surname
    surname: this.context.nameSurname.split(' ')[1],
    // email associated to the account
    email: this.context.email,
    // deletion mode
    validateDeletion: false,
    // validation code to delete the account
    code: '',
  }

  static contextType = TokenContext

  // handle the change of the name
  handleNameChange = (event) => {
    this.setState({name: event.target.value});
  }

  // handle the change of the surname
  handleSurnameChange = (event) => {
    this.setState({surname: event.target.value});
  }

  // this function checks if the name and the surname are psecified before applying the changes
  async handleSaveChanges() {
    const { name, surname, edition } = this.state
    if(!name){
      alert('Please specify your name')
      return
    }
    if(!surname){
      alert('Please specify your surname')
      return
    }
    this.changeNameAndSurname(name, surname)
    if(edition){
      this.setState(prevState => ({edition: !prevState.edition}))
    }
  }

  // calls the function that sends the validation code to delete the account
  async handleDeleteAccount() {
    const { email } = this.state
    // get the validation code
    this.deleteAccount(email);
    this.setState(prevState => ({validateDeletion: !prevState.validateDeletion}))
  }

  // handle the specification of the validation code
  handleChange = (event) => {
    this.setState({code: event.target.value});
  }

  // check if a code is written ad call the verification of the code before the deletion
  async submitValidationCode(code) {
    if(!code){
      alert('Please enter the validation code')
      return
    }
    console.log('code', code)
    const { email } = this.state
    this.deleteAccountVerify(email,code)
  }

  // saves the changes made for the surname and/or the name
  async changeNameAndSurname(name, surname) {
    let data = {
      name: name,
      surname: surname 
    }
    let response=null
    try{
      response = await fetch('/api/change_name_and_surname', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic '+btoa(this.context.token+':unused')
      },
      method: 'POST',
      body: JSON.stringify(data),
     })
     .then(handleFetchHttpErrors)
     .then(response => response.json())
    }catch(err){
      console.log(err)
      if(err.message==="401"){
          alert('Your session have expired, please re-login')
          this.context.setToken('')
          return
      }
      else  {
          alert('Unknown Error')
          return
      }
    }
    console.log(response)
    if(response===undefined){
      alert('Unknown Server Error')
      return
    }
    else{
      let newData = {name: response.newName, surname: response.newSurname}
      this.context.setNameSurname(newData)
      alert('Your changes were saved')
    }
    }

    // send the validation code to the email address to confirm the deletion of the account
    async deleteAccount(email) {
      let data = {
        email: email,
      }
      let response = null
      try{
        response = await fetch('/api/delete_account', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic '+btoa(this.context.token+':unused')
        },
        method: 'POST',
        body: JSON.stringify(data),
       })
       .then(handleFetchHttpErrors)
       .then(response => response.json())
      }catch(err){
        console.log(err)
        if(err.message==="401"){
            alert('Your session have expired, please re-login')
            this.context.setToken('')
            return
        }
        else  {
            alert('Unknown Error')
            return
        }
      }
      }
    
    // verifies the validation code
    // if the code is correct the acount is deleted
    // else an alert is shown
    async deleteAccountVerify(email, code) {
      let data = {
        email: email,
        code: code
      }
      let response=null
      try{
        response = await fetch('/api/delete_account/verify', {
        headers: {
         'Content-Type': 'application/json',
          'Authorization': 'Basic '+btoa(this.context.token+':unused')
        },
        method: 'POST',
        body: JSON.stringify(data),
       })
       .then(handleFetchHttpErrors)
       .then(response => response.json())
      }catch(err){
        console.log(err)
        if(err.message==="415"){
            alert('wrong validation code')
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
      else{
        this.context.setToken('')
        alert('your account was deleted')
    }
    }

    render() {
      const { edition, name, surname } = this.state
      const { nameSurname } = this.context;
    return (
      <div style={{height: window.innerHeight, display: 'flex', flexDirection: 'column'}}>
        <Header page="edit" login={nameSurname}/>
        <div className="editContent">
          <div className="titleContainer">
            <text className="title">Edit your profile here !</text>
            <TouchableOpacity onPress={()=>{this.setState(prevState => ({edition: !prevState.edition}))}}>
              <FiEdit3 size={25}/>
            </TouchableOpacity>
          </div>
          {edition? <div className="titleContainer"><RiAlertFill size={25} color="black"/><text>You are in edition mode</text></div> : null}
          <InfoToEdit info="Name:" fieldValue={name} disabled={!edition} onChange={this.handleNameChange} borderColor={name ? null : 'red'}/>
          <InfoToEdit info="Surname:" fieldValue={surname} disabled={!edition} onChange={this.handleSurnameChange} borderColor={surname ? null : 'red'}/>
          <div className="btnsContainer">
            <button class="saveChangesButton" onClick={()=>this.handleSaveChanges()}>
              Save changes
              <MdCheckCircle size={25} color="green"/>
            </button>
            {
              this.state.validateDeletion
              ?<div className="validateDeletion">
                <TextInput 
                  type="text"
                  value={this.state.code}
                  onChange={this.handleChange}
                  style={{borderBottom: '2px solid red', width: '95%'}}
                  placeholder="Enter the code sent by mail"
                  placeholderTextColor="grey"
                />
                <div style={{paddingTop: '4%'}}>
                  <button onClick={()=>this.submitValidationCode(this.state.code)}>Confirm</button>
                </div>
               </div>
              :<button class="deleteAccountButton" onClick={()=>this.handleDeleteAccount()}>
                Delete my account
                <MdDelete size={25} color="red"/>
               </button>
            }
          </div>
        </div>
      </div>
  );}
}