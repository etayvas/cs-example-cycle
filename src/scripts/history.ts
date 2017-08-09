import xs from "xstream"
import delay from 'xstream/extra/delay'
import { Sources, Sinks } from '../scripts/definitions'
import {makeDOMDriver, DOMSource, VNode, div, button} from '@cycle/dom'

interface SHistorySources extends Sources.dom {}
interface SHistorySinks extends Sinks.dom {}

let LSStatus = false
  , prevInput = ""

localStorage && localStorage.getItem('history')
? console.log("LS exist")
: localStorage.setItem('history', "[ ]") // first init if not exist

function SHistory (sources: SHistorySources): SHistorySinks {

    const input$ = sources.dom.select(".search-input").events("input")
        .map(event =>  (event.target as HTMLInputElement).value )
        .startWith("")

    , clickOnTrack$ = sources.dom.select(".track-list div").events("click")
        .map(event =>  {
            LSStatus = true
            return true
        }
    )
    .startWith(false)

    , updateLS$ = xs.combine(clickOnTrack$, input$)
        .map(([track, input]) => {
            //refactor the LSStatus use + the prevInput checkup ****
            if(LSStatus && prevInput !== input && input.length > 2){
                let history:string[] = []
                history = JSON.parse(localStorage.getItem('history') as string)
                , history.length === 5 ? [history.shift() , history = [...history, input] ]: history = [...history, input]
                , localStorage.setItem('history', JSON.stringify(history))

                LSStatus = false
                prevInput = input
            }
        })

    , vtree$ = xs.combine(updateLS$)
        .map(([update]) => {
            let getHistory = JSON.parse(localStorage.getItem('history') as string).length // manipulate according to LS
            return div(".search-history",[
                , getHistory > 0 ? div("Recent Searches: ") : "" // decide if to show title
                , div(".history-items",
                        getHistory > -1 // show items if exists
                        ? (JSON.parse(localStorage.getItem('history') as string))
                            .map((item: string) => {
                                return div({dataset: {item: item}}, item)
                            })
                        : div()
                    )
                ]
            )
        })

    , sinks = {
        dom: vtree$
    }
    return sinks
}
export default SHistory
