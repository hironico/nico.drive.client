
import { Card, Icon, Pane, Link, Text, Small, Table, Button, Position, Popover, Menu, Tooltip } from 'evergreen-ui';
import {DocumentIcon, InfoSignIcon, DownloadIcon, MoreIcon, DeleteIcon} from 'evergreen-ui';
import { Component } from 'react';
import { DateTime } from 'luxon';
import { DavConfigurationContext } from '../AppSettings';

import '../views/DavExplorerView.css';

export default class RegularFile extends Component {
    static contextType = DavConfigurationContext;

    _capitalize = (str) => {
        const lower = str.toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
    }

    download = (fileItem) => {
        const dlLink = this.context.selectedUserRootDirectory.davClient.getFileDownloadLink(fileItem.filename);
        window.open(dlLink, '_blank');
    }

    handleDefaultAction = () => {
        this.download(this.props.fileItem);
    }

    renderMimeType = (mimeType) => {
        if (this.props.fileItem.type === 'directory') {
            return 'Folder';
        }

        if (typeof mimeType === 'undefined') {
            return 'File';
        }

        if (mimeType.endsWith('json')) {
            return 'JSON';
        }

        if (mimeType.endsWith('xml')) {
            return 'XML';
        }

        if (mimeType.startsWith('application/')) {
            return 'File';
        }

        if (mimeType.startsWith('image/')) {
            return this._capitalize(mimeType.substring(6));
        }

        if (mimeType.startsWith('text/')) {
            return this._capitalize(mimeType.substring(5)) + ' Text';
        }

        return mimeType;
    }

    renderHttpDate = (httpDate) => {
        return DateTime.fromHTTP(httpDate).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS);
    }

    renderFileItemSize = () => {
        let unite = 'bytes';
        let taille = this.props.fileItem.size;
        if (taille > 1024) {
            taille = (taille / 1024).toFixed(2);
            unite = 'KB';
        }
        if (taille > 1024) {
            taille = (taille / 1024).toFixed(2);
            unite = 'MB';
        }
        if (taille > 1024) {
            taille = (taille / 1024).toFixed(2);
            unite = 'GB';
        }

        return `${taille} ${unite}`;
    }

    renderGridLabel = () => {
        return <Pane display="grid" gridTemplateColumns="1fr auto" alignItems="center" justifyContent="space-between" width="calc(100% - 10px)" margin={5}>
                <Tooltip content={this.props.fileItem.basename}>
                    <Text overflowX="hidden" whiteSpace="nowrap" textOverflow="ellipsis" maxWidth={155} maxHeight={24}>{this.props.fileItem.basename}</Text>
                </Tooltip>
                {this.renderActionMenu()}
            </Pane>
    }

    renderGridIcon = () => {
        return <Icon icon={DocumentIcon} size={48} color="success" />
    }

    renderGrid = () => {
        let styleThumb = {
            width: 'calc(100% - 6px)',
            height: 'calc(100% - 6px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '3px'
        }

        return (
            <Card
                elevation={2}
                backgroundColor="white"
                width={150}
                height={150}
                marginTop={10}
                marginBottom={0}
                marginLeft={5}
                marginRight={5}
                display="grid"
                gridTemplateColumns="1fr"
                gridTemplateRows="1fr auto"
                justifyContent="center"
                alignItems="center"
            >
                <Link href="#" height="100%" marginTop={3} onClick={evt => this.handleDefaultAction()} borderBottom="none">
                    <Pane style={styleThumb}>
                        {this.renderGridIcon()}
                    </Pane>
                </Link>

                {this.renderGridLabel()}
            </Card>
        );
    }

    renderActionMenu = () => {
        return <Popover
            position={Position.BOTTOM_RIGHT}
            content={
                <Menu>
                    <Menu.Group>
                        <Menu.Item icon={InfoSignIcon} intent="info" onSelect={() => { this.props.handleShowDetails(this.props.fileItem) }}>Details...</Menu.Item>
                        <Menu.Item icon={DownloadIcon} intent="success" onSelect={() => { this.download(this.props.fileItem)} }>Download...</Menu.Item>
                    </Menu.Group>
                    <Menu.Group>
                        <Menu.Item icon={DeleteIcon} intent="danger" onSelect={() => { this.props.handleDelete(this.props.fileItem)} }>Delete</Menu.Item>
                    </Menu.Group>
                </Menu>
            }            
        >
            <Button appearance="minimal" intent="none" boxShadow="none" border="none" marginTop={5} marginRight={0} marginBottom={5} marginLeft={0} maxHeight={24} maxWidth={24} padding={0} width={24} height={24}><MoreIcon size={16}/></Button>
        </Popover>
    }

    renderTableIcon = () => {
        return <DocumentIcon size={16} />
    }

    renderTableFileProps = () => {
        return <Pane className='largehidden'>
            <Text color="muted"><Small>{this.renderFileItemSize()}&nbsp;-&nbsp;{this.renderHttpDate(this.props.fileItem.lastmod)}</Small></Text>
        </Pane>
    }

    renderTable = () => {
        return <Table.Row key={this.props.fileItem.basename} isSelectable height={48}>
            <Table.TextCell textAlign="center" maxWidth={48}>
                {this.renderTableIcon()}
            </Table.TextCell>
            <Table.Cell textAlign="left" flexGrow={5} display="grid" gridTemplateRows="1fr auto">
                <Link href="#" onClick={(evt) => this.handleDefaultAction()} borderBottom="none">
                    <Text color="muted" overflowX="hidden" whiteSpace="nowrap" textOverflow="ellipsis">{this.props.fileItem.basename}</Text>
                </Link>
                {this.renderTableFileProps()}
            </Table.Cell>
            <Table.TextCell className="tablecell smallhidden" textAlign="left">
                {this.renderMimeType(this.props.fileItem.mime)}
            </Table.TextCell>
            <Table.TextCell className="tablecell smallhidden" textAlign="left">
                {this.renderFileItemSize()}
            </Table.TextCell>
            <Table.TextCell className="tablecell smallhidden" textAlign="left">
                {this.renderHttpDate(this.props.fileItem.lastmod)}
            </Table.TextCell>
            <Table.TextCell textAlign="center">
                {this.renderActionMenu()}
            </Table.TextCell>
        </Table.Row>
    }

    renderPhoto = () => {
        return <Text>Regular file does not support ptoho display mode yet.</Text>
    }

    render = () => {
        switch (this.props.displayMode) {
            case 'grid':
                return this.renderGrid();

            case 'table':
                return this.renderTable();

            case 'photo':
                return this.renderPhoto();

            default:
                console.log(`Invalid display mode: ${this.props.displayMode}. Using grid as a default.`);
                return this.renderGrid();
        }
    }
}