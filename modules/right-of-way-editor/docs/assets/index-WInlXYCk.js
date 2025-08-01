;(function () {
    const t = document.createElement('link').relList
    if (t && t.supports && t.supports('modulepreload')) return
    for (const l of document.querySelectorAll('link[rel="modulepreload"]')) r(l)
    new MutationObserver(l => {
        for (const o of l)
            if (o.type === 'childList')
                for (const i of o.addedNodes) i.tagName === 'LINK' && i.rel === 'modulepreload' && r(i)
    }).observe(document, { childList: !0, subtree: !0 })
    function n(l) {
        const o = {}
        return (
            l.integrity && (o.integrity = l.integrity),
            l.referrerPolicy && (o.referrerPolicy = l.referrerPolicy),
            l.crossOrigin === 'use-credentials'
                ? (o.credentials = 'include')
                : l.crossOrigin === 'anonymous'
                  ? (o.credentials = 'omit')
                  : (o.credentials = 'same-origin'),
            o
        )
    }
    function r(l) {
        if (l.ep) return
        l.ep = !0
        const o = n(l)
        fetch(l.href, o)
    }
})()
var Us = { exports: {} },
    Pl = {},
    $s = { exports: {} },
    I = {}
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var vr = Symbol.for('react.element'),
    pf = Symbol.for('react.portal'),
    hf = Symbol.for('react.fragment'),
    mf = Symbol.for('react.strict_mode'),
    gf = Symbol.for('react.profiler'),
    vf = Symbol.for('react.provider'),
    yf = Symbol.for('react.context'),
    wf = Symbol.for('react.forward_ref'),
    Sf = Symbol.for('react.suspense'),
    kf = Symbol.for('react.memo'),
    Ef = Symbol.for('react.lazy'),
    hu = Symbol.iterator
function xf(e) {
    return e === null || typeof e != 'object'
        ? null
        : ((e = (hu && e[hu]) || e['@@iterator']), typeof e == 'function' ? e : null)
}
var Vs = {
        isMounted: function () {
            return !1
        },
        enqueueForceUpdate: function () {},
        enqueueReplaceState: function () {},
        enqueueSetState: function () {},
    },
    Hs = Object.assign,
    Bs = {}
function Nn(e, t, n) {
    ;((this.props = e), (this.context = t), (this.refs = Bs), (this.updater = n || Vs))
}
Nn.prototype.isReactComponent = {}
Nn.prototype.setState = function (e, t) {
    if (typeof e != 'object' && typeof e != 'function' && e != null)
        throw Error(
            'setState(...): takes an object of state variables to update or a function which returns an object of state variables.',
        )
    this.updater.enqueueSetState(this, e, t, 'setState')
}
Nn.prototype.forceUpdate = function (e) {
    this.updater.enqueueForceUpdate(this, e, 'forceUpdate')
}
function Ws() {}
Ws.prototype = Nn.prototype
function gi(e, t, n) {
    ;((this.props = e), (this.context = t), (this.refs = Bs), (this.updater = n || Vs))
}
var vi = (gi.prototype = new Ws())
vi.constructor = gi
Hs(vi, Nn.prototype)
vi.isPureReactComponent = !0
var mu = Array.isArray,
    Gs = Object.prototype.hasOwnProperty,
    yi = { current: null },
    Qs = { key: !0, ref: !0, __self: !0, __source: !0 }
function Ks(e, t, n) {
    var r,
        l = {},
        o = null,
        i = null
    if (t != null)
        for (r in (t.ref !== void 0 && (i = t.ref), t.key !== void 0 && (o = '' + t.key), t))
            Gs.call(t, r) && !Qs.hasOwnProperty(r) && (l[r] = t[r])
    var u = arguments.length - 2
    if (u === 1) l.children = n
    else if (1 < u) {
        for (var s = Array(u), a = 0; a < u; a++) s[a] = arguments[a + 2]
        l.children = s
    }
    if (e && e.defaultProps) for (r in ((u = e.defaultProps), u)) l[r] === void 0 && (l[r] = u[r])
    return { $$typeof: vr, type: e, key: o, ref: i, props: l, _owner: yi.current }
}
function Cf(e, t) {
    return { $$typeof: vr, type: e.type, key: t, ref: e.ref, props: e.props, _owner: e._owner }
}
function wi(e) {
    return typeof e == 'object' && e !== null && e.$$typeof === vr
}
function _f(e) {
    var t = { '=': '=0', ':': '=2' }
    return (
        '$' +
        e.replace(/[=:]/g, function (n) {
            return t[n]
        })
    )
}
var gu = /\/+/g
function Bl(e, t) {
    return typeof e == 'object' && e !== null && e.key != null ? _f('' + e.key) : t.toString(36)
}
function Hr(e, t, n, r, l) {
    var o = typeof e
    ;(o === 'undefined' || o === 'boolean') && (e = null)
    var i = !1
    if (e === null) i = !0
    else
        switch (o) {
            case 'string':
            case 'number':
                i = !0
                break
            case 'object':
                switch (e.$$typeof) {
                    case vr:
                    case pf:
                        i = !0
                }
        }
    if (i)
        return (
            (i = e),
            (l = l(i)),
            (e = r === '' ? '.' + Bl(i, 0) : r),
            mu(l)
                ? ((n = ''),
                  e != null && (n = e.replace(gu, '$&/') + '/'),
                  Hr(l, t, n, '', function (a) {
                      return a
                  }))
                : l != null &&
                  (wi(l) &&
                      (l = Cf(
                          l,
                          n + (!l.key || (i && i.key === l.key) ? '' : ('' + l.key).replace(gu, '$&/') + '/') + e,
                      )),
                  t.push(l)),
            1
        )
    if (((i = 0), (r = r === '' ? '.' : r + ':'), mu(e)))
        for (var u = 0; u < e.length; u++) {
            o = e[u]
            var s = r + Bl(o, u)
            i += Hr(o, t, n, s, l)
        }
    else if (((s = xf(e)), typeof s == 'function'))
        for (e = s.call(e), u = 0; !(o = e.next()).done; )
            ((o = o.value), (s = r + Bl(o, u++)), (i += Hr(o, t, n, s, l)))
    else if (o === 'object')
        throw (
            (t = String(e)),
            Error(
                'Objects are not valid as a React child (found: ' +
                    (t === '[object Object]' ? 'object with keys {' + Object.keys(e).join(', ') + '}' : t) +
                    '). If you meant to render a collection of children, use an array instead.',
            )
        )
    return i
}
function Cr(e, t, n) {
    if (e == null) return e
    var r = [],
        l = 0
    return (
        Hr(e, r, '', '', function (o) {
            return t.call(n, o, l++)
        }),
        r
    )
}
function Nf(e) {
    if (e._status === -1) {
        var t = e._result
        ;((t = t()),
            t.then(
                function (n) {
                    ;(e._status === 0 || e._status === -1) && ((e._status = 1), (e._result = n))
                },
                function (n) {
                    ;(e._status === 0 || e._status === -1) && ((e._status = 2), (e._result = n))
                },
            ),
            e._status === -1 && ((e._status = 0), (e._result = t)))
    }
    if (e._status === 1) return e._result.default
    throw e._result
}
var he = { current: null },
    Br = { transition: null },
    Pf = { ReactCurrentDispatcher: he, ReactCurrentBatchConfig: Br, ReactCurrentOwner: yi }
function Ys() {
    throw Error('act(...) is not supported in production builds of React.')
}
I.Children = {
    map: Cr,
    forEach: function (e, t, n) {
        Cr(
            e,
            function () {
                t.apply(this, arguments)
            },
            n,
        )
    },
    count: function (e) {
        var t = 0
        return (
            Cr(e, function () {
                t++
            }),
            t
        )
    },
    toArray: function (e) {
        return (
            Cr(e, function (t) {
                return t
            }) || []
        )
    },
    only: function (e) {
        if (!wi(e)) throw Error('React.Children.only expected to receive a single React element child.')
        return e
    },
}
I.Component = Nn
I.Fragment = hf
I.Profiler = gf
I.PureComponent = gi
I.StrictMode = mf
I.Suspense = Sf
I.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Pf
I.act = Ys
I.cloneElement = function (e, t, n) {
    if (e == null)
        throw Error('React.cloneElement(...): The argument must be a React element, but you passed ' + e + '.')
    var r = Hs({}, e.props),
        l = e.key,
        o = e.ref,
        i = e._owner
    if (t != null) {
        if (
            (t.ref !== void 0 && ((o = t.ref), (i = yi.current)),
            t.key !== void 0 && (l = '' + t.key),
            e.type && e.type.defaultProps)
        )
            var u = e.type.defaultProps
        for (s in t) Gs.call(t, s) && !Qs.hasOwnProperty(s) && (r[s] = t[s] === void 0 && u !== void 0 ? u[s] : t[s])
    }
    var s = arguments.length - 2
    if (s === 1) r.children = n
    else if (1 < s) {
        u = Array(s)
        for (var a = 0; a < s; a++) u[a] = arguments[a + 2]
        r.children = u
    }
    return { $$typeof: vr, type: e.type, key: l, ref: o, props: r, _owner: i }
}
I.createContext = function (e) {
    return (
        (e = {
            $$typeof: yf,
            _currentValue: e,
            _currentValue2: e,
            _threadCount: 0,
            Provider: null,
            Consumer: null,
            _defaultValue: null,
            _globalName: null,
        }),
        (e.Provider = { $$typeof: vf, _context: e }),
        (e.Consumer = e)
    )
}
I.createElement = Ks
I.createFactory = function (e) {
    var t = Ks.bind(null, e)
    return ((t.type = e), t)
}
I.createRef = function () {
    return { current: null }
}
I.forwardRef = function (e) {
    return { $$typeof: wf, render: e }
}
I.isValidElement = wi
I.lazy = function (e) {
    return { $$typeof: Ef, _payload: { _status: -1, _result: e }, _init: Nf }
}
I.memo = function (e, t) {
    return { $$typeof: kf, type: e, compare: t === void 0 ? null : t }
}
I.startTransition = function (e) {
    var t = Br.transition
    Br.transition = {}
    try {
        e()
    } finally {
        Br.transition = t
    }
}
I.unstable_act = Ys
I.useCallback = function (e, t) {
    return he.current.useCallback(e, t)
}
I.useContext = function (e) {
    return he.current.useContext(e)
}
I.useDebugValue = function () {}
I.useDeferredValue = function (e) {
    return he.current.useDeferredValue(e)
}
I.useEffect = function (e, t) {
    return he.current.useEffect(e, t)
}
I.useId = function () {
    return he.current.useId()
}
I.useImperativeHandle = function (e, t, n) {
    return he.current.useImperativeHandle(e, t, n)
}
I.useInsertionEffect = function (e, t) {
    return he.current.useInsertionEffect(e, t)
}
I.useLayoutEffect = function (e, t) {
    return he.current.useLayoutEffect(e, t)
}
I.useMemo = function (e, t) {
    return he.current.useMemo(e, t)
}
I.useReducer = function (e, t, n) {
    return he.current.useReducer(e, t, n)
}
I.useRef = function (e) {
    return he.current.useRef(e)
}
I.useState = function (e) {
    return he.current.useState(e)
}
I.useSyncExternalStore = function (e, t, n) {
    return he.current.useSyncExternalStore(e, t, n)
}
I.useTransition = function () {
    return he.current.useTransition()
}
I.version = '18.3.1'
$s.exports = I
var z = $s.exports
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Tf = z,
    Lf = Symbol.for('react.element'),
    Mf = Symbol.for('react.fragment'),
    zf = Object.prototype.hasOwnProperty,
    Rf = Tf.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
    Df = { key: !0, ref: !0, __self: !0, __source: !0 }
function Xs(e, t, n) {
    var r,
        l = {},
        o = null,
        i = null
    ;(n !== void 0 && (o = '' + n), t.key !== void 0 && (o = '' + t.key), t.ref !== void 0 && (i = t.ref))
    for (r in t) zf.call(t, r) && !Df.hasOwnProperty(r) && (l[r] = t[r])
    if (e && e.defaultProps) for (r in ((t = e.defaultProps), t)) l[r] === void 0 && (l[r] = t[r])
    return { $$typeof: Lf, type: e, key: o, ref: i, props: l, _owner: Rf.current }
}
Pl.Fragment = Mf
Pl.jsx = Xs
Pl.jsxs = Xs
Us.exports = Pl
var S = Us.exports,
    So = {},
    Zs = { exports: {} },
    Pe = {},
    Js = { exports: {} },
    qs = {}
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ ;(function (e) {
    function t(T, M) {
        var D = T.length
        T.push(M)
        e: for (; 0 < D; ) {
            var $ = (D - 1) >>> 1,
                q = T[$]
            if (0 < l(q, M)) ((T[$] = M), (T[D] = q), (D = $))
            else break e
        }
    }
    function n(T) {
        return T.length === 0 ? null : T[0]
    }
    function r(T) {
        if (T.length === 0) return null
        var M = T[0],
            D = T.pop()
        if (D !== M) {
            T[0] = D
            e: for (var $ = 0, q = T.length, Ln = q >>> 1; $ < Ln; ) {
                var qe = 2 * ($ + 1) - 1,
                    Mn = T[qe],
                    Qe = qe + 1,
                    qt = T[Qe]
                if (0 > l(Mn, D))
                    Qe < q && 0 > l(qt, Mn)
                        ? ((T[$] = qt), (T[Qe] = D), ($ = Qe))
                        : ((T[$] = Mn), (T[qe] = D), ($ = qe))
                else if (Qe < q && 0 > l(qt, D)) ((T[$] = qt), (T[Qe] = D), ($ = Qe))
                else break e
            }
        }
        return M
    }
    function l(T, M) {
        var D = T.sortIndex - M.sortIndex
        return D !== 0 ? D : T.id - M.id
    }
    if (typeof performance == 'object' && typeof performance.now == 'function') {
        var o = performance
        e.unstable_now = function () {
            return o.now()
        }
    } else {
        var i = Date,
            u = i.now()
        e.unstable_now = function () {
            return i.now() - u
        }
    }
    var s = [],
        a = [],
        m = 1,
        h = null,
        d = 3,
        g = !1,
        v = !1,
        k = !1,
        N = typeof setTimeout == 'function' ? setTimeout : null,
        f = typeof clearTimeout == 'function' ? clearTimeout : null,
        c = typeof setImmediate < 'u' ? setImmediate : null
    typeof navigator < 'u' &&
        navigator.scheduling !== void 0 &&
        navigator.scheduling.isInputPending !== void 0 &&
        navigator.scheduling.isInputPending.bind(navigator.scheduling)
    function p(T) {
        for (var M = n(a); M !== null; ) {
            if (M.callback === null) r(a)
            else if (M.startTime <= T) (r(a), (M.sortIndex = M.expirationTime), t(s, M))
            else break
            M = n(a)
        }
    }
    function y(T) {
        if (((k = !1), p(T), !v))
            if (n(s) !== null) ((v = !0), A(w))
            else {
                var M = n(a)
                M !== null && W(y, M.startTime - T)
            }
    }
    function w(T, M) {
        ;((v = !1), k && ((k = !1), f(_), (_ = -1)), (g = !0))
        var D = d
        try {
            for (p(M), h = n(s); h !== null && (!(h.expirationTime > M) || (T && !R())); ) {
                var $ = h.callback
                if (typeof $ == 'function') {
                    ;((h.callback = null), (d = h.priorityLevel))
                    var q = $(h.expirationTime <= M)
                    ;((M = e.unstable_now()), typeof q == 'function' ? (h.callback = q) : h === n(s) && r(s), p(M))
                } else r(s)
                h = n(s)
            }
            if (h !== null) var Ln = !0
            else {
                var qe = n(a)
                ;(qe !== null && W(y, qe.startTime - M), (Ln = !1))
            }
            return Ln
        } finally {
            ;((h = null), (d = D), (g = !1))
        }
    }
    var C = !1,
        x = null,
        _ = -1,
        O = 5,
        P = -1
    function R() {
        return !(e.unstable_now() - P < O)
    }
    function X() {
        if (x !== null) {
            var T = e.unstable_now()
            P = T
            var M = !0
            try {
                M = x(!0, T)
            } finally {
                M ? Le() : ((C = !1), (x = null))
            }
        } else C = !1
    }
    var Le
    if (typeof c == 'function')
        Le = function () {
            c(X)
        }
    else if (typeof MessageChannel < 'u') {
        var Fe = new MessageChannel(),
            j = Fe.port2
        ;((Fe.port1.onmessage = X),
            (Le = function () {
                j.postMessage(null)
            }))
    } else
        Le = function () {
            N(X, 0)
        }
    function A(T) {
        ;((x = T), C || ((C = !0), Le()))
    }
    function W(T, M) {
        _ = N(function () {
            T(e.unstable_now())
        }, M)
    }
    ;((e.unstable_IdlePriority = 5),
        (e.unstable_ImmediatePriority = 1),
        (e.unstable_LowPriority = 4),
        (e.unstable_NormalPriority = 3),
        (e.unstable_Profiling = null),
        (e.unstable_UserBlockingPriority = 2),
        (e.unstable_cancelCallback = function (T) {
            T.callback = null
        }),
        (e.unstable_continueExecution = function () {
            v || g || ((v = !0), A(w))
        }),
        (e.unstable_forceFrameRate = function (T) {
            0 > T || 125 < T
                ? console.error(
                      'forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported',
                  )
                : (O = 0 < T ? Math.floor(1e3 / T) : 5)
        }),
        (e.unstable_getCurrentPriorityLevel = function () {
            return d
        }),
        (e.unstable_getFirstCallbackNode = function () {
            return n(s)
        }),
        (e.unstable_next = function (T) {
            switch (d) {
                case 1:
                case 2:
                case 3:
                    var M = 3
                    break
                default:
                    M = d
            }
            var D = d
            d = M
            try {
                return T()
            } finally {
                d = D
            }
        }),
        (e.unstable_pauseExecution = function () {}),
        (e.unstable_requestPaint = function () {}),
        (e.unstable_runWithPriority = function (T, M) {
            switch (T) {
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                    break
                default:
                    T = 3
            }
            var D = d
            d = T
            try {
                return M()
            } finally {
                d = D
            }
        }),
        (e.unstable_scheduleCallback = function (T, M, D) {
            var $ = e.unstable_now()
            switch (
                (typeof D == 'object' && D !== null
                    ? ((D = D.delay), (D = typeof D == 'number' && 0 < D ? $ + D : $))
                    : (D = $),
                T)
            ) {
                case 1:
                    var q = -1
                    break
                case 2:
                    q = 250
                    break
                case 5:
                    q = 1073741823
                    break
                case 4:
                    q = 1e4
                    break
                default:
                    q = 5e3
            }
            return (
                (q = D + q),
                (T = { id: m++, callback: M, priorityLevel: T, startTime: D, expirationTime: q, sortIndex: -1 }),
                D > $
                    ? ((T.sortIndex = D),
                      t(a, T),
                      n(s) === null && T === n(a) && (k ? (f(_), (_ = -1)) : (k = !0), W(y, D - $)))
                    : ((T.sortIndex = q), t(s, T), v || g || ((v = !0), A(w))),
                T
            )
        }),
        (e.unstable_shouldYield = R),
        (e.unstable_wrapCallback = function (T) {
            var M = d
            return function () {
                var D = d
                d = M
                try {
                    return T.apply(this, arguments)
                } finally {
                    d = D
                }
            }
        }))
})(qs)
Js.exports = qs
var Of = Js.exports
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var jf = z,
    Ne = Of
function E(e) {
    for (var t = 'https://reactjs.org/docs/error-decoder.html?invariant=' + e, n = 1; n < arguments.length; n++)
        t += '&args[]=' + encodeURIComponent(arguments[n])
    return (
        'Minified React error #' +
        e +
        '; visit ' +
        t +
        ' for the full message or use the non-minified dev environment for full errors and additional helpful warnings.'
    )
}
var bs = new Set(),
    bn = {}
function Zt(e, t) {
    ;(wn(e, t), wn(e + 'Capture', t))
}
function wn(e, t) {
    for (bn[e] = t, e = 0; e < t.length; e++) bs.add(t[e])
}
var ut = !(typeof window > 'u' || typeof window.document > 'u' || typeof window.document.createElement > 'u'),
    ko = Object.prototype.hasOwnProperty,
    If =
        /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,
    vu = {},
    yu = {}
function Ff(e) {
    return ko.call(yu, e) ? !0 : ko.call(vu, e) ? !1 : If.test(e) ? (yu[e] = !0) : ((vu[e] = !0), !1)
}
function Af(e, t, n, r) {
    if (n !== null && n.type === 0) return !1
    switch (typeof t) {
        case 'function':
        case 'symbol':
            return !0
        case 'boolean':
            return r
                ? !1
                : n !== null
                  ? !n.acceptsBooleans
                  : ((e = e.toLowerCase().slice(0, 5)), e !== 'data-' && e !== 'aria-')
        default:
            return !1
    }
}
function Uf(e, t, n, r) {
    if (t === null || typeof t > 'u' || Af(e, t, n, r)) return !0
    if (r) return !1
    if (n !== null)
        switch (n.type) {
            case 3:
                return !t
            case 4:
                return t === !1
            case 5:
                return isNaN(t)
            case 6:
                return isNaN(t) || 1 > t
        }
    return !1
}
function me(e, t, n, r, l, o, i) {
    ;((this.acceptsBooleans = t === 2 || t === 3 || t === 4),
        (this.attributeName = r),
        (this.attributeNamespace = l),
        (this.mustUseProperty = n),
        (this.propertyName = e),
        (this.type = t),
        (this.sanitizeURL = o),
        (this.removeEmptyString = i))
}
var ie = {}
'children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style'
    .split(' ')
    .forEach(function (e) {
        ie[e] = new me(e, 0, !1, e, null, !1, !1)
    })
;[
    ['acceptCharset', 'accept-charset'],
    ['className', 'class'],
    ['htmlFor', 'for'],
    ['httpEquiv', 'http-equiv'],
].forEach(function (e) {
    var t = e[0]
    ie[t] = new me(t, 1, !1, e[1], null, !1, !1)
})
;['contentEditable', 'draggable', 'spellCheck', 'value'].forEach(function (e) {
    ie[e] = new me(e, 2, !1, e.toLowerCase(), null, !1, !1)
})
;['autoReverse', 'externalResourcesRequired', 'focusable', 'preserveAlpha'].forEach(function (e) {
    ie[e] = new me(e, 2, !1, e, null, !1, !1)
})
'allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope'
    .split(' ')
    .forEach(function (e) {
        ie[e] = new me(e, 3, !1, e.toLowerCase(), null, !1, !1)
    })
;['checked', 'multiple', 'muted', 'selected'].forEach(function (e) {
    ie[e] = new me(e, 3, !0, e, null, !1, !1)
})
;['capture', 'download'].forEach(function (e) {
    ie[e] = new me(e, 4, !1, e, null, !1, !1)
})
;['cols', 'rows', 'size', 'span'].forEach(function (e) {
    ie[e] = new me(e, 6, !1, e, null, !1, !1)
})
;['rowSpan', 'start'].forEach(function (e) {
    ie[e] = new me(e, 5, !1, e.toLowerCase(), null, !1, !1)
})
var Si = /[\-:]([a-z])/g
function ki(e) {
    return e[1].toUpperCase()
}
'accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height'
    .split(' ')
    .forEach(function (e) {
        var t = e.replace(Si, ki)
        ie[t] = new me(t, 1, !1, e, null, !1, !1)
    })
'xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type'.split(' ').forEach(function (e) {
    var t = e.replace(Si, ki)
    ie[t] = new me(t, 1, !1, e, 'http://www.w3.org/1999/xlink', !1, !1)
})
;['xml:base', 'xml:lang', 'xml:space'].forEach(function (e) {
    var t = e.replace(Si, ki)
    ie[t] = new me(t, 1, !1, e, 'http://www.w3.org/XML/1998/namespace', !1, !1)
})
;['tabIndex', 'crossOrigin'].forEach(function (e) {
    ie[e] = new me(e, 1, !1, e.toLowerCase(), null, !1, !1)
})
ie.xlinkHref = new me('xlinkHref', 1, !1, 'xlink:href', 'http://www.w3.org/1999/xlink', !0, !1)
;['src', 'href', 'action', 'formAction'].forEach(function (e) {
    ie[e] = new me(e, 1, !1, e.toLowerCase(), null, !0, !0)
})
function Ei(e, t, n, r) {
    var l = ie.hasOwnProperty(t) ? ie[t] : null
    ;(l !== null
        ? l.type !== 0
        : r || !(2 < t.length) || (t[0] !== 'o' && t[0] !== 'O') || (t[1] !== 'n' && t[1] !== 'N')) &&
        (Uf(t, n, l, r) && (n = null),
        r || l === null
            ? Ff(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, '' + n))
            : l.mustUseProperty
              ? (e[l.propertyName] = n === null ? (l.type === 3 ? !1 : '') : n)
              : ((t = l.attributeName),
                (r = l.attributeNamespace),
                n === null
                    ? e.removeAttribute(t)
                    : ((l = l.type),
                      (n = l === 3 || (l === 4 && n === !0) ? '' : '' + n),
                      r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))))
}
var dt = jf.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
    _r = Symbol.for('react.element'),
    en = Symbol.for('react.portal'),
    tn = Symbol.for('react.fragment'),
    xi = Symbol.for('react.strict_mode'),
    Eo = Symbol.for('react.profiler'),
    ea = Symbol.for('react.provider'),
    ta = Symbol.for('react.context'),
    Ci = Symbol.for('react.forward_ref'),
    xo = Symbol.for('react.suspense'),
    Co = Symbol.for('react.suspense_list'),
    _i = Symbol.for('react.memo'),
    ht = Symbol.for('react.lazy'),
    na = Symbol.for('react.offscreen'),
    wu = Symbol.iterator
function zn(e) {
    return e === null || typeof e != 'object'
        ? null
        : ((e = (wu && e[wu]) || e['@@iterator']), typeof e == 'function' ? e : null)
}
var Y = Object.assign,
    Wl
function $n(e) {
    if (Wl === void 0)
        try {
            throw Error()
        } catch (n) {
            var t = n.stack.trim().match(/\n( *(at )?)/)
            Wl = (t && t[1]) || ''
        }
    return (
        `
` +
        Wl +
        e
    )
}
var Gl = !1
function Ql(e, t) {
    if (!e || Gl) return ''
    Gl = !0
    var n = Error.prepareStackTrace
    Error.prepareStackTrace = void 0
    try {
        if (t)
            if (
                ((t = function () {
                    throw Error()
                }),
                Object.defineProperty(t.prototype, 'props', {
                    set: function () {
                        throw Error()
                    },
                }),
                typeof Reflect == 'object' && Reflect.construct)
            ) {
                try {
                    Reflect.construct(t, [])
                } catch (a) {
                    var r = a
                }
                Reflect.construct(e, [], t)
            } else {
                try {
                    t.call()
                } catch (a) {
                    r = a
                }
                e.call(t.prototype)
            }
        else {
            try {
                throw Error()
            } catch (a) {
                r = a
            }
            e()
        }
    } catch (a) {
        if (a && r && typeof a.stack == 'string') {
            for (
                var l = a.stack.split(`
`),
                    o = r.stack.split(`
`),
                    i = l.length - 1,
                    u = o.length - 1;
                1 <= i && 0 <= u && l[i] !== o[u];

            )
                u--
            for (; 1 <= i && 0 <= u; i--, u--)
                if (l[i] !== o[u]) {
                    if (i !== 1 || u !== 1)
                        do
                            if ((i--, u--, 0 > u || l[i] !== o[u])) {
                                var s =
                                    `
` + l[i].replace(' at new ', ' at ')
                                return (
                                    e.displayName &&
                                        s.includes('<anonymous>') &&
                                        (s = s.replace('<anonymous>', e.displayName)),
                                    s
                                )
                            }
                        while (1 <= i && 0 <= u)
                    break
                }
        }
    } finally {
        ;((Gl = !1), (Error.prepareStackTrace = n))
    }
    return (e = e ? e.displayName || e.name : '') ? $n(e) : ''
}
function $f(e) {
    switch (e.tag) {
        case 5:
            return $n(e.type)
        case 16:
            return $n('Lazy')
        case 13:
            return $n('Suspense')
        case 19:
            return $n('SuspenseList')
        case 0:
        case 2:
        case 15:
            return ((e = Ql(e.type, !1)), e)
        case 11:
            return ((e = Ql(e.type.render, !1)), e)
        case 1:
            return ((e = Ql(e.type, !0)), e)
        default:
            return ''
    }
}
function _o(e) {
    if (e == null) return null
    if (typeof e == 'function') return e.displayName || e.name || null
    if (typeof e == 'string') return e
    switch (e) {
        case tn:
            return 'Fragment'
        case en:
            return 'Portal'
        case Eo:
            return 'Profiler'
        case xi:
            return 'StrictMode'
        case xo:
            return 'Suspense'
        case Co:
            return 'SuspenseList'
    }
    if (typeof e == 'object')
        switch (e.$$typeof) {
            case ta:
                return (e.displayName || 'Context') + '.Consumer'
            case ea:
                return (e._context.displayName || 'Context') + '.Provider'
            case Ci:
                var t = e.render
                return (
                    (e = e.displayName),
                    e || ((e = t.displayName || t.name || ''), (e = e !== '' ? 'ForwardRef(' + e + ')' : 'ForwardRef')),
                    e
                )
            case _i:
                return ((t = e.displayName || null), t !== null ? t : _o(e.type) || 'Memo')
            case ht:
                ;((t = e._payload), (e = e._init))
                try {
                    return _o(e(t))
                } catch {}
        }
    return null
}
function Vf(e) {
    var t = e.type
    switch (e.tag) {
        case 24:
            return 'Cache'
        case 9:
            return (t.displayName || 'Context') + '.Consumer'
        case 10:
            return (t._context.displayName || 'Context') + '.Provider'
        case 18:
            return 'DehydratedFragment'
        case 11:
            return (
                (e = t.render),
                (e = e.displayName || e.name || ''),
                t.displayName || (e !== '' ? 'ForwardRef(' + e + ')' : 'ForwardRef')
            )
        case 7:
            return 'Fragment'
        case 5:
            return t
        case 4:
            return 'Portal'
        case 3:
            return 'Root'
        case 6:
            return 'Text'
        case 16:
            return _o(t)
        case 8:
            return t === xi ? 'StrictMode' : 'Mode'
        case 22:
            return 'Offscreen'
        case 12:
            return 'Profiler'
        case 21:
            return 'Scope'
        case 13:
            return 'Suspense'
        case 19:
            return 'SuspenseList'
        case 25:
            return 'TracingMarker'
        case 1:
        case 0:
        case 17:
        case 2:
        case 14:
        case 15:
            if (typeof t == 'function') return t.displayName || t.name || null
            if (typeof t == 'string') return t
    }
    return null
}
function Tt(e) {
    switch (typeof e) {
        case 'boolean':
        case 'number':
        case 'string':
        case 'undefined':
            return e
        case 'object':
            return e
        default:
            return ''
    }
}
function ra(e) {
    var t = e.type
    return (e = e.nodeName) && e.toLowerCase() === 'input' && (t === 'checkbox' || t === 'radio')
}
function Hf(e) {
    var t = ra(e) ? 'checked' : 'value',
        n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t),
        r = '' + e[t]
    if (!e.hasOwnProperty(t) && typeof n < 'u' && typeof n.get == 'function' && typeof n.set == 'function') {
        var l = n.get,
            o = n.set
        return (
            Object.defineProperty(e, t, {
                configurable: !0,
                get: function () {
                    return l.call(this)
                },
                set: function (i) {
                    ;((r = '' + i), o.call(this, i))
                },
            }),
            Object.defineProperty(e, t, { enumerable: n.enumerable }),
            {
                getValue: function () {
                    return r
                },
                setValue: function (i) {
                    r = '' + i
                },
                stopTracking: function () {
                    ;((e._valueTracker = null), delete e[t])
                },
            }
        )
    }
}
function Nr(e) {
    e._valueTracker || (e._valueTracker = Hf(e))
}
function la(e) {
    if (!e) return !1
    var t = e._valueTracker
    if (!t) return !0
    var n = t.getValue(),
        r = ''
    return (e && (r = ra(e) ? (e.checked ? 'true' : 'false') : e.value), (e = r), e !== n ? (t.setValue(e), !0) : !1)
}
function el(e) {
    if (((e = e || (typeof document < 'u' ? document : void 0)), typeof e > 'u')) return null
    try {
        return e.activeElement || e.body
    } catch {
        return e.body
    }
}
function No(e, t) {
    var n = t.checked
    return Y({}, t, {
        defaultChecked: void 0,
        defaultValue: void 0,
        value: void 0,
        checked: n ?? e._wrapperState.initialChecked,
    })
}
function Su(e, t) {
    var n = t.defaultValue == null ? '' : t.defaultValue,
        r = t.checked != null ? t.checked : t.defaultChecked
    ;((n = Tt(t.value != null ? t.value : n)),
        (e._wrapperState = {
            initialChecked: r,
            initialValue: n,
            controlled: t.type === 'checkbox' || t.type === 'radio' ? t.checked != null : t.value != null,
        }))
}
function oa(e, t) {
    ;((t = t.checked), t != null && Ei(e, 'checked', t, !1))
}
function Po(e, t) {
    oa(e, t)
    var n = Tt(t.value),
        r = t.type
    if (n != null)
        r === 'number'
            ? ((n === 0 && e.value === '') || e.value != n) && (e.value = '' + n)
            : e.value !== '' + n && (e.value = '' + n)
    else if (r === 'submit' || r === 'reset') {
        e.removeAttribute('value')
        return
    }
    ;(t.hasOwnProperty('value')
        ? To(e, t.type, n)
        : t.hasOwnProperty('defaultValue') && To(e, t.type, Tt(t.defaultValue)),
        t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked))
}
function ku(e, t, n) {
    if (t.hasOwnProperty('value') || t.hasOwnProperty('defaultValue')) {
        var r = t.type
        if (!((r !== 'submit' && r !== 'reset') || (t.value !== void 0 && t.value !== null))) return
        ;((t = '' + e._wrapperState.initialValue), n || t === e.value || (e.value = t), (e.defaultValue = t))
    }
    ;((n = e.name),
        n !== '' && (e.name = ''),
        (e.defaultChecked = !!e._wrapperState.initialChecked),
        n !== '' && (e.name = n))
}
function To(e, t, n) {
    ;(t !== 'number' || el(e.ownerDocument) !== e) &&
        (n == null
            ? (e.defaultValue = '' + e._wrapperState.initialValue)
            : e.defaultValue !== '' + n && (e.defaultValue = '' + n))
}
var Vn = Array.isArray
function pn(e, t, n, r) {
    if (((e = e.options), t)) {
        t = {}
        for (var l = 0; l < n.length; l++) t['$' + n[l]] = !0
        for (n = 0; n < e.length; n++)
            ((l = t.hasOwnProperty('$' + e[n].value)),
                e[n].selected !== l && (e[n].selected = l),
                l && r && (e[n].defaultSelected = !0))
    } else {
        for (n = '' + Tt(n), t = null, l = 0; l < e.length; l++) {
            if (e[l].value === n) {
                ;((e[l].selected = !0), r && (e[l].defaultSelected = !0))
                return
            }
            t !== null || e[l].disabled || (t = e[l])
        }
        t !== null && (t.selected = !0)
    }
}
function Lo(e, t) {
    if (t.dangerouslySetInnerHTML != null) throw Error(E(91))
    return Y({}, t, { value: void 0, defaultValue: void 0, children: '' + e._wrapperState.initialValue })
}
function Eu(e, t) {
    var n = t.value
    if (n == null) {
        if (((n = t.children), (t = t.defaultValue), n != null)) {
            if (t != null) throw Error(E(92))
            if (Vn(n)) {
                if (1 < n.length) throw Error(E(93))
                n = n[0]
            }
            t = n
        }
        ;(t == null && (t = ''), (n = t))
    }
    e._wrapperState = { initialValue: Tt(n) }
}
function ia(e, t) {
    var n = Tt(t.value),
        r = Tt(t.defaultValue)
    ;(n != null &&
        ((n = '' + n),
        n !== e.value && (e.value = n),
        t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)),
        r != null && (e.defaultValue = '' + r))
}
function xu(e) {
    var t = e.textContent
    t === e._wrapperState.initialValue && t !== '' && t !== null && (e.value = t)
}
function ua(e) {
    switch (e) {
        case 'svg':
            return 'http://www.w3.org/2000/svg'
        case 'math':
            return 'http://www.w3.org/1998/Math/MathML'
        default:
            return 'http://www.w3.org/1999/xhtml'
    }
}
function Mo(e, t) {
    return e == null || e === 'http://www.w3.org/1999/xhtml'
        ? ua(t)
        : e === 'http://www.w3.org/2000/svg' && t === 'foreignObject'
          ? 'http://www.w3.org/1999/xhtml'
          : e
}
var Pr,
    sa = (function (e) {
        return typeof MSApp < 'u' && MSApp.execUnsafeLocalFunction
            ? function (t, n, r, l) {
                  MSApp.execUnsafeLocalFunction(function () {
                      return e(t, n, r, l)
                  })
              }
            : e
    })(function (e, t) {
        if (e.namespaceURI !== 'http://www.w3.org/2000/svg' || 'innerHTML' in e) e.innerHTML = t
        else {
            for (
                Pr = Pr || document.createElement('div'),
                    Pr.innerHTML = '<svg>' + t.valueOf().toString() + '</svg>',
                    t = Pr.firstChild;
                e.firstChild;

            )
                e.removeChild(e.firstChild)
            for (; t.firstChild; ) e.appendChild(t.firstChild)
        }
    })
function er(e, t) {
    if (t) {
        var n = e.firstChild
        if (n && n === e.lastChild && n.nodeType === 3) {
            n.nodeValue = t
            return
        }
    }
    e.textContent = t
}
var Wn = {
        animationIterationCount: !0,
        aspectRatio: !0,
        borderImageOutset: !0,
        borderImageSlice: !0,
        borderImageWidth: !0,
        boxFlex: !0,
        boxFlexGroup: !0,
        boxOrdinalGroup: !0,
        columnCount: !0,
        columns: !0,
        flex: !0,
        flexGrow: !0,
        flexPositive: !0,
        flexShrink: !0,
        flexNegative: !0,
        flexOrder: !0,
        gridArea: !0,
        gridRow: !0,
        gridRowEnd: !0,
        gridRowSpan: !0,
        gridRowStart: !0,
        gridColumn: !0,
        gridColumnEnd: !0,
        gridColumnSpan: !0,
        gridColumnStart: !0,
        fontWeight: !0,
        lineClamp: !0,
        lineHeight: !0,
        opacity: !0,
        order: !0,
        orphans: !0,
        tabSize: !0,
        widows: !0,
        zIndex: !0,
        zoom: !0,
        fillOpacity: !0,
        floodOpacity: !0,
        stopOpacity: !0,
        strokeDasharray: !0,
        strokeDashoffset: !0,
        strokeMiterlimit: !0,
        strokeOpacity: !0,
        strokeWidth: !0,
    },
    Bf = ['Webkit', 'ms', 'Moz', 'O']
