
import { Component } from 'react';
import { Navigate } from 'react-router';

import { Pane, SideSheet, Heading, Spinner } from 'evergreen-ui';

import { DavConfigurationContext } from '../AppSettings';

import DavHeader from '../components/DavHeader';
import FileDetailsPane from '../components/FileDetailsPane';
import DavDirectoryPane from '../components/DavDirectoryPane';
import DavToolBar from '../components/DavToolBar';
import DavSideBar from '../components/DavSideBar';

import './DavExplorerView.css';

/**
 * The DAV Explorer Pane is the main view component. It composes the page and has functions to interact with
 * the DAV Client. It uses sub components such as DavToolBar and DavDirectoryPane to render things returned 
 * by the DavClient.
 */
export default class DavExplorerView extends Component {
    static contextType = DavConfigurationContext;

    constructor() {
        super();

        this.state = {
            currentDirectory: null,
            directories: [],
            files: [],
            rootDirs: [],
            showDetails: false,
            displayMode: 'table',
            loading: true
        }
    }

    componentDidMount = () => {
        if (this.state.currentDirectory === null) {
            this.setState({
                currentDirectory: '/',
                loading: true
            }, () => this.doGetDirectoryContents());
        }
    }

    getDirectoryContents = () => {
        this.setState({
            loading: true            
        }, () => this.doGetDirectoryContents());
    }

    doGetDirectoryContents = async () => {
        let dirs = [];
        let files = [];

        if (this.context.connectionValid) {
            const directoryItems = await this.context.selectedUserRootDirectory.davClient.getDirectoryContents(this.state.currentDirectory);

            dirs = directoryItems.filter(item => { return item.type === 'directory' });
            files = directoryItems.filter(item => { return item.type === 'file' });

            if ('/' === this.state.currentDirectory) {
                this.setState({
                    rootDirs: dirs
                });
            }
        } else {
            console.error('Cannot get directory contents since connection is not valid.');
        }

        this.setState({
            directories: dirs,
            files: files,
            loading: false
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

    closeDetails = () => {
        this.setState({ showDetails: false });
    }

    changeDisplayMode = (displayMode) => {
        this.setState({
            displayMode: displayMode
        });
    }

    deleteFileItem = (fileItem) => {
        this.context.selectedUserRootDirectory.davClient.deleteFile(fileItem.filename)
        .then(this.getDirectoryContents());
    }

    render = () => {

        if (!this.context || !this.context.connectionValid) {
            return <Navigate to="/login" />
        }

        if (this.state.currentDirectory === null || !this.state.currentDirectory) {
            return <Pane gridTemplateColumns="auto">
                <Spinner marginX="auto" marginTop={120} />
                <Heading size={600} marginX="auto" marginTop={15} textAlign="center">Nico's Drive is loading...</Heading>
            </Pane>
        }
        
        return <Pane className="davexplorerview" display="grid" gridTemplateColumns="1fr" height="100vh" maxHeight="100vh">
            <DavSideBar rootDirs={this.state.rootDirs} handleNavigate={this.navigateAbsolute} currentDirectory={this.state.currentDirectory} />

            <Pane display="grid" gridTemplateRows="auto auto 1fr"  overflowY="hidden">
                <DavHeader handleNavigate={this.navigateAbsolute} />

                <DavToolBar currentDirectory={this.state.currentDirectory}
                    displayMode={this.state.displayMode} 
                    handleDisplayMode={this.changeDisplayMode}
                    handleNavigate={this.navigateAbsolute} />

                <DavDirectoryPane displayMode={this.state.displayMode}
                    folders={this.state.directories}
                    files={this.state.files}
                    loading={this.state.loading}
                    handleDeleteFileItem={this.deleteFileItem}
                    handleNavigate={this.navigate}
                    handleShowDetails={this.toggleFileDetails}
                    handleDisplayMode={this.changeDisplayMode} />

            </Pane>

            <SideSheet
                isShown={this.state.showDetails}
                onCloseComplete={this.closeDetails}
                preventBodyScrolling
                width={window.screen.width < 900 ? "100%" : 620}
            >
                <FileDetailsPane fileItem={this.state.detailedFileItem} davClient={this.state.davClient} handleClose={this.closeDetails}/>
            </SideSheet>
        </Pane>
    }
}