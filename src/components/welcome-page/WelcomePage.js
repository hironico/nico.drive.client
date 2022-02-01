import { Component } from 'react';

import { Button, InfoSignIcon, LogInIcon } from 'evergreen-ui';

import { DavConfigurationContext } from '../../AppSettings';

import './WelcomePage.css';

export default class WelcomePage extends Component {
    static contextType = DavConfigurationContext;

    showLoginDialog = () => {
        this.context.setShowConnectionDialog(true);
    }

    render = () => {
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