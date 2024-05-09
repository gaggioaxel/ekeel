import React from "react";
import Dot from './Dot'

/**
 * React Component used in the Video Component.
 * create Dot components from an Array passsed in input
 */
export default class DotFactory extends React.Component {

    render(){
        
        return (this.props.dotArray.map(f => {
            const bottom = Math.round(44 - f.size/2); 
            return <Dot 
                    left={f.left}
                    backgroundColor= {f.backgroundColor}
                    size= {f.size+'px'}
                    bottom= {bottom+'px'}
                    />
            })
        )
    }
  
}