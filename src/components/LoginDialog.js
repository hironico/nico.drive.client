import { Component } from 'react';
import { Dialog, Pane, TextInputField, Text, Paragraph, Button } from 'evergreen-ui';
import { DavConfigurationContext } from '../AppSettings';

import { createClient, AuthType } from "webdav";

export default class LoginDialog extends Component {
    static contextType = DavConfigurationContext;
    
    constructor() {
        super();
        this.state = {
            isLoading: false,
            username: '',
            password: '',
            url: '',
            errorMessage: ''
        }
    }

    testConnection = async () => {
        try {

            const clientOptions = {
                authType: AuthType.Basic,
                username: this.state.username,
                password: this.state.password
            }

            const client = createClient(this.state.url, clientOptions);

            const directoryItems = await client.getDirectoryContents('./');

            this.context.setDavClient(client, this.state.url);

            // reset form in order not to have credentials after clicking logout
            this.setState({
                url: '',
                username: '',
                password: '',
                errorMessage: ''
            });

        } catch (error) {
            console.error('Could not connect to webdav: ' + JSON.stringify(error));
            this.context.setDavClient(null);
            this.context.setConnectionValid(false);
            this.setState({
                errorMessage: JSON.stringify(error)
            });
        } finally {
            this.setState({
                isLoading: false
            });
        }
    }

    componentDidMount = () => {
        this.setState({
            username: this.context.username,
            password: this.context.password,
            url: this.context.getClientUrl() + this.context.homeDirectory,
            errorMessage: ''
        });
    }

    onConfirm = () => {
        this.setState({ 
            isLoading: true            
        }, () => this.testConnection());
    }

    onCloseComplete = () => {
        this.context.setShowConnectionDialog(false);
        this.setState({ isLoading: false, errorMessage: '' });
    }

    renderDialog = () => {
        return <Dialog
            isShown={this.context.showConnectionDialog}
            title="WebDAV Connection setup..."
            onCloseComplete={() => this.onCloseComplete()}
            isConfirmLoading={this.state.isLoading}
            onConfirm={(close) => this.onConfirm(close)}           
            hasFooter={false}
        >
            <Pane display="grid" gridTemplateColumns="auto">
                    <TextInputField id="txt-login" 
                                    value={this.state.username} 
                                    onChange={e => this.setState({ username: e.target.value })}
                                    placeholder="Login name..." 
                                    label="Login:"/>

                    <TextInputField id="txt-password" 
                                    type="password" 
                                    value={this.state.password} 
                                    onChange={e => this.setState({ password: e.target.value })}
                                    placeholder="Password..." 
                                    label="Password:"/>

                    <TextInputField id="txt-url" 
                                    value={this.state.url} 
                                    onChange={e => this.setState({ url: e.target.value })}
                                    placeholder="WebDAV URL..."
                                    label="WebDAV base URL:"/>
                    <Pane>
                        <Paragraph>{this.state.errorMessage}</Paragraph>
                        <Button is="div" marginTop={16} onClick={() => this.onConfirm()} disabled={this.state.isLoading} appearance="primary" intent="success">
                        {this.state.isLoading ? 'Please wait...' : 'Connect'}
                        </Button>
                    </Pane>
            </Pane>          
        </Dialog>
    }

    render = () => {
        return this.renderDialog();
    }
}