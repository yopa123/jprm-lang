# Especificación del Lenguaje JPRM v2 (CoreWeb Specification)

> **Versión del Motor:** 2.0.0  
> **Extensión de código fuente:** `.jprm`  
> **Extensión de bytecode binario:** `.jprmc`  
> **Paradigma:** Orientado a Objetos con Tipado Cerrado Estricto (Estilo Dart / Flutter), MVC desacoplado (Estilo CodeIgniter 4 / Laravel), Asincronía Nativa (`async`/`await`/`spawn`) y Ejecución Compilada/JIT sobre Rust (Tokio + Axum).

---

## 1. Gramática Pura y Sistema de Tipado Cerrado Estricto

JPRM v2 adopta una gramática moderna y pura:
- **Sin prefijo `$"`**: Las variables se declaran y utilizan por su nombre directo (`int edad = 28`, `nombre = "Ana"`).
- **Notación de punto `.`**: El acceso a propiedades y llamadas a métodos se realiza con el punto estándar (`objeto.propiedad`, `objeto.metodo()`), sustituyendo operadores arcaicos como `->`.
- **Tipado estricto e inmutable**: Toda variable posee un tipo estricto. Si una variable es declarada o inferida como un tipo, no puede mutar a otro incompatible en tiempo de ejecución.

### 1.1. Tipos Primitivos y Estructurados
| Tipo | Palabra Clave | Ejemplo de Declaración | Descripción |
| :--- | :--- | :--- | :--- |
| **Entero** | `int` | `int edad = 28` | Entero con signo de 64 bits (`i64`). |
| **Decimal** | `float` / `double` | `float precio = 89.99` | Punto flotante de 64 bits (`f64`). |
| **Texto** | `string` | `string nombre = "Juan"` | Cadena de caracteres UTF-8 inmutable (`Arc<str>`). |
| **Booleano** | `bool` | `bool activo = true` | Valor de verdad (`true` o `false`). |
| **Arreglo** | `array` / `list` | `array items = [1, 2, 3]` | Lista indexada o mapa asociativo (`["k": "v"]`). |
| **Objeto** | `object` | `object user = new Object()` | Instancia dinámica con propiedades accesibles por `.`. |
| **JSON** | `json` | `json cfg = {"port": 8080}` | Estructura JSON validada estrictamente. |
| **Dinámico** | `var` / `dynamic` | `var flexible = 10` | Tipo polimórfico cuando se requiere flexibilidad explícita. |

### 1.2. Reglas de Validación de Tipos
1. **Validación en la declaración**: `int edad = "veinte"` genera un error inmediato de tipado estricto en el compilador.
2. **Incompatibilidad de asignación**: Una vez fijado el tipo `int contador = 1`, la asignación `contador = "uno"` detiene la ejecución.
3. **Validación de JSON**: `json payload = '{"status": 200}'` valida la sintaxis JSON internamente. Strings malformados arrojan una excepción de tipo JSON.

---

## 2. Clases, Objetos y ORM con ActiveRecord

JPRM v2 soporta definición de clases nativas con constructores, propiedades tipadas y métodos:

```jprm
class Producto {
    int id
    string titulo
    float precio
    int stock

    function calcularIva(float tasa) : float {
        return this.precio * tasa
    }
}
```

### 2.1. Métodos de Consulta ActiveRecord
Los modelos enlazados a la base de datos heredan capacidades fluidas de consulta:
```jprm
# Búsqueda por clave primaria
object producto = Producto.find(1)

# Consultas encadenadas
array destacados = Producto.where("stock", ">", 0)
                           .orderBy("precio", "DESC")
                           .limit(5)
                           .get()

# Creación y persistencia
object nuevo = new Producto()
nuevo.titulo = "Teclado Mecánico"
nuevo.precio = 129.99
nuevo.stock = 15
nuevo.save()

# Eliminación
producto.delete()
```

---

## 3. Asincronía Nativa (`async`, `await`, `spawn`)

