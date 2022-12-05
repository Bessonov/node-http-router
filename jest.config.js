const { defaults } = require('jest-config')

module.exports = {
	roots: ['<rootDir>/src'],
	preset: 'ts-jest',
	testEnvironment: 'node',
	testRegex: '(/__tests__/.*|(\\.|/)test)\\.tsx?$',
	testPathIgnorePatterns: ['/node_modules/'],
	moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],
	transform: {
		'\\.[jt]sx?$': ['ts-jest'],
	},
	coverageThreshold: {
		global: {
			statements: 100,
			branches: 100,
			functions: 100,
			lines: 100,
		},
	},
}
