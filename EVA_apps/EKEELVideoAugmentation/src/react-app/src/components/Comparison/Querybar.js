import React from 'react';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import Container from '@mui/material/Container';
import './Querybar.css';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Queryinput from './Queryinput.js'
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Secondarybutton from './Buttonsecondary.js'
import { grey } from '@mui/material/colors';
import Videoselected from './Videoselected';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import HelpIcon from '@mui/icons-material/Help';
import Typography from '@mui/material/Typography';
import EastIcon from '@mui/icons-material/East';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Filters from './Filters.js'
import { useHistory } from "react-router-dom";
import { useContext ,useState, forwardRef} from 'react';
import { ContextComparison } from './ContextComparison';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
/*
old chip button for filter
  <Chip 
                                        clickable={false}
                                        sx={expanded?{width:'auto', margin:'5px',backgroundColor:'white'}:{width:'auto',margin:'5px', backgroundColor:"#c6ebdc"}}

                                        
                                        avatar={<TuneRoundedIcon/>}
                                        label={<Typography variant="body1" display="block" gutterBottom sx={{m:0.5}}>
                                        Filters

                                    </Typography>} 
                                        onClick={handleExpandClick}
                                        onDelete={handleExpandClick}
                                        deleteIcon={
                                            <ExpandMore
                                            expand={expanded}
                                    
                                            aria-expanded={expanded}
                                            aria-label="show more"
                                            >
                                                <ExpandMoreIcon />
                                            </ExpandMore>
                                        }
                                    />

*/

//this is the whole component before the listvideo component. It holds the searchbar with the filters and tutorial and the video selected for comparison

