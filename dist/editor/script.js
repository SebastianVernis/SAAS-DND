        // Variables globales
        let selectedElement = null;
        let draggedComponentType = null;
        let elementIdCounter = 0;
        let currentFilter = 'todas';
        
        // Nuevas instancias de módulos
        let fileLoader = null;
        let projectManager = null;
        let componentExtractor = null;

        // Initialize Frontend Reader
        import('./src/reader/integration.js').then(module => {
            module.initFrontendReader();
            console.log('✅ Frontend Reader initialized');
        }).catch(error => {
            console.error('❌ Failed to initialize Frontend Reader:', error);
        });

        // Plantillas precargadas
        const plantillas = [
            {
                id: 'saas-landing',
                nombre: 'Landing Page SaaS',
                descripcion: 'Perfecta para software, apps y servicios en la nube',
                categoria: 'negocios',
                emoji: '🚀',
                contenido_html: `<nav style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">TuProducto</h1>
        <div style="display: flex; gap: 30px; align-items: center;">
          <a href="#" style="color: white; text-decoration: none;">Features</a>
          <a href="#" style="color: white; text-decoration: none;">Precios</a>
          <a href="#" style="color: white; text-decoration: none;">Contacto</a>
          <button style="background: white; color: #667eea; padding: 10px 24px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Comienza gratis</button>
        </div>
      </nav>

      <section style="min-height: 600px; display: flex; flex-direction: column; justify-content: center; align-items: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 60px 20px;">
        <h2 style="font-size: 56px; font-weight: bold; margin: 0 0 20px 0; max-width: 900px;">La solución perfecta para tu negocio</h2>
        <p style="font-size: 20px; margin: 0 0 40px 0; max-width: 700px; opacity: 0.95;">Aumenta tu productividad y automatiza tus procesos con nuestra plataforma inteligente</p>
        <div style="display: flex; gap: 20px; justify-content: center;">
          <button style="background: white; color: #667eea; padding: 14px 32px; border: none; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer;">Prueba gratis por 14 días</button>
          <button style="background: transparent; color: white; padding: 14px 32px; border: 2px solid white; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer;">Ver demo</button>
        </div>
      </section>

      <section style="padding: 80px 20px; background: #f8fafc;">
        <div style="max-width: 1200px; margin: 0 auto;">
          <h3 style="text-align: center; font-size: 40px; font-weight: bold; margin: 0 0 60px 0; color: #1e293b;">Características principales</h3>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px;">
            <div style="padding: 30px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center;">
              <div style="font-size: 48px; margin-bottom: 20px;">⚡</div>
              <h4 style="font-size: 20px; font-weight: bold; margin: 0 0 12px 0; color: #1e293b;">Velocidad ultrarrápida</h4>
              <p style="margin: 0; color: #64748b; line-height: 1.6;">Procesa millones de transacciones sin ralentizarse</p>
            </div>
            <div style="padding: 30px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center;">
              <div style="font-size: 48px; margin-bottom: 20px;">🔒</div>
              <h4 style="font-size: 20px; font-weight: bold; margin: 0 0 12px 0; color: #1e293b;">Seguridad máxima</h4>
              <p style="margin: 0; color: #64748b; line-height: 1.6;">Encriptación de nivel empresarial para tus datos</p>
            </div>
            <div style="padding: 30px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center;">
              <div style="font-size: 48px; margin-bottom: 20px;">📈</div>
              <h4 style="font-size: 20px; font-weight: bold; margin: 0 0 12px 0; color: #1e293b;">Análisis en tiempo real</h4>
              <p style="margin: 0; color: #64748b; line-height: 1.6;">Dashboards inteligentes para tomar mejores decisiones</p>
            </div>
          </div>
        </div>
      </section>

      <footer style="background: #1e293b; color: white; padding: 40px 20px; text-align: center;">
        <p style="margin: 0; color: #94a3b8;">&copy; 2025 TuProducto.io. Todos los derechos reservados.</p>
      </footer>`
            },
            {
                id: 'portfolio',
                nombre: 'Portafolio Profesional',
                descripcion: 'Vitrina profesional para mostrar tu trabajo',
                categoria: 'personal',
                emoji: '👨‍💻',
                contenido_html: `<nav style="background: white; padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #1e293b;">Juan Pérez</h1>
        <div style="display: flex; gap: 30px; align-items: center;">
          <a href="#inicio" style="color: #1e293b; text-decoration: none; font-weight: 500;">Inicio</a>
          <a href="#proyectos" style="color: #1e293b; text-decoration: none; font-weight: 500;">Proyectos</a>
          <a href="#contacto" style="color: #1e293b; text-decoration: none; font-weight: 500;">Contacto</a>
          <a href="#" style="background: #f97316; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">Descargar CV</a>
        </div>
      </nav>

      <section style="padding: 100px 40px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; display: flex; align-items: center; justify-content: center;">
        <div style="text-align: center; max-width: 600px;">
          <div style="width: 150px; height: 150px; border-radius: 50%; background: white; margin: 0 auto 30px; display: flex; align-items: center; justify-content: center; font-size: 80px;">👨‍💻</div>
          <h2 style="font-size: 48px; font-weight: bold; margin: 0 0 16px 0;">Desarrollador Full Stack</h2>
          <p style="font-size: 20px; margin: 0 0 30px 0; opacity: 0.9;">Especializado en crear soluciones web modernas y eficientes</p>
          <p style="font-size: 16px; margin: 0; opacity: 0.85;">Python • JavaScript • React • Django • PostgreSQL</p>
        </div>
      </section>

      <section style="padding: 80px 40px; background: white;">
        <div style="max-width: 1200px; margin: 0 auto;">
          <h3 style="font-size: 32px; font-weight: bold; margin: 0 0 60px 0; color: #1e293b;">Proyectos destacados</h3>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px;">
            <div style="border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <div style="background: #667eea; height: 200px; display: flex; align-items: center; justify-content: center; font-size: 80px;">📱</div>
              <div style="padding: 30px; background: white;">
                <h4 style="font-size: 20px; font-weight: bold; margin: 0 0 12px 0; color: #1e293b;">App Mobile</h4>
                <p style="color: #64748b; margin: 0 0 16px 0; line-height: 1.6;">Aplicación móvil para gestión de tareas</p>
                <a href="#" style="color: #f97316; text-decoration: none; font-weight: bold;">Ver proyecto →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer style="background: #1e293b; color: white; padding: 40px 20px; text-align: center;">
        <p style="margin: 0; color: #94a3b8;">&copy; 2025 Juan Pérez. Todos los derechos reservados.</p>
      </footer>`
            },
            {
                id: 'blog',
                nombre: 'Blog Minimalista',
                descripcion: 'Plataforma para publicar artículos y historias',
                categoria: 'blog',
                emoji: '📝',
                contenido_html: `<header style="background: white; padding: 20px 40px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
        <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #1e293b;">Mi Blog</h1>
        <div style="display: flex; gap: 16px;">
          <input type="text" placeholder="Buscar artículos..." style="padding: 10px 16px; border: 1px solid #e2e8f0; border-radius: 6px; width: 300px;">
          <button style="padding: 10px 20px; background: #1e293b; color: white; border: none; border-radius: 6px; cursor: pointer;">Buscar</button>
        </div>
      </header>

      <section style="padding: 60px 40px; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white;">
        <div style="max-width: 900px; margin: 0 auto;">
          <h2 style="font-size: 48px; font-weight: bold; margin: 0 0 20px 0;">Último artículo</h2>
          <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2);">
            <span style="background: rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">Tecnología</span>
            <h3 style="font-size: 32px; font-weight: bold; margin: 16px 0; color: white;">Introducción a Web 3.0</h3>
            <p style="margin: 0 0 16px 0; line-height: 1.6; opacity: 0.9;">Descubre qué es Web 3.0, cómo funciona y por qué es importante para el futuro de internet</p>
          </div>
        </div>
      </section>

      <section style="padding: 60px 40px; background: white;">
        <div style="max-width: 900px; margin: 0 auto;">
          <h3 style="font-size: 32px; font-weight: bold; margin: 0 0 40px 0; color: #1e293b;">Todos los artículos</h3>
          <article style="padding: 30px; border-bottom: 1px solid #e2e8f0;">
            <h4 style="font-size: 20px; font-weight: bold; margin: 0 0 12px 0; color: #1e293b;">Guía completa de JavaScript</h4>
            <p style="color: #64748b; margin: 0;">Aprende los conceptos fundamentales del lenguaje</p>
          </article>
        </div>
      </section>

      <footer style="background: #1e293b; color: white; padding: 40px 20px; text-align: center;">
        <p style="margin: 0; color: #94a3b8;">&copy; 2025 Mi Blog. Todos los derechos reservados.</p>
      </footer>`
            },
            {
                id: 'contacto',
                nombre: 'Página de Contacto',
                descripcion: 'Formulario de contacto profesional con información',
                categoria: 'servicios',
                emoji: '📧',
                contenido_html: `<header style="background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); color: white; padding: 60px 40px; text-align: center;">
        <h1 style="font-size: 40px; font-weight: bold; margin: 0 0 12px 0;">Contacta con nosotros</h1>
        <p style="font-size: 18px; margin: 0; opacity: 0.95;">Estamos aquí para responder tus preguntas y ayudarte</p>
      </header>

      <section style="padding: 80px 40px; background: white;">
        <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 60px;">
          <div>
            <h2 style="font-size: 28px; font-weight: bold; margin: 0 0 30px 0; color: #1e293b;">Envíanos un mensaje</h2>
            <form style="display: flex; flex-direction: column; gap: 20px;">
              <input type="text" placeholder="Tu nombre" style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px;">
              <input type="email" placeholder="tu@email.com" style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px;">
              <textarea placeholder="Cuéntanos más..." style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; min-height: 150px;"></textarea>
              <button type="submit" style="padding: 12px; background: #0891b2; color: white; border: none; border-radius: 6px; font-weight: bold; font-size: 16px; cursor: pointer;">Enviar mensaje</button>
            </form>
          </div>

          <div>
            <h2 style="font-size: 28px; font-weight: bold; margin: 0 0 30px 0; color: #1e293b;">Información de contacto</h2>
            <div style="margin-bottom: 40px;">
              <h3 style="font-size: 18px; font-weight: bold; margin: 0 0 12px 0; color: #1e293b;">📍 Ubicación</h3>
              <p style="margin: 0; color: #64748b;">Ciudad de México, CDMX</p>
            </div>
            <div>
              <h3 style="font-size: 18px; font-weight: bold; margin: 0 0 12px 0; color: #1e293b;">📞 Teléfono</h3>
              <p style="margin: 0;"><a href="tel:+525511223344" style="color: #0891b2; text-decoration: none;">+52 55 1122 3344</a></p>
            </div>
          </div>
        </div>
      </section>

      <footer style="background: #1e293b; color: white; padding: 40px 20px; text-align: center;">
        <p style="margin: 0; color: #94a3b8;">&copy; 2025 Tu Empresa. Todos los derechos reservados.</p>
      </footer>`
            },
            {
                id: 'ecommerce',
                nombre: 'Tienda Online',
                descripcion: 'Ecommerce completo con catálogo de productos',
                categoria: 'tienda',
                emoji: '🛒',
                contenido_html: `<nav style="background: white; padding: 16px 40px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #dc2626;">TiendaXpress</h1>
        <div style="display: flex; gap: 20px; align-items: center;">
          <input type="text" placeholder="Buscar productos..." style="padding: 10px 16px; border: 1px solid #e2e8f0; border-radius: 6px; width: 300px;">
          <span style="font-weight: bold; cursor: pointer;">🛒 Carrito (3)</span>
        </div>
      </nav>

      <section style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 40px; text-align: center;">
        <h2 style="font-size: 36px; font-weight: bold; margin: 0 0 12px 0;">Envío GRATIS en compras mayores a $500</h2>
        <p style="font-size: 16px; margin: 0;">Válido hasta el 30 de noviembre</p>
      </section>

      <section style="padding: 40px; background: #f3f4f6;">
        <div style="max-width: 1200px; margin: 0 auto;">
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
            <div style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <div style="background: #e5e7eb; height: 150px; display: flex; align-items: center; justify-content: center; font-size: 60px;">📱</div>
              <div style="padding: 16px;">
                <h4 style="font-size: 14px; font-weight: bold; margin: 0 0 8px 0;">Smartphone Pro</h4>
                <div style="font-size: 16px; font-weight: bold; color: #dc2626; margin-bottom: 12px;">$799</div>
                <button style="width: 100%; padding: 8px; background: #dc2626; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Añadir al carrito</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer style="background: #1e293b; color: white; padding: 40px 20px; text-align: center;">
        <p style="margin: 0; color: #94a3b8;">&copy; 2025 TiendaXpress. Todos los derechos reservados.</p>
      </footer>`
            },
            {
                id: 'app-mobile',
                nombre: 'App Mobile',
                descripcion: 'Showcase de app móvil con screenshots',
                categoria: 'landing',
                emoji: '📱',
                contenido_html: `
                <section style="padding: 80px 20px; text-align: center;">
                    <h2 style="font-size: 40px; margin-bottom: 20px;">Muestra tu App</h2>
                    <p style="font-size: 18px; color: #555; margin-bottom: 40px;">Una sección para mostrar las capturas de pantalla de tu aplicación móvil.</p>
                    <div style="display: flex; justify-content: center; gap: 20px;">
                    <img src="https://via.placeholder.com/200x400" alt="App Screenshot 1" style="border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    <img src="https://via.placeholder.com/200x400" alt="App Screenshot 2" style="border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    <img src="https://via.placeholder.com/200x400" alt="App Screenshot 3" style="border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    </div>
                </section>
                `
            },
            {
                id: 'startup',
                nombre: 'Startup',
                descripcion: 'Landing para startups con investors, timeline',
                categoria: 'landing',
                emoji: '💡',
                contenido_html: `
                <section style="padding: 80px 20px;">
                    <h2 style="text-align: center; font-size: 40px; margin-bottom: 40px;">Nuestra Trayectoria</h2>
                    <div style="max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px;">
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <div style="width: 50px; height: 50px; background-color: #333; color: white; display: flex; align-items: center; justify-content: center; border-radius: 50%;">2020</div>
                        <p>Creación de la idea y formación del equipo.</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <div style="width: 50px; height: 50px; background-color: #333; color: white; display: flex; align-items: center; justify-content: center; border-radius: 50%;">2021</div>
                        <p>Lanzamiento de la primera versión del producto.</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <div style="width: 50px; height: 50px; background-color: #333; color: white; display: flex; align-items: center; justify-content: center; border-radius: 50%;">2022</div>
                        <p>Ronda de inversión y expansión del equipo.</p>
                    </div>
                    </div>
                </section>
                `
            },
            {
                id: 'agency',
                nombre: 'Agency',
                descripcion: 'Agencia creativa con portfolio grid',
                categoria: 'landing',
                emoji: '🎨',
                contenido_html: `
                <section style="padding: 80px 20px;">
                    <h2 style="text-align: center; font-size: 40px; margin-bottom: 40px;">Nuestro Trabajo</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                    <div style="background-color: #f0f0f0; padding: 20px; border-radius: 10px;">
                        <img src="https://via.placeholder.com/300x200" alt="Portfolio Item 1" style="width: 100%; border-radius: 5px; margin-bottom: 10px;">
                        <h3 style="font-size: 24px;">Proyecto 1</h3>
                        <p>Descripción del proyecto.</p>
                    </div>
                    <div style="background-color: #f0f0f0; padding: 20px; border-radius: 10px;">
                        <img src="https://via.placeholder.com/300x200" alt="Portfolio Item 2" style="width: 100%; border-radius: 5px; margin-bottom: 10px;">
                        <h3 style="font-size: 24px;">Proyecto 2</h3>
                        <p>Descripción del proyecto.</p>
                    </div>
                    <div style="background-color: #f0f0f0; padding: 20px; border-radius: 10px;">
                        <img src="https://via.placeholder.com/300x200" alt="Portfolio Item 3" style="width: 100%; border-radius: 5px; margin-bottom: 10px;">
                        <h3 style="font-size: 24px;">Proyecto 3</h3>
                        <p>Descripción del proyecto.</p>
                    </div>
                    </div>
                </section>
                `
            },
            {
                id: 'event',
                nombre: 'Event',
                descripcion: 'Página de evento con countdown, speakers',
                categoria: 'landing',
                emoji: '🎉',
                contenido_html: `
                <section style="padding: 80px 20px; text-align: center;">
                    <h2 style="font-size: 40px; margin-bottom: 20px;">Próximo Evento</h2>
                    <div style="font-size: 30px; margin-bottom: 40px;" id="countdown">10d 5h 30m 15s</div>
                    <h3 style="font-size: 30px; margin-bottom: 20px;">Ponentes</h3>
                    <div style="display: flex; justify-content: center; gap: 20px;">
                    <div style="text-align: center;">
                        <img src="https://via.placeholder.com/150" alt="Speaker 1" style="border-radius: 50%; margin-bottom: 10px;">
                        <h4>Nombre Ponente 1</h4>
                        <p>Título del Ponente 1</p>
                    </div>
                    <div style="text-align: center;">
                        <img src="https://via.placeholder.com/150" alt="Speaker 2" style="border-radius: 50%; margin-bottom: 10px;">
                        <h4>Nombre Ponente 2</h4>
                        <p>Título del Ponente 2</p>
                    </div>
                    </div>
                </section>
                `
            },
            {
                id: 'portfolio-personal',
                nombre: 'Portfolio Personal',
                descripcion: 'Diseñador/Developer personal',
                categoria: 'portfolio',
                emoji: '🧑‍💻',
                contenido_html: `
                <section style="padding: 80px 20px; text-align: center;">
                    <img src="https://via.placeholder.com/150" alt="Profile Picture" style="border-radius: 50%; margin-bottom: 20px;">
                    <h2 style="font-size: 40px; margin-bottom: 10px;">Mi Nombre</h2>
                    <p style="font-size: 18px; color: #555; margin-bottom: 40px;">Desarrollador Web y Diseñador Gráfico</p>
                    <div style="display: flex; justify-content: center; gap: 20px;">
                    <a href="#" style="padding: 10px 20px; background-color: #333; color: white; text-decoration: none; border-radius: 5px;">Ver Proyectos</a>
                    <a href="#" style="padding: 10px 20px; background-color: #555; color: white; text-decoration: none; border-radius: 5px;">Contactar</a>
                    </div>
                </section>
                `
            },
            {
                id: 'portfolio-fotografo',
                nombre: 'Portfolio Fotógrafo',
                descripcion: 'Grid de fotos con lightbox',
                categoria: 'portfolio',
                emoji: '📷',
                contenido_html: `
                <section style="padding: 80px 20px;">
                    <h2 style="text-align: center; font-size: 40px; margin-bottom: 40px;">Galería</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px;">
                    <img src="https://via.placeholder.com/300x300" alt="Photo 1" style="width: 100%; cursor: pointer;">
                    <img src="https://via.placeholder.com/300x300" alt="Photo 2" style="width: 100%; cursor: pointer;">
                    <img src="https://via.placeholder.com/300x300" alt="Photo 3" style="width: 100%; cursor: pointer;">
                    <img src="https://via.placeholder.com/300x300" alt="Photo 4" style="width: 100%; cursor: pointer;">
                    </div>
                </section>
                `
            },
            {
                id: 'portfolio-arquitectura',
                nombre: 'Portfolio Arquitectura',
                descripcion: 'Proyectos con antes/después',
                categoria: 'portfolio',
                emoji: '🏛️',
                contenido_html: `
                <section style="padding: 80px 20px;">
                    <h2 style="text-align: center; font-size: 40px; margin-bottom: 40px;">Proyectos</h2>
                    <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <h3 style="text-align: center;">Antes</h3>
                        <img src="https://via.placeholder.com/400x300" alt="Before">
                    </div>
                    <div>
                        <h3 style="text-align: center;">Después</h3>
                        <img src="https://via.placeholder.com/400x300" alt="After">
                    </div>
                    </div>
                </section>
                `
            },
            {
                id: 'tienda-online',
                nombre: 'Tienda Online',
                descripcion: 'Product grid, cart, checkout',
                categoria: 'ecommerce',
                emoji: '🛍️',
                contenido_html: `
                <section style="padding: 80px 20px;">
                    <h2 style="text-align: center; font-size: 40px; margin-bottom: 40px;">Productos</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                    <div style="border: 1px solid #ddd; padding: 10px; text-align: center;">
                        <img src="https://via.placeholder.com/250x250" alt="Product 1">
                        <h3>Producto 1</h3>
                        <p>$19.99</p>
                        <button>Añadir al Carrito</button>
                    </div>
                    <div style="border: 1px solid #ddd; padding: 10px; text-align: center;">
                        <img src="https://via.placeholder.com/250x250" alt="Product 2">
                        <h3>Producto 2</h3>
                        <p>$29.99</p>
                        <button>Añadir al Carrito</button>
                    </div>
                    <div style="border: 1px solid #ddd; padding: 10px; text-align: center;">
                        <img src="https://via.placeholder.com/250x250" alt="Product 3">
                        <h3>Producto 3</h3>
                        <p>$39.99</p>
                        <button>Añadir al Carrito</button>
                    </div>
                    </div>
                </section>
                `
            },
            {
                id: 'producto-unico',
                nombre: 'Producto Único',
                descripcion: 'Single product showcase',
                categoria: 'ecommerce',
                emoji: '🎁',
                contenido_html: `
                <section style="padding: 80px 20px; display: flex; justify-content: center; align-items: center; gap: 40px;">
                    <div style="flex: 1;">
                        <img src="https://via.placeholder.com/500x500" alt="Product Image" style="width: 100%; border-radius: 10px;">
                    </div>
                    <div style="flex: 1;">
                        <h2 style="font-size: 40px; margin-bottom: 20px;">Nombre del Producto</h2>
                        <p style="font-size: 18px; color: #555; margin-bottom: 20px;">Descripción detallada del producto, sus características y beneficios.</p>
                        <p style="font-size: 24px; font-weight: bold; margin-bottom: 20px;">$99.99</p>
                        <button style="padding: 15px 30px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Añadir al Carrito</button>
                    </div>
                </section>
                `
            },
            {
                id: 'fashion-store',
                nombre: 'Fashion Store',
                descripcion: 'Lookbook style',
                categoria: 'ecommerce',
                emoji: '👗',
                contenido_html: `
                <section style="padding: 80px 20px;">
                    <h2 style="text-align: center; font-size: 40px; margin-bottom: 40px;">Lookbook de Temporada</h2>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; align-items: center;">
                        <div style="text-align: center;">
                            <img src="https://via.placeholder.com/400x600" alt="Look 1" style="width: 100%;">
                            <h3 style="margin-top: 10px;">Look 1</h3>
                        </div>
                        <div style="text-align: center;">
                            <img src="https://via.placeholder.com/400x600" alt="Look 2" style="width: 100%;">
                            <h3 style="margin-top: 10px;">Look 2</h3>
                        </div>
                        <div style="text-align: center;">
                            <img src="https://via.placeholder.com/400x600" alt="Look 3" style="width: 100%;">
                            <h3 style="margin-top: 10px;">Look 3</h3>
                        </div>
                        <div style="text-align: center;">
                            <img src="https://via.placeholder.com/400x600" alt="Look 4" style="width: 100%;">
                            <h3 style="margin-top: 10px;">Look 4</h3>
                        </div>
                    </div>
                </section>
                `
            },
            {
                id: 'blog-personal',
                nombre: 'Blog Personal',
                descripcion: 'Posts grid, sidebar',
                categoria: 'blog',
                emoji: '✍️',
                contenido_html: `
                <section style="padding: 80px 20px; display: flex; gap: 40px;">
                    <main style="flex: 3;">
                        <article style="margin-bottom: 40px;">
                            <h2 style="font-size: 32px; margin-bottom: 10px;">Título del Post</h2>
                            <p style="color: #555; margin-bottom: 20px;">Publicado el 1 de Enero, 2023</p>
                            <p>Contenido del post...</p>
                        </article>
                    </main>
                    <aside style="flex: 1;">
                        <h3 style="font-size: 24px; margin-bottom: 20px;">Sobre Mí</h3>
                        <p>Biografía corta...</p>
                        <h3 style="font-size: 24px; margin-top: 40px; margin-bottom: 20px;">Categorías</h3>
                        <ul>
                            <li>Categoría 1</li>
                            <li>Categoría 2</li>
                        </ul>
                    </aside>
                </section>
                `
            },
            {
                id: 'magazine',
                nombre: 'Magazine',
                descripcion: 'Multi-column layout',
                categoria: 'blog',
                emoji: '📰',
                contenido_html: `
                <section style="padding: 80px 20px;">
                    <h2 style="text-align: center; font-size: 40px; margin-bottom: 40px;">Noticias Destacadas</h2>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                        <article>
                            <img src="https://via.placeholder.com/300x200" style="width: 100%;">
                            <h3>Título de Noticia 1</h3>
                            <p>Resumen de la noticia...</p>
                        </article>
                        <article>
                            <img src="https://via.placeholder.com/300x200" style="width: 100%;">
                            <h3>Título de Noticia 2</h3>
                            <p>Resumen de la noticia...</p>
                        </article>
                        <article>
                            <img src="https://via.placeholder.com/300x200" style="width: 100%;">
                            <h3>Título de Noticia 3</h3>
                            <p>Resumen de la noticia...</p>
                        </article>
                    </div>
                </section>
                `
            },
            {
                id: 'newsletter',
                nombre: 'Newsletter',
                descripcion: 'Subscription focused',
                categoria: 'blog',
                emoji: '✉️',
                contenido_html: `
                <section style="padding: 80px 20px; text-align: center;">
                    <h2 style="font-size: 40px; margin-bottom: 20px;">Suscríbete a Nuestro Newsletter</h2>
                    <p style="font-size: 18px; color: #555; margin-bottom: 40px;">Recibe las últimas noticias y ofertas directamente en tu correo.</p>
                    <form style="display: flex; justify-content: center; gap: 10px;">
                        <input type="email" placeholder="Tu correo electrónico" style="padding: 10px; width: 300px;">
                        <button type="submit" style="padding: 10px 20px; background-color: #007bff; color: white; border: none;">Suscribirse</button>
                    </form>
                </section>
                `
            },
            {
                id: 'corporate',
                nombre: 'Corporate',
                descripcion: 'Empresa tradicional',
                categoria: 'business',
                emoji: '🏢',
                contenido_html: `
                <header style="padding: 20px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center;">
                    <h1>Nombre de la Empresa</h1>
                    <nav>
                        <a href="#">Inicio</a> | <a href="#">Sobre Nosotros</a> | <a href="#">Servicios</a> | <a href="#">Contacto</a>
                    </nav>
                </header>
                <section style="padding: 80px 20px; text-align: center;">
                    <h2>Comprometidos con la Excelencia</h2>
                    <p>Descripción de la empresa y su misión.</p>
                </section>
                `
            },
            {
                id: 'consultoria',
                nombre: 'Consultoría',
                descripcion: 'Servicios profesionales',
                categoria: 'business',
                emoji: '💼',
                contenido_html: `
                <section style="padding: 80px 20px;">
                    <h2 style="text-align: center; font-size: 40px; margin-bottom: 40px;">Nuestros Servicios</h2>
                    <div style="display: flex; justify-content: center; gap: 20px;">
                        <div>
                            <h3>Consultoría Estratégica</h3>
                            <p>Análisis y planificación para el crecimiento de tu negocio.</p>
                        </div>
                        <div>
                            <h3>Consultoría Financiera</h3>
                            <p>Asesoramiento para optimizar tus finanzas.</p>
                        </div>
                    </div>
                </section>
                `
            },
            {
                id: 'real-estate',
                nombre: 'Real Estate',
                descripcion: 'Propiedades con filtros',
                categoria: 'business',
                emoji: '🏠',
                contenido_html: `
                <section style="padding: 80px 20px;">
                    <h2 style="text-align: center; font-size: 40px; margin-bottom: 40px;">Propiedades Disponibles</h2>
                    <div style="margin-bottom: 20px; text-align: center;">
                        <label>Tipo:</label>
                        <select>
                            <option>Casa</option>
                            <option>Apartamento</option>
                        </select>
                        <label>Precio:</label>
                        <input type="range" min="100000" max="1000000">
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                        <div style="border: 1px solid #ddd; padding: 10px;">
                            <img src="https://via.placeholder.com/300x200" style="width: 100%;">
                            <h3>Casa Moderna</h3>
                            <p>Precio: $500,000</p>
                        </div>
                    </div>
                </section>
                `
            },
            {
                id: 'restaurante',
                nombre: 'Restaurante',
                descripcion: 'Menú, reservas, galería',
                categoria: 'other',
                emoji: '🍔',
                contenido_html: `
                <section style="padding: 80px 20px;">
                    <h2 style="text-align: center; font-size: 40px; margin-bottom: 40px;">Nuestro Menú</h2>
                    <div>
                        <h3>Plato Principal</h3>
                        <p>Descripción del plato - $15</p>
                    </div>
                </section>
                `
            },
            {
                id: 'gym-fitness',
                nombre: 'Gym/Fitness',
                descripcion: 'Clases, entrenadores, precios',
                categoria: 'other',
                emoji: '💪',
                contenido_html: `
                <section style="padding: 80px 20px; text-align: center;">
                    <h2 style="font-size: 40px; margin-bottom: 40px;">Nuestras Clases</h2>
                    <p>Clases de Yoga, Pilates, y más.</p>
                </section>
                `
            },
            {
                id: 'educacion',
                nombre: 'Educación',
                descripcion: 'Cursos online, instructores',
                categoria: 'other',
                emoji: '📚',
                contenido_html: `
                <section style="padding: 80px 20px;">
                    <h2 style="text-align: center; font-size: 40px; margin-bottom: 40px;">Cursos Disponibles</h2>
                    <p>Curso de Desarrollo Web - 10 lecciones.</p>
                </section>
                `
            }
        ];

        // Inicialización
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM Content Loaded - Starting initialization');
            console.log('Templates array length:', plantillas.length);
            
            // Inicializar módulos nuevos
            initializeNewModules();
            
            setupComponentDrag();
            setupCanvasDrop();
            setupCanvasDropForMovement();
            setupKeyboardShortcuts();
            setupComponentSearch();
            renderTemplates();
            console.log('Templates rendered');
            showGallery();
            console.log('Gallery shown');
        });

        // Inicializar nuevos módulos
        function initializeNewModules() {
            try {
                fileLoader = new FileLoader();
                projectManager = new ProjectManager();
                componentExtractor = new ComponentExtractor();
                
                // Exponer globalmente para acceso desde otros módulos
                window.fileLoader = fileLoader;
                window.projectManager = projectManager;
                window.componentExtractor = componentExtractor;
                
                console.log('Nuevos módulos inicializados correctamente');
            } catch (error) {
                console.error('Error inicializando módulos:', error);
            }
        }

        // Configurar búsqueda de componentes
        function setupComponentSearch() {
            const searchInput = document.getElementById('componentSearch');
            
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const components = document.querySelectorAll('.component-item');
                
                components.forEach(component => {
                    const text = component.textContent.toLowerCase();
                    const type = component.getAttribute('data-type').toLowerCase();
                    
                    if (text.includes(searchTerm) || type.includes(searchTerm)) {
                        component.style.display = 'block';
                    } else {
                        component.style.display = 'none';
                    }
                });
                
                // Mostrar u ocultar categorías según si tienen componentes visibles
                const categories = document.querySelectorAll('.component-category');
                categories.forEach(category => {
                    const visibleItems = category.querySelectorAll('.component-item[style*="display: block"], .component-item:not([style*="display"])');
                    if (visibleItems.length === 0) {
                        category.style.display = 'none';
                    } else {
                        category.style.display = 'block';
                    }
                });
            });
        }

        // Renderizar plantillas
        function renderTemplates() {
            const grid = document.getElementById('templatesGrid');
            if (!grid) {
                console.error('Templates grid not found');
                return;
            }
            
            const filtered = currentFilter === 'todas'
                ? plantillas
                : plantillas.filter(t => t.categoria === currentFilter);

            console.log('Rendering templates:', filtered.length);
            
            grid.innerHTML = filtered.map(template => `
                <div class="template-card" onclick="loadTemplate('${template.id}')">
                    <div class="template-preview">${template.emoji}</div>
                    <div class="template-info">
                        <span class="template-badge badge-${template.categoria}">${template.categoria.toUpperCase()}</span>
                        <h3>${template.nombre}</h3>
                        <p>${template.descripcion}</p>
                        <button class="use-template-btn" onclick="event.stopPropagation(); loadTemplate('${template.id}')">Usar Esta Plantilla</button>
                    </div>
                </div>
            `).join('');
        }

        // Filtrar plantillas por categoría
        function filterTemplates(categoria) {
            currentFilter = categoria;

            // Actualizar botones activos
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');

            renderTemplates();
        }

        // Cargar plantilla
        function loadTemplate(templateId) {
            const template = plantillas.find(t => t.id === templateId);
            if (!template) return;

            const canvas = document.getElementById('canvas');
            canvas.innerHTML = template.contenido_html;

            // Re-aplicar eventos a los elementos cargados
            const elements = canvas.querySelectorAll('*');
            elements.forEach((element, index) => {
                // Evitar agregar eventos al canvas mismo y elementos script/style
                if (element.id === 'canvas' || element.tagName === 'SCRIPT' || element.tagName === 'STYLE') return;
                
                // Evitar elementos muy pequeños o invisibles
                if (element.offsetWidth === 0 && element.offsetHeight === 0) return;

                // Asignar ID único si no tiene
                if (!element.id || element.id === '') {
                    element.id = 'element-' + (elementIdCounter++);
                }
                
                element.classList.add('canvas-element');

                // Agregar botón de eliminar
                const deleteBtn = document.createElement('div');
                deleteBtn.className = 'delete-btn';
                deleteBtn.textContent = '×';
                deleteBtn.onclick = function(e) {
                    e.stopPropagation();
                    deleteElement(element);
                };
                element.appendChild(deleteBtn);

                // Eventos de selección
                element.addEventListener('click', function(e) {
                    e.stopPropagation();
                    selectElement(element);
                });

                element.addEventListener('dblclick', function(e) {
                    e.stopPropagation();
                    makeElementEditable(element);
                });

                // Configurar drag & drop para movimiento de elementos
                if (typeof setupElementDragAndDrop === 'function') {
                    setupElementDragAndDrop(element);
                }
            });
            
            console.log(`✅ Template loaded: ${elements.length} elements processed`);

            hideGallery();
            showToast('Plantilla "' + template.nombre + '" cargada');
            
            // Auto-ajustar canvas al contenido de la plantilla
            setTimeout(() => {
                const canvas = document.getElementById('canvas');
                if (canvas && canvas.children.length > 0) {
                    canvas.style.minHeight = 'auto';
                    canvas.style.height = 'auto';
                    canvas.style.overflow = 'visible';
                }
            }, 200);
        }

        // Mostrar galería
        function showGallery() {
            const canvas = document.getElementById('canvas');
            if (canvas.children.length > 0) {
                if (!confirm('¿Estás seguro? Perderás los cambios no guardados.')) {
                    return;
                }
            }
            document.getElementById('galleryScreen').classList.remove('hidden');
        }

        // Mostrar ayuda
        function showHelp() {
            document.getElementById('helpScreen').classList.remove('hidden');
            document.getElementById('galleryScreen').classList.add('hidden');
        }
        
        // Abrir configuración de Gemini AI
        function openGeminiConfig() {
            console.log('🤖 Opening Gemini config...', !!window.geminiValidator);
            if (window.geminiValidator) {
                window.geminiValidator.showConfigModal();
            } else {
                console.error('❌ GeminiValidator not initialized yet');
                setTimeout(() => {
                    if (window.geminiValidator) {
                        window.geminiValidator.showConfigModal();
                    } else {
                        alert('⚠️ Gemini AI aún no está inicializado. Recarga la página e intenta de nuevo.');
                    }
                }, 1000);
            }
        }
        window.openGeminiConfig = openGeminiConfig;

        // Ocultar galería
        function hideGallery() {
            document.getElementById('galleryScreen').classList.add('hidden');
        }

        // Empezar proyecto en blanco
        function startBlankProject() {
            console.log('startBlankProject called');
            document.getElementById('canvas').innerHTML = '';
            selectedElement = null;
            document.getElementById('properties-panel').innerHTML = `
                <h2 class="panel-title">Propiedades</h2>
                <div class="properties-empty">
                    ← Arrastra componentes al canvas o selecciona un elemento para editar sus propiedades
                </div>
            `;
            hideGallery();
            showToast('Nuevo proyecto en blanco creado');
        }

        // Configurar drag desde panel de componentes
        function setupComponentDrag() {
            const components = document.querySelectorAll('.component-item');
            components.forEach(component => {
                const type = component.getAttribute('data-type');
                
                // Usar nuevo sistema de posicionamiento libre si está disponible
                if (window.freePositionDragDrop) {
                    window.freePositionDragDrop.setupComponentDrag(component, type);
                } else if (window.enhancedDragDrop) {
                    window.enhancedDragDrop.setupComponentDrag(component, type);
                } else {
                    // Fallback al sistema antiguo
                    component.addEventListener('dragstart', function(e) {
                        draggedComponentType = type;
                        e.dataTransfer.effectAllowed = 'copy';
                        this.classList.add('dragging');
                        
                        const img = document.createElement('img');
                        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                        e.dataTransfer.setDragImage(img, 0, 0);
                    });
                    
                    component.addEventListener('dragend', function() {
                        this.classList.remove('dragging');
                    });
                }
            });
        }

        // Configurar drop en canvas
        function setupCanvasDrop() {
            const canvas = document.getElementById('canvas');

            canvas.addEventListener('dragover', function(e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                canvas.classList.add('drop-zone');
            });

            canvas.addEventListener('dragleave', function(e) {
                canvas.classList.remove('drop-zone');
            });

            canvas.addEventListener('drop', function(e) {
                e.preventDefault();
                canvas.classList.remove('drop-zone');
                if (draggedComponentType) {
                    const element = createComponent(draggedComponentType);
                    canvas.appendChild(element);
                    draggedComponentType = null;
                }
            });
        }

        // Crear componente según tipo
        function createComponent(type) {
            let element;
            const id = 'element-' + (elementIdCounter++);

            switch(type) {
                case 'contenedor':
                    element = document.createElement('div');
                    element.style.padding = '20px';
                    element.style.border = '1px dashed #ccc';
                    element.style.minHeight = '100px';
                    element.textContent = 'Contenedor';
                    break;

                case 'seccion':
                    element = document.createElement('section');
                    element.style.padding = '40px 20px';
                    element.style.width = '100%';
                    element.style.minHeight = '200px';
                    element.style.background = '#f8fafc';
                    element.textContent = 'Sección';
                    break;

                case 'fila':
                    element = document.createElement('div');
                    element.style.display = 'flex';
                    element.style.flexDirection = 'row';
                    element.style.gap = '10px';
                    element.style.minHeight = '80px';
                    element.style.border = '1px dashed #ccc';
                    element.textContent = 'Fila (Flex)';
                    break;

                case 'columna':
                    element = document.createElement('div');
                    element.style.display = 'flex';
                    element.style.flexDirection = 'column';
                    element.style.gap = '10px';
                    element.style.minHeight = '100px';
                    element.style.border = '1px dashed #ccc';
                    element.textContent = 'Columna (Flex)';
                    break;

                case 'grid2':
                    element = document.createElement('div');
                    element.style.display = 'grid';
                    element.style.gridTemplateColumns = '1fr 1fr';
                    element.style.gap = '10px';
                    element.style.minHeight = '100px';
                    element.style.border = '1px dashed #ccc';
                    element.innerHTML = '<div style="padding: 20px; background: #f1f5f9;">Columna 1</div><div style="padding: 20px; background: #f1f5f9;">Columna 2</div>';
                    break;

                case 'grid3':
                    element = document.createElement('div');
                    element.style.display = 'grid';
                    element.style.gridTemplateColumns = '1fr 1fr 1fr';
                    element.style.gap = '10px';
                    element.style.minHeight = '100px';
                    element.style.border = '1px dashed #ccc';
                    element.innerHTML = '<div style="padding: 20px; background: #f1f5f9;">Columna 1</div><div style="padding: 20px; background: #f1f5f9;">Columna 2</div><div style="padding: 20px; background: #f1f5f9;">Columna 3</div>';
                    break;

                case 'h1':
                    element = document.createElement('h1');
                    element.textContent = 'Título Principal';
                    element.style.fontSize = '2.5rem';
                    element.style.fontWeight = 'bold';
                    element.style.margin = '0';
                    break;

                case 'h2':
                    element = document.createElement('h2');
                    element.textContent = 'Subtítulo';
                    element.style.fontSize = '2rem';
                    element.style.fontWeight = 'bold';
                    element.style.margin = '0';
                    break;

                case 'h3':
                    element = document.createElement('h3');
                    element.textContent = 'Título H3';
                    element.style.fontSize = '1.5rem';
                    element.style.fontWeight = 'bold';
                    element.style.margin = '0';
                    break;

                case 'p':
                    element = document.createElement('p');
                    element.textContent = 'Este es un párrafo de ejemplo. Haz doble click para editar el texto.';
                    element.style.fontSize = '1rem';
                    element.style.lineHeight = '1.6';
                    element.style.margin = '0';
                    break;

                case 'span':
                    element = document.createElement('span');
                    element.textContent = 'Texto en línea';
                    break;

                case 'ul':
                    element = document.createElement('ul');
                    element.innerHTML = '<li>Elemento 1</li><li>Elemento 2</li><li>Elemento 3</li>';
                    element.style.paddingLeft = '20px';
                    break;

                case 'ol':
                    element = document.createElement('ol');
                    element.innerHTML = '<li>Elemento 1</li><li>Elemento 2</li><li>Elemento 3</li>';
                    element.style.paddingLeft = '20px';
                    break;

                case 'img':
                    element = document.createElement('img');
                    element.src = 'https://via.placeholder.com/400x200';
                    element.alt = 'Imagen';
                    element.style.maxWidth = '100%';
                    element.style.display = 'block';
                    break;

                case 'video':
                    element = document.createElement('video');
                    element.controls = true;
                    element.style.width = '100%';
                    element.style.maxWidth = '600px';
                    element.innerHTML = '<source src="" type="video/mp4">';
                    break;

                case 'iframe':
                    element = document.createElement('iframe');
                    element.src = '';
                    element.style.width = '100%';
                    element.style.height = '400px';
                    element.style.border = '1px solid #ccc';
                    break;

                case 'input':
                    element = document.createElement('input');
                    element.type = 'text';
                    element.placeholder = 'Escribe aquí...';
                    element.style.padding = '10px';
                    element.style.border = '1px solid #ccc';
                    element.style.borderRadius = '4px';
                    element.style.width = '100%';
                    break;

                case 'textarea':
                    element = document.createElement('textarea');
                    element.placeholder = 'Escribe aquí...';
                    element.style.padding = '10px';
                    element.style.border = '1px solid #ccc';
                    element.style.borderRadius = '4px';
                    element.style.width = '100%';
                    element.style.minHeight = '100px';
                    element.style.fontFamily = 'inherit';
                    break;

                case 'button':
                    element = document.createElement('button');
                    element.textContent = 'Botón';
                    element.style.padding = '10px 20px';
                    element.style.background = '#64748b';
                    element.style.color = 'white';
                    element.style.border = 'none';
                    element.style.borderRadius = '6px';
                    element.style.cursor = 'pointer';
                    break;

                case 'checkbox':
                    element = document.createElement('label');
                    element.innerHTML = '<input type="checkbox" style="margin-right: 8px;">Opción checkbox';
                    element.style.display = 'flex';
                    element.style.alignItems = 'center';
                    break;

                case 'radio':
                    element = document.createElement('label');
                    element.innerHTML = '<input type="radio" name="radio-group" style="margin-right: 8px;">Opción radio';
                    element.style.display = 'flex';
                    element.style.alignItems = 'center';
                    break;

                case 'select':
                    element = document.createElement('select');
                    element.innerHTML = '<option>Opción 1</option><option>Opción 2</option><option>Opción 3</option>';
                    element.style.padding = '10px';
                    element.style.border = '1px solid #ccc';
                    element.style.borderRadius = '4px';
                    element.style.width = '100%';
                    break;

                case 'btn-primary':
                    element = document.createElement('button');
                    element.textContent = 'Botón Primario';
                    element.style.padding = '12px 24px';
                    element.style.background = '#2563eb';
                    element.style.color = 'white';
                    element.style.border = 'none';
                    element.style.borderRadius = '6px';
                    element.style.cursor = 'pointer';
                    element.style.fontWeight = '500';
                    break;

                case 'btn-secondary':
                    element = document.createElement('button');
                    element.textContent = 'Botón Secundario';
                    element.style.padding = '12px 24px';
                    element.style.background = 'white';
                    element.style.color = '#1e293b';
                    element.style.border = '1px solid #e2e8f0';
                    element.style.borderRadius = '6px';
                    element.style.cursor = 'pointer';
                    element.style.fontWeight = '500';
                    break;

                case 'card':
                    element = document.createElement('div');
                    element.className = 'component-card';
                    element.innerHTML = `
                        <img src="https://via.placeholder.com/400x200" alt="Card image" style="width: 100%; border-radius: 8px 8px 0 0;">
                        <div class="component-card-body">
                            <h3 style="margin: 0 0 10px 0;">Título de la Card</h3>
                            <p style="margin: 0 0 15px 0; color: #64748b;">Descripción de la tarjeta con información relevante.</p>
                            <button style="background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Leer más</button>
                        </div>
                    `;
                    break;

                case 'navbar':
                    element = document.createElement('nav');
                    element.className = 'component-navbar';
                    element.innerHTML = `
                        <div class="component-navbar-brand">Logo</div>
                        <ul class="component-navbar-nav">
                            <li><a href="#">Inicio</a></li>
                            <li><a href="#">Servicios</a></li>
                            <li><a href="#">Contacto</a></li>
                        </ul>
                    `;
                    element.style.width = '100%';
                    break;

                case 'footer':
                    element = document.createElement('footer');
                    element.className = 'component-footer';
                    element.innerHTML = `
                        <p style="margin: 0 0 10px 0;">&copy; 2025 Mi Sitio Web</p>
                        <p style="margin: 0; color: #94a3b8;">Todos los derechos reservados</p>
                    `;
                    element.style.width = '100%';
                    break;

                case 'hero':
                    element = document.createElement('section');
                    element.className = 'component-hero';
                    element.innerHTML = `
                        <h1 style="margin: 0 0 20px 0; font-size: 3rem;">Bienvenido</h1>
                        <p style="margin: 0 0 30px 0; font-size: 1.25rem; max-width: 600px;">Crea páginas web increíbles con nuestro editor visual</p>
                        <button style="background: white; color: #667eea; padding: 12px 32px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 1rem;">Comenzar</button>
                    `;
                    element.style.width = '100%';
                    break;

                case 'tabs':
                    element = document.createElement('div');
                    element.innerHTML = `
                        <div class="tabs-container" style="width: 100%;">
                            <div class="tabs-nav" style="display: flex; border-bottom: 1px solid #e2e8f0;">
                                <button class="tab-btn active" style="padding: 12px 20px; border: none; background: #f1f5f9; cursor: pointer; border-bottom: 2px solid #2563eb; font-weight: 500; color: #2563eb;">Pestaña 1</button>
                                <button class="tab-btn" style="padding: 12px 20px; border: none; background: transparent; cursor: pointer; border-bottom: 2px solid transparent;">Pestaña 2</button>
                                <button class="tab-btn" style="padding: 12px 20px; border: none; background: transparent; cursor: pointer; border-bottom: 2px solid transparent;">Pestaña 3</button>
                            </div>
                            <div class="tab-content" style="padding: 20px; border: 1px solid #e2e8f0; border-top: none;">
                                <p>Contenido de la primera pestaña</p>
                            </div>
                        </div>
                    `;
                    element.style.width = '100%';
                    break;

                case 'accordion':
                    element = document.createElement('div');
                    element.innerHTML = `
                        <div class="accordion-item" style="border: 1px solid #e2e8f0; border-bottom: none;">
                            <div class="accordion-header" style="padding: 16px 20px; background: #f8fafc; cursor: pointer; font-weight: 500; border-bottom: 1px solid #e2e8f0;">
                                <span style="display: flex; justify-content: space-between; align-items: center; width: 100%;">Pregunta frecuente 1</span>
                            </div>
                            <div class="accordion-content" style="padding: 20px; display: block;">
                                <p>Respuesta a la primera pregunta frecuente.</p>
                            </div>
                        </div>
                        <div class="accordion-item" style="border: 1px solid #e2e8f0; border-bottom: none;">
                            <div class="accordion-header" style="padding: 16px 20px; background: #f8fafc; cursor: pointer; font-weight: 500; border-bottom: 1px solid #e2e8f0;">
                                <span style="display: flex; justify-content: space-between; align-items: center; width: 100%;">Pregunta frecuente 2</span>
                            </div>
                            <div class="accordion-content" style="padding: 20px; display: none;">
                                <p>Respuesta a la segunda pregunta frecuente.</p>
                            </div>
                        </div>
                    `;
                    element.style.width = '100%';
                    break;

                case 'modal':
                    element = document.createElement('div');
                    element.innerHTML = `
                        <button class="modal-trigger" style="padding: 12px 24px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer;">Abrir Modal</button>
                        <div class="modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: none; align-items: center; justify-content: center; z-index: 1000;">
                            <div class="modal-content" style="background: white; padding: 30px; border-radius: 8px; width: 500px; position: relative; max-width: 90%;">
                                <button class="modal-close" style="position: absolute; top: 10px; right: 15px; background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
                                <h3 style="margin: 0 0 15px 0;">Título del Modal</h3>
                                <p style="margin: 0 0 20px 0;">Contenido del modal aquí.</p>
                                <button class="modal-btn" style="padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;">Aceptar</button>
                            </div>
                        </div>
                    `;
                    break;

                case 'carousel':
                    element = document.createElement('div');
                    element.innerHTML = `
                        <div class="carousel-container" style="width: 100%; overflow: hidden; position: relative;">
                            <div class="carousel-slides" style="display: flex; transition: transform 0.3s ease;">
                                <div style="min-width: 100%; padding: 20px; text-align: center; background: #f1f5f9;">
                                    <h4>Diapositiva 1</h4>
                                    <p>Contenido de la primera diapositiva</p>
                                </div>
                                <div style="min-width: 100%; padding: 20px; text-align: center; background: #e2e8f0;">
                                    <h4>Diapositiva 2</h4>
                                    <p>Contenido de la segunda diapositiva</p>
                                </div>
                                <div style="min-width: 100%; padding: 20px; text-align: center; background: #cbd5e1;">
                                    <h4>Diapositiva 3</h4>
                                    <p>Contenido de la tercera diapositiva</p>
                                </div>
                            </div>
                            <button class="carousel-prev" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); background: white; border: 1px solid #cbd5e1; border-radius: 50%; width: 40px; height: 40px; cursor: pointer;">←</button>
                            <button class="carousel-next" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: white; border: 1px solid #cbd5e1; border-radius: 50%; width: 40px; height: 40px; cursor: pointer;">→</button>
                        </div>
                    `;
                    element.style.width = '100%';
                    break;

                case 'alert':
                    element = document.createElement('div');
                    element.innerHTML = `
                        <div class="alert alert-info" style="padding: 16px; border-radius: 6px; border-left: 4px solid #3b82f6; background: #dbeafe; color: #1e3a8a; display: flex; align-items: center;">
                            <span style="margin-right: 12px;">ℹ️</span>
                            <span>Este es un mensaje de información</span>
                        </div>
                    `;
                    element.style.width = '100%';
                    break;

                case 'badge':
                    element = document.createElement('span');
                    element.innerHTML = 'Badge';
                    element.style.backgroundColor = '#2563eb';
                    element.style.color = 'white';
                    element.style.padding = '4px 12px';
                    element.style.borderRadius = '12px';
                    element.style.fontSize = '12px';
                    element.style.fontWeight = 'bold';
                    break;

                default:
                    element = document.createElement('div');
                    element.textContent = 'Elemento';
            }

            // Configurar elemento
            element.id = id;
            element.classList.add('canvas-element');
            element.setAttribute('data-component-type', type);

            // Agregar botón de eliminar
            const deleteBtn = document.createElement('div');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = '×';
            deleteBtn.onclick = function(e) {
                e.stopPropagation();
                deleteElement(element);
            };
            element.appendChild(deleteBtn);

            // Eventos
            element.addEventListener('click', function(e) {
                e.stopPropagation();
                selectElement(element);
            });

            element.addEventListener('dblclick', function(e) {
                e.stopPropagation();
                makeElementEditable(element);
            });

            // Configurar drag & drop para movimiento de elementos
            if (window.freePositionDragDrop) {
                window.freePositionDragDrop.setupCanvasElementDrag(element);
            } else if (window.enhancedDragDrop) {
                window.enhancedDragDrop.setupCanvasElementDrag(element);
            } else {
                setupElementDragAndDrop(element);
            }

            // Manejar eventos especiales para componentes avanzados
            if (type === 'tabs') {
                setupTabs(element);
            } else if (type === 'accordion') {
                setupAccordion(element);
            } else if (type === 'modal') {
                setupModal(element);
            } else if (type === 'carousel') {
                setupCarousel(element);
            }

            return element;
        }
        
        // Exportar createComponent globalmente para uso de módulos
        window.createComponent = createComponent;

        // ===== SISTEMA DE DRAG & DROP PARA ELEMENTOS DEL CANVAS =====
        
        let draggedCanvasElement = null;
        let dropIndicator = null;

        // Configurar drag & drop para un elemento del canvas
        function setupElementDragAndDrop(element) {
            // Hacer el elemento arrastrable
            element.draggable = true;
            
            // Eventos de drag para el elemento
            element.addEventListener('dragstart', function(e) {
                // Prevenir drag si estamos sobre resize handles
                if (e.target.classList.contains('resize-handle') || 
                    e.target.closest('.resize-handles')) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
                
                // Solo permitir arrastre si el elemento está seleccionado
                if (!element.classList.contains('selected')) {
                    e.preventDefault();
                    return;
                }
                
                draggedCanvasElement = element;
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', element.outerHTML);
                
                // Agregar clase visual durante el arrastre
                element.classList.add('dragging-canvas-element');
                
                // Crear indicador de drop
                createDropIndicator();
                
                // Configurar imagen de arrastre transparente
                const img = document.createElement('img');
                img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                e.dataTransfer.setDragImage(img, 0, 0);
            });

            element.addEventListener('dragend', function(e) {
                element.classList.remove('dragging-canvas-element');
                draggedCanvasElement = null;
                removeDropIndicator();
                clearDropZones();
            });

            // Eventos de drop para recibir elementos
            element.addEventListener('dragover', function(e) {
                if (draggedCanvasElement && draggedCanvasElement !== element) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    
                    // Determinar posición de inserción
                    const rect = element.getBoundingClientRect();
                    const midY = rect.top + rect.height / 2;
                    const isAfter = e.clientY > midY;
                    
                    showDropIndicator(element, isAfter);
                }
            });

            element.addEventListener('dragleave', function(e) {
                // Solo ocultar si realmente salimos del elemento
                const rect = element.getBoundingClientRect();
                if (e.clientX < rect.left || e.clientX > rect.right || 
                    e.clientY < rect.top || e.clientY > rect.bottom) {
                    hideDropIndicator();
                }
            });

            element.addEventListener('drop', function(e) {
                if (draggedCanvasElement && draggedCanvasElement !== element) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Determinar posición de inserción
                    const rect = element.getBoundingClientRect();
                    const midY = rect.top + rect.height / 2;
                    const isAfter = e.clientY > midY;
                    
                    // Realizar el movimiento
                    moveElement(draggedCanvasElement, element, isAfter);
                    
                    showToast('Elemento movido');
                }
            });
        }

        // Crear indicador visual de drop
        function createDropIndicator() {
            if (!dropIndicator) {
                dropIndicator = document.createElement('div');
                dropIndicator.className = 'drop-indicator';
                dropIndicator.style.cssText = `
                    position: absolute;
                    height: 3px;
                    background: #3b82f6;
                    border-radius: 2px;
                    z-index: 1000;
                    display: none;
                    box-shadow: 0 0 6px rgba(59, 130, 246, 0.5);
                `;
                document.body.appendChild(dropIndicator);
            }
        }

        // Mostrar indicador de drop en posición específica
        function showDropIndicator(targetElement, isAfter) {
            if (!dropIndicator) return;
            
            const rect = targetElement.getBoundingClientRect();
            const canvasRect = document.getElementById('canvas').getBoundingClientRect();
            
            dropIndicator.style.display = 'block';
            dropIndicator.style.left = (rect.left - canvasRect.left + 10) + 'px';
            dropIndicator.style.width = (rect.width - 20) + 'px';
            
            if (isAfter) {
                dropIndicator.style.top = (rect.bottom - canvasRect.top - 1) + 'px';
            } else {
                dropIndicator.style.top = (rect.top - canvasRect.top - 2) + 'px';
            }
        }

        // Ocultar indicador de drop
        function hideDropIndicator() {
            if (dropIndicator) {
                dropIndicator.style.display = 'none';
            }
        }

        // Remover indicador de drop
        function removeDropIndicator() {
            if (dropIndicator) {
                dropIndicator.remove();
                dropIndicator = null;
            }
        }

        // Limpiar zonas de drop
        function clearDropZones() {
            const elements = document.querySelectorAll('.canvas-element');
            elements.forEach(el => {
                el.classList.remove('drop-zone-active');
            });
        }

        // Mover elemento a nueva posición
        function moveElement(draggedElement, targetElement, insertAfter) {
            const parent = targetElement.parentNode;
            
            // Validar que no estamos moviendo un padre dentro de su hijo
            if (isDescendant(draggedElement, targetElement)) {
                showToast('No se puede mover un elemento dentro de sí mismo', 'error');
                return;
            }
            
            // Realizar el movimiento
            if (insertAfter) {
                // Insertar después del elemento objetivo
                if (targetElement.nextSibling) {
                    parent.insertBefore(draggedElement, targetElement.nextSibling);
                } else {
                    parent.appendChild(draggedElement);
                }
            } else {
                // Insertar antes del elemento objetivo
                parent.insertBefore(draggedElement, targetElement);
            }
            
            // Mantener selección en el elemento movido
            selectElement(draggedElement);
        }

        // Verificar si un elemento es descendiente de otro
        function isDescendant(parent, child) {
            let node = child.parentNode;
            while (node != null) {
                if (node === parent) {
                    return true;
                }
                node = node.parentNode;
            }
            return false;
        }

        // Configurar drag & drop para el canvas (para elementos desde el panel)
        function setupCanvasDropForMovement() {
            const canvas = document.getElementById('canvas');
            
            canvas.addEventListener('dragover', function(e) {
                // Solo para elementos del canvas, no del panel de componentes
                if (draggedCanvasElement) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                }
            });

            canvas.addEventListener('drop', function(e) {
                if (draggedCanvasElement) {
                    e.preventDefault();
                    
                    // Si se suelta en el canvas vacío, mover al final
                    if (e.target === canvas) {
                        canvas.appendChild(draggedCanvasElement);
                        selectElement(draggedCanvasElement);
                        showToast('Elemento movido al final');
                    }
                }
            });
        }

        // Setup para componentes de pestañas
        function setupTabs(element) {
            const tabButtons = element.querySelectorAll('.tab-btn');
            tabButtons.forEach((btn, index) => {
                btn.addEventListener('click', function() {
                    // Remover la clase activa de todos los botones
                    tabButtons.forEach(b => b.classList.remove('active'));
                    // Agregar clase activa al botón clickeado
                    this.classList.add('active');
                    
                    // Aquí se manejaría el cambio de contenido de pestañas en un entorno real
                });
            });
        }

        // Setup para componentes de acordeón
        function setupAccordion(element) {
            const accordionHeaders = element.querySelectorAll('.accordion-header');
            accordionHeaders.forEach(header => {
                header.addEventListener('click', function() {
                    const content = this.nextElementSibling;
                    if (content.style.display === 'none' || content.style.display === '') {
                        content.style.display = 'block';
                    } else {
                        content.style.display = 'none';
                    }
                });
            });
        }

        // Setup para componentes de modal
        function setupModal(element) {
            const modal = element.querySelector('.modal');
            const trigger = element.querySelector('.modal-trigger');
            const closeBtn = element.querySelector('.modal-close');
            const modalBtn = element.querySelector('.modal-btn');

            trigger.addEventListener('click', function(e) {
                e.stopPropagation();
                modal.style.display = 'flex';
            });

            function closeModal() {
                modal.style.display = 'none';
            }

            closeBtn.addEventListener('click', closeModal);
            modalBtn.addEventListener('click', closeModal);

            // Cerrar al hacer clic fuera del contenido
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeModal();
                }
            });
        }

        // Setup para componentes de carrusel
        function setupCarousel(element) {
            const slidesContainer = element.querySelector('.carousel-slides');
            const prevBtn = element.querySelector('.carousel-prev');
            const nextBtn = element.querySelector('.carousel-next');
            let currentSlide = 0;
            const slides = element.querySelectorAll('.carousel-slides > div');

            function updateCarousel() {
                slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
            }

            prevBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (currentSlide > 0) {
                    currentSlide--;
                    updateCarousel();
                }
            });

            nextBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (currentSlide < slides.length - 1) {
                    currentSlide++;
                    updateCarousel();
                }
            });
        }

        // Seleccionar elemento
        function selectElement(element) {
            console.log('🎯 Selecting element:', element.tagName, element.id);
            
            // Deseleccionar anterior
            if (selectedElement) {
                selectedElement.classList.remove('selected');
                // Deshabilitar resize
                if (window.resizeManager) {
                    window.resizeManager.disableResize(selectedElement);
                }
            }

            // Seleccionar nuevo
            selectedElement = element;
            element.classList.add('selected');

            // Habilitar resize
            console.log('🔧 ResizeManager available:', !!window.resizeManager);
            if (window.resizeManager) {
                window.resizeManager.enableResize(element);
                console.log('✅ Resize enabled, checking for handles...');
                setTimeout(() => {
                    const handles = element.querySelectorAll('.resize-handle');
                    console.log('🔍 Resize handles found:', handles.length);
                }, 100);
            } else {
                console.warn('⚠️ ResizeManager not initialized');
            }

            // Habilitar drag mejorado
            if (window.freePositionDragDrop) {
                window.freePositionDragDrop.setupCanvasElementDrag(element);
            } else if (window.enhancedDragDrop) {
                window.enhancedDragDrop.setupCanvasElementDrag(element);
            }

            // Validar sintaxis con Gemini (si está habilitado)
            if (window.geminiValidator && window.geminiValidator.isEnabled()) {
                validateElementSyntax(element);
            }

            // Cargar propiedades
            loadProperties(element);
        }
        
        // Exportar selectElement globalmente
        window.selectElement = selectElement;
        
        // Validar sintaxis de elemento con Gemini
        async function validateElementSyntax(element) {
            if (!window.geminiValidator || !window.geminiValidator.isEnabled()) {
                return; // Skip si no está habilitado
            }
            
            try {
                const result = await window.geminiValidator.validateElement(element, {
                    parent: element.parentElement?.tagName || 'body'
                });
                
                if (result && result.hasChanges) {
                    window.geminiValidator.showCorrectionSuggestion(element, result);
                }
            } catch (error) {
                console.error('Error validando sintaxis con Gemini:', error);
                // No mostrar error al usuario, solo loggear
            }
        }

        // Cargar propiedades en el panel
        function loadProperties(element) {
            const panel = document.getElementById('properties-panel');
            const tagName = element.tagName.toLowerCase();
            const computedStyle = window.getComputedStyle(element);
            
            // Helper: obtener valor desde inline style o computed style
            const getStyleValue = (property, unit = '') => {
                let value = element.style[property];
                if (!value || value === '') {
                    value = computedStyle[property];
                }
                if (unit && value && value.includes(unit)) {
                    value = value.replace(unit, '');
                }
                return value || '';
            };
            
            // Debug log para verificar lectura de propiedades
            console.log('📋 Loading properties for:', tagName, {
                fontSize: getStyleValue('fontSize'),
                padding: getStyleValue('padding'),
                backgroundColor: getStyleValue('backgroundColor'),
                display: getStyleValue('display')
            });

            let html = '<h2 class="panel-title">Propiedades</h2>';

            // Sección General
            html += '<div class="property-section">';
            html += '<div class="section-title">General</div>';
            html += `<div class="property-group">
                        <label class="property-label">Tag HTML</label>
                        <input class="property-input" value="${tagName}" readonly>
                     </div>`;
            html += `<div class="property-group">
                        <label class="property-label">ID</label>
                        <input class="property-input" value="${element.id}" onchange="updateAttribute('id', this.value)">
                     </div>`;
            html += `<div class="property-group">
                        <label class="property-label">Clases CSS</label>
                        <input class="property-input" value="${element.className.replace('canvas-element', '').replace('selected', '').trim()}" onchange="updateAttribute('class', this.value)">
                     </div>`;
            html += '</div>';

            // Sección Dimensiones
            html += '<div class="property-section">';
            html += '<div class="section-title">Dimensiones</div>';
            const width = getStyleValue('width');
            const height = getStyleValue('height');
            const maxWidth = getStyleValue('maxWidth');
            const maxHeight = getStyleValue('maxHeight');
            html += `<div class="property-grid">
                        <div class="property-group">
                            <label class="property-label">Ancho</label>
                            <input class="property-input" value="${width || 'auto'}" onchange="updateStyle('width', this.value)">
                        </div>
                        <div class="property-group">
                            <label class="property-label">Alto</label>
                            <input class="property-input" value="${height || 'auto'}" onchange="updateStyle('height', this.value)">
                        </div>
                     </div>`;
            html += `<div class="property-grid">
                        <div class="property-group">
                            <label class="property-label">Ancho Máximo</label>
                            <input class="property-input" value="${maxWidth}" onchange="updateStyle('maxWidth', this.value)">
                        </div>
                        <div class="property-group">
                            <label class="property-label">Alto Máximo</label>
                            <input class="property-input" value="${maxHeight}" onchange="updateStyle('maxHeight', this.value)">
                        </div>
                     </div>`;
            html += '</div>';

            // Sección Espaciado
            html += '<div class="property-section">';
            html += '<div class="section-title">Espaciado</div>';
            html += '<div class="property-group">';
            html += '<label class="property-label">Padding (px)</label>';
            html += '<div class="property-grid-4">';
            html += `<input class="property-input" placeholder="Top" value="${getStyleValue('paddingTop', 'px')}" onchange="updateStyle('paddingTop', this.value + 'px')">`;
            html += `<input class="property-input" placeholder="Right" value="${getStyleValue('paddingRight', 'px')}" onchange="updateStyle('paddingRight', this.value + 'px')">`;
            html += `<input class="property-input" placeholder="Bottom" value="${getStyleValue('paddingBottom', 'px')}" onchange="updateStyle('paddingBottom', this.value + 'px')">`;
            html += `<input class="property-input" placeholder="Left" value="${getStyleValue('paddingLeft', 'px')}" onchange="updateStyle('paddingLeft', this.value + 'px')">`;
            html += '</div></div>';
            html += '<div class="property-group">';
            html += '<label class="property-label">Margin (px)</label>';
            html += '<div class="property-grid-4">';
            html += `<input class="property-input" placeholder="Top" value="${getStyleValue('marginTop', 'px')}" onchange="updateStyle('marginTop', this.value + 'px')">`;
            html += `<input class="property-input" placeholder="Right" value="${getStyleValue('marginRight', 'px')}" onchange="updateStyle('marginRight', this.value + 'px')">`;
            html += `<input class="property-input" placeholder="Bottom" value="${getStyleValue('marginBottom', 'px')}" onchange="updateStyle('marginBottom', this.value + 'px')">`;
            html += `<input class="property-input" placeholder="Left" value="${getStyleValue('marginLeft', 'px')}" onchange="updateStyle('marginLeft', this.value + 'px')">`;
            html += '</div></div>';
            html += '</div>';

            // Sección Posicionamiento
            html += '<div class="property-section">';
            html += '<div class="section-title">Posicionamiento</div>';
            const display = getStyleValue('display');
            const position = getStyleValue('position');
            html += `<div class="property-group">
                        <label class="property-label">Display</label>
                        <select class="property-input" onchange="updateStyle('display', this.value)">
                            <option value="block" ${display === 'block' ? 'selected' : ''}>Block</option>
                            <option value="inline-block" ${display === 'inline-block' ? 'selected' : ''}>Inline-block</option>
                            <option value="flex" ${display === 'flex' ? 'selected' : ''}>Flex</option>
                            <option value="grid" ${display === 'grid' ? 'selected' : ''}>Grid</option>
                            <option value="none" ${display === 'none' ? 'selected' : ''}>None</option>
                        </select>
                     </div>`;
            html += `<div class="property-group">
                        <label class="property-label">Position</label>
                        <select class="property-input" onchange="updateStyle('position', this.value)">
                            <option value="static" ${position === 'static' || !position ? 'selected' : ''}>Static</option>
                            <option value="relative" ${position === 'relative' ? 'selected' : ''}>Relative</option>
                            <option value="absolute" ${position === 'absolute' ? 'selected' : ''}>Absolute</option>
                            <option value="fixed" ${position === 'fixed' ? 'selected' : ''}>Fixed</option>
                        </select>
                     </div>`;
            html += '</div>';

            // Sección Tipografía (solo para elementos de texto)
            if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'button', 'label'].includes(tagName)) {
                html += '<div class="property-section">';
                html += '<div class="section-title">Tipografía</div>';
                const fontSize = getStyleValue('fontSize');
                const fontWeight = getStyleValue('fontWeight');
                const fontFamily = getStyleValue('fontFamily');
                const color = getStyleValue('color');
                const textAlign = getStyleValue('textAlign');
                html += `<div class="property-group">
                            <label class="property-label">Font Family</label>
                            <select class="property-input" onchange="updateStyle('fontFamily', this.value)">
                                <option value="">-- Default --</option>
                                <optgroup label="Sans-Serif (Modern)">
                                    <option value="Inter" ${fontFamily.includes('Inter') ? 'selected' : ''}>Inter</option>
                                    <option value="Poppins" ${fontFamily.includes('Poppins') ? 'selected' : ''}>Poppins</option>
                                    <option value="Montserrat" ${fontFamily.includes('Montserrat') ? 'selected' : ''}>Montserrat</option>
                                    <option value="Raleway" ${fontFamily.includes('Raleway') ? 'selected' : ''}>Raleway</option>
                                    <option value="Work Sans" ${fontFamily.includes('Work Sans') ? 'selected' : ''}>Work Sans</option>
                                    <option value="DM Sans" ${fontFamily.includes('DM Sans') ? 'selected' : ''}>DM Sans</option>
                                    <option value="Plus Jakarta Sans" ${fontFamily.includes('Plus Jakarta') ? 'selected' : ''}>Plus Jakarta Sans</option>
                                    <option value="Manrope" ${fontFamily.includes('Manrope') ? 'selected' : ''}>Manrope</option>
                                    <option value="Space Grotesk" ${fontFamily.includes('Space Grotesk') ? 'selected' : ''}>Space Grotesk</option>
                                </optgroup>
                                <optgroup label="Sans-Serif (Classic)">
                                    <option value="Roboto" ${fontFamily.includes('Roboto') && !fontFamily.includes('Mono') ? 'selected' : ''}>Roboto</option>
                                    <option value="Open Sans" ${fontFamily.includes('Open Sans') ? 'selected' : ''}>Open Sans</option>
                                    <option value="Lato" ${fontFamily.includes('Lato') ? 'selected' : ''}>Lato</option>
                                    <option value="Source Sans Pro" ${fontFamily.includes('Source Sans') ? 'selected' : ''}>Source Sans Pro</option>
                                    <option value="Nunito" ${fontFamily.includes('Nunito') ? 'selected' : ''}>Nunito</option>
                                    <option value="Ubuntu" ${fontFamily.includes('Ubuntu') && !fontFamily.includes('Mono') ? 'selected' : ''}>Ubuntu</option>
                                </optgroup>
                                <optgroup label="Serif">
                                    <option value="Playfair Display" ${fontFamily.includes('Playfair') ? 'selected' : ''}>Playfair Display</option>
                                    <option value="Merriweather" ${fontFamily.includes('Merriweather') ? 'selected' : ''}>Merriweather</option>
                                    <option value="Lora" ${fontFamily.includes('Lora') ? 'selected' : ''}>Lora</option>
                                    <option value="Source Serif Pro" ${fontFamily.includes('Source Serif') ? 'selected' : ''}>Source Serif Pro</option>
                                    <option value="PT Serif" ${fontFamily.includes('PT Serif') ? 'selected' : ''}>PT Serif</option>
                                </optgroup>
                                <optgroup label="Monospace">
                                    <option value="Fira Code" ${fontFamily.includes('Fira Code') ? 'selected' : ''}>Fira Code</option>
                                    <option value="JetBrains Mono" ${fontFamily.includes('JetBrains') ? 'selected' : ''}>JetBrains Mono</option>
                                    <option value="Source Code Pro" ${fontFamily.includes('Source Code') ? 'selected' : ''}>Source Code Pro</option>
                                    <option value="Roboto Mono" ${fontFamily.includes('Roboto Mono') ? 'selected' : ''}>Roboto Mono</option>
                                </optgroup>
                                <optgroup label="Display">
                                    <option value="Bebas Neue" ${fontFamily.includes('Bebas') ? 'selected' : ''}>Bebas Neue</option>
                                    <option value="Oswald" ${fontFamily.includes('Oswald') ? 'selected' : ''}>Oswald</option>
                                    <option value="Anton" ${fontFamily.includes('Anton') ? 'selected' : ''}>Anton</option>
                                </optgroup>
                                <optgroup label="Script">
                                    <option value="Caveat" ${fontFamily.includes('Caveat') ? 'selected' : ''}>Caveat</option>
                                    <option value="Dancing Script" ${fontFamily.includes('Dancing') ? 'selected' : ''}>Dancing Script</option>
                                    <option value="Pacifico" ${fontFamily.includes('Pacifico') ? 'selected' : ''}>Pacifico</option>
                                </optgroup>
                            </select>
                         </div>`;
                html += `<div class="property-group">
                            <label class="property-label">Font Size</label>
                            <input class="property-input" value="${fontSize}" onchange="updateStyle('fontSize', this.value)">
                         </div>`;
                html += `<div class="property-group">
                            <label class="property-label">Font Weight</label>
                            <select class="property-input" onchange="updateStyle('fontWeight', this.value)">
                                <option value="300" ${fontWeight === '300' ? 'selected' : ''}>Light</option>
                                <option value="normal" ${fontWeight === 'normal' || fontWeight === '400' ? 'selected' : ''}>Normal</option>
                                <option value="500" ${fontWeight === '500' ? 'selected' : ''}>Medium</option>
                                <option value="600" ${fontWeight === '600' ? 'selected' : ''}>Semibold</option>
                                <option value="bold" ${fontWeight === 'bold' || fontWeight === '700' ? 'selected' : ''}>Bold</option>
                                <option value="800" ${fontWeight === '800' ? 'selected' : ''}>Extra Bold</option>
                                <option value="900" ${fontWeight === '900' ? 'selected' : ''}>Black</option>
                            </select>
                         </div>`;
                html += `<div class="property-group">
                            <label class="property-label">Color</label>
                            <input type="color" class="property-input" value="${rgbToHex(color || '#000000')}" onchange="updateStyle('color', this.value)">
                         </div>`;
                html += `<div class="property-group">
                            <label class="property-label">Text Align</label>
                            <div class="text-align-buttons">
                                <button class="text-align-btn ${textAlign === 'left' ? 'active' : ''}" onclick="updateStyle('textAlign', 'left')">L</button>
                                <button class="text-align-btn ${textAlign === 'center' ? 'active' : ''}" onclick="updateStyle('textAlign', 'center')">C</button>
                                <button class="text-align-btn ${textAlign === 'right' ? 'active' : ''}" onclick="updateStyle('textAlign', 'right')">R</button>
                                <button class="text-align-btn ${textAlign === 'justify' ? 'active' : ''}" onclick="updateStyle('textAlign', 'justify')">J</button>
                            </div>
                         </div>`;
                html += '</div>';
            }

            // Sección Fondo y Bordes
            html += '<div class="property-section">';
            html += '<div class="section-title">Fondo y Bordes</div>';
            const bgColor = getStyleValue('backgroundColor');
            const borderWidth = getStyleValue('borderWidth', 'px');
            const borderStyle = getStyleValue('borderStyle');
            const borderColor = getStyleValue('borderColor');
            const borderRadius = getStyleValue('borderRadius', 'px');
            html += `<div class="property-group">
                        <label class="property-label">Background Color</label>
                        <input type="color" class="property-input" value="${rgbToHex(bgColor || '#ffffff')}" onchange="updateStyle('backgroundColor', this.value)">
                     </div>`;
            html += `<div class="property-group">
                        <label class="property-label">Border Width (px)</label>
                        <input class="property-input" value="${borderWidth}" onchange="updateStyle('borderWidth', this.value + 'px')">
                     </div>`;
            html += `<div class="property-group">
                        <label class="property-label">Border Style</label>
                        <select class="property-input" onchange="updateStyle('borderStyle', this.value)">
                            <option value="none" ${borderStyle === 'none' ? 'selected' : ''}>None</option>
                            <option value="solid" ${borderStyle === 'solid' ? 'selected' : ''}>Solid</option>
                            <option value="dashed" ${borderStyle === 'dashed' ? 'selected' : ''}>Dashed</option>
                            <option value="dotted" ${borderStyle === 'dotted' ? 'selected' : ''}>Dotted</option>
                        </select>
                     </div>`;
            html += `<div class="property-group">
                        <label class="property-label">Border Color</label>
                        <input type="color" class="property-input" value="${rgbToHex(borderColor || '#000000')}" onchange="updateStyle('borderColor', this.value)">
                     </div>`;
            html += `<div class="property-group">
                        <label class="property-label">Border Radius (px)</label>
                        <input class="property-input" value="${borderRadius}" onchange="updateStyle('borderRadius', this.value + 'px')">
                     </div>`;
            html += '</div>';

            // Sección Sombra y Efectos
            html += '<div class="property-section">';
            html += '<div class="section-title">Sombra y Efectos</div>';
            const boxShadow = getStyleValue('boxShadow');
            const opacity = getStyleValue('opacity');
            html += `<div class="property-group">
                        <label class="property-label">Box Shadow</label>
                        <select class="property-input" onchange="updateStyle('boxShadow', this.value)">
                            <option value="none" ${boxShadow === 'none' ? 'selected' : ''}>Ninguna</option>
                            <option value="0 1px 3px rgba(0,0,0,0.1)" ${boxShadow && boxShadow.includes('0px 1px 3px') || boxShadow && boxShadow.includes('0 1px 3px') ? 'selected' : ''}>Sutil</option>
                            <option value="0 2px 6px rgba(0,0,0,0.15)" ${boxShadow && boxShadow.includes('0px 2px 6px') || boxShadow && boxShadow.includes('0 2px 6px') ? 'selected' : ''}>Media</option>
                            <option value="0 4px 12px rgba(0,0,0,0.15)" ${boxShadow && boxShadow.includes('0px 4px 12px') || boxShadow && boxShadow.includes('0 4px 12px') ? 'selected' : ''}>Fuerte</option>
                        </select>
                     </div>`;
            const opacityPercent = opacity ? Math.round(parseFloat(opacity) * 100) : 100;
            html += `<div class="property-group">
                        <label class="property-label">Opacity</label>
                        <input type="range" min="0" max="100" value="${opacityPercent}" class="property-input" onchange="updateStyle('opacity', this.value / 100)">
                        <div style="font-size: 12px; color: #64748b; text-align: right;">${opacityPercent}%</div>
                     </div>`;
            html += '</div>';

            // Sección Flexbox (si display es flex)
            if (display === 'flex') {
                html += '<div class="property-section">';
                html += '<div class="section-title">Flexbox</div>';
                const flexDirection = getStyleValue('flexDirection');
                const justifyContent = getStyleValue('justifyContent');
                const alignItems = getStyleValue('alignItems');
                const gap = getStyleValue('gap', 'px');
                html += `<div class="property-group">
                            <label class="property-label">Flex Direction</label>
                            <select class="property-input" onchange="updateStyle('flexDirection', this.value)">
                                <option value="row" ${flexDirection === 'row' ? 'selected' : ''}>Row</option>
                                <option value="column" ${flexDirection === 'column' ? 'selected' : ''}>Column</option>
                                <option value="row-reverse" ${flexDirection === 'row-reverse' ? 'selected' : ''}>Row Reverse</option>
                                <option value="column-reverse" ${flexDirection === 'column-reverse' ? 'selected' : ''}>Column Reverse</option>
                            </select>
                         </div>`;
                html += `<div class="property-group">
                            <label class="property-label">Justify Content</label>
                            <select class="property-input" onchange="updateStyle('justifyContent', this.value)">
                                <option value="flex-start" ${justifyContent === 'flex-start' ? 'selected' : ''}>Flex Start</option>
                                <option value="center" ${justifyContent === 'center' ? 'selected' : ''}>Center</option>
                                <option value="flex-end" ${justifyContent === 'flex-end' ? 'selected' : ''}>Flex End</option>
                                <option value="space-between" ${justifyContent === 'space-between' ? 'selected' : ''}>Space Between</option>
                                <option value="space-around" ${justifyContent === 'space-around' ? 'selected' : ''}>Space Around</option>
                                <option value="space-evenly" ${justifyContent === 'space-evenly' ? 'selected' : ''}>Space Evenly</option>
                            </select>
                         </div>`;
                html += `<div class="property-group">
                            <label class="property-label">Align Items</label>
                            <select class="property-input" onchange="updateStyle('alignItems', this.value)">
                                <option value="flex-start" ${alignItems === 'flex-start' ? 'selected' : ''}>Flex Start</option>
                                <option value="center" ${alignItems === 'center' ? 'selected' : ''}>Center</option>
                                <option value="flex-end" ${alignItems === 'flex-end' ? 'selected' : ''}>Flex End</option>
                                <option value="stretch" ${alignItems === 'stretch' ? 'selected' : ''}>Stretch</option>
                                <option value="baseline" ${alignItems === 'baseline' ? 'selected' : ''}>Baseline</option>
                            </select>
                         </div>`;
                const alignContent = getStyleValue('alignContent');
                html += `<div class="property-group">
                            <label class="property-label">Align Content</label>
                            <select class="property-input" onchange="updateStyle('alignContent', this.value)">
                                <option value="flex-start" ${alignContent === 'flex-start' ? 'selected' : ''}>Flex Start</option>
                                <option value="center" ${alignContent === 'center' ? 'selected' : ''}>Center</option>
                                <option value="flex-end" ${alignContent === 'flex-end' ? 'selected' : ''}>Flex End</option>
                                <option value="space-between" ${alignContent === 'space-between' ? 'selected' : ''}>Space Between</option>
                                <option value="space-around" ${alignContent === 'space-around' ? 'selected' : ''}>Space Around</option>
                                <option value="stretch" ${alignContent === 'stretch' ? 'selected' : ''}>Stretch</option>
                            </select>
                         </div>`;
                html += `<div class="property-group">
                            <label class="property-label">Gap (px)</label>
                            <input class="property-input" value="${gap}" onchange="updateStyle('gap', this.value + 'px')">
                         </div>`;
                html += '</div>';
            }

            // Sección Grid (si display es grid)
            if (display === 'grid') {
                html += '<div class="property-section">';
                html += '<div class="section-title">Grid</div>';
                const gridTemplateColumns = getStyleValue('gridTemplateColumns');
                const gridTemplateRows = getStyleValue('gridTemplateRows');
                const gridGap = getStyleValue('gridGap', 'px') || getStyleValue('gap', 'px');
                const justifyItems = getStyleValue('justifyItems');
                const gridAlignItems = getStyleValue('alignItems');
                html += `<div class="property-group">
                            <label class="property-label">Grid Template Columns</label>
                            <input class="property-input" value="${gridTemplateColumns}" placeholder="1fr 1fr" onchange="updateStyle('gridTemplateColumns', this.value)">
                         </div>`;
                html += `<div class="property-group">
                            <label class="property-label">Grid Template Rows</label>
                            <input class="property-input" value="${gridTemplateRows}" placeholder="auto auto" onchange="updateStyle('gridTemplateRows', this.value)">
                         </div>`;
                html += `<div class="property-group">
                            <label class="property-label">Grid Gap (px)</label>
                            <input class="property-input" value="${gridGap || '0'}" onchange="updateStyle('gridGap', this.value + 'px')">
                         </div>`;
                html += `<div class="property-group">
                            <label class="property-label">Justify Items</label>
                            <select class="property-input" onchange="updateStyle('justifyItems', this.value)">
                                <option value="stretch" ${justifyItems === 'stretch' ? 'selected' : ''}>Stretch</option>
                                <option value="center" ${justifyItems === 'center' ? 'selected' : ''}>Center</option>
                                <option value="start" ${justifyItems === 'start' ? 'selected' : ''}>Start</option>
                                <option value="end" ${justifyItems === 'end' ? 'selected' : ''}>End</option>
                            </select>
                         </div>`;
                html += `<div class="property-group">
                            <label class="property-label">Align Items</label>
                            <select class="property-input" onchange="updateStyle('alignItems', this.value)">
                                <option value="stretch" ${gridAlignItems === 'stretch' ? 'selected' : ''}>Stretch</option>
                                <option value="center" ${gridAlignItems === 'center' ? 'selected' : ''}>Center</option>
                                <option value="start" ${gridAlignItems === 'start' ? 'selected' : ''}>Start</option>
                                <option value="end" ${gridAlignItems === 'end' ? 'selected' : ''}>End</option>
                            </select>
                         </div>`;
                html += '</div>';
            }

            // Sección Transiciones y Animaciones
            html += '<div class="property-section">';
            html += '<div class="section-title">Transiciones</div>';
            const transition = getStyleValue('transition');
            html += `<div class="property-group">
                        <label class="property-label">Transition</label>
                        <select class="property-input" onchange="updateStyle('transition', this.value)">
                            <option value="" ${!transition ? 'selected' : ''}>Ninguna</option>
                            <option value="all 0.3s ease" ${transition && transition.includes('0.3s') ? 'selected' : ''}>Suave (0.3s)</option>
                            <option value="all 0.5s ease" ${transition && transition.includes('0.5s') ? 'selected' : ''}>Lenta (0.5s)</option>
                        </select>
                     </div>`;
            html += '</div>';

            // Sección Atributos Específicos
            html += '<div class="property-section">';
            html += '<div class="section-title">Atributos</div>';

            if (tagName === 'img') {
                html += `<div class="property-group">
                            <label class="property-label">Src</label>
                            <input class="property-input" value="${element.src}" onchange="updateAttribute('src', this.value)">
                         </div>`;
                html += `<div class="property-group">
                            <label class="property-label">Alt</label>
                            <input class="property-input" value="${element.alt}" onchange="updateAttribute('alt', this.value)">
                         </div>`;
            } else if (tagName === 'a') {
                html += `<div class="property-group">
                            <label class="property-label">Href</label>
                            <input class="property-input" value="${element.href || ''}" onchange="updateAttribute('href', this.value)">
                         </div>`;
                html += `<div class="property-group">
                            <label class="property-label">Target</label>
                            <select class="property-input" onchange="updateAttribute('target', this.value)">
                                <option value="_self" ${element.target === '_self' || !element.target ? 'selected' : ''}>Same Window</option>
                                <option value="_blank" ${element.target === '_blank' ? 'selected' : ''}>New Window</option>
                            </select>
                         </div>`;
            } else if (tagName === 'input') {
                html += `<div class="property-group">
                            <label class="property-label">Type</label>
                            <input class="property-input" value="${element.type}" onchange="updateAttribute('type', this.value)">
                         </div>`;
                html += `<div class="property-group">
                            <label class="property-label">Placeholder</label>
                            <input class="property-input" value="${element.placeholder}" onchange="updateAttribute('placeholder', this.value)">
                         </div>`;
            } else if (tagName === 'button') {
                html += `<div class="property-group">
                            <label class="property-label">Type</label>
                            <select class="property-input" onchange="updateAttribute('type', this.value)">
                                <option value="button" ${element.type === 'button' ? 'selected' : ''}>Button</option>
                                <option value="submit" ${element.type === 'submit' ? 'selected' : ''}>Submit</option>
                                <option value="reset" ${element.type === 'reset' ? 'selected' : ''}>Reset</option>
                            </select>
                         </div>`;
            }
            html += '</div>';

            panel.innerHTML = html;
        }

        // Actualizar estilo del elemento seleccionado
        function updateStyle(property, value) {
            if (selectedElement) {
                selectedElement.style[property] = value;
                // Recargar propiedades si cambia display
                if (property === 'display') {
                    loadProperties(selectedElement);
                }
            }
        }

        // Actualizar atributo del elemento seleccionado
        function updateAttribute(attribute, value) {
            if (selectedElement) {
                if (attribute === 'class') {
                    selectedElement.className = 'canvas-element selected ' + value;
                } else {
                    selectedElement.setAttribute(attribute, value);
                }
            }
        }

        // Exponer funciones al scope global para que funcionen los onchange inline
        window.updateStyle = updateStyle;
        window.updateAttribute = updateAttribute;

        // Hacer elemento editable
        function makeElementEditable(element) {
            const tagName = element.tagName.toLowerCase();

            // Solo para elementos de texto
            if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'button', 'a', 'li', 'label'].includes(tagName)) {
                element.contentEditable = true;
                element.focus();

                // Seleccionar todo el texto
                const range = document.createRange();
                range.selectNodeContents(element);
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);

                // Guardar cambios al salir
                element.addEventListener('blur', function() {
                    element.contentEditable = false;
                }, { once: true });

                element.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        element.blur();
                    }
                });
            }
        }

        // Eliminar elemento
        function deleteElement(element) {
            if (selectedElement === element) {
                selectedElement = null;
                document.getElementById('properties-panel').innerHTML = `
                    <h2 class="panel-title">Propiedades</h2>
                    <div class="properties-empty">
                        ← Arrastra componentes al canvas o selecciona un elemento para editar sus propiedades
                    </div>
                `;
            }
            element.remove();
        }

        // Toggle categoría
        function toggleCategory(titleElement) {
            titleElement.classList.toggle('collapsed');
            const list = titleElement.nextElementSibling;
            list.classList.toggle('collapsed');
        }

        // Cambiar tamaño del canvas
        function setCanvasSize(size) {
            const wrapper = document.getElementById('canvasWrapper');
            const buttons = ['btnDesktop', 'btnTablet', 'btnMobile'];

            // Remover clases de botones y dropdown items
            wrapper.className = 'canvas-wrapper';
            buttons.forEach(id => {
                const btn = document.getElementById(id);
                if (btn) btn.classList.remove('active');
                // Sync dropdown items
                const dropdownItem = document.querySelector(`.dropdown-item#${id}`);
                if (dropdownItem) dropdownItem.classList.remove('active');
            });

            // Aplicar nueva clase
            if (size === 'tablet') {
                wrapper.classList.add('tablet');
                const btn = document.getElementById('btnTablet');
                if (btn) btn.classList.add('active');
                const dropdownItem = document.querySelector('.dropdown-item#btnTablet');
                if (dropdownItem) dropdownItem.classList.add('active');
            } else if (size === 'mobile') {
                wrapper.classList.add('mobile');
                const btn = document.getElementById('btnMobile');
                if (btn) btn.classList.add('active');
                const dropdownItem = document.querySelector('.dropdown-item#btnMobile');
                if (dropdownItem) dropdownItem.classList.add('active');
            } else {
                const btn = document.getElementById('btnDesktop');
                if (btn) btn.classList.add('active');
                const dropdownItem = document.querySelector('.dropdown-item#btnDesktop');
                if (dropdownItem) dropdownItem.classList.add('active');
            }
        }

        // Nuevo proyecto
        function newProject() {
            if (confirm('¿Estás seguro de que quieres crear un nuevo proyecto? Se perderán los cambios no guardados.')) {
                document.getElementById('canvas').innerHTML = '';
                selectedElement = null;
                document.getElementById('properties-panel').innerHTML = `
                    <h2 class="panel-title">Propiedades</h2>
                    <div class="properties-empty">
                        ← Arrastra componentes al canvas o selecciona un elemento para editar sus propiedades
                    </div>
                `;
                showToast('Proyecto nuevo creado');
            }
        }

        // Exportar HTML
        function exportHTML() {
            const canvas = document.getElementById('canvas');
            const clone = canvas.cloneNode(true);

            // Limpiar elementos del editor
            const elements = clone.querySelectorAll('.canvas-element');
            elements.forEach(el => {
                el.classList.remove('canvas-element', 'selected');
                const deleteBtn = el.querySelector('.delete-btn');
                if (deleteBtn) deleteBtn.remove();
                el.removeAttribute('draggable');
                el.removeAttribute('data-component-type');
            });

            // Generar HTML completo
            const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Página Web</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
${clone.innerHTML}
</body>
</html>`;

            // Descargar archivo
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'index.html';
            a.click();
            URL.revokeObjectURL(url);

            showToast('HTML exportado correctamente');
        }

        // Exportar todo como ZIP
        function exportZip() {
            // Primero generamos los contenidos
            const canvas = document.getElementById('canvas');
            const clone = canvas.cloneNode(true);

            // Limpiar elementos del editor
            const elements = clone.querySelectorAll('.canvas-element');
            elements.forEach(el => {
                el.classList.remove('canvas-element', 'selected');
                const deleteBtn = el.querySelector('.delete-btn');
                if (deleteBtn) deleteBtn.remove();
                el.removeAttribute('draggable');
                el.removeAttribute('data-component-type');
            });

            // CSS general
            const css = `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: system-ui, -apple-system, sans-serif;
}

