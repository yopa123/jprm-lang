# Guía de Depuración y Resolución de Problemas (Troubleshooting & FAQs)

Esta guía recopila los errores más habituales que un desarrollador puede encontrar al programar en **JPRM v2**, explicando su causa exacta y cómo resolverlos rápidamente.

---

## 1. Excepciones de Tipado Estricto (Strict Typing)

JPRM v2 no permite mutaciones de tipo silenciosas para evitar bugs difíciles de rastrear en producción.

### 🔴 Error: `Error de Tipado Estricto: no se puede asignar string a variable de tipo int`
- **Causa:** Intentaste asignar una cadena de texto a una variable previamente declarada o inferida como `int`.
- **Ejemplo problemático:**
  ```jprm
  int total = 100
  total = "150" # ❌ Error
  ```
- **Solución:** Realiza una conversión explícita o mantén el tipo:
  ```jprm
  total = int("150") # ✅ Correcto
  ```

---

## 2. Acceso a Propiedades y Métodos

### 🔴 Error: Uso de sintaxis arcaica `->` o prefijos `$`
- **Causa:** En JPRM v2 se eliminó el prefijo `$` y la flecha `->`. Ahora se utiliza notación de puntos limpia.
- **Ejemplo problemático:**
  ```jprm
  $usuario->nombre = "Ana" # ❌ Sintaxis obsoleta v1
  ```
- **Solución:**
  ```jprm
  usuario.nombre = "Ana"   # ✅ Sintaxis pura v2
  ```

---

## 3. Variables de Contexto HTTP (`@Session`, `@Request`, `@Query`)

### 🔴 Pregunta: ¿Por qué `@Request.id` llega como string o null?
- **Causa:** En HTTP, los parámetros recibidos mediante formularios o URLs (`query string`) viajan como cadenas de texto.
- **Solución:** Siempre convierte a `int` o valida antes de realizar operaciones matemáticas:
  ```jprm
  int id_articulo = @Query.id ? int(@Query.id) : 0
  ```

---

## 4. Compilación y Bytecode (`jprm build` y `.jprmc`)

### 🔴 Pregunta: ¿Por qué no veo mis cambios en producción?
- **Causa:** En modo producción, el servidor da prioridad a los binarios compilados `.jprmc`. Si editaste un archivo `.jprm` en la carpeta `build/` sin recompilar, el servidor continuará leyendo el bytecode antiguo.
- **Solución:** En tu entorno de desarrollo, edita el código fuente `.jprm` y ejecuta:
  ```bash
  jprm build
  ```
  O en desarrollo local, corre `jprm serve` apuntando a la carpeta de código fuente original para disfrutar de Hot-Patching automático por timestamp (`mtime`).

---

## 5. Base de Datos y Migraciones

### 🔴 Pregunta: ¿Dónde se almacena la base de datos y cómo veo los logs?
- **Base de datos SQLite:** Se encuentra por defecto en `database.db` en la raíz del proyecto.
- **Tabla de control de migraciones:** JPRM registra las migraciones ejecutadas internamente en la tabla `_jprm_migrations`.
- **Logs de errores:** Si una consulta falla o un script arroja un error 500, revisa la carpeta `storage/logs/`:
  - `storage/logs/app-chunk-1.log` contiene el detalle de timestamps, niveles `ERROR` y trazas de ejecución.
