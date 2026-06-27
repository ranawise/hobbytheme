import React, { useCallback, useEffect, useRef } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import Spinner from '@/components/elements/Spinner';
import modes from '@/modes';

// Maps CodeMirror MIME types → Monaco language IDs
const MIME_TO_MONACO: Record<string, string> = {
    'text/javascript': 'javascript',
    'application/javascript': 'javascript',
    'text/typescript': 'typescript',
    'application/json': 'json',
    'text/x-json': 'json',
    'text/css': 'css',
    'text/x-scss': 'scss',
    'text/x-sass': 'scss',
    'text/html': 'html',
    'text/x-python': 'python',
    'text/x-java': 'java',
    'text/x-sh': 'shell',
    'application/x-sh': 'shell',
    'text/x-lua': 'lua',
    'text/x-sql': 'sql',
    'text/x-yaml': 'yaml',
    'text/x-toml': 'ini',
    'text/x-properties': 'ini',
    'text/xml': 'xml',
    'application/xml': 'xml',
    'text/x-dockerfile': 'dockerfile',
    'text/x-go': 'go',
    'text/x-rustsrc': 'rust',
    'text/x-php': 'php',
    'text/x-ruby': 'ruby',
    'text/x-c++src': 'cpp',
    'text/x-csrc': 'c',
    'text/x-csharp': 'csharp',
    'text/x-swift': 'swift',
    'text/x-kotlin': 'kotlin',
    'text/x-markdown': 'markdown',
    'text/x-gfm': 'markdown',
    'text/x-nginx-conf': 'ini',
    'text/x-diff': 'plaintext',
    'text/plain': 'plaintext',
};

export const mimeToMonaco = (mime: string): string => MIME_TO_MONACO[mime] || 'plaintext';

const findModeByFilename = (filename: string) => {
    for (const mode of modes) {
        if (mode.file && mode.file.test(filename)) return mode;
    }
    const dot = filename.lastIndexOf('.');
    const ext = dot > -1 ? filename.substring(dot + 1) : null;
    if (ext) {
        for (const mode of modes) {
            if (mode.ext?.includes(ext)) return mode;
        }
    }
    return undefined;
};

export interface Props {
    style?: React.CSSProperties;
    initialContent?: string;
    mode: string;
    filename?: string;
    onModeChanged: (mode: string) => void;
    fetchContent: (callback: () => Promise<string>) => void;
    onContentSaved: () => void;
}

export default ({ style, initialContent, mode, filename, onModeChanged, fetchContent, onContentSaved }: Props) => {
    const editorRef = useRef<any>(null);
    const onContentSavedRef = useRef(onContentSaved);
    const initialContentRef = useRef(initialContent);
    const monaco = useMonaco();

    useEffect(() => { onContentSavedRef.current = onContentSaved; }, [onContentSaved]);

    // Auto-detect language from filename
    useEffect(() => {
        if (!filename) return;
        const detected = findModeByFilename(filename);
        if (detected) onModeChanged(detected.mime);
    }, [filename]);

    // Sync language when mode prop changes (user picked from dropdown)
    useEffect(() => {
        if (!monaco || !editorRef.current) return;
        const model = editorRef.current.getModel();
        if (model) monaco.editor.setModelLanguage(model, mimeToMonaco(mode));
    }, [mode, monaco]);

    // Sync content when the file is loaded / reloaded from API
    useEffect(() => {
        initialContentRef.current = initialContent;
        if (!editorRef.current || initialContent === undefined) return;
        if (editorRef.current.getValue() !== initialContent) {
            editorRef.current.setValue(initialContent);
        }
    }, [initialContent]);

    // Define custom theme once Monaco runtime is ready
    useEffect(() => {
        if (!monaco) return;
        monaco.editor.defineTheme('hobbydark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
                'editor.background': '#101013',
                'editor.lineHighlightBackground': '#ffffff08',
                'editorLineNumber.foreground': '#3f3f46',
                'editorLineNumber.activeForeground': '#71717a',
                'editorGutter.background': '#101013',
                'editorIndentGuide.background1': '#ffffff0d',
                'editor.selectionBackground': '#ffffff1a',
                'editor.inactiveSelectionBackground': '#ffffff0f',
                'scrollbarSlider.background': '#ffffff18',
                'scrollbarSlider.hoverBackground': '#ffffff28',
                'scrollbarSlider.activeBackground': '#ffffff38',
                'editorWidget.background': '#0c0c0f',
                'editorWidget.border': '#ffffff1a',
                'editorSuggestWidget.background': '#0c0c0f',
                'editorSuggestWidget.border': '#ffffff1a',
                'editorSuggestWidget.selectedBackground': '#ffffff10',
                'editorHoverWidget.background': '#0c0c0f',
                'editorHoverWidget.border': '#ffffff1a',
                'input.background': '#101013',
                'input.border': '#ffffff20',
                'focusBorder': '#ffffff30',
            },
        });
        monaco.editor.setTheme('hobbydark');
    }, [monaco]);

    const handleEditorMount = useCallback((editor: any, monacoInstance: any) => {
        editorRef.current = editor;

        // Give the parent a way to read content for saving
        fetchContent(() => Promise.resolve(editor.getValue()));

        // Ctrl+S / Cmd+S → trigger save
        editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS, () => {
            onContentSavedRef.current();
        });

        // Set content if it was already loaded before the editor mounted
        if (initialContentRef.current) {
            editor.setValue(initialContentRef.current);
        }
    }, []);

    return (
        <div style={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', ...style }}>
            <Editor
                height={'100%'}
                language={mimeToMonaco(mode)}
                theme={'hobbydark'}
                loading={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#101013' }}>
                        <Spinner size={'large'} centered />
                    </div>
                }
                onMount={handleEditorMount}
                options={{
                    fontSize: 13,
                    fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", ui-monospace, SFMono-Regular, monospace',
                    fontLigatures: true,
                    lineHeight: 22,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    renderLineHighlight: 'line',
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: 'on',
                    smoothScrolling: true,
                    padding: { top: 16, bottom: 16 },
                    tabSize: 4,
                    insertSpaces: true,
                    automaticLayout: true,
                    scrollbar: {
                        useShadows: false,
                        verticalScrollbarSize: 6,
                        horizontalScrollbarSize: 6,
                    },
                    overviewRulerLanes: 0,
                    hideCursorInOverviewRuler: true,
                    overviewRulerBorder: false,
                    renderWhitespace: 'none',
                    bracketPairColorization: { enabled: true },
                    suggest: { showStatusBar: false },
                    quickSuggestions: { other: false, comments: false, strings: false },
                    parameterHints: { enabled: false },
                }}
            />
        </div>
    );
};