Object.keys(Wn).forEach(function (e) {
    Bf.forEach(function (t) {
        ;((t = t + e.charAt(0).toUpperCase() + e.substring(1)), (Wn[t] = Wn[e]))
    })
})
function aa(e, t, n) {
    return t == null || typeof t == 'boolean' || t === ''
        ? ''
        : n || typeof t != 'number' || t === 0 || (Wn.hasOwnProperty(e) && Wn[e])
          ? ('' + t).trim()
          : t + 'px'
}
function ca(e, t) {
    e = e.style
    for (var n in t)
        if (t.hasOwnProperty(n)) {
            var r = n.indexOf('--') === 0,
                l = aa(n, t[n], r)
            ;(n === 'float' && (n = 'cssFloat'), r ? e.setProperty(n, l) : (e[n] = l))
        }
}
var Wf = Y(
    { menuitem: !0 },
    {
        area: !0,
        base: !0,
        br: !0,
        col: !0,
        embed: !0,
        hr: !0,
        img: !0,
        input: !0,
        keygen: !0,
        link: !0,
        meta: !0,
        param: !0,
        source: !0,
        track: !0,
        wbr: !0,
    },
)
function zo(e, t) {
    if (t) {
        if (Wf[e] && (t.children != null || t.dangerouslySetInnerHTML != null)) throw Error(E(137, e))
        if (t.dangerouslySetInnerHTML != null) {
            if (t.children != null) throw Error(E(60))
            if (typeof t.dangerouslySetInnerHTML != 'object' || !('__html' in t.dangerouslySetInnerHTML))
                throw Error(E(61))
        }
        if (t.style != null && typeof t.style != 'object') throw Error(E(62))
    }
}
function Ro(e, t) {
    if (e.indexOf('-') === -1) return typeof t.is == 'string'
    switch (e) {
        case 'annotation-xml':
        case 'color-profile':
        case 'font-face':
        case 'font-face-src':
        case 'font-face-uri':
        case 'font-face-format':
        case 'font-face-name':
        case 'missing-glyph':
            return !1
        default:
            return !0
    }
}
var Do = null
function Ni(e) {
    return (
        (e = e.target || e.srcElement || window),
        e.correspondingUseElement && (e = e.correspondingUseElement),
        e.nodeType === 3 ? e.parentNode : e
    )
}
var Oo = null,
    hn = null,
    mn = null
function Cu(e) {
    if ((e = Sr(e))) {
        if (typeof Oo != 'function') throw Error(E(280))
        var t = e.stateNode
        t && ((t = Rl(t)), Oo(e.stateNode, e.type, t))
    }
}
function fa(e) {
    hn ? (mn ? mn.push(e) : (mn = [e])) : (hn = e)
}
function da() {
    if (hn) {
        var e = hn,
            t = mn
        if (((mn = hn = null), Cu(e), t)) for (e = 0; e < t.length; e++) Cu(t[e])
    }
}
function pa(e, t) {
    return e(t)
}
function ha() {}
var Kl = !1
function ma(e, t, n) {
    if (Kl) return e(t, n)
    Kl = !0
    try {
        return pa(e, t, n)
    } finally {
        ;((Kl = !1), (hn !== null || mn !== null) && (ha(), da()))
    }
}
function tr(e, t) {
    var n = e.stateNode
    if (n === null) return null
    var r = Rl(n)
    if (r === null) return null
    n = r[t]
    e: switch (t) {
        case 'onClick':
        case 'onClickCapture':
        case 'onDoubleClick':
        case 'onDoubleClickCapture':
        case 'onMouseDown':
        case 'onMouseDownCapture':
        case 'onMouseMove':
        case 'onMouseMoveCapture':
        case 'onMouseUp':
        case 'onMouseUpCapture':
        case 'onMouseEnter':
            ;((r = !r.disabled) ||
                ((e = e.type), (r = !(e === 'button' || e === 'input' || e === 'select' || e === 'textarea'))),
                (e = !r))
            break e
        default:
            e = !1
    }
    if (e) return null
    if (n && typeof n != 'function') throw Error(E(231, t, typeof n))
    return n
}
var jo = !1
if (ut)
    try {
        var Rn = {}
        ;(Object.defineProperty(Rn, 'passive', {
            get: function () {
                jo = !0
            },
        }),
            window.addEventListener('test', Rn, Rn),
            window.removeEventListener('test', Rn, Rn))
    } catch {
        jo = !1
    }
function Gf(e, t, n, r, l, o, i, u, s) {
    var a = Array.prototype.slice.call(arguments, 3)
    try {
        t.apply(n, a)
    } catch (m) {
        this.onError(m)
    }
}
var Gn = !1,
    tl = null,
    nl = !1,
    Io = null,
    Qf = {
        onError: function (e) {
            ;((Gn = !0), (tl = e))
        },
    }
function Kf(e, t, n, r, l, o, i, u, s) {
    ;((Gn = !1), (tl = null), Gf.apply(Qf, arguments))
}
function Yf(e, t, n, r, l, o, i, u, s) {
    if ((Kf.apply(this, arguments), Gn)) {
        if (Gn) {
            var a = tl
            ;((Gn = !1), (tl = null))
        } else throw Error(E(198))
        nl || ((nl = !0), (Io = a))
    }
}
function Jt(e) {
    var t = e,
        n = e
    if (e.alternate) for (; t.return; ) t = t.return
    else {
        e = t
        do ((t = e), t.flags & 4098 && (n = t.return), (e = t.return))
        while (e)
    }
    return t.tag === 3 ? n : null
}
function ga(e) {
    if (e.tag === 13) {
        var t = e.memoizedState
        if ((t === null && ((e = e.alternate), e !== null && (t = e.memoizedState)), t !== null)) return t.dehydrated
    }
    return null
}
function _u(e) {
    if (Jt(e) !== e) throw Error(E(188))
}
function Xf(e) {
    var t = e.alternate
    if (!t) {
        if (((t = Jt(e)), t === null)) throw Error(E(188))
        return t !== e ? null : e
    }
    for (var n = e, r = t; ; ) {
        var l = n.return
        if (l === null) break
        var o = l.alternate
        if (o === null) {
            if (((r = l.return), r !== null)) {
                n = r
                continue
            }
            break
        }
        if (l.child === o.child) {
            for (o = l.child; o; ) {
                if (o === n) return (_u(l), e)
                if (o === r) return (_u(l), t)
                o = o.sibling
            }
            throw Error(E(188))
        }
        if (n.return !== r.return) ((n = l), (r = o))
        else {
            for (var i = !1, u = l.child; u; ) {
                if (u === n) {
                    ;((i = !0), (n = l), (r = o))
                    break
                }
                if (u === r) {
                    ;((i = !0), (r = l), (n = o))
                    break
                }
                u = u.sibling
            }
            if (!i) {
                for (u = o.child; u; ) {
                    if (u === n) {
                        ;((i = !0), (n = o), (r = l))
                        break
                    }
                    if (u === r) {
                        ;((i = !0), (r = o), (n = l))
                        break
                    }
                    u = u.sibling
                }
                if (!i) throw Error(E(189))
            }
        }
        if (n.alternate !== r) throw Error(E(190))
    }
    if (n.tag !== 3) throw Error(E(188))
    return n.stateNode.current === n ? e : t
}
function va(e) {
    return ((e = Xf(e)), e !== null ? ya(e) : null)
}
function ya(e) {
    if (e.tag === 5 || e.tag === 6) return e
    for (e = e.child; e !== null; ) {
        var t = ya(e)
        if (t !== null) return t
        e = e.sibling
    }
    return null
}
var wa = Ne.unstable_scheduleCallback,
    Nu = Ne.unstable_cancelCallback,
    Zf = Ne.unstable_shouldYield,
    Jf = Ne.unstable_requestPaint,
    J = Ne.unstable_now,
    qf = Ne.unstable_getCurrentPriorityLevel,
    Pi = Ne.unstable_ImmediatePriority,
    Sa = Ne.unstable_UserBlockingPriority,
    rl = Ne.unstable_NormalPriority,
    bf = Ne.unstable_LowPriority,
    ka = Ne.unstable_IdlePriority,
    Tl = null,
    Ze = null
function ed(e) {
    if (Ze && typeof Ze.onCommitFiberRoot == 'function')
        try {
            Ze.onCommitFiberRoot(Tl, e, void 0, (e.current.flags & 128) === 128)
        } catch {}
}
var Be = Math.clz32 ? Math.clz32 : rd,
    td = Math.log,
    nd = Math.LN2
function rd(e) {
    return ((e >>>= 0), e === 0 ? 32 : (31 - ((td(e) / nd) | 0)) | 0)
}
var Tr = 64,
    Lr = 4194304
function Hn(e) {
    switch (e & -e) {
        case 1:
            return 1
        case 2:
            return 2
        case 4:
            return 4
        case 8:
            return 8
        case 16:
            return 16
        case 32:
            return 32
        case 64:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
            return e & 4194240
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
        case 67108864:
            return e & 130023424
        case 134217728:
            return 134217728
        case 268435456:
            return 268435456
        case 536870912:
            return 536870912
        case 1073741824:
            return 1073741824
        default:
            return e
    }
}
function ll(e, t) {
    var n = e.pendingLanes
    if (n === 0) return 0
    var r = 0,
        l = e.suspendedLanes,
        o = e.pingedLanes,
        i = n & 268435455
    if (i !== 0) {
        var u = i & ~l
        u !== 0 ? (r = Hn(u)) : ((o &= i), o !== 0 && (r = Hn(o)))
    } else ((i = n & ~l), i !== 0 ? (r = Hn(i)) : o !== 0 && (r = Hn(o)))
    if (r === 0) return 0
    if (t !== 0 && t !== r && !(t & l) && ((l = r & -r), (o = t & -t), l >= o || (l === 16 && (o & 4194240) !== 0)))
        return t
    if ((r & 4 && (r |= n & 16), (t = e.entangledLanes), t !== 0))
        for (e = e.entanglements, t &= r; 0 < t; ) ((n = 31 - Be(t)), (l = 1 << n), (r |= e[n]), (t &= ~l))
    return r
}
function ld(e, t) {
    switch (e) {
        case 1:
        case 2:
        case 4:
            return t + 250
        case 8:
        case 16:
        case 32:
        case 64:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
            return t + 5e3
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
        case 67108864:
            return -1
        case 134217728:
        case 268435456:
        case 536870912:
        case 1073741824:
            return -1
        default:
            return -1
    }
}
function od(e, t) {
    for (var n = e.suspendedLanes, r = e.pingedLanes, l = e.expirationTimes, o = e.pendingLanes; 0 < o; ) {
        var i = 31 - Be(o),
            u = 1 << i,
            s = l[i]
        ;(s === -1 ? (!(u & n) || u & r) && (l[i] = ld(u, t)) : s <= t && (e.expiredLanes |= u), (o &= ~u))
    }
}
function Fo(e) {
    return ((e = e.pendingLanes & -1073741825), e !== 0 ? e : e & 1073741824 ? 1073741824 : 0)
}
function Ea() {
    var e = Tr
    return ((Tr <<= 1), !(Tr & 4194240) && (Tr = 64), e)
}
function Yl(e) {
    for (var t = [], n = 0; 31 > n; n++) t.push(e)
    return t
}
function yr(e, t, n) {
    ;((e.pendingLanes |= t),
        t !== 536870912 && ((e.suspendedLanes = 0), (e.pingedLanes = 0)),
        (e = e.eventTimes),
        (t = 31 - Be(t)),
        (e[t] = n))
}
function id(e, t) {
    var n = e.pendingLanes & ~t
    ;((e.pendingLanes = t),
        (e.suspendedLanes = 0),
        (e.pingedLanes = 0),
        (e.expiredLanes &= t),
        (e.mutableReadLanes &= t),
        (e.entangledLanes &= t),
        (t = e.entanglements))
    var r = e.eventTimes
    for (e = e.expirationTimes; 0 < n; ) {
        var l = 31 - Be(n),
            o = 1 << l
        ;((t[l] = 0), (r[l] = -1), (e[l] = -1), (n &= ~o))
    }
}
function Ti(e, t) {
    var n = (e.entangledLanes |= t)
    for (e = e.entanglements; n; ) {
        var r = 31 - Be(n),
            l = 1 << r
        ;((l & t) | (e[r] & t) && (e[r] |= t), (n &= ~l))
    }
}
var U = 0
function xa(e) {
    return ((e &= -e), 1 < e ? (4 < e ? (e & 268435455 ? 16 : 536870912) : 4) : 1)
}
var Ca,
    Li,
    _a,
    Na,
    Pa,
    Ao = !1,
    Mr = [],
    St = null,
    kt = null,
    Et = null,
    nr = new Map(),
    rr = new Map(),
    gt = [],
    ud =
        'mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit'.split(
            ' ',
        )
function Pu(e, t) {
    switch (e) {
        case 'focusin':
        case 'focusout':
            St = null
            break
        case 'dragenter':
        case 'dragleave':
            kt = null
            break
        case 'mouseover':
        case 'mouseout':
            Et = null
            break
        case 'pointerover':
        case 'pointerout':
            nr.delete(t.pointerId)
            break
        case 'gotpointercapture':
        case 'lostpointercapture':
            rr.delete(t.pointerId)
    }
}
function Dn(e, t, n, r, l, o) {
    return e === null || e.nativeEvent !== o
        ? ((e = { blockedOn: t, domEventName: n, eventSystemFlags: r, nativeEvent: o, targetContainers: [l] }),
          t !== null && ((t = Sr(t)), t !== null && Li(t)),
          e)
        : ((e.eventSystemFlags |= r), (t = e.targetContainers), l !== null && t.indexOf(l) === -1 && t.push(l), e)
}
function sd(e, t, n, r, l) {
    switch (t) {
        case 'focusin':
            return ((St = Dn(St, e, t, n, r, l)), !0)
        case 'dragenter':
            return ((kt = Dn(kt, e, t, n, r, l)), !0)
        case 'mouseover':
            return ((Et = Dn(Et, e, t, n, r, l)), !0)
        case 'pointerover':
            var o = l.pointerId
            return (nr.set(o, Dn(nr.get(o) || null, e, t, n, r, l)), !0)
        case 'gotpointercapture':
            return ((o = l.pointerId), rr.set(o, Dn(rr.get(o) || null, e, t, n, r, l)), !0)
    }
    return !1
}
function Ta(e) {
    var t = At(e.target)
    if (t !== null) {
        var n = Jt(t)
        if (n !== null) {
            if (((t = n.tag), t === 13)) {
                if (((t = ga(n)), t !== null)) {
                    ;((e.blockedOn = t),
                        Pa(e.priority, function () {
                            _a(n)
                        }))
                    return
                }
            } else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
                e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null
                return
            }
        }
    }
    e.blockedOn = null
}
function Wr(e) {
    if (e.blockedOn !== null) return !1
    for (var t = e.targetContainers; 0 < t.length; ) {
        var n = Uo(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent)
        if (n === null) {
            n = e.nativeEvent
            var r = new n.constructor(n.type, n)
            ;((Do = r), n.target.dispatchEvent(r), (Do = null))
        } else return ((t = Sr(n)), t !== null && Li(t), (e.blockedOn = n), !1)
        t.shift()
    }
    return !0
}
function Tu(e, t, n) {
    Wr(e) && n.delete(t)
}
function ad() {
    ;((Ao = !1),
        St !== null && Wr(St) && (St = null),
        kt !== null && Wr(kt) && (kt = null),
        Et !== null && Wr(Et) && (Et = null),
        nr.forEach(Tu),
        rr.forEach(Tu))
}
function On(e, t) {
    e.blockedOn === t &&
        ((e.blockedOn = null), Ao || ((Ao = !0), Ne.unstable_scheduleCallback(Ne.unstable_NormalPriority, ad)))
}
function lr(e) {
    function t(l) {
        return On(l, e)
    }
    if (0 < Mr.length) {
        On(Mr[0], e)
        for (var n = 1; n < Mr.length; n++) {
            var r = Mr[n]
            r.blockedOn === e && (r.blockedOn = null)
        }
    }
    for (
        St !== null && On(St, e),
            kt !== null && On(kt, e),
            Et !== null && On(Et, e),
            nr.forEach(t),
            rr.forEach(t),
            n = 0;
        n < gt.length;
        n++
    )
        ((r = gt[n]), r.blockedOn === e && (r.blockedOn = null))
    for (; 0 < gt.length && ((n = gt[0]), n.blockedOn === null); ) (Ta(n), n.blockedOn === null && gt.shift())
}
var gn = dt.ReactCurrentBatchConfig,
    ol = !0
function cd(e, t, n, r) {
    var l = U,
        o = gn.transition
    gn.transition = null
    try {
        ;((U = 1), Mi(e, t, n, r))
    } finally {
        ;((U = l), (gn.transition = o))
    }
}
function fd(e, t, n, r) {
    var l = U,
        o = gn.transition
    gn.transition = null
    try {
        ;((U = 4), Mi(e, t, n, r))
    } finally {
        ;((U = l), (gn.transition = o))
    }
}
function Mi(e, t, n, r) {
    if (ol) {
        var l = Uo(e, t, n, r)
        if (l === null) (lo(e, t, r, il, n), Pu(e, r))
        else if (sd(l, e, t, n, r)) r.stopPropagation()
        else if ((Pu(e, r), t & 4 && -1 < ud.indexOf(e))) {
            for (; l !== null; ) {
                var o = Sr(l)
                if ((o !== null && Ca(o), (o = Uo(e, t, n, r)), o === null && lo(e, t, r, il, n), o === l)) break
                l = o
            }
            l !== null && r.stopPropagation()
        } else lo(e, t, r, null, n)
    }
}
var il = null
function Uo(e, t, n, r) {
    if (((il = null), (e = Ni(r)), (e = At(e)), e !== null))
        if (((t = Jt(e)), t === null)) e = null
        else if (((n = t.tag), n === 13)) {
            if (((e = ga(t)), e !== null)) return e
            e = null
        } else if (n === 3) {
            if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null
            e = null
        } else t !== e && (e = null)
    return ((il = e), null)
}
function La(e) {
    switch (e) {
        case 'cancel':
        case 'click':
        case 'close':
        case 'contextmenu':
        case 'copy':
        case 'cut':
        case 'auxclick':
        case 'dblclick':
        case 'dragend':
        case 'dragstart':
        case 'drop':
        case 'focusin':
        case 'focusout':
        case 'input':
        case 'invalid':
        case 'keydown':
        case 'keypress':
        case 'keyup':
        case 'mousedown':
        case 'mouseup':
        case 'paste':
        case 'pause':
        case 'play':
        case 'pointercancel':
        case 'pointerdown':
        case 'pointerup':
        case 'ratechange':
        case 'reset':
        case 'resize':
        case 'seeked':
        case 'submit':
        case 'touchcancel':
        case 'touchend':
        case 'touchstart':
        case 'volumechange':
        case 'change':
        case 'selectionchange':
        case 'textInput':
        case 'compositionstart':
        case 'compositionend':
        case 'compositionupdate':
        case 'beforeblur':
        case 'afterblur':
        case 'beforeinput':
        case 'blur':
        case 'fullscreenchange':
        case 'focus':
        case 'hashchange':
        case 'popstate':
        case 'select':
        case 'selectstart':
            return 1
        case 'drag':
        case 'dragenter':
        case 'dragexit':
        case 'dragleave':
        case 'dragover':
        case 'mousemove':
        case 'mouseout':
        case 'mouseover':
        case 'pointermove':
        case 'pointerout':
        case 'pointerover':
        case 'scroll':
        case 'toggle':
        case 'touchmove':
        case 'wheel':
        case 'mouseenter':
        case 'mouseleave':
        case 'pointerenter':
        case 'pointerleave':
            return 4
        case 'message':
            switch (qf()) {
                case Pi:
                    return 1
                case Sa:
                    return 4
                case rl:
                case bf:
                    return 16
                case ka:
                    return 536870912
                default:
                    return 16
            }
        default:
            return 16
    }
}
var yt = null,
    zi = null,
    Gr = null
function Ma() {
    if (Gr) return Gr
    var e,
        t = zi,
        n = t.length,
        r,
        l = 'value' in yt ? yt.value : yt.textContent,
        o = l.length
    for (e = 0; e < n && t[e] === l[e]; e++);
    var i = n - e
    for (r = 1; r <= i && t[n - r] === l[o - r]; r++);
    return (Gr = l.slice(e, 1 < r ? 1 - r : void 0))
}
function Qr(e) {
    var t = e.keyCode
    return (
        'charCode' in e ? ((e = e.charCode), e === 0 && t === 13 && (e = 13)) : (e = t),
        e === 10 && (e = 13),
        32 <= e || e === 13 ? e : 0
    )
}
function zr() {
    return !0
}
function Lu() {
    return !1
}
function Te(e) {
    function t(n, r, l, o, i) {
        ;((this._reactName = n),
            (this._targetInst = l),
            (this.type = r),
            (this.nativeEvent = o),
            (this.target = i),
            (this.currentTarget = null))
        for (var u in e) e.hasOwnProperty(u) && ((n = e[u]), (this[u] = n ? n(o) : o[u]))
        return (
            (this.isDefaultPrevented = (o.defaultPrevented != null ? o.defaultPrevented : o.returnValue === !1)
                ? zr
                : Lu),
            (this.isPropagationStopped = Lu),
            this
        )
    }
    return (
        Y(t.prototype, {
            preventDefault: function () {
                this.defaultPrevented = !0
                var n = this.nativeEvent
                n &&
                    (n.preventDefault ? n.preventDefault() : typeof n.returnValue != 'unknown' && (n.returnValue = !1),
                    (this.isDefaultPrevented = zr))
            },
            stopPropagation: function () {
                var n = this.nativeEvent
                n &&
                    (n.stopPropagation
                        ? n.stopPropagation()
                        : typeof n.cancelBubble != 'unknown' && (n.cancelBubble = !0),
                    (this.isPropagationStopped = zr))
            },
            persist: function () {},
            isPersistent: zr,
        }),
        t
    )
}
var Pn = {
        eventPhase: 0,
        bubbles: 0,
        cancelable: 0,
        timeStamp: function (e) {
            return e.timeStamp || Date.now()
        },
        defaultPrevented: 0,
        isTrusted: 0,
    },
    Ri = Te(Pn),
    wr = Y({}, Pn, { view: 0, detail: 0 }),
    dd = Te(wr),
    Xl,
    Zl,
    jn,
    Ll = Y({}, wr, {
        screenX: 0,
        screenY: 0,
        clientX: 0,
        clientY: 0,
        pageX: 0,
        pageY: 0,
        ctrlKey: 0,
        shiftKey: 0,
        altKey: 0,
        metaKey: 0,
        getModifierState: Di,
        button: 0,
        buttons: 0,
        relatedTarget: function (e) {
            return e.relatedTarget === void 0
                ? e.fromElement === e.srcElement
                    ? e.toElement
                    : e.fromElement
                : e.relatedTarget
        },
        movementX: function (e) {
            return 'movementX' in e
                ? e.movementX
                : (e !== jn &&
                      (jn && e.type === 'mousemove'
                          ? ((Xl = e.screenX - jn.screenX), (Zl = e.screenY - jn.screenY))
                          : (Zl = Xl = 0),
                      (jn = e)),
                  Xl)
        },
        movementY: function (e) {
            return 'movementY' in e ? e.movementY : Zl
        },
    }),
    Mu = Te(Ll),
    pd = Y({}, Ll, { dataTransfer: 0 }),
    hd = Te(pd),
    md = Y({}, wr, { relatedTarget: 0 }),
    Jl = Te(md),
    gd = Y({}, Pn, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
    vd = Te(gd),
    yd = Y({}, Pn, {
        clipboardData: function (e) {
            return 'clipboardData' in e ? e.clipboardData : window.clipboardData
        },
    }),
    wd = Te(yd),
    Sd = Y({}, Pn, { data: 0 }),
    zu = Te(Sd),
    kd = {
        Esc: 'Escape',
        Spacebar: ' ',
        Left: 'ArrowLeft',
        Up: 'ArrowUp',
        Right: 'ArrowRight',
        Down: 'ArrowDown',
        Del: 'Delete',
        Win: 'OS',
        Menu: 'ContextMenu',
        Apps: 'ContextMenu',
        Scroll: 'ScrollLock',
        MozPrintableKey: 'Unidentified',
    },
    Ed = {
        8: 'Backspace',
        9: 'Tab',
        12: 'Clear',
        13: 'Enter',
        16: 'Shift',
        17: 'Control',
        18: 'Alt',
        19: 'Pause',
        20: 'CapsLock',
        27: 'Escape',
        32: ' ',
        33: 'PageUp',
        34: 'PageDown',
        35: 'End',
        36: 'Home',
        37: 'ArrowLeft',
        38: 'ArrowUp',
        39: 'ArrowRight',
        40: 'ArrowDown',
        45: 'Insert',
        46: 'Delete',
        112: 'F1',
        113: 'F2',
        114: 'F3',
        115: 'F4',
        116: 'F5',
        117: 'F6',
        118: 'F7',
        119: 'F8',
        120: 'F9',
        121: 'F10',
        122: 'F11',
        123: 'F12',
        144: 'NumLock',
        145: 'ScrollLock',
        224: 'Meta',
    },
    xd = { Alt: 'altKey', Control: 'ctrlKey', Meta: 'metaKey', Shift: 'shiftKey' }
function Cd(e) {
    var t = this.nativeEvent
    return t.getModifierState ? t.getModifierState(e) : (e = xd[e]) ? !!t[e] : !1
}
function Di() {
    return Cd
}
var _d = Y({}, wr, {
        key: function (e) {
            if (e.key) {
                var t = kd[e.key] || e.key
                if (t !== 'Unidentified') return t
            }
            return e.type === 'keypress'
                ? ((e = Qr(e)), e === 13 ? 'Enter' : String.fromCharCode(e))
                : e.type === 'keydown' || e.type === 'keyup'
                  ? Ed[e.keyCode] || 'Unidentified'
                  : ''
        },
        code: 0,
        location: 0,
        ctrlKey: 0,
        shiftKey: 0,
        altKey: 0,
        metaKey: 0,
        repeat: 0,
        locale: 0,
        getModifierState: Di,
        charCode: function (e) {
            return e.type === 'keypress' ? Qr(e) : 0
        },
        keyCode: function (e) {
            return e.type === 'keydown' || e.type === 'keyup' ? e.keyCode : 0
        },
        which: function (e) {
            return e.type === 'keypress' ? Qr(e) : e.type === 'keydown' || e.type === 'keyup' ? e.keyCode : 0
        },
    }),
    Nd = Te(_d),
    Pd = Y({}, Ll, {
        pointerId: 0,
        width: 0,
        height: 0,
        pressure: 0,
        tangentialPressure: 0,
        tiltX: 0,
        tiltY: 0,
        twist: 0,
        pointerType: 0,
        isPrimary: 0,
    }),
    Ru = Te(Pd),
    Td = Y({}, wr, {
        touches: 0,
        targetTouches: 0,
        changedTouches: 0,
        altKey: 0,
        metaKey: 0,
        ctrlKey: 0,
        shiftKey: 0,
        getModifierState: Di,
    }),
    Ld = Te(Td),
    Md = Y({}, Pn, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }),
    zd = Te(Md),
    Rd = Y({}, Ll, {
        deltaX: function (e) {
            return 'deltaX' in e ? e.deltaX : 'wheelDeltaX' in e ? -e.wheelDeltaX : 0
        },
        deltaY: function (e) {
            return 'deltaY' in e
                ? e.deltaY
                : 'wheelDeltaY' in e
                  ? -e.wheelDeltaY
                  : 'wheelDelta' in e
                    ? -e.wheelDelta
                    : 0
        },
        deltaZ: 0,
        deltaMode: 0,
    }),
    Dd = Te(Rd),
    Od = [9, 13, 27, 32],
    Oi = ut && 'CompositionEvent' in window,
    Qn = null
ut && 'documentMode' in document && (Qn = document.documentMode)
var jd = ut && 'TextEvent' in window && !Qn,
    za = ut && (!Oi || (Qn && 8 < Qn && 11 >= Qn)),
    Du = ' ',
    Ou = !1
function Ra(e, t) {
    switch (e) {
        case 'keyup':
            return Od.indexOf(t.keyCode) !== -1
        case 'keydown':
            return t.keyCode !== 229
        case 'keypress':
        case 'mousedown':
        case 'focusout':
            return !0
        default:
            return !1
    }
}
function Da(e) {
    return ((e = e.detail), typeof e == 'object' && 'data' in e ? e.data : null)
}
var nn = !1
function Id(e, t) {
    switch (e) {
        case 'compositionend':
            return Da(t)
        case 'keypress':
            return t.which !== 32 ? null : ((Ou = !0), Du)
        case 'textInput':
            return ((e = t.data), e === Du && Ou ? null : e)
        default:
            return null
    }
}
function Fd(e, t) {
    if (nn)
        return e === 'compositionend' || (!Oi && Ra(e, t)) ? ((e = Ma()), (Gr = zi = yt = null), (nn = !1), e) : null
    switch (e) {
        case 'paste':
            return null
        case 'keypress':
            if (!(t.ctrlKey || t.altKey || t.metaKey) || (t.ctrlKey && t.altKey)) {
                if (t.char && 1 < t.char.length) return t.char
                if (t.which) return String.fromCharCode(t.which)
            }
            return null
        case 'compositionend':
            return za && t.locale !== 'ko' ? null : t.data
        default:
            return null
    }
}
var Ad = {
    color: !0,
    date: !0,
    datetime: !0,
    'datetime-local': !0,
    email: !0,
    month: !0,
    number: !0,
    password: !0,
    range: !0,
    search: !0,
    tel: !0,
    text: !0,
    time: !0,
    url: !0,
    week: !0,
}
function ju(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase()
    return t === 'input' ? !!Ad[e.type] : t === 'textarea'
}
function Oa(e, t, n, r) {
    ;(fa(r),
        (t = ul(t, 'onChange')),
        0 < t.length && ((n = new Ri('onChange', 'change', null, n, r)), e.push({ event: n, listeners: t })))
}
var Kn = null,
    or = null
function Ud(e) {
    Ga(e, 0)
}
function Ml(e) {
    var t = on(e)
    if (la(t)) return e
}
function $d(e, t) {
    if (e === 'change') return t
}
var ja = !1
if (ut) {
    var ql
    if (ut) {
        var bl = 'oninput' in document
        if (!bl) {
            var Iu = document.createElement('div')
            ;(Iu.setAttribute('oninput', 'return;'), (bl = typeof Iu.oninput == 'function'))
        }
        ql = bl
    } else ql = !1
    ja = ql && (!document.documentMode || 9 < document.documentMode)
}
function Fu() {
    Kn && (Kn.detachEvent('onpropertychange', Ia), (or = Kn = null))
}
function Ia(e) {
    if (e.propertyName === 'value' && Ml(or)) {
        var t = []
        ;(Oa(t, or, e, Ni(e)), ma(Ud, t))
    }
}
function Vd(e, t, n) {
    e === 'focusin' ? (Fu(), (Kn = t), (or = n), Kn.attachEvent('onpropertychange', Ia)) : e === 'focusout' && Fu()
}
function Hd(e) {
    if (e === 'selectionchange' || e === 'keyup' || e === 'keydown') return Ml(or)
}
function Bd(e, t) {
    if (e === 'click') return Ml(t)
}
function Wd(e, t) {
    if (e === 'input' || e === 'change') return Ml(t)
}
function Gd(e, t) {
    return (e === t && (e !== 0 || 1 / e === 1 / t)) || (e !== e && t !== t)
}
var Ge = typeof Object.is == 'function' ? Object.is : Gd
function ir(e, t) {
    if (Ge(e, t)) return !0
    if (typeof e != 'object' || e === null || typeof t != 'object' || t === null) return !1
    var n = Object.keys(e),
        r = Object.keys(t)
    if (n.length !== r.length) return !1
    for (r = 0; r < n.length; r++) {
        var l = n[r]
        if (!ko.call(t, l) || !Ge(e[l], t[l])) return !1
    }
    return !0
}
function Au(e) {
    for (; e && e.firstChild; ) e = e.firstChild
    return e
}
function Uu(e, t) {
    var n = Au(e)
    e = 0
    for (var r; n; ) {
        if (n.nodeType === 3) {
            if (((r = e + n.textContent.length), e <= t && r >= t)) return { node: n, offset: t - e }
            e = r
        }
        e: {
            for (; n; ) {
                if (n.nextSibling) {
                    n = n.nextSibling
                    break e
                }
                n = n.parentNode
            }
            n = void 0
        }
        n = Au(n)
    }
}
function Fa(e, t) {
    return e && t
        ? e === t
            ? !0
            : e && e.nodeType === 3
              ? !1
              : t && t.nodeType === 3
                ? Fa(e, t.parentNode)
                : 'contains' in e
                  ? e.contains(t)
                  : e.compareDocumentPosition
                    ? !!(e.compareDocumentPosition(t) & 16)
                    : !1
        : !1
}
function Aa() {
    for (var e = window, t = el(); t instanceof e.HTMLIFrameElement; ) {
        try {
            var n = typeof t.contentWindow.location.href == 'string'
        } catch {
            n = !1
        }
        if (n) e = t.contentWindow
        else break
        t = el(e.document)
    }
    return t
}
function ji(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase()
    return (
        t &&
        ((t === 'input' &&
            (e.type === 'text' ||
                e.type === 'search' ||
                e.type === 'tel' ||
                e.type === 'url' ||
                e.type === 'password')) ||
            t === 'textarea' ||
            e.contentEditable === 'true')
    )
}
function Qd(e) {
    var t = Aa(),
        n = e.focusedElem,
        r = e.selectionRange
    if (t !== n && n && n.ownerDocument && Fa(n.ownerDocument.documentElement, n)) {
        if (r !== null && ji(n)) {
            if (((t = r.start), (e = r.end), e === void 0 && (e = t), 'selectionStart' in n))
                ((n.selectionStart = t), (n.selectionEnd = Math.min(e, n.value.length)))
            else if (((e = ((t = n.ownerDocument || document) && t.defaultView) || window), e.getSelection)) {
                e = e.getSelection()
                var l = n.textContent.length,
                    o = Math.min(r.start, l)
                ;((r = r.end === void 0 ? o : Math.min(r.end, l)),
                    !e.extend && o > r && ((l = r), (r = o), (o = l)),
                    (l = Uu(n, o)))
                var i = Uu(n, r)
                l &&
                    i &&
                    (e.rangeCount !== 1 ||
                        e.anchorNode !== l.node ||
                        e.anchorOffset !== l.offset ||
                        e.focusNode !== i.node ||
                        e.focusOffset !== i.offset) &&
                    ((t = t.createRange()),
                    t.setStart(l.node, l.offset),
                    e.removeAllRanges(),
                    o > r ? (e.addRange(t), e.extend(i.node, i.offset)) : (t.setEnd(i.node, i.offset), e.addRange(t)))
            }
        }
        for (t = [], e = n; (e = e.parentNode); )
            e.nodeType === 1 && t.push({ element: e, left: e.scrollLeft, top: e.scrollTop })
        for (typeof n.focus == 'function' && n.focus(), n = 0; n < t.length; n++)
            ((e = t[n]), (e.element.scrollLeft = e.left), (e.element.scrollTop = e.top))
    }
}
var Kd = ut && 'documentMode' in document && 11 >= document.documentMode,
    rn = null,
    $o = null,
    Yn = null,
    Vo = !1
function $u(e, t, n) {
    var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument
    Vo ||
        rn == null ||
        rn !== el(r) ||
        ((r = rn),
        'selectionStart' in r && ji(r)
            ? (r = { start: r.selectionStart, end: r.selectionEnd })
            : ((r = ((r.ownerDocument && r.ownerDocument.defaultView) || window).getSelection()),
              (r = {
                  anchorNode: r.anchorNode,
                  anchorOffset: r.anchorOffset,
                  focusNode: r.focusNode,
                  focusOffset: r.focusOffset,
              })),
        (Yn && ir(Yn, r)) ||
            ((Yn = r),
            (r = ul($o, 'onSelect')),
            0 < r.length &&
                ((t = new Ri('onSelect', 'select', null, t, n)), e.push({ event: t, listeners: r }), (t.target = rn))))
}
function Rr(e, t) {
    var n = {}
    return ((n[e.toLowerCase()] = t.toLowerCase()), (n['Webkit' + e] = 'webkit' + t), (n['Moz' + e] = 'moz' + t), n)
}
var ln = {
        animationend: Rr('Animation', 'AnimationEnd'),
        animationiteration: Rr('Animation', 'AnimationIteration'),
        animationstart: Rr('Animation', 'AnimationStart'),
        transitionend: Rr('Transition', 'TransitionEnd'),
    },
    eo = {},
    Ua = {}
ut &&
    ((Ua = document.createElement('div').style),
    'AnimationEvent' in window ||
        (delete ln.animationend.animation, delete ln.animationiteration.animation, delete ln.animationstart.animation),
    'TransitionEvent' in window || delete ln.transitionend.transition)
function zl(e) {
    if (eo[e]) return eo[e]
    if (!ln[e]) return e
    var t = ln[e],
        n
    for (n in t) if (t.hasOwnProperty(n) && n in Ua) return (eo[e] = t[n])
    return e
}
var $a = zl('animationend'),
    Va = zl('animationiteration'),
    Ha = zl('animationstart'),
    Ba = zl('transitionend'),
    Wa = new Map(),
    Vu =
        'abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel'.split(
            ' ',
        )
function zt(e, t) {
    ;(Wa.set(e, t), Zt(t, [e]))
}
for (var to = 0; to < Vu.length; to++) {
    var no = Vu[to],
        Yd = no.toLowerCase(),
        Xd = no[0].toUpperCase() + no.slice(1)
    zt(Yd, 'on' + Xd)
}
zt($a, 'onAnimationEnd')
zt(Va, 'onAnimationIteration')
zt(Ha, 'onAnimationStart')
zt('dblclick', 'onDoubleClick')
zt('focusin', 'onFocus')
zt('focusout', 'onBlur')
zt(Ba, 'onTransitionEnd')
wn('onMouseEnter', ['mouseout', 'mouseover'])
wn('onMouseLeave', ['mouseout', 'mouseover'])
wn('onPointerEnter', ['pointerout', 'pointerover'])
wn('onPointerLeave', ['pointerout', 'pointerover'])
Zt('onChange', 'change click focusin focusout input keydown keyup selectionchange'.split(' '))
Zt('onSelect', 'focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange'.split(' '))
Zt('onBeforeInput', ['compositionend', 'keypress', 'textInput', 'paste'])
Zt('onCompositionEnd', 'compositionend focusout keydown keypress keyup mousedown'.split(' '))
Zt('onCompositionStart', 'compositionstart focusout keydown keypress keyup mousedown'.split(' '))
Zt('onCompositionUpdate', 'compositionupdate focusout keydown keypress keyup mousedown'.split(' '))
var Bn =
        'abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting'.split(
            ' ',
        ),
    Zd = new Set('cancel close invalid load scroll toggle'.split(' ').concat(Bn))
