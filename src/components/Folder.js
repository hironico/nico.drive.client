
import { Card, Icon, Text, Pane, FolderOpenIcon, Link, Table } from 'evergreen-ui';
import { Component } from 'react';

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
                <Link href="#" onClick={(evt) => this.props.handleNavigate(this.props.fileItem.basename)}>             
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
              <Table.TextCell flexGrow={3} textAlign="left">
                  <Link href="#" onClick={(evt) => this.props.handleNavigate(this.props.fileItem.basename)}>
                  <FolderOpenIcon color="#F7D154"/>&nbsp;
                  {this.props.fileItem.basename}
                  </Link>
                </Table.TextCell>
                <Table.TextCell textAlign="left">
                    &nbsp;                    
                </Table.TextCell>
                <Table.TextCell textAlign="left">
                    {this.props.fileItem.lastmod}
                </Table.TextCell>
              <Table.TextCell flexGrow={1}>&nbsp;</Table.TextCell>
            </Table.Row>
    }
}