import { ul, li, makeDOMDriver } from '@cycle/dom'
import { HTTPSource } from '@cycle/http/xstream-typings'
import { makeHTTPDriver } from '@cycle/http'
import { Observable } from 'rx'
import { run } from '@cycle/xstream-run'

function intent(HTTPSource: HTTPSource) {
  const url = 'http://swapi.co/api/people/'

  // const usersReq$ = Observable.just({ url })

  // const users$ = HTTPSource
    // .filter(res$ => res$.request.url === url)
    // .switch()
    // .map(res => res.body.results)

  // const homeworldsReq$ = users$.flatMap(users => {
  //   return users.map(user => {
  //     return { url: user.homeworld, id: 'homeworld' } 
  //   })
  // })

  // const homeworlds$ = HTTPSource
  //   .filter(res$ => res$.request.id === 'homeworld')
  //   .mergeAll()
  //   .map(res => res.body)
  //   .scan((acc, homeworld) => {
  //     acc = acc.concat(homeworld)
  //     return acc
  //   }, [])

  // return { users$, homeworlds$, usersReq$, homeworldsReq$ }
}

// function model(users$, homeworlds$) {
//   return Observable.combineLatest(
//     users$,
//     homeworlds$,
//     (users, homeworlds) => {
//       return users.map(user => {
//         const homeworld = homeworlds.filter(hw => hw.url === user.homeworld)[0]
//         return { user, homeworld }
//       })
//     }
//   )
// }

// function view(state$) {
//   return state$.map(state =>
//     ul(
//       state.map(model =>
//         li(`${model.user.name} - ${model.homeworld ? model.homeworld.name : 'UNKNOWN'}`)
//       )
//     )
//   )
// }

// function main(sources) {
//   const { users$, homeworlds$, usersReq$, homeworldsReq$ } = intent(sources.HTTP)
//   const state$ = model(users$, homeworlds$)
//   const vtree$ = view(state$)

//   return {
//     DOM: vtree$,
//     HTTP: Observable.merge(usersReq$, homeworldsReq$)
//   }
// }
// const drivers = {
//   DOM: makeDOMDriver('#app'),
//   HTTP: makeHTTPDriver({ eager: true })
// }

// run(main, drivers)

