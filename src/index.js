import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// theming provided by this page: https://github.com/segmentio/evergreen/issues/542
// see also: https://evergreen.segment.com/introduction/theming
import { ThemeProvider } from 'evergreen-ui';
import appTheme from './AppTheme';

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider value={appTheme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
