import React, { Component, useEffect } from "react";

import { Pane } from "evergreen-ui";

import { DavConfigurationContext } from '../AppSettings';

import DavBreadCrumb from "./DavBreadCrumb";
import DavBreadCrumbMenu from "./DavBreadCrumbMenu";
import DavUserMenu from "./DavUserMenu";
import DavUploadSlidePane from "./DavUploadSlidePane";
import DavDisplayToolsMenu from "./DavDisplayToolsMenu";
import DavNewFolderSlidePane from "./DavNewFolderSlidePane";
import { UploadProgressProvider, useUploadProgress } from "./UploadProgressContext";
import DavUploadProgressIndicator from "./DavUploadProgressIndicator";

/**
 * Null-rendering helper that lives inside UploadProgressProvider.
 * It registers (and keeps up-to-date) a callback that the context fires each
 * time a file upload succeeds. The callback refreshes the explorer only if the
 * upload directory matches the directory currently displayed.
 */
function UploadDoneHandler({ currentDirectory, handleNavigate }) {
    const { setOnUploadDone } = useUploadProgress();

    useEffect(() => {
        setOnUploadDone((uploadedDir) => {
            if (uploadedDir === currentDirectory) {
                console.log(`[UploadDoneHandler] refreshing directory: ${uploadedDir}`);
                handleNavigate(uploadedDir);
            }
        });
    }, [setOnUploadDone, currentDirectory, handleNavigate]);

    return null;
}

export default class DavToolBar extends Component {
    static contextType = DavConfigurationContext;

    constructor() {
        super();
        this.state = {
            showNewFolderSideSheet: false,
            showUploadPaneSideSheet: false
        }
    }

    showNewFolder = () => {
        this.setState({showNewFolderSideSheet: true})
      }

    closeNewFolder = () => {
        this.setState({ showNewFolderSideSheet: false });
    }

    showFileUpload = () => {
        this.setState({showUploadPaneSideSheet: true});
    }

    closeFileUpload = () => {
        this.setState({showUploadPaneSideSheet: false});
    }

    render = () => {
        // UploadProgressProvider wraps the entire toolbar so that both DavUploadPane
        // (deep child) and DavUploadProgressIndicator (sibling in this pane) share the
        // same upload-progress state without lifting it to DavExplorerView.
        return <UploadProgressProvider>
            {/* Keeps the directory-refresh callback in sync with the current directory */}
            <UploadDoneHandler currentDirectory={this.props.currentDirectory} handleNavigate={this.props.handleNavigate} />
            <Pane zIndex={1} flexShrink={0} background="tint2" display="grid" gridTemplateColumns="1fr auto" paddingBottom={10} paddingTop={10}>
                <DavUploadSlidePane currentDirectory={this.props.currentDirectory} handleNavigate={this.props.handleNavigate} isShown={this.state.showUploadPaneSideSheet} handleClose={this.closeFileUpload} />
                <DavNewFolderSlidePane currentDirectory={this.props.currentDirectory} handleNavigate={this.props.handleNavigate} isShown={this.state.showNewFolderSideSheet} handleClose={this.closeNewFolder} />

                <DavBreadCrumb handleNavigate={this.props.handleNavigate} currentDirectory={this.props.currentDirectory} />
                <DavBreadCrumbMenu handleNavigate={this.props.handleNavigate} currentDirectory={this.props.currentDirectory} />

                <Pane justifySelf="end" display="inline-flex" alignItems="center" >
                    {/* Upload progress indicator — only visible when uploads are tracked */}
                    <DavUploadProgressIndicator />
                    <DavDisplayToolsMenu handleDisplayMode={this.props.handleDisplayMode} showCreateFolderPane={this.showNewFolder} showFileUploadPane={this.showFileUpload} />
                    <DavUserMenu handleNavigate={this.props.handleNavigate} navigate={this.props.navigate} />
                </Pane>
            </Pane>
        </UploadProgressProvider>
    }
}
