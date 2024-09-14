#!/usr/bin/env node
// desi78-cli.ts

import { geom_cli } from 'geomcli';
import packag from '../package.json';
import { designList } from './designList';

//console.log('desi78-cli says hello');
await geom_cli(process.argv, designList, packag, 'output');
//console.log('desi78-cli says bye');
