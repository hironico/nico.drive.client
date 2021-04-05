import React, { Component } from "react";
import { AuthType } from "webdav";

const defaultValue =  {
    davBaseUrl: 'https://localhost:8080',
    davWebContext: '/photo',
    authType: AuthType.Basic,
    username: 'hironico',
    password: 'hironico',
    davClient: null,
    connectionValid: false,
    homeDirectory: '/blog',
    currentDirectory: '/',
    supportedFormats: ['JPEG', 'JPG', 'PNG', 'WEBP', 'AVIF', 'TIFF', 'GIF', 'SVG'],
    setDavClient: () =>  { },
    setConnectionValid:  () =>  { },
    getClientUrl:  () =>  { },
    getThumbApiUrl:  () =>  { },
    getExifApiUrl:  () =>  { },
    getMetadataApiUrl:  () =>  { },
    isImageFile:  () =>  { },
    setCurrentDirectory: () => { }
}


const DavConfigurationContext = React.createContext({connectionValid: false});

class DavConfigurationProvider extends Component {

    constructor() {
        super();
        this.state = {
            davBaseUrl: 'https://localhost:8080',
            davWebContext: '/photo',
            authType: AuthType.Basic,
            username: 'hironico',
            password: 'hironico',
            davClient: null,
            connectionValid: false,
            homeDirectory: '/blog',
            supportedFormats: ['JPEG', 'JPG', 'PNG', 'WEBP', 'AVIF', 'TIFF', 'GIF', 'SVG'],
            setDavClient: this.setDavClient,
            setConnectionValid: this.setConnectionValid,
            getClientUrl: this.getClientUrl,
            getThumbApiUrl: this.getThumbApiUrl,
            getExifApiUrl: this.getExifApiUrl,
            getMetadataApiUrl: this.getMetadataApiUrl,
            isImageFile: this.isImageFile,
            getBasePath: this.getBasePath
        }
    }

    setDavClient = (client) => {
        this.setState({
            davClient: client
        });
    }

    setConnectionValid = (connectionValid) => {
        this.setState({
            connectionValid: connectionValid
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
