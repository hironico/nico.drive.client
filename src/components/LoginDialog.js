import { Component } from 'react';
import { Dialog, Pane, Label, TextInputField, FormField, ConsoleIcon } from 'evergreen-ui';
import { DavConfigurationProvider, DavConfigurationContext } from '../AppSettings';

import { WebDAVClient, createClient, AuthType } from "webdav";

export default class LoginDialog extends Component {
    static contextType = DavConfigurationContext;
    
    constructor() {
        super();
        this.state = {
            isLoading: false,
            username: '',
            password: '',
            url: ''
        }
    }

    testConnection = async () => {
        try {

            console.log('Now testing connection...');

            const clientOptions = {
                authType: AuthType.Basic,
                username: this.state.username,
                password: this.state.password
            }

            const client = createClient(this.state.url, clientOptions);

            const directoryItems = await client.getDirectoryContents('./');

            console.log('Sucess !');

            this.context.setDavClient(client);
            this.context.setConnectionValid(true);            

        } catch (error) {
            console.error('Could not connect to webdav: ' + JSON.stringify(error));
            this.context.setDavClient(null);
            this.context.setConnectionValid(false);
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
            url: this.context.getClientUrl() + this.context.homeDirectory
        });
    }

    onConfirm = () => {
        this.setState({ 
            isLoading: true            
        }, () => this.testConnection());
    }

    renderDialog = () => {
        return <Dialog
            isShown={!this.context.connectionValid}
            title="WebDAV Connection setup..."
            onCloseComplete={() => this.setState({ isShown: false, isLoading: false })}
            isConfirmLoading={this.state.isLoading}
            onConfirm={() => this.onConfirm()}
            confirmLabel={this.state.isLoading ? 'Connecting...' : 'Connect'}
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
            </Pane>            
        </Dialog>
    }

    render = () => {
        return this.renderDialog();
    }
}