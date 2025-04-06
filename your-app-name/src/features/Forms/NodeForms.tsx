import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { NodeFormProps } from '../../types/workflow.types';

const styles = {
  form: {
    position: 'absolute' as const,
    right: 0,
    top: 0,
    width: 400,
    padding: 20,
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: 8,
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    zIndex: 10,
  },
  header: {
    display: 'flex' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    display: 'block',
    marginBottom: 5,
    fontWeight: 'bold' as const,
  },
  input: {
    width: '100%',
    padding: 8,
    border: '1px solid #ccc',
    borderRadius: 4,
    fontSize: 14,
  },
  branchItem: {
    marginBottom: 10,
  },
  actions: {
    display: 'flex' as const,
    justifyContent: 'flex-end' as const,
    gap: 10,
  },
};

export function NodeForm({
  node,
  newNodeConfig,
  edges,
  setNodes,
  setEdges,
  setNeedsLayout,
  onClose,
  onNewNodeSave,
}: NodeFormProps) {
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
    if (!node) return;

    if (node.type === 'ifelse') {
      // Step 1: Identify core nodes to remove (If/Else, Branch, Else)
      const branchIds = node.data.branches.map((b: { id: string }) => b.id);
      const elseId = node.data.elseId;
      const nodesToRemove = new Set([node.id, ...branchIds, elseId].filter(Boolean));

      // Step 2: Find the incoming edge to the If/Else node
      const incomingEdge = edges.find((e) => e.target === node.id);
      const sourceId = incomingEdge?.source;

      if (!sourceId) {
        // No incoming edge, just remove the nodes and their edges
        setNodes((nds) => nds.filter((n) => !nodesToRemove.has(n.id)));
        setEdges((eds) => eds.filter((e) => !nodesToRemove.has(e.source) && !nodesToRemove.has(e.target)));
        setNeedsLayout(true);
        onClose();
        return;
      }

      // Step 3: Identify immediate successors of Branch and Else nodes
      const branchSuccessors = branchIds.map((branchId) => edges.find((e) => e.source === branchId)?.target).filter(Boolean);
      const elseSuccessor = edges.find((e) => e.source === elseId)?.target;
      const allSuccessors = [...branchSuccessors, elseSuccessor].filter(Boolean) as string[];

      // Step 4: Check if all successors converge to the same node
      const uniqueSuccessors = new Set(allSuccessors);
      let targetId: string;

      if (uniqueSuccessors.size === 1) {
        // All branches converge to one node, connect source to this node
        targetId = allSuccessors[0];
      } else {
        // Branches go to different nodes or End nodes, create a new End node
        targetId = `end-${Date.now()}`;
        const newEndNode = {
          id: targetId,
          type: 'end',
          position: { x: node.position.x, y: node.position.y + 200 },
          data: { label: 'End' },
        };
        setNodes((nds) => [...nds.filter((n) => !nodesToRemove.has(n.id)), newEndNode]);
      }

      // Step 5: Update edges
      setEdges((eds) => {
        // Remove edges connected to nodes being deleted
        const filteredEdges = eds.filter((e) => !nodesToRemove.has(e.source) && !nodesToRemove.has(e.target));
        // Add new edge from source to target
        const newEdge = {
          id: `${sourceId}-${targetId}-${Date.now()}`,
          source: sourceId,
          target: targetId,
          type: 'buttonedge',
        };
        return [...filteredEdges, newEdge];
      });

      // Step 6: Remove only the If/Else structure
      setNodes((nds) => nds.filter((n) => !nodesToRemove.has(n.id)));
      setNeedsLayout(true);
    } else {
      // Handle deletion for non-If/Else nodes (e.g., Action nodes)
      setNodes((nds) => nds.filter((n) => n.id !== node.id));
      setEdges((eds) => {
        const incoming = edges.find((e) => e.target === node.id);
        const outgoing = edges.find((e) => e.source === node.id);
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
      setNeedsLayout(true);
    }
    onClose();
  };

  return (
    <div style={styles.form}>
      <div style={styles.header}>
        <h3 style={styles.title}>
          {isNewNode ? 'Configure New If/Else Node' : `Edit ${nodeType === 'action' ? 'Action' : 'If/Else'} Node`}
        </h3>
        <button onClick={onClose} style={styles.closeButton}>
          <X size={20} />
        </button>
      </div>
      
      <div style={styles.field}>
        <label style={styles.label}>Label:</label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          style={styles.input}
        />
      </div>
      
      {nodeType === 'ifelse' && (
        <div style={styles.field}>
          <label style={styles.label}>Branches:</label>
          {branches.map((branch, index) => (
            <div key={branch.id} style={styles.branchItem}>
              <input
                value={branch.label}
                onChange={(e) => {
                  const newBranches = [...branches];
                  newBranches[index].label = e.target.value;
                  setBranches(newBranches);
                }}
                style={styles.input}
              />
            </div>
          ))}
          <Button onClick={addBranch} variant="secondary">
            Add Branch
          </Button>
        </div>
      )}
      
      <div style={styles.actions}>
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