/* Estilos de componentes */
.component-card {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    max-width: 400px;
}

.component-card img {
    width: 100%;
    border-radius: 8px 8px 0 0;
}

.component-card-body {
    padding: 20px;
}

.component-navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 32px;
    background: #1e293b;
    color: white;
}

.component-navbar-brand {
    font-size: 1.5rem;
    font-weight: bold;
}

.component-navbar-nav {
    display: flex;
    gap: 20px;
    list-style: none;
}

.component-navbar-nav a {
    color: white;
    text-decoration: none;
}

.component-hero {
    min-height: 400px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    text-align: center;
    padding: 60px 20px;
}

.component-footer {
    background: #1e293b;
    color: white;
    padding: 40px 20px;
    text-align: center;
}

/* Estilos de componentes adicionales */
.tabs-container {
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    overflow: hidden;
}

.tab-btn {
    border: none;
    background: transparent;
    padding: 12px 20px;
    cursor: pointer;
    font-weight: 500;
}

.tab-btn.active {
    border-bottom: 2px solid #2563eb;
    color: #2563eb;
    background: #f1f5f9;
}

.accordion-header {
    background: #f8fafc;
    padding: 16px 20px;
    cursor: pointer;
    border-bottom: 1px solid #e2e8f0;
    font-weight: 500;
}

