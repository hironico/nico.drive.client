import { Component } from 'react';
import {
    Pane,
    Table,
    IconButton,
    TrashIcon,
    EditIcon,
    Button,
    Spinner,
    Text,
    Dialog
} from 'evergreen-ui';

class DavSharesTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showDeleteConfirm: false,
            shareToDelete: null
        };
    }

    handleDeleteClick = (share) => {
        this.setState({
            showDeleteConfirm: true,
            shareToDelete: share
        });
    };

    handleConfirmDelete = () => {
        const { shareToDelete } = this.state;
        const { onDeleteShare, directoryName } = this.props;
        
        if (shareToDelete && onDeleteShare) {
            onDeleteShare(directoryName, shareToDelete.uid);
        }
        
        this.setState({
            showDeleteConfirm: false,
            shareToDelete: null
        });
    };

    handleCancelDelete = () => {
        this.setState({
            showDeleteConfirm: false,
            shareToDelete: null
        });
    };

    render() {
        const {
            shares,
            directoryName,
            deletingShare,
            onEditShare
        } = this.props;

        const { showDeleteConfirm, shareToDelete } = this.state;

        // If no shares, show empty state
        if (!shares || shares.length === 0) {
            return (
                <Pane padding={16} background="tint1" borderRadius={4}>
                    <Text size={300} color="muted">No specific user shares configured</Text>
                </Pane>
            );
        }

        return (
            <>
                <Table>
                    <Table.Head>
                        <Table.TextHeaderCell>Username</Table.TextHeaderCell>
                        <Table.TextHeaderCell>Access</Table.TextHeaderCell>
                        <Table.TextHeaderCell width={120}>Actions</Table.TextHeaderCell>
                    </Table.Head>
                    <Table.Body>
                        {shares.map((share) => {
                            const deleteKey = `${directoryName}-${share.uid}`;
                            const isDeleting = deletingShare ? deletingShare[deleteKey] : false;
                            
                            return (
                                <Table.Row key={share.uid}>
                                    <Table.TextCell>{share.username || share.uid}</Table.TextCell>
                                    <Table.TextCell>
                                        {share.access === 'canRead' ? 'Read Only' : 'Read & Write'}
                                    </Table.TextCell>
                                    <Table.Cell width={120}>
                                        <IconButton
                                            is='div'
                                            intent='info'
                                            icon={EditIcon}                                                                    
                                            marginRight={8}
                                            onClick={() => onEditShare && onEditShare(directoryName, share)}
                                            disabled={isDeleting}
                                        />
                                        {isDeleting ? (
                                            <Spinner size={16} marginX={8} />
                                        ) : (
                                            <IconButton
                                                is='div'
                                                icon={TrashIcon}
                                                intent="danger"
                                                onClick={() => this.handleDeleteClick(share)}
                                            />
                                        )}
                                    </Table.Cell>
                                </Table.Row>
                            );
                        })}
                    </Table.Body>
                </Table>

                {/* Delete Confirmation Dialog */}
                <Dialog
                    isShown={showDeleteConfirm}
                    title="Confirm Share Removal"
                    intent="danger"
                    onCloseComplete={this.handleCancelDelete}
                    hasFooter={false}
                >
                    {shareToDelete ? (
                        <Text>
                            Are you sure you want to remove the share for user{' '}
                            <strong>{shareToDelete.username || shareToDelete.uid}</strong>
                            {' '}from directory{' '}
                            <strong>{directoryName}</strong>?
                            {' '}This action cannot be undone.
                        </Text>
                    ) : <></>}

                    <Pane width="100%" display="flex" justifyContent="right" marginTop={10}>
                        <Button is="div" marginLeft={0} marginRight={6} appearance="default" intent="none" onClick={this.handleCancelDelete}>
                            Cancel
                        </Button>
                        <Button is="div" marginLeft={6} marginRight={0} appearance="primary" intent="danger" onClick={this.handleConfirmDelete}>
                            Confirm delete
                        </Button>
                    </Pane>
                </Dialog>
            </>
        );
    }
}

export default DavSharesTable;
