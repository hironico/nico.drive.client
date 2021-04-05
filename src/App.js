
import { React, Component } from 'react';
import { Pane } from 'evergreen-ui';

import logo from './logo.svg';
import './App.css';

import {DavConfigurationProvider} from './AppSettings';

import DavExplorerPane from './components/DavExplorerPane';
import LoginDialog from './components/LoginDialog';

class App extends Component {

  render = () => {
    return (      
        <div className="App">
          <Pane clearfix>
            <Pane width="100%" elevation={1}>
              <DavConfigurationProvider>
                <LoginDialog />
                <DavExplorerPane />
              </DavConfigurationProvider>
            </Pane>
          </Pane>
        </div>      
    );
  }
}

export default App;
