
import { Card, Icon, Pane, DocumentIcon, Link, Text, InfoSignIcon, DownloadIcon, MoreIcon, Table, Button, Position, Popover, Menu, DeleteIcon } from 'evergreen-ui';
import { Component } from 'react';
import { DateTime } from 'luxon';
import { DavConfigurationContext } from '../AppSettings';


export default class RegularFile extends Component {
    static contextType = DavConfigurationContext;

    _capitalize = (str) => {
        const lower = str.toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
    }

    download = (fileItem) => {
        const dlLink = this.context.davClient.getFileDownloadLink(fileItem.filename);
        window.open(dlLink, '_blank');
    }

    renderMimeType = (mimeType) => {
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
                <Pane style={styleThumb} background="tint2">
                    <Icon icon={DocumentIcon} size={48} color="success" />
                </Pane>

                <Pane display="inline-flex" alignItems="center" justifyContent="space-between" style={{ width: '190px', height: '18px', margin: '5px' }}>
                    <Link href="#" onClick={(evt) => { this.props.handleShowDetails(this.props.fileItem) }} borderBottom="none"><Icon icon={InfoSignIcon} color="info" /></Link>
                    <Text style={{ overflow: 'hidden', maxWidth: '155px', maxHeight: '24px' }}>{this.props.fileItem.basename}</Text>
                    <Link href={this.context.davClient.getFileDownloadLink(this.props.fileItem.filename)} target="_blank" borderBottom="none"><DownloadIcon color="success" /></Link>
                </Pane>
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
            <Button appearance="minimal" intent="none" boxShadow="none" border="none"><MoreIcon/></Button>
        </Popover>
    }

    renderTable = () => {
        return <Table.Row key={this.props.fileItem.basename} isSelectable height={32}>
            <Table.TextCell textAlign="center" maxWidth={48}>
                <DocumentIcon size={16} />
            </Table.TextCell>
            <Table.TextCell textAlign="left">
                <Link href={this.context.davClient.getFileDownloadLink(this.props.fileItem.filename)} target="_blank" borderBottom="none">
                    {this.props.fileItem.basename}
                </Link>
            </Table.TextCell>
            <Table.TextCell textAlign="left">
                {this.renderMimeType(this.props.fileItem.mime)}
            </Table.TextCell>
            <Table.TextCell textAlign="left">
                {this.renderFileItemSize()}
            </Table.TextCell>
            <Table.TextCell textAlign="left">
                {this.renderHttpDate(this.props.fileItem.lastmod)}
            </Table.TextCell>
            <Table.TextCell textAlign="center">
                {this.renderActionMenu()}
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