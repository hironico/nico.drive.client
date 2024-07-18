import { Component } from "react";

import { Position, Popover, Avatar, Menu } from 'evergreen-ui';
import { GlobeNetworkIcon, PersonIcon, LogOutIcon } from 'evergreen-ui';

import { DavConfigurationContext } from "../AppSettings";

import '../views/DavExplorerView.css';
import DavRootSelectorMenuGroup from "./DavRootSelectorMenuGroup";
import DavQuotaPane from "./DavQuotaPane";

/**
 * The DavHeader contains the search bar for filtering currently displayed file items and the avatar menu for user information
 * It uses the context to operate on file items filtering and login information.
 */
class DavUserMenu extends Component {
    static contextType = DavConfigurationContext;

    constructor() {
        super();
        this.state = {
            rootDirLoading: false
        }
    }

    render = () => {
        return <Popover
                justifySelf="end"
                position={Position.BOTTOM_RIGHT}
                content={({ close }) => (
                    <Menu>
                        <Menu.Group title="Profile">
                            <Menu.Item icon={PersonIcon}>{this.context.username}</Menu.Item>                            
                        </Menu.Group>
                        <Menu.Divider />
                        <Menu.Group title="Usage">
                            <DavQuotaPane />
                        </Menu.Group>                        
                        <Menu.Divider />
                        <DavRootSelectorMenuGroup handleNavigate={this.props.handleNavigate} handleCloseMenu={close} />
                        <Menu.Divider />
                        <Menu.Group title="Server">
                            <Menu.Item icon={GlobeNetworkIcon}>{this.context.davBaseUrl}</Menu.Item>
                            <Menu.Item icon={LogOutIcon} intent="danger" onSelect={() => { this.context.disconnect() }}>
                                Disconnect
                            </Menu.Item>
                        </Menu.Group>
                    </Menu>
                )}
            >
                <Avatar name={this.context.username} size={32} marginLeft={15} marginRight={15} style={{ cursor: 'pointer' }} justifySelf="end" />
            </Popover>
    }
}

export default DavUserMenu;