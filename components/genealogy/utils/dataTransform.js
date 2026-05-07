// Transform genealogy JSON data to ReactFlow nodes and edges
import { getBookRegex, personMatchesBookRegex } from './bookFilters';

/**
 * Get all children from a person node, handling both
 * "children" (array or empty string) and "_children" (D3 collapsed state).
 */
export const getChildren = (person) => {
  const ch = person.children;
  const _ch = person._children;

  let result = [];

  if (Array.isArray(ch)) {
    result = result.concat(ch.filter((c) => typeof c === 'object'));
  }
  if (Array.isArray(_ch)) {
    result = result.concat(_ch.filter((c) => typeof c === 'object'));
  }

  return result;
};

export const countPeople = (person) => {
  let count = 1;
  for (const child of getChildren(person)) {
    count += countPeople(child);
  }
  return count;
};

export const collectAllPeople = (person, list = []) => {
  list.push({
    name: person.name || '?',
    amharic_name: person.amharic_name || '',
    amharic_detail: person.amharic_detail || '',
    detail: person.detail || '',
    class: person.class || 'base',
  });
  for (const child of getChildren(person)) {
    collectAllPeople(child, list);
  }
  return list;
};

export const findPersonByName = (rootPerson, targetName) => {
  if (rootPerson.name === targetName) {
    return rootPerson;
  }

  for (const child of getChildren(rootPerson)) {
    const found = findPersonByName(child, targetName);
    if (found) return found;
  }

  return null;
};

export const getDescendants = (person, includeRoot = true) => {
  const descendants = [];

  if (includeRoot) {
    descendants.push(person);
  }

  for (const child of getChildren(person)) {
    descendants.push(...getDescendants(child, true));
  }

  return descendants;
};

const hasMessianicDescendant = (person) => {
  if (person.class?.includes('messianicLine')) return true;
  for (const child of getChildren(person)) {
    if (hasMessianicDescendant(child)) return true;
  }
  return false;
};

function buildParentMap(person, parent = null, map = new Map()) {
  if (person?.name) map.set(person.name, parent);
  for (const child of getChildren(person)) {
    buildParentMap(child, person, map);
  }
  return map;
}

function personPassesFilter(person, bookRegex, majorOnly, messianicOnly, filterMode) {
  const bookMatch = !bookRegex || personMatchesBookRegex(person, bookRegex);
  const majorMatch = !majorOnly || (person.class && person.class.includes('major'));
  const messianicMatch = !messianicOnly || (person.class && person.class.includes('messianicLine'));

  if (filterMode === 'AND') {
    return bookMatch && majorMatch && messianicMatch;
  }
  return bookMatch || majorMatch || messianicMatch;
}

function addAllDescendants(person, set) {
  for (const child of getChildren(person)) {
    if (child.name) set.add(child.name);
    addAllDescendants(child, set);
  }
}

function buildMatchingAndDescendantsOnly(root, bookRegex, majorOnly, messianicOnly, filterMode) {
  const matchingNames = new Set();
  function collectMatching(person) {
    if (personPassesFilter(person, bookRegex, majorOnly, messianicOnly, filterMode)) {
      matchingNames.add(person.name);
    }
    for (const child of getChildren(person)) {
      collectMatching(child);
    }
  }
  collectMatching(root);

  const included = new Set(matchingNames);
  matchingNames.forEach((name) => {
    const person = findPersonByName(root, name);
    if (person) {
      for (const child of getChildren(person)) {
        if (child.name) included.add(child.name);
        addAllDescendants(child, included);
      }
    }
  });

  const parentMap = buildParentMap(root);
  const rootNames = [...matchingNames].filter((name) => {
    const p = parentMap.get(name);
    return !p || !matchingNames.has(p.name);
  });
  const rootPersons = rootNames
    .map((name) => findPersonByName(root, name))
    .filter(Boolean);
  return { includedNames: included, rootPersons };
}

const NODE_WIDTH = 260;
const NODE_HEIGHT = 150;
const H_GAP = 100;
const V_GAP = 220;
const SLOT_WIDTH = NODE_WIDTH + H_GAP;
const ROW_HEIGHT = NODE_HEIGHT + V_GAP;

function buildVisibleSubtree(person, level, includedNames, messianicOnly, maxDepth) {
  if (includedNames && !includedNames.has(person.name)) return null;
  const children = getChildren(person);
  let visibleChildren = children;
  if (messianicOnly) {
    const anyChildMessianic = children.some(
      (c) => c.class?.includes('messianicLine') || hasMessianicDescendant(c),
    );
    if (!anyChildMessianic) visibleChildren = [];
  }
  if (includedNames) {
    visibleChildren = visibleChildren.filter((c) => includedNames.has(c.name));
  }
  const isCollapsed = level >= maxDepth;
  const childNodes = !isCollapsed
    ? visibleChildren
        .map((c) => buildVisibleSubtree(c, level + 1, includedNames, messianicOnly, maxDepth))
        .filter(Boolean)
    : [];
  return { person, children: childNodes, level, isCollapsed, totalChildren: children.length };
}

