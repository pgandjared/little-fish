import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
// Ant design style import (v5 doesnt need css import usually, but for safe measure)
// import 'antd/dist/reset.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode> 取消严苛模式避免ws触发两次
    <App />
  // </React.StrictMode>,
)
