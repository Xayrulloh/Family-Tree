import {
  FamilyTreeMemberConnectionEnum,
  type FamilyTreeMemberConnectionGetAllResponseType,
  type FamilyTreeMemberConnectionSchemaType,
} from '@family-tree/shared';
import { theme } from 'antd';
import { useUnit } from 'effector-react';
import {
  memo,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { addMemberModel } from '~/features/tree-member/add';
import { previewMemberModel } from '~/features/tree-member/preview';
import {
  calculatePositions,
  getCouples,
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

export const Visualization: React.FC<Props> = ({ model }) => {
  const [connections, members] = useUnit([model.$connections, model.$members]);
  const { token } = theme.useToken();

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [containerWidth, setContainerWidth] = useState(1200);

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

  const positions = useMemo(
    () => calculatePositions(members, connections, containerWidth),
    [members, connections],
  );

  const couples = useMemo(() => getCouples(connections), [connections]);
  const marriageMap = useMemo(() => {
    const map = new Map<string, string>();

    couples.forEach(({ fromMemberId, toMemberId }) => {
      map.set(fromMemberId, toMemberId);
      map.set(toMemberId, fromMemberId);
    });

    return map;
  }, [couples]);
  const parentsSet = useMemo(() => {
    const set = new Set<string>();

    connections.forEach(({ toMemberId, type }) => {
      if (type === FamilyTreeMemberConnectionEnum.PARENT) {
        set.add(toMemberId);
      }
    });

    return set;
  }, [connections]);

  /* ===============================
   * Center tree in the viewport
   * =============================== */

  const [viewBox, setViewBox] = useState({
    x: 0,
    y: 0,
    width: 1200,
    height: 800,
  });

  // Center once based on layout
  useMemo(() => {
    if (positions.size === 0) return;

    const xs = Array.from(positions.values()).map((p) => p.x);
    const ys = Array.from(positions.values()).map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const width = maxX - minX + NODE_WIDTH * 2;
    const height = maxY - minY + NODE_HEIGHT * 2;
    const vbX = Math.max(0, minX - NODE_WIDTH);
    const vbY = Math.max(0, minY - NODE_HEIGHT);

    setViewBox({ x: vbX, y: vbY, width, height });
  }, [positions]);

  /* ===============================
   * Drag logic for panning
   * =============================== */
  const [isDragging, setIsDragging] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(
    null,
  );

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    setIsDragging(true);
    setLastPoint({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging || !lastPoint || !svgRef.current) return;

    const dx = e.clientX - lastPoint.x;
    const dy = e.clientY - lastPoint.y;

    // Calculate the ratio between viewBox coordinates and screen pixels
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = viewBox.width / rect.width;
    const scaleY = viewBox.height / rect.height;

    // Move opposite to drag direction, scaled by current zoom level
    // Y-axis has a 1.3x multiplier for slightly faster vertical movement
    setViewBox((prev) => ({
      ...prev,
      x: prev.x - dx * scaleX,
      y: prev.y - dy * scaleY * 1.18,
    }));

    setLastPoint({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setLastPoint(null);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setLastPoint(null);
  };

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault(); // Now works!

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
      className="w-full p-4 select-none"
      style={{ height: 'calc(103vh - 160px)' }}
    >
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
        <g>
          <CoupleConnections couples={couples} positions={positions} />
        </g>
        <g>
          <ParentChildConnections
            couples={couples}
            positions={positions}
            connections={connections}
          />
        </g>
        <g>
          {members.map((m) => (
            <MemoizedFamilyTreeNode
              key={m.id}
              member={m}
              // biome-ignore lint/style/noNonNullAssertion: <I hope it's always gets the position)>
              position={positions.get(m.id)!}
              hasMarriage={marriageMap.has(m.id)}
              isParent={
                !(
                  !parentsSet.has(m.id) &&
                  !parentsSet.has(marriageMap.get(m.id) || '')
                )
              }
              onPreviewClick={previewMemberModel.previewMemberTrigger}
              onAddBoyClick={addMemberModel.addBoyTrigger}
              onAddGirlClick={addMemberModel.addGirlTrigger}
              onAddSpouseClick={addMemberModel.addSpouseTrigger}
              onAddParentClick={addMemberModel.addParentsTrigger}
            />
          ))}
        </g>
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
  connections: FamilyTreeMemberConnectionSchemaType[];
}> = memo(({ couples, positions, connections }) => {
  const result: React.ReactNode[] = [];

  // Map couple centers to children
  const coupleCenters = new Map<string, { x: number; y: number }>();

  couples.forEach((couple) => {
    const p1 = positions.get(couple.fromMemberId);
    const p2 = positions.get(couple.toMemberId);

    if (!p1 || !p2) return;

    coupleCenters.set(couple.fromMemberId, {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    });

    coupleCenters.set(couple.toMemberId, {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    });
  });

  // Group children by couple
  const grouped = new Map<string, Set<string>>();

  connections.forEach((conn) => {
    if (conn.type !== FamilyTreeMemberConnectionEnum.PARENT) return;

    const origin =
      coupleCenters.get(conn.fromMemberId) ?? positions.get(conn.fromMemberId);

    if (!origin) return;

    const key = `${origin.x},${origin.y}`;

    if (!grouped.has(key)) grouped.set(key, new Set());

    grouped.get(key)?.add(conn.toMemberId);
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

      const childHasSpouse = couples.some(
        (couple) =>
          couple.fromMemberId === childId || couple.toMemberId === childId,
      );

      if (childHasSpouse) {
        const intermediateY = childTop - NODE_HEIGHT / 2 - 8;

        result.push(
          <line
            key={`stem-vertical-${coupleX}-${topY}`}
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
            key={`stem-horizontal-${coupleX}-${child.x}`}
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
            key={`stem-child-${child.x}-${intermediateY}`}
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
