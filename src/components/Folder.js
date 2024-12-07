
import { Popover, Position, Menu, Button, Pane, Text, Small } from 'evergreen-ui';
import { Icon, DeleteIcon, MoreIcon, FolderCloseIcon } from 'evergreen-ui';

import RegularFile from './RegularFile';

export default class Folder extends RegularFile {

    constructor(props) {
        super(props);
        this.state = {
            elementsCount: 0,
            sizeInBytes: 0
        }
    }

    componentDidMount = () => {
        this.fetchMetaData();
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (prevProps.fileItem !== this.props.fileItem) {
            this.fetchMetaData();
        }        
    }

    fetchMetaData = () => {
        const metaUrl = this.context.getFolderMetadataApiUrl();

        const metadataRequest = {
            "username": this.context.username,
            "homeDir": this.context.selectedUserRootDirectory.name,
            "filename": this.props.fileItem.filename
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
                sizeInBytes: res.sizeBytes,
                elementsCount: res.elementsCount
            });
        }).catch(err => {
            console.log('Error while reading folder metadata: ' + err);
        });
    }

    handleDefaultAction = () => {
        this.props.handleNavigate(this.props.fileItem.basename);
    }

    getFileItemSize = () => {
        return this.state.sizeInBytes;
    }

    renderActionMenu = () => {
        return <Popover
            position={Position.BOTTOM_RIGHT}
            content={
                <Menu>
                    <Menu.Group>
                        <Menu.Item icon={DeleteIcon} intent="danger" onSelect={() => { this.props.handleDelete(this.props.fileItem)} }>Delete</Menu.Item>
                    </Menu.Group>
                </Menu>
            }            
        >
            <Button appearance="minimal" intent="none" boxShadow="none" border="none" margin={5} maxHeight={24} maxWidth={24} padding={0} width={24} height={24}><MoreIcon size={16}/></Button>
        </Popover>
    }

    renderMimeType = (mimeType) => {
        return 'Directory';
    }

    renderGridIcon = () => {
        return <Icon icon={FolderCloseIcon} size={48} color="#F7D154" />
    }

    renderTableIcon = () => {
        return <FolderCloseIcon color="#F7D154" size={32} alignSelf="center"/>
    }

    renderTableFileProps = () => {
        return <Pane className='largehidden'>
            <Text color="muted"><Small>{this.renderFileItemSize()}&nbsp;-&nbsp;{this.renderHttpDate(this.props.fileItem.lastmod)}</Small></Text>
        </Pane>
    }
}