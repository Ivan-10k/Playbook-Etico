import { Link } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

// CORRECCIÓN: Cambiamos "function App()" por "function Registro()"
function Registro() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados para manejar las respuestas del servidor
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleRegistro = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    try {
      // Petición HTTP al backend que creamos
      const respuesta = await axios.post('http://localhost:3000/api/auth/registro', {
        email: email,
        password: password
      });
      
      // Si todo sale bien, mostramos éxito y limpiamos el formulario
      setMensaje(respuesta.data.mensaje);
      setEmail('');
      setPassword('');
      setTerms(false);
    } catch (err) {
      // Si el servidor rechaza la petición (ej. correo duplicado)
      setError(err.response?.data?.error || 'Error al conectar con el servidor.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-inter">
      <main className="flex-grow flex items-center justify-center px-4 md:px-0 py-12 relative overflow-hidden">
        
        {/* Background Atmosphere */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary rounded-full blur-[120px]"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary rounded-full blur-[120px]"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Registration Card */}
          <div className="bg-surface-container border border-outline-variant/30 rounded-xl p-8 md:p-10 card-shadow transition-all duration-300">
            
            {/* Brand Header */}
            <div className="text-center mb-8">
              <h1 className="font-manrope font-bold text-3xl md:text-4xl text-on-surface mb-2 tracking-tight">Playbook Ético</h1>
              <p className="text-base text-on-surface-variant">Registro de Nuevos Usuarios</p>
            </div>

            {/* Alertas de Éxito o Error */}
            {error && (
              <div className="mb-6 bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm font-medium text-center">
                {error}
              </div>
            )}
            {mensaje && (
              <div className="mb-6 bg-green-900/30 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg text-sm font-medium text-center">
                {mensaje}
              </div>
            )}

            <form onSubmit={handleRegistro} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface-variant" htmlFor="email">Correo Electrónico</label>
                <div className="relative">
                  <input 
                    className="w-full bg-surface-container-high border border-outline-variant rounded-lg px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all duration-200" 
                    id="email" 
                    type="email"
                    required
                    placeholder="usuario@ejemplo.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">mail</span>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface-variant" htmlFor="password">Contraseña</label>
                <div className="relative">
                  <input 
                    className="w-full bg-surface-container-high border border-outline-variant rounded-lg px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all duration-200" 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span 
                    className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline text-[20px] cursor-pointer hover:text-on-surface transition-colors select-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3 group cursor-pointer pt-2">
                <div className="relative flex items-center pt-1">
                  <input 
                    className="w-5 h-5 rounded border-outline-variant bg-surface-container-high text-primary-container focus:ring-offset-background focus:ring-primary-container transition-all cursor-pointer" 
                    id="terms" 
                    type="checkbox"
                    required
                    checked={terms}
                    onChange={(e) => setTerms(e.target.checked)}
                  />
                </div>
                <label className="text-base text-on-surface-variant cursor-pointer group-hover:text-on-surface transition-colors" htmlFor="terms">
                  Acepto los <a className="text-secondary font-medium hover:underline" href="#">Términos y Condiciones</a>
                </label>
              </div>

              {/* CTA Button */}
              <button 
                type="submit"
                className="w-full bg-primary-container hover:brightness-110 active:scale-[0.98] text-on-primary-container font-semibold text-lg py-3 mt-4 rounded-lg transition-all duration-200 shadow-lg shadow-primary-container/20 hover:-translate-y-0.5"
              >
                Crear Cuenta
              </button>
            </form>
            
            <div className="mt-8 text-center text-sm text-on-surface-variant">
              ¿Ya tienes cuenta? <Link className="text-secondary font-semibold hover:underline" to="/login">Inicia sesión aquí</Link>
            </div>
            
            {/* Footer Support */}
            <div className="mt-10 pt-6 border-t border-outline-variant/20 text-center space-y-2">
              <p className="text-base text-on-surface-variant">¿Buscas la documentación técnica?</p>
              <a className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:underline transition-all" href="https://github.com/Ivan-10k/ethical-playbook" target="_blank" rel="noreferrer">
                <span className="material-symbols-outlined text-[18px]">terminal</span>
                Ver repositorio en GitHub
              </a>
            </div>
          </div>

          {/* Additional Decorative Element */}
          <div className="mt-8 text-center">
            <p className="text-xs font-medium text-outline">
              Construido con integridad por stack innovators.
            </p>
          </div>
        </div>
      </main>

      {/* Shared Footer Component */}
      <footer className="bg-background border-t border-outline-variant/20">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 py-4 w-full max-w-6xl mx-auto">
          <div className="text-sm font-bold text-primary mb-2 md:mb-0">
            Playbook Ético
          </div>
          <div className="text-sm text-secondary text-center md:text-left mb-2 md:mb-0">
            © 2026 Playbook Ético. Todos los derechos reservados.
          </div>
          <div className="flex gap-4">
            <a className="text-xs font-medium text-on-surface-variant hover:text-primary-container transition-colors" href="#">Términos</a>
            <a className="text-xs font-medium text-on-surface-variant hover:text-primary-container transition-colors" href="#">Privacidad</a>
            <a className="text-xs font-medium text-on-surface-variant hover:text-primary-container transition-colors" href="https://github.com/Ivan-10k/ethical-playbook" target="_blank" rel="noreferrer">GitHub</a>
            <a className="text-xs font-medium text-on-surface-variant hover:text-primary-container transition-colors" href="#">Documentación</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Registro;