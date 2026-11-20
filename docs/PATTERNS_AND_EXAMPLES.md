# Patrones de Código y Recetas en JPRM v2

Guía práctica con patrones arquitectónicos recomendados y ejemplos de código listos para usar en JPRM v2.

---

## 1. Patrón Repositorio y ActiveRecord ORM

### 1.1. Definición del Modelo (`app/Models/Articulo.jprm`)
```jprm
class Articulo {
    int id
    string titulo
    string slug
    string contenido
    int visitas
    bool publicado

    fn publicar() {
        this.publicado = true
        this.save()
    }

    fn registrarVisita() {
        this.visitas = this.visitas + 1
        this.save()
    }
}
```

### 1.2. Controlador Paginado (`app/Controllers/BlogController.jprm`)
```jprm
from app.Models.Articulo import Articulo

class BlogController {

    @get("/blog")
    fn index() {
        int pagina = @Query.page ? int(@Query.page) : 1
        int por_pagina = 10
        int offset = (pagina - 1) * por_pagina

        array articulos = Articulo.where("publicado", 1)
                                  .orderBy("id", "DESC")
                                  .limit(por_pagina)
                                  .offset(offset)
                                  .get()

        object data = new Object()
        data.articulos = articulos
        data.pagina_actual = pagina

        return view("blog/index", data)
    }

    @get("/articulo/:slug")
    fn ver(string slug) {
        object post = Articulo.where("slug", slug).first()
        if post == null {
            redirect("/404")
            return ""
        }

        # Registrar visita en background sin frenar al usuario
        spawn {
            post.registrarVisita()
            log_info(f"Visita registrada para: {post.titulo}")
        }

        object data = new Object()
        data.post = post
        return view("blog/detalle", data)
    }
}
```

---

## 2. Autenticación y Gestión de Sesiones

### 2.1. Login Seguro con Verificación
```jprm
@post("/auth/login")
fn autenticar() {
    string email = @Request.email
    string password = @Request.password

    if len(email) == 0 || len(password) == 0 {
        return json_encode({"error": "Debe completar todos los campos"})
    }

    array usuarios = db_query(f"SELECT * FROM usuarios WHERE email = '{email}' LIMIT 1")
    if len(usuarios) == 0 {
        return json_encode({"error": "Credenciales inválidas"})
    }

    object user = usuarios[0]
    # En producción usar hash_verify(password, user.password_hash)
    if user.password != password {
        log_warn(f"Intento fallido de login para {email}")
        return json_encode({"error": "Credenciales inválidas"})
    }

    # Asignar sesión protegida
    @Session.usuario_id = user.id
    @Session.nombre = user.nombre
    @Session.rol = user.rol

    log_info(f"Usuario {user.nombre} ha iniciado sesión con éxito")
    return json_encode({"status": "ok", "redirect": "/panel"})
}
```

### 2.2. Logout y Limpieza
```jprm
@get("/auth/logout")
fn salir() {
    session_destroy()
    redirect("/")
}
```

---

## 3. Despacho Asíncrono en Background (`spawn`)

Ideal para operaciones de I/O pesado, webhooks salientes o envíos de notificaciones:

```jprm
@post("/api/notificar")
fn notificarUsuarios() {
    object payload = @Request
    string mensaje = payload.mensaje

    # Respondemos de inmediato al cliente HTTP (< 2 ms)
    spawn {
        log_info("Iniciando despacho asíncrono de notificaciones...")
        array destinatarios = db_query("SELECT email FROM suscriptores WHERE activo = 1")
        
        for sub in destinatarios {
            # Simulación de llamada externa
            sleep_ms(50)
            log_info(f"Notificación despachada a {sub.email}")
        }
        
        log_info("Despacho asíncrono completado con éxito.")
    }

    return json_encode({
        "status": "procesando_en_background",
        "mensaje": "La tarea ha sido encolada en el runtime de Tokio."
    })
}
```

---

## 4. Vistas Declarativas con Componentes Reutilizables

### 4.1. Widget de Alerta (`app/Widgets/Alerta.jprm`)
```html
<div class="p-4 rounded-xl flex items-center gap-3 {{ tipo == 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200' }}">
    <span class="text-xl">{{ tipo == 'error' ? '⚠️' : '✅' }}</span>
    <div>
        <h4 class="font-bold">{{ titulo }}</h4>
        <p class="text-sm">{{ mensaje }}</p>
    </div>
</div>
```

### 4.2. Inclusión en una Vista Principal
```html
<div class="max-w-2xl mx-auto my-8 space-y-4">
    {% if error %}
        {{ widget("Alerta", {"tipo": "error", "titulo": "Error", "mensaje": error}) }}
    {% endif %}

    {% if exito %}
        {{ widget("Alerta", {"tipo": "success", "titulo": "Éxito", "mensaje": exito}) }}
    {% endif %}
</div>
```
