import xs from 'xstream'
import {DOMSource, VNode} from '@cycle/dom'
import {HTTPSource, RequestOptions} from '@cycle/http'

export namespace Sources {
    export interface dom {
        dom: DOMSource
    }
    export interface http {
        http: HTTPSource
    }
}
export namespace Sinks {
    export interface dom {
        dom: xs<VNode>
    }
    export interface http {
        http: xs<RequestOptions>
    }
}
