import {
  type FamilyTreeMemberGetResponseType,
  UserGenderEnum,
} from '@family-tree/shared';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

type FamilyTreeNodeProps = {
  member: FamilyTreeMemberGetResponseType;
  position: { x: number; y: number };
  hasMarriage: boolean;
  onPreviewClick: (member: FamilyTreeMemberGetResponseType) => void;
  onAddBoyClick: (member: FamilyTreeMemberGetResponseType) => void;
  onAddGirlClick: (member: FamilyTreeMemberGetResponseType) => void;
};

const getGenderColor = (gender: string) => {
  if (gender === UserGenderEnum.MALE) return '#3b82f6';
  if (gender === UserGenderEnum.FEMALE) return '#ec4899';
  return '#9ca3af';
};

export const FamilyTreeNode: React.FC<FamilyTreeNodeProps> = ({
  member,
  position,
  hasMarriage,
  onPreviewClick,
  onAddBoyClick,
  onAddGirlClick,
}) => {
  const [hover, setHover] = useState(false);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);

  // clear timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, []);

  const color = getGenderColor(member.gender);

  const nodeWidth = 80;
  const nodeHeight = 40;
  const nodeX = position.x - nodeWidth / 2;
  const nodeY = position.y - nodeHeight / 2;

  // Truncate name if too long for the rectangle
  const displayName =
    member.name.length > 12 ? member.name.split(' ')[0] : member.name;

  return (
    <g
      onMouseEnter={() => {
        if (hideTimeout.current) clearTimeout(hideTimeout.current);
        setHover(true);
      }}
      onMouseLeave={() => {
        hideTimeout.current = setTimeout(() => {
          setHover(false);
        }, 200);
      }}
      transform={`translate(${nodeX}, ${nodeY})`}
    >
      {/* Node rectangle */}
      <rect
        width={nodeWidth}
        height={nodeHeight}
        rx="6"
        fill="white"
        stroke={color}
        strokeWidth="2"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
      />

      {/* Node name */}
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

      {/* Click overlay */}
      <rect
        width={nodeWidth}
        height={nodeHeight}
        rx="6"
        fill="transparent"
        style={{ cursor: 'pointer' }}
        onClick={() => onPreviewClick(member)}
      />

      {/* ================================
          HOVER CHILDREN BUTTONS
         ================================ */}
      {hover && hasMarriage && member.gender === UserGenderEnum.FEMALE && (
        <g>
          {/* Left blue button */}
          <rect
            x={nodeWidth / 2 - 26}
            y={nodeHeight + 6}
            width={20}
            height={20}
            rx={4}
            fill="#3b82f6"
            stroke="#1e40af"
            strokeWidth="1.5"
            style={{ cursor: 'pointer' }}
            onClick={() => onAddBoyClick(member)}
          />

          {/* Right pink button */}
          <rect
            x={nodeWidth / 2 + 6}
            y={nodeHeight + 6}
            width={20}
            height={20}
            rx={4}
            fill="#ec4899"
            stroke="#be185d"
            strokeWidth="1.5"
            style={{ cursor: 'pointer' }}
            onClick={() => onAddGirlClick(member)}
          />
        </g>
      )}
    </g>
  );
};
