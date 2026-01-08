import { registerAs } from '@nestjs/config';
import { COOKIES_CONFIG_KEY } from '~/utils/constants';
import { checkedEnv } from '../env/env';

export default registerAs(COOKIES_CONFIG_KEY, () => ({
  secret: checkedEnv.COOKIES_SECRET,
}));
