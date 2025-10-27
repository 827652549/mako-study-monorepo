// https://reactjs.bootcss.com/docs/javascript-environment-requirements.html
import 'react-app-polyfill/ie9';
import 'react-app-polyfill/stable';
import 'raf/polyfill';

import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';

// import {getGuid} from '@ctrip/corp-cross-utils';

import App from './App';
// import * as serviceWorker from './serviceWorker';

// getGuid();

// if (process.env.NODE_ENV === 'development') {
//   window.DEV_USE_FAT_ENV = 11;
// }

// __webpack_public_path__ =
//   window.__ARES_MODULE_BASE__ === '%__ARES_MODULE_BASE__%' ? '/corp-flight-booking/' : window.__ARES_MODULE_BASE__;

// ReactDOM.render(<App />, document.getElementById('root'));
ReactDOM.render(<div>index.tsx</div>, document.getElementById('root'));

// if (process.env.NODE_ENV === 'production') {
//   console.log = function () {};
// }

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
