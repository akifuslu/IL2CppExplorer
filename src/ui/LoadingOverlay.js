define([], function () {
    class LoadingOverlay {
      constructor(editor) {
        this.editor = editor;
        this.id = 'my.loading.overlay';
        this.domNode = document.createElement('div');
        this.domNode.className = 'my-loading-overlay';
        this.domNode.innerHTML = '<div class="spinner"></div>';
      }
      getId() { return this.id; }
      getDomNode() { return this.domNode; }
      getPosition() { return null; } // CSS handles positioning
    }
  
    return LoadingOverlay;
  });
  