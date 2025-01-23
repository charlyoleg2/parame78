// designList.ts

import type { tAllPageDef } from 'geometrix';
import {
	doorDef,
	maisonDef,
	cabanePlancherDef,
	cabaneDef,
	reinforcedTubeDef,
	reinforcedConeDef,
	lensX1Def,
	lensX3Def,
	pulleyDef,
	codeExample1Def,
	demoTrianguleDef,
	demoSheetFoldDef,
	railDef
} from 'desi78';

const designList: tAllPageDef = {
	'desi78/door': doorDef,
	'desi78/maison': maisonDef,
	'desi78/cabane_plancher': cabanePlancherDef,
	'desi78/cabane': cabaneDef,
	'desi78/reinforced_tube': reinforcedTubeDef,
	'desi78/reinforced_cone': reinforcedConeDef,
	'desi78/lens_x1': lensX1Def,
	'desi78/lens_x3': lensX3Def,
	'desi78/pulley': pulleyDef,
	'desi78/codeExample1': codeExample1Def,
	'desi78/demoTriangule': demoTrianguleDef,
	'desi78/demoSheetFold': demoSheetFoldDef,
	'desi78/rail': railDef
};

export { designList };
