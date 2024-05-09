   
import Graph from "react-graph-vis";
import React from "react";
import{ TokenContext } from "./../account-management/TokenContext";
import updateHistoryRequest from "./../../helpers/updateHistoryRequest"
import {useParams} from "react-router-dom";
import { downloadObjectAsJson } from '../../helpers/downloadObjectAsJson'
import { BsDownload  } from 'react-icons/bs'
import Popup from "./Popup/Popup";
import handleFetchHttpErrors from './../../helpers/handleFetchHttpErrors';
import Spinner from 'react-activity/lib/Spinner';
import 'react-activity/lib/Spinner/Spinner.css';
import Tooltip from '@material-ui/core/Tooltip';

/**
 * React Component used in the GraphContainer.
 * It display a network graph and a Popup overlay.
 */


let edgeBaseWidth = 0.6
let focusOptions = {
  scale: 0.85,
  locked: false,
  animation: true
}

/* Nodes colors */
let baseColor = "#F5F5F5"
let explainingColor = "#e87c76"
let explainedColor = "#F8CECC"

function arrayEquals(a, b) {
  return Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index]);
}

export default class GraphKnowledge extends React.Component {

  static contextType = TokenContext;

  constructor(props){
    super(props);
    this._isMounted = false
    this.options={
      edges: {
            color: "#000000",
            hoverWidth: 100,
            smooth: true
          },
      nodes: {
        shape: "dot",
        size: 10,
        opacity: 0.9,
        mass:1
      },
      layout: { 
        randomSeed: 50, //fixed seed --> always the same nodes positions
        improvedLayout: true, 
        hierarchical: false, 
        clusterThreshold: 1000
      },
      physics: {
        stabilization: true,
        forceAtlas2Based: {
          avoidOverlap: 1,
          springLength: 400
        }
      },
      
      manipulation: {
        enabled: true
      }/*,
      interaction: { multiselect: true}*/
    };
    
    this.state = {graph: {
        nodes: [],
        edges: []
      },
      currentVideoTime: 0.01,
      networkNodes: false,
      networkEdges: false,
      network: null,

      showPopup: false,
      xPopup : 0,
      yPopup : 0,
      conceptNamePopup : '',
      conceptTimeBeginPopup  : '',
      isGraphLoaded: false,
      errorGraphLoading : false,
      errorText : 'Sorry, an error occured during graph loading',
      lastFocusedNodes: null,
      lastFocusedTime: 0

    };

    
    
  }


