import xs from 'xstream'
import {run} from '@cycle/run'
import { Sources, Sinks } from './scripts/definitions'
import {makeDOMDriver,DOMSource, VNode, div} from '@cycle/dom'
import {makeHTTPDriver, HTTPSource, RequestOptions} from '@cycle/http'
import Search from  './scripts/search'
import Buttons from  './scripts/buttons'
import './css/main.scss'

interface MainSources extends Sources.dom, Sources.http{}
interface MainSinks extends Sinks.dom,Sinks.http {}

function main (sources: MainSources): MainSinks {

    const search$ = Search({dom: sources.dom, http: sources.http})
        , buttons$ = Buttons({dom: sources.dom})
        , dom$ = xs.combine(search$.dom, buttons$.dom)
            .map(([searchDOM, buttonsDOM]) => {
                return div(".main-holder", [
                    , div('SC CycleJS')
                    , searchDOM
                    , buttonsDOM
                    ])
                }
            )
        , sinks = {
                   dom: dom$
                 , http: search$.http
          }
    return sinks
}

const drivers = {
    dom: makeDOMDriver('#app')
  , http: makeHTTPDriver()
}

run(main, drivers)
