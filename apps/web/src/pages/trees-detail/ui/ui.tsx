import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Flex, Spin } from 'antd';
import { useUnit } from 'effector-react';
import type React from 'react';
import { useMemo } from 'react';
import { FamilyTreeNode } from '~/shared/ui/family-tree-node';
import {
  calculatePositions,
  getCouples,
  getChildrenOfCouple,
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
    const couples = getCouples(
      connections.map((c) => ({
        fromMemberId: c.fromMemberId,
        toMemberId: c.toMemberId,
        type: c.type.toLowerCase(),
      })),
    );

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
        type: c.type.toLowerCase(),
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
          type: c.type.toLowerCase(),
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
      viewBox="0 0 850 600"
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
        const pos = positions.get(member.id);
        if (!pos) return null;

        return (
          <FamilyTreeNode
            key={member.id}
            x={pos.x}
            y={pos.y}
            name={member.name}
            year={
              member.dob
                ? new Date(member.dob).getFullYear().toString()
                : undefined
            }
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

  // const navigate = useNavigate();

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
    <div className="w-full h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white flex items-center gap-4">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          // onClick={() => navigate({ route: 'familyTreesPage' })}
          className="!text-white hover:!text-blue-100"
        />
        <div>
          <h1 className="text-3xl font-bold">Family Tree</h1>
          <p className="text-blue-100 text-sm mt-1">
            {members.length} members • {connections.length} connections
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 px-6 py-3 flex gap-8 text-sm border-b border-gray-200 items-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-300 border-2 border-blue-500"></div>
          <span className="text-gray-700">Male</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-pink-300 border-2 border-pink-500"></div>
          <span className="text-gray-700">Female</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="20" height="3" className="mr-1">
            <title>Spouse</title>
            <line
              x1="0"
              y1="1.5"
              x2="20"
              y2="1.5"
              stroke="#10b981"
              strokeWidth="3"
            />
          </svg>
          <span className="text-gray-700 text-xs">Spouse</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="20" height="3" className="mr-1">
            <title>Parent-Child</title>
            <line
              x1="0"
              y1="1.5"
              x2="20"
              y2="1.5"
              stroke="#9ca3af"
              strokeWidth="2"
            />
          </svg>
          <span className="text-gray-700 text-xs">Parent-Child</span>
        </div>
      </div>

      {/* Tree Container */}
      <div className="flex-1 overflow-auto">
        <TreeVisualization members={members} connections={connections} />
      </div>
    </div>
  );
};

export const component = FamilyTreeView;
export const createModel = factory;
