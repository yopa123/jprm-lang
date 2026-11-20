# JPRM Language Engine v1.0.0-alpha

<p align="center">
  <img src="https://img.shields.io/badge/Estado-Alpha%20Experimental-orange?style=for-the-badge" alt="Estado Alpha" />
  <img src="https://img.shields.io/badge/Versi%C3%B3n-1.0.0--alpha-6366f1?style=for-the-badge" alt="Versión 1.0.0-alpha" />
  <img src="https://img.shields.io/badge/Licencia-Libre%20Uso-10b981?style=for-the-badge" alt="Uso Libre" />
  <img src="https://img.shields.io/badge/Plataforma-Windows%20%7C%20Linux-blue?style=for-the-badge" alt="Plataformas" />
</p>

> **Sobre este proyecto:**  
> **JPRM** es un proyecto personal independiente que vengo ideando, diseñando y programando en mis ratos libres y fines de semana desde hace bastante tiempo (iniciado a comienzos de 2024).  
> 
> Tras un largo período madurando las ideas de arquitectura y evaluando su rendimiento en privado, finalmente **me animé a dar el paso y liberar esta primera versión de prueba comunitaria (Alpha)**.
>
> Este repositorio está destinado a la **distribución oficial de binarios compilados, documentación técnica de uso y canal de feedback/issues**. No es un producto comercial terminado ni listo para producción, sino un prototipo funcional avanzado para validar conceptos de diseño de lenguajes modernos, tipado cerrado estricto, servidores web asíncronos y distribución ágil mediante bytecode.
>
> Como recién me animé a darlo a conocer, si te resulta una propuesta interesante, cualquier prueba, comentario o sugerencia constructiva será enormemente bienvenida para seguir puliendo la herramienta.

---

## Términos de Uso y Descargo de Responsabilidad

- **Uso Libre y Gratuito:** El uso de este software es completamente libre y gratuito, sin costo alguno, tanto para fines personales, experimentales o de evaluación.
- **Sin Garantías (AS-IS):** El software se entrega "tal cual", sin garantías de ningún tipo expresas o implícitas.
- **Descargo de Responsabilidad:** Al tratarse de una versión experimental (Alpha) en desarrollo independiente, **no me hago responsable por pérdidas de datos, fallos del sistema, interrupciones de servicio ni cualquier inconveniente o perjuicio derivado del uso o la instalación de estas herramientas**. Utilízalo bajo tu propia responsabilidad y en entornos de prueba controlados.

---

## ¿Qué es JPRM?

JPRM es un lenguaje de programación, runtime y servidor web de alto rendimiento que combina:
- **Sintaxis pura y directa:** Sin prefijos (`$`) ni operadores complejos, con acceso directo por punto (`usuario.email`).
- **Tipado estricto cerrado:** Inmutabilidad de tipos (`int`, `float`, `string`, `bool`, `array`, `json`, `object`).
- **ORM Nativo con ActiveRecord:** Consultas fluidas encadenadas (`Usuario.where(...).get()`) y persistencia directa sobre SQLite sin librerías externas.
- **Asincronía en Background:** Despacho de tareas en segundo plano con `spawn { ... }` sin frenar la respuesta HTTP.
- **Compilador a Bytecode (`.jprmc`):** Generación de binarios compilados (`jprm build`) para proteger el código y acelerar el arranque en producción.

---

## Descarga e Instalación

Los ejecutables compilados se distribuyen directamente a través de las [**GitHub Releases**](../../releases) de este repositorio.

### Opción 1: Asistente Instalador para Windows (Recomendado)
1. Ve a la sección de [**Releases**](../../releases) y descarga `JPRM-Setup-v1.0.0-alpha.exe`.
2. Ejecuta el instalador (firmado digitalmente mediante Authenticode).
3. El asistente configurará automáticamente:
   - El directorio del motor (`%LOCALAPPDATA%\Programs\JPRM`).
   - El comando `jprm` en la variable de entorno `PATH` (para usarlo de inmediato en PowerShell o CMD).
   - Los plugins oficiales de sintaxis y snippets para **Cursor** y **Visual Studio Code**.

### Opción 2: Binarios Portables
Si prefieres no usar el instalador, puedes descargar el binario `jprm.exe` (Windows) o `jprm` (Linux) desde los releases y agregarlo manualmente a tu `PATH`.

---

## Inicio Rápido

### 1. Iniciar la Consola Interactiva (REPL)
```bash
jprm repl
```
```jprm
jprm> int a = 15
jprm> int b = 27
jprm> a + b
42
jprm> string saludo = "Hola JPRM"
jprm> f"{saludo}! Longitud: {len(saludo)}"
Hola JPRM! Longitud: 9
jprm> exit
```

### 2. Crear tu Primer Proyecto MVC
```bash
jprm new mi_tienda
cd mi_tienda
jprm serve --port 8080
```
Abre tu navegador en `http://127.0.0.1:8080` para ver el servidor respondiendo en milisegundos.

### 3. Compilar a Bytecode para Producción (`.jprmc`)
```bash
jprm build
```
Genera la carpeta `./build/` con todo el código compilado, listo para ser ejecutado con:
```bash
jprm serve --root ./build/www --port 8080
```

---

## Documentación de Uso

Para profundizar en el uso y las características del motor, consulta las guías dedicadas en la carpeta [`docs/`](docs/):

1. **[Guía de Inicio Rápido (10 Minutos)](docs/GETTING_STARTED.md):** Tutorial paso a paso desde el scaffolding hasta el despliegue con base de datos SQLite y migraciones.
2. **[Referencia de la Línea de Comandos (CLI)](docs/CLI_REFERENCE.md):** Manual de subcomandos (`serve`, `build`, `repl`, `run`, `migrate`, `install-extension`).
3. **[Especificación del Lenguaje](docs/LANGUAGE_SPEC.md):** Reglas de tipos, objetos de contexto HTTP (`@Request`, `@Session`, `@Query`), clases y f-strings.
4. **[Catálogo de la Biblioteca Estándar](docs/STDLIB_REFERENCE.md):** Funciones nativas (`view`, `db_query`, `sleep_ms`, `json_encode`, etc.) con sus firmas y parámetros.
5. **[Patrones de Código y Ejemplos](docs/PATTERNS_AND_EXAMPLES.md):** Ejemplos de autenticación, APIs REST y tareas asíncronas en background.
6. **[Resolución de Problemas](docs/TROUBLESHOOTING.md):** Depuración de errores comunes y lectura de logs.

---

## Créditos y Licencias de Terceros

JPRM fue diseñado y desarrollado de manera personal e independiente por **Juan Pablo R.M.**  
El motor utiliza componentes de código abierto con licencias permisivas (MIT, Apache 2.0, BSD). Para revisar la lista completa de librerías utilizadas y sus avisos de derechos de autor, consulta el archivo [`NOTICE-THIRD-PARTY.txt`](NOTICE-THIRD-PARTY.txt).
