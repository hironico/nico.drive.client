import React, { Component } from "react";
import { AuthType } from "webdav";

const defaultValue = {
    authType: AuthType.Basic,
    username: '',
    davClient: null,
    davBaseUrl: null,
    davApiBaseUrl: null,
    davHomeDirectory: null, 
    connectionValid: false,
    supportedFormats: ['JPEG', 'JPG', 'PNG', 'WEBP', 'AVIF', 'TIFF', 'TIF', 'GIF', 'SVG', 'CR2', 'DNG'],
    filter: '',
    filterRegExp: new RegExp('.*', 'i'),
    filterFileItems: (filter) => { },
    setDavClient: (client, davBaseUrl) => { },
    getThumbApiUrl: () => { },
    getExifApiUrl: () => { },
    getMetadataApiUrl: () => { },
    getAuthUrl: () => { },
    isImageFile: () => { },
    disconnect: () => { },
    getUserRootDirectories: () => { }
}

const DavConfigurationContext = React.createContext(defaultValue);

class DavConfigurationProvider extends Component {

    constructor() {
        super();
        this.state = {
            authType: AuthType.Basic,
            username: '',
            davClient: null,
            davBaseUrl: null,
            davApiBaseUrl: null,
            davHomeDirectory: null,            
            connectionValid: false,
            showConnectionDialog: false,
            supportedFormats: ['JPEG', 'JPG', 'PNG', 'WEBP', 'AVIF', 'TIFF', 'GIF', 'SVG', 'CR2', 'DNG'],
            filter: '',
            filterRegExp: new RegExp('.*', 'i'),
            filterFileItems: this.filterFileItems,
            setDavClient: this.setDavClient,
            getThumbApiUrl: this.getThumbApiUrl,
            getExifApiUrl: this.getExifApiUrl,
            getMetadataApiUrl: this.getMetadataApiUrl,
            getAuthUrl: this.getAuthUrl,
            isImageFile: this.isImageFile,
            disconnect: this.disconnect
        }
    }

    filterFileItems = (value) => {
        let valueStr = value === null || value === '' ? '.*' : value;
        this.setState({
            filter: value,
            filterRegExp: new RegExp(valueStr, 'i')
        });
    }

    setDavClient = (client, davBaseUrl, username) => {

        const davBaseUri = client ? new URL(davBaseUrl) : null;
        const proto = client ? davBaseUri.protocol : null;
        const host = client ? davBaseUri.hostname : null;
        const port = client ? davBaseUri.port : null;

        const davApiBaseUrl = `${proto}://${host}:${port}`;

        this.setState({
            davClient: client,
            davBaseUrl: davBaseUrl,
            davApiBaseUrl: davApiBaseUrl,
            connectionValid: client ? true : false,
            username: client ? username : ''
        });
    }

    disconnect = () => {
        this.setDavClient(null);
    }

    getThumbApiUrl = () => {
        return `${this.state.davApiBaseUrl}/thumb`;
    }

    getExifApiUrl = () => {
        return `${this.state.davApiBaseUrl}/meta/exif`;
    }

    getMetadataApiUrl = () => {
        return `${this.state.davApiBaseUrl}/meta/xmp`;
    }

    getAuthUrl = () => {
        return `${this.state.davApiBaseUrl}/auth`;
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