function Hu(e, t, n) {
    var r = e.type || 'unknown-event'
    ;((e.currentTarget = n), Yf(r, t, void 0, e), (e.currentTarget = null))
}
function Ga(e, t) {
    t = (t & 4) !== 0
    for (var n = 0; n < e.length; n++) {
        var r = e[n],
            l = r.event
        r = r.listeners
        e: {
            var o = void 0
            if (t)
                for (var i = r.length - 1; 0 <= i; i--) {
                    var u = r[i],
                        s = u.instance,
                        a = u.currentTarget
                    if (((u = u.listener), s !== o && l.isPropagationStopped())) break e
                    ;(Hu(l, u, a), (o = s))
                }
            else
                for (i = 0; i < r.length; i++) {
                    if (
                        ((u = r[i]),
                        (s = u.instance),
                        (a = u.currentTarget),
                        (u = u.listener),
                        s !== o && l.isPropagationStopped())
                    )
                        break e
                    ;(Hu(l, u, a), (o = s))
                }
        }
    }
    if (nl) throw ((e = Io), (nl = !1), (Io = null), e)
}
function H(e, t) {
    var n = t[Qo]
    n === void 0 && (n = t[Qo] = new Set())
    var r = e + '__bubble'
    n.has(r) || (Qa(t, e, 2, !1), n.add(r))
}
function ro(e, t, n) {
    var r = 0
    ;(t && (r |= 4), Qa(n, e, r, t))
}
var Dr = '_reactListening' + Math.random().toString(36).slice(2)
function ur(e) {
    if (!e[Dr]) {
        ;((e[Dr] = !0),
            bs.forEach(function (n) {
                n !== 'selectionchange' && (Zd.has(n) || ro(n, !1, e), ro(n, !0, e))
            }))
        var t = e.nodeType === 9 ? e : e.ownerDocument
        t === null || t[Dr] || ((t[Dr] = !0), ro('selectionchange', !1, t))
    }
}
function Qa(e, t, n, r) {
    switch (La(t)) {
        case 1:
            var l = cd
            break
        case 4:
            l = fd
            break
        default:
            l = Mi
    }
    ;((n = l.bind(null, t, n, e)),
        (l = void 0),
        !jo || (t !== 'touchstart' && t !== 'touchmove' && t !== 'wheel') || (l = !0),
        r
            ? l !== void 0
                ? e.addEventListener(t, n, { capture: !0, passive: l })
                : e.addEventListener(t, n, !0)
            : l !== void 0
              ? e.addEventListener(t, n, { passive: l })
              : e.addEventListener(t, n, !1))
}
function lo(e, t, n, r, l) {
    var o = r
    if (!(t & 1) && !(t & 2) && r !== null)
        e: for (;;) {
            if (r === null) return
            var i = r.tag
            if (i === 3 || i === 4) {
                var u = r.stateNode.containerInfo
                if (u === l || (u.nodeType === 8 && u.parentNode === l)) break
                if (i === 4)
                    for (i = r.return; i !== null; ) {
                        var s = i.tag
                        if (
                            (s === 3 || s === 4) &&
                            ((s = i.stateNode.containerInfo), s === l || (s.nodeType === 8 && s.parentNode === l))
                        )
                            return
                        i = i.return
                    }
                for (; u !== null; ) {
                    if (((i = At(u)), i === null)) return
                    if (((s = i.tag), s === 5 || s === 6)) {
                        r = o = i
                        continue e
                    }
                    u = u.parentNode
                }
            }
            r = r.return
        }
    ma(function () {
        var a = o,
            m = Ni(n),
            h = []
        e: {
            var d = Wa.get(e)
            if (d !== void 0) {
                var g = Ri,
                    v = e
                switch (e) {
                    case 'keypress':
                        if (Qr(n) === 0) break e
                    case 'keydown':
                    case 'keyup':
                        g = Nd
                        break
                    case 'focusin':
                        ;((v = 'focus'), (g = Jl))
                        break
                    case 'focusout':
                        ;((v = 'blur'), (g = Jl))
                        break
                    case 'beforeblur':
                    case 'afterblur':
                        g = Jl
                        break
                    case 'click':
                        if (n.button === 2) break e
                    case 'auxclick':
                    case 'dblclick':
                    case 'mousedown':
                    case 'mousemove':
                    case 'mouseup':
                    case 'mouseout':
                    case 'mouseover':
                    case 'contextmenu':
                        g = Mu
                        break
                    case 'drag':
                    case 'dragend':
                    case 'dragenter':
                    case 'dragexit':
                    case 'dragleave':
                    case 'dragover':
                    case 'dragstart':
                    case 'drop':
                        g = hd
                        break
                    case 'touchcancel':
                    case 'touchend':
                    case 'touchmove':
                    case 'touchstart':
                        g = Ld
                        break
                    case $a:
                    case Va:
                    case Ha:
                        g = vd
                        break
                    case Ba:
                        g = zd
                        break
                    case 'scroll':
                        g = dd
                        break
                    case 'wheel':
                        g = Dd
                        break
                    case 'copy':
                    case 'cut':
                    case 'paste':
                        g = wd
                        break
                    case 'gotpointercapture':
                    case 'lostpointercapture':
                    case 'pointercancel':
                    case 'pointerdown':
                    case 'pointermove':
                    case 'pointerout':
                    case 'pointerover':
                    case 'pointerup':
                        g = Ru
                }
                var k = (t & 4) !== 0,
                    N = !k && e === 'scroll',
                    f = k ? (d !== null ? d + 'Capture' : null) : d
                k = []
                for (var c = a, p; c !== null; ) {
                    p = c
                    var y = p.stateNode
                    if (
                        (p.tag === 5 &&
                            y !== null &&
                            ((p = y), f !== null && ((y = tr(c, f)), y != null && k.push(sr(c, y, p)))),
                        N)
                    )
                        break
                    c = c.return
                }
                0 < k.length && ((d = new g(d, v, null, n, m)), h.push({ event: d, listeners: k }))
            }
        }
        if (!(t & 7)) {
            e: {
                if (
                    ((d = e === 'mouseover' || e === 'pointerover'),
                    (g = e === 'mouseout' || e === 'pointerout'),
                    d && n !== Do && (v = n.relatedTarget || n.fromElement) && (At(v) || v[st]))
                )
                    break e
                if (
                    (g || d) &&
                    ((d = m.window === m ? m : (d = m.ownerDocument) ? d.defaultView || d.parentWindow : window),
                    g
                        ? ((v = n.relatedTarget || n.toElement),
                          (g = a),
                          (v = v ? At(v) : null),
                          v !== null && ((N = Jt(v)), v !== N || (v.tag !== 5 && v.tag !== 6)) && (v = null))
                        : ((g = null), (v = a)),
                    g !== v)
                ) {
                    if (
                        ((k = Mu),
                        (y = 'onMouseLeave'),
                        (f = 'onMouseEnter'),
                        (c = 'mouse'),
                        (e === 'pointerout' || e === 'pointerover') &&
                            ((k = Ru), (y = 'onPointerLeave'), (f = 'onPointerEnter'), (c = 'pointer')),
                        (N = g == null ? d : on(g)),
                        (p = v == null ? d : on(v)),
                        (d = new k(y, c + 'leave', g, n, m)),
                        (d.target = N),
                        (d.relatedTarget = p),
                        (y = null),
                        At(m) === a &&
                            ((k = new k(f, c + 'enter', v, n, m)), (k.target = p), (k.relatedTarget = N), (y = k)),
                        (N = y),
                        g && v)
                    )
                        t: {
                            for (k = g, f = v, c = 0, p = k; p; p = bt(p)) c++
                            for (p = 0, y = f; y; y = bt(y)) p++
                            for (; 0 < c - p; ) ((k = bt(k)), c--)
                            for (; 0 < p - c; ) ((f = bt(f)), p--)
                            for (; c--; ) {
                                if (k === f || (f !== null && k === f.alternate)) break t
                                ;((k = bt(k)), (f = bt(f)))
                            }
                            k = null
                        }
                    else k = null
                    ;(g !== null && Bu(h, d, g, k, !1), v !== null && N !== null && Bu(h, N, v, k, !0))
                }
            }
            e: {
                if (
                    ((d = a ? on(a) : window),
                    (g = d.nodeName && d.nodeName.toLowerCase()),
                    g === 'select' || (g === 'input' && d.type === 'file'))
                )
                    var w = $d
                else if (ju(d))
                    if (ja) w = Wd
                    else {
                        w = Hd
                        var C = Vd
                    }
                else
                    (g = d.nodeName) &&
                        g.toLowerCase() === 'input' &&
                        (d.type === 'checkbox' || d.type === 'radio') &&
                        (w = Bd)
                if (w && (w = w(e, a))) {
                    Oa(h, w, n, m)
                    break e
                }
                ;(C && C(e, d, a),
                    e === 'focusout' &&
                        (C = d._wrapperState) &&
                        C.controlled &&
                        d.type === 'number' &&
                        To(d, 'number', d.value))
            }
            switch (((C = a ? on(a) : window), e)) {
                case 'focusin':
                    ;(ju(C) || C.contentEditable === 'true') && ((rn = C), ($o = a), (Yn = null))
                    break
                case 'focusout':
                    Yn = $o = rn = null
                    break
                case 'mousedown':
                    Vo = !0
                    break
                case 'contextmenu':
                case 'mouseup':
                case 'dragend':
                    ;((Vo = !1), $u(h, n, m))
                    break
                case 'selectionchange':
                    if (Kd) break
                case 'keydown':
                case 'keyup':
                    $u(h, n, m)
            }
            var x
            if (Oi)
                e: {
                    switch (e) {
                        case 'compositionstart':
                            var _ = 'onCompositionStart'
                            break e
                        case 'compositionend':
                            _ = 'onCompositionEnd'
                            break e
                        case 'compositionupdate':
                            _ = 'onCompositionUpdate'
                            break e
                    }
                    _ = void 0
                }
            else
                nn
                    ? Ra(e, n) && (_ = 'onCompositionEnd')
                    : e === 'keydown' && n.keyCode === 229 && (_ = 'onCompositionStart')
            ;(_ &&
                (za &&
                    n.locale !== 'ko' &&
                    (nn || _ !== 'onCompositionStart'
                        ? _ === 'onCompositionEnd' && nn && (x = Ma())
                        : ((yt = m), (zi = 'value' in yt ? yt.value : yt.textContent), (nn = !0))),
                (C = ul(a, _)),
                0 < C.length &&
                    ((_ = new zu(_, e, null, n, m)),
                    h.push({ event: _, listeners: C }),
                    x ? (_.data = x) : ((x = Da(n)), x !== null && (_.data = x)))),
                (x = jd ? Id(e, n) : Fd(e, n)) &&
                    ((a = ul(a, 'onBeforeInput')),
                    0 < a.length &&
                        ((m = new zu('onBeforeInput', 'beforeinput', null, n, m)),
                        h.push({ event: m, listeners: a }),
                        (m.data = x))))
        }
        Ga(h, t)
    })
}
function sr(e, t, n) {
    return { instance: e, listener: t, currentTarget: n }
}
function ul(e, t) {
    for (var n = t + 'Capture', r = []; e !== null; ) {
        var l = e,
            o = l.stateNode
        ;(l.tag === 5 &&
            o !== null &&
            ((l = o),
            (o = tr(e, n)),
            o != null && r.unshift(sr(e, o, l)),
            (o = tr(e, t)),
            o != null && r.push(sr(e, o, l))),
            (e = e.return))
    }
    return r
}
function bt(e) {
    if (e === null) return null
    do e = e.return
    while (e && e.tag !== 5)
    return e || null
}
function Bu(e, t, n, r, l) {
    for (var o = t._reactName, i = []; n !== null && n !== r; ) {
        var u = n,
            s = u.alternate,
            a = u.stateNode
        if (s !== null && s === r) break
        ;(u.tag === 5 &&
            a !== null &&
            ((u = a),
            l
                ? ((s = tr(n, o)), s != null && i.unshift(sr(n, s, u)))
                : l || ((s = tr(n, o)), s != null && i.push(sr(n, s, u)))),
            (n = n.return))
    }
    i.length !== 0 && e.push({ event: t, listeners: i })
}
var Jd = /\r\n?/g,
    qd = /\u0000|\uFFFD/g
function Wu(e) {
    return (typeof e == 'string' ? e : '' + e)
        .replace(
            Jd,
            `
`,
        )
        .replace(qd, '')
}
function Or(e, t, n) {
    if (((t = Wu(t)), Wu(e) !== t && n)) throw Error(E(425))
}
function sl() {}
var Ho = null,
    Bo = null
function Wo(e, t) {
    return (
        e === 'textarea' ||
        e === 'noscript' ||
        typeof t.children == 'string' ||
        typeof t.children == 'number' ||
        (typeof t.dangerouslySetInnerHTML == 'object' &&
            t.dangerouslySetInnerHTML !== null &&
            t.dangerouslySetInnerHTML.__html != null)
    )
}
var Go = typeof setTimeout == 'function' ? setTimeout : void 0,
    bd = typeof clearTimeout == 'function' ? clearTimeout : void 0,
    Gu = typeof Promise == 'function' ? Promise : void 0,
    ep =
        typeof queueMicrotask == 'function'
            ? queueMicrotask
            : typeof Gu < 'u'
              ? function (e) {
                    return Gu.resolve(null).then(e).catch(tp)
                }
              : Go
function tp(e) {
    setTimeout(function () {
        throw e
    })
}
function oo(e, t) {
    var n = t,
        r = 0
    do {
        var l = n.nextSibling
        if ((e.removeChild(n), l && l.nodeType === 8))
            if (((n = l.data), n === '/$')) {
                if (r === 0) {
                    ;(e.removeChild(l), lr(t))
                    return
                }
                r--
            } else (n !== '$' && n !== '$?' && n !== '$!') || r++
        n = l
    } while (n)
    lr(t)
}
function xt(e) {
    for (; e != null; e = e.nextSibling) {
        var t = e.nodeType
        if (t === 1 || t === 3) break
        if (t === 8) {
            if (((t = e.data), t === '$' || t === '$!' || t === '$?')) break
            if (t === '/$') return null
        }
    }
    return e
}
function Qu(e) {
    e = e.previousSibling
    for (var t = 0; e; ) {
        if (e.nodeType === 8) {
            var n = e.data
            if (n === '$' || n === '$!' || n === '$?') {
                if (t === 0) return e
                t--
            } else n === '/$' && t++
        }
        e = e.previousSibling
    }
    return null
}
var Tn = Math.random().toString(36).slice(2),
    Xe = '__reactFiber$' + Tn,
    ar = '__reactProps$' + Tn,
    st = '__reactContainer$' + Tn,
    Qo = '__reactEvents$' + Tn,
    np = '__reactListeners$' + Tn,
    rp = '__reactHandles$' + Tn
function At(e) {
    var t = e[Xe]
    if (t) return t
    for (var n = e.parentNode; n; ) {
        if ((t = n[st] || n[Xe])) {
            if (((n = t.alternate), t.child !== null || (n !== null && n.child !== null)))
                for (e = Qu(e); e !== null; ) {
                    if ((n = e[Xe])) return n
                    e = Qu(e)
                }
            return t
        }
        ;((e = n), (n = e.parentNode))
    }
    return null
}
function Sr(e) {
    return ((e = e[Xe] || e[st]), !e || (e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3) ? null : e)
}
function on(e) {
    if (e.tag === 5 || e.tag === 6) return e.stateNode
    throw Error(E(33))
}
function Rl(e) {
    return e[ar] || null
}
var Ko = [],
    un = -1
function Rt(e) {
    return { current: e }
}
function B(e) {
    0 > un || ((e.current = Ko[un]), (Ko[un] = null), un--)
}
function V(e, t) {
    ;(un++, (Ko[un] = e.current), (e.current = t))
}
var Lt = {},
    fe = Rt(Lt),
    ye = Rt(!1),
    Gt = Lt
function Sn(e, t) {
    var n = e.type.contextTypes
    if (!n) return Lt
    var r = e.stateNode
    if (r && r.__reactInternalMemoizedUnmaskedChildContext === t) return r.__reactInternalMemoizedMaskedChildContext
    var l = {},
        o
    for (o in n) l[o] = t[o]
    return (
        r &&
            ((e = e.stateNode),
            (e.__reactInternalMemoizedUnmaskedChildContext = t),
            (e.__reactInternalMemoizedMaskedChildContext = l)),
        l
    )
}
function we(e) {
    return ((e = e.childContextTypes), e != null)
}
function al() {
    ;(B(ye), B(fe))
}
function Ku(e, t, n) {
    if (fe.current !== Lt) throw Error(E(168))
    ;(V(fe, t), V(ye, n))
}
function Ka(e, t, n) {
    var r = e.stateNode
    if (((t = t.childContextTypes), typeof r.getChildContext != 'function')) return n
    r = r.getChildContext()
    for (var l in r) if (!(l in t)) throw Error(E(108, Vf(e) || 'Unknown', l))
    return Y({}, n, r)
}
function cl(e) {
    return (
        (e = ((e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext) || Lt),
        (Gt = fe.current),
        V(fe, e),
        V(ye, ye.current),
        !0
    )
}
function Yu(e, t, n) {
    var r = e.stateNode
    if (!r) throw Error(E(169))
    ;(n ? ((e = Ka(e, t, Gt)), (r.__reactInternalMemoizedMergedChildContext = e), B(ye), B(fe), V(fe, e)) : B(ye),
        V(ye, n))
}
var et = null,
    Dl = !1,
    io = !1
function Ya(e) {
    et === null ? (et = [e]) : et.push(e)
}
function lp(e) {
    ;((Dl = !0), Ya(e))
}
function Dt() {
    if (!io && et !== null) {
        io = !0
        var e = 0,
            t = U
        try {
            var n = et
            for (U = 1; e < n.length; e++) {
                var r = n[e]
                do r = r(!0)
                while (r !== null)
            }
            ;((et = null), (Dl = !1))
        } catch (l) {
            throw (et !== null && (et = et.slice(e + 1)), wa(Pi, Dt), l)
        } finally {
            ;((U = t), (io = !1))
        }
    }
    return null
}
var sn = [],
    an = 0,
    fl = null,
    dl = 0,
    Me = [],
    ze = 0,
    Qt = null,
    nt = 1,
    rt = ''
function It(e, t) {
    ;((sn[an++] = dl), (sn[an++] = fl), (fl = e), (dl = t))
}
function Xa(e, t, n) {
    ;((Me[ze++] = nt), (Me[ze++] = rt), (Me[ze++] = Qt), (Qt = e))
    var r = nt
    e = rt
    var l = 32 - Be(r) - 1
    ;((r &= ~(1 << l)), (n += 1))
    var o = 32 - Be(t) + l
    if (30 < o) {
        var i = l - (l % 5)
        ;((o = (r & ((1 << i) - 1)).toString(32)),
            (r >>= i),
            (l -= i),
            (nt = (1 << (32 - Be(t) + l)) | (n << l) | r),
            (rt = o + e))
    } else ((nt = (1 << o) | (n << l) | r), (rt = e))
}
function Ii(e) {
    e.return !== null && (It(e, 1), Xa(e, 1, 0))
}
function Fi(e) {
    for (; e === fl; ) ((fl = sn[--an]), (sn[an] = null), (dl = sn[--an]), (sn[an] = null))
    for (; e === Qt; )
        ((Qt = Me[--ze]), (Me[ze] = null), (rt = Me[--ze]), (Me[ze] = null), (nt = Me[--ze]), (Me[ze] = null))
}
var _e = null,
    xe = null,
    G = !1,
    Ve = null
function Za(e, t) {
    var n = De(5, null, null, 0)
    ;((n.elementType = 'DELETED'),
        (n.stateNode = t),
        (n.return = e),
        (t = e.deletions),
        t === null ? ((e.deletions = [n]), (e.flags |= 16)) : t.push(n))
}
function Xu(e, t) {
    switch (e.tag) {
        case 5:
            var n = e.type
            return (
                (t = t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase() ? null : t),
                t !== null ? ((e.stateNode = t), (_e = e), (xe = xt(t.firstChild)), !0) : !1
            )
        case 6:
            return (
                (t = e.pendingProps === '' || t.nodeType !== 3 ? null : t),
                t !== null ? ((e.stateNode = t), (_e = e), (xe = null), !0) : !1
            )
        case 13:
            return (
                (t = t.nodeType !== 8 ? null : t),
                t !== null
                    ? ((n = Qt !== null ? { id: nt, overflow: rt } : null),
                      (e.memoizedState = { dehydrated: t, treeContext: n, retryLane: 1073741824 }),
                      (n = De(18, null, null, 0)),
                      (n.stateNode = t),
                      (n.return = e),
                      (e.child = n),
                      (_e = e),
                      (xe = null),
                      !0)
                    : !1
            )
        default:
            return !1
    }
}
function Yo(e) {
    return (e.mode & 1) !== 0 && (e.flags & 128) === 0
}
function Xo(e) {
    if (G) {
        var t = xe
        if (t) {
            var n = t
            if (!Xu(e, t)) {
                if (Yo(e)) throw Error(E(418))
                t = xt(n.nextSibling)
                var r = _e
                t && Xu(e, t) ? Za(r, n) : ((e.flags = (e.flags & -4097) | 2), (G = !1), (_e = e))
            }
        } else {
            if (Yo(e)) throw Error(E(418))
            ;((e.flags = (e.flags & -4097) | 2), (G = !1), (_e = e))
        }
    }
}
function Zu(e) {
    for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; ) e = e.return
    _e = e
}
function jr(e) {
    if (e !== _e) return !1
    if (!G) return (Zu(e), (G = !0), !1)
    var t
    if (
        ((t = e.tag !== 3) &&
            !(t = e.tag !== 5) &&
            ((t = e.type), (t = t !== 'head' && t !== 'body' && !Wo(e.type, e.memoizedProps))),
        t && (t = xe))
    ) {
        if (Yo(e)) throw (Ja(), Error(E(418)))
        for (; t; ) (Za(e, t), (t = xt(t.nextSibling)))
    }
    if ((Zu(e), e.tag === 13)) {
        if (((e = e.memoizedState), (e = e !== null ? e.dehydrated : null), !e)) throw Error(E(317))
        e: {
            for (e = e.nextSibling, t = 0; e; ) {
                if (e.nodeType === 8) {
                    var n = e.data
                    if (n === '/$') {
                        if (t === 0) {
                            xe = xt(e.nextSibling)
                            break e
                        }
                        t--
                    } else (n !== '$' && n !== '$!' && n !== '$?') || t++
                }
                e = e.nextSibling
            }
            xe = null
        }
    } else xe = _e ? xt(e.stateNode.nextSibling) : null
    return !0
}
function Ja() {
    for (var e = xe; e; ) e = xt(e.nextSibling)
}
function kn() {
    ;((xe = _e = null), (G = !1))
}
function Ai(e) {
    Ve === null ? (Ve = [e]) : Ve.push(e)
}
var op = dt.ReactCurrentBatchConfig
function In(e, t, n) {
    if (((e = n.ref), e !== null && typeof e != 'function' && typeof e != 'object')) {
        if (n._owner) {
            if (((n = n._owner), n)) {
                if (n.tag !== 1) throw Error(E(309))
                var r = n.stateNode
            }
            if (!r) throw Error(E(147, e))
            var l = r,
                o = '' + e
            return t !== null && t.ref !== null && typeof t.ref == 'function' && t.ref._stringRef === o
                ? t.ref
                : ((t = function (i) {
                      var u = l.refs
                      i === null ? delete u[o] : (u[o] = i)
                  }),
                  (t._stringRef = o),
                  t)
        }
        if (typeof e != 'string') throw Error(E(284))
        if (!n._owner) throw Error(E(290, e))
    }
    return e
}
function Ir(e, t) {
    throw (
        (e = Object.prototype.toString.call(t)),
        Error(E(31, e === '[object Object]' ? 'object with keys {' + Object.keys(t).join(', ') + '}' : e))
    )
}
function Ju(e) {
    var t = e._init
    return t(e._payload)
}
function qa(e) {
    function t(f, c) {
        if (e) {
            var p = f.deletions
            p === null ? ((f.deletions = [c]), (f.flags |= 16)) : p.push(c)
        }
    }
    function n(f, c) {
        if (!e) return null
        for (; c !== null; ) (t(f, c), (c = c.sibling))
        return null
    }
    function r(f, c) {
        for (f = new Map(); c !== null; ) (c.key !== null ? f.set(c.key, c) : f.set(c.index, c), (c = c.sibling))
        return f
    }
    function l(f, c) {
        return ((f = Pt(f, c)), (f.index = 0), (f.sibling = null), f)
    }
    function o(f, c, p) {
        return (
            (f.index = p),
            e
                ? ((p = f.alternate),
                  p !== null ? ((p = p.index), p < c ? ((f.flags |= 2), c) : p) : ((f.flags |= 2), c))
                : ((f.flags |= 1048576), c)
        )
    }
    function i(f) {
        return (e && f.alternate === null && (f.flags |= 2), f)
    }
    function u(f, c, p, y) {
        return c === null || c.tag !== 6
            ? ((c = ho(p, f.mode, y)), (c.return = f), c)
            : ((c = l(c, p)), (c.return = f), c)
    }
    function s(f, c, p, y) {
        var w = p.type
        return w === tn
            ? m(f, c, p.props.children, y, p.key)
            : c !== null &&
                (c.elementType === w || (typeof w == 'object' && w !== null && w.$$typeof === ht && Ju(w) === c.type))
              ? ((y = l(c, p.props)), (y.ref = In(f, c, p)), (y.return = f), y)
              : ((y = br(p.type, p.key, p.props, null, f.mode, y)), (y.ref = In(f, c, p)), (y.return = f), y)
    }
    function a(f, c, p, y) {
        return c === null ||
            c.tag !== 4 ||
            c.stateNode.containerInfo !== p.containerInfo ||
            c.stateNode.implementation !== p.implementation
            ? ((c = mo(p, f.mode, y)), (c.return = f), c)
            : ((c = l(c, p.children || [])), (c.return = f), c)
    }
    function m(f, c, p, y, w) {
        return c === null || c.tag !== 7
            ? ((c = Wt(p, f.mode, y, w)), (c.return = f), c)
            : ((c = l(c, p)), (c.return = f), c)
    }
    function h(f, c, p) {
        if ((typeof c == 'string' && c !== '') || typeof c == 'number')
            return ((c = ho('' + c, f.mode, p)), (c.return = f), c)
        if (typeof c == 'object' && c !== null) {
            switch (c.$$typeof) {
                case _r:
                    return (
                        (p = br(c.type, c.key, c.props, null, f.mode, p)),
                        (p.ref = In(f, null, c)),
                        (p.return = f),
                        p
                    )
                case en:
                    return ((c = mo(c, f.mode, p)), (c.return = f), c)
                case ht:
                    var y = c._init
                    return h(f, y(c._payload), p)
            }
            if (Vn(c) || zn(c)) return ((c = Wt(c, f.mode, p, null)), (c.return = f), c)
            Ir(f, c)
        }
        return null
    }
    function d(f, c, p, y) {
        var w = c !== null ? c.key : null
        if ((typeof p == 'string' && p !== '') || typeof p == 'number') return w !== null ? null : u(f, c, '' + p, y)
        if (typeof p == 'object' && p !== null) {
            switch (p.$$typeof) {
                case _r:
                    return p.key === w ? s(f, c, p, y) : null
                case en:
                    return p.key === w ? a(f, c, p, y) : null
                case ht:
                    return ((w = p._init), d(f, c, w(p._payload), y))
            }
            if (Vn(p) || zn(p)) return w !== null ? null : m(f, c, p, y, null)
            Ir(f, p)
        }
        return null
    }
    function g(f, c, p, y, w) {
        if ((typeof y == 'string' && y !== '') || typeof y == 'number')
            return ((f = f.get(p) || null), u(c, f, '' + y, w))
        if (typeof y == 'object' && y !== null) {
            switch (y.$$typeof) {
                case _r:
                    return ((f = f.get(y.key === null ? p : y.key) || null), s(c, f, y, w))
                case en:
                    return ((f = f.get(y.key === null ? p : y.key) || null), a(c, f, y, w))
                case ht:
                    var C = y._init
                    return g(f, c, p, C(y._payload), w)
            }
            if (Vn(y) || zn(y)) return ((f = f.get(p) || null), m(c, f, y, w, null))
            Ir(c, y)
        }
        return null
    }
    function v(f, c, p, y) {
        for (var w = null, C = null, x = c, _ = (c = 0), O = null; x !== null && _ < p.length; _++) {
            x.index > _ ? ((O = x), (x = null)) : (O = x.sibling)
            var P = d(f, x, p[_], y)
            if (P === null) {
                x === null && (x = O)
                break
            }
            ;(e && x && P.alternate === null && t(f, x),
                (c = o(P, c, _)),
                C === null ? (w = P) : (C.sibling = P),
                (C = P),
                (x = O))
        }
        if (_ === p.length) return (n(f, x), G && It(f, _), w)
        if (x === null) {
            for (; _ < p.length; _++)
                ((x = h(f, p[_], y)), x !== null && ((c = o(x, c, _)), C === null ? (w = x) : (C.sibling = x), (C = x)))
            return (G && It(f, _), w)
        }
        for (x = r(f, x); _ < p.length; _++)
            ((O = g(x, f, _, p[_], y)),
                O !== null &&
                    (e && O.alternate !== null && x.delete(O.key === null ? _ : O.key),
                    (c = o(O, c, _)),
                    C === null ? (w = O) : (C.sibling = O),
                    (C = O)))
        return (
            e &&
                x.forEach(function (R) {
                    return t(f, R)
                }),
            G && It(f, _),
            w
        )
    }
    function k(f, c, p, y) {
        var w = zn(p)
        if (typeof w != 'function') throw Error(E(150))
        if (((p = w.call(p)), p == null)) throw Error(E(151))
        for (var C = (w = null), x = c, _ = (c = 0), O = null, P = p.next(); x !== null && !P.done; _++, P = p.next()) {
            x.index > _ ? ((O = x), (x = null)) : (O = x.sibling)
            var R = d(f, x, P.value, y)
            if (R === null) {
                x === null && (x = O)
                break
            }
            ;(e && x && R.alternate === null && t(f, x),
                (c = o(R, c, _)),
                C === null ? (w = R) : (C.sibling = R),
                (C = R),
                (x = O))
        }
        if (P.done) return (n(f, x), G && It(f, _), w)
        if (x === null) {
            for (; !P.done; _++, P = p.next())
                ((P = h(f, P.value, y)),
                    P !== null && ((c = o(P, c, _)), C === null ? (w = P) : (C.sibling = P), (C = P)))
            return (G && It(f, _), w)
        }
        for (x = r(f, x); !P.done; _++, P = p.next())
            ((P = g(x, f, _, P.value, y)),
                P !== null &&
                    (e && P.alternate !== null && x.delete(P.key === null ? _ : P.key),
                    (c = o(P, c, _)),
                    C === null ? (w = P) : (C.sibling = P),
                    (C = P)))
        return (
            e &&
                x.forEach(function (X) {
                    return t(f, X)
                }),
            G && It(f, _),
            w
        )
    }
    function N(f, c, p, y) {
        if (
            (typeof p == 'object' && p !== null && p.type === tn && p.key === null && (p = p.props.children),
            typeof p == 'object' && p !== null)
        ) {
            switch (p.$$typeof) {
                case _r:
                    e: {
                        for (var w = p.key, C = c; C !== null; ) {
                            if (C.key === w) {
                                if (((w = p.type), w === tn)) {
                                    if (C.tag === 7) {
                                        ;(n(f, C.sibling), (c = l(C, p.props.children)), (c.return = f), (f = c))
                                        break e
                                    }
                                } else if (
                                    C.elementType === w ||
                                    (typeof w == 'object' && w !== null && w.$$typeof === ht && Ju(w) === C.type)
                                ) {
                                    ;(n(f, C.sibling),
                                        (c = l(C, p.props)),
                                        (c.ref = In(f, C, p)),
                                        (c.return = f),
                                        (f = c))
                                    break e
                                }
                                n(f, C)
                                break
                            } else t(f, C)
                            C = C.sibling
                        }
                        p.type === tn
                            ? ((c = Wt(p.props.children, f.mode, y, p.key)), (c.return = f), (f = c))
                            : ((y = br(p.type, p.key, p.props, null, f.mode, y)),
                              (y.ref = In(f, c, p)),
                              (y.return = f),
                              (f = y))
                    }
                    return i(f)
                case en:
                    e: {
                        for (C = p.key; c !== null; ) {
                            if (c.key === C)
                                if (
                                    c.tag === 4 &&
                                    c.stateNode.containerInfo === p.containerInfo &&
                                    c.stateNode.implementation === p.implementation
                                ) {
                                    ;(n(f, c.sibling), (c = l(c, p.children || [])), (c.return = f), (f = c))
                                    break e
                                } else {
                                    n(f, c)
                                    break
                                }
                            else t(f, c)
                            c = c.sibling
                        }
                        ;((c = mo(p, f.mode, y)), (c.return = f), (f = c))
                    }
                    return i(f)
                case ht:
                    return ((C = p._init), N(f, c, C(p._payload), y))
            }
            if (Vn(p)) return v(f, c, p, y)
            if (zn(p)) return k(f, c, p, y)
            Ir(f, p)
        }
        return (typeof p == 'string' && p !== '') || typeof p == 'number'
            ? ((p = '' + p),
              c !== null && c.tag === 6
                  ? (n(f, c.sibling), (c = l(c, p)), (c.return = f), (f = c))
                  : (n(f, c), (c = ho(p, f.mode, y)), (c.return = f), (f = c)),
              i(f))
            : n(f, c)
    }
    return N
}
var En = qa(!0),
    ba = qa(!1),
    pl = Rt(null),
    hl = null,
    cn = null,
    Ui = null
function $i() {
    Ui = cn = hl = null
}
function Vi(e) {
    var t = pl.current
    ;(B(pl), (e._currentValue = t))
}
function Zo(e, t, n) {
    for (; e !== null; ) {
        var r = e.alternate
        if (
            ((e.childLanes & t) !== t
                ? ((e.childLanes |= t), r !== null && (r.childLanes |= t))
                : r !== null && (r.childLanes & t) !== t && (r.childLanes |= t),
            e === n)
        )
            break
        e = e.return
    }
}
function vn(e, t) {
    ;((hl = e),
        (Ui = cn = null),
        (e = e.dependencies),
        e !== null && e.firstContext !== null && (e.lanes & t && (ve = !0), (e.firstContext = null)))
}
function je(e) {
    var t = e._currentValue
    if (Ui !== e)
        if (((e = { context: e, memoizedValue: t, next: null }), cn === null)) {
            if (hl === null) throw Error(E(308))
            ;((cn = e), (hl.dependencies = { lanes: 0, firstContext: e }))
        } else cn = cn.next = e
    return t
}
var Ut = null
function Hi(e) {
    Ut === null ? (Ut = [e]) : Ut.push(e)
}
function ec(e, t, n, r) {
    var l = t.interleaved
    return (l === null ? ((n.next = n), Hi(t)) : ((n.next = l.next), (l.next = n)), (t.interleaved = n), at(e, r))
}
function at(e, t) {
    e.lanes |= t
    var n = e.alternate
    for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null; )
        ((e.childLanes |= t), (n = e.alternate), n !== null && (n.childLanes |= t), (n = e), (e = e.return))
    return n.tag === 3 ? n.stateNode : null
}
var mt = !1
function Bi(e) {
    e.updateQueue = {
        baseState: e.memoizedState,
        firstBaseUpdate: null,
        lastBaseUpdate: null,
        shared: { pending: null, interleaved: null, lanes: 0 },
        effects: null,
    }
}
function tc(e, t) {
    ;((e = e.updateQueue),
        t.updateQueue === e &&
            (t.updateQueue = {
                baseState: e.baseState,
                firstBaseUpdate: e.firstBaseUpdate,
                lastBaseUpdate: e.lastBaseUpdate,
                shared: e.shared,
                effects: e.effects,
            }))
}
function ot(e, t) {
    return { eventTime: e, lane: t, tag: 0, payload: null, callback: null, next: null }
}
function Ct(e, t, n) {
    var r = e.updateQueue
    if (r === null) return null
    if (((r = r.shared), F & 2)) {
        var l = r.pending
        return (l === null ? (t.next = t) : ((t.next = l.next), (l.next = t)), (r.pending = t), at(e, n))
    }
    return (
        (l = r.interleaved),
        l === null ? ((t.next = t), Hi(r)) : ((t.next = l.next), (l.next = t)),
        (r.interleaved = t),
        at(e, n)
    )
}
function Kr(e, t, n) {
    if (((t = t.updateQueue), t !== null && ((t = t.shared), (n & 4194240) !== 0))) {
        var r = t.lanes
        ;((r &= e.pendingLanes), (n |= r), (t.lanes = n), Ti(e, n))
    }
}
function qu(e, t) {
    var n = e.updateQueue,
        r = e.alternate
    if (r !== null && ((r = r.updateQueue), n === r)) {
        var l = null,
            o = null
        if (((n = n.firstBaseUpdate), n !== null)) {
            do {
                var i = {
                    eventTime: n.eventTime,
                    lane: n.lane,
                    tag: n.tag,
                    payload: n.payload,
                    callback: n.callback,
                    next: null,
                }
                ;(o === null ? (l = o = i) : (o = o.next = i), (n = n.next))
            } while (n !== null)
            o === null ? (l = o = t) : (o = o.next = t)
        } else l = o = t
        ;((n = { baseState: r.baseState, firstBaseUpdate: l, lastBaseUpdate: o, shared: r.shared, effects: r.effects }),
            (e.updateQueue = n))
        return
    }
    ;((e = n.lastBaseUpdate), e === null ? (n.firstBaseUpdate = t) : (e.next = t), (n.lastBaseUpdate = t))
}
function ml(e, t, n, r) {
    var l = e.updateQueue
    mt = !1
    var o = l.firstBaseUpdate,
        i = l.lastBaseUpdate,
        u = l.shared.pending
    if (u !== null) {
        l.shared.pending = null
        var s = u,
            a = s.next
        ;((s.next = null), i === null ? (o = a) : (i.next = a), (i = s))
        var m = e.alternate
        m !== null &&
            ((m = m.updateQueue),
            (u = m.lastBaseUpdate),
            u !== i && (u === null ? (m.firstBaseUpdate = a) : (u.next = a), (m.lastBaseUpdate = s)))
    }
    if (o !== null) {
        var h = l.baseState
        ;((i = 0), (m = a = s = null), (u = o))
        do {
            var d = u.lane,
                g = u.eventTime
            if ((r & d) === d) {
                m !== null &&
                    (m = m.next =
                        { eventTime: g, lane: 0, tag: u.tag, payload: u.payload, callback: u.callback, next: null })
                e: {
                    var v = e,
                        k = u
                    switch (((d = t), (g = n), k.tag)) {
                        case 1:
                            if (((v = k.payload), typeof v == 'function')) {
                                h = v.call(g, h, d)
                                break e
                            }
                            h = v
                            break e
                        case 3:
                            v.flags = (v.flags & -65537) | 128
                        case 0:
                            if (((v = k.payload), (d = typeof v == 'function' ? v.call(g, h, d) : v), d == null))
                                break e
                            h = Y({}, h, d)
                            break e
                        case 2:
                            mt = !0
                    }
                }
                u.callback !== null &&
                    u.lane !== 0 &&
                    ((e.flags |= 64), (d = l.effects), d === null ? (l.effects = [u]) : d.push(u))
            } else
                ((g = { eventTime: g, lane: d, tag: u.tag, payload: u.payload, callback: u.callback, next: null }),
                    m === null ? ((a = m = g), (s = h)) : (m = m.next = g),
                    (i |= d))
            if (((u = u.next), u === null)) {
                if (((u = l.shared.pending), u === null)) break
                ;((d = u), (u = d.next), (d.next = null), (l.lastBaseUpdate = d), (l.shared.pending = null))
            }
        } while (!0)
        if (
            (m === null && (s = h),
            (l.baseState = s),
            (l.firstBaseUpdate = a),
            (l.lastBaseUpdate = m),
            (t = l.shared.interleaved),
            t !== null)
        ) {
            l = t
            do ((i |= l.lane), (l = l.next))
            while (l !== t)
        } else o === null && (l.shared.lanes = 0)
        ;((Yt |= i), (e.lanes = i), (e.memoizedState = h))
    }
}
function bu(e, t, n) {
    if (((e = t.effects), (t.effects = null), e !== null))
        for (t = 0; t < e.length; t++) {
            var r = e[t],
                l = r.callback
            if (l !== null) {
                if (((r.callback = null), (r = n), typeof l != 'function')) throw Error(E(191, l))
                l.call(r)
            }
        }
}
var kr = {},
    Je = Rt(kr),
    cr = Rt(kr),
    fr = Rt(kr)
