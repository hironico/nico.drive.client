import { Component } from "react"
import { EmptyState, Pane, Table, Dialog, Text, Button } from "evergreen-ui";
import { Spinner, SearchIcon } from "evergreen-ui";

import Folder from './Folder';
import Image from './Image';
import RegularFile from "./RegularFile";

import { DavConfigurationContext } from '../AppSettings';
import DavPhotoViewPane from "./DavPhotoViewPane";

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
            photos: [],
            currentRegExp: '',
            isDeleteDialogShown: false,
            fileItemToDelete: null
        }
    }

    componentDidMount = () => {
        // initalize state with props values
        this.updateState(this.props);
    }

    componentDidUpdate = (prevProps) => {
        // may update state because of change in certain properties and context
        this.updateState(prevProps);
    }

    updateState = (prevProps) => {
        // if the folders and files have changed we need to filter them out. If not, we do not change anything.
        // same for the filter expression : if it changed, then refilter and update
        let shouldUpdateState = false;

        let folders = this.state.folders;
        if (prevProps.folders !== this.props.folders || this.state.currentRegExp !== this.context.filterRegExp) {
            folders = this.props.folders.filter(folder => folder.basename.search(this.context.filterRegExp) !== -1);
            shouldUpdateState = true;
        }

        let files = this.state.files;
        let photos = this.state.photos;
        if (prevProps.files !== this.props.files || this.state.currentRegExp !== this.context.filterRegExp) {
            files = this.props.files.filter(file => file.basename.search(this.context.filterRegExp) !== -1);
            photos = files.filter(file => this.context.isImageFile(file.basename));
            shouldUpdateState = true;
        }

        if (shouldUpdateState) {
            this.setState({
                folders: folders,
                files: files,
                photos: photos,
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

    /**
     * Handles the file item delete click on each displayed file in this directory pane.
     * This function sets the file item to delete and shows the confirm dialog to delete the file item.
     * @param fileItem to delete
     */
    delete = (fileItem) => {
        this.setState({
            isDeleteDialogShown: true,
            fileItemToDelete: fileItem
        });
    }

    doDelete = () => {
        this.setState({
            isDeleteDialogShown: false
        }, () => {
            this.props.handleDeleteFileItem(this.state.fileItemToDelete)
        });
    }

    renderFolders = () => {
        return this.state.folders
            .map((directory, index) => {
            return <Folder key={'dir_' + index} 
                           fileItem={directory} 
                           displayMode={this.props.displayMode}
                           handleNavigate={this.navigate} 
                           handleShowDetails={this.props.handleShowDetails}
                           handleDelete={this.delete} />
        });
    }

    renderFiles = () => {
        return this.state.files
            .map((file, index) => {
            if (this.context.isImageFile(file.basename)) {
                return <Image key={'file_' + index} 
                              fileItem={file}
                              displayMode={this.props.displayMode}
                              handleShowDetails={this.props.handleShowDetails} 
                              handleDelete={this.delete} />
            } else {
                return <RegularFile key={'file_' + index} 
                                    fileItem={file}
                                    displayMode={this.props.displayMode} 
                                    handleShowDetails={this.props.handleShowDetails} 
                                    handleDelete={this.delete} />
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

    renderPhotosOnly = () => {
        return <DavPhotoViewPane fileItems={this.state.photos} 
                                 handleShowDetails={this.props.handleShowDetails} 
                                 handleDelete={this.delete} 
                                 handleDisplayMode={this.props.handleDisplayMode}/>
    }

    renderDirectoryContentsGrid = () => {
        return <Pane className="cool-scrollbars" display="flex" flexWrap="wrap" justifyContent="center" alignContent="flex-start" background="tint2"  overflowY="scroll">
                 { this.props.loading ? this.renderLoadingState() : this.renderFoldersAndFiles() }
            </Pane>
    }

    renderDirectoryContentsTable = () => {
        return <Table className="cool-scrollbars" justifySelf="stretch" alignSelf="stretch" overflowY="scroll">
            <Table.Head height={32}>
                <Table.TextHeaderCell textAlign="center" maxWidth={48}>&nbsp;</Table.TextHeaderCell>
                <Table.TextHeaderCell textAlign="left" flexGrow={6}>Name</Table.TextHeaderCell>
                <Table.TextHeaderCell className="tablecell smallhidden" display="none" textAlign="left">Type</Table.TextHeaderCell>
                <Table.TextHeaderCell className="tablecell smallhidden" display="none" textAlign="left">Size</Table.TextHeaderCell>
                <Table.TextHeaderCell className="tablecell smallhidden" display="none" textAlign="left">Modified</Table.TextHeaderCell>
                <Table.TextHeaderCell textAlign="center">Actions</Table.TextHeaderCell>
            </Table.Head>
        <Table.Body>
            { this.props.loading ? this.renderLoadingState() : this.renderFoldersAndFiles() }
        </Table.Body>
      </Table>
    }

    renderDirectoryContentsPhoto = () => {
        return <Pane display="grid" gridTemplateColumns="auto" gridTemplateRows="auto" background="tint2">
            { this.props.loading ? this.renderLoadingState() : this.renderPhotosOnly() }            
        </Pane>
    }

    renderDeleteConfirmDialog = () => {
        return <Dialog
                isShown={this.state.isDeleteDialogShown}
                title="Warning: please confirm..."
                intent="danger"
                onCloseComplete={() => this.setState({isDeleteDialogShown: false})}
                hasFooter={false}
            >
                <Text>
                    Are you sure you want to delete this file? <br />
                    {this.state.fileItemToDelete === null ? 'null' : this.state.fileItemToDelete.filename}
                </Text>
                <br />
                <Text intent="danger" appearance="primary">This cannot be undone.</Text>
                <Pane width="100%" display="flex" justifyContent="right" marginTop={15}>
                    <Button is="div" marginLeft={0} marginRight={12} appearance="default" intent="none" onClick={(evt) => this.setState({isDeleteDialogShown: false})}>Cancel</Button>
                    <Button is="div" marginLeft={12} marginRight={0} appearance="primary" intent="danger" onClick={(evt) => this.doDelete()}>Confirm delete</Button>
                </Pane>
            </Dialog>
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

            case 'photo':
                directoryContents = this.renderDirectoryContentsPhoto();
                break;

            default:
                console.log(`Invalid display mode ${this.props.displayMode}. Using grid as a default.`);
                directoryContents = this.renderDirectoryContentsGrid();
                break;
        }

        return <>
            {this.renderDeleteConfirmDialog()}
            {directoryContents}
        </>;
    }
}