// general.ts

function strDesiNames(libNames: string[]): string {
	const rStr = libNames.join(' and ');
	return rStr;
}

function repoToHomepage(repo: string): string {
	let rHomepage = repo;
	const re1 = /^git\+/;
	const re2 = /\.git$/;
	rHomepage = rHomepage.replace(re1, '').replace(re2, '');
	return rHomepage;
}

export { strDesiNames, repoToHomepage };
