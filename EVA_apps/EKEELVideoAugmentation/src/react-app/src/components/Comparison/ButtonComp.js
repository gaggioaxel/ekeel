import {
    Link,
} from "react-router-dom";
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
export default function ButtonComp(){
    return (
     
                <Link to={`/comparisonSearch`}> <Button sx={{ mt:2}}variant="outlined">Compare Videos</Button></Link>
       
    );
}