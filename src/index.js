import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// theming provided by this page: https://github.com/segmentio/evergreen/issues/542
// see also: https://evergreen.segment.com/introduction/theming
import { ThemeProvider } from 'evergreen-ui';
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route, Navigate } from 'react-router';

import appTheme from './AppTheme';
import {DavConfigurationProvider} from './AppSettings';
import LoginDialog from './components/LoginDialog';
import DavExplorerPane from './components/DavExplorerPane';

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider value={appTheme}>      
    <DavConfigurationProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="login" element={<LoginDialog />} />
        <Route path="explorer" element={<DavExplorerPane />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      </BrowserRouter>
      </DavConfigurationProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