const Querybar = forwardRef(({ filterlist, openTutorial,querylist, catalog, catalogExtra, ApplyFilters, searchClicked, listvideo, listconcepts, AddQueryElement, nomatch, location}, ref) => {
    const [expanded, setExpanded] = useState(false);
    const handleExpandClick = () => {
        setExpanded(!expanded);
    };
    
    const listConcepts = useContext(ContextComparison)[3];
    const history = useHistory();

    //this function is used to go to the next page for comparisonresult
    //because we are moving to another route, page, we need to send the information to the other page

    function GoToComparisonResult(){
        
        history.push({
            pathname: '/comparisonResult',
            state: { 
                concept: querylist[0],
                catalog: catalog.filter(video=>{
                    if(listvideo.filter(lv=>lv.img==video.video_id).length > 0){
                        return video.video_id == listvideo.filter(lv=>lv.img == video.video_id)[0].img
                    }else{
                        return false
                    }
                    }),
                catalogExtra: catalogExtra.filter(video=>{
                    if(listvideo.filter(lv=>lv.img==video.video_id).length > 0){
                        return video.video_id == listvideo.filter(lv=>lv.img == video.video_id)[0].img
                    }else{
                        return false
                    }
                    }),
                listConcepts: listConcepts,
                listfilters: filterlist,
            },
        });
    }


    let videos = listvideo.map((video,index) =>
    
        <>
        <Videoselected imageurl={video.img} title={video.title} idx={video.idx} setAdd={video.setAdd}/>
        {index<3?
        <Divider orientation="vertical" flexItem>
                            vs
                        </Divider>:null
        }
                        </>
    );
    return(
        <>
        <Container maxWidth="false" className="containerBig">
            <Container 
                maxWidth = "xl" 
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    }}>
            <Grid
            container
            direction="column"
            justifyContext="center"
            alignItems="stretch">

           
            <Grid item>
                <Grid
                container
                direction="column"
                justifyContent="center"
                alignItems="flex-start"
                spacing={0}
                >
                    <Grid item>
                        <Typography variant="h4" gutterBottom display="block" sx={{mb:0, pb:0}}>
                            <b>VIDEO COMPARISON</b>
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="h6" gutterBottom display="block">
                            <b>Compare videos on a given concept/topic using advanced tools for video comparison</b>
                        </Typography>
                    </Grid>
                    <Grid item>
                        <dl>
                            <dd>
                            <Stack direction="row" spacing={2}>
                                <Typography variant="body1" gutterBottom sx={{pt:3}}>
                                    <b>1. Type in the name of the concept/topic for video search and click</b> 
                                    
                                </Typography>       
                                <Box 
                                
                                    sx={{color:"white", 
                                    backgroundColor:"rgb(255,168,37)", 
                                    height:"40px", 
                                    width:"80px",
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    display: 'flex',
                                    borderRadius:'0 15px 15px 0',
                                    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)'}}>
                                        <Typography variant="body2" gutterBottom  sx={{pt:1}}>
                                        <b>SEARCH</b>
                                        </Typography>
                                        </Box> 
                            </Stack>
                            </dd>
                            <dd>
                                <Stack direction="row" spacing={2}>
                                <Typography variant="body1" gutterBottom display="block" sx={{pt:3}}>
                                    <b>2. Set the filters with the criteria for video comparison and click</b>
                                </Typography>
                                <Box 
                                
                                    sx={{color:"white", 
                                    
                                    height:"40px", 
                                    width:"120px",
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    display: 'flex',
                                    backgroundColor:'#B798f8', borderRadius:'30px 0 30px 0',
                                    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)'}}>
                                        <Grid
                                        container
                                        direction="row"
                                        justifyContent="center"
                                        alignItems="center"
                                        >
                                            <Grid item>


                                                <p style={{color:'white'}}>Set filters</p>

                                            </Grid>
                                            <Grid item>
                                                <EastIcon sx={{color:"#FFFFFF"}}/>
                                            </Grid>
                                        </Grid>
                                        </Box> 
                                </Stack>
                            </dd>
                            <dd>
                            <Stack direction="row" spacing={2}>
                                <Typography variant="body1" gutterBottom display="block" sx={{pt:2}}>
                                    <b>3. Select the videos you want to compare by clicking on </b>
                                </Typography>
                                <Box 
                                
                                    sx={{color:"white", 
                                    
                                    height:"30px", 
                                    width:"80px",
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    display: 'flex',
                                    backgroundColor:'#B798f8', borderRadius:'20px 0 0 0',
                                    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)'}}>
                                       


                                       <Typography variant="body1" gutterBottom display="block" sx={{pt:1.5}}>
                                        VS
                                        </Typography>
                                          
                                </Box> 
                            </Stack>
                            </dd>
                        </dl>
                    </Grid>
                    <Grid item>
                    <Typography variant="body1" gutterBottom display="block">
                    <Stack direction="row" spacing={1}>
                        <b>Use the Help </b>
                            <Box 
                                
                                sx={{color:"white", 
                                
                                height:"20px", 
                                width:"20px",
                                alignItems: 'center',
                                justifyContent: 'center',
                                display: 'flex',
                                backgroundColor:'#FFA825', borderRadius:'50px 50px 50px 50px',
                                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)'}}>
                                   


                                   <Typography variant="body1" gutterBottom display="block" sx={{pt:1.5}}>
                                    <b>?</b>
                                    </Typography>
                                      
                            </Box> 
                            <b>for tips</b>
                            </Stack>
                    </Typography>
                    </Grid>
                </Grid>
            </Grid>
            <Grid>
                <Grid 
                container
                direction="column"
                justifyContent="center"
                alignItems="center"
                sx={{pt:5}}
                >
                  
                    <Grid item id="barra" sx={{m:0,p:0, pb:1}}>
                            <Grid
                            container
                            direction="row"
                            justifyContent="center"
                            alignItems="center"
                            >
                                {

                                    querylist.length > 0 && querylist[0]!=null?
                                    <Grid item sx={{mr:1}}>
                                    <Chip 
                                        
                                        label={<Typography variant="caption" display="block" gutterBottom sx={{color:"white",mt:1}}>
                                            <b>Help</b>
                                            </Typography>}
                                        deleteIcon={<HelpIcon style={{fill:"white"}}/>}

                                        onClick={openTutorial}
                                        onDelete={openTutorial}
                                        sx={{
                                            backgroundColor:"#FFA825"
                                        }}
                                    />

                                        
                              
                                </Grid>
                                :
                                <></>
                                }
                                
                            
                               
                                <Grid item>
                                    <Queryinput listconcepts={listconcepts} AddQueryElement={AddQueryElement} nomatch={nomatch} location={location}/>
                                </Grid>

                                <Grid item>
                                    <div style={{zIndex:1, position:"relative",width:"120px",
                                        height:"50px",}} ref={ref} id="anchor1">
                                {
                                    querylist.length > 0 && querylist[0]!=null?
                                  

                                    <Grid
                                    id="buttonfilter"
                                    container
                                    direction="row"
                                    justifyContent="center"
                                    alignItems="center"
                                    onClick={handleExpandClick}
                                    sx={{
                                        backgroundColor: expanded?"white":"#c6ebdc",
                                        cursor:"pointer",
                                        borderRadius: expanded?"15px 15px 0 0":"50px 50px 50px 50px",
                                        ml:1,
                                        width:"100%",
                                        height:"100%",
                                        pb:expanded?8:0,
                                        position:expanded?"absolute":"static",
                                        top:"7px",
                                        right:"-10px"
                                   
                                        
                                        }}
                                    >
                                        <Grid item>
                                            <TuneRoundedIcon/>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="body1" display="block" gutterBottom sx={{m:0.5}}>
                                                Filters
                                            </Typography>
                                        </Grid>
                                        <Grid item >
                                            <ExpandMore
                                            expand={expanded}
                                    
                                            aria-expanded={expanded}
                                            aria-label="show more"
                                            >
                                                <ExpandMoreIcon />
                                            </ExpandMore>
                                        </Grid>

                                    </Grid>
                                        
                                  
                              

                                :
                                <></>
                                }
                               

                                </div>
                                </Grid>
                                
                            </Grid>
                    </Grid>
                    <Grid item sx={{m:0,p:0}} id="filtri">

                        <Filters ApplyFilters={ApplyFilters} expanded={expanded} />
                    </Grid>
                </Grid>
            </Grid>
            </Grid>
            </Container>
            <br/>
            <br/>
            {
                //searchClicked == false?
                videos.length == 0?
                <></>
                :



                <Container maxWidth = "xl">
                    <Stack
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                        spacing={2}
                    >
                        {videos.length < 4? 
                                ( <>
                                {videos}
                                <Stack spacing={0}>
                                
                                <Skeleton variant="rounded" width={200} height={110} />
                                <Skeleton variant="text" sx={{ fontSize: '1rem' ,marginTop: 1}} />
                                <Skeleton variant="text" sx={{ fontSize: '1rem' ,width: "69%"/* xd */}} />
                                
                                </Stack>
                                <Grid
                                container
                                direction="column"
                                justifyContent="center"
                                alignItems="center"
                                sx={{width:"auto"}}
                                spacing={2}
                                >
                                    <Grid item>
                                        <Box sx={{paddingTop:1}}>
                                            {
                                                videos.length<4?<Chip sx={{backgroundColor:"rgb(198,203,239)"}}label={videos.length+"/4 video selected"} />:<Chip sx={{backgroundColor:"rgb(177,150,255)"}} label="4/4 max reached"  />
                                            }
                                        
                                        </Box>
                                    </Grid>
                                    <Grid item>
                                        {
                                            videos.length >1?
                                            <>
                                                <Typography variant="body2" display="block" gutterBottom>

                                                    Did you pick all of the
                                                </Typography>
                                                <Typography variant="body2" display="block" gutterBottom>
                                                    videos you are interested in?

                                                </Typography>
                                            </>
                                            :
                                            <>
                                                <Typography variant="body2" display="block" gutterBottom sx={{pb:0, mb:0}}>

                                                    <b>Choose</b> at least <b>one more</b>
                                                </Typography>
                                                <Typography variant="body2" display="block" gutterBottom sx={{pt:0, mt:0}}>
                                                    <b>video</b> to compare them

                                                </Typography>
                                            </>
                                        }
                                        
                                    </Grid>
                                    <Grid item>
                                        <Chip
                                        disabled={videos.length>1?false:true}
                                        label={<Typography variant="body2" gutterBottom sx={{pt:1}}>

                                       Compare these videos

                                      </Typography>}
                                        onClick={GoToComparisonResult}
                                        onDelete={GoToComparisonResult}
                                        deleteIcon={<EastIcon />}
                                        sx={{backgroundColor:"white"}}
                                        />
                                    </Grid>

                                </Grid>
                                
                                </>
                                ) :
                                <>
                                {videos}
                                <Grid
                                container
                                direction="column"
                                justifyContent="center"
                                alignItems="center"
                                sx={{width:"auto"}}
                                spacing={2}
                                >
                                    <Grid item>
                                        <Box sx={{paddingTop:1}}>
                                            {
                                                videos.length<4?<Chip sx={{backgroundColor:"rgb(198,203,239)"}}label={videos.length+"/4 video selected"} />:<Chip sx={{backgroundColor:"rgb(177,150,255)"}} label="4/4 max reached"  />
                                            }
                                        
                                        </Box>
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="body2" display="block" gutterBottom>

                                            You reached the <b>max</b> 
                                        </Typography>
                                        <Typography variant="body2" display="block" gutterBottom>
                                            <b>number</b> of comparable videos

                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <Chip

                                     
                                        label={<Typography variant="body2" gutterBottom sx={{pt:1}}>
                                       Compare these videos

                                      </Typography>}
                                        onClick={GoToComparisonResult}
                                        onDelete={GoToComparisonResult}
                                        deleteIcon={<EastIcon />}

                                        sx={{backgroundColor:"white"}}

                                        />
                                    </Grid>

                                </Grid>
                                
                                </>
                            }
                        
                    </Stack>
                    <br/>
                    <br/>
                    <br/>
                
                    
                </Container>





            }
            
        </Container>


        

        </>
    );
});

export default Querybar;