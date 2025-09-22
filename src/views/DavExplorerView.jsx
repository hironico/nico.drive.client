
import { Component } from 'react';
import { Navigate } from 'react-router';

import { Pane, SideSheet, Heading, Spinner, toaster } from 'evergreen-ui';

import { DavConfigurationContext } from '../AppSettings';

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
            this.getDirectoryContents('/');
        }
    }

    getDirectoryContents = (newDir) => {
        this.setState({
            loading: true            
        }, () => this.doGetDirectoryContents(newDir));
    }

    doGetDirectoryContents = async (newDir) => {
        let dirs = [];
        let files = [];

        if (this.context.connectionValid) {
            const directoryItems = await this.context.selectedUserRootDirectory.davClient.getDirectoryContents(newDir);

            dirs = directoryItems.filter(item => { return item.type === 'directory' });
            files = directoryItems.filter(item => { return item.type === 'file' });

            if ('/' === newDir) {
                this.setState({
                    rootDirs: dirs,
                    currentDirectory: newDir,
                    directories: dirs,
                    files: files,
                    loading: false
                });
            } else {
                this.setState({
                    currentDirectory: newDir,
                    directories: dirs,
                    files: files,
                    loading: false
                });
            }
        } else {
            console.error('Cannot get directory contents since connection is not valid.');
            toaster.danger('Cannot refresh directory contents.');
        }
    }

    navigate = (folderName) => {
        const separator = this.state.currentDirectory.endsWith('/') || folderName.startsWith('/') ? '' : '/';
        let newDir = this.state.currentDirectory + separator + folderName;
        this.getDirectoryContents(newDir);
    }

    navigateAbsolute = (absolutePath) => {
        this.getDirectoryContents(absolutePath);
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
        .then(() => {
            this.getDirectoryContents(this.state.currentDirectory);
            this.context.refreshUserInfo();
        });
    }

    render = () => {

        if (!this.context || !this.context.connectionValid) {
            console.log('Connection is not valid. returning to home.');
            return <Navigate to="/" />
        }

        if (this.state.currentDirectory === null || !this.state.currentDirectory) {
            console.log('Explorer is loading...');
            return <Pane gridTemplateColumns="auto">
                <Spinner marginX="auto" marginTop={120} />
                <Heading size={600} marginX="auto" marginTop={15} textAlign="center">Nico's Drive is loading...</Heading>
            </Pane>
        }
        
        return <Pane className="davexplorerview">
            <DavSideBar rootDirs={this.state.rootDirs} handleNavigate={this.navigateAbsolute} currentDirectory={this.state.currentDirectory} isLoading={this.state.loading} />

            <Pane display="grid" gridTemplateRows="auto auto 1fr" overflowY="hidden">

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