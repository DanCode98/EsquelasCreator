# 🕯️ EsquelasCreator - Sistema de Creación de Esquelas y Recuerdos de Novenario

Sistema web profesional, liviano y solemne desarrollado para funerarias y familiares. Permite crear, personalizar, almacenar en base de datos SQLite y generar documentos **PDF listos para impresión (4 esquelas por hoja con marcas de corte)**.

---

## 🌟 Características

1. **Formatos Disponibles (Extensible)**:
   - **Formato Separador de Libro**: Tarjeta vertical / marcapáginas con oración, santo de devoción, foto del finado y fechas sacramentales.
   - **Formato Librito Díptico**: Formato plegable de dos paneles con portada y contraportada conmemorativa.
2. **Formulario Interactivo con Vista Previa en Tiempo Real**:
   - Nombre completo del difunto.
   - Fechas de nacimiento y defunción.
   - Oración (con límite de 200 caracteres, contador dinámico y sugerencias de oraciones clásicas en 1 clic).
   - Subida de foto del difunto (o selección de símbolos solemnes por defecto: Cruz Dorada, Paloma de la Paz, Vela de la Eternidad).
   - Selector visual de santos de devoción.
3. **Módulo de Gestión de Santos**:
   - Catálogo con santos populares precargados (Virgen de Guadalupe, San Judas Tadeo, Sagrado Corazón de Jesús, Virgen del Carmen, San Benito, San Miguel Arcángel, Divino Niño, San José).
   - Posibilidad de agregar nuevos santos personalizados con foto y título, o eliminarlos.
4. **Base de Datos SQLite**:
   - Guardado automático y manual de cada esquela creada.
   - Módulo de historial: Buscar, reeditar, duplicar, eliminar o descargar directamente en PDF cualquier esquela guardada.
5. **Generador de PDF Profesional (4 por Hoja)**:
   - Distribución simétrica exacta de 4 esquelas por hoja Carta / A4.
   - Marcas y líneas guía de corte para guillotina.
   - Descarga directa o impresión con `Ctrl+P`.

---

## 🚀 Ejecución Local (1 Clic)

### Requisitos:
- Python 3.8 o superior instalado.

### Pasos:
1. Instalar dependencias:
   ```bash
   pip install -r requirements.txt
   ```
2. Iniciar el servidor:
   ```bash
   python app.py
   ```
3. Abre tu navegador en:
   ```
   http://127.0.0.1:5000
   ```

---

## ☁️ Despliegue en Hosting Gratuito

Este proyecto está preparado para desplegarse fácilmente en plataformas con capa gratuita:

### 1. Despliegue en Render.com (Gratis)
- Crea un nuevo **Web Service** en Render conectando tu repositorio GitHub.
- **Environment**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app`

### 2. Despliegue en PythonAnywhere (Gratis)
- Sube los archivos o clona el repositorio desde la consola bash.
- Configura una aplicación Web Flask apuntando a `app.py`.

### 3. Despliegue en Railway / Koyeb
- Detecta automáticamente el archivo `requirements.txt` y `app.py`.

---

## 📁 Estructura del Código

```
EsquelasCreator/
├── app.py                     # Servidor Flask, API REST y base de datos SQLite
├── requirements.txt           # Dependencias de Python
├── database.db                # Base de datos SQLite (se genera automáticamente)
├── static/
│   ├── css/
│   │   └── styles.css         # Estilos visuales solemnes, fuentes y guías de corte
│   ├── js/
│   │   ├── app.js             # Lógica SPA, wizard, editor reactivo y base de datos
│   │   ├── pdfGenerator.js    # Motor de armado 4-up y descarga PDF de alta resolución
│   │   └── saintsManager.js   # Catálogo y administración de santos
│   ├── img/
│   │   ├── defaults/          # Cruz dorada, paloma y vela memorial (SVG)
│   │   └── santos/            # Ilustraciones e imágenes de santos precargados
│   └── uploads/               # Fotos de difuntos y santos personalizados subidos
├── templates/
│   └── index.html             # Interfaz web responsiva con Tailwind y Google Fonts
└── README.md
```
