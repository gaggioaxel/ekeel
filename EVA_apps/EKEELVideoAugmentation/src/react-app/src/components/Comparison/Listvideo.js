import React from 'react';
import Container from '@mui/material/Container';
import { Autocomplete } from '@mui/material';
import { TextField } from '@material-ui/core';
import './Querybar.css';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Videoavailable from "./Videoavailable.js"
import VideoFiltered from "./VideoFiltered.js"
import {TokenContext} from '../account-management/TokenContext';
import { useContext, forwardRef, useState,useEffect } from 'react';
import Modal from '@mui/material/Modal';
import Popover from '@mui/material/Popover';
import { useHistory } from "react-router-dom";
import { FaWindows } from 'react-icons/fa';

//this component is used for the layout of all video available or filtered.
//it uses VideoAvailable component when you dont use the search bar
//it uses videoFiltered when you search for a concept
const Listvideo = forwardRef(({setAnchor2, UpdateCatalogExtra, catalogExtra, catalog,loading, querylist, catalogoriginal}, ref)=>{
    
    //At below of the page you will notice the list of concepts clickable. This will update the Searchbar
    const history = useHistory();
    function SendData(value){
        history.push({
            pathname: '/comparisonSearch',
            state: { data: value },
        });
        window.location.reload()
    }
    
    const context = useContext(TokenContext);

    //used for popup tutorial. not anymore
    const [open,setOpen] = useState(false)
    function openhelper(){
        setOpen(true)
    }
    function closehelper(){
        setOpen(false)
    }

    //used to display more concepts as buttons at bottom of page
    const[listconcept,setListConcept]=useState([])
    useEffect(() => {
        if (querylist.length > 0 && querylist[0]!=null) { 
          
            let newlistconcepts=[]
            catalog.map(video=>{
                
                video.extracted_keywords.map(concept=>{
                    
                    if(!newlistconcepts.includes(concept)){
                        newlistconcepts = [...newlistconcepts, concept];
                    }
                })
            })
            setListConcept(newlistconcepts);
        }
      }, [querylist]);



    return (
    <>
    <Container maxWidth = "xl" >
            <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={2}
        sx={{p:5}}
        >


        {loading
              ? null
              :

            querylist.length > 0 && querylist[0]!=null?
            catalog.map((video,idx)=>{
                let singlecatExtra = catalogExtra.filter(extra =>video.video_id == extra.video_id)

                return(<>
                    {
                        idx==0?
                        <Grid key={video._id.$oid} item xs={12} xl={2} md={3} >
                        <VideoFiltered setAnchor2={setAnchor2} idx={idx} catalog={catalog} querylist={querylist} UpdateCatalogExtra={UpdateCatalogExtra} tottime={video.duration} conceptextra={singlecatExtra} titleurl={video.title} imageurl={video.video_id} idxurl={video._id.$oid} concepts={video.extracted_keywords} creator={video.creator}/>
                        </Grid>
                        :
                        <Grid key={video._id.$oid} item xs={12} xl={2} md={3} >
                        <VideoFiltered setAnchor2={setAnchor2} idx={idx} catalog={catalog} querylist={querylist} UpdateCatalogExtra={UpdateCatalogExtra} tottime={video.duration} conceptextra={singlecatExtra} titleurl={video.title} imageurl={video.video_id} idxurl={video._id.$oid} concepts={video.extracted_keywords} creator={video.creator}/>
                        </Grid>
                    }
                    </>
                );
                
                
                
            })
            :
        catalog.map(video=>{
          
            return(
                
                <Grid key={video._id.$oid} item xs={12} xl={2} md={3} >
                    <Videoavailable titleurl={video.title} imageurl={video.video_id} idxurl={video._id.$oid} concepts={video.extracted_keywords} creator={video.creator}/>
                </Grid>
            );
            
            
            
        })}
        
        
        </Grid>

        <Grid
  container
  direction="column"
  justifyContent="center"
  alignItems="center"

  spacing={0}

>
        {
            querylist.length>0?<>
            <Grid item>
                <Box
                sx={{
                    m:0,
                    p:0,
                    width: '100px',
                    height: '2px',
                    backgroundColor: "#9BDDC1",
                }}
                />
        </Grid>
        <Grid item>

            <Typography variant="body2" gutterBottom sx={{mb:0,pb:0,mt:5}}>
            It looks like there are no more videos about this concept :&#40;

            </Typography>
            
        </Grid>
        <Grid item>

            <Typography variant="caption" display="block" gutterBottom sx={{color:"black",mt:0, pt:0,mb:3}} >
                Do you need anything else? Take a look at these other concepts from the videos we found!
            </Typography>
        </Grid>
        <Grid item sx={{mb:5}}>
            {/*INSERT HERE MORE CONCEPTS */}
            {listconcept.map(concept=>
                
                <Chip label={concept} size="small" sx={{m:0.5, color:"grey"}} onClick={()=>SendData(concept)}/>
                )}

        </Grid>
        </>
        :
        <></>
        }
        </Grid>
    </Container>


    <Modal
    open={open}
    aria-labelledby="modal-modal-title"
    aria-describedby="modal-modal-description"
    id="modale"
    >

       
            <>
                <Popover
        
                sx={{ display: "flex",
                alignItems: "center",
                justifyContent:"center",
                
                }}
             

                id="account-menu"
                open="true"
       
                PaperProps={{
                elevation: 0,
              
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
                 
                    <Grid item sx={{pl:2,pr:2,pt:3, pb:1}}>
                        <Grid
                        container
                        direction="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        >   
                            <Grid item>
                                <Typography variant="h6" gutterBottom sx={{m:0,p:0}}>
                                    <b>Oops, we didn't</b>
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="h6" gutterBottom sx={{m:0,p:0}}>
                                    <b>expect this :&#40;</b>
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
                        >
                           
                            <Grid item>
                                <Typography variant="caption" display="block" gutterBottom sx={{m:0,p:0}}>
                                    I know you'd like to click here, but <b>i'm just a</b>
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="caption" display="block" gutterBottom sx={{m:0,p:0}}>
                                    <b>limited prototype.</b>
                                </Typography>
                            </Grid>

                            <Grid item>
                                <Typography variant="caption" display="block" gutterBottom sx={{m:0,p:0,mt:1}}>
                                    if you want me to <b>work</b> and <b>compare the</b>
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="caption" display="block" gutterBottom sx={{m:0,p:0}}>
                                    <b>videos</b>, please:
                                </Typography>
                            </Grid>

                            <Grid item>
                                <Typography variant="caption" display="block" gutterBottom sx={{m:0,p:0,mt:1, pl:2}}>
                                    <ul style={{padding:0}}>
                                        <li>
                                            Choose <b>all the videos you want to compare</b>
                                        </li>
                                        <li>
                                            Choose them <b>from left to right</b>.
                                        </li>
                                    </ul>
                                </Typography>
                            </Grid>
                             
                            <Grid item>
                                <Typography variant="body2" display="block" gutterBottom sx={{m:0,p:0}}>
                                    <b>Please be kind</b>,
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="caption" display="block" gutterBottom sx={{m:0,p:0}}>
                                    I'm still learning &#x1F62D;
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item sx={{pt:2}}>
                        <Grid
                        container
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        >
                           <Grid item>

                                </Grid>
                            
                            <Grid item xs="auto" sx={{m:0 ,pl:2,pt:1,pr:1,pb:0.5 ,backgroundColor:'#917FC7', borderRadius:'25px 0 3px 0'}} onClick={closehelper}>
                                <Grid
                                container
                                direction="row"
                                justifyContent="center"
                                alignItems="center"
                                sx={{m:0,p:0}}
                                >
                                    
                                    <Grid item sx={{m:0,p:0}}>
                                        <Typography variant="body2" gutterBottom sx={{color:"white", p:0,m:0}}>
                                            Got it, <b>I'll forgive you.</b>
                                        </Typography>
                                    </Grid>
                                   
                                        
                                    
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Popover>
            </>
        
        
    
    </Modal>
    </>
    

    );
});

export default Listvideo;


