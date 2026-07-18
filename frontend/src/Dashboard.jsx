import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  
  // ESTADOS DE LA APLICACIÓN
  const [pingMs, setPingMs] = useState(24);
  const [activeView, setActiveView] = useState('dashboard');
  const [userData, setUserData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [progresoFundamentos, setProgresoFundamentos] = useState(25);
  // VERIFICACIÓN DE SEGURIDAD
  const isAuthenticated = !!localStorage.getItem('token');

  // NAVEGACIÓN INTERNA Y SEGURIDAD
  const handleNavigation = (view) => {
    // Si no está autenticado y trata de salir del dashboard, lo mandamos a registrarse
    if (!isAuthenticated && view !== 'dashboard') {
      navigate('/registro');
      return;
    }
    setActiveView(view);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setActiveView('dashboard');
    navigate('/');
  };

  const handleCompletarModulo = async () => {
    const token = localStorage.getItem('token');
    try {
      // Enviamos la petición PUT al backend para impactar PostgreSQL
      await axios.post('http://localhost:3000/api/auth/completar-modulo', {
        identificadorModulo: 'fundamentos'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Actualizamos la interfaz instantáneamente
      setProgresoFundamentos(100);
      setActiveView('dashboard'); 
    } catch (error) {
      console.error("Error al guardar el progreso:", error);
    }
  };

  // ==========================================
  // FLUJO DE DATOS (BACKEND ↔ FRONTEND)
  // ==========================================
  useEffect(() => {
    const fetchAndInitData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const config = { headers: { Authorization: `Bearer ${token}` } };

          // 1. Obtener el perfil del Ingeniero
          const resMe = await axios.get('http://localhost:3000/api/auth/me', config);
          setUserData(resMe.data);

          // 2. Inicializar base de datos con los módulos éticos
          await axios.post('http://localhost:3000/api/auth/init', {}, config);
          console.log('Sincronización con PostgreSQL exitosa: Datos éticos listos.');

        } catch (error) {
          console.error('Error de seguridad o red:', error);
          localStorage.removeItem('token'); 
        }
      }
    };
    fetchAndInitData();
  }, []);

  // Simulación de latencia de red
  useEffect(() => {
    const interval = setInterval(() => {
      setPingMs(prev => Math.max(12, prev + (Math.floor(Math.random() * 5) - 2)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Motor WebGL para el fondo animado (Shader)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let animationFrameId;
    function syncSize() {
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    }
    window.addEventListener('resize', syncSize);
    syncSize();

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const vs = `attribute vec2 a_position; varying vec2 v_texCoord; void main() { v_texCoord = a_position * 0.5 + 0.5; gl_Position = vec4(a_position, 0.0, 1.0); }`;
    const fs = `precision highp float; uniform float u_time; uniform vec2 u_resolution; uniform vec2 u_mouse; varying vec2 v_texCoord;
      float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      void main() {
          vec2 uv = v_texCoord; vec2 mouse = u_mouse / u_resolution;
          vec3 color = vec3(0.05, 0.07, 0.1);
          float glow1 = 0.5 + 0.5 * sin(u_time * 0.2 + uv.x * 5.0 + uv.y * 3.0);
          float glow2 = 0.5 + 0.5 * cos(u_time * 0.3 - uv.y * 4.0 + uv.x * 2.0);
          vec3 primaryColor = vec3(0.06, 0.72, 0.5); 
          float dist = distance(uv, mouse); float mouseGlow = 0.15 / (dist + 0.4);
          vec2 grid = fract(uv * 30.0);
          float lines = smoothstep(0.0, 0.03, grid.x) * smoothstep(1.0, 0.97, grid.x) * smoothstep(0.0, 0.03, grid.y) * smoothstep(1.0, 0.97, grid.y);
          color += primaryColor * (glow1 * 0.05 + glow2 * 0.02 + mouseGlow * 0.1);
          color *= (0.95 + 0.05 * lines); color += (hash(uv + u_time * 0.01) - 0.5) * 0.02;
          gl_FragColor = vec4(color, 1.0);
      }`;

    function cs(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
    const prog = gl.createProgram(); gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(prog); gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, 'a_position'); gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    const uTime = gl.getUniformLocation(prog, 'u_time'); const uRes = gl.getUniformLocation(prog, 'u_resolution'); const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    const handleMouseMove = (e) => { mouse.x = e.clientX; mouse.y = canvas.height - e.clientY; };
    window.addEventListener('mousemove', handleMouseMove);

    function render(t) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001); if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height); if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); animationFrameId = requestAnimationFrame(render);
    }
    render(0);
    return () => { window.removeEventListener('resize', syncSize); window.removeEventListener('mousemove', handleMouseMove); cancelAnimationFrame(animationFrameId); };
  }, []);

  // ==========================================
  // VISTAS DE LA APLICACIÓN (COMPONENTES INTERNOS)
  // ==========================================

  const renderDashboard = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter reveal">
      <div className="lg:col-span-8 space-y-gutter">
        {/* Security Audit Hub */}
        {/* Centro de Auditoría de Seguridad */}
        <section className="glass-card p-margin-md rounded-xl h-full">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-headline-md text-2xl font-bold">Centro de Auditoría de Seguridad</h3>
            {isAuthenticated ? (
              <div className="flex items-center gap-3 px-3 py-1 bg-surface-container rounded-full border border-primary/20">
                <div className="w-2 h-2 rounded-full bg-primary glow-emerald"></div>
                <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Auditoría Activa</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-3 py-1 bg-surface-container rounded-full border border-error/20">
                <span className="text-[10px] font-bold text-error tracking-widest uppercase">Requiere Acceso</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {/* <-- LISTA EXPANDIDA Y EN ESPAÑOL --> */}
            {[
              { title: 'Privacidad por Diseño', icon: 'shield_person', hash: '48e9...2a11', score: 'Bajo', color: 'primary' },
              { title: 'Modelado de Amenazas', icon: 'radar', hash: '9fbc...e41d', score: 'Neutral', color: 'secondary' },
              { title: 'Auditoría de Trazabilidad', icon: 'account_tree', hash: 'b201...7f82', score: 'Pendiente', color: 'on-surface-variant' },
              { title: 'Transparencia Algorítmica', icon: 'memory', hash: 'c7a4...8f99', score: 'Alto', color: 'error' },
              { title: 'Evaluación de Sesgo (IA)', icon: 'psychology', hash: '1d3a...b622', score: 'Revisión', color: 'secondary' },
              { title: 'Cumplimiento (Ley 29733)', icon: 'gavel', hash: '5f92...c310', score: 'Aprobado', color: 'primary' }
            ]
            .filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((item, i) => (
              <div key={i} onClick={() => handleNavigation('audit')} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-lg hover:bg-white/10 transition-colors group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded bg-surface-container flex items-center justify-center text-${item.color} border border-${item.color}/10`}>
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface text-sm md:text-base">{item.title}</p>
                    <p className="font-mono-data text-xs text-on-surface-variant/70">SHA-256: {item.hash}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Nivel de Riesgo</p>
                    <p className={`text-${item.color} font-mono-data text-sm`}>{item.score}</p>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">
                    {isAuthenticated ? 'chevron_right' : 'lock'}
                  </span>
                </div>
              </div>
            ))}

            {/* Mensaje actualizado si la búsqueda no encuentra resultados */}
            {[
              { title: 'Privacidad por Diseño' },
              { title: 'Modelado de Amenazas' },
              { title: 'Auditoría de Trazabilidad' },
              { title: 'Transparencia Algorítmica' },
              { title: 'Evaluación de Sesgo (IA)' },
              { title: 'Cumplimiento (Ley 29733)' }
            ].filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
              <div className="text-center py-6 text-on-surface-variant text-sm font-mono-data border border-white/5 rounded-lg border-dashed">
                No se encontraron resultados para "{searchTerm}"
              </div>
            )}
          </div>
        </section>

        {/* Module Progress Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          <div className="glass-card p-6 rounded-xl hover:border-primary/30 transition-colors cursor-pointer group" onClick={() => handleNavigation('fundamentos')}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">Fundamentos Éticos</h4>
                <p className="text-xs text-on-surface-variant">{isAuthenticated ? 'En curso' : 'Módulo Bloqueado'}</p>
              </div>
              <span className="material-symbols-outlined text-primary">school</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-mono-data text-on-surface-variant"><span>Progreso</span><span>{isAuthenticated ? `${progresoFundamentos}%` : '0%'}</span></div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full bg-primary glow-emerald transition-all duration-1000 ${isAuthenticated ? (progresoFundamentos === 100 ? 'w-full' : 'w-1/4') : 'w-0'}`}></div>
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); handleNavigation('simulador'); }} className="mt-6 w-full py-2 text-xs font-bold border border-primary/20 rounded group-hover:bg-primary/10 transition-all text-primary">
              {isAuthenticated ? 'Ingresar al Simulador' : 'Registrarse para iniciar'}
            </button>
          </div>

          <div className="glass-card p-6 rounded-xl hover:border-secondary/30 transition-colors cursor-pointer group" onClick={() => handleNavigation('casos')}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="font-bold text-lg mb-1 group-hover:text-secondary transition-colors">Casos Prácticos</h4>
                <p className="text-xs text-on-surface-variant">0/12 Escenarios</p>
              </div>
              <span className="material-symbols-outlined text-secondary">cases</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-mono-data text-on-surface-variant"><span>Progreso</span><span>0%</span></div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-secondary/30 w-0"></div></div>
            </div>
            <button className="mt-6 w-full py-2 text-xs font-bold border border-white/10 text-on-surface-variant group-hover:bg-white/5 transition-all">
              {isAuthenticated ? 'Iniciar Módulo' : 'Bloqueado'}
            </button>
          </div>
        </section>
      </div>

      <div className="lg:col-span-4 space-y-gutter">
        {/* Repository Hub */}
        <section className="glass-card p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-6">
            <svg className="w-5 h-5 fill-on-surface" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>
            <h4 className="font-bold">Repository Hub</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-lg text-center border border-white/5"><p className="text-2xl font-mono-data font-bold text-primary">12</p><p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Stars</p></div>
            <div className="bg-white/5 p-4 rounded-lg text-center border border-white/5"><p className="text-2xl font-mono-data font-bold text-error">03</p><p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Open Issues</p></div>
          </div>
          <div className="mt-4 flex items-center justify-between p-3 bg-primary/5 rounded border border-primary/10">
            <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">commit</span><span className="text-xs font-mono-data text-primary">main branch</span></div>
            <span className="px-2 py-0.5 bg-primary text-on-primary text-[10px] font-bold rounded uppercase">Live</span>
          </div>
        </section>

        {/* Telemetry */}
        <section className="glass-card p-6 rounded-xl">
          <h4 className="font-bold mb-6 flex items-center gap-2"><span className="material-symbols-outlined text-secondary">monitor_heart</span> Telemetría</h4>
          <div className="space-y-6">
            <div className="flex justify-between items-center"><div className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-primary glow-emerald"></div><span className="text-sm">API Backend</span></div><span className="font-mono-data text-xs text-primary">{pingMs}ms</span></div>
            <div className="flex justify-between items-center"><div className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-primary glow-emerald"></div><span className="text-sm">PostgreSQL Prisma</span></div><span className="font-mono-data text-xs text-primary">Online</span></div>
            <div className="flex justify-between items-center"><div className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-secondary"></div><span className="text-sm">Ethics Engine</span></div><span className="font-mono-data text-xs text-secondary">Processing</span></div>
          </div>
        </section>
      </div>
    </div>
  );

  const renderFundamentos = () => (
    <div className="glass-card p-10 rounded-xl reveal max-w-4xl mx-auto border-t-4 border-t-primary">
      <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><span className="material-symbols-outlined text-4xl">auto_stories</span></div>
        <div>
          <h2 className="text-3xl font-bold font-headline-lg">Fundamentos Éticos</h2>
          <p className="text-primary font-mono-data text-sm mt-1">Ingeniería en Informática y Sistemas</p>
        </div>
      </div>
      <div className="space-y-6 text-on-surface-variant leading-relaxed">
        <p><strong className="text-white">La Ética como pilar del código:</strong> En la Ingeniería de Sistemas, una decisión algorítmica no es solo matemática, es una postura social. El código que desarrollamos afecta la privacidad, seguridad y el bienestar de miles de usuarios. Entender la diferencia entre moral (creencias personales) y ética (estándares profesionales universales) es vital.</p>
        
        <h3 className="text-xl font-bold text-white pt-4">Código de Ética y Práctica Profesional (ACM/IEEE)</h3>
        <ul className="list-none space-y-4">
          <li className="flex gap-3"><span className="material-symbols-outlined text-primary">check_circle</span><div><strong className="text-white">1. Contribuir a la sociedad:</strong> El software debe diseñarse pensando en el bienestar humano y reducir impactos negativos (Green IT).</div></li>
          <li className="flex gap-3"><span className="material-symbols-outlined text-primary">check_circle</span><div><strong className="text-white">2. Evitar daños:</strong> Implementar <em>Threat Modeling</em> preventivo para asegurar que los sistemas no vulneren datos críticos.</div></li>
          <li className="flex gap-3"><span className="material-symbols-outlined text-primary">check_circle</span><div><strong className="text-white">3. Respetar la privacidad:</strong> Aplicar los principios de minimización de datos y "Privacidad por diseño" en la arquitectura de la base de datos.</div></li>
        </ul>
      </div>
      <button onClick={() => handleNavigation('dashboard')} className="mt-10 px-6 py-2 border border-white/20 rounded hover:bg-white/5 transition-colors">← Volver al Dashboard</button>
    </div>
  );
  
  const renderSimulador = () => (
    <div className="glass-card p-10 rounded-xl reveal max-w-4xl mx-auto border-t-4 border-t-primary">
      <h2 className="text-3xl font-bold font-headline-lg mb-6 text-primary flex items-center gap-3">
        <span className="material-symbols-outlined text-4xl">terminal</span> Simulador de Decisiones
      </h2>
      
      <div className="bg-surface-container p-6 rounded-lg border border-white/10 mb-8 shadow-inner">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2 py-1 bg-secondary/20 text-secondary text-[10px] font-bold rounded uppercase tracking-wider">Ticket #8492</span>
          <h3 className="font-bold text-xl text-white">Arquitectura de E-commerce: "Market Baratón"</h3>
        </div>
        
        <p className="text-on-surface-variant text-sm mb-4 leading-relaxed">
          Estás liderando el desarrollo del nuevo sistema web de ventas en línea para MercadoTech. El negocio ha operado históricamente solo de forma física, sin envíos a domicilio ni atención por WhatsApp o llamadas.
        </p>
        <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
          Durante el diseño de la base de datos relacional, el departamento comercial exige que el formulario de registro obligatorio capture la <strong>ubicación GPS exacta</strong> y el <strong>número de celular</strong> de cada cliente. Argumentan que "esa data servirá para perfilar usuarios y vender publicidad más adelante".
        </p>
        
        <div className="p-4 bg-error/10 border-l-4 border-error rounded-r text-sm text-error/90 font-mono-data">
          <strong>ALERTA DE SISTEMA:</strong> Conflicto detectado entre los requisitos del negocio y los principios de Privacidad por Diseño. Requiere resolución del Ingeniero a cargo.
        </div>
      </div>

      <h4 className="font-bold mb-4">Seleccione la acción arquitectónica correspondiente:</h4>
      
      <div className="space-y-4">
        <button onClick={() => alert('Respuesta Incorrecta: Esto viola la ética profesional y la legislación de protección de datos.')} className="w-full p-4 text-left border border-white/10 rounded-lg hover:bg-white/5 transition-all group">
          <div className="flex gap-4">
            <span className="font-mono-data text-on-surface-variant group-hover:text-white">A)</span>
            <span className="text-sm text-on-surface-variant group-hover:text-white">Implemento los campos en PostgreSQL. Como desarrollador, mi deber es codificar los requerimientos del cliente sin cuestionar el modelo de negocio.</span>
          </div>
        </button>

        <button onClick={handleCompletarModulo} className="w-full p-4 text-left border border-primary/30 bg-primary/5 rounded-lg hover:bg-primary/20 hover:border-primary transition-all group shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <div className="flex gap-4">
            <span className="font-mono-data text-primary">B)</span>
            <span className="text-sm text-white">Deniego el requerimiento aplicando el "Principio de Minimización de Datos". Un supermercado de compra presencial no tiene justificación técnica ni legal para rastrear el GPS del usuario.</span>
          </div>
        </button>
      </div>
    </div>
  );

  const renderCasos = () => (
    <div className="glass-card p-10 rounded-xl reveal max-w-5xl mx-auto border-t-4 border-t-secondary">
      <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
        <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary"><span className="material-symbols-outlined text-4xl">gavel</span></div>
        <div>
          <h2 className="text-3xl font-bold font-headline-lg">Casos Prácticos de Resolución</h2>
          <p className="text-secondary font-mono-data text-sm mt-1">Análisis de Dilemas Morales en Desarrollo de Software</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-container border border-white/5 p-6 rounded-xl hover:border-error/30 transition-colors">
          <div className="flex items-center gap-2 mb-4 text-error"><span className="material-symbols-outlined">bug_report</span><h4 className="font-bold text-lg">El Dilema del "Zero-Day"</h4></div>
          <p className="text-sm text-on-surface-variant mb-4">Descubres una vulnerabilidad crítica en el sistema heredado de un cliente bancario. Informar el fallo retrasará el despliegue 2 meses. Tu gerente de proyecto te ordena ignorarlo argumentando falta de presupuesto.</p>
          <div className="text-xs bg-white/5 p-3 rounded font-mono-data text-primary">Resolución esperada: Escalado a comité de seguridad. Principio ACM #1.2 (Evitar daño).</div>
        </div>

        <div className="bg-surface-container border border-white/5 p-6 rounded-xl hover:border-secondary/30 transition-colors">
          <div className="flex items-center gap-2 mb-4 text-secondary"><span className="material-symbols-outlined">database</span><h4 className="font-bold text-lg">Sesgo en Algoritmos (IA)</h4></div>
          <p className="text-sm text-on-surface-variant mb-4">La empresa te solicita entrenar un modelo de Machine Learning para predecir comportamientos médicos usando datos cruzados sin el consentimiento explícito de los usuarios en los términos de servicio.</p>
          <div className="text-xs bg-white/5 p-3 rounded font-mono-data text-primary">Resolución esperada: Denegación técnica y rediseño de arquitectura de datos (Ley 29733 / GDPR).</div>
        </div>
      </div>
      <button onClick={() => handleNavigation('dashboard')} className="mt-10 px-6 py-2 border border-white/20 rounded hover:bg-white/5 transition-colors">← Volver al Dashboard</button>
    </div>
  );

  const renderAudit = () => (
    <div className="glass-card p-10 rounded-xl reveal max-w-4xl mx-auto border-t-4 border-t-primary">
      <h2 className="text-3xl font-bold font-headline-lg mb-6 flex items-center gap-3"><span className="material-symbols-outlined text-primary text-4xl">security</span> Registro de Auditoría Interna</h2>
      <div className="space-y-4">
        {[
          { time: '14:02:11', status: 'SUCCESS', log: 'Escaneo de vulnerabilidades del código fuente finalizado.', color: 'primary' },
          { time: '13:58:45', status: 'INFO', log: 'Nueva política de privacidad inyectada en el repositorio.', color: 'secondary' },
          { time: '11:20:05', status: 'WARNING', log: 'Intento de acceso a tabla de usuarios sin encriptación detectado y bloqueado.', color: 'error' },
        ].map((item, i) => (
          <div key={i} className="flex gap-4 text-sm bg-black/20 p-4 rounded-lg border border-white/5 font-mono-data">
            <span className="text-on-surface-variant">{item.time}</span>
            <span className={`text-${item.color} font-bold`}>{item.status}:</span>
            <span className="text-on-surface">{item.log}</span>
          </div>
        ))}
      </div>
      <button onClick={() => handleNavigation('dashboard')} className="mt-8 px-6 py-2 border border-white/20 rounded hover:bg-white/5 transition-colors">← Volver al Dashboard</button>
    </div>
  );

  const renderSettings = () => (
    <div className="glass-card p-10 rounded-xl reveal max-w-4xl mx-auto border-t-4 border-t-on-surface-variant">
      <h2 className="text-3xl font-bold font-headline-lg mb-8 flex items-center gap-3"><span className="material-symbols-outlined text-4xl">settings</span> Configuración del Motor Ético</h2>
      
      <div className="space-y-8">
        <div>
          <h4 className="font-bold text-white mb-2">Normativa Base Aplicada</h4>
          <select className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-sm text-on-surface outline-none focus:border-primary">
            <option>Ley de Protección de Datos Personales (Ley 29733 - Perú)</option>
            <option>GDPR (Reglamento General de Protección de Datos - Europa)</option>
            <option>Código de Ética y Práctica Profesional de Ingeniería de Software (ACM/IEEE)</option>
          </select>
        </div>

        <div>
          <h4 className="font-bold text-white mb-2">Nivel de Severidad de Alertas Éticas</h4>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm"><input type="radio" name="sev" className="accent-primary" /> Estricto (Bloquea compilación)</label>
            <label className="flex items-center gap-2 text-sm"><input type="radio" name="sev" className="accent-primary" defaultChecked /> Moderado (Genera Warnings)</label>
            <label className="flex items-center gap-2 text-sm"><input type="radio" name="sev" className="accent-primary" /> Permisivo (Solo Logs)</label>
          </div>
        </div>
      </div>
      <button onClick={() => handleNavigation('dashboard')} className="mt-10 px-6 py-2 border border-white/20 rounded hover:bg-white/5 transition-colors">← Volver al Dashboard</button>
    </div>
  );

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen overflow-x-hidden selection:bg-primary/30 flex">
      {/* Background Shader Layer */}
      <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none opacity-40">
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      </div>

      {/* SideNavBar */}
      <aside className="hidden lg:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface/80 backdrop-blur-xl border-r border-white/10 shadow-2xl py-margin-md px-gutter z-50">
        <div className="mb-10 px-4 cursor-pointer" onClick={() => handleNavigation('dashboard')}>
          <h1 className="font-headline-md text-xl font-extrabold text-primary tracking-tight">Ethical Custodian</h1>
          <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mt-1">
            {isAuthenticated ? 'Auditor Status' : 'Observer Status'}
          </p>
        </div>
        
        <nav className="flex-1 space-y-1">
          <button onClick={() => handleNavigation('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 transition-colors duration-200 ${activeView === 'dashboard' ? 'text-primary bg-primary/10 border-r-2 border-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span><span className="font-body-md text-sm">Dashboard</span>
          </button>
          <button onClick={() => handleNavigation('fundamentos')} className={`w-full flex items-center gap-3 px-4 py-3 transition-colors duration-200 ${activeView === 'fundamentos' ? 'text-primary bg-primary/10 border-r-2 border-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'}`}>
            <span className="material-symbols-outlined">extension</span><span className="font-body-md text-sm">Modules</span>
          </button>
          <button onClick={() => handleNavigation('audit')} className={`w-full flex items-center gap-3 px-4 py-3 transition-colors duration-200 ${activeView === 'audit' ? 'text-primary bg-primary/10 border-r-2 border-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'}`}>
            <span className="material-symbols-outlined">gavel</span><span className="font-body-md text-sm">Audit</span>
          </button>
          <button onClick={() => handleNavigation('settings')} className={`w-full flex items-center gap-3 px-4 py-3 transition-colors duration-200 ${activeView === 'settings' ? 'text-primary bg-primary/10 border-r-2 border-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'}`}>
            <span className="material-symbols-outlined">settings</span><span className="font-body-md text-sm">Settings</span>
          </button>
        </nav>

        <div className="mt-auto px-4">
          <div className="mt-8 flex items-center gap-3 border-t border-white/10 pt-6 pb-4">
            <div className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center bg-surface-container overflow-hidden">
               {isAuthenticated ? <span className="material-symbols-outlined text-primary">shield_person</span> : <span className="material-symbols-outlined text-on-surface-variant">person_off</span>}
            </div>
            <div>
              <p className="font-bold text-on-surface text-sm">
                {isAuthenticated 
                  ? (userData ? userData.email.split('@')[0] : 'Cargando...') 
                  : 'Invitado'}
              </p>
              <p className="text-xs text-on-surface-variant">{isAuthenticated ? 'Level 4 Clearance' : 'Lectura únicamente'}</p>
            </div>
          </div>
          {!isAuthenticated && (
            <button onClick={() => navigate('/registro')} className="w-full py-2 px-4 bg-primary text-on-primary font-bold rounded shadow-lg hover:shadow-primary/20 transition-all active:scale-95 text-sm">
              Acceder al Sistema
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        
        {/* TopAppBar */}
        <header className="sticky top-0 w-full z-40 bg-surface-dim/50 backdrop-blur-lg border-b border-white/10 flex justify-between items-center px-4 md:px-margin-lg h-16">
          <div className="flex items-center gap-8">
            <span className="font-headline-md text-lg font-bold text-on-surface lg:hidden">Playbook Ético</span>
            <span className="hidden lg:inline font-headline-md text-lg font-bold text-on-surface">Playbook Ético</span>
            <nav className="hidden md:flex gap-6">
              {!isAuthenticated && (
                <span className="text-primary font-bold text-xs tracking-wider transition-colors uppercase flex items-center gap-2">
                   <span className="material-symbols-outlined text-[16px]">visibility</span> Observer Mode
                </span>
              )}
            </nav>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6">
            
            {/* BOTÓN GITHUB EN EL HEADER */}
            <a href="https://github.com/Ivan-10k/ethical-playbook" target="_blank" rel="noreferrer" className="hidden sm:flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-1.5 rounded-full transition-colors text-sm font-semibold">
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.44 9.8 8.21 11.39.6.11.8-.26.8-.57v-2.23c-3.34.72-4.04-1.42-4.04-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.08-.74.08-.73.08-.73 1.2.09 1.83 1.24 1.83 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.93 0-1.32.47-2.4 1.24-3.22-.12-.31-.54-1.53.11-3.18 0 0 1-.32 3.3 1.23.96-.27 2.01-.4 3.01-.4 1.01 0 2.06.13 3.01.4 2.3-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.87.12 3.18.77.84 1.24 1.92 1.24 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.82 1.11.82 2.23v3.3c0 .32.2.69.8.57 4.77-1.59 8.2-6.09 8.2-11.39 0-6.63-5.37-12-12-12z"/></svg>
              GitHub
            </a>

            {/* <-- CONEXIÓN DEL INPUT CON EL ESTADO searchTerm --> */}
            <div className="hidden md:flex relative focus-within:ring-1 focus-within:ring-primary rounded-lg transition-all">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
              <input 
                className="bg-surface-container/50 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-0 w-64 placeholder:text-on-surface-variant/50 outline-none" 
                placeholder="Search Ethics Engine..." 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-4">
              <button className="text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined">notifications</span></button>
              <button className="text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined">help_outline</span></button>
              <div className="h-8 w-px bg-white/10 hidden md:block"></div>
              
              {isAuthenticated ? (
                <button onClick={handleLogout} className="text-xs font-bold text-error hover:text-white transition-colors">Salir</button>
              ) : (
                <button onClick={() => navigate('/login')} className="text-sm font-bold text-primary hover:text-white transition-colors">Entrar</button>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="p-4 md:p-margin-lg max-w-7xl mx-auto w-full flex-1">
          
          {/* Mostramos el título principal y el banner de GitHub solo en el dashboard */}
          {activeView === 'dashboard' && (
            <>
              {/* NUEVO BANNER DE GITHUB */}
              <div className="mb-6 bg-surface-container border border-primary/20 rounded-lg p-4 md:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 reveal shadow-lg shadow-primary/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                    {/* Icono de GitHub en SVG */}
                    <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base md:text-lg">Playbook Ético Digital (GitHub)</h4>
                    <p className="text-xs md:text-sm text-on-surface-variant mt-1 max-w-2xl leading-relaxed">
                      Este Playbook Digital está diseñado para integrarse directamente con el control de versiones. Para interactuar con el código fuente, auditar los *commits* o desplegar soluciones a los incidentes, debes ingresar al repositorio oficial.
                    </p>
                  </div>
                </div>
                <a href="https://github.com/Ivan-10k/ethical-playbook" target="_blank" rel="noreferrer" className="shrink-0 w-full lg:w-auto text-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg border border-white/20 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-white/5 active:scale-95">
                  Ir al Repositorio <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                </a>
              </div>

              {/* SECCIÓN ORIGINAL: Panel de Control Ético */}
              <section className="reveal mb-8">
                <div className="glass-card p-6 md:p-10 rounded-xl relative overflow-hidden group">
                  <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/20 transition-all duration-700"></div>
                  <div className="relative z-10 space-y-4">
                    <span className="inline-block px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-[10px] font-bold uppercase tracking-widest">System Operational</span>
                    
                    <h2 className="font-headline-lg text-3xl md:text-4xl font-bold text-on-surface">Panel de Control Ético</h2>
                    <p className="text-sm md:text-base text-on-surface-variant max-w-3xl leading-relaxed">
                      En la práctica laboral actual, los ingenieros enfrentan desafíos críticos como filtraciones de información, accesos no autorizados, deudas técnicas ocultas y sesgos algorítmicos. Este proyecto propone el diseño de un Playbook Digital basado en Git y GitHub, estructurado en módulos específicos que guían al profesional paso a paso sobre cómo detectar, contener, solucionar y prevenir incidentes de carácter ético, priorizando siempre la privacidad, la seguridad y la responsabilidad social.
                    </p>
                    
                    <div className="pt-4 flex flex-col sm:flex-row gap-4">
                      {isAuthenticated ? (
                        <button className="px-8 py-3 bg-primary text-on-primary font-bold rounded-lg shadow-lg glow-emerald hover:scale-105 active:scale-95 transition-all text-sm">
                          Auditoría Continua Activa
                        </button>
                      ) : (
                        <>
                          <button onClick={() => navigate('/registro')} className="px-8 py-3 bg-primary text-on-primary font-bold rounded-lg shadow-lg glow-emerald hover:scale-105 active:scale-95 transition-all text-sm">
                            Desbloquear Módulos
                          </button>
                          <button onClick={() => navigate('/login')} className="px-8 py-3 bg-transparent border border-white/20 text-on-surface font-bold rounded-lg hover:bg-white/5 transition-all text-sm">
                            Ingresar al Sistema
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Renderizado Condicional del Contenido Interno */}
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'fundamentos' && renderFundamentos()}
          {activeView === 'simulador' && renderSimulador()}
          {activeView === 'casos' && renderCasos()}
          {activeView === 'audit' && renderAudit()}
          {activeView === 'settings' && renderSettings()}
          
        </main>
      </div>
    </div>
  );
}

export default Dashboard;