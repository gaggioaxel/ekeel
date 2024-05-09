import React from 'react';
import {
    Link,useLocation
  } from "react-router-dom";
import './Header.css';
import { RiUserSettingsLine } from 'react-icons/ri'
import { FaGripLinesVertical } from 'react-icons/fa'
import { HiOutlineHome } from 'react-icons/hi'
import LoginButton from './LoginButton'
import LogoutButton from '../account-management/logout/LogoutButton'
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

{/*
  The header allows the user to go back to the dasboard, edit his profile, login and logout
  It hase one props which is the login of the user dsiplayed next to the other links
*/}
export default function Header({page,login,onClick}){

    const location = useLocation();
    const mylogin  = login;

    return (
        <div className="header">
          <text className="link">EKEEL</text>
          <div style={{display: 'flex', flexDirection: 'column'}}>
              {/* if the user is on the welcome page we only see the login butto on the header */}
              {page === 'welcome'
              ? <Tooltip title="Login"><Link className="link" style={{fontSize: 20}} to="/login"><LoginButton/></Link></Tooltip>
              :
              page === 'login'
              ?  <Tooltip title=""><Link className="link" style={{fontSize: 20}} onClick={onClick} to="/login"><LoginButton/></Link></Tooltip>
              // else we have the links to the dashboard, edit profile and logout
              : <div style={{flex: 1, display: 'flex', flexDirection: 'row',  alignItems: 'center'}}>
                  <text className="link" style={{fontSize: 20}}>{mylogin}</text>
                  <FaGripLinesVertical size={30} color="white"/>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-around'}}>
                  <Tooltip title ="Home Page">
                      <Link to={`/dashboard`}>
                        <HiOutlineHome size={30} color="white"/>
                      </Link>
                    </Tooltip>
                    
                    <Tooltip title ="Compare videos">
                    
                      <Link to={`/comparisonSearch`} style={{ textDecoration: 'none' }} onClick={()=>{
                        if(location.pathname === '/comparisonSearch'){
                          window.location.reload()
                        }
                        
                        
                        }}>
                      <Box
                                        sx={{
                                            bbackgroundColor: 'transparent',
                                            width:"20px",
                                            height:"20px",
                                            borderRadius:"50%",
                                            border:2,
                                            borderColor:"white",
                                            justifyContent:"center",
                                            alignItems:"center",
                                            p:0.3,
                                            m:0.5
                                        }}>
                      <Typography variant="button" display="block" gutterBottom sx={{color:"white"}}>
                        <b>VS</b>
                        </Typography>
                        </Box>
                      </Link>
                    </Tooltip>
                   
                    <Tooltip title ="Edit Profile">
                      <Link to={`/editProfile/${login}/`}>
                        <RiUserSettingsLine size={30} color="white"/>
                      </Link>
                    </Tooltip>
                    <LogoutButton/>
                  </div>
              </div>}
          </div>
        </div>
  );
}
