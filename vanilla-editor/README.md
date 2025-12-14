# Versión 1: Frontend Vanilla Standalone

## Descripción
Editor visual HTML completo construido con HTML5, CSS3 y JavaScript vanilla (sin frameworks).

## Tecnologías
- **HTML5**: Estructura semántica
- **CSS3**: Flexbox, Grid, Animaciones
- **JavaScript ES6+**: Módulos, Drag & Drop API, File API

## Características
- ✅ 34 componentes drag & drop organizados en 6 categorías
- ✅ Editor visual con panel de propiedades dinámico
- ✅ 5 templates profesionales pre-diseñados
- ✅ Vista responsive (Desktop, Tablet, Mobile)
- ✅ Export HTML/CSS/JS
- ✅ Sistema de guardado/carga de proyectos
- ✅ Componentes interactivos (tabs, accordion, modal, carousel)
- ✅ Integración con AI (Gemini)
- ✅ Colaboración en tiempo real
- ✅ Tutorial interactivo
- ✅ Deploy a Vercel/Netlify/GitHub Pages

## Cómo ejecutar

### Opción 1: HTTP Server (Node.js)
```bash
cd /home/admin/DragNDrop/versions/v1-vanilla-standalone
npx http-server -p 8080 -c-1 --cors
# Abrir: http://localhost:8080/index.html
```

### Opción 2: Python
```bash
cd /home/admin/DragNDrop/versions/v1-vanilla-standalone
python3 -m http.server 8080
# Abrir: http://localhost:8080/index.html
```

### Opción 3: Abrir directamente
```bash
# Abrir index.html en el navegador
# Nota: Algunas características pueden no funcionar por CORS
```

## Estructura de archivos
```
v1-vanilla-standalone/
├── index.html          # Punto de entrada principal
├── script.js           # Lógica principal (1877 líneas)
├── style.css           # Estilos principales (654 líneas)
├── service-worker.js   # PWA support
└── src/
    ├── ai/             # Integración con AI
    ├── collaboration/  # Colaboración en tiempo real
    ├── components/     # Componentes UI
    ├── core/           # Funcionalidad core
    ├── deploy/         # Integración con plataformas
    ├── editor/         # Editor visual
    ├── storage/        # Persistencia
    ├── styles/         # Estilos modulares
    └── utils/          # Utilidades
```

## Puertos
- **Frontend**: 8080

## Estado
✅ **PRODUCCIÓN** - Completamente funcional y testeado

## Casos de uso
- Crear páginas web sin escribir código
- Prototipado rápido
- Landing pages
- Portfolios
- Blogs
- Tiendas online básicas

## Limitaciones
- No tiene backend (todo en cliente)
- Proyectos guardados en localStorage o archivos JSON
- No tiene autenticación de usuarios
- No tiene base de datos

## Próximos pasos
- Integrar con backend para persistencia
- Agregar más componentes
- Mejorar performance en proyectos grandes
