# 🔤 Sistema de Tipografía - Editor Vanilla

**Versión:** 1.0.0  
**Fecha:** 14 Diciembre 2024  
**Fuentes disponibles:** 60+ familias, 120+ variantes

---

## 📚 Fuentes Incluidas

### Sans-Serif Modernas (13)
- **Inter** - UI favorite, excelente legibilidad
- **Poppins** - Popular, geométrica
- **Montserrat** - Geométrica elegante
- **Raleway** - Fina y elegante
- **Work Sans** - Profesional
- **DM Sans** - Clean modern
- **Plus Jakarta Sans** - Contemporánea
- **Manrope** - Redondeada moderna
- **Space Grotesk** - Tech
- **Sora** - Futurista
- **Outfit** - Display moderna
- **Urbanist** - Urbana
- **Lexend** - Legibilidad mejorada

### Sans-Serif Clásicas (12)
- **Roboto** - Más popular de Google
- **Open Sans** - Versátil
- **Lato** - Elegante clásica
- **Source Sans Pro** - Adobe
- **Nunito** - Amigable
- **Ubuntu** - Tech-friendly
- **Rubik** - Redondeada
- **Barlow** - Grotesk
- **Karla** - Grotesque
- **Mulish** - Minimalista
- **Heebo** - Universal
- **Hind** - Multilingual

### Serif (10)
- **Playfair Display** - Luxury display
- **Merriweather** - Web optimized
- **Lora** - Readable serif
- **Source Serif Pro** - Adobe serif
- **PT Serif** - Universal
- **Libre Baskerville** - Clásica
- **Cormorant Garamond** - Editorial
- **Crimson Text** - Book style
- **EB Garamond** - Classic elegante
- **Spectral** - Google serif

### Monospace (7)
- **Fira Code** - Con ligatures
- **JetBrains Mono** - Desarrolladores
- **Source Code Pro** - Adobe code
- **Roboto Mono** - Clean code
- **IBM Plex Mono** - Corporativo
- **Space Mono** - Retro futurista
- **Inconsolata** - Terminal style

### Display (6)
- **Bebas Neue** - Bold condensed
- **Oswald** - Condensed
- **Anton** - Impact style
- **Archivo Black** - Extra bold
- **Righteous** - Bold geométrica
- **Audiowide** - Tech display

### Script/Handwriting (8)
- **Caveat** - Natural handwriting
- **Dancing Script** - Elegante script
- **Pacifico** - Bold script
- **Satisfy** - Cursive
- **Kalam** - Marker style
- **Indie Flower** - Casual
- **Shadows Into Light** - Hand drawn
- **Permanent Marker** - Bold marker

### Adicionales (10)
- Noto Sans, Titillium Web, Oxygen
- Red Hat Display, Albert Sans, Figtree
- Archivo, Public Sans, Epilogue
- Bricolage Grotesque

---

## 🎨 Integración en el Editor

### Carga en HTML

```html
<!-- fonts/fonts.css importa todas las fuentes -->
<link rel="stylesheet" href="fonts/fonts.css">
```

**Ubicación:** `vanilla-editor/index.html` línea 11

### Selector en Panel de Propiedades

El panel de propiedades ahora incluye un dropdown completo con todas las fuentes organizadas por categoría:

```html
<select onchange="updateStyle('fontFamily', this.value)">
  <option value="">-- Default --</option>
  <optgroup label="Sans-Serif (Modern)">
    <option value="Inter">Inter</option>
    <option value="Poppins">Poppins</option>
    ...
  </optgroup>
  <optgroup label="Serif">
    <option value="Playfair Display">Playfair Display</option>
    ...
  </optgroup>
  ...
</select>
```

**Ubicación:** `vanilla-editor/script.js` → `loadProperties()` (línea ~1838)

---

## 🚀 Estrategia de Carga

### Actual (v1.0): Google Fonts CDN

**Método:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
```

**Ventajas:**
- ✅ Setup instantáneo
- ✅ CDN optimizado de Google
- ✅ Cache compartido entre sitios
- ✅ Actualizaciones automáticas
- ✅ `&display=swap` para evitar FOIT

**Desventajas:**
- ⚠️ Requiere conexión a internet
- ⚠️ GDPR concerns (envía IP a Google)
- ⚠️ Dependencia externa

### Futuro (v2.0): Self-Hosted WOFF2

**Método:**
```css
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('../fonts/inter/inter-400.woff2') format('woff2');
}
```

**Ventajas:**
- ✅ Funciona offline
- ✅ Sin dependencias externas
- ✅ Privacidad total (GDPR compliant)
- ✅ Control completo

**Desventajas:**
- ⚠️ Tamaño del paquete (+5-10MB)
- ⚠️ No cache compartido
- ⚠️ Requiere build step para actualizar

---

## 💡 Uso en el Editor

### Cambiar Fuente de un Elemento

**Vía Panel de Propiedades:**
1. Seleccionar elemento de texto (h1, p, span, etc.)
2. Abrir Panel de Propiedades (Ctrl+P)
3. En sección "Tipografía" → "Font Family"
4. Seleccionar fuente del dropdown
5. ✅ Cambio se aplica instantáneamente

**Vía JavaScript:**
```javascript
const element = document.querySelector('h1');
element.style.fontFamily = 'Inter';
```

**Vía Inline Style:**
```html
<h1 style="font-family: Poppins;">Título</h1>
```

---

## 🎯 Pesos Disponibles

### Weights por Fuente

La mayoría de fuentes incluyen:
- **300** - Light
- **400** - Regular/Normal
- **500** - Medium
- **600** - Semibold
- **700** - Bold
- **800** - Extra Bold
- **900** - Black

**Excepciones:**
- Algunas fuentes display solo tienen 1-2 pesos
- Fuentes script generalmente solo tienen 400-700

### Selector en Panel

```html
<select onchange="updateStyle('fontWeight', this.value)">
  <option value="300">Light</option>
  <option value="normal">Normal</option>
  <option value="500">Medium</option>
  <option value="600">Semibold</option>
  <option value="bold">Bold</option>
  <option value="800">Extra Bold</option>
  <option value="900">Black</option>
