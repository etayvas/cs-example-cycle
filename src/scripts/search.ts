import xs from 'xstream'
import debounce from 'xstream/extra/debounce'
import { Sources, Sinks } from '../scripts/definitions'
import {makeDOMDriver, DOMSource, VNode, div, input, button} from '@cycle/dom'
import {makeHTTPDriver, HTTPSource, RequestOptions} from "@cycle/http"
import { SetList, SetTrack} from  './sc'
import SHistory from  './history'
interface SearchSources extends Sources.dom,Sources.http {}
interface SearchSinks extends Sinks.dom,Sinks.http {}

let history:string[] = [] ;
//let ls = new LS.LocalStorageWorker
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
    // , clickOnPlay$: sources.dom.select(".stream-status").events("click")
    //     .fold(prev => !prev, false)
    // , clickOnIconPlay$: sources.dom.select(".playing").events("click")
    //     .mapTo(true)
    //     .startWith(false)
    // , clickOnIconPause$: sources.dom.select(".paused").events("click")
    //     .mapTo(true)
    //     .startWith(false)
    };
}

function Search (sources: SearchSources): SearchSinks {
    const actions = intent(sources)
    const cid= "ggX0UomnLs0VmW7qZnCzw"

    , requestTrackList$ = xs.combine(actions.typedSearch$, actions.clickOnNext$)
        // filter if more than 2 chars
        .filter(([input, next]) => input.length > 2)
        .map(([input, next]) => {
            //setup localStorage
            localStorage
            ? [
                localStorage.getItem('history') ? history = JSON.parse(localStorage.getItem('history') as string) : console.log('nothing in history (yet)')
                , history.length === 5 ? history.shift() : ""
                , history.push(input)
                , localStorage.setItem('history', JSON.stringify(history))
                , console.log(localStorage.getItem('history'))
            ]
            :   alert("can't use localStorage") //optimally needs to add fallbacks

        return {
              url: `https://api.soundcloud.com/tracks?format=json&client_id=${cid}&q=${input}&limit=6&linked_partitioning=1&offset=${next > 0 ? next : 0 }`
            , category: "list"
            }
        })
    , requestSingleTrack$ = xs.combine(actions.typedSearch$, actions.clickOnTrack$)
        // filter if more than 2 chars and we have trackId
        .filter(([input, track]) => (input.length > 2 && track !== ""))
        .map(([input, track]) => {
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
    , list$ = xs.combine(resList$, actions.typedSearch$)
        .map(([list, input]) => {
            return list === null ? null : SetList(list.collection)
        })
    , resTrack$ = sources.http.select('track')
        .flatten()
        //.map(res => { return res.body})
        //.startWith(false)
        .map(trackData => {
            return trackData.body ? SetTrack(trackData.body) : div()
        }).startWith(div())
    , history$ = SHistory({dom: sources.dom})
    , vtree$ = xs.combine(actions.typedSearch$, list$, resTrack$, history$.dom)
            .map(([typedSearch, listDOM, trackDOM, historyDOM]) => {
                return div(".search-holder",[
                    div('.search-field',[
                          input('.search-input',
                            {attrs: {type: 'text', name: 'search-input', placeholder: 'Type to search', value:'', autofocus:"autofocus"}})
                        ])
                    ,div('.search-results',[
                            ...(!typedSearch
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
