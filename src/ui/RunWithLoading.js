define(['src/ui/loadingOverlay'], function (LoadingOverlay) {
    return async function runWithLoading(editors, work) {
      const overlays = editors.map(editor => {
        const ov = new LoadingOverlay(editor);
        editor.addOverlayWidget(ov);
        return { editor, ov };
      });
  
      try {
        return await work();
      } finally {
        overlays.forEach(({ editor, ov }) => editor.removeOverlayWidget(ov));
      }
    };
  });
  