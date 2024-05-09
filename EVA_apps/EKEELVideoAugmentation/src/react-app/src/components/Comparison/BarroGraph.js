// install (please try to align the version of installed @nivo packages)
// yarn add @nivo/bar

import React from "react";
import pattern from 'patternomaly';
import { useContext,useState,useEffect,useRef } from 'react';
import{
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
)


function SecondsToTime(secondRaw){
    let duration = secondRaw
    let durationSeconds = duration;
    let hours = Math.floor(duration /3600)
    let remainminutes = Math.abs(hours - (duration /3600))
    let minutes = Math.floor(remainminutes * 60);
    let seconds = Math.abs(minutes - (remainminutes * 60))
    seconds = seconds*60
    return duration = (hours<10?("0"+hours):hours).toString()+":"+(minutes<10?("0"+minutes):minutes).toString()+":"+(Math.floor(seconds)<10?("0"+Math.floor(seconds)):Math.floor(seconds)).toString()
}

export default function Barro({catalog, catalogExtra, graphcontrol}){

 
    //function to create a pattern in svg   
    function createDiagonalPattern(color = 'black') {
        // create a 10x10 px canvas for the pattern's base shape
        let shape = document.createElement('canvas')
        shape.width = 10
        shape.height = 10
        // get the context for drawing
        let c = shape.getContext('2d')
        c.lineWidth = 3;
        // draw 1st line of the shape 
        c.strokeStyle = color
        c.beginPath()
        c.moveTo(2, 0)
        c.lineTo(10, 8)
        c.stroke()
        // draw 2nd line of the shape 
        c.beginPath()
        c.moveTo(0, 8)
        c.lineTo(2, 10)
        c.stroke()
        // create the pattern from the shape
        return c.createPattern(shape, 'repeat')
      }

    // consists of the dataset represented into the graph
    const data = {
        labels: catalog.map(video=>video.title),
        datasets:[
            {
                label:'Whole video',
                data:catalog.map(video=>video.duration),
                backgroundColor:"white",
                borderColor: graphcontrol=="two"||graphcontrol=="three"?"grey":[
                    "#FF4545",
                    "#3E7FFF",
                    "#CE3FFF",
                    "#71D89A"
                ],
                borderWidth: 5,
                grouped:false,
                order:10,
                
            },
            {
                label:'Definition',
                data:catalogExtra.map(video=>video.conceptLength),
                backgroundColor:graphcontrol=="three" || graphcontrol=="four"?"grey":[
                    "#FF4545",
                    "#3E7FFF",
                    "#CE3FFF",
                    "#71D89A"
                ],
                order:1,
                categoryPercentage:0.7,

            },
            {

                label:'In depth',
                data: catalogExtra.map(video=>video.derivatedLength),
                backgroundColor:
                    graphcontrol=="two"||graphcontrol =="four"?pattern.draw('diagonal-right-left','#cccccc'):
                    [pattern.draw('diagonal-right-left', '#F2BABA'),
                    pattern.draw('diagonal-right-left', '#B8CBF2'),
                    pattern.draw('diagonal-right-left', '#E3B8F2'),
                    pattern.draw('diagonal-right-left', '#C7E6D3')],
                borderColor: graphcontrol=="two" || graphcontrol=="four"?"grey":[
                    "#FF4545",
                    "#3E7FFF",
                    "#CE3FFF",
                    "#71D89A"
                ],
                borderWidth: 5,
                order:1,
                categoryPercentage:0.7
                
            },
        ]
    }
 
    //const used by chart.js to setup and customize the graph
    const options ={
 
        scales:{
            x:{
                display:false
            },
            y:{
                ticks:{
                    callback:function(value,index,ticks){
                        return SecondsToTime(value)
                    }
                }
            }
           },
        plugins: {  // 'legend' now within object 'plugins {}'
            legend: {
                display: false,
            },
            tooltip:{
                callbacks:{
                    title:function(context){
      
                        return ""
                    },
                    label:function(context){
                 
                        return " "+context.dataset.label+" "+SecondsToTime(context.parsed.y)
                    }
                },
                backgroundColor: "white",
                borderColor:"#e0e0e0",
                borderWidth:2,
                bodyColor:"black",
                yAlign:"bottom",
                padding:15,
                cornerRadius:15
            },
          },
         
        
          layout: {
            padding:{
                top:50,
                left:20,
                right:20
            } 
        },
        responsive: true, // Abilita la risposta al ridimensionamento
        maintainAspectRatio: false, // Disabilita il mantenimento dell'aspect ratio
        // Imposta le dimensioni desiderate
        width: 400,
        height: 300
    }
    return(<>
    
        <Bar
        data={data}
        options={options}
        redraw
        >


        </Bar>
    
    
    
    </>);
}