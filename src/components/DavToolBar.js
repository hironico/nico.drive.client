import { Component, Fragment } from "react";

import { Pane, Link, Menu, Popover, Badge, Avatar, Position } from "evergreen-ui";
import { GridViewIcon, ListIcon, InfoSignIcon, LogOutIcon } from "evergreen-ui";

import { DavConfigurationContext } from '../AppSettings';

import DavBreadCrumb from "./DavBreadCrumb";

export default class DavToolBar extends Component {
    static contextType = DavConfigurationContext;

    renderAvatarMenu = () => {
        return <Popover
                    position={Position.BOTTOM_LEFT}
                    content={
                    <Menu>
                        <Menu.Group>
                        <Menu.Item icon={InfoSignIcon} intent="success"><Badge color="green">{this.context.username}</Badge></Menu.Item>              
                        <Menu.Item>{this.context.getClientUrl()}</Menu.Item>
                        </Menu.Group>
                        <Menu.Divider />
                        <Menu.Group>
                        <Menu.Item icon={LogOutIcon} intent="danger" onClick={() => {this.props.handleDisconnect()}}>
                            Disconnect
                        </Menu.Item>
                        </Menu.Group>
                    </Menu>
                    }
                >
                <Avatar name={this.context.username} size={40} marginLeft={15} marginRight={15} style={{cursor: 'pointer'}}/>
            </Popover>
    }

    renderDisplayTools = () => {
        return <Fragment>
            <Link href="#" style={{ display: 'flex', alignItems: 'center' }} onClick={(evt) => this.props.handleDisplayMode('grid')}>
                <GridViewIcon size={24} style={{ marginLeft: '5px', marginRight: '5px' }} />
            </Link>
            &nbsp;
            <Link href="#" style={{ display: 'flex', alignItems: 'center' }} onClick={(evt) => this.props.handleDisplayMode('table')}>
                <ListIcon size={24} style={{ marginLeft: '5px', marginRight: '5px' }} />
            </Link>            
        </Fragment>
    }

    render = () => {
        return <Pane zIndex={1} flexShrink={0} elevation={0} backgroundColor="white" display="grid" gridTemplateColumns="auto 1fr">                
                <DavBreadCrumb handleNavigate={this.props.handleNavigate} currentDirectory={this.props.currentDirectory} />
                <Pane justifySelf="end" display="inline-flex" alignItems="center">
                   {this.renderDisplayTools()}
                   {this.renderAvatarMenu()}
                </Pane>
            </Pane>
    }
}