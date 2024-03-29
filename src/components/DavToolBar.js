import React, { Component, Fragment } from "react";

import { Pane, Link } from "evergreen-ui";
import { LayoutGridIcon, ListIcon, CameraIcon } from "evergreen-ui";

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
        return <Pane marginLeft={6} marginRight={6} display="flex" alignItems="center" gap={10}>
            <DavNewFolderButton currentDirectory={this.props.currentDirectory} handleNavigate={this.props.handleNavigate} />
            <DavUploadButton currentDirectory={this.props.currentDirectory} handleNavigate={this.props.handleNavigate}/>
        </Pane>
    }

    renderDisplayTools = () => {        
        return <Fragment>
            <Link href="#" display="flex" alignItems="center" onClick={(evt) => this.props.handleDisplayMode('photo')} >
                <CameraIcon size={18} marginLeft={5} marginRight={5} color={this.props.displayMode !== 'photo' ? 'gray600' : 'blue600'} />
            </Link>
            <Link href="#" display="flex" alignItems="center" onClick={(evt) => this.props.handleDisplayMode('grid')} >
                <LayoutGridIcon size={18} marginLeft={5} marginRight={5} color={this.props.displayMode !== 'grid' ? 'gray600' : 'blue600'} />
            </Link>
            &nbsp;
            <Link href="#" display="flex" alignItems="center" onClick={(evt) => this.props.handleDisplayMode('table')} >
                <ListIcon size={18} marginLeft={5} marginRight={5} color={this.props.displayMode !== 'table' ? 'gray600' : 'blue600'} />
            </Link>            
        </Fragment>
    }

    render = () => {
        return <Pane zIndex={1} flexShrink={0} background="tint2" display="grid" gridTemplateColumns="1fr auto" paddingBottom={10}>                                
                <DavBreadCrumb handleNavigate={this.props.handleNavigate} currentDirectory={this.props.currentDirectory} />
                <DavBreadCrumbMenu handleNavigate={this.props.handleNavigate} currentDirectory={this.props.currentDirectory} />

                <Pane justifySelf="end" display="inline-flex" alignItems="center" marginRight={12}>
                    {this.renderFolderTools()}
                    {this.renderDisplayTools()}
                </Pane>
            </Pane>
    }
}