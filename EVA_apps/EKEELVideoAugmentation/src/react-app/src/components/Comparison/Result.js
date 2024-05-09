import React from 'react';
import Container from '@mui/material/Container';
import './Querybar.css';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import '../Header/Header.css';
import './Comparison.css';
import Links from '@mui/material/Link';
import { TextField } from '@material-ui/core';
import './Queryinput.css';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import Header from '../Header/Header';
import { useContext,useState,useEffect } from 'react';
import {TokenContext} from '../account-management/TokenContext';
import ToggleButton from '@mui/material/ToggleButton';
import FlowChart from './FlowChart.js'
import ReactFlow, { ReactFlowProvider, useReactFlow } from 'reactflow';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import EastIcon from '@mui/icons-material/East';
import {
    Link,
    Redirect,
    Switch, 
    Route,
    useLocation
} from "react-router-dom";
import Autocomplete from '@mui/material/Autocomplete';
import { useHistory } from "react-router-dom";
import Barro from './BarroGraph.js';
import Barro2 from './BarroGraph2.js';
import { styled } from '@mui/material/styles';
import HelpIcon from '@mui/icons-material/Help';
import Popover from '@mui/material/Popover';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';


function DP(color = 'black') {
    // create a 10x10 px canvas for the pattern's base shape
    let shape = document.createElement('canvas')
    shape.width = 10
    shape.height = 10
    // get the context for drawing
    let c = shape.getContext('2d')
    c.lineWidth = 1;
    // draw 1st line of the shape 
    c.strokeStyle = color
    c.beginPath()
    c.moveTo(2, 0)
    c.lineTo(10, 8)
    c.stroke()
    // draw 2nd line of the shape 
    c.beginPath()
    c.moveTo(0, 8)
    c.lineTo(2, 10)
    c.stroke()
    // create the pattern from the shape
    return c.createPattern(shape, 'repeat')
  }
  
  const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    '& .MuiToggleButtonGroup-grouped': {
        margin: theme.spacing(0.5),
        border: 0,
        '&.Mui-disabled': {
        border: 0,
        },
        '&:not(:first-of-type)': {
        borderRadius: theme.shape.borderRadius,
        },
        '&:first-of-type': {
        borderRadius: theme.shape.borderRadius,
        },
    },
    }));
  

