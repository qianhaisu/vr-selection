import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
// import 'antd/dist/reset.css'; // Ant Design 5 doesn't need this, and it might cause loading issues if not found

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