function $t(e) {
    if (e === kr) throw Error(E(174))
    return e
}
function Wi(e, t) {
    switch ((V(fr, t), V(cr, e), V(Je, kr), (e = t.nodeType), e)) {
        case 9:
        case 11:
            t = (t = t.documentElement) ? t.namespaceURI : Mo(null, '')
            break
        default:
            ;((e = e === 8 ? t.parentNode : t), (t = e.namespaceURI || null), (e = e.tagName), (t = Mo(t, e)))
    }
    ;(B(Je), V(Je, t))
}
function xn() {
    ;(B(Je), B(cr), B(fr))
}
function nc(e) {
    $t(fr.current)
    var t = $t(Je.current),
        n = Mo(t, e.type)
    t !== n && (V(cr, e), V(Je, n))
}
function Gi(e) {
    cr.current === e && (B(Je), B(cr))
}
var Q = Rt(0)
function gl(e) {
    for (var t = e; t !== null; ) {
        if (t.tag === 13) {
            var n = t.memoizedState
            if (n !== null && ((n = n.dehydrated), n === null || n.data === '$?' || n.data === '$!')) return t
        } else if (t.tag === 19 && t.memoizedProps.revealOrder !== void 0) {
            if (t.flags & 128) return t
        } else if (t.child !== null) {
            ;((t.child.return = t), (t = t.child))
            continue
        }
        if (t === e) break
        for (; t.sibling === null; ) {
            if (t.return === null || t.return === e) return null
            t = t.return
        }
        ;((t.sibling.return = t.return), (t = t.sibling))
    }
    return null
}
var uo = []
function Qi() {
    for (var e = 0; e < uo.length; e++) uo[e]._workInProgressVersionPrimary = null
    uo.length = 0
}
var Yr = dt.ReactCurrentDispatcher,
    so = dt.ReactCurrentBatchConfig,
    Kt = 0,
    K = null,
    ee = null,
    ne = null,
    vl = !1,
    Xn = !1,
    dr = 0,
    ip = 0
function ue() {
    throw Error(E(321))
}
function Ki(e, t) {
    if (t === null) return !1
    for (var n = 0; n < t.length && n < e.length; n++) if (!Ge(e[n], t[n])) return !1
    return !0
}
function Yi(e, t, n, r, l, o) {
    if (
        ((Kt = o),
        (K = t),
        (t.memoizedState = null),
        (t.updateQueue = null),
        (t.lanes = 0),
        (Yr.current = e === null || e.memoizedState === null ? cp : fp),
        (e = n(r, l)),
        Xn)
    ) {
        o = 0
        do {
            if (((Xn = !1), (dr = 0), 25 <= o)) throw Error(E(301))
            ;((o += 1), (ne = ee = null), (t.updateQueue = null), (Yr.current = dp), (e = n(r, l)))
        } while (Xn)
    }
    if (((Yr.current = yl), (t = ee !== null && ee.next !== null), (Kt = 0), (ne = ee = K = null), (vl = !1), t))
        throw Error(E(300))
    return e
}
function Xi() {
    var e = dr !== 0
    return ((dr = 0), e)
}
function Ye() {
    var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null }
    return (ne === null ? (K.memoizedState = ne = e) : (ne = ne.next = e), ne)
}
function Ie() {
    if (ee === null) {
        var e = K.alternate
        e = e !== null ? e.memoizedState : null
    } else e = ee.next
    var t = ne === null ? K.memoizedState : ne.next
    if (t !== null) ((ne = t), (ee = e))
    else {
        if (e === null) throw Error(E(310))
        ;((ee = e),
            (e = {
                memoizedState: ee.memoizedState,
                baseState: ee.baseState,
                baseQueue: ee.baseQueue,
                queue: ee.queue,
                next: null,
            }),
            ne === null ? (K.memoizedState = ne = e) : (ne = ne.next = e))
    }
    return ne
}
function pr(e, t) {
    return typeof t == 'function' ? t(e) : t
}
function ao(e) {
    var t = Ie(),
        n = t.queue
    if (n === null) throw Error(E(311))
    n.lastRenderedReducer = e
    var r = ee,
        l = r.baseQueue,
        o = n.pending
    if (o !== null) {
        if (l !== null) {
            var i = l.next
            ;((l.next = o.next), (o.next = i))
        }
        ;((r.baseQueue = l = o), (n.pending = null))
    }
    if (l !== null) {
        ;((o = l.next), (r = r.baseState))
        var u = (i = null),
            s = null,
            a = o
        do {
            var m = a.lane
            if ((Kt & m) === m)
                (s !== null &&
                    (s = s.next =
                        {
                            lane: 0,
                            action: a.action,
                            hasEagerState: a.hasEagerState,
                            eagerState: a.eagerState,
                            next: null,
                        }),
                    (r = a.hasEagerState ? a.eagerState : e(r, a.action)))
            else {
                var h = {
                    lane: m,
                    action: a.action,
                    hasEagerState: a.hasEagerState,
                    eagerState: a.eagerState,
                    next: null,
                }
                ;(s === null ? ((u = s = h), (i = r)) : (s = s.next = h), (K.lanes |= m), (Yt |= m))
            }
            a = a.next
        } while (a !== null && a !== o)
        ;(s === null ? (i = r) : (s.next = u),
            Ge(r, t.memoizedState) || (ve = !0),
            (t.memoizedState = r),
            (t.baseState = i),
            (t.baseQueue = s),
            (n.lastRenderedState = r))
    }
    if (((e = n.interleaved), e !== null)) {
        l = e
        do ((o = l.lane), (K.lanes |= o), (Yt |= o), (l = l.next))
        while (l !== e)
    } else l === null && (n.lanes = 0)
    return [t.memoizedState, n.dispatch]
}
function co(e) {
    var t = Ie(),
        n = t.queue
    if (n === null) throw Error(E(311))
    n.lastRenderedReducer = e
    var r = n.dispatch,
        l = n.pending,
        o = t.memoizedState
    if (l !== null) {
        n.pending = null
        var i = (l = l.next)
        do ((o = e(o, i.action)), (i = i.next))
        while (i !== l)
        ;(Ge(o, t.memoizedState) || (ve = !0),
            (t.memoizedState = o),
            t.baseQueue === null && (t.baseState = o),
            (n.lastRenderedState = o))
    }
    return [o, r]
}
function rc() {}
function lc(e, t) {
    var n = K,
        r = Ie(),
        l = t(),
        o = !Ge(r.memoizedState, l)
    if (
        (o && ((r.memoizedState = l), (ve = !0)),
        (r = r.queue),
        Zi(uc.bind(null, n, r, e), [e]),
        r.getSnapshot !== t || o || (ne !== null && ne.memoizedState.tag & 1))
    ) {
        if (((n.flags |= 2048), hr(9, ic.bind(null, n, r, l, t), void 0, null), re === null)) throw Error(E(349))
        Kt & 30 || oc(n, t, l)
    }
    return l
}
function oc(e, t, n) {
    ;((e.flags |= 16384),
        (e = { getSnapshot: t, value: n }),
        (t = K.updateQueue),
        t === null
            ? ((t = { lastEffect: null, stores: null }), (K.updateQueue = t), (t.stores = [e]))
            : ((n = t.stores), n === null ? (t.stores = [e]) : n.push(e)))
}
function ic(e, t, n, r) {
    ;((t.value = n), (t.getSnapshot = r), sc(t) && ac(e))
}
function uc(e, t, n) {
    return n(function () {
        sc(t) && ac(e)
    })
}
function sc(e) {
    var t = e.getSnapshot
    e = e.value
    try {
        var n = t()
        return !Ge(e, n)
    } catch {
        return !0
    }
}
function ac(e) {
    var t = at(e, 1)
    t !== null && We(t, e, 1, -1)
}
function es(e) {
    var t = Ye()
    return (
        typeof e == 'function' && (e = e()),
        (t.memoizedState = t.baseState = e),
        (e = {
            pending: null,
            interleaved: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: pr,
            lastRenderedState: e,
        }),
        (t.queue = e),
        (e = e.dispatch = ap.bind(null, K, e)),
        [t.memoizedState, e]
    )
}
function hr(e, t, n, r) {
    return (
        (e = { tag: e, create: t, destroy: n, deps: r, next: null }),
        (t = K.updateQueue),
        t === null
            ? ((t = { lastEffect: null, stores: null }), (K.updateQueue = t), (t.lastEffect = e.next = e))
            : ((n = t.lastEffect),
              n === null
                  ? (t.lastEffect = e.next = e)
                  : ((r = n.next), (n.next = e), (e.next = r), (t.lastEffect = e))),
        e
    )
}
function cc() {
    return Ie().memoizedState
}
function Xr(e, t, n, r) {
    var l = Ye()
    ;((K.flags |= e), (l.memoizedState = hr(1 | t, n, void 0, r === void 0 ? null : r)))
}
function Ol(e, t, n, r) {
    var l = Ie()
    r = r === void 0 ? null : r
    var o = void 0
    if (ee !== null) {
        var i = ee.memoizedState
        if (((o = i.destroy), r !== null && Ki(r, i.deps))) {
            l.memoizedState = hr(t, n, o, r)
            return
        }
    }
    ;((K.flags |= e), (l.memoizedState = hr(1 | t, n, o, r)))
}
function ts(e, t) {
    return Xr(8390656, 8, e, t)
}
function Zi(e, t) {
    return Ol(2048, 8, e, t)
}
function fc(e, t) {
    return Ol(4, 2, e, t)
}
function dc(e, t) {
    return Ol(4, 4, e, t)
}
function pc(e, t) {
    if (typeof t == 'function')
        return (
            (e = e()),
            t(e),
            function () {
                t(null)
            }
        )
    if (t != null)
        return (
            (e = e()),
            (t.current = e),
            function () {
                t.current = null
            }
        )
}
function hc(e, t, n) {
    return ((n = n != null ? n.concat([e]) : null), Ol(4, 4, pc.bind(null, t, e), n))
}
function Ji() {}
function mc(e, t) {
    var n = Ie()
    t = t === void 0 ? null : t
    var r = n.memoizedState
    return r !== null && t !== null && Ki(t, r[1]) ? r[0] : ((n.memoizedState = [e, t]), e)
}
function gc(e, t) {
    var n = Ie()
    t = t === void 0 ? null : t
    var r = n.memoizedState
    return r !== null && t !== null && Ki(t, r[1]) ? r[0] : ((e = e()), (n.memoizedState = [e, t]), e)
}
function vc(e, t, n) {
    return Kt & 21
        ? (Ge(n, t) || ((n = Ea()), (K.lanes |= n), (Yt |= n), (e.baseState = !0)), t)
        : (e.baseState && ((e.baseState = !1), (ve = !0)), (e.memoizedState = n))
}
function up(e, t) {
    var n = U
    ;((U = n !== 0 && 4 > n ? n : 4), e(!0))
    var r = so.transition
    so.transition = {}
    try {
        ;(e(!1), t())
    } finally {
        ;((U = n), (so.transition = r))
    }
}
function yc() {
    return Ie().memoizedState
}
function sp(e, t, n) {
    var r = Nt(e)
    if (((n = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null }), wc(e))) Sc(t, n)
    else if (((n = ec(e, t, n, r)), n !== null)) {
        var l = pe()
        ;(We(n, e, r, l), kc(n, t, r))
    }
}
function ap(e, t, n) {
    var r = Nt(e),
        l = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null }
    if (wc(e)) Sc(t, l)
    else {
        var o = e.alternate
        if (e.lanes === 0 && (o === null || o.lanes === 0) && ((o = t.lastRenderedReducer), o !== null))
            try {
                var i = t.lastRenderedState,
                    u = o(i, n)
                if (((l.hasEagerState = !0), (l.eagerState = u), Ge(u, i))) {
                    var s = t.interleaved
                    ;(s === null ? ((l.next = l), Hi(t)) : ((l.next = s.next), (s.next = l)), (t.interleaved = l))
                    return
                }
            } catch {
            } finally {
            }
        ;((n = ec(e, t, l, r)), n !== null && ((l = pe()), We(n, e, r, l), kc(n, t, r)))
    }
}
function wc(e) {
    var t = e.alternate
    return e === K || (t !== null && t === K)
}
function Sc(e, t) {
    Xn = vl = !0
    var n = e.pending
    ;(n === null ? (t.next = t) : ((t.next = n.next), (n.next = t)), (e.pending = t))
}
function kc(e, t, n) {
    if (n & 4194240) {
        var r = t.lanes
        ;((r &= e.pendingLanes), (n |= r), (t.lanes = n), Ti(e, n))
    }
}
var yl = {
        readContext: je,
        useCallback: ue,
        useContext: ue,
        useEffect: ue,
        useImperativeHandle: ue,
        useInsertionEffect: ue,
        useLayoutEffect: ue,
        useMemo: ue,
        useReducer: ue,
        useRef: ue,
        useState: ue,
        useDebugValue: ue,
        useDeferredValue: ue,
        useTransition: ue,
        useMutableSource: ue,
        useSyncExternalStore: ue,
        useId: ue,
        unstable_isNewReconciler: !1,
    },
    cp = {
        readContext: je,
        useCallback: function (e, t) {
            return ((Ye().memoizedState = [e, t === void 0 ? null : t]), e)
        },
        useContext: je,
        useEffect: ts,
        useImperativeHandle: function (e, t, n) {
            return ((n = n != null ? n.concat([e]) : null), Xr(4194308, 4, pc.bind(null, t, e), n))
        },
        useLayoutEffect: function (e, t) {
            return Xr(4194308, 4, e, t)
        },
        useInsertionEffect: function (e, t) {
            return Xr(4, 2, e, t)
        },
        useMemo: function (e, t) {
            var n = Ye()
            return ((t = t === void 0 ? null : t), (e = e()), (n.memoizedState = [e, t]), e)
        },
        useReducer: function (e, t, n) {
            var r = Ye()
            return (
                (t = n !== void 0 ? n(t) : t),
                (r.memoizedState = r.baseState = t),
                (e = {
                    pending: null,
                    interleaved: null,
                    lanes: 0,
                    dispatch: null,
                    lastRenderedReducer: e,
                    lastRenderedState: t,
                }),
                (r.queue = e),
                (e = e.dispatch = sp.bind(null, K, e)),
                [r.memoizedState, e]
            )
        },
        useRef: function (e) {
            var t = Ye()
            return ((e = { current: e }), (t.memoizedState = e))
        },
        useState: es,
        useDebugValue: Ji,
        useDeferredValue: function (e) {
            return (Ye().memoizedState = e)
        },
        useTransition: function () {
            var e = es(!1),
                t = e[0]
            return ((e = up.bind(null, e[1])), (Ye().memoizedState = e), [t, e])
        },
        useMutableSource: function () {},
        useSyncExternalStore: function (e, t, n) {
            var r = K,
                l = Ye()
            if (G) {
                if (n === void 0) throw Error(E(407))
                n = n()
            } else {
                if (((n = t()), re === null)) throw Error(E(349))
                Kt & 30 || oc(r, t, n)
            }
            l.memoizedState = n
            var o = { value: n, getSnapshot: t }
            return (
                (l.queue = o),
                ts(uc.bind(null, r, o, e), [e]),
                (r.flags |= 2048),
                hr(9, ic.bind(null, r, o, n, t), void 0, null),
                n
            )
        },
        useId: function () {
            var e = Ye(),
                t = re.identifierPrefix
            if (G) {
                var n = rt,
                    r = nt
                ;((n = (r & ~(1 << (32 - Be(r) - 1))).toString(32) + n),
                    (t = ':' + t + 'R' + n),
                    (n = dr++),
                    0 < n && (t += 'H' + n.toString(32)),
                    (t += ':'))
            } else ((n = ip++), (t = ':' + t + 'r' + n.toString(32) + ':'))
            return (e.memoizedState = t)
        },
        unstable_isNewReconciler: !1,
    },
    fp = {
        readContext: je,
        useCallback: mc,
        useContext: je,
        useEffect: Zi,
        useImperativeHandle: hc,
        useInsertionEffect: fc,
        useLayoutEffect: dc,
        useMemo: gc,
        useReducer: ao,
        useRef: cc,
        useState: function () {
            return ao(pr)
        },
        useDebugValue: Ji,
        useDeferredValue: function (e) {
            var t = Ie()
            return vc(t, ee.memoizedState, e)
        },
        useTransition: function () {
            var e = ao(pr)[0],
                t = Ie().memoizedState
            return [e, t]
        },
        useMutableSource: rc,
        useSyncExternalStore: lc,
        useId: yc,
        unstable_isNewReconciler: !1,
    },
    dp = {
        readContext: je,
        useCallback: mc,
        useContext: je,
        useEffect: Zi,
        useImperativeHandle: hc,
        useInsertionEffect: fc,
        useLayoutEffect: dc,
        useMemo: gc,
        useReducer: co,
        useRef: cc,
        useState: function () {
            return co(pr)
        },
        useDebugValue: Ji,
        useDeferredValue: function (e) {
            var t = Ie()
            return ee === null ? (t.memoizedState = e) : vc(t, ee.memoizedState, e)
        },
        useTransition: function () {
            var e = co(pr)[0],
                t = Ie().memoizedState
            return [e, t]
        },
        useMutableSource: rc,
        useSyncExternalStore: lc,
        useId: yc,
        unstable_isNewReconciler: !1,
    }
function Ue(e, t) {
    if (e && e.defaultProps) {
        ;((t = Y({}, t)), (e = e.defaultProps))
        for (var n in e) t[n] === void 0 && (t[n] = e[n])
        return t
    }
    return t
}
function Jo(e, t, n, r) {
    ;((t = e.memoizedState),
        (n = n(r, t)),
        (n = n == null ? t : Y({}, t, n)),
        (e.memoizedState = n),
        e.lanes === 0 && (e.updateQueue.baseState = n))
}
var jl = {
    isMounted: function (e) {
        return (e = e._reactInternals) ? Jt(e) === e : !1
    },
    enqueueSetState: function (e, t, n) {
        e = e._reactInternals
        var r = pe(),
            l = Nt(e),
            o = ot(r, l)
        ;((o.payload = t),
            n != null && (o.callback = n),
            (t = Ct(e, o, l)),
            t !== null && (We(t, e, l, r), Kr(t, e, l)))
    },
    enqueueReplaceState: function (e, t, n) {
        e = e._reactInternals
        var r = pe(),
            l = Nt(e),
            o = ot(r, l)
        ;((o.tag = 1),
            (o.payload = t),
            n != null && (o.callback = n),
            (t = Ct(e, o, l)),
            t !== null && (We(t, e, l, r), Kr(t, e, l)))
    },
    enqueueForceUpdate: function (e, t) {
        e = e._reactInternals
        var n = pe(),
            r = Nt(e),
            l = ot(n, r)
        ;((l.tag = 2), t != null && (l.callback = t), (t = Ct(e, l, r)), t !== null && (We(t, e, r, n), Kr(t, e, r)))
    },
}
function ns(e, t, n, r, l, o, i) {
    return (
        (e = e.stateNode),
        typeof e.shouldComponentUpdate == 'function'
            ? e.shouldComponentUpdate(r, o, i)
            : t.prototype && t.prototype.isPureReactComponent
              ? !ir(n, r) || !ir(l, o)
              : !0
    )
}
function Ec(e, t, n) {
    var r = !1,
        l = Lt,
        o = t.contextType
    return (
        typeof o == 'object' && o !== null
            ? (o = je(o))
            : ((l = we(t) ? Gt : fe.current), (r = t.contextTypes), (o = (r = r != null) ? Sn(e, l) : Lt)),
        (t = new t(n, o)),
        (e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null),
        (t.updater = jl),
        (e.stateNode = t),
        (t._reactInternals = e),
        r &&
            ((e = e.stateNode),
            (e.__reactInternalMemoizedUnmaskedChildContext = l),
            (e.__reactInternalMemoizedMaskedChildContext = o)),
        t
    )
}
function rs(e, t, n, r) {
    ;((e = t.state),
        typeof t.componentWillReceiveProps == 'function' && t.componentWillReceiveProps(n, r),
        typeof t.UNSAFE_componentWillReceiveProps == 'function' && t.UNSAFE_componentWillReceiveProps(n, r),
        t.state !== e && jl.enqueueReplaceState(t, t.state, null))
}
function qo(e, t, n, r) {
    var l = e.stateNode
    ;((l.props = n), (l.state = e.memoizedState), (l.refs = {}), Bi(e))
    var o = t.contextType
    ;(typeof o == 'object' && o !== null
        ? (l.context = je(o))
        : ((o = we(t) ? Gt : fe.current), (l.context = Sn(e, o))),
        (l.state = e.memoizedState),
        (o = t.getDerivedStateFromProps),
        typeof o == 'function' && (Jo(e, t, o, n), (l.state = e.memoizedState)),
        typeof t.getDerivedStateFromProps == 'function' ||
            typeof l.getSnapshotBeforeUpdate == 'function' ||
            (typeof l.UNSAFE_componentWillMount != 'function' && typeof l.componentWillMount != 'function') ||
            ((t = l.state),
            typeof l.componentWillMount == 'function' && l.componentWillMount(),
            typeof l.UNSAFE_componentWillMount == 'function' && l.UNSAFE_componentWillMount(),
            t !== l.state && jl.enqueueReplaceState(l, l.state, null),
            ml(e, n, l, r),
            (l.state = e.memoizedState)),
        typeof l.componentDidMount == 'function' && (e.flags |= 4194308))
}
function Cn(e, t) {
    try {
        var n = '',
            r = t
        do ((n += $f(r)), (r = r.return))
        while (r)
        var l = n
    } catch (o) {
        l =
            `
Error generating stack: ` +
            o.message +
            `
` +
            o.stack
    }
    return { value: e, source: t, stack: l, digest: null }
}
function fo(e, t, n) {
    return { value: e, source: null, stack: n ?? null, digest: t ?? null }
}
function bo(e, t) {
    try {
        console.error(t.value)
    } catch (n) {
        setTimeout(function () {
            throw n
        })
    }
}
var pp = typeof WeakMap == 'function' ? WeakMap : Map
function xc(e, t, n) {
    ;((n = ot(-1, n)), (n.tag = 3), (n.payload = { element: null }))
    var r = t.value
    return (
        (n.callback = function () {
            ;(Sl || ((Sl = !0), (ai = r)), bo(e, t))
        }),
        n
    )
}
function Cc(e, t, n) {
    ;((n = ot(-1, n)), (n.tag = 3))
    var r = e.type.getDerivedStateFromError
    if (typeof r == 'function') {
        var l = t.value
        ;((n.payload = function () {
            return r(l)
        }),
            (n.callback = function () {
                bo(e, t)
            }))
    }
    var o = e.stateNode
    return (
        o !== null &&
            typeof o.componentDidCatch == 'function' &&
            (n.callback = function () {
                ;(bo(e, t), typeof r != 'function' && (_t === null ? (_t = new Set([this])) : _t.add(this)))
                var i = t.stack
                this.componentDidCatch(t.value, { componentStack: i !== null ? i : '' })
            }),
        n
    )
}
function ls(e, t, n) {
    var r = e.pingCache
    if (r === null) {
        r = e.pingCache = new pp()
        var l = new Set()
        r.set(t, l)
    } else ((l = r.get(t)), l === void 0 && ((l = new Set()), r.set(t, l)))
    l.has(n) || (l.add(n), (e = Pp.bind(null, e, t, n)), t.then(e, e))
}
function os(e) {
    do {
        var t
        if (((t = e.tag === 13) && ((t = e.memoizedState), (t = t !== null ? t.dehydrated !== null : !0)), t)) return e
        e = e.return
    } while (e !== null)
    return null
}
function is(e, t, n, r, l) {
    return e.mode & 1
        ? ((e.flags |= 65536), (e.lanes = l), e)
        : (e === t
              ? (e.flags |= 65536)
              : ((e.flags |= 128),
                (n.flags |= 131072),
                (n.flags &= -52805),
                n.tag === 1 && (n.alternate === null ? (n.tag = 17) : ((t = ot(-1, 1)), (t.tag = 2), Ct(n, t, 1))),
                (n.lanes |= 1)),
          e)
}
var hp = dt.ReactCurrentOwner,
    ve = !1
