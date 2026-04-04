import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import RouterData from './Routes';
import { initGlobalEnterNavigation } from './utils/formUtils';

function App() {
  // Initialize global Enter key navigation for all forms
  useEffect(() => {
    const cleanup = initGlobalEnterNavigation();
    return cleanup;
  }, []);

  return (
    <>
      <RouterData />
      <ToastContainer />  
    </>
  );
}

export default App;
