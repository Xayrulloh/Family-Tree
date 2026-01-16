import {
  DownloadOutlined,
  ShareAltOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { FamilyTreeMemberConnectionGetAllResponseType } from '@family-tree/shared';
import { theme } from 'antd';
import { Link } from 'atomic-router-react';
import { useUnit } from 'effector-react';
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { saveSvgAsPng } from 'save-svg-as-png';
import { addMemberModel } from '~/features/tree-member/add';
import { previewMemberModel } from '~/features/tree-member/preview';
import { ShareTreeModal, shareTreeModel } from '~/features/trees-detail/share';
import { routes } from '~/shared/config/routing';
import {
  calculatePositions,
  type MemberMetadata,
  type Position,
} from '~/shared/lib/layout-engine';
import { FamilyTreeNode } from '~/shared/ui/family-tree-node';
import type { Props } from './ui';

const MemoizedFamilyTreeNode = memo(FamilyTreeNode);

const CONNECTION = {
  SPOUSE: { color: '#10b981', width: 3 },
  PARENT_CHILD: { color: '#9ca3af', width: 2 },
} as const;

const NODE_WIDTH = 160;
const NODE_HEIGHT = 80;

const savedViews = new Map<
  string,
  { x: number; y: number; width: number; height: number }
>();

export const Visualization: React.FC<Props> = ({ model }) => {
  const [connections, members, id, tree, isOwner] = useUnit([
    model.$connections,
    model.$members,
    model.$id,
    model.$tree,
    model.$isOwner,
  ]);
  const { token } = theme.useToken();

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [containerWidth, setContainerWidth] = useState(0);

  useLayoutEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    update();

    window.addEventListener('resize', update);

    return () => window.removeEventListener('resize', update);
  }, []);

  const { positions, metadata, couples } = useMemo(() => {
    if (containerWidth === 0) {
      return {
        positions: new Map(),
        metadata: new Map(),
        couples: [],
      };
    }
    return calculatePositions(members, connections, containerWidth);
  }, [members, connections, containerWidth]);

  /* ===============================
   * Center tree in the viewport
   * =============================== */

  const [viewBox, setViewBox] = useState({
    x: 0,
    y: 0,
    width: 1200,
    height: 800,
  });

  const [isReady, setIsReady] = useState(false);

  // Center once based on layout
  const isCenteredRef = useRef(false);

  /* ===============================
   * Helper to get tree bounds
   * =============================== */
  const treeBounds = useMemo(() => {
    if (positions.size === 0) return null;

    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    // Pass 1: Find vertical bounds
    for (const p of positions.values()) {
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }

    // Pass 2: Calculate center of root nodes
    let rootSumX = 0;
    let rootCount = 0;

    for (const p of positions.values()) {
      if (Math.abs(p.y - minY) < 5) {
        rootSumX += p.x;
        rootCount++;
      }
    }

    if (rootCount === 0) return null;

    const rootCenterX = rootSumX / rootCount;

    // Pass 3: Calculate max symmetric distance
    let maxDistX = 0;
    const halfNode = NODE_WIDTH / 2;

    for (const p of positions.values()) {
      const distLeft = Math.abs(p.x - halfNode - rootCenterX);
      const distRight = Math.abs(p.x + halfNode - rootCenterX);
      const dist = distLeft > distRight ? distLeft : distRight;

      if (dist > maxDistX) maxDistX = dist;
    }

    // Calculate fit dimensions
    const width = maxDistX * 2 + NODE_WIDTH; // Extra padding
    const height = maxY - minY + NODE_HEIGHT * 3; // Extra vertical padding

    const vbX = rootCenterX - width / 2;
    const vbY = minY - NODE_HEIGHT;

    return { x: vbX, y: vbY, width, height };
  }, [positions]);

  const handleCenterView = useCallback(() => {
    if (!treeBounds) return;

    setViewBox(treeBounds);

    if (id) {
      savedViews.set(id, treeBounds);
    }
  }, [treeBounds, id]);

  const handleDownloadImage = useCallback(() => {
    if (svgRef.current) {
      const filename = tree?.name ? `${tree.name}-famtree.png` : 'famtree.png';

      saveSvgAsPng(svgRef.current, filename, {
        backgroundColor: 'rgba(249, 250, 251, 0.9)',
        ...(treeBounds && {
          left: treeBounds.x,
          top: treeBounds.y,
          width: treeBounds.width,
          height: treeBounds.height,
        }),
      });
    }
  }, [tree, treeBounds]);

  useLayoutEffect(() => {
    if (isCenteredRef.current || positions.size === 0 || !id) return;

    // Check if we have a saved view for this tree
    const saved = savedViews.get(id);

    if (saved) {
      setViewBox(saved);

      isCenteredRef.current = true;

      setIsReady(true);

      return;
    }

    handleCenterView();

    isCenteredRef.current = true;

    setIsReady(true);
  }, [positions, id]);

  // Persist view changes
  useEffect(() => {
    if (id && isCenteredRef.current) {
      savedViews.set(id, viewBox);
    }
  }, [viewBox, id]);

  /* ===============================
   * Drag logic for panning
   * =============================== */
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    setIsDragging(true);

    isDraggingRef.current = true;
    lastPointRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDraggingRef.current || !lastPointRef.current || !svgRef.current) {
      return;
    }

    const currentX = e.clientX;
    const currentY = e.clientY;

    if (rafRef.current !== null) return;

    rafRef.current = requestAnimationFrame(() => {
      if (!lastPointRef.current || !svgRef.current) {
        rafRef.current = null;

        return;
      }

      const dx = currentX - lastPointRef.current.x;
      const dy = currentY - lastPointRef.current.y;

      const rect = svgRef.current.getBoundingClientRect();

      // Update last point immediately
      lastPointRef.current = { x: currentX, y: currentY };

      setViewBox((prev) => {
        const scaleX = prev.width / rect.width;
        const scaleY = prev.height / rect.height;
        const uniformScale = Math.max(scaleX, scaleY);

        return {
          ...prev,
          x: prev.x - dx * uniformScale,
          y: prev.y - dy * uniformScale,
        };
      });

      rafRef.current = null;
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);

    isDraggingRef.current = false;
    lastPointRef.current = null;

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);

      rafRef.current = null;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);

    isDraggingRef.current = false;
    lastPointRef.current = null;

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);

      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    const svg = svgRef.current;

    if (!svg) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const scaleFactor = 1.1;
      const { width, height, x, y } = viewBox;
      const rect = svg.getBoundingClientRect();

      const mouseX = ((e.clientX - rect.left) / rect.width) * width + x;
      const mouseY = ((e.clientY - rect.top) / rect.height) * height + y;

      const zoomIn = e.deltaY < 0;
      const newWidth = zoomIn ? width / scaleFactor : width * scaleFactor;
      const newHeight = zoomIn ? height / scaleFactor : height * scaleFactor;

      const newX = mouseX - ((mouseX - x) * newWidth) / width;
      const newY = mouseY - ((mouseY - y) * newHeight) / height;

      setViewBox({
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      });
    };

    svg.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      svg.removeEventListener('wheel', handleWheel);
    };
  }, [viewBox]);

  return (
    <div
      ref={containerRef}
      className="w-full p-4 select-none relative"
      style={{
        height: 'calc(103vh - 160px)',
        opacity: isReady ? 1 : 0,
        transition: 'opacity 0.2s ease-in',
      }}
    >
      <ShareTreeModal />
      <div className="absolute top-8 right-8 z-10 flex gap-2">
        <Link
          to={routes.sharedTreeUsers}
          params={{ id: id ?? '' }}
          className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-gray-200 cursor-pointer flex items-center justify-center"
          title="Shared Users"
        >
          <TeamOutlined style={{ fontSize: '24px', color: '#595959' }} />
        </Link>
        <button
          type="button"
          onClick={() =>
            shareTreeModel.shareTrigger({ url: window.location.href })
          }
          className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-gray-200 cursor-pointer"
          title="Share Tree"
        >
          <ShareAltOutlined style={{ fontSize: '24px', color: '#595959' }} />
        </button>
        <button
          type="button"
          onClick={handleDownloadImage}
          className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-gray-200 cursor-pointer"
          title="Convert to Image"
        >
          <DownloadOutlined style={{ fontSize: '24px', color: '#595959' }} />
        </button>
        <button
          type="button"
          onClick={handleCenterView}
          className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-gray-200 cursor-pointer"
          title="Center Tree"
        >
          <img
            src="/family-tree-icon.png"
            alt="Center Tree"
            className="w-6 h-6 object-contain"
          />
        </button>
      </div>

      {/** biome-ignore lint/a11y/noSvgWithoutTitle: <There's no need for title> */}
      <svg
        width="100%"
        height="100%"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        style={{
          background: 'rgba(249, 250, 251, 0.9)',
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: token.borderRadiusLG,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        ref={svgRef}
      >
        {/* <title>Family Tree</title> */}
        {positions.size > 0 && (
          <>
            <g>
              <CoupleConnections couples={couples} positions={positions} />
            </g>
            <g>
              <ParentChildConnections
                couples={couples}
                positions={positions}
                metadata={metadata}
              />
            </g>
            <g>
              {members.map((m) => {
                const memberMetadata = metadata.get(m.id);
                // biome-ignore lint/style/noNonNullAssertion: <Checked by positions.size > 0>
                const position = positions.get(m.id)!;

                return (
                  <MemoizedFamilyTreeNode
                    key={m.id}
                    member={m}
                    position={position}
                    hasMarriage={!!memberMetadata?.spouseId}
                    hasParents={(memberMetadata?.parents.length ?? 0) > 0}
                    onPreviewClick={previewMemberModel.previewMemberTrigger}
                    onAddBoyClick={addMemberModel.addBoyTrigger}
                    onAddGirlClick={addMemberModel.addGirlTrigger}
                    onAddSpouseClick={addMemberModel.addSpouseTrigger}
                    onAddParentClick={addMemberModel.addParentsTrigger}
                    isOwner={isOwner}
                  />
                );
              })}
            </g>
          </>
        )}
      </svg>
    </div>
  );
};

//#region CoupleConnections
const CoupleConnections: React.FC<{
  couples: FamilyTreeMemberConnectionGetAllResponseType;
  positions: Map<string, Position>;
}> = memo(({ couples, positions }) => {
  const RECT_WIDTH = NODE_WIDTH / 2;

  return couples.map((couple) => {
    const p1 = positions.get(couple.fromMemberId);
    const p2 = positions.get(couple.toMemberId);

    if (!p1 || !p2) return null;

    const midY = (p1.y + p2.y) / 2;

    // Adjust line to stop at rect edges, not centers
    const x1 = p1.x + RECT_WIDTH / 2;
    const x2 = p2.x - RECT_WIDTH / 2;

    return (
      <line
        key={`spouse-${couple.fromMemberId}-${couple.toMemberId}`}
        x1={x1}
        y1={midY}
        x2={x2}
        y2={midY}
        stroke={CONNECTION.SPOUSE.color}
        strokeWidth={CONNECTION.SPOUSE.width}
      />
    );
  });
});
//#endregion

//#region ParentChildConnections
const ParentChildConnections: React.FC<{
  couples: FamilyTreeMemberConnectionGetAllResponseType;
  positions: Map<string, Position>;
  metadata: Map<string, MemberMetadata>;
}> = memo(({ positions, metadata }) => {
  const result: React.ReactNode[] = [];

  // Group children by parent using metadata
  const grouped = new Map<string, Set<string>>();

  metadata.forEach((memberData) => {
    if (memberData.children.length === 0) return;

    const origin = memberData.coupleCenterPosition ?? memberData.position;
    if (!origin) return;

    const key = `${origin.x},${origin.y}`;

    if (!grouped.has(key)) grouped.set(key, new Set());

    memberData.children.forEach((childId) => {
      grouped.get(key)?.add(childId);
    });
  });

  grouped.forEach((childSet, key) => {
    const childIds = Array.from(childSet);

    const [xStr, yStr] = key.split(',');
    const coupleX = parseFloat(xStr);
    const coupleY = parseFloat(yStr);

    const childPositions = childIds
      .map((id) => positions.get(id))
      .filter(Boolean) as { x: number; y: number }[];

    if (childPositions.length === 0) return;

    const topY = coupleY + 1.5;

    if (childPositions.length === 1) {
      const child = childPositions[0];
      const childId = childIds[0];
      const childTop = child.y;

      const childMetadata = metadata.get(childId);
      const childHasSpouse = !!childMetadata?.spouseId;

      if (childHasSpouse) {
        const intermediateY = childTop - NODE_HEIGHT / 2 - 8;

        result.push(
          <line
            key={`stem-vertical-${childId}-${coupleX}-${topY}`}
            x1={coupleX}
            y1={topY}
            x2={coupleX}
            y2={intermediateY}
            stroke={CONNECTION.PARENT_CHILD.color}
            strokeWidth={CONNECTION.PARENT_CHILD.width}
          />,
        );

        // Horizontal line from parent X to child X
        const x1Offset = child.x > coupleX ? 1 : -1;
        const x2Offset = child.x > coupleX ? -1 : 1;

        result.push(
          <line
            key={`stem-horizontal-${childId}-${coupleX}-${child.x}`}
            x1={coupleX + x2Offset}
            y1={intermediateY}
            x2={child.x + x1Offset}
            y2={intermediateY}
            stroke={CONNECTION.PARENT_CHILD.color}
            strokeWidth={CONNECTION.PARENT_CHILD.width}
          />,
        );

        // Vertical line from intermediate Y down to child
        result.push(
          <line
            key={`stem-child-${childId}-${child.x}-${intermediateY}`}
            x1={child.x}
            y1={intermediateY}
            x2={child.x}
            y2={childTop - 20}
            stroke={CONNECTION.PARENT_CHILD.color}
            strokeWidth={CONNECTION.PARENT_CHILD.width}
          />,
        );
      } else {
        // Straight line for single child without spouse
        result.push(
          <line
            key={`stem-${child.x}-${child.y}`}
            x1={coupleX}
            y1={topY}
            x2={coupleX}
            y2={childTop}
            stroke={CONNECTION.PARENT_CHILD.color}
            strokeWidth={CONNECTION.PARENT_CHILD.width}
          />,
        );
      }
    } else {
      const childTops = childPositions.map((c) => c.y - NODE_HEIGHT / 2);
      const branchY = Math.min(...childTops) - 8;
      const leftX = Math.min(...childPositions.map((c) => c.x)) - 1;
      const rightX = Math.max(...childPositions.map((c) => c.x)) + 1;

      // vertical stem
      result.push(
        <line
          key={`stem-${coupleX}-${topY}-${branchY}`}
          x1={coupleX}
          y1={topY}
          x2={coupleX}
          y2={branchY}
          stroke={CONNECTION.PARENT_CHILD.color}
          strokeWidth={CONNECTION.PARENT_CHILD.width}
        />,
      );

      // horizontal branch
      result.push(
        <line
          key={`branch-${leftX}-${branchY}-${rightX}`}
          x1={leftX}
          y1={branchY}
          x2={rightX}
          y2={branchY}
          stroke={CONNECTION.PARENT_CHILD.color}
          strokeWidth={CONNECTION.PARENT_CHILD.width}
        />,
      );

      // small vertical stems from each child to branch
      childPositions.forEach((c, i) => {
        result.push(
          <line
            key={`child-${c.x + i}-${c.y}-${branchY}`}
            x1={c.x}
            y1={branchY}
            x2={c.x}
            y2={c.y - 20}
            stroke={CONNECTION.PARENT_CHILD.color}
            strokeWidth={CONNECTION.PARENT_CHILD.width}
          />,
        );
      });
    }
  });

  return result;
});
//#endregion
