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
	startJunction(jName: string, aNb: string): Facet {
		console.log(`dbg822: jName: ${jName} aNb: ${aNb}`);
		return this;
	}
	endJunction(): Facet {
		console.log(`dbg734: endJunction`);
		return this;
	}
}

// instantiation functions
function facet(ix: number, iy: number, icolor = ''): Facet {
	return new Facet(ix, iy, icolor);
}

export type { Facet };
export { facet };
