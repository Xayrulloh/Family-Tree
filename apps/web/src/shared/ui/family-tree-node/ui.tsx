import type { UserGenderEnum } from '@family-tree/shared';
import type React from 'react';

type FamilyTreeNodeProps = {
  x: number;
  y: number;
  name: string;
  year?: string;
  gender: UserGenderEnum.MALE | UserGenderEnum.FEMALE;
};

const getGenderColor = (gender: string) => {
  if (gender === 'MALE') return '#3b82f6';
  if (gender === 'FEMALE') return '#ec4899';

  return '#9ca3af';
};

export const FamilyTreeNode: React.FC<FamilyTreeNodeProps> = ({
  x,
  y,
  name,
  year,
  gender,
}) => {
  const color = getGenderColor(gender);

  return (
    <g>
      {/* Node circle */}
      <circle
        cx={x}
        cy={y}
        r="35"
        fill={color}
        opacity="0.15"
        stroke={color}
        strokeWidth="2.5"
      />

      {/* Name */}
      <text
        x={x}
        y={y - 4}
        textAnchor="middle"
        fontSize="14"
        fontWeight="bold"
        fill="#1f2937"
      >
        {name.split(' ')[0]}
      </text>

      {/* Birth year */}
      {year && (
        <text x={x} y={y + 10} textAnchor="middle" fontSize="12" fill="#6b7280">
          {year}
        </text>
      )}
    </g>
  );
};
