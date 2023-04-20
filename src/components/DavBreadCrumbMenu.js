import {  ArrowLeftIcon, HomeIcon, Link, Menu, NestIcon, Pane, Popover, Position } from "evergreen-ui";
import { React, Component } from "react";

import '../views/DavExplorerView.css';

export default class DavBreadCrumbMenu extends Component {    

    handleNavigateTo = (close, path) => {
        if (close !== null) {
            close();
        }
        this.props.handleNavigate(path);
    }

    handleNavigateParent = () => {
        const path = this.props.currentDirectory;
        let currentDirs = path === '/' ? ['Home'] : path.split('/');

        if (currentDirs.length < 2) {
            return;
        }

        if (currentDirs.length === 2) {
            this.handleNavigateTo(null, '/');
            return;
        }

        currentDirs.pop();
        const parentPath = currentDirs.join('/');
        this.handleNavigateTo(null, parentPath);
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

    renderMenu = () => {
        const path = this.props.currentDirectory;
        const currentDirs = path === '/' ? ['Home'] : path.split('/');
        // replacing spaces by non breakable spaces of the last directory : .replace(/\s/gu, '\u00a0')
        const currentFolder = currentDirs[currentDirs.length - 1];
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
            <Link href="#" alignSelf="center" borderBottom="none" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">{currentFolder}</Link>
        </Popover>
    }

    render = () => {        
        return <Pane className="davbreadcrumbmenu" gridTemplateColumns="auto 1fr" width="100%" display="grid" alignItems="center">
            <Link href="#" onClick={() => this.handleNavigateParent()} alignSelf="center" marginLeft={12} marginRight={5} borderBottom="none">
                <ArrowLeftIcon />
            </Link>
            {this.renderMenu()}
        </Pane>
    }
}