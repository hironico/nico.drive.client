import { Component } from 'react';
import {
    Pane,
    Heading,
    SelectField,
    TextInputField,
    Button,
    toaster
} from 'evergreen-ui';

import { DavConfigurationContext } from '../AppSettings';

class DavSharePane extends Component {
    static contextType = DavConfigurationContext;

    constructor(props) {
        super(props);
        this.state = {
            selectedDirectory: '',
            selectedUserUid: '',
            selectedUsername: '',
            selectedAccess: 'canRead',
            saving: false,
            users: [],
            loadingUsers: false
        };
    }

    componentDidMount() {
        this.initializeForm();
        this.loadUsers();
    }

    componentDidUpdate(prevProps) {
        // Reset form when editingShare changes
        if (this.props.editingShare !== prevProps.editingShare) {
            this.initializeForm();
        }
    }

    loadUsers = async () => {
        this.setState({ loadingUsers: true });

        try {
            const response = await fetch(`${this.context.davApiBaseUrl}/auth/status`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load users');
            }

            const data = await response.json();
            
            // For now, we'll need to get all users from the server
            // This is a placeholder - you may need a dedicated endpoint to list all users
            this.setState({ 
                users: [], // Will be populated when backend provides user list endpoint
                loadingUsers: false 
            });
        } catch (error) {
            console.error('Error loading users:', error);
            this.setState({ loadingUsers: false });
        }
    };

    initializeForm = () => {
        const { directories, editingShare } = this.props;
        
        this.setState({
            selectedDirectory: editingShare 
                ? editingShare.directoryName 
                : (directories.length > 0 ? directories[0].name : ''),
            selectedUserUid: editingShare ? editingShare.share.uid : '',
            selectedUsername: editingShare ? (editingShare.share.username || editingShare.share.uid) : '',
            selectedAccess: editingShare ? editingShare.share.access : 'canRead',
            saving: false
        });
    };

    handleUserSelect = (e) => {
        const selectedValue = e.target.value;
        // For now, since we're using UID in the value, just set both
        this.setState({ 
            selectedUsername: selectedValue,
            selectedUserUid: selectedValue 
        });
    };

    handleSave = async () => {
        const { selectedDirectory, selectedUsername, selectedAccess } = this.state;
        const { onSaveSuccess } = this.props;

        if (!selectedDirectory || !selectedUsername) {
            toaster.warning('Please select a directory and enter a username or email');
            return;
        }

        this.setState({ saving: true });

        try {
            const response = await fetch(`${this.context.davApiBaseUrl}/share`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    directoryName: selectedDirectory,
                    targetUsername: selectedUsername, // Send username instead of UID
                    access: selectedAccess
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save share');
            }

            toaster.success('Share saved successfully');
            this.setState({ saving: false });
            
            // Notify parent component of successful save
            if (onSaveSuccess) {
                onSaveSuccess();
            }
        } catch (error) {
            console.error('Error saving share:', error);
            toaster.danger(error.message || 'Failed to save share');
            this.setState({ saving: false });
        }
    };

    handleCancel = () => {
        const { onClose } = this.props;
        if (onClose) {
            onClose();
        }
    };

    render() {
        const { directories, editingShare } = this.props;
        const { selectedDirectory, selectedUsername, selectedAccess, saving } = this.state;

        return (
            <Pane padding={24} background="white" height="100%" overflowY="auto">
                <Heading size={600} marginBottom={24}>
                    {editingShare ? "Edit Share" : "Add Share"}
                </Heading>

                <Pane>
                    <SelectField
                        label="Directory"
                        value={selectedDirectory}
                        onChange={(e) => this.setState({ selectedDirectory: e.target.value })}
                        disabled={!!editingShare || saving}
                        marginBottom={16}
                    >
                        {directories.map((dir) => (
                            <option key={dir.name} value={dir.name}>
                                {dir.name}
                            </option>
                        ))}
                    </SelectField>

                    <TextInputField
                        label="Username or Email"
                        placeholder="Enter username or email to share with"
                        value={selectedUsername}
                        onChange={(e) => this.setState({ selectedUsername: e.target.value })}
                        disabled={!!editingShare || saving}
                        marginBottom={16}
                        description="Enter the username or email address of the user you want to share with"
                    />

                    <SelectField
                        label="Access Level"
                        value={selectedAccess}
                        onChange={(e) => this.setState({ selectedAccess: e.target.value })}
                        disabled={saving}
                        marginBottom={24}
                    >
                        <option value="canRead">Read Only</option>
                        <option value="canWrite">Read & Write</option>
                    </SelectField>

                    <Pane display="flex" justifyContent="flex-end" gap={12}>
                        <Button 
                            is="div"
                            onClick={this.handleCancel}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button 
                            is="div"
                            appearance="primary"
                            intent="info"
                            onClick={this.handleSave}
                            isLoading={saving}
                            disabled={saving}
                        >
                            Save
                        </Button>
                    </Pane>
                </Pane>
            </Pane>
        );
    }
}

export default DavSharePane;
