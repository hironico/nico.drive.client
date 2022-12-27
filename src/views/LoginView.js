import { Component } from 'react';
import { Navigate } from 'react-router';
import { Pane, TextInputField, Paragraph, Button, Heading, Text, Alert, LogInIcon } from 'evergreen-ui';
import { DavConfigurationContext } from '../AppSettings';

import { createClient, AuthType } from "webdav";

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
                this.context.setUserInfo(userInfo);
                this.context.setUserRootDirectories(userDirectories);
                this.context.setDavBaseUrl(davBaseUrl, this.state.username);
                this.context.setConnectionValid(true);
            });
        })
        .catch(error => {
            console.log(`Error while fetching user's root directories: ${error}`)
            this.setState({
                errorMessage: 'Error while fetching your directories: check your username or the server URL.'
            });
        })
    }

    onConfirm = () => {
        this.setState({
            isLoading: true,
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
                || '' !== this.state.errorMessage 
                || '' === this.state.url
                || this.state.isLoading;
    }

    renderErrorMessage = () => {
        return (this.state.errorMessage !== '') ? <Alert intent="danger">{this.state.errorMessage}</Alert> : <></>;
    }

    renderLoginForm = () => {
        return <Pane display="grid" gridTemplateColumns="auto" margin={160} padding={20} elevation={1}>
            <Pane marginTop={-20} marginLeft={-20} marginRight={-20} marginBottom={40} padding={10} background="tint2" elevation={1}>
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

            <Pane>
                {this.renderErrorMessage()}
                <Button is="div" marginTop={16} iconBefore={LogInIcon} appearance="primary" intent="success" onClick={() => this.onConfirm()} disabled={this.isLoginButtonDisabled()} isLoading={this.state.isLoading}>
                    {this.state.isLoading ? 'Please wait...' : 'Connect'}
                </Button>
                <Paragraph textAlign="right">
                    <Text>Not a member ? Just kindly ask... :)</Text>
                </Paragraph>
            </Pane>
            </form>
        </Pane>
    }

    render = () => {
        // if we have a dav client properly configured then must go to the explorer;
        // to login again we must log out first !
        return (this.context.connectionValid) ? <Navigate to='/explorer' /> : this.renderLoginForm();
    }
}