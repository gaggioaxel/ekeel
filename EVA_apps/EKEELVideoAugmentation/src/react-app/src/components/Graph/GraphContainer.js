import React from 'react';

import './Graph.css';

import graph from '../../logo/graph.png';
import GraphKnowledge from './GraphKnowledge';

import { BsArrowsAngleExpand, BsArrowsAngleContract  } from 'react-icons/bs'

import { TouchableOpacity } from 'react-native-web';

import Tooltip from '@material-ui/core/Tooltip';
import { downloadObjectAsJson } from '../../helpers/downloadObjectAsJson'
import { BsDownload  } from 'react-icons/bs'
import { BsFillQuestionCircleFill  } from 'react-icons/bs'

/**
 * React Component used by the App component.
 * It display or hide the graph in the GraphKnowledge component when the user clicks on the TouchableOpacity button
 */

let tooltipText = "Explore the Map extracted from the video to visualize the presentation flow of the concepts and which ones you need to understand the more advanced concepts!"

export default class GraphContainer extends React.Component {

    constructor() {
        super();
        this.channel = new BroadcastChannel('react-connect'); //create a boradcast channel
    
        this.channel.onmessage = res => {
          if(res.data.to === 'Graph'){
            console.log(res);
          }
        }

        this.state = {
           visible: true
        }
    }

    hideAndShowGraph = () => {
       this.setState(prevState => ({visible: !prevState.visible}))
    }

    render () {
      let result;

      const title =  <div className="graphTitleContainer">
                       
                        
                        <Tooltip  style={{cursor: "pointer", paddingRight: '1%', color: '#A0A0A0'}} 
                          title={<p style={{ fontSize: 13 }}>{tooltipText}</p>} arrow enterDelay={100}>
                            <TouchableOpacity> <img className="graph-logo" src={graph} alt="Graph"></img></TouchableOpacity>
                        </Tooltip>

                        <text className="titleText"> Map of concepts' flow</text>
                           
                        <Tooltip title={this.state.visible ? "Reduce" : "Enlarge"}>
                           <button>
                           <TouchableOpacity onPress = {()=>this.hideAndShowGraph()} style={{paddingRight: '3%'}}>{this.state.visible ? <BsArrowsAngleContract size={25}/> : <BsArrowsAngleExpand size={25}/>}</TouchableOpacity>
                           </button>
                        </Tooltip>
                     </div>

      if(this.state.visible === true)
      {
         result = <div className = "visibleGraphContainer">
                    {title}
                    <div style={{backgroundColor: 'black', width: '100%', display: 'flex'}}></div>
                    <GraphKnowledge videoUrl= {this.props.videoUrl} videoId={this.props.videoId} />
                  </div>
      } else {
         result = <div className = "hiddenGraphContainer">
                     {title}
                  </div>
      }

      return ( 
               <div className = {this.state.visible ? "showGraph" : "hideGraph"} >
                  {result}
               </div>
      )
       
    }
  }