# 🔄 Refactor: De Mockup de Pago a Sistema de Leads con Trial 24h

**Fecha:** 15 Diciembre 2024  
**Tipo:** Major refactor - Modelo de negocio

---

## 🎯 Cambios Solicitados

### 1. Eliminar Mockup de Pago
- ❌ Remover pantalla de checkout con tarjeta
- ❌ Remover procesamiento de pago simulado
- ❌ Remover Stripe mockup

### 2. Crear Sistema de Leads
- ✅ Pantalla de generación de lead
- ✅ Formulario con datos de contacto
- ✅ Opción: "¿Requiere solución personalizada?"
- ✅ Mensaje: "Nuestro equipo de ventas se comunicará contigo"

### 3. Pricing Anual
- ✅ Básico: $500/año
- ✅ Profesional: $1,000/año
- ✅ Empresarial: $1,500/año
- ✅ Costos a granel (estructura simple)

### 4. Facturación Condicional
- ✅ Checkbox en registro: "Requiero factura fiscal"
- ✅ Si marcado: Sumar IVA 16%
- ✅ Si NO marcado: Solo precio base

### 5. Generación y Envío de Factura
- ✅ Generar PDF de factura
- ✅ Enviar con Resend a Outlook configurado
- ✅ Datos fiscales solicitados si requiere factura

### 6. Trial 24 Horas
- ✅ Después de registro → Acceso inmediato (trial)
- ✅ Timer de 24 horas desde registro
- ✅ Notificación cuando expira

### 7. Validación de Pago Backend
- ✅ Endpoint para marcar pago cubierto
- ✅ Campo en DB: `payment_verified`, `subscription_activated`
- ✅ Timer se detiene al verificar pago
- ✅ Conversión de trial → cuenta activa

---

## 📋 Flujo Nuevo

```
┌─────────────┐
│   LANDING   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│   REGISTRO                  │
│   - Email, Password, Name   │
│   - Plan seleccionado       │
│   - □ Requiero factura      │ ← NUEVO
│   - Solución personalizada  │ ← NUEVO
└──────┬──────────────────────┘
       │
       ▼
┌─────────────┐
│  VERIFY OTP │
└──────┬──────┘
       │
       ▼
┌────────────────────────────────────┐
│   LEAD CONFIRMATION                │
│   "Gracias por tu registro"        │
│   "Equipo de ventas te contactará" │
│   "Mientras tanto, acceso 24h"     │
│   [Comenzar Trial] →               │
└──────┬─────────────────────────────┘
       │
       ▼
┌────────────────────────┐
│   ONBOARDING WIZARD    │
│   (4 pasos)            │
└──────┬─────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│   DASHBOARD (Trial 24h)         │
│   ⏱️ Timer visible: 23h 45m     │
│   Banner: "Trial - Pago pendiente" │
└──────┬──────────────────────────┘
       │
       │ ⏰ Después de 24h
       ▼
┌────────────────────────────────┐
│   TRIAL EXPIRED                │
│   "Tu trial ha expirado"       │
│   "Espera confirmación de pago"│
│   Acceso bloqueado             │
└────────────────────────────────┘
       │
       │ ✅ Admin marca pago cubierto
       ▼
┌────────────────────────────────┐
│   CUENTA ACTIVADA              │
│   Acceso completo desbloqueado │
│   Suscripción activa           │
└────────────────────────────────┘
```

---

## 🗄️ Cambios en Base de Datos

### Tabla `users` - Campos Nuevos
```sql
ALTER TABLE users ADD COLUMN requires_invoice BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN custom_solution_interest TEXT;
ALTER TABLE users ADD COLUMN trial_started_at TIMESTAMP;
ALTER TABLE users ADD COLUMN trial_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN payment_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN payment_verified_at TIMESTAMP;
ALTER TABLE users ADD COLUMN payment_verified_by VARCHAR(255);
```

