import React, {Component} from 'react';
import {Menu, Icon, Dropdown} from 'semantic-ui-react';
import PropTypes from 'prop-types';

class TopMenu extends Component{

    deleteSelectedTopicMap(selectedTopicMap){
        if(selectedTopicMap !== undefined)
            this.props.callBacks.deleteTopicMap(this.props.selectedTopicMap);
        else
            this.props.callBacks.deleteTopicMap(undefined);
    }

    deleteSelectedSchema(selectedSchema){
        if(selectedSchema !== undefined)
            this.props.callBacks.deleteSchema(this.props.selectedSchema);
        else
            this.props.callBacks.deleteSchema(undefined);
    }
    render(){

        return(
            <div  id="div-top-menu" >
                <Menu centered="true" className="top-menu" icon='labeled'>
                    <Menu.Item className="top-menu-item" name='newSchema' onClick={this.props.callBacks.openSchemaModal}>
                        <Icon name='plus square outline'/>
                        New Schema
                    </Menu.Item>
                    <Menu.Item className="top-menu-item" name='deleteSchema' onClick={event => this.deleteSelectedSchema(this.props.selectedSchema)}>
                        <Icon  name='remove' />
                        Delete Schema
                    </Menu.Item>

                    <Menu.Item className="top-menu-item">
                        <Icon name="map outline"/>
                        <Dropdown text="Topic Map" >
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={this.props.callBacks.openTopicMapModal}> New Topic Map</Dropdown.Item>
                                <Dropdown.Item onClick={event => this.deleteSelectedTopicMap(this.props.selectedTopicMap)}> Remove Topic Map</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Menu.Item>
                    <Menu.Item className="top-menu-item">
                        <Icon name="circle"/>
                        <Dropdown text="Topic" >
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={this.props.callBacks.openTopicModal}>Add Topic</Dropdown.Item>
                                <Dropdown.Item onClick={this.props.callBacks.openDeleteTopicModal}> Remove Topic</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Menu.Item>
                    <Menu.Item className="top-menu-item">
                        <Icon name="arrows alternate horizontal"/>
                        <Dropdown text="Associations" >
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={this.props.callBacks.openAssociationModal}>Add Association</Dropdown.Item>
                                <Dropdown.Item onClick={this.props.callBacks.openDeleteAssociationModal}> Remove Association</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Menu.Item>
                <Menu.Item className="top-menu-item">
                    <Icon name="wrench icon"/>
                <Dropdown text="Manage" >
                    <Dropdown.Menu>
                        <div className="header" ><div className="dropdown-item-title">Scopes</div></div>
                        <Dropdown.Item id="manage-scope-dropdown" onClick={this.props.callBacks.openScopesModal}><div className="dropdown-item" >Add/Remove/Edit Scopes</div></Dropdown.Item>
                        <div className="header"><div className="dropdown-item-title">Association Types</div></div>
                        <Dropdown.Item id="manage-association-dropdown" onClick={this.props.callBacks.openAssociationTypesModal}><div className="dropdown-item" >Add/Remove/Edit Association Type</div></Dropdown.Item>
                        <Dropdown.Item id="manage-association-role-dropdown" onClick={this.props.callBacks.openAssociationTypesRolesModal}><div className="dropdown-item" >Manage Association Types Roles</div></Dropdown.Item>
                        <div className="header"><div className="dropdown-item-title">Occurrence Types</div></div>
                        <Dropdown.Item id="manage-occurrence-dropdown" onClick={this.props.callBacks.openOccurrenceTypesModal}><div className="dropdown-item" >Add/Remove/Edit Occurrence Type</div></Dropdown.Item>
                        <div className="header"><div className="dropdown-item-title">Topic Types</div> </div>
                        <Dropdown.Item id="manage-topic-dropdown" onClick={this.props.callBacks.openTopicTypesModal}><div className="dropdown-item" >Add/Remove/Edit Topic Type</div></Dropdown.Item>
                        <div className="header"><div className="dropdown-item-title">Effort Types</div> </div>
                        <Dropdown.Item id="manage-effort-dropdown" onClick={this.props.callBacks.openEffortTypesModal}><div className="dropdown-item" >Add/Remove/Edit Effort Type</div></Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                </Menu.Item>
                   {/* <Menu.Item className="top-menu-item" name='manageTao' >
                        <Icon  name='tag' />
                        Tao
                    </Menu.Item>*/}
                    <Menu.Item className="top-menu-item" name='downloadTopicMap'>
                        <Icon  name='download' />
                        Download
                    </Menu.Item>
                    <Menu.Item className="top-menu-item" name='uploadTopicMap'>
                        <Icon  name='upload' />
                        Upload
                    </Menu.Item>
                    <Menu.Item className="top-menu-item" name='search'>
                        <Icon  name='search' />
                        Search
                    </Menu.Item>
                    <Menu.Item className="top-menu-item" name='settings'>
                        <Icon  name='settings' />
                        Settings
                    </Menu.Item>
                    <Menu.Item id="user-button" className="top-menu-item" name='userOption' position="right">
                        <Icon name='user' />
                       {/*<a href="#">*/}{localStorage.getItem('userId')}{/*</a>*/}
                    </Menu.Item>
                    <Menu.Item id="logout-button" className="top-menu-item" name='signOut' position='right' onClick={this.props.callBacks.logoutUser}>
                        <Icon  name='sign out alternate' />
                        Sign Out
                    </Menu.Item>
                </Menu>
            </div>
        )
    }
}

TopMenu.propTypes = {
    callBacks: PropTypes.shape({
        openTopicMapModal: PropTypes.func.isRequired,
        openSchemaModal: PropTypes.func.isRequired

    }),


};

export default TopMenu;