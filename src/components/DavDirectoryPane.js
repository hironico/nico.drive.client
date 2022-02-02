import { Component } from "react"
import { Pane, Table } from "evergreen-ui";

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
        let folders = this.props.folders
            .filter(folder => folder.basename.search(this.context.filterRegExp) !== -1)
            .map((directory, index) => {
            return <Folder key={'dir_' + index} 
                           fileItem={directory} 
                           displayMode={this.props.displayMode}
                           handleNavigate={this.navigate} 
                           handleShowDetails={this.props.handleShowDetails} />
        });
        return folders;
    }

    renderFiles = () => {
        let images = this.props.files
            .filter(file => file.basename.search(this.context.filterRegExp) !== -1)
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
        return images;
    }  

    renderDirectoryContentsGrid = () => {
        return <Pane display="flex" flexWrap="wrap" justifyContent="space-evenly" background="overlay">
                {this.renderFolders()}
                {this.renderFiles()}
            </Pane>
    }

    renderDirectoryContentsTable = () => {
        return <Table>
            <Table.Head height={32}>
                <Table.TextHeaderCell textAlign="left" flexGrow={3}>Name</Table.TextHeaderCell>
                <Table.TextHeaderCell textAlign="left">Type</Table.TextHeaderCell>
                <Table.TextHeaderCell textAlign="left">Size</Table.TextHeaderCell>
                <Table.TextHeaderCell textAlign="left">Modified</Table.TextHeaderCell>
                <Table.TextHeaderCell textAlign="right">Actions</Table.TextHeaderCell>
            </Table.Head>
        <Table.Body>
            {this.renderFolders()}
            {this.renderFiles()}
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