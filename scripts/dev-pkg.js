import { spawn } from 'node:child_process';

/**
 * 开发包脚本
 * 用法: node scripts/dev-pkg.js <package-name>
 */
async function main() {
  const pkgName = process.argv[2];

  if (!pkgName) {
    console.error('错误: 请指定包名');
    console.error('用法: pnpm run dev <package-name>');
    process.exit(1);
  }

  console.log(`🚀 启动包开发: ${pkgName}`);

  const child = spawn('pnpm', ['--filter', pkgName, 'dev'], {
    stdio: 'inherit',
    shell: true,
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}

main().catch((err) => {
  console.error('脚本执行出错:', err);
  process.exit(1);
});
