/**
 * Build an optimal tree layout for print selection.
 * Canvas dimensions in meters; card size fixed at 8 cm (height) x 5 cm (width).
 * Returns positioned nodes and connector paths for SVG rendering.
 */

const CARD_WIDTH_CM = 5;
const CARD_HEIGHT_CM = 8;
const GAP_CM = 0.4;

/**
 * Build tree structure from selection: roots, parent/children maps, and node data.
 * Edges: source = parent, target = child.
 */
export function buildTreeFromSelection(nodes, edges, selectionIds) {
  const idSet = new Set(selectionIds);
  const nodeMap = new Map();
  const parentMap = new Map();
  const childrenMap = new Map();

  nodes.forEach((n) => {
    if (!idSet.has(n.id)) return;
    nodeMap.set(n.id, {
      id: n.id,
      name: n.data?.name ?? '',
      amharic_name: n.data?.amharic_name ?? '',
      class: n.data?.class ?? '',
    });
  });

  edges.forEach((e) => {
    if (!idSet.has(e.source) || !idSet.has(e.target)) return;
    parentMap.set(e.target, e.source);
    if (!childrenMap.has(e.source)) childrenMap.set(e.source, []);
    childrenMap.get(e.source).push(e.target);
  });

  let roots = [...idSet].filter((id) => !parentMap.has(id));
  if (roots.length === 0 && nodeMap.size > 0) roots = [...nodeMap.keys()];
  return { roots, nodeMap, parentMap, childrenMap };
}

function assignLevels(roots, childrenMap) {
  const levelMap = new Map();
  const queue = roots.map((id) => ({ id, level: 0 }));
  while (queue.length) {
    const { id, level } = queue.shift();
    if (levelMap.has(id)) continue;
    levelMap.set(id, level);
    (childrenMap.get(id) || []).forEach((childId) => queue.push({ id: childId, level: level + 1 }));
  }
  return levelMap;
}

function assignX(roots, childrenMap) {
  const xMap = new Map();
  let leafIndex = 0;

  function assignRecur(id) {
    const children = childrenMap.get(id) || [];
    if (children.length === 0) {
      xMap.set(id, leafIndex++);
      return;
    }
    children.forEach(assignRecur);
    const xs = children.map((c) => xMap.get(c));
    xMap.set(id, (Math.min(...xs) + Math.max(...xs)) / 2);
  }

  roots.forEach(assignRecur);
  return xMap;
}

export function computeTreeLayout(nodes, edges, selectionIds, canvasWidthM, canvasHeightM, fitToCanvas = false) {
  const { roots, nodeMap, childrenMap } = buildTreeFromSelection(nodes, edges, selectionIds);
  if (roots.length === 0 && nodeMap.size === 0) {
    return { positions: new Map(), connectors: [], bounds: { width: 0, height: 0 }, layoutBounds: { width: 0, height: 0 }, scale: 1, cardWidth: CARD_WIDTH_CM, cardHeight: CARD_HEIGHT_CM, nodeMap, roots };
  }

  const levelMap = assignLevels(roots, childrenMap);
  const xSlotMap = assignX(roots, childrenMap);

  const canvasWidthCm = canvasWidthM * 100;
  const canvasHeightCm = canvasHeightM * 100;

  const slotWidth = CARD_WIDTH_CM + GAP_CM;
  const rowHeight = CARD_HEIGHT_CM + GAP_CM;

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  const positions = new Map();

  nodeMap.forEach((_, id) => {
    const level = levelMap.get(id) ?? 0;
    const xSlot = xSlotMap.get(id) ?? 0;
    const x = xSlot * slotWidth;
    const y = level * rowHeight;
    positions.set(id, { x, y });
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x + CARD_WIDTH_CM);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y + CARD_HEIGHT_CM);
  });

  const layoutWidth = maxX - minX;
  const layoutHeight = maxY - minY;
  const layoutBounds = { width: layoutWidth + 2 * GAP_CM, height: layoutHeight + 2 * GAP_CM };

  let scale = 1;
  let offsetX = GAP_CM - minX;
  let offsetY = GAP_CM - minY;

  if (fitToCanvas) {
    const scaleX = layoutWidth <= 0 ? 1 : (canvasWidthCm - 2 * GAP_CM) / layoutWidth;
    const scaleY = layoutHeight <= 0 ? 1 : (canvasHeightCm - 2 * GAP_CM) / layoutHeight;
    scale = Math.min(scaleX, scaleY, 1.2);
    offsetX = (canvasWidthCm - layoutWidth * scale) / 2 - minX * scale + GAP_CM;
    offsetY = (canvasHeightCm - layoutHeight * scale) / 2 - minY * scale + GAP_CM;
  }

  const scaledPositions = new Map();
  positions.forEach((p, id) => {
    scaledPositions.set(id, {
      x: p.x * scale + offsetX,
      y: p.y * scale + offsetY,
    });
  });

  const cardWidth = CARD_WIDTH_CM * scale;
  const cardHeight = CARD_HEIGHT_CM * scale;

  const connectors = [];
  edges.forEach((e) => {
    if (!positions.has(e.source) || !positions.has(e.target)) return;
    const from = scaledPositions.get(e.source);
    const to = scaledPositions.get(e.target);
    if (!from || !to) return;
    connectors.push({
      x1: from.x + cardWidth / 2,
      y1: from.y + cardHeight,
      x2: to.x + cardWidth / 2,
      y2: to.y,
    });
  });

  return {
    positions: scaledPositions,
    connectors,
    bounds: { width: fitToCanvas ? canvasWidthCm : layoutBounds.width, height: fitToCanvas ? canvasHeightCm : layoutBounds.height },
    layoutBounds,
    scale,
    cardWidth,
    cardHeight,
    nodeMap,
    roots,
  };
}

export { CARD_WIDTH_CM, CARD_HEIGHT_CM, GAP_CM };
