import React from 'react';
import { TouchableOpacity } from 'react-native-web';
import './Concept.css';
import SubGraph from './SubGraph/SubGraph';
import { BsDownload  } from 'react-icons/bs';
import { downloadObjectAsJson } from '../../helpers/downloadObjectAsJson';

{/*
    This component displays more info and the subgraph for a concept
    Here are its components:
        * ConceptProperty:
            - gives the title of an info and its content
            - props: the title of the property and it's value (data)
        * Legend: 
            - gives information the colors of the nodes of the subgraph
            - props: title of the legend and color associated
    The imported function "downloadObjectAsJson" allows the user to download the subgraph in a JSON format
*/}

const backButtonStyle = {
    display: 'flex',
    backgroundColor: 'grey',
    height: '60%',
    width: '75%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold'
} 

const ConceptProperty = (props) => {
    const title = props.propertyTitle;
    const data = props.data ? props.data : "data not available";
    let propertyClass = "";
    if (title === 'Concept Image:'){
        propertyClass = "imageProperty"
    } else {
        propertyClass = "property"
    }
    return (
        <div className={propertyClass} style={{height: title==='Description:' || title==='Concept Image:' ? '40%' : '8%', flexDirection:  title==='Description:' ? 'column': 'row'}}>
            <text className="propertyTitle">{title}</text>
            <text style={{paddingLeft: '2%'}}>{data}</text>
        </div>
    )
}

const Legend = (props) => {
    const title = props.legendTitle;
    const type = props.type;
    const bubbleColor = props.bubbleColor;
    if(type==='title'){
        return (
            <div>
                <text className="propertyTitle">{title}</text>
            </div>   
        )
    } else {
        return (
            <div className="option">
                <div className="filterBubble" style={{backgroundColor: bubbleColor}}></div>
                <text className="filterTitle">{title}</text>
            </div>   
        )
    }
}

export default class Concept extends React.Component {
    render () {
       const { concept, conceptSyn, conceptVocabulary } = this.props;
       return(
        <div className="conceptContainer">
               <div className="subGraphContainer">
                    <text className="conceptTitle">{concept.conceptName}</text>
                    <div id="myNetwork" >
                        <SubGraph concept={concept} conceptSyn={conceptSyn} conceptVocabulary={conceptVocabulary} />
                    </div>
                    <div className="downloadContainer">
                        <BsDownload size={25} onClick={()=>downloadObjectAsJson(concept, `${concept.conceptName}`)}/>
                    </div>
                    <div className="optionsContainer">
                        <div className="optionsList">
                            <Legend legendTitle='Legends' type='title'/>
                            <Legend legendTitle='Prerequisites' type='option' bubbleColor='#E0B7DF'/>
                            <Legend legendTitle='Targets' type='option' bubbleColor='#C0BAC0'/>
                            <Legend legendTitle='Primary notions' type='option' bubbleColor='#A9ACEA'/>
                        </div>
                    </div>
               </div>
               <div className="infoContainer">
                    <text className="infoAreaTitle">Concept Information</text>
                    <div className="info">
                        <ConceptProperty propertyTitle='Concept Name:' data={concept.conceptName}/>
                        <ConceptProperty propertyTitle='Concept Type:' data={concept.type}/>
                        <ConceptProperty propertyTitle='Description:' data={concept.description}/>
                        <ConceptProperty propertyTitle='Occurence:' data={concept.startTimestamp}/>
                        <ConceptProperty propertyTitle='Concept Image:' data={concept.image}/>
                    </div>
                    <div className="backButtonContainer">
                        <TouchableOpacity style={backButtonStyle} onPress={this.props.close}>
                            <text>Back to video lesson</text>
                        </TouchableOpacity>
                    </div>
               </div>
           </div>
       )
    }
  }