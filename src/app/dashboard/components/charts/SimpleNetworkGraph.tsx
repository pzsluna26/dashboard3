'use client';

import { NetworkNode, NetworkLink } from '@/shared/types/dashboard';

interface SimpleNetworkGraphProps {
  nodes?: NetworkNode[];
  links?: NetworkLink[];
  width?: number;
  height?: number;
}

/**
 * Simple fallback network graph without D3.js
 * Uses basic SVG and CSS for visualization
 */
export default function SimpleNetworkGraph({ 
  nodes = [], 
  links = [], 
  width = 800, 
  height = 600 
}: SimpleNetworkGraphProps) {
  // 데이터가 없으면 더미 데이터 생성
  let displayNodes = nodes;
  let displayLinks = links;
  
  if (!Array.isArray(nodes) || nodes.length === 0) {
    const dummyData = generateSimpleDummyData();
    displayNodes = dummyData.nodes;
    displayLinks = dummyData.links;
  }

  // 법조항 중심 레이아웃 - 법조항을 중앙에, 사건들을 주변에 배치
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 3;

  const legalNodes = displayNodes.filter(n => n.type === 'legal');
  const incidentNodes = displayNodes.filter(n => n.type === 'incident');

  const positionedNodes = [
    // 법조항들을 중앙 영역에 배치 (작은 원형으로)
    ...legalNodes.map((node, index) => {
      if (legalNodes.length === 1) {
        // 법조항이 1개면 정중앙에
        return { ...node, x: centerX, y: centerY };
      } else {
        // 여러 개면 중앙 주변 작은 원에 배치
        const angle = (index / legalNodes.length) * 2 * Math.PI;
        const x = centerX + (radius * 0.3) * Math.cos(angle);
        const y = centerY + (radius * 0.3) * Math.sin(angle);
        return { ...node, x, y };
      }
    }),
    // 사건들을 각 법조항 주변에 배치
    ...incidentNodes.map((node, index) => {
      // 이 사건이 연결된 법조항 찾기
      const relatedLink = displayLinks.find(link => link.source === node.id);
      const relatedLegalNode = legalNodes.find(legal => legal.id === relatedLink?.target);
      
      if (relatedLegalNode) {
        // 해당 법조항 주변에 배치
        const legalNodePosition = legalNodes.findIndex(legal => legal.id === relatedLegalNode.id);
        const incidentsForThisLegal = incidentNodes.filter(incident => {
          const link = displayLinks.find(l => l.source === incident.id && l.target === relatedLegalNode.id);
          return !!link;
        });
        const incidentIndex = incidentsForThisLegal.findIndex(inc => inc.id === node.id);
        
        const baseAngle = legalNodes.length > 1 ? (legalNodePosition / legalNodes.length) * 2 * Math.PI : 0;
        const incidentAngle = baseAngle + (incidentIndex / incidentsForThisLegal.length) * Math.PI * 0.8 - Math.PI * 0.4;
        
        const legalX = legalNodes.length === 1 ? centerX : centerX + (radius * 0.3) * Math.cos(baseAngle);
        const legalY = legalNodes.length === 1 ? centerY : centerY + (radius * 0.3) * Math.sin(baseAngle);
        
        const x = legalX + (radius * 0.7) * Math.cos(incidentAngle);
        const y = legalY + (radius * 0.7) * Math.sin(incidentAngle);
        
        return { ...node, x, y };
      } else {
        // 연결된 법조항이 없으면 외곽에 배치
        const angle = (index / incidentNodes.length) * 2 * Math.PI;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        return { ...node, x, y };
      }
    })
  ];

  return (
    <div className="relative">
      <svg
        width={width}
        height={height}
        className="border border-gray-200 rounded-lg bg-white"
      >
        {/* Render links */}
        {displayLinks.map((link, index) => {
          const sourceNode = positionedNodes.find(n => n.id === link.source);
          const targetNode = positionedNodes.find(n => n.id === link.target);
          
          if (!sourceNode || !targetNode) return null;
          
          return (
            <line
              key={`link-${index}`}
              x1={sourceNode.x}
              y1={sourceNode.y}
              x2={targetNode.x}
              y2={targetNode.y}
              stroke="#999"
              strokeWidth={Math.sqrt(link.strength)}
              strokeOpacity={0.6}
            />
          );
        })}
        
        {/* Render nodes */}
        {positionedNodes.map((node) => (
          <g key={node.id} transform={`translate(${node.x},${node.y})`}>
            {node.type === 'legal' ? (
              // Legal articles as rectangles
              <rect
                width={node.size}
                height={node.size * 0.6}
                x={-node.size / 2}
                y={-node.size * 0.3}
                fill={node.color}
                stroke="#fff"
                strokeWidth={2}
                rx={4}
                className="cursor-pointer hover:opacity-80"
              />
            ) : (
              // Incidents as circles
              <circle
                r={node.size / 2}
                fill={node.color}
                stroke="#fff"
                strokeWidth={2}
                className="cursor-pointer hover:opacity-80"
              />
            )}
            
            {/* Node labels */}
            <text
              textAnchor="middle"
              dy={4}
              fontSize="10px"
              fontWeight="bold"
              fill="#333"
              pointerEvents="none"
            >
              {node.name.length > 12 ? node.name.substring(0, 12) + '...' : node.name}
            </text>
          </g>
        ))}
      </svg>
      
      {/* Simple legend */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-sm border text-xs">
        <div className="space-y-2">
          <div className="font-semibold text-gray-700">범례</div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-3 bg-blue-500 rounded"></div>
            <span>법조항</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span>사건</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// SimpleNetworkGraph용 더미 데이터 생성 함수
function generateSimpleDummyData(): { nodes: NetworkNode[], links: NetworkLink[] } {
  const nodes: NetworkNode[] = [
    // 법조항 노드들
    { id: 'legal1', type: 'legal', name: '개인정보보호법 제2조', size: 60, color: '#ef4444' },
    { id: 'legal2', type: 'legal', name: '도로교통법 제3조', size: 55, color: '#84cc16' },
    { id: 'legal3', type: 'legal', name: '근로기준법 제15조', size: 50, color: '#06b6d4' },
    
    // 사건 노드들
    { id: 'incident1', type: 'incident', name: '개인정보 유출 사건', size: 35, color: '#fca5a5' },
    { id: 'incident2', type: 'incident', name: '온라인 해킹 사건', size: 30, color: '#fca5a5' },
    { id: 'incident3', type: 'incident', name: '스쿨존 교통사고', size: 40, color: '#bef264' },
    { id: 'incident4', type: 'incident', name: '음주운전 단속', size: 32, color: '#bef264' },
    { id: 'incident5', type: 'incident', name: '배달업계 근로시간', size: 28, color: '#67e8f9' },
    { id: 'incident6', type: 'incident', name: '임금체불 사건', size: 33, color: '#67e8f9' }
  ];

  const links: NetworkLink[] = [
    { source: 'incident1', target: 'legal1', strength: 6 },
    { source: 'incident2', target: 'legal1', strength: 5 },
    { source: 'incident3', target: 'legal2', strength: 7 },
    { source: 'incident4', target: 'legal2', strength: 5 },
    { source: 'incident5', target: 'legal3', strength: 4 },
    { source: 'incident6', target: 'legal3', strength: 6 }
  ];

  return { nodes, links };
}