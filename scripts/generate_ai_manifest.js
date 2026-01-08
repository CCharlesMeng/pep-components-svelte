import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const uiSrcDir = path.join(rootDir, 'shared/ui/src');
const presetFile = path.join(rootDir, 'shared/unocss-preset/index.ts');
const outputFile = path.join(rootDir, 'shared/ui/ui-manifest.json');

async function generate() {
  const manifest = {
    version: '1.0.0',
    components: [],
    presets: {
      shortcuts: []
    }
  };

  // 1. 扫描组件
  const files = fs.readdirSync(uiSrcDir);
  for (const file of files) {
    if (file.endsWith('.svelte')) {
      const content = fs.readFileSync(path.join(uiSrcDir, file), 'utf-8');
      const componentName = file.replace('.svelte', '');
      
      // 简单正则提取 Props (在 Svelte 5 中通常在 $props() 后面)
      const propsMatch = content.match(/let\s*{\s*([^}]+)\s*}\s*:\s*{([^}]+)}\s*=\s*\$props\(\)/);
      const props = propsMatch ? propsMatch[1].split(',').map(p => p.trim()) : [];

      manifest.components.push({
        name: componentName,
        props: props,
        path: `shared/ui/src/${file}`
      });
    }
  }

  // 2. 提取 Shortcuts (简单字符串解析)
  const presetContent = fs.readFileSync(presetFile, 'utf-8');
  const shortcutsMatch = presetContent.match(/shortcuts:\s*\[\s*\{([\s\S]+?)\}\s*\]/);
  if (shortcutsMatch) {
    const shortcutsText = shortcutsMatch[1];
    const shortcuts = shortcutsText.split(',').map(s => {
      const m = s.match(/'([^']+)'\s*:\s*'([^']+)'/);
      return m ? { name: m[1], value: m[2] } : null;
    }).filter(Boolean);
    manifest.presets.shortcuts = shortcuts;
  }

  fs.writeFileSync(outputFile, JSON.stringify(manifest, null, 2));
  console.log(`✅ AI Manifest generated at: ${outputFile}`);
}

generate().catch(console.error);
