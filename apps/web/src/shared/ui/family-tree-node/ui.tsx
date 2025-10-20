import { type MemberSchemaType, UserGenderEnum } from '@family-tree/shared';
import type React from 'react';

type FamilyTreeNodeProps = {
  member: MemberSchemaType;
  position: { x: number; y: number };
};

const getGenderColor = (gender: string) => {
  if (gender === UserGenderEnum.MALE) return '#3b82f6';
  if (gender === UserGenderEnum.FEMALE) return '#ec4899';
  return '#9ca3af';
};

const calculateAgeAndStatus = (member: MemberSchemaType) => {
  const { dob, dod } = member;

  if (!dob) return { status: 'unknown', years: '' };

  const birthDate = new Date(dob);
  const deathDate = dod ? new Date(dod) : null;

  if (deathDate) {
    return {
      status: 'deceased',
      years: `${birthDate.getFullYear()} - ${deathDate.getFullYear()}`,
    };
  } else {
    return {
      status: 'alive',
      years: `${birthDate.getFullYear()} - Present`,
    };
  }
};

export const FamilyTreeNode: React.FC<FamilyTreeNodeProps> = ({
  member,
  position,
}) => {
  const color = getGenderColor(member.gender);
  const { status, years } = calculateAgeAndStatus(member);
  const displayName =
    member.name.length > 15 ? member.name.split(' ')[0] : member.name;

  // Dynamic card dimensions based on image existence
  const hasImage = !!member.image;
  const cardWidth = 100;
  const imageSectionHeight = hasImage ? 35 : 0;
  const contentSectionHeight = 55;
  const cardHeight = imageSectionHeight + contentSectionHeight;

  const cardX = position.x - cardWidth / 2;
  const cardY = position.y - cardHeight / 2;

  const statusConfig = {
    alive: { color: '#10b981', label: 'Alive' },
    deceased: { color: '#6b7280', label: 'Deceased' },
    unknown: { color: '#9ca3af', label: 'Unknown' },
  };

  const currentStatus = statusConfig[status as keyof typeof statusConfig];

  return (
    <g transform={`translate(${cardX}, ${cardY})`}>
      {/* Card background with gender-colored border */}
      <rect
        width={cardWidth}
        height={cardHeight}
        rx="12"
        fill="white"
        stroke={color}
        strokeWidth="2"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
        }}
      />

      {/* Image section - only if image exists */}
      {!!member.image && (
        <image
          href={member.image}
          x={cardWidth / 2 - 18} // Slightly smaller image
          y={10}
          width={36}
          height={36}
          style={{
            clipPath: 'circle(18px at center)',
          }}
        />
      )}

      {/* Content section - position dynamically based on image existence */}
      <g transform={`translate(0, ${imageSectionHeight})`}>
        {/* Member name */}
        <text
          x={cardWidth / 2}
          y={20}
          textAnchor="middle"
          fontSize="12"
          fontWeight="600"
          fill="#1f2937"
          className="font-sans"
        >
          {displayName}
        </text>

        {/* Years lived */}
        <text
          x={cardWidth / 2}
          y={35}
          textAnchor="middle"
          fontSize="10"
          fill="#6b7280"
          className="font-sans"
        >
          {years || 'Date unknown'}
        </text>

        {/* Status label */}
        <text
          x={cardWidth / 2}
          y={50}
          textAnchor="middle"
          fontSize="9"
          fill={currentStatus.color}
          fontWeight="500"
          className="font-sans"
        >
          {currentStatus.label}
        </text>
      </g>

      {/* Interactive overlay */}
      <rect
        width={cardWidth}
        height={cardHeight}
        rx="12"
        fill="transparent"
        className="cursor-pointer"
        onMouseEnter={(e) => {
          const rect = e.currentTarget;
          rect.style.fill = 'rgba(0,0,0,0.03)';
        }}
        onMouseLeave={(e) => {
          const rect = e.currentTarget;
          rect.style.fill = 'transparent';
        }}
      />
    </g>
  );
};
