import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Crown, Star } from 'lucide-react';
import './PersonNode.css';

const PersonNode = memo(({ data, isConnectable }) => {
  const {
    name,
    amharic_name,
    showAmharic,
    class: personClass,
    spouse,
    age,
    birth,
    death,
    detail,
    amharic_detail,
    collapsed,
    hasChildren,
    isInPrintSelection,
  } = data;

  const displayName = showAmharic && amharic_name ? amharic_name : name;
  const displayDetail = showAmharic && amharic_detail ? amharic_detail : detail;

  const getNodeClass = () => {
    let classes = 'person-node';
    if (personClass?.includes('messianicLine')) classes += ' messianic';
    else if (personClass?.includes('major')) classes += ' major';
    else if (personClass?.includes('female')) classes += ' female';
    return classes;
  };

  const getClassIndicator = () => {
    if (personClass?.includes('messianicLine')) {
      return <Crown className="class-icon crown" size={28} />;
    } else if (personClass?.includes('major')) {
      return <Star className="class-icon star" size={24} />;
    }
    return null;
  };

  const shortDetail = displayDetail && displayDetail.length > 100
    ? displayDetail.substring(0, 100) + '...'
    : displayDetail;

  return (
    <div className={getNodeClass()}>
      {isInPrintSelection && <div className="print-selection-marker" title="In print selection" />}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="handle-top"
      />

      <div className="node-content">
        <div className="name-section">
          <div className="name">{displayName}</div>
          {!showAmharic && amharic_name && (
            <div className="amharic-name">{amharic_name}</div>
          )}
          {getClassIndicator()}
        </div>

        {(birth || death || age) && (
          <div className="life-span">
            {birth && death ? `${birth} - ${death}` : birth || death}
            {age && ` (${age} years)`}
          </div>
        )}

        {spouse && (
          <div className="spouse">{spouse}</div>
        )}

        {shortDetail && (
          <div className="details">{shortDetail}</div>
        )}

        {hasChildren && (
          <div className="children-indicator">
            {collapsed ? 'Click to expand' : 'Click to collapse'}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="handle-bottom"
      />
    </div>
  );
});

PersonNode.displayName = 'PersonNode';

export default PersonNode;
