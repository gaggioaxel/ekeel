/* eslint-disable react/no-unstable-nested-components */
import React from "react"
import { DefaultNode, Graph } from "@visx/network"
import Box from '@mui/material/Box';
import { useContext,useState,useEffect, useRef } from 'react';
import Draggable, {DraggableCore} from "react-draggable";
export const background = "#272b4d"


//NOT USED ANYMORE

export default function Example({ width, height, concept, conceptExtra, idx, graphcontrol}) {

    const colorPick=[
        "red",
        "blue",
        "purple",
        "green"
    ]

    const svgRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [graphPosition, setGraphPosition] = useState({ x: 0, y: 0 });

  const handleMouseDown = (event) => {
    setIsDragging(true);
    setDragStartPos({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = (event) => {
    if (isDragging) {
      const deltaX = event.clientX - dragStartPos.x;
      const deltaY = event.clientY - dragStartPos.y;
      setGraphPosition((prevPosition) => ({
        x: prevPosition.x + deltaX,
        y: prevPosition.y + deltaY,
      }));
      setDragStartPos({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };


    if(concept==undefined || conceptExtra == undefined){
        return;
    }

    let prenodes = []
    if(conceptExtra["list_preconcept"].length > 0){
        for(let i=0; i<conceptExtra["list_preconcept"].length; i++){
            prenodes=[...prenodes,{x:100+(i*100),y:0, name:conceptExtra["list_preconcept"][i], color:graphcontrol=="three"?"grey":colorPick[idx], type:"preconcept"}]
        }
    }
    

    const connodes = {x:100,y:200,name:concept, color:graphcontrol!="one"?"grey":colorPick[idx], type:"concept"}

    let dernodes = []
    if(conceptExtra["list_derivatedconcept"].length>0){
        for(let i=0; i<conceptExtra["list_derivatedconcept"].length; i++){
            dernodes=[...dernodes,{x:100+(i*100),y:400, name:conceptExtra["list_derivatedconcept"][i], color:graphcontrol=="two"?"grey":colorPick[idx], type:"derivatedconcept"}]
        }    
    }
    
    let links = []
    for(let i=0; i<prenodes.length; i++){
        links=[...links,{source:prenodes[i], target:connodes}]
    }

    for(let i=0; i<dernodes.length; i++){
        links=[...links,{source:connodes, target: dernodes[i]}]
    }

    const nodes = [...prenodes,connodes,...dernodes]

    const graph = {
        nodes,
        links
    }

   
  return (<>
  <svg
      ref={svgRef}
      width={width}
      height={height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
 
      <Graph
 
        graph={graph}
        top={graphPosition.y}
          left={graphPosition.x}
        nodeComponent={({ node: { name ,color,type} }) =>
        <g>
        <rect
            x={-30}
            y={-15}
            width={60}
            height={30}
            rx={8}
            fill={type=="concept"?color:"white"}
            stroke={type!="concept"?color:"none"}
            strokeWidth={2}
            strokeDasharray={type=="concept" || type=="preconcept"?"0":"4"}
          />
        <text  
            x={-28}
            y={7}
            fill={type=="concept"?"white":"black"}
            >{name}</text>
        </g>
        }
        linkComponent={({ link: { source, target, dashed } }) => (
          <line
            x1={source.x}
            y1={source.y}
            x2={target.x}
            y2={target.y}
            strokeWidth={2}
            stroke="#999"
            strokeOpacity={0.6}
            strokeDasharray={dashed ? "8,4" : undefined}
          />
        )}
      />

     
   

    </svg>
    </>
  )
}
