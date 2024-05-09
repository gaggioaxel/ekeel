import React, {Component} from 'react';
import TopicMap from './TopicMap';
import PropTypes from 'prop-types';


class TopicMapsList extends Component{
    render() {
        let topicMaps = this.props.topicMaps;
        let schema = this.props.schema;
        let topicMapToRender = [];
        if(topicMaps !== undefined) {
            topicMaps.sort(function (map1, map2) {

                const map1Title = map1.title.toUpperCase();
                const map2Title = map2.title.toUpperCase();
                if (map1Title < map2Title)
                    return -1;
                if (map1Title > map2Title)
                    return 1;
                return 0;
            });
            topicMaps.forEach(function(topicMap){
                if(topicMap.schemaId === schema.id)
                    topicMapToRender.push(topicMap)
            });

            topicMapToRender = topicMapToRender.map((topicMap) => (
                <TopicMap key={topicMap.id} topicMap={topicMap} selectedTopicMap = {this.props.selectedTopicMap ? this.props.selectedTopicMap : undefined} callBacks={this.props.callBacks}/>
            ));
        }
        return(
            <div id="topic-map-list">
                <div id="div-topic-map-list-title">
                    <p id="p-topic-map-list-title">Topic Maps</p>
                </div>
                <div id="topic-map-element-container" >
                    {topicMapToRender.length > 0 ? topicMapToRender : undefined}
                </div>
            </div>
        )
    }
}

TopicMapsList.propsType ={
    topicMaps: PropTypes.array,
    callBacks: PropTypes.shape({
        openTopicMapModal: PropTypes.func,
        deleteTopicMap: PropTypes.func
    })
};

export default TopicMapsList;