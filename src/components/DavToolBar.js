import React, { Component, Fragment } from "react";

import { Pane, Link, FullscreenIcon } from "evergreen-ui";
import { GridViewIcon, ListIcon } from "evergreen-ui";

import { DavConfigurationContext } from '../AppSettings';

import DavBreadCrumb from "./DavBreadCrumb";
import DavUploadButton from "./DavUploadButton";
import DavNewFolderButton from "./DavNewFolderButton";
import DavBreadCrumbMenu from "./DavBreadCrumbMenu";

export default class DavToolBar extends Component {
    static contextType = DavConfigurationContext;

    createDirectory = (name) => {
        // use this :
        // await client.createDirectory("/data/system/storage");
    }

    renderFolderTools = () => {
        return <>
            <DavUploadButton currentDirectory={this.props.currentDirectory} handleNavigate={this.props.handleNavigate}/>
            <DavNewFolderButton currentDirectory={this.props.currentDirectory} handleNavigate={this.props.handleNavigate} />
        </>
    }

    renderDisplayTools = () => {        
        return <Fragment>
            <Link href="#" display="flex" alignItems="center" onClick={(evt) => this.props.handleDisplayMode('photo')} >
                <FullscreenIcon size={18} marginLeft={5} marginRight={5} color={this.props.displayMode !== 'photo' ? 'gray600' : 'blue600'} />
            </Link>
            <Link href="#" display="flex" alignItems="center" onClick={(evt) => this.props.handleDisplayMode('grid')} >
                <GridViewIcon size={18} marginLeft={5} marginRight={5} color={this.props.displayMode !== 'grid' ? 'gray600' : 'blue600'} />
            </Link>
            &nbsp;
            <Link href="#" display="flex" alignItems="center" onClick={(evt) => this.props.handleDisplayMode('table')} >
                <ListIcon size={18} marginLeft={5} marginRight={5} color={this.props.displayMode !== 'table' ? 'gray600' : 'blue600'} />
            </Link>            
        </Fragment>
    }

    render = () => {
        return <Pane zIndex={1} flexShrink={0} background="tint2" display="grid" gridTemplateColumns="auto 1fr" paddingBottom={10}>                                
                <DavBreadCrumb handleNavigate={this.props.handleNavigate} currentDirectory={this.props.currentDirectory} />
                <DavBreadCrumbMenu handleNavigate={this.props.handleNavigate} currentDirectory={this.props.currentDirectory} />

                <Pane justifySelf="end" display="inline-flex" alignItems="center">
                    {this.renderFolderTools()}
                    {this.renderDisplayTools()}
                </Pane>
            </Pane>
    }
}