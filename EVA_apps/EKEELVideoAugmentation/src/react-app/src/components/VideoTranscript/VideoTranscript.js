import React from 'react';
import './VideoTranscript.css';
import Spinner from 'react-activity/lib/Spinner';
import 'react-activity/lib/Spinner/Spinner.css';
import { ScrollView, TouchableOpacity } from 'react-native-web';
import { downloadObjectAsJson } from '../../helpers/downloadObjectAsJson';
import { BsCardText, BsDownload, BsArrowsAngleExpand, BsArrowsAngleContract } from 'react-icons/bs'
import updateHistoryRequest from "../../helpers/updateHistoryRequest"
import {TokenContext} from '../account-management/TokenContext'
import Tooltip from '@material-ui/core/Tooltip';


/**
 * React Component used by the App Component
 * show the transcript of the video that scrolls automatically according to the curent video timestamp
 */
let tooltipText = "Follow and navigate through your lesson with its transcript"
export default class VideoTranscript extends React.Component {
    constructor() {
        super();
        this._isMounted = false
        this.scrollRef = React.createRef();
        this.channel = new BroadcastChannel('react-connect'); //create a boradcast channel
        this.currentVideoTimeChannel = new BroadcastChannel("videoCurrentTime");
        // Transcript is always listening to Video to be aware of the current timestamp to move on in the reading
        this.currentVideoTimeChannel.onmessage = input => {
            if(this._isMounted && input){
                this.setState({currentTime: input.data})
            }
          };
    } 
    
    static contextType = TokenContext

    state= {
        // video transcript
        transcript: null,
        // loading of info got thanks to the back end
        loading: true,
        // current timestamp of the video
        currentTime: null, 
        // transcript visible or not
        visible: false,
    };

    componentDidMount() {
        const video_id = this.props.id;
        console.log("TRANSCRIPT")
        console.log(this.props)
        this._isMounted = true
        let data = {
            video_id
        }
        // request to get the transcript of a video
        fetch('/api/youtube_transcript', {
            method: 'POST',
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(data => this.setState({ transcript: data, loading: false }));        
    }

    componentWillUnmount() {
        this._isMounted = false
      }

    // share with video the timestamp where the user wants to go
    sendMessage = (time) =>{
        this.channel.postMessage({to: 'Video', msg: time})
        updateHistoryRequest({url: this.props.url, transcript_clicks: 1}, this.context)
    }

    ref = scroll => {
        this.scroll = scroll
      }

    hideAndShowTranscript = () => {
       this.setState(prevState => ({visible: !prevState.visible}))
    }

    render () {
        
        const { loading, currentTime, transcript, visible } = this.state;
        let integerCurrentTime = Math.floor(currentTime);

        return (
                <div className="Video-transcript" style={{maxHeight: this.state.visible ? '80%' : '8%'}}>
                    <div className="title">
                    <Tooltip  style={{cursor: "pointer", opacity: "0.6", paddingRight: '1%', color: '#A0A0A0'}} 
                      title={<p style={{ fontSize: 13 }}>{tooltipText}</p>} arrow enterDelay={100}>
                        <TouchableOpacity> <BsCardText size={25}/></TouchableOpacity>
                    </Tooltip>
                        
                        <text className="titleText">Transcript</text>
                        {/* if you clcik on the icon of dowloading you can download the transcript in a JSON format */}
                        <Tooltip style={{cursor: "pointer"}} title="Download Transcript">
                            <button>
                            <BsDownload size={25} onClick={loading ? null : ()=>downloadObjectAsJson(transcript, "transcript")}/>
                            </button>
                        </Tooltip>
                        <Tooltip title={this.state.visible ? "Reduce" : "Enlarge"}>
                            <button>
                            <TouchableOpacity  onPress = {()=>this.hideAndShowTranscript()} >{this.state.visible ? <BsArrowsAngleContract size={25}/> : <BsArrowsAngleExpand size={25}/>}</TouchableOpacity>
                            </button>
                        </Tooltip>
                    </div>
                    <div className="line"/>
                    <div className="transcriptContainer">
                     {visible 
                         ? loading
                           ? <Spinner/>
                           : <ScrollView ref={this.ref} style={{height: '100%', width: '100%'}}>
                            { transcript.map((f,i) => { 
                                var startDate = new Date(null);
                                // turn the amount of seconds in a event
                                startDate.setSeconds(f.start);
                                // only keep the hh:mm:ss format 
                                var start = startDate.toISOString().substr(11, 8);
                                try {
                                        if(integerCurrentTime >= f.start && integerCurrentTime <= f.end){
                                            this.scroll.scrollTo({y: transcript.indexOf(f) * 90, animated: true})
                                        }
                                } catch (error) {
                                    console.log(error)
                                }
                        return (
                                <div key={"div__"+i} className="textContainer" style={{opacity: integerCurrentTime >= f.start && integerCurrentTime <= f.end ? 1 : 0.5}}>
                                    <Tooltip key={"Tooltip__"+i} title={"go to "+start}>
                                        <TouchableOpacity key={"TouchableOpacity__"+i} style={{display: 'flex', flexDirection: 'column'}} onPress={()=>this.sendMessage(start)}>
                                            <text key={"text1__"+i} style={{fontWeight: 'bold'}}>{start}</text>
                                            <text key={"text2__"+i} >{f.text}</text>
                                        </TouchableOpacity>
                                    </Tooltip>
                                </div>
                            )
                        })
                    }                  
                    </ScrollView>
                    :null
                    }
                    </div>
                </div>
        )
    }
  }
  