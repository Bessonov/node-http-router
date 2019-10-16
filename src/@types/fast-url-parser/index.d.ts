declare module 'fast-url-parser' {
	// eslint-disable-next-line import/no-named-default
	import { default as nativeUrl } from 'url'

	const Url: typeof nativeUrl
	// eslint-disable-next-line import/no-default-export
	export default Url
}
