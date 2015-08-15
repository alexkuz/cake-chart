function reduceAngleTree(angleTree, node, sum, level, limit) {
  const angle = (node.value / sum) * 360;
  const percentValue = (node.value / sum) * 100;

  return {
    angle: angleTree.angle + angle,
    tree: [...angleTree.tree, {
      node,
      start: angleTree.angle,
      end: angleTree.angle + angle,
      level,
      value: node.value,
      percentValue
    }, ...(
      level < limit && node.children ?
        node.children.reduce(
          (at, s) => reduceAngleTree(at, s, sum, level + 1, limit),
          { angle: angleTree.angle, tree: [] }
        ).tree :
        []
    )]
  };
}

export default function createSliceTree(rootNode, limit) {
  const sum = rootNode.value;

  const tree = rootNode.children.reduce(
    (angleTree, node) => reduceAngleTree(angleTree, node, sum, 1, limit),
    { angle: 0, tree: [] }
  ).tree;

  return [
    ...tree.reduce(
      (t, slice) => {
        t[slice.level - 1] = [...(t[slice.level - 1] || []), slice];
        return t;
      },
      []
    ).map((slices, idx) => ({ level: idx + 1, slices }))
    .sort((a, b) => b.level - a.level),
    {
      level: 0,
      slices: [{
        node: rootNode,
        start: 0,
        end: 360,
        value: sum,
        percentValue: 100,
        level: 0
      }]
    }
  ];
}
