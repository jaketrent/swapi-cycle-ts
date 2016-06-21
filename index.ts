import { ul, li, makeDOMDriver } from '@cycle/dom'
import { DOMSource } from '@cycle/dom/xstream-typings'
// import { HTTPSource } from '@cycle/http/xstream-typings'
import { makeHTTPDriver } from '@cycle/http'
import { Observable } from 'rx'
import { run } from '@cycle/xstream-run'

interface User {
  name: String,
  homeworld: String
}
interface Planet {
  name: String,
  url: String
}
interface UsersResBody {
  results: Array<User>
}
interface Response<T> {
  body: T 
}
interface ViewState {
  user: User,
  homeworld: Planet
}
interface Sources {
  DOM: DOMSource,
  HTTP: Observable<any> // TODO: type something more like HTTPSource
}

// TODO: give a better observable type
function intent(HTTPSource: Observable<any>) {
  const url = 'http://swapi.co/api/people/'

  const usersReq$ = Observable.just({ url })

  const users$ = HTTPSource
    .filter(res$ => res$.request.url === url)
    .switch()
    .map((res: Response<UsersResBody>) => res.body.results)

  const homeworldsReq$ = users$.flatMap((users: Array<User> ) => {
    return users.map((user: User ) => {
      return { url: user.homeworld, id: 'homeworld' } 
    })
  })

  const homeworlds$ = HTTPSource
    .filter(res$ => res$.request.id === 'homeworld')
    .mergeAll()
    .map((res: Response<Planet> ) => res.body)
    .scan((acc: Array<Planet>, homeworld: Planet) => {
      acc = acc.concat(homeworld)
      return acc
    }, [])

  return { users$, homeworlds$, usersReq$, homeworldsReq$ }
}

function model(users$: Observable<Array<User>>, homeworlds$: Observable<Array<Planet>>) {
  return Observable.combineLatest(
    users$,
    homeworlds$,
    (users, homeworlds) => {
      return users.map(user => {
        const homeworld = homeworlds.filter(hw => hw.url === user.homeworld)[0]
        return { user, homeworld }
      })
    }
  )
}

function view(state$: Observable<Array<ViewState>>) {
  return state$.map(state =>
    ul(
      state.map((model: ViewState) =>
        li(`${model.user.name} - ${model.homeworld ? model.homeworld.name : 'UNKNOWN'}`)
      )
    )
  )
}

function main(sources: Sources) {
  const { users$, homeworlds$, usersReq$, homeworldsReq$ } = intent(sources.HTTP)
  const state$ = model(users$, homeworlds$)
  const vtree$ = view(state$)

  return {
    DOM: vtree$,
    HTTP: Observable.merge(usersReq$, homeworldsReq$)
  }
}

const drivers = {
  DOM: makeDOMDriver('#app'),
  HTTP: makeHTTPDriver()
}

// follow this goodness
// https://github.com/cyclejs/examples/blob/diversity/bmi-typescript/src/BmiCalculator.ts
// run(main, drivers)

