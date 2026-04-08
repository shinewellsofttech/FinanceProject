import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import RouterData from './Routes';
import { initGlobalEnterNavigation } from './utils/formUtils';
import { loadPermissionsFromStorage } from './helpers/permissionsHelper';

function App() {
  // Initialize global Enter key navigation for all forms
  useEffect(() => {
    const cleanup = initGlobalEnterNavigation();
    return cleanup;
  }, []);

  // Load user permissions from localStorage on app start (for page refresh)
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("login");
    if (isLoggedIn) {
      console.log("App: Loading permissions from storage...");
      loadPermissionsFromStorage();
    }
  }, []);

  return (
    <>
      <RouterData />
      <ToastContainer />  
    </>
  );
}

export default App;
