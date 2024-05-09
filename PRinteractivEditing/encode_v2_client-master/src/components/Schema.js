import React, {Component} from 'react';
import {Icon, List} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import TopicMapsList from "./TopicMapsList";





class Schema extends Component {
  constructor() {
    super(...arguments);

    this.openSchemaDetailsModal = this.openSchemaDetailsModal.bind(this);
    this.deleteSchema = this.deleteSchema.bind(this);



  }

  deleteSchema(event, schema){
    this.props.callBacks.deleteSchema(schema);
  }

  openSchemaDetailsModal(event, schemaToUpdate){
    this.props.callBacks.openSDetailsModal(schemaToUpdate);
  }
  selectingSchema(schema){
    this.props.callBacks.selectSchema(schema)
    this.props.callBacks.deselectTopicMap()
  }

  state = { showing: false, showTopicMaps: false };

  render(){
    const associationTypes=this.props.associationTypes;
    const topicTypes = this.props.topicTypes;
    const topicMaps= this.props.topicMaps
    const schema = this.props.schema;
    const occurrenceTypes= this.props.occurrenceTypes;
    const selectedSchema= this.props.selectedSchema;
    const effortTypes = this.props.effortTypes;

    const scopes= this.props.scopes;
    let isSelected;
    const schemaTopicTypes= [];
    const schemaAssociationTypes=[];
    const schemaOccurrenceTypes=[];
    const schemaScopes=[];
    const schemaEffortTypes=[];
    const { showing } = this.state;
    const {showTopicMaps} =this.state



    scopes.forEach(function(scope){
      if(scope.schemaId === schema.id)
        schemaScopes.push(scope);
    });


    topicTypes.forEach(function(topicType){
      if(topicType.schemaId === schema.id)
        schemaTopicTypes.push(topicType);
    });

    associationTypes.forEach(function(associationType){
      if(associationType.schemaId === schema.id)
        schemaAssociationTypes.push(associationType);
    });

    occurrenceTypes.forEach(function(occurrenceType){
      if(occurrenceType.schemaId === schema.id)
        schemaOccurrenceTypes.push(occurrenceType);
    });

    effortTypes.forEach(function(effortType){
      if(effortType.schemaId === schema.id)
        schemaEffortTypes.push(effortType);
    });

    if(selectedSchema) {
      isSelected = schema.id === selectedSchema.id;
    }

    return(
        <div  id="schemaTitle"  key={this.props.key}>
          <List divided verticalAlign='middle'>
            <List.Item style={{borderLeft:(isSelected?"4px solid #0c3771":"4px solid lightgrey")}} className="schema-element-li" key={this.props.key} data-id={this.props.key}>
              <div onClick={(event)=> this.selectingSchema(schema)} id="schema-desc">
                  <List.Header key={this.props.key} className="schema-title" id="schema-list-schema-title" >{schema.name}</List.Header>
                <Icon className="icon-list" name="sort down" id="schema-dropdown" size='large' onClick={()=>this.setState({showTopicMaps: !showTopicMaps})}/>
                <List.Description id="schema-description">
                  {schema.description}
                </List.Description>
              </div>
              <List.Content key={this.props.key}  id="schema-list-content" >
                  <div id="schema-icons">
                  <span className="icon-list"  onClick={(event) => this.openSchemaDetailsModal(event, schema)}><Icon name="pencil alternate"/></span>
                  <span className="icon-list"  onClick={(event) => this.deleteSchema(event,schema)} ><Icon className="description-icon" name="trash alternate outline" /></span>
                  <span className="icon-list"  onClick={() => this.setState({ showing: !showing })}  ><Icon className="description-icon" name="info circle" /></span>
                  </div>

                  <div  id="schemainfoList"  style={{ display: (showing ? 'block' : 'none') }}>
                    <List className='schema-list-type-element' id="schema-topic-types-list">
                      <List.Header id="topic-type-list-title" className="schema-type-title">TopicTypes</List.Header>

                      {schemaTopicTypes.map(topicType => <List.Item className="schema-list-element-name" id="topic-type-name" key={topicType.id}>{topicType.name}</List.Item>)}

                    </List>
                    <List className='schema-list-type-element' id="schema-association-types-list">
                      <List.Header id="association-type-list-title" className="schema-type-title">AssociationTypes</List.Header>

                      {schemaAssociationTypes.map(associationType => <List.Item className="schema-list-element-name" id="association-type-name" key={associationType.id}>{associationType.name}</List.Item>)}

                    </List>
                    <List className='schema-list-type-element' id="schema-occurrence-types-list">
                      <List.Header id="occurrence-type-list-title" className="schema-type-title">OccurrenceTypes</List.Header>

                      {schemaOccurrenceTypes.map(occurrenceType => <List.Item className="schema-list-element-name" id="occurrence-type-name"key={occurrenceType.id}>{occurrenceType.name}</List.Item>)}

                    </List>
                    <List className='schema-list-type-element' id="schema-scopes-list">
                      <List.Header id="scope-list-title" className="schema-type-title">Scopes</List.Header>

                      {schemaScopes.map(scope => <List.Item className="schema-list-element-name" id="scope-name"key={scope.id}>{scope.name}</List.Item>)}

                    </List>
                    <List className='schema-list-type-element' id="schema-effort-types-list">
                      <List.Header id="effort-type-list-title" className="schema-type-title">Effort Types</List.Header>

                      {schemaEffortTypes.map(effortType => <List.Item className="schema-list-element-name" id="effort-type-name"key={effortType.id}>{effortType.metricType}</List.Item>)}

                    </List>
                </div>
                <div id="topicmap-list" style={{ display: (showTopicMaps ? 'block' : 'none') }}>
                  <TopicMapsList  selectedTopicMap ={this.props.selectedTopicMap ? this.props.selectedTopicMap : undefined} schema={this.props.schema} topicMaps={topicMaps} callBacks={this.props.callBacks}/>
                </div>

              </List.Content>



            </List.Item>

          </List>
        </div>
    )

  }
}

Schema.propTypes = {
  occurrenceTypes: PropTypes.array,
  associationType: PropTypes.object,
  topicTypes: PropTypes.array,
  topicType: PropTypes.object,
  schema: PropTypes.object,
  callBacks: PropTypes.shape({
    openSchemaModal: PropTypes.func,
    //closeTopicMapModal: PropTypes.func
  })
};

export default Schema;