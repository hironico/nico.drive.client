
import { React, Component } from 'react';

import appTheme from './AppTheme';
import {DavConfigurationProvider} from './AppSettings';

import { ThemeProvider } from 'evergreen-ui';
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route, Navigate } from 'react-router';

import DavExplorerView from './views/DavExplorerView';
import WelcomeView from './views/WelcomeView';
import withAuth from './components/withAuth';

// theming provided by this page: https://github.com/segmentio/evergreen/issues/542
// see also: https://evergreen.segment.com/introduction/theming


const welcomeView = <WelcomeView />
const AuthenticatedDavExplorerView = withAuth(DavExplorerView);
const davExplorerView = <AuthenticatedDavExplorerView />

class App extends Component {
  render = () => {
    return <ThemeProvider value={appTheme}>      
      <DavConfigurationProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={welcomeView} />
          <Route path="/explorer" element={davExplorerView} />
          <Route path="*" element={welcomeView} />
        </Routes>
        </BrowserRouter>
        </DavConfigurationProvider>
    </ThemeProvider>
  }
}

export default App;
