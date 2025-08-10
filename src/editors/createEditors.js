define(['vs/editor/editor.main'], function () {
    function createEditors() {
      const leftEditor = monaco.editor.create(document.getElementById('left'), {
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
      });
  
      const middleEditor = monaco.editor.create(document.getElementById('middle'), {
        value: '// Generated C++ will appear here',
        language: 'cpp',
        theme: 'vs-dark',
        readOnly: true,
        minimap: { enabled: false }
      });
  
      const rightEditor = monaco.editor.create(document.getElementById('right'), {
        value: '; Generated ASM will appear here',
        language: 'armasm',
        theme: 'vs-dark',
        readOnly: true,
        minimap: { enabled: false }
      });
  
      function relayout() {
        leftEditor.layout();
        middleEditor.layout();
        rightEditor.layout();
      }
  
      window.addEventListener('resize', relayout);
      relayout();
  
      // Split.js is assumed global
      Split(['#left-pane', '#mid-pane', '#right-pane'], {
        sizes: [33, 33, 33],
        minSize: 100,
        gutterSize: 8,
        cursor: 'col-resize',
        onDrag: relayout
      });
  
      return { leftEditor, middleEditor, rightEditor };
    }
  
    return { createEditors };
  });
  