//the page after you select the video to compare and press the button.
//this is the page for the comparison result
//it has 3 graphs and uses BarroGraph.js, BarroGraph2.js and FlowChart.js
export default function Result(){
    
    //at the top there is another search bar. Click X to go back.
    const history = useHistory();
    let location = useLocation();
    function SendData(value){

        history.push({
            pathname: '/comparisonSearch',
            state: { data: value },
        });
    }
    const colorPick=[
        "#FF4545",
        "#3E7FFF",
        "#CE3FFF",
        "#71D89A"
    ]
    //for first graph
    const [graphcontrol1, setGraphControl1] = useState("one");
    const handleChange1 = (event, newValue) => {
        setGraphControl1(newValue);
      };

    //for second graph
    const [graphcontrol2, setGraphControl2] = useState("one");
    const handleChange2 = (event, newValue) => {
        setGraphControl2(newValue);
      };

    //for third graph
    const [graphcontrol3, setGraphControl3] = useState("one");
    const handleChange3 = (event, newValue) => {
        setGraphControl3(newValue);
      };

    const context = useContext(TokenContext);
    const nameSurname  = context.nameSurname;
    //get from the previous page the data of the video selected for comparison

    
    
    
    useEffect(() => {
        if(location.state != undefined)
        console.log("data from previous search comparison: ", location.state.concept," ",location.state.catalog," ",location.state.catalogExtra," ",location.state.listfilters);
      }, [location]);


    //for legenda1
    const ExpandMore1 = styled((props) => {
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
    const [expanded1, setExpanded1] = useState(false);
    const handleExpandClick1 = () => {
        setExpanded1(!expanded1);
    };
    const [anchorEl1, setAnchorEl1] = useState(null);
    const open1 = Boolean(anchorEl1);
    const handleClick1 = (event) => {
        setAnchorEl1(event.currentTarget);
        handleExpandClick1();
    };
    const handleClose1 = () => {
        setAnchorEl1(null);
    };


    //for legenda2
    const ExpandMore2 = styled((props) => {
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
    const [expanded2, setExpanded2] = useState(false);
    const handleExpandClick2 = () => {
        setExpanded2(!expanded2);
    };
    const [anchorEl2, setAnchorEl2] = useState(null);
    const open2 = Boolean(anchorEl2);
    const handleClick2 = (event) => {
        setAnchorEl2(event.currentTarget);
        handleExpandClick2();
    };
    const handleClose2 = () => {
        setAnchorEl2(null);
    };

    //for legenda3
    const ExpandMore3 = styled((props) => {
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
    const [expanded3, setExpanded3] = useState(false);
    const handleExpandClick3 = () => {
        setExpanded3(!expanded3);
    };
    const [anchorEl3, setAnchorEl3] = useState(null);
    const open3 = Boolean(anchorEl3);
    const handleClick3 = (event) => {
        setAnchorEl3(event.currentTarget);
        handleExpandClick3();
    };
    const handleClose3= () => {
        setAnchorEl3(null);
    };


    

    //filters states
    const [anchorEl1f, setAnchorEl1f] = useState(null);
    const handlePopoverOpen1 = (event) => {
        setAnchorEl1f(event.currentTarget);
        
    };
    const handlePopoverClose1 = () => {
        setAnchorEl1f(null);
    };
    const open1f = Boolean(anchorEl1f);

    const [anchorEl2f, setAnchorEl2f] = useState(null);
    const handlePopoverOpen2 = (event) => {
        setAnchorEl2f(event.currentTarget);
    };
    const handlePopoverClose2 = () => {
        setAnchorEl2f(null);
    };
    const open2f = Boolean(anchorEl2f);

    const [anchorEl3f, setAnchorEl3f] = useState(null);
    const handlePopoverOpen3 = (event) => {
        setAnchorEl3f(event.currentTarget);
    };
    const handlePopoverClose3 = () => {
        setAnchorEl3f(null);
    };
    const open3f = Boolean(anchorEl3f);


    const [alignment1, setAlignment1] = useState(location.state.listfilters[0]);

    const handleChange1f = (event, newAlignment) => {
        setAlignment1(newAlignment);
    };
    const [alignment2, setAlignment2] = useState(location.state.listfilters[1]);

    const handleChange2f = (event, newAlignment) => {
        setAlignment2(newAlignment);
    };
    const [alignment3, setAlignment3] = useState(location.state.listfilters[2]);

    const handleChange3f = (event, newAlignment) => {
        setAlignment3(newAlignment);
    };

    const [alignment4, setAlignment4] = useState(location.state.listfilters[3]);

    const handleChange4f = (event, newAlignment) => {
        setAlignment4(newAlignment);
    };

    const [alignment5, setAlignment5] = useState(location.state.listfilters[4]);

    const handleChange5f = (event, newAlignment) => {
        setAlignment5(newAlignment);
    };

    const [alignment6, setAlignment6] = useState(location.state.listfilters[5]);

    const handleChange6f = (event, newAlignment) => {
        setAlignment6(newAlignment);
    };

    const[radiog, Setradiog] = useState(location.state.listfilters[6])
    return(<>
        <Header page="dashboard" login={nameSurname}/>
        {/*TOP BAR */}
        <Grid
        container
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        id="BARRA ALTO"
        sx={{backgroundColor: "rgb(198,235,220)"}}
        >
            <Grid item>
                
                <Autocomplete
                options={location.state.listConcepts}
                className="bg-primary"
                defaultValue={[location.state.concept]}
                freeSolo
                multiple
                limitTags={1}
                id="multiple-limit-tags "

        
                renderInput={(params) => (
                    <TextField 
                            className="backColor " 
                            id="outlined-basic" 
                            
                                variant='outlined'
                                {...params}
                            placeholder="Concepts" 
                            InputProps={{
                                ...params.InputProps,
                        
                                startAdornment: (
                                    <>
                                    <InputAdornment position="start">
                                        <SearchRoundedIcon sx={{color:"rgb(255,128,0)"}}/>
                                    </InputAdornment>
                                    {params.InputProps.startAdornment}
                                    </>
                                )
                            }}
                            />
                )}
                sx={{ width: '500px' }}
                onChange={(event, value) => {
                    SendData(value);
                  }}
                />
            </Grid>



            <Grid item>
                <Grid
                container
                direction="row"
                justifyContent="flex-end"
                alignItems="center"
                
                >
                    {
                        location.state.catalog.map((video,idx)=>{
                           
                            return(
                                idx == 0?
                                <Grid item key={idx} sx={{width:"20"}}>
                                    <Grid
                                    container
                                    direction="row"
                                    justifyContent="center"
                                    alignItems="center"
                                    id="VIDEO"
                                    
                                    >
                                        <Grid item>
                                            <img src={"http://img.youtube.com/vi/"+video.video_id+"/mqdefault.jpg"} alt={video.title} width="50px" height="50px"/>
                                        </Grid>
                                        <Grid item >
                                            <Grid
                                            container
                                            direction="column"
                                            justifyContent="center"
                                            alignItems="flex-start"
                                            sx={{backgroundColor:"white"}}
                                            >
                                                <Grid item sx={{width:"200px"}}>
                                                    <Typography noWrap variant="subtitle2" gutterBottom sx={{margin:0}}>
                                                    <b>{video.title}</b>
                                                    </Typography>
       
                                                </Grid>
                                                <Grid item sx={{width:"200px"}}>
                                                    <Typography noWrap variant="subtitle2" gutterBottom sx={{marginTop:0}}>
                                                    {video.creator}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                :
                                <>
                                <Grid item>
                                    <Box
                                        sx={{
                                            backgroundColor:"#8c91ff",
                                            width:"20px",
                                            height:"20px",
                                            borderRadius:"50%",
                                            justifyContent:"center",
                                            alignItems:"center",
                                            p:0.3,
                                            m:1
                                        }}>
                                        <Typography variant="caption" display="block" gutterBottom sx={{color:"white",pt:0.2,pl:0.2}}>
                                            <b>VS</b>
                                        </Typography>

                                    </Box>
                                </Grid>
                                <Grid item key={idx} >
                                    <Grid
                                    container
                                    direction="row"
                                    justifyContent="center"
                                    alignItems="center"
                                    id="VIDEO"
                                    sx={{backgroundColor:"white"}}
                                    >
                                        <Grid item>
                                            <img src={"http://img.youtube.com/vi/"+video.video_id+"/mqdefault.jpg"} alt={video.title} width="50px" height="50px"/>
                                        </Grid>
                                        <Grid item>
                                            <Grid
                                            container
                                            direction="column"
                                            justifyContent="center"
                                            alignItems="flex-start"
                                            >
                                                <Grid item sx={{width:"200px"}}>
                                                    <Typography noWrap variant="subtitle2" gutterBottom sx={{margin:0}}>
                                                    <b>{video.title}</b>
                                                    </Typography>
       
                                                </Grid>
                                                <Grid item sx={{width:"200px"}}>
                                                    <Typography noWrap variant="subtitle2" gutterBottom sx={{marginTop:0}}>
                                                    {video.creator}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                
                                </>
                            );
                        })
                    }
                </Grid>
            </Grid>
        </Grid>
        
        {/*DATA ROWS*/}
        <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="stretch"
        id="TITLE+THREE DATA ROWS"
        >
            <Grid item>
             <Container maxWidth="xl" sx={{mt:20}}>  
                <Typography variant="h3" gutterBottom sx={{mb:0, pb:0}}>

                    Comparison results

                </Typography>
                <Box
                sx={{
                    m:0,
                    p:0,
                    width: '100px',
                    height: '4px',
                    backgroundColor: "rgb(155,221,193)",
                }}
                />
                <Grid
                container
                direction="column"
                justifyContent="center"
                alignItems="center"
                sx={{mt:5}}
                >
                    <Grid item>
                        <Typography variant="h6" gutterBottom sx={{mb:0, pb:0}}>

                            <b>Selected Filters</b>

                        </Typography>
                    </Grid>
                    <Grid item>
                    <Box
                    sx={{
                        m:0,
                        p:0,
                        width: '100px',
                        height: '4px',
                        backgroundColor: "rgb(155,221,193)",
                    }}
                    />
                    </Grid>
                    <Grid item>
                        <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        id="TWO COLUMN ONE IS FILTERS LOWER IS BUTTON"
        style={{position:"relative"}}
        >
            

        <Grid item sx={{ p:1, borderRadius: '50px 50px 0 0', backgroundColor:"white", pb:0,mb:0,pl:5,pr:5}}>
            <Grid 
            container
            direction="row"
            justifyContent="center"
            alignItems="stretch"
            spacing={2}
            id="TRE COLONNE PRINCIPALI"
            
            >
                <Grid item sx={{
                        borderRight: '1px solid #CCCCCC',

                        m:3,pr:3

                    }}>
                    <Grid
                    container
                    direction="column"
                    justifyContent="center"
                    alignItems="flex-start"
                    id="CARATTERISTICHE"
                    >
                        <Grid item>
                            <Grid
                            container
                            direction="column"
                            justifyContent="center"
                            alignItems="flex-start"
                            id="TITOLO"
                            >
                                <Grid item sx={{mb:3}}>
                                    <Typography variant="button" gutterBottom >

                                        FEATURES:

                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <Grid
                            container
                            direction="column"
                            justifyContent="center"
                            alignItems="flex-start"
                            id="ADATTO A"
                            >
                                <Grid item>
                                <Grid
                                container
                                direction="row"
                                justifyContent="center"
                                alignItems="center"
                                >
                                    <Grid item>
                                    <HelpIcon
                                    onMouseEnter={handlePopoverOpen1}
                                    onMouseLeave={handlePopoverClose1}
                                    sx={{color:"rgb(255,128,0)"}}/>
                                    </Grid>
                                    <Grid item>
                                    <Typography variant="subtitle2" display="inline" gutterBottom>

                                        · Suitable for:

                                    </Typography>
                                    </Grid>
                                </Grid>
                                    
                                                <Popover 
                                                sx={{
                                                    pointerEvents: 'none',

                                                }}
                                                open={open1f}
                                                anchorEl={anchorEl1f}
                                                anchorOrigin={{
                                                    vertical: 'bottom',
                                                    horizontal: 'left',
                                                }}
                                                transformOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right',
                                                }}
                                                onClose={handlePopoverClose1}
                                                disableRestoreFocus
                                                >

                                                <Box sx={{ width: '100%', maxWidth: 200, p:2, border:2,borderColor:"#ffa825" }}>
                                                    <Typography variant="body2" gutterBottom>
                                                    In videos for <b>beginners</b> you are more likely to find a definition for the concept you looked up and its prerequsiites.
                                                    </Typography>
                                                    <Typography variant="body2" gutterBottom sx={{mt:1}}>
                                                    If you click on <b>expert</b>, you are going to find videos where the knowledge of prerequsiites is taken for granted

                                                    </Typography>
                                                </Box>
                                                </Popover>
                                </Grid>
                                <Grid item>
                                    <StyledToggleButtonGroup
                                    disabled={true}
                                    value={alignment1}
                                    exclusive
                                    onChange={handleChange1f}
                                    aria-label="Platform"
                                    >

                                         <ToggleButton value="novice" style={{textTransform: 'none'}}>
                                        <Typography variant="body2" display="block" gutterBottom>Beginners</Typography>
                                    </ToggleButton>
                                    <ToggleButton value="expert" style={{textTransform: 'none'}}>
                                        <Typography variant="body2" display="block" gutterBottom>Experts</Typography>
                                    </ToggleButton>
                                   

                                    </StyledToggleButtonGroup>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <Grid
                            container
                            direction="column"
                            justifyContent="center"
                            alignItems="flex-start"
                            id="SPIEGAZIONE"
                            >
                                <Grid item>
                                <Grid
                                container
                                direction="row"
                                justifyContent="center"
                                alignItems="center"
                                >
                                    <Grid item>
                                    <HelpIcon
                                    onMouseEnter={handlePopoverOpen2}
                                    onMouseLeave={handlePopoverClose2}
                                    sx={{color:"rgb(255,128,0)"}}/>
                                    </Grid>
                                    <Grid item>
                                    <Typography variant="subtitle2" display="inline" gutterBottom>

                                        · Explanation:

                                    </Typography>
                                    </Grid>
                                    
                                                <Popover 
                                                sx={{
                                                    pointerEvents: 'none',
                                                }}
                                                open={open2f}
                                                anchorEl={anchorEl2f}
                                                anchorOrigin={{
                                                    vertical: 'bottom',
                                                    horizontal: 'left',
                                                }}
                                                transformOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right',
                                                }}
                                                onClose={handlePopoverClose2}
                                                disableRestoreFocus
                                                >

                                                <Box sx={{ width: '100%', maxWidth: 200,p:2, border:2,borderColor:"#ffa825"  }}>
                                                    <Typography variant="body2" gutterBottom>
                                                    <b>A basic</b> explanation would go straight to the point.
                                                    </Typography>
                                                    <Typography variant="body2" gutterBottom sx={{mt:1}}>
                                                    A <b>detailed</b> explanation is broader and includes related concepts

                                                    </Typography>
                                                </Box>
                                                </Popover>
                                </Grid>
                                </Grid>
                                <Grid item>
                                    <StyledToggleButtonGroup
                                    disabled={true}
                                    value={alignment2}
                                    exclusive
                                    onChange={handleChange2f}
                                    aria-label="Platform"
                                    >
                                    <ToggleButton value="essential" style={{textTransform: 'none'}}>

                                        <Typography variant="body2" display="block" gutterBottom>Basic</Typography>
                                    </ToggleButton>
                                    <ToggleButton value="detailed" style={{textTransform: 'none'}}>
                                        <Typography variant="body2" display="block" gutterBottom>Detailed</Typography>

                                    </ToggleButton>
                                    </StyledToggleButtonGroup>
                                </Grid>
                            
                            </Grid>
                        </Grid>
                        <Grid item>
                            <Grid
                            container
                            direction="column"
                            justifyContent="center"
                            alignItems="flex-start"
                            id="TIPO DI LEZIONE"
                            >
                                <Grid item>
                                <Grid
                                container
                                direction="row"
                                justifyContent="center"
                                alignItems="center"
                                >
                                    <Grid item>
                                    <HelpIcon
                                    onMouseEnter={handlePopoverOpen3}
                                    onMouseLeave={handlePopoverClose3}
                                    sx={{color:"rgb(255,128,0)"}}/>
                                    </Grid>
                                    <Grid item>
                                    <Typography variant="subtitle2" display="inline" gutterBottom>

                                        · Kind of lesson:

                                    </Typography>
                                    </Grid>
                                    
                                                <Popover 
                                                sx={{
                                                    pointerEvents: 'none',
                                                }}
                                                open={open3f}
                                                anchorEl={anchorEl3f}
                                                anchorOrigin={{
                                                    vertical: 'bottom',
                                                    horizontal: 'left',
                                                }}
                                                transformOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right',
                                                }}
                                                onClose={handlePopoverClose3}
                                                disableRestoreFocus
                                                >

                                                <Box sx={{ width: '100%', maxWidth: 200 ,p:2, border:2,borderColor:"#ffa825" }}>
                                                    <Typography variant="body2" gutterBottom>
                                                    Choose videos <b>with slides</b> if you like video lectures showing slides of what is explained
                                                    </Typography>
                                                    <Typography variant="body2" gutterBottom sx={{mt:1}}>
                                                    Choose <b>no slides</b> if you prefer other teaching modes.

                                                    </Typography>
                                                </Box>
                                                </Popover>
                                </Grid>
                                </Grid>
                                <Grid item>
                                    <StyledToggleButtonGroup
                                    disabled={true}
                                    value={alignment3}
                                    exclusive
                                    onChange={handleChange3f}
                                    aria-label="Platform"
                                    >
                                    <ToggleButton value="withslide" style={{textTransform: 'none'}}>

                                        <Typography variant="body2" display="block" gutterBottom>With slides</Typography>
                                    </ToggleButton>
                                    <ToggleButton value="withoutslide" style={{textTransform: 'none'}}>
                                        <Typography variant="body2" display="block" gutterBottom>No slides</Typography>

                                    </ToggleButton>
                                    </StyledToggleButtonGroup>
                                </Grid>
                            </Grid>
                        </Grid>
                    
                    </Grid>
                </Grid>



                <Grid item sx={{
                        borderRight: '1px solid #CCCCCC',

                        m:3,pr:3,ml:1

                    }}>
                    <Grid
                    container
                    direction="column"
                    justifyContent="center"
                    alignItems="flex-start"
                    id="DURATE"
                    >
                        <Grid item>
                            <Grid
                            container
                            direction="column"
                            justifyContent="center"
                            alignItems="flex-start"
                            id="TITOLO"
                            >
                                <Grid item sx={{mb:3}}>
                                    <Typography variant="button" gutterBottom>

                                        DURATION:

                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>


                        <Grid item>
                            <Grid
                            container
                            direction="column"
                            justifyContent="center"
                            alignItems="flex-start"
                            id="DEFINIZIONE"
                            >
                                <Grid item>
                                    <Typography variant="subtitle2" display="inline" gutterBottom>

                                        · Definition of the concept:

                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <StyledToggleButtonGroup
                                    disabled={true}
                                    value={alignment4}
                                    exclusive
                                    onChange={handleChange4f}
                                    aria-label="Platform"
                                    >
                                    <ToggleButton value="less4" style={{textTransform: 'none'}}>
                                        <Typography variant="body2" display="block" gutterBottom>&lt;4 min</Typography>
                                    </ToggleButton>
                                    <ToggleButton value="4to20" style={{textTransform: 'none'}}>
                                        <Typography variant="body2" display="block" gutterBottom>4 to 20 min</Typography>
                                    </ToggleButton>
                                    <ToggleButton value="greater20" style={{textTransform: 'none'}}>
                                        <Typography variant="body2" display="block" gutterBottom>&gt;20 min</Typography>
                                    </ToggleButton>
                                    
                                    </StyledToggleButtonGroup>
                                </Grid>
                                <Grid item>
                                    <Typography variant="subtitle2" display="inline" gutterBottom>

                                        · In depth explanation:

                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <StyledToggleButtonGroup
                                    disabled={true}
                                    value={alignment5}
                                    exclusive
                                    onChange={handleChange5f}
                                    aria-label="Platform"
                                    >
                                    <ToggleButton value="less4" style={{textTransform: 'none'}}>
                                        <Typography variant="body2" display="block" gutterBottom>&lt;4 min</Typography>
                                    </ToggleButton>
                                    <ToggleButton value="4to20" style={{textTransform: 'none'}}>
                                        <Typography variant="body2" display="block" gutterBottom>4 to 20 min</Typography>
                                    </ToggleButton>
                                    <ToggleButton value="greater20" style={{textTransform: 'none'}}>
                                        <Typography variant="body2" display="block" gutterBottom>&gt;20 min</Typography>
                                    </ToggleButton>
                                    
                                    </StyledToggleButtonGroup>
                                </Grid>
                                <Grid item>
                                    <Typography variant="subtitle2" display="inline" gutterBottom>

                                        · Whole video:

                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <StyledToggleButtonGroup
                                    disabled={true}
                                    value={alignment6}
                                    exclusive
                                    onChange={handleChange6f}
                                    aria-label="Platform"
                                    >
                                    <ToggleButton value="less4" style={{textTransform: 'none'}}>
                                        <Typography variant="body2" display="block" gutterBottom>&lt;4 min</Typography>
                                    </ToggleButton>
                                    <ToggleButton value="4to20" style={{textTransform: 'none'}}>
                                        <Typography variant="body2" display="block" gutterBottom>4 to 20 min</Typography>
                                    </ToggleButton>
                                    <ToggleButton value="greater20" style={{textTransform: 'none'}}>
                                        <Typography variant="body2" display="block" gutterBottom>&gt;20 min</Typography>
                                    </ToggleButton>
                                    
                                    </StyledToggleButtonGroup>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>


















                <Grid item sx={{m:3,ml:0}}>

                    <Grid
                    container
                    direction="column"
                    justifyContent="center"
                    alignItems="flex-start"
                    id="ORDINA PER"
                    >
                        <Grid item sx={{mb:2}}>

                            <Typography variant="button" gutterBottom>SORT BY:</Typography>

                        </Grid>
                        <Grid item>
                            <FormControl>
                            
                               
                                
                                <RadioGroup
                                    aria-labelledby="demo-radio-buttons-group-label"
                                    defaultValue={radiog}
                                    name="radio-buttons-group"
                                    onChange={(event,value)=>Setradiog(value)}
                                    
                                >
                                    <FormControlLabel value="recent" control={<Radio color="default"/>} 
                                        disabled={true}
                                        label={<Typography variant="subtitle2" display="inline" gutterBottom>Latest </Typography>}/>
                                    <FormControlLabel value="videolength" control={<Radio color="default"/>} 
                                        disabled={true}
                                        label={<Typography variant="subtitle2" display="inline" gutterBottom>Video duration</Typography> }/>
                                    <FormControlLabel value="detailedlength" control={<Radio color="default"/>} 
                                        disabled={true}
                                        label={<Typography variant="subtitle2" display="inline" gutterBottom>Definition duration</Typography>} />
                                    <FormControlLabel value="deflength" control={<Radio color="default"/>} 
                                        disabled={true}
                                        label={<Typography variant="subtitle2" display="inline" gutterBottom>In depth duration</Typography>}/>

                                </RadioGroup>
                            </FormControl>
                        </Grid>
                    
                    </Grid>
                </Grid>

            </Grid>
        </Grid>

        {/* FROM HERE START PART FOR BUTTON */}

        


                        </Grid>
                    </Grid>
                

                </Grid>
             </Container>
            </Grid>
            <Grid item sx={{backgroundColor:"rgb(237,237,237)", mt:5, p:5}}>
                <Container maxWidth="xl" sx={{}}>
                    <Grid
                    container
                    direction="column"
                    justifyContent="center"
                    alignItems="stretch"
                    id="CONFRONTO DURATE"
                    >
                        <Grid item>
                            <Grid
                            container
                            direction="column"
                            justifyContent="center"
                            alignItems="center"
                            >
                                <Grid item>
                                <Typography variant="h4" gutterBottom sx={{mb:0,pb:0,pt:10}}>

                                    <b>Duration</b>

                                </Typography>
                                <Box
                                sx={{
                                    m:0,
                                    p:0,
                                    width: '100px',
                                    height: '4px',
                                    backgroundColor: "rgb(223,216,242)",
                                }}
                                />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <Grid
                            container
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            id="BOTTONI"
                            sx={{pt:5}}
                            >
                                <Grid item>
                                    <Chip 
                                        sx={{width:'auto',
                                            margin:'5px',
                                            backgroundColor:"rgb(0,0,0,0)"}}
                                        
                                        avatar={<ExpandMore1
                                            expand={expanded1}
                                    
                                            aria-expanded={expanded1}
                                            aria-label="show more"
                                            >
                                                <ExpandMoreIcon />
                                            </ExpandMore1>}
                                        label={<Typography variant="caption" display="block" gutterBottom sx={{mt:1}}>

                                        Legend

                                    </Typography>} 
                                        onClick={handleClick1}
                                       
                                    />
                                    
                                </Grid>
                                                   
                                                        {
                                                            graphcontrol1=="one"?
                                                            <Menu
                                                            anchorEl={anchorEl1}
                                                            id="account-menu"
                                                            open={open1}
                                                            onClose={handleClose1}
                                                            onClick={handleClose1}
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
                                                                display: 'block',
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
                                                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                                            >
                                                                <MenuItem>
                                                                    <Typography variant="caption"  gutterBottom>

                                                                        <b>Overview:</b>

                                                                    </Typography>
                                                                </MenuItem>
                                                                <MenuItem sx={{mb:0, pb:0}}>
                                                                    <Box sx={{
                                                                        width:"15px",
                                                                        height:"15px",
                                                                        backgroundColor:"#FF4545",
                                                            
                                                                    }}/>
                                                                    <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                        Video 1
                                                                    </Typography>
                                                                </MenuItem>
                                                                <MenuItem sx={{mt:0, mb:0, pt:0, pb:0}}>
                                                                    <Box sx={{
                                                                        width:"15px",
                                                                        height:"15px",
                                                                        backgroundColor:"#3E7FFF"
                                                                    }}/>
                                                                    <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                        Video 2
                                                                    </Typography>
                                                                </MenuItem>
                                                                <MenuItem sx={{mt:0, mb:0, pt:0, pb:0}}>
                                                                    <Box sx={{
                                                                        width:"15px",
                                                                        height:"15px",
                                                                        backgroundColor:"#CE3FFF"
                                                                    }}/>
                                                                    <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                        Video 3
                                                                    </Typography>
                                                                </MenuItem>
                                                                <MenuItem sx={{pt:0, pb:0}}>
                                                                    <Box sx={{
                                                                        width:"15px",
                                                                        height:"15px",
                                                                        backgroundColor:"#71D89A"
                                                                    }}/>
                                                                    <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                        Video 4
                                                                    </Typography>
                                                                </MenuItem>
                                                                <MenuItem sx={{mb:0, pb:0, mt:1}}>
                                                                    <Box sx={{
                                                                        width:"15px",
                                                                        height:"15px",
                                                                        backgroundColor:"white",
                                                                        border: '1px solid gray',
                                                                    }}/>
                                                                    <Typography variant ="caption" gutterBottom sx={{mt:1, pl:1}}>

                                                                        Whole video

                                                                    </Typography>
                                                                </MenuItem>
                                                                <MenuItem sx={{mt:0, mb:0, pt:0, pb:0}}>
                                                                    <Box sx={{
                                                                        width:"15px",
                                                                        height:"15px",
                                                                        backgroundColor:"grey",
                                                                        opacity:"0.8",
                                                                        background:"repeating-linear-gradient( 135deg, grey, grey 3px, white 2px, white 5px )",
                                                                        border: '1px solid gray',
                                                                    }}/>
                                                                    <Typography variant ="caption" gutterBottom sx={{mt:1, pl:1}}>

                                                                        In depth

                                                                    </Typography>
                                                                </MenuItem>
                                                                <MenuItem sx={{pt:0, mt:0}}>
                                                                    <Box sx={{
                                                                        width:"15px",
                                                                        height:"15px",
                                                                        backgroundColor:"grey",
                                                                        border: '1px solid gray',
                                                                    }}/>
                                                                    <Typography variant ="caption" gutterBottom sx={{mt:1, pl:1}}>

                                                                        Definition

                                                                    </Typography>
                                                                </MenuItem>
                                                            </Menu>
                                                            :
                                                            graphcontrol1=="two"?
                                                            <Menu
                                                            anchorEl={anchorEl1}
                                                            id="account-menu"
                                                            open={open1}
                                                            onClose={handleClose1}
                                                            onClick={handleClose1}
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
                                                                display: 'block',
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
                                                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                                            >
                                                                        <MenuItem>
                                                                        <Typography variant="caption"  gutterBottom>

                                                                            <b>Definition:</b>

                                                                        </Typography>
                                                                        </MenuItem>
                                                                        <MenuItem sx={{mb:0, pb:0}}>
                                                                            <Box sx={{
                                                                                width:"15px",
                                                                                height:"15px",
                                                                                backgroundColor:"#FF4545",
                                                                    
                                                                            }}/>
                                                                            <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                                Video 1
                                                                            </Typography>
                                                                        </MenuItem>
                                                                        <MenuItem sx={{mt:0, mb:0, pt:0, pb:0}}>
                                                                            <Box sx={{
                                                                                width:"15px",
                                                                                height:"15px",
                                                                                backgroundColor:"#3E7FFF"
                                                                            }}/>
                                                                            <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                                Video 2
                                                                            </Typography>
                                                                        </MenuItem>
                                                                        <MenuItem sx={{mt:0, mb:0, pt:0, pb:0}}>
                                                                            <Box sx={{
                                                                                width:"15px",
                                                                                height:"15px",
                                                                                backgroundColor:"#CE3FFF"
                                                                            }}/>
                                                                            <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                                Video 3
                                                                            </Typography>
                                                                        </MenuItem>
                                                                        <MenuItem sx={{pt:0, pb:0}}>
                                                                            <Box sx={{
                                                                                width:"15px",
                                                                                height:"15px",
                                                                                backgroundColor:"#71D89A"
                                                                            }}/>
                                                                            <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                                Video 4
                                                                            </Typography>
                                                                        </MenuItem>
                                                                    </Menu>
                                                                    :
                                                                    graphcontrol1=="three"?
                                                                    <Menu
                                                                    anchorEl={anchorEl1}
                                                                    id="account-menu"
                                                                    open={open1}
                                                                    onClose={handleClose1}
                                                                    onClick={handleClose1}
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
                                                                        display: 'block',
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
                                                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                                                    >
                                                                                <MenuItem>
                                                                                    <Typography variant="caption"  gutterBottom>

                                                                                        <b>In depth:</b>

                                                                                    </Typography>
                                                                                </MenuItem>
                                                                                <MenuItem sx={{mb:0, pb:0}}>
                                                                                    <Box sx={{
                                                                                        width:"15px",
                                                                                        height:"15px",
                                                                                        width:"15px",
                                                                                        height:"15px",
                                                                                        backgroundColor:"#e5e5f7","opacity":"0.8",
                                                                                        background:"repeating-linear-gradient( 135deg, #FF4545, #FF4545 3px, #e5e5f7 2px, #e5e5f7 5px )",
                                                                                        border:1,
                                                                                        borderColor:"grey"
                                                                            
                                                                                    }}/>
                                                                                    <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                                        Video 1
                                                                                    </Typography>
                                                                                </MenuItem>
                                                                                <MenuItem sx={{mt:0, mb:0, pt:0, pb:0}}>
                                                                                    <Box sx={{
                                                                                        width:"15px",
                                                                                        height:"15px",
                                                                                        backgroundColor:"#e5e5f7","opacity":"0.8",
                                                                                        background:"repeating-linear-gradient( 135deg, #3E7FFF, #3E7FFF 3px, #e5e5f7 2px, #e5e5f7 5px )",
                                                                                        border:1,
                                                                                        borderColor:"grey"
                                                                                    }}/>
                                                                                    <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                                        Video 2
                                                                                    </Typography>
                                                                                </MenuItem>
                                                                                <MenuItem sx={{mt:0, mb:0, pt:0, pb:0}}>
                                                                                    <Box sx={{
                                                                                        width:"15px",
                                                                                        height:"15px",
                                                                                        backgroundColor:"#e5e5f7","opacity":"0.8",
                                                                                        background:"repeating-linear-gradient( 135deg, #E3B8F2, #E3B8F2 3px, #e5e5f7 2px, #e5e5f7 5px )",
                                                                                        border:1,
                                                                                        borderColor:"grey"
                                                                                    }}/>
                                                                                    <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                                        Video 3
                                                                                    </Typography>
                                                                                </MenuItem>
                                                                                <MenuItem sx={{pt:0, pb:0}}>
                                                                                    <Box sx={{
                                                                                        width:"15px",
                                                                                        height:"15px",
                                                                                        backgroundColor:"#e5e5f7","opacity":"0.8",
                                                                                        background:"repeating-linear-gradient( 135deg, #71D89A, #71D89A 3px, #e5e5f7 2px, #e5e5f7 5px )",
                                                                                        border:1,
                                                                                        borderColor:"grey"
                                                                                    }}/>
                                                                                    <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                                        Video 4
                                                                                    </Typography>
                                                                                </MenuItem>
                                                                            
                                                                            </Menu>
                                                                            :
                                                                            graphcontrol1=="four"?
                                                                            <Menu
                                                                            anchorEl={anchorEl1}
                                                                            id="account-menu"
                                                                            open={open1}
                                                                            onClose={handleClose1}
                                                                            onClick={handleClose1}
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
                                                                                display: 'block',
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
                                                                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                                                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                                                            >
                                                                                    <MenuItem>
                                                                                        <Typography variant="caption"  gutterBottom>

                                                                                            <b>Whole video:</b>

                                                                                        </Typography>
                                                                                    </MenuItem>
                                                                                    <MenuItem sx={{mb:0, pb:0}}>
                                                                                        <Box sx={{
                                                                                            width:"15px",
                                                                                            height:"15px",
                                                                                            backgroundColor:"white",
                                                                                            border:2,
                                                                                            borderColor:"#FF4545"
                                                                                
                                                                                        }}/>
                                                                                        <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                                            Video 1
                                                                                        </Typography>
                                                                                    </MenuItem>
                                                                                    <MenuItem sx={{mt:0, mb:0, pt:0, pb:0}}>
                                                                                        <Box sx={{
                                                                                            width:"15px",
                                                                                            height:"15px",
                                                                                            backgroundColor:"white",
                                                                                            border:2,
                                                                                            borderColor:"#3E7FFF"
                                                                                        }}/>
                                                                                        <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                                            Video 2
                                                                                        </Typography>
                                                                                    </MenuItem>
                                                                                    <MenuItem sx={{mt:0, mb:0, pt:0, pb:0}}>
                                                                                        <Box sx={{
                                                                                            width:"15px",
                                                                                            height:"15px",
                                                                                            backgroundColor:"white",
                                                                                            border:2,
                                                                                            borderColor:"#CE3FFF"
                                                                                        }}/>
                                                                                        <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                                            Video 3
                                                                                        </Typography>
                                                                                    </MenuItem>
                                                                                    <MenuItem sx={{pt:0, pb:0}}>
                                                                                        <Box sx={{
                                                                                            width:"15px",
                                                                                            height:"15px",
                                                                                            backgroundColor:"white",
                                                                                            border:2,
                                                                                            borderColor:"#71D89A"
                                                                                        }}/>
                                                                                        <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                                            Video 4
                                                                                        </Typography>
                                                                                    </MenuItem>
                                                                                </Menu>
                                                                                :
                                                                                <>something went wrong..</>
                                                        }
                                                    
                                                    
                                              
                                <Grid item>
                                    <Grid
                                    container
                                    direction="row"
                                    justifyContent="flex-end"
                                    alignItems="center"
                                    spacing={2}
                                    >
                                        <Grid item>
                                        <Tabs
                                        value={graphcontrol1}
                                        onChange={handleChange1}
                                        textColor="secondary"
                                        indicatorColor="secondary"
                                        aria-label="secondary tabs example"
                                       
                                    >
                                        
                                        <Tab value="two" label={<Typography variant="caption" display="block" gutterBottom>

                                            Definition
                                        </Typography>} />
                                        <Tab value="three" label={<Typography variant="caption" display="block" gutterBottom>
                                            in depth
                                        </Typography>}/>
                                        <Tab value="four" label={<Typography variant="caption" display="block" gutterBottom>
                                            Whole video
                                        </Typography>}/>
                                        <Tab value="one" label={<Typography variant="caption" display="block" gutterBottom>
                                            Overview

                                        </Typography>} />
                                    </Tabs>
                                        </Grid>
                                        
                                    </Grid>
                                </Grid>
                            </Grid>
                            
                        </Grid>
                        <Grid item>
                            <Box
                            sx={{
                                width: '100%',
                                backgroundColor: 'white',
                                borderRadius: '20px',
                                height:"500px"
                            }}
                            >
                            {/*INSERT GRAPH HERE */}
                            
                                <Barro catalog={location.state.catalog} catalogExtra={location.state.catalogExtra} graphcontrol ={graphcontrol1}/>    
                            </Box>
                        </Grid>
                        <Grid item sx={{m:5}}>
                            <Grid
                            container
                            direction="row"
                            justifyContent="space-around"
                            alignItems="center"
                            >
                                {

                                    location.state.catalog.map((video,idx)=>{
                                        return(
                                            <Grid item key={idx}>
                                                <Links href={'/app/'+video.video_id+'/'+video.title} underline="hover" style={{marginLeft:0,paddingLeft:5, color:"#3b3b3b"}}>
                                                <Box
                                                    sx={{
                                                        width:"auto",
                                                        height:"auto",
                                                        border:1,
                                                        borderColor:"grey.300",
                                                        borderRadius:"16px",
                                                        backgroundColor:"white"
                                                    }}>
                                                    <Stack direction="row" spacing={0.5} sx={{ml:1, mr:1, mt:0.5, mb:0.5}}>
                                        
                                                        <Box
                                                        sx={{
                                                            backgroundColor:colorPick[idx],
                                                            width:"8px",
                                                            height:"15px",
                                                            mr:0,
                                                            pr:0,
                                                            mt:0.4
                                                        }}/>
                                                
                                            
                                                        
                                                            <Typography variant="caption" gutterBottom sx={{pt:0.4}}>
                                                                {video.title}
                                                            </Typography>
                                                         
                                                        <EastIcon sx={{pt:0.4, width:"15px", height:'15px'}}/> 
                                                
                                                    </Stack>
                                                </Box>
                                                </Links>  
                                               
                                                
                                            </Grid>
                                        );
                                    })
                                }
                            </Grid>
                        
                        </Grid>
                    </Grid>
                </Container>  
            </Grid>
            <Grid item sx={{backgroundColor:"white", mt:5, p:5}}>
                <Container maxWidth="xl" sx={{}}>
                    <Grid
                    container
                    direction="column"
                    justifyContent="center"
                    alignItems="stretch"
                    id="CONFRONTO MAPPE"
                    >
                        <Grid item>
                            <Grid
                            container
                            direction="column"
                            justifyContent="center"
                            alignItems="center"
                            >
                                <Grid item>
                                <Typography variant="h4" gutterBottom sx={{mb:0,pb:0, pt:10}}>

                                    <b>What you must already know, what you are going to learn</b>

                                </Typography>
                                <Box
                                sx={{
                                    m:0,
                                    p:0,
                                    width: '100px',
                                    height: '4px',
                                    backgroundColor: "orange",
                                    
                                }}
                                />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <Grid
                            container
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            id="BOTTONI"
                            sx={{pt:5}}
                            >
                                <Grid item>
                                    <Chip 
                                        sx={{width:'auto',
                                            margin:'5px',
                                            backgroundColor:"rgb(0,0,0,0)"}}
                                        
                                        avatar={<ExpandMore2
                                            expand={expanded2}
                                    
                                            aria-expanded={expanded2}
                                            aria-label="show more"
                                            >
                                                <ExpandMoreIcon />
                                            </ExpandMore2>}
                                        label={<Typography variant="caption" display="block" gutterBottom sx={{mt:1}}>

                                        Legend

                                    </Typography>} 
                                        onClick={handleClick2}
                                       
                                    />
                                    
                                </Grid>
                                                   
                                                    {
                                                        graphcontrol2=="one"?
                                                        <Menu
                                                        anchorEl={anchorEl2}
                                                        id="account-menu"
                                                        open={open2}
                                                        onClose={handleClose2}
                                                        onClick={handleClose2}
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
                                                            display: 'block',
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
                                                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                                    >
                                                            <MenuItem>
                                                                <Typography variant="caption"  gutterBottom>

                                                                    <b>Overview:</b>

                                                                </Typography>
                                                            </MenuItem>
                                                            <MenuItem sx={{mb:0, pb:0}}>
                                                                <Box sx={{
                                                                    width:"15px",
                                                                    height:"15px",
                                                                    backgroundColor:"#FF4545",
                                                        
                                                                }}/>
                                                                <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                    Video 1
                                                                </Typography>
                                                            </MenuItem>
                                                            <MenuItem sx={{mt:0, mb:0, pt:0, pb:0}}>
                                                                <Box sx={{
                                                                    width:"15px",
                                                                    height:"15px",
                                                                    backgroundColor:"#3E7FFF"
                                                                }}/>
                                                                <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                    Video 2
                                                                </Typography>
                                                            </MenuItem>
                                                            <MenuItem sx={{mt:0, mb:0, pt:0, pb:0}}>
                                                                <Box sx={{
                                                                    width:"15px",
                                                                    height:"15px",
                                                                    backgroundColor:"#CE3FFF"
                                                                }}/>
                                                                <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                    Video 3
                                                                </Typography>
                                                            </MenuItem>
                                                            <MenuItem sx={{pt:0, pb:0}}>
                                                                <Box sx={{
                                                                    width:"15px",
                                                                    height:"15px",
                                                                    backgroundColor:"#71D89A"
                                                                }}/>
                                                                <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                    Video 4
                                                                </Typography>
                                                            </MenuItem>
                                                            <MenuItem sx={{mb:0, pb:0, mt:1}}>
                                                                <Box sx={{
                                                                    width:"15px",
                                                                    height:"15px",
                                                                    backgroundColor:"white",
                                                                    border: 2,
                                                                    borderColor:"black"
                                                                }}/>
                                                                <Typography variant ="caption" gutterBottom sx={{mt:1, pl:1}}>

                                                                    What should you already know?

                                                                </Typography>
                                                            </MenuItem>
                                                            <MenuItem sx={{mt:0, mb:0, pt:0, pb:0}}>
                                                                <Box sx={{
                                                                    width:"15px",
                                                                    height:"15px",
                                                                    backgroundColor:"grey",
                                                                    opacity:"0.5",
                                                                    background:"white",
                                                                    border: 2,
                                                                    borderColor:"grey"
                                                                }}/>
                                                                <Typography variant ="caption" gutterBottom sx={{mt:1, pl:1}}>

                                                                    What will you learn?

                                                                </Typography>
                                                            </MenuItem>
                                                            <MenuItem sx={{pt:0, mt:0}}>
                                                                <Box sx={{
                                                                    width:"15px",
                                                                    height:"15px",
                                                                    backgroundColor:"grey",
                                                                    border: '2px solid gray',
                                                                }}/>
                                                                <Typography variant ="caption" gutterBottom sx={{mt:1, pl:1}}>

                                                                    Concept

                                                                </Typography>
                                                            </MenuItem>
                                                            <MenuItem sx={{pb:0,mb:0}}>
                                                                <EastIcon sx={{stroke: "black", strokeWidth: 2}}/>
                                                                <Typography variant="caption" gutterBottom sx={{mt:1, pl:1}}>

                                                                    <b>Strong link</b>

                                                                </Typography>
                                                            </MenuItem>
                                                            <MenuItem sx={{pt:0,mt:0}}>
                                                                <EastIcon/>
                                                                <Typography variant="caption" gutterBottom sx={{mt:1, pl:1}}>

                                                                    Weak link

                                                                </Typography>
                                                            </MenuItem>
                                                        </Menu>
                                                        :
                                                        graphcontrol2=="two"?
                                                        <Menu
                                                        anchorEl={anchorEl2}
                                                        id="account-menu"
                                                        open={open2}
                                                        onClose={handleClose2}
                                                        onClick={handleClose2}
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
                                                            display: 'block',
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
                                                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                                    >
                                                                    <MenuItem>
                                                                        <Typography variant="caption"  gutterBottom>

                                                                            <b>What should you already know?</b>

                                                                        </Typography>
                                                                    </MenuItem>
                                                                    <MenuItem sx={{mb:0, pb:0}}>
                                                                        <Box sx={{
                                                                            width:"15px",
                                                                            height:"15px",
                                                                            backgroundColor:"white",
                                                                            border:2,
                                                                            borderColor:"#FF4545",
                                                                
                                                                        }}/>
                                                                        <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                            Video 1
                                                                        </Typography>
                                                                    </MenuItem>
                                                                    <MenuItem sx={{mt:0, mb:0, pt:0, pb:0}}>
                                                                        <Box sx={{
                                                                            width:"15px",
                                                                            height:"15px",
                                                                            backgroundColor:"white",
                                                                            border:2,
                                                                            borderColor:"#3E7FFF"
                                                                        }}/>
                                                                        <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                            Video 2
                                                                        </Typography>
                                                                    </MenuItem>
                                                                    <MenuItem sx={{mt:0, mb:0, pt:0, pb:0}}>
                                                                        <Box sx={{
                                                                            width:"15px",
                                                                            height:"15px",
                                                                            backgroundColor:"white",
                                                                            border:2,
                                                                            borderColor:"#CE3FFF"
                                                                        }}/>
                                                                        <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                            Video 3
                                                                        </Typography>
                                                                    </MenuItem>
                                                                    <MenuItem sx={{pt:0, pb:0}}>
                                                                        <Box sx={{
                                                                            width:"15px",
                                                                            height:"15px",
                                                                            backgroundColor:"white",
                                                                            border:2,
                                                                            borderColor:"#71D89A"
                                                                        }}/>
                                                                        <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                            Video 4
                                                                        </Typography>
                                                                    </MenuItem>
                                                                    <MenuItem sx={{pb:0,mb:0}}>
                                                                        <EastIcon sx={{stroke: "black", strokeWidth: 2}}/>
                                                                        <Typography variant="caption" gutterBottom sx={{mt:1, pl:1}}>

                                                                            <b>Strong link</b>

                                                                        </Typography>
                                                                    </MenuItem>
                                                                    <MenuItem sx={{pt:0,mt:0}}>
                                                                        <EastIcon/>
                                                                        <Typography variant="caption" gutterBottom sx={{mt:1, pl:1}}>

                                                                            Weak link

                                                                        </Typography>
                                                                    </MenuItem>
                                                                </Menu>
                                                                :
                                                                graphcontrol2=="three"?
                                                                <Menu
                                                                anchorEl={anchorEl2}
                                                                id="account-menu"
                                                                open={open2}
                                                                onClose={handleClose2}
                                                                onClick={handleClose2}
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
                                                                    display: 'block',
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
                                                                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                                            >
                                                                            <MenuItem>
                                                                                <Typography variant="caption"  gutterBottom>

                                                                                    <b>What will you learn?</b>

                                                                                </Typography>
                                                                            </MenuItem>
                                                                            <MenuItem sx={{mb:0, pb:0}}>
                                                                                <Box sx={{
                                                                                    width:"15px",
                                                                                    height:"15px",
                                                                                    backgroundColor:"white",
                                                                                    border:2,
                                                                                    borderColor:"#ff7878",
                                                                                
                                                                        
                                                                                }}/>
                                                                                <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                                    Video 1
                                                                                </Typography>
                                                                            </MenuItem>
                                                                            <MenuItem sx={{mt:0, mb:0, pt:0, pb:0}}>
                                                                                <Box sx={{
                                                                                    width:"15px",
                                                                                    height:"15px",
                                                                                    backgroundColor:"white",
                                                                                    border:2,
                                                                                    borderColor:"#9dbdfc",
                                                                                
                                                                                }}/>
                                                                                <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                                    Video 2
                                                                                </Typography>
                                                                            </MenuItem>
                                                                            <MenuItem sx={{mt:0, mb:0, pt:0, pb:0}}>
                                                                                <Box sx={{
                                                                                    width:"15px",
                                                                                    height:"15px",
                                                                                    backgroundColor:"white",
                                                                                    border:2,
                                                                                    borderColor:"#e08dfc",
                                                                             
                                                                                }}/>
                                                                                <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                                    Video 3
                                                                                </Typography>
                                                                            </MenuItem>
                                                                            <MenuItem sx={{pt:0, pb:0}}>
                                                                                <Box sx={{
                                                                                    width:"15px",
                                                                                    height:"15px",
                                                                                    backgroundColor:"white",
                                                                                    border:2,
                                                                                    borderColor:"#a4f5c4",
                                                                                    
                                                                                }}/>
                                                                                <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                                    Video 4
                                                                                </Typography>
                                                                            </MenuItem>
                                                                            <MenuItem sx={{pb:0,mb:0}}>
                                                                                <EastIcon sx={{stroke: "black", strokeWidth: 2}}/>
                                                                                <Typography variant="caption" gutterBottom sx={{mt:1, pl:1}}>

                                                                                    <b>Strong link</b>

                                                                                </Typography>
                                                                            </MenuItem>
                                                                            <MenuItem sx={{pt:0,mt:0}}>
                                                                                <EastIcon/>
                                                                                <Typography variant="caption" gutterBottom sx={{mt:1, pl:1}}>

                                                                                    Weak link

                                                                                </Typography>
                                                                            </MenuItem>
                                                                        
                                                                        </Menu>
                                                                        :
                                                                        <>something went wrong..</>
                                                    }
                                                    
                                                    
                                                
                                <Grid item>
                                    <Grid
                                    container
                                    direction="row"
                                    justifyContent="flex-end"
                                    alignItems="center"
                                    spacing={2}
                                    >
                                        <Grid item>
                                        <Tabs
                                        value={graphcontrol2}
                                        onChange={handleChange2}
                                        textColor="secondary"
                                        indicatorColor="secondary"
                                        aria-label="secondary tabs example"
                                       
                                    >
                                       
                                        <Tab value="two" label={<Typography variant="caption" display="block" gutterBottom>

                                            What should you already know?
                                        </Typography>} />
                                        <Tab value="three" label={<Typography variant="caption" display="block" gutterBottom>
                                            What will you learn?
                                        </Typography>}/>
                                        <Tab value="one" label={<Typography variant="caption" display="block" gutterBottom>
                                            Overview

                                        </Typography>} />
                                    </Tabs>
                                        </Grid>
                                       
                                    </Grid>
                                </Grid>
                            </Grid>
                            
                        </Grid>
                        <Grid item>
                            <Box
                            sx={{
                                width: '100%',
                                backgroundColor: 'white',
                                borderRadius: '10px',
                                height:"500px",
                                border: '1px solid grey',
                            }}
                            >
                                <Grid
                                    container
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="stretch"
                                    sx={{
                                        width:"100%",
                                        height:"100%"
                                    }}
                                >
                                    {/*INSERT GRAPH HERE */}
                                    {
                                        
                                        location.state.catalogExtra.map((catExtra,idx)=>{
                                   
                                            
                                            return(<>
                                                <Grid item xs>
                                                <ReactFlowProvider>

                                                    <FlowChart catalog={location.state.catalog.filter(video=>video.video_id == catExtra.video_id)} concept={location.state.concept} conceptExtra={catExtra} idx={idx} graphcontrol={graphcontrol2}/>

                                                </ReactFlowProvider>
                                                </Grid>
                                                <Divider orientation="vertical" variant="middle" flexItem  />
                                            </>
                                            );
                                        })
                                       
                                    }
                         
                                </Grid>
                            </Box>
                        </Grid>
                        <Grid item sx={{m:5}}>
                            <Grid
                            container
                            direction="row"
                            justifyContent="space-around"
                            alignItems="center"
                            >
                                {

                                    location.state.catalog.map((video,idx)=>{
                                        return(
                                            <Grid item key={idx}>
                                                <Links href={'/app/'+video.video_id+'/'+video.title} underline="hover" style={{marginLeft:0,paddingLeft:5, color:"#3b3b3b"}}>
                                                <Box
                                                    sx={{
                                                        width:"auto",
                                                        height:"auto",
                                                        border:1,
                                                        borderColor:"grey.300",
                                                        borderRadius:"16px",
                                                        backgroundColor:"white"
                                                    }}>
                                                    <Stack direction="row" spacing={0.5} sx={{ml:1, mr:1, mt:0.5, mb:0.5}}>
                                        
                                                        <Box
                                                        sx={{
                                                            backgroundColor:colorPick[idx],
                                                            width:"8px",
                                                            height:"15px",
                                                            mr:0,
                                                            pr:0,
                                                            mt:0.4
                                                        }}/>
                                                
                                            
                                                        
                                                            <Typography variant="caption" gutterBottom sx={{pt:0.4}}>
                                                                {video.title}
                                                            </Typography>
                                                         
                                                        <EastIcon sx={{pt:0.4, width:"15px", height:'15px'}}/> 
                                                
                                                    </Stack>
                                                </Box>
                                                </Links>  
                                               
                                                
                                            </Grid>
                                        );
                                    })
                                }
                            </Grid>
                        
                        </Grid>
                    </Grid>
                </Container>  
            </Grid>
            <Grid item sx={{backgroundColor:"rgb(237,237,237)", mt:5, p:5}}>
                <Container maxWidth="xl" sx={{}}>
                    <Grid
                    container
                    direction="column"
                    justifyContent="center"
                    alignItems="stretch"
                    id="CONFRONTO SLIDE"
                    >
                        <Grid item>
                            <Grid
                            container
                            direction="column"
                            justifyContent="center"
                            alignItems="center"
                            >
                                <Grid item>
                                <Typography variant="h4" gutterBottom sx={{mb:0,pb:0, pt:10}}>

                                    <b>Slide presence</b>

                                </Typography>
                                <Box
                                sx={{
                                    m:0,
                                    p:0,
                                    width: '100px',
                                    height: '4px',
                                    backgroundColor: "rgb(223,216,242)",
                                }}
                                />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <Grid
                            container
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            id="BOTTONI"
                            sx={{pt:5}}
                            >
                                <Grid item>
                                    <Chip 
                                        sx={{width:'auto',
                                            margin:'5px',
                                            backgroundColor:"rgb(0,0,0,0)"}}
                                        
                                        avatar={<ExpandMore3
                                            expand={expanded3}
                                    
                                            aria-expanded={expanded3}
                                            aria-label="show more"
                                            >
                                                <ExpandMoreIcon />
                                            </ExpandMore3>}
                                        label={<Typography variant="caption" display="block" gutterBottom sx={{mt:1}}>

                                        Legend

                                    </Typography>} 
                                        onClick={handleClick3}
                                       
                                    />
                                    
                                </Grid>
                                                   
                                                    {
                                                        graphcontrol3=="one"?
                                                        <Menu
                                                        anchorEl={anchorEl3}
                                                        id="account-menu"
                                                        open={open3}
                                                        onClose={handleClose3}
                                                        onClick={handleClose3}
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
                                                            display: 'block',
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
                                                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                                    >
                                                            <MenuItem>
                                                                <Typography variant="caption"  gutterBottom>

                                                                    <b>Overview:</b>

                                                                </Typography>
                                                            </MenuItem>
                                                            <MenuItem sx={{mb:0, pb:0}}>
                                                                <Box sx={{
                                                                    width:"15px",
                                                                    height:"15px",
                                                                    backgroundColor:"#FF4545",
                                                        
                                                                }}/>
                                                                <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                    Video 1
                                                                </Typography>
                                                            </MenuItem>
                                                            <MenuItem sx={{mt:0, mb:0, pt:0, pb:0}}>
                                                                <Box sx={{
                                                                    width:"15px",
                                                                    height:"15px",
                                                                    backgroundColor:"#3E7FFF"
                                                                }}/>
                                                                <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                    Video 2
                                                                </Typography>
                                                            </MenuItem>
                                                            <MenuItem sx={{mt:0, mb:0, pt:0, pb:0}}>
                                                                <Box sx={{
                                                                    width:"15px",
                                                                    height:"15px",
                                                                    backgroundColor:"#CE3FFF"
                                                                }}/>
                                                                <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                    Video 3
                                                                </Typography>
                                                            </MenuItem>
                                                            <MenuItem sx={{pt:0, pb:0}}>
                                                                <Box sx={{
                                                                    width:"15px",
                                                                    height:"15px",
                                                                    backgroundColor:"#71D89A"
                                                                }}/>
                                                                <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                    Video 4
                                                                </Typography>
                                                            </MenuItem>
                                                            <MenuItem sx={{mb:0, pb:0, mt:1}}>
                                                                <Box sx={{
                                                                    width:"15px",
                                                                    height:"15px",
                                                                    backgroundColor:"white",
                                                                    border: '1px solid gray',
                                                                }}/>
                                                                <Typography variant ="caption" gutterBottom sx={{mt:1, pl:1}}>

                                                                    Whole video

                                                                </Typography>
                                                            </MenuItem>
                                                        
                                                            <MenuItem sx={{pt:0, mt:0}}>
                                                                <Box sx={{
                                                                    width:"15px",
                                                                    height:"15px",
                                                                    backgroundColor:"grey",
                                                                    border: '1px solid gray',
                                                                }}/>
                                                                <Typography variant ="caption" gutterBottom sx={{mt:1, pl:1}}>
                                                                    Slide
                                                                </Typography>
                                                            </MenuItem>
                                                                
                                                        
                                                        </Menu>
                                                        :
                                                        graphcontrol3=="two"?
                                                        <Menu
                                                        anchorEl={anchorEl3}
                                                        id="account-menu"
                                                        open={open3}
                                                        onClose={handleClose3}
                                                        onClick={handleClose3}
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
                                                            display: 'block',
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
                                                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                                    >
                                                                    <MenuItem>
                                                                        <Typography variant="caption"  gutterBottom>
                                                                            <b>% of slides on the whole video:</b>
                                                                        </Typography>
                                                                    </MenuItem>
                                                                    <MenuItem sx={{mb:0, pb:0}}>
                                                                        <Box sx={{
                                                                            width:"15px",
                                                                            height:"15px",
                                                                            backgroundColor:"#FF4545",
                                                                
                                                                        }}/>
                                                                        <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                            Video 1
                                                                        </Typography>
                                                                    </MenuItem>
                                                                    <MenuItem sx={{mt:0, mb:0, pt:0, pb:0}}>
                                                                        <Box sx={{
                                                                            width:"15px",
                                                                            height:"15px",
                                                                            backgroundColor:"#3E7FFF"
                                                                        }}/>
                                                                        <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                            Video 2
                                                                        </Typography>
                                                                    </MenuItem>
                                                                    <MenuItem sx={{mt:0, mb:0, pt:0, pb:0}}>
                                                                        <Box sx={{
                                                                            width:"15px",
                                                                            height:"15px",
                                                                            backgroundColor:"#CE3FFF"
                                                                        }}/>
                                                                        <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                            Video 3
                                                                        </Typography>
                                                                    </MenuItem>
                                                                    <MenuItem sx={{pt:0, pb:0}}>
                                                                        <Box sx={{
                                                                            width:"15px",
                                                                            height:"15px",
                                                                            backgroundColor:"#71D89A"
                                                                        }}/>
                                                                        <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                            Video 4
                                                                        </Typography>
                                                                    </MenuItem>
                                                                
                                                                
                                                                </Menu>
                                                                :
                                                                graphcontrol3 == "three"?
                                                                <Menu
                                                                anchorEl={anchorEl3}
                                                                id="account-menu"
                                                                open={open3}
                                                                onClose={handleClose3}
                                                                onClick={handleClose3}
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
                                                                    display: 'block',
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
                                                                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                                            >
                                                                            <MenuItem>
                                                                                <Typography variant="caption"  gutterBottom>

                                                                                    <b>Whole video:</b>

                                                                                </Typography>
                                                                            </MenuItem>
                                                                            <MenuItem sx={{mb:0, pb:0}}>
                                                                                <Box sx={{
                                                                                    width:"15px",
                                                                                    height:"15px",
                                                                                    backgroundColor:"white",
                                                                                    border:2,
                                                                                    borderColor:"#FF4545",
                                                                        
                                                                                }}/>
                                                                                <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                                    Video 1
                                                                                </Typography>
                                                                            </MenuItem>
                                                                            <MenuItem sx={{mt:0, mb:0, pt:0, pb:0}}>
                                                                                <Box sx={{
                                                                                    width:"15px",
                                                                                    height:"15px",
                                                                                    backgroundColor:"white",
                                                                                    border:2,
                                                                                    borderColor:"#3E7FFF"
                                                                                }}/>
                                                                                <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                                    Video 2
                                                                                </Typography>
                                                                            </MenuItem>
                                                                            <MenuItem sx={{mt:0, mb:0, pt:0, pb:0}}>
                                                                                <Box sx={{
                                                                                    width:"15px",
                                                                                    height:"15px",
                                                                                    backgroundColor:"white",
                                                                                    border:2,
                                                                                    borderColor:"#CE3FFF"
                                                                                }}/>
                                                                                <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                                    Video 3
                                                                                </Typography>
                                                                            </MenuItem>
                                                                            <MenuItem sx={{pt:0, pb:0}}>
                                                                                <Box sx={{
                                                                                    width:"15px",
                                                                                    height:"15px",
                                                                                    backgroundColor:"white",
                                                                                    border:2,
                                                                                    borderColor:"#71D89A"
                                                                                }}/>
                                                                                <Typography variant="caption" gutterBottom sx={{mt:1,pl:1}}>
                                                                                    Video 4
                                                                                </Typography>
                                                                            </MenuItem>
                                                                        </Menu>
                                                                        :
                                                                        <>something went wrong..</>

                                                    }
                                                    
                                                    
                                                    
                                               
                                <Grid item>
                                    <Grid
                                    container
                                    direction="row"
                                    justifyContent="flex-end"
                                    alignItems="center"
                                    spacing={2}
                                    >
                                        <Grid item>
                                        <Tabs
                                        value={graphcontrol3}
                                        onChange={handleChange3}
                                        textColor="secondary"
                                        indicatorColor="secondary"
                                        aria-label="secondary tabs example"
                                       
                                    >
                                        
                                        <Tab value="two" label={<Typography variant="caption" display="block" gutterBottom>
                                            Slide
                                        </Typography>} />
                                        <Tab value="three" label={<Typography variant="caption" display="block" gutterBottom>

                                            Whole video
                                        </Typography>}/>
                                        <Tab value="one" label={<Typography variant="caption" display="block" gutterBottom>
                                            Overview

                                        </Typography>} />
                                
                                    </Tabs>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                            
                        </Grid>
                        <Grid item>
                            <Box
                            sx={{
                                width: '100%',
                                backgroundColor: 'white',
                                borderRadius: '20px',
                                height:"500px"
                            }}
                            >
                            {/*INSERT GRAPH HERE */}
                            <Barro2 catalog={location.state.catalog} catalogExtra={location.state.catalogExtra} graphcontrol = {graphcontrol3}/>
                            </Box>
                        </Grid>
                        <Grid item sx={{m:5}}>
                            <Grid
                            container
                            direction="row"
                            justifyContent="space-around"
                            alignItems="center"
                            >
                                {

                                    location.state.catalog.map((video,idx)=>{
                                        return(
                                            <Grid item key={idx}>
                                                <Links href={'/app/'+video.video_id+'/'+video.title} underline="hover" style={{marginLeft:0,paddingLeft:5, color:"#3b3b3b"}}>
                                                <Box
                                                    sx={{
                                                        width:"auto",
                                                        height:"auto",
                                                        border:1,
                                                        borderColor:"grey.300",
                                                        borderRadius:"16px",
                                                        backgroundColor:"white"
                                                    }}>
                                                    <Stack direction="row" spacing={0.5} sx={{ml:1, mr:1, mt:0.5, mb:0.5}}>
                                        
                                                        <Box
                                                        sx={{
                                                            backgroundColor:colorPick[idx],
                                                            width:"8px",
                                                            height:"15px",
                                                            mr:0,
                                                            pr:0,
                                                            mt:0.4
                                                        }}/>
                                                
                                            
                                                        
                                                            <Typography variant="caption" gutterBottom sx={{pt:0.4}}>
                                                                {video.title}
                                                            </Typography>
                                                         
                                                        <EastIcon sx={{pt:0.4, width:"15px", height:'15px'}}/> 
                                                
                                                    </Stack>
                                                </Box>
                                                </Links>  
                                               
                                                
                                            </Grid>
                                        );
                                    })
                                }
                            </Grid>
                        
                        </Grid>
                    </Grid>
                </Container>  
            </Grid>

            

        </Grid>
        <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        sx={{backgroundColor:"#9BDDC1", m:0, p:5}}
        >
            <Grid item>
                <Typography variant="overline" display="block" gutterBottom sx={{color:"white"}}>

                <b>EKEEL Platform for enhanced Video-based Learning</b>

                </Typography>
            </Grid>
        </Grid>
        {
            
        }
    
    </>);
}

