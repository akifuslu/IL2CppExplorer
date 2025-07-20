require.config({ paths: { vs: './vs' } });
require(['vs/editor/editor.main'], function () {
    const leftEditor = monaco.editor.create(
        document.getElementById('left'),
        {
            value:
                `// Type C# here…
class Hello {
    string SayHello()
    {
        return "Hello!";
    }
}`,
            language: 'csharp',
            theme: 'vs-dark'
        }
    );

    const middleEditor = monaco.editor.create(
        document.getElementById('middle'),
        {
            value: '// Generated C++ will appear here',
            language: 'cpp',
            theme: 'vs-dark',
            readOnly: true,
            minimap: { enabled: false }
        }
    );

    const rightEditor = monaco.editor.create(
        document.getElementById('right'),
        {
            value: '// Generated ASM will appear here',
            language: 'cpp',
            theme: 'vs-dark',
            readOnly: true,
            minimap: { enabled: false }
        }
    );

    // Re‐layout on window resize
    window.addEventListener('resize', () => {
        leftEditor.layout();
        middleEditor.layout();
        rightEditor.layout();
    });

    // Initial layout
    leftEditor.layout();
    middleEditor.layout();
    rightEditor.layout();

    const archSelect = document.getElementById('archSelect');
    const configSelect = document.getElementById('configSelect');

    // directory selector controls
    const unityDirBtn = document.getElementById('unityDirBtn');
    const unityDirInput = document.getElementById('unityDirPicker');
    const unityDirPath = document.getElementById('unityDirPath');

    unityDirBtn.addEventListener('click', async () => {
        const dir = await window.api.selectUnityDirectory();
        if (dir) {
            unityDirPath.value = dir;
            console.log('Selected Unity path:', dir);
        }
    });

    unityDirInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.path) {
            // show the folder path
            unityDirPath.value = window.api.dirname(file.path);
            console.log('Selected Unity path:', unityDirPath.value);
        }
    });

    document.getElementById('generateBtn')
    .addEventListener('click', async () => {
      const unityDir  = unityDirPath.value;
      const arch = archSelect.value;
      const config = configSelect.value;

      try {
        const output = await window.api.runScript(
            [],
            { 
                UNITY_DIR: unityDir,
                ARCHITECTURE: arch,
                CONFIGURATION: config
            }
        );
        console.log('✅ script output:\n', output);
      } catch (err) {
        console.error('❌ script failed:\n', err);
      }
    });
});
