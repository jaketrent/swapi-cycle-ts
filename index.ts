import xs, { Stream } from 'xstream'
import { DOMSource } from '@cycle/dom/xstream-typings'
import flattenConcurrently from 'xstream/extra/flattenConcurrently'
import { HTTPSource } from '@cycle/http/xstream-typings'
import { run } from '@cycle/xstream-run'

import { ul, li, makeDOMDriver, VNode } from '@cycle/dom'
import { makeHTTPDriver, RequestOptions } from '@cycle/http'

interface User {
  name: string,
  homeworld: string
}
interface Planet {
  name: string,
  url: string
}
interface UsersResBody {
  results: User[]
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
  [name: string]: Stream<any>
  // DOM: Stream<VNode>,
  // HTTP: Stream<RequestOptions>
}
interface Drivers {
  [name: string]: Function
}
interface Intent {
  [name: string]: Stream<any>
}

function intent(HTTPSource: HTTPSource): Intent {
  const url: string = 'http://swapi.co/api/people/'

  const usersReq$: Stream<RequestOptions> = xs.of({ url, category: 'users' })

  const users$: Stream<User[]> = HTTPSource
    .select('users')
    .flatten()
    .map((res: Response<UsersResBody>) => res.body.results)

  const homeworldsReq$: Stream<RequestOptions> = users$.map((users: User[]): Stream<RequestOptions> => {
    return xs.fromArray(users.map((user: User): RequestOptions => {
      return { url: user.homeworld, category: 'homeworld' }
    }))
  }).flatten()

  const homeworlds$ = HTTPSource
    .select('homeworld')
    .compose(flattenConcurrently)
    .map((res: Response<Planet>) => res.body)
    .fold((acc: Planet[], homeworld: Planet) => {
      acc = acc.concat(homeworld)
      return acc
    }, [])

  return { users$, homeworlds$, usersReq$, homeworldsReq$ }
}

function model(users$: Stream<User[]>, homeworlds$: Stream<Planet[]>): Stream<ViewState[]> {
  return xs.combine(users$, homeworlds$)
    .map(([users, homeworlds]) => {
      return users.map(user => {
        const homeworld = homeworlds.filter(hw => hw.url === user.homeworld)[0]
        return { user, homeworld }
      })
    })
}

function view(state$: Stream<ViewState[]>): Stream<VNode> {
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
    HTTP: xs.merge<RequestOptions>(usersReq$, homeworldsReq$)
  }
}

const drivers: Drivers = {
  DOM: makeDOMDriver('#app'),
  HTTP: makeHTTPDriver() // { eager: true }
}

run(main, drivers)

