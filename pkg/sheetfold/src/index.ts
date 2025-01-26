// index.ts : entry point of the library sheetfold

import { Contour, tVolume } from 'geometrix';

enum tJDir {
	eA,
	eB
}

enum tJSide {
	eABRight,
	eABLeft
}

interface tJunc {
	angle: number;
	radius: number;
	neutral: number;
}
type tJuncs = Record<string, tJunc>;

interface tJunc2 {
	angle: number;
	radius: number;
	neutral: number;
	associated: number;
	asso1: number;
	asso2: number;
	juncIdx1: number;
	juncIdx2: number;
	length: number;
}
type tJuncs2 = Record<string, tJunc2>;

/**
 * class `Facet`
 *
 */
class Facet extends Contour {
	/** @internal */
	junctionID: string[] = [];
	junctionDir: tJDir[] = [];
	junctionSide: tJSide[] = [];
	junctionPosition: number[] = [];
	lastPosition = -1;
	startJunction(jName: string, aNb: tJDir, abSide: tJSide): Facet {
		//console.log(`dbg822: jName: ${jName} aNb: ${aNb}`);
		if (this.junctionID.includes(jName)) {
			throw `err209: junctionID ${jName} already used`;
		}
		const newPosition = this.segments.length - 1;
		if (newPosition === this.lastPosition) {
			throw `err210: junctionID ${jName} overwrites previous junction`;
		}
		this.lastPosition = newPosition;
		this.junctionID.push(jName);
		this.junctionDir.push(aNb);
		this.junctionSide.push(abSide);
		this.junctionPosition.push(newPosition);
		return this;
	}
}

class SheetFold {
	/** @internal */
	pFacets: Facet[] = [];
	pJuncs: tJuncs2 = {};
	constructor(iFacets: Facet[], iJuncs: tJuncs) {
		const jNames2 = Object.keys(iJuncs);
		for (const [iFacetIdx, iFacet] of iFacets.entries()) {
			for (const [iJuncIdx, iJuncName] of iFacet.junctionID.entries()) {
				const jNames = Object.keys(this.pJuncs);
				if (jNames.includes(iJuncName)) {
					if (1 === this.pJuncs[iJuncName].associated) {
						this.pJuncs[iJuncName].associated = 2;
						this.pJuncs[iJuncName].asso2 = iFacetIdx;
						this.pJuncs[iJuncName].juncIdx2 = iJuncIdx;
					} else {
						throw `err125: jName ${iJuncName} used a third time in facet-idx ${iFacetIdx}`;
					}
				} else {
					if (jNames2.includes(iJuncName)) {
						this.pJuncs[iJuncName] = {
							angle: iJuncs[iJuncName].angle,
							radius: iJuncs[iJuncName].radius,
							neutral: iJuncs[iJuncName].neutral,
							associated: 1,
							asso1: iFacetIdx,
							asso2: -1,
							juncIdx1: iJuncIdx,
							juncIdx2: -1,
							length: 0
						};
						this.pFacets.push(iFacet);
					} else {
						throw `err129: jName ${iJuncName} not defined in junction-list`;
					}
				}
			}
		}
	}
	makePattern(): Contour {
		if (0 === this.pFacets.length) {
			throw `err324: facet list is empty`;
		}
		return this.pFacets[0];
	}
	makeVolume(): tVolume {
		return { extrudes: [], volumes: [] };
	}
}

// instantiation functions
function facet(ix: number, iy: number, icolor = ''): Facet {
	return new Facet(ix, iy, icolor);
}
function sheetFold(iFacets: Facet[], iJuncs: tJuncs): SheetFold {
	return new SheetFold(iFacets, iJuncs);
}

// other helper function
function facet2contour(iFacet: Facet): Contour {
	return iFacet;
}

export type { Facet, SheetFold };
export { tJDir, tJSide, facet, sheetFold, facet2contour };
