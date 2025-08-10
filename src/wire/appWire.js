define(['src/ui/runWithLoading'], function (runWithLoading) {
    function wireUI({ leftEditor, middleEditor, rightEditor }) {
      const archSelect   = document.getElementById('archSelect');
      const configSelect = document.getElementById('configSelect');
  
      const unityDirBtn   = document.getElementById('unityDirBtn');
      const unityDirInput = document.getElementById('unityDirPicker');
      const unityDirPath  = document.getElementById('unityDirPath');
  
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
          unityDirPath.value = window.api.dirname(file.path);
          console.log('Selected Unity path:', unityDirPath.value);
        }
      });
  
      document.getElementById('generateBtn').addEventListener('click', async () => {
        const unityDir = unityDirPath.value;
        const arch     = archSelect.value;
        const config   = configSelect.value;
  
        const code = leftEditor.getValue();
        const outPath = 'workDir/UserCode.cs';
  
        try {
          const msg = await window.api.saveFile(outPath, code);
          console.log('✅', msg);
        } catch (e) {
          console.error('❌ failed to save:', e);
        }
  
        try {
          await runWithLoading([middleEditor, rightEditor], async () => {
            const output = await window.api.runScript([], {
              UNITY_DIR: unityDir,
              ARCHITECTURE: arch,
              CONFIGURATION: config
            },
            '');
            console.log('✅ script output:\n', output);
          });
  
          // load C++
          try {
            const cpp = await window.api.readFile('workDir/out/UserCode.cpp');
            middleEditor.setValue(cpp);
          } catch (e) {
            console.error('Failed to load C++:', e);
          }
  
          // load ASM
          try {
            const asm = await window.api.readFile('workDir/out_asm/UserCode.s');
            rightEditor.setValue(asm);
          } catch (e) {
            console.error('Failed to load ASM:', e);
          }
        } catch (err) {
          console.error('❌ script failed:\n', err);
        }
      });
    }
  
    return { wireUI };
  });
  