import { UserGenderEnum } from '@family-tree/shared';
import { DICEBEAR_URL } from '~/utils/constants';

const BEARDS = [
  'variant01',
  'variant02',
  'variant03',
  'variant04',
  'variant05',
  'variant06',
  'variant07',
  'variant08',
  'variant09',
  'variant10',
  'variant11',
  'variant12',
];

const BROWS = BEARDS.slice(0, 13);

const GLASSES = BEARDS.slice(0, 11);

const MALE_HAIRS = [
  'hat',
  'variant01',
  'variant05',
  'variant06',
  'variant07',
  'variant12',
  'variant13',
  'variant15',
  'variant16',
  'variant18',
  'variant19',
  'variant20',
  'variant21',
  'variant22',
  'variant24',
  'variant25',
  'variant26',
  'variant27',
  'variant31',
  'variant32',
  'variant33',
  'variant34',
  'variant35',
  'variant38',
  'variant40',
  'variant44',
  'variant49',
  'variant54',
  'variant55',
  'variant56',
  'variant60',
  'variant61',
];

const FEMALE_HAIRS = [
  'variant02',
  'variant04',
  'variant08',
  'variant09',
  'variant10',
  'variant11',
  'variant23',
  'variant28',
  'variant29',
  'variant30',
  'variant36',
  'variant37',
  'variant39',
  'variant41',
  'variant45',
  'variant46',
  'variant47',
  'variant48',
  'variant57',
  'variant59',
  'variant62',
  'variant63',
];

const LIPS = [
  'variant01',
  'variant02',
  'variant03',
  'variant04',
  'variant05',
  'variant06',
  'variant07',
  'variant08',
  'variant09',
  'variant10',
  'variant11',
  'variant12',
  'variant13',
  'variant14',
  'variant15',
  'variant16',
  'variant17',
  'variant18',
  'variant19',
  'variant20',
  'variant21',
  'variant22',
  'variant23',
  'variant24',
  'variant25',
  'variant26',
  'variant27',
  'variant28',
  'variant29',
  'variant30',
];

const NOSES = [
  'variant01',
  'variant02',
  'variant03',
  'variant04',
  'variant05',
  'variant06',
  'variant07',
  'variant08',
  'variant09',
  'variant10',
  'variant11',
  'variant12',
  'variant13',
  'variant14',
  'variant15',
  'variant16',
  'variant17',
  'variant18',
  'variant19',
  'variant20',
];

function generateRandomAvatar(gender: UserGenderEnum): string {
  const seed = Math.random().toString(36).substring(7);

  const params = new URLSearchParams();
  params.append('seed', seed);

  params.append('brows', BROWS.join(','));
  params.append('glasses', GLASSES.join(','));
  params.append('glassesProbability', '20');
  params.append('lips', LIPS.join(','));
  params.append('nose', NOSES.join(','));

  if (gender === UserGenderEnum.MALE) {
    params.append('beard', BEARDS.join(','));
    params.append('beardProbability', '100');
    params.append('hair', MALE_HAIRS.join(','));
  } else {
    params.append('beardProbability', '0');
    params.append('hair', FEMALE_HAIRS.join(','));
  }

  return `${DICEBEAR_URL}/9.x/notionists/svg?${params.toString()}`;
}

export default generateRandomAvatar;
