import React, {Component} from 'react';
import {Icon, List} from 'semantic-ui-react';
import PropTypes from 'prop-types';

class TopicMap extends Component{
    constructor(){
        super(...arguments);

        this.openTopicMapDetailsModal = this.openTopicMapDetailsModal.bind(this);
        this.deleteTopicMap = this.deleteTopicMap.bind(this);
    }

    deleteTopicMap(event, topicMapId){
        this.props.callBacks.deleteTopicMap(topicMapId);
    }

    openTopicMapDetailsModal(event, topicMapToUpdate){
        this.props.callBacks.openTMDetailsModal(topicMapToUpdate);
    }




    render(){
        const topicMap = this.props.topicMap;
        const selectedTopicMap = this.props.selectedTopicMap;


        let isSelected;
        if(selectedTopicMap)
            isSelected = topicMap.id === selectedTopicMap.id;

        return(
            <div id="topic-map-title"  onClick={(event)=> this.props.callBacks.selectTopicMap(topicMap)}  key={this.props.key}>
                <List divided verticalAlign='middle'>
                    <div id="topicmap-desc" style={{borderLeft: (isSelected? "3px solid #53abff":"3px solid lightgrey")}}>
                    <List.Item className="topic-map-element-li" key={this.props.key} data-id={this.props.key}>

                            <List.Header key={this.props.key} className="title">{topicMap.title}</List.Header>
                            <List.Content key={this.props.key} floated='right'>
                                <span className="icon-list" onClick={(event) => this.openTopicMapDetailsModal(event, topicMap)}><Icon name="pencil alternate"/></span>
                                <span className="icon-list" onClick={(event) => this.deleteTopicMap(event, topicMap)} ><Icon className="description-icon" name="trash alternate outline" /></span>
                            </List.Content>
                            <List.Description>
                                {topicMap.description}
                            </List.Description>

                    </List.Item>
                    </div>
                </List>
            </div>
        )
    }
}

TopicMap.propTypes = {
    topicMap: PropTypes.object,
    callBacks: PropTypes.shape({
        openTopicMapModal: PropTypes.func,
        //closeTopicMapModal: PropTypes.func
    })
};

export default TopicMap;