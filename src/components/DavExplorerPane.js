
import { Component, Fragment } from 'react';

import { Link, Pane, SideSheet, Avatar, Badge, Popover, Menu, Position, Table, ListIcon, GridViewIcon } from 'evergreen-ui';
import { InfoSignIcon, LogOutIcon } from 'evergreen-ui';

import { DavConfigurationContext } from '../AppSettings';

import FileDetailsPane from './FileDetailsPane';
import DavBreadCrumb from './DavBreadCrumb';

import WelcomePage from './welcome-page/WelcomePage';
import DavDirectoryPane from './DavDirectoryPane';

export default class DavExplorerPane extends Component {
    static contextType = DavConfigurationContext;

    constructor() {
        super();

        this.state = {
            currentDirectory: null,
            directories: [],
            files: [],
            showDetails: false,
            displayMode: 'table'
        }
    }

    componentDidUpdate = () => {
        if (this.context.connectionValid && this.context.davClient !== null && this.state.currentDirectory === null) {
            this.setState({
                currentDirectory: '/'
            }, () => {
                this.getDirectoryContents();
            });
        }
    }
    
    getDirectoryContents = async () => {

        let dirs = [];
        let files = [];

        if (this.context.connectionValid) {
            const directoryItems = await this.context.davClient.getDirectoryContents(this.state.currentDirectory);
            dirs = directoryItems.filter(item => { return item.type === 'directory' });
            files = directoryItems.filter(item => { return item.type === 'file' });
        }

        this.setState({
            directories: dirs,
            files: files
        }, () => {
            console.log(`${dirs.length} directories and ${files.length} files from ${this.state.currentDirectory}`);
        });
    }

    navigate = (folderName) => {
        const separator = this.state.currentDirectory.endsWith('/') || folderName.startsWith('/') ? '' : '/';
        let newDir = this.state.currentDirectory + separator + folderName;
        this.setState((prev) => {
            return {
                currentDirectory: newDir,
                files: [],
                directories: []
            }
        }, () => {
            console.log(`Navigated to ${newDir}, now get directory contents...`);
            this.getDirectoryContents();
        });
    }

    navigateAbsolute = (absolutePath) => {
        this.setState((prev) => {
            return {
                currentDirectory: absolutePath,
                files: [],
                directories: []
            }
        }, () => {
            console.log(`Absolute navigated to ${absolutePath}, now get directory contents...`);
            this.getDirectoryContents();
        });
    }

    toggleFileDetails = (fileItem) => {
        let modified = fileItem;
        if (modified.filename.startsWith(this.context.homeDirectory)) {
            modified.filename = modified.filename.substring(this.context.homeDirectory.length);
        }

        this.setState({
            showDetails: true,
            detailedFileItem: modified
        });
    }

    disconnect = () => {
        this.context.disconnect();
    }

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
              <Menu.Item icon={LogOutIcon} intent="danger" onClick={() => {this.disconnect()}}>
                Disconnect
              </Menu.Item>
            </Menu.Group>
          </Menu>
        }
      >
        <Avatar name={this.context.username} size={40} marginLeft={15} marginRight={15} style={{cursor: 'pointer'}}/>
      </Popover>
    }

    changeDisplayMode = (displayMode) => {
        this.setState({
            displayMode: displayMode
        });
    }

    renderDisplayTools = () => {
        return <Fragment>
            <Link href="#" style={{ display: 'flex', alignItems: 'center' }} onClick={(evt) => this.changeDisplayMode('grid')}>
                <GridViewIcon size={24} style={{ marginLeft: '5px', marginRight: '5px' }} />
            </Link>
            &nbsp;
            <Link href="#" style={{ display: 'flex', alignItems: 'center' }} onClick={(evt) => this.changeDisplayMode('table')}>
                <ListIcon size={24} style={{ marginLeft: '5px', marginRight: '5px' }} />
            </Link>            
        </Fragment>
    }

    renderRootPane = () => {
        return <Fragment>
            <Pane zIndex={1} flexShrink={0} elevation={0} backgroundColor="white" display="grid" gridTemplateColumns="auto 1fr">                
                <DavBreadCrumb handleNavigate={this.navigateAbsolute} currentDirectory={this.state.currentDirectory} />
                <Pane justifySelf="end" display="inline-flex" alignItems="center">
                   {this.renderDisplayTools()}
                   {this.renderAvatarMenu()}
                </Pane>
            </Pane>
            
            <DavDirectoryPane displayMode={this.state.displayMode} handleNavigate={this.navigate} handleShowDetails={this.toggleFileDetails} folders={this.state.directories} files={this.state.files} />

        </Fragment>
    }

    render = () => {

        if (!this.context.connectionValid) {
            return <WelcomePage />
        }

        if (!this.state.currentDirectory) {
            return <h3>Loading...</h3>
        }

        return <Pane>
            {this.renderRootPane()}

            <SideSheet
                isShown={this.state.showDetails}
                onCloseComplete={() => this.setState({ showDetails: false })}
            >
                <FileDetailsPane fileItem={this.state.detailedFileItem} davClient={this.state.davClient} />
            </SideSheet>
        </Pane>
    }
}