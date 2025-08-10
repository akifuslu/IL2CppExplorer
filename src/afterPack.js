// Ensure il2cpp_compile.sh is executable in packaged apps (macOS/Linux)
const fs = require('fs');
const path = require('path');

exports.default = async function afterPack(context) {
  const dest = context.appOutDir; // e.g. .../IL2CPP Explorer.app/Contents or win dir
  const isMac = context.packager.platform.nodeName === 'darwin';
  const isLinux = context.packager.platform.nodeName === 'linux';

  // script is placed next to process.resourcesPath at runtime
  const scriptPath = isMac
    ? path.join(dest, `${context.packager.appInfo.productFilename}.app`, 'Contents', 'Resources', 'il2cpp_compile.sh')
    : path.join(dest, 'resources', 'il2cpp_compile.sh');

  if ((isMac || isLinux) && fs.existsSync(scriptPath)) {
    await fs.promises.chmod(scriptPath, 0o755);
  }
};
