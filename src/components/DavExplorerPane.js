
import { Component} from 'react';

import { Pane, SideSheet, Heading, SearchInput, Position, Popover, Avatar, Menu, Badge, Spinner } from 'evergreen-ui';
import { InfoSignIcon, LogOutIcon } from 'evergreen-ui';

import { DavConfigurationContext } from '../AppSettings';

import WelcomePage from './welcome-page/WelcomePage';
import FileDetailsPane from './FileDetailsPane';
import DavDirectoryPane from './DavDirectoryPane';
import DavToolBar from './DavToolBar';

import Tree from './tree/Tree';
import TreeFolder from './tree/TreeFolder';

/**
 * The DAV Explorer Pane is the main component. It composes the page and has functions to interect with
 * the DAV Client. It uses sub components such as DavToolBar and DavDirectoryPane to render things returned 
 * by the DavClient.
 */
export default class DavExplorerPane extends Component {
    static contextType = DavConfigurationContext;

    constructor() {
        super();

        this.state = {
            currentDirectory: null,
            directories: [],
            files: [],
            rootDirs: [],
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

            if ('/' === this.state.currentDirectory) {
                this.setState({
                    rootDirs: dirs
                });
            }
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

    changeDisplayMode = (displayMode) => {
        this.setState({
            displayMode: displayMode
        });
    }

    renderAvatarMenu = () => {
        return <Popover 
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
                        <Menu.Item icon={LogOutIcon} intent="danger" onClick={() => {this.disconnect()}}>
                            Disconnect
                        </Menu.Item>
                        </Menu.Group>
                    </Menu>
                    }
                >
                <Avatar name={this.context.username} size={32} marginLeft={15} marginRight={15} style={{cursor: 'pointer'}} justifySelf="end"/>
            </Popover>
    }

    render = () => {

        if (!this.context.connectionValid) {
            return <WelcomePage />
        }

        if (!this.state.currentDirectory) {
            return <Pane gridTemplateColumns="auto">
                <Spinner marginX="auto" marginTop={120} />
                <Heading size={600} marginX="auto" marginTop={15}>Nico's Drive is loading...</Heading>
          </Pane>
        }

        return <Pane display="grid" gridTemplateColumns="1fr 4fr" height="100%">
            <Pane background="blueTint" elevation={0} padding={15} display="grid" gridTemplateRows="auto auto 1fr" gridTemplateColumns="auto" overflowX="scroll">  
                <Pane background="blueTint">
                    <Heading size={900} color="neutral" textAlign="left">My files</Heading>
                </Pane>
                <Pane background="blueTint" marginTop={15}>
                    <Heading size={600} color="neutral" textAlign="left">File manager</Heading>
                </Pane>
                <Tree>
                    {this.state.rootDirs.map((dir, index) => {
                        return <TreeFolder key={`treefolder-${index}`} id={`treefolder-${index}`} absolutePath={`/${dir.basename}`} basename={dir.basename} handleNavigate={this.navigateAbsolute} />
                    })}
                </Tree>
            </Pane>

            <Pane display="grid" gridTemplateRows="auto auto 1fr">
                <Pane background="tint2" display="grid" gridTemplateColumns="1fr auto" paddingTop={15} paddingBottom={15} paddingLeft={15} justifyItems="stretch">
                    <SearchInput placeholder="Search something..." width="75%" justifySelf="center" onChange={(e) => this.context.filterFileItems(e.target.value)} value={this.context.filter}/>       
                    {this.renderAvatarMenu()}
                </Pane>
                <DavToolBar currentDirectory={this.state.currentDirectory} 
                            handleDisplayMode={this.changeDisplayMode}
                            handleNavigate={this.navigateAbsolute} />

                <DavDirectoryPane displayMode={this.state.displayMode} 
                                folders={this.state.directories} 
                                files={this.state.files}
                                handleNavigate={this.navigate} 
                                handleShowDetails={this.toggleFileDetails} />
                
            </Pane>

            <SideSheet id="side-details"
                isShown={this.state.showDetails}
                onCloseComplete={() => this.setState({ showDetails: false })}
            >
                <FileDetailsPane fileItem={this.state.detailedFileItem} davClient={this.state.davClient} />
            </SideSheet>
        </Pane>
    }
}