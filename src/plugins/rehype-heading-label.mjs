// Preserve heading IDs and inline markup; a span lets the wash follow each line.
export default function rehypeHeadingLabel() {
  return function transform(tree) {
    function visit(node) {
      if (node.type === 'element' && ['h2', 'h3'].includes(node.tagName) && !node.properties?.className?.includes('sr-only')) {
        node.children = [{ type: 'element', tagName: 'span', properties: { className: ['md-heading-label'] }, children: node.children }];
        return;
      }
      node.children?.forEach(visit);
    }
    visit(tree);
  };
}
