import { AuthType } from "webdav";

class DavConfiguration {
    davBaseUrl = 'https://localhost:8080';
    davWebContext = '/photo';
    authType = AuthType.Basic;
    username = 'hironico';
    password = 'hironico';
    homeDirectory = '/blog';

    supportedFormats = ['JPEG', 'JPG', 'PNG', 'WEBP', 'AVIF', 'TIFF', 'GIF', 'SVG'];

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

        const formatIndex = this.supportedFormats.indexOf(extention);
        return formatIndex !== -1;
    }
}

export default DavConfiguration;