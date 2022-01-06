import { Component, Fragment } from "react";

import { Pane, Link, Menu, Popover, Badge, Avatar, Position, SearchInput } from "evergreen-ui";
import { GridViewIcon, ListIcon, InfoSignIcon, LogOutIcon, MenuIcon } from "evergreen-ui";

import { DavConfigurationContext } from '../AppSettings';

import DavBreadCrumb from "./DavBreadCrumb";
import React from "react";

export default class DavToolBar extends Component {
    static contextType = DavConfigurationContext;

    renderDisplayTools = () => {
        return <Fragment>
            <Link href="#" style={{ display: 'flex', alignItems: 'center' }} onClick={(evt) => this.props.handleDisplayMode('grid')}>
                <GridViewIcon size={18} style={{ marginLeft: '5px', marginRight: '5px' }} />
            </Link>
            &nbsp;
            <Link href="#" style={{ display: 'flex', alignItems: 'center' }} onClick={(evt) => this.props.handleDisplayMode('table')}>
                <ListIcon size={18} style={{ marginLeft: '5px', marginRight: '5px' }} />
            </Link>            
        </Fragment>
    }

    render = () => {
        return <Pane zIndex={1} flexShrink={0} elevation={0} background="tint2" display="grid" gridTemplateColumns="auto 1fr">                                
                <DavBreadCrumb handleNavigate={this.props.handleNavigate} currentDirectory={this.props.currentDirectory} />
                <Pane justifySelf="end" display="inline-flex" alignItems="center">
                   {this.renderDisplayTools()}
                </Pane>
            </Pane>
    }
}