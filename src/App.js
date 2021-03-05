import logo from './logo.svg';
import './App.css';

import { Pane } from 'evergreen-ui';

import DavExplorerPane from './components/DavExplorerPane';
import { Component } from 'react';

class App extends Component {

  render() {
    return (
      <div className="App">
        <Pane clearfix>
          <Pane width="100%" elevation={1}>
            <DavExplorerPane /> 
          </Pane>
        </Pane>
      </div>
    );
  }
}

export default App;
