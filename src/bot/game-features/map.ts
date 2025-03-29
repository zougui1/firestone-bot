import { Effect, pipe } from 'effect';
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
          Effect.logDebug('Opening mission dialog'),
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
                      Effect.log('Starting mission'),
                      Effect.andThen(() => click({ left: '51%', top: '81%' })),
                      Effect.as(true),
                    ),
                    onFalse: () => pipe(
                      Effect.log('Mission already running'),
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
                Effect.log('Invalid mission'),
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
      Effect.logDebug(`Missions started: ${squads - remainingSquads}; remaining squads: ${remainingSquads}`)
    )),
    Effect.map(result => omit(result, ['index'])),
  );
}

const handleBottomMap = ({ squads }: { squads: number; }) => {
  return Effect.scoped(pipe(
    Effect.addFinalizer(() => drag({ top: '-20%', x: '99%' })),
    Effect.tap(() => Effect.logDebug('Map bottom')),
    Effect.tap(() => drag({ top: '20%', x: '99%' })),
    Effect.flatMap(() => startMissions({ squads })),
  ));
}

const handleTopMap = ({ squads }: { squads: number; }) => {
  return Effect.scoped(pipe(
    Effect.addFinalizer(() => drag({ top: '20%', x: '99%' })),
    Effect.tap(() => Effect.logDebug('Map top')),
    Effect.tap(() => drag({ top: '-20%', x: '99%' })),
    Effect.flatMap(() => startMissions({ squads })),
  ));
}

const claimMissions = () => {
  const left = '5%';
  const top = '28%';

  return pipe(
    Effect.iterate(true, {
      while: bool => bool,
      body: () => pipe(
        Effect.log('Checking for a mission to claim'),
        Effect.flatMap(() => findText({
          left,
          top,
          width: '8%',
          height: '5%',
        })),
        Effect.flatMap(texts => Effect.if(
          texts.some(text => text.content.toLowerCase().includes('claim')),
          {
            onTrue: () => pipe(
              Effect.log('Claiming mission'),
              Effect.tap(() => click({ left, top })),
              Effect.tap(() => press({ key: hotkeys.escape })),
              Effect.as(true),
            ),
            onFalse: () => Effect.succeed(false),
          }
        )),
      ),
    }),
    Effect.tap(() => Effect.log('No missions to claim')),
  );
}

export const handleMapMissions = () => {
  return Effect.scoped(pipe(
    Effect.addFinalizer(() => goTo.main()),
    Effect.tap(() => goTo.map()),
    Effect.tap(claimMissions),
    Effect.flatMap(() => findText({
      left: '60%',
      top: '2%',
      width: '5%',
      height: '3%',
    })),
    Effect.map(([text]) => text?.content.split('/').map(Number)[0]),
    Effect.tap((squads) => Effect.log(`Squads: ${squads}`)),
    Effect.flatMap(squads => Effect.if(squads > 0, {
      onTrue: () => handleBottomMap({ squads }),
      onFalse: () => Effect.succeed({ remainingSquads: 0 }),
    })),
    Effect.flatMap(({ remainingSquads }) => Effect.if(remainingSquads > 0, {
      onTrue: () => handleTopMap({ squads: remainingSquads }),
      onFalse: () => Effect.void,
    })),
    Effect.tap(() => Effect.log('Done handling map missions')),
    Effect.withSpan('mapMissions'),
    Effect.withLogSpan('mapMissions'),
  ));
}
