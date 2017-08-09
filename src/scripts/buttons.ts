import xs from "xstream"
import { Sources, Sinks } from '../scripts/definitions'
import {makeDOMDriver, DOMSource, VNode, div, button} from '@cycle/dom'

interface ButtonSources extends Sources.dom {}
interface ButtonSinks extends Sinks.dom {}

function Button (sources: ButtonSources): ButtonSinks {

    const vtree$ = xs.of(
        div(".buttons-area",[
                button('.button-next',"Next")
            //   , button('.button-list',"List")
            //   , button('.button-tile',"Tile")
        ])
    )
    const sinks = {
        dom: vtree$
    }
    return sinks
}
export default Button
