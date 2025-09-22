import { Component } from 'react';

import { Button, InfoSignIcon, LogInIcon } from 'evergreen-ui';
import { Navigate } from 'react-router-dom';

import { DavConfigurationContext } from '../AppSettings';

import './WelcomeView.css';

export default class WelcomeView extends Component {
    static contextType = DavConfigurationContext;
    
    constructor() {
        super();
        this.state = {
            goLogin: false,
            isCheckingAuth: true
        }
    }

    async componentDidMount() {
        // Check authentication status when component mounts
        try {
            await this.context.refreshUserInfo();
        } catch (error) {
            console.error('Error checking authentication:', error);
        } finally {
            this.setState({ isCheckingAuth: false });
        }
    }

    showLoginDialog = () => {
        this.setState({
            goLogin: true
        });
    }

    render = () => {

        if (this.state.goLogin === true) {
            window.location = "https://localhost:3443/auth/login";            
            return <></>
        }

        // Show loading while checking authentication
        if (this.state.isCheckingAuth) {
            return (
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100vh' 
                }}>
                    <div>Loading...</div>
                </div>
            );
        }

        // If user is authenticated, redirect to explorer
        if(this.context.connectionValid) {
            return <Navigate to="/explorer" replace />;
        }

        // Show welcome view for non-authenticated users

        return <header id="header">
				<div className="content">
					<h1><a href="/">Nico's Drive</a></h1>
					<p>The private online storage solution.<br />
					Backup your memories ... <strong>automatically!</strong><br />
                    Access your files anytime, anywhere, just like a shared drive,<br />
                    On any computer.</p>
					<ul className="actions">
                        <li><Button is="div" onClick={() => window.location.assign('https://github.com/hironico/nico.drive#readme')} appearance="default" height={60} padding={28} iconBefore={InfoSignIcon} fontSize={22}>Learn more</Button></li>
                        <li><Button is="div" onClick={() => this.showLoginDialog()} appearance="primary" intent="success" height={60} padding={28} iconBefore={LogInIcon} fontSize={22}>Login</Button></li>
					</ul>
				</div>
				<div className="image phone"><div className="inner"><img src="images/screen.jpg" alt="" /></div></div>
			</header>
    }
}
