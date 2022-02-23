import { Component } from "react";

import { Pane, SearchInput, Position, Popover, Avatar, Menu, Badge } from 'evergreen-ui';
import { InfoSignIcon, LogOutIcon } from 'evergreen-ui';

import { DavConfigurationContext } from "../AppSettings";

/**
 * The DavHeader contains the search bar for filtering currently displayed file items and the avatar menu for user information
 * It uses the context to operate on file items filtering and login information.
 */
class DavHeader extends Component {
    static contextType = DavConfigurationContext;

    render = () => {
        return <Pane background="tint2" display="grid" gridTemplateColumns="1fr auto" paddingTop={15} paddingBottom={15} paddingLeft={15} justifyItems="stretch">
            <SearchInput placeholder="Search something..." width="75%" justifySelf="center" onChange={(e) => this.context.filterFileItems(e.target.value)} value={this.context.filter} />
            <Popover
                justifySelf="end"
                position={Position.BOTTOM_RIGHT}
                content={
                    <Menu>
                        <Menu.Group>
                            <Menu.Item icon={InfoSignIcon} intent="success"><Badge color="green">{this.context.username}</Badge></Menu.Item>
                            <Menu.Item>{this.context.getClientUrl()}</Menu.Item>
                        </Menu.Group>
                        <Menu.Divider />
                        <Menu.Group>
                            <Menu.Item icon={LogOutIcon} intent="danger" onClick={() => { this.context.disconnect() }}>
                                Disconnect
                            </Menu.Item>
                        </Menu.Group>
                    </Menu>
                }
            >
                <Avatar name={this.context.username} size={32} marginLeft={15} marginRight={15} style={{ cursor: 'pointer' }} justifySelf="end" />
            </Popover>
        </Pane>
    }
}

export default DavHeader;