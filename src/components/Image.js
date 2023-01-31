
import { Card, Link, Pane, Table, Spinner } from 'evergreen-ui';

import RegularFile from './RegularFile';

import { DavConfigurationContext } from '../AppSettings';

import '../views/DavExplorerView.css';

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

    componentDidUpdate = (prevProps, prevState) => {
        if (prevProps.fileItem !== this.props.fileItem) {
            this.setState({
                thumb: null
            }, () => this.generateThumb());
        }
    }

    generateThumb = () => {
        const authHeader = this.context.selectedUserRootDirectory.davClient.getHeaders()['Authorization']; 

        let width;
        let height;
        let resizeFit;
        switch (this.props.displayMode) {
            case 'grid':
                width = 200;
                height = 200;
                resizeFit = 'cover';
                break;

            case 'table':
                width = 60;
                height = 60;
                resizeFit = 'cover';
                break;

            case 'photo':
                width = 1920;
                height = 1200;
                resizeFit = 'inside';
                break;

            default:
                console.warn(`Unrecognized display mode for Image: ${this.props.displayMode}`);
                width = 200;
                height = 200;
                resizeFit = 'cover';
                break;
        }

        const req = {
            "username": this.context.username,
            "homeDir": this.context.selectedUserRootDirectory.name,
            "filename": this.props.fileItem.filename,
            "width": width,
            "height": height,
            "resizeFit": resizeFit
        }

        const that = this;
        fetch(this.context.getThumbApiUrl(), { 
            method: 'POST',
            body: JSON.stringify(req),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
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

    renderGridThumb = () => {        
        if (this.state.thumb !== null) {
            const imgUrl = 'url(' + this.state.thumb + ')';
            const styleThumb = {
                backgroundImage: imgUrl,
                backgroundPosition: 'center',
                backgroundSize: 'cover',                
                width: '200px',
                height: '200px',
                marginTop: '-15px'
            }             
            return <div style={styleThumb}>&nbsp;</div>
        } else {
            return <Pane display="flex" alignItems="center" justifyContent="center" height={200}>
                       <Spinner />
                   </Pane>
        } 
    }

    renderGrid = () => {
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
                {this.renderGridThumb()}
                {this.renderGridLabel()}
            </Card>
        );
    }

    renderTableThumb = () => {
        if (this.state.thumb !== null) {
            const imgUrl = 'url(' + this.state.thumb + ')';
            const styleThumb = {
                backgroundImage: imgUrl,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                width: '24px',
                height: '20px',
                margin: '0px'
            }
            return <div style={styleThumb}>&nbsp;</div>
        } else {
            return <Pane display="flex" alignItems="center" justifyContent="center" height={24} width={24} padding={0} margin={0}>
                       <Spinner height={16} width={16} />
                   </Pane>
        }
    }

    renderTable = () => {
        return <Table.Row key={this.props.fileItem.basename} isSelectable justifyContent="space-between" height={32}>
              <Table.TextCell textAlign="center" maxWidth={48}>
                {this.renderTableThumb()}
              </Table.TextCell>
              <Table.TextCell textAlign="left">
                  <Link href={this.context.selectedUserRootDirectory.davClient.getFileDownloadLink(this.props.fileItem.filename)} target="_blank" borderBottom="none">
                      {this.props.fileItem.basename}
                  </Link>                
                </Table.TextCell>
                <Table.TextCell className="tablecell" display="none" textAlign="left">
                    {this.renderMimeType(this.props.fileItem.mimeType)}
                </Table.TextCell>
                <Table.TextCell className="tablecell" display="none" textAlign="left">
                    {this.renderFileItemSize()}
                </Table.TextCell>
                <Table.TextCell className="tablecell" display="none" textAlign="left">
                    {this.renderHttpDate(this.props.fileItem.lastmod)}
                </Table.TextCell>
              <Table.TextCell textAlign="center">
                  {this.renderActionMenu()}
              </Table.TextCell>
            </Table.Row>
    }

    renderPhoto = () => {  
        if (this.state.thumb !== null) {
            const imgUrl = 'url(' + this.state.thumb + ')';
            const styleThumb = {
                backgroundImage: imgUrl,
                backgroundPosition: 'center',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                width: '100%',
                height: '100%'
            }             
            return <div style={styleThumb}>&nbsp;</div>
        } else {
            return <Pane display="flex" alignItems="center" justifyContent="center" height={200}>
                        <Spinner color="white" />
                    </Pane>
        }
    }
}