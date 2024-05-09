import React from "react";
import "./dot.css";

/**
 * React Component used in the DotFactory Component.
 * It display a dot on the video timebar
 * the color and the size can be changed according to the inputs
 */
export default class Dot extends React.Component {

    render(){
        return <div className="Dot" 
        style={{
            left: this.props.left,
            bottom: this.props.bottom, 
            backgroundColor: this.props.backgroundColor, 
            width: this.props.size,
            height: this.props.size,}}>
        </div>;
    }
  
}