# 🚀 Integración de Recurrente - Guía Frontend

Esta guía explica cómo integrar el nuevo sistema de pagos con Recurrente desde el frontend de MidiMed.

## 📋 Tabla de Contenidos

1. [Nuevas Cloud Functions](#nuevas-cloud-functions)
2. [Flujo de Suscripción](#flujo-de-suscripción) 
3. [UX para Selección de Planes](#ux-para-selección-de-planes)
4. [Integración de Componentes](#integración-de-componentes)
5. [Manejo de Estados](#manejo-de-estados)
6. [Casos de Uso Específicos](#casos-de-uso-específicos)

## 🆕 Nuevas Cloud Functions

### 1. `createMonthlyInvoice`
**Propósito**: Crear una factura mensual y obtener URL de checkout de Recurrente

```javascript
const createInvoice = httpsCallable(functions, 'createMonthlyInvoice');

// Parámetros requeridos
const params = {
  userId: string,        // ID del usuario autenticado
  tenantId: string,      // ID del tenant/clínica
  planCatalogId: string  // ID del plan desde planCatalog collection
};

// Respuesta
const response = {
  invoiceId: string,  // ID único de la factura creada
  url: string        // URL del checkout de Recurrente para redirigir
};

// Ejemplo de uso
try {
  const result = await createInvoice({
    userId: user.uid,
    tenantId: tenant.id,
    planCatalogId: "BASIC_GTQ" // o "PRO_USD", etc.
  });
  
  // Redirigir al usuario al checkout
  window.location.href = result.data.url;
} catch (error) {
  console.error('Error creating invoice:', error);
}
```

### 2. `manageSubscription`
**Propósito**: Gestionar suscripciones (consultar, cancelar, pausar, reanudar)

```javascript
const manageSubscription = httpsCallable(functions, 'manageSubscription');

// Parámetros
const params = {
  tenantId: string,
  action: "get_status" | "cancel" | "pause" | "resume",
  reason?: string  // Opcional: razón para cancelar/pausar
};

// Respuesta
const response = {
  success: boolean,
  subscription?: {
    id: string,
    status: "active" | "paused" | "canceled" | "past_due" | "incomplete",
    current_period_start: string,
    current_period_end: string,
    cancel_at_period_end: boolean,
    // ... más campos
  },
  message?: string,
  error?: string
};

// Ejemplos de uso
// 1. Consultar estado
const status = await manageSubscription({
  tenantId: tenant.id,
  action: "get_status"
});

// 2. Cancelar suscripción
const cancel = await manageSubscription({
  tenantId: tenant.id,
  action: "cancel",
  reason: "Usuario decidió cancelar"
});

// 3. Pausar suscripción
const pause = await manageSubscription({
  tenantId: tenant.id,
  action: "pause",
  reason: "Vacaciones de negocio"
});

// 4. Reanudar suscripción
const resume = await manageSubscription({
  tenantId: tenant.id,
  action: "resume"
});
```

### 3. `testRecurrenteAuth` (Solo para testing)
**Propósito**: Verificar conexión con Recurrente y sincronizar planes disponibles

```javascript
const testAuth = httpsCallable(functions, 'testRecurrenteAuth');

// Sin parámetros requeridos
const result = await testAuth();

// Respuesta incluye productos disponibles y planes sincronizados
console.log('Available plans:', result.data);
```

## 🔄 Flujo de Suscripción

### Paso 1: Obtener Planes Disponibles
```javascript
// Leer desde Firestore collection "planCatalog"
const planCatalogRef = collection(db, 'planCatalog');
const snapshot = await getDocs(query(planCatalogRef, where('active', '==', true)));

const availablePlans = snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));

// Ejemplo de estructura:
// {
//   id: "BASIC_GTQ",
//   plan: "BASIC",
//   currency: "GTQ", 
//   price: 75999, // en centavos
//   active: true,
//   productName: "Plan Básico MidiMed",
//   recurrenteProductId: "prod_nifhhlhb",
//   recurrentePriceId: "price_0evptk9w"
// }
```

### Paso 2: Mostrar Interfaz de Selección
Crear interfaz basada en la sección pricing de la landing page con:

- ✅ Cards de planes disponibles
- ✅ Precios en centavos (dividir por 100 para mostrar)
- ✅ Información del plan (features, límites)
- ✅ Botón "Seleccionar Plan" por cada opción

### Paso 3: Procesar Selección
```javascript
const handlePlanSelection = async (planCatalogId) => {
  try {
    // 1. Crear factura
    const invoice = await createMonthlyInvoice({
      userId: user.uid,
      tenantId: tenant.id,
      planCatalogId
    });
    
    // 2. Redirigir a checkout
    window.location.href = invoice.data.url;
    
  } catch (error) {
    // Manejar errores (mostrar toast/modal)
    console.error('Error:', error);
  }
};
```

### Paso 4: Manejar Retorno de Checkout
```javascript
// En las páginas success/cancel URLs configuradas
// URL success: https://midimed.tech/payment/success?invoiceId=xxx
// URL cancel: https://midimed.tech/payment/cancel?invoiceId=xxx

// En componente de success
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const invoiceId = urlParams.get('invoiceId');
  
  if (invoiceId) {
    // Mostrar mensaje de éxito
    // Redirigir al dashboard después de unos segundos
    setTimeout(() => {
      router.push('/dashboard');
    }, 3000);
  }
}, []);
```

## 🎨 UX para Selección de Planes

### Componente de Pricing Cards
```jsx
function PlanSelector({ onPlanSelect }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvailablePlans();
  }, []);

  const loadAvailablePlans = async () => {
    try {
      const planCatalogRef = collection(db, 'planCatalog');
      const snapshot = await getDocs(
        query(planCatalogRef, where('active', '==', true))
      );
      
      const availablePlans = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setPlans(availablePlans);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (centavos, currency) => {
    const amount = centavos / 100;
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <div key={plan.id} className="border rounded-lg p-6 hover:shadow-lg">
          <h3 className="text-xl font-bold">{plan.productName}</h3>
          <div className="text-3xl font-bold my-4">
            {formatPrice(plan.price, plan.currency)}
            <span className="text-sm text-gray-500">/mes</span>
          </div>
          
          <p className="text-gray-600 mb-6">{plan.productDescription}</p>
          
          {/* Lista de features según el plan */}
          <ul className="mb-6 space-y-2">
            {getPlanFeatures(plan.plan).map((feature, idx) => (
              <li key={idx} className="flex items-center">
                <CheckIcon className="w-4 h-4 text-green-500 mr-2" />
                {feature}
              </li>
            ))}
          </ul>
          
          <button
            onClick={() => onPlanSelect(plan.id)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Seleccionar Plan
          </button>
        </div>
      ))}
    </div>
  );
}

// Helper function para features por plan
const getPlanFeatures = (planType) => {
  const features = {
    BASIC: [
      "Hasta 100 pacientes",
      "Citas ilimitadas", 
      "Historias clínicas digitales",
      "Reportes básicos"
    ],
    PRO: [
      "Pacientes ilimitados",
      "Citas ilimitadas",
      "Historias clínicas digitales", 
      "Reportes avanzados",
      "Integraciones API",
      "Soporte prioritario"
    ]
  };
  
  return features[planType] || [];
};
```

### Panel de Gestión de Suscripción
```jsx
function SubscriptionManager({ tenantId }) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionStatus();
  }, [tenantId]);

  const loadSubscriptionStatus = async () => {
    try {
      const result = await manageSubscription({
        tenantId,
        action: "get_status"
      });
      
      if (result.data.success) {
        setSubscription(result.data.subscription);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('¿Estás seguro de cancelar tu suscripción?')) return;
    
    const reason = prompt('Motivo de cancelación (opcional):');
    
    try {
      const result = await manageSubscription({
        tenantId,
        action: "cancel",
        reason
      });
      
      if (result.data.success) {
        alert('Suscripción cancelada exitosamente');
        loadSubscriptionStatus(); // Recargar estado
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('Error al cancelar suscripción');
    }
  };

  // Similar functions for pause/resume...

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Gestión de Suscripción</h2>
      
      {subscription && (
        <div className="space-y-4">
          <div>
            <span className="font-semibold">Estado: </span>
            <span className={`px-2 py-1 rounded text-sm ${
              subscription.status === 'active' ? 'bg-green-100 text-green-800' :
              subscription.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {subscription.status}
            </span>
          </div>
          
          <div>
            <span className="font-semibold">Próximo cobro: </span>
            {new Date(subscription.current_period_end).toLocaleDateString()}
          </div>
          
          <div className="flex space-x-2">
            {subscription.status === 'active' && (
              <>
                <button
                  onClick={handleCancelSubscription}
                  className="bg-red-600 text-white px-4 py-2 rounded"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handlePauseSubscription()}
                  className="bg-yellow-600 text-white px-4 py-2 rounded"
                >
                  Pausar
                </button>
              </>
            )}
            
            {subscription.status === 'paused' && (
              <button
                onClick={() => handleResumeSubscription()}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Reanudar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

## 🔒 Verificaciones y Validaciones

### 1. Verificar Estado de Billing del Tenant
```javascript
// Antes de permitir acceso a funciones premium
const checkBillingStatus = (tenant) => {
  const { billing } = tenant;
  
  if (!billing) {
    return { hasAccess: false, reason: 'No billing info' };
  }
  
  if (billing.status === 'TRIAL_EXPIRED') {
    return { hasAccess: false, reason: 'Trial expired' };
  }
  
  if (billing.status === 'PAST_DUE') {
    return { hasAccess: false, reason: 'Payment overdue' };
  }
  
  // Verificar si el plan actual ha expirado
  if (billing.paidThrough && new Date(billing.paidThrough) < new Date()) {
    return { hasAccess: false, reason: 'Subscription expired' };
  }
  
  return { hasAccess: true, plan: billing.plan };
};
```

### 2. Middleware de Rutas Protegidas
```javascript
// En Next.js o router de tu elección
const withBillingCheck = (WrappedComponent, requiredPlan = null) => {
  return (props) => {
    const { tenant } = useAuth();
    const router = useRouter();
    
    useEffect(() => {
      const billingStatus = checkBillingStatus(tenant);
      
      if (!billingStatus.hasAccess) {
        router.push('/billing/upgrade');
        return;
      }
      
      // Verificar plan específico si es requerido
      if (requiredPlan && billingStatus.plan !== requiredPlan) {
        router.push('/billing/upgrade');
        return;
      }
    }, [tenant]);
    
    return <WrappedComponent {...props} />;
  };
};

// Uso
export default withBillingCheck(PremiumComponent, 'PRO');
```

## 📱 Casos de Uso Específicos

### 1. Primera Suscripción (Onboarding)
- Mostrar selector de planes después del registro
- Destacar beneficios de cada plan
- Ofrecer trial period si está disponible

### 2. Upgrade de Plan
- Mostrar comparación entre plan actual y opciones superiores
- Calcular diferencia de precio prorrateada
- Confirmar cambio con información clara

### 3. Renovación de Suscripción
- Notificar antes del vencimiento
- Opción de cambiar plan durante renovación
- Proceso automático con webhooks

### 4. Gestión de Pagos Fallidos
- Detectar status "past_due" 
- Mostrar banner de advertencia
- Permitir actualizar método de pago
- Degradar acceso progresivamente

## 🚨 Manejo de Errores

```javascript
const handlePaymentError = (error) => {
  console.error('Payment error:', error);
  
  // Errores comunes y sus mensajes
  const errorMessages = {
    'unauthenticated': 'Debes iniciar sesión para continuar',
    'not-found': 'Plan no encontrado',
    'failed-precondition': 'Plan no disponible o inactivo',
    'resource-exhausted': 'Demasiados intentos, intenta más tarde'
  };
  
  const message = errorMessages[error.code] || 'Error al procesar el pago';
  
  // Mostrar toast/modal con mensaje
  showErrorMessage(message);
};
```

## 🔄 Actualización Automática de Estados

```javascript
// Escuchar cambios en el billing del tenant
useEffect(() => {
  if (!tenant?.id) return;
  
  const unsubscribe = onSnapshot(
    doc(db, 'tenants', tenant.id),
    (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.billing) {
          updateBillingStatus(data.billing);
        }
      }
    }
  );
  
  return unsubscribe;
}, [tenant?.id]);
```

## 🎯 Resumen de Implementación

1. **Crear componente de selección de planes** basado en la landing page
2. **Implementar las 3 cloud functions** con manejo de errores
3. **Configurar rutas de éxito/cancelación** del checkout
4. **Agregar middleware de verificación** de billing
5. **Crear panel de gestión** de suscripciones
6. **Implementar listeners** para cambios automáticos

---

**¡El sistema está listo para ser integrado!** 🚀

Todas las cloud functions están desplegadas y funcionando. Solo necesitas implementar la UI siguiendo esta guía.
