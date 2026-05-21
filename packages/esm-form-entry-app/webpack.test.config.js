const { resolve } = require('path');

module.exports = {
  resolve: {
    alias: {
      '@angular/cdk/portal$': resolve(__dirname, 'src/compat/angular-cdk-portal.ts'),
      '@openmrs/ngx-file-uploader$': resolve(__dirname, 'src/compat/ngx-file-uploader.ts'),
    },
  },
};