  /**
   * Contruct the network graph data that will be used by the Graph component,
   * this function parse the json object to create the node and the edges.
   * The additional informations on each concepts (like the begin and end timetamps) can't be stored in this.state.node Object
   * because this Object will be used by the Graph Component, provided by an external librarie.
   * Therefor, a Map Object this.descriptionTimestamps has been created to store these informations
   * @param graphData json object 
   */
  initGraph = (graphData, conceptVocabulary)=> {
    this.linkingTimestamps = new Map();
    this.descriptionTimestamps = new Map();

    let concepts = []
    let conceptVocabularyMap = {}

    //console.log(conceptVocabulary)

    // check if concept vocabulary is absent in the db (old versions), if so build it as empty
    if(!conceptVocabulary) {
      for (const node of graphData["@graph"]){
        if(node.id.startsWith("edu:")){
          conceptVocabularyMap[node.id.slice(4).replaceAll("_"," ")] = [];
        }
        else{
          conceptVocabularyMap[node.id.replaceAll("_"," ")] = [];
        }
      }
    }
    else {
      for(let concept of conceptVocabulary['@graph']) {
        if ('skos:altLabel' in concept) {
          
          let altLabels;

          if ('@value' in concept['skos:altLabel']) {
            altLabels = [concept['skos:altLabel']]
          }
          else {
            altLabels = concept['skos:altLabel']
          }
          
          for (let i=0; i<altLabels.length; i++) {
            
            if(i === 0) {
              conceptVocabularyMap[concept['skos:prefLabel']['@value']] = [altLabels[i]['@value']]
            }
            else {
              conceptVocabularyMap[concept['skos:prefLabel']['@value']].push(altLabels[i]['@value'])
            }  
          }
        }
        else {
          console.log("else")
          conceptVocabularyMap[concept['skos:prefLabel']['@value']]=[]
        }
      }
    }


    let tempSyn = [];
    let finalNodes = [];

    for (const node of graphData["@graph"]){
      //creating a node if it's a a concept
      if(node.type==='skos:Concept'){
        let nodelabel
        if(node.id.startsWith("edu:")){
          nodelabel= node.id.slice(4).replaceAll("_"," ")
        }
        if(node.id.startsWith("concept_")){
          //nodelabel= node.id.slice(8)
          nodelabel= node.id.slice(8).replaceAll("_"," ")
          console.log(nodelabel)
        }
        if(! tempSyn.includes(nodelabel)) {
          console.log("sinonimi")
          
          let synonymsId = [];
          let nodeName = "";

          //console.log(conceptVocabularyMap)
          //console.log(nodelabel)
          //console.log(conceptVocabularyMap[nodelabel])

          let nodeWithSyns = [nodelabel];

          if(!(nodelabel in conceptVocabularyMap)) {
            //console.log("building " + nodelabel)
            conceptVocabularyMap[nodelabel] = [];
          }
          //console.log("considering " + nodelabel)
          if(conceptVocabularyMap[nodelabel].length > 0) {
            for(let synonym of conceptVocabularyMap[nodelabel]) {
              nodeWithSyns.push(synonym);
              tempSyn.push(synonym)
            }
            synonymsId = conceptVocabularyMap[nodelabel].map(el => "concept_" + el.replaceAll(" ", "_"));
            nodeWithSyns.sort();

            nodeName = "";
            for(let i=0; i<nodeWithSyns.length; i++) {
              if(i===0) {
                  nodeName = nodeWithSyns[i];
              }
              else {
                  nodeName += " = " + nodeWithSyns[i];
              }   
            }
          }
          else {
            synonymsId = []
            nodeName = nodelabel;
          }
          finalNodes.push(nodelabel)
          this.state.graph.nodes.push({id: nodelabel, synonymsId: synonymsId, label: nodeName, color: baseColor, shadow:true, font: {color : 'black' , face: 'monospace'} })
        }
      }
    }

    for (const node of graphData["@graph"]){
      if(node.type==='Annotation'){
        if(node.body!=null){
          //creating an edge if the motivation is linking    
          if(node.motivation==='edu:linkingPrerequisite'){
            if(node.target!=null && node.target["dcterms:subject"]!=null && node.target["dcterms:subject"].id!=null){

              let nodePrereq = node.body.replace("concept_", "");
              let nodeTarget = node.target["dcterms:subject"].id.replace("concept_", "");
              console.log(nodePrereq)
              console.log(nodeTarget)

              for (let n of this.state.graph.nodes) {
                if(n.synonymsId.includes(node.body)) {
                  nodePrereq = n.id;
                  console.log(nodePrereq)
                }
                if(n.synonymsId.includes(node.target["dcterms:subject"].id)) {
                  nodeTarget = n.id;
                  console.log(nodeTarget)
                }
              }

              if(!this.state.graph.edges.some(e => e.from === nodePrereq && e.to === nodeTarget)){
                this.state.graph.edges.push({from: nodePrereq, to: nodeTarget})

                var conceptTimeBegin = node.target.selector.value.replace("^^xsd:dateTime","");
                
                this.linkingTimestamps.set(nodePrereq+"-.-"+nodeTarget, 
                  {
                    id: nodePrereq+"-.-"+nodeTarget,
                    prerequisite: nodePrereq,
                    target: nodeTarget,
                    beginTime: conceptTimeBegin, 
                    beginTimeInSec: this.convertTimeInSeconds(conceptTimeBegin), 
                    alreadyColored: false 
                    
                  })
              }
                       
            }
          }
          
          //add the timestamps in the descriptionTimestamps Map
          //each concept can have more descriptions in different times
          //a description can be a "definition" or "in depth"

          
          else if(node.motivation==='describing'){
 
            
            //console.log(node["skos:note"])
            var conceptTimeBegin = node.target.selector.startSelector.value.replace("^^xsd:dateTime","");
            var conceptTimeEnd = node.target.selector.endSelector.value.replace("^^xsd:dateTime","");

            var beginSeconds = this.convertTimeInSeconds(conceptTimeBegin)
            var endSeconds = this.convertTimeInSeconds(conceptTimeEnd)

            let nodeD = node.body.replace("concept_", "");
            console.log("nodeD")
            console.log(nodeD)
            for (let n of this.state.graph.nodes) {
              console.log(n)
              if(n.synonymsId.includes(node.body)) {
                nodeD = n.id;
              }
            }

            if(this.descriptionTimestamps.has(nodeD)){
              
              let newOBj = this.descriptionTimestamps.get(nodeD)
              newOBj.word.push(node.body)
              newOBj.beginTime.push(conceptTimeBegin)
              newOBj.endTime.push(conceptTimeEnd)
              newOBj.beginTimeInSec.push(beginSeconds)
              newOBj.endTimeInSec.push(endSeconds)
              newOBj.descriptionType.push(node["skos:note"])

              this.descriptionTimestamps.set(nodeD, newOBj)

            }else{
              this.descriptionTimestamps.set(nodeD, 
                {
                  id: nodeD, 
                  word: [nodeD],
                  descriptionType: [node["skos:note"]],
                  beginTime: [conceptTimeBegin], 
                  beginTimeInSec: [beginSeconds],  
                  endTime: [conceptTimeEnd], 
                  endTimeInSec:  [endSeconds]
                })

                console.log(this.descriptionTimestamps)
            }
            
            
          }
          
        }
      }
    }
    
    // BroadcastChannel are used to send messages to other Components whithout passing by the parent components
    this.channel = new BroadcastChannel('react-connect');
    this.dotsChannel = new BroadcastChannel("dots");
    
    //this events are used by the Graph component
    this.events = {

      /*when you select a node on the graph it :
          - displays the Popup Component 
          - send a message to the Video Component to show or hide the Dots Overlay
      */
      select: ({ nodes, edges , pointer: { DOM } }) => {

        const result = this.descriptionTimestamps.get(nodes[0]);
        //console.log(result)
        if(result!==undefined){

          if(result.beginTime!=null){
            let dotArray=[]

            let first_def = true;

            //for each description of the concept clicked
            //A big dot for the "definitions" and a smaller one for "in depth"
            // for the first definition a popup is needed

            for(let i = 0; i<result.beginTimeInSec.length; i++){

              //console.log("--")
              //console.log(result.descriptionType[i])
              
              if(result.descriptionType[i] == "conceptDefinition"){
                console.log("CONCEPTDEFINITION")
                dotArray.push({ time: result.beginTime[i] , backgroundColor: '#228B22', size: 15})
              }
                
              else
                dotArray.push({ time: result.beginTime[i] , backgroundColor: '	#686868', size: 10})
              
              // Select concept to show in popup             
              let words = result.word.map(el => el.slice(8).replaceAll("_"," "))
              console.log(words)
              let timestamps = result.beginTime
              let popupMap = {}

              for(let i=0; i<words.length; i++) {
                popupMap[words[i]] = {"Definition": [], "In depth": []}
                console.log(popupMap[words[i]])
              }

              for(let i=0; i<words.length; i++) {
                console.log("non lo so")
                if (result.descriptionType[i] == "conceptDefinition") {
                  popupMap[words[i]]["Definition"].push(timestamps[i])
                }
                if (result.descriptionType[i] == "conceptExpansion") {
                  popupMap[words[i]]["In depth"].push(timestamps[i])
                }
              }

              this.setState({
                showPopup: true ,
                xPopup : DOM.x +10, 
                yPopup : DOM.y+10, 
                popupMap: popupMap
              })
              
              
              this.resetEdgesWidth()
            }

            this.dotsChannel.postMessage(dotArray)
          }
        }
        else {
          this.dotsChannel.postMessage([])
          this.setState({showPopup: false})
        }
      },

      deselectNode: () => {       
          this.setState({showPopup: false})  
          
          this.resetEdgesWidth()
      },
      dragStart: () => {       
        this.setState({showPopup: false})  
        this.dotsChannel.postMessage([])     
      },
    }

    this.currentVideoTimeChannel = new BroadcastChannel("videoCurrentTime");

    /**
     * receive the video timer, and change the graph's node color accordingly
     */
    this.currentVideoTimeChannel.onmessage = input => {
      if(this._isMounted && input!=null){
        // case where you come back in time in the video, this reset the color of some red nodes to white and the focus
        if(this.state.currentVideoTime > input.data){
          
          this.linkingTimestamps.forEach((value, key, map) =>{

            if(value.beginTimeInSec >= input.data && value.alreadyColored){
              this.changeNodeColor(value.prerequisite, baseColor) 
              this.changeNodeColor(value.target, baseColor) 
              value.alreadyColored = false             
            } 
            
          })

          this.descriptionTimestamps.forEach((value, key, map) =>{

            for(let i = 0; i<value.beginTimeInSec.length; i++){
              if(value.beginTimeInSec[i] >= input.data){
                this.changeNodeColor(key, baseColor)              
              } 
            }
          })


         if(this.state.lastFocusedNodes != null){
            this.resetEdgesWidth()
            this.state.lastFocusedNodes = null
            this.state.lastFocusedTime = 0
          }

        }

        this.setState({currentVideoTime: input.data})

        //when a linking relation begins, the prerequisite and the target must change color
        this.linkingTimestamps.forEach((value, key, map) =>{
          
          if(value.beginTimeInSec<= input.data && !value.alreadyColored){
            this.changeNodeColor(value.prerequisite, explainedColor)
            this.changeNodeColor(value.target, explainedColor)
            value.alreadyColored = true
          }

        })

        /* this part change the color of the nodes corresponding to the concepts that have been/are explained to red
           and it focuses on the concept that is being explained
        */
        let nodesToFocus = []
        this.descriptionTimestamps.forEach((value, key, map) =>{

          let found = false;

          //if the concept is being explained the color of the node is red
          for(let i = 0; i<value.beginTimeInSec.length; i++){
            
            if(value.beginTimeInSec[i]<= input.data && input.data <= value.endTimeInSec[i]){
              this.changeNodeColor(key, explainingColor)
              nodesToFocus.push(key)
              found = true;
            }
            
          }
          
          //if the concept is not being explained and it is already explained the color is pink
          for(let i = 0; i<value.beginTimeInSec.length; i++){
            if(!found && value.endTimeInSec[i] <= input.data){
              this.changeNodeColor(key, explainedColor)
              
              if(this.state.lastFocusedNodes != null && this.state.lastFocusedNodes.includes(key)){
                let connectedEdges = this.state.network.getConnectedEdges(key)
                this.changeEdgesWidth(connectedEdges, edgeBaseWidth)
              }
            } 
          }

        })
        //console.log(nodesToFocus)
        /*
          If the focus must be to different nodes, get all nodes and edges to highlight and then zoom on them
        */
        if(!arrayEquals(nodesToFocus,this.state.lastFocusedNodes) && this.state.lastFocusedTime != input.data ){

          let connectedEdges = []
          let connectedNodes = []

          for(let i in nodesToFocus){

            let node = nodesToFocus[i]
            connectedNodes.push(node)
            connectedNodes = connectedNodes.concat(this.state.network.getConnectedNodes(node))
            connectedEdges = connectedEdges.concat(this.state.network.getConnectedEdges(node))
            
          }
          
          this.changeEdgesWidth(connectedEdges, 3)
          this.state.network.selectNodes(connectedNodes, false)

          if(nodesToFocus.length == 1){

            this.state.network.focus(nodesToFocus[0], focusOptions)
                                       
          }else if(nodesToFocus.length > 1){
            this.state.network.fit({
              animation:true,
              nodes: nodesToFocus
            })
            
          }

          this.state.lastFocusedNodes = nodesToFocus
          this.state.lastFocusedTime = input.data
        }

        
      }
    };
  }

