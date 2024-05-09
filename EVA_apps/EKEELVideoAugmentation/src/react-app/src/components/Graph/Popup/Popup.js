import React from "react"
import './Popup.css'

/**
 * React Component used in the GraphKnowledge component.
 * It shows a small pop-up that appear next to the user's pointer when he clicks on a node of the graph
 */
export default class Popup extends React.Component{

    channel = new BroadcastChannel('react-connect'); //create a broadcast channel


    render(){
        return(this.props.visible &&
            <div className="popup" style={{left: `${this.props.x}px`, top: `${this.props.y}px`, display: 'inline-block'}}>
                { this.props.popupMap && Object.keys(this.props.popupMap).sort().map((word, id) =>
                <ul className="ul-popup">
                    <li className="popup-li">                       
                        Concept: <span className="text-concept-popup">{word}</span> 
                    </li>
                    { this.props.popupMap[word]["Definition"].sort().map((time, id) =>
                        <div className="row">
                            <button className="popup-button" onClick={()=>this.props.goToTimestamp(time)} > Definition: {time}</button>
                        </div>
                    )
                    }
                    { this.props.popupMap[word]["In depth"].sort().map((time, id) =>
                        <div className="row">
                            <button className="popup-button" onClick={()=>this.props.goToTimestamp(time)} > In depth: {time}</button>
                        </div>
                    )
                    }
                    <div className="row">
                            <button className="popup-button" onClick={()=>this.channel.postMessage({to: 'App', msg: word})} > Detailed description </button>
                    </div>
                </ul>) 
                }
            </div>
        )
    }
}
