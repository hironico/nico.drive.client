
import { Card, Icon, Text, Pane, FolderOpenIcon, Link, Table } from 'evergreen-ui';
import { Component } from 'react';

export default class Folder extends Component {

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
                <Link href="#" onClick={(evt) => this.props.navigate(this.props.fileItem.basename)}>             
                    <Pane style={styleThumb} background="tint2">
                        <Icon icon={FolderOpenIcon} size={48} color="#F7D154" />
                    </Pane>
                    <Pane display="inline-flex" alignItems="center" justifyContent="center" style={{width: '190px', height: '18px', margin: '5px'}}>
                        <FolderOpenIcon color="#F7D154"/>
                        <Text style={{overflow: 'hidden', maxWidth: '155px', maxHeight: '24px'}}>{this.props.fileItem.basename}</Text>                        
                    </Pane>                    
                </Link>
            </Card>
        );
    }

    renderTable = () => {
        return <Table.Row key={this.props.fileItem.basename} isSelectable justifyContent="space-between">
              <Table.TextCell flexGrow={2} textAlign="left">
                  <Link href="#" onClick={(evt) => this.props.navigate(this.props.fileItem.basename)}>
                  <FolderOpenIcon color="#F7D154"/>&nbsp;
                  {this.props.fileItem.basename}
                  </Link>
                </Table.TextCell>
              <Table.TextCell flexGrow={1}>&nbsp;</Table.TextCell>
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