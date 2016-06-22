import { ul, li, makeDOMDriver, DOMSource, VNode } from '@cycle/dom'
import { makeHTTPDriver, HTTPSource } from '@cycle/http'
import { Observable } from 'rxjs'
import { run } from '@cycle/rxjs-run'

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
  HTTP: HTTPSource 
}
interface Sinks {
  DOM: Observable<VNode>,
  HTTP: Observable<any>
}
interface Drivers {
  [name: string]: Function
}

function intent(HTTPSource: HTTPSource) {
  const url = 'http://swapi.co/api/people/'

  const usersReq$ = Observable.of({ url, category: 'users' })

  const users$ = HTTPSource
    .select('users')
    .switch()
    .map((res: Response<UsersResBody>) => res.body.results)

  const homeworldsReq$ = users$.flatMap((users: Array<User> ) => {
    return users.map((user: User ) => {
      return { url: user.homeworld, category: 'homeworld' } 
    })
  })

  const homeworlds$ = HTTPSource
    .select('homeworld')
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

function main(sources: Sources): Sinks {
  const { users$, homeworlds$, usersReq$, homeworldsReq$ } = intent(sources.HTTP)
  const state$ = model(users$, homeworlds$)
  const vtree$ = view(state$)

  return {
    DOM: vtree$,
    HTTP: Observable.merge(usersReq$, homeworldsReq$)
  }
}

const drivers: Drivers = {
  DOM: makeDOMDriver('#app'),
  HTTP: makeHTTPDriver() // { eager: true }
}

run(main, drivers)

