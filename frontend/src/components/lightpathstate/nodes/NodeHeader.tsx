import React from 'react';

export const NodeHeader: React.FC<{ title: string; id: string }> = ({
  title,
  id,
}) => (
  <div style={{ textAlign: 'center', marginBottom: '8px' }}>
    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{title}</div>
    <div style={{ fontSize: '10px', color: '#888', wordBreak: 'break-all' }}>
      ID: {id.slice(0, 8)}...
    </div>
  </div>
);
