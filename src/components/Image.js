
import { Card, Icon, Link, Pane, Text, InfoSignIcon, DownloadIcon, Table } from 'evergreen-ui';

import RegularFile from './RegularFile';

import { DavConfigurationContext } from '../AppSettings';

export default class Image extends RegularFile {
    static contextType = DavConfigurationContext;

    constructor() {
        super();
        this.state = {
            thumb: null
        }
    }

    componentDidMount = () => {
        this.setState({
            thumb: null
        }, () => this.generateThumb());
    }

    generateThumb = () => {
        const paths = this.context.davBaseUrl.split('/');
        const homeDir = `/${paths[paths.length - 1]}`;

        const req = {
            "username": this.context.username,
            "homeDir": homeDir,
            "filename": this.props.fileItem.filename
        }

        const that = this;
        fetch(this.context.getThumbApiUrl(), { 
            method: 'POST',
            body: JSON.stringify(req),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.blob())
        .then(res => {
            var reader = new FileReader();
            reader.readAsDataURL(res);
            reader.onloadend = function() {
                var base64data = reader.result;

                // put that into state
                that.setState(prev => {
                    return {
                        thumb: base64data
                    }
                });   
            }                   
        })
        .catch(err => console.log(`Could not generate thumb for file ${this.props.fileItem.filename}\nReason: ${err}`));
    }

    renderGrid = () => {
        let styleThumb = {};
        if (this.state.thumb !== null) {
            const imgUrl = 'url(' + this.state.thumb + ')';
            styleThumb = {
                backgroundImage: imgUrl,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                width: '200px',
                height: '200px',
                marginTop: '-15px'
            }        
        }        

        return (
            <Card
                elevation={2}
                backgroundColor="white"
                width={200}
                height={240}
                margin={24}
                display="flex"
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
            > 
                <div style={styleThumb}>&nbsp;</div>
                <Pane display="inline-flex" alignItems="center" justifyContent="space-between" width={190} height={18} margin={5}>
                    <Link href="#" borderBottom="none" onClick={(evt) => {this.props.handleShowDetails(this.props.fileItem)}}><Icon icon={InfoSignIcon} color="info"/></Link>
                    <Text overflow="hidden" maxWidth={155} maxHeigh={24}>{this.props.fileItem.basename}</Text>
                    <Link href={this.context.davClient.getFileDownloadLink(this.props.fileItem.filename)} target="_blank" borderBottom="none"><DownloadIcon color="success"/></Link>
                </Pane>
            </Card>
        );
    }

    renderTable = () => {

        let styleThumb = {};
        if (this.state.thumb !== null) {
            const imgUrl = 'url(' + this.state.thumb + ')';
            styleThumb = {
                backgroundImage: imgUrl,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                width: '24px',
                height: '20px',
                margin: '0px'
            }        
        } 

        return <Table.Row key={this.props.fileItem.basename} isSelectable justifyContent="space-between" height={32}>
              <Table.TextCell textAlign="center" maxWidth={48}>
                <div style={styleThumb}></div>
              </Table.TextCell>
              <Table.TextCell textAlign="left">
                  <Link href={this.context.davClient.getFileDownloadLink(this.props.fileItem.filename)} target="_blank" borderBottom="none">
                      {this.props.fileItem.basename}
                  </Link>                
                </Table.TextCell>
                <Table.TextCell textAlign="left">
                    {this.renderMimeType(this.props.fileItem.mimeType)}
                </Table.TextCell>
                <Table.TextCell textAlign="left">
                    {this.renderFileItemSize()}
                </Table.TextCell>
                <Table.TextCell textAlign="left">
                    {this.renderHttpDate(this.props.fileItem.lastmod)}
                </Table.TextCell>
              <Table.TextCell textAlign="center">
                  {this.renderActionMenu()}
              </Table.TextCell>
            </Table.Row>
    }
}