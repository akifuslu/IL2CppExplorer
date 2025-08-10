define(['vs/editor/editor.main'], function () {
    async function setupArmAsmLanguage() {
      monaco.languages.register({ id: 'armasm', extensions: ['.s', '.o'] });
  
      const [confRes, grammarRes] = await Promise.all([
        fetch('./src/lang/armasm.conf.json'),
        fetch('./src/lang/armasm.lang.json')
      ]);
  
      const conf = await confRes.json();
      const grammar = await grammarRes.json();
  
      monaco.languages.setLanguageConfiguration('armasm', conf);
      monaco.languages.setMonarchTokensProvider('armasm', grammar);
    }
  
    return { setupArmAsmLanguage };
  });
  