import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import imag from './imgtest/brainicon.PNG'
import Badge from '@mui/material/Badge';
import {useState} from 'react';
import { useTheme } from '@material-ui/core/styles';
import CancelIcon from '@mui/icons-material/Cancel';
import IconButton from '@mui/material/IconButton';
import { useContext } from 'react';
import { ContextComparison } from './ContextComparison';


//the video selected for the comparison. inside the querybar component
export default function Videoselected({imageurl,title,idx,setAdd}) {
    const removevideo = useContext(ContextComparison)[1];

    return (
        
        <Badge badgeContent={
            <IconButton size="small" color="closexenter">
            <CancelIcon 
                        onClick={()=>{removevideo(idx); setAdd(false)}}
                   
                        color="closexenter"
                        
            ></CancelIcon>
            </IconButton>
            } 
        >
   
    
      <Card sx={{ width: 200 }}>
        <CardMedia
          sx={{ height: 110 }}
          image={"http://img.youtube.com/vi/"+imageurl+"/mqdefault.jpg"}
          title={title}
        />
        <CardActions disableSpacing>
        <Typography noWrap variant="subtitle2" gutterBottom>
        {title}
        </Typography>
            
          
  
        </CardActions>
      </Card>
      </Badge>
    );
  }