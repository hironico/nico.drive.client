import { Button, Heading, InfoSignIcon, Pane, Table, DownloadIcon, Tablist, Tab, Paragraph } from 'evergreen-ui';
import { Fragment, Component } from 'react';

import DavConfiguration from '../AppSettings';

export default class FileDetailsPane extends Component {
    constructor() {
        super();
        this.state = {            
            imageData: [],
            selectedIndex: 0,
            tabs: ['Information', 'Image', 'Metadata']
        }
    }

    componentWillMount = () => {
        this.loadImageInformation();
        this.loadMetaDataInformation();
    }

    getDownloadLink = () => {
        const davClient = this.props.davClient;
        if (typeof davClient === 'undefined' || davClient === null) {
            // console.log('davClient prop is undefined. Cannot download file.');
            return;
        }
        
        return davClient.getFileDownloadLink(this.props.fileItem.filename);
    }

    loadImageInformation = () => {
        const config = new DavConfiguration();
        const metaUrl = config.getExifApiUrl();

        const exifRequest = {
            "filename": this.props.fileItem.filename.substring(5)
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
            console.log('Received exif for this file: ' + JSON.stringify(res));
            this.setState({
                imageData: res
            });
        }).catch(err => {
            console.log('Error while reading exif data: ' + err);
        });
    }


    loadMetaDataInformation = () => {
        const config = new DavConfiguration();
        const metaUrl = config.getMetadataApiUrl();

        const metadataRequest = {
            "filename": this.props.fileItem.filename.substring(5),
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
            console.log('Received metadata for this file: ' + JSON.stringify(res));
            this.setState({
                metadata: res
            });
        }).catch(err => {
            console.log('Error while reading metadata: ' + err);
        });
    }

    renderFileItemSize = () => {
        let unite = 'octets';
        let taille = this.props.fileItem.size;
        if (taille > 1024) {
            taille = (taille / 1024).toFixed(2);
            unite = 'Ko';
        }
        if (taille > 1024) {
            taille = (taille / 1024).toFixed(2);
            unite = 'Mo';
        }
        if (taille > 1024) {
            taille = (taille / 1024).toFixed(2);
            unite = 'Go';
        }

        return <span>{taille}&nbsp;{unite}</span>
    }

    renderImageTabs = () => {
        return <Pane>
        <Tablist marginBottom={16} flexBasis={240} marginRight={24}>
            {this.state.tabs.map((tab, index) => (
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
                switch(index) {
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
            <Table.Head>
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
                <Table.Row key="row_path">
                    <Table.TextCell>Chemin:</Table.TextCell>
                    <Table.TextCell>{this.props.fileItem.filename}</Table.TextCell>
                </Table.Row>
                <Table.Row>
                    <Table.TextCell key="row_modif">Dernière modif:</Table.TextCell>                        
                    <Table.TextCell>{this.props.fileItem.lastmod}</Table.TextCell>
                </Table.Row>
                <Table.Row>
                    <Table.TextCell key="row_size">Taille:</Table.TextCell>
                    <Table.TextCell>{this.renderFileItemSize()}</Table.TextCell>
                </Table.Row>
            </Table.Body>
        </Table>
    }

    renderImageDetails = () => {
        if (typeof this.state.imageData.image === 'undefined') {
            return <Fragment>&nbsp;</Fragment>
        }

        let rows = Object.keys(this.state.imageData.image).map((key, index) => {
            return <Table.Row key={index}>
                        <Table.TextCell>{key}</Table.TextCell>
                        <Table.TextCell>{this.state.imageData.image[key]}</Table.TextCell>
                    </Table.Row>
        });

        return <Table marginTop={15}>
            <Table.Head>
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
        if (typeof this.state.metadata === 'undefined') {
            return <Fragment>&nbsp;</Fragment>
        }

        let rows = Object.keys(this.state.metadata).map((key, index) => {
            return <Table.Row key={`meta-${index}`}>
                        <Table.TextCell>{key}</Table.TextCell>
                        <Table.TextCell>{this.state.metadata[key]}</Table.TextCell>
                    </Table.Row>
        });

        return <Table marginTop={15}>
            <Table.Head>
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

    render = () => {
        console.log('Render file details: \n' + JSON.stringify(this.props.fileItem));
        
        const downloadIcon = <DownloadIcon size={24} />
        const infoIcon = <InfoSignIcon size={24} />
        const hasDavClient = typeof this.props.davClient !== 'undefined' && this.props.davclient !== null;

        return <Pane zIndex={1} flexShrink={0} elevation={0} backgroundColor="white">
            <Pane padding={16} borderBottom="muted">
                <Heading size={600}>{this.props.fileItem.basename}</Heading>                
            </Pane>
            <Pane marginTop={15}>
                {this.renderImageTabs()}
            </Pane>
            
            <Button appearance="primary" intent="success" is="a" margin={20} iconBefore={downloadIcon} href={this.getDownloadLink()} target="_blank" disabled={!hasDavClient}>Télécharger</Button>
           
        </Pane>
    }
}