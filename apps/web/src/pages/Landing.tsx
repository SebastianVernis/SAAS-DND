import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();
  const [demoTimeLeft, setDemoTimeLeft] = useState(300); // 5 minutos en segundos
  const [demoStarted, setDemoStarted] = useState(false);

  useEffect(() => {
    if (!demoStarted) return;
    
    if (demoTimeLeft <= 0) {
      // Timeout: redirigir a registro
      alert('⏰ Tiempo de demo terminado. ¡Regístrate para continuar usando el editor!');
      navigate('/register');
      return;
    }

    const timer = setInterval(() => {
      setDemoTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [demoStarted, demoTimeLeft, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDemoStart = () => {
    setDemoStarted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white mb-6">
              ✨ Sistema SaaS Completo
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              DragNDrop
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-pink-200">
                Editor Visual HTML
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Crea páginas web profesionales con drag & drop, AI integrada y colaboración en tiempo real.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button className="btn-primary text-lg px-8 py-4">
                🚀 Comenzar Gratis
              </button>
              <button className="btn-secondary bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white/20 text-lg px-8 py-4">
                📖 Ver Documentación
              </button>
            </div>
          </div>

          {/* Interactive Demo Section */}
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  🎨 Demo Interactivo del Editor
                </h2>
                {demoStarted && (
                  <div className="flex items-center gap-3">
                    <div className={`px-4 py-2 rounded-lg font-mono text-sm font-bold ${
                      demoTimeLeft < 60 ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      ⏱️ {formatTime(demoTimeLeft)}
                    </div>
                    <button
                      onClick={() => navigate('/register')}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      🚀 Registrarme Ahora
                    </button>
                  </div>
                )}
              </div>
              
              {!demoStarted ? (
                <div className="relative border-4 border-purple-300 rounded-lg overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center" style={{ height: '700px' }}>
                  <div className="text-center p-12">
                    <div className="text-6xl mb-6">🎨</div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      Prueba el Editor Gratis
                    </h3>
                    <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                      Explora todas las funcionalidades durante <strong>5 minutos</strong>. Sin tarjeta de crédito.
                    </p>
                    <button
                      onClick={handleDemoStart}
                      className="btn-primary text-lg px-8 py-4 inline-block"
                    >
                      ▶️ Iniciar Demo (5 minutos)
                    </button>
                    <p className="text-sm text-gray-500 mt-4">
                      Después puedes registrarte para acceso ilimitado
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative border-4 border-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    src="/vanilla"
                    className="w-full border-0"
                    style={{ height: '700px' }}
                    title="Editor DragNDrop Vanilla"
                  />
                </div>
              )}
              
              <p className="text-center text-gray-600 mt-4 text-sm">
                💡 Panel de propiedades: <strong>Ctrl+P</strong> · Panel de componentes: <strong>Ctrl+B</strong> · Modo Zen: <strong>F11</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Características Principales
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Todo lo que necesitas para crear páginas web increíbles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="card group">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Planes y Precios
            </h2>
            <p className="text-xl text-gray-600">
              Comienza gratis, escala cuando lo necesites
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, idx) => (
              <div
                key={idx}
                className={`card ${plan.featured ? 'ring-4 ring-purple-500 relative' : ''}`}
              >
                {plan.featured && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                      🔥 Más Popular
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  {plan.price > 0 && <span className="text-gray-600">/mes</span>}
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className={plan.featured ? 'btn-primary w-full' : 'btn-secondary w-full'}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Empieza a Crear Hoy Mismo
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Sin tarjeta de crédito. Sin instalación. Sin límites creativos.
          </p>
          <button className="bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl">
            🚀 Abrir Editor Gratis
          </button>
          <p className="text-white/80 mt-4">
            En menos de 5 segundos estarás creando tu primera página
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">Producto</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white">Características</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white">Precios</a></li>
                <li><a href="/vanilla" className="text-gray-400 hover:text-white">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Recursos</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Documentación</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">API</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Templates</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Empresa</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Sobre Nosotros</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="https://github.com/SebastianVernis/SAAS-DND" className="text-gray-400 hover:text-white">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Privacidad</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Términos</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2024 SAAS-DND. Hecho con 💜 para la comunidad web.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: '🎨',
    title: 'Drag & Drop Visual',
    description: 'Arrastra componentes, ajusta propiedades en tiempo real y ve los cambios instantáneamente.',
  },
  {
    icon: '🤖',
    title: 'AI Integrada',
    description: 'Genera componentes con IA, verifica accesibilidad y optimiza SEO automáticamente.',
  },
  {
    icon: '👥',
    title: 'Colaboración en Tiempo Real',
    description: 'Trabaja en equipo con cursores en vivo y sincronización automática.',
  },
  {
    icon: '📱',
    title: 'Responsive Design',
    description: 'Previsualiza en desktop, tablet y móvil. Test responsive integrado.',
  },
  {
    icon: '🚀',
    title: 'Deploy Directo',
    description: 'Despliega a Vercel con un click. Integración con GitHub incluida.',
  },
  {
    icon: '💾',
    title: 'Exporta Todo',
    description: 'HTML limpio, CSS optimizado, proyecto completo en ZIP. Tu código, tu propiedad.',
  },
];

const pricingPlans = [
  {
    name: 'Pro',
    price: 9,
    description: 'Para freelancers',
    features: [
      'Proyectos ilimitados',
      'AI ilimitado',
      'Templates premium',
      'Deploy automático',
      'Sin marca de agua',
    ],
    cta: 'Comenzar Pro',
    featured: true,
  },
  {
    name: 'Teams',
    price: 29,
    description: 'Para equipos',
    features: [
      'Todo de Pro +',
      '10 miembros',
      'Colaboración tiempo real',
      'SSO',
      'Roles y permisos',
    ],
    cta: 'Comenzar Teams',
    featured: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Para empresas',
    features: [
      'Todo de Teams +',
      'Usuarios ilimitados',
      'Self-hosted',
      'White-label',
      'SLA garantizado',
    ],
    cta: 'Contactar Ventas',
    featured: false,
  },
];
