import { Component, Fragment } from "react";

import { Pane, Link } from "evergreen-ui";
import { GridViewIcon, ListIcon } from "evergreen-ui";

import { DavConfigurationContext } from '../AppSettings';

import DavBreadCrumb from "./DavBreadCrumb";
import React from "react";

export default class DavToolBar extends Component {
    static contextType = DavConfigurationContext;

    renderDisplayTools = () => {        
        return <Fragment>
            <Link href="#" display="flex" alignItems="center" onClick={(evt) => this.props.handleDisplayMode('grid')} >
                <GridViewIcon size={18} marginLeft={5} marginRight={5} color={this.props.displayMode === 'grid' ? 'gray600' : 'blue600'} />
            </Link>
            &nbsp;
            <Link href="#" display="flex" alignItems="center" onClick={(evt) => this.props.handleDisplayMode('table')} >
                <ListIcon size={18} marginLeft={5} marginRight={5} color={this.props.displayMode === 'table' ? 'gray600' : 'blue600'} />
            </Link>            
        </Fragment>
    }

    render = () => {
        return <Pane zIndex={1} flexShrink={0} background="tint2" display="grid" gridTemplateColumns="auto 1fr">                                
                <DavBreadCrumb handleNavigate={this.props.handleNavigate} currentDirectory={this.props.currentDirectory} />
                <Pane justifySelf="end" display="inline-flex" alignItems="center">
                   {this.renderDisplayTools()}
                </Pane>
            </Pane>
    }
}