function de(e, t, n, r) {
    t.child = e === null ? ba(t, null, n, r) : En(t, e.child, n, r)
}
function us(e, t, n, r, l) {
    n = n.render
    var o = t.ref
    return (
        vn(t, l),
        (r = Yi(e, t, n, r, o, l)),
        (n = Xi()),
        e !== null && !ve
            ? ((t.updateQueue = e.updateQueue), (t.flags &= -2053), (e.lanes &= ~l), ct(e, t, l))
            : (G && n && Ii(t), (t.flags |= 1), de(e, t, r, l), t.child)
    )
}
function ss(e, t, n, r, l) {
    if (e === null) {
        var o = n.type
        return typeof o == 'function' &&
            !ou(o) &&
            o.defaultProps === void 0 &&
            n.compare === null &&
            n.defaultProps === void 0
            ? ((t.tag = 15), (t.type = o), _c(e, t, o, r, l))
            : ((e = br(n.type, null, r, t, t.mode, l)), (e.ref = t.ref), (e.return = t), (t.child = e))
    }
    if (((o = e.child), !(e.lanes & l))) {
        var i = o.memoizedProps
        if (((n = n.compare), (n = n !== null ? n : ir), n(i, r) && e.ref === t.ref)) return ct(e, t, l)
    }
    return ((t.flags |= 1), (e = Pt(o, r)), (e.ref = t.ref), (e.return = t), (t.child = e))
}
function _c(e, t, n, r, l) {
    if (e !== null) {
        var o = e.memoizedProps
        if (ir(o, r) && e.ref === t.ref)
            if (((ve = !1), (t.pendingProps = r = o), (e.lanes & l) !== 0)) e.flags & 131072 && (ve = !0)
            else return ((t.lanes = e.lanes), ct(e, t, l))
    }
    return ei(e, t, n, r, l)
}
function Nc(e, t, n) {
    var r = t.pendingProps,
        l = r.children,
        o = e !== null ? e.memoizedState : null
    if (r.mode === 'hidden')
        if (!(t.mode & 1))
            ((t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }), V(dn, Ee), (Ee |= n))
        else {
            if (!(n & 1073741824))
                return (
                    (e = o !== null ? o.baseLanes | n : n),
                    (t.lanes = t.childLanes = 1073741824),
                    (t.memoizedState = { baseLanes: e, cachePool: null, transitions: null }),
                    (t.updateQueue = null),
                    V(dn, Ee),
                    (Ee |= e),
                    null
                )
            ;((t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }),
                (r = o !== null ? o.baseLanes : n),
                V(dn, Ee),
                (Ee |= r))
        }
    else (o !== null ? ((r = o.baseLanes | n), (t.memoizedState = null)) : (r = n), V(dn, Ee), (Ee |= r))
    return (de(e, t, l, n), t.child)
}
function Pc(e, t) {
    var n = t.ref
    ;((e === null && n !== null) || (e !== null && e.ref !== n)) && ((t.flags |= 512), (t.flags |= 2097152))
}
function ei(e, t, n, r, l) {
    var o = we(n) ? Gt : fe.current
    return (
        (o = Sn(t, o)),
        vn(t, l),
        (n = Yi(e, t, n, r, o, l)),
        (r = Xi()),
        e !== null && !ve
            ? ((t.updateQueue = e.updateQueue), (t.flags &= -2053), (e.lanes &= ~l), ct(e, t, l))
            : (G && r && Ii(t), (t.flags |= 1), de(e, t, n, l), t.child)
    )
}
function as(e, t, n, r, l) {
    if (we(n)) {
        var o = !0
        cl(t)
    } else o = !1
    if ((vn(t, l), t.stateNode === null)) (Zr(e, t), Ec(t, n, r), qo(t, n, r, l), (r = !0))
    else if (e === null) {
        var i = t.stateNode,
            u = t.memoizedProps
        i.props = u
        var s = i.context,
            a = n.contextType
        typeof a == 'object' && a !== null ? (a = je(a)) : ((a = we(n) ? Gt : fe.current), (a = Sn(t, a)))
        var m = n.getDerivedStateFromProps,
            h = typeof m == 'function' || typeof i.getSnapshotBeforeUpdate == 'function'
        ;(h ||
            (typeof i.UNSAFE_componentWillReceiveProps != 'function' &&
                typeof i.componentWillReceiveProps != 'function') ||
            ((u !== r || s !== a) && rs(t, i, r, a)),
            (mt = !1))
        var d = t.memoizedState
        ;((i.state = d),
            ml(t, r, i, l),
            (s = t.memoizedState),
            u !== r || d !== s || ye.current || mt
                ? (typeof m == 'function' && (Jo(t, n, m, r), (s = t.memoizedState)),
                  (u = mt || ns(t, n, u, r, d, s, a))
                      ? (h ||
                            (typeof i.UNSAFE_componentWillMount != 'function' &&
                                typeof i.componentWillMount != 'function') ||
                            (typeof i.componentWillMount == 'function' && i.componentWillMount(),
                            typeof i.UNSAFE_componentWillMount == 'function' && i.UNSAFE_componentWillMount()),
                        typeof i.componentDidMount == 'function' && (t.flags |= 4194308))
                      : (typeof i.componentDidMount == 'function' && (t.flags |= 4194308),
                        (t.memoizedProps = r),
                        (t.memoizedState = s)),
                  (i.props = r),
                  (i.state = s),
                  (i.context = a),
                  (r = u))
                : (typeof i.componentDidMount == 'function' && (t.flags |= 4194308), (r = !1)))
    } else {
        ;((i = t.stateNode),
            tc(e, t),
            (u = t.memoizedProps),
            (a = t.type === t.elementType ? u : Ue(t.type, u)),
            (i.props = a),
            (h = t.pendingProps),
            (d = i.context),
            (s = n.contextType),
            typeof s == 'object' && s !== null ? (s = je(s)) : ((s = we(n) ? Gt : fe.current), (s = Sn(t, s))))
        var g = n.getDerivedStateFromProps
        ;((m = typeof g == 'function' || typeof i.getSnapshotBeforeUpdate == 'function') ||
            (typeof i.UNSAFE_componentWillReceiveProps != 'function' &&
                typeof i.componentWillReceiveProps != 'function') ||
            ((u !== h || d !== s) && rs(t, i, r, s)),
            (mt = !1),
            (d = t.memoizedState),
            (i.state = d),
            ml(t, r, i, l))
        var v = t.memoizedState
        u !== h || d !== v || ye.current || mt
            ? (typeof g == 'function' && (Jo(t, n, g, r), (v = t.memoizedState)),
              (a = mt || ns(t, n, a, r, d, v, s) || !1)
                  ? (m ||
                        (typeof i.UNSAFE_componentWillUpdate != 'function' &&
                            typeof i.componentWillUpdate != 'function') ||
                        (typeof i.componentWillUpdate == 'function' && i.componentWillUpdate(r, v, s),
                        typeof i.UNSAFE_componentWillUpdate == 'function' && i.UNSAFE_componentWillUpdate(r, v, s)),
                    typeof i.componentDidUpdate == 'function' && (t.flags |= 4),
                    typeof i.getSnapshotBeforeUpdate == 'function' && (t.flags |= 1024))
                  : (typeof i.componentDidUpdate != 'function' ||
                        (u === e.memoizedProps && d === e.memoizedState) ||
                        (t.flags |= 4),
                    typeof i.getSnapshotBeforeUpdate != 'function' ||
                        (u === e.memoizedProps && d === e.memoizedState) ||
                        (t.flags |= 1024),
                    (t.memoizedProps = r),
                    (t.memoizedState = v)),
              (i.props = r),
              (i.state = v),
              (i.context = s),
              (r = a))
            : (typeof i.componentDidUpdate != 'function' ||
                  (u === e.memoizedProps && d === e.memoizedState) ||
                  (t.flags |= 4),
              typeof i.getSnapshotBeforeUpdate != 'function' ||
                  (u === e.memoizedProps && d === e.memoizedState) ||
                  (t.flags |= 1024),
              (r = !1))
    }
    return ti(e, t, n, r, o, l)
}
function ti(e, t, n, r, l, o) {
    Pc(e, t)
    var i = (t.flags & 128) !== 0
    if (!r && !i) return (l && Yu(t, n, !1), ct(e, t, o))
    ;((r = t.stateNode), (hp.current = t))
    var u = i && typeof n.getDerivedStateFromError != 'function' ? null : r.render()
    return (
        (t.flags |= 1),
        e !== null && i ? ((t.child = En(t, e.child, null, o)), (t.child = En(t, null, u, o))) : de(e, t, u, o),
        (t.memoizedState = r.state),
        l && Yu(t, n, !0),
        t.child
    )
}
function Tc(e) {
    var t = e.stateNode
    ;(t.pendingContext ? Ku(e, t.pendingContext, t.pendingContext !== t.context) : t.context && Ku(e, t.context, !1),
        Wi(e, t.containerInfo))
}
function cs(e, t, n, r, l) {
    return (kn(), Ai(l), (t.flags |= 256), de(e, t, n, r), t.child)
}
var ni = { dehydrated: null, treeContext: null, retryLane: 0 }
function ri(e) {
    return { baseLanes: e, cachePool: null, transitions: null }
}
function Lc(e, t, n) {
    var r = t.pendingProps,
        l = Q.current,
        o = !1,
        i = (t.flags & 128) !== 0,
        u
    if (
        ((u = i) || (u = e !== null && e.memoizedState === null ? !1 : (l & 2) !== 0),
        u ? ((o = !0), (t.flags &= -129)) : (e === null || e.memoizedState !== null) && (l |= 1),
        V(Q, l & 1),
        e === null)
    )
        return (
            Xo(t),
            (e = t.memoizedState),
            e !== null && ((e = e.dehydrated), e !== null)
                ? (t.mode & 1 ? (e.data === '$!' ? (t.lanes = 8) : (t.lanes = 1073741824)) : (t.lanes = 1), null)
                : ((i = r.children),
                  (e = r.fallback),
                  o
                      ? ((r = t.mode),
                        (o = t.child),
                        (i = { mode: 'hidden', children: i }),
                        !(r & 1) && o !== null ? ((o.childLanes = 0), (o.pendingProps = i)) : (o = Al(i, r, 0, null)),
                        (e = Wt(e, r, n, null)),
                        (o.return = t),
                        (e.return = t),
                        (o.sibling = e),
                        (t.child = o),
                        (t.child.memoizedState = ri(n)),
                        (t.memoizedState = ni),
                        e)
                      : qi(t, i))
        )
    if (((l = e.memoizedState), l !== null && ((u = l.dehydrated), u !== null))) return mp(e, t, i, r, u, l, n)
    if (o) {
        ;((o = r.fallback), (i = t.mode), (l = e.child), (u = l.sibling))
        var s = { mode: 'hidden', children: r.children }
        return (
            !(i & 1) && t.child !== l
                ? ((r = t.child), (r.childLanes = 0), (r.pendingProps = s), (t.deletions = null))
                : ((r = Pt(l, s)), (r.subtreeFlags = l.subtreeFlags & 14680064)),
            u !== null ? (o = Pt(u, o)) : ((o = Wt(o, i, n, null)), (o.flags |= 2)),
            (o.return = t),
            (r.return = t),
            (r.sibling = o),
            (t.child = r),
            (r = o),
            (o = t.child),
            (i = e.child.memoizedState),
            (i = i === null ? ri(n) : { baseLanes: i.baseLanes | n, cachePool: null, transitions: i.transitions }),
            (o.memoizedState = i),
            (o.childLanes = e.childLanes & ~n),
            (t.memoizedState = ni),
            r
        )
    }
    return (
        (o = e.child),
        (e = o.sibling),
        (r = Pt(o, { mode: 'visible', children: r.children })),
        !(t.mode & 1) && (r.lanes = n),
        (r.return = t),
        (r.sibling = null),
        e !== null && ((n = t.deletions), n === null ? ((t.deletions = [e]), (t.flags |= 16)) : n.push(e)),
        (t.child = r),
        (t.memoizedState = null),
        r
    )
}
function qi(e, t) {
    return ((t = Al({ mode: 'visible', children: t }, e.mode, 0, null)), (t.return = e), (e.child = t))
}
function Fr(e, t, n, r) {
    return (
        r !== null && Ai(r),
        En(t, e.child, null, n),
        (e = qi(t, t.pendingProps.children)),
        (e.flags |= 2),
        (t.memoizedState = null),
        e
    )
}
function mp(e, t, n, r, l, o, i) {
    if (n)
        return t.flags & 256
            ? ((t.flags &= -257), (r = fo(Error(E(422)))), Fr(e, t, i, r))
            : t.memoizedState !== null
              ? ((t.child = e.child), (t.flags |= 128), null)
              : ((o = r.fallback),
                (l = t.mode),
                (r = Al({ mode: 'visible', children: r.children }, l, 0, null)),
                (o = Wt(o, l, i, null)),
                (o.flags |= 2),
                (r.return = t),
                (o.return = t),
                (r.sibling = o),
                (t.child = r),
                t.mode & 1 && En(t, e.child, null, i),
                (t.child.memoizedState = ri(i)),
                (t.memoizedState = ni),
                o)
    if (!(t.mode & 1)) return Fr(e, t, i, null)
    if (l.data === '$!') {
        if (((r = l.nextSibling && l.nextSibling.dataset), r)) var u = r.dgst
        return ((r = u), (o = Error(E(419))), (r = fo(o, r, void 0)), Fr(e, t, i, r))
    }
    if (((u = (i & e.childLanes) !== 0), ve || u)) {
        if (((r = re), r !== null)) {
            switch (i & -i) {
                case 4:
                    l = 2
                    break
                case 16:
                    l = 8
                    break
                case 64:
                case 128:
                case 256:
                case 512:
                case 1024:
                case 2048:
                case 4096:
                case 8192:
                case 16384:
                case 32768:
                case 65536:
                case 131072:
                case 262144:
                case 524288:
                case 1048576:
                case 2097152:
                case 4194304:
                case 8388608:
                case 16777216:
                case 33554432:
                case 67108864:
                    l = 32
                    break
                case 536870912:
                    l = 268435456
                    break
                default:
                    l = 0
            }
            ;((l = l & (r.suspendedLanes | i) ? 0 : l),
                l !== 0 && l !== o.retryLane && ((o.retryLane = l), at(e, l), We(r, e, l, -1)))
        }
        return (lu(), (r = fo(Error(E(421)))), Fr(e, t, i, r))
    }
    return l.data === '$?'
        ? ((t.flags |= 128), (t.child = e.child), (t = Tp.bind(null, e)), (l._reactRetry = t), null)
        : ((e = o.treeContext),
          (xe = xt(l.nextSibling)),
          (_e = t),
          (G = !0),
          (Ve = null),
          e !== null && ((Me[ze++] = nt), (Me[ze++] = rt), (Me[ze++] = Qt), (nt = e.id), (rt = e.overflow), (Qt = t)),
          (t = qi(t, r.children)),
          (t.flags |= 4096),
          t)
}
function fs(e, t, n) {
    e.lanes |= t
    var r = e.alternate
    ;(r !== null && (r.lanes |= t), Zo(e.return, t, n))
}
function po(e, t, n, r, l) {
    var o = e.memoizedState
    o === null
        ? (e.memoizedState = { isBackwards: t, rendering: null, renderingStartTime: 0, last: r, tail: n, tailMode: l })
        : ((o.isBackwards = t),
          (o.rendering = null),
          (o.renderingStartTime = 0),
          (o.last = r),
          (o.tail = n),
          (o.tailMode = l))
}
function Mc(e, t, n) {
    var r = t.pendingProps,
        l = r.revealOrder,
        o = r.tail
    if ((de(e, t, r.children, n), (r = Q.current), r & 2)) ((r = (r & 1) | 2), (t.flags |= 128))
    else {
        if (e !== null && e.flags & 128)
            e: for (e = t.child; e !== null; ) {
                if (e.tag === 13) e.memoizedState !== null && fs(e, n, t)
                else if (e.tag === 19) fs(e, n, t)
                else if (e.child !== null) {
                    ;((e.child.return = e), (e = e.child))
                    continue
                }
                if (e === t) break e
                for (; e.sibling === null; ) {
                    if (e.return === null || e.return === t) break e
                    e = e.return
                }
                ;((e.sibling.return = e.return), (e = e.sibling))
            }
        r &= 1
    }
    if ((V(Q, r), !(t.mode & 1))) t.memoizedState = null
    else
        switch (l) {
            case 'forwards':
                for (n = t.child, l = null; n !== null; )
                    ((e = n.alternate), e !== null && gl(e) === null && (l = n), (n = n.sibling))
                ;((n = l),
                    n === null ? ((l = t.child), (t.child = null)) : ((l = n.sibling), (n.sibling = null)),
                    po(t, !1, l, n, o))
                break
            case 'backwards':
                for (n = null, l = t.child, t.child = null; l !== null; ) {
                    if (((e = l.alternate), e !== null && gl(e) === null)) {
                        t.child = l
                        break
                    }
                    ;((e = l.sibling), (l.sibling = n), (n = l), (l = e))
                }
                po(t, !0, n, null, o)
                break
            case 'together':
                po(t, !1, null, null, void 0)
                break
            default:
                t.memoizedState = null
        }
    return t.child
}
function Zr(e, t) {
    !(t.mode & 1) && e !== null && ((e.alternate = null), (t.alternate = null), (t.flags |= 2))
}
function ct(e, t, n) {
    if ((e !== null && (t.dependencies = e.dependencies), (Yt |= t.lanes), !(n & t.childLanes))) return null
    if (e !== null && t.child !== e.child) throw Error(E(153))
    if (t.child !== null) {
        for (e = t.child, n = Pt(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null; )
            ((e = e.sibling), (n = n.sibling = Pt(e, e.pendingProps)), (n.return = t))
        n.sibling = null
    }
    return t.child
}
function gp(e, t, n) {
    switch (t.tag) {
        case 3:
            ;(Tc(t), kn())
            break
        case 5:
            nc(t)
            break
        case 1:
            we(t.type) && cl(t)
            break
        case 4:
            Wi(t, t.stateNode.containerInfo)
            break
        case 10:
            var r = t.type._context,
                l = t.memoizedProps.value
            ;(V(pl, r._currentValue), (r._currentValue = l))
            break
        case 13:
            if (((r = t.memoizedState), r !== null))
                return r.dehydrated !== null
                    ? (V(Q, Q.current & 1), (t.flags |= 128), null)
                    : n & t.child.childLanes
                      ? Lc(e, t, n)
                      : (V(Q, Q.current & 1), (e = ct(e, t, n)), e !== null ? e.sibling : null)
            V(Q, Q.current & 1)
            break
        case 19:
            if (((r = (n & t.childLanes) !== 0), e.flags & 128)) {
                if (r) return Mc(e, t, n)
                t.flags |= 128
            }
            if (
                ((l = t.memoizedState),
                l !== null && ((l.rendering = null), (l.tail = null), (l.lastEffect = null)),
                V(Q, Q.current),
                r)
            )
                break
            return null
        case 22:
        case 23:
            return ((t.lanes = 0), Nc(e, t, n))
    }
    return ct(e, t, n)
}
var zc, li, Rc, Dc
zc = function (e, t) {
    for (var n = t.child; n !== null; ) {
        if (n.tag === 5 || n.tag === 6) e.appendChild(n.stateNode)
        else if (n.tag !== 4 && n.child !== null) {
            ;((n.child.return = n), (n = n.child))
            continue
        }
        if (n === t) break
        for (; n.sibling === null; ) {
            if (n.return === null || n.return === t) return
            n = n.return
        }
        ;((n.sibling.return = n.return), (n = n.sibling))
    }
}
li = function () {}
Rc = function (e, t, n, r) {
    var l = e.memoizedProps
    if (l !== r) {
        ;((e = t.stateNode), $t(Je.current))
        var o = null
        switch (n) {
            case 'input':
                ;((l = No(e, l)), (r = No(e, r)), (o = []))
                break
            case 'select':
                ;((l = Y({}, l, { value: void 0 })), (r = Y({}, r, { value: void 0 })), (o = []))
                break
            case 'textarea':
                ;((l = Lo(e, l)), (r = Lo(e, r)), (o = []))
                break
            default:
                typeof l.onClick != 'function' && typeof r.onClick == 'function' && (e.onclick = sl)
        }
        zo(n, r)
        var i
        n = null
        for (a in l)
            if (!r.hasOwnProperty(a) && l.hasOwnProperty(a) && l[a] != null)
                if (a === 'style') {
                    var u = l[a]
                    for (i in u) u.hasOwnProperty(i) && (n || (n = {}), (n[i] = ''))
                } else
                    a !== 'dangerouslySetInnerHTML' &&
                        a !== 'children' &&
                        a !== 'suppressContentEditableWarning' &&
                        a !== 'suppressHydrationWarning' &&
                        a !== 'autoFocus' &&
                        (bn.hasOwnProperty(a) ? o || (o = []) : (o = o || []).push(a, null))
        for (a in r) {
            var s = r[a]
            if (((u = l != null ? l[a] : void 0), r.hasOwnProperty(a) && s !== u && (s != null || u != null)))
                if (a === 'style')
                    if (u) {
                        for (i in u) !u.hasOwnProperty(i) || (s && s.hasOwnProperty(i)) || (n || (n = {}), (n[i] = ''))
                        for (i in s) s.hasOwnProperty(i) && u[i] !== s[i] && (n || (n = {}), (n[i] = s[i]))
                    } else (n || (o || (o = []), o.push(a, n)), (n = s))
                else
                    a === 'dangerouslySetInnerHTML'
                        ? ((s = s ? s.__html : void 0),
                          (u = u ? u.__html : void 0),
                          s != null && u !== s && (o = o || []).push(a, s))
                        : a === 'children'
                          ? (typeof s != 'string' && typeof s != 'number') || (o = o || []).push(a, '' + s)
                          : a !== 'suppressContentEditableWarning' &&
                            a !== 'suppressHydrationWarning' &&
                            (bn.hasOwnProperty(a)
                                ? (s != null && a === 'onScroll' && H('scroll', e), o || u === s || (o = []))
                                : (o = o || []).push(a, s))
        }
        n && (o = o || []).push('style', n)
        var a = o
        ;(t.updateQueue = a) && (t.flags |= 4)
    }
}
Dc = function (e, t, n, r) {
    n !== r && (t.flags |= 4)
}
function Fn(e, t) {
    if (!G)
        switch (e.tailMode) {
            case 'hidden':
                t = e.tail
                for (var n = null; t !== null; ) (t.alternate !== null && (n = t), (t = t.sibling))
                n === null ? (e.tail = null) : (n.sibling = null)
                break
            case 'collapsed':
                n = e.tail
                for (var r = null; n !== null; ) (n.alternate !== null && (r = n), (n = n.sibling))
                r === null ? (t || e.tail === null ? (e.tail = null) : (e.tail.sibling = null)) : (r.sibling = null)
        }
}
function se(e) {
    var t = e.alternate !== null && e.alternate.child === e.child,
        n = 0,
        r = 0
    if (t)
        for (var l = e.child; l !== null; )
            ((n |= l.lanes | l.childLanes),
                (r |= l.subtreeFlags & 14680064),
                (r |= l.flags & 14680064),
                (l.return = e),
                (l = l.sibling))
    else
        for (l = e.child; l !== null; )
            ((n |= l.lanes | l.childLanes), (r |= l.subtreeFlags), (r |= l.flags), (l.return = e), (l = l.sibling))
    return ((e.subtreeFlags |= r), (e.childLanes = n), t)
}
function vp(e, t, n) {
    var r = t.pendingProps
    switch ((Fi(t), t.tag)) {
        case 2:
        case 16:
        case 15:
        case 0:
        case 11:
        case 7:
        case 8:
        case 12:
        case 9:
        case 14:
            return (se(t), null)
        case 1:
            return (we(t.type) && al(), se(t), null)
        case 3:
            return (
                (r = t.stateNode),
                xn(),
                B(ye),
                B(fe),
                Qi(),
                r.pendingContext && ((r.context = r.pendingContext), (r.pendingContext = null)),
                (e === null || e.child === null) &&
                    (jr(t)
                        ? (t.flags |= 4)
                        : e === null ||
                          (e.memoizedState.isDehydrated && !(t.flags & 256)) ||
                          ((t.flags |= 1024), Ve !== null && (di(Ve), (Ve = null)))),
                li(e, t),
                se(t),
                null
            )
        case 5:
            Gi(t)
            var l = $t(fr.current)
            if (((n = t.type), e !== null && t.stateNode != null))
                (Rc(e, t, n, r, l), e.ref !== t.ref && ((t.flags |= 512), (t.flags |= 2097152)))
            else {
                if (!r) {
                    if (t.stateNode === null) throw Error(E(166))
                    return (se(t), null)
                }
                if (((e = $t(Je.current)), jr(t))) {
                    ;((r = t.stateNode), (n = t.type))
                    var o = t.memoizedProps
                    switch (((r[Xe] = t), (r[ar] = o), (e = (t.mode & 1) !== 0), n)) {
                        case 'dialog':
                            ;(H('cancel', r), H('close', r))
                            break
                        case 'iframe':
                        case 'object':
                        case 'embed':
                            H('load', r)
                            break
                        case 'video':
                        case 'audio':
                            for (l = 0; l < Bn.length; l++) H(Bn[l], r)
                            break
                        case 'source':
                            H('error', r)
                            break
                        case 'img':
                        case 'image':
                        case 'link':
                            ;(H('error', r), H('load', r))
                            break
                        case 'details':
                            H('toggle', r)
                            break
                        case 'input':
                            ;(Su(r, o), H('invalid', r))
                            break
                        case 'select':
                            ;((r._wrapperState = { wasMultiple: !!o.multiple }), H('invalid', r))
                            break
                        case 'textarea':
                            ;(Eu(r, o), H('invalid', r))
                    }
                    ;(zo(n, o), (l = null))
                    for (var i in o)
                        if (o.hasOwnProperty(i)) {
                            var u = o[i]
                            i === 'children'
                                ? typeof u == 'string'
                                    ? r.textContent !== u &&
                                      (o.suppressHydrationWarning !== !0 && Or(r.textContent, u, e),
                                      (l = ['children', u]))
                                    : typeof u == 'number' &&
                                      r.textContent !== '' + u &&
                                      (o.suppressHydrationWarning !== !0 && Or(r.textContent, u, e),
                                      (l = ['children', '' + u]))
                                : bn.hasOwnProperty(i) && u != null && i === 'onScroll' && H('scroll', r)
                        }
                    switch (n) {
                        case 'input':
                            ;(Nr(r), ku(r, o, !0))
                            break
                        case 'textarea':
                            ;(Nr(r), xu(r))
                            break
                        case 'select':
                        case 'option':
                            break
                        default:
                            typeof o.onClick == 'function' && (r.onclick = sl)
                    }
                    ;((r = l), (t.updateQueue = r), r !== null && (t.flags |= 4))
                } else {
                    ;((i = l.nodeType === 9 ? l : l.ownerDocument),
                        e === 'http://www.w3.org/1999/xhtml' && (e = ua(n)),
                        e === 'http://www.w3.org/1999/xhtml'
                            ? n === 'script'
                                ? ((e = i.createElement('div')),
                                  (e.innerHTML = '<script><\/script>'),
                                  (e = e.removeChild(e.firstChild)))
                                : typeof r.is == 'string'
                                  ? (e = i.createElement(n, { is: r.is }))
                                  : ((e = i.createElement(n)),
                                    n === 'select' &&
                                        ((i = e), r.multiple ? (i.multiple = !0) : r.size && (i.size = r.size)))
                            : (e = i.createElementNS(e, n)),
                        (e[Xe] = t),
                        (e[ar] = r),
                        zc(e, t, !1, !1),
                        (t.stateNode = e))
                    e: {
                        switch (((i = Ro(n, r)), n)) {
                            case 'dialog':
                                ;(H('cancel', e), H('close', e), (l = r))
                                break
                            case 'iframe':
                            case 'object':
                            case 'embed':
                                ;(H('load', e), (l = r))
                                break
                            case 'video':
                            case 'audio':
                                for (l = 0; l < Bn.length; l++) H(Bn[l], e)
                                l = r
                                break
                            case 'source':
                                ;(H('error', e), (l = r))
                                break
                            case 'img':
                            case 'image':
                            case 'link':
                                ;(H('error', e), H('load', e), (l = r))
                                break
                            case 'details':
                                ;(H('toggle', e), (l = r))
                                break
                            case 'input':
                                ;(Su(e, r), (l = No(e, r)), H('invalid', e))
                                break
                            case 'option':
                                l = r
                                break
                            case 'select':
                                ;((e._wrapperState = { wasMultiple: !!r.multiple }),
                                    (l = Y({}, r, { value: void 0 })),
                                    H('invalid', e))
                                break
                            case 'textarea':
                                ;(Eu(e, r), (l = Lo(e, r)), H('invalid', e))
                                break
                            default:
                                l = r
                        }
                        ;(zo(n, l), (u = l))
                        for (o in u)
                            if (u.hasOwnProperty(o)) {
                                var s = u[o]
                                o === 'style'
                                    ? ca(e, s)
                                    : o === 'dangerouslySetInnerHTML'
                                      ? ((s = s ? s.__html : void 0), s != null && sa(e, s))
                                      : o === 'children'
                                        ? typeof s == 'string'
                                            ? (n !== 'textarea' || s !== '') && er(e, s)
                                            : typeof s == 'number' && er(e, '' + s)
                                        : o !== 'suppressContentEditableWarning' &&
                                          o !== 'suppressHydrationWarning' &&
                                          o !== 'autoFocus' &&
                                          (bn.hasOwnProperty(o)
                                              ? s != null && o === 'onScroll' && H('scroll', e)
                                              : s != null && Ei(e, o, s, i))
                            }
                        switch (n) {
                            case 'input':
                                ;(Nr(e), ku(e, r, !1))
                                break
                            case 'textarea':
                                ;(Nr(e), xu(e))
                                break
                            case 'option':
                                r.value != null && e.setAttribute('value', '' + Tt(r.value))
                                break
                            case 'select':
                                ;((e.multiple = !!r.multiple),
                                    (o = r.value),
                                    o != null
                                        ? pn(e, !!r.multiple, o, !1)
                                        : r.defaultValue != null && pn(e, !!r.multiple, r.defaultValue, !0))
                                break
                            default:
                                typeof l.onClick == 'function' && (e.onclick = sl)
                        }
                        switch (n) {
                            case 'button':
                            case 'input':
                            case 'select':
                            case 'textarea':
                                r = !!r.autoFocus
                                break e
                            case 'img':
                                r = !0
                                break e
                            default:
                                r = !1
                        }
                    }
                    r && (t.flags |= 4)
                }
                t.ref !== null && ((t.flags |= 512), (t.flags |= 2097152))
            }
            return (se(t), null)
        case 6:
            if (e && t.stateNode != null) Dc(e, t, e.memoizedProps, r)
            else {
                if (typeof r != 'string' && t.stateNode === null) throw Error(E(166))
                if (((n = $t(fr.current)), $t(Je.current), jr(t))) {
                    if (
                        ((r = t.stateNode),
                        (n = t.memoizedProps),
                        (r[Xe] = t),
                        (o = r.nodeValue !== n) && ((e = _e), e !== null))
                    )
                        switch (e.tag) {
                            case 3:
                                Or(r.nodeValue, n, (e.mode & 1) !== 0)
                                break
                            case 5:
                                e.memoizedProps.suppressHydrationWarning !== !0 &&
                                    Or(r.nodeValue, n, (e.mode & 1) !== 0)
                        }
                    o && (t.flags |= 4)
                } else
                    ((r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r)), (r[Xe] = t), (t.stateNode = r))
            }
            return (se(t), null)
        case 13:
            if (
                (B(Q),
                (r = t.memoizedState),
                e === null || (e.memoizedState !== null && e.memoizedState.dehydrated !== null))
            ) {
                if (G && xe !== null && t.mode & 1 && !(t.flags & 128)) (Ja(), kn(), (t.flags |= 98560), (o = !1))
                else if (((o = jr(t)), r !== null && r.dehydrated !== null)) {
                    if (e === null) {
                        if (!o) throw Error(E(318))
                        if (((o = t.memoizedState), (o = o !== null ? o.dehydrated : null), !o)) throw Error(E(317))
                        o[Xe] = t
                    } else (kn(), !(t.flags & 128) && (t.memoizedState = null), (t.flags |= 4))
                    ;(se(t), (o = !1))
                } else (Ve !== null && (di(Ve), (Ve = null)), (o = !0))
                if (!o) return t.flags & 65536 ? t : null
            }
            return t.flags & 128
                ? ((t.lanes = n), t)
                : ((r = r !== null),
                  r !== (e !== null && e.memoizedState !== null) &&
                      r &&
                      ((t.child.flags |= 8192),
                      t.mode & 1 && (e === null || Q.current & 1 ? te === 0 && (te = 3) : lu())),
                  t.updateQueue !== null && (t.flags |= 4),
                  se(t),
                  null)
        case 4:
            return (xn(), li(e, t), e === null && ur(t.stateNode.containerInfo), se(t), null)
        case 10:
            return (Vi(t.type._context), se(t), null)
        case 17:
            return (we(t.type) && al(), se(t), null)
        case 19:
            if ((B(Q), (o = t.memoizedState), o === null)) return (se(t), null)
            if (((r = (t.flags & 128) !== 0), (i = o.rendering), i === null))
                if (r) Fn(o, !1)
                else {
                    if (te !== 0 || (e !== null && e.flags & 128))
                        for (e = t.child; e !== null; ) {
                            if (((i = gl(e)), i !== null)) {
                                for (
                                    t.flags |= 128,
                                        Fn(o, !1),
                                        r = i.updateQueue,
                                        r !== null && ((t.updateQueue = r), (t.flags |= 4)),
                                        t.subtreeFlags = 0,
                                        r = n,
                                        n = t.child;
                                    n !== null;

                                )
                                    ((o = n),
                                        (e = r),
                                        (o.flags &= 14680066),
                                        (i = o.alternate),
                                        i === null
                                            ? ((o.childLanes = 0),
                                              (o.lanes = e),
                                              (o.child = null),
                                              (o.subtreeFlags = 0),
                                              (o.memoizedProps = null),
                                              (o.memoizedState = null),
                                              (o.updateQueue = null),
                                              (o.dependencies = null),
                                              (o.stateNode = null))
                                            : ((o.childLanes = i.childLanes),
                                              (o.lanes = i.lanes),
                                              (o.child = i.child),
                                              (o.subtreeFlags = 0),
                                              (o.deletions = null),
                                              (o.memoizedProps = i.memoizedProps),
                                              (o.memoizedState = i.memoizedState),
                                              (o.updateQueue = i.updateQueue),
                                              (o.type = i.type),
                                              (e = i.dependencies),
                                              (o.dependencies =
                                                  e === null
                                                      ? null
                                                      : { lanes: e.lanes, firstContext: e.firstContext })),
                                        (n = n.sibling))
                                return (V(Q, (Q.current & 1) | 2), t.child)
                            }
                            e = e.sibling
                        }
                    o.tail !== null && J() > _n && ((t.flags |= 128), (r = !0), Fn(o, !1), (t.lanes = 4194304))
                }
            else {
                if (!r)
                    if (((e = gl(i)), e !== null)) {
                        if (
                            ((t.flags |= 128),
                            (r = !0),
                            (n = e.updateQueue),
                            n !== null && ((t.updateQueue = n), (t.flags |= 4)),
                            Fn(o, !0),
                            o.tail === null && o.tailMode === 'hidden' && !i.alternate && !G)
                        )
                            return (se(t), null)
                    } else
                        2 * J() - o.renderingStartTime > _n &&
                            n !== 1073741824 &&
                            ((t.flags |= 128), (r = !0), Fn(o, !1), (t.lanes = 4194304))
                o.isBackwards
                    ? ((i.sibling = t.child), (t.child = i))
                    : ((n = o.last), n !== null ? (n.sibling = i) : (t.child = i), (o.last = i))
            }
            return o.tail !== null
                ? ((t = o.tail),
                  (o.rendering = t),
                  (o.tail = t.sibling),
                  (o.renderingStartTime = J()),
                  (t.sibling = null),
                  (n = Q.current),
                  V(Q, r ? (n & 1) | 2 : n & 1),
                  t)
                : (se(t), null)
        case 22:
        case 23:
            return (
                ru(),
                (r = t.memoizedState !== null),
                e !== null && (e.memoizedState !== null) !== r && (t.flags |= 8192),
                r && t.mode & 1 ? Ee & 1073741824 && (se(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : se(t),
                null
            )
        case 24:
            return null
        case 25:
            return null
    }
    throw Error(E(156, t.tag))
}
function yp(e, t) {
    switch ((Fi(t), t.tag)) {
        case 1:
            return (we(t.type) && al(), (e = t.flags), e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null)
        case 3:
            return (
                xn(),
                B(ye),
                B(fe),
                Qi(),
                (e = t.flags),
                e & 65536 && !(e & 128) ? ((t.flags = (e & -65537) | 128), t) : null
            )
        case 5:
            return (Gi(t), null)
        case 13:
            if ((B(Q), (e = t.memoizedState), e !== null && e.dehydrated !== null)) {
                if (t.alternate === null) throw Error(E(340))
                kn()
            }
            return ((e = t.flags), e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null)
        case 19:
            return (B(Q), null)
        case 4:
            return (xn(), null)
        case 10:
            return (Vi(t.type._context), null)
        case 22:
        case 23:
            return (ru(), null)
        case 24:
            return null
        default:
            return null
    }
}
var Ar = !1,
    ce = !1,
    wp = typeof WeakSet == 'function' ? WeakSet : Set,
    L = null
function fn(e, t) {
    var n = e.ref
    if (n !== null)
        if (typeof n == 'function')
            try {
                n(null)
            } catch (r) {
                Z(e, t, r)
            }
        else n.current = null
}
function oi(e, t, n) {
    try {
        n()
    } catch (r) {
        Z(e, t, r)
    }
}
var ds = !1
function Sp(e, t) {
    if (((Ho = ol), (e = Aa()), ji(e))) {
        if ('selectionStart' in e) var n = { start: e.selectionStart, end: e.selectionEnd }
        else
            e: {
                n = ((n = e.ownerDocument) && n.defaultView) || window
                var r = n.getSelection && n.getSelection()
                if (r && r.rangeCount !== 0) {
                    n = r.anchorNode
                    var l = r.anchorOffset,
                        o = r.focusNode
                    r = r.focusOffset
                    try {
                        ;(n.nodeType, o.nodeType)
                    } catch {
                        n = null
                        break e
                    }
                    var i = 0,
                        u = -1,
                        s = -1,
                        a = 0,
                        m = 0,
                        h = e,
                        d = null
                    t: for (;;) {
                        for (
                            var g;
                            h !== n || (l !== 0 && h.nodeType !== 3) || (u = i + l),
                                h !== o || (r !== 0 && h.nodeType !== 3) || (s = i + r),
                                h.nodeType === 3 && (i += h.nodeValue.length),
                                (g = h.firstChild) !== null;

                        )
                            ((d = h), (h = g))
                        for (;;) {
                            if (h === e) break t
                            if (
                                (d === n && ++a === l && (u = i),
                                d === o && ++m === r && (s = i),
                                (g = h.nextSibling) !== null)
                            )
                                break
                            ;((h = d), (d = h.parentNode))
                        }
                        h = g
                    }
                    n = u === -1 || s === -1 ? null : { start: u, end: s }
                } else n = null
            }
        n = n || { start: 0, end: 0 }
    } else n = null
    for (Bo = { focusedElem: e, selectionRange: n }, ol = !1, L = t; L !== null; )
        if (((t = L), (e = t.child), (t.subtreeFlags & 1028) !== 0 && e !== null)) ((e.return = t), (L = e))
        else
            for (; L !== null; ) {
                t = L
                try {
                    var v = t.alternate
                    if (t.flags & 1024)
                        switch (t.tag) {
                            case 0:
                            case 11:
                            case 15:
                                break
                            case 1:
                                if (v !== null) {
                                    var k = v.memoizedProps,
                                        N = v.memoizedState,
                                        f = t.stateNode,
                                        c = f.getSnapshotBeforeUpdate(t.elementType === t.type ? k : Ue(t.type, k), N)
                                    f.__reactInternalSnapshotBeforeUpdate = c
                                }
                                break
                            case 3:
                                var p = t.stateNode.containerInfo
                                p.nodeType === 1
                                    ? (p.textContent = '')
                                    : p.nodeType === 9 && p.documentElement && p.removeChild(p.documentElement)
                                break
                            case 5:
                            case 6:
                            case 4:
                            case 17:
                                break
                            default:
                                throw Error(E(163))
                        }
                } catch (y) {
                    Z(t, t.return, y)
                }
                if (((e = t.sibling), e !== null)) {
                    ;((e.return = t.return), (L = e))
                    break
                }
                L = t.return
            }
    return ((v = ds), (ds = !1), v)
}
function Zn(e, t, n) {
    var r = t.updateQueue
    if (((r = r !== null ? r.lastEffect : null), r !== null)) {
        var l = (r = r.next)
        do {
            if ((l.tag & e) === e) {
                var o = l.destroy
                ;((l.destroy = void 0), o !== void 0 && oi(t, n, o))
            }
            l = l.next
        } while (l !== r)
    }
}
function Il(e, t) {
    if (((t = t.updateQueue), (t = t !== null ? t.lastEffect : null), t !== null)) {
        var n = (t = t.next)
        do {
            if ((n.tag & e) === e) {
                var r = n.create
                n.destroy = r()
            }
            n = n.next
        } while (n !== t)
    }
}
function ii(e) {
    var t = e.ref
    if (t !== null) {
        var n = e.stateNode
        switch (e.tag) {
            case 5:
                e = n
                break
            default:
                e = n
        }
        typeof t == 'function' ? t(e) : (t.current = e)
    }
}
function Oc(e) {
    var t = e.alternate
    ;(t !== null && ((e.alternate = null), Oc(t)),
        (e.child = null),
        (e.deletions = null),
        (e.sibling = null),
        e.tag === 5 &&
            ((t = e.stateNode), t !== null && (delete t[Xe], delete t[ar], delete t[Qo], delete t[np], delete t[rp])),
        (e.stateNode = null),
        (e.return = null),
        (e.dependencies = null),
        (e.memoizedProps = null),
        (e.memoizedState = null),
        (e.pendingProps = null),
        (e.stateNode = null),
        (e.updateQueue = null))
}
function jc(e) {
    return e.tag === 5 || e.tag === 3 || e.tag === 4
}
function ps(e) {
    e: for (;;) {
        for (; e.sibling === null; ) {
            if (e.return === null || jc(e.return)) return null
            e = e.return
        }
        for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
            if (e.flags & 2 || e.child === null || e.tag === 4) continue e
            ;((e.child.return = e), (e = e.child))
        }
        if (!(e.flags & 2)) return e.stateNode
    }
}
function ui(e, t, n) {
    var r = e.tag
    if (r === 5 || r === 6)
        ((e = e.stateNode),
            t
                ? n.nodeType === 8
                    ? n.parentNode.insertBefore(e, t)
                    : n.insertBefore(e, t)
                : (n.nodeType === 8 ? ((t = n.parentNode), t.insertBefore(e, n)) : ((t = n), t.appendChild(e)),
                  (n = n._reactRootContainer),
                  n != null || t.onclick !== null || (t.onclick = sl)))
    else if (r !== 4 && ((e = e.child), e !== null))
        for (ui(e, t, n), e = e.sibling; e !== null; ) (ui(e, t, n), (e = e.sibling))
}
function si(e, t, n) {
    var r = e.tag
    if (r === 5 || r === 6) ((e = e.stateNode), t ? n.insertBefore(e, t) : n.appendChild(e))
    else if (r !== 4 && ((e = e.child), e !== null))
        for (si(e, t, n), e = e.sibling; e !== null; ) (si(e, t, n), (e = e.sibling))
}
var le = null,
    $e = !1
function pt(e, t, n) {
    for (n = n.child; n !== null; ) (Ic(e, t, n), (n = n.sibling))
}
function Ic(e, t, n) {
    if (Ze && typeof Ze.onCommitFiberUnmount == 'function')
        try {
            Ze.onCommitFiberUnmount(Tl, n)
        } catch {}
    switch (n.tag) {
        case 5:
            ce || fn(n, t)
        case 6:
            var r = le,
                l = $e
            ;((le = null),
                pt(e, t, n),
                (le = r),
                ($e = l),
                le !== null &&
                    ($e
                        ? ((e = le),
                          (n = n.stateNode),
                          e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n))
                        : le.removeChild(n.stateNode)))
            break
        case 18:
            le !== null &&
                ($e
                    ? ((e = le),
                      (n = n.stateNode),
                      e.nodeType === 8 ? oo(e.parentNode, n) : e.nodeType === 1 && oo(e, n),
                      lr(e))
                    : oo(le, n.stateNode))
            break
        case 4:
            ;((r = le), (l = $e), (le = n.stateNode.containerInfo), ($e = !0), pt(e, t, n), (le = r), ($e = l))
            break
        case 0:
        case 11:
        case 14:
        case 15:
            if (!ce && ((r = n.updateQueue), r !== null && ((r = r.lastEffect), r !== null))) {
                l = r = r.next
                do {
                    var o = l,
                        i = o.destroy
                    ;((o = o.tag), i !== void 0 && (o & 2 || o & 4) && oi(n, t, i), (l = l.next))
                } while (l !== r)
            }
            pt(e, t, n)
            break
        case 1:
            if (!ce && (fn(n, t), (r = n.stateNode), typeof r.componentWillUnmount == 'function'))
                try {
                    ;((r.props = n.memoizedProps), (r.state = n.memoizedState), r.componentWillUnmount())
                } catch (u) {
                    Z(n, t, u)
                }
            pt(e, t, n)
            break
        case 21:
            pt(e, t, n)
            break
        case 22:
            n.mode & 1 ? ((ce = (r = ce) || n.memoizedState !== null), pt(e, t, n), (ce = r)) : pt(e, t, n)
            break
        default:
            pt(e, t, n)
    }
}
function hs(e) {
    var t = e.updateQueue
    if (t !== null) {
        e.updateQueue = null
        var n = e.stateNode
        ;(n === null && (n = e.stateNode = new wp()),
            t.forEach(function (r) {
                var l = Lp.bind(null, e, r)
                n.has(r) || (n.add(r), r.then(l, l))
            }))
    }
}
function Ae(e, t) {
    var n = t.deletions
    if (n !== null)
        for (var r = 0; r < n.length; r++) {
            var l = n[r]
            try {
                var o = e,
                    i = t,
                    u = i
                e: for (; u !== null; ) {
                    switch (u.tag) {
                        case 5:
                            ;((le = u.stateNode), ($e = !1))
                            break e
                        case 3:
                            ;((le = u.stateNode.containerInfo), ($e = !0))
                            break e
                        case 4:
                            ;((le = u.stateNode.containerInfo), ($e = !0))
                            break e
                    }
                    u = u.return
                }
                if (le === null) throw Error(E(160))
                ;(Ic(o, i, l), (le = null), ($e = !1))
                var s = l.alternate
                ;(s !== null && (s.return = null), (l.return = null))
            } catch (a) {
                Z(l, t, a)
            }
        }
    if (t.subtreeFlags & 12854) for (t = t.child; t !== null; ) (Fc(t, e), (t = t.sibling))
}
function Fc(e, t) {
    var n = e.alternate,
        r = e.flags
    switch (e.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
            if ((Ae(t, e), Ke(e), r & 4)) {
                try {
                    ;(Zn(3, e, e.return), Il(3, e))
                } catch (k) {
                    Z(e, e.return, k)
                }
                try {
                    Zn(5, e, e.return)
                } catch (k) {
                    Z(e, e.return, k)
                }
            }
            break
        case 1:
            ;(Ae(t, e), Ke(e), r & 512 && n !== null && fn(n, n.return))
            break
        case 5:
            if ((Ae(t, e), Ke(e), r & 512 && n !== null && fn(n, n.return), e.flags & 32)) {
                var l = e.stateNode
                try {
                    er(l, '')
                } catch (k) {
                    Z(e, e.return, k)
                }
            }
            if (r & 4 && ((l = e.stateNode), l != null)) {
                var o = e.memoizedProps,
                    i = n !== null ? n.memoizedProps : o,
                    u = e.type,
                    s = e.updateQueue
                if (((e.updateQueue = null), s !== null))
                    try {
                        ;(u === 'input' && o.type === 'radio' && o.name != null && oa(l, o), Ro(u, i))
                        var a = Ro(u, o)
                        for (i = 0; i < s.length; i += 2) {
                            var m = s[i],
                                h = s[i + 1]
                            m === 'style'
                                ? ca(l, h)
                                : m === 'dangerouslySetInnerHTML'
                                  ? sa(l, h)
                                  : m === 'children'
                                    ? er(l, h)
                                    : Ei(l, m, h, a)
                        }
                        switch (u) {
                            case 'input':
                                Po(l, o)
                                break
                            case 'textarea':
                                ia(l, o)
                                break
                            case 'select':
                                var d = l._wrapperState.wasMultiple
                                l._wrapperState.wasMultiple = !!o.multiple
                                var g = o.value
                                g != null
                                    ? pn(l, !!o.multiple, g, !1)
                                    : d !== !!o.multiple &&
                                      (o.defaultValue != null
                                          ? pn(l, !!o.multiple, o.defaultValue, !0)
                                          : pn(l, !!o.multiple, o.multiple ? [] : '', !1))
                        }
                        l[ar] = o
                    } catch (k) {
                        Z(e, e.return, k)
                    }
            }
            break
        case 6:
            if ((Ae(t, e), Ke(e), r & 4)) {
                if (e.stateNode === null) throw Error(E(162))
                ;((l = e.stateNode), (o = e.memoizedProps))
                try {
                    l.nodeValue = o
                } catch (k) {
                    Z(e, e.return, k)
                }
            }
            break
        case 3:
            if ((Ae(t, e), Ke(e), r & 4 && n !== null && n.memoizedState.isDehydrated))
                try {
                    lr(t.containerInfo)
                } catch (k) {
                    Z(e, e.return, k)
                }
            break
        case 4:
            ;(Ae(t, e), Ke(e))
            break
        case 13:
            ;(Ae(t, e),
                Ke(e),
                (l = e.child),
                l.flags & 8192 &&
                    ((o = l.memoizedState !== null),
                    (l.stateNode.isHidden = o),
                    !o || (l.alternate !== null && l.alternate.memoizedState !== null) || (tu = J())),
                r & 4 && hs(e))
            break
        case 22:
            if (
                ((m = n !== null && n.memoizedState !== null),
                e.mode & 1 ? ((ce = (a = ce) || m), Ae(t, e), (ce = a)) : Ae(t, e),
                Ke(e),
                r & 8192)
            ) {
                if (((a = e.memoizedState !== null), (e.stateNode.isHidden = a) && !m && e.mode & 1))
                    for (L = e, m = e.child; m !== null; ) {
                        for (h = L = m; L !== null; ) {
                            switch (((d = L), (g = d.child), d.tag)) {
                                case 0:
                                case 11:
                                case 14:
                                case 15:
                                    Zn(4, d, d.return)
                                    break
                                case 1:
                                    fn(d, d.return)
                                    var v = d.stateNode
                                    if (typeof v.componentWillUnmount == 'function') {
                                        ;((r = d), (n = d.return))
                                        try {
                                            ;((t = r),
                                                (v.props = t.memoizedProps),
                                                (v.state = t.memoizedState),
                                                v.componentWillUnmount())
                                        } catch (k) {
                                            Z(r, n, k)
                                        }
                                    }
                                    break
                                case 5:
                                    fn(d, d.return)
                                    break
                                case 22:
                                    if (d.memoizedState !== null) {
                                        gs(h)
                                        continue
                                    }
                            }
                            g !== null ? ((g.return = d), (L = g)) : gs(h)
                        }
                        m = m.sibling
                    }
                e: for (m = null, h = e; ; ) {
                    if (h.tag === 5) {
                        if (m === null) {
                            m = h
                            try {
                                ;((l = h.stateNode),
                                    a
                                        ? ((o = l.style),
                                          typeof o.setProperty == 'function'
                                              ? o.setProperty('display', 'none', 'important')
                                              : (o.display = 'none'))
                                        : ((u = h.stateNode),
                                          (s = h.memoizedProps.style),
                                          (i = s != null && s.hasOwnProperty('display') ? s.display : null),
                                          (u.style.display = aa('display', i))))
                            } catch (k) {
                                Z(e, e.return, k)
                            }
                        }
                    } else if (h.tag === 6) {
                        if (m === null)
                            try {
                                h.stateNode.nodeValue = a ? '' : h.memoizedProps
                            } catch (k) {
                                Z(e, e.return, k)
                            }
                    } else if (
                        ((h.tag !== 22 && h.tag !== 23) || h.memoizedState === null || h === e) &&
                        h.child !== null
                    ) {
                        ;((h.child.return = h), (h = h.child))
                        continue
                    }
                    if (h === e) break e
                    for (; h.sibling === null; ) {
                        if (h.return === null || h.return === e) break e
                        ;(m === h && (m = null), (h = h.return))
                    }
                    ;(m === h && (m = null), (h.sibling.return = h.return), (h = h.sibling))
                }
            }
            break
        case 19:
            ;(Ae(t, e), Ke(e), r & 4 && hs(e))
            break
        case 21:
            break
        default:
            ;(Ae(t, e), Ke(e))
    }
}
function Ke(e) {
    var t = e.flags
    if (t & 2) {
        try {
            e: {
                for (var n = e.return; n !== null; ) {
                    if (jc(n)) {
                        var r = n
                        break e
                    }
                    n = n.return
                }
                throw Error(E(160))
            }
            switch (r.tag) {
                case 5:
                    var l = r.stateNode
                    r.flags & 32 && (er(l, ''), (r.flags &= -33))
                    var o = ps(e)
                    si(e, o, l)
                    break
                case 3:
                case 4:
                    var i = r.stateNode.containerInfo,
                        u = ps(e)
                    ui(e, u, i)
                    break
                default:
                    throw Error(E(161))
            }
        } catch (s) {
            Z(e, e.return, s)
        }
        e.flags &= -3
    }
    t & 4096 && (e.flags &= -4097)
}
function kp(e, t, n) {
    ;((L = e), Ac(e))
}
function Ac(e, t, n) {
    for (var r = (e.mode & 1) !== 0; L !== null; ) {
        var l = L,
            o = l.child
        if (l.tag === 22 && r) {
            var i = l.memoizedState !== null || Ar
            if (!i) {
                var u = l.alternate,
                    s = (u !== null && u.memoizedState !== null) || ce
                u = Ar
                var a = ce
                if (((Ar = i), (ce = s) && !a))
                    for (L = l; L !== null; )
                        ((i = L),
                            (s = i.child),
                            i.tag === 22 && i.memoizedState !== null
                                ? vs(l)
                                : s !== null
                                  ? ((s.return = i), (L = s))
                                  : vs(l))
                for (; o !== null; ) ((L = o), Ac(o), (o = o.sibling))
                ;((L = l), (Ar = u), (ce = a))
            }
            ms(e)
        } else l.subtreeFlags & 8772 && o !== null ? ((o.return = l), (L = o)) : ms(e)
    }
}
function ms(e) {
    for (; L !== null; ) {
        var t = L
        if (t.flags & 8772) {
            var n = t.alternate
            try {
                if (t.flags & 8772)
                    switch (t.tag) {
                        case 0:
                        case 11:
                        case 15:
                            ce || Il(5, t)
                            break
                        case 1:
                            var r = t.stateNode
                            if (t.flags & 4 && !ce)
                                if (n === null) r.componentDidMount()
                                else {
                                    var l = t.elementType === t.type ? n.memoizedProps : Ue(t.type, n.memoizedProps)
                                    r.componentDidUpdate(l, n.memoizedState, r.__reactInternalSnapshotBeforeUpdate)
                                }
                            var o = t.updateQueue
                            o !== null && bu(t, o, r)
                            break
                        case 3:
                            var i = t.updateQueue
                            if (i !== null) {
                                if (((n = null), t.child !== null))
                                    switch (t.child.tag) {
                                        case 5:
                                            n = t.child.stateNode
                                            break
                                        case 1:
                                            n = t.child.stateNode
                                    }
                                bu(t, i, n)
                            }
                            break
                        case 5:
                            var u = t.stateNode
                            if (n === null && t.flags & 4) {
                                n = u
                                var s = t.memoizedProps
                                switch (t.type) {
                                    case 'button':
                                    case 'input':
                                    case 'select':
                                    case 'textarea':
                                        s.autoFocus && n.focus()
                                        break
                                    case 'img':
                                        s.src && (n.src = s.src)
                                }
                            }
                            break
                        case 6:
                            break
                        case 4:
                            break
                        case 12:
                            break
                        case 13:
                            if (t.memoizedState === null) {
                                var a = t.alternate
                                if (a !== null) {
                                    var m = a.memoizedState
                                    if (m !== null) {
                                        var h = m.dehydrated
                                        h !== null && lr(h)
                                    }
                                }
                            }
                            break
                        case 19:
                        case 17:
                        case 21:
                        case 22:
                        case 23:
                        case 25:
                            break
                        default:
                            throw Error(E(163))
                    }
                ce || (t.flags & 512 && ii(t))
            } catch (d) {
                Z(t, t.return, d)
            }
        }
        if (t === e) {
            L = null
            break
        }
        if (((n = t.sibling), n !== null)) {
            ;((n.return = t.return), (L = n))
            break
        }
        L = t.return
    }
}
function gs(e) {
    for (; L !== null; ) {
        var t = L
        if (t === e) {
            L = null
            break
        }
        var n = t.sibling
        if (n !== null) {
            ;((n.return = t.return), (L = n))
            break
        }
        L = t.return
    }
}
function vs(e) {
    for (; L !== null; ) {
        var t = L
        try {
            switch (t.tag) {
                case 0:
                case 11:
                case 15:
                    var n = t.return
                    try {
                        Il(4, t)
                    } catch (s) {
                        Z(t, n, s)
                    }
                    break
                case 1:
                    var r = t.stateNode
                    if (typeof r.componentDidMount == 'function') {
                        var l = t.return
                        try {
                            r.componentDidMount()
                        } catch (s) {
                            Z(t, l, s)
                        }
                    }
                    var o = t.return
                    try {
                        ii(t)
                    } catch (s) {
                        Z(t, o, s)
                    }
                    break
                case 5:
                    var i = t.return
                    try {
                        ii(t)
                    } catch (s) {
                        Z(t, i, s)
                    }
            }
        } catch (s) {
            Z(t, t.return, s)
        }
        if (t === e) {
            L = null
            break
        }
        var u = t.sibling
        if (u !== null) {
            ;((u.return = t.return), (L = u))
            break
        }
        L = t.return
    }
}
var Ep = Math.ceil,
    wl = dt.ReactCurrentDispatcher,
    bi = dt.ReactCurrentOwner,
    Oe = dt.ReactCurrentBatchConfig,
    F = 0,
    re = null,
    b = null,
    oe = 0,
    Ee = 0,
    dn = Rt(0),
    te = 0,
    mr = null,
    Yt = 0,
    Fl = 0,
    eu = 0,
    Jn = null,
    ge = null,
    tu = 0,
    _n = 1 / 0,
    be = null,
    Sl = !1,
    ai = null,
    _t = null,
    Ur = !1,
    wt = null,
    kl = 0,
    qn = 0,
    ci = null,
    Jr = -1,
    qr = 0
