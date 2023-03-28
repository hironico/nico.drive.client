import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import reportWebVitals from './reportWebVitals';

import './index.css';

// do not use React.strinct mode in 2023 ! This cause the components to be double mounted.
// https://stackoverflow.com/questions/49055172/react-component-mounting-twice

const container = document.getElementById('root');
const root = createRoot(container);
root.render(  
    <App />,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
