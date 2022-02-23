
import { React, Component } from 'react';

import appTheme from './AppTheme';
import {DavConfigurationProvider} from './AppSettings';

import { ThemeProvider } from 'evergreen-ui';
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route, Navigate } from 'react-router';

import LoginView from './views/LoginView';
import DavExplorerView from './views/DavExplorerView';
import WelcomePage from './components/welcome-page/WelcomePage';

// theming provided by this page: https://github.com/segmentio/evergreen/issues/542
// see also: https://evergreen.segment.com/introduction/theming

class App extends Component {
  render = () => {
    return <ThemeProvider value={appTheme}>      
      <DavConfigurationProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="login" element={<LoginView />} />
          <Route path="explorer" element={<DavExplorerView />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        </BrowserRouter>
        </DavConfigurationProvider>
    </ThemeProvider>
  }
}

export default App;
