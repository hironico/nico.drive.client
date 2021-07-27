import React, { Component } from "react";
import { AuthType } from "webdav";

const defaultValue = {
    davBaseUrl: 'https://localhost:8080',
    davWebContext: '/dav',
    authType: AuthType.Basic,
    username: 'hironico',
    password: 'changeme',
    davClient: null,
    connectionValid: false,
    showConnectionDialog: false,
    homeDirectory: '/hironico',
    currentDirectory: '/',
    supportedFormats: ['JPEG', 'JPG', 'PNG', 'WEBP', 'AVIF', 'TIFF', 'TIF', 'GIF', 'SVG', 'CR2'],
    setDavClient: (client) => { },
    setConnectionValid: () => { },
    setShowConnectionDialog: (showConDlg) => { },
    getClientUrl: () => { },
    getThumbApiUrl: () => { },
    getExifApiUrl: () => { },
    getMetadataApiUrl: () => { },
    isImageFile: () => { },
    setCurrentDirectory: () => { },
    disconnect: () => { }
}

const DavConfigurationContext = React.createContext({ connectionValid: false });

class DavConfigurationProvider extends Component {

    constructor() {
        super();
        this.state = {
            davBaseUrl: 'https://localhost:8080',
            davWebContext: '/dav',
            authType: AuthType.Basic,
            username: 'hironico',
            password: 'hironico',
            davClient: null,
            connectionValid: false,
            showConnectionDialog: false,
            homeDirectory: '/hironico',
            supportedFormats: ['JPEG', 'JPG', 'PNG', 'WEBP', 'AVIF', 'TIFF', 'GIF', 'SVG', 'CR2'],
            setDavClient: this.setDavClient,
            setConnectionValid: this.setConnectionValid,
            setShowConnectionDialog: this.setShowConnectionDialog,
            getClientUrl: this.getClientUrl,
            getThumbApiUrl: this.getThumbApiUrl,
            getExifApiUrl: this.getExifApiUrl,
            getMetadataApiUrl: this.getMetadataApiUrl,
            isImageFile: this.isImageFile,
            getBasePath: this.getBasePath,
            disconnect: this.disconnect
        }
    }

    setDavClient = (client, url) => {
        const urlValid = (typeof url !== 'undefined' && url !== null);
        const uri = urlValid ? new URL(url) : null;
        const davBaseUrl = uri ? `${uri.protocol}//${uri.host}` : '';
        let pathTab = uri ? uri.pathname.split('/') : '';
        const davWebContext = uri ? `/${pathTab[0]}` : '';
        pathTab = uri ? pathTab.splice(0, 1) : [];
        const homeDir = uri ? pathTab.join('/') : '';

        this.setState({
            davClient: client,
            davBaseUrl: client ? davBaseUrl : '',
            davWebContext: client ? davWebContext : '',
            homeDirectory: client ? homeDir : '',
            connectionValid: client ? true : false,
            showConnectionDialog: client ? false : true
        });
    }

    setConnectionValid = (connectionValid) => {
        this.setState({
            connectionValid: connectionValid
        });
    }

    disconnect = () => {
        this.setDavClient(null, null);
    }

    setShowConnectionDialog = (showConDialog) => {
        console.log('Must set showConnectionDialog to : ' + showConDialog);
        this.setState({
            showConnectionDialog: showConDialog
        });
    }

    getBasePath = () => {
        return `${this.state.davWebContext}${this.state.homeDirectory}`;
    }

    getClientUrl = () => {
        return `${this.state.davBaseUrl}${this.state.davWebContext}`;
    }

    getThumbApiUrl = () => {
        return `${this.state.davBaseUrl}/thumb`;
    }

    getExifApiUrl = () => {
        return `${this.state.davBaseUrl}/meta/exif`;
    }

    getMetadataApiUrl = () => {
        return `${this.state.davBaseUrl}/meta/xmp`;
    }

    isImageFile = (filename) => {
        if (typeof filename === 'undefined' || filename === null) {
            return false;
        }

        if (filename.startsWith('.')) {
            return false;
        }

        const index = filename.lastIndexOf('.');
        if (index < 0) {
            return false;
        }

        const extention = filename.toUpperCase().substring(index + 1);

        const formatIndex = this.state.supportedFormats.indexOf(extention);
        return formatIndex !== -1;
    }

    render = () => {
        return <DavConfigurationContext.Provider value={this.state}>{this.props.children}</DavConfigurationContext.Provider>
    }
}

export { DavConfigurationContext, DavConfigurationProvider }
