#!/usr/bin/env node
// desi78-uis.ts

import { feli_cli } from 'feli';
import process from 'node:process';
import path from 'node:path';

const scrDir = import.meta.dirname;
const defaultPublicDir = path.join(scrDir, 'public');

//console.log('desi78-uis.ts says Hello!');
try {
	await feli_cli(defaultPublicDir, process.argv);
} catch (err) {
	console.error(`Error from feli: ${err}`);
}
//console.log('desi78-uis.ts says Bye!');
