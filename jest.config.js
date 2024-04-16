// eslint-disable-next-line import/no-default-export
export default {
	roots: ['<rootDir>/dist'],
	testEnvironment: 'node',
	testRegex: '(/__tests__/.*|(\\.|/)test)\\.jsx?$',
	collectCoverageFrom: ['<rootDir>/dist/**/*.js'],
	// eslint-disable-next-line no-useless-escape
	coveragePathIgnorePatterns: ['/dist\/examples/'],
	coverageThreshold: {
		global: {
			statements: 100,
			branches: 100,
			functions: 100,
			lines: 100,
		},
	},
}
