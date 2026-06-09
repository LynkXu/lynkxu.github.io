/**
 * remark-link-card
 * 将 ::link-card{url="..."} 语法转换为 HTML div 卡片
 */

import { visit } from 'unist-util-visit';

const LINK_CARD_REGEX = /::link-card\{url=["']([^"']+)["']\}/;

export default function remarkLinkCard() {
  return (tree) => {
    // 先遍历所有 text 节点
    visit(tree, 'text', (node, index, parent) => {
      const match = node.value.match(LINK_CARD_REGEX);
      if (!match) return;

      const url = match[1];
      const safeUrl = encodeHtml(url);

      // 创建新的 html 节点替换当前 text 节点
      const htmlNode = {
        type: 'html',
        value: `<div class="link-card" data-url="${safeUrl}">
  <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="link-card__fallback">${safeUrl}</a>
</div>`,
      };

      if (parent && typeof index === 'number') {
        parent.children[index] = htmlNode;
      }
    });
  };
}

function encodeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