function pe() {
    return F & 6 ? J() : Jr !== -1 ? Jr : (Jr = J())
}
function Nt(e) {
    return e.mode & 1
        ? F & 2 && oe !== 0
            ? oe & -oe
            : op.transition !== null
              ? (qr === 0 && (qr = Ea()), qr)
              : ((e = U), e !== 0 || ((e = window.event), (e = e === void 0 ? 16 : La(e.type))), e)
        : 1
}
function We(e, t, n, r) {
    if (50 < qn) throw ((qn = 0), (ci = null), Error(E(185)))
    ;(yr(e, n, r),
        (!(F & 2) || e !== re) &&
            (e === re && (!(F & 2) && (Fl |= n), te === 4 && vt(e, oe)),
            Se(e, r),
            n === 1 && F === 0 && !(t.mode & 1) && ((_n = J() + 500), Dl && Dt())))
}
function Se(e, t) {
    var n = e.callbackNode
    od(e, t)
    var r = ll(e, e === re ? oe : 0)
    if (r === 0) (n !== null && Nu(n), (e.callbackNode = null), (e.callbackPriority = 0))
    else if (((t = r & -r), e.callbackPriority !== t)) {
        if ((n != null && Nu(n), t === 1))
            (e.tag === 0 ? lp(ys.bind(null, e)) : Ya(ys.bind(null, e)),
                ep(function () {
                    !(F & 6) && Dt()
                }),
                (n = null))
        else {
            switch (xa(r)) {
                case 1:
                    n = Pi
                    break
                case 4:
                    n = Sa
                    break
                case 16:
                    n = rl
                    break
                case 536870912:
                    n = ka
                    break
                default:
                    n = rl
            }
            n = Qc(n, Uc.bind(null, e))
        }
        ;((e.callbackPriority = t), (e.callbackNode = n))
    }
}
function Uc(e, t) {
    if (((Jr = -1), (qr = 0), F & 6)) throw Error(E(327))
    var n = e.callbackNode
    if (yn() && e.callbackNode !== n) return null
    var r = ll(e, e === re ? oe : 0)
    if (r === 0) return null
    if (r & 30 || r & e.expiredLanes || t) t = El(e, r)
    else {
        t = r
        var l = F
        F |= 2
        var o = Vc()
        ;(re !== e || oe !== t) && ((be = null), (_n = J() + 500), Bt(e, t))
        do
            try {
                _p()
                break
            } catch (u) {
                $c(e, u)
            }
        while (!0)
        ;($i(), (wl.current = o), (F = l), b !== null ? (t = 0) : ((re = null), (oe = 0), (t = te)))
    }
    if (t !== 0) {
        if ((t === 2 && ((l = Fo(e)), l !== 0 && ((r = l), (t = fi(e, l)))), t === 1))
            throw ((n = mr), Bt(e, 0), vt(e, r), Se(e, J()), n)
        if (t === 6) vt(e, r)
        else {
            if (
                ((l = e.current.alternate),
                !(r & 30) &&
                    !xp(l) &&
                    ((t = El(e, r)), t === 2 && ((o = Fo(e)), o !== 0 && ((r = o), (t = fi(e, o)))), t === 1))
            )
                throw ((n = mr), Bt(e, 0), vt(e, r), Se(e, J()), n)
            switch (((e.finishedWork = l), (e.finishedLanes = r), t)) {
                case 0:
                case 1:
                    throw Error(E(345))
                case 2:
                    Ft(e, ge, be)
                    break
                case 3:
                    if ((vt(e, r), (r & 130023424) === r && ((t = tu + 500 - J()), 10 < t))) {
                        if (ll(e, 0) !== 0) break
                        if (((l = e.suspendedLanes), (l & r) !== r)) {
                            ;(pe(), (e.pingedLanes |= e.suspendedLanes & l))
                            break
                        }
                        e.timeoutHandle = Go(Ft.bind(null, e, ge, be), t)
                        break
                    }
                    Ft(e, ge, be)
                    break
                case 4:
                    if ((vt(e, r), (r & 4194240) === r)) break
                    for (t = e.eventTimes, l = -1; 0 < r; ) {
                        var i = 31 - Be(r)
                        ;((o = 1 << i), (i = t[i]), i > l && (l = i), (r &= ~o))
                    }
                    if (
                        ((r = l),
                        (r = J() - r),
                        (r =
                            (120 > r
                                ? 120
                                : 480 > r
                                  ? 480
                                  : 1080 > r
                                    ? 1080
                                    : 1920 > r
                                      ? 1920
                                      : 3e3 > r
                                        ? 3e3
                                        : 4320 > r
                                          ? 4320
                                          : 1960 * Ep(r / 1960)) - r),
                        10 < r)
                    ) {
                        e.timeoutHandle = Go(Ft.bind(null, e, ge, be), r)
                        break
                    }
                    Ft(e, ge, be)
                    break
                case 5:
                    Ft(e, ge, be)
                    break
                default:
                    throw Error(E(329))
            }
        }
    }
    return (Se(e, J()), e.callbackNode === n ? Uc.bind(null, e) : null)
}
function fi(e, t) {
    var n = Jn
    return (
        e.current.memoizedState.isDehydrated && (Bt(e, t).flags |= 256),
        (e = El(e, t)),
        e !== 2 && ((t = ge), (ge = n), t !== null && di(t)),
        e
    )
}
function di(e) {
    ge === null ? (ge = e) : ge.push.apply(ge, e)
}
function xp(e) {
    for (var t = e; ; ) {
        if (t.flags & 16384) {
            var n = t.updateQueue
            if (n !== null && ((n = n.stores), n !== null))
                for (var r = 0; r < n.length; r++) {
                    var l = n[r],
                        o = l.getSnapshot
                    l = l.value
                    try {
                        if (!Ge(o(), l)) return !1
                    } catch {
                        return !1
                    }
                }
        }
        if (((n = t.child), t.subtreeFlags & 16384 && n !== null)) ((n.return = t), (t = n))
        else {
            if (t === e) break
            for (; t.sibling === null; ) {
                if (t.return === null || t.return === e) return !0
                t = t.return
            }
            ;((t.sibling.return = t.return), (t = t.sibling))
        }
    }
    return !0
}
function vt(e, t) {
    for (t &= ~eu, t &= ~Fl, e.suspendedLanes |= t, e.pingedLanes &= ~t, e = e.expirationTimes; 0 < t; ) {
        var n = 31 - Be(t),
            r = 1 << n
        ;((e[n] = -1), (t &= ~r))
    }
}
function ys(e) {
    if (F & 6) throw Error(E(327))
    yn()
    var t = ll(e, 0)
    if (!(t & 1)) return (Se(e, J()), null)
    var n = El(e, t)
    if (e.tag !== 0 && n === 2) {
        var r = Fo(e)
        r !== 0 && ((t = r), (n = fi(e, r)))
    }
    if (n === 1) throw ((n = mr), Bt(e, 0), vt(e, t), Se(e, J()), n)
    if (n === 6) throw Error(E(345))
    return ((e.finishedWork = e.current.alternate), (e.finishedLanes = t), Ft(e, ge, be), Se(e, J()), null)
}
function nu(e, t) {
    var n = F
    F |= 1
    try {
        return e(t)
    } finally {
        ;((F = n), F === 0 && ((_n = J() + 500), Dl && Dt()))
    }
}
function Xt(e) {
    wt !== null && wt.tag === 0 && !(F & 6) && yn()
    var t = F
    F |= 1
    var n = Oe.transition,
        r = U
    try {
        if (((Oe.transition = null), (U = 1), e)) return e()
    } finally {
        ;((U = r), (Oe.transition = n), (F = t), !(F & 6) && Dt())
    }
}
function ru() {
    ;((Ee = dn.current), B(dn))
}
function Bt(e, t) {
    ;((e.finishedWork = null), (e.finishedLanes = 0))
    var n = e.timeoutHandle
    if ((n !== -1 && ((e.timeoutHandle = -1), bd(n)), b !== null))
        for (n = b.return; n !== null; ) {
            var r = n
            switch ((Fi(r), r.tag)) {
                case 1:
                    ;((r = r.type.childContextTypes), r != null && al())
                    break
                case 3:
                    ;(xn(), B(ye), B(fe), Qi())
                    break
                case 5:
                    Gi(r)
                    break
                case 4:
                    xn()
                    break
                case 13:
                    B(Q)
                    break
                case 19:
                    B(Q)
                    break
                case 10:
                    Vi(r.type._context)
                    break
                case 22:
                case 23:
                    ru()
            }
            n = n.return
        }
    if (
        ((re = e),
        (b = e = Pt(e.current, null)),
        (oe = Ee = t),
        (te = 0),
        (mr = null),
        (eu = Fl = Yt = 0),
        (ge = Jn = null),
        Ut !== null)
    ) {
        for (t = 0; t < Ut.length; t++)
            if (((n = Ut[t]), (r = n.interleaved), r !== null)) {
                n.interleaved = null
                var l = r.next,
                    o = n.pending
                if (o !== null) {
                    var i = o.next
                    ;((o.next = l), (r.next = i))
                }
                n.pending = r
            }
        Ut = null
    }
    return e
}
function $c(e, t) {
    do {
        var n = b
        try {
            if (($i(), (Yr.current = yl), vl)) {
                for (var r = K.memoizedState; r !== null; ) {
                    var l = r.queue
                    ;(l !== null && (l.pending = null), (r = r.next))
                }
                vl = !1
            }
            if (
                ((Kt = 0),
                (ne = ee = K = null),
                (Xn = !1),
                (dr = 0),
                (bi.current = null),
                n === null || n.return === null)
            ) {
                ;((te = 1), (mr = t), (b = null))
                break
            }
            e: {
                var o = e,
                    i = n.return,
                    u = n,
                    s = t
                if (((t = oe), (u.flags |= 32768), s !== null && typeof s == 'object' && typeof s.then == 'function')) {
                    var a = s,
                        m = u,
                        h = m.tag
                    if (!(m.mode & 1) && (h === 0 || h === 11 || h === 15)) {
                        var d = m.alternate
                        d
                            ? ((m.updateQueue = d.updateQueue),
                              (m.memoizedState = d.memoizedState),
                              (m.lanes = d.lanes))
                            : ((m.updateQueue = null), (m.memoizedState = null))
                    }
                    var g = os(i)
                    if (g !== null) {
                        ;((g.flags &= -257), is(g, i, u, o, t), g.mode & 1 && ls(o, a, t), (t = g), (s = a))
                        var v = t.updateQueue
                        if (v === null) {
                            var k = new Set()
                            ;(k.add(s), (t.updateQueue = k))
                        } else v.add(s)
                        break e
                    } else {
                        if (!(t & 1)) {
                            ;(ls(o, a, t), lu())
                            break e
                        }
                        s = Error(E(426))
                    }
                } else if (G && u.mode & 1) {
                    var N = os(i)
                    if (N !== null) {
                        ;(!(N.flags & 65536) && (N.flags |= 256), is(N, i, u, o, t), Ai(Cn(s, u)))
                        break e
                    }
                }
                ;((o = s = Cn(s, u)), te !== 4 && (te = 2), Jn === null ? (Jn = [o]) : Jn.push(o), (o = i))
                do {
                    switch (o.tag) {
                        case 3:
                            ;((o.flags |= 65536), (t &= -t), (o.lanes |= t))
                            var f = xc(o, s, t)
                            qu(o, f)
                            break e
                        case 1:
                            u = s
                            var c = o.type,
                                p = o.stateNode
                            if (
                                !(o.flags & 128) &&
                                (typeof c.getDerivedStateFromError == 'function' ||
                                    (p !== null &&
                                        typeof p.componentDidCatch == 'function' &&
                                        (_t === null || !_t.has(p))))
                            ) {
                                ;((o.flags |= 65536), (t &= -t), (o.lanes |= t))
                                var y = Cc(o, u, t)
                                qu(o, y)
                                break e
                            }
                    }
                    o = o.return
                } while (o !== null)
            }
            Bc(n)
        } catch (w) {
            ;((t = w), b === n && n !== null && (b = n = n.return))
            continue
        }
        break
    } while (!0)
}
function Vc() {
    var e = wl.current
    return ((wl.current = yl), e === null ? yl : e)
}
function lu() {
    ;((te === 0 || te === 3 || te === 2) && (te = 4),
        re === null || (!(Yt & 268435455) && !(Fl & 268435455)) || vt(re, oe))
}
function El(e, t) {
    var n = F
    F |= 2
    var r = Vc()
    ;(re !== e || oe !== t) && ((be = null), Bt(e, t))
    do
        try {
            Cp()
            break
        } catch (l) {
            $c(e, l)
        }
    while (!0)
    if (($i(), (F = n), (wl.current = r), b !== null)) throw Error(E(261))
    return ((re = null), (oe = 0), te)
}
function Cp() {
    for (; b !== null; ) Hc(b)
}
function _p() {
    for (; b !== null && !Zf(); ) Hc(b)
}
function Hc(e) {
    var t = Gc(e.alternate, e, Ee)
    ;((e.memoizedProps = e.pendingProps), t === null ? Bc(e) : (b = t), (bi.current = null))
}
function Bc(e) {
    var t = e
    do {
        var n = t.alternate
        if (((e = t.return), t.flags & 32768)) {
            if (((n = yp(n, t)), n !== null)) {
                ;((n.flags &= 32767), (b = n))
                return
            }
            if (e !== null) ((e.flags |= 32768), (e.subtreeFlags = 0), (e.deletions = null))
            else {
                ;((te = 6), (b = null))
                return
            }
        } else if (((n = vp(n, t, Ee)), n !== null)) {
            b = n
            return
        }
        if (((t = t.sibling), t !== null)) {
            b = t
            return
        }
        b = t = e
    } while (t !== null)
    te === 0 && (te = 5)
}
function Ft(e, t, n) {
    var r = U,
        l = Oe.transition
    try {
        ;((Oe.transition = null), (U = 1), Np(e, t, n, r))
    } finally {
        ;((Oe.transition = l), (U = r))
    }
    return null
}
function Np(e, t, n, r) {
    do yn()
    while (wt !== null)
    if (F & 6) throw Error(E(327))
    n = e.finishedWork
    var l = e.finishedLanes
    if (n === null) return null
    if (((e.finishedWork = null), (e.finishedLanes = 0), n === e.current)) throw Error(E(177))
    ;((e.callbackNode = null), (e.callbackPriority = 0))
    var o = n.lanes | n.childLanes
    if (
        (id(e, o),
        e === re && ((b = re = null), (oe = 0)),
        (!(n.subtreeFlags & 2064) && !(n.flags & 2064)) ||
            Ur ||
            ((Ur = !0),
            Qc(rl, function () {
                return (yn(), null)
            })),
        (o = (n.flags & 15990) !== 0),
        n.subtreeFlags & 15990 || o)
    ) {
        ;((o = Oe.transition), (Oe.transition = null))
        var i = U
        U = 1
        var u = F
        ;((F |= 4),
            (bi.current = null),
            Sp(e, n),
            Fc(n, e),
            Qd(Bo),
            (ol = !!Ho),
            (Bo = Ho = null),
            (e.current = n),
            kp(n),
            Jf(),
            (F = u),
            (U = i),
            (Oe.transition = o))
    } else e.current = n
    if (
        (Ur && ((Ur = !1), (wt = e), (kl = l)),
        (o = e.pendingLanes),
        o === 0 && (_t = null),
        ed(n.stateNode),
        Se(e, J()),
        t !== null)
    )
        for (r = e.onRecoverableError, n = 0; n < t.length; n++)
            ((l = t[n]), r(l.value, { componentStack: l.stack, digest: l.digest }))
    if (Sl) throw ((Sl = !1), (e = ai), (ai = null), e)
    return (
        kl & 1 && e.tag !== 0 && yn(),
        (o = e.pendingLanes),
        o & 1 ? (e === ci ? qn++ : ((qn = 0), (ci = e))) : (qn = 0),
        Dt(),
        null
    )
}
function yn() {
    if (wt !== null) {
        var e = xa(kl),
            t = Oe.transition,
            n = U
        try {
            if (((Oe.transition = null), (U = 16 > e ? 16 : e), wt === null)) var r = !1
            else {
                if (((e = wt), (wt = null), (kl = 0), F & 6)) throw Error(E(331))
                var l = F
                for (F |= 4, L = e.current; L !== null; ) {
                    var o = L,
                        i = o.child
                    if (L.flags & 16) {
                        var u = o.deletions
                        if (u !== null) {
                            for (var s = 0; s < u.length; s++) {
                                var a = u[s]
                                for (L = a; L !== null; ) {
                                    var m = L
                                    switch (m.tag) {
                                        case 0:
                                        case 11:
                                        case 15:
                                            Zn(8, m, o)
                                    }
                                    var h = m.child
                                    if (h !== null) ((h.return = m), (L = h))
                                    else
                                        for (; L !== null; ) {
                                            m = L
                                            var d = m.sibling,
                                                g = m.return
                                            if ((Oc(m), m === a)) {
                                                L = null
                                                break
                                            }
                                            if (d !== null) {
                                                ;((d.return = g), (L = d))
                                                break
                                            }
                                            L = g
                                        }
                                }
                            }
                            var v = o.alternate
                            if (v !== null) {
                                var k = v.child
                                if (k !== null) {
                                    v.child = null
                                    do {
                                        var N = k.sibling
                                        ;((k.sibling = null), (k = N))
                                    } while (k !== null)
                                }
                            }
                            L = o
                        }
                    }
                    if (o.subtreeFlags & 2064 && i !== null) ((i.return = o), (L = i))
                    else
                        e: for (; L !== null; ) {
                            if (((o = L), o.flags & 2048))
                                switch (o.tag) {
                                    case 0:
                                    case 11:
                                    case 15:
                                        Zn(9, o, o.return)
                                }
                            var f = o.sibling
                            if (f !== null) {
                                ;((f.return = o.return), (L = f))
                                break e
                            }
                            L = o.return
                        }
                }
                var c = e.current
                for (L = c; L !== null; ) {
                    i = L
                    var p = i.child
                    if (i.subtreeFlags & 2064 && p !== null) ((p.return = i), (L = p))
                    else
                        e: for (i = c; L !== null; ) {
                            if (((u = L), u.flags & 2048))
                                try {
                                    switch (u.tag) {
                                        case 0:
                                        case 11:
                                        case 15:
                                            Il(9, u)
                                    }
                                } catch (w) {
                                    Z(u, u.return, w)
                                }
                            if (u === i) {
                                L = null
                                break e
                            }
                            var y = u.sibling
                            if (y !== null) {
                                ;((y.return = u.return), (L = y))
                                break e
                            }
                            L = u.return
                        }
                }
                if (((F = l), Dt(), Ze && typeof Ze.onPostCommitFiberRoot == 'function'))
                    try {
                        Ze.onPostCommitFiberRoot(Tl, e)
                    } catch {}
                r = !0
            }
            return r
        } finally {
            ;((U = n), (Oe.transition = t))
        }
    }
    return !1
}
function ws(e, t, n) {
    ;((t = Cn(n, t)), (t = xc(e, t, 1)), (e = Ct(e, t, 1)), (t = pe()), e !== null && (yr(e, 1, t), Se(e, t)))
}
function Z(e, t, n) {
    if (e.tag === 3) ws(e, e, n)
    else
        for (; t !== null; ) {
            if (t.tag === 3) {
                ws(t, e, n)
                break
            } else if (t.tag === 1) {
                var r = t.stateNode
                if (
                    typeof t.type.getDerivedStateFromError == 'function' ||
                    (typeof r.componentDidCatch == 'function' && (_t === null || !_t.has(r)))
                ) {
                    ;((e = Cn(n, e)),
                        (e = Cc(t, e, 1)),
                        (t = Ct(t, e, 1)),
                        (e = pe()),
                        t !== null && (yr(t, 1, e), Se(t, e)))
                    break
                }
            }
            t = t.return
        }
}
function Pp(e, t, n) {
    var r = e.pingCache
    ;(r !== null && r.delete(t),
        (t = pe()),
        (e.pingedLanes |= e.suspendedLanes & n),
        re === e &&
            (oe & n) === n &&
            (te === 4 || (te === 3 && (oe & 130023424) === oe && 500 > J() - tu) ? Bt(e, 0) : (eu |= n)),
        Se(e, t))
}
function Wc(e, t) {
    t === 0 && (e.mode & 1 ? ((t = Lr), (Lr <<= 1), !(Lr & 130023424) && (Lr = 4194304)) : (t = 1))
    var n = pe()
    ;((e = at(e, t)), e !== null && (yr(e, t, n), Se(e, n)))
}
function Tp(e) {
    var t = e.memoizedState,
        n = 0
    ;(t !== null && (n = t.retryLane), Wc(e, n))
}
function Lp(e, t) {
    var n = 0
    switch (e.tag) {
        case 13:
            var r = e.stateNode,
                l = e.memoizedState
            l !== null && (n = l.retryLane)
            break
        case 19:
            r = e.stateNode
            break
        default:
            throw Error(E(314))
    }
    ;(r !== null && r.delete(t), Wc(e, n))
}
var Gc
Gc = function (e, t, n) {
    if (e !== null)
        if (e.memoizedProps !== t.pendingProps || ye.current) ve = !0
        else {
            if (!(e.lanes & n) && !(t.flags & 128)) return ((ve = !1), gp(e, t, n))
            ve = !!(e.flags & 131072)
        }
    else ((ve = !1), G && t.flags & 1048576 && Xa(t, dl, t.index))
    switch (((t.lanes = 0), t.tag)) {
        case 2:
            var r = t.type
            ;(Zr(e, t), (e = t.pendingProps))
            var l = Sn(t, fe.current)
            ;(vn(t, n), (l = Yi(null, t, r, e, l, n)))
            var o = Xi()
            return (
                (t.flags |= 1),
                typeof l == 'object' && l !== null && typeof l.render == 'function' && l.$$typeof === void 0
                    ? ((t.tag = 1),
                      (t.memoizedState = null),
                      (t.updateQueue = null),
                      we(r) ? ((o = !0), cl(t)) : (o = !1),
                      (t.memoizedState = l.state !== null && l.state !== void 0 ? l.state : null),
                      Bi(t),
                      (l.updater = jl),
                      (t.stateNode = l),
                      (l._reactInternals = t),
                      qo(t, r, e, n),
                      (t = ti(null, t, r, !0, o, n)))
                    : ((t.tag = 0), G && o && Ii(t), de(null, t, l, n), (t = t.child)),
                t
            )
        case 16:
            r = t.elementType
            e: {
                switch (
                    (Zr(e, t),
                    (e = t.pendingProps),
                    (l = r._init),
                    (r = l(r._payload)),
                    (t.type = r),
                    (l = t.tag = zp(r)),
                    (e = Ue(r, e)),
                    l)
                ) {
                    case 0:
                        t = ei(null, t, r, e, n)
                        break e
                    case 1:
                        t = as(null, t, r, e, n)
                        break e
                    case 11:
                        t = us(null, t, r, e, n)
                        break e
                    case 14:
                        t = ss(null, t, r, Ue(r.type, e), n)
                        break e
                }
                throw Error(E(306, r, ''))
            }
            return t
        case 0:
            return ((r = t.type), (l = t.pendingProps), (l = t.elementType === r ? l : Ue(r, l)), ei(e, t, r, l, n))
        case 1:
            return ((r = t.type), (l = t.pendingProps), (l = t.elementType === r ? l : Ue(r, l)), as(e, t, r, l, n))
        case 3:
            e: {
                if ((Tc(t), e === null)) throw Error(E(387))
                ;((r = t.pendingProps), (o = t.memoizedState), (l = o.element), tc(e, t), ml(t, r, null, n))
                var i = t.memoizedState
                if (((r = i.element), o.isDehydrated))
                    if (
                        ((o = {
                            element: r,
                            isDehydrated: !1,
                            cache: i.cache,
                            pendingSuspenseBoundaries: i.pendingSuspenseBoundaries,
                            transitions: i.transitions,
                        }),
                        (t.updateQueue.baseState = o),
                        (t.memoizedState = o),
                        t.flags & 256)
                    ) {
                        ;((l = Cn(Error(E(423)), t)), (t = cs(e, t, r, n, l)))
                        break e
                    } else if (r !== l) {
                        ;((l = Cn(Error(E(424)), t)), (t = cs(e, t, r, n, l)))
                        break e
                    } else
                        for (
                            xe = xt(t.stateNode.containerInfo.firstChild),
                                _e = t,
                                G = !0,
                                Ve = null,
                                n = ba(t, null, r, n),
                                t.child = n;
                            n;

                        )
                            ((n.flags = (n.flags & -3) | 4096), (n = n.sibling))
                else {
                    if ((kn(), r === l)) {
                        t = ct(e, t, n)
                        break e
                    }
                    de(e, t, r, n)
                }
                t = t.child
            }
            return t
        case 5:
            return (
                nc(t),
                e === null && Xo(t),
                (r = t.type),
                (l = t.pendingProps),
                (o = e !== null ? e.memoizedProps : null),
                (i = l.children),
                Wo(r, l) ? (i = null) : o !== null && Wo(r, o) && (t.flags |= 32),
                Pc(e, t),
                de(e, t, i, n),
                t.child
            )
        case 6:
            return (e === null && Xo(t), null)
        case 13:
            return Lc(e, t, n)
        case 4:
            return (
                Wi(t, t.stateNode.containerInfo),
                (r = t.pendingProps),
                e === null ? (t.child = En(t, null, r, n)) : de(e, t, r, n),
                t.child
            )
        case 11:
            return ((r = t.type), (l = t.pendingProps), (l = t.elementType === r ? l : Ue(r, l)), us(e, t, r, l, n))
        case 7:
            return (de(e, t, t.pendingProps, n), t.child)
        case 8:
            return (de(e, t, t.pendingProps.children, n), t.child)
        case 12:
            return (de(e, t, t.pendingProps.children, n), t.child)
        case 10:
            e: {
                if (
                    ((r = t.type._context),
                    (l = t.pendingProps),
                    (o = t.memoizedProps),
                    (i = l.value),
                    V(pl, r._currentValue),
                    (r._currentValue = i),
                    o !== null)
                )
                    if (Ge(o.value, i)) {
                        if (o.children === l.children && !ye.current) {
                            t = ct(e, t, n)
                            break e
                        }
                    } else
                        for (o = t.child, o !== null && (o.return = t); o !== null; ) {
                            var u = o.dependencies
                            if (u !== null) {
                                i = o.child
                                for (var s = u.firstContext; s !== null; ) {
                                    if (s.context === r) {
                                        if (o.tag === 1) {
                                            ;((s = ot(-1, n & -n)), (s.tag = 2))
                                            var a = o.updateQueue
                                            if (a !== null) {
                                                a = a.shared
                                                var m = a.pending
                                                ;(m === null ? (s.next = s) : ((s.next = m.next), (m.next = s)),
                                                    (a.pending = s))
                                            }
                                        }
                                        ;((o.lanes |= n),
                                            (s = o.alternate),
                                            s !== null && (s.lanes |= n),
                                            Zo(o.return, n, t),
                                            (u.lanes |= n))
                                        break
                                    }
                                    s = s.next
                                }
                            } else if (o.tag === 10) i = o.type === t.type ? null : o.child
                            else if (o.tag === 18) {
                                if (((i = o.return), i === null)) throw Error(E(341))
                                ;((i.lanes |= n),
                                    (u = i.alternate),
                                    u !== null && (u.lanes |= n),
                                    Zo(i, n, t),
                                    (i = o.sibling))
                            } else i = o.child
                            if (i !== null) i.return = o
                            else
                                for (i = o; i !== null; ) {
                                    if (i === t) {
                                        i = null
                                        break
                                    }
                                    if (((o = i.sibling), o !== null)) {
                                        ;((o.return = i.return), (i = o))
                                        break
                                    }
                                    i = i.return
                                }
                            o = i
                        }
                ;(de(e, t, l.children, n), (t = t.child))
            }
            return t
        case 9:
            return (
                (l = t.type),
                (r = t.pendingProps.children),
                vn(t, n),
                (l = je(l)),
                (r = r(l)),
                (t.flags |= 1),
                de(e, t, r, n),
                t.child
            )
        case 14:
            return ((r = t.type), (l = Ue(r, t.pendingProps)), (l = Ue(r.type, l)), ss(e, t, r, l, n))
        case 15:
            return _c(e, t, t.type, t.pendingProps, n)
        case 17:
            return (
                (r = t.type),
                (l = t.pendingProps),
                (l = t.elementType === r ? l : Ue(r, l)),
                Zr(e, t),
                (t.tag = 1),
                we(r) ? ((e = !0), cl(t)) : (e = !1),
                vn(t, n),
                Ec(t, r, l),
                qo(t, r, l, n),
                ti(null, t, r, !0, e, n)
            )
        case 19:
            return Mc(e, t, n)
        case 22:
            return Nc(e, t, n)
    }
    throw Error(E(156, t.tag))
}
function Qc(e, t) {
    return wa(e, t)
}
function Mp(e, t, n, r) {
    ;((this.tag = e),
        (this.key = n),
        (this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null),
        (this.index = 0),
        (this.ref = null),
        (this.pendingProps = t),
        (this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null),
        (this.mode = r),
        (this.subtreeFlags = this.flags = 0),
        (this.deletions = null),
        (this.childLanes = this.lanes = 0),
        (this.alternate = null))
}
function De(e, t, n, r) {
    return new Mp(e, t, n, r)
}
function ou(e) {
    return ((e = e.prototype), !(!e || !e.isReactComponent))
}
function zp(e) {
    if (typeof e == 'function') return ou(e) ? 1 : 0
    if (e != null) {
        if (((e = e.$$typeof), e === Ci)) return 11
        if (e === _i) return 14
    }
    return 2
}
function Pt(e, t) {
    var n = e.alternate
    return (
        n === null
            ? ((n = De(e.tag, t, e.key, e.mode)),
              (n.elementType = e.elementType),
              (n.type = e.type),
              (n.stateNode = e.stateNode),
              (n.alternate = e),
              (e.alternate = n))
            : ((n.pendingProps = t), (n.type = e.type), (n.flags = 0), (n.subtreeFlags = 0), (n.deletions = null)),
        (n.flags = e.flags & 14680064),
        (n.childLanes = e.childLanes),
        (n.lanes = e.lanes),
        (n.child = e.child),
        (n.memoizedProps = e.memoizedProps),
        (n.memoizedState = e.memoizedState),
        (n.updateQueue = e.updateQueue),
        (t = e.dependencies),
        (n.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }),
        (n.sibling = e.sibling),
        (n.index = e.index),
        (n.ref = e.ref),
        n
    )
}
function br(e, t, n, r, l, o) {
    var i = 2
    if (((r = e), typeof e == 'function')) ou(e) && (i = 1)
    else if (typeof e == 'string') i = 5
    else
        e: switch (e) {
            case tn:
                return Wt(n.children, l, o, t)
            case xi:
                ;((i = 8), (l |= 8))
                break
            case Eo:
                return ((e = De(12, n, t, l | 2)), (e.elementType = Eo), (e.lanes = o), e)
            case xo:
                return ((e = De(13, n, t, l)), (e.elementType = xo), (e.lanes = o), e)
            case Co:
                return ((e = De(19, n, t, l)), (e.elementType = Co), (e.lanes = o), e)
            case na:
                return Al(n, l, o, t)
            default:
                if (typeof e == 'object' && e !== null)
                    switch (e.$$typeof) {
                        case ea:
                            i = 10
                            break e
                        case ta:
                            i = 9
                            break e
                        case Ci:
                            i = 11
                            break e
                        case _i:
                            i = 14
                            break e
                        case ht:
                            ;((i = 16), (r = null))
                            break e
                    }
                throw Error(E(130, e == null ? e : typeof e, ''))
        }
    return ((t = De(i, n, t, l)), (t.elementType = e), (t.type = r), (t.lanes = o), t)
}
function Wt(e, t, n, r) {
    return ((e = De(7, e, r, t)), (e.lanes = n), e)
}
function Al(e, t, n, r) {
    return ((e = De(22, e, r, t)), (e.elementType = na), (e.lanes = n), (e.stateNode = { isHidden: !1 }), e)
}
function ho(e, t, n) {
    return ((e = De(6, e, null, t)), (e.lanes = n), e)
}
function mo(e, t, n) {
    return (
        (t = De(4, e.children !== null ? e.children : [], e.key, t)),
        (t.lanes = n),
        (t.stateNode = { containerInfo: e.containerInfo, pendingChildren: null, implementation: e.implementation }),
        t
    )
}
function Rp(e, t, n, r, l) {
    ;((this.tag = t),
        (this.containerInfo = e),
        (this.finishedWork = this.pingCache = this.current = this.pendingChildren = null),
        (this.timeoutHandle = -1),
        (this.callbackNode = this.pendingContext = this.context = null),
        (this.callbackPriority = 0),
        (this.eventTimes = Yl(0)),
        (this.expirationTimes = Yl(-1)),
        (this.entangledLanes =
            this.finishedLanes =
            this.mutableReadLanes =
            this.expiredLanes =
            this.pingedLanes =
            this.suspendedLanes =
            this.pendingLanes =
                0),
        (this.entanglements = Yl(0)),
        (this.identifierPrefix = r),
        (this.onRecoverableError = l),
        (this.mutableSourceEagerHydrationData = null))
}
function iu(e, t, n, r, l, o, i, u, s) {
    return (
        (e = new Rp(e, t, n, u, s)),
        t === 1 ? ((t = 1), o === !0 && (t |= 8)) : (t = 0),
        (o = De(3, null, null, t)),
        (e.current = o),
        (o.stateNode = e),
        (o.memoizedState = {
            element: r,
            isDehydrated: n,
            cache: null,
            transitions: null,
            pendingSuspenseBoundaries: null,
        }),
        Bi(o),
        e
    )
}
function Dp(e, t, n) {
    var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null
    return { $$typeof: en, key: r == null ? null : '' + r, children: e, containerInfo: t, implementation: n }
}
function Kc(e) {
    if (!e) return Lt
    e = e._reactInternals
    e: {
        if (Jt(e) !== e || e.tag !== 1) throw Error(E(170))
        var t = e
        do {
            switch (t.tag) {
                case 3:
                    t = t.stateNode.context
                    break e
                case 1:
                    if (we(t.type)) {
                        t = t.stateNode.__reactInternalMemoizedMergedChildContext
                        break e
                    }
            }
            t = t.return
        } while (t !== null)
        throw Error(E(171))
    }
    if (e.tag === 1) {
        var n = e.type
        if (we(n)) return Ka(e, n, t)
    }
    return t
}
function Yc(e, t, n, r, l, o, i, u, s) {
    return (
        (e = iu(n, r, !0, e, l, o, i, u, s)),
        (e.context = Kc(null)),
        (n = e.current),
        (r = pe()),
        (l = Nt(n)),
        (o = ot(r, l)),
        (o.callback = t ?? null),
        Ct(n, o, l),
        (e.current.lanes = l),
        yr(e, l, r),
        Se(e, r),
        e
    )
}
function Ul(e, t, n, r) {
    var l = t.current,
        o = pe(),
        i = Nt(l)
    return (
        (n = Kc(n)),
        t.context === null ? (t.context = n) : (t.pendingContext = n),
        (t = ot(o, i)),
        (t.payload = { element: e }),
        (r = r === void 0 ? null : r),
        r !== null && (t.callback = r),
        (e = Ct(l, t, i)),
        e !== null && (We(e, l, i, o), Kr(e, l, i)),
        i
    )
}
function xl(e) {
    if (((e = e.current), !e.child)) return null
    switch (e.child.tag) {
        case 5:
            return e.child.stateNode
        default:
            return e.child.stateNode
    }
}
function Ss(e, t) {
    if (((e = e.memoizedState), e !== null && e.dehydrated !== null)) {
        var n = e.retryLane
        e.retryLane = n !== 0 && n < t ? n : t
    }
}
function uu(e, t) {
    ;(Ss(e, t), (e = e.alternate) && Ss(e, t))
}
function Op() {
    return null
}
var Xc =
    typeof reportError == 'function'
        ? reportError
        : function (e) {
              console.error(e)
          }
