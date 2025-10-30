'use client';

import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { NetworkNode, NetworkLink } from '@/shared/types/dashboard';

interface NetworkGraphProps {
  nodes?: NetworkNode[];
  links?: NetworkLink[];
  width?: number;
  height?: number;
}

interface D3Node extends NetworkNode, d3.SimulationNodeDatum {
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  vx?: number;
  vy?: number;
}

interface D3Link extends Omit<NetworkLink, 'source' | 'target'> {
  source: D3Node;
  target: D3Node;
}

export default function NetworkGraph({ 
  nodes = [], 
  links = [], 
  width = 800, 
  height = 600 
}: NetworkGraphProps) {
  try {
    // Early return if nodes is not properly initialized
    if (!Array.isArray(nodes)) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
          <div className="text-center text-gray-500">
            <p className="text-sm">데이터를 로딩 중입니다...</p>
          </div>
        </div>
      );
    }

    const svgRef = useRef<SVGSVGElement>(null);
    const zoomBehaviorRef = useRef<any>(null);
    const [selectedNode, setSelectedNode] = useState<D3Node | null>(null);
  
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
    node?: D3Node;
  }>({
    visible: false,
    x: 0,
    y: 0,
    content: ''
  });

  useEffect(() => {
    if (!svgRef.current || !nodes || nodes.length === 0) return;

    try {
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove(); // Clear previous render

    // Create container group for zoom/pan
    const container = svg.append('g');

    // Setup zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

      // Convert nodes and links to D3 format
      const d3Nodes: D3Node[] = nodes.map(node => ({ ...node }));
      const d3Links: D3Link[] = (links || [])
        .map(link => {
          const sourceNode = d3Nodes.find(n => n.id === link.source);
          const targetNode = d3Nodes.find(n => n.id === link.target);
          
          if (!sourceNode || !targetNode) {
            console.warn(`Missing node for link: ${link.source} -> ${link.target}`);
            return null;
          }
          
          return {
            ...link,
            source: sourceNode,
            target: targetNode
          };
        })
        .filter(Boolean) as D3Link[];

    // Create simulation
    const simulation = d3.forceSimulation<D3Node>(d3Nodes)
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => (d as D3Node).size + 5));

    // Only add link force if we have valid links
    if (d3Links.length > 0) {
      simulation.force('link', d3.forceLink<D3Node, D3Link>(d3Links)
        .id(d => d.id)
        .distance(d => 100 - (d.strength * 5)) // Stronger links are shorter
        .strength(d => d.strength / 10)
      );
    }

    // Create links
    const link = container.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(d3Links)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.sqrt(d.strength));

    // Create nodes
    const node = container.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(d3Nodes)
      .enter().append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(d3.drag<SVGGElement, D3Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      );

    // Add shapes for nodes
    node.each(function(d) {
      const nodeGroup = d3.select(this);
      
      if (d.type === 'legal') {
        // Legal articles as rectangles
        nodeGroup.append('rect')
          .attr('width', d.size)
          .attr('height', d.size * 0.6)
          .attr('x', -d.size / 2)
          .attr('y', -d.size * 0.3)
          .attr('fill', d.color)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2)
          .attr('rx', 4);
      } else {
        // Incidents as circles
        nodeGroup.append('circle')
          .attr('r', d.size / 2)
          .attr('fill', d.color)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);
      }
    });

    // Add labels
    node.append('text')
      .text(d => {
        // Truncate long names
        const maxLength = d.type === 'legal' ? 15 : 12;
        return d.name.length > maxLength 
          ? d.name.substring(0, maxLength) + '...' 
          : d.name;
      })
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.type === 'legal' ? 4 : 4)
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .attr('pointer-events', 'none');

    // Add hover and click interactions
    node
      .on('mouseover', function(event, d) {
        // Highlight connected nodes and links
        const connectedNodeIds = new Set<string>();
        
        link
          .style('stroke-opacity', l => {
            if (l.source === d || l.target === d) {
              connectedNodeIds.add(l.source.id);
              connectedNodeIds.add(l.target.id);
              return 0.8;
            }
            return 0.1;
          })
          .style('stroke-width', l => {
            if (l.source === d || l.target === d) {
              return Math.sqrt(l.strength) * 2;
            }
            return Math.sqrt(l.strength);
          });

        node.style('opacity', n => {
          return n === d || connectedNodeIds.has(n.id) ? 1 : 0.3;
        });

        // Show tooltip
        const svgNode = svg.node();
        if (!svgNode) return;
        
        const [mouseX, mouseY] = d3.pointer(event, svgNode);
        const connectedCount = d3Links.filter(l => 
          l.source.id === d.id || l.target.id === d.id
        ).length;
        
        setTooltip({
          visible: true,
          x: mouseX,
          y: mouseY,
          content: `${d.name}\n타입: ${d.type === 'legal' ? '법조항' : '사건'}\n크기: ${d.size}\n연결: ${connectedCount}개`,
          node: d
        });
      })
      .on('mouseout', function() {
        // Reset styles
        link
          .style('stroke-opacity', 0.6)
          .style('stroke-width', d => Math.sqrt(d.strength));
        
        node.style('opacity', 1);
        
        // Hide tooltip
        setTooltip(prev => ({ ...prev, visible: false, node: undefined }));
      })
      .on('click', function(event, d) {
        event.stopPropagation();
        setSelectedNode(d === selectedNode ? null : d);
      });

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x!)
        .attr('y1', d => d.source.y!)
        .attr('x2', d => d.target.x!)
        .attr('y2', d => d.target.y!);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>, d: D3Node) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>, d: D3Node) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>, d: D3Node) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

      // Cleanup
      return () => {
        simulation.stop();
      };
    } catch (error) {
      console.error('Error rendering network graph:', error);
    }
  }, [nodes, links, width, height]);

  // 데이터가 없으면 더미 데이터 사용 (useNetworkGraphData에서 이미 처리됨)
  if (!nodes || nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
        <div className="text-center text-gray-500">
          <p className="text-sm">데이터를 로딩 중입니다...</p>
          <p className="text-xs mt-1">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="border border-gray-200 rounded-lg bg-transparent"
      />
      
      {/* Tooltip */}
      {tooltip.visible && tooltip.node && (
        <div
          className="absolute bg-gray-900 text-white text-xs rounded-lg px-3 py-2 pointer-events-none z-10 shadow-lg border border-gray-700 max-w-xs"
          style={{
            left: Math.min(tooltip.x + 15, width - 200),
            top: Math.max(tooltip.y - 10, 10),
          }}
        >
          <div className="font-semibold text-yellow-300 mb-1">
            {tooltip.node.type === 'legal' ? '📋 법조항' : '⚡ 사건'}
          </div>
          <div className="space-y-1">
            <div><strong>이름:</strong> {tooltip.node.name}</div>
            <div><strong>크기:</strong> {tooltip.node.size}</div>
            <div className="flex items-center">
              <strong>색상:</strong>
              <span 
                className="inline-block w-3 h-3 ml-2 rounded border border-gray-500"
                style={{ backgroundColor: tooltip.node.color }}
              ></span>
            </div>
            <div className="text-gray-300 text-xs mt-2 pt-1 border-t border-gray-700">
              {tooltip.node.type === 'legal' 
                ? '클릭하여 관련 사건 보기' 
                : '클릭하여 관련 법조항 보기'
              }
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-sm border text-xs max-w-48">
        <div className="space-y-2">
          <div className="font-semibold text-gray-700 border-b border-gray-200 pb-1">
            📊 네트워크 범례
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-3 bg-blue-500 rounded border border-gray-300"></div>
              <span className="text-gray-700">법조항 (사각형)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full border border-gray-300"></div>
              <span className="text-gray-700">사건 (원형)</span>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="text-gray-600 font-medium mb-1">상호작용</div>
            <div className="text-gray-500 text-xs space-y-0.5">
              <div>• 🖱️ 드래그: 노드 이동</div>
              <div>• 🔍 휠: 줌 인/아웃</div>
              <div>• ✨ 호버: 연결 강조</div>
              <div>• 👆 클릭: 상세 정보</div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="text-gray-500 text-xs">
              <div><strong>노드 크기:</strong> 댓글 수 비례</div>
              <div><strong>선 굵기:</strong> 연결 강도</div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected node info */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-gray-800 flex items-center">
              <span className="mr-2">
                {selectedNode.type === 'legal' ? '📋' : '⚡'}
              </span>
              {selectedNode.type === 'legal' ? '법조항 정보' : '사건 정보'}
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              title="닫기"
            >
              ×
            </button>
          </div>
          
          <div className="text-sm text-gray-600 space-y-2">
            <div>
              <strong className="text-gray-800">이름:</strong>
              <div className="mt-1 text-gray-700">{selectedNode.name}</div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <strong className="text-gray-800">영향도:</strong> {selectedNode.size}
              </div>
              <div className="flex items-center">
                <strong className="text-gray-800 mr-2">카테고리:</strong>
                <span 
                  className="inline-block w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: selectedNode.color }}
                  title="카테고리 색상"
                ></span>
              </div>
            </div>
            
            <div className="pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                {selectedNode.type === 'legal' 
                  ? '이 법조항과 연결된 사건들을 확인하세요.' 
                  : '이 사건과 관련된 법조항들을 확인하세요.'
                }
              </div>
            </div>
          </div>
          
          <div className="mt-3 pt-2 border-t border-gray-200">
            <button
              onClick={() => setSelectedNode(null)}
              className="w-full px-3 py-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-4 left-4 bg-white p-2 rounded-lg shadow-sm border">
        <div className="flex flex-col space-y-1">
          <button
            onClick={() => {
              try {
                if (svgRef.current && zoomBehaviorRef.current) {
                  const svg = d3.select(svgRef.current);
                  svg.transition().duration(750).call(
                    zoomBehaviorRef.current.transform,
                    d3.zoomIdentity
                  );
                }
              } catch (error) {
                console.warn('Zoom reset failed:', error);
              }
            }}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            title="뷰 초기화"
          >
            🏠 초기화
          </button>
          <button
            onClick={() => {
              try {
                if (svgRef.current && zoomBehaviorRef.current) {
                  const svg = d3.select(svgRef.current);
                  svg.transition().duration(300).call(
                    zoomBehaviorRef.current.scaleBy,
                    1.5
                  );
                }
              } catch (error) {
                console.warn('Zoom in failed:', error);
              }
            }}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            title="확대"
          >
            🔍 확대
          </button>
          <button
            onClick={() => {
              try {
                if (svgRef.current && zoomBehaviorRef.current) {
                  const svg = d3.select(svgRef.current);
                  svg.transition().duration(300).call(
                    zoomBehaviorRef.current.scaleBy,
                    0.67
                  );
                }
              } catch (error) {
                console.warn('Zoom out failed:', error);
              }
            }}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            title="축소"
          >
            🔍 축소
          </button>
        </div>
      </div>
    </div>
  );
  } catch (error) {
    console.error('NetworkGraph component error:', error);
    return (
      <div className="flex items-center justify-center h-full bg-red-50 rounded-lg border border-red-200">
        <div className="text-center text-red-600">
          <p className="text-sm font-medium">네트워크 그래프 오류</p>
          <p className="text-xs mt-1">컴포넌트를 로드할 수 없습니다.</p>
        </div>
      </div>
    );
  }
}