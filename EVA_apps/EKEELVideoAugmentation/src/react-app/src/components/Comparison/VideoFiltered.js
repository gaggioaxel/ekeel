import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import imag from './imgtest/brainicon.PNG'

import Skeleton from '@mui/material/Skeleton';

import {useState, useRef} from 'react';
import { useTheme } from '@material-ui/core/styles';
import CancelIcon from '@mui/icons-material/Cancel';
import Paper from '@mui/material/Paper';
import Fade from '@mui/material/Fade';
import Modal from '@mui/material/Modal';
import Backdrop from '@mui/material/Backdrop';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Badge from '@mui/material/Badge';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import { useContext, forwardRef,useEffect } from 'react';
import { ContextComparison } from './ContextComparison';
import ClickAwayListener from '@mui/base/ClickAwayListener';
import CircleIcon from '@mui/icons-material/Circle';
import {TokenContext} from '../account-management/TokenContext';
import FlowChartSmall from './FlowChartSmall.js'
import ReactFlow, { ReactFlowProvider, useReactFlow } from 'reactflow';
import {
  Link,
  Redirect,
} from "react-router-dom";
import HelpIcon from '@mui/icons-material/Help';
import Popover from '@mui/material/Popover';
import { borders } from '@mui/system';
//style={{position:'fixed'}}
const ExpandMore = styled((props) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
})(({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    margin: '0',
    padding:'0',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
}));