### Tabla `leads` - Nueva
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(50),
  company VARCHAR(255),
  selected_plan VARCHAR(50), -- basico, profesional, empresarial
  annual_price DECIMAL(10, 2), -- 500, 1000, 1500
  requires_invoice BOOLEAN DEFAULT false,
  custom_solution_interest TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, contacted, converted, lost
  contacted_at TIMESTAMP,
  contacted_by VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla `invoices` - Nueva
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  user_id UUID REFERENCES users(id),
  invoice_number VARCHAR(50) UNIQUE,
  amount DECIMAL(10, 2),
  subtotal DECIMAL(10, 2),
  tax_amount DECIMAL(10, 2), -- IVA 16%
  total DECIMAL(10, 2),
  rfc VARCHAR(13),
  razon_social VARCHAR(255),
  invoice_use VARCHAR(100), -- G03, P01, etc.
  payment_method VARCHAR(50),
  pdf_url TEXT,
  sent_at TIMESTAMP,
  sent_to VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, paid, cancelled
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔧 Backend - Nuevos Endpoints

### POST /api/leads/create
```javascript
/**
 * Crear lead después de registro
 * Body: {
 *   userId,
 *   plan: 'profesional',
 *   requiresInvoice: true,
 *   customSolution: 'Necesito integración con SAP'
 * }
 */
```

### POST /api/invoices/generate
```javascript
/**
 * Generar factura PDF
 * Body: {
 *   leadId,
 *   rfc: 'ABC123456XYZ',
 *   razonSocial: 'Mi Empresa SA de CV',
 *   invoiceUse: 'G03'
 * }
 */
```

### POST /api/invoices/send
```javascript
/**
 * Enviar factura con Resend
 * Body: {
 *   invoiceId,
 *   recipientEmail: 'user@outlook.com'
 * }
 */
```

### GET /api/trial/status
```javascript
/**
 * Verificar estado de trial
 * Response: {
 *   isActive: true,
 *   timeRemaining: 82800, // segundos
 *   expiresAt: '2024-12-16T03:00:00Z'
 * }
 */
```

### POST /api/admin/verify-payment
```javascript
/**
 * Admin marca pago como verificado
 * Body: {
 *   userId,
 *   paymentMethod: 'transferencia',
 *   notes: 'Pago recibido vía SPEI'
 * }
 * Solo admin access
 */
```

---

## 📄 Frontend - Componentes a Crear/Modificar

### 1. LeadConfirmation.tsx (NUEVO)
```tsx
// Página después de verify OTP
// Muestra: Gracias por registrarte
// Tu plan: Profesional - $1,000/año
// Con factura: $1,160/año (IVA incluido)
// Nuestro equipo te contactará en 24-48h
// [Comenzar Trial 24h →]
```

### 2. Register.tsx - Modificar
```tsx
// Agregar campos:
// - Checkbox: □ Requiero factura fiscal
// - Textarea: Descripción de solución personalizada (opcional)
// Si marca factura:
//   - Mostrar precio + IVA
//   - Solicitar RFC (opcional en registro, requerido para factura)
```

### 3. TrialBanner.tsx (NUEVO)
```tsx
// Banner en Dashboard
// ⏱️ Trial: 23h 45m restantes
// Plan: Profesional - Pago pendiente
// [Ver detalles] [Contactar ventas]
```

### 4. TrialExpired.tsx (NUEVO)
```tsx
// Pantalla cuando expira trial
// Tu trial de 24h ha expirado
// Tu pago está siendo procesado
// Te notificaremos cuando se active tu cuenta
// [Contactar soporte]
```

### 5. PricingCards.tsx - Modificar
```tsx
// Cambiar precios:
// Básico: $500/año
// Profesional: $1,000/año
// Empresarial: $1,500/año
// Mostrar: "+ IVA si requiere factura"
```

---

## 📧 Resend Integration

### Setup
```bash
npm install resend
```

### Configuración
```javascript
// backend/.env
RESEND_API_KEY=re_xxxxxxxxxxxx
INVOICE_FROM_EMAIL=facturas@tusaas.com
INVOICE_TO_EMAIL=tu_email@outlook.com
```

