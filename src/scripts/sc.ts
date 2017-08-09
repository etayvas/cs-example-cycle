import xs from 'xstream'
import { Sources, Sinks } from '../scripts/definitions'
import {makeDOMDriver, DOMSource, VNode, div, img} from '@cycle/dom'

declare const SC: any

interface ScSources extends Sources.dom {}
interface ScSinks extends Sinks.dom {}
interface TrackData {
    id: string
    title: string
    created_at: string
    artwork_url: string
    streamStatus: boolean
}
interface Item {
    id: number
    title: string
}

let currentTrack = ""
    , player: any

//not used
function SetIcon(type:string){
    let   icon_play =  "https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-play-128.png"
        , icon_pause = "https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-pause-128.png"

    return type === "play"
        ? div(".paused",img({attrs: {src: icon_play}}))
        : div(".playing",img({attrs: {src: icon_pause}}))
}

//create the list from received data
export function SetList(resCollection: Item[]){
    const items = resCollection.map((item, index: Number) => {
        return div('.track-'+index, {attrs: {id: item.id}}, item.title)
    })
    , trackList = div('.track-list',items)
     return trackList
}


export function SetTrack(trackData: TrackData){
    //if player exist or clicked a new track
    (player === undefined || currentTrack !== trackData.id)
    ? [
      SC.stream('/tracks/'+trackData.id).then(function(stream: any){
       player = stream
       currentTrack = trackData.id
       player.play()
     })
    ]
    :  console.log("TODO: pause here and setup play")
    //create the track data
    return div('.track-data',[
    //   div(".stream-status",[
    //                 !streaming
    //                 ? SetIcon("play")
    //                 : SetIcon("pause")
    //           ]
    //         )
    //       ,
        div(".title",trackData.title)
      //, div(".description",TrackData.description)
      , div(".created",trackData.created_at)
      , trackData.artwork_url ? img(".artwork",{attrs: {src: trackData.artwork_url.replace("-large.jpg", "-t250x250.jpg")}}) : "[NO IMAGE]"
     // ,div('.controls',SetIcon("pause"))
    ])
}
