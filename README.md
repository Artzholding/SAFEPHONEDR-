# 📱 SafePhone DR

**Protección contra estafas telefónicas para la República Dominicana**

SafePhone DR es una aplicación móvil MVP diseñada para proteger a los usuarios dominicanos contra estafas comunes como phishing bancario, apps maliciosas, y redes WiFi inseguras.

---

## 🇩🇴 ¿Por qué SafePhone DR?

En la República Dominicana, las estafas telefónicas son muy comunes:
- 📱 **Apps falsas** que imitan bancos como Banco Popular y Banreservas
- 🔗 **Enlaces de WhatsApp** que llevan a páginas de phishing
- 📲 **APKs instalados fuera de Play Store** con permisos peligrosos
- 📶 **Redes WiFi abiertas** donde los hackers roban datos

Esta app ayuda a detectar y prevenir estas amenazas.

---

## ✨ Funcionalidades

### 🔍 Escáner de Apps
- Lista todas las apps instaladas
- Detecta permisos peligrosos (SMS, llamadas, accesibilidad)
- Identifica desarrolladores desconocidos
- Marca apps instaladas fuera de Play Store
- Muestra advertencias en español

### 🌐 Detector de Phishing
- Navegador seguro integrado
- Detecta URLs sospechosas y typosquatting
- Verifica certificados HTTPS
- Muestra alertas rojas para sitios peligrosos
- Incluye enlaces directos a bancos oficiales de RD

### 📶 Verificador de WiFi
- Analiza la red WiFi actual
- Detecta redes abiertas/inseguras
- Verifica tipo de encriptación
- Muestra indicador verde/amarillo/rojo

### 📊 Dashboard de Seguridad
- Puntuación de seguridad general
- Consejos de seguridad en español
- Accesos rápidos a todas las funciones

### ⚙️ Configuración
- Cambio de idioma (Español/Inglés)
- Información de privacidad
- Detalles de la app

---

## 🔒 Privacidad

**Todos los datos se procesan localmente en tu dispositivo.**

- ❌ No se envía información a servidores externos
- ❌ No se recolectan datos personales
- ❌ No se comparte información con terceros
- ✅ Todo el análisis ocurre en tu teléfono

---

## 🚀 Instalación y Ejecución

### Requisitos
- Node.js **20 LTS** (recomendado)
- npm o yarn
- Expo CLI
- Android Studio (para emulador) o dispositivo físico

> Nota (Windows): Node.js muy nuevo (ej. Node 25) puede romper Expo con errores como `node:sea` y evitar que aparezca el QR.
> Usa Node 20 LTS para la mejor compatibilidad.

### Pasos

1. **Instalar dependencias**
```bash
npm install
```

2. **Iniciar la app**
```bash
npx expo start
```

3. **Ejecutar en Android**
```bash
npx expo start --android
```

4. **Ejecutar en iOS** (requiere macOS)
```bash
npx expo start --ios
```

---

## 📦 Generar APK para Android

### Opción 1: Build Local con EAS
```bash
# Instalar EAS CLI
npm install -g eas-cli

# Configurar proyecto
eas build:configure

# Generar APK de preview
eas build -p android --profile preview
```

### Opción 2: Build Local sin EAS
```bash
# Crear bundle nativo
npx expo prebuild

# Ir a carpeta Android
cd android

# Generar APK debug
./gradlew assembleDebug
```

El APK estará en: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📁 Estructura del Proyecto

```
SafePhone-DR/
├── App.tsx                    # Entrada principal
├── app.json                   # Configuración Expo
├── package.json               # Dependencias
├── tsconfig.json              # Config TypeScript
├── src/
│   ├── components/            # Componentes reutilizables
│   │   ├── Card.tsx
│   │   ├── RiskBadge.tsx
│   │   ├── SecurityScoreCircle.tsx
│   │   ├── AppListItem.tsx
│   │   ├── PrimaryButton.tsx
│   │   └── WifiStatusCard.tsx
│   ├── screens/               # Pantallas de la app
│   │   ├── HomeScreen.tsx
│   │   ├── AppScannerScreen.tsx
│   │   ├── WifiSafetyScreen.tsx
│   │   ├── SecureBrowserScreen.tsx
│   │   ├── PhishingWarningScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── navigation/            # Navegación
│   │   └── RootNavigator.tsx
│   ├── context/               # Context providers
│   │   └── LanguageContext.tsx
│   ├── utils/                 # Utilidades y lógica
│   │   ├── appScanner.ts      # Escaneo de apps
│   │   ├── wifiScanner.ts     # Verificación WiFi
│   │   └── phishingDetector.ts # Detección phishing
│   ├── constants/             # Constantes
│   │   ├── theme.ts           # Colores, fuentes, etc.
│   │   └── translations.ts    # Traducciones ES/EN
│   └── types/                 # TypeScript types
│       └── index.ts
└── assets/                    # Imágenes y recursos
```

---

## 🔮 Próximas Funcionalidades (Placeholders)

Los siguientes módulos tienen estructura preparada para implementación futura:

- **Detección de SMS Phishing** - Analizar mensajes de texto sospechosos
- **Identificación de Llamadas Fraudulentas** - Detectar números de estafa
- **Heurísticas de Malware** - Análisis en tiempo real de comportamiento

Ver archivos en `src/utils/` con funciones placeholder comentadas.

---

## 🛠️ Tecnologías

- **React Native** + **Expo** (SDK 50)
- **TypeScript** para type safety
- **React Navigation** para navegación
- **expo-network** para info de red
- **react-native-webview** para navegador seguro

---

## 🤝 Contribuir

¿Quieres ayudar a proteger a más dominicanos?

1. Fork el repositorio
2. Crea una rama para tu feature
3. Haz commit de tus cambios
4. Abre un Pull Request

---

## 📄 Licencia

MIT License - Libre para uso personal y comercial.

---

## 💚 Hecho con amor para la República Dominicana

SafePhone DR busca proteger a las comunidades más vulnerables de RD contra el fraude digital. Si conoces a alguien que ha sido víctima de estafas telefónicas, comparte esta app con ellos.

**¡Juntos podemos hacer un país más seguro digitalmente! 🇩🇴**

