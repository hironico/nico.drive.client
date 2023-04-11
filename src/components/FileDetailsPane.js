import { Button, Heading, InfoSignIcon, Pane, Table, Tablist, Tab, TagInput, EmptyState, CrossIcon, Text } from 'evergreen-ui';
import { DownloadIcon, SearchIcon } from 'evergreen-ui';

import { React, Component } from 'react';

import RatingPane from './RatingPane';

import { DavConfigurationContext } from '../AppSettings';

export default class FileDetailsPane extends Component {
    static contextType = DavConfigurationContext;

    constructor() {
        super();

        this.state = {
            imageData: [],
            selectedIndex: 0,
            tabs: ['Information', 'Image', 'Metadata']
        }
    }

    componentDidMount = () => {
        this.loadImageInformation();
        this.loadMetaDataInformation();
    }

    getDownloadLink = () => {        
        if (!this.context.connectionValid) {
            // console.log('davClient is undefined in context. Cannot download file.');
            return null;
        }

        return this.context.selectedUserRootDirectory.davClient.getFileDownloadLink(this.props.fileItem.filename);
    }

    loadImageInformation = () => {
        const metaUrl = this.context.getExifApiUrl();

        const exifRequest = {
            "username": this.context.username,
            "homeDir": this.context.selectedUserRootDirectory.name,
            "filename": this.props.fileItem.filename
        }

        const authHeader = this.context.selectedUserRootDirectory.davClient.getHeaders()['Authorization'];

        fetch(metaUrl, {
            method: 'POST',
            body: JSON.stringify(exifRequest),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
            }
        })
        .then(res => res.status === 200 ? res.json() : { message : `${res.status} : ${res}`})
        .then(exifInfo => {

            exifInfo.exif = this.cleanProperties(exifInfo.exif);
            exifInfo.image = this.cleanProperties(exifInfo.image);
            exifInfo.gps = this.cleanProperties(exifInfo.gps);
            exifInfo.makerNote = this.cleanProperties(exifInfo.makerNote);
            exifInfo.thumbNail = this.cleanProperties(exifInfo.thumbnail);

            const data = {
                image: exifInfo.image,
                exif: exifInfo.exif,
                gps: exifInfo.gps,
                makernote: exifInfo.makernote,
                thumbnail: exifInfo.thumbnail
            }

            this.setState({
                imageData: data
            });
        }).catch(err => {
            console.log('Error while reading exif data: ' + err);
        });
    }

    cleanProperties = (data) => {
        for (const dataKey in data) {
            let dataValue = data[dataKey];
            if (this.isObject(dataValue)) {
                if (this.isBufferDataObject(dataValue)) {
                    data[dataKey] = this.getBufferDataOBjectValue(dataValue);
                } else {
                    console.log(`${dataKey} is an object with unrecognized structure. Replacing with string.`);
                    data[dataKey] = '' + JSON.stringify(dataValue);
                }
            }
        }

        return data;
    }

    isObject = (variable) => {
        return typeof variable === 'object' &&
                !Array.isArray(variable) &&
                variable !== null;
    }

    isBufferDataObject = (variable) => {
        // console.log(`Type is: ${variable.type} and isArayy = ${Array.isArray(variable.data)}`);
        return variable.type === 'Buffer' && Array.isArray(variable.data);
    }

    getBufferDataOBjectValue = (variable) => {
        return String.fromCodePoint(...variable.data);
    }


    loadMetaDataInformation = () => {
        const metaUrl = this.context.getMetadataApiUrl();

        const metadataRequest = {
            "username": this.context.username,
            "homeDir": this.context.selectedUserRootDirectory.name,
            "filename": this.props.fileItem.filename,
            "raw": false
        }
        
        const authHeader = this.context.selectedUserRootDirectory.davClient.getHeaders()['Authorization'];

        fetch(metaUrl, {
            method: 'POST',
            body: JSON.stringify(metadataRequest),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
            }
        })
        .then(res => res.status === 200 ? res.json() : {})
        .then(res => {
            this.setState({
                metadata: res
            });
        }).catch(err => {
            console.log('Error while reading metadata: ' + err);
        });
    }

    renderFileItemSize = () => {
        let unite = 'bytes';
        let taille = this.props.fileItem.size;
        if (taille > 1024) {
            taille = (taille / 1024).toFixed(2);
            unite = 'KB';
        }
        if (taille > 1024) {
            taille = (taille / 1024).toFixed(2);
            unite = 'MB';
        }
        if (taille > 1024) {
            taille = (taille / 1024).toFixed(2);
            unite = 'GB';
        }

        return <span>{taille}&nbsp;{unite}</span>
    }

    renderImageTabs = () => {
        const isImage = this.context.isImageFile(this.props.fileItem.basename);
        return <Pane padding={15} overflowY="hidden" display="grid" gridTemplateColumns="1fr" gridTemplateRows="auto 1fr" width="100%" height="100%">
            <Tablist marginBottom={5} borderBottom="muted">
                {this.state.tabs.filter((tab, index) => {
                    return index > 0 ? isImage : true;
                })
                    .map((tab, index) => (
                        <Tab
                            key={tab}
                            id={tab}
                            onSelect={() => this.setState({ selectedIndex: index })}
                            isSelected={index === this.state.selectedIndex}
                            aria-controls={`panel-${tab}`}
                        >
                            {tab}
                        </Tab>
                    ))}
            </Tablist>
            {this.state.tabs.map((tab, index) => {

                let panelTab;
                switch (index) {
                    case 0:
                        panelTab = this.renderFileDetails();
                        break;

                    case 1:
                        panelTab = this.renderImageDetails();
                        break;

                    case 2:
                        panelTab = this.renderMetadataDetails();
                        break;

                    default:
                        panelTab = <div />
                }

                return <Pane
                    key={`panel-${tab}`}
                    id={`panel-${tab}`}
                    role="tabpanel"
                    aria-labelledby={tab}
                    aria-hidden={index !== this.state.selectedIndex}
                    display={index === this.state.selectedIndex ? 'grid' : 'none'}
                    gridTemplateColumns="1fr"
                    overflowY="scroll"
                    justifySelf="stretch"
                    alignSelf="stretch"
                    className="cool-scrollbars"
                >
                    {panelTab}
                </Pane>
            })}

        </Pane>
    }

    renderFileDetails = () => {
        return <Table marginTop={15} alignSelf="start">
            <Table.Head height={32}>
                <Table.TextHeaderCell>
                    <Pane display="inline-flex" alignItems="center">
                        <InfoSignIcon />&nbsp;File information
                    </Pane>
                </Table.TextHeaderCell>
                <Table.TextHeaderCell>
                    &nbsp;
                </Table.TextHeaderCell>
            </Table.Head>
            <Table.Body>
                <Table.Row key="row_path" height={32}>
                    <Table.TextCell>Path:</Table.TextCell>
                    <Table.TextCell>{this.props.fileItem.filename}</Table.TextCell>
                </Table.Row>
                <Table.Row height={32}>
                    <Table.TextCell key="row_modif">Last modif:</Table.TextCell>
                    <Table.TextCell>{this.props.fileItem.lastmod}</Table.TextCell>
                </Table.Row>
                <Table.Row height={32}>
                    <Table.TextCell key="row_size">Size:</Table.TextCell>
                    <Table.TextCell>{this.renderFileItemSize()}</Table.TextCell>
                </Table.Row>
            </Table.Body>
        </Table>
    }

    renderImageCategoryDetails = (category, categoryName) => {
        let rows;
        if (typeof category === 'undefined') {
            rows = this.renderEmptyDetails(`No ${categoryName} information has been found.`);
        } else {
            rows = Object.keys(category).map((key, index) => {
                return <Table.Row key={index} height={32}>
                    <Table.TextCell>{key}</Table.TextCell>
                    <Table.TextCell>{category[key]}</Table.TextCell>
                </Table.Row>
            });
        }

        return <Table marginTop={15} key={categoryName} alignSelf="start">
            <Table.Head height={32}>
                <Table.TextHeaderCell>
                    <Pane display="inline-flex" alignItems="center">
                        <InfoSignIcon />&nbsp;{categoryName}
                    </Pane>
                </Table.TextHeaderCell>
                <Table.TextHeaderCell>
                    &nbsp;
                </Table.TextHeaderCell>
            </Table.Head>
            <Table.Body>
                {rows}
            </Table.Body>
        </Table>
    }

    renderImageDetails() {
        if ( typeof this.state.imageData === 'undefined') {
            return this.renderEmptyDetails('Image data is not available.');
        } else {
            const tables = Object.keys(this.state.imageData).map((key, index) => {
                return this.renderImageCategoryDetails(this.state.imageData[key], key);
            });

            return <>{tables}</>
        }
    }

    renderMetadataDetails = () => {
        let rows;
        if (typeof this.state.metadata === 'undefined' || Object.keys(this.state.metadata).length === 0) {
            rows = this.renderEmptyDetails('Metedata details are not available.')
        } else {
            rows = Object.keys(this.state.metadata).map((key, index) => {
                return <Table.Row key={`meta-${index}`} height={32}>
                    <Table.TextCell>{key}</Table.TextCell>
                    <Table.TextCell>{this.state.metadata[key]}</Table.TextCell>
                </Table.Row>
            });
        }

        return <Table marginTop={15}>
            <Table.Head height={32}>
                <Table.TextHeaderCell>
                    <Pane display="inline-flex" alignItems="center">
                        <InfoSignIcon />&nbsp;Metadata information
                    </Pane>
                </Table.TextHeaderCell>
                <Table.TextHeaderCell>
                    &nbsp;
                </Table.TextHeaderCell>
            </Table.Head>
            <Table.Body>
                {rows}
            </Table.Body>
        </Table>
    }

    renderEmptyDetails = (message) => {
        return <EmptyState
            background="dark"
            title="Not found!"
            orientation="horizontal"
            icon={<SearchIcon color="#C1C4D6" />}
            iconBgColor="#EDEFF5"
            description={message}
        />
    }

    renderTags = () => {
        const isImage = this.context.isImageFile(this.props.fileItem.basename);
        if (!isImage) {
            return <div>&nbsp;</div>
        }

        let placeholder = 'No tag has been found';
        let tags = [];
        if (this.state.metadata) {            
            if (typeof this.state.metadata.tags !== 'undefined') {
                if ('' !== this.state.metadata.tags) {
                    tags = this.state.metadata.tags.split(',');
                } 
            }
            placeholder = tags.length === 0 ? 'No tag for this image' : '';
        }

        return <TagInput
            inputProps={{ placeholder: placeholder }}
            values={tags}
            margin={10}
            disabled={true}
            alignSelf="stretch"
        />
    }

    getRating = () => {
        const isImage = this.context.isImageFile(this.props.fileItem.basename);
        if (!isImage) {
            return 0;
        }

        if (!this.state.metadata) {
            return 0;
        }

        if (!this.state.metadata['xmp:Rating']) {
            return 0;
        }
        
        return Number.parseInt(this.state.metadata['xmp:Rating']);
    }

    render = () => {
        // console.log('Render file details: \n' + JSON.stringify(this.props.fileItem));

        const downloadIcon = <DownloadIcon size={24} marginRight={5}/>
        
        return <Pane zIndex={1} elevation={0} backgroundColor="white" display="grid" gridTemplateColumns="1fr" gridTemplateRows="auto auto auto 1fr" height="100%" overflowY="hidden">
            <Pane margin={15} borderBottom="muted">
                <Heading display="grid" gridTemplateColumns="1fr auto">
                    <Text size={600}>{this.props.fileItem.basename}</Text>
                    <CrossIcon className="largehidden" marginRight={5} marginLeft={5} onClick={() => this.props.handleClose()} />
                </Heading>
            </Pane>

            <Pane display="grid" gridTemplateColumns="1fr auto" marginTop={15} marginRight={15}>
                <Button marginLeft={10} justifySelf="start" appearance="primary" intent="success" is="a" iconBefore={downloadIcon} href={this.getDownloadLink()} target="_blank" disabled={!this.context.connectionValid}>Download</Button>                
                <RatingPane marginfLeft={5} rating={this.getRating()} maxRating={5} />
            </Pane>
            
            {this.renderTags()}

            {this.renderImageTabs()}
        </Pane>
    }
}