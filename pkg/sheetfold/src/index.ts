// index.ts : entry point of the library sheetfold

import { Contour } from 'geometrix';

/**
 * class `Facet`
 *
 */
class Facet extends Contour {}

// instantiation functions
function facet(ix: number, iy: number, icolor = ''): Facet {
	return new Facet(ix, iy, icolor);
}

export type { Facet };
export { facet };
