
import { Card, Pane, Link, Table, Popover, Position, Menu, Button } from 'evergreen-ui';
import { Icon, DeleteIcon, MoreIcon, FolderCloseIcon } from 'evergreen-ui';

import RegularFile from './RegularFile';

export default class Folder extends RegularFile {

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

    renderGrid = () => {
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
                <Link href="#" onClick={(evt) => this.props.handleNavigate(this.props.fileItem.basename)} borderBottom="none">             
                    <Pane style={styleThumb} background="tint2">
                        <Icon icon={FolderCloseIcon} size={48} color="#F7D154" />
                    </Pane>
                </Link>
                {this.renderGridLabel()}                  
            </Card>
        );
    }

    renderTable = () => {
        return <Table.Row key={this.props.fileItem.basename} isSelectable justifyContent="space-between" height={32}>
              <Table.TextCell textAlign="center" maxWidth={48}>
                <FolderCloseIcon color="#F7D154" size={16}/>
              </Table.TextCell>
              <Table.TextCell textAlign="left">
                  <Link href="#" onClick={(evt) => this.props.handleNavigate(this.props.fileItem.basename)} borderBottom="none">                  
                  {this.props.fileItem.basename}
                  </Link>
                </Table.TextCell>
                <Table.TextCell className="tablecell" textAlign="left">
                    Folder
                </Table.TextCell>
                <Table.TextCell className="tablecell" textAlign="left">
                    &nbsp;                    
                </Table.TextCell>
                <Table.TextCell className="tablecell" textAlign="left">
                    {this.renderHttpDate(this.props.fileItem.lastmod)}
                </Table.TextCell>
                <Table.TextCell textAlign="center">
                    {this.renderActionMenu()}
                </Table.TextCell>
            </Table.Row>
    }
}