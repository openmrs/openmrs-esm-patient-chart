import { reportFileSizeImpact, readGitHubWorkflowEnv } from '@jsenv/file-size-impact';

await reportFileSizeImpact({
  ...readGitHubWorkflowEnv(),
  logLevel: 'debug',
  buildCommand: null,
  installCommand: 'npx lerna bootstrap',
  fileSizeReportModulePath: './tools/size-generator.mjs#fileSizeReport',
});
