import React, { useCallback,useState ,useEffect,useRef  } from 'react';
import './FlowChart.css';
import ReactFlow, {
  addEdge,
  ConnectionLineType,
  Panel,
  useNodesState,
  useEdgesState,
  Background, 
  MarkerType,
  MiniMap,
  Controls,
  ReactFlowProvider,
  useReactFlow ,
  ControlButton,

} from 'reactflow';

import ELK from "elkjs";
import 'reactflow/dist/style.css';


const LayoutFlow = ({catalog, concept, conceptExtra, idx, graphcontrol}) => {

   //a function used to check if small is included into big
   let checker = (big, small) => {
    return small.every(v => big.includes(v));
  };


  const reactFlowInstance = useReactFlow();
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [direction, setDirection] = useState("DOWN");
 
    const colorPick=[
      "#FF4545",
      "#3E7FFF",
      "#CE3FFF",
      "#71D89A",

      "#ff7878",
      "#9dbdfc",
      "#e08dfc",
      "#a4f5c4"
  ]
  const nodeColor = (node) => {
    if(idx == 0){
      switch (node.type) {
        case 'input':
          return '#FFFFFF';
        case 'output':
          return '#FFFFFF';
        default:
          return '#FF4545';
      }
    }else if(idx == 1){
      switch (node.type) {
        case 'input':
          return '#FFFFFF';
        case 'output':
          return '#FFFFFF';
        default:
          return '#3E7FFF';
      }
    }else if(idx == 2){
      switch (node.type) {
        case 'input':
          return '#FFFFFF';
        case 'output':
          return '#FFFFFF';
        default:
          return '#CE3FFF';
      }
    }else if(idx == 3){
      switch (node.type) {
        case 'input':
          return '#FFFFFF';
        case 'output':
          return '#FFFFFF';
        default:
          return '#71D89A';
      }
    }else{
      switch (node.type) {
        case 'input':
          return '#6ede87';
        case 'output':
          return '#6865A5';
        default:
          return '#ff0072';
      }
    }
    
  };

  

  const nodeStrokeColor = (node) => {
    if(idx == 0){

      if(node.type=="output"){
        return "#ff7878";
      }else{
        return '#FF4545';
      }
          
    
    }else if(idx == 1){
      if(node.type=="output"){
        return "#9dbdfc";
      }else{
        return '#3E7FFF';
      }
          
      
    }else if(idx == 2){
      if(node.type=="output"){
        return "#e08dfc";
      }else{
        return '#CE3FFF';
      }
          
      
    }else if(idx == 3){
      if(node.type=="output"){
        return "#a4f5c4";
      }else{
        return '#71D89A';
      }
          
      
    }else{
      switch (node.type) {
        case 'input':
          return '#6ede87';
        case 'output':
          return '#6865A5';
        default:
          return '#ff0072';
      }
    }
  
  };


  //used to create the tree graph 

  const elk = new ELK();
    const elkLayout = (nodes,edges,dir) => {
 
     const nodesForElk = nodes.map((node) => {
   
      switch(dir){
       
        case "LEFT":
          node.targetPosition="right";
          node.sourcePosition="left";
          break;
        case "RIGHT":
          node.targetPosition="left";
          node.sourcePosition="right";
          break;
        case "UP":
          node.targetPosition="bottom";
          node.sourcePosition="top";
          break;
        case "DOWN":
          node.targetPosition="top";
          node.sourcePosition="bottom";
          break;
      }
        
       return {
         id: node.id,
         width: 172,
         height: 36
       };
     });
     const graph = {
       id: "root",
       layoutOptions: {
         "elk.algorithm": "layered",
         "elk.direction": dir,
         "nodePlacement.strategy": "SIMPLE",
         "spacing.nodeNodeBetweenLayers":100,
       },
    
       children: nodesForElk,
       edges: edges
     };
     return elk.layout(graph);
    };


  //setup the graph first time  

  useEffect(()=>{

    const position = { x: 0, y: 0 };

    let prenodes = []
    let prenodesnote=[]

    let initialNodes=[]

    let postnodes=[]
    let postnodesnote=[]

    let initialEdges=[]
    let flowidx=0

    if(conceptExtra["list_preconcept"].length > 0){


        //compute the percentage of prerequisite if explained or not
        let list_pre = conceptExtra["list_preconcept"]
        let maxnum=list_pre.length;
        let countnum=0;
        for(let i=0;i<maxnum; i++){
          if (checker(catalog[0].extracted_keywords,[list_pre[i]])){
            countnum++;
          }
        }

        

        //left: if for 80% prerequisite explained in the video. right: if the prerequisite isnt in the extracted concepts = oa:description = not explained
        if((countnum/maxnum >= 0.8) || !checker(catalog[0].extracted_keywords, conceptExtra["list_preconcept"])){
          prenodes=[{
                id:(flowidx++).toString(),
                type:'input',
                data:{label:"you can watch this video: no prerequisites are required"},
                position,
                style:{backgroundColor:"white", borderColor:graphcontrol=="three"?"grey":colorPick[idx], borderWidth:"5px",fontWeight:"bold"}
          }]

        }else{
          for(let i=0; i<conceptExtra["list_preconcept"].length; i++){
            prenodes=[...prenodes,{
                id:(flowidx++).toString(),

                type:'input',
                data:{label:conceptExtra["list_preconcept"][i]},
                position,
                style:{backgroundColor:"white", borderColor:graphcontrol=="three"?"grey":colorPick[idx], borderWidth:"5px",fontWeight:"bold"}
            }];
            prenodesnote=[...prenodesnote,conceptExtra["list_prenotes"][i]]

          }
        }
        

    }else{
      prenodes=[{
        id:(flowidx++).toString(),
        type:'input',
        data:{label:"you can watch this video: no prerequisites are required"},
        position,
        style:{backgroundColor:"white", borderColor:graphcontrol=="three"?"grey":colorPick[idx], borderWidth:"5px",fontWeight:"bold"}
      }]
    }

    if(conceptExtra["list_derivatedconcept"].length>0){
        for(let i=0; i<conceptExtra["list_derivatedconcept"].length; i++){
            postnodes=[...postnodes,{
                id:(flowidx++).toString(),

                type:'output',
                data:{label:conceptExtra["list_derivatedconcept"][i]},
                position,
                style:{backgroundColor:"white", borderColor:graphcontrol=="two"?"grey":colorPick[idx+4], borderWidth:"5px",fontWeight:"bold"}
            }];
            postnodesnote=[...postnodesnote,conceptExtra["list_postnotes"][i]]
        }    
    }

    initialNodes=[...initialNodes, {
        id:"conceptSelected",
        data:{label:concept},
        position,

        style:{backgroundColor:graphcontrol=="two"?"grey":colorPick[idx], color:"white", borderColor:graphcontrol=="two"?"grey":colorPick[idx], fontWeight:"bold"}

    }]

    for(let i=0; i<prenodes.length; i++){
        initialEdges=[...initialEdges,{
            id:(flowidx++).toString(),

            source:prenodes[i].id,
            target:"conceptSelected",
            type: 'smoothstep',
            markerEnd:{
                type: MarkerType.Arrow,
                
            },
            style: {
              strokeWidth: prenodesnote[i]=="strongPrerequisite"?3:1
            }
        }]
    }

    for(let i=0; i<postnodes.length; i++){
        initialEdges=[...initialEdges,{
            id:(flowidx++).toString(),

            source:"conceptSelected",
            target:postnodes[i].id,
            type: 'smoothstep',
            markerEnd:{
                type: MarkerType.Arrow,

            },
            style:{
              strokeWidth: postnodesnote[i]=="strongPrerequisite"?3:1
            }
        }]
    }

    initialNodes=[...prenodes,...initialNodes,...postnodes]

    elkLayout(initialNodes,initialEdges,direction).then((graph) => {
   
      setNodes(nodesForFlow(graph,initialNodes));
      setEdges(edgesForFlow(graph));
    });

  },[]);



    //used to retrieve list of nodes

    const nodesForFlow = (graph, initialNodes) => {
      return [
        ...graph.children.map((node) => {
          
          return {
            ...initialNodes.find((n) => n.id === node.id),
            position: { x: node.x, y: node.y }
          };
        })
      ];
    };


    //used to retrieve list of edges

    const edgesForFlow = (graph) => {
      return graph.edges;
    };


    //called each rendering to center the graph

    useEffect(()=>{
      reactFlowInstance.fitView();
    })
    

    //if we change direciton of the graph this will be called and update the rendering

    useEffect(()=>{
  
      if(nodes!=undefined){
      
        let newnode = nodes.map(node=>{
          
          if(node.type == "input"){
            node.style={backgroundColor:"white", borderColor:graphcontrol=="three"?"grey":colorPick[idx], borderWidth:"5px",fontWeight:"bold"}
          }else if(node.type == "output"){
            node.style={backgroundColor:"white", borderColor:graphcontrol=="two"?"grey":colorPick[idx+4], borderWidth:"5px",fontWeight:"bold"}
          }else{

            node.style={backgroundColor:graphcontrol=="two"?"grey":colorPick[idx], color:"white", borderColor:graphcontrol=="two"?"grey":colorPick[idx], fontWeight:"bold"}

          }
          return node
        })
        
        setNodes([...newnode])
      }
     
    },[graphcontrol])


    //update the direction of graph

    const onLayout = 
      (nodes,edges,direction) => {
        elkLayout(nodes,edges,direction).then((graph) => {
  
          setNodes([...nodesForFlow(graph,nodes)]);
          setEdges([...edgesForFlow(graph)]);
        });
      }
    


  return (
<>    <ReactFlow
      nodes={nodes}
      edges={edges}
      id={idx}
      fitView
    >
      <Controls />
      <MiniMap nodeColor={nodeColor} nodeStrokeColor={nodeStrokeColor} nodeStrokeWidth={10} zoomable pannable />
      <Panel position="top-right">
      
        <button onClick={() => {onLayout(nodes,edges,'DOWN')}}>vertical layout</button>
        <button onClick={() => {onLayout(nodes,edges,'RIGHT')}}>horizontal layout</button>
      </Panel>
    </ReactFlow>
    </>
  );
};


export default LayoutFlow;
