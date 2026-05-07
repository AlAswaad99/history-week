'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Fuse from 'fuse.js';
import PersonNode from './PersonNode';
import { transformDataToFlow, collectAllPeople, getDescendantNodeIds, getAncestorNodeIds } from './utils/dataTransform';
import { computeTreeLayout } from './utils/layoutTree';
import { BIBLICAL_BOOKS, TORAH_OPTION } from './utils/bookFilters';
import {
  Crown, Star, Users, Languages, ChevronDown, ChevronUp, FileText, Filter,
  Search, X, Target, Eye, EyeOff, MousePointer, HelpCircle, BookOpen, ZapOff,
  LayoutGrid, PenLine, Plus, Trash2,
} from 'lucide-react';
import './genealogy.css';

const nodeTypes = {
  person: PersonNode,
};

function GenealogyFlowComponent() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showAmharic, setShowAmharic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [genealogyData, setGenealogyData] = useState(null);
  const [maxDepth, setMaxDepth] = useState(5);
  const [messianicOnly, setMessianicOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedNodes, setSelectedNodes] = useState(new Set());
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [focusPersonName, setFocusPersonName] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedBookIds, setSelectedBookIds] = useState([]);
  const [majorOnly, setMajorOnly] = useState(false);
  const [filterMode, setFilterMode] = useState('OR');
  const [showBookFilter, setShowBookFilter] = useState(false);
  const [disableDescendantHighlight, setDisableDescendantHighlight] = useState(false);
  const [printSelectionIds, setPrintSelectionIds] = useState(new Set());
  const [printSelectionName, setPrintSelectionName] = useState('');
  const [showDescriptionOnPrint, setShowDescriptionOnPrint] = useState(true);
  const [printCols, setPrintCols] = useState(3);
  const [printRows, setPrintRows] = useState(4);
  const [printCardBorderWidth, setPrintCardBorderWidth] = useState(1);
  const [printCardBorderColor, setPrintCardBorderColor] = useState('#d4af37');
  const [printCardBgColor, setPrintCardBgColor] = useState('#fffdf5');
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [layoutCanvasWidthM, setLayoutCanvasWidthM] = useState(2.4);
  const [layoutCanvasHeightM, setLayoutCanvasHeightM] = useState(1.2);
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [showCustomPrintPanel, setShowCustomPrintPanel] = useState(false);
  const [customPrintEntries, setCustomPrintEntries] = useState([]);
  const [customPrintTitle, setCustomPrintTitle] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const reactFlowRef = useRef(null);
  const layoutSvgRef = useRef(null);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/genealogy_output_amharic.json');
        if (!response.ok) {
          throw new Error('Failed to load genealogy data');
        }
        const data = await response.json();
        setGenealogyData(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (genealogyData) {
      const { nodes: flowNodes, edges: flowEdges } = transformDataToFlow(
        genealogyData,
        showAmharic,
        messianicOnly ? 100 : maxDepth,
        messianicOnly,
        focusPersonName,
        selectedBookIds,
        majorOnly,
        filterMode,
      );
      setNodes(flowNodes);
      setEdges(flowEdges);

      setSelectedNodes(new Set());
      setSelectedNode(null);
      setShowSidePanel(false);
    }
  }, [showAmharic, maxDepth, messianicOnly, genealogyData, focusPersonName, selectedBookIds, majorOnly, filterMode, setNodes, setEdges]);

  useEffect(() => {
    if (disableDescendantHighlight) {
      setNodes((currentNodes) =>
        currentNodes.map((node) => ({
          ...node,
          selected: selectedNodes.has(node.id),
          className: selectedNodes.has(node.id) ? 'selected-node' : '',
          data: { ...node.data, isInPrintSelection: printSelectionIds.has(node.id) },
        }))
      );
      setEdges((currentEdges) =>
        currentEdges.map((e) => ({
          ...e,
          className: (e.className || '').replace(/\s*descendant-edge\s*/g, ' ').trim(),
          animated: (e.className || '').includes('messianic'),
          style: undefined,
        }))
      );
      return;
    }

    const descendantIds = selectedNode
      ? getDescendantNodeIds(nodes, edges, selectedNode.id)
      : new Set();

    const nodeUpdates = (currentNodes) =>
      currentNodes.map((node) => {
        const isSelected = selectedNodes.has(node.id);
        const isDescendant = selectedNode && (node.id === selectedNode.id || descendantIds.has(node.id));
        let className = isSelected ? 'selected-node' : '';
        if (isDescendant && !isSelected) className += ' descendant-node';
        return {
          ...node,
          selected: isSelected,
          className: className.trim(),
          data: { ...node.data, isInPrintSelection: printSelectionIds.has(node.id) },
        };
      });

    const edgeUpdates = (currentEdges) =>
      currentEdges.map((edge) => {
        const isDescendantEdge =
          selectedNode &&
          descendantIds.has(edge.target) &&
          (edge.source === selectedNode.id || descendantIds.has(edge.source));
        return {
          ...edge,
          className: [edge.className, isDescendantEdge ? 'descendant-edge' : ''].filter(Boolean).join(' '),
          animated: edge.animated || isDescendantEdge,
          style: isDescendantEdge ? { stroke: '#3b82f6', strokeWidth: 3 } : undefined,
        };
      });

    requestAnimationFrame(() => {
      setNodes(nodeUpdates);
      setEdges(edgeUpdates);
    });
  }, [selectedNodes, selectedNode, nodes, edges, setNodes, setEdges, disableDescendantHighlight, printSelectionIds]);

  const toggleLanguage = () => setShowAmharic((v) => !v);
  const toggleMessianicFilter = () => setMessianicOnly((v) => !v);

  const handleNodeClick = useCallback((event, node) => {
    if (event.ctrlKey || event.metaKey) {
      setPrintSelectionIds((prev) => {
        const next = new Set(prev);
        if (next.has(node.id)) next.delete(node.id);
        else next.add(node.id);
        return next;
      });
      setSelectedNodes((prev) => {
        const next = new Set(prev);
        if (next.has(node.id)) next.delete(node.id);
        else next.add(node.id);
        return next;
      });
      setSelectedNode(node);
      setShowSidePanel(true);
      return;
    }
    if (event.shiftKey) {
      setSelectedNodes((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(node.id)) newSet.delete(node.id);
        else newSet.add(node.id);
        return newSet;
      });
      setSelectedNode(node);
      setShowSidePanel(true);
      return;
    }
    setSelectedNodes(new Set([node.id]));
    setSelectedNode(node);
    setShowSidePanel(true);
  }, []);

  const closeSidePanel = () => {
    setShowSidePanel(false);
    setSelectedNode(null);
  };

  const showDescendantsOnly = useCallback(() => {
    if (selectedNode) {
      setFocusPersonName(selectedNode.data.name);
      setShowSidePanel(false);
    }
  }, [selectedNode]);

  const showFullTree = useCallback(() => {
    setFocusPersonName(null);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedNodes(new Set());
    setSelectedNode(null);
    setShowSidePanel(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        clearSelection();
        if (focusPersonName) {
          showFullTree();
        }
      }

      if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        event.preventDefault();
        const allNodeIds = new Set(nodes.map((node) => node.id));
        setSelectedNodes(allNodeIds);
      }

      if (event.key === 'Delete' && selectedNode && selectedNode.data.childCount > 0) {
        showDescendantsOnly();
      }

      if (event.key === 'Backspace' && focusPersonName) {
        event.preventDefault();
        showFullTree();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, selectedNodes, nodes, focusPersonName, showDescendantsOnly, showFullTree, clearSelection]);

  const searchResults = React.useMemo(() => {
    if (!genealogyData || !searchTerm.trim()) return [];
    const list = collectAllPeople(genealogyData);
    const fuse = new Fuse(list, {
      keys: ['name', 'amharic_name'],
      threshold: 0.4,
      ignoreLocation: true,
      includeScore: true,
    });
    return fuse.search(searchTerm.trim()).map((r) => r.item).slice(0, 12);
  }, [genealogyData, searchTerm]);

  const { setCenter } = useReactFlow();

  const focusOnPerson = (personName) => {
    const node = nodes.find((n) => n.data.name === personName);
    if (node) {
      setCenter(node.position.x, node.position.y, { zoom: 1.5, duration: 800 });
      setSearchTerm('');
    }
  };

  const goToNode = useCallback((node) => {
    if (!node) return;
    setSelectedNode(node);
    setSelectedNodes(new Set([node.id]));
    setShowSidePanel(true);
    setCenter(node.position.x, node.position.y, { zoom: 1.5, duration: 600 });
  }, [setCenter]);

  const addToPrintSelection = useCallback((nodeIds) => {
    setPrintSelectionIds((prev) => {
      const next = new Set(prev);
      nodeIds.forEach((id) => next.add(id));
      return next;
    });
  }, []);
  const removeFromPrintSelection = useCallback((nodeIds) => {
    setPrintSelectionIds((prev) => {
      const next = new Set(prev);
      nodeIds.forEach((id) => next.delete(id));
      return next;
    });
  }, []);

  const copyAncestorsAsText = useCallback(() => {
    if (!contextMenu?.node) return;
    const ids = getAncestorNodeIds(nodes, edges, contextMenu.node.id);
    const list = [contextMenu.node, ...nodes.filter((n) => ids.has(n.id))].reverse();
    const text = list.map((n) => (n.data.amharic_name || n.data.name) + (n.data.amharic_detail ? '\n' + (n.data.amharic_detail || n.data.detail || '').slice(0, 200) : '')).join('\n\n');
    navigator.clipboard.writeText(text).then(() => setContextMenu(null));
  }, [contextMenu, nodes, edges]);

  const copyDescendantsAsText = useCallback(() => {
    if (!contextMenu?.node) return;
    const ids = getDescendantNodeIds(nodes, edges, contextMenu.node.id);
    const list = [contextMenu.node, ...nodes.filter((n) => ids.has(n.id))];
    const text = list.map((n) => (n.data.amharic_name || n.data.name) + (n.data.amharic_detail ? '\n' + (n.data.amharic_detail || n.data.detail || '').slice(0, 200) : '')).join('\n\n');
    navigator.clipboard.writeText(text).then(() => setContextMenu(null));
  }, [contextMenu, nodes, edges]);

  const addAllFilteredToPrintSelection = useCallback(() => {
    setPrintSelectionIds(new Set(nodes.map((n) => n.id)));
  }, [nodes]);

  const exportPrintSelection = useCallback(() => {
    if (printSelectionIds.size === 0) {
      alert('No cards in print selection to export.');
      return;
    }
    const personNames = nodes
      .filter((n) => printSelectionIds.has(n.id))
      .map((n) => n.data.name);
    const payload = {
      version: 1,
      name: printSelectionName.trim() || undefined,
      personNames,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `genealogy-print-selection-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [printSelectionIds, printSelectionName, nodes]);

  const importPrintSelection = useCallback((jsonString) => {
    let data;
    try {
      data = JSON.parse(jsonString);
    } catch (e) {
      alert('Invalid JSON. Please check the file or pasted content.');
      return;
    }
    const personNames = data.personNames;
    if (!Array.isArray(personNames) || personNames.length === 0) {
      alert('No person names found in the import.');
      return;
    }
    const nameSet = new Set(personNames);
    const matchedIds = nodes.filter((n) => nameSet.has(n.data.name)).map((n) => n.id);
    setPrintSelectionIds(new Set(matchedIds));
    if (data.name) setPrintSelectionName(String(data.name));
    if (matchedIds.length < personNames.length) {
      const missing = personNames.length - matchedIds.length;
      alert(`Imported ${matchedIds.length} of ${personNames.length} names. ${missing} were not found in the current tree (they may be hidden by filters).`);
    }
  }, [nodes]);

  const importFileRef = useRef(null);

  const childNodes = selectedNode
    ? nodes.filter((n) => edges.some((e) => e.source === selectedNode.id && e.target === n.id))
    : [];
  const parentNodes = selectedNode
    ? nodes.filter((n) => edges.some((e) => e.target === selectedNode.id && e.source === n.id))
    : [];

  const expandMore = () => setMaxDepth((d) => Math.min(d + 2, 50));
  const collapseMore = () => setMaxDepth((d) => Math.max(d - 2, 1));
  const expandAll = () => setMaxDepth(100);

  const buildPrintHtml = ({ entries, title, pageHeading }) => {
    const escapeHtml = (s) => {
      if (s == null) return '';
      const div = document.createElement('div');
      div.textContent = s;
      return div.innerHTML;
    };

    const A4_W_MM = 210;
    const A4_H_MM = 297;
    const MARGIN_MM = 10;
    const GAP_MM = 2;
    const usableW = A4_W_MM - 2 * MARGIN_MM;
    const usableH = A4_H_MM - 2 * MARGIN_MM;
    const CARDS_PER_ROW = printCols;
    const CARDS_PER_PAGE = printCols * printRows;
    const CARD_WIDTH_MM = (usableW - (printCols - 1) * GAP_MM) / printCols;
    const CARD_HEIGHT_MM = (usableH - (printRows - 1) * GAP_MM) / printRows;
    const nameFontSize = Math.round(12 + CARD_HEIGHT_MM / 4);
    const enFontSize = Math.round(8 + CARD_HEIGHT_MM / 7);
    const descFontSize = Math.round(7 + CARD_HEIGHT_MM / 8);
    const badgeSize = Math.round(12 + CARD_HEIGHT_MM / 5);

    let cardsHtml = '';
    entries.forEach((p, i) => {
      if (i > 0 && i % CARDS_PER_PAGE === 0) {
        cardsHtml += '<div class="pdf-page-break"></div>';
      }
      const isMessianic = p.isMessianic;
      const isMajor = p.isMajor;
      const cardClass = isMessianic ? 'pdf-card pdf-card-messianic' : isMajor ? 'pdf-card pdf-card-major' : 'pdf-card';
      const badge = isMessianic
        ? '<span class="pdf-badge pdf-badge-messianic">&#x1F451;</span>'
        : isMajor
        ? '<span class="pdf-badge pdf-badge-major">&#x2B50;</span>'
        : '';
      const name = escapeHtml(p.amharicName || p.name);
      const enName = escapeHtml(p.englishName || p.name);
      const detail = showDescriptionOnPrint ? escapeHtml(p.description || '') : '';
      cardsHtml += `
        <div class="${cardClass}" style="width:${CARD_WIDTH_MM}mm;min-height:${CARD_HEIGHT_MM}mm;border-width:${printCardBorderWidth}px;border-color:${printCardBorderColor};background:${printCardBgColor};">
          ${badge}
          <div class="pdf-card-title-wrap">
            <div class="pdf-card-name" style="font-size:${nameFontSize}px">${name}</div>
            <div class="pdf-card-en" style="font-size:${enFontSize}px">${enName}</div>
          </div>
          ${showDescriptionOnPrint ? `<div class="pdf-card-desc" style="font-size:${descFontSize}px">${detail}</div>` : ''}
        </div>`;
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const gridWidth = CARDS_PER_ROW * CARD_WIDTH_MM + (CARDS_PER_ROW - 1) * GAP_MM;
    const origin = window.location.origin;
    const docTitle = escapeHtml(title);
    const heading = escapeHtml(pageHeading);

    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${docTitle}</title>
  <style>
    @font-face {
      font-family: 'Nokia';
      src: url('${origin}/nokia.TTF') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
    @page { size: A4; margin: 10mm; }
    body { font-family: 'Nokia', 'Noto Sans Ethiopic', sans-serif; margin: 0; padding: 0; background: white; }
    .pdf-title { text-align: center; font-family: 'Nokia', sans-serif; font-size: 14px; font-weight: 700; color: #451a03; margin-bottom: 6mm; }
    .pdf-grid {
      display: grid;
      grid-template-columns: repeat(${CARDS_PER_ROW}, ${CARD_WIDTH_MM}mm);
      grid-auto-rows: minmax(${CARD_HEIGHT_MM}mm, auto);
      gap: ${GAP_MM}mm;
      width: ${gridWidth}mm;
      margin: 0 auto;
    }
    .pdf-card {
      width: ${CARD_WIDTH_MM}mm;
      min-height: ${CARD_HEIGHT_MM}mm;
      height: auto;
      padding: 2mm;
      border-style: solid;
      border-radius: 2mm;
      box-sizing: border-box;
      page-break-inside: avoid;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      box-shadow: 0 1px 2px rgba(0,0,0,0.08);
    }
    .pdf-card-messianic { border-color: #f59e0b !important; background: linear-gradient(135deg, #fffbf0 0%, #fef3c7 100%) !important; }
    .pdf-card-major { border-color: #1e3a8a !important; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%) !important; }
    .pdf-badge { font-size: ${badgeSize}px; margin-bottom: 0.5mm; text-align: center; line-height: 1; }
    .pdf-card-title-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 0 0 auto; min-height: 10%; text-align: center; }
    .pdf-card-name { font-family: 'Nokia', 'Noto Sans Ethiopic', sans-serif; font-weight: 700; color: #451a03; line-height: 1.2; margin-bottom: 0.5mm; }
    .pdf-card-en { font-family: 'Nokia', sans-serif; color: #6b7280; }
    .pdf-card-desc { font-family: 'Nokia', 'Noto Sans Ethiopic', sans-serif; color: #374151; line-height: 1.3; flex: 0 1 auto; text-align: center; overflow: visible; word-break: break-word; }
    .pdf-page-break { page-break-before: always; height: 0; }
  </style>
</head>
<body>
  <div class="pdf-title">${heading}</div>
  <div class="pdf-grid">${cardsHtml}</div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
        window.close();
      }, 800);
    };
  </script>
</body>
</html>`);

    printWindow.document.close();
  };

  const downloadPrintable = () => {
    const toPrint = printSelectionIds.size > 0
      ? nodes.filter((n) => printSelectionIds.has(n.id)).map((n) => ({
          name: n.data.name,
          amharicName: n.data.amharic_name || '',
          englishName: n.data.name,
          description: n.data.amharic_detail || n.data.detail || '',
          isMessianic: n.data.class?.includes('messianicLine'),
          isMajor: n.data.class?.includes('major'),
        }))
      : [];
    if (toPrint.length === 0) {
      alert('Add cards to print selection first:\n- Ctrl+click (or Cmd+click) on cards\n- Right-click -> Add to print selection\n- Or "Add all" for currently visible cards');
      return;
    }
    buildPrintHtml({
      entries: toPrint,
      title: printSelectionName.trim() || 'Biblical Genealogy Cards',
      pageHeading: printSelectionName.trim() || 'የመጽሐፍ ቅዱስ የዘር ሐረግ · Biblical Genealogy',
    });
  };

  const downloadCustomPrintable = () => {
    const toPrint = customPrintEntries
      .map((e) => ({
        name: (e.name || '').trim(),
        amharicName: (e.name || '').trim(),
        englishName: (e.englishName || '').trim() || (e.name || '').trim(),
        description: (e.description || '').trim(),
        isMajor: !!e.isMajor,
        isMessianic: !!e.isMessianic,
      }))
      .filter((e) => e.name.length > 0);
    if (toPrint.length === 0) {
      alert('Add at least one entry with a name.\nUse "Add row" and fill in Name and English name.');
      return;
    }
    buildPrintHtml({
      entries: toPrint,
      title: customPrintTitle.trim() || 'Custom Genealogy Cards',
      pageHeading: customPrintTitle.trim() || 'Custom names · ብጁ ስሞች',
    });
  };

  const addCustomPrintEntry = () => {
    setCustomPrintEntries((prev) => [...prev, {
      id: `custom-${Date.now()}-${prev.length}`,
      name: '',
      englishName: '',
      description: '',
      isMajor: false,
      isMessianic: false,
    }]);
  };

  const updateCustomPrintEntry = (id, field, value) => {
    setCustomPrintEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const removeCustomPrintEntry = (id) => {
    setCustomPrintEntries((prev) => prev.filter((e) => e.id !== id));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <h2>Loading Biblical Genealogy...</h2>
        <p>Preparing the family tree visualization...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Genealogy</h2>
        <p>{error}</p>
        <p>Please ensure genealogy_output_amharic.json is available in the public folder.</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header-minimal">
        <h1>የመጽሐፍ ቅዱስ የዘር ሐረግ</h1>
        <span className="subtitle">Biblical Genealogy Tree</span>
      </header>

      <div className="search-container">
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="search-clear">
              <X size={14} />
            </button>
          )}
        </div>

        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map((person, index) => (
              <div
                key={index}
                className="search-result-item"
                onClick={() => focusOnPerson(person.name)}
              >
                <div className="search-result-name">
                  {showAmharic && person.amharic_name ? person.amharic_name : person.name}
                </div>
                <div className="search-result-detail">
                  {person.class?.includes('messianicLine') && <Crown size={12} />}
                  {person.class?.includes('major') && <Star size={12} />}
                  {!showAmharic && person.amharic_name && (
                    <span className="search-result-alt">{person.amharic_name}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flow-container">
        <ReactFlow
          ref={reactFlowRef}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onNodeContextMenu={(e, node) => {
            e.preventDefault();
            setContextMenu({ x: e.clientX, y: e.clientY, node });
          }}
          onPaneClick={() => setContextMenu(null)}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.1, minZoom: 0.1, maxZoom: 2 }}
          minZoom={0.05}
          maxZoom={3}
          attributionPosition="bottom-right"
        >
          <Controls />
          <MiniMap
            position="bottom-left"
            nodeColor={(node) => {
              if (node.data?.class?.includes('messianicLine')) return '#f59e0b';
              if (node.data?.class?.includes('major')) return '#1e3a8a';
              if (node.data?.class?.includes('female')) return '#ec4899';
              return '#D4AF37';
            }}
            nodeStrokeWidth={2}
            zoomable
            pannable
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '2px solid #D4AF37',
              borderRadius: '8px',
            }}
          />
          <Background variant="dots" gap={20} size={1} />

          <Panel position="top-right" className="control-panel-minimal">
            <div className="panel-content">
              <div className="depth-display-minimal">
                Depth: <strong>{maxDepth >= 100 ? 'All' : maxDepth}</strong>
                <span className="node-count">({nodes.length})</span>
              </div>

              <div className="control-buttons-minimal">
                <button onClick={toggleLanguage} className="control-btn-minimal">
                  <Languages size={14} />
                  {showAmharic ? 'EN' : 'አማ'}
                </button>

                <button
                  onClick={toggleMessianicFilter}
                  className={`control-btn-minimal ${messianicOnly ? 'filter-active' : ''}`}
                >
                  <Filter size={14} />
                  {messianicOnly ? 'All' : 'Messianic'}
                </button>

                <button
                  onClick={() => setShowBookFilter(!showBookFilter)}
                  className={`control-btn-minimal ${selectedBookIds.length > 0 ? 'filter-active' : ''}`}
                  title="Filter by book"
                >
                  <BookOpen size={14} />
                  Books {selectedBookIds.length > 0 ? `(${selectedBookIds.length})` : ''}
                </button>

                <div className="depth-controls-minimal">
                  <button onClick={collapseMore} className="control-btn-minimal small">
                    <ChevronUp size={12} />
                  </button>
                  <button onClick={expandMore} className="control-btn-minimal small">
                    <ChevronDown size={12} />
                  </button>
                </div>

                <button onClick={expandAll} className="control-btn-minimal">
                  <Users size={14} />
                </button>

                <div className="print-selection-panel">
                  <div className="print-selection-header">
                    <FileText size={14} />
                    <span>Print selection</span>
                    {printSelectionIds.size > 0 && (
                      <span className="print-selection-count">{printSelectionIds.size}</span>
                    )}
                  </div>
                  {printSelectionIds.size > 0 && (
                    <input
                      type="text"
                      className="print-selection-name"
                      placeholder="Name this selection (optional)"
                      value={printSelectionName}
                      onChange={(e) => setPrintSelectionName(e.target.value)}
                      title="Name for the printed document"
                    />
                  )}
                  <div className="print-selection-actions">
                    <button onClick={addAllFilteredToPrintSelection} className="control-btn-minimal small" title="Add all visible cards">
                      Add all
                    </button>
                    <button onClick={() => addToPrintSelection(Array.from(selectedNodes))} className="control-btn-minimal small" title="Add selected cards (Shift+click)">
                      Add selected
                    </button>
                    <button onClick={() => importFileRef.current?.click()} className="control-btn-minimal small" title="Import from JSON file">
                      Import file
                    </button>
                    <button onClick={() => { const s = window.prompt('Paste exported JSON:'); if (s?.trim()) importPrintSelection(s.trim()); }} className="control-btn-minimal small" title="Import from pasted JSON">
                      Import paste
                    </button>
                    {printSelectionIds.size > 0 && (
                      <>
                        <button onClick={() => { setPrintSelectionIds(new Set()); setPrintSelectionName(''); }} className="control-btn-minimal small" title="Clear selection">
                          Clear
                        </button>
                        <button onClick={() => setShowLayoutModal(true)} className="control-btn-minimal" title="Optimal tree layout for canvas">
                          <LayoutGrid size={14} /> Layout
                        </button>
                        <button onClick={downloadPrintable} className="control-btn-minimal pdf-btn" title="Print / Save as PDF">
                          Print
                        </button>
                        <button onClick={exportPrintSelection} className="control-btn-minimal small" title="Export selection as JSON">
                          Export
                        </button>
                      </>
                    )}
                  </div>
                  <input
                    ref={importFileRef}
                    type="file"
                    accept=".json,application/json"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          importPrintSelection(String(reader.result));
                        };
                        reader.readAsText(file);
                      }
                      e.target.value = '';
                    }}
                  />
                  <button type="button" className="print-options-toggle" onClick={() => setShowPrintOptions((v) => !v)}>
                    {showPrintOptions ? '▼' : '▶'} Print options
                  </button>
                  {showPrintOptions && (
                    <div className="print-options-grid">
                      <label className="print-option-check">
                        <input type="checkbox" checked={showDescriptionOnPrint} onChange={(e) => setShowDescriptionOnPrint(e.target.checked)} />
                        <span>Show description</span>
                      </label>
                      <label className="print-option-row">
                        <span>Cols</span>
                        <input type="number" min={2} max={6} value={printCols} onChange={(e) => setPrintCols(Math.max(2, Math.min(6, Number(e.target.value) || 3)))} />
                      </label>
                      <label className="print-option-row">
                        <span>Rows</span>
                        <input type="number" min={2} max={6} value={printRows} onChange={(e) => setPrintRows(Math.max(2, Math.min(6, Number(e.target.value) || 4)))} />
                      </label>
                      <label className="print-option-row">
                        <span>Border</span>
                        <input type="number" min={0} max={4} value={printCardBorderWidth} onChange={(e) => setPrintCardBorderWidth(Math.max(0, Math.min(4, Number(e.target.value) || 0)))} />
                      </label>
                      <label className="print-option-row">
                        <span>Border color</span>
                        <input type="color" value={printCardBorderColor} onChange={(e) => setPrintCardBorderColor(e.target.value)} title={printCardBorderColor} />
                      </label>
                      <label className="print-option-row">
                        <span>Card bg</span>
                        <input type="color" value={printCardBgColor} onChange={(e) => setPrintCardBgColor(e.target.value)} title={printCardBgColor} />
                      </label>
                    </div>
                  )}
                  {printSelectionIds.size > 0 && (
                    <div className="print-selection-hint">
                      <span className="print-selection-dot" /> = in selection · Ctrl+click to toggle
                    </div>
                  )}
                  <button type="button" className="print-options-toggle custom-print-toggle" onClick={() => setShowCustomPrintPanel((v) => !v)}>
                    {showCustomPrintPanel ? '▼' : '▶'} Custom print
                  </button>
                  {showCustomPrintPanel && (
                    <div className="custom-print-panel">
                      <p className="custom-print-hint">Same card format as tree print: name, English name, optional description. Tick Major and/or Messianic for badge (⭐ / 👑).</p>
                      <input
                        type="text"
                        className="print-selection-name"
                        placeholder="Document title (optional)"
                        value={customPrintTitle}
                        onChange={(e) => setCustomPrintTitle(e.target.value)}
                        title="Title for the printed document"
                      />
                      <div className="custom-print-list">
                        {customPrintEntries.length === 0 ? (
                          <p className="custom-print-empty">No entries. Click &quot;Add row&quot; to add a card.</p>
                        ) : (
                          customPrintEntries.map((entry) => (
                            <div key={entry.id} className="custom-print-row">
                              <input
                                type="text"
                                placeholder="Name (e.g. Amharic)"
                                value={entry.name}
                                onChange={(e) => updateCustomPrintEntry(entry.id, 'name', e.target.value)}
                                className="custom-print-input custom-print-name"
                              />
                              <input
                                type="text"
                                placeholder="English name"
                                value={entry.englishName ?? ''}
                                onChange={(e) => updateCustomPrintEntry(entry.id, 'englishName', e.target.value)}
                                className="custom-print-input custom-print-en"
                              />
                              <input
                                type="text"
                                placeholder="Description / reference (optional)"
                                value={entry.description ?? ''}
                                onChange={(e) => updateCustomPrintEntry(entry.id, 'description', e.target.value)}
                                className="custom-print-input custom-print-desc"
                              />
                              <label className="custom-print-check" title="Major character (star ⭐)">
                                <input
                                  type="checkbox"
                                  checked={!!entry.isMajor}
                                  onChange={(e) => updateCustomPrintEntry(entry.id, 'isMajor', e.target.checked)}
                                />
                                <span>Major</span>
                              </label>
                              <label className="custom-print-check" title="Messianic line (crown 👑)">
                                <input
                                  type="checkbox"
                                  checked={!!entry.isMessianic}
                                  onChange={(e) => updateCustomPrintEntry(entry.id, 'isMessianic', e.target.checked)}
                                />
                                <span>Messianic</span>
                              </label>
                              <button type="button" className="custom-print-remove" onClick={() => removeCustomPrintEntry(entry.id)} title="Remove row">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="custom-print-actions">
                        <button type="button" className="control-btn-minimal small" onClick={addCustomPrintEntry}>
                          <Plus size={14} /> Add row
                        </button>
                        <button
                          type="button"
                          className="control-btn-minimal pdf-btn"
                          onClick={downloadCustomPrintable}
                          disabled={customPrintEntries.every((e) => !(e.name || '').trim())}
                          title="Download / print PDF of custom cards"
                        >
                          <PenLine size={14} /> Download PDF
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className={`control-btn-minimal ${showHelp ? 'help-active' : ''}`}
                  title="Show Keyboard Shortcuts"
                >
                  <HelpCircle size={14} />
                </button>

                <button
                  onClick={() => setDisableDescendantHighlight((v) => !v)}
                  className={`control-btn-minimal ${disableDescendantHighlight ? 'filter-active' : ''}`}
                  title="Disable lineage highlight (better performance on slow PCs)"
                >
                  <ZapOff size={14} />
                  Perf
                </button>
              </div>

              {disableDescendantHighlight && (
                <div className="perf-notice">Lineage highlight off for better performance</div>
              )}

              {showBookFilter && (
                <div className="filter-section">
                  <div className="filter-row">
                    <label className="filter-check">
                      <input
                        type="checkbox"
                        checked={majorOnly}
                        onChange={(e) => setMajorOnly(e.target.checked)}
                      />
                      <span>Major only</span>
                    </label>
                  </div>
                  <div className="filter-row filter-mode">
                    <span>Combine:</span>
                    <button
                      className={`control-btn-minimal small ${filterMode === 'AND' ? 'filter-active' : ''}`}
                      onClick={() => setFilterMode('AND')}
                    >
                      AND
                    </button>
                    <button
                      className={`control-btn-minimal small ${filterMode === 'OR' ? 'filter-active' : ''}`}
                      onClick={() => setFilterMode('OR')}
                    >
                      OR
                    </button>
                  </div>
                  <div className="book-filter-label">Books (multi-select)</div>
                  <div className="book-filter-torah">
                    <label className="filter-check">
                      <input
                        type="checkbox"
                        checked={selectedBookIds.includes('torah')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBookIds((prev) => [...prev, 'torah']);
                          } else {
                            setSelectedBookIds((prev) => prev.filter((id) => id !== 'torah'));
                          }
                        }}
                      />
                      <span>{TORAH_OPTION.label}</span>
                    </label>
                  </div>
                  <div className="book-filter-list">
                    {BIBLICAL_BOOKS.map((book) => (
                      <label key={book.id} className="filter-check">
                        <input
                          type="checkbox"
                          checked={selectedBookIds.includes(book.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBookIds((prev) => [...prev, book.id]);
                            } else {
                              setSelectedBookIds((prev) => prev.filter((id) => id !== book.id));
                            }
                          }}
                        />
                        <span>{book.label}</span>
                      </label>
                    ))}
                  </div>
                  {selectedBookIds.length > 0 && (
                    <button
                      className="control-btn-minimal small clear-filters"
                      onClick={() => setSelectedBookIds([])}
                    >
                      Clear books
                    </button>
                  )}
                </div>
              )}

              <div className="navigation-controls-minimal">
                {selectedNodes.size > 0 && (
                  <div className="selection-info">
                    <MousePointer size={12} />
                    <span>{selectedNodes.size} selected</span>
                    <button onClick={clearSelection} className="control-btn-minimal small" title="Clear Selection">
                      <X size={10} />
                    </button>
                  </div>
                )}

                {focusPersonName && (
                  <div className="focus-info">
                    <Target size={12} />
                    <span>Showing: {focusPersonName}</span>
                    <button onClick={showFullTree} className="control-btn-minimal small" title="Show Full Tree">
                      <EyeOff size={10} />
                    </button>
                  </div>
                )}
              </div>

              {showHelp && (
                <div className="help-panel-minimal">
                  <h4>Keyboard Shortcuts</h4>
                  <div className="help-shortcuts">
                    <div><kbd>Shift + Click</kbd> Multi-select nodes</div>
                    <div><kbd>Ctrl/⌘ + A</kbd> Select all visible</div>
                    <div><kbd>Esc</kbd> Clear selection / Exit focus</div>
                    <div><kbd>Del</kbd> Show descendants only</div>
                    <div><kbd>Backspace</kbd> Return to full tree</div>
                  </div>
                  <div className="help-tips">
                    <h5>Tips</h5>
                    <div>• Click nodes to view details</div>
                    <div>• Use search to find specific people</div>
                    <div>• Drag nodes to rearrange layout</div>
                    <div>• <strong>Perf</strong>: turn on to disable lineage highlight on slow PCs</div>
                  </div>
                </div>
              )}

              <div className="legend-minimal">
                <div className="legend-items-minimal">
                  <Crown size={12} className="crown-icon" />
                  <Star size={12} className="star-icon" />
                  <div className="legend-dot female"></div>
                  <div className="legend-dot base"></div>
                </div>
              </div>
            </div>
          </Panel>
        </ReactFlow>

        {contextMenu && (
          <div
            className="context-menu"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button type="button" onClick={copyAncestorsAsText}>Copy ancestors as text</button>
            <button type="button" onClick={copyDescendantsAsText}>Copy descendants as text</button>
            <hr />
            <button
              type="button"
              onClick={() => {
                addToPrintSelection([contextMenu.node.id]);
                setContextMenu(null);
              }}
            >
              Add to print selection
            </button>
            <button
              type="button"
              onClick={() => {
                const ids = getDescendantNodeIds(nodes, edges, contextMenu.node.id);
                addToPrintSelection([contextMenu.node.id, ...ids]);
                setContextMenu(null);
              }}
            >
              Add descendants to print selection
            </button>
            <button
              type="button"
              onClick={() => {
                const ids = getAncestorNodeIds(nodes, edges, contextMenu.node.id);
                addToPrintSelection([contextMenu.node.id, ...ids]);
                setContextMenu(null);
              }}
            >
              Add ancestors to print selection
            </button>
            <button
              type="button"
              onClick={() => {
                const ids = getDescendantNodeIds(nodes, edges, contextMenu.node.id);
                removeFromPrintSelection([contextMenu.node.id, ...ids]);
                setContextMenu(null);
              }}
            >
              Remove descendants from print selection
            </button>
            <button
              type="button"
              onClick={() => {
                const ids = getAncestorNodeIds(nodes, edges, contextMenu.node.id);
                removeFromPrintSelection([contextMenu.node.id, ...ids]);
                setContextMenu(null);
              }}
            >
              Remove ancestors from print selection
            </button>
            <button
              type="button"
              onClick={() => {
                removeFromPrintSelection([contextMenu.node.id]);
                setContextMenu(null);
              }}
            >
              Remove from print selection
            </button>
          </div>
        )}

        {showSidePanel && selectedNode && (
          <div className="side-panel">
            <div className="side-panel-header">
              <h3>Details</h3>
              <button onClick={closeSidePanel} className="side-panel-close">
                <X size={16} />
              </button>
            </div>

            <div className="side-panel-content">
              <div className="detail-section">
                <div className="detail-name">
                  {showAmharic && selectedNode.data.amharic_name
                    ? selectedNode.data.amharic_name
                    : selectedNode.data.name}
                </div>
                {selectedNode.data.amharic_name && selectedNode.data.name !== selectedNode.data.amharic_name && (
                  <div className="detail-alt-name">
                    {showAmharic ? selectedNode.data.name : selectedNode.data.amharic_name}
                  </div>
                )}
              </div>

              {selectedNode.data.class && (
                <div className="detail-section">
                  <div className="detail-class">
                    {selectedNode.data.class.includes('messianicLine') && (
                      <span className="class-badge messianic">
                        <Crown size={14} /> Messianic Line
                      </span>
                    )}
                    {selectedNode.data.class.includes('major') && (
                      <span className="class-badge major">
                        <Star size={14} /> Major Figure
                      </span>
                    )}
                    {selectedNode.data.class.includes('female') && (
                      <span className="class-badge female">Female</span>
                    )}
                  </div>
                </div>
              )}

              {(selectedNode.data.birth || selectedNode.data.death || selectedNode.data.age) && (
                <div className="detail-section">
                  <h4>Life Span</h4>
                  <div className="detail-lifespan">
                    {selectedNode.data.birth && selectedNode.data.death
                      ? `${selectedNode.data.birth} - ${selectedNode.data.death}`
                      : selectedNode.data.birth || selectedNode.data.death}
                    {selectedNode.data.age && ` (${selectedNode.data.age} years)`}
                  </div>
                </div>
              )}

              {selectedNode.data.spouse && (
                <div className="detail-section">
                  <h4>Spouse</h4>
                  <div className="detail-spouse">{selectedNode.data.spouse}</div>
                </div>
              )}

              {(selectedNode.data.detail || selectedNode.data.amharic_detail) && (
                <div className="detail-section">
                  <h4>Description</h4>
                  <div className="detail-description">
                    {showAmharic && selectedNode.data.amharic_detail
                      ? selectedNode.data.amharic_detail
                      : selectedNode.data.detail}
                  </div>
                </div>
              )}

              {parentNodes.length > 0 && (
                <div className="detail-section">
                  <h4>Parents</h4>
                  <div className="detail-children-list">
                    {parentNodes.map((parent) => (
                      <button
                        key={parent.id}
                        type="button"
                        className="child-link"
                        onClick={() => goToNode(parent)}
                      >
                        {showAmharic && parent.data.amharic_name
                          ? parent.data.amharic_name
                          : parent.data.name}
                        {!showAmharic && parent.data.amharic_name && (
                          <span className="child-link-alt"> ({parent.data.amharic_name})</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(selectedNode.data.childCount > 0 || childNodes.length > 0) && (
                <div className="detail-section">
                  <h4>Children</h4>
                  <div className="detail-children-list">
                    {childNodes.length > 0
                      ? childNodes.map((child) => (
                          <button
                            key={child.id}
                            type="button"
                            className="child-link"
                            onClick={() => goToNode(child)}
                          >
                            {showAmharic && child.data.amharic_name
                              ? child.data.amharic_name
                              : child.data.name}
                            {!showAmharic && child.data.amharic_name && (
                              <span className="child-link-alt"> ({child.data.amharic_name})</span>
                            )}
                          </button>
                        ))
                      : `${selectedNode.data.childCount} ${selectedNode.data.childCount === 1 ? 'child' : 'children'} (expand tree to see)`}
                  </div>
                </div>
              )}

              <div className="detail-section">
                <div className="detail-actions">
                  {selectedNode.data.childCount > 0 && (
                    <button onClick={showDescendantsOnly} className="action-btn primary">
                      <Eye size={14} />
                      Show Descendants Only
                    </button>
                  )}
                  <button
                    onClick={() => focusOnPerson(selectedNode.data.name)}
                    className="action-btn secondary"
                  >
                    <Target size={14} />
                    Focus Here
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showLayoutModal && printSelectionIds.size > 0 && (() => {
          const layout = computeTreeLayout(nodes, edges, printSelectionIds, layoutCanvasWidthM, layoutCanvasHeightM, false);
          const { layoutBounds } = layout;
          const wCm = layoutBounds.width;
          const hCm = layoutBounds.height;
          const printOrderIds = nodes.filter((n) => printSelectionIds.has(n.id)).map((n) => n.id);
          const cardsPerPage = printCols * printRows;
          const printLabelById = new Map();
          printOrderIds.forEach((nodeId, index) => {
            const page = Math.floor(index / cardsPerPage) + 1;
            const indexOnPage = (index % cardsPerPage) + 1;
            printLabelById.set(nodeId, `Page ${page}:${indexOnPage}`);
          });
          return (
            <div className="layout-modal-overlay" onClick={() => setShowLayoutModal(false)}>
              <div className="layout-modal" onClick={(e) => e.stopPropagation()}>
                <div className="layout-modal-header">
                  <h3>Print selection layout</h3>
                  <button type="button" className="layout-modal-close" onClick={() => setShowLayoutModal(false)} aria-label="Close">
                    <X size={18} />
                  </button>
                </div>
                <div className="layout-modal-options">
                  <label className="layout-option">
                    <span>Canvas width (m)</span>
                    <input
                      type="number"
                      min={0.5}
                      max={10}
                      step={0.1}
                      value={layoutCanvasWidthM}
                      onChange={(e) => setLayoutCanvasWidthM(Number(e.target.value) || 2.4)}
                    />
                  </label>
                  <label className="layout-option">
                    <span>Canvas height (m)</span>
                    <input
                      type="number"
                      min={0.5}
                      max={10}
                      step={0.1}
                      value={layoutCanvasHeightM}
                      onChange={(e) => setLayoutCanvasHeightM(Number(e.target.value) || 1.2)}
                    />
                  </label>
                  <span className="layout-constraint">Card size: 8 cm × 5 cm (fixed)</span>
                  <span className="layout-constraint layout-constraint-page">Page N:M = print page and position (cols×rows: {printCols}×{printRows})</span>
                </div>
                <p className="layout-life-size-hint">Preview is life size (1:1). Card labels &quot;Page 1:1&quot;, &quot;Page 2:4&quot;, etc. match the printed deck order.</p>
                <div className="layout-preview-wrap layout-preview-life-size">
                  <svg
                    ref={layoutSvgRef}
                    className="layout-svg-preview layout-svg-life-size"
                    viewBox={`0 0 ${wCm} ${hCm}`}
                    width={`${wCm}cm`}
                    height={`${hCm}cm`}
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="layout-card-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#fffdf8" />
                        <stop offset="100%" stopColor="#fef9eb" />
                      </linearGradient>
                      <filter id="layout-card-shadow" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0.5" dy="0.5" stdDeviation="0.3" floodOpacity="0.2" />
                      </filter>
                    </defs>
                    <rect width={wCm} height={hCm} fill="#f8f6f0" />
                    {layout.connectors.map((c, i) => (
                      <line key={i} x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2} stroke="#c4b896" strokeWidth="0.15" fill="none" />
                    ))}
                    {[...layout.positions.entries()].map(([id, pos]) => {
                      const info = layout.nodeMap.get(id);
                      const isMessianic = info?.class?.includes('messianicLine');
                      const isMajor = info?.class?.includes('major');
                      const fill = isMessianic ? '#fef3c7' : isMajor ? '#e0f2fe' : 'url(#layout-card-grad)';
                      const stroke = isMessianic ? '#f59e0b' : isMajor ? '#1e3a8a' : '#d4af37';
                      const cardW = layout.cardWidth;
                      const cardH = layout.cardHeight;
                      const cx = pos.x + cardW / 2;
                      const mainName = (showAmharic && info?.amharic_name) ? (info.amharic_name || info.name) : (info?.name || '');
                      const subName = info?.name || '';
                      const mainFontCm = 1.0;
                      const subFontCm = 0.65;
                      const maxCharsPerLine = 14;
                      const wrap = (s) => {
                        if (!s) return [];
                        const out = [];
                        for (let j = 0; j < s.length; j += maxCharsPerLine) {
                          out.push(s.slice(j, j + maxCharsPerLine));
                        }
                        return out;
                      };
                      const mainLines = wrap(mainName);
                      const subLines = wrap(subName);
                      const lineHeightMain = mainFontCm * 1.15;
                      const lineHeightSub = subFontCm * 1.15;
                      const totalMainH = mainLines.length * lineHeightMain;
                      const totalSubH = subLines.length * lineHeightSub;
                      const contentH = totalMainH + 0.2 + totalSubH;
                      const startY = pos.y + (cardH - contentH) / 2 + mainFontCm * 0.35;
                      return (
                        <g key={id} filter="url(#layout-card-shadow)">
                          <rect
                            x={pos.x}
                            y={pos.y}
                            width={cardW}
                            height={cardH}
                            rx="0.4"
                            fill={fill}
                            stroke={stroke}
                            strokeWidth="0.12"
                          />
                          <text
                            x={cx}
                            y={startY}
                            textAnchor="middle"
                            fontSize={`${mainFontCm}`}
                            fill="#451a03"
                            fontFamily="'Noto Sans Ethiopic', sans-serif"
                            style={{ dominantBaseline: 'middle' }}
                          >
                            {mainLines.map((line, i) => (
                              <tspan key={i} x={cx} dy={i === 0 ? 0 : lineHeightMain}>{line}</tspan>
                            ))}
                          </text>
                          <text
                            x={cx}
                            y={startY + totalMainH + 0.2 + subFontCm * 0.35}
                            textAnchor="middle"
                            fontSize={`${subFontCm}`}
                            fill="#6b7280"
                            style={{ dominantBaseline: 'middle' }}
                          >
                            {subLines.map((line, i) => (
                              <tspan key={i} x={cx} dy={i === 0 ? 0 : lineHeightSub}>{line}</tspan>
                            ))}
                          </text>
                          {printLabelById.has(id) && (
                            <text
                              x={cx}
                              y={pos.y + cardH - 0.35}
                              textAnchor="middle"
                              fontSize="0.5"
                              fill="#78716c"
                              style={{ dominantBaseline: 'middle' }}
                            >
                              {printLabelById.get(id)}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>
                <div className="layout-modal-actions">
                  <button
                    type="button"
                    className="control-btn-minimal"
                    onClick={() => {
                      if (!layoutSvgRef.current) return;
                      const svg = layoutSvgRef.current;
                      const svgStr = new XMLSerializer().serializeToString(svg);
                      const blob = new Blob([svgStr], { type: 'image/svg+xml' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `genealogy-layout-${Date.now()}.svg`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Download SVG
                  </button>
                  <button
                    type="button"
                    className="control-btn-minimal pdf-btn"
                    onClick={() => {
                      if (!layoutSvgRef.current) return;
                      const svg = layoutSvgRef.current;
                      const w = Math.round(wCm * 10);
                      const h = Math.round(hCm * 10);
                      const canvas = document.createElement('canvas');
                      canvas.width = w;
                      canvas.height = h;
                      const ctx = canvas.getContext('2d');
                      ctx.fillStyle = '#f8f6f0';
                      ctx.fillRect(0, 0, w, h);
                      const img = new Image();
                      const svgStr = new XMLSerializer().serializeToString(svg);
                      const blob = new Blob([svgStr], { type: 'image/svg+xml' });
                      img.onload = () => {
                        ctx.drawImage(img, 0, 0, w, h);
                        const url = canvas.toDataURL('image/png');
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `genealogy-layout-${Date.now()}.png`;
                        a.click();
                      };
                      img.src = URL.createObjectURL(blob);
                    }}
                  >
                    Download PNG
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export default function BiblicalGenealogyApp() {
  return (
    <ReactFlowProvider>
      <GenealogyFlowComponent />
    </ReactFlowProvider>
  );
}
