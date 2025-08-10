require.config({
    baseUrl: './',         // important when packaged (app.asar)
    paths: { vs: './vs' }  // Monaco path
  });

require([
  'vs/editor/editor.main',
  'src/lang/armasm',
  'src/editors/createEditors',
  'src/wire/appWire'
], async function (_monacoBoot, armasm, editorsFactory, appWire) {
  await armasm.setupArmAsmLanguage();
  const editors = editorsFactory.createEditors();
  appWire.wireUI(editors);
});
