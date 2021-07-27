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

    renderFolders = () => {
        let folders = this.props.folders.map((directory, index) => {
            return <Folder fileItem={directory} navigate={this.props.handleNavigate} showDetails={this.props.handleShowDetails} key={'dir_' + index} displayMode={this.props.displayMode}/>
        });
        return folders;
    }

    renderFiles = () => {
        let images = this.props.files.map((file, index) => {
            if (this.context.isImageFile(file.basename)) {
                return <Image fileItem={file} navigate={this.props.handleNavigate} showDetails={this.props.handleShowDetails} key={'file_' + index} displayMode={this.props.displayMode} />
            } else {
                return <RegularFile fileItem={file} navigate={this.props.handleNavigate} showDetails={this.props.handleShowDetails} key={'file_' + index} displayMode={this.props.displayMode} />
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
                <Table.SearchHeaderCell placeholder="Search files..." flexGrow={1}/>
                <Table.TextHeaderCell>Actions</Table.TextHeaderCell>
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