El runtime de JPRM está montado sobre Tokio, lo que permite ejecución asíncrona real en scripts y controladores:

### 3.1. Tareas en Segundo Plano con `spawn { ... }`
Desacopla tareas pesadas del ciclo de respuesta HTTP. La respuesta al cliente web se envía de inmediato, mientras el bloque `spawn` continúa ejecutándose en el pool de hilos de Tokio:

```jprm
@post("/pedido")
function procesarPedido() {
    object payload = @Request
    int pedido_id = guardarPedido(payload)

    # Tarea en background no bloqueante
    spawn {
        sleep_ms(1000)
        enviarEmailConfirmacion(payload.email, pedido_id)
        log_info(f"Confirmación enviada para el pedido #{pedido_id}")
    }

    return json_encode({"status": "recibido", "pedido_id": pedido_id})
}
```

### 3.2. Primitivas Asíncronas
- `sleep_ms(int milisegundos)`: Pausa asíncrona no bloqueante (utiliza `tokio::time::sleep`).
- `http_get(string url) : string`: Realiza peticiones HTTP externas asíncronas sin congelar el hilo principal.

---

## 4. Widgets y Plantillas Reactivas Declarativas

JPRM v2 unifica la separación entre lógica y presentación mediante **Widgets** y tags de interpolación:

### 4.1. Sintaxis de Interpolación en Vistas
- **`{{ expresion }}`**: Evalúa e imprime de forma segura el valor de una variable o expresión.
- **`{% if condicion %} ... {% else %} ... {% endif %}`**: Control de flujo condicional dentro del HTML.
- **`{% for item in lista %} ... {% endfor %}`**: Iteración limpia sobre arreglos y listas.

### 4.2. Declaración de Widgets (`app/Widgets/`)
Los widgets encapsulan componentes reutilizables (navbars, tarjetas, modales, alertas):

```html
# app/Widgets/TarjetaProyecto.jprm
<div class="card p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
    <div class="flex items-center gap-3">
        <span class="text-2xl">{{ icono }}</span>
        <h3 class="text-xl font-bold text-slate-800">{{ titulo }}</h3>
    </div>
    <p class="text-slate-600 mt-2">{{ descripcion }}</p>
    <div class="mt-4 flex gap-2">
        {% for tag in tags %}
            <span class="px-2 py-1 text-xs rounded-full bg-indigo-50 text-indigo-600">{{ tag }}</span>
        {% endfor %}
    </div>
</div>
```

---

## 5. Objetos de Contexto Nativos (`@Session`, `@Request`, `@Query`, `@Cookie`)

El prefijo **`@`** identifica variables de entorno HTTP reservadas y gestionadas por el servidor:

| Objeto de Contexto | Propósito | Ejemplo de Acceso |
| :--- | :--- | :--- |
| **`@Session`** | Estado de sesión persistente en RAM/Cookie cifrada | `@Session.usuario = "jprm"` o `echo @Session.rol` |
| **`@Request`** | Payload del cuerpo HTTP (JSON o `application/x-www-form-urlencoded`) | `string email = @Request.email` |
| **`@Query`** | Parámetros de la URL Query String (`?page=2&filtro=todos`) | `int pagina = @Query.page` |
| **`@Cookie`** | Cookies HTTP enviadas por el navegador | `string token = @Cookie.token_acceso` |
| **`@Server`** | Metadatos de conexión (IP remota, método HTTP, User-Agent) | `string ip = @Server.remote_ip` |

Para cerrar la sesión del usuario:
```jprm
session_destroy()
redirect("/login")
```

---

## 6. F-Strings y Cadenas Multilínea

JPRM v2 incluye soporte de cadenas interpoladas y multilínea con triple comilla:

