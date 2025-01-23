// index.ts : entry point of the library sheetfold

/**
 * Prepare a float for printing log
 * @internal
 *
 *  @param ifloat - the floaf to be printed
 *  @returns the string ready for printing
 */
function ffix(ifloat: number): string {
	return ifloat.toFixed(2);
}


export { ffix };
