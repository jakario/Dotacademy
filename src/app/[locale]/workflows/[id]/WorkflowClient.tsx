'use client';

import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CustomNode from '@/components/workflow/CustomNode';

const nodeTypes = {
  custom: CustomNode,
};

interface WorkflowClientProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  title: string;
}

export default function WorkflowClient({ initialNodes, initialEdges, title }: WorkflowClientProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div className="flex flex-col h-[800px] bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span className="text-amber-500">📍</span> {title}
        </h2>
        <div className="text-sm text-slate-500">
          *สามารถใช้เมาส์ลาก (Drag) และซูม (Scroll) เพื่อดูแผนผังได้
        </div>
      </div>
      <div className="flex-grow w-full h-full relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            attributionPosition="bottom-right"
          >
          <Controls />
          <MiniMap zoomable pannable nodeClassName={(node) => (node.type === 'input' ? 'bg-amber-500' : 'bg-slate-500')} />
          <Background color="#ccc" gap={16} />
        </ReactFlow>
      </div>
    </div>
  );
}
