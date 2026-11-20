# Referencia de la Biblioteca Estándar de JPRM v2 (Standard Library)

Este documento detalla todas las funciones built-in, primitivas asíncronas y utilidades del core de JPRM v2, incluyendo firma de tipos, parámetros, valor de retorno y ejemplos prácticos.

---

## 1. Vistas y Renderizado

### `view(string ruta_vista, object|array data = null) : string`
Carga una plantilla desde `app/Views/<ruta_vista>.jprm` o `app/Views/<ruta_vista>.jprmc`, inyecta los atributos de `data` como variables locales y devuelve el HTML resultante compilado.

- **Parámetros:**
  - `ruta_vista` (`string`): Ruta relativa dentro de `app/Views/` sin extensión (ej: `"usuarios/perfil"`).
  - `data` (`object` | `array`, opcional): Datos que se expondrán en la vista mediante `{{ variable }}` o `{% for %}`.
- **Retorno:** Cadena `string` con el HTML final listo para responder al cliente HTTP.
- **Ejemplo:**
  ```jprm
  object datos = new Object()
  datos.nombre = "Juan"
  datos.puntos = 1500
  return view("perfil/resumen", datos)
  ```

---

## 2. Base de Datos SQLite Integrada

### `db_query(string sql) : array`
Ejecuta una consulta SQL de lectura (`SELECT`, `PRAGMA`) y retorna un arreglo indexado de objetos dinámicos.

- **Parámetros:**
  - `sql` (`string`): Sentencia SQL a ejecutar. Admite f-strings para inyección controlada de parámetros.
- **Retorno:** `array` donde cada elemento es un `object` cuyas propiedades corresponden a las columnas de la tabla.
- **Ejemplo:**
  ```jprm
  string consulta = f"SELECT id, nombre, email FROM usuarios WHERE activo = 1 LIMIT 5"
  array usuarios = db_query(consulta)

  for u in usuarios {
      echo f"Usuario: {u.nombre} ({u.email})"
  }
  ```

### `db_execute(string sql) : int`
Ejecuta una sentencia SQL de modificación (`INSERT`, `UPDATE`, `DELETE`, `CREATE TABLE`, `DROP TABLE`).

- **Parámetros:**
  - `sql` (`string`): Sentencia SQL a ejecutar.
- **Retorno:** `int` con el número de filas afectadas por la operación (o el último ID insertado según el contexto).
- **Ejemplo:**
  ```jprm
  string insercion = f"INSERT INTO notas (titulo, contenido) VALUES ('Reunión', '10:00 AM')"
  int filas_afectadas = db_execute(insercion)
  ```

---

## 3. Primitivas Asíncronas y Concurrencia

### `spawn { ... }`
Palabra clave de asincronía nativa que desacopla el bloque de código encerrado en llaves del ciclo de vida de la petición HTTP actual, ejecutándolo en el pool de hilos de Tokio sin bloquear la respuesta al usuario.

- **Ejemplo:**
  ```jprm
  spawn {
      log_info("Iniciando tarea pesada en segundo plano...")
      sleep_ms(2000)
      log_info("Tarea completada.")
  }
  ```

### `sleep_ms(int milisegundos)`
Pausa asíncrona no bloqueante que permite procesar miles de peticiones simultáneas sin detener el servidor.

- **Parámetros:**
  - `milisegundos` (`int`): Tiempo de espera en milisegundos.
- **Ejemplo:**
  ```jprm
  sleep_ms(500) # Espera medio segundo sin frenar otras conexiones HTTP
  ```

### `http_get(string url) : string`
Realiza una petición HTTP `GET` asíncrona hacia una URL externa y devuelve el cuerpo de la respuesta como texto.

- **Parámetros:**
  - `url` (`string`): Dirección HTTP/HTTPS a consultar.
- **Retorno:** `string` con la respuesta remota.
- **Ejemplo:**
  ```jprm
  string json_clima = http_get("https://api.weatherapi.com/v1/current.json?q=Santiago")
  object clima = json_decode(json_clima)
  echo clima.current.temp_c
  ```

---

## 4. Serialización y Conversión de Datos (JSON)

### `json_encode(Value valor) : string`
Serializa cualquier estructura nativa (`object`, `array`, `int`, `string`, `bool`) a una cadena JSON estándar.

- **Parámetros:**
  - `valor` (`Value`): Objeto o arreglo a serializar.
- **Retorno:** `string` formateado en JSON.
- **Ejemplo:**
  ```jprm
  object respuesta = new Object()
  respuesta.estado = "ok"
  respuesta.codigo = 200
  return json_encode(respuesta)
  ```

### `json_decode(string json_texto) : json|object|array`
Parsea y valida una cadena de texto JSON, convirtiéndola en un objeto o arreglo navegable mediante notación de punto.

- **Parámetros:**
  - `json_texto` (`string`): Cadena con formato JSON válido.
- **Retorno:** `object` o `array`. Si el string no es JSON válido, arroja un error de tipado estricto.
- **Ejemplo:**
  ```jprm
  string payload = '{"id": 42, "activo": true}'
  json doc = json_decode(payload)
  echo doc.id # Imprime 42
  ```

---

## 5. Control HTTP y Sesiones

### `redirect(string url)`
Emite una respuesta HTTP de redirección (`302 Found`) con la cabecera `Location` apuntando a la URL indicada.

- **Parámetros:**
  - `url` (`string`): Ruta relativa (`"/login"`) o URL absoluta (`"https://..."`).
- **Ejemplo:**
  ```jprm
  if @Session.usuario_id == null {
      redirect("/login")
  }
  ```

### `session_destroy() : bool`
Invalida la sesión activa del usuario, borra las variables en memoria del servidor y expira las cookies de sesión en el navegador.

- **Ejemplo:**
  ```jprm
  session_destroy()
  redirect("/")
  ```

---

## 6. Logging Asíncrono no Bloqueante

Las funciones de log emiten registros estructurados hacia el canal asíncrono de `tracing` con rotación por chunks en `storage/logs/app-chunk-N.log`:

### `log_info(string mensaje)`
Registra un evento informativo con timestamp ISO y nivel `INFO`.

### `log_warn(string mensaje)`
Registra una advertencia o condición anormal no fatal (`WARN`).

### `log_error(string mensaje)`
Registra un error crítico o fallo de ejecución (`ERROR`).

- **Ejemplo:**
  ```jprm
  log_info(f"Usuario {email} autenticado exitosamente desde {@Server.remote_ip}")
  log_error("Fallo de conexión con servicio de pagos externo")
  ```

---

## 7. Utilidades Generales

### `len(array|string|object valor) : int`
Retorna la cantidad de elementos en un arreglo o lista, la cantidad de caracteres en una cadena UTF-8 o el número de propiedades en un objeto.

- **Alias:** `count(valor)`
- **Ejemplo:**
  ```jprm
  int total_items = len([10, 20, 30]) # 3
  int caracteres = len("Hola Mundo") # 10
  ```

### `int(valor) : int`
Convierte un valor numérico o cadena de texto a un entero de 64 bits (`i64`).

### `float(valor) : float`
Convierte un valor a punto flotante de 64 bits (`f64`).

### `str(valor) : string`
Convierte cualquier valor a su representación en cadena de texto `string`.
