import { Flex, Spin } from 'antd';
import { useUnit } from 'effector-react';
import type React from 'react';
import { useMemo } from 'react';
import { FamilyTreeNode } from '~/shared/ui/family-tree-node';
import {
  calculatePositions,
  getCouples,
  getChildrenOfCouple,
  transformConnectionsData,
} from '~/shared/lib/layout-engine';
import type { LazyPageProps } from '~/shared/lib/lazy-page';
import { factory } from '../model';
import type {
  FamilyTreeMemberConnectionGetAllResponseType,
  MemberSchemaType,
} from '@family-tree/shared';

type Model = ReturnType<typeof factory>;
type Props = LazyPageProps<Model>;

const TreeVisualization: React.FC<{
  members: MemberSchemaType[];
  connections: FamilyTreeMemberConnectionGetAllResponseType;
}> = ({ members, connections }) => {
  const positions = useMemo(
    () => calculatePositions(members, connections),
    [members, connections],
  );

  const renderCoupleConnections = () => {
    const transformedConnections = transformConnectionsData(connections);
    const couples = getCouples(transformedConnections);

    return couples.map((couple) => {
      const pos1 = positions.get(couple.partner1Id);
      const pos2 = positions.get(couple.partner2Id);

      if (!pos1 || !pos2) return null;

      return (
        <line
          key={`couple-${couple.partner1Id}-${couple.partner2Id}`}
          x1={pos1.x + 35}
          y1={pos1.y}
          x2={pos2.x - 35}
          y2={pos2.y}
          stroke="#10b981"
          strokeWidth="3"
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

    const connectionLines: any = [];

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

      // Vertical line down from couple
      const minChildY = Math.min(
        ...childrenIds
          .map((id) => positions.get(id)?.y ?? 0)
          .filter((y) => y !== 0),
      );
      const dropY = minChildY - 40;

      connectionLines.push(
        <line
          key={`vertical-${couple.partner1Id}-${couple.partner2Id}`}
          x1={midX}
          y1={pos1.y}
          x2={midX}
          y2={dropY}
          stroke="#9ca3af"
          strokeWidth="2"
        />,
      );

      // Horizontal line at top of children
      const childXPositions = childrenIds
        .map((id) => positions.get(id)?.x ?? 0)
        .filter((x) => x !== 0);
      const minChildX = Math.min(...childXPositions);
      const maxChildX = Math.max(...childXPositions);

      connectionLines.push(
        <line
          key={`horizontal-${couple.partner1Id}-${couple.partner2Id}`}
          x1={minChildX}
          y1={dropY}
          x2={maxChildX}
          y2={dropY}
          stroke="#9ca3af"
          strokeWidth="2"
        />,
      );

      // Vertical lines to each child
      childrenIds.forEach((childId) => {
        const childPos = positions.get(childId);

        if (!childPos) return;

        connectionLines.push(
          <line
            key={`child-${couple.partner1Id}-${couple.partner2Id}-${childId}`}
            x1={childPos.x}
            y1={dropY}
            x2={childPos.x}
            y2={childPos.y - 35}
            stroke="#9ca3af"
            strokeWidth="2"
          />,
        );
      });
    });

    return connectionLines;
  };

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1000 600"
      style={{
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
      }}
      aria-label="Family tree visualization"
    >
      <title>Family Tree</title>
      {renderCoupleConnections()}
      {renderGenerationalConnections()}
      {members.map((member) => {
        if (!member) return null;

        const pos = positions.get(member.id);

        if (!pos) return null;

        const year = member.dob
          ? new Date(member.dob).getFullYear().toString()
          : '';

        return (
          <FamilyTreeNode
            key={member.id}
            x={pos.x}
            y={pos.y}
            name={member.name}
            year={year}
            gender={member.gender}
          />
        );
      })}
    </svg>
  );
};

export const FamilyTreeView: React.FC<Props> = ({ model }) => {
  const [members, connections, loading] = useUnit([
    model.$members,
    model.$connections,
    model.$loading,
  ]);

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
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)',
      }}
    >
      {/* Legend */}
      <div
        style={{
          background: '#f3f4f6',
          padding: '12px 24px',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '24px',
            fontSize: '14px',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#bfdbfe',
                border: '2px solid #3b82f6',
                flexShrink: 0,
              }}
            ></div>
            <span style={{ color: '#374151', whiteSpace: 'nowrap' }}>Male</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#fbcfe8',
                border: '2px solid #ec4899',
                flexShrink: 0,
              }}
            ></div>
            <span style={{ color: '#374151', whiteSpace: 'nowrap' }}>
              Female
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              style={{
                color: '#374151',
                whiteSpace: 'nowrap',
                fontSize: '12px',
              }}
            >
              Spouse
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              style={{
                color: '#374151',
                whiteSpace: 'nowrap',
                fontSize: '12px',
              }}
            >
              Parent-Child
            </span>
          </div>
        </div>
      </div>

      {/* Tree Container - KEY FIX */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'auto',
          position: 'relative',
        }}
      >
        <TreeVisualization members={members} connections={connections} />
      </div>
    </div>
  );
};

export const component = FamilyTreeView;
export const createModel = factory;
