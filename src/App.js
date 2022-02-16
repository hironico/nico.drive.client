
import { React, Component } from 'react';
import { Pane } from 'evergreen-ui';

// import logo from './logo.svg';
import './App.css';

import WelcomePage from './components/welcome-page/WelcomePage';

class App extends Component {

  render = () => {
    return (      
        <div className="App" height="100%">
          <Pane clearfix width="100%" height="100%">
                <WelcomePage />
          </Pane>
        </div>      
    );
  }
}

export default App;
