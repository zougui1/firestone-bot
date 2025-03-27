import { Console, Effect, pipe } from 'effect';

import { goTo } from './view';
import { click, findText } from '../api';

const claimAndRestart = ({ left }: { left: `${number}%`; }) => {
  return pipe(
    findText({
      left,
      top: '70.5%',
      width: '8%',
      height: '3.5%',
    }),
    Effect.flatMap(texts => Effect.if(
      texts.some(text => text.content.toLowerCase() === 'speed up'),
      {
        onTrue: () => Console.log('ignored'),
        onFalse: () => pipe(
          Console.log('claiming'),
          Effect.andThen(click({ left, top: '75%' })),
          Effect.tap(() => Console.log('starting new')),
          Effect.andThen(click({ left, top: '75%' })),
          Effect.flatMap(() => Effect.void),
        ),
      },
    )),
  );
}

export const handleExperiments = () => {
  return Effect.void;
  /*return Effect.scoped(pipe(
    Effect.addFinalizer(() => Effect.orDie(goTo.main())),
    Effect.andThen(() => goTo.alchemist()),

    Effect.tap(() => Console.log('experiment: blood')),
    Effect.andThen(() => claimAndRestart({ left: '45%' })),

    //Effect.tap(() => Console.log('experiment: exotic coins')),
    //Effect.andThen(() => claimAndRestart({ left: '81%' })),
  ));*/
}
