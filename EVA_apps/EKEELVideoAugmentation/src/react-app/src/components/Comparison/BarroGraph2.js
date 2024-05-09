// install (please try to align the version of installed @nivo packages)
// yarn add @nivo/bar

import React from "react";
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


//secondRaw is in seconds, and transform it in a string of format hh:mm:ss
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

    //dataset to display 
    const data = {
        labels: catalogExtra.map(video=>(video.video_slidishness*100).toString()+"%"),
        datasets:[
            {

                label:'Whole video',
                data:catalog.map(video=>video.duration),
                backgroundColor:"white",
                borderColor: graphcontrol=="two"?"grey":[
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

                label:'Slide',
                data:catalogExtra.map(video=>video.video_slidishness*catalog.filter(cat=>cat.video_id == video.video_id)[0].duration),
                backgroundColor:graphcontrol=="three"?"grey":[
                    "#FF4545",
                    "#3E7FFF",
                    "#CE3FFF",
                    "#71D89A"
                ],
                categoryPercentage:0.7,
            },
       
        ]
    }


    //options to setup and customize the graph
    const options ={
       scales:{
        x:{
            display:true
        },
        y:{
            ticks:{
                callback:function(value,index,ticks){
                    return SecondsToTime(value)
                }
            }
        },
       },
        responsive: true, // Abilita la risposta al ridimensionamento
        maintainAspectRatio: false, // Disabilita il mantenimento dell'aspect ratio
        // Imposta le dimensioni desiderate
        width: 400,
        height: 300,
        layout: {
            padding:{
                top:50,
                left:20,
                right:20
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