.accordion-content {
    padding: 20px;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    padding: 30px;
    border-radius: 8px;
    width: 500px;
    position: relative;
    max-width: 90%;
}

.modal-close {
    position: absolute;
    top: 10px;
    right: 15px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
}

.carousel-container {
    overflow: hidden;
    position: relative;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.carousel-slides {
    display: flex;
    transition: transform 0.3s ease;
}

.carousel-prev, .carousel-next {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: white;
    border: 1px solid #cbd5e1;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    cursor: pointer;
    z-index: 10;
}

.carousel-prev {
    left: 10px;
}

.carousel-next {
    right: 10px;
}

.alert {
    padding: 16px;
    border-radius: 6px;
    display: flex;
    align-items: center;
}

.alert-info { border-left: 4px solid #3b82f6; background: #dbeafe; color: #1e3a8a; }
.alert-success { border-left: 4px solid #10b981; background: #d1fae5; color: #065f46; }
.alert-warning { border-left: 4px solid #f59e0b; background: #fef3c7; color: #92400e; }
.alert-error { border-left: 4px solid #ef4444; background: #fee2e2; color: #991b1b; }

.badge {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: bold;
    display: inline-block;
}
`;

            // HTML
            const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Página Web</title>
    <link rel="stylesheet" href="styles.css">
    <script src="script.js"><\/script>
</head>
<body>
${clone.innerHTML}
</body>
</html>`;

            // JavaScript para componentes interactivos
            const js = `// Script para componentes interactivos
document.addEventListener('DOMContentLoaded', function() {
    // Manejar pestañas
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remover la clase activa de todos los botones
            tabButtons.forEach(b => b.classList.remove('active'));
            // Agregar clase activa al botón clickeado
            this.classList.add('active');
        });
    });

    // Manejar acordeón
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            if (content.style.display === 'none' || content.style.display === '') {
                content.style.display = 'block';
            } else {
                content.style.display = 'none';
            }
        });
    });

    // Manejar modales
    const modalTriggers = document.querySelectorAll('.modal-trigger');
    modalTriggers.forEach(trigger => {
        const modal = trigger.nextElementSibling;
        const closeBtn = modal.querySelector('.modal-close');
        const modalBtn = modal.querySelector('.modal-btn');

        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            modal.style.display = 'flex';
        });

        function closeModal() {
            modal.style.display = 'none';
        }

        closeBtn.addEventListener('click', closeModal);
        modalBtn.addEventListener('click', closeModal);

        // Cerrar al hacer clic fuera del contenido
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    });

    // Manejar carrusel
    const carousels = document.querySelectorAll('.carousel-container');
    carousels.forEach(carousel => {
        const slidesContainer = carousel.querySelector('.carousel-slides');
        const prevBtn = carousel.querySelector('.carousel-prev');
        const nextBtn = carousel.querySelector('.carousel-next');
        let currentSlide = 0;
        const slides = carousel.querySelectorAll('.carousel-slides > div');

        function updateCarousel() {
            slidesContainer.style.transform = \`translateX(-\${currentSlide * 100}%)\`;
        }

        prevBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (currentSlide > 0) {
                currentSlide--;
                updateCarousel();
            }
        });

        nextBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (currentSlide < slides.length - 1) {
                currentSlide++;
                updateCarousel();
            }
        });
    });
});
`;

            // Crear archivos y simular descarga
            downloadFile('index.html', html);
            downloadFile('styles.css', css);
            downloadFile('script.js', js);
            
            showToast('Archivos exportados: index.html, styles.css, script.js');
        }

        // Función auxiliar para descargar archivos
        function downloadFile(filename, content) {
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }

        // Guardar proyecto (versión mejorada)
        function saveProject() {
            try {
                const project = enhancedProjectManager.saveCurrentProject();
                showToast('Proyecto guardado en formato mejorado');
            } catch (error) {
                console.error('Error al guardar proyecto:', error);
                showToast('Error al guardar proyecto', 'error');
            }
        }

        // Cargar proyecto
        function loadProject(event) {
            const files = event.target.files;
            if (!files || files.length === 0) return;

            // Si es un solo archivo JSON, usar el gestor mejorado
            if (files.length === 1 && files[0].name.endsWith('.json')) {
                const file = files[0];
                enhancedProjectManager.importProject(file)
                    .then(project => {
                        console.log('Proyecto cargado:', project);
                    })
                    .catch(error => {
                        console.error('Error al cargar proyecto:', error);
                        showToast('Error al cargar el proyecto', 'error');
                    });
                return;
            }

            // Si es un archivo HTML, usar el parser HTML
            if (files.length === 1 && (files[0].name.endsWith('.html') || files[0].name.endsWith('.htm'))) {
                const file = files[0];
                htmlParser.parseHTMLFile(file)
                    .then(project => {
                        const success = enhancedProjectManager.loadProjectToCanvas(project);
                        if (success) {
                            showToast('Archivo HTML convertido y cargado');
                        } else {
                            showToast('Error al cargar el archivo HTML', 'error');
                        }
                    })
                    .catch(error => {
                        console.error('Error al parsear HTML:', error);
                        showToast('Error al procesar el archivo HTML', 'error');
                    });
                return;
            }

            // Si son múltiples archivos o directorio, procesarlos con FileLoader
            if (fileLoader) {
                // Buscar archivo HTML principal
                let htmlFile = null;
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
                        if (file.name.toLowerCase().includes('index') || !htmlFile) {
                            htmlFile = file;
                        }
                    }
                }

                if (htmlFile) {
                    // Usar el parser HTML para el archivo principal
                    htmlParser.parseHTMLFile(htmlFile)
                        .then(project => {
                            const success = enhancedProjectManager.loadProjectToCanvas(project);
                            if (success) {
                                showToast(`Directorio HTML cargado: ${files.length} archivos procesados`);
                            }
                        })
                        .catch(error => {
                            console.error('Error al procesar directorio:', error);
                            showToast('Error al procesar el directorio', 'error');
                        });
                } else {
                    showToast('No se encontró archivo HTML en el directorio seleccionado', 'error');
                }
            } else {
                showToast('Selecciona un archivo JSON o HTML individual', 'error');
            }

            // Limpiar input
            event.target.value = '';
        }

        // Analizar directorio completo con ProjectAnalyzer
        async function analyzeDirectory(event) {
            const files = event.target.files;
            
            if (!files || files.length === 0) {
                return;
            }

            if (!window.projectAnalyzer) {
                showToast('⚠️ ProjectAnalyzer no está disponible', 'error');
                return;
            }

            try {
                const project = await window.projectAnalyzer.loadDirectory(files);
                console.log('✅ Proyecto analizado:', project);
            } catch (error) {
                console.error('Error analizando directorio:', error);
            }

            // Limpiar input
            event.target.value = '';
        }

        // Atajos de teclado
        function setupKeyboardShortcuts() {
            document.addEventListener('keydown', function(e) {
                // Delete: eliminar elemento seleccionado
                if (e.key === 'Delete' && selectedElement) {
                    deleteElement(selectedElement);
                }

                // Ctrl+S: guardar proyecto
                if (e.ctrlKey && e.key === 's') {
                    e.preventDefault();
                    saveProject();
                }
            });

            // Deseleccionar al hacer click en el canvas
            document.getElementById('canvas').addEventListener('click', function(e) {
                if (e.target.id === 'canvas') {
                    if (selectedElement) {
                        selectedElement.classList.remove('selected');
                        selectedElement = null;
                    }
                    document.getElementById('properties-panel').innerHTML = `
                        <h2 class="panel-title">Propiedades</h2>
                        <div class="properties-empty">
                            ← Arrastra componentes al canvas o selecciona un elemento para editar sus propiedades
                        </div>
                    `;
                }
            });
        }

        // Mostrar toast notification
        function showToast(message) {
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.textContent = message;
            document.body.appendChild(toast);

            setTimeout(() => {
                toast.remove();
            }, 3000);
        }
        
        // Exportar showToast globalmente
        window.showToast = showToast;

        // Convertir RGB a HEX
        function rgbToHex(rgb) {
            if (!rgb || rgb === 'transparent') return '#ffffff';
            if (rgb.startsWith('#')) return rgb;

            const result = rgb.match(/\d+/g);
            if (!result) return '#ffffff';

            const r = parseInt(result[0]);
            const g = parseInt(result[1]);
            const b = parseInt(result[2]);

            return '#' + [r, g, b].map(x => {
                const hex = x.toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            }).join('');
        }

        // ===== NUEVAS FUNCIONES PARA MEJORAS =====

        // Importar archivo HTML (versión mejorada)
        function importHTMLFile(event) {
            const file = event.target.files[0];
            if (!file) return;

            if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
                htmlParser.parseHTMLFile(file)
                    .then(project => {
                        const success = enhancedProjectManager.loadProjectToCanvas(project);
                        if (success) {
                            showToast('Archivo HTML importado y convertido a JSON');
                        } else {
                            showToast('Error al importar el archivo HTML', 'error');
                        }
                    })
                    .catch(error => {
                        console.error('Error al importar HTML:', error);
                        showToast('Error al procesar el archivo HTML', 'error');
                    });
            } else {
                showToast('Por favor selecciona un archivo HTML válido', 'error');
            }

            // Limpiar input
            event.target.value = '';
        }

        // Mostrar panel de proyectos
        function showProjectsPanel() {
            const panel = document.getElementById('projectsPanel');
            panel.classList.remove('hidden');
            loadProjectsList();
        }

        // Ocultar panel de proyectos
        function hideProjectsPanel() {
            const panel = document.getElementById('projectsPanel');
            panel.classList.add('hidden');
        }

        // Cargar lista de proyectos
        function loadProjectsList() {
            if (!projectManager) return;
            
            const projectsList = document.getElementById('projectsList');
            const projects = projectManager.getStoredProjects();
            
            if (projects.length === 0) {
                projectsList.innerHTML = '<div style="text-align: center; color: #64748b; padding: 40px;">No hay proyectos guardados</div>';
                return;
            }
            
            projectsList.innerHTML = projects.map(project => `
                <div class="project-card" onclick="loadProjectFromPanel('${project.id}')">
                    <div class="project-thumbnail">
                        ${project.thumbnail ? `<img src="${project.thumbnail}" style="width: 100%; height: 100%; object-fit: cover;">` : '📄'}
                    </div>
                    <div class="project-info">
                        <h4 class="project-name">${project.name}</h4>
                        <div class="project-meta">
                            Modificado: ${new Date(project.modified).toLocaleDateString()}
                        </div>
                        <div class="project-actions-card">
                            <button class="project-action-btn" onclick="event.stopPropagation(); renameProjectDialog('${project.id}')">Renombrar</button>
                            <button class="project-action-btn" onclick="event.stopPropagation(); duplicateProjectFromPanel('${project.id}')">Duplicar</button>
                            <button class="project-action-btn" onclick="event.stopPropagation(); exportProjectFromPanel('${project.id}')">Exportar</button>
                            <button class="project-action-btn danger" onclick="event.stopPropagation(); deleteProjectFromPanel('${project.id}')">Eliminar</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // Cargar proyecto desde panel
        function loadProjectFromPanel(projectId) {
            if (projectManager && projectManager.loadProject(projectId)) {
                hideProjectsPanel();
            }
        }

        // Eliminar proyecto desde panel
        function deleteProjectFromPanel(projectId) {
            if (confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
                projectManager.deleteProject(projectId);
                loadProjectsList();
            }
        }

        // Duplicar proyecto desde panel
        function duplicateProjectFromPanel(projectId) {
            projectManager.duplicateProject(projectId);
            loadProjectsList();
        }

        // Exportar proyecto desde panel
        function exportProjectFromPanel(projectId) {
            projectManager.exportProject(projectId);
        }

        // Mostrar diálogo de nuevo proyecto
        function createNewProjectDialog() {
            const modal = document.getElementById('newProjectModal');
            modal.classList.remove('hidden');
            const input = document.getElementById('projectName');
            input.focus();
            
            // Agregar listener para Enter
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    createNewProjectFromDialog();
                }
            });
        }

        // Ocultar diálogo de nuevo proyecto
        function hideNewProjectModal() {
            const modal = document.getElementById('newProjectModal');
            modal.classList.add('hidden');
            document.getElementById('projectName').value = '';
        }

        // Crear nuevo proyecto desde diálogo
        function createNewProjectFromDialog() {
            const name = document.getElementById('projectName').value.trim();
            if (name) {
                projectManager.createNewProject(name);
                hideNewProjectModal();
                hideProjectsPanel();
                // Limpiar canvas
                document.getElementById('canvas').innerHTML = '';
                selectedElement = null;
                document.getElementById('properties-panel').innerHTML = `
                    <h2 class="panel-title">Propiedades</h2>
                    <div class="properties-empty">
                        ← Arrastra componentes al canvas o selecciona un elemento para editar sus propiedades
                    </div>
                `;
            }
        }

        // Renombrar proyecto
        function renameProjectDialog(projectId) {
            const newName = prompt('Nuevo nombre del proyecto:');
            if (newName && newName.trim()) {
                projectManager.renameProject(projectId, newName.trim());
                loadProjectsList();
            }
        }

        // Importar proyecto desde archivo
        function importProjectFile(event) {
            const file = event.target.files[0];
            if (file && projectManager) {
                projectManager.importProject(file).then(project => {
                    if (project) {
                        loadProjectsList();
                    }
                });
            }
            event.target.value = '';
        }

        // Mostrar biblioteca de componentes
        function showComponentsLibrary() {
            const panel = document.getElementById('componentsLibraryPanel');
            panel.classList.remove('hidden');
            loadComponentsLibrary();
        }

        // Ocultar biblioteca de componentes
        function hideComponentsLibrary() {
            const panel = document.getElementById('componentsLibraryPanel');
            panel.classList.add('hidden');
        }

        // Cargar biblioteca de componentes
        function loadComponentsLibrary() {
            if (!componentExtractor) return;
            
            const componentsList = document.getElementById('libraryComponentsList');
            const components = componentExtractor.getStoredComponents();
            
            if (components.length === 0) {
                componentsList.innerHTML = '<div style="text-align: center; color: #64748b; padding: 40px;">No hay componentes en la biblioteca<br><small>Importa archivos HTML para extraer componentes automáticamente</small></div>';
                return;
            }
            
            componentsList.innerHTML = components.map(component => `
                <div class="library-component-card" onclick="addComponentFromLibrary('${component.id}')">
                    <div class="component-preview">
                        ${component.preview || component.type}
                    </div>
                    <div class="component-info">
                        <h4 class="component-name">${component.name}</h4>
                        <div class="component-tags">
                            ${component.tags.map(tag => `<span class="component-tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // Buscar componentes en biblioteca
        function searchLibraryComponents() {
            const query = document.getElementById('componentLibrarySearch').value;
            if (!componentExtractor) return;
            
            const components = query ? 
                componentExtractor.searchComponents(query) : 
                componentExtractor.getStoredComponents();
            
            const componentsList = document.getElementById('libraryComponentsList');
            
            if (components.length === 0) {
                componentsList.innerHTML = '<div style="text-align: center; color: #64748b; padding: 40px;">No se encontraron componentes</div>';
                return;
            }
            
            componentsList.innerHTML = components.map(component => `
                <div class="library-component-card" onclick="addComponentFromLibrary('${component.id}')">
                    <div class="component-preview">
                        ${component.preview || component.type}
                    </div>
                    <div class="component-info">
                        <h4 class="component-name">${component.name}</h4>
                        <div class="component-tags">
                            ${component.tags.map(tag => `<span class="component-tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // Agregar componente desde biblioteca
        function addComponentFromLibrary(componentId) {
            if (!componentExtractor) return;
            
            const components = componentExtractor.getStoredComponents();
            const component = components.find(c => c.id === componentId);
            
            if (component) {
                // Crear elemento desde HTML del componente
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = component.html;
                const element = tempDiv.firstElementChild;
                
                if (element) {
                    // Asignar nuevo ID y clases del editor
                    element.id = 'element-' + (elementIdCounter++);
                    element.classList.add('canvas-element');
                    
                    // Agregar funcionalidad del editor
                    const deleteBtn = document.createElement('div');
                    deleteBtn.className = 'delete-btn';
                    deleteBtn.textContent = '×';
                    deleteBtn.onclick = function(e) {
                        e.stopPropagation();
                        deleteElement(element);
                    };
                    element.appendChild(deleteBtn);

                    element.addEventListener('click', function(e) {
                        e.stopPropagation();
                        selectElement(element);
                    });

                    element.addEventListener('dblclick', function(e) {
                        e.stopPropagation();
                        makeElementEditable(element);
                    });
                    
                    // Agregar al canvas
                    document.getElementById('canvas').appendChild(element);
                    hideComponentsLibrary();
                    showToast(`Componente "${component.name}" agregado`);
                }
            }
        }

        // Sobrescribir función de guardar proyecto para usar el nuevo sistema
        if (typeof saveProject !== 'undefined') {
            const originalSaveProject = saveProject;
            window.saveProject = function() {
                if (projectManager) {
                    projectManager.saveCurrentProject();
                } else {
                    originalSaveProject();
                }
            };
        }

        // Sobrescribir función de cargar proyecto
        if (typeof loadProject !== 'undefined') {
            const originalLoadProject = loadProject;
            window.loadProject = function(event) {
                const file = event.target.files[0];
                if (!file) return;

                if (projectManager) {
                    projectManager.importProject(file);
                } else {
                    originalLoadProject(event);
                }
            };
        }

        // ===== CLASE HTMLTOJSONPARSER =====
        
        class HTMLToJSONParser {
            constructor() {
                this.elementIdCounter = 0;
            }

            // Método principal para procesar archivo HTML
            async parseHTMLFile(file) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const htmlContent = e.target.result;
                            const jsonProject = this.convertHTMLToJSON(htmlContent);
                            resolve(jsonProject);
                        } catch (error) {
                            reject(error);
                        }
                    };
                    reader.onerror = () => reject(new Error('Error al leer el archivo'));
                    reader.readAsText(file);
                });
            }

            // Convertir HTML string a JSON estructurado
            convertHTMLToJSON(htmlContent) {
                // Crear un documento temporal para parsear el HTML
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlContent, 'text/html');

                // Extraer componentes principales
                const styles = this.extractStyles(doc);
                const scripts = this.extractScripts(doc);
                const bodyElements = this.extractBodyElements(doc);

                // Crear estructura JSON del proyecto
                const project = {
                    version: "2.0",
                    metadata: {
                        title: doc.title || 'Proyecto Importado',
                        created: new Date().toISOString(),
                        imported: true,
                        originalFile: 'imported.html'
                    },
                    elements: bodyElements,
                    styles: styles,
                    scripts: scripts,
                    canvas: {
                        size: 'desktop',
                        selectedElement: null
                    }
                };

                return project;
            }

            // Extraer estilos CSS del documento
            extractStyles(doc) {
                const styles = {
                    inline: {},
                    internal: [],
                    external: []
                };

                // Estilos internos (tags <style>)
                const styleTags = doc.querySelectorAll('style');
                styleTags.forEach((styleTag, index) => {
                    styles.internal.push({
                        id: `internal-${index}`,
                        content: styleTag.textContent
                    });
                });

                // Enlaces a CSS externos
                const linkTags = doc.querySelectorAll('link[rel="stylesheet"]');
                linkTags.forEach((link, index) => {
                    styles.external.push({
                        id: `external-${index}`,
                        href: link.href,
                        media: link.media || 'all'
                    });
                });

                return styles;
            }

            // Extraer scripts JavaScript del documento
            extractScripts(doc) {
                const scripts = {
                    inline: [],
                    external: []
                };

                const scriptTags = doc.querySelectorAll('script');
                scriptTags.forEach((script, index) => {
                    if (script.src) {
                        // Script externo
                        scripts.external.push({
                            id: `external-script-${index}`,
                            src: script.src,
                            async: script.async,
                            defer: script.defer
                        });
                    } else if (script.textContent.trim()) {
                        // Script inline
                        scripts.inline.push({
                            id: `inline-script-${index}`,
                            content: script.textContent
                        });
                    }
                });

                return scripts;
            }

            // Extraer elementos del body y convertir a estructura JSON
            extractBodyElements(doc) {
                const body = doc.body;
                if (!body) return [];

                const elements = [];
                Array.from(body.children).forEach(child => {
                    const element = this.buildElementTree(child);
                    if (element) {
                        elements.push(element);
                    }
                });

                return elements;
            }

            // Construir árbol de elementos recursivamente
            buildElementTree(domElement) {
                if (!domElement || domElement.nodeType !== Node.ELEMENT_NODE) {
                    return null;
                }

                // Generar ID único para el elemento
                const elementId = `imported-element-${this.elementIdCounter++}`;

                // Extraer estilos computados y inline
                const computedStyles = window.getComputedStyle ? 
                    this.getRelevantStyles(domElement) : {};
                const inlineStyles = this.parseInlineStyles(domElement.style.cssText);

                // Construir objeto elemento
                const element = {
                    id: elementId,
                    tagName: domElement.tagName.toLowerCase(),
                    textContent: this.getDirectTextContent(domElement),
                    attributes: this.extractAttributes(domElement),
                    styles: {
                        inline: inlineStyles,
                        computed: computedStyles
                    },
                    children: [],
                    metadata: {
                        originalId: domElement.id || null,
                        originalClasses: Array.from(domElement.classList),
                        canvasElement: true
                    }
                };

                // Procesar elementos hijos recursivamente
                Array.from(domElement.children).forEach(child => {
                    const childElement = this.buildElementTree(child);
                    if (childElement) {
                        element.children.push(childElement);
                    }
                });

                return element;
            }

            // Obtener solo el texto directo del elemento (sin hijos)
            getDirectTextContent(element) {
                let text = '';
                for (let node of element.childNodes) {
                    if (node.nodeType === Node.TEXT_NODE) {
                        text += node.textContent;
                    }
                }
                return text.trim();
            }

            // Extraer atributos relevantes del elemento
            extractAttributes(element) {
                const attributes = {};
                const relevantAttrs = ['id', 'class', 'src', 'href', 'alt', 'title', 'data-*', 'aria-*'];
                
                Array.from(element.attributes).forEach(attr => {
                    const name = attr.name;
                    const value = attr.value;
                    
                    // Incluir atributos relevantes
                    if (relevantAttrs.some(pattern => 
                        pattern.includes('*') ? name.startsWith(pattern.replace('*', '')) : name === pattern
                    )) {
                        attributes[name] = value;
                    }
                });

                return attributes;
            }

            // Parsear estilos inline a objeto
            parseInlineStyles(cssText) {
                const styles = {};
                if (!cssText) return styles;

                cssText.split(';').forEach(declaration => {
                    const colonIndex = declaration.indexOf(':');
                    if (colonIndex > 0) {
                        const property = declaration.substring(0, colonIndex).trim();
                        const value = declaration.substring(colonIndex + 1).trim();
                        if (property && value) {
                            styles[property] = value;
                        }
                    }
                });

                return styles;
            }

            // Obtener estilos computados relevantes
            getRelevantStyles(element) {
                if (!window.getComputedStyle) return {};

                const computed = window.getComputedStyle(element);
                const relevantProperties = [
                    'display', 'position', 'top', 'left', 'right', 'bottom',
                    'width', 'height', 'margin', 'padding', 'border',
                    'background', 'color', 'font-family', 'font-size', 'font-weight',
                    'text-align', 'line-height', 'flex', 'grid', 'z-index'
                ];

                const styles = {};
                relevantProperties.forEach(prop => {
                    const value = computed.getPropertyValue(prop);
                    if (value && value !== 'initial' && value !== 'normal') {
                        styles[prop] = value;
                    }
                });

                return styles;
            }

            // Convertir proyecto JSON de vuelta a elementos DOM para el canvas
            jsonToCanvas(projectData) {
                const canvas = document.getElementById('canvas');
                if (!canvas) return;

                // Limpiar canvas
                canvas.innerHTML = '';

                // Crear elementos desde JSON
                projectData.elements.forEach(elementData => {
                    const domElement = this.createDOMFromJSON(elementData);
                    if (domElement) {
                        canvas.appendChild(domElement);
                    }
                });

                // Aplicar estilos internos
                this.applyInternalStyles(projectData.styles);

                // Re-aplicar eventos a elementos
                this.reapplyCanvasEvents();
            }

            // Crear elemento DOM desde datos JSON
            createDOMFromJSON(elementData) {
                const element = document.createElement(elementData.tagName);
                
                // Aplicar ID y clases para el editor
                element.id = elementData.id;
                element.classList.add('canvas-element');
                
                // Restaurar clases originales si existen
                if (elementData.metadata.originalClasses) {
                    elementData.metadata.originalClasses.forEach(cls => {
                        element.classList.add(cls);
                    });
                }

                // Aplicar atributos
                Object.entries(elementData.attributes).forEach(([name, value]) => {
                    if (name !== 'id' && name !== 'class') {
                        element.setAttribute(name, value);
                    }
                });

                // Aplicar estilos inline
                Object.entries(elementData.styles.inline).forEach(([property, value]) => {
                    element.style.setProperty(property, value);
                });

                // Establecer contenido de texto
                if (elementData.textContent && elementData.children.length === 0) {
                    element.textContent = elementData.textContent;
                }

                // Crear elementos hijos recursivamente
                elementData.children.forEach(childData => {
                    const childElement = this.createDOMFromJSON(childData);
                    if (childElement) {
                        element.appendChild(childElement);
                    }
                });

                // Agregar botón de eliminar
                this.addDeleteButton(element);

                return element;
            }

            // Aplicar estilos internos al documento
            applyInternalStyles(stylesData) {
                // Remover estilos internos previos del editor
                const existingStyles = document.querySelectorAll('style[data-editor-imported]');
                existingStyles.forEach(style => style.remove());

                // Agregar nuevos estilos internos
                stylesData.internal.forEach(styleData => {
                    const styleElement = document.createElement('style');
                    styleElement.setAttribute('data-editor-imported', 'true');
                    styleElement.textContent = styleData.content;
                    document.head.appendChild(styleElement);
                });
            }

            // Agregar botón de eliminar a elemento
            addDeleteButton(element) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.innerHTML = '×';
                deleteBtn.onclick = (e) => {
                    e.stopPropagation();
                    element.remove();
                    if (selectedElement === element) {
                        selectedElement = null;
                        updatePropertiesPanel();
                    }
                };
                element.appendChild(deleteBtn);
            }

            // Re-aplicar eventos de canvas a elementos importados
            reapplyCanvasEvents() {
                const elements = document.querySelectorAll('.canvas-element');
                elements.forEach(element => {
                    // Evento de selección
                    element.addEventListener('click', function(e) {
                        e.stopPropagation();
                        selectElement(element);
                    });

                    // Evento de edición de texto
                    element.addEventListener('dblclick', function(e) {
                        e.stopPropagation();
                        makeElementEditable(element);
                    });
                });
            }
        }

        // Crear instancia global del parser
        const htmlParser = new HTMLToJSONParser();

        // ===== CLASE PROJECTMANAGER MEJORADA =====
        
        class EnhancedProjectManager {
            constructor() {
                this.currentProject = null;
                this.projectHistory = [];
            }

            // Crear proyecto desde canvas actual
            createProjectFromCanvas() {
                const canvas = document.getElementById('canvas');
                const elements = this.extractElementsFromCanvas(canvas);
                
                const project = {
                    version: "2.0",
                    metadata: {
                        title: 'Proyecto Sin Título',
                        created: new Date().toISOString(),
                        modified: new Date().toISOString(),
                        canvasSize: this.getCurrentCanvasSize(),
                        selectedElement: selectedElement ? selectedElement.id : null
                    },
                    elements: elements,
                    styles: {
                        inline: {},
                        internal: this.extractInternalStyles(),
                        external: []
                    },
                    scripts: {
                        inline: [],
                        external: []
                    }
                };

                return project;
            }

            // Extraer elementos del canvas recursivamente
            extractElementsFromCanvas(container) {
                const elements = [];
                
                Array.from(container.children).forEach(child => {
                    if (child.classList.contains('canvas-element')) {
                        const element = this.extractElementData(child);
                        elements.push(element);
                    }
                });

                return elements;
            }

            // Extraer datos de un elemento específico
            extractElementData(domElement) {
                const element = {
                    id: domElement.id,
                    tagName: domElement.tagName.toLowerCase(),
                    textContent: this.getDirectTextContent(domElement),
                    attributes: this.extractElementAttributes(domElement),
                    styles: {
                        inline: this.extractInlineStyles(domElement),
                        computed: {}
                    },
                    children: [],
                    metadata: {
                        componentType: domElement.getAttribute('data-component-type') || 'custom',
                        canvasElement: true,
                        draggable: domElement.draggable
                    }
                };

                // Extraer elementos hijos (excluyendo botón de eliminar)
                Array.from(domElement.children).forEach(child => {
                    if (!child.classList.contains('delete-btn')) {
                        if (child.classList.contains('canvas-element')) {
                            element.children.push(this.extractElementData(child));
                        } else {
                            // Para elementos que no son canvas-element pero son contenido
                            element.children.push({
                                id: `child-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                tagName: child.tagName.toLowerCase(),
                                textContent: child.textContent,
                                attributes: this.extractElementAttributes(child),
                                styles: { inline: this.extractInlineStyles(child), computed: {} },
                                children: [],
                                metadata: { canvasElement: false }
                            });
                        }
                    }
                });

                return element;
            }

            // Obtener texto directo del elemento
            getDirectTextContent(element) {
                let text = '';
                for (let node of element.childNodes) {
                    if (node.nodeType === Node.TEXT_NODE) {
                        text += node.textContent;
                    }
                }
                return text.trim();
            }

            // Extraer atributos del elemento
            extractElementAttributes(element) {
                const attributes = {};
                Array.from(element.attributes).forEach(attr => {
                    if (attr.name !== 'draggable' && attr.name !== 'data-component-type') {
                        attributes[attr.name] = attr.value;
                    }
                });
                return attributes;
            }

            // Extraer estilos inline
            extractInlineStyles(element) {
                const styles = {};
                if (element.style.cssText) {
                    element.style.cssText.split(';').forEach(declaration => {
                        const colonIndex = declaration.indexOf(':');
                        if (colonIndex > 0) {
                            const property = declaration.substring(0, colonIndex).trim();
                            const value = declaration.substring(colonIndex + 1).trim();
                            if (property && value) {
                                styles[property] = value;
                            }
                        }
                    });
                }
                return styles;
            }

            // Extraer estilos internos del documento
            extractInternalStyles() {
                const styles = [];
                const styleTags = document.querySelectorAll('style[data-editor-imported]');
                styleTags.forEach((styleTag, index) => {
                    styles.push({
                        id: `internal-${index}`,
                        content: styleTag.textContent
                    });
                });
                return styles;
            }

            // Obtener tamaño actual del canvas
            getCurrentCanvasSize() {
                const canvas = document.getElementById('canvas');
                const activeBtn = document.querySelector('.toolbar-btn.active');
                
                if (activeBtn) {
                    if (activeBtn.id === 'btnDesktop') return 'desktop';
                    if (activeBtn.id === 'btnTablet') return 'tablet';
                    if (activeBtn.id === 'btnMobile') return 'mobile';
                }
                
                return 'desktop';
            }

            // Cargar proyecto al canvas
            loadProjectToCanvas(projectData) {
                const canvas = document.getElementById('canvas');
                
                // Verificar versión del proyecto
                if (!projectData.version || projectData.version === "1.0") {
                    // Formato antiguo - usar método de compatibilidad
                    return this.loadLegacyProject(projectData);
                }

                // Limpiar canvas
                canvas.innerHTML = '';

                // Cargar elementos
                if (projectData.elements) {
                    projectData.elements.forEach(elementData => {
                        const domElement = this.createDOMFromElementData(elementData);
                        if (domElement) {
                            canvas.appendChild(domElement);
                        }
                    });
                }

                // Aplicar estilos internos
                if (projectData.styles && projectData.styles.internal) {
                    this.applyInternalStyles(projectData.styles.internal);
                }

                // Restaurar configuración del canvas
                if (projectData.metadata) {
                    if (projectData.metadata.canvasSize) {
                        setCanvasSize(projectData.metadata.canvasSize);
                    }
                }

                // Re-aplicar eventos
                this.reapplyCanvasEvents();

                this.currentProject = projectData;
                return true;
            }

            // Crear elemento DOM desde datos JSON
            createDOMFromElementData(elementData) {
                const element = document.createElement(elementData.tagName);
                
                // Aplicar ID
                element.id = elementData.id;
                element.classList.add('canvas-element');
                
                // Aplicar atributos
                Object.entries(elementData.attributes).forEach(([name, value]) => {
                    if (name !== 'id') {
                        element.setAttribute(name, value);
                    }
                });

                // Aplicar estilos inline
                Object.entries(elementData.styles.inline).forEach(([property, value]) => {
                    element.style.setProperty(property, value);
                });

                // Aplicar metadatos
                if (elementData.metadata.componentType) {
                    element.setAttribute('data-component-type', elementData.metadata.componentType);
                }
                if (elementData.metadata.draggable) {
                    element.draggable = true;
                }

                // Establecer contenido de texto
                if (elementData.textContent && elementData.children.length === 0) {
                    element.textContent = elementData.textContent;
                }

                // Crear elementos hijos
                elementData.children.forEach(childData => {
                    const childElement = this.createDOMFromElementData(childData);
                    if (childElement) {
                        element.appendChild(childElement);
                    }
                });

                // Agregar botón de eliminar solo a elementos canvas
                if (elementData.metadata.canvasElement !== false) {
                    this.addDeleteButton(element);
                    this.addElementEvents(element);
                }

                return element;
            }

            // Agregar botón de eliminar
            addDeleteButton(element) {
                const deleteBtn = document.createElement('div');
                deleteBtn.className = 'delete-btn';
                deleteBtn.textContent = '×';
                deleteBtn.onclick = (e) => {
                    e.stopPropagation();
                    deleteElement(element);
                };
                element.appendChild(deleteBtn);
            }

            // Agregar eventos a elemento
            addElementEvents(element) {
                element.addEventListener('click', function(e) {
                    e.stopPropagation();
                    selectElement(element);
                });

                element.addEventListener('dblclick', function(e) {
                    e.stopPropagation();
                    makeElementEditable(element);
                });

                setupElementDragAndDrop(element);
            }

            // Aplicar estilos internos
            applyInternalStyles(stylesData) {
                // Remover estilos previos
                const existingStyles = document.querySelectorAll('style[data-editor-imported]');
                existingStyles.forEach(style => style.remove());

                // Agregar nuevos estilos
                stylesData.forEach(styleData => {
                    const styleElement = document.createElement('style');
                    styleElement.setAttribute('data-editor-imported', 'true');
                    styleElement.textContent = styleData.content;
                    document.head.appendChild(styleElement);
                });
            }

            // Re-aplicar eventos del canvas
            reapplyCanvasEvents() {
                const elements = document.querySelectorAll('.canvas-element');
                elements.forEach(element => {
                    // Los eventos ya se agregan en addElementEvents
                });
            }

            // Cargar proyecto en formato legacy (v1.0)
            loadLegacyProject(projectData) {
                const canvas = document.getElementById('canvas');
                canvas.innerHTML = projectData.html;

                // Re-aplicar eventos a elementos legacy
                const elements = document.querySelectorAll('.canvas-element');
                elements.forEach(element => {
                    this.addElementEvents(element);
                    
                    const deleteBtn = element.querySelector('.delete-btn');
                    if (deleteBtn) {
                        deleteBtn.onclick = function(e) {
                            e.stopPropagation();
                            deleteElement(element);
                        };
                    }
                });

                return true;
            }

            // Guardar proyecto actual
            saveCurrentProject(filename = 'proyecto.json') {
                const project = this.createProjectFromCanvas();
                this.downloadProject(project, filename);
                this.currentProject = project;
                return project;
            }

            // Descargar proyecto como archivo
            downloadProject(project, filename) {
                const blob = new Blob([JSON.stringify(project, null, 2)], { 
                    type: 'application/json' 
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.click();
                URL.revokeObjectURL(url);
            }

            // Importar proyecto desde archivo
            async importProject(file) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const projectData = JSON.parse(e.target.result);
                            const success = this.loadProjectToCanvas(projectData);
                            if (success) {
                                showToast('Proyecto cargado correctamente');
                                resolve(projectData);
                            } else {
                                reject(new Error('Error al cargar el proyecto'));
                            }
                        } catch (error) {
                            reject(error);
                        }
                    };
                    reader.onerror = () => reject(new Error('Error al leer el archivo'));
                    reader.readAsText(file);
                });
            }
        }

        // Crear instancia global del gestor de proyectos mejorado
        const enhancedProjectManager = new EnhancedProjectManager();

        // Exportar funciones críticas al scope global para compatibilidad con event handlers inline
        window.startBlankProject = startBlankProject;
        window.loadTemplate = loadTemplate;
        window.filterTemplates = filterTemplates;
        window.showGallery = showGallery;
        window.hideGallery = hideGallery;
        window.newProject = newProject;
        window.setCanvasSize = setCanvasSize;
        window.exportHTML = exportHTML;
        window.exportZip = exportZip;
        window.showHelp = showHelp;
        window.saveProject = saveProject;
        window.importHTMLFile = importHTMLFile;
        window.showProjectsPanel = showProjectsPanel;
        window.showComponentsLibrary = showComponentsLibrary;
        window.toggleCategory = toggleCategory;

