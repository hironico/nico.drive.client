import { Component } from 'react';
import { Navigate } from 'react-router';
import { Pane, TextInputField, Paragraph, Button } from 'evergreen-ui';
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
            errorMessage: '',
            davContext: 'dav',
            connectionSuccess: false
        }
    }

    componentDidUpdate = async () => {
        if (this.state.url === '') {
            this.buildUrl();
        }

        if (this.context.davClient !== null && this.context.connectionValid) {
            this.setState({
                connectionSuccess: true
            });
        }
    }

    buildUrl = () => {
        const protocol = 'localhost' === window.location.hostname ? 'http' : 'https';
        const port = 'localhost' === window.location.hostname ? '8080' : window.location.port;
        const newUrl = `${protocol}://${window.location.hostname}:${port}/${this.state.davContext}/${this.state.username}/`;
        this.setState({
            url: newUrl
        });
    }

    testConnection = async () => {
        try {
            console.info('Testing connection ...');
            const clientOptions = {
                authType: AuthType.Basic,
                username: this.state.username,
                password: this.state.password
            }

            const client = createClient(this.state.url, clientOptions);

            this.context.setDavClient(client, this.state.url);

        } catch (error) {
            console.error(`Could not connect to webdav: ${error}`);
            this.context.setDavClient(null, '',null);
            this.setState({
                errorMessage: 'Something went wrong while connecting. Check your credentiuals and try again.',
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
            isLoading: true,
            connectionSuccess: false            
        }, () => this.testConnection());
    }

    onTxtLoginChange = (evt) => {
        this.setState({ 
            username: evt.target.value 
        }, () => { 
            this.buildUrl() 
        });
    }

    renderDialog = () => {
        return <Pane display="grid" gridTemplateColumns="auto" margin={160} padding={20} elevation={1}>
                    <TextInputField id="txt-login" 
                                    disabled={this.state.isLoading}
                                    value={this.state.username} 
                                    onChange={this.onTxtLoginChange}
                                    placeholder="Login name..." 
                                    label="Login:"/>

                    <TextInputField id="txt-password" 
                                    disabled={this.state.isLoading}
                                    type="password" 
                                    value={this.state.password} 
                                    onChange={e => this.setState({ password: e.target.value })}
                                    placeholder="Password..." 
                                    label="Password:"/>

                    <TextInputField id="txt-url" 
                                    disabled={this.state.isLoading}
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
    }

    render = () => {
        // if we have a dav client properly configured then must go to the explorer;
        // to login again we éust log out first !
        return (this.state.connectionSuccess) ? <Navigate to='/explorer' /> : this.renderDialog();
    }
}