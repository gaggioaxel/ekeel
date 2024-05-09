import * as React from 'react';
import { styled, withTheme } from "@material-ui/core/styles"
import Button from '@mui/material/Button';
import './buttonsecondary.css';


//take the Button from MUI and customize the style
const SecondaryColor = styled(withTheme(Button))({
      
  
      background: "rgb(255,168,37)",
      height:"50px",
      borderRadius:'0 15px 15px 0',
      '&:hover': {
      backgroundColor: "#fcb851",
      height:"50px",
      borderRadius:'0 15px 15px 0',
      
    },
  });

//At the click of this button, it will update the querylist state in the Comparison.js with the value cs

export default function Buttonsecondary({AddQueryElement, cs}){
    return <SecondaryColor variant="contained" className="buttonSize" onClick={() => {
      console.log("Buttonsecondary: ",cs);
      AddQueryElement(cs);
      
    }}><b>Search</b></SecondaryColor>
}