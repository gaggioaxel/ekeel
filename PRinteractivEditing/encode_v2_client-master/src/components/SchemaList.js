import React, {Component} from 'react';
import Schema from './Schema';
import PropTypes from 'prop-types';
import {Icon} from "semantic-ui-react";




class SchemaList extends Component{



    render(){

        let schemas=this.props.schemas;
        let schemaToRender=[];

        if(schemas!==undefined){
            schemas.sort(function(schema1, schema2) {     /*ord alpha*/
                const schema1Title = schema1.name.toUpperCase();
                const schema2Title = schema2.name.toUpperCase();
                if(schema1Title<schema2Title)
                    return -1;
                if(schema1Title>schema2Title)
                    return 1;
                return 0;
                }
            );


            schemaToRender=schemas.map((schema)=>(
                <Schema key={schema.id} schema={schema} scopes={this.props.scopes? this.props.scopes : undefined} topicMaps={this.props.topicMaps ? this.props.topicMaps : undefined} effortTypes={this.props.effortTypes ? this.props.effortTypes: undefined} occurrenceTypes={this.props.occurrenceTypes ? this.props.occurrenceTypes : undefined} associationTypes={this.props.associationTypes? this.props.associationTypes : undefined} topicTypes={this.props.topicTypes? this.props.topicTypes : undefined} selectedTopicMap ={this.props.selectedTopicMap ? this.props.selectedTopicMap : undefined} selectedSchema ={this.props.selectedSchema ? this.props.selectedSchema : undefined} callBacks={this.props.callBacks}/>
            ));
        }
        return(
            <div id="schema-list">
                <div id="div-schema-list-title">
                    <p textalign='left' id="p-schema-list-title"> Schema List   <span id="hide-icon-schema-list" className="icon-list" floated='right'  onClick={() => this.props.callBacks.hideSchemaList()} ><Icon className="description-icon" name="arrow left" /></span>
                    </p>
                </div>
                <div id="schema-element-container">
                    {schemaToRender.length > 0 ? schemaToRender : undefined}
                </div>
            </div>
        )
    }
}

SchemaList.propsType={
    associationTypes: PropTypes.array,
    schemas: PropTypes.array,
    topicTypes: PropTypes.array,
    callBacks: PropTypes.shape({
        openSchemaModal: PropTypes.func,
        deleteSchema: PropTypes.func
    })

};
export default SchemaList;