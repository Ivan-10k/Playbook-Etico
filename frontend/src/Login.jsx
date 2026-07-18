import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('https://playbook-backend-ge3g.onrender.com/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      alert("¡Login exitoso! Bienvenido al Playbook Ético.");
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-inter">
      <main className="grow flex items-center justify-center px-4 md:px-0 py-12 relative overflow-hidden">
        
        {/* Background Atmosphere */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary rounded-full blur-[120px]"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary rounded-full blur-[120px]"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Login Card */}
          <div className="bg-surface-container border border-outline-variant/30 rounded-xl p-8 md:p-10 card-shadow transition-all duration-300">
            
            {/* Brand Header */}
            <div className="text-center mb-8">
              <h1 className="font-manrope font-bold text-3xl md:text-4xl text-on-surface mb-2 tracking-tight">Playbook Ético</h1>
              <p className="text-base text-on-surface-variant">Iniciar Sesión</p>
            </div>

            {/* Alertas de Error */}
            {error && (
              <div className="mb-6 bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm font-medium text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
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
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-on-surface-variant" htmlFor="password">Contraseña</label>
                  <a href="#" className="text-xs text-secondary hover:underline font-medium">¿Olvidaste tu contraseña?</a>
                </div>
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

              {/* CTA Button */}
              <button 
                type="submit"
                className="w-full bg-primary-container hover:brightness-110 active:scale-[0.98] text-on-primary-container font-semibold text-lg py-3 mt-4 rounded-lg transition-all duration-200 shadow-lg shadow-primary-container/20 hover:-translate-y-0.5"
              >
                Entrar al Sistema
              </button>
            </form>
            
            <div className="mt-8 text-center text-sm text-on-surface-variant">
              ¿No tienes cuenta? <Link className="text-secondary font-semibold hover:underline" to="/registro">Regístrate aquí</Link>
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

export default Login;