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

    filterFileItems = (value) => {
        console.log('Should filter items dynamically.');
    }

    renderFolders = () => {
        let folders = this.props.folders.map((directory, index) => {
            return <Folder key={'dir_' + index} 
                           fileItem={directory} 
                           displayMode={this.props.displayMode}
                           handleNavigate={this.props.handleNavigate} 
                           handleShowDetails={this.props.handleShowDetails} />
        });
        return folders;
    }

    renderFiles = () => {
        let images = this.props.files.map((file, index) => {
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
            <Table.Head>
                <Table.SearchHeaderCell placeholder="Search files..." flexGrow={3} onChange={(value) => this.filterFileItems(value)}/>                
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