import Graph from "react-graph-vis";
import React from "react";


/**
 * Graph displayed by the Concept Component, it's a subgraph of the video graph (see GraphKnowledge component) focused on one concept
 */
export default class SubGraph extends React.Component {
  
    constructor(props){
      super(props);
      this.options={
        edges: {
              color: "#000000",
              smooth: true
            },
        nodes:{
          shape: "dot",
          size: 10,
          opacity: 0.9,
          mass:0.9
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
            springLength: 200
          },
        },
        manipulation: {
          enabled: true
        },
        width: "650px",
        height: "400px",
      };
      
      this.state = {
        networkNodes: false,
        networkEdges: false,
        };

        try{}   catch{}
    }

// this next function will change node-names to include synonyms in the detailed description visualization.
    getNameWithSynonyms = (label) => {

      var conceptVocabulary = this.props.conceptVocabulary;
      let nodeName = "";

      let nodeWithSyns = [label];
      if(!(label in conceptVocabulary)) {
        conceptVocabulary[label] = [];
      }
      if(conceptVocabulary[label].length > 0) {
        for(let synonym of conceptVocabulary[label]) {
          nodeWithSyns.push(synonym);
        }
    
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
        nodeName = label; 
      }

      return nodeName;
    }

// this function will include synonyms to the relations.
    getRelationTargets = (word) => {

      var conceptVocabulary = this.props.conceptVocabulary;
      return conceptVocabulary[word];
    }

    /**
     * function triggered when the concept change, and redraw the graph focused on the updated concept
     */
    componentDidUpdate = ()=> {
      try{this.state.networkEdges.clear();}   catch{}
      try{this.state.networkNodes.clear();}   catch{}
      var conceptObject = this.props.concept;
      var conceptSyn = this.props.conceptSyn;

      if(conceptObject){
          let addedRels = []
          
          let label = conceptObject.conceptName;

          let newLabel = this.getNameWithSynonyms(label)

          try{
            this.state.networkNodes.add({id: conceptObject.conceptName, label: newLabel, color: "#B85450", shadow:true ,font: {color : 'black' , face: 'monospace'} })
          }   catch{}

          for(const target of conceptObject.subgraph.targets){
            
            let label = target.conceptName;
            let newTargetLabel = this.getNameWithSynonyms(label)

            try{
              this.state.networkNodes.add({id: target.conceptName, label: newTargetLabel, color: "#C0BAC0", shadow:true ,font: {color : 'black' , face: 'monospace'} })
            }   catch{}

            try{

              if (conceptObject.subgraph.relations.some(e => e.prerequisite === conceptObject.conceptName && e.target === target.conceptName)){
                
                let edge = {from: conceptObject.conceptName, to: target.conceptName}

                if(!addedRels.some(e => e.from === edge.from && e.to === edge.to)){
                  this.state.networkEdges.add({from: conceptObject.conceptName, to: target.conceptName})
                  addedRels.push({from: conceptObject.conceptName, to: target.conceptName})
                }
              }
              
                
            }   catch{}
          }

          // Adding synonyms relations
          for(let concept of conceptSyn) {

            for(const target of concept.subgraph.targets){
            
              let label = target.conceptName;
              let newTargetLabel = this.getNameWithSynonyms(label)
  
              try{
                this.state.networkNodes.add({id: target.conceptName, label: newTargetLabel, color: "#C0BAC0", shadow:true ,font: {color : 'black' , face: 'monospace'} })
              }   catch{}
  
              try{
  
                if (concept.subgraph.relations.some(e => e.prerequisite === concept.conceptName && e.target === target.conceptName)){
                  
                  let edge = {from: conceptObject.conceptName, to: target.conceptName}
  
                  if(!addedRels.some(e => e.from === edge.from && e.to === edge.to)){
                    this.state.networkEdges.add({from: conceptObject.conceptName, to: target.conceptName})
                    addedRels.push({from: conceptObject.conceptName, to: target.conceptName})
                  }
                }
                    
              }   catch{}
            }
          }
          
          this.addPrerequisiteTree(conceptObject, conceptObject.subgraph.relations, addedRels)
          for(let concept of conceptSyn) {
            this.addPrerequisiteTree(concept, concept.subgraph.relations, addedRels, conceptObject)
          }

          try{this.state.networkNodes.update({id: conceptObject.conceptName, label: newLabel, color: "#B85450", shadow:true ,font: {color : 'black' , face: 'monospace'} })
            }   catch{}
            
      }
    }

    // recursive function used to draw the graph
    addPrerequisiteTree  = (conceptObject, relations, addedRels, synonymOf = false) => {

      let target = conceptObject.conceptName;

      if(synonymOf) {
        target = synonymOf.conceptName;
      }

      for(const prerequisite of conceptObject.subgraph.prerequisites){
        
        let label = prerequisite.conceptName;
        let newPrereqLabel = this.getNameWithSynonyms(label)

        try{
          this.state.networkNodes.add({id: prerequisite.conceptName, label: newPrereqLabel, color: "#E0B7DF", shadow:true, font: {color : 'black' , face: 'monospace'} })
        }   catch{}
        try{
          if (relations.some(e => e.prerequisite === prerequisite.conceptName && e.target === conceptObject.conceptName)){

              let edge = {from: prerequisite.conceptName, to: target}

              //console.log(addedRels)
              if(!addedRels.some(e => e.from === edge.from && e.to === edge.to)){
                this.state.networkEdges.add({from: prerequisite.conceptName, to: target})
                addedRels.push({from: prerequisite.conceptName, to: target})
              }

          }
            
        }   catch{}
        this.addPrerequisiteTree(prerequisite, relations, addedRels)
      }
      if(!conceptObject.subgraph.prerequisites.length && !synonymOf){

        let label = conceptObject.conceptName;
        let newlabel = this.getNameWithSynonyms(label)

        try{
          this.state.networkNodes.update({id: conceptObject.conceptName, label: newlabel, color: "#A9ACEA", shadow:true, font: {color : 'black' , face: 'monospace'} })
        }   catch{}
      }
    }
      
    //convert from format 'HH:MM:SS' to seconds
    convertTimeInSeconds = (time)=>{
      var a = time.split(':'); // split it at the colons
      // minutes are worth 60 seconds. Hours are worth 60 minutes.
      return (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
    }
  
    render() {
      return (
          <Graph
            getNodes = {nodes => {this.setState({networkNodes: nodes})} }
            getEdges = {edges => {this.setState({networkEdges: edges})} }
            graph={{
                nodes: [],
                edges: []
              }}
            options={this.options}
            />
        )
    }
  }