### Email Template - Factura
```javascript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'Facturas <facturas@tusaas.com>',
  to: 'usuario@outlook.com',
  subject: `Factura ${invoiceNumber} - DragNDrop SaaS`,
  html: `
    <h2>Tu Factura Fiscal</h2>
    <p>Adjuntamos tu factura fiscal por la suscripción a DragNDrop SaaS.</p>
    <ul>
      <li>Plan: ${plan}</li>
      <li>Subtotal: $${subtotal}</li>
      <li>IVA (16%): $${tax}</li>
      <li>Total: $${total}</li>
    </ul>
  `,
  attachments: [
    {
      filename: `factura-${invoiceNumber}.pdf`,
      content: pdfBuffer,
    },
  ],
});
```

---

## ⏱️ Sistema de Timer 24h

### Frontend - Hook
```typescript
// hooks/useTrialTimer.ts
export function useTrialTimer() {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const checkTrialStatus = async () => {
      const res = await api.get('/trial/status');
      setTimeRemaining(res.data.timeRemaining);
      setIsExpired(!res.data.isActive);
    };

    checkTrialStatus();
    const interval = setInterval(checkTrialStatus, 60000); // Check cada minuto
    
    return () => clearInterval(interval);
  }, []);

  return { timeRemaining, isExpired, formatTime };
}
```

### Backend - Middleware
```javascript
// middleware/checkTrialStatus.js
export const checkTrialStatus = async (req, res, next) => {
  const user = req.user;
  
  if (user.payment_verified) {
    return next(); // Pago verificado, acceso completo
  }
  
  const now = new Date();
  const trialExpires = new Date(user.trial_expires_at);
  
  if (now > trialExpires) {
    return res.status(403).json({
      error: 'Trial expirado',
      message: 'Tu trial de 24h ha expirado. Espera confirmación de pago.',
      trialExpiredAt: user.trial_expires_at
    });
  }
  
  next();
};
```

---

## 📊 Pricing Structure

### Plans con Pricing Anual

```javascript
const PLANS = {
  basico: {
    name: 'Básico',
    annualPrice: 500,
    features: [
      '5 proyectos',
      '1 usuario',
      '1 GB storage',
      '100 AI calls/día'
    ]
  },
  profesional: {
    name: 'Profesional',
    annualPrice: 1000,
    features: [
      'Proyectos ilimitados',
      '5 usuarios',
      '10 GB storage',
      '500 AI calls/día',
      'Colaboración en tiempo real'
    ]
  },
  empresarial: {
    name: 'Empresarial',
    annualPrice: 1500,
    features: [
      'Todo de Profesional',
      'Usuarios ilimitados',
      '100 GB storage',
      'AI calls ilimitados',
      'Soporte prioritario',
      'Soluciones personalizadas'
    ]
  }
};

// Cálculo con IVA
function calculateTotal(plan, requiresInvoice) {
  const subtotal = PLANS[plan].annualPrice;
  const tax = requiresInvoice ? subtotal * 0.16 : 0;
  const total = subtotal + tax;
  
  return { subtotal, tax, total };
}
```

---

## 🎨 UI Changes

### Landing Page - Pricing Section
```tsx
<div className="pricing-card">
  <h3>Profesional</h3>
  <div className="price">
    <span className="amount">$1,000</span>
    <span className="period">/año</span>
  </div>
  <p className="tax-note">+ IVA si requiere factura</p>
  <ul className="features">
    <li>✓ Proyectos ilimitados</li>
    <li>✓ 5 usuarios</li>
    <li>✓ 10 GB storage</li>
    <li>✓ Colaboración en tiempo real</li>
  </ul>
  <button>Comenzar Trial 24h</button>
</div>
```

