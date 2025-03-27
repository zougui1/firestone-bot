import { Console, Effect, pipe } from 'effect';
import { omit } from 'radash';

import { goTo } from './view';
import { click, drag, findText, press } from '../api';
import { hotkeys } from '../hotkeys';

const startMissions = ({ squads }: { squads: number; }) => {
  const left = '18%';
  const top = '20%';

  return pipe(
    findText({
      left,
      top,
      width: '63%',
      height: '68%',
    }),
    Effect.map((texts) => texts.filter(text => /\d/.test(text.content))),
    Effect.flatMap(durations => Effect.iterate({ index: 0, remainingSquads: squads }, {
      while: ({ index, remainingSquads }) => {
        return remainingSquads > 0 && Boolean(durations[index]);
      },

      body: ({ index, remainingSquads }) => {
        return pipe(
          Console.log('opening mission dialog'),
          Effect.andThen(() => click({
            left: durations[index].left,
            top: durations[index].top,
          })),
          // mission label text
          Effect.flatMap(() => findText({
            left: '22%',
            top: '20%',
            width: '25%',
            height: '5%',
          })),
          Effect.flatMap(texts => Effect.if(
            texts.some(text => text.content.toLowerCase().includes('mission')),
            {
              onTrue: () => pipe(
                // left button text
                findText({
                  left: '22%',
                  top: '20%',
                  width: '25%',
                  height: '5%',
                }),
                Effect.flatMap(texts => Effect.if(
                  texts.some(text => text.content.toLowerCase().includes('start')),
                  {
                    onTrue: () => pipe(
                      Console.log('starting mission'),
                      Effect.andThen(() => click({ left: '51%', top: '81%' })),
                      Effect.as(true),
                    ),
                    onFalse: () => pipe(
                      Console.log('mission already running'),
                      // click outside the dialog to close it
                      // where there is no button
                      // in case the dialog was no open
                      Effect.tap(() => click({ left: '99%', top: '15%' })),
                      Effect.as(false),
                    ),
                  },
                )),
              ),
              onFalse: () => pipe(
                Console.log('invalid mission'),
                // click outside the dialog to close it
                // where there is no button
                // in case the dialog was no open
                Effect.tap(() => click({ left: '99%', top: '15%' })),
                Effect.as(false),
              ),
            },
          )),
          Effect.map(hasMissionStarted => ({
            index: index + 1,
            remainingSquads: remainingSquads - Number(hasMissionStarted),
          })),
        );
      },
    })),
    Effect.tap(({ remainingSquads }) => (
      Console.log(`missions started: ${squads - remainingSquads}; remaining squads: ${remainingSquads}`)
    )),
    Effect.map(result => omit(result, ['index'])),
  );
}

const handleBottomMap = ({ squads }: { squads: number; }) => {
  return Effect.scoped(pipe(
    Effect.addFinalizer(() => Effect.orElseSucceed(
      drag({ top: '-20%', x: '99%' }),
      () => ({ remainingSquads: 0 }),
    )),
    Effect.tap(() => Console.log('bottom map')),
    Effect.andThen(() => drag({ top: '20%', x: '99%' })),
    Effect.andThen(() => startMissions({ squads })),
  ));
}

const handleTopMap = ({ squads }: { squads: number; }) => {
  return Effect.scoped(pipe(
    Effect.addFinalizer(() => Effect.orElseSucceed(
      drag({ top: '20%', x: '99%' }),
      () => ({ remainingSquads: 0 }),
    )),
    Effect.tap(() => Console.log('top map')),
    Effect.andThen(() => drag({ top: '-20%', x: '99%' })),
    Effect.andThen(() => startMissions({ squads })),
  ));
}

const claimMissions = () => {
  const left = '5%';
  const top = '28%';

  return pipe(
    Console.log('checking missions to claim'),
    Effect.flatMap(() => findText({
      left,
      top,
      width: '8%',
      height: '5%',
    })),
    Effect.map(texts => (
      texts.filter(text => text.content.toLowerCase().includes('claim'))
    )),
    Effect.flatMap((claims) => Effect.forEach(claims, () => pipe(
      Console.log('claiming mission'),
      Effect.andThen(() => click({ left, top })),
      Effect.andThen(() => press({ key: hotkeys.escape })),
    ))),
    Effect.tap(() => Console.log('no missions to claim')),
  );
}

export const handleMapMissions = () => {
  return Effect.scoped(pipe(
    Effect.addFinalizer(() => Effect.orDie(goTo.main())),
    Effect.andThen(() => goTo.map()),
    Effect.andThen(claimMissions),
    Effect.flatMap(() => findText({
      left: '60%',
      top: '2%',
      width: '5%',
      height: '3%',
    })),
    Effect.map(([text]) => text?.content.split('/').map(Number)[0]),
    Effect.tap((squads) => Console.log(`squads: ${squads}`)),
    Effect.flatMap(squads => Effect.if(squads > 0, {
      onTrue: () => handleBottomMap({ squads }),
      onFalse: () => Effect.succeed({ remainingSquads: 0 }),
    })),
    Effect.flatMap(({ remainingSquads }) => Effect.if(remainingSquads > 0, {
      onTrue: () => handleTopMap({ squads: remainingSquads }),
      onFalse: () => Effect.void,
    })),
  ));
}
