import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter } from 'react-router-dom';
import store from './redux/store';
import { Provider } from 'react-redux';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <AuthProvider>
      <Provider store={store}>
        <App />
      </Provider>
      </AuthProvider>
  </BrowserRouter>
);