  //change the color of the node where node.id===key
  changeNodeColor = (key, color) => {
    // copy the graph's node data, modify the color of the node, then replace the graph's node data with the modified copy
    var graphNodesCopy = this.state.graph.nodes.slice();
    graphNodesCopy.forEach((item, index, array)=>{
      if(item.id === key){
        if(item.color!== color){
          item.color= color;
          try{
            this.state.networkNodes.update(item)
          }
          catch{}
        }
      }
    })
    this.setState(prevState => ({graph: {edges: prevState.graph.edges, nodes: graphNodesCopy}}))
  }

  //change the width od the edges
  changeEdgesWidth = (keys, size) => {
    // copy the graph's edges data, modify the size of the edge, then replace the graph's edge data with the modified copy
    var graphEdgesCopy = this.state.graph.edges.slice();
    graphEdgesCopy.forEach((item, index, array)=>{

      for (let i in keys)
        if(item.id === keys[i]){

            item.width = size

            try{
              this.state.networkEdges.update(item)
            }
            catch{}
          
          }
    })
    this.setState(prevState => ({graph: {edges: graphEdgesCopy, nodes: prevState.graph.nodes}}))
  }

  //reset edges width 
  resetEdgesWidth = () => {
    let connectedEdges = []

    if(this.state.lastFocusedNodes!=null)
      for(let i in this.state.lastFocusedNodes){
        connectedEdges = connectedEdges.concat(this.state.network.getConnectedEdges(this.state.lastFocusedNodes[i]))
      }
        
    this.changeEdgesWidth(connectedEdges, edgeBaseWidth)
  }

