import React from "react";
import {TokenContext} from './../TokenContext'
import './LogoutButton.css'
import { TouchableOpacity } from 'react-native-web'
import { IoMdExit } from 'react-icons/io'
import Tooltip from '@material-ui/core/Tooltip';

/**
 * React component used in the App Header
 */
export default class LogoutButton extends React.Component {

    render(){
        return(
            <TokenContext.Consumer>
                 {(context)=> (
                    <Tooltip title ="Logout">
                        <TouchableOpacity onPress = {()=>context.setToken('')}>
                            <IoMdExit size={30} color="white"/>
                        </TouchableOpacity>
                    </Tooltip>
                                    
                )}
            </TokenContext.Consumer>
        )
    }
}