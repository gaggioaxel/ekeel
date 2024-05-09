import * as React from 'react';
import Chip from '@mui/material/Chip';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import Typography from '@mui/material/Typography';
import {useState, forwardRef} from 'react';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import imag from './imgtest/brainicon.PNG'
import { useTheme } from '@material-ui/core/styles';
import CancelIcon from '@mui/icons-material/Cancel';
import Paper from '@mui/material/Paper';
import Fade from '@mui/material/Fade';
import Modal from '@mui/material/Modal';
import Backdrop from '@mui/material/Backdrop';
import Badge from '@mui/material/Badge';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { useContext } from 'react';
import { ContextComparison } from './ContextComparison';
import {TokenContext} from '../account-management/TokenContext';
import HelpIcon from '@mui/icons-material/Help';
import Popover from '@mui/material/Popover';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import EastIcon from '@mui/icons-material/East';

  

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

//its the filter window that appears after you press the filter button
const Filters=forwardRef(({ApplyFilters, expanded},ref)=>{

   
    const [anchorEl1, setAnchorEl1] = useState(null);
    const handlePopoverOpen1 = (event) => {
        setAnchorEl1(event.currentTarget);

    };
    const handlePopoverClose1 = () => {
        setAnchorEl1(null);
    };
    const open1 = Boolean(anchorEl1);

    const [anchorEl2, setAnchorEl2] = useState(null);
    const handlePopoverOpen2 = (event) => {
        setAnchorEl2(event.currentTarget);
    };
    const handlePopoverClose2 = () => {
        setAnchorEl2(null);
    };
    const open2 = Boolean(anchorEl2);

    const [anchorEl3, setAnchorEl3] = useState(null);
    const handlePopoverOpen3 = (event) => {
        setAnchorEl3(event.currentTarget);
    };
    const handlePopoverClose3 = () => {
        setAnchorEl3(null);
    };
    const open3 = Boolean(anchorEl3);


    const [alignment1, setAlignment1] = useState(null);

    const handleChange1 = (event, newAlignment) => {
        setAlignment1(newAlignment);
    };
    const [alignment2, setAlignment2] = useState(null);

    const handleChange2 = (event, newAlignment) => {
        setAlignment2(newAlignment);
    };
    const [alignment3, setAlignment3] = useState(null);

    const handleChange3 = (event, newAlignment) => {
        setAlignment3(newAlignment);
    };

    const [alignment4, setAlignment4] = useState(null);

    const handleChange4 = (event, newAlignment) => {
        setAlignment4(newAlignment);
    };

    const [alignment5, setAlignment5] = useState(null);

    const handleChange5 = (event, newAlignment) => {
        setAlignment5(newAlignment);
    };

    const [alignment6, setAlignment6] = useState(null);

    const handleChange6 = (event, newAlignment) => {
        setAlignment6(newAlignment);
    };

    const[radiog, Setradiog] = useState("recent")
    return(<>
        
       

        <Collapse in={expanded} timeout={0} unmountOnExit>
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
                                                open={open1}
                                                anchorEl={anchorEl1}
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
                                    
                                    value={alignment1}
                                    exclusive
                                    onChange={handleChange1}
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
                                                open={open2}
                                                anchorEl={anchorEl2}
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
                                    
                                    value={alignment2}
                                    exclusive
                                    onChange={handleChange2}
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
                                                open={open3}
                                                anchorEl={anchorEl3}
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
                                    
                                    value={alignment3}
                                    exclusive
                                    onChange={handleChange3}
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
                                    
                                    value={alignment4}
                                    exclusive
                                    onChange={handleChange4}
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
                                    
                                    value={alignment5}
                                    exclusive
                                    onChange={handleChange5}
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
                                    
                                    value={alignment6}
                                    exclusive
                                    onChange={handleChange6}
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
                                    defaultValue="recent"
                                    name="radio-buttons-group"
                                    onChange={(event,value)=>Setradiog(value)}
                                >
                                    <FormControlLabel value="recent" control={<Radio color="default"/>} 

                                        label={<Typography variant="subtitle2" display="inline" gutterBottom>Latest </Typography>}/>
                                    <FormControlLabel value="videolength" control={<Radio color="default"/>} 
                                        label={<Typography variant="subtitle2" display="inline" gutterBottom>Video duration</Typography> }/>
                                    <FormControlLabel value="detailedlength" control={<Radio color="default"/>} 
                                        label={<Typography variant="subtitle2" display="inline" gutterBottom>Definition duration</Typography>} />
                                    <FormControlLabel value="deflength" control={<Radio color="default"/>} 
                                        label={<Typography variant="subtitle2" display="inline" gutterBottom>In depth duration</Typography>}/>

                                </RadioGroup>
                            </FormControl>
                        </Grid>
                    
                    </Grid>
                </Grid>

            </Grid>
        </Grid>

        {/* FROM HERE START PART FOR BUTTON */}

        <Grid id="asd"item sx={{  display: 'flex' , width:'100%',pb:0,mb:0,pt:0,mt:0}}>
      
            <Grid
            container
            direction="row"
            justifyContent="flex-end"
            alignItems="flex-end"
            sx={{backgroundColor:"white", borderRadius:'0 0 50px 50px'}}
            >
                <Grid item xs >
                </Grid>
                <Grid item xs >
                </Grid>
                <Grid item xs="auto" sx={{p: 2 ,backgroundColor:'#B798f8', borderRadius:'50px 0 50px 0', cursor:"pointer",
                    '&:hover': {
                    backgroundColor: "#cbb3fc",
               
                    
                    }
            ,}} onClick={()=>{

                    ApplyFilters([alignment1,alignment2,alignment3,alignment4,alignment5,alignment6,radiog])
                }}>
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
                </Grid>


            </Grid>
           
        </Grid>


        </Grid>
        </Collapse>
        
        
        
    
    
    
    
    </>);
});

export default Filters;