import { Flex, Spin, Card, Space, theme } from 'antd';
import { useUnit } from 'effector-react';
import type React from 'react';
import { type JSX, useMemo, useState } from 'react';
import { FamilyTreeNode } from '~/shared/ui/family-tree-node';
import {
  calculatePositions,
  getCouples,
  getChildrenOfCouple,
  transformConnectionsData,
  type Position,
} from '~/shared/lib/layout-engine';
import type { LazyPageProps } from '~/shared/lib/lazy-page';
import { factory } from '../model';
import type {
  FamilyTreeMemberConnectionGetAllResponseType,
  MemberSchemaType,
} from '@family-tree/shared';
import { MemberDetailDrawer } from '~/shared/ui/member-detail-wrapper';

type Model = ReturnType<typeof factory>;
type Props = LazyPageProps<Model>;

const TreeVisualization: React.FC<{
  members: MemberSchemaType[];
  connections: FamilyTreeMemberConnectionGetAllResponseType;
  onMemberClick: (member: MemberSchemaType) => void;
}> = ({ members, connections, onMemberClick }) => {
  const positions = useMemo(
    () => calculatePositions(members, connections),
    [members, connections],
  );
  const { token } = theme.useToken();

  const renderCoupleConnections = () => {
    const transformedConnections = transformConnectionsData(connections);
    const couples = getCouples(transformedConnections);

    return couples.map((couple) => {
      const pos1 = positions.get(couple.partner1Id);
      const pos2 = positions.get(couple.partner2Id);

      if (!pos1 || !pos2) return null;

      // Calculate the actual distance between spouses
      const distance = Math.abs(pos2.x - pos1.x);

      // Only draw line if there's reasonable space (at least 40px)
      if (distance < 40) return null;

      // Draw line with small offsets from the node centers
      const offset = Math.min(35, distance / 2 - 5);

      return (
        <line
          key={`couple-${couple.partner1Id}-${couple.partner2Id}`}
          x1={pos1.x + offset}
          y1={pos1.y}
          x2={pos2.x - offset}
          y2={pos2.y}
          stroke="#10b981"
          strokeWidth="3"
          className="transition-all duration-200"
        />
      );
    });
  };

  const renderGenerationalConnections = () => {
    const couples = getCouples(
      connections.map((c) => ({
        fromMemberId: c.fromMemberId,
        toMemberId: c.toMemberId,
        type: c.type,
      })),
    );

    const connectionLines: JSX.Element[] = [];

    couples.forEach((couple) => {
      const pos1 = positions.get(couple.partner1Id);
      const pos2 = positions.get(couple.partner2Id);

      if (!pos1 || !pos2) return;

      const midX = (pos1.x + pos2.x) / 2;
      const childrenIds = getChildrenOfCouple(
        couple,
        connections.map((c) => ({
          fromMemberId: c.fromMemberId,
          toMemberId: c.toMemberId,
          type: c.type,
        })),
      );

      if (childrenIds.length === 0) return;

      // Get all children positions
      const childPositions = childrenIds
        .map((id) => positions.get(id))
        .filter(Boolean) as Position[];

      if (childPositions.length === 0) return;

      // Find the bounding box of children
      const minChildX = Math.min(...childPositions.map((p) => p.x));
      const maxChildX = Math.max(...childPositions.map((p) => p.x));
      const minChildY = Math.min(...childPositions.map((p) => p.y));

      // Calculate the horizontal line to be centered under parent
      const childrenCenterX = (minChildX + maxChildX) / 2;
      const horizontalLineLength = Math.max(maxChildX - minChildX, 80); // Minimum length

      // Start the horizontal line from the center and extend equally left and right
      const horizontalStartX = midX - horizontalLineLength / 2;
      const horizontalEndX = midX + horizontalLineLength / 2;
      const dropY = minChildY - 30; // Vertical position for horizontal line

      // 1. Vertical line down from parent couple to horizontal line
      connectionLines.push(
        <line
          key={`vertical-${couple.partner1Id}-${couple.partner2Id}`}
          x1={midX}
          y1={Math.max(pos1.y, pos2.y) + 20} // Start from bottom of parents
          x2={midX}
          y2={dropY}
          stroke="#9ca3af"
          strokeWidth="2"
          className="transition-all duration-200"
        />,
      );

      // 2. Horizontal line centered under parent
      connectionLines.push(
        <line
          key={`horizontal-${couple.partner1Id}-${couple.partner2Id}`}
          x1={horizontalStartX}
          y1={dropY}
          x2={horizontalEndX}
          y2={dropY}
          stroke="#9ca3af"
          strokeWidth="2"
          className="transition-all duration-200"
        />,
      );

      // 3. Vertical lines from horizontal line to each child
      childPositions.forEach((childPos) => {
        connectionLines.push(
          <line
            key={`child-${couple.partner1Id}-${couple.partner2Id}-${childPos.x}`}
            x1={childPos.x}
            y1={dropY}
            x2={childPos.x}
            y2={childPos.y - 20} // Connect to top of child node
            stroke="#9ca3af"
            strokeWidth="2"
            className="transition-all duration-200"
          />,
        );
      });
    });

    return connectionLines;
  };

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

        <g className="family-members">
          {members.map((member) => {
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
          })}
        </g>
      </svg>
    </div>
  );
};

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

  const handleMemberClick = (member: MemberSchemaType) => {
    setSelectedMember(member);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ padding: '64px 0' }}>
        <Spin size="large">
          <div style={{ padding: 24 }} />
        </Spin>
      </Flex>
    );
  }

  return (
    <>
      <div className="w-full h-screen flex flex-col">
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
            <Space size="small">
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: '#bfdbfe',
                  border: '2px solid #3b82f6',
                  flexShrink: 0,
                }}
              />
              <span style={{ color: '#374151', whiteSpace: 'nowrap' }}>
                Male
              </span>
            </Space>

            <Space size="small">
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: '#fbcfe8',
                  border: '2px solid #ec4899',
                  flexShrink: 0,
                }}
              />
              <span style={{ color: '#374151', whiteSpace: 'nowrap' }}>
                Female
              </span>
            </Space>

            <Space size="small">
              <svg width="20" height="3" style={{ flexShrink: 0 }}>
                <title>Spouse connection line</title>
                <line
                  x1="0"
                  y1="1.5"
                  x2="20"
                  y2="1.5"
                  stroke="#10b981"
                  strokeWidth="3"
                />
              </svg>
              <span
                style={{ color: '#374151', whiteSpace: 'nowrap', fontSize: 12 }}
              >
                Spouse
              </span>
            </Space>

            <Space size="small">
              <svg width="20" height="3" style={{ flexShrink: 0 }}>
                <title>Parent-child connection line</title>
                <line
                  x1="0"
                  y1="1.5"
                  x2="20"
                  y2="1.5"
                  stroke="#9ca3af"
                  strokeWidth="2"
                />
              </svg>
              <span
                style={{ color: '#374151', whiteSpace: 'nowrap', fontSize: 12 }}
              >
                Parent-Child
              </span>
            </Space>
          </Space>
        </Card>

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