//After you select a concept inside the searchbar this will substitute the videoavailable
//this component has more information about the video and you can add or remove for comparison
//and if you click on it, it will show another window with further information and a mini flowchart
const VideoFiltered=forwardRef(({setAnchor2, idx, catalog, querylist,  UpdateCatalogExtra, tottime, conceptextra, titleurl,imageurl,idxurl,concepts,creator},ref)=>{
    
    //used to retrieve anchor for Tutorial component

    const myref=useRef(null)
    useEffect(() => {
        
        if(myref.current != null){
            setAnchor2(myref.current)
        }
        
      }, [myref.current]);

    const [expanded2, setExpanded2] = useState(false);
    const handleExpandClick2 = () => {
        setExpanded2(!expanded2);
    };
    const addvideo = useContext(ContextComparison)[0];
    const removevideo = useContext(ContextComparison)[1];
    const [shadow, setshadow] = useState(0);
    const [open, setOpen] = useState(0);
    const [expanded, setExpanded] = useState(false);
    const [add, setAdd] = useState(false);
    const [hoverm, setHoverm] = useState(false);
    
    const [anchorEl, setAnchorEl] = useState(null);
    const handlePopoverOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handlePopoverClose = () => {
        setAnchorEl(null);
    };
    const opens = Boolean(anchorEl);


    const handleExpandClick = () => {
      setExpanded(!expanded);
    };

    const handleClickAway=()=>{
        setExpanded(false)
    }

    const [bottomval,setBottomVal]=useState(0)
    const handleScroll = (event)=> {
        console.log("scroll: ", event.deltaY)
       

    }


    //to display the raw data information from DB into seconds or hh:mm:ss format

    let duration=0
    let durationSeconds =0;
    let approfondimenti=0
    let approfondimentiSeconds=0;
    let duratatot=0
    let slidishness=0

    if(conceptextra[0]!=undefined ){
   
        slidishness = (conceptextra[0].slides_percentage*100)+"%"
        
    }
    if(tottime != undefined){
        let hours = Math.floor(tottime /3600)

        let remainminutes = Math.abs(hours - (tottime /3600))
        let minutes = Math.floor(remainminutes * 60);
        let seconds = Math.abs(minutes - (remainminutes * 60))
        seconds = seconds*60

        duratatot = (hours<10?("0"+hours):hours).toString()+":"+(minutes<10?("0"+minutes):minutes).toString()+":"+(Math.floor(seconds)<10?("0"+Math.floor(seconds)):Math.floor(seconds)).toString()
    }

    if(conceptextra[0]!=undefined&& conceptextra[0].concept_starttime.length>0){
        for(let i=0; i<conceptextra[0].concept_starttime.length;i++){
            if(conceptextra[0].explain[i] == "conceptDefinition"){
                const time1 = conceptextra[0].concept_endtime[i] .split("^^")[0];
                const time2 = conceptextra[0].concept_starttime[i] .split("^^")[0];
        
                let [hours1, minutes1, seconds1] = time1.split(":");
                seconds1=Math.floor(seconds1)
                seconds1=seconds1+hours1*3600

                seconds1=seconds1+minutes1*60

        
                let [hours2, minutes2, seconds2] = time2.split(":");
                seconds2=Math.floor(seconds2)
                seconds2=seconds2+hours2*3600
                seconds2=seconds2+minutes2*60
        
                let resultseconds = Math.abs(seconds2-seconds1);
    

                duration = duration+resultseconds;
            }
            
        }

        durationSeconds = duration;
        let hours = Math.floor(duration /3600)

        let remainminutes = Math.abs(hours - (duration /3600))
        let minutes = Math.floor(remainminutes * 60);
        let seconds = Math.abs(minutes - (remainminutes * 60))
        seconds = seconds*60

        duration = (hours<10?("0"+hours):hours).toString()+":"+(minutes<10?("0"+minutes):minutes).toString()+":"+(Math.floor(seconds)<10?("0"+Math.floor(seconds)):Math.floor(seconds)).toString()
    }

    if(conceptextra[0]!=undefined&& conceptextra[0].concept_starttime.length>0){
        for(let i=0; i<conceptextra[0].concept_starttime.length;i++){
            if(conceptextra[0].explain[i] == "conceptExpansion"){
                const time1 = conceptextra[0].concept_endtime[i] .split("^^")[0];
                const time2 = conceptextra[0].concept_starttime[i] .split("^^")[0];
        
                let [hours1, minutes1, seconds1] = time1.split(":");
                seconds1=Math.floor(seconds1)
                seconds1=seconds1+hours1*3600

                seconds1=seconds1+minutes1*60

        
                let [hours2, minutes2, seconds2] = time2.split(":");
                seconds2=Math.floor(seconds2)
                seconds2=seconds2+hours2*3600

                seconds2=seconds2+minutes2*60
        
                let resultseconds = Math.abs(seconds2-seconds1);

            
                approfondimenti = approfondimenti+resultseconds;
            }
            
        }

        approfondimentiSeconds = approfondimenti;
        let hours = Math.floor(approfondimenti /3600)

        let remainminutes = Math.abs(hours - (approfondimenti /3600))
        let minutes = Math.floor(remainminutes * 60);
        let seconds = Math.abs(minutes - (remainminutes * 60))
        seconds = seconds*60

        approfondimenti = (hours<10?("0"+hours):hours).toString()+":"+(minutes<10?("0"+minutes):minutes).toString()+":"+(Math.floor(seconds)<10?("0"+Math.floor(seconds)):Math.floor(seconds)).toString()
    }



    return(
        <ClickAwayListener onClickAway={handleClickAway}>
        <div>

         {
            conceptextra.length > 0?
            <Card elevation={shadow}

            color="primary" 
            sx={{ maxWidth: 250 , border: add?"2px solid #C6EBDC": '0px'}}
            onMouseEnter={()=>setshadow(5)}
            onMouseLeave={()=>setshadow(0)}
            onClick={()=>handleExpandClick()/*THI FOR OPEN THE MODAL BUT NOW ITS CHANGED. OLD CODE. JUST FOR REFERENCE setOpen(!open)*/}
            align="left"
            >

        <CardMedia
        sx={{   height: 140,
                margin: 2,
                marginBottom:0,
                }}
        image={"http://img.youtube.com/vi/"+imageurl+"/mqdefault.jpg"}
        title={titleurl}
      />
        <CardContent disableSpacing >

        <Typography noWrap variant="subtitle2" gutterBottom sx={{margin:0}}>
        <b>{titleurl}</b>
        </Typography>
        <Typography noWrap variant="subtitle2" gutterBottom sx={{marginTop:0}}>
        {creator}
        </Typography>
        
        </CardContent>
        <CardActions disableSpacing >
            
            

            <Chip label={"1 match"} size="small" sx={{backgroundColor:"#424242", color:"white"}}/>

            {!add?
            <>
                {
                    idx==0?
                    <div id="anchor2" ref={myref} style={{marginLeft:"auto"}}>
                        <Box
                            
                                sx={{marginLeft: 'auto',
                                    backgroundColor:'#B798f8', 
                                    color:"white",
                                    borderRadius:'20px 0 0 0',
                                    width:'auto',
                                    maxWidth:'200px',
                                    height:"auto",
                                    cursor:"pointer"}}
                                onMouseEnter={()=>setHoverm(true)}
                                onMouseLeave={()=>setHoverm(false)}
                                onClick={e => {e.stopPropagation();addvideo(imageurl,titleurl,setAdd,idxurl);UpdateCatalogExtra(imageurl, durationSeconds, approfondimentiSeconds);}}
                        
                        >
                            {
                                hoverm?
                                <>
                                <Typography variant="body2" display="block" sx={{m:0, pb:0, pt:1, pr:1, pl:1}} gutterBottom>Add video</Typography>
                                <Typography variant="body2" display="block" sx={{m:0, pt:0, pb:1, pr:1, pl:1}} gutterBottom>for comparison</Typography>
                                </>
                                :
                                <>
                            
                                <Typography variant="body2" display="block" sx={{m:0, p:0.5, pl:3, pr:3}} gutterBottom>VS</Typography>
                                
                                
                                </>
                            }
                            
                            
                            </Box>
                    </div>
                    :
                    <div style={{marginLeft:"auto"}}>
                    <Box
                        
                            sx={{marginLeft: 'auto',
                                backgroundColor:'#B798f8', 
                                color:"white",
                                borderRadius:'20px 0 0 0',
                                width:'auto',
                                maxWidth:'200px',
                                height:"auto",
                            cursor:"pointer"}}
                            onMouseEnter={()=>setHoverm(true)}
                            onMouseLeave={()=>setHoverm(false)}
                            onClick={e => {e.stopPropagation();addvideo(imageurl,titleurl,setAdd,idxurl);UpdateCatalogExtra(imageurl, durationSeconds, approfondimentiSeconds);}}
                    
                    >
                        {
                            hoverm?
                            <>

                            <Typography variant="body2" display="block" sx={{m:0, pb:0, pt:1, pr:1, pl:1}} gutterBottom>Add video</Typography>
                            <Typography variant="body2" display="block" sx={{m:0, pt:0, pb:1, pr:1, pl:1}} gutterBottom>for comparison</Typography>

                            </>
                            :
                            <>
                         
                            <Typography variant="body2" display="block" sx={{m:0, p:0.5, pl:3, pr:3}} gutterBottom>VS</Typography>
                            
                            
                            </>
                        }
                        
                        
                        </Box>
                </div>

                }
           </>
            :
            <>
                    <Box
                    sx={{marginLeft: 'auto',
                        backgroundColor:'grey', 
                        color:"black",
                        borderRadius:'20px 0 0 0',
                        width:'auto',
                        maxWidth:'200px',
                        height:"auto"}}
                    onMouseEnter={()=>setHoverm(true)}
                    onMouseLeave={()=>setHoverm(false)}
                    
            
                    >
                    
                        <>

                        <Typography variant="body2" display="block" sx={{m:0, pb:0, pt:1, pr:1, pl:1}} gutterBottom>You already</Typography>
                        <Typography variant="body2" display="block" sx={{m:0, pt:0, pb:1, pr:1, pl:1}} gutterBottom>added this video</Typography>

                        </>
                        
                
                    
                    
                    
                    </Box>
            </>
            }
        </CardActions>
     
      </Card>

      :
      <Stack spacing={0}>
                                
                                <Skeleton variant="rounded" width={200} height={110} />
                                <Skeleton variant="text" sx={{ fontSize: '1rem' ,marginTop: 1, width:"200px"}} />
                                <Skeleton variant="text" sx={{ fontSize: '1rem' ,width: "150px"/* xd */}} />
                                
                                </Stack>
         }
        

        
        
        
        
        
        
        
        
      
        

        <Collapse in={expanded} timeout="auto" unmountOnExit style={{position:'fixed',bottom: 0, left:0, right:0, zIndex:1}}>

            <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
            id="1 COLONNA CENTRALE DATI"
            sx={{p:5}}

            
            >
                <Grid item xs={1}></Grid>
                <Grid id="FIXED ELEMENT COLLAPSE AO" item sx={{backgroundColor:"white", boxShadow:10, p:3, width:"auto",height:"500px",overflow:"auto"}} onWheel={handleScroll}>

                    <Grid
                    container
                    direction="column"
                    justifyContent="center"
                    alignItems="stretch"
                    id="2 SOPRA DATI SOTTO BOTTONE"
                    >
                        <Grid item>
                            <Grid
                            container
                            direction="row"
                            justifyContent="center"

                            alignItems="flex-start"
                            id="3 SX VIDEO, DX DATI"
                            >
                                <Grid item sx={{m:0.5,mt:12}}>

                                    <img src={"http://img.youtube.com/vi/"+imageurl+"/mqdefault.jpg"} alt={titleurl} width="100%" height="auto"/>
                                </Grid>
                                <Grid item sx={{m:0.5}}>
                                    <Grid
                                    container
                                    direction="column"
                                    justifyContent="center"
                                    lignItems="stretch"
                                    id="4 ROW TITOLO DATI BOTTONE"
                                    >
                                        <Grid item sx={{mb:3}}>
                                            <Grid
                                            container
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="flex-start"
                                            id="4 TITOLO"
                                            spacing={2}
                                            >
                                                <Grid item>
                                                    <Grid
                                                    container
                                                    direction="column"
                                                    justifyContent="flex-start"
                                                    alignItems="flex-start"
                                                    id="titolo e creatore"
                                                    >
                                                        <Grid item>
                                                            <Typography variant="subtitle2" gutterBottom>

                                                                <b>{titleurl}</b>   
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item>
                                                            <Typography variant="caption" gutterBottom sx={{color:"grey"}}>

                                                                {creator}
                                                            </Typography>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                                <Grid item>
                                                    <Chip label={<>
                                                        <Typography variant="caption" gutterBottom>

                                                             X | close

                                                        </Typography></>}
                                                        onClick={()=>handleExpandClick()} />
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                        <Grid item sx={{border:2, borderColor:"rgb(223,223,223)", p:3}}>

                                            <Grid
                                            container
                                            direction="row"
                                            justifyContent="center"
                                            alignItems="center"
                                            id="4 DATI"
                                            spacing={3}
                                            >
                                                <Grid item>
                                                    <Grid
                                                    container
                                                    direction="column"
                                                    justifyContent="center"
                                                    alignItems="flex-start"
                                                    id="SX"
                                                    sx={{maxWidth: 500}}
                                                    >
                                                        <Grid item>

                                                            <Typography variant="body2" display="block" gutterBottom>
                                                                Things you must already know to understand this video:

                                                            </Typography>
                                                        </Grid>
                                                        <Grid item sx={{mb:2}}>
                                                            <Grid
                                                            container
                                                            direction="row"
                                                            justifyContent="flex-start"
                                                            alignItems="flex-start"
                                                            id="lista di prerequisiti"
                                                            
                                                            >
                                                            
                                                                {(conceptextra[0]!=undefined&& conceptextra[0].list_preconcept.length>0)?
                                                                conceptextra[0].list_preconcept.map(keyword=>
                                                                    <Grid item xs="auto" key={keyword} sx={{m:0.2}}>
                                                                        <Chip label={keyword} size="small" sx={{backgroundColor:"rgb(232,246,241)"}}/>
                                                                    </Grid>
                                                                ):
                                                                <Grid item xs="auto" sx={{m:0.2}}>
                                                                        <Chip label="empty" size="small" sx={{backgroundColor:"rgb(232,246,241)"}}/>
                                                                    </Grid>
                                                                
                                                                }
                                                            </Grid>
                                                        </Grid>
                                                        <Grid item>

                                                            <Typography variant="body2" display="block" gutterBottom>
                                                                What you are going to learn in this video:
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item>
                                                            <Grid
                                                            container
                                                            direction="row"
                                                            justifyContent="flex-start"
                                                            alignItems="flex-start"
                                                            id="lista di concetti"
                                                            >

                                                                    <Grid item xs="auto" sx={{m:0.2,mb:2}}>
                                                                        <Chip label={querylist[0]} size="small" sx={{backgroundColor:"#424242", color:"white"}}/>
                                                                    </Grid>
                                                               
                                                          
                                                            </Grid>
                                                        </Grid>
                                                        <Grid item>
                                                            <Typography variant="body2" display="block" gutterBottom>
                                                                You will learn also the following related concepts:

                                                            </Typography>
                                                        </Grid>
                                                        <Grid item>
                                                            <Grid
                                                            container
                                                            direction="row"
                                                            justifyContent="flex-start"
                                                            alignItems="flex-start"
                                                            id="lista di concetti"
                                                            >

                                                               
                                                                {(conceptextra[0]!=undefined&& conceptextra[0].list_derivatedconcept.length>0)?
                                                                conceptextra[0].list_derivatedconcept.map(keyword=>
                                                                    <Grid item xs="auto" key={keyword} sx={{m:0.2}}>

                                                                        <Chip label={keyword} size="small"  sx={{ backgroundColor:"#a7d0bf"}}/>

                                                                    </Grid>
                                                                ):
                                                                <Grid item xs="auto" sx={{m:0.2}}>
                                                                        <Chip label="empty" size="small" color="primary"/>
                                                                    </Grid>
                                                                
                                                                }
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                                <Grid item>
                                                    <Grid
                                                    container
                                                    direction="column"
                                                    justifyContent="center"
                                                    alignItems="flex-start"
                                                    id="DX"

                                                    sx={{ml:5}}
                                                    > 
                                                        <Grid item>
                                                            <Typography variant="body2" display="block" gutterBottom>
                                                                Duration:

                                                            </Typography>
                                                        </Grid>
                                                        <Grid item>
                                                            <Grid
                                                            container
                                                            direction="row"
                                                            justifyContent="center"
                                                            alignItems="center"
                                                            id="definizione"
                                                            >
                                                                <Grid item>

                                                                    <CircleIcon sx={{color:"#424242", border:1, borderColor:"#1c1c1c", mr:0.5,borderRadius: '50%'}}/>
                                                                </Grid>
                                                                <Grid item>
                                                                    <Typography variant="caption" gutterBottom>
                                                                        Definition of the concept:

                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item>
                                                                
                                                                        {(conceptextra[0]!=undefined&& conceptextra[0].concept_starttime.length>0)?
                                                                            

                                                                            <Typography variant="subtitle2" gutterBottom sx={{mt:1,ml:0.5}}>{duration}</Typography>
                                                                            :
                                                                            <Typography variant="subtitle2" gutterBottom sx={{mt:1,ml:0.5}}>null</Typography>


                                                                        }
                                                             
                                                                </Grid>
                                                            </Grid>
                                                            
                                                        </Grid>
                                                        <Grid item>
                                                            <Grid
                                                            container
                                                            direction="row"
                                                            justifyContent="center"
                                                            alignItems="center"
                                                            id="approfondimenti"
                                                            >
                                                                <Grid item>

                                                                    <CircleIcon sx={{color:"#8c8c8c" ,border:1, borderColor:"#8c8c8c", mr:0.5,borderRadius: '50%'}}/>
                                                                </Grid>
                                                                <Grid item>
                                                                    <Typography variant="caption" gutterBottom>
                                                                        In depth explaination:

                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item>
                                                                
                                                                        {(conceptextra[0]!=undefined&& conceptextra[0].derivatedconcept_starttime.length>0)?
                                                                            

                                                                            <Typography variant="subtitle2" gutterBottom sx={{mt:1,ml:0.5}}>{approfondimenti}</Typography>
                                                                            :
                                                                            <Typography variant="subtitle2" gutterBottom sx={{mt:1,ml:0.5}}>null</Typography>


                                                                        }
                                                              
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                        <Grid item>
                                                            <Grid
                                                            container
                                                            direction="row"
                                                            justifyContent="center"
                                                            alignItems="center"
                                                            id="durata totale"
                                                            >
                                                                <Grid item>

                                                                    <CircleIcon sx={{color:"rgb(255,255,255)", p:0, mr:0.5}}style={{

                                                                        border: '1px solid grey', // Specifica lo stile del bordo desiderato
                                                                        borderRadius: '50%', // Assicura che il bordo sia arrotondato per creare una forma circolare
                                                                    }}/>
                                                                </Grid>
                                                                <Grid item>
                                                                    <Typography variant="caption" gutterBottom>

                                                                        Whole video:

                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item>
                                                             
                                                                        {(conceptextra[0]!=undefined&& conceptextra[0].derivatedconcept_starttime.length>0)?
                                                                            

                                                                            <Typography variant="subtitle2" gutterBottom sx={{mt:1,ml:0.5}}>{duratatot}</Typography>
                                                                            :
                                                                            <Typography variant="subtitle2" gutterBottom sx={{mt:1,ml:0.5}}>null</Typography>


                                                                        }
                                                               
                                                                </Grid>
                                                            </Grid>
                                                        
                                                        </Grid>
                                                        <Grid item>
                                                            <Grid
                                                            container
                                                            direction="row"
                                                            justifyContent="center"
                                                            alignItems="center"
                                                            id="slide"
                                                            >
                                                                <Grid item>
                                                                    <Typography variant="caption" gutterBottom>

                                                                        Slide presence:

                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item>
                                                                    {/* PUT SLIDE ICON HERE*/}
                                                                </Grid>
                                                                <Grid item>
                                                             
                                                                        {(( conceptextra[0]===undefined ))?
                                                                            

                                                                            <Typography variant="subtitle2" gutterBottom sx={{mt:1,ml:0.5}}>null</Typography>
                                                                            :
                                                                            (conceptextra[0].slides_percentage===undefined)?
                                                                            <Typography variant="subtitle2" gutterBottom sx={{mt:1,ml:0.5}}>null</Typography>
                                                                            :
                                                                            <Typography variant="subtitle2" gutterBottom sx={{mt:1,ml:0.5}}>{slidishness}</Typography>


                                                                        }
                                                               
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>                           
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                       
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid item>

                                            <Box sx={{borderTop: 1,borderBottom: 1, borderColor:"rgb(255,168,37)", m:2, cursor:"pointer"}}>
                                            <Grid
                                            container
                                            direction="column"
                                            justifyContent="center"
                                            alignItems="stretch"
                                            id="COLLAPSE"
                                            onClick={handleExpandClick2}
                                            >
                                                <Grid item>
                                                    <Grid
                                                    container
                                                    direction="row"
                                                    justifyContent="space-between"
                                                    alignItems="center"
                                                    id="SX NOME DX FRECCIA PER GIU"
                                                    >
                                                        <Grid item>


                                                        </Grid>
                                                        <Grid item>

                                                            <Grid
                                                            container
                                                            direction="row"
                                                            justifyContent="flex-start"
                                                            alignItems="center"
                                                            >
                                                                <Grid item>

                                                                    <Typography variant="caption" display="block" gutterBottom sx={{m:0.3}}>
                                                                        Check the concept map

                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item>
                                                                    <HelpIcon
                                                                    onMouseEnter={handlePopoverOpen}
                                                                    onMouseLeave={handlePopoverClose}
                                                                    sx={{color:"rgb(255,168,37)"}}/>
                                                                </Grid>
                                                                            <Popover 
                                                                            sx={{
                                                                                pointerEvents: 'none',
                                                                            }}
                                                                            open={opens}
                                                                            anchorEl={anchorEl}
                                                                            anchorOrigin={{
                                                                                vertical: 'bottom',
                                                                                horizontal: 'left',
                                                                            }}
                                                                            transformOrigin={{
                                                                                vertical: 'top',
                                                                                horizontal: 'right',
                                                                            }}
                                                                            onClose={handlePopoverClose}
                                                                            disableRestoreFocus
                                                                            >

                                                                            <Box sx={{ width: '100%', maxWidth: 200,p:2, border:2,borderColor:"#ffa825"  }}>
                                                                                <Typography variant="body2" gutterBottom>
                                                                                This concept map is a visual representation of how concepts in the video relate to others.

                                                                                </Typography>
                                                                                <Typography variant="body2" gutterBottom>
                                                                                    <ul>
                                                                                    <li>on the <b>left</b> there are the prerequisites of the concept you looked for</li>
                                                                                    <li>on the <b>right</b> there are further concepts entailed in the explanation of the concept you looked for</li>
                                                                                   
                                                                                    </ul>

                                                                                </Typography>
                                                                            </Box>
                                                                            </Popover>
                                                            </Grid>
                                                        </Grid>
                                                        <Grid item>
                                                            <ExpandMore
                                                            expand={expanded2}
                                                    
                                                            aria-expanded={expanded2}
                                                            aria-label="show more"
                                                            >
                                                                <ExpandMoreIcon />
                                                            </ExpandMore>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                                <Grid item>
                                                    <Collapse in={expanded2} timeout="auto" unmountOnExit>
                                                        <Grid
                                                        container
                                                        direction="row"
                                                        justifyContent="center"
                                                        alignItems="center"
                                                        sx={{
                                                            width:"100%",
                                                            height:"500px"
                                                        }}
                                                        >
                                                            <Grid item sx={{width:"100%", height:"100%"}}>
                                                                <ReactFlowProvider>

                                                                    {
                                                                        conceptextra[0]!=undefined?
                                                                        <FlowChartSmall catalog={catalog.filter(video=>video.video_id == conceptextra[0].video_id)} concept={querylist[0]} conceptExtraRaw={conceptextra}/>
                                                                        :
                                                                        <></>
                                                                    }
                                                                    

                                                                </ReactFlowProvider>
                                                            </Grid>
                                                        </Grid>
                                                    </Collapse>
                                                </Grid>
                                            </Grid>
                                            </Box>
                                        </Grid>

                                                                    





                        {/* DA QUI SOTTO CE BOTTONE */}
                        <Grid item>
                            <Grid
                            container
                            direction="row"
                            justifyContent="flex-end"
                            alignItems="center"
                            id="BOTTONE AGIGUNTA"
                            >
                                <Grid item>
                                    {!add?
                                        <>
                                            <Box
                                                    sx={{marginLeft: 'auto',
                                                        backgroundColor:'#B798f8', 
                                                        color:"white",
                                                        borderRadius:'20px 0 0 0',
                                                        width:'auto',
                                                        maxWidth:'200px',
                                                        height:"auto",
                                                    cursor:"pointer"}}
                                                    onMouseEnter={()=>setHoverm(true)}
                                                    onMouseLeave={()=>setHoverm(false)}
                                                    onClick={e => {e.stopPropagation();addvideo(imageurl,titleurl,setAdd,idxurl);}}
                                            
                                            >
                                                {
                                                    hoverm?
                                                    <>

                                                    <Typography variant="body2" display="block" sx={{m:0, pb:0, pt:1, pr:1, pl:1}} gutterBottom>Add video</Typography>
                                                    <Typography variant="body2" display="block" sx={{m:0, pt:0, pb:1, pr:1, pl:1}} gutterBottom>for comparison</Typography>

                                                    </>
                                                    :
                                                    <>
                                                    <Typography variant="body2" display="block" sx={{m:0, p:0.5, pl:3, pr:3}} gutterBottom>VS</Typography>
                                                    </>
                                                }
                                                
                                                
                                                </Box>
                                        </>
                                        :
                                        <>
                                                <Box
                                                sx={{marginLeft: 'auto',
                                                    backgroundColor:'grey', 
                                                    color:"black",
                                                    borderRadius:'20px 0 0 0',
                                                    width:'auto',
                                                    maxWidth:'200px',
                                                    height:"auto"}}
                                                onMouseEnter={()=>setHoverm(true)}
                                                onMouseLeave={()=>setHoverm(false)}
                                                
                                        
                                                >
                                                
                                                    <>

                                                    <Typography variant="body2" display="block" sx={{m:0, pb:0, pt:1, pr:1, pl:1}} gutterBottom>You already</Typography>
                                                    <Typography variant="body2" display="block" sx={{m:0, pt:0, pb:1, pr:1, pl:1}} gutterBottom>added this video</Typography>

                                                    </>
                                                    
                                            
                                                
                                                
                                                
                                                </Box>
                                        </>
                                    }
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={1}></Grid>

            </Grid>

        </Collapse>
        
        
        
        
        
        
        
        
        
      
        </div>
        
        </ClickAwayListener>
    );
});

export default VideoFiltered;