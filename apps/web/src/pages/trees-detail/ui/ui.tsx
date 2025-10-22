import { Flex, Spin, Card, Space, theme } from 'antd';
import { useUnit } from 'effector-react';
import type React from 'react';
import { type JSX, useMemo, useState, useCallback } from 'react';
import { FamilyTreeNode } from '~/shared/ui/family-tree-node';
import type { LazyPageProps } from '~/shared/lib/lazy-page';
import { factory } from '../model';
import type {
  FamilyTreeMemberConnectionGetAllResponseType,
  MemberSchemaType,
} from '@family-tree/shared';
import { MemberDetailDrawer } from '~/shared/ui/member-detail-wrapper';
import {
  calculatePositions,
  getChildrenOfCouple,
  getCouples,
  Position,
  transformConnectionsData,
} from '~/shared/lib/d3-layout-engine';

type Model = ReturnType<typeof factory>;
type Props = LazyPageProps<Model>;

// Constants
const CONNECTION = {
  SPOUSE: {
    color: '#10b981',
    width: 3,
    minDistance: 40,
  },
  PARENT_CHILD: {
    color: '#9ca3af',
    width: 2,
  },
} as const;

const LEGEND_ITEMS = [
  {
    type: 'male' as const,
    label: 'Male',
    color: '#3b82f6',
    backgroundColor: '#bfdbfe',
  },
  {
    type: 'female' as const,
    label: 'Female',
    color: '#ec4899',
    backgroundColor: '#fbcfe8',
  },
  {
    type: 'spouse' as const,
    label: 'Spouse',
    color: CONNECTION.SPOUSE.color,
    width: CONNECTION.SPOUSE.width,
  },
  {
    type: 'parent-child' as const,
    label: 'Parent-Child',
    color: CONNECTION.PARENT_CHILD.color,
    width: CONNECTION.PARENT_CHILD.width,
  },
] as const;

// Memoized connection data transformation
const useTransformedConnections = (
  connections: FamilyTreeMemberConnectionGetAllResponseType,
) => {
  return useMemo(() => transformConnectionsData(connections), [connections]);
};

// Memoized couples calculation
const useCouples = (
  connections: FamilyTreeMemberConnectionGetAllResponseType,
) => {
  const transformedConnections = useTransformedConnections(connections);
  return useMemo(
    () => getCouples(transformedConnections),
    [transformedConnections],
  );
};

const TreeVisualization: React.FC<{
  members: MemberSchemaType[];
  connections: FamilyTreeMemberConnectionGetAllResponseType;
  onMemberClick: (member: MemberSchemaType) => void;
}> = ({ members, connections, onMemberClick }) => {
  const { token } = theme.useToken();
  const positions = useMemo(
    () => calculatePositions(members, connections),
    [members, connections],
  );
  const couples = useCouples(connections);

  const renderCoupleConnections = useCallback(() => {
    return couples.map((couple) => {
      const pos1 = positions.get(couple.partner1Id);
      const pos2 = positions.get(couple.partner2Id);

      if (!pos1 || !pos2) return null;

      const distance = Math.abs(pos2.x - pos1.x);
      if (distance < CONNECTION.SPOUSE.minDistance) return null;

      return (
        <line
          key={`couple-${couple.partner1Id}-${couple.partner2Id}`}
          x1={pos1.x}
          y1={pos1.y}
          x2={pos2.x}
          y2={pos2.y}
          stroke={CONNECTION.SPOUSE.color}
          strokeWidth={CONNECTION.SPOUSE.width}
          className="transition-all duration-200"
        />
      );
    });
  }, [couples, positions]);

  const renderGenerationalConnections = useCallback(() => {
    const connectionLines: JSX.Element[] = [];

    couples.forEach((couple) => {
      const pos1 = positions.get(couple.partner1Id);
      const pos2 = positions.get(couple.partner2Id);

      if (!pos1 || !pos2) return;

      const midX = (pos1.x + pos2.x) / 2;
      const childrenIds = getChildrenOfCouple(couple, connections);

      if (childrenIds.length === 0) return;

      const childPositions = childrenIds
        .map((id) => positions.get(id))
        .filter(Boolean) as Position[];

      if (childPositions.length === 0) return;

      const minChildX = Math.min(...childPositions.map((p) => p.x));
      const maxChildX = Math.max(...childPositions.map((p) => p.x));
      const minChildY = Math.min(...childPositions.map((p) => p.y));

      const horizontalLineLength = Math.max(maxChildX - minChildX, 80);
      const horizontalStartX = midX - horizontalLineLength / 2;
      const horizontalEndX = midX + horizontalLineLength / 2;
      const dropY = minChildY - 30;

      // Vertical line from parents to horizontal line
      connectionLines.push(
        <line
          key={`vertical-${couple.partner1Id}-${couple.partner2Id}`}
          x1={midX}
          y1={Math.max(pos1.y, pos2.y)}
          x2={midX}
          y2={dropY}
          stroke={CONNECTION.PARENT_CHILD.color}
          strokeWidth={CONNECTION.PARENT_CHILD.width}
          className="transition-all duration-200"
        />,
      );

      // Horizontal line
      connectionLines.push(
        <line
          key={`horizontal-${couple.partner1Id}-${couple.partner2Id}`}
          x1={horizontalStartX}
          y1={dropY}
          x2={horizontalEndX}
          y2={dropY}
          stroke={CONNECTION.PARENT_CHILD.color}
          strokeWidth={CONNECTION.PARENT_CHILD.width}
          className="transition-all duration-200"
        />,
      );

      // Vertical lines to children
      childPositions.forEach((childPos) => {
        connectionLines.push(
          <line
            key={`child-${couple.partner1Id}-${childPos.x}-${childPos.y}`}
            x1={childPos.x}
            y1={dropY}
            x2={childPos.x}
            y2={childPos.y}
            stroke={CONNECTION.PARENT_CHILD.color}
            strokeWidth={CONNECTION.PARENT_CHILD.width}
            className="transition-all duration-200"
          />,
        );
      });
    });

    return connectionLines;
  }, [couples, positions, connections]);

  const renderMemberNodes = useCallback(() => {
    return members.map((member) => {
      if (!member) return null;

      const pos = positions.get(member.id);
      if (!pos) return null;

      return (
        <FamilyTreeNode
          key={member.id}
          member={member}
          position={pos}
          onMemberClick={onMemberClick}
        />
      );
    });
  }, [members, positions, onMemberClick]);

  return (
    <div className="w-full h-full p-4">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 600"
        style={{
          background: 'rgba(249, 250, 251, 0.9)',
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: token.borderRadiusLG,
        }}
        aria-label="Family tree visualization"
      >
        <title>Family Tree</title>
        <g className="connection-lines">
          {renderCoupleConnections()}
          {renderGenerationalConnections()}
        </g>
        <g className="family-members">{renderMemberNodes()}</g>
      </svg>
    </div>
  );
};

