import React from 'react';
import './VideoFragments.css';
import ProgressBar from "@ramonak/react-progress-bar";
import { TouchableOpacity, ImageBackground } from 'react-native-web';
import Tooltip from '@material-ui/core/Tooltip';

/**
 * React Component used by the VideoFragments component
 * It display a clickable video fragment and a progressbar of the fragment
 */
export default class VideoFragments extends React.Component {

    //convert from format 'HH:MM:SS' to seconds
    convertTimeInSeconds = (time)=>{
        var a = time.split(':'); // split it at the colons
        // minutes are worth 60 seconds. Hours are worth 60 minutes.
        return (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
    }

    startInSec = this.convertTimeInSeconds(this.props.start);
    endInSec = this.convertTimeInSeconds(this.props.end);
    percentageBarProgress = this.props.progress;

    intervall = null;
    async componentDidMount(){
        // regularly send to the VideoFragments Component the progress of this Fragment
        this.intervall = setInterval(()=>{
            this.props.setProgress( this.percentageBarProgress, this.props.index)
        }, 5000)
    }

    componentWillUnmount(){
        clearInterval(this.intervall);
    }

    render(){
    if (this.startInSec <= this.props.currentVideoTime && this.props.currentVideoTime <= this.endInSec+5 && this.percentageBarProgress!==100){
        let intermediatePercentageBar = Math.round( 100* (this.props.currentVideoTime - this.startInSec)/(this.endInSec - this.startInSec) )
        if(intermediatePercentageBar>100){
            if(this.percentageBarProgress>90){
                this.percentageBarProgress = 100;
            }
        }
        else{
            this.percentageBarProgress = intermediatePercentageBar;
        }
    }

    let tooltipTitle

    /* Just for now the keywords are static --> TODO find automatically keywords*/ 
    
    /*
    //if ( this.props.videoId == 'sXLhYStO0m8'){

        let k =this.props.keyword.split(",")
        let t = []

        if (k!= ""){
            for(let i in k){
                t.push(React.createElement('li', {}, k[i]))
            }

            tooltipTitle =  React.createElement('p', {className: 'keywordsList'}, [
                    "Keywords: ",
                    React.createElement('ul', {}, t)
                ])
        }


    }else
        tooltipTitle = "go to "+ this.props.start*/

   


    return (
        <div className="Fragment-container">
            <ProgressBar 
                completed= {this.percentageBarProgress} 
                height={'20px'} 
                labelSize={'15px'} 
                bgColor={(this.percentageBarProgress===100)?'green' : 'red'} 
                labelColor={(this.percentageBarProgress===100)?'white' : 'black'}
                borderRadius={'10px'}
                margin={'5%'}
                labelAlignment={'left'}
            />
            <Tooltip title={tooltipTitle} >
                <TouchableOpacity onPress={this.props.onPress} className="Fragment-image" style={{border: '2px solid black', width: '130%', height: '70%'}}>
                    <ImageBackground
                        source={{uri: "/api/get_image/"+this.props.videoId+'/'+this.props.index}}
                        style={{flex:1, resizeMode: "cover", justifyContent: "center"}}>
                        <text style={{flex:1, resizeMode: "none", justifyContent: "none", color: '#fff', 'textShadow': '1px 0 0 #000, 0 -1px 0 #000, 0 1px 0 #000, -1px 0 0 #000'}}>{this.props.start}</text>
                    </ImageBackground>    
                </TouchableOpacity>
            </Tooltip>
            <text className="Fragment-concept">{this.props.name}</text>
        </div>
    )
    }
    
}
