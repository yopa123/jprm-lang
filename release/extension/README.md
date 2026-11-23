# 🎨 Extensión Oficial de JPRM para VS Code y Cursor
### Resaltado de Sintaxis + Tema Modern Dark + Depurador Visual Interactivo (DAP)

Esta carpeta contiene la extensión oficial de **JPRM Language** (versión **1.1.0**) que transforma Cursor y Visual Studio Code en un entorno de desarrollo integrado completo para JPRM.

---

## 📦 Contenido del Paquete

1. **`jprm-language-1.1.0.vsix`**:
   - Paquete de instalación directa con un clic para VS Code y Cursor.
2. **`source/`**:
   - Código fuente completo de la extensión:
     - `syntaxes/jprm.tmLanguage.json`: Gramática TextMate con soporte de sintaxis moderna JPRM (declaradores, palabras clave `let`, `fn`, `spawn`, `await`, tipos `decimal`, `DataFrame`, `App`, literales `1250.50m`, decoradores `@app.get`, etc.).
     - `themes/jprm-dark-theme.json`: Tema oficial *"JPRM Modern Dark"* con contraste y paleta optimizada.
     - `extension.js`: Adaptador Debug Adapter Protocol (DAP) que conecta el IDE con el motor de depuración `jprm dap`.
     - `snippets/jprm.json`: Plantillas y autocompletado rápido.

---

## ⚡ Instalación

Tienes dos opciones muy sencillas:

### Opción A: Instalación Automática por CLI (Recomendada)
Si tienes el binario `jprm` en tu terminal, simplemente ejecuta:
```bash
jprm install-extension
```
El instalador detecta automáticamente tus perfiles de **Cursor** y **VS Code** e instala la extensión al instante en:
- `~/.cursor/extensions/jprm-language-1.1.0/`
- `~/.vscode/extensions/jprm-language-1.1.0/`

### Opción B: Instalación Gráfica desde el archivo `.vsix`
1. Abre **VS Code** o **Cursor**.
2. Ve a la pestaña **Extensiones** (`Ctrl + Shift + X`).
3. Haz clic en el menú de los tres puntos `...` en la esquina superior derecha del panel de extensiones.
4. Selecciona **"Install from VSIX..."** (Instalar desde VSIX...).
5. Selecciona el archivo `jprm-language-1.1.0.vsix` de esta carpeta.
6. ¡Listo! Reinicia el editor para que surta efecto.

---

## 🎨 Activar el Tema Oficial "JPRM Modern Dark"

1. Presiona `Ctrl + K, Ctrl + T` (o ve a `File > Preferences > Theme > Color Theme`).
2. Selecciona **"JPRM Modern Dark"**.
3. El editor decorará automáticamente todos los scripts `.jprm` con colores nítidos y diferenciados para decoradores `@app.get`, tipos financieros `decimal`, sentencias `debugger;` y bloques asíncronos `spawn`.

---

## 🐞 Cómo Usar el Depurador Visual (F5)

1. Abre cualquier archivo con extensión `.jprm`.
2. **Coloca Breakpoints:** Haz clic en el margen izquierdo del número de línea para marcar el punto rojo.
3. **Inicia la depuración:** Presiona `F5` o haz clic en la pestaña *"Run and Debug"* (`Ctrl + Shift + D`) y pulsa el botón verde *"JPRM: Depurar archivo actual"*.
4. **Control visual:**
   - La ejecución se pausará en tu breakpoint resaltando la línea en amarillo.
   - En el panel izquierdo podrás ver todas las variables locales (`Variables`) y la pila de llamadas (`Call Stack`).
   - Usa los botones flotantes de la barra superior:
     - `Continuar` (`F5`)
     - `Paso a paso / Step Over` (`F10`)
     - `Entrar / Step Into` (`F11`)
     - `Detener` (`Shift + F5`)
