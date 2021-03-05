import { AuthType } from "webdav";

class DavConfiguration {
    davBaseUrl = 'https://localhost:8080';
    davWebContext = '/photo';
    authType = AuthType.Basic;
    username = 'hironico';
    password = 'hironico';

    getClientUrl = () => {
        return `${this.davBaseUrl}${this.davWebContext}`;
    }

    getThumbApiUrl = () => {
        return `${this.davBaseUrl}/thumb`;
    }

    getExifApiUrl = () => {
        return `${this.davBaseUrl}/meta/exif`;
    }

    getMetadataApiUrl = () => {
        return `${this.davBaseUrl}/meta/xmp`;
    }
}

export default DavConfiguration;