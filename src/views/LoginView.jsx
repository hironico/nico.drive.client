import { Component } from 'react';
import { Navigate } from 'react-router';
import { Buffer } from 'buffer';
import { Pane, TextInputField, Paragraph, Button, Heading, Text, LogInIcon, toaster } from 'evergreen-ui';
import { DavConfigurationContext } from '../AppSettings';

import { createClient, AuthType } from "webdav";

import './LoginView.css';

/**
 * The login view displays the credentials input controls and authenticate the user against 
 * the server credentials.
 */
export default class LoginView extends Component {
    static contextType = DavConfigurationContext;

    constructor() {
        super();
        let url = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/`;

        if (url === 'http://localhost:3000/') {
            url = 'http://localhost:8080/';
        }

        this.state = {
            isLoading: false,
            username: '',
            password: '',
            url: url,
            errorMessage: '',
            davContext: 'dav'
        }
    }

    componentDidMount = () => {
        this.setState({
            errorMessage: ''
        });
    }


    fetchUserRootDirectories = () => {

        if ('' === this.state.username) {
            return;
        }

        // console.log(`Fetching user root directories for user: ${this.state.username}`);
        const buf = Buffer.from(`${this.state.username}:${this.state.password}`, 'UTF8');
        const authCreds = buf.toString('base64');
        const authHeader = `Basic ${authCreds}`;

        const fetchOptions = { 
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
            }
        };

        const fetchUrl = `${this.state.url}auth/whois/${this.state.username}`;
        // console.log(`Fetching from: ${fetchUrl}`);

        fetch(fetchUrl, fetchOptions)
        .then(res => {            
            // console.log(`Received user root dirs : ${JSON.stringify(res)}`);
            return res.json()
        })
        .then(userInfo => {
            // console.log(`Found user info for: ${this.state.username}`);

            // now configuring app context to store user root dirs list and configure a client for each of them
            
            const clientOptions = {
                authType: AuthType.Basic,
                username: this.state.username,
                password: this.state.password
            }

            const davBaseUrl = `${this.state.url}${this.state.davContext}`;

            const userDirectories = userInfo.rootDirs.map(dir => {
                const clientUrl = `${davBaseUrl}/${this.state.username}${dir}`;
                const davClient = createClient(clientUrl, clientOptions);
                const userDirectory = {
                    name: dir,
                    url: clientUrl,
                    davClient: davClient
                }
                return userDirectory;
            });

            this.setState({
                errorMessage: '',
                isLoading: false
            }, () => {
                this.context.setUserConnection(userInfo, userDirectories, davBaseUrl, this.state.username, true);
            });
        })
        .catch(error => {
            console.log(`Login error: cannot fetch user's root directories: ${error}`)
            this.setState({
                errorMessage: 'Incorrect login / password.',
                isLoading: false,
                password: ''
            }, () => toaster.danger(this.state.errorMessage));
        })
    }

    onConfirm = () => {
        this.setState({
            isLoading: true,
            errorMessage: ''
        }, () => this.fetchUserRootDirectories());
    }

    onTxtLoginChange = (evt) => {
        this.setState({
            username: evt.target.value
        });
    }

    isLoginButtonDisabled = () => {
        return null === this.state.username || '' === this.state.username
                || null === this.state.password || '' === this.state.password
                || '' === this.state.url
                || this.state.isLoading;
    }

    renderLoginForm = () => {
        return <Pane className='loginviewpane' elevation={1}>
            <Pane marginBottom={20} padding={10} background="tint2" elevation={1}>
                <Heading is="h2" textAlign="center" textShadow="initial">Welcome to Nico's Drive</Heading>
            </Pane>

            <form>
                <TextInputField id="txt-login"
                    disabled={this.state.isLoading}
                    value={this.state.username}
                    onChange={this.onTxtLoginChange}
                    placeholder="Login name..."
                    label="Login:"
                    autoComplete='username' />

                <TextInputField id="txt-password"
                    disabled={this.state.isLoading}
                    type="password"
                    value={this.state.password}
                    onChange={e => this.setState({ password: e.target.value })}
                    placeholder="Password..."
                    label="Password:"
                    autoComplete='current-password' />

                <TextInputField id="txt-url"
                    disabled={this.state.isLoading}
                    value={this.state.url}
                    onChange={e => this.setState({ url: e.target.value })}
                    placeholder="Server url..."
                    label="Base server URL:"
                    description="Advanced users only." />

                <Pane display="grid" gridTemplateColumns="auto 1fr" gridTemplateRows="auto 1fr" marginTop={-5}>                    
                    <Button  alignSelf="center" is="div" iconBefore={LogInIcon} appearance="primary" intent="success" onClick={() => this.onConfirm()} disabled={this.isLoginButtonDisabled()} isLoading={this.state.isLoading}>
                        {this.state.isLoading ? 'Please wait...' : 'Connect'}
                    </Button>
                    <Paragraph textAlign="right" alignSelf="end" justifySelf="end">
                        <Text>Not a member ? Just kindly ask... :)</Text>
                    </Paragraph>
                </Pane>
            </form>
        </Pane>
    }

    render = () => {
        // if we have a dav client properly configured then must go to the explorer;
        // to login again we must log out first !
        // console.log('Render login view.');
        return this.context.connectionValid ? <Navigate to="/explorer" /> : this.renderLoginForm();
    }
}