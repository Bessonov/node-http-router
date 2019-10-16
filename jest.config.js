const { defaults } = require('jest-config')

module.exports = {
	roots: ['<rootDir>/src'],
	transform: {
		'^.+\\.tsx?$': 'ts-jest',
	},
	testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
	testPathIgnorePatterns: ['/node_modules/'],
	moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],
	coverageThreshold: {
		global: {
			statements: 100,
			branches: 100,
			functions: 100,
			lines: 100,
		},
	},
	// https://github.com/kulshekhar/ts-jest/issues/823#issuecomment-515529012
	globals: {
		'ts-jest': {
			packageJson: 'package.json',
		},
	},
}
