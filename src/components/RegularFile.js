
import { Card, Icon, Pane, DocumentIcon, Link, Text, InfoSignIcon, DownloadIcon } from 'evergreen-ui';
import { Component } from 'react';
import { DavConfigurationContext } from '../AppSettings';

export default class RegularFile extends Component {
    static contextType = DavConfigurationContext;

    showDetails = () => {
        this.props.showDetails(this.props.fileItem);
    }

    render = () => {
        let styleThumb = {
            width: '200px',
            height: '200px',
            marginTop: '-15px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
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
                <Pane style={styleThumb} background="tint2">
                    <Icon icon={DocumentIcon} size={48} color="success" />
                </Pane>  

                <Pane display="inline-flex" alignItem="center" justifyContent="space-between" style={{width: '190px', height: '18px', margin: '5px'}}>
                    <Link href="#" onClick={(evt) => {this.showDetails()}}><Icon icon={InfoSignIcon} color="info"/></Link>
                    <Text style={{overflow: 'hidden', maxWidth: '155px', maxHeight: '24px'}}>{this.props.fileItem.basename}</Text>
                    <Link href={this.context.davClient.getFileDownloadLink(this.props.fileItem.filename)} target="_blank"><DownloadIcon color="success"/></Link>
                </Pane>
            </Card>
        );
    }
}