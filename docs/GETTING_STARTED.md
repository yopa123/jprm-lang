# Guía de Inicio Rápido: De Cero a Producción en 10 Minutos

¡Bienvenido a **JPRM v2**! Esta guía te llevará paso a paso en la creación de tu primera aplicación web: un gestor de notas con base de datos SQLite, migraciones, arquitectura MVC, tareas asíncronas en segundo plano y empaquetado de producción con bytecode ofuscado (`.jprmc`).

---

## Prerrequisitos

Tener el binario `jprm` (o `jprm.exe` en Windows) en tu variable de entorno `PATH` o en tu carpeta de trabajo.

Para verificar la instalación, abre tu terminal:
```bash
jprm help
```

---

## Paso 1: Instalar la Extensión para tu Editor

Antes de escribir código, instala el soporte de sintaxis para **Cursor** o **Visual Studio Code**:

```bash
jprm install-extension
```
Luego recarga tu editor (`Ctrl + Shift + P` -> `Developer: Reload Window`). Tendrás resaltado TextMate y snippets automáticos para archivos `.jprm`.

---

## Paso 2: Crear el Proyecto (`jprm new`)

Ejecuta el generador de proyectos:

```bash
jprm new gestor_notas
cd gestor_notas
```

JPRM creará una estructura limpia y desacoplada:
```
gestor_notas/
├── app/
│   ├── Controllers/   # Lógica de endpoints y despacho HTTP
│   ├── Models/        # Modelos ORM con ActiveRecord
│   ├── Views/         # Plantillas HTML con interpolación JPRM
│   └── Widgets/       # Componentes visuales reutilizables
├── database/
│   └── migrations/    # Versionamiento del esquema SQL
├── storage/
│   └── logs/          # Bitácoras de ejecución no bloqueantes
├── www/
│   ├── index.jprm     # Front Controller público
│   └── css/
├── coreweb.toml       # Configuración del entorno
└── README.md
```

---

## Paso 3: Crear la Tabla con una Migración Declarativa

Genera tu primer archivo de migración:

```bash
jprm make:migration crear_tabla_notas
```

Abre el archivo recién creado en `database/migrations/` (por ejemplo `..._crear_tabla_notas.jprm`) y define las funciones `up()` y `down()`:

```jprm
fn up() {
    db_execute("""
        CREATE TABLE IF NOT EXISTS notas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            contenido TEXT NOT NULL,
            prioridad TEXT DEFAULT 'normal',
            creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
}

fn down() {
    db_execute("DROP TABLE IF EXISTS notas")
}
```

Aplica la migración a la base de datos SQLite local:
```bash
jprm migrate
```
Verás la confirmación:
```
Migrando: 20261118_..._crear_tabla_notas.jprm
  Migrado (Lote: 1)

1 migración(es) aplicada(s).
```

---

## Paso 4: Crear el Modelo ORM con ActiveRecord

Genera el modelo:
```bash
jprm make:model Nota
```

Edita `app/Models/Nota.jprm` para definir los atributos tipados y métodos de consulta:

```jprm
class Nota {
    int id
    string titulo
    string contenido
    string prioridad

    # Validación antes de persistir
    fn validar() {
        if len(this.titulo) == 0 {
            throw "El título no puede estar vacío"
        }
    }
}
```

---

## Paso 5: Crear el Controlador y Despacho Asíncrono

Crea o edita `app/Controllers/NotaController.jprm`:

```jprm
from app.Models.Nota import Nota

class NotaController {

    # GET / -> Lista de notas
    @get("/")
    fn index() {
        array lista_notas = Nota.orderBy("id", "DESC").get()

        object data = new Object()
        data.titulo_pagina = "Mis Notas Rápidas"
        data.notas = lista_notas

        return view("notas/index", data)
    }

    # POST /api/notas -> Crear nueva nota
    @post("/api/notas")
    fn guardar() {
        object req = @Request

        object nueva_nota = new Nota()
        nueva_nota.titulo = req.titulo
        nueva_nota.contenido = req.contenido
        nueva_nota.prioridad = req.prioridad ? req.prioridad : "normal"
        nueva_nota.save()

        # Tarea en background: loguear sin frenar la respuesta HTTP
        spawn {
            sleep_ms(200)
            log_info(f"Nota #{nueva_nota.id} creada con título: '{nueva_nota.titulo}'")
        }

        return redirect("/")
    }
}
```

