// index.ts : entry point of the library sheetfold

import { Contour } from 'geometrix';

enum tJDir {
	eA,
	eB
}

enum tJSide {
	eABRight,
	eABLeft
}

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

// instantiation functions
function facet(ix: number, iy: number, icolor = ''): Facet {
	return new Facet(ix, iy, icolor);
}

// other helper function
function facet2contour(iFacet: Facet): Contour {
	return iFacet;
}

export type { Facet };
export { tJDir, tJSide, facet, facet2contour };
