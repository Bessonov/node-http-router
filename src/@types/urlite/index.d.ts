declare module 'urlite' {
	const Url: {
		parse: (url: string) => {
			pathname: string | undefined
			search: string | undefined
		}
	}
	// eslint-disable-next-line import/no-default-export
	export default Url
}
