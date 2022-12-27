import React, { Component } from "react";
import { AuthType } from "webdav";

const noOpFunc = () => {};

const defaultValue = {
    authType: AuthType.Basic,
    username: '',
    userInfo: {},
    setUserInfo: noOpFunc,

    davBaseUrl: null,
    davApiBaseUrl: null, 
    setDavBaseUrl: noOpFunc,
    
    supportedFormats: ['JPEG', 'JPG', 'PNG', 'WEBP', 'AVIF', 'TIFF', 'GIF', 'SVG', 'CR2', 'CR3', 'DNG'],
    isImageFile: noOpFunc,

    filter: '',
    filterRegExp: new RegExp('.*', 'i'),
    filterFileItems: noOpFunc,
    
    getThumbApiUrl: noOpFunc,
    getExifApiUrl: noOpFunc,
    getMetadataApiUrl: noOpFunc,
    getAuthUrl: noOpFunc,
    
    connectionValid: false,
    setConnectionValid: noOpFunc,

    userRootDirectories: [],
    setUserRootDirectories: noOpFunc,

    selectedUserRootDirectory: null,
    setSelectedUserRootDirectory: noOpFunc,

    showConnectionDialog: false,
    disconnect: noOpFunc
}

const DavConfigurationContext = React.createContext(defaultValue);

class DavConfigurationProvider extends Component {

    constructor() {
        super();
        this.state = {
            authType: AuthType.Basic,
            username: '',
            userInfo: {},
            setUserInfo: this.setUserInfo,

            davBaseUrl: null,
            davApiBaseUrl: null, 
            setDavBaseUrl: this.setDavBaseUrl,
            
            supportedFormats: ['JPEG', 'JPG', 'PNG', 'WEBP', 'AVIF', 'TIFF', 'GIF', 'SVG', 'CR2', 'CR3', 'DNG'],
            isImageFile: this.isImageFile,

            filter: '',
            filterRegExp: new RegExp('.*', 'i'),
            filterFileItems: this.filterFileItems,
            
            getThumbApiUrl: this.getThumbApiUrl,
            getExifApiUrl: this.getExifApiUrl,
            getMetadataApiUrl: this.getMetadataApiUrl,
            getAuthUrl: this.getAuthUrl,
            
            connectionValid: false,
            setConnectionValid: this.setConnectionValid,

            userRootDirectories: [],
            setUserRootDirectories: this.setUserRootDirectories,

            selectedUserRootDirectory: null,
            setSelectedUserRootDirectory: this.setSelectedUserRootDirectory,

            showConnectionDialog: false,
            disconnect: this.disconnect
        }
    }

    setUserInfo = (info) => {
        this.setState({
            userInfo: info
        });
    }

    setConnectionValid = (validity) => { 
        this.setState({
            connectionValid: validity
        });
    }

    setUserRootDirectories = (rootDirs) => {
        this.setState({
            selectedUserRootDirectory: rootDirs[0],
            userRootDirectories: rootDirs
        });
    }

    setSelectedUserRootDirectory = (oneRootDir, callback) => {
        this.setState({
            selectedUserRootDirectory: oneRootDir
        }, () => {
            if (callback) {
                callback();
            }
        });
    }

    disconnect = () => {
        this.setState({
            selectedUserRootDirectory: null,
            userRootDirectories: [],
            connectionValid: false,
            showConnectionDialog: true,
            username: ''
        });
    }

    filterFileItems = (value) => {
        let valueStr = value === null || value === '' ? '.*' : value;
        this.setState({
            filter: value,
            filterRegExp: new RegExp(valueStr, 'i')
        });
    }

    setDavBaseUrl = (davBaseUrl, username) => {

        const davBaseUri =  new URL(davBaseUrl);
        const proto =  davBaseUri.protocol;
        const host =  davBaseUri.hostname;
        const port =  davBaseUri.port;

        const davApiBaseUrl = `${proto}//${host}:${port}`;

        console.log(`DavBaseUrl = ${davBaseUrl}`);
        console.log(`DavApiBaseUrl = ${davApiBaseUrl}`);

        this.setState({
            davBaseUrl: davBaseUrl,
            davApiBaseUrl: davApiBaseUrl,
            username: username
        });
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
