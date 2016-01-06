export default function* dft(root, children) {
  var nodes = [root];
  while (nodes.length > 0) {
    var node = nodes.pop();
    children(node).forEach(x => nodes.push(x));
    yield node;
  }
}
