import React, { useState, useEffect, useContext } from 'react';

import { Button, InfoSignIcon, LogInIcon } from 'evergreen-ui';
import { useNavigate } from 'react-router-dom';

import { DavConfigurationContext } from '../AppSettings';

import './WelcomeView.css';

const WelcomeView = () => {
    const [goLogin, setGoLogin] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const davContext = useContext(DavConfigurationContext);
    const navigate = useNavigate();

    useEffect(() => {
        // Check authentication status when component mounts
        const checkAuth = async () => {
            try {
                await davContext.refreshUserInfo();
            } catch (error) {
                console.error('Error checking authentication:', error);
            } finally {
                setIsCheckingAuth(false);
            }
        };

        checkAuth();
    }, []);

    const showLoginDialog = () => {
        alert('set show login to true!');
        setGoLogin(true);
    };

    const showExplorer = () => {
        navigate('/explorer');
    }

    if (goLogin === true) {
        window.location = "https://localhost:3443/auth/login";            
        return <></>
    }

    // Show loading while checking authentication
    if (isCheckingAuth) {
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

    // Show welcome view for both authenticated and non-authenticated users
    return (
        <header id="header">
            <div className="content">
                <h1><a href="/">Nico's Drive</a></h1>
                <p>The private online storage solution.<br />
                Backup your memories ... <strong>automatically!</strong><br />
                Access your files anytime, anywhere, just like a shared drive,<br />
                On any computer.</p>
                <ul className="actions">
                    <li><Button is="div" onClick={() => window.location.assign('https://github.com/hironico/nico.drive#readme')} appearance="default" height={60} padding={28} iconBefore={InfoSignIcon} fontSize={22}>Learn more</Button></li>
                    {davContext.connectionValid ? (
                        <li><Button is="div" onClick={(_evt) => showExplorer()} appearance="primary" intent="success" height={60} padding={28} fontSize={22}>Go to Explorer</Button></li>
                    ) : (
                        <li><Button is="div" onClick={(_evt) => showLoginDialog()} appearance="primary" intent="success" height={60} padding={28} iconBefore={LogInIcon} fontSize={22}>Login</Button></li>
                    )}
                </ul>
            </div>
            <div className="image phone"><div className="inner"><img src="images/screen.jpg" alt="" /></div></div>
        </header>
    );
};

export default WelcomeView;
