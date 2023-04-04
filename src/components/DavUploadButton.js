import { Component } from "react";

import { Pane, Text, toaster } from "evergreen-ui";
import { CircleArrowUpIcon, Spinner } from "evergreen-ui";

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
        const allUploads = [];
        for(const handle of handles) {
            const file = await handle.getFile();
            const targetFileName = `${this.props.currentDirectory}/${file.name}`;
            console.log(`Target file name is: ${targetFileName}`);

            const options = {
                overwrite: false,
                contentLength: false
            };

            // TODO tester si le fichier existe déja et s'il faut l'ecraser.
            const oneUpload = this.context.selectedUserRootDirectory.davClient.putFileContents(targetFileName, file, options) 
            .catch(error => {
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
                    console.warning(`Did not find handle of ${handle.file.name}`);
                }
            });

            allUploads.push(oneUpload);
        }

        Promise.all(allUploads)
        .then(() => this.props.handleNavigate(this.props.currentDirectory));
    }

    render = () => {
        let status = <></>
        if (this.state.currentUploads.length > 0) {
            status = <>
                <Spinner size={12} marginRight={5}/>
                <Text>{this.state.currentUploads.length} files uploading.</Text>
            </>
        }
        return <Pane display="flex" alignItems="center" cursor="pointer" onClick={(evt) => this.uploadFile()}> 
            {status}
            <CircleArrowUpIcon size={18} color="info" marginRight={5} />
            <Text className="button-label" color="info">Upload a file</Text>
        </Pane>
    }
}