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
import dagre from 'dagre';
import ELK from "elkjs";



import 'reactflow/dist/style.css';



const LayoutFlow = ({catalog, concept, conceptExtraRaw}) => {
  let checker = (big, small) => {
    return small.every(v => big.includes(v));
  };
    const conceptExtra = conceptExtraRaw[0]


  const reactFlowInstance = useReactFlow();
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [direction, setDirection] = useState("DOWN");
 
   


  


  const elk = new ELK();
    const elkLayout = (nodes,edges,dir="RIGHT") => {
 
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

      }else{

        for(let i=0; i<conceptExtra["list_preconcept"].length; i++){
            prenodes=[...prenodes,{
                id:(flowidx++).toString(),
                type:'input',
                data:{label:conceptExtra["list_preconcept"][i]},
                position,
                style:{backgroundColor:"#E8F7F1", fontWeight:"bold"}
            }];
            prenodesnote=[...prenodesnote,conceptExtra["list_prenotes"][i]]
        }

      }

    }

    if(conceptExtra["list_derivatedconcept"].length>0){
        for(let i=0; i<conceptExtra["list_derivatedconcept"].length; i++){
            postnodes=[...postnodes,{
                id:(flowidx++).toString(),
                type:'output',
                data:{label:conceptExtra["list_derivatedconcept"][i]},
                position,
                style:{backgroundColor:"#A7D0BF",fontWeight:"bold",color:"white"}
            }];
            postnodesnote=[...postnodesnote,conceptExtra["list_postnotes"][i]]
        }    
    }

    initialNodes=[...initialNodes, {
        id:"conceptSelected",
        data:{label:concept},
        position,
        style:{backgroundColor:"#FFA825", color:"white", fontWeight:"bold"}
    }]

    for(let i=0; i<prenodes.length; i++){
        initialEdges=[...initialEdges,{
            id:(flowidx++).toString(),
            //id:prenodes[i].id+"_to_conceptSelected",
            source:prenodes[i].id,
            target:"conceptSelected",
            type: 'smoothstep',
            markerEnd:{
                type: MarkerType.Arrow,
                
            },
            style: {
              strokeWidth: 1,
              stroke:"#FFA825"
            }
        }]
    }

    for(let i=0; i<postnodes.length; i++){
        initialEdges=[...initialEdges,{
            id:(flowidx++).toString(),
            //id:"conceptSelected_to_"+postnodes[i].id,
            source:"conceptSelected",
            target:postnodes[i].id,
            type: 'smoothstep',
            markerEnd:{
                type: MarkerType.Arrow,

            },
            style:{
              strokeWidth: 1,
              stroke:"#FFA825"
            }
        }]
    }

    initialNodes=[...prenodes,...initialNodes,...postnodes]

 
    
    


    elkLayout(initialNodes,initialEdges,"RIGHT").then((graph) => {
   
      setNodes(nodesForFlow(graph,initialNodes));
      setEdges(edgesForFlow(graph));
    });

  },[]);


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
    const edgesForFlow = (graph) => {
      return graph.edges;
    };

   

    useEffect(()=>{
      reactFlowInstance.fitView();
    })
    
  

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
      fitView
    >
      <Controls />
      <Panel position="top-right">

      </Panel>
    </ReactFlow>
    </>
  );
};


export default LayoutFlow;
