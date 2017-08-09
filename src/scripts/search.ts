import xs from 'xstream'
import debounce from 'xstream/extra/debounce'
import { Sources, Sinks } from '../scripts/definitions'
import {makeDOMDriver, DOMSource, VNode, div, input, button} from '@cycle/dom'
import {makeHTTPDriver, HTTPSource, RequestOptions} from "@cycle/http"
import { SetList, SetTrack} from  './sc'
import SHistory from  './history'
interface SearchSources extends Sources.dom,Sources.http {}
interface SearchSinks extends Sinks.dom,Sinks.http {}

declare const SC: any
SC.initialize({
       client_id: "ggX0UomnLs0VmW7qZnCzw"
     });

/*user intended actions*/
function intent(sources: SearchSources) {
  return {
      typedSearch$: sources.dom.select(".search-input").events("keyup")
        .map((event) => (event.target as HTMLInputElement).value)
        .compose(debounce(800)) //delay when typing
        .startWith("")
    , clickOnTrack$: sources.dom.select(".track-list div").events("click")
        .map(event => {
            return (event.target as HTMLInputElement).id
        })
        .startWith("")
    , clickOnNext$: sources.dom.select(".button-next").events("click")
        .fold((x) => x + 6, 0)
        .map((count) => {
            return (count+6)
        })
    , clickOnHistory$: sources.dom.select(".history-items div").events("click")
        .map(event =>  {
            return ((event.currentTarget as HTMLDivElement).getAttribute("data-item") as string ) !== null
            ? ((event.currentTarget as HTMLDivElement).getAttribute("data-item") as string)
            : ""
        }
    )
    .startWith("")
    };
}

function Search (sources: SearchSources): SearchSinks {
    const actions = intent(sources)
    , cid= "ggX0UomnLs0VmW7qZnCzw"
    //either input or history item
    , userInput$ = xs.merge(actions.typedSearch$, actions.clickOnHistory$)
    , requestTrackList$ = xs.combine(userInput$, actions.clickOnNext$)
        // filter if more than 2 chars
        .filter(([userInput, next]) => (userInput.length > 2))
        .map(([userInput, next]) => {
        return {
              url: `https://api.soundcloud.com/tracks?format=json&client_id=${cid}&q=${userInput}&limit=6&linked_partitioning=1&offset=${next > 0 ? next : 0 }`
            , category: "list"
            }
        })
    , requestSingleTrack$ = xs.combine(userInput$, actions.clickOnTrack$)
        // filter if more than 2 chars and we have trackId
        .filter(([userInput, track]) => (userInput.length > 2 && track !== ""))
        .map(([userInput, track]) => {
            return {
                  url: `https://api.soundcloud.com/tracks/${track}?format=json&client_id=${cid}`
                , category: "track"
            }
        })
    , http$ = xs.merge(
        requestTrackList$
      , requestSingleTrack$
    )
    , resList$ = sources.http.select('list')
        .flatten()
        .map(res => res.body)
        .startWith(null)
    , list$ = xs.combine(resList$)
        .map(([list]) => {
            return list === null ? null : SetList(list.collection)
        })
    , resTrack$ = sources.http.select('track')
        .flatten()
        .map(trackData => {
            return trackData.body ? SetTrack(trackData.body) : div()
        }).startWith( div() )
    , history$ = SHistory({dom: sources.dom})
    , vtree$ = xs.combine(userInput$, list$, resTrack$, history$.dom)
        .map(([userInput, listDOM, trackDOM, historyDOM]) => {
            return div(".search-holder",[
                div('.search-field',[
                      input('.search-input',
                        {attrs: {type: 'text', name: 'search-input', placeholder: 'Type to search', value:'', autofocus:"autofocus"}})
                    ])
                ,div('.search-results',[
                        ...(!userInput
                            ? [div()]
                            : [listDOM, trackDOM])
                    ])
                ,historyDOM
                ])
            })

    , sinks = {
            dom: vtree$
          , http: http$
    }
    return sinks
}
export default Search
