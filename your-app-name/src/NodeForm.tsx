import { useState } from 'react';
import { type Node } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface NodeFormProps {
  node?: Node;
  newNodeConfig?: { type: 'ifelse'; edgeId: string };
  setNodes: (updater: (nodes: Node[]) => Node[]) => void;
  setEdges: (updater: (edges: Edge[]) => Edge[]) => void;
  onClose: () => void;
  onNewNodeSave?: (data: { label: string; branches: { label: string }[] }) => void;
}

export function NodeForm({ node, newNodeConfig, setNodes, setEdges, onClose, onNewNodeSave }: NodeFormProps) {
  const isNewNode = !!newNodeConfig;
  const nodeType = node ? node.type : newNodeConfig?.type;

  const [label, setLabel] = useState(isNewNode ? 'If/Else' : node?.data.label || '');
  const [branches, setBranches] = useState(
    isNewNode
      ? [{ id: `branch-${Date.now()}`, label: 'Condition 1' }]
      : node?.type === 'ifelse'
      ? [...node.data.branches]
      : []
  );

  const addBranch = () => {
    setBranches([...branches, { id: `branch-${Date.now()}`, label: `Condition ${branches.length + 1}` }]);
  };

  const handleSave = () => {
    if (node) {
      if (node.type === 'action') {
        setNodes((nds) =>
          nds.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, label } } : n))
        );
      } else if (node.type === 'ifelse') {
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === node.id) {
              return { ...n, data: { ...n.data, label, branches } };
            }
            const branch = branches.find((b) => b.id === n.id);
            if (branch) {
              return { ...n, data: { label: branch.label } };
            }
            return n;
          })
        );
      }
    } else if (newNodeConfig && onNewNodeSave) {
      onNewNodeSave({
        label,
        branches: branches.map((b) => ({ label: b.label })),
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (node) {
      setNodes((nds) => nds.filter((n) => n.id !== node.id));
      setEdges((eds) => {
        const incoming = eds.find((e) => e.target === node.id);
        const outgoing = eds.find((e) => e.source === node.id);
        if (incoming && outgoing) {
          const newEdge = {
            id: `${incoming.source}-${outgoing.target}`,
            source: incoming.source,
            target: outgoing.target,
            type: 'buttonedge',
          };
          return [...eds.filter((e) => e.source !== node.id && e.target !== node.id), newEdge];
        }
        return eds.filter((e) => e.source !== node.id && e.target !== node.id);
      });
    }
    onClose();
  };

  return (
    <div
      style={{
        position: 'absolute',
        right: 0,
        top: 0,
        width: 400,
        padding: 20,
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: 8,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 'bold', margin: 0 }}>
          {isNewNode ? 'Configure New If/Else Node' : 'Edit Node'}
        </h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <X size={20} />
        </button>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Label:</label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4, fontSize: 14 }}
        />
      </div>
      {nodeType === 'ifelse' && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Branches:</label>
          {branches.map((branch, index) => (
            <div key={branch.id} style={{ marginBottom: 10 }}>
              <input
                value={branch.label}
                onChange={(e) => {
                  const newBranches = [...branches];
                  newBranches[index].label = e.target.value;
                  setBranches(newBranches);
                }}
                style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4, fontSize: 14 }}
              />
            </div>
          ))}
          <Button onClick={addBranch} variant="secondary">
            Add Branch
          </Button>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <Button onClick={handleSave} variant="default">
          Save
        </Button>
        <Button onClick={onClose} variant="secondary">
          Cancel
        </Button>
        {node && (
          <Button onClick={handleDelete} variant="destructive">
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}