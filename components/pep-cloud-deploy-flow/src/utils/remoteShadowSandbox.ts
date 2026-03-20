/**
 * 远程文档沙箱：在 iframe srcdoc 内注入 CSS + HTML，使依赖 body/html/.support-main 等祖先选择器的样式能命中。
 * （纯 Shadow DOM 内样式表里的 body/html 仍指向主文档，无法作用在沙箱节点上。）
 */

export const REMOTE_IFRAME_CHROME_CSS = `
html, body {
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
  color: #191919;
  background: #fff;
  overflow: hidden !important;
  height: auto !important;
}
.rich-text {
  min-width: 0;
}
.rich-text img,
.rich-text video {
  max-width: 100%;
  height: auto;
  display: block;
  box-sizing: border-box;
}
.rich-text iframe {
  max-width: 100%;
  box-sizing: border-box;
}
.pep-cloud-deploy-flow-sidebar__table-wrap {
  max-width: 100%;
  overflow-x: auto;
  margin: 1em 0;
  -webkit-overflow-scrolling: touch;
}
.pep-cloud-deploy-flow-sidebar__table-wrap table {
  box-sizing: border-box;
}
`.trim();

/** 防止远程 CSS 中的序列打断 <style> 闭合 */
export function escapeCssForStyleElement(css: string): string {
    return css.replace(/<\/style/gi, '<\\/style');
}

/**
 * 生成 iframe srcdoc 用完整 HTML（UTF-8）。
 * 外层包一层与帮助中心正文相近的 class，便于 index_revision 等样式里 `body .support-content …` 链式选择器命中。
 */
export function buildRemoteIframeSrcdoc(outerCss: string, bodyHtml: string): string {
    const chrome = escapeCssForStyleElement(REMOTE_IFRAME_CHROME_CSS);
    const remote = escapeCssForStyleElement(outerCss);
    const inner = `<div class="support-content"><div class="support-body"><div class="wrapper"><div class="support-main"><div class="help-content"><div class="rich-text">${bodyHtml}</div></div></div></div></div></div>`;
    return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${chrome}\n${remote}</style></head><body>${inner}</body></html>`;
}
