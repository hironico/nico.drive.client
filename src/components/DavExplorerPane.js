
import { Pane, Heading, Paragraph, Link, ChevronRightIcon, HomeIcon, SideSheet } from 'evergreen-ui';
import { Fragment, Component } from 'react';
import { AuthType, createClient } from "webdav";

import DavConfiguration from '../AppSettings';

import Folder from './Folder';
import Image from './Image';
import FileDetailsPane from './FileDetailsPane';

export default class DavExplorerPane extends Component {

    constructor() {
        super();

        const config = new DavConfiguration();

        const client = createClient(config.getClientUrl(), config);

        this.state = {
            davClient: client,
            currentDirectory: '/blog',
            directories: [],
            files: [],
            showDetails: false
        }
    }

    componentDidMount = () => {
        this.setState({
            files: [],
            directories: []
        }, () => {
            console.log('Did mount. Now get directory contents...');
            this.getDirectoryContents()
        });
    }

    getDirectoryContents = async () => {
        const directoryItems = await this.state.davClient.getDirectoryContents(this.state.currentDirectory);
        
        let dirs = directoryItems.filter(item => { return item.type === 'directory'});
        let files = directoryItems.filter(item => { return item.type === 'file'});

        this.setState({
            directories: dirs,
            files: files
        }, () => {
            console.log(`${dirs.length} directories and ${files.length} files from ${this.state.currentDirectory}`);
        });
    }

    navigate = (folderName) => {
        let newDir = this.state.currentDirectory + '/' + folderName;
        this.setState((prev) => {
            return {
                currentDirectory: newDir,
                files: [],
                directories: []
            }
        }, () => {
            console.log('Navigated, now get directory contents...');
            this.getDirectoryContents();
        });
    }

    navigateAbsolute = (absolutePath) => {
        console.log('navigate absolute to: ' + absolutePath);
        this.setState((prev) => {
            return {
                currentDirectory: absolutePath,
                files: [],
                directories: []
            }
        }, () => {
            console.log('Absolute navigated, now get directory contents for ' + absolutePath);
            this.getDirectoryContents();
        });
    }

    toggleFileDetails = (fileItem) => {
        this.setState({
            showDetails: true,
            detailedFileItem: fileItem
        });
    }

    renderFolders = () => {
        let folders = this.state.directories.map((directory, index) => {
            return <Folder fileItem={directory} navigate={this.navigate} showDetails={this.toggleFileDetails} key={'dir_' + index} />
        });
        return folders;
    }

    renderFiles = () => {
        let images = this.state.files.map((image, index) => {
            return <Image fileItem={image} navigate={this.navigate} showDetails={this.toggleFileDetails} key={'file_' + index} />
        });
        return images;
    }

    render = () => {  
        console.log('Rendering ' + this.state.currentDirectory);
        
        let path = this.state.currentDirectory.substring(1);
        let currentDirs = path.split('/');
        let breadCrumb = currentDirs.map((dir, index) => {
            if (index===0) {
                return <Link href="#" style={{display: 'flex', alignItems: 'center'}} key={index+1} onClick={() => {
                    this.navigateAbsolute('/blog');
                }}><HomeIcon size={24} style={{marginLeft: '5px', marginRight: '5px'}}/></Link>
            } 

            return <Link href="#" style={{display: 'flex', alignItems: 'center'}} key={index+1} onClick={() => {
                let toNavigate = currentDirs.slice(0, index + 1);
                let fullPath = toNavigate.join('/');
                this.navigateAbsolute(`/${fullPath}`);
            }}><ChevronRightIcon size={24} style={{marginLeft: '5px', marginRight: '5px'}}/>{dir}</Link>
        })        

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

            <SideSheet
                isShown={this.state.showDetails}
                onCloseComplete={() => this.setState({ showDetails: false })}
            >
                <FileDetailsPane fileItem={this.state.detailedFileItem} davClient={this.state.davClient} />     
            </SideSheet>
        </Fragment>
    }
}