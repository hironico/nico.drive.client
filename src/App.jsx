
import { React, Component } from 'react';

import appTheme from './AppTheme';
import {DavConfigurationProvider} from './AppSettings';

import { ThemeProvider } from 'evergreen-ui';
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route, Navigate } from 'react-router';

import DavExplorerView from './views/DavExplorerView';
import DavRootDirManagementView from './views/DavRootDirManagementView';
import UserManagementView from './views/UserManagementView';
import WelcomeView from './views/WelcomeView';
import withAuth from './components/withAuth';

// theming provided by this page: https://github.com/segmentio/evergreen/issues/542
// see also: https://evergreen.segment.com/introduction/theming


const welcomeView = <WelcomeView />
const AuthenticatedDavExplorerView = withAuth(DavExplorerView);
const davExplorerView = <AuthenticatedDavExplorerView />
const AuthenticatedDavRootDirManagementView = withAuth(DavRootDirManagementView);
const davRootDirManagementView = <AuthenticatedDavRootDirManagementView />
const AuthenticatedUserManagementView = withAuth(UserManagementView);
const userManagementView = <AuthenticatedUserManagementView />

class App extends Component {
  render = () => {
    return <ThemeProvider value={appTheme}>      
      <DavConfigurationProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={welcomeView} />
          <Route path="/explorer" element={davExplorerView} />
          <Route path="/rootdirs" element={davRootDirManagementView} />
          <Route path="/admin/users" element={userManagementView} />
          <Route path="*" element={welcomeView} />
        </Routes>
        </BrowserRouter>
        </DavConfigurationProvider>
    </ThemeProvider>
  }
}

export default App;
