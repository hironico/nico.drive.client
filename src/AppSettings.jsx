import React, { Component } from "react";
import { createClient, AuthType } from "webdav";

const noOpFunc = () => {};

const supportedFormatArray = ['JPEG', 'JPG', 'PNG', 'WEBP', 'AVIF', 'TIFF', 'GIF', 'SVG', 'CR2', 'CR3', 'DNG', 'HEIC'];

const defaultValue = {
    authType: AuthType.Basic,
    username: '',
    userInfo: {},
    refresUserInfo: noOpFunc,
    isAdministrator: false,

    davBaseUrl: null,
    davApiBaseUrl: null, 

    connectionValid: false,

    userRootDirectories: [],

    selectedUserRootDirectory: null,
    setSelectedUserRootDirectory: noOpFunc,
    getSelectedUserRootDirectoryIndex: noOpFunc,
        
    supportedFormats: supportedFormatArray,
    isImageFile: noOpFunc,

    filter: '',
    filterRegExp: new RegExp('.*', 'i'),
    filterFileItems: noOpFunc,
    
    getThumbApiUrl: noOpFunc,
    getExifApiUrl: noOpFunc,
    getMetadataApiUrl: noOpFunc,
    getAuthUrl: noOpFunc,
    getFolderMetadataApiUrl: noOpFunc,
    getZipApiUrl: noOpFunc,

    disconnect: noOpFunc
}

const DavConfigurationContext = React.createContext(defaultValue);

const useDavConfigurationContext = () => React.useContext(DavConfigurationContext);

class DavConfigurationProvider extends Component {

    constructor() {
        super();
        this.state = {
            authType: AuthType.Basic,
            username: '',
            userInfo: {},
            refreshUserInfo: this.refreshUserInfo,

            davBaseUrl: null,
            davApiBaseUrl: null, 

            connectionValid: false,

            userRootDirectories: [],

            selectedUserRootDirectory: null,
            setSelectedUserRootDirectory: this.setSelectedUserRootDirectory,
            getSelectedUserRootDirectoryIndex: this.getSelectedUserRootDirectoryIndex,
            
            supportedFormats: supportedFormatArray,
            isImageFile: this.isImageFile,

            filter: '',
            filterRegExp: new RegExp('.*', 'i'),
            filterFileItems: this.filterFileItems,
            
            getThumbApiUrl: this.getThumbApiUrl,
            getExifApiUrl: this.getExifApiUrl,
            getMetadataApiUrl: this.getMetadataApiUrl,
            getAuthUrl: this.getAuthUrl,  
            getFolderMetadataApiUrl: this.getFolderMetadataApiUrl,
            getZipApiUrl: this.getZipApiUrl,
            
            disconnect: this.disconnect
        }
    }

    componentDidMount = () => {
        this.setState({
            davBaseUrl: this.getDavBaseUrl(),
            davApiBaseUrl: this.getDavApiBaseUrl()
        });
    }

    refreshUserInfo = async () => {
        const fetchOptions = { 
            method: 'GET',
            credentials: 'include', // Include cookies/session for authentication
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        const fetchUrl = `${this.getDavApiBaseUrl()}/auth/status`;
        console.log(`Fetching user info from: ${fetchUrl}`);

        await fetch(fetchUrl, fetchOptions)
        .then(res => res.json())
        .then(userInfo => {

            console.log(`User has been received: ${JSON.stringify(userInfo)}`);

            let userDirectories = [];
            
            if (userInfo.authenticated) {
                // Use session-based authentication - no credentials needed as they're handled by browser session
                const clientOptions = {
                    authType: AuthType.None, // No explicit auth needed - browser session handles it
                    withCredentials: true,   // Include cookies/session in requests
                }

                // root directories owned by this user
                userDirectories = userInfo.rootDirectories.map(dir => {
                    if (!dir.startsWith('/')) {
                        dir = `/${dir}`;
                    }
                    const clientUrl = `${this.getDavBaseUrl()}/${userInfo.user.username}${dir}`;
                    const davClient = createClient(clientUrl, clientOptions);
                    const userDirectory = {
                        name: dir,
                        url: clientUrl,
                        davClient: davClient,
                        owner: userInfo.user.username
                    }
                    return userDirectory;
                });

                // shared directories have the properties: name, owner, access
                const sharedDirectories = userInfo.sharedDirectories.map(sharedDir => {

                    let dir = sharedDir.name;
                    if (!dir.startsWith('/')) {
                        dir = `/${dir}`;
                    }
                    const clientUrl = `${this.getDavBaseUrl()}/${sharedDir.owner}${dir}`;

                    console.log(`Shared dir url found: ${clientUrl}`);

                    const davClient = createClient(clientUrl, clientOptions);
                    const sharedDirectory = {
                        name: dir,
                        url: clientUrl,
                        davClient: davClient,
                        owner: sharedDir.owner
                    }
                    return sharedDirectory;
                });

                // add shared directories to the user directories.
                userDirectories.push.apply(userDirectories, sharedDirectories);
            }

            this.setState({
                connectionValid: userInfo.authenticated,
                userInfo: userInfo.authenticated ? userInfo.user : null,
                quotaUsed: userInfo.quotaUsed,
                userRootDirectories: userInfo.authenticated ? userDirectories : [],
                selectedUserRootDirectory: userInfo.authenticated ? userDirectories[0] : null,
                username: userInfo.authenticated ? userInfo.user.username : '',
                isAdministrator: userInfo.authenticated ? (userInfo.user.roles?.includes('nicodrive-admin') || false) : false
            });
        }).catch(error => console.error(`Could not refresh user info.\n${error.message}`));
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

    getSelectedUserRootDirectoryIndex = () => {
        if (typeof this.state.selectedUserRootDirectory === 'undefined' || this.state.selectedUserRootDirectory === null) {
            return -1;
        }
        if (typeof this.state.userRootDirectories === 'undefined' || this.state.userRootDirectories === null) {
            return -1
        }

        for(let index = 0; index < this.state.userRootDirectories.length; index++) {
            if (this.state.userRootDirectories[index].name === this.state.selectedUserRootDirectory.name) {
                return index;
            }
        }

        return -1;
    }

    disconnect = () => {
        this.setState({
            selectedUserRootDirectory: null,
            userRootDirectories: [],
            connectionValid: false,
            username: '',
            userinfo: null
        });
    }

    filterFileItems = (value) => {
        let valueStr = value === null || value === '' ? '.*' : value;
        this.setState({
            filter: value,
            filterRegExp: new RegExp(valueStr, 'i')
        });
    }

    getDavApiBaseUrl = () => {
        const hostname = window.location.hostname;

        // check if we are in development server 
        if ('localhost' === hostname && window.location.port === '5173') {
            // In Vite dev mode - use relative URLs to leverage proxy
            return '';
        } else if ('localhost' === hostname) {
            // Direct backend access
            return 'https://localhost:3443';
        }

        const proto = window.location.protocol;        
        const port = window.location.port;
        return `${proto}//${hostname}:${port}`;
    }


    getDavBaseUrl = () => {
        return `${this.getDavApiBaseUrl()}/dav`;
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

    getFolderMetadataApiUrl = () => {
        return `${this.state.davApiBaseUrl}/meta/folder`;
    }

    getZipApiUrl = () => {
        return `${this.state.davApiBaseUrl}/zip`;
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

export { DavConfigurationContext, DavConfigurationProvider, useDavConfigurationContext }
