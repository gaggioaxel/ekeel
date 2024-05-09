import './App.css';
import React from 'react';
import Rodal from 'rodal';
import 'rodal/lib/rodal.css';
import DynamicSearch from './components/DynamicSearch/DynamicSearch';
import VideoFragments from './components/VideoFragments/VideoFragments';
import VideoTranscript from './components/VideoTranscript/VideoTranscript';
import Video from './components/Video/Video';
import GraphContainer from './components/Graph/GraphContainer';
import Concept from './components/Concept/Concept';
import updateHistoryRequest from './helpers/updateHistoryRequest';
import { RiUserSettingsLine } from 'react-icons/ri'
import { FaGripLinesVertical } from 'react-icons/fa'
import { HiOutlineHome } from 'react-icons/hi'
import LogoutButton from './components/account-management/logout/LogoutButton'
import { Link } from "react-router-dom";
import handleFetchHttpErrors from './helpers/handleFetchHttpErrors'
import {TokenContext} from './components/account-management/TokenContext'
import { GrNotes  } from 'react-icons/gr'
import Tooltip from '@material-ui/core/Tooltip';
import { TouchableOpacity } from 'react-native-web';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
{/* 
  This class renders the interface to follow a lesson and most of the features of the project
  Its props are : the url, title, and ID of the video
  Here are its components:
    * <DynamicSearch/>: 
        - this component is used to search for concenpts described in the video
        - the research is dynamic
        - props: the list of the concepts in the video and the url of the video
        - the component is implemented here : src/components/DynamicSearch/DynamicSearch.js
    * <Video/>:
        - this component will display the video in a youtube player
        - props: the url of the video and the timestamp where the user stopped watching the video
        - the component is implemented here : src/components/Video/Video.js
    * <VideoFragments/>
        - this component allows the navigation in the video through the fragments
        - props: props: the url and ID of the video
        - the component is implemented here : src/components/VideoFragments/VideoFragments.js
    * <Rodal>
        - this component is the window that will overlap the content to give details about a concept and its subgraph
        - it comes from the library: 'rodal'
    * <Concept/>
        - this component is the content of the component Rodal
        - props: the concept chosen by the user
        - the component is implemented here : src/components/Concept/Concept.js
    * <VideoTranscript/>
        - this component renders the transcript of a video
        - it displays the timestamp and the text
        - it is synchronized with the video
        - props: the url and ID of the video
        - the component is implemented here : src/components/VideoTranscript/VideoTranscript.js
    * <GraphContainer videoUrl= {videoUrl} videoId ={videoId}/>
        - this component renders the graph of a video
        - it is also synchronized with the video
        - props: the url and ID of the video
        - the component is implemented here : src/components/Graph/Graph.js
*/}
export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      // display or not the info and subgraph for a concept
      overlap: false,
      // the concept displayed with detailed info and subgraph
      concept: null, 
      // the notes taken by a user for a video
      notes: '', 
      // last timestamp where the user stopped
      lastWatchTime:0, 
      // loading of the info got thanks to the back end
      loading: true,
      // knowledge graph for the video (JSON format) 
      conceptsAndGraph: null, 
      // graph of synonyms dictionary
      conceptVocabulary: {},
      // the concept info of the synonyms
      conceptSyn: [],
      // list of the concepts of the video
      conceptsList: [], 
      // ID of the annotator of the video
      annotatorId: '', 
    }

    //create a boradcast channel to communicate with other components
    this.channel = new BroadcastChannel('react-connect');

    // function used every time app gets a message from another component through the broadcast channel
    // here the message is the concept for which the user wants to get more info
    // the message is sent by Dynamic Search
    this.channel.onmessage = res => {
      if(res.data.to === 'App'){
        try{
          let conceptSyn = [];
          for (let syn of this.state.conceptVocabulary[res.data.msg]) {
            let synonymGraph = this.state.conceptsAndGraph.find(concept => concept.conceptName===syn);
            if(synonymGraph !== undefined) {
              conceptSyn.push(synonymGraph);
            }
          }
          this.setState({concept: this.state.conceptsAndGraph.find(concept => concept.conceptName===res.data.msg), conceptSyn: conceptSyn})
          //console.log("concept", this.state.concept)
          this.channel.postMessage({to: 'Video', msg: this.state.concept.startTimestamp})
          this.show()
        } catch(error) {
        }
      }
    }
  }

  static contextType = TokenContext

  // this function returns the history of the user to load the notes registered previously
  async getHistoryRequest() {
    let response=null
      try{
        response = await fetch('/api/get_user_history', {
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
        let video_history = response.videoHistory;
        for (let i = 0; i < video_history.length; i++) {
          if (video_history[i].video_url === this.props.videoUrl) {
            this.setState({notes: video_history[i].notes, lastWatchTime: video_history[i].video_watchtime , loading: false})
          } 
        }
    }
  }

  // this function returns the ID of the nnotator of a video
  async getAnnotatorId() {
    const { videoId } = this.props;
    let response=null
    try{
      response = await fetch(`/api/graph_id/${videoId}`, {
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
    else if (response.graphs_id_list.length) {
      //console.log("annot",response.graphs_id_list[0])
      this.setState({annotatorId: response.graphs_id_list[0].annotator_id})
      //console.log("state annot", this.state.annotatorId)
      this.getGraphAndConcepts();
    } else {return}
  }

  // this function returns the graph of a video in a JSON format
  async getGraphAndConcepts() {
    const { annotatorId } = this.state;
    const { videoId } = this.props;
    let response=null
      try{
        //console.log(annotatorId)
        response = await fetch(`/api/graph/${annotatorId}/${videoId}`, {
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
            //alert('Unknown Error')
            return
        }
      }
      //console.log(response)
      if(response===undefined){
        alert('Unknown Server Error')
        return
      }
      else{
        let list = []
        //console.log(response.conceptVocabulary)
        this.setState({conceptsAndGraph: response.conceptsList, conceptVocabulary: response.conceptVocabulary, loading: false})
        response.conceptsList.forEach(concept => list.push(concept.conceptName))
        this.setState({conceptsList: list})
    }
  }

  // this function displays the notes that the user is typing
  handleChange = (event) => {
    this.setState({notes: event.target.value});
  }

  interval = null;

  checkIfNotesChanged = null;

  // this function saves the notes every 10 seconds
  saveNotes = () => {
    // save notes every 10 secondes if they have changed
    this.interval = setInterval(() => {
      if(this.checkIfNotesChanged!==this.state.notes){
        updateHistoryRequest({url: this.props.videoUrl, notes: this.state.notes}, this.context)
        this.checkIfNotesChanged = this.state.notes.slice()
      }
    }, 10000); 
  }

  async componentDidMount() {
    this.getHistoryRequest();
    this.saveNotes();
    this.getAnnotatorId();
  }

  componentWillUnmount(){
    clearInterval(this.interval)
  }

  // display of the detailed info for a concept
  show = () => {
    this.setState({ overlap: true });
  }

  // close the detailed info for a concept
  hide = () => {
      this.setState({ overlap: false });
  }

  render(){
    const { nameSurname } = this.context;
    const { loading, notes, lastWatchTime, conceptsList, conceptVocabulary, overlap, concept, conceptSyn } = this.state;
    const { videoTitle, videoUrl, videoId} = this.props;
    return (
      <div className="app">
        <div className="appHeader">
          <text className="edurell">EKEEL</text>
          <DynamicSearch items={conceptsList} url= {this.props.videoUrl}/>
          <text className="login">{nameSurname}</text>
          <FaGripLinesVertical size={30} color="white"/>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-around'}}>
              <Tooltip title ="Home Page">
                <Link to={`/dashboard`}>
                  <HiOutlineHome size={30} color="white"/>
                </Link>
              </Tooltip>
              <Tooltip title ="Compare videos">
                    
                      <Link to={`/comparisonSearch`} style={{ textDecoration: 'none' }}>
                      <Box
                                        sx={{
                                            bbackgroundColor: 'transparent',
                                            width:"20px",
                                            height:"20px",
                                            borderRadius:"50%",
                                            border:2,
                                            borderColor:"white",
                                            justifyContent:"center",
                                            alignItems:"center",
                                            p:0.3,
                                            m:0.5
                                        }}>
                      <Typography variant="button" display="block" gutterBottom sx={{color:"white"}}>
                        <b>VS</b>
                        </Typography>
                        </Box>
                      </Link>
                    </Tooltip>
              <Tooltip title ="Edit Profile">
                <Link to={`/editProfile/${nameSurname}/`}>
                  <RiUserSettingsLine size={30} color="white"/>
                </Link>
              </Tooltip>
              <LogoutButton/>
            </div>
        </div>
        <div className="appContent">
          <div className="path"><text>{videoTitle}</text></div>
          <div className="course">
            <div className="videoAndFragmentsAndNotesContainer">
              <Video url={videoUrl} lastWatchTime={lastWatchTime}/>
              <div className="fragmentsAndNotesContainer">
              <VideoFragments videoId={videoId} videoUrl={videoUrl} />
                <div class="notesContainer">
                  <div style={{padding: '1%', display: 'flex', flexDirection: 'row'}}>
                    <Tooltip  style={{cursor: "pointer", opacity: "0.3", paddingRight: '1%', color: '#A0A0A0'}} 
                      title={<p style={{ fontSize: 13 }}>Write down notes about your lesson</p>} arrow enterDelay={100}>
                        <TouchableOpacity> <GrNotes size={25} /></TouchableOpacity>
                    </Tooltip>
                    <text style={{paddingLeft: '1%'}}>Notes</text>
                  </div>
                  <textarea className="textArea"
                    cols={5}
                    value={loading ? null : notes}
                    onChange={this.handleChange}
                  />
                </div>
              </div>
              <Rodal
                visible={overlap}
                showCloseButton={false}
                width={1000}
                height={500}
              >
                <Concept close={()=>this.hide()} concept={concept ? concept : ''} conceptSyn={conceptSyn ? conceptSyn : ''} conceptVocabulary={conceptVocabulary}  />
              </Rodal>
            </div>
            <div className="TranscAndGraphContainer">
              <VideoTranscript id ={videoId} url = {videoUrl}/>
              <GraphContainer videoUrl= {videoUrl} videoId ={videoId}/>
            </div>
          </div>
        </div>
      </div>
    );
  }
}