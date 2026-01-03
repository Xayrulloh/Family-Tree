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
  hasParents: boolean;
  onPreviewClick: (member: FamilyTreeMemberGetResponseType) => void;
  onAddBoyClick: (member: FamilyTreeMemberGetResponseType) => void;
  onAddGirlClick: (member: FamilyTreeMemberGetResponseType) => void;
  onAddSpouseClick: (member: FamilyTreeMemberGetResponseType) => void;
  onAddParentClick: (member: FamilyTreeMemberGetResponseType) => void;
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
  hasParents,
  onPreviewClick,
  onAddBoyClick,
  onAddGirlClick,
  onAddSpouseClick,
  onAddParentClick,
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
      {/* ================================
          HOVER: SPOUSE BUTTON (only if no marriage)
        ================================ */}
      {hover && !hasMarriage && (
        <rect
          x={nodeWidth + 6} // right side of node
          y={nodeHeight / 2 - 10} // vertically centered
          width={20}
          height={20}
          rx={4}
          fill={member.gender === UserGenderEnum.FEMALE ? '#3b82f6' : '#ec4899'}
          stroke={
            member.gender === UserGenderEnum.FEMALE ? '#1e40af' : '#be185d'
          }
          strokeWidth="1.5"
          style={{ cursor: 'pointer' }}
          onClick={() => onAddSpouseClick(member)}
        />
      )}
      {/* ================================
          HOVER: PARENT BUTTON (if allowed)
        ================================ */}
      {/* ================================
      HOVER: PARENT BUTTON (rounded split)
   ================================ */}
      {hover && !hasParents && (
        <g
          style={{ cursor: 'pointer' }}
          onClick={() => onAddParentClick(member)}
        >
          {/* Rounded outer shape */}
          <rect
            x={nodeWidth / 2 - 10}
            y={-26}
            width={20}
            height={20}
            rx={4}
            fill="#ffffff"
          />

          {/* Clip inner content so rounded edges apply */}
          <clipPath id={`parentClip-${member.id}`}>
            <rect
              x={nodeWidth / 2 - 10}
              y={-26}
              width={20}
              height={20}
              rx={4}
            />
          </clipPath>

          {/* Left (blue) */}
          <rect
            clipPath={`url(#parentClip-${member.id})`}
            x={nodeWidth / 2 - 10}
            y={-26}
            width={10}
            height={20}
            fill="#3b82f6"
          />

          {/* Right (pink) */}
          <rect
            clipPath={`url(#parentClip-${member.id})`}
            x={nodeWidth / 2}
            y={-26}
            width={10}
            height={20}
            fill="#ec4899"
          />

          {/* Border around full button */}
          <rect
            x={nodeWidth / 2 - 10}
            y={-26}
            width={20}
            height={20}
            rx={4}
            fill="transparent"
            stroke="#374151"
            strokeWidth="1.5"
          />
        </g>
      )}
    </g>
  );
};
