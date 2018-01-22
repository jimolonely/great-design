import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import RouteApp from './RouteApp';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<RouteApp />, document.getElementById('root'));
registerServiceWorker();
