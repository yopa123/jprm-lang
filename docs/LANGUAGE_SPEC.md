# Especificación del Lenguaje JPRM

> **Versión:** 1.0.0-alpha  
> **Extensión de código fuente:** `.jprm`  
> **Extensión de bytecode binario:** `.jprmc`  
> **Paradigma:** Orientado a Objetos con Tipado Cerrado Estricto, arquitectura MVC desacoplada, Asincronía Nativa (`async`/`await`/`spawn`) y Ejecución de Alto Rendimiento.

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

    fn calcularIva(float tasa) : float {
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

El runtime de JPRM admite ejecución asíncrona real en scripts y controladores:

### 3.1. Tareas en Segundo Plano con `spawn { ... }`
Desacopla tareas pesadas del ciclo de respuesta HTTP. La respuesta al cliente web se envía de inmediato, mientras el bloque `spawn` continúa ejecutándose en segundo plano:

```jprm
@post("/pedido")
fn procesarPedido() {
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
- `sleep_ms(int milisegundos)`: Pausa asíncrona no bloqueante que cede el control al planificador sin detener el servidor.
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
