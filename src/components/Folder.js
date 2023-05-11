
import { Popover, Position, Menu, Button, Pane, Text, Small } from 'evergreen-ui';
import { Icon, DeleteIcon, MoreIcon, FolderCloseIcon } from 'evergreen-ui';

import RegularFile from './RegularFile';

export default class Folder extends RegularFile {

    handleDefaultAction = () => {
        this.props.handleNavigate(this.props.fileItem.basename);
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

    renderFileItemSize = () => {
        return '';
    }

    renderGridIcon = () => {
        return <Icon icon={FolderCloseIcon} size={48} color="#F7D154" />
    }

    renderTableIcon = () => {
        return <FolderCloseIcon color="#F7D154" size={24}/>
    }

    renderTableFileProps = () => {
        return <Pane className='largehidden'>
            <Text color="muted"><Small>{this.renderHttpDate(this.props.fileItem.lastmod)}</Small></Text>
        </Pane>
    }
}