```jprm
string nombre = "Carlos"
int intentos = 3

# F-String con expresiones arbitrarias
string aviso = f"Usuario {nombre} tiene {intentos * 2} minutos restantes"

# Cadena multilínea (ideal para consultas SQL o plantillas)
string consulta = """
    SELECT u.id, u.nombre, COUNT(p.id) as total_pedidos
    FROM usuarios u
    LEFT JOIN pedidos p ON p.usuario_id = u.id
    WHERE u.activo = 1
    GROUP BY u.id
    ORDER BY total_pedidos DESC
"""
```

---

## 7. Sistema de Logging Asíncrono en Chunks

El runtime implementa logging de alta concurrencia con buffers asíncronos y rotación por tamaño (`app-chunk-N.log`):

- **`log_info(string mensaje)`**: Registra eventos normales en el canal asíncrono.
- **`log_warn(string mensaje)`**: Registra advertencias de ejecución.
- **`log_error(string mensaje)`**: Registra excepciones y errores críticos con timestamp ISO.

---

## 8. Funciones Nativas del Core

| Función | Firma | Descripción |
| :--- | :--- | :--- |
| `view` | `view(string vista, object data = null) : string` | Carga y renderiza una vista desde `app/Views/`. |
| `db_query` | `db_query(string sql) : array` | Ejecuta un `SELECT` sobre SQLite y retorna una lista de objetos. |
| `db_execute` | `db_execute(string sql) : int` | Ejecuta `INSERT`, `UPDATE` o `DELETE` y retorna filas afectadas. |
| `json_encode`| `json_encode(Value val) : string` | Serializa estructuras de datos a formato JSON. |
| `json_decode`| `json_decode(string json) : json` | Deserializa y valida una cadena a formato JSON. |
| `redirect`   | `redirect(string url)` | Responde al cliente con un código HTTP `302 Found`. |
| `len`        | `len(array\|string\|object v) : int` | Retorna el número de elementos o caracteres. |
| `sleep_ms`   | `sleep_ms(int ms)` | Pausa asíncrona no bloqueante sobre Tokio. |
| `http_get`   | `http_get(string url) : string` | Petición HTTP asíncrona de lectura. |
| `log_info`   | `log_info(string msg)` | Emisión de log estructurado al sistema de chunks. |

---

## 9. Depuración Interactiva Paso a Paso (Debugger)

JPRM incluye un motor de depuración interactivo nativo (REPL debugger) para rastrear errores y variables en tiempo de ejecución línea a línea:

- **Ejecución**: `jprm debug <archivo.jprm>`
- **Punto de interrupción programático**: `debugger;` o `breakpoint()`
- **Comandos en consola `(jprm-dbg)`**:
  - `n` / `next`: Avanza a la siguiente instrucción sin entrar a funciones.
  - `s` / `step`: Entra en detalle a la función invocada.
  - `c` / `continue`: Reanuda la ejecución hasta el siguiente breakpoint o fin del script.
  - `p <expr>` / `print <expr>`: Evalúa cualquier expresión o variable en el contexto actual.
  - `vars` / `locals`: Muestra todas las variables locales definidas y sus valores.
  - `list` / `l`: Imprime las líneas de código fuente circundantes con indicador de línea actual.
  - `break <línea>` / `b <línea>`: Añade un breakpoint dinámico en una línea.
  - `delete <línea>` / `d <línea>`: Elimina un breakpoint.
  - `quit` / `q`: Detiene la sesión de depuración.

---

## 10. Tipo Decimal de Punto Fijo (Fintech & Precisión)

