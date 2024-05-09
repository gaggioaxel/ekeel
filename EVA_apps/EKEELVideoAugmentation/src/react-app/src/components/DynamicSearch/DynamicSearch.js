import React from 'react';
import { styles } from './DynamicSearch.style.js';
import { TextInput, TouchableOpacity } from 'react-native-web';
import { GoSearch  } from 'react-icons/go'
import {TokenContext} from '../account-management/TokenContext'
import updateHistoryRequest from "../../helpers/updateHistoryRequest"
import Tooltip from '@material-ui/core/Tooltip';

{/*
  This component allows the research of the concepts in a video
  I t will give the list of the concepts and allow the user to see more details
*/}
export default class DynamicSearch extends React.Component {

    constructor() {
      super();
      this.state = {
        // current research
        searchString: '',
        // result of the research
        searchResult: [],
      }
      this.channel = new BroadcastChannel('react-connect'); //create a boradcast channel
  
    }

    static contextType = TokenContext
  
    // send a message to app to specify the concept to display in detail
    seeConcept = (concept) =>{
        this.channel.postMessage({to: 'App', msg: concept});
        this.setState({searchResult: [],  searchString: ''})
        updateHistoryRequest({url: this.props.url, searchbar_clicks: 1}, this.context)
    }
  
    // handle the research in the search bar
    handleChange = (event) => {
      this.setState({searchString: event.target.value});
      const conceptNames = this.props.items.sort();
      const searchString = event.target.value.trim().toLowerCase();
      let result = [];
      if(searchString.length > 0){
        result = conceptNames.filter(country => 
          country.toLowerCase().match( searchString )
        );
      }
      if(result.length){
        this.setState({searchResult: result});
      }else {
        this.setState({searchResult: ["no concept found"]});
      }
    }
    
    render (){
      return (
        <div style={styles.searchBarContainer}>
          <div style={styles.searchInputContainer}>
          
            <TextInput 
              type="text"
              value={this.state.searchString}
              onChange={this.handleChange}
              placeholder="Search for concepts"
              placeholderTextColor="white"
              style={styles.input}
            />

            <Tooltip  style={{cursor: "pointer", paddingRight: '1%', color: '#A0A0A0'}} 
                title={<p style={{ fontSize: 13 }}>Get more info about the concepts</p>} arrow enterDelay={100}>
                  <TouchableOpacity><GoSearch size={25} color="white"/></TouchableOpacity>
            </Tooltip>
            
          </div>
          {
            !this.state.searchResult.length || !this.state.searchString
            ? null
            : <div style={styles.searchResults}>
                  { this.state.searchResult.map(concept => 
                    <TouchableOpacity
                      onPress={()=>this.seeConcept(concept)}
                    >
                      <text style={{fontSize: 20}}>{concept}</text>
                    </TouchableOpacity>) }
              </div>
          }
        </div>
        )
    }
  }