  /**
   * @returns the json of the graph of the video fetched from the backend
   */
  getGraphRequest = async  () => {
    let response=null
    let videoId = this.props.videoId
      try{
        response = await fetch('/api/get_graph/'+videoId, {
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
        if(err.message==="409"){
          this.setState({errorText: 'Sorry, the graph is not available for this video'})
          return;
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
        return {"graph": response.graph, "conceptVocabulary": response.conceptVocabulary};
    }
  }

  //convert from format 'HH:MM:SS' to seconds
  convertTimeInSeconds = (time)=>{
    var a = time.split(':'); // split it at the colons
    // minutes are worth 60 seconds. Hours are worth 60 minutes.
    return (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
  }

  //In order to improve the visualization of the graph, remove all transitive relations
  removeTransitivity = (graph)=>{

    graph.nodes.forEach(x => 
      graph.nodes.forEach(y => 
        graph.nodes.forEach(z => {

          if ( x.id != y.id && y.id != z.id){
            if (graph.edges.some(e => e.from === x.id && e.to === y.id)){
              if (graph.edges.some(e => e.from === y.id && e.to === z.id)){

                  let objIndex = graph.edges.findIndex((obj => obj.from == x.id && obj.to === z.id));
                  if (objIndex != -1)
                    graph.edges.splice(objIndex,1)
              }
            }
          }
           
        })
      )
    )
  }

  async componentDidMount(){
    this._isMounted = true

    var fetchedGraph = await this.getGraphRequest()
    if(fetchedGraph.graph){
        this.initGraph(fetchedGraph.graph, fetchedGraph.conceptVocabulary)
        this.setState({isGraphLoaded: true })
    }
    else{
        this.setState({errorGraphLoading: true })
    }
}

  componentWillUnmount() {
    this._isMounted = false
  }

  render(){
    return (
      <div id="myNetwork" style={{height: '90%', position: 'relative'}}>
        <Popup 
          visible={this.state.showPopup} 
          x={this.state.xPopup} 
          y={this.state.yPopup}
          //conceptList={this.state.conceptList}
          //conceptTimeBeginList={this.state.conceptTimeBeginList}
          popupMap={this.state.popupMap}
          goToTimestamp = {(time) => this.channel.postMessage({to: 'Video', msg: time})}
        />
        {this.state.isGraphLoaded
        ?
        <div style={{height: '90%', position: 'relative', border: '#cfcccc thin solid'}}>
          <Graph
            getNodes = {nodes => {this.setState({networkNodes: nodes})} }
            getEdges = {edges => {this.setState({networkEdges: edges})} }
            graph={this.state.graph}
            options={this.options}
            events={this.events}
            getNetwork={(n) => {this.setState({network: n})}}
            />
            <Tooltip style={{cursor: "pointer"}} title="Download Graph (json format)">
              <button>
              <BsDownload size={25} onClick={()=>downloadObjectAsJson(this.state.graph, "graph")}/>
              </button>
            </Tooltip>
        </div>
          : this.state.errorGraphLoading? <text>{this.state.errorText}</text> 
          :<Spinner/>}
      </div>
      )
  }
}