function su(e) {
    this._internalRoot = e
}
$l.prototype.render = su.prototype.render = function (e) {
    var t = this._internalRoot
    if (t === null) throw Error(E(409))
    Ul(e, t, null, null)
}
$l.prototype.unmount = su.prototype.unmount = function () {
    var e = this._internalRoot
    if (e !== null) {
        this._internalRoot = null
        var t = e.containerInfo
        ;(Xt(function () {
            Ul(null, e, null, null)
        }),
            (t[st] = null))
    }
}
function $l(e) {
    this._internalRoot = e
}
$l.prototype.unstable_scheduleHydration = function (e) {
    if (e) {
        var t = Na()
        e = { blockedOn: null, target: e, priority: t }
        for (var n = 0; n < gt.length && t !== 0 && t < gt[n].priority; n++);
        ;(gt.splice(n, 0, e), n === 0 && Ta(e))
    }
}
function au(e) {
    return !(!e || (e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11))
}
function Vl(e) {
    return !(
        !e ||
        (e.nodeType !== 1 &&
            e.nodeType !== 9 &&
            e.nodeType !== 11 &&
            (e.nodeType !== 8 || e.nodeValue !== ' react-mount-point-unstable '))
    )
}
function ks() {}
function jp(e, t, n, r, l) {
    if (l) {
        if (typeof r == 'function') {
            var o = r
            r = function () {
                var a = xl(i)
                o.call(a)
            }
        }
        var i = Yc(t, r, e, 0, null, !1, !1, '', ks)
        return ((e._reactRootContainer = i), (e[st] = i.current), ur(e.nodeType === 8 ? e.parentNode : e), Xt(), i)
    }
    for (; (l = e.lastChild); ) e.removeChild(l)
    if (typeof r == 'function') {
        var u = r
        r = function () {
            var a = xl(s)
            u.call(a)
        }
    }
    var s = iu(e, 0, !1, null, null, !1, !1, '', ks)
    return (
        (e._reactRootContainer = s),
        (e[st] = s.current),
        ur(e.nodeType === 8 ? e.parentNode : e),
        Xt(function () {
            Ul(t, s, n, r)
        }),
        s
    )
}
function Hl(e, t, n, r, l) {
    var o = n._reactRootContainer
    if (o) {
        var i = o
        if (typeof l == 'function') {
            var u = l
            l = function () {
                var s = xl(i)
                u.call(s)
            }
        }
        Ul(t, i, e, l)
    } else i = jp(n, t, e, l, r)
    return xl(i)
}
Ca = function (e) {
    switch (e.tag) {
        case 3:
            var t = e.stateNode
            if (t.current.memoizedState.isDehydrated) {
                var n = Hn(t.pendingLanes)
                n !== 0 && (Ti(t, n | 1), Se(t, J()), !(F & 6) && ((_n = J() + 500), Dt()))
            }
            break
        case 13:
            ;(Xt(function () {
                var r = at(e, 1)
                if (r !== null) {
                    var l = pe()
                    We(r, e, 1, l)
                }
            }),
                uu(e, 1))
    }
}
Li = function (e) {
    if (e.tag === 13) {
        var t = at(e, 134217728)
        if (t !== null) {
            var n = pe()
            We(t, e, 134217728, n)
        }
        uu(e, 134217728)
    }
}
_a = function (e) {
    if (e.tag === 13) {
        var t = Nt(e),
            n = at(e, t)
        if (n !== null) {
            var r = pe()
            We(n, e, t, r)
        }
        uu(e, t)
    }
}
Na = function () {
    return U
}
Pa = function (e, t) {
    var n = U
    try {
        return ((U = e), t())
    } finally {
        U = n
    }
}
Oo = function (e, t, n) {
    switch (t) {
        case 'input':
            if ((Po(e, n), (t = n.name), n.type === 'radio' && t != null)) {
                for (n = e; n.parentNode; ) n = n.parentNode
                for (
                    n = n.querySelectorAll('input[name=' + JSON.stringify('' + t) + '][type="radio"]'), t = 0;
                    t < n.length;
                    t++
                ) {
                    var r = n[t]
                    if (r !== e && r.form === e.form) {
                        var l = Rl(r)
                        if (!l) throw Error(E(90))
                        ;(la(r), Po(r, l))
                    }
                }
            }
            break
        case 'textarea':
            ia(e, n)
            break
        case 'select':
            ;((t = n.value), t != null && pn(e, !!n.multiple, t, !1))
    }
}
pa = nu
ha = Xt
var Ip = { usingClientEntryPoint: !1, Events: [Sr, on, Rl, fa, da, nu] },
    An = { findFiberByHostInstance: At, bundleType: 0, version: '18.3.1', rendererPackageName: 'react-dom' },
    Fp = {
        bundleType: An.bundleType,
        version: An.version,
        rendererPackageName: An.rendererPackageName,
        rendererConfig: An.rendererConfig,
        overrideHookState: null,
        overrideHookStateDeletePath: null,
        overrideHookStateRenamePath: null,
        overrideProps: null,
        overridePropsDeletePath: null,
        overridePropsRenamePath: null,
        setErrorHandler: null,
        setSuspenseHandler: null,
        scheduleUpdate: null,
        currentDispatcherRef: dt.ReactCurrentDispatcher,
        findHostInstanceByFiber: function (e) {
            return ((e = va(e)), e === null ? null : e.stateNode)
        },
        findFiberByHostInstance: An.findFiberByHostInstance || Op,
        findHostInstancesForRefresh: null,
        scheduleRefresh: null,
        scheduleRoot: null,
        setRefreshHandler: null,
        getCurrentFiber: null,
        reconcilerVersion: '18.3.1-next-f1338f8080-20240426',
    }
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < 'u') {
    var $r = __REACT_DEVTOOLS_GLOBAL_HOOK__
    if (!$r.isDisabled && $r.supportsFiber)
        try {
            ;((Tl = $r.inject(Fp)), (Ze = $r))
        } catch {}
}
Pe.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Ip
Pe.createPortal = function (e, t) {
    var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null
    if (!au(t)) throw Error(E(200))
    return Dp(e, t, null, n)
}
Pe.createRoot = function (e, t) {
    if (!au(e)) throw Error(E(299))
    var n = !1,
        r = '',
        l = Xc
    return (
        t != null &&
            (t.unstable_strictMode === !0 && (n = !0),
            t.identifierPrefix !== void 0 && (r = t.identifierPrefix),
            t.onRecoverableError !== void 0 && (l = t.onRecoverableError)),
        (t = iu(e, 1, !1, null, null, n, !1, r, l)),
        (e[st] = t.current),
        ur(e.nodeType === 8 ? e.parentNode : e),
        new su(t)
    )
}
Pe.findDOMNode = function (e) {
    if (e == null) return null
    if (e.nodeType === 1) return e
    var t = e._reactInternals
    if (t === void 0)
        throw typeof e.render == 'function' ? Error(E(188)) : ((e = Object.keys(e).join(',')), Error(E(268, e)))
    return ((e = va(t)), (e = e === null ? null : e.stateNode), e)
}
Pe.flushSync = function (e) {
    return Xt(e)
}
Pe.hydrate = function (e, t, n) {
    if (!Vl(t)) throw Error(E(200))
    return Hl(null, e, t, !0, n)
}
Pe.hydrateRoot = function (e, t, n) {
    if (!au(e)) throw Error(E(405))
    var r = (n != null && n.hydratedSources) || null,
        l = !1,
        o = '',
        i = Xc
    if (
        (n != null &&
            (n.unstable_strictMode === !0 && (l = !0),
            n.identifierPrefix !== void 0 && (o = n.identifierPrefix),
            n.onRecoverableError !== void 0 && (i = n.onRecoverableError)),
        (t = Yc(t, null, e, 1, n ?? null, l, !1, o, i)),
        (e[st] = t.current),
        ur(e),
        r)
    )
        for (e = 0; e < r.length; e++)
            ((n = r[e]),
                (l = n._getVersion),
                (l = l(n._source)),
                t.mutableSourceEagerHydrationData == null
                    ? (t.mutableSourceEagerHydrationData = [n, l])
                    : t.mutableSourceEagerHydrationData.push(n, l))
    return new $l(t)
}
Pe.render = function (e, t, n) {
    if (!Vl(t)) throw Error(E(200))
    return Hl(null, e, t, !1, n)
}
Pe.unmountComponentAtNode = function (e) {
    if (!Vl(e)) throw Error(E(40))
    return e._reactRootContainer
        ? (Xt(function () {
              Hl(null, null, e, !1, function () {
                  ;((e._reactRootContainer = null), (e[st] = null))
              })
          }),
          !0)
        : !1
}
Pe.unstable_batchedUpdates = nu
Pe.unstable_renderSubtreeIntoContainer = function (e, t, n, r) {
    if (!Vl(n)) throw Error(E(200))
    if (e == null || e._reactInternals === void 0) throw Error(E(38))
    return Hl(e, t, n, !1, r)
}
Pe.version = '18.3.1-next-f1338f8080-20240426'
function Zc() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > 'u' || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != 'function'))
        try {
            __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Zc)
        } catch (e) {
            console.error(e)
        }
}
;(Zc(), (Zs.exports = Pe))
var Ap = Zs.exports,
    Es = Ap
;((So.createRoot = Es.createRoot), (So.hydrateRoot = Es.hydrateRoot))
var Jc = { exports: {} },
    qc = {}
