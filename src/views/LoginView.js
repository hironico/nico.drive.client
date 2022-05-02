import { Component } from 'react';
import { Navigate } from 'react-router';
import { Pane, TextInputField, Paragraph, Button, Heading, Text, Alert, LogInIcon, Combobox, Label } from 'evergreen-ui';
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
        const url = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/`;

        this.state = {
            isLoading: false,
            username: '',
            password: '',
            url: url,
            userRootDirs: [],
            selectedRootDir: '',
            errorMessage: '',
            davContext: 'dav',
            connectionSuccess: false
        }
    }

    componentDidMount = () => { 
        this.setState({
            errorMessage: '', 
        });
    }

    componentDidUpdate = (prevProps, prevState) => {

        if (prevState.username !== this.state.username) {
            this.fetchUserRootDirectories();
        }

        if (prevState.url !== this.state.url) {
            this.fetchUserRootDirectories();
        }

        if (this.context.davClient !== null && this.context.connectionValid) {
            this.setState({
                connectionSuccess: true
            });
        }
    }

    fetchUserRootDirectories = () => {

        if ('' === this.state.username) {
            return;
        }

        // console.log(`Fetching user root directories for user: ${this.state.username}`);

        const fetchOptions = { 
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const fetchUrl = `${this.state.url}auth/whois/${this.state.username}`;
        // console.log(`Fetching from: ${fetchUrl}`);

        return fetch(fetchUrl, fetchOptions)
        .then(res => {            
            // console.log(`Received user root dirs : ${JSON.stringify(res)}`);
            return res.json()
        })
        .then(userInfo => {
            // console.log(`Found user info for: ${this.state.username}`);            
            this.setState({
                userRootDirs: userInfo.rootDirs,
                errorMessage: ''
            });
            return userInfo.rootDirs;
        })
        .catch(error => {
            console.log(`Error while fetching user's root directories: ${error}`)
            this.setState({
                userRootDirs: [],
                errorMessage: 'Error while fetching your directories: check your username or the server URL.'
            });
        })
    }

    testConnection = async () => {
        console.info('Testing connection ...');
        const clientOptions = {
            authType: AuthType.Basic,
            username: this.state.username,
            password: this.state.password
        }

        const clientUrl = `${this.state.url}${this.state.davContext}/${this.state.username}${this.state.selectedRootDir}`;

        const client = createClient(clientUrl, clientOptions);
        client.getDirectoryContents('/')
            .then(contents => {
                this.context.setDavClient(client, clientUrl, this.state.username);
            }).catch(error => {
                console.info(`Could not connect to webdav: ${error}`);
                this.context.setDavClient(null, '');
                this.setState({
                    errorMessage: 'Something went wrong while connecting. Check your credentials and try again.',
                    isLoading: false,
                    connectionSuccess: false
                });
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
        });
    }

    isLoginButtonDisabled = () => {
        return null === this.state.username || '' === this.state.username
                || null === this.state.password || '' === this.state.password
                || '' === this.state.selectedRootDir 
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

            <Label>Online drive to connect to:</Label>
            <Combobox
                items={this.state.userRootDirs}
                onChange={selected => this.setState({selectedRootDir: selected})}
                placeholder="Select one online drive..."
                marginBottom={20}
                label="Online drive to connect to:"
            />

            <TextInputField id="txt-url"
                disabled={this.state.isLoading}
                value={this.state.url}
                onChange={e => this.setState({ url: e.target.value })}
                placeholder="Server url..."
                label="Base server URL:"
                description="Advanced users only." />

            <Pane>
                {this.renderErrorMessage()}
                <Button is="div" marginTop={16} iconBefore={LogInIcon} appearance="primary" intent="success" onClick={() => this.onConfirm()} disabled={this.isLoginButtonDisabled()}>
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
        return (this.state.connectionSuccess) ? <Navigate to='/explorer' /> : this.renderLoginForm();
    }
}