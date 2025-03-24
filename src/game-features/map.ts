import { Console, Effect, Option, pipe } from 'effect';
import { omit, sort } from 'radash';
import nanoid from 'nanoid';

import { goTo } from './view';
import { click, drag, findText, press } from '../api';
import { hotkeys } from '../hotkeys';
import { durationToSeconds } from '../utils';
import { event } from '../store';

interface MissionData {
  id: string;
  duration: string;
  dragUpPercent: number;
  left: number;
  top: number;
}

const missionDataMap = new Map<string, MissionData>();
let squads = 0;

const scanMissions = ({ dragUpPercent }: { dragUpPercent: number }) => {
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
    Effect.flatMap(texts => Effect.forEach(texts, text => pipe(
      Console.log('trying to open mission dialog'),
      Effect.andThen(() => click({
        left: text.left,
        top: text.top,
      })),
      // mission label text
      Effect.flatMap(() => findText({
        left: '22%',
        top: '20%',
        width: '25%',
        height: '5%',
      })),
      Effect.flatMap(labelTexts => Effect.if(
        labelTexts.some(labelText => labelText.content.toLowerCase().includes('mission')),
        {
          onTrue: () => pipe(
            // left button text
            findText({
              left: '22%',
              top: '20%',
              width: '25%',
              height: '5%',
            }),
            Effect.flatMap(buttonTexts => Effect.if(
              buttonTexts.some(buttonText => (
                // it's a doable mission if we can start it
                // or if we can't cancel it, since missions can't
                // be started if there are no sqauds available
                buttonText.content.toLowerCase().includes('start') ||
                !buttonText.content.toLowerCase().includes('cancel')
              )),
              {
                onTrue: () => pipe(
                  findText({
                    left: '52%',
                    top: '72.5%',
                    width: '10%',
                    height: '4%',
                  }),
                  Effect.flatMap(([text]) => Effect.if(Boolean(durationToSeconds(text?.content ?? '')), {
                    onTrue: () => Effect.succeed(Option.some(text)),
                    onFalse: () => Effect.succeed(Option.none()),
                  })),
                  Effect.tap(() => press({ key: hotkeys.escape })),
                ),
                onFalse: () => pipe(
                  Console.log('mission already running'),
                  Effect.as(undefined),
                ),
              },
            )),
            Effect.tap(() => press({ key: hotkeys.escape })),
          ),
          onFalse: () => pipe(
            Console.log('invalid mission'),
            Effect.as(undefined),
          ),
        },
      )),
    ))),
    Effect.tap(missions => missions.forEach(mission => {
      if (!mission) {
        return;
      }

      const id = nanoid();
      const duration = Option.isSome(mission)
        ? mission.value.content
        : '';

      if (Option.isSome(mission)) {
        missionDataMap.set(id, {
          id,
          duration,
          dragUpPercent,
          left: mission.value.left,
          top: mission.value.top,
        });
      } else {
        event.store.trigger.addInvalidAction({
          action: {
            id,
            type: 'mapMission',
            duration,
          },
        });
      }

      /*event.store.trigger.emitAction({
        action: {
          id,
          type: 'mapMission',
          duration,
        },
      });*/
    })),
  );
}

const scanBottomMap = () => {
  const dragUpPercent = -20;

  return Effect.scoped(pipe(
    Effect.addFinalizer(() => Effect.orElseSucceed(
      drag({ top: `${dragUpPercent}%`, x: '99%' }),
      () => ({ remainingSquads: 0 }),
    )),
    Effect.tap(() => Console.log('bottom map')),
    Effect.andThen(() => drag({ top: `${dragUpPercent * -1}%`, x: '99%' })),
    Effect.andThen(() => scanMissions({ dragUpPercent })),
  ));
}

const scanTopMap = () => {
  const dragUpPercent = 20;

  return Effect.scoped(pipe(
    Effect.addFinalizer(() => Effect.orElseSucceed(
      drag({ top: `${dragUpPercent}%`, x: '99%' }),
      () => ({ remainingSquads: 0 }),
    )),
    Effect.tap(() => Console.log('top map')),
    Effect.andThen(() => drag({ top: `${dragUpPercent * -1}%`, x: '99%' })),
    Effect.andThen(() => scanMissions({ dragUpPercent })),
  ));
}

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
                      Effect.andThen(() => press({ key: hotkeys.escape })),
                      Effect.as(false),
                    ),
                  },
                )),
              ),
              onFalse: () => pipe(
                Console.log('invalid mission'),
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
      Console.log(`missions startd: ${squads - remainingSquads}; remaining squads: ${remainingSquads}`)
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

export const handleMapMissionAction = (action: event.ActionEvent) => {
  const data = missionDataMap.get(action.id);
  missionDataMap.delete(action.id);

  if (!data) {
    return Effect.void;
  }

  return Effect.scoped(pipe(
    Effect.addFinalizer(() => Effect.orDie(goTo.main())),
    Effect.andThen(() => goTo.map()),
    Effect.tap(() => Effect.scoped(pipe(
      Effect.addFinalizer(() => Effect.orDie(drag({
        top: `${data.dragUpPercent * -1}%`,
        x: '99%',
      }))),
      Effect.tap(() => drag({
        top: `${data.dragUpPercent}%`,
        x: '99%',
      })),
      Effect.tap(() => click({
        left: data.left,
        top: data.top,
      })),
    ))),
  ));
}

export const handleMapMissions = () => {
  return Effect.scoped(pipe(
    Effect.addFinalizer(() => Effect.orDie(goTo.main())),
    Effect.andThen(() => goTo.map()),
    Effect.flatMap(scanBottomMap),
    Effect.flatMap(scanTopMap),
    Effect.flatMap(() => Effect.partition(missionDataMap.values(), mission => {
      return mission.dragUpPercent < 0
        ? Effect.succeed(mission)
        : Effect.fail(mission);
    })),
    Effect.map(() => sort([...missionDataMap.values()], m => durationToSeconds(m.duration) ?? 0)),
    Effect.tap((missions) => Console.log(missions)),
  ));
  /*return Effect.scoped(pipe(
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
  ));*/
}
