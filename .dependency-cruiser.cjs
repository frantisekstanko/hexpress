module.exports = {
  forbidden: [
    {
      name: 'no-domain-to-application',
      severity: 'error',
      comment: 'Domain layer cannot depend on Application layer',
      from: {
        path: '^src/.+/Domain',
      },
      to: {
        path: '^src/.+/Application',
      },
    },
    {
      name: 'no-domain-to-infrastructure',
      severity: 'error',
      comment: 'Domain layer cannot depend on Infrastructure layer',
      from: {
        path: '^src/.+/Domain',
      },
      to: {
        path: '^src/.+/Infrastructure',
      },
    },
    {
      name: 'no-application-to-infrastructure',
      severity: 'error',
      comment: 'Application layer cannot depend on Infrastructure layer',
      from: {
        path: '^src/.+/Application/',
      },
      to: {
        path: '^src/.+/Infrastructure',
      },
    },
    {
      name: 'no-circular',
      severity: 'warn',
      comment: 'No circular dependencies allowed',
      from: {},
      to: {
        circular: true,
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      mainFields: ['module', 'main', 'types', 'typings'],
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/(?:@[^/]+/[^/]+|[^/]+)',
      },
      archi: {
        collapsePattern: '^src/[^/]+/(?:Domain|Application|Infrastructure)',
      },
      text: {
        highlightFocused: true,
      },
    },
  },
}
