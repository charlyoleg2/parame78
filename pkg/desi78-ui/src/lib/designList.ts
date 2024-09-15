// designList.ts

import type { tAllPageDef } from 'geometrix';
import {
	doorDef,
	cabanePlancherDef,
	cabaneDef,
	reinforcedTubeDef,
	reinforcedConeDef
} from 'desi78';

const designList: tAllPageDef = {
	'desi78/door': doorDef,
	'desi78/cabane_plancher': cabanePlancherDef,
	'desi78/cabane': cabaneDef,
	'desi78/reinforced_tube': reinforcedTubeDef,
	'desi78/reinforced_cone': reinforcedConeDef
};

export { designList };
