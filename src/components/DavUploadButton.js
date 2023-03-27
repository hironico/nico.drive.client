import { Component } from "react";

import { IconButton, Text, toaster } from "evergreen-ui";
import { UploadIcon, Spinner } from "evergreen-ui";

import { DavConfigurationContext } from '../AppSettings';

export default class DavUploadButton extends Component {
    static contextType = DavConfigurationContext;

    constructor() {
        super();
        this.state = {
            currentUploads: []
        };
    }

    uploadFile = async () => {
        const handles = await window.showOpenFilePicker({multiple: true});
        this.setState({
            currentUploads: handles
        }, () => this.doUploadFiles(handles));
    }

    doUploadFiles = async (handles) => {
        for(const handle of handles) {
            const file = await handle.getFile();
            const targetFileName = `${this.props.currentDirectory}/${file.name}`;
            console.log(`Target file name is: ${targetFileName}`);

            const options = {
                overwrite: false,
                contentLength: false
            };

            // TODO tester si le fichier existe déja et s'il faut l'ecraser.
            this.context.selectedUserRootDirectory.davClient.putFileContents(targetFileName, file, options) 
            .then(result => {
                // do a refresh of the current directory !
                this.props.handleNavigate(this.props.currentDirectory);
            }).catch(error => {
                const errMsg = `Problem while uploading file ${targetFileName}: ${error}`;
                console.error(errMsg);
                toaster.danger(errMsg);
            }).finally( () => {
                const index = this.state.currentUploads.indexOf(handle);
                if (index >= 0) {
                    this.state.currentUploads.splice(index, 1);
                    this.setState({
                        currentUploads: this.state.currentUploads
                    });
                } else {
                    console.error(`Did not find handle of ${handle.file.name}`);
                }
            });
        }
    }

    render = () => {
        let status = <></>
        if (this.state.currentUploads.length > 0) {
            status = <>
                <Spinner size={12} marginRight={5}/>
                <Text>{this.state.currentUploads.length} files uploading.</Text>
            </>
        }
        return <>
            {status}
            <IconButton is="div" marginLeft={6} marginRight={6} icon={UploadIcon} appearance="primary" intent="success" onClick={(evt) => this.uploadFile()} />
        </>        
    }
}