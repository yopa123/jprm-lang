# Referencia de la Línea de Comandos (CLI) de JPRM (`jprm`)

El ejecutable `jprm` es la herramienta integral para el ciclo de desarrollo, migraciones, consola interactiva, empaquetado de producción y servidor web de alta velocidad.

---

## 1. Comandos Principales

### 1.1. `jprm serve`
Inicia el servidor web asíncrono con Hot-Patching en tiempo real (desarrollo) o resolución de binarios `.jprmc` (producción).

```bash
jprm serve [--port <puerto>] [--root <directorio>]
```

#### Opciones:
- `--port <puerto>`: Puerto TCP en el que escuchará el servidor (por defecto: `8080`).
- `--root <directorio>`: Ruta a la carpeta pública a servir (por defecto: `./www`).

#### Ejemplos:
```bash
# Servir proyecto actual en el puerto por defecto (8080)
jprm serve

# Servir carpeta específica en el puerto 3000
jprm serve --port 3000 --root ./test/mi_tienda/www

# Servir paquete de producción ofuscado
jprm serve --port 8080 --root ./build/www
```

---

### 1.2. `jprm build` (Alias: `jprm compile`)
Genera un paquete de producción completo en una carpeta separada, ofuscando toda la lógica y vistas a bytecode binario `.jprmc` y preservando los assets estáticos.

```bash
jprm build [origen] [--out <directorio_salida>]
```

#### Opciones:
- `[origen]`: Ruta del proyecto a compilar (por defecto: `.`).
- `--out <directorio>`: Carpeta de destino del paquete final (por defecto: `./build` o `<origen>/build`).

#### Comportamiento del Build:
1. **Aislamiento**: El código fuente original `.jprm` permanece intacto.
2. **Compilación a Bytecode**: Cada archivo `.jprm` (controladores, modelos, widgets y vistas HTML) se compila directamente a formato binario `.jprmc`, protegiendo el código fuente y optimizando la carga en producción.
3. **Preservación de Assets**: Archivos estáticos (`.css`, `.js`, imágenes, fuentes, `coreweb.toml` y base de datos) se replican manteniendo exactamente la misma estructura de carpetas.

#### Ejemplo:
```bash
jprm build
# Salida generada en ./build/ lista para transferir a producción
```

---

### 1.3. `jprm repl` (Alias: `jprm console`, `jprm -i`)
Inicia la consola interactiva de JPRM v2 para probar sintaxis, evaluar expresiones matemáticas, consultar bases de datos y probar modelos en vivo.

```bash
jprm repl
```

#### Ejemplo de Sesión:
```
JPRM v1.0.0-alpha (consola interactiva)
Escribe expresiones o código JPRM. 'exit' para salir.

jprm> int x = 15
jprm> int y = 27
jprm> x + y
42
jprm> string saludo = "Hola JPRM"
jprm> f"{saludo}! Longitud: {len(saludo)}"
Hola JPRM! Longitud: 9
jprm> exit
```

---

### 1.4. `jprm run <archivo>`
Ejecuta de manera directa un script `.jprm` o un archivo compilado `.jprmc` desde la terminal.

```bash
# Ejecutar script fuente
jprm run scripts/tarea.jprm

# Ejecutar script compilado
jprm run build/scripts/tarea.jprmc
```

---

## 2. Sistema de Migraciones de Base de Datos

JPRM v2 incorpora un gestor declarativo de migraciones para versionar esquemas de SQLite:

| Comando | Descripción |
| :--- | :--- |
| **`jprm migrate`** | Aplica todas las migraciones pendientes en `database/migrations/`. |
| **`jprm migrate:rollback`** | Revierte el último lote de migraciones aplicadas. |
| **`jprm migrate:status`** | Despliega una tabla indicando el estado (Aplicada / Pendiente) de cada migración. |
| **`jprm make:migration <nombre>`** | Crea un nuevo archivo de migración con timestamp en `database/migrations/`. |

#### Ejemplo de Migración Generada (`database/migrations/20261118_crear_usuarios.jprm`):
```jprm
fn up() {
    db_execute("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            activo INTEGER DEFAULT 1,
            creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
}

fn down() {
    db_execute("DROP TABLE IF EXISTS usuarios")
}
```

---

## 3. Generadores de Código y Arquitectura Limpia

JPRM facilita la creación de componentes estandarizados mediante comandos `make`:

### 3.1. `jprm new <nombre>` (Alias: `jprm create <nombre>`)
Crea un nuevo proyecto con la estructura MVC completa lista para desarrollo:
```
mi_proyecto/
├── app/
│   ├── Controllers/
│   ├── Models/
│   ├── Views/
│   └── Widgets/
├── database/
│   └── migrations/
├── storage/
│   └── logs/
├── www/
│   └── index.jprm
├── coreweb.toml
└── README.md
```

### 3.2. Generadores de Capas de Dominio
- **`jprm make:model <Nombre>`**: Genera un modelo en `app/Models/` con herencia ActiveRecord y QueryBuilder.
- **`jprm make:dto <Nombre>`**: Genera un Data Transfer Object en `app/DTOs/` para validación de payloads `@Request`.
- **`jprm make:entity <Nombre>`**: Genera una Entidad de negocio pura en `app/Entities/`.

---

## 4. Soporte para Editores (`jprm install-extension`)

Instala y registra automáticamente el paquete de soporte de lenguaje para **Visual Studio Code** y **Cursor**:

```bash
jprm install-extension
```

#### Capacidades instaladas:
- Resaltado de sintaxis TextMate completo para palabras clave (`class`, `int`, `spawn`, `@get`, etc.).
- Soporte para etiquetas mixtas HTML + JPRM (`{{ }}`, `{% %}`).
- Snippets de productividad para modelos, controladores y migraciones.
