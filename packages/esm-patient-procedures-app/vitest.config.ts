import { mergeConfig } from 'vitest/config';
import sharedConfig from '../../tools/vitest.shared';

process.env.NODE_ENV = 'test';

export default mergeConfig(sharedConfig, {});
