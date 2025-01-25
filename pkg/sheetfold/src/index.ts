// index.ts : entry point of the library sheetfold

import { Contour } from 'geometrix';

/**
 * class `Facet`
 *
 */
class Facet extends Contour {
	/** @internal */
	junctionID: string[] = [];
	junctionOrientation: boolean[] = [];
	junctionPosition: number[] = [];
	startJunction(jName: string, aNb: string): Facet {
		//console.log(`dbg822: jName: ${jName} aNb: ${aNb}`);
		if (!['A', 'B'].includes(aNb)) {
			throw `err712: startJunction invalid argument aNb: ${aNb}`;
		}
		if (this.junctionID.includes(jName)) {
			throw `err209: junctionID ${jName} already used`;
		}
		this.junctionID.push(jName);
		this.junctionOrientation.push('A' === aNb);
		this.junctionPosition.push(this.segments.length - 1);
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
export { facet, facet2contour };
