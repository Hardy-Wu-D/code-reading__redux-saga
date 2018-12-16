import { SagaIterator, Task, runSaga, END, MulticastChannel } from 'redux-saga'
import { StrictEffect } from 'redux-saga/effects'

declare const stdChannel: MulticastChannel<any>
declare const promise: Promise<any>
declare const effect: StrictEffect
declare const iterator: Iterator<any>

function testRunSaga() {
  const task0: Task = runSaga<{ foo: string }, { baz: boolean }, () => SagaIterator>(
    {
      context: { a: 42 },

      channel: stdChannel,

      effectMiddlewares: [
        next => effect => {
          setTimeout(() => {
            next(effect)
          }, 10)
        },
        next => effect => {
          setTimeout(() => {
            next(effect)
          }, 10)
        },
      ],

      getState() {
        return { baz: true }
      },

      dispatch(input) {
        input.foo
        // typings:expect-error
        input.bar
      },

      sagaMonitor: {
        effectTriggered() {},
        effectResolved() {},
        effectRejected() {},
        effectCancelled() {},
        actionDispatched() {},
      },

      onError(error) {
        console.error(error)
      },
    },
    function* saga(): SagaIterator {
      yield effect
    },
  )

  // typings:expect-error
  runSaga()

  // typings:expect-error
  runSaga({})

  // typings:expect-error
  runSaga({}, iterator)

  runSaga({}, function* saga() {
    yield effect
  })

  // TODO: https://github.com/Microsoft/TypeScript/issues/28803
  {
    // typings:expect-error
    // runSaga({}, function* saga(a: 'a'): SagaIterator {})
  }

  // typings:expect-error
  runSaga({}, function* saga(a: 'a'): SagaIterator {}, 1)

  runSaga({}, function* saga(a: 'a'): SagaIterator {}, 'a')

  // TODO: https://github.com/Microsoft/TypeScript/issues/28803
  {
    // typings:expect-error
    // runSaga({}, function* saga(a: 'a', b: 'b'): SagaIterator {}, 'a')
  }

  // typings:expect-error
  runSaga({}, function* saga(a: 'a', b: 'b'): SagaIterator {}, 'a', 1)

  // typings:expect-error
  runSaga({}, function* saga(a: 'a', b: 'b'): SagaIterator {}, 1, 'b')

  runSaga({}, function* saga(a: 'a', b: 'b'): SagaIterator {}, 'a', 'b')

  // test with any iterator i.e. when generator doesn't always yield Effects.
  runSaga({}, function* saga() {
    yield promise
  })

  // typings:expect-error
  runSaga({ context: 42 }, function* saga(): SagaIterator {})
}
