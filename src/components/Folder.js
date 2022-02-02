
import { Card, Icon, Text, Pane, FolderOpenIcon, Link, Table } from 'evergreen-ui';

import RegularFile from './RegularFile';

export default class Folder extends RegularFile {

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
                        <Icon icon={FolderOpenIcon} size={48} color="#F7D154" />
                    </Pane>
                    <Pane display="inline-flex" alignItems="center" justifyContent="center" width={190} height={18} margin={5}>
                        <FolderOpenIcon color="#F7D154"/>
                        <Text overflow="hidden" maxWidth={155} maxHeight={24}>{this.props.fileItem.basename}</Text>                        
                    </Pane>                    
                </Link>
            </Card>
        );
    }

    renderTable = () => {
        return <Table.Row key={this.props.fileItem.basename} isSelectable justifyContent="space-between" height={32}>
              <Table.TextCell textAlign="center" maxWidth={48}>
                <FolderOpenIcon color="#F7D154" size={16}/>
              </Table.TextCell>
              <Table.TextCell textAlign="left">
                  <Link href="#" onClick={(evt) => this.props.handleNavigate(this.props.fileItem.basename)} borderBottom="none">                  
                  {this.props.fileItem.basename}
                  </Link>
                </Table.TextCell>
                <Table.TextCell textAlign="left">
                    Folder
                </Table.TextCell>
                <Table.TextCell textAlign="left">
                    &nbsp;                    
                </Table.TextCell>
                <Table.TextCell textAlign="left">
                      {this.renderHttpDate(this.props.fileItem.lastmod)}
                </Table.TextCell>
                <Table.TextCell textAlign="center">
                    &nbsp;
                </Table.TextCell>
            </Table.Row>
    }
}