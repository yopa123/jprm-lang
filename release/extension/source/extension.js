const vscode = require('vscode');

/**
 * Activa la extensión JPRM Language & Debugger en VS Code / Cursor
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // 1. Registrar fábrica de adaptadores DAP (Debug Adapter Protocol)
    const factory = new JprmDebugAdapterDescriptorFactory();
    context.subscriptions.push(
        vscode.debug.registerDebugAdapterDescriptorFactory('jprm', factory)
    );

    // 2. Comando rápido para iniciar depuración del archivo activo
    const runDebugCommand = vscode.commands.registerCommand('jprm.debugCurrentFile', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No hay ningún archivo .jprm activo en el editor.');
            return;
        }

        if (!editor.document.fileName.endsWith('.jprm')) {
            vscode.window.showWarningMessage('El archivo actual no tiene extensión .jprm.');
        }

        const configuration = {
            type: 'jprm',
            name: 'JPRM: Depurar ' + editor.document.fileName,
            request: 'launch',
            program: editor.document.fileName,
            stopOnEntry: false
        };

        vscode.debug.startDebugging(undefined, configuration);
    });

    context.subscriptions.push(runDebugCommand);
}

/**
 * Fábrica que conecta VS Code / Cursor con el servidor DAP nativo `jprm dap`
 */
class JprmDebugAdapterDescriptorFactory {
    createDebugAdapterDescriptor(session) {
        const command = process.platform === 'win32' ? 'jprm.exe' : 'jprm';
        const args = ['dap'];
        return new vscode.DebugAdapterExecutable(command, args);
    }
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