---

## Paso 6: Diseñar la Vista con Widgets Declarativos

Crea el archivo `app/Views/notas/index.jprm`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>{{ titulo_pagina }} - JPRM v2</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 text-slate-800 p-8 font-sans">
    <div class="max-w-3xl mx-auto">
        <header class="flex justify-between items-center mb-8 pb-4 border-b">
            <h1 class="text-3xl font-extrabold text-indigo-600">📝 {{ titulo_pagina }}</h1>
            <span class="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-bold">
                JPRM v2 Runtime
            </span>
        </header>

        <!-- Formulario de Creación -->
        <form action="/api/notas" method="POST" class="bg-white p-6 rounded-2xl shadow-sm border mb-8 space-y-4">
            <div>
                <label class="block text-sm font-semibold mb-1">Título de la Nota</label>
                <input type="text" name="titulo" required placeholder="Ej: Comprar insumos" class="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500">
            </div>
            <div>
                <label class="block text-sm font-semibold mb-1">Contenido</label>
                <textarea name="contenido" rows="3" required placeholder="Escribe el detalle aquí..." class="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
            </div>
            <div class="flex justify-between items-center">
                <select name="prioridad" class="border rounded-lg p-2 text-sm bg-slate-50">
                    <option value="normal">Prioridad Normal</option>
                    <option value="alta">Prioridad Alta 🔥</option>
                </select>
                <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-lg transition-all shadow">
                    Guardar Nota
                </button>
            </div>
        </form>

        <!-- Listado de Notas -->
        <div class="space-y-4">
            <h2 class="text-xl font-bold">Notas Registradas ({{ len(notas) }})</h2>
            
            {% if len(notas) == 0 %}
                <div class="bg-white p-8 text-center rounded-2xl border text-slate-400">
                    No tienes notas registradas todavía. ¡Crea la primera arriba!
                </div>
            {% endif %}

            {% for n in notas %}
                <div class="bg-white p-5 rounded-xl border shadow-sm flex justify-between items-start">
                    <div>
                        <h3 class="text-lg font-bold text-slate-900">{{ n.titulo }}</h3>
                        <p class="text-slate-600 mt-1 whitespace-pre-line">{{ n.contenido }}</p>
                    </div>
                    <span class="text-xs font-semibold px-2.5 py-1 rounded-full {{ n.prioridad == 'alta' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600' }}">
                        {{ n.prioridad }}
                    </span>
                </div>
            {% endfor %}
        </div>
    </div>
</body>
</html>
```

---

## Paso 7: Probar en Modo Desarrollo con Hot-Patching

Inicia el servidor local de desarrollo:

```bash
jprm serve --port 8080
```

1. Abre tu navegador en `http://127.0.0.1:8080/`.
2. Escribe una nota y pulsa **Guardar Nota**.
3. Cambia cualquier texto o color en tu archivo HTML o controlador y recarga el navegador: los cambios se aplican de inmediato en microsegundos sin reiniciar el proceso gracias al sistema de Hot-Patching en tiempo real.

---

## Paso 8: Empaquetar para Producción con Bytecode (`jprm build`)

Cuando tu aplicación esté lista para desplegar en tu servidor Linux o Windows:

```bash
jprm build
```

El compilador generará una carpeta aislada `./build/`:
```
⚡ Generando paquete de producción en carpeta separada: "./build"
🔒 Código fuente intacto. Ofuscando scripts a bytecode binario (.jprmc)...

🎉 ¡Build completado con éxito!
   📦 Scripts compilados y ofuscados (.jprmc): 6
   📁 Assets estáticos copiados (CSS/JS/IMG/TOML): 3
   🚀 Directorio listo para desplegar: "./build"
```

### Ejecutar en Producción:
Sube únicamente la carpeta `./build` y el ejecutable `jprm`:
```bash
jprm serve --root ./build/www --port 80
```
- **Ventaja de seguridad**: Ningún archivo con código fuente legible `.jprm` viaja al servidor; solo binarios `.jprmc`.
- **Rendimiento**: El servidor arranca con consumo de memoria inferior a 10 MB de RAM y atiende miles de peticiones por segundo sobre Rust y Tokio.
