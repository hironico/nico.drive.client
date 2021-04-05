
import { Pane, Link, ChevronRightIcon, HomeIcon, SideSheet } from 'evergreen-ui';
import { Component } from 'react';
import { createClient } from "webdav";

import { DavConfigurationContext } from '../AppSettings';

import Folder from './Folder';
import Image from './Image';
import RegularFile from './RegularFile';
import FileDetailsPane from './FileDetailsPane';
import LoginDialog from './LoginDialog';
import { Fragment } from 'react';

export default class DavExplorerPane extends Component {
    static contextType = DavConfigurationContext;

    constructor() {
        super();

        this.state = {
            currentDirectory: null,
            directories: [],
            files: [],
            showDetails: false
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

    renderFolders = () => {
        let folders = this.state.directories.map((directory, index) => {
            return <Folder fileItem={directory} navigate={this.navigate} showDetails={this.toggleFileDetails} key={'dir_' + index} />
        });
        return folders;
    }

    renderFiles = () => {
        let images = this.state.files.map((file, index) => {
            if (this.context.isImageFile(file.basename)) {
                return <Image fileItem={file} navigate={this.navigate} showDetails={this.toggleFileDetails} key={'file_' + index} />
            } else {
                return <RegularFile fileItem={file} navigate={this.navigate} showDetails={this.toggleFileDetails} key={'file_' + index} />
            }
        });
        return images;
    }

    renderBreadCrumb = () => {
        let path = this.state.currentDirectory;

        const chevronIcon = <ChevronRightIcon size={24} style={{ marginLeft: '5px', marginRight: '5px' }} />
        const homeIcon = <HomeIcon size={24} style={{ marginLeft: '5px', marginRight: '5px' }} />

        let currentDirs = path === '/' ? [''] : path.split('/');
        let navDirs = [];
        let breadCrumb = currentDirs.map((dir, index) => {
            const icon = index === 0 ? homeIcon : chevronIcon;
            navDirs.push(dir);
            const fullPath = navDirs.join('/');
            return <Link href="#" style={{ display: 'flex', alignItems: 'center' }} key={index + 1} onClick={() => {                
                this.navigateAbsolute(dir === '' ? '/' : fullPath);
            }}>{icon}{dir}</Link>
        });

        return breadCrumb;
    }

    renderRootPane = () => {
        const breadCrumb = this.renderBreadCrumb();

        return <Fragment>
            <Pane zIndex={1} flexShrink={0} elevation={0} backgroundColor="white">
                <Pane display="flex" padding={8} background="blueTint">
                    {breadCrumb}
                </Pane>
            </Pane>
            <Pane display="flex" flexWrap="wrap" justifyContent="space-evenly" background="overlay">
                {this.renderFolders()}
                {this.renderFiles()}
            </Pane>
        </Fragment>
    }

    render = () => {

        if (!this.context.connectionValid) {
            return <h3>Please connect</h3>
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