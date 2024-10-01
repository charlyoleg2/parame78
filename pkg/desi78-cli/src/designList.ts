// designList.ts

import type { tAllPageDef } from 'geometrix';
import {
	doorDef,
	cabanePlancherDef,
	cabaneDef,
	reinforcedTubeDef,
	reinforcedConeDef,
	lensX1Def,
	railDef
} from 'desi78';

const designList: tAllPageDef = {
	'desi78/door': doorDef,
	'desi78/cabane_plancher': cabanePlancherDef,
	'desi78/cabane': cabaneDef,
	'desi78/reinforced_tube': reinforcedTubeDef,
	'desi78/reinforced_cone': reinforcedConeDef,
	'desi78/lens_x1': lensX1Def,
	'desi78/rail': railDef
};

export { designList };
