import { Routes, Route } from 'react-router-dom';
import Registro from './Registro';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
  return (
    <Routes>
      {/* El Dashboard ahora es la página de inicio PÚBLICA */}
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      
      {/* Rutas de Autenticación */}
      <Route path="/registro" element={<Registro />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;