const Legend: React.FC = () => {
  const renderLegendIcon = (item: (typeof LEGEND_ITEMS)[number]) => {
    switch (item.type) {
      case 'male':
      case 'female':
        return (
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: item.backgroundColor,
              border: `2px solid ${item.color}`,
              flexShrink: 0,
            }}
          />
        );
      case 'spouse':
      case 'parent-child':
        return (
          <svg width="20" height="3" style={{ flexShrink: 0 }}>
            <title>{item.label} connection line</title>
            <line
              x1="0"
              y1="1.5"
              x2="20"
              y2="1.5"
              stroke={item.color}
              strokeWidth={item.width}
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <Card
      size="small"
      className="border-0 border-b rounded-none shadow-none"
      styles={{
        body: {
          padding: '12px 24px',
          backgroundColor: 'rgba(243, 244, 246, 0.8)',
        },
      }}
    >
      <Space size="large" wrap>
        {LEGEND_ITEMS.map((item) => (
          <Space key={item.type} size="small">
            {renderLegendIcon(item)}
            <span
              style={{
                color: '#374151',
                whiteSpace: 'nowrap',
                fontSize:
                  item.type === 'spouse' || item.type === 'parent-child'
                    ? 12
                    : undefined,
              }}
            >
              {item.label}
            </span>
          </Space>
        ))}
      </Space>
    </Card>
  );
};

const LoadingState: React.FC = () => (
  <Flex justify="center" align="center" style={{ padding: '64px 0' }}>
    <Spin size="large">
      <div style={{ padding: 24 }} />
    </Spin>
  </Flex>
);

export const FamilyTreeView: React.FC<Props> = ({ model }) => {
  const [members, connections, loading] = useUnit([
    model.$members,
    model.$connections,
    model.$loading,
  ]);

  const [selectedMember, setSelectedMember] = useState<MemberSchemaType | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleMemberClick = useCallback((member: MemberSchemaType) => {
    setSelectedMember(member);
    setDrawerOpen(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <>
      <div className="w-full h-screen flex flex-col">
        <Legend />
        <div className="flex-1 overflow-auto relative bg-gradient-to-br from-blue-50 to-indigo-100">
          <TreeVisualization
            members={members}
            connections={connections}
            onMemberClick={handleMemberClick}
          />
        </div>
      </div>

      <MemberDetailDrawer
        member={selectedMember}
        open={drawerOpen}
        onClose={handleDrawerClose}
      />
    </>
  );
};

export const component = FamilyTreeView;
export const createModel = factory;
