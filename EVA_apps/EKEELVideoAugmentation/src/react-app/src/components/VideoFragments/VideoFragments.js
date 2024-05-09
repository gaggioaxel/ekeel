import React from 'react';
import './VideoFragments.css';
import { ScrollView } from 'react-native-web';
import Fragment from './Fragment'
import updateHistoryRequest from "./../../helpers/updateHistoryRequest"
import{ TokenContext } from "./../account-management/TokenContext";
import handleFetchHttpErrors from './../../helpers/handleFetchHttpErrors';
import Spinner from 'react-activity/lib/Spinner';
import 'react-activity/lib/Spinner/Spinner.css';
import { MdFormatListBulleted  } from 'react-icons/md'
import Tooltip from '@material-ui/core/Tooltip';
import { BsFillQuestionCircleFill  } from 'react-icons/bs'
import { TouchableOpacity } from 'react-native-web';

/**
 * React Component used by the App component
 * display a ScrollView of Fragment components and save the fragment's progress to the backend
 */

let tooltipText = "Navigate in the video thanks to the fragments and see your progress!"
//let keywords = ["Sex determination, Pelvis, Sciatic notch", "Pre-auricular sulcus, Ventral arc, Iliopubic ramus","Skull","Eye sockets", "Forehead, Mastoid process, Posterior zygomatich arch", "Nuchal crest", "Femur"]


export default class VideoFragments extends React.Component {

    static contextType = TokenContext;

    constructor(props) {
        super(props);
        this._isMounted = false
        this.keywords = null
        this.channel = new BroadcastChannel('react-connect'); //create a boradcast channel
    
        this.fragmentsInput = null
        this.state = {
            currentVideoTime: 0,
            fragments: null,
            areFragmentsLoaded: false,
            errorFragmentLoading : false
        }

        this.channel.onmessage = res => {
          if(res.data.to === 'Fragments'){
            console.log(res);
          }
        }

        this.currentVideoTimeChannel = new BroadcastChannel("videoCurrentTime");

        this.currentVideoTimeChannel.onmessage = input => {
            if(this._isMounted)
                this.setState({currentVideoTime: input.data})
        }
    }
    
    // ask the Video fragment to change the timestamp of the video and log this user behavior to the backend
    sendMessage = (time) =>{
        this.channel.postMessage({to: 'Video', msg: time})
        updateHistoryRequest({url: this.props.videoUrl, fragment_clicks: 1}, this.context)
    }

    // used by the Fragments to notify this component that their progress changed
    updateFragmentProgress = (progress, index)=> {
        if (progress!== undefined && index!==undefined){
            var fragmentsCopy  = this.state.fragments.slice()
            if(fragmentsCopy[index]!==undefined){
                fragmentsCopy[index].progress = progress
                this.setState({fragments : fragmentsCopy})
            }
        }
    }

    //fetch the fragments configuration of the video and the fragments progress from the user history in the backend
    getFragmentHistoryRequest = async  () => {
        let response=null
        let videoId = this.props.videoId
          try{
            response = await fetch('/api/get_fragments/'+videoId, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Basic ' + btoa(this.context.token+':unused')
                },
              })
              .then(handleFetchHttpErrors)
              .then(res => res.json())
          }
          catch(err){
            console.log(err)
            if(err.message==="401"){
                alert('Your session have expired, please re-login')
                this.context.setToken('')
                return
            }
            else  {
                alert('Unknown Error')
                return
            }
          }
          //console.log(response)
          if(response===undefined){
            alert('Unknown Server Error')
            return
          }
          else{
            return response;
        }
      }

    intervall1=null;
    checkIfProgresschanged = null
    //regurarly save the fragments' progress of the user for this video in the backend
    saveFragmentProgress = () => {
        this.intervall1 = setInterval(() =>{
            if(this.checkIfProgresschanged!==JSON.stringify(this.state.fragments)){
                updateHistoryRequest({url: this.props.videoUrl, fragments:this.state.fragments, video_watchtime: this.state.currentVideoTime}, this.context)
                this.checkIfProgresschanged = JSON.stringify(this.state.fragments)
            }
        },10000)
    }

    async componentDidMount(){
        this._isMounted = true
        var fetchedFragment = await this.getFragmentHistoryRequest()
        if(fetchedFragment.fragments && fetchedFragment.fragments.length){
            this.fragmentsInput= fetchedFragment.fragments
            this.keywords = fetchedFragment.keywords
            //console.log(this.keywords)
            this.setState({fragments: fetchedFragment.fragments ,areFragmentsLoaded: true })
        }
        else{
            this.setState({errorFragmentLoading: true })
        }
        this.saveFragmentProgress()
    }


    componentWillUnmount(){
        this._isMounted = false
        clearInterval(this.intervall1)
    }

    render () {

        return (
                <div className="Video-fragments">
                    {/*<Tooltip  style={{cursor: "pointer", paddingRight: '1%', color: '#A0A0A0'}} 
                          title={<p style={{ fontSize: 13 }}>{tooltipText}</p>} arrow enterDelay={100}>
                            <TouchableOpacity><BsFillQuestionCircleFill /></TouchableOpacity>
                        </Tooltip>*/}


                        
                    <div className="titleContainer">
                    <Tooltip  style={{cursor: "pointer", paddingRight: '1%', color: '#A0A0A0'}} 
                          title={<p style={{ fontSize: 13 }}>{tooltipText}</p>} arrow enterDelay={100}>
                            <TouchableOpacity><MdFormatListBulleted size={25}/></TouchableOpacity>
                        </Tooltip>
                        
                        
                        <text style={{paddingLeft: '1%', width: '100%'}}>Fragments navigation</text>

                        
                        
                    </div>
                    {this.state.areFragmentsLoaded 
                    ?<ScrollView horizontal={true} style={{width: '100%', height: '100%'}}>
                        {/* list of fragments */}
                        { this.fragmentsInput.map((f,index) => { 
                            
                            /* Just for now the keywords are static --> TODO find automatically keywords*/ 
                            /*if(this.props.videoId != "sXLhYStO0m8")
                                return <Fragment 
                                            name={f.name}
                                            start={f.start}
                                            end={f.end}
                                            onPress={()=>this.sendMessage(f.start)}
                                            currentVideoTime= {this.state.currentVideoTime}
                                            index={index}
                                            progress = {f.progress}
                                            setProgress={this.updateFragmentProgress}
                                            videoId={this.props.videoId}
                                        />
                            else*/
                                return <Fragment 
                                    key={"Fragment__"+index}
                                    name={f.name}
                                    start={f.start}
                                    end={f.end}
                                    onPress={()=>this.sendMessage(f.start)}
                                    currentVideoTime= {this.state.currentVideoTime}
                                    index={index}
                                    progress = {f.progress}
                                    setProgress={this.updateFragmentProgress}
                                    videoId={this.props.videoId}
                                    keyword={this.keywords[index]}
                                />
                                })
                        }                  
                    </ScrollView>
                    : this.state.errorFragmentLoading? <text>Sorry, an error occured during fragment loading</text> 
                    :  <Spinner/>}
                </div>
        )
    }
  }