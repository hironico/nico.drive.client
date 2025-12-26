import { Component } from 'react';
import { Navigate, useNavigate } from 'react-router';
import {
    Pane,
    Heading,
    IconButton,
    Button,
    toaster,
    ArrowLeftIcon,
    AddIcon,
    Dialog,
    TextInputField,
    Table,
    Spinner,
    EditIcon,
    TrashIcon,
    Switch,
    SideSheet,
    ShareIcon
} from 'evergreen-ui';

import { DavConfigurationContext } from '../AppSettings';
import DavSharesTable from '../components/DavSharesTable';
import DavSharePane from '../components/DavSharePane';
import './DavExplorerView.css';

// Format bytes to human-readable size
const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

class DavRootDirManagementView extends Component {
    static contextType = DavConfigurationContext;

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            rootDirectories: [],
            showCreateDialog: false,
            showRenameDialog: false,
            showDeleteDialog: false,
            showSharesSheet: false,
            showCreateSharePane: false,
            selectedDirectory: null,
            selectedDirectoryForShares: null,
            editingShare: null,
            newDirectoryName: '',
            renameDirectoryName: '',
            togglingPublic: {}, // Track which directories are being toggled
            deletingShare: {} // Track which shares are being deleted
        };
    }

    componentDidMount() {
        this.loadRootDirectories();
    }

    loadRootDirectories = async () => {
        this.setState({ loading: true });

        try {
            const response = await fetch(`${this.context.davApiBaseUrl}/rootdirs`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load root directories');
            }

            const rootDirectories = await response.json();
            console.log('Root directories loaded:', rootDirectories);

            this.setState({
                rootDirectories,
                loading: false
            });
        } catch (error) {
            console.error('Error loading root directories:', error);
            toaster.danger('Failed to load root directories');
            this.setState({ loading: false });
        }
    };

    handleCreateDirectory = async () => {
        const { newDirectoryName } = this.state;

        if (!newDirectoryName || newDirectoryName.trim().length === 0) {
            toaster.warning('Please enter a directory name');
            return;
        }

        try {
            const response = await fetch(`${this.context.davApiBaseUrl}/rootdirs`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newDirectoryName
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create directory');
            }

            toaster.success('Root directory created successfully');
            this.setState({ showCreateDialog: false, newDirectoryName: '' });
            await this.loadRootDirectories();
            
            // Refresh user info to update the sidebar
            await this.context.refreshUserInfo();
        } catch (error) {
            console.error('Error creating directory:', error);
            toaster.danger(error.message || 'Failed to create directory');
        }
    };

    handleRenameDirectory = async () => {
        const { selectedDirectory, renameDirectoryName } = this.state;

        if (!renameDirectoryName || renameDirectoryName.trim().length === 0) {
            toaster.warning('Please enter a new directory name');
            return;
        }

        try {
            const encodedName = encodeURIComponent(selectedDirectory.name);
            const response = await fetch(`${this.context.davApiBaseUrl}/rootdirs/${encodedName}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    newName: renameDirectoryName
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to rename directory');
            }

            toaster.success('Root directory renamed successfully');
            this.setState({ showRenameDialog: false, selectedDirectory: null, renameDirectoryName: '' });
            await this.loadRootDirectories();
            
            // Refresh user info to update the sidebar
            await this.context.refreshUserInfo();
        } catch (error) {
            console.error('Error renaming directory:', error);
            toaster.danger(error.message || 'Failed to rename directory');
        }
    };

    handleDeleteDirectory = async () => {
        const { selectedDirectory } = this.state;

        try {
            const encodedName = encodeURIComponent(selectedDirectory.name);
            // Always delete files - no choice for the user
            const response = await fetch(`${this.context.davApiBaseUrl}/rootdirs/${encodedName}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete directory');
            }

            toaster.success('Root directory deleted successfully');
            this.setState({ showDeleteDialog: false, selectedDirectory: null });
            await this.loadRootDirectories();
            
            // Refresh user info to update the sidebar
            await this.context.refreshUserInfo();
        } catch (error) {
            console.error('Error deleting directory:', error);
            toaster.danger(error.message || 'Failed to delete directory');
        }
    };

    handleTogglePublic = async (directory) => {
        const newPublicStatus = !directory.isPublic;

        // Set loading state for this directory
        this.setState(prevState => ({
            togglingPublic: { ...prevState.togglingPublic, [directory.name]: true }
        }));

        try {
            const response = await fetch(`${this.context.davApiBaseUrl}/share/public`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    directoryName: directory.name,
                    isPublic: newPublicStatus
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to toggle public status');
            }

            toaster.success(newPublicStatus ? 'Directory is now public (read-only)' : 'Directory is no longer public');
            await this.loadRootDirectories();
            
            // Refresh user info to update the sidebar
            await this.context.refreshUserInfo();
            
            // Clear loading state
            this.setState(prevState => ({
                togglingPublic: { ...prevState.togglingPublic, [directory.name]: false }
            }));
        } catch (error) {
            console.error('Error toggling public status:', error);
            toaster.danger(error.message || 'Failed to toggle public status');
            
            // Clear loading state even on error
            this.setState(prevState => ({
                togglingPublic: { ...prevState.togglingPublic, [directory.name]: false }
            }));
        }
    };

    openCreateDialog = () => {
        this.setState({
            showCreateDialog: true,
            newDirectoryName: ''
        });
    };

    openRenameDialog = (directory) => {
        this.setState({
            showRenameDialog: true,
            selectedDirectory: directory,
            renameDirectoryName: directory.name
        });
    };

    openDeleteDialog = (directory) => {
        this.setState({
            showDeleteDialog: true,
            selectedDirectory: directory
        });
    };

    openSharesSheet = (directory) => {
        // If no shares exist, open create pane directly
        if (!directory.shares || directory.shares.length === 0) {
            this.setState({
                selectedDirectoryForShares: directory,
                showCreateSharePane: true,
                editingShare: null
            });
        } else {
            // Show shares list
            this.setState({
                showSharesSheet: true,
                selectedDirectoryForShares: directory
            });
        }
    };

    closeSharesSheet = () => {
        this.setState({
            showSharesSheet: false,
            selectedDirectoryForShares: null
        });
    };

    openCreateSharePane = () => {
        this.setState({ showCreateSharePane: true, editingShare: null });
    };

    closeCreateSharePane = async () => {
        this.setState({ 
            showCreateSharePane: false, 
            editingShare: null,
            showSharesSheet: false, // Close the shares sheet as well
            selectedDirectoryForShares: null
        });
        // Refresh the root directories to get updated shares
        await this.loadRootDirectories();
    };

    handleEditShare = (directoryName, share) => {
        // Open the share pane with the share to edit
        this.setState({ 
            showCreateSharePane: true,
            editingShare: { directoryName, share }
        });
    };

    handleDeleteShare = async (directoryName, targetUserUid) => {
        const deleteKey = `${directoryName}-${targetUserUid}`;
        
        this.setState(prevState => ({
            deletingShare: { ...prevState.deletingShare, [deleteKey]: true }
        }));

        try {
            const response = await fetch(`${this.context.davApiBaseUrl}/share`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    directoryName,
                    targetUserUid
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete share');
            }

            toaster.success('Share removed successfully');
            await this.loadRootDirectories();
            
            this.setState(prevState => ({
                deletingShare: { ...prevState.deletingShare, [deleteKey]: false },
                showSharesSheet: false, // Close the shares sheet
                selectedDirectoryForShares: null
            }));
        } catch (error) {
            console.error('Error deleting share:', error);
            toaster.danger(error.message || 'Failed to delete share');
            
            this.setState(prevState => ({
                deletingShare: { ...prevState.deletingShare, [deleteKey]: false }
            }));
        }
    };

    handleBack = () => {
        this.props.navigate('/explorer');
    };

    render() {
        const { 
            loading, 
            rootDirectories, 
            showCreateDialog, 
            showRenameDialog, 
            showDeleteDialog,
            selectedDirectory,
            newDirectoryName,
            renameDirectoryName,
            togglingPublic
        } = this.state;

        if (!this.context || !this.context.connectionValid) {
            console.log('Connection is not valid. returning to home.');
            return <Navigate to="/" />
        }

        return (
            <Pane display="flex" flexDirection="column" height="100vh" background="tint2">
                {/* Header */}
                <Pane 
                    padding={16} 
                    background="white" 
                    elevation={1}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    gap={16}
                >
                    <Pane display="flex" alignItems="center" gap={16}>
                        <IconButton 
                            icon={ArrowLeftIcon} 
                            onClick={this.handleBack}
                            appearance="minimal"
                            title="Back to explorer"
                        />
                        <Heading size={700}>Manage Root Directories</Heading>
                    </Pane>
                    <Button
                        is="div"
                        appearance="primary"
                        intent="info"
                        iconBefore={AddIcon}
                        onClick={this.openCreateDialog}
                    >
                        New Root Directory
                    </Button>
                </Pane>

                {/* Content */}
                <Pane 
                    flex={1} 
                    padding={24} 
                    overflowY="auto"
                >
                    {loading ? (
                        <Pane display="flex" alignItems="center" justifyContent="center" height={400}>
                            <Spinner />
                        </Pane>
                    ) : (
                        <Table>
                            <Table.Head>
                                <Table.TextHeaderCell>Directory Name</Table.TextHeaderCell>
                                <Table.TextHeaderCell>Total Size</Table.TextHeaderCell>
                                <Table.TextHeaderCell>Public</Table.TextHeaderCell>
                                <Table.TextHeaderCell>Shares</Table.TextHeaderCell>
                                <Table.TextHeaderCell>Actions</Table.TextHeaderCell>
                            </Table.Head>
                            <Table.Body>
                                {rootDirectories.map((dir, index) => (
                                    <Table.Row key={index}>
                                        <Table.TextCell>
                                            <strong>{dir.name}</strong>
                                        </Table.TextCell>
                                        <Table.TextCell>
                                            {formatSize(dir.size || 0)}
                                        </Table.TextCell>
                                        <Table.TextCell>
                                            {togglingPublic[dir.name] ? (
                                                <Spinner size={16} />
                                            ) : (
                                                <Switch
                                                    checked={dir.isPublic || false}
                                                    onChange={() => this.handleTogglePublic(dir)}
                                                    height={20}
                                                />
                                            )}
                                        </Table.TextCell>
                                        <Table.TextCell>
                                            {dir.shares ? dir.shares.length : 0}
                                        </Table.TextCell>
                                        <Table.TextCell>
                                            <Pane display="flex" gap={8}>
                                                <IconButton
                                                    is="div"
                                                    icon={ShareIcon}
                                                    intent="success"
                                                    onClick={() => this.openSharesSheet(dir)}
                                                    title="Manage shares"
                                                />
                                                <IconButton
                                                    is="div"
                                                    icon={EditIcon}
                                                    intent="none"
                                                    onClick={() => this.openRenameDialog(dir)}
                                                    title="Rename directory"
                                                />
                                                <IconButton
                                                    is="idv"
                                                    icon={TrashIcon}
                                                    intent="danger"
                                                    onClick={() => this.openDeleteDialog(dir)}
                                                    title="Delete directory"
                                                    disabled={rootDirectories.length === 1}
                                                />
                                            </Pane>
                                        </Table.TextCell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    )}
                </Pane>

                {/* Create Directory Dialog */}
                <Dialog
                    isShown={showCreateDialog}
                    title="Create New Root Directory"
                    onCloseComplete={() => this.setState({ showCreateDialog: false, newDirectoryName: '' })}
                    hasFooter={false}
                >
                    <TextInputField
                        label="Directory Name"
                        description="Enter a name for the new root directory. It will automatically start with '/' if not provided."
                        value={newDirectoryName}
                        onChange={(e) => this.setState({ newDirectoryName: e.target.value })}
                        placeholder="e.g., 'documents' or '/photos'"
                        required
                    />

                    <Pane width="100%" display="flex" justifyContent="right" marginTop={10}>
                        <Button is="div" marginLeft={0} marginRight={6} appearance="default" intent="none" onClick={() => this.setState({ showCreateDialog: false, newDirectoryName: '' })}>
                            Cancel
                        </Button>
                        <Button is="div" marginLeft={6} marginRight={0} appearance="primary" intent="info" onClick={this.handleCreateDirectory}>
                            Create
                        </Button>
                    </Pane>
                </Dialog>

                {/* Rename Directory Dialog */}
                <Dialog
                    isShown={showRenameDialog}
                    title={`Rename Directory: ${selectedDirectory?.name}`}
                    onCloseComplete={() => this.setState({ showRenameDialog: false, selectedDirectory: null, renameDirectoryName: '' })}
                    hasFooter={false}
                >
                    <TextInputField
                        label="New Directory Name"
                        value={renameDirectoryName}
                        onChange={(e) => this.setState({ renameDirectoryName: e.target.value })}
                        required
                    />

                    <Pane width="100%" display="flex" justifyContent="right" marginTop={10}>
                        <Button is="div" marginLeft={0} marginRight={6} appearance="default" intent="none" onClick={() => this.setState({ showRenameDialog: false, selectedDirectory: null, renameDirectoryName: '' })}>
                            Cancel
                        </Button>
                        <Button is="div" marginLeft={6} marginRight={0} appearance="primary" intent="info" onClick={this.handleRenameDirectory}>
                            Rename
                        </Button>
                    </Pane>
                </Dialog>

                {/* Delete Directory Dialog */}
                <Dialog
                    isShown={showDeleteDialog}
                    title="Confirm Delete"
                    intent="danger"
                    onCloseComplete={() => this.setState({ showDeleteDialog: false, selectedDirectory: null })}
                    hasFooter={false}
                >
                    <Pane>
                        <p>Are you sure you want to delete the directory <strong>{selectedDirectory?.name}</strong>?</p>
                        <p style={{ marginTop: '16px', padding: '12px', backgroundColor: '#FEF5F5', borderLeft: '4px solid #D14343', borderRadius: '4px' }}>
                            <strong style={{ color: '#D14343' }}>⚠️ Warning:</strong> This will permanently delete all files and subdirectories within this root directory. This action cannot be undone.
                        </p>
                    </Pane>

                    <Pane width="100%" display="flex" justifyContent="right" marginTop={10}>
                        <Button is="div" marginLeft={0} marginRight={6} appearance="default" intent="none" onClick={() => this.setState({ showDeleteDialog: false, selectedDirectory: null })}>
                            Cancel
                        </Button>
                        <Button is="div" marginLeft={6} marginRight={0} appearance="primary" intent="danger" onClick={this.handleDeleteDirectory}>
                            Confirm delete
                        </Button>
                    </Pane>
                </Dialog>

                {/* Shares Management Side Sheet */}
                <SideSheet
                    isShown={this.state.showSharesSheet}
                    onCloseComplete={this.closeSharesSheet}
                    position="bottom"
                    containerProps={{
                        display: 'flex',
                        flex: '1',
                        flexDirection: 'column',
                    }}
                >
                    <Pane padding={24}>
                        <Pane display="flex" justifyContent="space-between" alignItems="center" marginBottom={16}>
                            <Heading size={600}>
                                Manage Shares for {this.state.selectedDirectoryForShares?.name}
                            </Heading>
                            <Button
                                is="div"
                                appearance="primary"
                                intent="info"
                                iconBefore={AddIcon}
                                onClick={this.openCreateSharePane}
                            >
                                Create Share
                            </Button>
                        </Pane>
                        <DavSharesTable
                            shares={this.state.selectedDirectoryForShares?.shares || []}
                            directoryName={this.state.selectedDirectoryForShares?.name}
                            deletingShare={this.state.deletingShare}
                            onEditShare={this.handleEditShare}
                            onDeleteShare={this.handleDeleteShare}
                        />
                    </Pane>
                </SideSheet>

                {/* Create/Edit Share Side Sheet */}
                <SideSheet
                    isShown={this.state.showCreateSharePane}
                    onCloseComplete={this.closeCreateSharePane}
                    position="bottom"
                    containerProps={{
                        display: 'flex',
                        flex: '1',
                        flexDirection: 'column',
                    }}
                >
                    <DavSharePane
                        directories={this.state.selectedDirectoryForShares ? [this.state.selectedDirectoryForShares] : []}
                        editingShare={this.state.editingShare}
                        onSaveSuccess={this.closeCreateSharePane}
                        onClose={this.closeCreateSharePane}
                    />
                </SideSheet>
            </Pane>
        );
    }
}

// Wrapper to inject navigate from React Router
function DavRootDirManagementViewWrapper(props) {
    const navigate = useNavigate();
    return <DavRootDirManagementView {...props} navigate={navigate} />;
}

export default DavRootDirManagementViewWrapper;
