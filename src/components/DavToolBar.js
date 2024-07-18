import React, { Component } from "react";

import { Pane } from "evergreen-ui";

import { DavConfigurationContext } from '../AppSettings';

import DavBreadCrumb from "./DavBreadCrumb";
import DavBreadCrumbMenu from "./DavBreadCrumbMenu";
import DavUserMenu from "./DavUserMenu";
import DavUploadSlidePane from "./DavUploadSlidePane";
import DavDisplayToolsMenu from "./DavDisplayToolsMenu";
import DavNewFolderSlidePane from "./DavNewFolderSlidePane";

export default class DavToolBar extends Component {
    static contextType = DavConfigurationContext;

    constructor() {
        super();
        this.state = {
            showNewFolderSideSheet: false,
            showUploadPaneSideSheet: false
        }
    }

    showNewFolder = () => {
        this.setState({showNewFolderSideSheet: true})
      }

    closeNewFolder = () => {
        this.setState({ showNewFolderSideSheet: false });
    }

    showFileUpload = () => {
        this.setState({showUploadPaneSideSheet: true});
    }

    closeFileUpload = () => {
        this.setState({showUploadPaneSideSheet: false});
    }

    render = () => {
        return <Pane zIndex={1} flexShrink={0} background="tint2" display="grid" gridTemplateColumns="1fr auto" paddingBottom={10}>            
            <DavUploadSlidePane currentDirectory={this.props.currentDirectory} handleNavigate={this.props.handleNavigate} isShown={this.state.showUploadPaneSideSheet} handleClose={this.closeFileUpload} />
            <DavNewFolderSlidePane currentDirectory={this.props.currentDirectory} handleNavigate={this.props.handleNavigate} isShown={this.state.showNewFolderSideSheet} handleClose={this.closeNewFolder} />

            <DavBreadCrumb handleNavigate={this.props.handleNavigate} currentDirectory={this.props.currentDirectory} />
            <DavBreadCrumbMenu handleNavigate={this.props.handleNavigate} currentDirectory={this.props.currentDirectory} />

            <Pane justifySelf="end" display="inline-flex" alignItems="center" >
                <DavDisplayToolsMenu handleDisplayMode={this.props.handleDisplayMode} showCreateFolderPane={this.showNewFolder} showFileUploadPane={this.showFileUpload} />
                <DavUserMenu handleNavigate={this.props.handleNavigate} />
            </Pane>
        </Pane>
    }
}