function subtreeWidth(node) {
  if (!node.children || node.children.length === 0) return 1;
  return node.children.reduce((sum, c) => sum + subtreeWidth(c), 0);
}

export const transformDataToFlow = (
  data,
  showAmharic = false,
  maxDepth = 100,
  messianicOnly = false,
  focusPersonName = null,
  selectedBookIds = [],
  majorOnly = false,
  filterMode = 'AND',
) => {
  const nodes = [];
  const edges = [];
  let nodeId = 0;

  let rootData = data;
  if (focusPersonName) {
    const focusPerson = findPersonByName(data, focusPersonName);
    if (focusPerson) rootData = focusPerson;
  }

  const bookRegex = getBookRegex(selectedBookIds && selectedBookIds.length ? selectedBookIds : null);
  const hasExtraFilter = (selectedBookIds && selectedBookIds.length > 0) || majorOnly || messianicOnly;
  let rootsToPlace;
  let includedNames = null;
  if (hasExtraFilter) {
    const out = buildMatchingAndDescendantsOnly(rootData, bookRegex, majorOnly, messianicOnly, filterMode);
    includedNames = out.includedNames;
    if (out.rootPersons.length === 0) return { nodes: [], edges: [] };
    rootsToPlace = out.rootPersons
      .map((p) => buildVisibleSubtree(p, 0, includedNames, messianicOnly, maxDepth))
      .filter(Boolean);
  } else {
    const singleRoot = buildVisibleSubtree(rootData, 0, null, messianicOnly, maxDepth);
    if (!singleRoot) return { nodes: [], edges: [] };
    rootsToPlace = [singleRoot];
  }

  function placeNode(treeNode, startSlot, level, parentId) {
    const id = `node-${nodeId++}`;
    const { person, children, isCollapsed, totalChildren } = treeNode;
    const width = subtreeWidth(treeNode);
    const centerSlot = startSlot + (width - 1) / 2;
    const x = centerSlot * SLOT_WIDTH;
    const y = level * ROW_HEIGHT;

    const node = {
      id,
      type: 'person',
      position: { x, y },
      data: {
        name: person.name,
        amharic_name: person.amharic_name,
        showAmharic,
        class: person.class,
        spouse: person.spouse,
        age: person.age,
        birth: person.birth,
        death: person.death,
        detail: person.detail,
        amharic_detail: person.amharic_detail,
        level,
        hasChildren: totalChildren > 0,
        collapsed: isCollapsed && totalChildren > 0,
        childCount: totalChildren,
      },
      draggable: true,
    };
    nodes.push(node);

    if (parentId) {
      const edgeClass = person.class?.includes('messianicLine') ? 'messianic' : '';
      edges.push({
        id: `edge-${parentId}-${id}`,
        source: parentId,
        target: id,
        type: 'smoothstep',
        className: edgeClass,
        animated: person.class?.includes('messianicLine'),
      });
    }

    let nextStart = startSlot;
    for (const child of children) {
      placeNode(child, nextStart, level + 1, id);
      nextStart += subtreeWidth(child);
    }
  }

  let nextSlot = 0;
  const GAP_BETWEEN_TREES = 2;
  for (const root of rootsToPlace) {
    placeNode(root, nextSlot, 0, null);
    nextSlot += subtreeWidth(root) + GAP_BETWEEN_TREES;
  }
  return { nodes, edges };
};

export function getDescendantNodeIds(nodes, edges, fromNodeId) {
  const idSet = new Set();
  const bySource = new Map();
  edges.forEach((e) => {
    if (!bySource.has(e.source)) bySource.set(e.source, []);
    bySource.get(e.source).push(e.target);
  });
  const queue = [fromNodeId];
  while (queue.length) {
    const id = queue.shift();
    const targets = bySource.get(id) || [];
    targets.forEach((tid) => {
      if (!idSet.has(tid)) {
        idSet.add(tid);
        queue.push(tid);
      }
    });
  }
  return idSet;
}

export function getAncestorNodeIds(nodes, edges, fromNodeId) {
  const idSet = new Set();
  const byTarget = new Map();
  edges.forEach((e) => {
    if (!byTarget.has(e.target)) byTarget.set(e.target, []);
    byTarget.get(e.target).push(e.source);
  });
  const queue = [fromNodeId];
  while (queue.length) {
    const id = queue.shift();
    const sources = byTarget.get(id) || [];
    sources.forEach((sid) => {
      if (!idSet.has(sid)) {
        idSet.add(sid);
        queue.push(sid);
      }
    });
  }
  return idSet;
}
