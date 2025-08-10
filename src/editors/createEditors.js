define(['vs/editor/editor.main'], function () {
    function createEditors() {
      const leftEl   = document.getElementById('left');
      const midEl    = document.getElementById('middle');
      const rightEl  = document.getElementById('right');
  
      const leftEditor = monaco.editor.create(leftEl, {
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
  
      const middleEditor = monaco.editor.create(midEl, {
        value: '// Generated C++ will appear here',
        language: 'cpp',
        theme: 'vs-dark',
        readOnly: true,
        minimap: { enabled: false }
      });
  
      const rightEditor = monaco.editor.create(rightEl, {
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
  
      // Initialize Split after the first paint so CSS sizes are applied
      requestAnimationFrame(() => {
        const split = Split(['#left-pane', '#mid-pane', '#right-pane'], {
          sizes: [33, 34, 33],
          minSize: 100,
          gutterSize: 8,
          cursor: 'col-resize',
          onDrag: relayout
        });
  
        // Ensure widths are written, then layout monaco
        split.setSizes([33, 34, 33]);
        // One more tick so Split can apply inline styles
        setTimeout(() => {
          relayout();
          // Nudge anything listening to resize (some themes/monaco bits do)
          window.dispatchEvent(new Event('resize'));
        }, 0);
      });
  
      window.addEventListener('resize', relayout);
  
      // Initial layout (in case elements already have size)
      relayout();
  
      return { leftEditor, middleEditor, rightEditor, relayout };
    }
  
    return { createEditors };
  });
  