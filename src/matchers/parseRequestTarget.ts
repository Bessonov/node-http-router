const absoluteUrlPrefix = /^[a-z][a-z\d+.-]*:\/\//i

export function getRequestPathname(target: string): string {
	const queryStart = target.indexOf('?')
	const fragmentStart = target.indexOf('#')
	const end = queryStart === -1 ? target.length : queryStart
	const pathEnd = fragmentStart !== -1 && fragmentStart < end ? fragmentStart : end

	// Route against the original path, including any escaped characters and repeated slashes.
	if (target[0] === '/') {
		return target.slice(0, pathEnd)
	}

	const pathStart = absoluteUrlPrefix.test(target) ? target.indexOf('/', target.indexOf(':') + 3) : 0
	return pathStart === -1 || pathStart >= pathEnd ? '/' : target.slice(pathStart, pathEnd)
}

export function getRequestSearch(target: string): string {
	const queryStart = target.indexOf('?')
	if (queryStart === -1) {
		return ''
	}

	const fragmentStart = target.indexOf('#')
	if (fragmentStart !== -1 && fragmentStart < queryStart) {
		return ''
	}

	return fragmentStart === -1 ? target.slice(queryStart) : target.slice(queryStart, fragmentStart)
}