/**
 * @license React
 * use-sync-external-store-with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Er = z
function Up(e, t) {
    return (e === t && (e !== 0 || 1 / e === 1 / t)) || (e !== e && t !== t)
}
var $p = typeof Object.is == 'function' ? Object.is : Up,
    Vp = Er.useSyncExternalStore,
    Hp = Er.useRef,
    Bp = Er.useEffect,
    Wp = Er.useMemo,
    Gp = Er.useDebugValue
qc.useSyncExternalStoreWithSelector = function (e, t, n, r, l) {
    var o = Hp(null)
    if (o.current === null) {
        var i = { hasValue: !1, value: null }
        o.current = i
    } else i = o.current
    o = Wp(
        function () {
            function s(g) {
                if (!a) {
                    if (((a = !0), (m = g), (g = r(g)), l !== void 0 && i.hasValue)) {
                        var v = i.value
                        if (l(v, g)) return (h = v)
                    }
                    return (h = g)
                }
                if (((v = h), $p(m, g))) return v
                var k = r(g)
                return l !== void 0 && l(v, k) ? ((m = g), v) : ((m = g), (h = k))
            }
            var a = !1,
                m,
                h,
                d = n === void 0 ? null : n
            return [
                function () {
                    return s(t())
                },
                d === null
                    ? void 0
                    : function () {
                          return s(d())
                      },
            ]
        },
        [t, n, r, l],
    )
    var u = Vp(e, o[0], o[1])
    return (
        Bp(
            function () {
                ;((i.hasValue = !0), (i.value = u))
            },
            [u],
        ),
        Gp(u),
        u
    )
}
Jc.exports = qc
var Qp = Jc.exports
function Kp(e) {
    e()
}
function Yp() {
    let e = null,
        t = null
    return {
        clear() {
            ;((e = null), (t = null))
        },
        notify() {
            Kp(() => {
                let n = e
                for (; n; ) (n.callback(), (n = n.next))
            })
        },
        get() {
            const n = []
            let r = e
            for (; r; ) (n.push(r), (r = r.next))
            return n
        },
        subscribe(n) {
            let r = !0
            const l = (t = { callback: n, next: null, prev: t })
            return (
                l.prev ? (l.prev.next = l) : (e = l),
                function () {
                    !r ||
                        e === null ||
                        ((r = !1),
                        l.next ? (l.next.prev = l.prev) : (t = l.prev),
                        l.prev ? (l.prev.next = l.next) : (e = l.next))
                }
            )
        },
    }
}
var xs = { notify() {}, get: () => [] }
function Xp(e, t) {
    let n,
        r = xs,
        l = 0,
        o = !1
    function i(k) {
        m()
        const N = r.subscribe(k)
        let f = !1
        return () => {
            f || ((f = !0), N(), h())
        }
    }
    function u() {
        r.notify()
    }
    function s() {
        v.onStateChange && v.onStateChange()
    }
    function a() {
        return o
    }
    function m() {
        ;(l++, n || ((n = e.subscribe(s)), (r = Yp())))
    }
    function h() {
        ;(l--, n && l === 0 && (n(), (n = void 0), r.clear(), (r = xs)))
    }
    function d() {
        o || ((o = !0), m())
    }
    function g() {
        o && ((o = !1), h())
    }
    const v = {
        addNestedSub: i,
        notifyNestedSubs: u,
        handleChangeWrapper: s,
        isSubscribed: a,
        trySubscribe: d,
        tryUnsubscribe: g,
        getListeners: () => r,
    }
    return v
}
var Zp = () => typeof window < 'u' && typeof window.document < 'u' && typeof window.document.createElement < 'u',
    Jp = Zp(),
    qp = () => typeof navigator < 'u' && navigator.product === 'ReactNative',
    bp = qp(),
    eh = () => (Jp || bp ? z.useLayoutEffect : z.useEffect),
    th = eh(),
    go = Symbol.for('react-redux-context'),
    vo = typeof globalThis < 'u' ? globalThis : {}
function nh() {
    if (!z.createContext) return {}
    const e = vo[go] ?? (vo[go] = new Map())
    let t = e.get(z.createContext)
    return (t || ((t = z.createContext(null)), e.set(z.createContext, t)), t)
}
var Mt = nh()
function rh(e) {
    const { children: t, context: n, serverState: r, store: l } = e,
        o = z.useMemo(() => {
            const s = Xp(l)
            return { store: l, subscription: s, getServerState: r ? () => r : void 0 }
        }, [l, r]),
        i = z.useMemo(() => l.getState(), [l])
    th(() => {
        const { subscription: s } = o
        return (
            (s.onStateChange = s.notifyNestedSubs),
            s.trySubscribe(),
            i !== l.getState() && s.notifyNestedSubs(),
            () => {
                ;(s.tryUnsubscribe(), (s.onStateChange = void 0))
            }
        )
    }, [o, i])
    const u = n || Mt
    return z.createElement(u.Provider, { value: o }, t)
}
var lh = rh
function cu(e = Mt) {
    return function () {
        return z.useContext(e)
    }
}
var bc = cu()
function ef(e = Mt) {
    const t = e === Mt ? bc : cu(e),
        n = () => {
            const { store: r } = t()
            return r
        }
    return (Object.assign(n, { withTypes: () => n }), n)
}
var oh = ef()
function ih(e = Mt) {
    const t = e === Mt ? oh : ef(e),
        n = () => t().dispatch
    return (Object.assign(n, { withTypes: () => n }), n)
}
var fu = ih(),
    uh = (e, t) => e === t
function sh(e = Mt) {
    const t = e === Mt ? bc : cu(e),
        n = (r, l = {}) => {
            const { equalityFn: o = uh } = typeof l == 'function' ? { equalityFn: l } : l,
                i = t(),
                { store: u, subscription: s, getServerState: a } = i
            z.useRef(!0)
            const m = z.useCallback(
                    {
                        [r.name](d) {
                            return r(d)
                        },
                    }[r.name],
                    [r],
                ),
                h = Qp.useSyncExternalStoreWithSelector(s.addNestedSub, u.getState, a || u.getState, m, o)
            return (z.useDebugValue(h), h)
        }
    return (Object.assign(n, { withTypes: () => n }), n)
}
var He = sh()
const tf = { displayDecimals: 1, storageDecimals: 1 },
    it = {
        Parking: '#a6cee3',
        'Curb Cut': '#1f78b4',
        Loading: '#b2df8a',
        'No Parking': '#33a02c',
        'Bus Stop': '#fb9a99',
        Taxi: '#e31a1c',
        Disabled: '#fdbf6f',
    },
    Vt = (e, t = tf.displayDecimals) => (typeof e != 'number' || isNaN(e) ? '0 ft' : `${e.toFixed(t)} ft`),
    ft = (e, t = tf.storageDecimals) => {
        if (typeof e != 'number' || isNaN(e)) return 0
        const n = Math.pow(10, t)
        return Math.round(e * n) / n
    },
    ah = (e, t, n) => {
        if (!e || e === '.') return { isValid: !1, errorMessage: 'Enter a number' }
        const r = parseFloat(e)
        return isNaN(r)
            ? { isValid: !1, errorMessage: 'Invalid number' }
            : r < t
              ? { isValid: !1, errorMessage: `Minimum ${t}` }
              : r > n
                ? { isValid: !1, errorMessage: `Maximum ${n}` }
                : { isValid: !0, errorMessage: '' }
    },
    ch = (e, t) => (e === '0' ? t : e + t),
    fh = e => (e.includes('.') ? e : e + '.'),
    dh = e => (e.length <= 1 ? '' : e.slice(0, -1)),
    ph = (e, t, n, r, l) => {
        let o = t
        ;(e === 'backspace'
            ? (o = dh(t))
            : e === 'clear'
              ? (o = '0')
              : e === '.'
                ? (o = fh(t))
                : e >= '0' && e <= '9' && (o = ch(t, e)),
            l(o))
    },
    Un = (e, t, n) =>
        S.jsx(
            'button',
            { className: 'number-pad-button number-button', onClick: () => t(e), disabled: !1, children: e },
            e,
        ),
    Vr = (e, t, n, r) => {
        const l = e === 'enter',
            o = e === 'cancel',
            i = e === 'backspace',
            u = e === 'clear',
            s = `number-pad-button ${l ? 'enter-button' : o ? 'cancel-button' : u ? 'clear-button' : 'function-button'}`,
            a = l && !r,
            m = () => (l ? '✓' : o ? '✗' : i ? '←' : u ? 'C' : e)
        return S.jsx('button', { className: s, onClick: () => t(e), disabled: a, children: m() }, e)
    },
    hh = (e, t) => {
        e.target === e.currentTarget && t()
    },
    mh = ({ value: e, min: t = 0, max: n = 999, onSave: r, onCancel: l, label: o = 'Value' }) => {
        const [i, u] = z.useState(e.toString()),
            { isValid: s, errorMessage: a } = ah(i, t, n),
            m = z.useCallback((d, g) => {
                d.key === 'Escape' && g()
            }, [])
        z.useEffect(() => {
            const d = g => m(g, l)
            return (document.addEventListener('keydown', d), () => document.removeEventListener('keydown', d))
        }, [l, m])
        const h = z.useCallback(
            d => {
                d === 'enter' && s ? r(parseFloat(i)) : d === 'cancel' ? l() : ph(d, i, t, n, u)
            },
            [i, s, r, l, t, n],
        )
        return S.jsx('div', {
            className: 'number-pad-backdrop',
            onClick: d => hh(d, l),
            children: S.jsxs('div', {
                className: 'number-pad-container',
                children: [
                    S.jsxs('div', {
                        className: 'number-pad-header',
                        children: [
                            S.jsx('div', { className: 'number-pad-label', children: o }),
                            S.jsx('div', { className: `number-pad-display ${s ? '' : 'error'}`, children: i || '0' }),
                            !s && a && S.jsx('div', { className: 'number-pad-error', children: a }),
                        ],
                    }),
                    S.jsxs('div', {
                        className: 'number-pad-grid',
                        children: [
                            S.jsx('div', { className: 'number-pad-row', children: ['1', '2', '3'].map(d => Un(d, h)) }),
                            S.jsx('div', { className: 'number-pad-row', children: ['4', '5', '6'].map(d => Un(d, h)) }),
                            S.jsx('div', { className: 'number-pad-row', children: ['7', '8', '9'].map(d => Un(d, h)) }),
                            S.jsxs('div', {
                                className: 'number-pad-row',
                                children: [Un('0', h), Un('.', h), Vr('backspace', h, i, s)],
                            }),
                            S.jsxs('div', {
                                className: 'number-pad-row',
                                children: [Vr('clear', h, i, s), Vr('cancel', h, i, s), Vr('enter', h, i, s)],
                            }),
                        ],
                    }),
                ],
            }),
        })
    },
    gh = (e, t) => {
        const n = (l, o) => [...l, l[l.length - 1] + o.length],
            r = e.reduce(n, [0])
        if (t > 0) {
            const l = r[r.length - 1]
            return [...r, l + t]
        }
        return r
    },
    Cs = (e, t = 'Parking') => ({ id: 's' + Math.random().toString(36).slice(2, 7), type: t, length: ft(e) }),
    _s = (e, t, n) => (t < 0 || t >= e.length ? !1 : e[t].length >= n + 1),
    vh = (e, t, n) => {
        if (t < 0 || t >= e.length) return { success: !1, error: 'Invalid segment index' }
        const r = e[t]
        if (!r) return { success: !1, error: 'Invalid segment index' }
        if (_s(e, t, n)) {
            const i = [...e]
            return ((i[t] = { ...r, length: ft(r.length - n) }), i.splice(t, 0, Cs(n)), { success: !0, segments: i })
        }
        if (t > 0 && _s(e, t - 1, n)) {
            const i = [...e]
            return (
                (i[t - 1] = { ...e[t - 1], length: ft(e[t - 1].length - n) }),
                i.splice(t, 0, Cs(n)),
                { success: !0, segments: i }
            )
        }
        return { success: !1, error: 'Insufficient space to create new segment' }
    },
    Re = {
        INITIALIZE_SEGMENTS: 'INITIALIZE_SEGMENTS',
        UPDATE_SEGMENT_TYPE: 'UPDATE_SEGMENT_TYPE',
        UPDATE_SEGMENT_LENGTH: 'UPDATE_SEGMENT_LENGTH',
        ADD_SEGMENT: 'ADD_SEGMENT',
        ADD_SEGMENT_LEFT: 'ADD_SEGMENT_LEFT',
        REPLACE_SEGMENTS: 'REPLACE_SEGMENTS',
    },
    yh = (e = 'Parking', t = 20) => ({ id: 's' + Math.random().toString(36).slice(2, 7), type: e, length: ft(t) }),
    wh = (e, t, n, r) => {
        let l = ft(e.unknownRemaining - r)
        if ((Math.abs(l) < 0.01 && (l = 0), l < 0)) throw new Error('Insufficient unknown space')
        return {
            ...e,
            segments: e.segments.map((o, i) => (i === t ? { ...o, length: n } : o)),
            unknownRemaining: l,
            isCollectionComplete: Math.abs(l) < 0.01,
        }
    },
    Sh = (e, t, n) => {
        if (t < 0 || t >= e.segments.length) throw new Error('Invalid segment index')
        if (n <= 0) throw new Error('Segment length must be positive')
        const r = ft(n),
            l = r - e.segments[t].length
        if (t === e.segments.length - 1) return wh(e, t, r, l)
        const o = e.segments[t + 1],
            i = ft(o.length - l)
        if (i <= 0) throw new Error('Cannot create zero or negative segment length')
        return {
            ...e,
            segments: e.segments.map((u, s) => (s === t ? { ...u, length: r } : s === t + 1 ? { ...u, length: i } : u)),
        }
    },
    kh = (e, t) => {
        const n = Math.min(20, e.unknownRemaining),
            r = yh('Parking', n),
            l = [...e.segments],
            o = t >= 0 ? t + 1 : l.length
        return (
            l.splice(o, 0, r),
            {
                ...e,
                segments: l,
                unknownRemaining: ft(e.unknownRemaining - n),
                isCollectionComplete: e.unknownRemaining - n === 0,
            }
        )
    },
    Eh = { segments: [], unknownRemaining: 240, blockfaceLength: 240, blockfaceId: null, isCollectionComplete: !1 },
    xh = (e, t = null) => ({ type: Re.INITIALIZE_SEGMENTS, payload: { blockfaceLength: e, blockfaceId: t } }),
    Ch = (e, t) => ({ type: Re.UPDATE_SEGMENT_TYPE, payload: { index: e, type: t } }),
    pi = (e, t) => ({ type: Re.UPDATE_SEGMENT_LENGTH, payload: { index: e, newLength: t } }),
    hi = e => ({ type: Re.ADD_SEGMENT, payload: { targetIndex: e } }),
    _h = (e, t = 10) => ({ type: Re.ADD_SEGMENT_LEFT, payload: { index: e, desiredLength: t } }),
    Ns = e => ({ type: Re.REPLACE_SEGMENTS, payload: { segments: e } }),
    Nh = (e = Eh, t) => {
        switch (t.type) {
            case Re.INITIALIZE_SEGMENTS: {
                const { blockfaceLength: n, blockfaceId: r } = t.payload
                return {
                    ...e,
                    blockfaceLength: n,
                    blockfaceId: r,
                    segments: [],
                    unknownRemaining: n,
                    isCollectionComplete: !1,
                }
            }
            case Re.UPDATE_SEGMENT_TYPE: {
                const { index: n, type: r } = t.payload
                return e.segments[n]
                    ? { ...e, segments: e.segments.map((l, o) => (o === n ? { ...l, type: r } : l)) }
                    : e
            }
            case Re.UPDATE_SEGMENT_LENGTH: {
                const { index: n, newLength: r } = t.payload
                if (!e.segments[n]) return e
                try {
                    return Sh(e, n, r)
                } catch {
                    return e
                }
            }
            case Re.ADD_SEGMENT: {
                const { targetIndex: n } = t.payload
                return e.unknownRemaining <= 0 ? e : kh(e, n)
            }
            case Re.ADD_SEGMENT_LEFT: {
                const { index: n, desiredLength: r } = t.payload,
                    l = vh(e.segments, n, r)
                return l.success ? { ...e, segments: l.segments } : e
            }
            case Re.REPLACE_SEGMENTS: {
                const { segments: n } = t.payload,
                    r = typeof n == 'function' ? n(e.segments) : n
                return { ...e, segments: r }
            }
            default:
                return e
        }
    },
    xr = e => e.curb.segments,
    du = e => e.curb.blockfaceLength,
    pu = e => e.curb.unknownRemaining,
    Ph = e => e.curb.isCollectionComplete,
    Th = (() => {
        let t = null,
            n = null,
            r = null
        return l => {
            const o = xr(l),
                i = pu(l)
            return ((o === t && i === n) || ((t = o), (n = i), (r = gh(o, i))), r)
        }
    })(),
    Lh = (() => {
        let t = null,
            n = null
        return r => {
            const l = xr(r)
            return (
                l === t ||
                    ((t = l),
                    (n = l.reduce((o, i) => {
                        const u = o.length === 0 ? 0 : o[o.length - 1] + l[o.length - 1].length
                        return [...o, u]
                    }, []))),
                n
            )
        }
    })(),
    Mh = e => {
        const t = e.getBoundingClientRect()
        return { top: t.bottom + 4, left: t.left, width: t.width }
    },
    zh = (e, t, n) =>
        S.jsx(
            'div',
            { className: 'curb-dropdown-item', style: { backgroundColor: it[e] }, onClick: () => t(n, e), children: e },
            e,
        ),
    Rh = (e, t, n) => {
        ;(e.stopPropagation(), n(t))
    },
    Dh = (e, t, n, r) => {
        if (t === e) {
            ;(n(null), r(null))
            return
        }
        n(e)
        const l = document.querySelector(`[data-row-index="${e}"] .type-button`)
        if (!l) return
        const o = Mh(l)
        r(o)
    },
    Oh = (e, t, n, r, l) => {
        ;(n(e, t), r(null), l(null))
    },
    jh = ({ blockfaceLength: e = 240 }) => {
        const t = fu(),
            n = He(xr) || [],
            r = He(du),
            l = He(pu),
            o = He(Ph),
            [i, u] = z.useState(null),
            [s, a] = z.useState(0),
            [m, h] = z.useState(null),
            [d, g] = z.useState({ isOpen: !1, editingIndex: null, editingField: null, originalValue: 0 }),
            v = r || e,
            k = He(Lh),
            N = l > 0,
            f = z.useCallback(
                (P, R) => {
                    ;(t(Ch(P, R)), a(P))
                },
                [t],
            ),
            c = z.useCallback(
                P => {
                    ;(t(hi(P)), setTimeout(() => a(P), 0))
                },
                [t],
            ),
            p = z.useCallback(P => Dh(P, i, u, h), [i]),
            y = z.useCallback((P, R) => Oh(P, R, f, u, h), [f]),
            w = z.useCallback((P, R, X) => {
                ;(g({ isOpen: !0, editingIndex: P, editingField: R, originalValue: X }), a(P))
            }, []),
            C = z.useCallback(
                P => {
                    const { editingIndex: R, editingField: X } = d
                    R === null ||
                        X === null ||
                        (X === 'length' && t(pi(R, P)),
                        g({ isOpen: !1, editingIndex: null, editingField: null, originalValue: 0 }))
                },
                [d, t],
            ),
            x = z.useCallback(() => {
                g({ isOpen: !1, editingIndex: null, editingField: null, originalValue: 0 })
            }, []),
            _ = () =>
                m
                    ? S.jsx('div', {
                          className: 'curb-dropdown',
                          style: { top: m.top, left: m.left, width: m.width },
                          children: Object.keys(it).map(P => zh(P, y, i)),
                      })
                    : null,
            O = (P, R) => {
                const Le = `curb-table-row${R === s ? ' current-row' : ''}`
                return S.jsxs(
                    'tr',
                    {
                        className: Le,
                        'data-row-index': R,
                        onClick: () => a(R),
                        style: { cursor: 'pointer' },
                        children: [
                            S.jsx('td', {
                                className: 'type-cell',
                                children: S.jsx('div', {
                                    className: 'type-container',
                                    children: S.jsx('button', {
                                        className: 'type-button',
                                        style: { backgroundColor: it[P.type] || '#666' },
                                        onClick: Fe => Rh(Fe, R, p),
                                        children: P.type,
                                    }),
                                }),
                            }),
                            S.jsx('td', {
                                className: 'length-cell editable-cell',
                                onClick: Fe => {
                                    ;(Fe.stopPropagation(), w(R, 'length', P.length))
                                },
                                style: { cursor: 'pointer' },
                                children: Vt(P.length),
                            }),
                            S.jsx('td', { className: 'start-cell', children: Vt(k[R]) }),
                            S.jsx('td', {
                                className: 'add-cell',
                                children: S.jsx('button', {
                                    className: 'add-button',
                                    onClick: () => c(R),
                                    disabled: !N,
                                    children: '+',
                                }),
                            }),
                        ],
                    },
                    P.id,
                )
            }
        return S.jsxs('div', {
            className: 'curb-table-container',
            children: [
                S.jsxs('div', {
                    className: 'curb-table-header',
                    children: [
                        S.jsx('h3', { children: 'Curb Configuration' }),
                        S.jsxs('div', {
                            className: 'blockface-info',
                            children: [
                                'Total: ',
                                v,
                                ' ft',
                                l > 0 && S.jsxs('span', { children: [' • Remaining: ', Vt(l)] }),
                                o && S.jsx('span', { children: ' • Collection Complete' }),
                            ],
                        }),
                    ],
                }),
                S.jsx('div', {
                    className: 'curb-table-wrapper',
                    children: S.jsxs('table', {
                        className: 'curb-table',
                        children: [
                            S.jsx('thead', {
                                children: S.jsxs('tr', {
                                    children: [
                                        S.jsx('th', {}),
                                        S.jsx('th', { style: { textAlign: 'right' }, children: 'Length' }),
                                        S.jsx('th', { style: { textAlign: 'right' }, children: 'Start' }),
                                        S.jsx('th', {}),
                                    ],
                                }),
                            }),
                            S.jsx('tbody', {
                                children:
                                    n && n.length > 0
                                        ? n.map(O)
                                        : S.jsx('tr', {
                                              className: 'empty-state-row',
                                              children: S.jsx('td', {
                                                  colSpan: '4',
                                                  className: 'empty-state-cell',
                                                  children: S.jsx('div', {
                                                      className: 'empty-state-message',
                                                      children: 'No segments yet',
                                                  }),
                                              }),
                                          }),
                            }),
                        ],
                    }),
                }),
                S.jsxs('div', {
                    className: 'segment-controls-bottom',
                    children: [
                        S.jsxs('div', { className: 'remaining-space-info', children: ['Remaining: ', Vt(l), ' ft'] }),
                        S.jsxs('div', {
                            className: 'add-buttons-container',
                            children: [
                                n.length === 0 &&
                                    l > 0 &&
                                    S.jsx('button', {
                                        className: 'add-segment-button',
                                        onClick: () => c(0),
                                        children: '+ Add First Segment',
                                    }),
                                n.length > 0 &&
                                    l > 0 &&
                                    S.jsx('button', {
                                        className: 'add-segment-button',
                                        onClick: () => c(n.length),
                                        children: '+ Add Segment',
                                    }),
                            ],
                        }),
                    ],
                }),
                _(),
                d.isOpen &&
                    S.jsx(mh, {
                        value: d.originalValue,
                        min: d.editingField === 'length' ? 1 : 0,
                        max: (d.editingField === 'length', v),
                        onSave: C,
                        onCancel: x,
                        label: d.editingField === 'length' ? 'Length' : 'Start',
                    }),
            ],
        })
    }
var ke = 63710088e-1,
    nf = {
        centimeters: ke * 100,
        centimetres: ke * 100,
        degrees: 360 / (2 * Math.PI),
        feet: ke * 3.28084,
        inches: ke * 39.37,
        kilometers: ke / 1e3,
        kilometres: ke / 1e3,
        meters: ke,
        metres: ke,
        miles: ke / 1609.344,
        millimeters: ke * 1e3,
        millimetres: ke * 1e3,
        nauticalmiles: ke / 1852,
        radians: 1,
        yards: ke * 1.0936,
    }
function Cl(e, t, n = {}) {
    const r = { type: 'Feature' }
    return (
        (n.id === 0 || n.id) && (r.id = n.id),
        n.bbox && (r.bbox = n.bbox),
        (r.properties = t || {}),
        (r.geometry = e),
        r
    )
}
function Ht(e, t, n = {}) {
    if (!e) throw new Error('coordinates is required')
    if (!Array.isArray(e)) throw new Error('coordinates must be an Array')
    if (e.length < 2) throw new Error('coordinates must be at least 2 numbers long')
    if (!Ps(e[0]) || !Ps(e[1])) throw new Error('coordinates must contain numbers')
    return Cl({ type: 'Point', coordinates: e }, t, n)
}
function rf(e, t, n = {}) {
    if (e.length < 2) throw new Error('coordinates must be an array of two or more positions')
    return Cl({ type: 'LineString', coordinates: e }, t, n)
}
function Ih(e, t = 'kilometers') {
    const n = nf[t]
    if (!n) throw new Error(t + ' units is invalid')
    return e * n
}
function Fh(e, t = 'kilometers') {
    const n = nf[t]
    if (!n) throw new Error(t + ' units is invalid')
    return e / n
}
function gr(e) {
    return ((e % (2 * Math.PI)) * 180) / Math.PI
}
function Ce(e) {
    return ((e % 360) * Math.PI) / 180
}
function Ps(e) {
    return !isNaN(e) && e !== null && !Array.isArray(e)
}
function lt(e) {
    if (!e) throw new Error('coord is required')
    if (!Array.isArray(e)) {
        if (e.type === 'Feature' && e.geometry !== null && e.geometry.type === 'Point')
            return [...e.geometry.coordinates]
        if (e.type === 'Point') return [...e.coordinates]
    }
    if (Array.isArray(e) && e.length >= 2 && !Array.isArray(e[0]) && !Array.isArray(e[1])) return [...e]
    throw new Error('coord must be GeoJSON Point or an Array of numbers')
}
function lf(e) {
    if (Array.isArray(e)) return e
    if (e.type === 'Feature') {
        if (e.geometry !== null) return e.geometry.coordinates
    } else if (e.coordinates) return e.coordinates
    throw new Error('coords must be GeoJSON Feature, Geometry Object or an Array')
}
function Ah(e) {
    return e.type === 'Feature' ? e.geometry : e
}
function Uh(e, t) {
    return e.type === 'FeatureCollection'
        ? 'FeatureCollection'
        : e.type === 'GeometryCollection'
          ? 'GeometryCollection'
          : e.type === 'Feature' && e.geometry !== null
            ? e.geometry.type
            : e.type
}
function of(e, t, n = {}) {
    if (n.final === !0) return $h(e, t)
    const r = lt(e),
        l = lt(t),
        o = Ce(r[0]),
        i = Ce(l[0]),
        u = Ce(r[1]),
        s = Ce(l[1]),
        a = Math.sin(i - o) * Math.cos(s),
        m = Math.cos(u) * Math.sin(s) - Math.sin(u) * Math.cos(s) * Math.cos(i - o)
    return gr(Math.atan2(a, m))
}
function $h(e, t) {
    let n = of(t, e)
    return ((n = (n + 180) % 360), n)
}
function Vh(e, t, n, r = {}) {
    const l = lt(e),
        o = Ce(l[0]),
        i = Ce(l[1]),
        u = Ce(n),
        s = Fh(t, r.units),
        a = Math.asin(Math.sin(i) * Math.cos(s) + Math.cos(i) * Math.sin(s) * Math.cos(u)),
        m = o + Math.atan2(Math.sin(u) * Math.sin(s) * Math.cos(i), Math.cos(s) - Math.sin(i) * Math.sin(a)),
        h = gr(m),
        d = gr(a)
    return Ht([h, d], r.properties)
}
function tt(e, t, n = {}) {
    var r = lt(e),
        l = lt(t),
        o = Ce(l[1] - r[1]),
        i = Ce(l[0] - r[0]),
        u = Ce(r[1]),
        s = Ce(l[1]),
        a = Math.pow(Math.sin(o / 2), 2) + Math.pow(Math.sin(i / 2), 2) * Math.cos(u) * Math.cos(s)
    return Ih(2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)), n.units)
}
function Hh(e, t, n = {}) {
    const l = Ah(e).coordinates
    let o = 0
    for (let i = 0; i < l.length && !(t >= o && i === l.length - 1); i++)
        if (o >= t) {
            const u = t - o
            if (u) {
                const s = of(l[i], l[i - 1]) - 180
                return Vh(l[i], u, s, n)
            } else return Ht(l[i])
        } else o += tt(l[i], l[i + 1], n)
    return Ht(l[l.length - 1])
}
var uf = Hh
function sf(e, t, n) {
    if (e !== null)
        for (
            var r,
                l,
                o,
                i,
                u,
                s,
                a,
                m = 0,
                h = 0,
                d,
                g = e.type,
                v = g === 'FeatureCollection',
                k = g === 'Feature',
                N = v ? e.features.length : 1,
                f = 0;
            f < N;
            f++
        ) {
            ;((a = v ? e.features[f].geometry : k ? e.geometry : e),
                (d = a ? a.type === 'GeometryCollection' : !1),
                (u = d ? a.geometries.length : 1))
            for (var c = 0; c < u; c++) {
                var p = 0,
                    y = 0
                if (((i = d ? a.geometries[c] : a), i !== null)) {
                    s = i.coordinates
                    var w = i.type
                    switch (((m = 0), w)) {
                        case null:
                            break
                        case 'Point':
                            if (t(s, h, f, p, y) === !1) return !1
                            ;(h++, p++)
                            break
                        case 'LineString':
                        case 'MultiPoint':
                            for (r = 0; r < s.length; r++) {
                                if (t(s[r], h, f, p, y) === !1) return !1
                                ;(h++, w === 'MultiPoint' && p++)
                            }
                            w === 'LineString' && p++
                            break
                        case 'Polygon':
                        case 'MultiLineString':
                            for (r = 0; r < s.length; r++) {
                                for (l = 0; l < s[r].length - m; l++) {
                                    if (t(s[r][l], h, f, p, y) === !1) return !1
                                    h++
                                }
                                ;(w === 'MultiLineString' && p++, w === 'Polygon' && y++)
                            }
                            w === 'Polygon' && p++
                            break
                        case 'MultiPolygon':
                            for (r = 0; r < s.length; r++) {
                                for (y = 0, l = 0; l < s[r].length; l++) {
                                    for (o = 0; o < s[r][l].length - m; o++) {
                                        if (t(s[r][l][o], h, f, p, y) === !1) return !1
                                        h++
                                    }
                                    y++
                                }
                                p++
                            }
                            break
                        case 'GeometryCollection':
                            for (r = 0; r < i.geometries.length; r++) if (sf(i.geometries[r], t) === !1) return !1
                            break
                        default:
                            throw new Error('Unknown Geometry Type')
                    }
                }
            }
        }
}
function Bh(e, t) {
    var n,
        r,
        l,
        o,
        i,
        u,
        s,
        a,
        m,
        h,
        d = 0,
        g = e.type === 'FeatureCollection',
        v = e.type === 'Feature',
        k = g ? e.features.length : 1
    for (n = 0; n < k; n++) {
        for (
            u = g ? e.features[n].geometry : v ? e.geometry : e,
                a = g ? e.features[n].properties : v ? e.properties : {},
                m = g ? e.features[n].bbox : v ? e.bbox : void 0,
                h = g ? e.features[n].id : v ? e.id : void 0,
                s = u ? u.type === 'GeometryCollection' : !1,
                i = s ? u.geometries.length : 1,
                l = 0;
            l < i;
            l++
        ) {
            if (((o = s ? u.geometries[l] : u), o === null)) {
                if (t(null, d, a, m, h) === !1) return !1
                continue
            }
            switch (o.type) {
                case 'Point':
                case 'LineString':
                case 'MultiPoint':
                case 'Polygon':
                case 'MultiLineString':
                case 'MultiPolygon': {
                    if (t(o, d, a, m, h) === !1) return !1
                    break
                }
                case 'GeometryCollection': {
                    for (r = 0; r < o.geometries.length; r++) if (t(o.geometries[r], d, a, m, h) === !1) return !1
                    break
                }
                default:
                    throw new Error('Unknown Geometry Type')
            }
        }
        d++
    }
}
function af(e, t) {
    Bh(e, function (n, r, l, o, i) {
        var u = n === null ? null : n.type
        switch (u) {
            case null:
            case 'Point':
            case 'LineString':
            case 'Polygon':
                return t(Cl(n, l, { bbox: o, id: i }), r, 0) === !1 ? !1 : void 0
        }
        var s
        switch (u) {
            case 'MultiPoint':
                s = 'Point'
                break
            case 'MultiLineString':
                s = 'LineString'
                break
            case 'MultiPolygon':
                s = 'Polygon'
                break
        }
        for (var a = 0; a < n.coordinates.length; a++) {
            var m = n.coordinates[a],
                h = { type: s, coordinates: m }
            if (t(Cl(h, l), r, a) === !1) return !1
        }
    })
}
function Wh(e, t) {
    af(e, function (n, r, l) {
        var o = 0
        if (n.geometry) {
            var i = n.geometry.type
            if (!(i === 'Point' || i === 'MultiPoint')) {
                var u,
                    s = 0,
                    a = 0,
                    m = 0
                if (
                    sf(n, function (h, d, g, v, k) {
                        if (u === void 0 || r > s || v > a || k > m) {
                            ;((u = h), (s = r), (a = v), (m = k), (o = 0))
                            return
                        }
                        var N = rf([u, h], n.properties)
                        if (t(N, r, l, k, o) === !1) return !1
                        ;(o++, (u = h))
                    }) === !1
                )
                    return !1
            }
        }
    })
}
function Gh(e, t, n) {
    var r = n,
        l = !1
    return (
        Wh(e, function (o, i, u, s, a) {
            ;(l === !1 && n === void 0 ? (r = o) : (r = t(r, o, i, u, s, a)), (l = !0))
        }),
        r
    )
}
function Qh(e, t = {}) {
    return Gh(
        e,
        (n, r) => {
            const l = r.geometry.coordinates
            return n + tt(l[0], l[1], t)
        },
        0,
    )
}
var cf = Qh,
    Kh = Object.defineProperty,
    Yh = Object.defineProperties,
    Xh = Object.getOwnPropertyDescriptors,
    Ts = Object.getOwnPropertySymbols,
    Zh = Object.prototype.hasOwnProperty,
    Jh = Object.prototype.propertyIsEnumerable,
    Ls = (e, t, n) => (t in e ? Kh(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : (e[t] = n)),
    Ms = (e, t) => {
        for (var n in t || (t = {})) Zh.call(t, n) && Ls(e, n, t[n])
        if (Ts) for (var n of Ts(t)) Jh.call(t, n) && Ls(e, n, t[n])
        return e
    },
    zs = (e, t) => Yh(e, Xh(t))
function Rs(e, t, n = {}) {
    if (!e || !t) throw new Error('lines and pt are required arguments')
    const r = lt(t)
    let l = Ht([1 / 0, 1 / 0], { dist: 1 / 0, index: -1, multiFeatureIndex: -1, location: -1 }),
        o = 0
    return (
        af(e, function (i, u, s) {
            const a = lf(i)
            for (let m = 0; m < a.length - 1; m++) {
                const h = Ht(a[m])
                h.properties.dist = tt(t, h, n)
                const d = lt(h),
                    g = Ht(a[m + 1])
                g.properties.dist = tt(t, g, n)
                const v = lt(g),
                    k = tt(h, g, n)
                let N, f
                d[0] === r[0] && d[1] === r[1]
                    ? ([N, , f] = [d, void 0, !1])
                    : v[0] === r[0] && v[1] === r[1]
                      ? ([N, , f] = [v, void 0, !0])
                      : ([N, , f] = em(h.geometry.coordinates, g.geometry.coordinates, lt(t)))
                let c
                ;(N && (c = Ht(N, { dist: tt(t, N, n), multiFeatureIndex: s, location: o + tt(h, N, n) })),
                    c &&
                        c.properties.dist < l.properties.dist &&
                        (l = zs(Ms({}, c), { properties: zs(Ms({}, c.properties), { index: f ? m + 1 : m }) })),
                    (o += k))
            }
        }),
        l
    )
}
function qh(e, t) {
    const [n, r, l] = e,
        [o, i, u] = t
    return n * o + r * i + l * u
}
function bh(e, t) {
    const [n, r, l] = e,
        [o, i, u] = t
    return [r * u - l * i, l * o - n * u, n * i - r * o]
}
function Ds(e) {
    return Math.sqrt(Math.pow(e[0], 2) + Math.pow(e[1], 2) + Math.pow(e[2], 2))
}
function Ot(e, t) {
    const n = qh(e, t) / (Ds(e) * Ds(t))
    return Math.acos(Math.min(Math.max(n, -1), 1))
}
function yo(e) {
    const t = Ce(e[1]),
        n = Ce(e[0])
    return [Math.cos(t) * Math.cos(n), Math.cos(t) * Math.sin(n), Math.sin(t)]
}
function jt(e) {
    const [t, n, r] = e,
        l = gr(Math.asin(r))
    return [gr(Math.atan2(n, t)), l]
}
function em(e, t, n) {
    const r = yo(e),
        l = yo(t),
        o = yo(n),
        [i, u, s] = o,
        [a, m, h] = bh(r, l),
        d = m * s - h * u,
        g = h * i - a * s,
        v = a * u - m * i,
        k = v * m - g * h,
        N = d * h - v * a,
        f = g * a - d * m,
        c = 1 / Math.sqrt(Math.pow(k, 2) + Math.pow(N, 2) + Math.pow(f, 2)),
        p = [k * c, N * c, f * c],
        y = [-1 * k * c, -1 * N * c, -1 * f * c],
        w = Ot(r, l),
        C = Ot(r, p),
        x = Ot(l, p),
        _ = Ot(r, y),
        O = Ot(l, y)
    let P
    return (
        (C < _ && C < O) || (x < _ && x < O) ? (P = p) : (P = y),
        Ot(r, P) > w || Ot(l, P) > w
            ? tt(jt(P), jt(r)) <= tt(jt(P), jt(l))
                ? [jt(r), !0, !1]
                : [jt(l), !1, !0]
            : [jt(P), !1, !1]
    )
}
function tm(e, t, n) {
    var r = lf(n)
    if (Uh(n) !== 'LineString') throw new Error('line must be a LineString')
    var l = Rs(n, e),
        o = Rs(n, t),
        i
    l.properties.index <= o.properties.index ? (i = [l, o]) : (i = [o, l])
    for (var u = [i[0].geometry.coordinates], s = i[0].properties.index + 1; s < i[1].properties.index + 1; s++)
        u.push(r[s])
    return (u.push(i[1].geometry.coordinates), rf(u, n.properties))
}
var nm = tm
const rm = e => {
        const t = e.properties,
            n = e.geometry.coordinates,
            r = n[0],
            l = n[n.length - 1],
            o = `${r[0].toFixed(6)},${r[1].toFixed(6)}-${l[0].toFixed(6)},${l[1].toFixed(6)}`
        return `${JSON.stringify(t)}/${o}`
    },
    Os = e => it[e] || '#999999',
    js = e => {
        var n
        if (!((n = e == null ? void 0 : e.geometry) != null && n.coordinates)) return null
        const t = e.geometry.coordinates
        return { ...e, geometry: { ...e.geometry, coordinates: t.length > 2 ? [t[0], t[1]] : t } }
    },
    lm = (e, t, n) =>
        t <= n
            ? { type: 'Feature', geometry: { type: 'Point', coordinates: e.geometry.coordinates[0] }, properties: {} }
            : uf(e, t, { units: 'kilometers' }),
    om = (e, t, n, r) => {
        if (t >= n - r) {
            const l = e.geometry.coordinates
            return { type: 'Feature', geometry: { type: 'Point', coordinates: l[l.length - 1] }, properties: {} }
        }
        return uf(e, t, { units: 'kilometers' })
    },
    im = (e, t, n, r, l, o) => {
        const i = u => (
            console.error('Error creating segment:', u, {
                startDistanceKm: n,
                endDistanceKm: r,
                totalGeographicLengthKm: l,
            }),
            {
                type: 'Feature',
                geometry: { type: 'LineString', coordinates: [] },
                properties: { color: Os(t.type), type: t.type, length: t.length },
            }
        )
        try {
            const u = lm(e, n, o),
                s = om(e, r, l, o),
                a = js(u),
                m = js(s)
            if (!a || !m) throw new Error(`Point normalization failed: startPoint=${!!a}, endPoint=${!!m}`)
            return {
                type: 'Feature',
                geometry: nm(a, m, e).geometry,
                properties: { color: Os(t.type), type: t.type, length: t.length },
            }
        } catch (u) {
            return i(u)
        }
    },
    um = (e, t, n) => {
        if (!(e != null && e.geometry) || e.geometry.type !== 'LineString' || !(t != null && t.length))
            return { type: 'FeatureCollection', features: [] }
        const r = cf(e),
            l = 1e-6
        let o = 0
        return {
            type: 'FeatureCollection',
            features: t
                .map(u => {
                    const s = o / n,
                        a = (o + u.length) / n,
                        m = s * r,
                        h = a * r
                    return ((o += u.length), im(e, u, m, h, r, l))
                })
                .filter(u => u.geometry.coordinates.length >= 2),
        }
    },
    sm = () => ({ type: 'geojson', data: 'https://data.sfgov.org/resource/pep9-66vw.geojson?$limit=50000' }),
    am = () => ({
        id: 'sf-blockfaces',
        type: 'line',
        source: 'sf-blockfaces-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#888888', 'line-width': 4, 'line-opacity': 0.8 },
    }),
    cm = e => ({ type: 'geojson', data: { type: 'Feature', geometry: e.geometry, properties: e.properties } }),
    fm = () => ({
        id: 'highlighted-blockface',
        type: 'line',
        source: 'highlighted-blockface-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#ff0000', 'line-width': 4, 'line-opacity': 0.8 },
    }),
    mi = e => {
        try {
            ;(e.getLayer('highlighted-blockface') && e.removeLayer('highlighted-blockface'),
                e.getSource('highlighted-blockface-source') && e.removeSource('highlighted-blockface-source'))
        } catch {}
    },
    dm = (e, t) => {
        ;(e.addSource('highlighted-blockface-source', cm(t)), e.addLayer(fm()))
    },
    pm = (e, t) => {
        e && (mi(e), dm(e, t))
    },
    hm = e => {
        const t = cf(e)
        return Math.round(t * 3280.84)
    },
    mm = e => {
        ;(e.on('mouseenter', 'sf-blockfaces', () => (e.getCanvas().style.cursor = 'crosshair')),
            e.on('mouseleave', 'sf-blockfaces', () => (e.getCanvas().style.cursor = '')))
    },
    gm = (e, t) => n => {
        const r = e.queryRenderedFeatures(n.point, { layers: ['sf-blockfaces'] })
        if (r.length === 0) return
        const l = r[0],
            o = rm(l),
            i = hm(l)
        t.current && t.current({ id: o, feature: l, length: i })
    },
    vm = (e, t) => n => {
        n.sourceId !== 'sf-blockfaces-source' ||
            !n.isSourceLoaded ||
            e.getLayer('sf-blockfaces') ||
            (e.addLayer(am()), mm(e), e.on('click', 'sf-blockfaces', gm(e, t)))
    },
    ym = (e, t) => {
        ;(e.addSource('sf-blockfaces-source', sm()), e.on('sourcedata', vm(e, t)))
    },
    wm = e => {
        e.getSource('segmented-highlight-source') ||
            (e.addSource('segmented-highlight-source', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] },
            }),
            e.addLayer({
                id: 'segmented-highlight',
                type: 'line',
                source: 'segmented-highlight-source',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: { 'line-color': ['get', 'color'], 'line-width': 10, 'line-opacity': 0.9 },
            }))
    },
    Sm = (e, t, n, r) => {
        const l = e.getSource('segmented-highlight-source')
        if (l) {
            if (t && n != null && n.length) {
                const o = um(t, n, r || 240)
                ;(l.setData(o), mi(e))
                return
            }
            if (t) {
                ;(l.setData({ type: 'FeatureCollection', features: [] }), pm(e, t))
                return
            }
            ;(l.setData({ type: 'FeatureCollection', features: [] }), mi(e))
        }
    },
    km = ({
        accessToken: e = 'your-mapbox-token-here',
        onBlockfaceSelect: t,
        selectedBlockface: n,
        currentSegments: r,
    }) => {
        const l = z.useRef(null),
            o = z.useRef(null),
            i = z.useRef(t)
        return (
            (i.current = t),
            z.useEffect(() => {
                o.current ||
                    ((o.current = new mapboxgl.Map({
                        container: l.current,
                        style: 'mapbox://styles/mapbox/streets-v11',
                        center: [-122.4194, 37.7749],
                        zoom: 16,
                        accessToken: e,
                        collectResourceTiming: !1,
                    })),
                    o.current.on('load', () => ym(o.current, i)))
            }, [e]),
            z.useEffect(() => {
                var u
                ;(u = o.current) != null && u.isStyleLoaded() && wm(o.current)
            }, [o.current]),
            z.useEffect(() => {
                var u
                ;(u = o.current) != null &&
                    u.isStyleLoaded() &&
                    Sm(o.current, n == null ? void 0 : n.feature, r, n == null ? void 0 : n.length)
            }, [n == null ? void 0 : n.feature, n == null ? void 0 : n.id, r]),
            S.jsx('div', {
                ref: l,
                style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 },
            })
        )
    },
    ff = e => {
        if (e.touches && e.touches.length > 0) {
            const t = e.touches[0]
            return { x: t.clientX, y: t.clientY }
        }
        return { x: e.clientX, y: e.clientY }
    },
    Em = e => e.type.startsWith('touch'),
    Is = e => ff(e).y,
    Fs = e => ff(e),
    xm = e => t => (Em(t) && t.preventDefault(), e(t)),
    Cm = {
        START: { mouse: 'mousedown', touch: 'touchstart' },
        MOVE: { mouse: 'mousemove', touch: 'touchmove' },
        END: { mouse: 'mouseup', touch: 'touchend' },
    },
    _l = (e, t, n, r = {}) => {
        const { mouse: l, touch: o } = Cm[t],
            i = xm(n)
        return (
            e.addEventListener(l, i, r),
            e.addEventListener(o, i, r),
            () => {
                ;(e.removeEventListener(l, i, r), e.removeEventListener(o, i, r))
            }
        )
    },
    _m = () => {
        const e = new Set()
        return {
            startDrag: (t, n) => {
                const r = _l(window, 'MOVE', t, { passive: !1 }),
                    o = _l(window, 'END', () => {
                        ;(n(), i())
                    }),
                    i = () => {
                        ;(r(), o(), e.delete(i))
                    }
                return (e.add(i), i)
            },
            cleanup: () => {
                ;(e.forEach(t => t()), e.clear())
            },
        }
    },
    Nm = ({ segments: e, total: t, unknownRemaining: n, handleDirectDragStart: r }) => {
        const l = o => {
            if ((o >= e.length && n <= 0) || (o >= e.length - 1 && n <= 0)) return null
            const u = {
                position: 'absolute',
                top: `${e.slice(0, o + 1).reduce((s, a) => s + (a.length / t) * 100, 0)}%`,
                transform: 'translateY(-50%)',
                left: 0,
                width: '100%',
                height: '40px',
                cursor: 'row-resize',
                touchAction: 'none',
            }
            return S.jsx(
                'div',
                {
                    className: 'divider',
                    style: u,
                    onMouseDown: s => r(s, o),
                    onTouchStart: s => r(s, o),
                    children: S.jsx('div', {
                        style: {
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            borderRadius: '2px',
                        },
                    }),
                },
                `divider-${o}-${e.length}`,
            )
        }
        return S.jsxs(S.Fragment, { children: [e.map((o, i) => l(i)), n > 0 && e.length > 0 && l(e.length - 1)] })
    },
    Pm = ({
        segments: e,
        onSwap: t,
        draggingIndex: n,
        setDraggingIndex: r,
        dragPreviewPos: l,
        setDragPreviewPos: o,
        containerRef: i,
    }) => {
        const u = z.useRef({}),
            s = w => (C, x) => {
                const _ = [...e],
                    [O] = _.splice(C, 1)
                ;(_.splice(x, 0, O), w(_))
            },
            a = (w, C, x) => _ => {
                if (_.target.classList.contains('divider')) {
                    _.preventDefault()
                    return
                }
                ;((w.current = { index: x }), C(x), (_.dataTransfer.effectAllowed = 'move'))
            },
            m = (w, C, x, _) => O => {
                if (O.target.classList.contains('divider')) return
                const P = w.current.index,
                    R = _
                ;(C(null), P !== void 0 && P !== R && x(P, R))
            },
            h = (w, C, x, _, O) => P => {
                var A
                if (P.target.classList.contains('divider')) return
                const R = Fs(P),
                    X = (A = _.current) == null ? void 0 : A.getBoundingClientRect()
                if (!X) return
                const Le = P.target.getBoundingClientRect(),
                    Fe = R.x - Le.left,
                    j = R.y - Le.top
                ;((w.current = { index: x, startY: R.y, startX: R.x, isDragging: !0, offsetX: Fe, offsetY: j }),
                    C(x),
                    O({ x: R.x - X.left - Fe, y: R.y - X.top - j }))
            },
            d = (w, C, x) => {
                if (!w.classList.contains('segment')) return !1
                const _ = w.offsetHeight
                return C >= x && C <= x + _
            },
            g = (w, C, x) =>
                w.classList.contains('segment') ? (d(w, C, x.value) ? !0 : ((x.value += w.offsetHeight), !1)) : !1,
            v = (w, C) => {
                const x = Array.from(w.children),
                    _ = { value: 0 }
                return x.findIndex(O => g(O, C, _))
            },
            k = w => {
                if (u.current.index === void 0) return
                const C = Fs(w),
                    x = i.current
                if (!x) return
                const _ = x.getBoundingClientRect(),
                    O = C.y - _.top
                ;(o({ x: C.x - _.left - u.current.offsetX, y: C.y - _.top - u.current.offsetY }),
                    (u.current.targetIndex = v(x, O)))
            },
            N = w => {
                if (u.current.index === void 0) return
                const C = u.current.index,
                    x = u.current.targetIndex !== void 0 ? u.current.targetIndex : C
                ;(C !== void 0 && C !== x && c(C, x), r(null), o({ x: 0, y: 0 }), (u.current = {}))
            },
            f = () => ({ handleTouchMove: k, handleTouchEnd: N }),
            c = s(t)
        return {
            getDragStartHandler: w => a(u, r, w),
            getDropHandler: w => m(u, r, c, w),
            getUnifiedStartHandler: w => h(u, r, w, i, o),
            getGlobalTouchHandlers: () => f(),
            findSegmentUnderTouch: v,
            isSegmentUnderTouch: d,
        }
    },
    Tm = (e, t) => !(e.bottom < t.top || e.top > t.bottom),
    Lm = (e, t, n, r) => {
        if (!t) return [...e, 0]
        const l = Om(r, e, t, n, Tm)
        return [...e, l]
    },
    Mm = e => e.map(n => (n == null ? void 0 : n.getBoundingClientRect())).reduce(Lm, []),
    zm = e => e && (e.style.width = 'auto'),
    Rm = (e, t, n) => e && (e.style.width = n[t] || 'auto'),
    Dm = (e, t, n, r, l) => e.some((o, i) => o && t[i] === l && r(n, o)),
    Om = (e, t, n, r, l) => {
        const o = e.slice(0, r),
            i = s => Dm(o, t, n, l, s)
        return Array.from({ length: r + 1 }, (s, a) => a).find(s => !i(s)) ?? r
    },
    jm = e => {
        const t = e.map(r => (r == null ? void 0 : r.style.width))
        e.forEach(zm)
        const n = e.reduce((r, l) => (l ? Math.max(r, l.offsetWidth) : r), 0)
        return (e.forEach((r, l) => Rm(r, l, t)), n)
    },
    Im = e => {
        const t = Mm(e),
            r = jm(e) - 1,
            l = r - 10
        return { positions: t.map(i => i * r), uniformWidth: r, contentWidth: l }
    },
    Fm = (e, t) => Im(t),
    Am = ({
        segments: e,
        tickPoints: t,
        total: n,
        effectiveBlockfaceLength: r,
        editingIndex: l,
        setEditingIndex: o,
        handleChangeType: i,
        handleAddLeft: u,
    }) => {
        const s = z.useRef([]),
            [a, m] = z.useState([]),
            [h, d] = z.useState(0),
            g = () => {
                const { positions: N, contentWidth: f } = Fm(!0, s.current)
                ;(m(N), d(f))
            },
            v = () => {
                const N = setTimeout(g, 0)
                return () => clearTimeout(N)
            }
        z.useEffect(v, [e, t, n])
        const k = (N, f) => {
            const p = ((t[f] + N.length / 2) / n) * 100,
                y = Vt((N.length / n) * r),
                w = {
                    backgroundColor: it[N.type] || '#999',
                    top: `${p}%`,
                    left: `${a[f] || 0}px`,
                    transform: 'translateY(-50%)',
                    width: h > 0 ? `${h}px` : 'auto',
                },
                C = R => {
                    ;(R.stopPropagation(), o(l === f ? null : f))
                },
                x = (R, X) => {
                    ;(R.stopPropagation(), i(f, X))
                },
                _ = R => {
                    ;(R.stopPropagation(), u(f))
                },
                O = R =>
                    S.jsx(
                        'div',
                        {
                            className: 'dropdown-item',
                            style: { backgroundColor: it[R] },
                            onClick: X => x(X, R),
                            children: R,
                        },
                        R,
                    ),
                P =
                    l === f
                        ? S.jsxs(S.Fragment, {
                              children: [
                                  S.jsxs('span', { children: [N.type, ' ', y] }),
                                  S.jsxs('div', {
                                      className: 'dropdown',
                                      children: [
                                          Object.keys(it).map(O),
                                          S.jsx('div', {
                                              className: 'dropdown-item',
                                              style: { backgroundColor: 'red', textAlign: 'center', marginTop: '10px' },
                                              onClick: _,
                                              children: '+ Add left',
                                          }),
                                      ],
                                  }),
                              ],
                          })
                        : `${N.type} ${y}`
            return S.jsx(
                'div',
                { className: 'floating-label', style: w, ref: R => (s.current[f] = R), onClick: C, children: P },
                `label-${N.id}`,
            )
        }
        return S.jsx('div', { className: 'label-layer', children: e.map(k) })
    },
    Um = (e, t) => {
        if (e <= 0) return null
        const r = {
            backgroundColor: '#f0f0f0',
            border: '2px dashed #ccc',
            boxSizing: 'border-box',
            height: `${(e / t) * 100}%`,
            width: '100%',
        }
        return S.jsx('div', { className: 'unknown-space', style: r }, 'unknown-space')
    },
    $m = (e, t, n, r, l, o, i) => {
        const u = (e.length / r) * 100,
            s = l === t,
            a = { backgroundColor: it[e.type] || '#999', boxSizing: 'border-box', height: `${u}%`, width: '100%' }
        return S.jsx(
            'div',
            {
                className: `segment${s ? ' dragging' : ''}`,
                style: a,
                draggable: !0,
                onDragStart: o.getDragStartHandler(t),
                onDragOver: m => m.preventDefault(),
                onDrop: o.getDropHandler(t),
                onDragEnd: () => i(null),
                onMouseDown: o.getUnifiedStartHandler(t),
                onTouchStart: o.getUnifiedStartHandler(t),
            },
            e.id,
        )
    },
    Vm = ({ segments: e, total: t, unknownRemaining: n, draggingIndex: r, dragDropHandler: l, setDraggingIndex: o }) =>
        S.jsxs(S.Fragment, { children: [e.map((i, u) => $m(i, u, e, t, r, l, o)), Um(n, t)] }),
    Hm = ({ blockfaceLength: e = 240 }) => {
        const t = fu(),
            n = He(xr) || [],
            r = He(du),
            l = He(pu) || 0,
            o = r || e,
            i = (j, A) => (W, T) => {
                const M = [...n]
                ;((M[W] = { ...M[W], type: T }), j(M), A(null))
            },
            u = (j, A, W) => {
                const T = Vt((j / W) * o),
                    D = { top: `${(j / W) * 100}%` }
                return S.jsx('div', { className: 'tick', style: D, children: T }, `tick-${A}`)
            },
            s = (j, A, W, T) => {
                if (j === null) return null
                const M = W[j],
                    D = (M.length / T) * 100,
                    $ = {
                        position: 'absolute',
                        left: `${A.x}px`,
                        top: `${A.y}px`,
                        backgroundColor: it[M.type] || '#999',
                        border: '2px solid rgba(255, 255, 255, 0.8)',
                        borderRadius: '6px',
                        opacity: 0.9,
                        zIndex: 200,
                        pointerEvents: 'none',
                        transform: 'scale(1.08)',
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
                        filter: 'brightness(1.1)',
                        width: '80px',
                        height: `${D}%`,
                    }
                return S.jsx('div', { className: 'drag-preview', style: $ })
            },
            a = () => {
                const j = N.current
                if (!j) return
                const { handleTouchMove: A, handleTouchEnd: W } = f.getGlobalTouchHandlers(),
                    T = _l(j, 'MOVE', A, { passive: !1 }),
                    M = _l(j, 'END', W)
                return () => {
                    ;(T(), M())
                }
            },
            [m, h] = z.useState(null),
            [d, g] = z.useState(null),
            [v, k] = z.useState({ x: 0, y: 0 }),
            N = z.useRef(null),
            f = Pm({
                segments: n,
                onSwap: j => t(Ns(j)),
                draggingIndex: m,
                setDraggingIndex: h,
                dragPreviewPos: v,
                setDragPreviewPos: k,
                containerRef: N,
            }),
            c = o,
            p = z.useRef({ isDragging: !1, startCoord: null, startLength: null, index: null }),
            y = (j, A, W, T) => {
                if (W[j] && !(A <= 0) && !(A >= 1))
                    try {
                        T(pi(j, p.current.startLength + A))
                    } catch (D) {
                        console.warn('Invalid segment adjustment:', D.message)
                    }
            },
            w = (j, A, W, T, M) => D => {
                if (!p.current.isDragging) return
                const q = Is(D) - p.current.startCoord
                if (!N.current) return
                const qe = N.current.offsetHeight / A,
                    Mn = q / qe,
                    Qe = ft(p.current.startLength + Mn)
                if (Qe < 0.1) {
                    y(j, T, M, W)
                    return
                }
                try {
                    W(pi(j, Qe))
                } catch (qt) {
                    console.warn('Invalid segment adjustment:', qt.message)
                }
            },
            C = () => (p.current = { isDragging: !1, startCoord: null, startLength: null, index: null }),
            x = (j, A) => {
                ;(j.preventDefault(), j.stopPropagation())
                const W = n[A]
                if (!W) return
                const T = Is(j)
                p.current = { isDragging: !0, startCoord: T, startLength: W.length, index: A }
                const M = _m(),
                    D = w(A, c, t, l, n),
                    $ = () => {
                        ;(C(), M.cleanup())
                    }
                M.startDrag(D, $)
            },
            _ = z.useCallback(x, [n, c, t, l]),
            O = i(j => t(Ns(j)), g),
            P = j => {
                ;(t(_h(j)), g(null))
            },
            R = z.useCallback(P, [t]),
            X = He(Th)
        z.useEffect(() => a(), [f])
        const Le = 'segment-container vertical',
            Fe = (j, A, W) =>
                S.jsxs('div', {
                    className: 'segment-controls-bottom',
                    children: [
                        S.jsxs('div', { className: 'remaining-space-info', children: ['Remaining: ', Vt(j), ' ft'] }),
                        S.jsxs('div', {
                            className: 'add-buttons-container',
                            children: [
                                A === 0 &&
                                    j > 0 &&
                                    S.jsx('button', {
                                        className: 'add-segment-button',
                                        onClick: () => W(hi(0)),
                                        children: '+ Add First Segment',
                                    }),
                                A > 0 &&
                                    j > 0 &&
                                    S.jsx('button', {
                                        className: 'add-segment-button',
                                        onClick: () => W(hi(A)),
                                        children: '+ Add Segment',
                                    }),
                            ],
                        }),
                    ],
                })
        return S.jsx(S.Fragment, {
            children: S.jsxs('div', {
                id: 'editor-wrapper',
                children: [
                    S.jsxs('div', {
                        className: Le,
                        ref: N,
                        children: [
                            S.jsx(Vm, {
                                segments: n,
                                total: c,
                                unknownRemaining: l,
                                draggingIndex: m,
                                dragDropHandler: f,
                                setDraggingIndex: h,
                            }),
                            S.jsx(Nm, { segments: n, total: c, unknownRemaining: l, handleDirectDragStart: _ }),
                            s(m, v, n, c),
                        ],
                    }),
                    S.jsx(Am, {
                        segments: n,
                        tickPoints: X,
                        total: c,
                        effectiveBlockfaceLength: o,
                        editingIndex: d,
                        setEditingIndex: g,
                        handleChangeType: O,
                        handleAddLeft: R,
                    }),
                    S.jsx('div', { className: 'ruler', children: X.map((j, A) => u(j, A, c)) }),
                    Fe(l, n.length, t),
                ],
            }),
        })
    }
function ae(e) {
    return `Minified Redux error #${e}; visit https://redux.js.org/Errors?code=${e} for the full message or use the non-minified dev environment for full errors. `
}
var Bm = (typeof Symbol == 'function' && Symbol.observable) || '@@observable',
    As = Bm,
    wo = () => Math.random().toString(36).substring(7).split('').join('.'),
    Wm = {
        INIT: `@@redux/INIT${wo()}`,
        REPLACE: `@@redux/REPLACE${wo()}`,
        PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${wo()}`,
    },
    Nl = Wm
function Gm(e) {
    if (typeof e != 'object' || e === null) return !1
    let t = e
    for (; Object.getPrototypeOf(t) !== null; ) t = Object.getPrototypeOf(t)
    return Object.getPrototypeOf(e) === t || Object.getPrototypeOf(e) === null
}
function df(e, t, n) {
    if (typeof e != 'function') throw new Error(ae(2))
    if (
        (typeof t == 'function' && typeof n == 'function') ||
        (typeof n == 'function' && typeof arguments[3] == 'function')
    )
        throw new Error(ae(0))
    if ((typeof t == 'function' && typeof n > 'u' && ((n = t), (t = void 0)), typeof n < 'u')) {
        if (typeof n != 'function') throw new Error(ae(1))
        return n(df)(e, t)
    }
    let r = e,
        l = t,
        o = new Map(),
        i = o,
        u = 0,
        s = !1
    function a() {
        i === o &&
            ((i = new Map()),
            o.forEach((N, f) => {
                i.set(f, N)
            }))
    }
    function m() {
        if (s) throw new Error(ae(3))
        return l
    }
    function h(N) {
        if (typeof N != 'function') throw new Error(ae(4))
        if (s) throw new Error(ae(5))
        let f = !0
        a()
        const c = u++
        return (
            i.set(c, N),
            function () {
                if (f) {
                    if (s) throw new Error(ae(6))
                    ;((f = !1), a(), i.delete(c), (o = null))
                }
            }
        )
    }
    function d(N) {
        if (!Gm(N)) throw new Error(ae(7))
        if (typeof N.type > 'u') throw new Error(ae(8))
        if (typeof N.type != 'string') throw new Error(ae(17))
        if (s) throw new Error(ae(9))
        try {
            ;((s = !0), (l = r(l, N)))
        } finally {
            s = !1
        }
        return (
            (o = i).forEach(c => {
                c()
            }),
            N
        )
    }
    function g(N) {
        if (typeof N != 'function') throw new Error(ae(10))
        ;((r = N), d({ type: Nl.REPLACE }))
    }
    function v() {
        const N = h
        return {
            subscribe(f) {
                if (typeof f != 'object' || f === null) throw new Error(ae(11))
                function c() {
                    const y = f
                    y.next && y.next(m())
                }
                return (c(), { unsubscribe: N(c) })
            },
            [As]() {
                return this
            },
        }
    }
    return (d({ type: Nl.INIT }), { dispatch: d, subscribe: h, getState: m, replaceReducer: g, [As]: v })
}
function Qm(e) {
    Object.keys(e).forEach(t => {
        const n = e[t]
        if (typeof n(void 0, { type: Nl.INIT }) > 'u') throw new Error(ae(12))
        if (typeof n(void 0, { type: Nl.PROBE_UNKNOWN_ACTION() }) > 'u') throw new Error(ae(13))
    })
}
function Km(e) {
    const t = Object.keys(e),
        n = {}
    for (let o = 0; o < t.length; o++) {
        const i = t[o]
        typeof e[i] == 'function' && (n[i] = e[i])
    }
    const r = Object.keys(n)
    let l
    try {
        Qm(n)
    } catch (o) {
        l = o
    }
    return function (i = {}, u) {
        if (l) throw l
        let s = !1
        const a = {}
        for (let m = 0; m < r.length; m++) {
            const h = r[m],
                d = n[h],
                g = i[h],
                v = d(g, u)
            if (typeof v > 'u') throw (u && u.type, new Error(ae(14)))
            ;((a[h] = v), (s = s || v !== g))
        }
        return ((s = s || r.length !== Object.keys(i).length), s ? a : i)
    }
}
const Ym = Km({ curb: Nh }),
    Xm = df(Ym, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()),
    Zm = 'pk.eyJ1IjoiZ3JhZmZpbyIsImEiOiJjbWRkZ3lkNjkwNG9xMmpuYmt4bHd2YTVvIn0.lzlmjq8mnXOSKB18lKLBpg',
    Jm = () => {
        const e = fu(),
            t = He(xr),
            n = He(du),
            [r, l] = z.useState(null),
            [o, i] = z.useState(!1),
            [u, s] = z.useState(!1),
            a = z.useCallback(
                d => {
                    ;(console.log('Selected blockface:', d), l(d), i(!0), e(xh(d.length, d.id)))
                },
                [e],
            ),
            m = z.useCallback(() => {
                i(!1)
            }, []),
            h = z.useCallback(() => {
                s(d => !d)
            }, [])
        return S.jsxs('div', {
            style: { position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' },
            children: [
                S.jsx('h1', {
                    style: {
                        position: 'absolute',
                        top: '1rem',
                        left: '2rem',
                        zIndex: 5,
                        margin: 0,
                        color: 'white',
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                        fontSize: '28px',
                        fontWeight: 'bold',
                    },
                    children: 'Row Canvas',
                }),
                S.jsx(km, {
                    accessToken: Zm,
                    onBlockfaceSelect: a,
                    selectedBlockface: r,
                    currentSegments: Array.isArray(t) ? t : [],
                }),
                S.jsx('div', {
                    style: {
                        position: 'absolute',
                        top: 0,
                        right: o ? '0' : '-450px',
                        width: '450px',
                        height: '100vh',
                        backgroundColor: 'white',
                        boxShadow: o ? '-4px 0 20px rgba(0,0,0,0.15)' : 'none',
                        transition: 'right 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        zIndex: 10,
                        pointerEvents: o ? 'auto' : 'none',
                        borderLeft: '1px solid #e0e0e0',
                    },
                    children:
                        o &&
                        S.jsxs('div', {
                            style: {
                                padding: '24px',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                            },
                            children: [
                                S.jsxs('div', {
                                    style: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '24px',
                                        borderBottom: '2px solid #f0f0f0',
                                        paddingBottom: '16px',
                                    },
                                    children: [
                                        S.jsxs('h2', {
                                            style: { margin: 0, color: '#333', fontSize: '20px', fontWeight: '600' },
                                            children: [
                                                'Edit Blockface (',
                                                (r == null ? void 0 : r.length) || 0,
                                                ' ft)',
                                            ],
                                        }),
                                        S.jsx('button', {
                                            onClick: m,
                                            style: {
                                                background: 'none',
                                                border: 'none',
                                                fontSize: '28px',
                                                cursor: 'pointer',
                                                padding: '4px',
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '18px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#666',
                                                transition: 'background-color 0.2s, color 0.2s',
                                            },
                                            onMouseEnter: d => {
                                                ;((d.target.style.backgroundColor = '#f0f0f0'),
                                                    (d.target.style.color = '#333'))
                                            },
                                            onMouseLeave: d => {
                                                ;((d.target.style.backgroundColor = 'transparent'),
                                                    (d.target.style.color = '#666'))
                                            },
                                            children: '×',
                                        }),
                                    ],
                                }),
                                r &&
                                    S.jsx('div', {
                                        style: {
                                            marginBottom: '16px',
                                            padding: '12px',
                                            backgroundColor: '#f8f9fa',
                                            borderRadius: '6px',
                                        },
                                        children: S.jsxs('label', {
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                            },
                                            children: [
                                                S.jsx('input', {
                                                    type: 'checkbox',
                                                    checked: u,
                                                    onChange: h,
                                                    style: { marginRight: '8px' },
                                                }),
                                                'Show Table View (for field data collection)',
                                            ],
                                        }),
                                    }),
                                S.jsx('div', {
                                    style: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 },
                                    children:
                                        r &&
                                        (u
                                            ? S.jsx('div', {
                                                  style: { flex: 1, overflow: 'auto' },
                                                  children: S.jsx(jh, { blockfaceLength: n }),
                                              })
                                            : S.jsx(Hm, { blockfaceLength: n, blockfaceId: r.id })),
                                }),
                            ],
                        }),
                }),
            ],
        })
    }
So.createRoot(document.getElementById('root')).render(S.jsx(lh, { store: Xm, children: S.jsx(Jm, {}) }))
