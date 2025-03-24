/*import { Effect, pipe, Console, Stream, StreamEmit, Chunk, Option } from 'effect';
import Emittery from 'emittery';
import { click, findText } from './api';
import { findGameWindow } from './process';
import { navigation } from './store';


Effect.runPromise(pipe(
  findGameWindow(),
  Effect.tap(gameWindow => navigation.store.trigger.changeWindow(gameWindow)),
  Effect.flatMap(() => findText({
    left: '52%',
    top: '72.5%',
    width: '10%',
    height: '4%',
    debug: true,
  })),
  Effect.tap(Console.log),
));*/

import './program';
