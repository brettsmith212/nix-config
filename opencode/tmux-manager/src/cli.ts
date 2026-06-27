#!/usr/bin/env bun
import { launch } from './launch';
import { listCommand } from './picker';
import { runAnsiPicker } from './picker-ansi';
import { setState } from './state';
import { isState } from './types';

const args = process.argv.slice(2);
const command = args[0];

function usage(): never {
  console.error('Usage: ocmux <launch|list|picker|state>');
  process.exit(1);
}

switch (command) {
  case 'launch': {
    launch(args[1] || process.cwd(), args[2]);
    break;
  }

  case 'list': {
    listCommand();
    break;
  }

  case 'picker': {
    runAnsiPicker().catch((err) => {
      console.error(err);
      process.exit(1);
    });
    break;
  }

  case 'state': {
    if (!isState(args[1])) {
      console.error(`Invalid state: ${args[1]}`);
      process.exit(1);
    }
    setState(args[1]);
    break;
  }

  default:
    usage();
}
