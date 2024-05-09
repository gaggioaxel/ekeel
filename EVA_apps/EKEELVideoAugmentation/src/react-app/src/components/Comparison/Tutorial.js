import React from 'react';
import Modal from '@mui/material/Modal';
import {useState, useEffect,useRef} from 'react';
import EastIcon from '@mui/icons-material/East';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import WestIcon from '@mui/icons-material/West';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Popover from '@mui/material/Popover';
import tutorialPic from './tutorialpic.PNG';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

//its the tutorial window that popup and jump to anchors to present the tutorial to the user

export default function Tutorial({anchor1,anchor2, open, closeTutorial}){


    const[page,setPage]=useState(0)
    const [anchorEl, setAnchorEl] = useState([null,null,null,null]);
    const [openLOAD, setOpen] = useState(false);
    const handleClickLOAD = () => {
        setOpen(true);
      };

      const handleCloseLOAD = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
    
        setOpen(false);
      };
    const Alert = React.forwardRef(function Alert(props, ref) {
        return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
      });

    //this useEffect used to update the anchors when the value of anchor1 and anchor2 will update from null to a accepted value

    useEffect(() => {
        setAnchorEl([anchorEl[0],anchor1.current,anchorEl[2],anchorEl[3]])
      }, [anchor1.current]);

    useEffect(()=>{
        setAnchorEl([anchorEl[0],anchorEl[1],anchor2,anchorEl[3]])
    },[anchor2])
    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
     // setAnchorEl(null);
    };

    const onCloseTutorial=()=>{
        setPage(0)
        closeTutorial()
    }

    function NextPage(){

        if(anchor1 == null){
            handleClickLOAD()
            return
        }
        if(anchor2== null){
            handleClickLOAD()
            return
        }

        if(page==0 && anchor1.current != null){
            anchor1.current.style.zIndex=10000;
            document.getElementById("anchor1").scrollIntoView();
        }else{

            anchor1.current.style.zIndex="auto";

        }

        if(page==1 && anchor2!= null){
            anchor2.style.zIndex=10000;
            document.getElementById("anchor2").scrollIntoView();
        }else{

            anchor2.style.zIndex="auto";

        }
        if(page<3){
            setPage(page+1)
            
        }else{

        }
        if(page==3){
            onCloseTutorial()
        }
    }

    function PreviousPage(){
        if(page==2 && anchor1.current != null){
            anchor1.current.style.zIndex=10000;
        }else{
            anchor1.current.style.zIndex="auto";
        }
        if(page==3 && anchor2.current != null){
            anchor2.style.zIndex=10000;
        }else{
            anchor2.style.zIndex="auto";
        }
        if(page >0){
            setPage(page-1)
        }else{

        }
    }

    return(<>
    <Snackbar open={openLOAD} autoHideDuration={6000} onClose={handleCloseLOAD}>
        <Alert severity="warning"><b>Wait until content is loaded!</b></Alert>
      </Snackbar>
    <Modal
    open={open}
    aria-labelledby="modal-modal-title"
    aria-describedby="modal-modal-description"
    id="modale"
    >

        {
            page==0?
            <>
                <Popover
        
                sx={{ display: "flex",
                alignItems: "center",
                justifyContent:"center",
                
                }}
             

                id="account-menu"
                open="true"
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                elevation: 0,
                sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    mt: 1.5,
                    '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                    },
                    '&:before': {
                    content: '""',
                    display: page==0?'none':page==3?'none':'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                    },
                },
                }}
              
                anchorReference="anchorPosition"
                anchorPosition={{ top:window.innerHeight/2, left: window.innerWidth/2}}
                transformOrigin={{
                    vertical: 'center',
                    horizontal: 'center',
                  }}
            >
                <Grid
                id="primoGrid"
                container
                direction="column"
                justifyContent="center"
                alignItems="stretch"
                sx={{m:0,p:0}}
                >
                    <Grid item sx={{pl:2,pr:2,pt:2}}>
                        <Grid
                        container
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        >
                            <Grid item>
                                <Typography variant="caption" display="block" gutterBottom>
                                    {page+1}/4
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="caption" display="block" gutterBottom onClick={onCloseTutorial}>
                                    close | x
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item sx={{pl:2,pr:2}}>
                        <Grid
                        container
                        direction="column"
                        justifyContent="flex-start"
                        alignItems="center"
                        >   {page==0?
                            <>
                            <Grid item>
                                <Typography variant="h6" gutterBottom>
                                    <b>Too many videos?</b>
                                </Typography>
                            </Grid>
                            </>
                            :
                                page==1?
                                    <>
                                        <Grid item>
                                            <Typography variant="h6" gutterBottom>
                                                Set your filters for video
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="h6" gutterBottom>
                                                search
                                            </Typography>
                                        </Grid>
                                    </>
                                    :
                                    page==2?
                                    <>
                                        <Grid item>
                                            <Typography variant="h6" gutterBottom>
                                                Click
                                            </Typography>
                                            <Typography variant="h6" gutterBottom>
                                                to choose and
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="h6" gutterBottom>
                                                compare up to 4 videos
                                            </Typography>
                                        </Grid>
                                    </>
                                    :
                                    page==3?
                                    <>
                                        <Grid item>
                                            <Typography variant="h6" gutterBottom>
                                                Compare video stats and
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="h6" gutterBottom>
                                                choose the best video for
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="h6" gutterBottom>
                                                your needs!
                                            </Typography>
                                        </Grid>
                                    </>
                                    :
                                    <></>
                            }
                        </Grid>
                    </Grid>
                    <Grid item sx={{pl:2,pr:2}}>
                        <Grid
                        container
                        direction="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        >
                            {
                                page==0?
                                
                                <>
                                    <Grid item>
                                        <Typography variant="caption" display="block" gutterBottom sx={{m:0,p:0}}>
                                            Don't worry,
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="caption" display="block" gutterBottom sx={{m:0,p:0}}>
                                            we'll <b>help</b> you out!
                                        </Typography>
                                    </Grid>
                                </>
                                :
                                page==1?
                                    <>
                                        <Grid item>
                                            <Typography variant="caption" display="block" gutterBottom>
                                                Here you can select video
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="caption" display="block" gutterBottom>
                                                duration, expertise level and
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="caption" display="block" gutterBottom>
                                                other features to get the perfect
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="caption" display="block" gutterBottom>
                                                video you are looking for!
                                            </Typography>
                                        </Grid>
                                    </>
                                    :
                                    page==2?
                                    <>
                                        <Grid item>
                                            <Typography variant="caption" display="block" gutterBottom>
                                                Are there too many videos <b>and you don't know</b>
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="caption" display="block" gutterBottom>
                                                <b>which one to watch?</b>
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="caption" display="block" gutterBottom>
                                                <b>compare them</b> and find what suits you best!
                                            </Typography>
                                        </Grid>
                                    </>
                                    :
                                    page==3?
                                    <>
                                        <Grid item>
                                            <Typography variant="caption" display="block" gutterBottom>
                                                After choosing all the videos you want to compare
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="caption" display="block" gutterBottom>
                                                you will be able to access <b>all the stats</b> regarding:
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <ul>
                                                <li>
                                                    <Typography variant="caption" display="block" gutterBottom>
                                                        <b>Duration</b> of the whole video and also of the specific parts about the concept
                                                    </Typography>
                                                </li>
                                                <li>
                                                    <Typography variant="caption" display="block" gutterBottom>
                                                        <b>What you should already know</b>
                                                    </Typography>
                                                </li>
                                                <li>
                                                    <Typography variant="caption" display="block" gutterBottom>
                                                        <b>What you'll learn</b>
                                                    </Typography>
                                                </li>
                                                <li>
                                                    <Typography variant="caption" display="block" gutterBottom>
                                                        Whether or not you'll find any <b>slides</b> in the video
                                                    </Typography>
                                                </li>
                                            </ul>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="body2" display="block" gutterBottom>
                                                What are you waiting for?
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="body2" display="block" gutterBottom>
                                                <b>Try it yourself!</b>
                                            </Typography>
                                        </Grid>
                                    </>
                                    :
                                    <></>
                            }
                            
                        </Grid>
                    </Grid>
                    <Grid item sx={{pt:2}}>
                        <Grid
                        container
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        >
                            {
                                page==0?
                                <>
                                    <Grid item>

                                    </Grid>
                                </>
                                :
                                <>
                                    <Grid item xs="auto" sx={{p: 2 ,backgroundColor:'#B798f8', borderRadius:'0 50px 0 50px'}} onClick={PreviousPage}>
                                        <Grid
                                        container
                                        direction="row"
                                        justifyContent="center"
                                        alignItems="center"
                                        >
                                        
                                            <Grid item>
                                                <WestIcon sx={{color:"#FFFFFF"}}/>
                                            </Grid>
                                            <Grid item>
                                                <p style={{color:'white'}}>Back</p>
                                            </Grid>
                                                    
                                            
                                            
                                        </Grid>
                                    </Grid>
                                </>
                            }
                            
                            <Grid item xs="auto" sx={{m:0 ,pl:2,pt:1,pr:1,pb:0.5 ,backgroundColor:'#917FC7', borderRadius:'25px 0 3px 0'}} onClick={NextPage}>
                                <Grid
                                container
                                direction="row"
                                justifyContent="center"
                                alignItems="center"
                                sx={{m:0,p:0}}
                                >
                                    
                                    <Grid item sx={{m:0,p:0}}>
                                        <Typography variant="body2" gutterBottom sx={{color:"white", p:0,m:0}}>
                                            <b>Next</b>
                                        </Typography>
                                    </Grid>
                                    <Grid item sx={{m:0,p:0,pl:0.5}}>
                                        <EastIcon sx={{color:"#FFFFFF", width:"15px", height:"15px"}}/>
                                    </Grid>
                                        
                                    
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Popover>
            </>
            :
            page==3?
            <>
                <Popover
                sx={{ display: "flex",
                alignItems: "center",
                justifyContent:"center",
                }}
          

                id="account-menu"
                open="true"
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                elevation: 0,
                sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    mt: 1.5,
                    '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                    },
                    '&:before': {
                    content: '""',
                    display: page==0?'none':page==3?'none':'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                    },
                },
                }}
       
                anchorReference="anchorPosition"
                anchorPosition={{ top:window.innerHeight/2, left: window.innerWidth/2}}
                transformOrigin={{
                    vertical: 'center',
                    horizontal: 'center',
                  }}
            >
                <Grid
                id="primoGrid"
                container
                direction="column"
                justifyContent="center"
                alignItems="stretch"
            
                >
                    <Grid item sx={{pl:2,pr:2,pt:2}}>
                        <Grid
                        container
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        >
                            <Grid item>
                                <Typography variant="caption" display="block" gutterBottom>
                                    {page+1}/4
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="caption" display="block" gutterBottom onClick={onCloseTutorial}>
                                    close | x
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item sx={{pl:2,pr:2}}>
                        <Grid
                        container
                        direction="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        >   {page==0?
                            <>
                            <Grid item>
                                <Typography variant="h6" gutterBottom>
                                    Too many videos?
                                </Typography>
                            </Grid>
                            </>
                            :
                                page==1?
                                    <>
                                        <Grid item>
                                            <Typography variant="h6" gutterBottom>
                                                Set your filters for video
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="h6" gutterBottom>
                                                search
                                            </Typography>
                                        </Grid>
                                    </>
                                    :
                                    page==2?
                                    <>
                                        <Grid item>
                                            <Typography variant="h6" gutterBottom>
                                                Click
                                            </Typography>
                                            <Typography variant="h6" gutterBottom>
                                                to choose and
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="h6" gutterBottom>
                                                compare up to 4 videos
                                            </Typography>
                                        </Grid>
                                    </>
                                    :
                                    page==3?
                                    <>
                                        <Grid item>
                                            <Typography variant="h6" gutterBottom sx={{m:0,p:0}}>
                                                <b>Compare video stats and</b>
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="h6" gutterBottom sx={{m:0,p:0}}>
                                                <b>choose the best video for</b>
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="h6" gutterBottom sx={{m:0,p:0}}>
                                                <b>your needs!</b>
                                            </Typography>
                                        </Grid>
                                        
                                    </>
                                    :
                                    <></>
                            }
                        </Grid>
                    </Grid>
                    <Grid item>
                        <Grid 
                            container
                            direction="column"
                            justifyContent="center"
                            alignItems="center"
                        >
                            <Grid item sx={{width:"50%"}}>
                                <img src={tutorialPic}  width="100%" height="auto"/>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item sx={{pl:2,pr:2}}>
                        <Grid
                        container
                        direction="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        >
                            {
                                page==0?
                                
                                <>
                                    <Grid item>
                                        <Typography variant="caption" display="block" gutterBottom>
                                            Don't worry,
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="caption" display="block" gutterBottom>
                                            we'll <b>help</b> you out!
                                        </Typography>
                                    </Grid>
                                </>
                                :
                                page==1?
                                    <>
                                        <Grid item>
                                            <Typography variant="caption" display="block" gutterBottom>
                                                Here you can select video
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="caption" display="block" gutterBottom>
                                                duration, expertise level and
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="caption" display="block" gutterBottom>
                                                other features to get the perfect
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="caption" display="block" gutterBottom>
                                                video you are looking for!
                                            </Typography>
                                        </Grid>
                                    </>
                                    :
                                    page==2?
                                    <>
                                        <Grid item>
                                            <Typography variant="caption" display="block" gutterBottom>
                                                Are there too many videos <b>and you don't know</b>
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="caption" display="block" gutterBottom>
                                                <b>which one to watch?</b>
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="caption" display="block" gutterBottom>
                                                <b>compare them</b> and find what suits you best!
                                            </Typography>
                                        </Grid>
                                    </>
                                    :
                                    page==3?
                                    <>
                                        <Grid item>
                                            <Typography variant="caption" display="block" gutterBottom>
                                                After choosing all the videos you want to compare
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="caption" display="block" gutterBottom>
                                                you will be able to access <b>all the stats</b> regarding:
                                            </Typography>
                                        </Grid>
                                        <Grid item sx={{pl:2.5}}>
                                            <ul style={{padding:"0"}}>
                                                <li>
                                                    <Typography variant="caption" display="block" gutterBottom sx={{m:0,p:0}}>
                                                        <b>Duration</b> of the whole video and also of the 
                                                    </Typography>
                                                    <Typography variant="caption" display="block" gutterBottom sx={{m:0,p:0}}>
                                                        specific parts about the concept
                                                    </Typography>
                                                   
                                                </li>
                                                <li>
                                                    <Typography variant="caption" display="block" gutterBottom>
                                                        <b>What you should already know</b>
                                                    </Typography>
                                                </li>
                                                <li>
                                                    <Typography variant="caption" display="block" gutterBottom>
                                                        <b>What you'll learn</b>
                                                    </Typography>
                                                </li>
                                                <li>
                                                    <Typography variant="caption" display="block" gutterBottom>
                                                        Whether or not you'll find any <b>slides</b> in the video
                                                    </Typography>
                                                </li>
                                            </ul>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="body2" display="block" gutterBottom>
                                                What are you waiting for?
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="body2" display="block" gutterBottom>
                                                <b>Try it yourself!</b>
                                            </Typography>
                                        </Grid>
                                    </>
                                    :
                                    <></>
                            }
                            
                        </Grid>
                    </Grid>
                    <Grid item sx={{pt:2}}>
                        <Grid
                        container
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        >
                            {
                                page==0?
                                <>
                                    <Grid item>

                                    </Grid>
                                </>
                                :
                                <>
                                    <Grid item xs="auto" sx={{m:0 ,pl:1,pt:1,pr:2,pb:0.5 ,backgroundColor:'#BDB5D1', borderRadius:'0 25px 0 3px'}} onClick={PreviousPage}>
                                        <Grid
                                        container
                                        direction="row"
                                        justifyContent="center"
                                        alignItems="center"
                                        >
                                        
                                            <Grid item sx={{m:0,p:0,pr:0.5}}>
                                                <WestIcon sx={{color:"#FFFFFF", width:"15px", height:"15px"}}/>
                                            </Grid>
                                            <Grid item>
                                                <Typography variant="body2" gutterBottom sx={{color:"white", p:0,m:0}}>
                                                    <b>Back</b>
                                                </Typography>
                                            </Grid>
                                                    
                                            
                                            
                                        </Grid>
                                    </Grid>
                                </>
                            }
                            <Grid item xs="auto" sx={{m:0 ,pl:2,pt:1,pr:1,pb:0.5 ,backgroundColor:'#917FC7', borderRadius:'25px 0 3px 0'}} onClick={NextPage}>
                                <Grid
                                container
                                direction="row"
                                justifyContent="center"
                                alignItems="center"
                                sx={{m:0,p:0}}
                                >
                                    
                                 
                                    <Grid item>
                                        <Typography variant="body2" gutterBottom sx={{color:"white", p:0,m:0}}>
                                            <b>Got it, thanks</b>
                                        </Typography>
                                    </Grid>
                                    
                                </Grid>
                            </Grid>
                            
                        </Grid>
                    </Grid>
                </Grid>
            </Popover>
            </>
            :
            <>
                <Popover
                sx={{ display: "flex",
                alignItems: "center",
                justifyContent:"center",
                mt:2,
                ml:-5
                }}
                anchorEl={anchorEl[page]}

                id="account-menu"
                open="true"
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                elevation: 0,
                sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    mt: 1.5,
                    '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                    },
                    '&:before': {
                    content: '""',
                    display: page==0?'none':page==3?'none':'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 20,
                    height: 20,
                    bgcolor: 'background.paper',
                    transform: page==1?'translateY(-50%) rotate(45deg)':'translateY(80px) translateX(120%) rotate(45deg)',
                    zIndex: 0,
                    },
                },
                }}
                transformOrigin={{ horizontal: 'right', vertical: page==1?'top':'center' }}
                anchorOrigin={{ horizontal: page==1?'right':'left', vertical: page==1?'bottom':'center' }}
                anchorReference='anchorEl'
            >
                <Grid
                id="primoGrid"
                container
                direction="column"
                justifyContent="center"
                alignItems="stretch"
            
                >
                    <Grid item sx={{pl:2,pr:2, pt:2}}>
                        <Grid
                        container
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        >
                            <Grid item>
                                <Typography variant="caption" display="block" gutterBottom>
                                    {page+1}/4
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="caption" display="block" gutterBottom onClick={onCloseTutorial}>
                                    close | x
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item sx={{pl:2,pr:2}}>
                        <Grid
                        container
                        direction="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        >   {page==0?
                            <>
                            <Grid item>
                                <Typography variant="h6" gutterBottom>
                                    Too many videos?
                                </Typography>
                            </Grid>
                            </>
                            :
                                page==1?
                                    <>
                                        <Grid item >
                                            <Typography variant="h6" gutterBottom sx={{m:0,p:0}}>
                                                <b>Set your filters for video</b>
                                            </Typography>
                                        </Grid>
                                        <Grid item >
                                            <Typography variant="h6" gutterBottom sx={{m:0,p:0}}>
                                                <b>search</b>
                                            </Typography>
                                        </Grid>
                                    </>
                                    :
                                    page==2?
                                    <>
                                        <Grid item>
                                            <Typography variant="h6"  gutterBottom sx={{m:0,p:0}}>
                                                <b>Click</b>
                                         
                                            <Box
                                                sx={{ml:1,mr:1,
                                                    display:'inline',
                                                    backgroundColor:'#B798f8', 
                                                    color:"white",
                                                    borderRadius:'20px 0 0 0',
                                                    width:'auto',
                                                    maxWidth:'30px',
                                                    height:"auto"}}
                                               
                                            >
                                                <Typography variant="body2" display="inline" sx={{m:0, p:0.5, pl:2, pr:2}} gutterBottom>VS</Typography>
                                            </Box>
                                         
                                                <b>to choose and</b>
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="h6" gutterBottom sx={{m:0,p:0}}>
                                                <b>compare up to 4 videos</b>
                                            </Typography>
                                        </Grid>
                                    </>
                                    :
                                    page==3?
                                    <>
                                        <Grid item>
                                            <Typography variant="h6" gutterBottom>
                                                Compare video stats and
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="h6" gutterBottom>
                                                choose the best video for
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="h6" gutterBottom>
                                                your needs!
                                            </Typography>
                                        </Grid>
                                    </>
                                    :
                                    <></>
                            }
                        </Grid>
                    </Grid>
                    <Grid item sx={{pl:2,pr:2,pt:2}}>
                        <Grid
                        container
                        direction="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        >
                            {
                                page==0?
                                
                                <>
                                    <Grid item>
                                        <Typography variant="caption" display="block" gutterBottom >
                                            Don't worry,
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="caption" display="block" gutterBottom>
                                            we'll <b>help</b> you out!
                                        </Typography>
                                    </Grid>
                                </>
                                :
                                page==1?
                                    <>
                                        <Grid item>
                                            <Typography variant="caption" display="block" gutterBottom sx={{m:0,p:0}}>
                                                Here you can select video duration,
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="caption" display="block" gutterBottom sx={{m:0,p:0}}>
                                                expertise level and other features to get
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="caption" display="block" gutterBottom sx={{m:0,p:0}}>
                                                the perfect video you are looking for!
                                            </Typography>
                                        </Grid>
                                     
                                    </>
                                    :
                                    page==2?
                                    <>
                                        <Grid item>
                                            <Typography variant="caption" display="block" gutterBottom sx={{m:0,p:0}}>
                                                Are there too many videos <b>and you don't know</b>
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="caption" display="block" gutterBottom sx={{m:0,p:0}}> 
                                                <b>which one to watch?</b>
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="caption" display="block" gutterBottom sx={{m:0,pt:1}}>
                                                <b>compare them</b> and find what suits you best!
                                            </Typography>
                                        </Grid>
                                    </>
                                    :
                                    page==3?
                                    <>
                                        <Grid item>
                                            <Typography variant="caption" display="block" gutterBottom>
                                                After choosing all the videos you want to compare
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="caption" display="block" gutterBottom>
                                                you will be able to access <b>all the stats</b> regarding:
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <ul>
                                                <li>
                                                    <Typography variant="caption" display="block" gutterBottom>
                                                        <b>Duration</b> of the whole video and also of the specific parts about the concept
                                                    </Typography>
                                                </li>
                                                <li>
                                                    <Typography variant="caption" display="block" gutterBottom>
                                                        <b>What you should already know</b>
                                                    </Typography>
                                                </li>
                                                <li>
                                                    <Typography variant="caption" display="block" gutterBottom>
                                                        <b>What you'll learn</b>
                                                    </Typography>
                                                </li>
                                                <li>
                                                    <Typography variant="caption" display="block" gutterBottom>
                                                        Whether or not you'll find any <b>slides</b> in the video
                                                    </Typography>
                                                </li>
                                            </ul>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="body2" display="block" gutterBottom>
                                                What are you waiting for?
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="body2" display="block" gutterBottom>
                                                <b>Try it yourself!</b>
                                            </Typography>
                                        </Grid>
                                    </>
                                    :
                                    <></>
                            }
                            
                        </Grid>
                    </Grid>
                    <Grid item sx={{pt:2}}>
                        <Grid
                        container
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        >
                            {
                                page==0?
                                <>
                                    <Grid item>

                                    </Grid>
                                </>
                                :
                                <>
                                    <Grid item xs="auto" sx={{m:0 ,pl:1,pt:1,pr:2,pb:0.5 ,backgroundColor:'#BDB5D1', borderRadius:'0 25px 0 3px'}} onClick={PreviousPage}>
                                        <Grid
                                        container
                                        direction="row"
                                        justifyContent="center"
                                        alignItems="center"
                                        >
                                        
                                            <Grid item sx={{m:0,p:0,pr:0.5}}>
                                                <WestIcon sx={{color:"#FFFFFF", width:"15px", height:"15px"}}/>
                                            </Grid>
                                            <Grid item>
                                                <Typography variant="body2" gutterBottom sx={{color:"white", p:0,m:0}}>
                                                    <b>Back</b>
                                                </Typography>
                                            </Grid>
                                                    
                                            
                                            
                                        </Grid>
                                    </Grid>
                                </>
                            }
                            
                            <Grid item xs="auto" sx={{m:0 ,pl:2,pt:1,pr:1,pb:0.5 ,backgroundColor:'#917FC7', borderRadius:'25px 0 3px 0'}} onClick={NextPage}>
                                <Grid
                                container
                                direction="row"
                                justifyContent="center"
                                alignItems="center"
                                sx={{m:0,p:0}}
                                >
                                    
                                    <Grid item sx={{m:0,p:0}}>
                                        <Typography variant="body2" gutterBottom sx={{color:"white", p:0,m:0}}>
                                            <b>Next</b>
                                        </Typography>
                                    </Grid>
                                    <Grid item sx={{m:0,p:0,pl:0.5}}>
                                        <EastIcon sx={{color:"#FFFFFF", width:"15px", height:"15px"}}/>
                                    </Grid>
                                        
                                    
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Popover>
            </>
        }
    
    </Modal>
    </>);
}