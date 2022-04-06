import { Component } from "react";

import { Button, Text, toaster } from "evergreen-ui";
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

            // tester si le fichier existe déja et s'il faut l'ecraser.

            const uploadOption = {
                contentLength: file.size
            }

            this.context.davClient.putFileContents(targetFileName, file, uploadOption)
            .then(result => {
                if (!result) {
                    toaster.danger(`File upload problem for ${targetFileName}`);
                } else {
                    // do a refresh of the current directory !
                    this.props.handleNavigate(this.props.currentDirectory);
                }
            }).catch(error => {
                toaster.danger(`Problem while uploading file ${targetFileName}: ${error}`);
            }).finally( () => {
                const index = this.state.currentUploads.indexOf(handle);
                if (index >= 0) {
                    this.state.currentUploads.splice(index, 1);
                    this.setState({
                        currentUploads: this.state.currentUploads
                    });
                } else {
                    console.log(`Did not find handle of ${handle.file.name}`);
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
            <Button is="div" marginLeft={12} marginRight={12} iconBefore={UploadIcon} appearance="primary" intent="success" onClick={(evt) => this.uploadFile()}>Upload</Button>
        </>        
    }
}