import {  DoubleChevronDownIcon, HomeIcon, IconButton, majorScale, Menu, NestIcon, Popover, Position } from "evergreen-ui";
import { React, Component } from "react";

import '../views/DavExplorerView.css';

export default class DavBreadCrumbMenu extends Component {    

    handleNavigateTo = (close, path) => {
        close();
        this.props.handleNavigate(path);
    }

    renderMenuItems = (close) => {
        let path = this.props.currentDirectory;

        let currentDirs = path === '/' ? [''] : path.split('/');
        let navDirs = [];
        let menuItems = currentDirs
        .filter(dir => dir !== '')
        .map((dir, index) => {            
            navDirs.push(dir);
            const fullPath = navDirs.join('/');
            const targetPath = dir === '' ? '/' : fullPath;
            return <Menu.Item key={index + 1} icon={NestIcon} onSelect={() => this.handleNavigateTo(close, targetPath)} >
                {dir}
            </Menu.Item>
        });

        return menuItems;       
    }

    render = () => {
        return <Popover
            position={Position.BOTTOM_LEFT}
            content={({ close }) => (
                <Menu>
                    <Menu.Group>
                        <Menu.Item key={0} icon={HomeIcon} appearance="primary" onSelect={() => this.handleNavigateTo(close, '/')}>Home</Menu.Item>
                        {this.renderMenuItems(close)}
                    </Menu.Group>
                </Menu>
            )}
        >
            <IconButton className="davbreadcrumbmenu" icon={DoubleChevronDownIcon} margin={majorScale(2)}></IconButton>
        </Popover>
    }
}