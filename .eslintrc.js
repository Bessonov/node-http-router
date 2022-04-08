module.exports = {
	root: true,
	reportUnusedDisableDirectives: true,
	env: {
		node: true,
		jest: true,
	},
	plugins: [
		'@typescript-eslint',
	],
	extends: [
		'airbnb-base',
		'plugin:@typescript-eslint/recommended',
		'@bessonovs/eslint-config',
		'@bessonovs/eslint-config/typescript',
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: [
			'./tsconfig.json',
		],
	},
	ignorePatterns: [
		'.eslintrc.js',
	],
	rules: {
		'arrow-body-style': 'off',
		'lines-between-class-members': 'off',
		'implicit-arrow-linebreak': 'off',
		'no-restricted-syntax': 'off',
		'object-curly-newline': [
			'error',
			{
				ImportDeclaration: {
					minProperties: 1,
					multiline: true,
				},
			},
		],
		'@typescript-eslint/indent': [
			'error',
			'tab',
		],
		'import/no-useless-path-segments': 'error',
		'import/no-cycle': 'error',
		// doesn't work for central devDependencies
		'import/no-extraneous-dependencies': 'off',
		'import/extensions': [
			'error',
			'ignorePackages',
			{
				ts: 'never',
				tsx: 'never',
			},
		],
	},
	settings: {
		'import/resolver': {
			node: {
				extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
			},
		},
	},
	overrides: [
		{
			files: ['**/*.js'],
			rules: {
				'@typescript-eslint/no-var-requires': 'off',
				'@typescript-eslint/explicit-function-return-type': 'off',
			},
		},
		{
			files: ['**/__tests__/**'],
			rules: {
				'@typescript-eslint/explicit-function-return-type': 'off',
			},
		},
		{
			files: ['**/*.ts', '**/*.d.ts'],
			rules: {
				indent: 'off', // ts has own rule: @typescript-eslint/indent
				'no-useless-constructor': 'off',
			},
		},
	],
}
