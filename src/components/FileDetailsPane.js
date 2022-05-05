import { Button, Heading, InfoSignIcon, Pane, Table, Tablist, Tab, TagInput, EmptyState } from 'evergreen-ui';
import { DownloadIcon, SearchIcon } from 'evergreen-ui';

import { Component } from 'react';

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
            return;
        }

        return this.context.davClient.getFileDownloadLink(this.props.fileItem.filename);
    }

    loadImageInformation = () => {
        const metaUrl = this.context.getExifApiUrl();

        const paths = this.context.davBaseUrl.split('/');
        const homeDir = `/${paths[paths.length - 1]}`;

        const exifRequest = {
            "username": this.context.username,
            "homeDir": homeDir,
            "filename": this.props.fileItem.filename
        }

        fetch(metaUrl, {
            method: 'POST',
            body: JSON.stringify(exifRequest),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(res => {
                // console.log('Received exif for this file: ' + JSON.stringify(res));
                this.setState({
                    imageData: res
                });
            }).catch(err => {
                console.log('Error while reading exif data: ' + err);
                this.setState({
                    metadata: { tags: '' }
                });
            });
    }


    loadMetaDataInformation = () => {
        const metaUrl = this.context.getMetadataApiUrl();

        const paths = this.context.davBaseUrl.split('/');
        const homeDir = `/${paths[paths.length - 1]}`;

        const metadataRequest = {
            "username": this.context.username,
            "homeDir": homeDir,
            "filename": this.props.fileItem.filename,
            "raw": false
        }

        fetch(metaUrl, {
            method: 'POST',
            body: JSON.stringify(metadataRequest),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(res => {
                /*
                console.log('Received metadata for this file: ' + JSON.stringify(res));
                console.log('Tags are: ' + res.tags);
                */

                this.setState({
                    metadata: res
                });
            }).catch(err => {
                console.log('Error while reading metadata: ' + err);
                this.setState({
                    metadata: { tags: '' }
                });
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
        return <Pane padding={15}>
            <Tablist marginBottom={16} flexBasis={240} marginRight={24}>
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
                    key={tab}
                    id={`panel-${tab}`}
                    role="tabpanel"
                    aria-labelledby={tab}
                    aria-hidden={index !== this.state.selectedIndex}
                    display={index === this.state.selectedIndex ? 'block' : 'none'}
                >
                    {panelTab}
                </Pane>
            })}

        </Pane>
    }

    renderFileDetails = () => {
        return <Table marginTop={15}>
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

    renderImageDetails = () => {
        let rows;
        if (typeof this.state.imageData.image === 'undefined') {
            rows = this.renderEmptyDetails('No image information has been found.');
        } else {
                rows = Object.keys(this.state.imageData.image).map((key, index) => {
                return <Table.Row key={index} height={32}>
                    <Table.TextCell>{key}</Table.TextCell>
                    <Table.TextCell>{this.state.imageData.image[key]}</Table.TextCell>
                </Table.Row>
            });
        }

        return <Table marginTop={15}>
            <Table.Head height={32}>
                <Table.TextHeaderCell>
                    <Pane display="inline-flex" alignItems="center">
                        <InfoSignIcon />&nbsp;Image information
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

        let placeholder = 'Loading tags info...';
        let tags = [];
        if (this.state.metadata) {            
            if (typeof this.state.metadata.tags !== 'undefined') {
                if ('' !== this.state.metadata.tags) {
                    tags = this.state.metadata.tags.split(',');
                } 
            }
            placeholder = tags.length === 0 ? 'No tags for this image' : '';
        }

        return <TagInput
            inputProps={{ placeholder: placeholder }}
            values={tags}
            flexGrow={2}
            margin={15}
            disabled={true}
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
        
        return <Pane zIndex={1} flexShrink={0} elevation={0} backgroundColor="white">
            <Pane padding={16} borderBottom="muted">
                <Heading size={600}>{this.props.fileItem.basename}</Heading>
            </Pane>
            <Pane display="inline-flex" alignItems="center">
                <Button appearance="primary" intent="success" is="a" margin={20} iconBefore={downloadIcon} href={this.getDownloadLink()} target="_blank" disabled={!this.context.connectionValid}>Download</Button>                
                <RatingPane rating={this.getRating()} maxRating={5} marginRight={10} marginLeft={10}/>
            </Pane>
            <Pane display="flex" gridTemplateColumns="auto">
                {this.renderTags()}
            </Pane>
            <Pane>
                {this.renderImageTabs()}
            </Pane>
        </Pane>
    }
}