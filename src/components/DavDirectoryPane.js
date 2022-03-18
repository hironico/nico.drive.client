import { Component } from "react"
import { EmptyState, Pane, Table } from "evergreen-ui";
import { Spinner, SearchIcon } from "evergreen-ui";

import Folder from './Folder';
import Image from './Image';
import RegularFile from "./RegularFile";

import { DavConfigurationContext } from '../AppSettings';

/**
 * Component to display the directory content (based on two props : folders and files) either by displaying a list of files 
 * or a grid with thumbnails. The user choose how to display directory contents using the displayMode property.
 */
export default class DavDirectoryPane extends Component {
    static contextType = DavConfigurationContext;

    constructor() {
        super();
        this.state = {
            files: [],
            folders: [],
            currentRegExp: ''
        }
    }

    componentDidUpdate = (prevProps) => {
        // if the folders and files have changed we need to filter them out. If not, we do not change anything.
        // same for the filter expression : if it changed, then refilter and update
        let shouldUpdateState = false;

        let folders = this.state.folders;
        if (prevProps.folders !== this.props.folders || this.state.currentRegExp !== this.context.filterRegExp) {
            folders = this.props.folders.filter(folder => folder.basename.search(this.context.filterRegExp) !== -1);
            shouldUpdateState = true;
        }

        let files = this.state.files;
        if (prevProps.files !== this.props.files || this.state.currentRegExp !== this.context.filterRegExp) {
            files = this.props.files.filter(file => file.basename.search(this.context.filterRegExp) !== -1);
            shouldUpdateState = true;
        }        

        if (shouldUpdateState) {
            this.setState({
                folders: folders,
                files: files,
                currentRegExp: this.context.filterRegExp
            });
        }        
    }

    /**
     * Ensure filter is cleared out before navigating to a new folder
     */
    navigate = (folderName) => {
        this.setState({
            filter: '',
            filterRegExp: new RegExp('.*', 'i')
        }, () => { this.props.handleNavigate(folderName) }
        );
    }

    renderFolders = () => {
        return this.state.folders
            .map((directory, index) => {
            return <Folder key={'dir_' + index} 
                           fileItem={directory} 
                           displayMode={this.props.displayMode}
                           handleNavigate={this.navigate} 
                           handleShowDetails={this.props.handleShowDetails} />
        });
    }

    renderFiles = () => {
        return this.state.files
            .map((file, index) => {
            if (this.context.isImageFile(file.basename)) {
                return <Image key={'file_' + index} 
                              fileItem={file}
                              displayMode={this.props.displayMode}
                              handleShowDetails={this.props.handleShowDetails} />
            } else {
                return <RegularFile key={'file_' + index} 
                                    fileItem={file}
                                    displayMode={this.props.displayMode} 
                                    handleShowDetails={this.props.handleShowDetails} />
            }
        });
    }  

    renderLoadingState = () => {
        return <EmptyState
            background="light"
            title="Loading..."
            orientation="horizontal"
            icon={<Spinner color="#C1C4D6" />}
            iconBgColor="#EDEFF5"
            description="This can take some time depending of the number of folders and files contained in this directory."
        />
    }

    renderNothingFound = () => {
        return <EmptyState
            background="dark"
            title="Not found!"
            orientation="horizontal"
            icon={<SearchIcon color="#C1C4D6" />}
            iconBgColor="#EDEFF5"
            description="Nothing matches your search terms. Try something less restrictive?"
        />
    }

    renderEmptyState = () => {
        return <EmptyState
            background="light"
            title="Empty directory!"
            orientation="horizontal"
            icon={<SearchIcon color="#C1C4D6" />}
            iconBgColor="#EDEFF5"
            description="It's lonely here... Upload some file here!"
        />
    }

    renderFoldersAndFiles = () => {
        if (this.state.folders.length === 0 && this.state.files.length === 0) {
            return this.context.filter === '' ? this.renderEmptyState() : this.renderNothingFound();
        }

        return <>
            {this.renderFolders()}
            {this.renderFiles()}
        </>
    }

    renderDirectoryContentsGrid = () => {
        return <Pane display="flex" flexWrap="wrap" justifyContent="space-evenly" background="overlay">
                 { this.props.loading ? this.renderLoadingState() : this.renderFoldersAndFiles() }
            </Pane>
    }

    renderDirectoryContentsTable = () => {
        return <Table>
            <Table.Head height={32}>
                <Table.TextHeaderCell textAlign="center" maxWidth={48}>&nbsp;</Table.TextHeaderCell>
                <Table.TextHeaderCell textAlign="left">Name</Table.TextHeaderCell>
                <Table.TextHeaderCell textAlign="left">Type</Table.TextHeaderCell>
                <Table.TextHeaderCell textAlign="left">Size</Table.TextHeaderCell>
                <Table.TextHeaderCell textAlign="left">Modified</Table.TextHeaderCell>
                <Table.TextHeaderCell textAlign="center">Actions</Table.TextHeaderCell>
            </Table.Head>
        <Table.Body>
            { this.props.loading ? this.renderLoadingState() : this.renderFoldersAndFiles() }
        </Table.Body>
      </Table>
    }

    render = () => {
        let directoryContents;
        switch (this.props.displayMode) {
            case 'grid': 
                directoryContents = this.renderDirectoryContentsGrid();
                break;

            case 'table':
                directoryContents = this.renderDirectoryContentsTable();
                break;

            default:
                console.log(`Invalid display mode ${this.props.displayMode}. Using grid as a default.`);
                directoryContents = this.renderDirectoryContentsGrid();
                break;
        }

        return directoryContents;
    }
}