### Registro - Nuevos Campos
```tsx
<div className="form-group">
  <label>
    <input type="checkbox" name="requiresInvoice" />
    Requiero factura fiscal
  </label>
</div>

{requiresInvoice && (
  <div className="invoice-fields">
    <input 
      type="text" 
      name="rfc" 
      placeholder="RFC (opcional, requerido para factura)"
      maxLength={13}
    />
  </div>
)}

<div className="form-group">
  <label>¿Requieres alguna solución personalizada?</label>
  <textarea 
    name="customSolution"
    placeholder="Describe brevemente tus necesidades especiales..."
    rows={3}
  />
</div>

{/* Mostrar precio */}
<div className="pricing-summary">
  <div>Plan {selectedPlan}: ${PLANS[selectedPlan].annualPrice}</div>
  {requiresInvoice && (
    <>
      <div>IVA (16%): ${PLANS[selectedPlan].annualPrice * 0.16}</div>
      <div className="total">
        Total: ${PLANS[selectedPlan].annualPrice * 1.16}
      </div>
    </>
  )}
</div>
```

---

## 📧 Email Templates

### Lead Notification (Internal - para ventas)
```
Asunto: Nuevo Lead - Plan Profesional - $1,000/año

Nuevo prospecto registrado:

Nombre: María González
Email: maria@example.com
Teléfono: 5512345678
Empresa: TechCorp

Plan seleccionado: Profesional
Precio anual: $1,000
Requiere factura: Sí (+ $160 IVA = $1,160 total)

Solución personalizada:
"Necesitamos integración con nuestro CRM Salesforce"

Trial iniciado: 2024-12-15 03:00:00
Trial expira: 2024-12-16 03:00:00 (24h)

[Ver en CRM] [Contactar lead]
```

### Welcome Email (Usuario)
```
Asunto: ¡Bienvenido a DragNDrop! - Trial 24h Activado

Hola María,

¡Gracias por registrarte en DragNDrop SaaS!

Tu plan: Profesional - $1,000/año
{Requiere factura: $1,160/año con IVA incluido}

🎉 Trial 24 Horas Activado
Tienes acceso completo por las próximas 24 horas.
Mientras tanto, nuestro equipo de ventas revisará tu solicitud
y se pondrá en contacto contigo.

{Solicitaste: "Integración con Salesforce"}
Nuestros especialistas evaluarán esta necesidad.

[Comenzar a Usar Editor →]

---
Equipo DragNDrop
```

---

## 🔐 Admin Panel - Nuevas Funcionalidades

### Dashboard de Leads
```
Leads Pendientes (12)
┌──────────────────────────────────────┐
│ María González | Profesional | $1,000│
│ Trial: 18h restantes                 │
│ Factura: Sí ($1,160 c/IVA)          │
│ Custom: Integración Salesforce       │
│ [Contactar] [Marcar Pago] [Rechazar]│
└──────────────────────────────────────┘
```

### Marcar Pago Verificado
```tsx
<Modal title="Verificar Pago">
  <form>
    <div>Lead: María González</div>
    <div>Monto: $1,160 (c/IVA)</div>
    
    <select name="paymentMethod">
      <option>Transferencia SPEI</option>
      <option>Depósito en efectivo</option>
      <option>Cheque</option>
    </select>
    
    <input 
      type="date" 
      name="paymentDate"
      label="Fecha de pago"
    />
    
    <textarea 
      name="notes"
      placeholder="Referencia, comprobante, etc."
    />
    
    <button>✅ Verificar Pago y Activar Cuenta</button>
  </form>
</Modal>
```

---

## 📄 Generación de Factura PDF

### Librería: PDFKit o jsPDF
```bash
npm install pdfkit
```

