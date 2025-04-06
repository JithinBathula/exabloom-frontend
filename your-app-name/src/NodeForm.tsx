// NodeForm.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function NodeForm({ node, setNodes, setEdges, onClose }) {
  const [label, setLabel] = useState(node.data.label);

  const handleSave = () => {
    setNodes((nds) =>
      nds.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, label } } : n))
    );
    onClose();
  };

  const handleDelete = () => {
    setNodes((nds) => nds.filter((n) => n.id !== node.id));
    setEdges((eds) => {
      const incoming = eds.find((e) => e.target === node.id);
      const outgoing = eds.find((e) => e.source === node.id);
      if (incoming && outgoing) {
        const newEdge = {
          id: `${incoming.source}-${outgoing.target}`,
          source: incoming.source,
          target: outgoing.target,
          type: 'buttonedge', // Reconnect with buttonedge
        };
        return [...eds.filter((e) => e.source !== node.id && e.target !== node.id), newEdge];
      }
      return eds.filter((e) => e.source !== node.id && e.target !== node.id);
    });
    onClose();
  };

  return (
    <div
      style={{
        position: 'absolute',
        right: 0,
        top: 0,
        width: 300,
        padding: 20,
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: 8,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 10,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <h3 style={{ fontSize: 18, fontWeight: 'bold', margin: 0 }}>Edit Action Node</h3>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <X size={20} />
        </button>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Label:</label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          style={{
            width: '100%',
            padding: 8,
            border: '1px solid #ccc',
            borderRadius: 4,
            fontSize: 14,
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <Button onClick={handleSave} variant="default">Save</Button>
        <Button onClick={onClose} variant="secondary">Cancel</Button>
        <Button onClick={handleDelete} variant="destructive">Delete</Button>
      </div>
    </div>
  );
}