Para evitar errores de redondeo de punto flotante en cálculos contables, divisas e intereses, JPRM implementa el tipo primitivo `decimal` de 128 bits con soporte para redondeo bancario (*Banker's Rounding*):

- **Sintaxis**: Literales con sufijo `m` o `M`: `let saldo = 1250.55m`
- **Operaciones exactas**: `+`, `-`, `*`, `/` entre decimales, enteros y conversiones seguras.
- **Métodos nativos**:
  - `.round(decimales)`: Redondeo bancario IEEE 754 (al número par más cercano).
  - `.round_away(decimales)`: Redondeo estándar alejándose de cero.
  - `.to_fixed(decimales)`: Formatea a cadena con cantidad fija de ceros decimales (ej. `"1250.55"`).
  - `.abs()`, `.floor()`, `.ceil()`, `.trunc()`
  - `.to_float()`, `.to_int()`
- **Primitivas Matemáticas y Estadísticas Vectoriales**:
  - `math_sum(arr)`: Suma acumulativa exacta.
  - `math_mean(arr)`: Media o promedio aritmético.
  - `math_median(arr)`: Mediana estadística.
  - `math_variance(arr)` y `math_std(arr)`: Varianza y desviación estándar poblacional.
  - `math_dot_product(arr1, arr2)`: Producto punto vectorial.

---

## 11. Abstracción DataFrame en Memoria RAM (Ciencia de Datos)

Permite procesar colecciones tabulares de alto volumen en memoria de forma desacoplada y multi-fuente:

- **Constructores Multi-Fuente**:
  - `DataFrame.from_csv(ruta_o_texto)`
  - `DataFrame.from_json(ruta_o_texto)`
  - `DataFrame.from_array(arreglo_de_objetos)`
  - `DataFrame.from_bbdd(url_bbdd, sql, [token])`
- **Métodos de Transformación**:
  - `.head(n)` / `.tail(n)`: Inspección de primeras/últimas filas.
  - `.shape()`: Tupla con cantidad de filas y columnas `[filas, columnas]`.
  - `.columns()`: Lista de nombres de columnas.
  - `.select(["colA", "colB"])`: Proyección columnar.
  - `.filter("col", ">=", valor)`: Filtrado lógico vectorizado.
  - `.sort_by("col", true|false)`: Ordenamiento ascendente o descendente.
  - `.describe()`: Resumen estadístico (count, mean, min, max, etc.).
  - `.to_csv()` / `.to_json()`: Exportación directa.

---

## 12. Microservicios y APIs Rápidas (Estilo FastAPI)

Además de la arquitectura MVC completa, JPRM permite crear microservicios ultraligeros de archivo único con la clase `App`:

- **Scaffold**: `jprm new mi_servicio --api` (o `--minimal`)
- **Estructura**:
  ```jprm
  let app = new App(8080)

  @app.get("/api/usuarios")
  function listar_usuarios() {
      return [
          { id: 1, nombre: "Ana", saldo: 250000m },
          { id: 2, nombre: "Bernardo", saldo: 120000m }
      ]
  }

  @app.post("/api/cotizar")
  function cotizar(datos) {
      let monto = datos.monto
      let total = monto * 1.19m
      return { estado: "ok", total: total.round(2) }
  }

  # Registro programático opcional
  app.get("/health", function() { return { status: "UP" } })

  app.listen(8080)
  ```

---

## 13. Conector Nativo Multi-Motor jprm-BBDD

Integración directa con el motor `jprm-BBDD` que combina Tabular (Apache Arrow/Parquet), Grafos topológicos (redb B-Tree) y Vectores/Documentos:

- **Instanciación**:
  ```jprm
  let db = new JprmBBDD("http://127.0.0.1:8123", "token_opcional")
  ```
- **Operaciones**:
  - `db.ping() : bool`: Verifica conectividad con `/ping`.
  - `db.query(sql) : array`: Ejecuta consultas SQL sobre ClickHouse wire format con respuesta en JSON.
  - `db.traverse_graph(origin_id, relation_code, direction, join_table) : array`: Ejecuta recorridos de grafo usando el operador nativo `GRAPH_PATH` y los cruza en memoria con tablas relacionales.
  - `db.to_dataframe(sql) : DataFrame`: Ingesta directa de una consulta al motor como un DataFrame en memoria RAM.
- **Funciones Globales**:
  - `jprm_bbdd_query(url, sql, [token])`
  - `jprm_bbdd_ping(url, [token])`
  - `jprm_bbdd_graph_traverse(url, origin_id, relation_code, [direction], [join_table], [token])`
  - `df_from_bbdd(url, sql, [token])`
