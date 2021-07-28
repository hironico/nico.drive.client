
import { Card, Icon, Link, Pane, Text, InfoSignIcon, DownloadIcon, Table } from 'evergreen-ui';
import { Component } from 'react';

import { DavConfigurationContext } from '../AppSettings';

export default class Image extends Component {
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
        const req = {
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
                <Pane display="inline-flex" alignItems="center" justifyContent="space-between" style={{width: '190px', height: '18px', margin: '5px'}}>
                    <Link href="#" onClick={(evt) => {this.props.handleShowDetails(this.props.fileItem)}}><Icon icon={InfoSignIcon} color="info"/></Link>
                    <Text style={{overflow: 'hidden', maxWidth: '155px', maxHeight: '24px'}}>{this.props.fileItem.basename}</Text>
                    <Link href={this.context.davClient.getFileDownloadLink(this.props.fileItem.filename)} target="_blank"><DownloadIcon color="success"/></Link>
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
                width: '16px',
                height: '16px',
                marginRight: '5px'
            }        
        } 

        return <Table.Row key={this.props.fileItem.basename} isSelectable justifyContent="space-between">
              <Table.TextCell flexGrow={2} textAlign="left">
                  <Link href={this.context.davClient.getFileDownloadLink(this.props.fileItem.filename)} target="_blank">
                      <div style={{display: 'inline-flex'}}>
                      <div style={styleThumb}>&nbsp;</div>
                      <div>{this.props.fileItem.basename}</div>
                      </div>                  
                  </Link>
                </Table.TextCell>
              <Table.TextCell flexGrow={1} textAlign="right">
                  <Link href="#" onClick={(evt) => {this.props.handleShowDetails(this.props.fileItem)}}><Icon icon={InfoSignIcon} color="info"/></Link>&nbsp;
                  <Link href={this.context.davClient.getFileDownloadLink(this.props.fileItem.filename)} target="_blank"><DownloadIcon color="success"/></Link>
              </Table.TextCell>
            </Table.Row>
    }

    render = () => {
        switch (this.props.displayMode) {
            case 'grid':
                return this.renderGrid();

            case 'table':
                return this.renderTable();

            default:
                console.log(`Invalid display mode: ${this.props.displayMode}. Using grid as a default.`);
                return this.renderGrid();
        }
    }
}