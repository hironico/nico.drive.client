import { Component } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { Pane, Heading, Table, Button, Dialog, TextInputField, toaster, Badge, Spinner, IconButton, ArrowLeftIcon, Switch, Label } from 'evergreen-ui';
import { DavConfigurationContext } from '../AppSettings';

class UserManagementView extends Component {
    static contextType = DavConfigurationContext;

    constructor(props) {
        super(props);
        this.state = {
            users: [],
            loading: true,
            isEditDialogShown: false,
            isDeleteDialogShown: false,
            selectedUser: null,
            formData: {
                username: '',
                password: '',
                quota: 5,
                isAdministrator: false
            }
        };
    }

    componentDidMount = () => {
        this.loadUsers();
    }

    loadUsers = async () => {
        this.setState({ loading: true });
        
        try {
            const response = await fetch(`${this.context.davApiBaseUrl}/users`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const users = await response.json();
            this.setState({ users, loading: false });
        } catch (error) {
            console.error('Error loading users:', error);
            toaster.danger('Failed to load users');
            this.setState({ loading: false });
        }
    }


    handleUpdateUser = async () => {
        const { selectedUser, formData } = this.state;

        try {
            const updateData = {};
            if (formData.password) updateData.password = formData.password;
            if (formData.quota !== undefined) updateData.quota = formData.quota;
            if (formData.isAdministrator !== undefined) updateData.isAdministrator = formData.isAdministrator;

            const response = await fetch(`${this.context.davApiBaseUrl}/users/${selectedUser.username}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update user');
            }

            toaster.success(`User ${selectedUser.username} updated successfully`);
            this.setState({ isEditDialogShown: false, selectedUser: null });
            this.loadUsers();
        } catch (error) {
            console.error('Error updating user:', error);
            toaster.danger(error.message || 'Failed to update user');
        }
    }

    handleDeleteUser = async () => {
        const { selectedUser } = this.state;

        try {
            const response = await fetch(`${this.context.davApiBaseUrl}/users/${selectedUser.username}?deleteFiles=false`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete user');
            }

            toaster.success(`User ${selectedUser.username} deleted successfully`);
            this.setState({ isDeleteDialogShown: false, selectedUser: null });
            this.loadUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            toaster.danger(error.message || 'Failed to delete user');
        }
    }

    openEditDialog = (user) => {
        this.setState({
            isEditDialogShown: true,
            selectedUser: user,
            formData: {
                username: user.username,
                password: '',
                quota: user.quota,
                isAdministrator: user.isAdministrator
            }
        });
    }

    openDeleteDialog = (user) => {
        this.setState({
            isDeleteDialogShown: true,
            selectedUser: user
        });
    }

    updateFormData = (field, value) => {
        this.setState(prev => ({
            formData: {
                ...prev.formData,
                [field]: value
            }
        }));
    }

    handleBack = () => {
        this.props.navigate('/explorer');
    };

    render = () => {
        const { users, loading, isEditDialogShown, isDeleteDialogShown, selectedUser, formData } = this.state;

        if (!this.context || !this.context.connectionValid) {
            console.log('Connection is not valid. returning to home.');
            return <Navigate to="/" />
        }

        if (!this.context.isAdministrator) {
            return (
                <Pane display="flex" alignItems="center" justifyContent="center" height="100vh">
                    <Heading size={600}>Access Denied: Administrator privileges required</Heading>
                </Pane>
            );
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
                    gap={16}
                >
                    <IconButton 
                        icon={ArrowLeftIcon} 
                        onClick={this.handleBack}
                        appearance="minimal"
                        title="Back to explorer"
                    />
                    <Heading size={700}>Manage Users</Heading>
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
                                <Table.TextHeaderCell>Username</Table.TextHeaderCell>
                                <Table.TextHeaderCell>Quota (GB)</Table.TextHeaderCell>
                                <Table.TextHeaderCell>Used (GB)</Table.TextHeaderCell>
                                <Table.TextHeaderCell>Administrator</Table.TextHeaderCell>
                                <Table.TextHeaderCell>Root Directories</Table.TextHeaderCell>
                                <Table.TextHeaderCell>Actions</Table.TextHeaderCell>
                            </Table.Head>
                            <Table.Body>
                                {users.map(user => (
                                    <Table.Row key={user.uid}>
                                        <Table.TextCell>{user.username}</Table.TextCell>
                                        <Table.TextCell>
                                            {user.quota === -1 ? 'Unlimited' : user.quota}
                                        </Table.TextCell>
                                        <Table.TextCell>
                                            {user.quotaUsed ? user.quotaUsed.toFixed(2) : '0.00'}
                                        </Table.TextCell>
                                        <Table.TextCell>
                                            {user.isAdministrator ? (
                                                <Badge color="purple">Admin</Badge>
                                            ) : (
                                                <Badge color="neutral">User</Badge>
                                            )}
                                        </Table.TextCell>
                                        <Table.TextCell>{user.rootDirectories.length}</Table.TextCell>
                                        <Table.TextCell>
                                            <Button marginRight={8} onClick={() => this.openEditDialog(user)}>
                                                Edit
                                            </Button>
                                            <Button
                                                intent="danger"
                                                onClick={() => this.openDeleteDialog(user)}
                                                disabled={user.isDefaultUser || user.username === this.context.username}
                                            >
                                                Delete
                                            </Button>
                                        </Table.TextCell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    )}
                </Pane>

                {/* Edit User Dialog */}
                <Dialog
                    isShown={isEditDialogShown}
                    title={`Edit User: ${selectedUser?.username}`}
                    onCloseComplete={() => this.setState({ isEditDialogShown: false, selectedUser: null })}
                    confirmLabel="Update"
                    onConfirm={this.handleUpdateUser}
                >
                    <TextInputField
                        label="New Password (leave empty to keep current)"
                        type="password"
                        value={formData.password}
                        onChange={(e) => this.updateFormData('password', e.target.value)}
                    />
                    <TextInputField
                        label="Quota (GB)"
                        type="number"
                        value={formData.quota}
                        onChange={(e) => this.updateFormData('quota', parseFloat(e.target.value))}
                        required
                    />
                    <Pane marginTop={16}>
                        <Label htmlFor="admin-switch" marginBottom={8} display="block">
                            Administrator Privileges
                        </Label>
                        <Switch
                            id="admin-switch"
                            checked={formData.isAdministrator}
                            onChange={(e) => this.updateFormData('isAdministrator', e.target.checked)}
                            height={24}
                        />
                    </Pane>
                </Dialog>

                {/* Delete User Dialog */}
                <Dialog
                    isShown={isDeleteDialogShown}
                    title="Confirm Delete"
                    intent="danger"
                    onCloseComplete={() => this.setState({ isDeleteDialogShown: false, selectedUser: null })}
                    confirmLabel="Delete"
                    onConfirm={this.handleDeleteUser}
                >
                    <p>Are you sure you want to delete user <strong>{selectedUser?.username}</strong>?</p>
                    <p>This action cannot be undone. User files will be preserved but the user will no longer be able to access them.</p>
                </Dialog>
            </Pane>
        );
    }
}

// Wrapper to inject navigate from React Router
function UserManagementViewWrapper(props) {
    const navigate = useNavigate();
    return <UserManagementView {...props} navigate={navigate} />;
}

export default UserManagementViewWrapper;
