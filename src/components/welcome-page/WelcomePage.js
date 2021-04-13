import { Component } from 'react';

import { Button, InfoSignIcon, LogInIcon } from 'evergreen-ui';

import { DavConfigurationContext } from '../../AppSettings';

import './WelcomePage.css';

export default class WelcomePage extends Component {
    static contextType = DavConfigurationContext;
    constructor() {
        super();
    }

    showLoginDialog = () => {
        this.context.setShowConnectionDialog(true);
    }

    render = () => {
        return <header id="header">
				<div className="content">
					<h1><a href="#">Nico's Drive</a></h1>
					<p>Personal storage solution<br />
					Keep your private memories ... <strong>private!</strong></p>
					<ul className="actions">
                        <li><Button is="div" onClick={() => alert('Coming soon...')} appearance="default" height={60} padding={28} iconBefore={InfoSignIcon} fontSize={22}>Learn more</Button></li>
                        <li><Button is="div" onClick={() => this.showLoginDialog()} appearance="primary" intent="success" height={60} padding={28} iconBefore={LogInIcon} fontSize={22}>Login</Button></li>
					</ul>
				</div>
				<div className="image phone"><div className="inner"><img src="images/screen.jpg" alt="" /></div></div>
			</header>
    }
}