### Template de Factura
```javascript
import PDFDocument from 'pdfkit';

function generateInvoicePDF(invoiceData) {
  const doc = new PDFDocument();
  const stream = doc.pipe(/* buffer */);
  
  // Header
  doc.fontSize(20).text('FACTURA', { align: 'center' });
  doc.fontSize(12).text(`Folio: ${invoiceData.invoice_number}`);
  
  // Datos fiscales
  doc.text(`RFC Emisor: TUS123456ABC`);
  doc.text(`Razón Social: Tu SaaS SA de CV`);
  
  // Cliente
  doc.text(`\nCliente:`);
  doc.text(`${invoiceData.razon_social}`);
  doc.text(`RFC: ${invoiceData.rfc}`);
  
  // Conceptos
  doc.text(`\nConcepto: Suscripción Anual - Plan ${invoiceData.plan}`);
  doc.text(`Subtotal: $${invoiceData.subtotal}`);
  doc.text(`IVA (16%): $${invoiceData.tax_amount}`);
  doc.fontSize(14).text(`Total: $${invoiceData.total}`, { bold: true });
  
  // Método de pago
  doc.fontSize(10).text(`\nMétodo de pago: PUE (Pago en una exhibición)`);
  doc.text(`Uso de CFDI: ${invoiceData.invoice_use}`);
  
  doc.end();
  return stream;
}
```

---

## ⏰ Cron Job - Verificar Trials Expirados

### Backend - Scheduled Task
```javascript
// cron/checkExpiredTrials.js
import cron from 'node-cron';

// Ejecutar cada hora
cron.schedule('0 * * * *', async () => {
  const now = new Date();
  
  // Buscar trials expirados
  const expiredTrials = await db
    .select()
    .from(users)
    .where(sql`trial_expires_at < ${now}`)
    .where(eq(users.payment_verified, false));
  
  // Notificar a cada usuario
  for (const user of expiredTrials) {
    await sendTrialExpiredEmail(user.email);
    
    // Log en admin
    await db.insert(audit_logs).values({
      userId: user.id,
      action: 'trial_expired',
      timestamp: now
    });
  }
  
  console.log(`✅ Processed ${expiredTrials.length} expired trials`);
});
```

---

## 📊 Métricas y Analytics

### Dashboard Admin
```
Leads del Mes
─────────────────────
Total: 45
Pendientes: 12
Contactados: 28
Convertidos: 5

Conversión: 11.1%

Ingresos Potenciales
─────────────────────
En trial: $14,000
Verificados: $5,000

Plan más popular: Profesional (60%)
```

---

## ✅ Checklist de Implementación

### Fase 1: Database & Backend (2-3h)
- [ ] Crear migrations para nuevas tablas
- [ ] Agregar campos a users
- [ ] Crear tabla leads
- [ ] Crear tabla invoices
- [ ] Implementar endpoints de leads
- [ ] Implementar generación de PDF
- [ ] Integrar Resend para emails
- [ ] Crear middleware checkTrialStatus
- [ ] Crear endpoint admin/verify-payment

### Fase 2: Frontend (3-4h)
- [ ] Modificar Register con nuevos campos
- [ ] Crear LeadConfirmation page
- [ ] Crear TrialBanner component
- [ ] Crear TrialExpired page
- [ ] Actualizar pricing en Landing
- [ ] Agregar trial timer en Dashboard
- [ ] Crear admin panel para leads
- [ ] Crear modal de verificar pago

### Fase 3: Testing (1-2h)
- [ ] Test flujo completo: Registro → Lead → Trial → Expira
- [ ] Test con factura vs sin factura
- [ ] Test generación de PDF
- [ ] Test envío de email con Resend
- [ ] Test verificación de pago por admin
- [ ] Test acceso bloqueado después de 24h

---

## 🎯 Prioridad de Desarrollo

**CRÍTICO (debe funcionar):**
1. ✅ Sistema de leads (reemplazar checkout)
2. ✅ Trial 24h con timer
3. ✅ Pricing anual actualizado
4. ✅ Checkbox facturación + IVA

**IMPORTANTE (puede ser básico):**
5. ✅ Generación de PDF básico
6. ✅ Envío con Resend
7. ✅ Admin verificar pago

**NICE TO HAVE (puede ser v2):**
8. ⚠️ Factura fiscal completa (timbrado SAT)
9. ⚠️ CRM integration
10. ⚠️ Analytics avanzado

---

**¿Proceder con la implementación? Este es un cambio mayor que tomará 6-9 horas de desarrollo.**
