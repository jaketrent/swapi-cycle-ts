import isolate from '@cycle/isolate'
import { div } from '@cycle/dom'
import { Observable } from 'rx'

function Planet(sources) {
  // const url$ = sources.props$
  //   .map(props => props.url)
  //   .first()

  console.log("sources", sources.url)

  const getPlanet$ = Observable.just({ url: sources.url, method: 'GET' })

  const planet$ = sources.HTTP
    .filter(res$ => res$.request.url === url$)
    .mergeAll()
    .map(res => res.body)
    .startWith(null)

  const vtree$ = planet$.map(planet =>
    div(planet ? planet.name : 'Unknown planet')
  )

  return {
    DOM: vtree$,
    HTTP: getPlanet$
  }
}

export default sources => isolate(Planet)(sources)
