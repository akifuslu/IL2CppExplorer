class LoadingOverlay {
  constructor(editor) {
    this.editor = editor;
    this.id = 'my.loading.overlay';
    this.domNode = document.createElement('div');
    this.domNode.className = 'my-loading-overlay';
    this.domNode.innerHTML = '<div class="spinner"></div>';
  }
  getId() {
    return this.id;
  }
  getDomNode() {
    return this.domNode;
  }
  getPosition() {
    return null;      // let CSS handle positioning
  }
}

async function runWithLoading(editors, work) {
  // 1) Create & add one overlay per editor
  const overlays = editors.map(editor => {
    const ov = new LoadingOverlay(editor);
    editor.addOverlayWidget(ov);
    return { editor, ov };
  });

  try {
    // 2) Run your async work
    return await work();
  } finally {
    // 3) Clean up: remove each overlay
    overlays.forEach(({ editor, ov }) => {
      editor.removeOverlayWidget(ov);
    });
  }
}

require.config({ paths: { vs: './vs' } });


async function setupArmAsmLanguage() {
  // 1) Register the language
  monaco.languages.register({ id: 'armasm', extensions: ['.s', '.o'] });

  // 2) Load both JSON files in parallel
  const [confRes, grammarRes] = await Promise.all([
    fetch('./lang/armasm.conf.json'),
    fetch('./lang/armasm.lang.json')
  ]);

  // 3) Parse them
  const conf    = await confRes.json();
  const grammar = await grammarRes.json();

  console.log(conf);
  console.log(grammar);

  // 4) Apply to Monaco
  monaco.languages.setLanguageConfiguration('armasm', conf);
  monaco.languages.setMonarchTokensProvider('armasm', grammar);
}


require(['vs/editor/editor.main'], async function () {

    await setupArmAsmLanguage();

    const leftEditor = monaco.editor.create(
        document.getElementById('left'),
        {
            value:
                `// Type C# here…
using UnityEngine;
class Hello {
    string SayHello()
    {
        Debug.Log("Hello!");
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
            value: '; Generated ASM will appear here',
            language: 'armasm',
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

    Split(['#left-pane', '#mid-pane', '#right-pane'], {
        sizes: [33, 33, 33],      // initial sizes in percentages
        minSize: 100,         // minimum pixel size of each pane
        gutterSize: 8,        // width of the draggable gutter
        cursor: 'col-resize',  // cursor while dragging
        onDrag: (sizes) => {
          leftEditor.layout();
          middleEditor.layout();
          rightEditor.layout();    
        },
      });       

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

      const code = leftEditor.getValue();
      const outPath = './workDir/UserCode.cs';
      try {
        const msg = await window.api.saveFile(outPath, code);
        console.log('✅', msg);
      } catch (e) {
        console.error('❌ failed to save:', e);
      }

      try {

        await runWithLoading([middleEditor, rightEditor], async () => {
            const output = await window.api.runScript(
              [],
              { 
                  UNITY_DIR: unityDir,
                  ARCHITECTURE: arch,
                  CONFIGURATION: config
              }
          );
          console.log('✅ script output:\n', output);
        });

        const inPath = './workDir/out/UserCode.cpp';
        try {
          const code = await window.api.readFile(inPath);
          middleEditor.setValue(code);
        } catch (e) {
          console.error('Failed to load:', e);
        }

        const asmInPath = './workDir/out_asm/UserCode.s';
        try {
          const code = await window.api.readFile(asmInPath);
          rightEditor.setValue(code);
        } catch (e) {
          console.error('Failed to load:', e);
        }

    } catch (err) {
        console.error('❌ script failed:\n', err);
      }
    });
});
