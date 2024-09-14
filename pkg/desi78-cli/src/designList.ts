// designList.ts

import type { tAllPageDef } from 'geometrix';
import { doorDef, cabane_plancherDef, cabaneDef, reinforced_tubeDef, reinforced_coneDef } from 'desi78';

const designList: tAllPageDef = {
	'desi78/facade/door': doorDef,
	'desi78/menuiserie/cabane_plancher': cabanePlancherDef,
	'desi78/menuiserie/cabane': cabaneDef,
	'desi78/chaudronnerie/reinforced_tube': reinforcedTubeDef,
	'desi78/chaudronnerie/reinforced_cone': reinforcedConeDef
};

export { designList };
