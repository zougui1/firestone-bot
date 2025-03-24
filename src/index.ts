/*import { Effect, pipe, Console, Stream, StreamEmit, Chunk, Option } from 'effect';
import Emittery from 'emittery';
import { click, findText } from './api';
import { findGameWindow } from './process';
import { navigation } from './store';

const emitter = new Emittery<{ test: { id: string; data: number; }; }>();
const buffer = new Map<string, number>();

emitter.on('test', item => {
  //console.log('emitted', item.data);
  buffer.set(item.id, item.data);
});

const stream = Stream.async(
  (emit: StreamEmit.Emit<never, never, number, void>) => {
    for (const [id, num] of buffer) {
      emit(Effect.succeed(Chunk.of(num)));
      buffer.delete(id);
    }

    emitter.on('test', item => {
      console.log('emit');
      emit(Effect.succeed(Chunk.of(item.data)));
      buffer.delete(item.id);
    });
  },
);

(async () => {
  const { nanoid } = await import('nanoid');
  emitter.emit('test', { id: nanoid(), data: 1 });

  setTimeout(() => {
    emitter.emit('test', { id: nanoid(), data: 2 });
  }, 1000)
  setTimeout(() => {
    emitter.emit('test', { id: nanoid(), data: 3 });
  }, 5000)
  setTimeout(() => {
    emitter.emit('test', { id: nanoid(), data: 4 });
  }, 8000)
  setTimeout(() => {
    emitter.emit('test', { id: nanoid(), data: 5 });
  }, 11000)
  setTimeout(() => {
    emitter.emit('test', { id: nanoid(), data: 6 });
  }, 18000)
})();

Effect.runPromise(
  Effect.loop(true, {
    while: bool => bool,
    step: () => true,
    body: () => pipe(
      Console.log('doing some stuff'),
      Effect.tap(() => Effect.sleep('10 seconds')),
      Effect.tap(() => Console.log('start processing stream')),
      Effect.flatMap(() => pipe(
        stream,
        Stream.runForEach(n => pipe(
          Console.log(n),
          Effect.tap(() => Effect.sleep('100 millis')),
          Effect.tap(() => Console.log('delayed:', n)),
        )),
        Effect.timeoutOption('5 seconds'),
      )),
      Effect.tap(() => Console.log('after\n')),
    ),
  }),
);
*/
//import './program';
