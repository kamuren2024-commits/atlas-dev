import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import AtlasErrorBoundary from './components/shell/AtlasErrorBoundary';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Atlas root element is missing from index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <AtlasErrorBoundary>
      <App />
    </AtlasErrorBoundary>
  </StrictMode>,
);
