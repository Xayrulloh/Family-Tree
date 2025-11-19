import {
  type FamilyTreeMemberGetResponseType,
  UserGenderEnum,
} from '@family-tree/shared';
import type React from 'react';

type FamilyTreeNodeProps = {
  member: FamilyTreeMemberGetResponseType;
  position: { x: number; y: number };
  onMemberClick: (member: FamilyTreeMemberGetResponseType) => void;
};

const getGenderColor = (gender: string) => {
  if (gender === UserGenderEnum.MALE) return '#3b82f6';
  if (gender === UserGenderEnum.FEMALE) return '#ec4899';
  return '#9ca3af';
};

export const FamilyTreeNode: React.FC<FamilyTreeNodeProps> = ({
  member,
  position,
  onMemberClick,
}) => {
  const color = getGenderColor(member.gender);

  const nodeWidth = 80;
  const nodeHeight = 40;
  const nodeX = position.x - nodeWidth / 2;
  const nodeY = position.y - nodeHeight / 2;

  // Truncate name if too long for the rectangle
  const displayName =
    member.name.length > 12 ? member.name.split(' ')[0] : member.name;

  return (
    <g transform={`translate(${nodeX}, ${nodeY})`}>
      {/* Rectangle background with gender-colored border */}
      <rect
        width={nodeWidth}
        height={nodeHeight}
        rx="6"
        fill="white"
        stroke={color}
        strokeWidth="2"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
        }}
      />

      {/* Name centered in the rectangle */}
      <text
        x={nodeWidth / 2}
        y={nodeHeight / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="11"
        fontWeight="600"
        fill="#1f2937"
      >
        {displayName}
      </text>

      {/* Interactive overlay */}
      <rect
        width={nodeWidth}
        height={nodeHeight}
        rx="6"
        fill="transparent"
        style={{ cursor: 'pointer' }}
        onClick={() => onMemberClick(member)}
        onMouseEnter={(e) => {
          const rect = e.currentTarget;
          rect.style.fill = 'rgba(0,0,0,0.05)';
        }}
        onMouseLeave={(e) => {
          const rect = e.currentTarget;
          rect.style.fill = 'transparent';
        }}
      />
    </g>
  );
};