if (typeof module !== 'undefined' && module.exports) { module.exports = { createComponent }; }

// Inicializar panel toggle
import('./src/ui/panelToggle.js').then(module => {
    window.panelToggle = module.panelToggle;
}).catch(err => console.log('Panel toggle not loaded'));

        // Inicializar tema oscuro por defecto y paneles ocultos
        document.addEventListener('DOMContentLoaded', () => {
            // Configurar tema oscuro
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('dragndrop_theme', 'dark');
            
            // FORZAR paneles ocultos al inicio
            setTimeout(() => {
                const leftPanel = document.getElementById('components-panel');
                const rightPanel = document.getElementById('properties-panel');
                
                if (leftPanel) {
                    leftPanel.classList.add('hidden');
                    leftPanel.style.cssText = 'display: none !important; visibility: hidden !important; width: 0 !important;';
                }
                if (rightPanel) {
                    rightPanel.classList.add('hidden');
                    rightPanel.style.cssText = 'display: none !important; visibility: hidden !important; width: 0 !important;';
                }
                
                // Ajustar canvas a full width
                const canvasContainer = document.querySelector('.canvas-container');
                const mainContent = document.querySelector('.main-content');
                if (canvasContainer) {
                    canvasContainer.style.width = '100%';
                    canvasContainer.style.marginLeft = '0';
                    canvasContainer.style.marginRight = '0';
                }
                if (mainContent) {
                    mainContent.style.paddingLeft = '0';
                    mainContent.style.paddingRight = '0';
                }
                
                // Guardar estado de paneles ocultos
                localStorage.setItem('panelStates', JSON.stringify({
                    leftPanelVisible: false,
                    rightPanelVisible: false,
                    zenMode: false
                }));
                
                // Marcar body como inicializado para que CSS tome control
                document.body.classList.add('panels-initialized');
                
                console.log('✅ Editor iniciado: Tema oscuro, paneles ocultos, canvas fullscreen');
            }, 100);
        });

        // Exportar función toggle de tema al global
        window.toggleTheme = function() {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('dragndrop_theme', newTheme);
            if (window.showToast) {
                window.showToast(`Tema ${newTheme === 'dark' ? 'oscuro' : 'claro'} activado`);
            }
        };