</select>
```

---

## 📊 Categorías y Uso Recomendado

### Sans-Serif Modernas
**Uso:** Interfaces de usuario, web apps, landing pages modernas  
**Ejemplos:** Inter (apps), Poppins (marketing), Montserrat (branding)

### Sans-Serif Clásicas
**Uso:** Sitios corporativos, blogs, contenido general  
**Ejemplos:** Roboto (universal), Open Sans (versátil), Lato (clean)

### Serif
**Uso:** Headers elegantes, contenido editorial, sitios premium  
**Ejemplos:** Playfair (luxury), Merriweather (blogs), Lora (lectura)

### Monospace
**Uso:** Código, consolas, data, aplicaciones técnicas  
**Ejemplos:** Fira Code (código), JetBrains Mono (dev), Source Code Pro (Adobe)

### Display
**Uso:** Solo títulos grandes, logos, headers impactantes  
**Ejemplos:** Bebas Neue (posters), Oswald (headlines), Anton (impact)

### Script/Handwriting
**Uso:** Acentos, firmas, diseños casuales/personales  
**Ejemplos:** Caveat (natural), Dancing Script (elegante), Pacifico (bold)

---

## 🔧 Configuración Técnica

### Font Display Strategy

Todas las fuentes usan `&display=swap`:

```
font-display: swap;
```

**Comportamiento:**
1. Texto se muestra inmediatamente con fuente fallback
2. Cuando Google Font carga, se hace swap
3. No hay "flash of invisible text" (FOIT)
4. Mejor UX y Core Web Vitals

### Fallback Stacks

```css
:root {
    --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", 
                 Roboto, "Helvetica Neue", Arial, sans-serif;
    
    --font-serif: Georgia, Cambria, "Times New Roman", Times, serif;
    
    --font-mono: "Fira Code", Menlo, Monaco, "Courier New", monospace;
    
    --font-display: "Bebas Neue", Impact, "Arial Black", sans-serif;
}
```

**Uso:**
```css
.my-element {
    font-family: 'Inter', var(--font-sans);
}
```

---

## 🧪 Testing

### Verificar Carga de Fuentes

**En navegador:**
1. Abrir http://18.223.32.141/vanilla
2. DevTools → Network → Filter: Font
3. Verificar que fuentes se cargan de Google Fonts
4. Status: 200 OK

**En consola:**
```javascript
// Verificar si fuente está cargada
document.fonts.check('16px Inter') // true si cargada
```

### Probar en Editor

1. Cargar plantilla
2. Seleccionar h1
3. Abrir panel propiedades (Ctrl+P)
4. Cambiar Font Family a "Poppins"
5. ✅ Texto cambia visualmente
6. Cambiar Font Weight a "700"
7. ✅ Peso cambia correctamente

---

## 📈 Performance

### Métricas Esperadas

- **First Font Load:** < 200ms (desde CDN de Google)
- **Total Fonts Loaded:** Solo las usadas en la página
- **Cache:** Máximo 1 año (Google CDN)
- **Overhead:** ~10-30KB por fuente (variable-font woff2)

### Optimizaciones Aplicadas

✅ **&display=swap** - Evita FOIT  
✅ **Lazy load** - Solo se cargan al usar  
✅ **Google CDN** - Distribución global  
✅ **WOFF2** - Formato moderno comprimido  
✅ **Subset automático** - Google detecta idioma  

---

## 🔮 Roadmap

### v1.1 (Próximo)
- [ ] Download script para self-host real
- [ ] Generar woff2 files locales
- [ ] @font-face con rutas locales
- [ ] Subset latino básico (reduce 50% tamaño)

### v2.0 (Futuro)
- [ ] Font preview en selector
- [ ] Font pairing suggestions
- [ ] Variable fonts support
- [ ] Custom font upload
- [ ] Font subsetting automático

---

## 📝 Archivo de Configuración

**Location:** `fonts/fonts-list.json`

Contiene:
- Lista completa de fuentes por categoría
- Pesos disponibles
- Formatos soportados
- Notas de uso

---

## 🤝 Contribuir

### Agregar Nueva Fuente

1. **Agregar import en `fonts/fonts.css`:**
```css
/* Mi Nueva Fuente */
@import url('https://fonts.googleapis.com/css2?family=Mi+Nueva+Fuente:wght@400;700&display=swap');
```

2. **Agregar en selector del panel** (`script.js`):
```html
<option value="Mi Nueva Fuente">Mi Nueva Fuente</option>
```

3. **Agregar utility class (opcional):**
```css
.font-mi-nueva { font-family: 'Mi Nueva Fuente', var(--font-sans); }
```

---

**Última actualización:** 14 Diciembre 2024  
**Versión:** 1.0.0  
**Total fuentes:** 60+ familias
