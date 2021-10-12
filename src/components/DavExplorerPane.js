
import { Component} from 'react';

import { Pane, SideSheet, Heading, SearchInput, MenuIcon, Position } from 'evergreen-ui';

import { DavConfigurationContext } from '../AppSettings';

import WelcomePage from './welcome-page/WelcomePage';
import FileDetailsPane from './FileDetailsPane';
import DavDirectoryPane from './DavDirectoryPane';
import DavToolBar from './DavToolBar';

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
            showMenu: true,
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

    changeDisplayMode = (displayMode) => {
        this.setState({
            displayMode: displayMode
        });
    }

    render = () => {

        if (!this.context.connectionValid) {
            return <WelcomePage />
        }

        if (!this.state.currentDirectory) {
            return <h3>Loading...</h3>
        }

        return <Pane display="grid" gridTemplateColumns="auto 4fr" height="100%">
            <Pane background="#696f8c" elevation={2} padding={15}>
                <MenuIcon size={32} color="#F4F6FA" onClick={() => {this.setState({ showMenu: true})}}/>
            </Pane>

            <Pane gridTemplateRows="1fr auto">
                <Pane background="tint2">
                    <Heading size={600} marginTop={15}>
                        <SearchInput placeholder="Search in your files..." />
                    </Heading>
                </Pane>
                <DavToolBar currentDirectory={this.state.currentDirectory} 
                            handleDisplayMode={this.changeDisplayMode} 
                            handleDisconnect={this.disconnect} 
                            handleNavigate={this.navigateAbsolute} />

                <DavDirectoryPane displayMode={this.state.displayMode} 
                                folders={this.state.directories} 
                                files={this.state.files}
                                handleNavigate={this.navigate} 
                                handleShowDetails={this.toggleFileDetails} />
                
            </Pane>

            <SideSheet id="side-menu"
                position={Position.LEFT}
                isShown={this.state.showMenu}
                onCloseComplete={() => this.setState({ showMenu: false })}                
                >
                    <Pane height="100%" background="#696f8c" paddingTop={15}>
                        <Heading size={600} color="#F4F6FA">My files</Heading>
                    </Pane>
            </SideSheet>

            <SideSheet id="side-details"
                isShown={this.state.showDetails}
                onCloseComplete={() => this.setState({ showDetails: false })}
            >
                <FileDetailsPane fileItem={this.state.detailedFileItem} davClient={this.state.davClient} />
            </SideSheet>
        </Pane>
    }
}