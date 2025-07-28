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
var Ts = { exports: {} },
    Ml = {},
    Ms = { exports: {} },
    V = {}
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var _r = Symbol.for('react.element'),
    tf = Symbol.for('react.portal'),
    nf = Symbol.for('react.fragment'),
    rf = Symbol.for('react.strict_mode'),
    lf = Symbol.for('react.profiler'),
    of = Symbol.for('react.provider'),
    uf = Symbol.for('react.context'),
    sf = Symbol.for('react.forward_ref'),
    af = Symbol.for('react.suspense'),
    cf = Symbol.for('react.memo'),
    ff = Symbol.for('react.lazy'),
    du = Symbol.iterator
function df(e) {
    return e === null || typeof e != 'object'
        ? null
        : ((e = (du && e[du]) || e['@@iterator']), typeof e == 'function' ? e : null)
}
var Rs = {
        isMounted: function () {
            return !1
        },
        enqueueForceUpdate: function () {},
        enqueueReplaceState: function () {},
        enqueueSetState: function () {},
    },
    js = Object.assign,
    Os = {}
function In(e, t, n) {
    ;((this.props = e), (this.context = t), (this.refs = Os), (this.updater = n || Rs))
}
In.prototype.isReactComponent = {}
In.prototype.setState = function (e, t) {
    if (typeof e != 'object' && typeof e != 'function' && e != null)
        throw Error(
            'setState(...): takes an object of state variables to update or a function which returns an object of state variables.',
        )
    this.updater.enqueueSetState(this, e, t, 'setState')
}
In.prototype.forceUpdate = function (e) {
    this.updater.enqueueForceUpdate(this, e, 'forceUpdate')
}
function Ds() {}
Ds.prototype = In.prototype
function vi(e, t, n) {
    ;((this.props = e), (this.context = t), (this.refs = Os), (this.updater = n || Rs))
}
var yi = (vi.prototype = new Ds())
yi.constructor = vi
js(yi, In.prototype)
yi.isPureReactComponent = !0
var pu = Array.isArray,
    Is = Object.prototype.hasOwnProperty,
    wi = { current: null },
    Fs = { key: !0, ref: !0, __self: !0, __source: !0 }
function $s(e, t, n) {
    var r,
        l = {},
        o = null,
        i = null
    if (t != null)
        for (r in (t.ref !== void 0 && (i = t.ref), t.key !== void 0 && (o = '' + t.key), t))
            Is.call(t, r) && !Fs.hasOwnProperty(r) && (l[r] = t[r])
    var u = arguments.length - 2
    if (u === 1) l.children = n
    else if (1 < u) {
        for (var s = Array(u), a = 0; a < u; a++) s[a] = arguments[a + 2]
        l.children = s
    }
    if (e && e.defaultProps) for (r in ((u = e.defaultProps), u)) l[r] === void 0 && (l[r] = u[r])
    return { $$typeof: _r, type: e, key: o, ref: i, props: l, _owner: wi.current }
}
function pf(e, t) {
    return { $$typeof: _r, type: e.type, key: t, ref: e.ref, props: e.props, _owner: e._owner }
}
function Si(e) {
    return typeof e == 'object' && e !== null && e.$$typeof === _r
}
function hf(e) {
    var t = { '=': '=0', ':': '=2' }
    return (
        '$' +
        e.replace(/[=:]/g, function (n) {
            return t[n]
        })
    )
}
var hu = /\/+/g
function Gl(e, t) {
    return typeof e == 'object' && e !== null && e.key != null ? hf('' + e.key) : t.toString(36)
}
function Gr(e, t, n, r, l) {
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
                    case _r:
                    case tf:
                        i = !0
                }
        }
    if (i)
        return (
            (i = e),
            (l = l(i)),
            (e = r === '' ? '.' + Gl(i, 0) : r),
            pu(l)
                ? ((n = ''),
                  e != null && (n = e.replace(hu, '$&/') + '/'),
                  Gr(l, t, n, '', function (a) {
                      return a
                  }))
                : l != null &&
                  (Si(l) &&
                      (l = pf(
                          l,
                          n + (!l.key || (i && i.key === l.key) ? '' : ('' + l.key).replace(hu, '$&/') + '/') + e,
                      )),
                  t.push(l)),
            1
        )
    if (((i = 0), (r = r === '' ? '.' : r + ':'), pu(e)))
        for (var u = 0; u < e.length; u++) {
            o = e[u]
            var s = r + Gl(o, u)
            i += Gr(o, t, n, s, l)
        }
    else if (((s = df(e)), typeof s == 'function'))
        for (e = s.call(e), u = 0; !(o = e.next()).done; )
            ((o = o.value), (s = r + Gl(o, u++)), (i += Gr(o, t, n, s, l)))
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
function Mr(e, t, n) {
    if (e == null) return e
    var r = [],
        l = 0
    return (
        Gr(e, r, '', '', function (o) {
            return t.call(n, o, l++)
        }),
        r
    )
}
function mf(e) {
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
var xe = { current: null },
    Xr = { transition: null },
    gf = { ReactCurrentDispatcher: xe, ReactCurrentBatchConfig: Xr, ReactCurrentOwner: wi }
function Us() {
    throw Error('act(...) is not supported in production builds of React.')
}
V.Children = {
    map: Mr,
    forEach: function (e, t, n) {
        Mr(
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
            Mr(e, function () {
                t++
            }),
            t
        )
    },
    toArray: function (e) {
        return (
            Mr(e, function (t) {
                return t
            }) || []
        )
    },
    only: function (e) {
        if (!Si(e)) throw Error('React.Children.only expected to receive a single React element child.')
        return e
    },
}
V.Component = In
V.Fragment = nf
V.Profiler = lf
V.PureComponent = vi
V.StrictMode = rf
V.Suspense = af
V.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = gf
V.act = Us
V.cloneElement = function (e, t, n) {
    if (e == null)
        throw Error('React.cloneElement(...): The argument must be a React element, but you passed ' + e + '.')
    var r = js({}, e.props),
        l = e.key,
        o = e.ref,
        i = e._owner
    if (t != null) {
        if (
            (t.ref !== void 0 && ((o = t.ref), (i = wi.current)),
            t.key !== void 0 && (l = '' + t.key),
            e.type && e.type.defaultProps)
        )
            var u = e.type.defaultProps
        for (s in t) Is.call(t, s) && !Fs.hasOwnProperty(s) && (r[s] = t[s] === void 0 && u !== void 0 ? u[s] : t[s])
    }
    var s = arguments.length - 2
    if (s === 1) r.children = n
    else if (1 < s) {
        u = Array(s)
        for (var a = 0; a < s; a++) u[a] = arguments[a + 2]
        r.children = u
    }
    return { $$typeof: _r, type: e.type, key: l, ref: o, props: r, _owner: i }
}
V.createContext = function (e) {
    return (
        (e = {
            $$typeof: uf,
            _currentValue: e,
            _currentValue2: e,
            _threadCount: 0,
            Provider: null,
            Consumer: null,
            _defaultValue: null,
            _globalName: null,
        }),
        (e.Provider = { $$typeof: of, _context: e }),
        (e.Consumer = e)
    )
}
V.createElement = $s
V.createFactory = function (e) {
    var t = $s.bind(null, e)
    return ((t.type = e), t)
}
V.createRef = function () {
    return { current: null }
}
V.forwardRef = function (e) {
    return { $$typeof: sf, render: e }
}
V.isValidElement = Si
V.lazy = function (e) {
    return { $$typeof: ff, _payload: { _status: -1, _result: e }, _init: mf }
}
V.memo = function (e, t) {
    return { $$typeof: cf, type: e, compare: t === void 0 ? null : t }
}
V.startTransition = function (e) {
    var t = Xr.transition
    Xr.transition = {}
    try {
        e()
    } finally {
        Xr.transition = t
    }
}
V.unstable_act = Us
V.useCallback = function (e, t) {
    return xe.current.useCallback(e, t)
}
V.useContext = function (e) {
    return xe.current.useContext(e)
}
V.useDebugValue = function () {}
V.useDeferredValue = function (e) {
    return xe.current.useDeferredValue(e)
}
V.useEffect = function (e, t) {
    return xe.current.useEffect(e, t)
}
V.useId = function () {
    return xe.current.useId()
}
V.useImperativeHandle = function (e, t, n) {
    return xe.current.useImperativeHandle(e, t, n)
}
V.useInsertionEffect = function (e, t) {
    return xe.current.useInsertionEffect(e, t)
}
V.useLayoutEffect = function (e, t) {
    return xe.current.useLayoutEffect(e, t)
}
V.useMemo = function (e, t) {
    return xe.current.useMemo(e, t)
}
V.useReducer = function (e, t, n) {
    return xe.current.useReducer(e, t, n)
}
V.useRef = function (e) {
    return xe.current.useRef(e)
}
V.useState = function (e) {
    return xe.current.useState(e)
}
V.useSyncExternalStore = function (e, t, n) {
    return xe.current.useSyncExternalStore(e, t, n)
}
V.useTransition = function () {
    return xe.current.useTransition()
}
V.version = '18.3.1'
Ms.exports = V
var j = Ms.exports
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var vf = j,
    yf = Symbol.for('react.element'),
    wf = Symbol.for('react.fragment'),
    Sf = Object.prototype.hasOwnProperty,
    kf = vf.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
    xf = { key: !0, ref: !0, __self: !0, __source: !0 }
function As(e, t, n) {
    var r,
        l = {},
        o = null,
        i = null
    ;(n !== void 0 && (o = '' + n), t.key !== void 0 && (o = '' + t.key), t.ref !== void 0 && (i = t.ref))
    for (r in t) Sf.call(t, r) && !xf.hasOwnProperty(r) && (l[r] = t[r])
    if (e && e.defaultProps) for (r in ((t = e.defaultProps), t)) l[r] === void 0 && (l[r] = t[r])
    return { $$typeof: yf, type: e, key: o, ref: i, props: l, _owner: kf.current }
}
Ml.Fragment = wf
Ml.jsx = As
Ml.jsxs = As
Ts.exports = Ml
var E = Ts.exports,
    Eo = {},
    Vs = { exports: {} },
    Ie = {},
    Hs = { exports: {} },
    Bs = {}
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ ;(function (e) {
    function t(_, D) {
        var U = _.length
        _.push(D)
        e: for (; 0 < U; ) {
            var Z = (U - 1) >>> 1,
                ie = _[Z]
            if (0 < l(ie, D)) ((_[Z] = D), (_[U] = ie), (U = Z))
            else break e
        }
    }
    function n(_) {
        return _.length === 0 ? null : _[0]
    }
    function r(_) {
        if (_.length === 0) return null
        var D = _[0],
            U = _.pop()
        if (U !== D) {
            _[0] = U
            e: for (var Z = 0, ie = _.length, At = ie >>> 1; Z < At; ) {
                var lt = 2 * (Z + 1) - 1,
                    sn = _[lt],
                    Ce = lt + 1,
                    an = _[Ce]
                if (0 > l(sn, U))
                    Ce < ie && 0 > l(an, sn)
                        ? ((_[Z] = an), (_[Ce] = U), (Z = Ce))
                        : ((_[Z] = sn), (_[lt] = U), (Z = lt))
                else if (Ce < ie && 0 > l(an, U)) ((_[Z] = an), (_[Ce] = U), (Z = Ce))
                else break e
            }
        }
        return D
    }
    function l(_, D) {
        var U = _.sortIndex - D.sortIndex
        return U !== 0 ? U : _.id - D.id
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
        y = !1,
        S = !1,
        F = typeof setTimeout == 'function' ? setTimeout : null,
        f = typeof clearTimeout == 'function' ? clearTimeout : null,
        c = typeof setImmediate < 'u' ? setImmediate : null
    typeof navigator < 'u' &&
        navigator.scheduling !== void 0 &&
        navigator.scheduling.isInputPending !== void 0 &&
        navigator.scheduling.isInputPending.bind(navigator.scheduling)
    function p(_) {
        for (var D = n(a); D !== null; ) {
            if (D.callback === null) r(a)
            else if (D.startTime <= _) (r(a), (D.sortIndex = D.expirationTime), t(s, D))
            else break
            D = n(a)
        }
    }
    function v(_) {
        if (((S = !1), p(_), !y))
            if (n(s) !== null) ((y = !0), qe(x))
            else {
                var D = n(a)
                D !== null && Un(v, D.startTime - _)
            }
    }
    function x(_, D) {
        ;((y = !1), S && ((S = !1), f(M), (M = -1)), (g = !0))
        var U = d
        try {
            for (p(D), h = n(s); h !== null && (!(h.expirationTime > D) || (_ && !te())); ) {
                var Z = h.callback
                if (typeof Z == 'function') {
                    ;((h.callback = null), (d = h.priorityLevel))
                    var ie = Z(h.expirationTime <= D)
                    ;((D = e.unstable_now()), typeof ie == 'function' ? (h.callback = ie) : h === n(s) && r(s), p(D))
                } else r(s)
                h = n(s)
            }
            if (h !== null) var At = !0
            else {
                var lt = n(a)
                ;(lt !== null && Un(v, lt.startTime - D), (At = !1))
            }
            return At
        } finally {
            ;((h = null), (d = U), (g = !1))
        }
    }
    var z = !1,
        T = null,
        M = -1,
        R = 5,
        k = -1
    function te() {
        return !(e.unstable_now() - k < R)
    }
    function le() {
        if (T !== null) {
            var _ = e.unstable_now()
            k = _
            var D = !0
            try {
                D = T(!0, _)
            } finally {
                D ? de() : ((z = !1), (T = null))
            }
        } else z = !1
    }
    var de
    if (typeof c == 'function')
        de = function () {
            c(le)
        }
    else if (typeof MessageChannel < 'u') {
        var Ut = new MessageChannel(),
            un = Ut.port2
        ;((Ut.port1.onmessage = le),
            (de = function () {
                un.postMessage(null)
            }))
    } else
        de = function () {
            F(le, 0)
        }
    function qe(_) {
        ;((T = _), z || ((z = !0), de()))
    }
    function Un(_, D) {
        M = F(function () {
            _(e.unstable_now())
        }, D)
    }
    ;((e.unstable_IdlePriority = 5),
        (e.unstable_ImmediatePriority = 1),
        (e.unstable_LowPriority = 4),
        (e.unstable_NormalPriority = 3),
        (e.unstable_Profiling = null),
        (e.unstable_UserBlockingPriority = 2),
        (e.unstable_cancelCallback = function (_) {
            _.callback = null
        }),
        (e.unstable_continueExecution = function () {
            y || g || ((y = !0), qe(x))
        }),
        (e.unstable_forceFrameRate = function (_) {
            0 > _ || 125 < _
                ? console.error(
                      'forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported',
                  )
                : (R = 0 < _ ? Math.floor(1e3 / _) : 5)
        }),
        (e.unstable_getCurrentPriorityLevel = function () {
            return d
        }),
        (e.unstable_getFirstCallbackNode = function () {
            return n(s)
        }),
        (e.unstable_next = function (_) {
            switch (d) {
                case 1:
                case 2:
                case 3:
                    var D = 3
                    break
                default:
                    D = d
            }
            var U = d
            d = D
            try {
                return _()
            } finally {
                d = U
            }
        }),
        (e.unstable_pauseExecution = function () {}),
        (e.unstable_requestPaint = function () {}),
        (e.unstable_runWithPriority = function (_, D) {
            switch (_) {
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                    break
                default:
                    _ = 3
            }
            var U = d
            d = _
            try {
                return D()
            } finally {
                d = U
            }
        }),
        (e.unstable_scheduleCallback = function (_, D, U) {
            var Z = e.unstable_now()
            switch (
                (typeof U == 'object' && U !== null
                    ? ((U = U.delay), (U = typeof U == 'number' && 0 < U ? Z + U : Z))
                    : (U = Z),
                _)
            ) {
                case 1:
                    var ie = -1
                    break
                case 2:
                    ie = 250
                    break
                case 5:
                    ie = 1073741823
                    break
                case 4:
                    ie = 1e4
                    break
                default:
                    ie = 5e3
            }
            return (
                (ie = U + ie),
                (_ = { id: m++, callback: D, priorityLevel: _, startTime: U, expirationTime: ie, sortIndex: -1 }),
                U > Z
                    ? ((_.sortIndex = U),
                      t(a, _),
                      n(s) === null && _ === n(a) && (S ? (f(M), (M = -1)) : (S = !0), Un(v, U - Z)))
                    : ((_.sortIndex = ie), t(s, _), y || g || ((y = !0), qe(x))),
                _
            )
        }),
        (e.unstable_shouldYield = te),
        (e.unstable_wrapCallback = function (_) {
            var D = d
            return function () {
                var U = d
                d = D
                try {
                    return _.apply(this, arguments)
                } finally {
                    d = U
                }
            }
        }))
})(Bs)
Hs.exports = Bs
var Ef = Hs.exports
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Cf = j,
    De = Ef
function w(e) {
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
var Ws = new Set(),
    sr = {}
function ln(e, t) {
    ;(zn(e, t), zn(e + 'Capture', t))
}
function zn(e, t) {
    for (sr[e] = t, e = 0; e < t.length; e++) Ws.add(t[e])
}
var ht = !(typeof window > 'u' || typeof window.document > 'u' || typeof window.document.createElement > 'u'),
    Co = Object.prototype.hasOwnProperty,
    Pf =
        /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,
    mu = {},
    gu = {}
function _f(e) {
    return Co.call(gu, e) ? !0 : Co.call(mu, e) ? !1 : Pf.test(e) ? (gu[e] = !0) : ((mu[e] = !0), !1)
}
function Nf(e, t, n, r) {
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
function Lf(e, t, n, r) {
    if (t === null || typeof t > 'u' || Nf(e, t, n, r)) return !0
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
function Ee(e, t, n, r, l, o, i) {
    ;((this.acceptsBooleans = t === 2 || t === 3 || t === 4),
        (this.attributeName = r),
        (this.attributeNamespace = l),
        (this.mustUseProperty = n),
        (this.propertyName = e),
        (this.type = t),
        (this.sanitizeURL = o),
        (this.removeEmptyString = i))
}
var me = {}
'children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style'
    .split(' ')
    .forEach(function (e) {
        me[e] = new Ee(e, 0, !1, e, null, !1, !1)
    })
;[
    ['acceptCharset', 'accept-charset'],
    ['className', 'class'],
    ['htmlFor', 'for'],
    ['httpEquiv', 'http-equiv'],
].forEach(function (e) {
    var t = e[0]
    me[t] = new Ee(t, 1, !1, e[1], null, !1, !1)
})
;['contentEditable', 'draggable', 'spellCheck', 'value'].forEach(function (e) {
    me[e] = new Ee(e, 2, !1, e.toLowerCase(), null, !1, !1)
})
;['autoReverse', 'externalResourcesRequired', 'focusable', 'preserveAlpha'].forEach(function (e) {
    me[e] = new Ee(e, 2, !1, e, null, !1, !1)
})
'allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope'
    .split(' ')
    .forEach(function (e) {
        me[e] = new Ee(e, 3, !1, e.toLowerCase(), null, !1, !1)
    })
;['checked', 'multiple', 'muted', 'selected'].forEach(function (e) {
    me[e] = new Ee(e, 3, !0, e, null, !1, !1)
})
;['capture', 'download'].forEach(function (e) {
    me[e] = new Ee(e, 4, !1, e, null, !1, !1)
})
;['cols', 'rows', 'size', 'span'].forEach(function (e) {
    me[e] = new Ee(e, 6, !1, e, null, !1, !1)
})
;['rowSpan', 'start'].forEach(function (e) {
    me[e] = new Ee(e, 5, !1, e.toLowerCase(), null, !1, !1)
})
var ki = /[\-:]([a-z])/g
function xi(e) {
    return e[1].toUpperCase()
}
'accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height'
    .split(' ')
    .forEach(function (e) {
        var t = e.replace(ki, xi)
        me[t] = new Ee(t, 1, !1, e, null, !1, !1)
    })
'xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type'.split(' ').forEach(function (e) {
    var t = e.replace(ki, xi)
    me[t] = new Ee(t, 1, !1, e, 'http://www.w3.org/1999/xlink', !1, !1)
})
;['xml:base', 'xml:lang', 'xml:space'].forEach(function (e) {
    var t = e.replace(ki, xi)
    me[t] = new Ee(t, 1, !1, e, 'http://www.w3.org/XML/1998/namespace', !1, !1)
})
;['tabIndex', 'crossOrigin'].forEach(function (e) {
    me[e] = new Ee(e, 1, !1, e.toLowerCase(), null, !1, !1)
})
me.xlinkHref = new Ee('xlinkHref', 1, !1, 'xlink:href', 'http://www.w3.org/1999/xlink', !0, !1)
;['src', 'href', 'action', 'formAction'].forEach(function (e) {
    me[e] = new Ee(e, 1, !1, e.toLowerCase(), null, !0, !0)
})
function Ei(e, t, n, r) {
    var l = me.hasOwnProperty(t) ? me[t] : null
    ;(l !== null
        ? l.type !== 0
        : r || !(2 < t.length) || (t[0] !== 'o' && t[0] !== 'O') || (t[1] !== 'n' && t[1] !== 'N')) &&
        (Lf(t, n, l, r) && (n = null),
        r || l === null
            ? _f(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, '' + n))
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
var yt = Cf.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
    Rr = Symbol.for('react.element'),
    fn = Symbol.for('react.portal'),
    dn = Symbol.for('react.fragment'),
    Ci = Symbol.for('react.strict_mode'),
    Po = Symbol.for('react.profiler'),
    Qs = Symbol.for('react.provider'),
    Ys = Symbol.for('react.context'),
    Pi = Symbol.for('react.forward_ref'),
    _o = Symbol.for('react.suspense'),
    No = Symbol.for('react.suspense_list'),
    _i = Symbol.for('react.memo'),
    St = Symbol.for('react.lazy'),
    Ks = Symbol.for('react.offscreen'),
    vu = Symbol.iterator
function An(e) {
    return e === null || typeof e != 'object'
        ? null
        : ((e = (vu && e[vu]) || e['@@iterator']), typeof e == 'function' ? e : null)
}
var ee = Object.assign,
    Xl
function Xn(e) {
    if (Xl === void 0)
        try {
            throw Error()
        } catch (n) {
            var t = n.stack.trim().match(/\n( *(at )?)/)
            Xl = (t && t[1]) || ''
        }
    return (
        `
` +
        Xl +
        e
    )
}
var Zl = !1
function Jl(e, t) {
    if (!e || Zl) return ''
    Zl = !0
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
        ;((Zl = !1), (Error.prepareStackTrace = n))
    }
    return (e = e ? e.displayName || e.name : '') ? Xn(e) : ''
}
function zf(e) {
    switch (e.tag) {
        case 5:
            return Xn(e.type)
        case 16:
            return Xn('Lazy')
        case 13:
            return Xn('Suspense')
        case 19:
            return Xn('SuspenseList')
        case 0:
        case 2:
        case 15:
            return ((e = Jl(e.type, !1)), e)
        case 11:
            return ((e = Jl(e.type.render, !1)), e)
        case 1:
            return ((e = Jl(e.type, !0)), e)
        default:
            return ''
    }
}
function Lo(e) {
    if (e == null) return null
    if (typeof e == 'function') return e.displayName || e.name || null
    if (typeof e == 'string') return e
    switch (e) {
        case dn:
            return 'Fragment'
        case fn:
            return 'Portal'
        case Po:
            return 'Profiler'
        case Ci:
            return 'StrictMode'
        case _o:
            return 'Suspense'
        case No:
            return 'SuspenseList'
    }
    if (typeof e == 'object')
        switch (e.$$typeof) {
            case Ys:
                return (e.displayName || 'Context') + '.Consumer'
            case Qs:
                return (e._context.displayName || 'Context') + '.Provider'
            case Pi:
                var t = e.render
                return (
                    (e = e.displayName),
                    e || ((e = t.displayName || t.name || ''), (e = e !== '' ? 'ForwardRef(' + e + ')' : 'ForwardRef')),
                    e
                )
            case _i:
                return ((t = e.displayName || null), t !== null ? t : Lo(e.type) || 'Memo')
            case St:
                ;((t = e._payload), (e = e._init))
                try {
                    return Lo(e(t))
                } catch {}
        }
    return null
}
function Tf(e) {
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
            return Lo(t)
        case 8:
            return t === Ci ? 'StrictMode' : 'Mode'
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
function Ot(e) {
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
function Gs(e) {
    var t = e.type
    return (e = e.nodeName) && e.toLowerCase() === 'input' && (t === 'checkbox' || t === 'radio')
}
function Mf(e) {
    var t = Gs(e) ? 'checked' : 'value',
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
function jr(e) {
    e._valueTracker || (e._valueTracker = Mf(e))
}
function Xs(e) {
    if (!e) return !1
    var t = e._valueTracker
    if (!t) return !0
    var n = t.getValue(),
        r = ''
    return (e && (r = Gs(e) ? (e.checked ? 'true' : 'false') : e.value), (e = r), e !== n ? (t.setValue(e), !0) : !1)
}
function il(e) {
    if (((e = e || (typeof document < 'u' ? document : void 0)), typeof e > 'u')) return null
    try {
        return e.activeElement || e.body
    } catch {
        return e.body
    }
}
function zo(e, t) {
    var n = t.checked
    return ee({}, t, {
        defaultChecked: void 0,
        defaultValue: void 0,
        value: void 0,
        checked: n ?? e._wrapperState.initialChecked,
    })
}
function yu(e, t) {
    var n = t.defaultValue == null ? '' : t.defaultValue,
        r = t.checked != null ? t.checked : t.defaultChecked
    ;((n = Ot(t.value != null ? t.value : n)),
        (e._wrapperState = {
            initialChecked: r,
            initialValue: n,
            controlled: t.type === 'checkbox' || t.type === 'radio' ? t.checked != null : t.value != null,
        }))
}
function Zs(e, t) {
    ;((t = t.checked), t != null && Ei(e, 'checked', t, !1))
}
function To(e, t) {
    Zs(e, t)
    var n = Ot(t.value),
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
        ? Mo(e, t.type, n)
        : t.hasOwnProperty('defaultValue') && Mo(e, t.type, Ot(t.defaultValue)),
        t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked))
}
function wu(e, t, n) {
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
function Mo(e, t, n) {
    ;(t !== 'number' || il(e.ownerDocument) !== e) &&
        (n == null
            ? (e.defaultValue = '' + e._wrapperState.initialValue)
            : e.defaultValue !== '' + n && (e.defaultValue = '' + n))
}
var Zn = Array.isArray
function En(e, t, n, r) {
    if (((e = e.options), t)) {
        t = {}
        for (var l = 0; l < n.length; l++) t['$' + n[l]] = !0
        for (n = 0; n < e.length; n++)
            ((l = t.hasOwnProperty('$' + e[n].value)),
                e[n].selected !== l && (e[n].selected = l),
                l && r && (e[n].defaultSelected = !0))
    } else {
        for (n = '' + Ot(n), t = null, l = 0; l < e.length; l++) {
            if (e[l].value === n) {
                ;((e[l].selected = !0), r && (e[l].defaultSelected = !0))
                return
            }
            t !== null || e[l].disabled || (t = e[l])
        }
        t !== null && (t.selected = !0)
    }
}
function Ro(e, t) {
    if (t.dangerouslySetInnerHTML != null) throw Error(w(91))
    return ee({}, t, { value: void 0, defaultValue: void 0, children: '' + e._wrapperState.initialValue })
}
function Su(e, t) {
    var n = t.value
    if (n == null) {
        if (((n = t.children), (t = t.defaultValue), n != null)) {
            if (t != null) throw Error(w(92))
            if (Zn(n)) {
                if (1 < n.length) throw Error(w(93))
                n = n[0]
            }
            t = n
        }
        ;(t == null && (t = ''), (n = t))
    }
    e._wrapperState = { initialValue: Ot(n) }
}
function Js(e, t) {
    var n = Ot(t.value),
        r = Ot(t.defaultValue)
    ;(n != null &&
        ((n = '' + n),
        n !== e.value && (e.value = n),
        t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)),
        r != null && (e.defaultValue = '' + r))
}
function ku(e) {
    var t = e.textContent
    t === e._wrapperState.initialValue && t !== '' && t !== null && (e.value = t)
}
function qs(e) {
    switch (e) {
        case 'svg':
            return 'http://www.w3.org/2000/svg'
        case 'math':
            return 'http://www.w3.org/1998/Math/MathML'
        default:
            return 'http://www.w3.org/1999/xhtml'
    }
}
function jo(e, t) {
    return e == null || e === 'http://www.w3.org/1999/xhtml'
        ? qs(t)
        : e === 'http://www.w3.org/2000/svg' && t === 'foreignObject'
          ? 'http://www.w3.org/1999/xhtml'
          : e
}
var Or,
    bs = (function (e) {
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
                Or = Or || document.createElement('div'),
                    Or.innerHTML = '<svg>' + t.valueOf().toString() + '</svg>',
                    t = Or.firstChild;
                e.firstChild;

            )
                e.removeChild(e.firstChild)
            for (; t.firstChild; ) e.appendChild(t.firstChild)
        }
    })
function ar(e, t) {
    if (t) {
        var n = e.firstChild
        if (n && n === e.lastChild && n.nodeType === 3) {
            n.nodeValue = t
            return
        }
    }
    e.textContent = t
}
var bn = {
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
    Rf = ['Webkit', 'ms', 'Moz', 'O']
Object.keys(bn).forEach(function (e) {
    Rf.forEach(function (t) {
        ;((t = t + e.charAt(0).toUpperCase() + e.substring(1)), (bn[t] = bn[e]))
    })
})
function ea(e, t, n) {
    return t == null || typeof t == 'boolean' || t === ''
        ? ''
        : n || typeof t != 'number' || t === 0 || (bn.hasOwnProperty(e) && bn[e])
          ? ('' + t).trim()
          : t + 'px'
}
function ta(e, t) {
    e = e.style
    for (var n in t)
        if (t.hasOwnProperty(n)) {
            var r = n.indexOf('--') === 0,
                l = ea(n, t[n], r)
            ;(n === 'float' && (n = 'cssFloat'), r ? e.setProperty(n, l) : (e[n] = l))
        }
}
var jf = ee(
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
function Oo(e, t) {
    if (t) {
        if (jf[e] && (t.children != null || t.dangerouslySetInnerHTML != null)) throw Error(w(137, e))
        if (t.dangerouslySetInnerHTML != null) {
            if (t.children != null) throw Error(w(60))
            if (typeof t.dangerouslySetInnerHTML != 'object' || !('__html' in t.dangerouslySetInnerHTML))
                throw Error(w(61))
        }
        if (t.style != null && typeof t.style != 'object') throw Error(w(62))
    }
}
function Do(e, t) {
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
var Io = null
function Ni(e) {
    return (
        (e = e.target || e.srcElement || window),
        e.correspondingUseElement && (e = e.correspondingUseElement),
        e.nodeType === 3 ? e.parentNode : e
    )
}
var Fo = null,
    Cn = null,
    Pn = null
function xu(e) {
    if ((e = zr(e))) {
        if (typeof Fo != 'function') throw Error(w(280))
        var t = e.stateNode
        t && ((t = Il(t)), Fo(e.stateNode, e.type, t))
    }
}
function na(e) {
    Cn ? (Pn ? Pn.push(e) : (Pn = [e])) : (Cn = e)
}
function ra() {
    if (Cn) {
        var e = Cn,
            t = Pn
        if (((Pn = Cn = null), xu(e), t)) for (e = 0; e < t.length; e++) xu(t[e])
    }
}
function la(e, t) {
    return e(t)
}
function oa() {}
var ql = !1
function ia(e, t, n) {
    if (ql) return e(t, n)
    ql = !0
    try {
        return la(e, t, n)
    } finally {
        ;((ql = !1), (Cn !== null || Pn !== null) && (oa(), ra()))
    }
}
function cr(e, t) {
    var n = e.stateNode
    if (n === null) return null
    var r = Il(n)
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
    if (n && typeof n != 'function') throw Error(w(231, t, typeof n))
    return n
}
var $o = !1
if (ht)
    try {
        var Vn = {}
        ;(Object.defineProperty(Vn, 'passive', {
            get: function () {
                $o = !0
            },
        }),
            window.addEventListener('test', Vn, Vn),
            window.removeEventListener('test', Vn, Vn))
    } catch {
        $o = !1
    }
function Of(e, t, n, r, l, o, i, u, s) {
    var a = Array.prototype.slice.call(arguments, 3)
    try {
        t.apply(n, a)
    } catch (m) {
        this.onError(m)
    }
}
var er = !1,
    ul = null,
    sl = !1,
    Uo = null,
    Df = {
        onError: function (e) {
            ;((er = !0), (ul = e))
        },
    }
function If(e, t, n, r, l, o, i, u, s) {
    ;((er = !1), (ul = null), Of.apply(Df, arguments))
}
function Ff(e, t, n, r, l, o, i, u, s) {
    if ((If.apply(this, arguments), er)) {
        if (er) {
            var a = ul
            ;((er = !1), (ul = null))
        } else throw Error(w(198))
        sl || ((sl = !0), (Uo = a))
    }
}
function on(e) {
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
function ua(e) {
    if (e.tag === 13) {
        var t = e.memoizedState
        if ((t === null && ((e = e.alternate), e !== null && (t = e.memoizedState)), t !== null)) return t.dehydrated
    }
    return null
}
function Eu(e) {
    if (on(e) !== e) throw Error(w(188))
}
function $f(e) {
    var t = e.alternate
    if (!t) {
        if (((t = on(e)), t === null)) throw Error(w(188))
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
                if (o === n) return (Eu(l), e)
                if (o === r) return (Eu(l), t)
                o = o.sibling
            }
            throw Error(w(188))
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
                if (!i) throw Error(w(189))
            }
        }
        if (n.alternate !== r) throw Error(w(190))
    }
    if (n.tag !== 3) throw Error(w(188))
    return n.stateNode.current === n ? e : t
}
function sa(e) {
    return ((e = $f(e)), e !== null ? aa(e) : null)
}
function aa(e) {
    if (e.tag === 5 || e.tag === 6) return e
    for (e = e.child; e !== null; ) {
        var t = aa(e)
        if (t !== null) return t
        e = e.sibling
    }
    return null
}
var ca = De.unstable_scheduleCallback,
    Cu = De.unstable_cancelCallback,
    Uf = De.unstable_shouldYield,
    Af = De.unstable_requestPaint,
    oe = De.unstable_now,
    Vf = De.unstable_getCurrentPriorityLevel,
    Li = De.unstable_ImmediatePriority,
    fa = De.unstable_UserBlockingPriority,
    al = De.unstable_NormalPriority,
    Hf = De.unstable_LowPriority,
    da = De.unstable_IdlePriority,
    Rl = null,
    nt = null
function Bf(e) {
    if (nt && typeof nt.onCommitFiberRoot == 'function')
        try {
            nt.onCommitFiberRoot(Rl, e, void 0, (e.current.flags & 128) === 128)
        } catch {}
}
var Xe = Math.clz32 ? Math.clz32 : Yf,
    Wf = Math.log,
    Qf = Math.LN2
function Yf(e) {
    return ((e >>>= 0), e === 0 ? 32 : (31 - ((Wf(e) / Qf) | 0)) | 0)
}
var Dr = 64,
    Ir = 4194304
function Jn(e) {
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
function cl(e, t) {
    var n = e.pendingLanes
    if (n === 0) return 0
    var r = 0,
        l = e.suspendedLanes,
        o = e.pingedLanes,
        i = n & 268435455
    if (i !== 0) {
        var u = i & ~l
        u !== 0 ? (r = Jn(u)) : ((o &= i), o !== 0 && (r = Jn(o)))
    } else ((i = n & ~l), i !== 0 ? (r = Jn(i)) : o !== 0 && (r = Jn(o)))
    if (r === 0) return 0
    if (t !== 0 && t !== r && !(t & l) && ((l = r & -r), (o = t & -t), l >= o || (l === 16 && (o & 4194240) !== 0)))
        return t
    if ((r & 4 && (r |= n & 16), (t = e.entangledLanes), t !== 0))
        for (e = e.entanglements, t &= r; 0 < t; ) ((n = 31 - Xe(t)), (l = 1 << n), (r |= e[n]), (t &= ~l))
    return r
}
function Kf(e, t) {
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
function Gf(e, t) {
    for (var n = e.suspendedLanes, r = e.pingedLanes, l = e.expirationTimes, o = e.pendingLanes; 0 < o; ) {
        var i = 31 - Xe(o),
            u = 1 << i,
            s = l[i]
        ;(s === -1 ? (!(u & n) || u & r) && (l[i] = Kf(u, t)) : s <= t && (e.expiredLanes |= u), (o &= ~u))
    }
}
function Ao(e) {
    return ((e = e.pendingLanes & -1073741825), e !== 0 ? e : e & 1073741824 ? 1073741824 : 0)
}
function pa() {
    var e = Dr
    return ((Dr <<= 1), !(Dr & 4194240) && (Dr = 64), e)
}
function bl(e) {
    for (var t = [], n = 0; 31 > n; n++) t.push(e)
    return t
}
function Nr(e, t, n) {
    ;((e.pendingLanes |= t),
        t !== 536870912 && ((e.suspendedLanes = 0), (e.pingedLanes = 0)),
        (e = e.eventTimes),
        (t = 31 - Xe(t)),
        (e[t] = n))
}
function Xf(e, t) {
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
        var l = 31 - Xe(n),
            o = 1 << l
        ;((t[l] = 0), (r[l] = -1), (e[l] = -1), (n &= ~o))
    }
}
function zi(e, t) {
    var n = (e.entangledLanes |= t)
    for (e = e.entanglements; n; ) {
        var r = 31 - Xe(n),
            l = 1 << r
        ;((l & t) | (e[r] & t) && (e[r] |= t), (n &= ~l))
    }
}
var B = 0
function ha(e) {
    return ((e &= -e), 1 < e ? (4 < e ? (e & 268435455 ? 16 : 536870912) : 4) : 1)
}
var ma,
    Ti,
    ga,
    va,
    ya,
    Vo = !1,
    Fr = [],
    _t = null,
    Nt = null,
    Lt = null,
    fr = new Map(),
    dr = new Map(),
    xt = [],
    Zf =
        'mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit'.split(
            ' ',
        )
function Pu(e, t) {
    switch (e) {
        case 'focusin':
        case 'focusout':
            _t = null
            break
        case 'dragenter':
        case 'dragleave':
            Nt = null
            break
        case 'mouseover':
        case 'mouseout':
            Lt = null
            break
        case 'pointerover':
        case 'pointerout':
            fr.delete(t.pointerId)
            break
        case 'gotpointercapture':
        case 'lostpointercapture':
            dr.delete(t.pointerId)
    }
}
function Hn(e, t, n, r, l, o) {
    return e === null || e.nativeEvent !== o
        ? ((e = { blockedOn: t, domEventName: n, eventSystemFlags: r, nativeEvent: o, targetContainers: [l] }),
          t !== null && ((t = zr(t)), t !== null && Ti(t)),
          e)
        : ((e.eventSystemFlags |= r), (t = e.targetContainers), l !== null && t.indexOf(l) === -1 && t.push(l), e)
}
function Jf(e, t, n, r, l) {
    switch (t) {
        case 'focusin':
            return ((_t = Hn(_t, e, t, n, r, l)), !0)
        case 'dragenter':
            return ((Nt = Hn(Nt, e, t, n, r, l)), !0)
        case 'mouseover':
            return ((Lt = Hn(Lt, e, t, n, r, l)), !0)
        case 'pointerover':
            var o = l.pointerId
            return (fr.set(o, Hn(fr.get(o) || null, e, t, n, r, l)), !0)
        case 'gotpointercapture':
            return ((o = l.pointerId), dr.set(o, Hn(dr.get(o) || null, e, t, n, r, l)), !0)
    }
    return !1
}
function wa(e) {
    var t = Kt(e.target)
    if (t !== null) {
        var n = on(t)
        if (n !== null) {
            if (((t = n.tag), t === 13)) {
                if (((t = ua(n)), t !== null)) {
                    ;((e.blockedOn = t),
                        ya(e.priority, function () {
                            ga(n)
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
function Zr(e) {
    if (e.blockedOn !== null) return !1
    for (var t = e.targetContainers; 0 < t.length; ) {
        var n = Ho(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent)
        if (n === null) {
            n = e.nativeEvent
            var r = new n.constructor(n.type, n)
            ;((Io = r), n.target.dispatchEvent(r), (Io = null))
        } else return ((t = zr(n)), t !== null && Ti(t), (e.blockedOn = n), !1)
        t.shift()
    }
    return !0
}
function _u(e, t, n) {
    Zr(e) && n.delete(t)
}
function qf() {
    ;((Vo = !1),
        _t !== null && Zr(_t) && (_t = null),
        Nt !== null && Zr(Nt) && (Nt = null),
        Lt !== null && Zr(Lt) && (Lt = null),
        fr.forEach(_u),
        dr.forEach(_u))
}
function Bn(e, t) {
    e.blockedOn === t &&
        ((e.blockedOn = null), Vo || ((Vo = !0), De.unstable_scheduleCallback(De.unstable_NormalPriority, qf)))
}
function pr(e) {
    function t(l) {
        return Bn(l, e)
    }
    if (0 < Fr.length) {
        Bn(Fr[0], e)
        for (var n = 1; n < Fr.length; n++) {
            var r = Fr[n]
            r.blockedOn === e && (r.blockedOn = null)
        }
    }
    for (
        _t !== null && Bn(_t, e),
            Nt !== null && Bn(Nt, e),
            Lt !== null && Bn(Lt, e),
            fr.forEach(t),
            dr.forEach(t),
            n = 0;
        n < xt.length;
        n++
    )
        ((r = xt[n]), r.blockedOn === e && (r.blockedOn = null))
    for (; 0 < xt.length && ((n = xt[0]), n.blockedOn === null); ) (wa(n), n.blockedOn === null && xt.shift())
}
var _n = yt.ReactCurrentBatchConfig,
    fl = !0
function bf(e, t, n, r) {
    var l = B,
        o = _n.transition
    _n.transition = null
    try {
        ;((B = 1), Mi(e, t, n, r))
    } finally {
        ;((B = l), (_n.transition = o))
    }
}
function ed(e, t, n, r) {
    var l = B,
        o = _n.transition
    _n.transition = null
    try {
        ;((B = 4), Mi(e, t, n, r))
    } finally {
        ;((B = l), (_n.transition = o))
    }
}
function Mi(e, t, n, r) {
    if (fl) {
        var l = Ho(e, t, n, r)
        if (l === null) (ao(e, t, r, dl, n), Pu(e, r))
        else if (Jf(l, e, t, n, r)) r.stopPropagation()
        else if ((Pu(e, r), t & 4 && -1 < Zf.indexOf(e))) {
            for (; l !== null; ) {
                var o = zr(l)
                if ((o !== null && ma(o), (o = Ho(e, t, n, r)), o === null && ao(e, t, r, dl, n), o === l)) break
                l = o
            }
            l !== null && r.stopPropagation()
        } else ao(e, t, r, null, n)
    }
}
var dl = null
function Ho(e, t, n, r) {
    if (((dl = null), (e = Ni(r)), (e = Kt(e)), e !== null))
        if (((t = on(e)), t === null)) e = null
        else if (((n = t.tag), n === 13)) {
            if (((e = ua(t)), e !== null)) return e
            e = null
        } else if (n === 3) {
            if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null
            e = null
        } else t !== e && (e = null)
    return ((dl = e), null)
}
function Sa(e) {
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
            switch (Vf()) {
                case Li:
                    return 1
                case fa:
                    return 4
                case al:
                case Hf:
                    return 16
                case da:
                    return 536870912
                default:
                    return 16
            }
        default:
            return 16
    }
}
var Ct = null,
    Ri = null,
    Jr = null
function ka() {
    if (Jr) return Jr
    var e,
        t = Ri,
        n = t.length,
        r,
        l = 'value' in Ct ? Ct.value : Ct.textContent,
        o = l.length
    for (e = 0; e < n && t[e] === l[e]; e++);
    var i = n - e
    for (r = 1; r <= i && t[n - r] === l[o - r]; r++);
    return (Jr = l.slice(e, 1 < r ? 1 - r : void 0))
}
function qr(e) {
    var t = e.keyCode
    return (
        'charCode' in e ? ((e = e.charCode), e === 0 && t === 13 && (e = 13)) : (e = t),
        e === 10 && (e = 13),
        32 <= e || e === 13 ? e : 0
    )
}
function $r() {
    return !0
}
function Nu() {
    return !1
}
function Fe(e) {
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
                ? $r
                : Nu),
            (this.isPropagationStopped = Nu),
            this
        )
    }
    return (
        ee(t.prototype, {
            preventDefault: function () {
                this.defaultPrevented = !0
                var n = this.nativeEvent
                n &&
                    (n.preventDefault ? n.preventDefault() : typeof n.returnValue != 'unknown' && (n.returnValue = !1),
                    (this.isDefaultPrevented = $r))
            },
            stopPropagation: function () {
                var n = this.nativeEvent
                n &&
                    (n.stopPropagation
                        ? n.stopPropagation()
                        : typeof n.cancelBubble != 'unknown' && (n.cancelBubble = !0),
                    (this.isPropagationStopped = $r))
            },
            persist: function () {},
            isPersistent: $r,
        }),
        t
    )
}
var Fn = {
        eventPhase: 0,
        bubbles: 0,
        cancelable: 0,
        timeStamp: function (e) {
            return e.timeStamp || Date.now()
        },
        defaultPrevented: 0,
        isTrusted: 0,
    },
    ji = Fe(Fn),
    Lr = ee({}, Fn, { view: 0, detail: 0 }),
    td = Fe(Lr),
    eo,
    to,
    Wn,
    jl = ee({}, Lr, {
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
        getModifierState: Oi,
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
                : (e !== Wn &&
                      (Wn && e.type === 'mousemove'
                          ? ((eo = e.screenX - Wn.screenX), (to = e.screenY - Wn.screenY))
                          : (to = eo = 0),
                      (Wn = e)),
                  eo)
        },
        movementY: function (e) {
            return 'movementY' in e ? e.movementY : to
        },
    }),
    Lu = Fe(jl),
    nd = ee({}, jl, { dataTransfer: 0 }),
    rd = Fe(nd),
    ld = ee({}, Lr, { relatedTarget: 0 }),
    no = Fe(ld),
    od = ee({}, Fn, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
    id = Fe(od),
    ud = ee({}, Fn, {
        clipboardData: function (e) {
            return 'clipboardData' in e ? e.clipboardData : window.clipboardData
        },
    }),
    sd = Fe(ud),
    ad = ee({}, Fn, { data: 0 }),
    zu = Fe(ad),
    cd = {
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
    fd = {
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
    dd = { Alt: 'altKey', Control: 'ctrlKey', Meta: 'metaKey', Shift: 'shiftKey' }
function pd(e) {
    var t = this.nativeEvent
    return t.getModifierState ? t.getModifierState(e) : (e = dd[e]) ? !!t[e] : !1
}
function Oi() {
    return pd
}
var hd = ee({}, Lr, {
        key: function (e) {
            if (e.key) {
                var t = cd[e.key] || e.key
                if (t !== 'Unidentified') return t
            }
            return e.type === 'keypress'
                ? ((e = qr(e)), e === 13 ? 'Enter' : String.fromCharCode(e))
                : e.type === 'keydown' || e.type === 'keyup'
                  ? fd[e.keyCode] || 'Unidentified'
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
        getModifierState: Oi,
        charCode: function (e) {
            return e.type === 'keypress' ? qr(e) : 0
        },
        keyCode: function (e) {
            return e.type === 'keydown' || e.type === 'keyup' ? e.keyCode : 0
        },
        which: function (e) {
            return e.type === 'keypress' ? qr(e) : e.type === 'keydown' || e.type === 'keyup' ? e.keyCode : 0
        },
    }),
    md = Fe(hd),
    gd = ee({}, jl, {
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
    Tu = Fe(gd),
    vd = ee({}, Lr, {
        touches: 0,
        targetTouches: 0,
        changedTouches: 0,
        altKey: 0,
        metaKey: 0,
        ctrlKey: 0,
        shiftKey: 0,
        getModifierState: Oi,
    }),
    yd = Fe(vd),
    wd = ee({}, Fn, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }),
    Sd = Fe(wd),
    kd = ee({}, jl, {
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
    xd = Fe(kd),
    Ed = [9, 13, 27, 32],
    Di = ht && 'CompositionEvent' in window,
    tr = null
ht && 'documentMode' in document && (tr = document.documentMode)
var Cd = ht && 'TextEvent' in window && !tr,
    xa = ht && (!Di || (tr && 8 < tr && 11 >= tr)),
    Mu = ' ',
    Ru = !1
function Ea(e, t) {
    switch (e) {
        case 'keyup':
            return Ed.indexOf(t.keyCode) !== -1
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
function Ca(e) {
    return ((e = e.detail), typeof e == 'object' && 'data' in e ? e.data : null)
}
var pn = !1
function Pd(e, t) {
    switch (e) {
        case 'compositionend':
            return Ca(t)
        case 'keypress':
            return t.which !== 32 ? null : ((Ru = !0), Mu)
        case 'textInput':
            return ((e = t.data), e === Mu && Ru ? null : e)
        default:
            return null
    }
}
function _d(e, t) {
    if (pn)
        return e === 'compositionend' || (!Di && Ea(e, t)) ? ((e = ka()), (Jr = Ri = Ct = null), (pn = !1), e) : null
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
            return xa && t.locale !== 'ko' ? null : t.data
        default:
            return null
    }
}
var Nd = {
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
    return t === 'input' ? !!Nd[e.type] : t === 'textarea'
}
function Pa(e, t, n, r) {
    ;(na(r),
        (t = pl(t, 'onChange')),
        0 < t.length && ((n = new ji('onChange', 'change', null, n, r)), e.push({ event: n, listeners: t })))
}
var nr = null,
    hr = null
function Ld(e) {
    Ia(e, 0)
}
function Ol(e) {
    var t = gn(e)
    if (Xs(t)) return e
}
function zd(e, t) {
    if (e === 'change') return t
}
var _a = !1
if (ht) {
    var ro
    if (ht) {
        var lo = 'oninput' in document
        if (!lo) {
            var Ou = document.createElement('div')
            ;(Ou.setAttribute('oninput', 'return;'), (lo = typeof Ou.oninput == 'function'))
        }
        ro = lo
    } else ro = !1
    _a = ro && (!document.documentMode || 9 < document.documentMode)
}
function Du() {
    nr && (nr.detachEvent('onpropertychange', Na), (hr = nr = null))
}
function Na(e) {
    if (e.propertyName === 'value' && Ol(hr)) {
        var t = []
        ;(Pa(t, hr, e, Ni(e)), ia(Ld, t))
    }
}
function Td(e, t, n) {
    e === 'focusin' ? (Du(), (nr = t), (hr = n), nr.attachEvent('onpropertychange', Na)) : e === 'focusout' && Du()
}
function Md(e) {
    if (e === 'selectionchange' || e === 'keyup' || e === 'keydown') return Ol(hr)
}
function Rd(e, t) {
    if (e === 'click') return Ol(t)
}
function jd(e, t) {
    if (e === 'input' || e === 'change') return Ol(t)
}
function Od(e, t) {
    return (e === t && (e !== 0 || 1 / e === 1 / t)) || (e !== e && t !== t)
}
var Je = typeof Object.is == 'function' ? Object.is : Od
function mr(e, t) {
    if (Je(e, t)) return !0
    if (typeof e != 'object' || e === null || typeof t != 'object' || t === null) return !1
    var n = Object.keys(e),
        r = Object.keys(t)
    if (n.length !== r.length) return !1
    for (r = 0; r < n.length; r++) {
        var l = n[r]
        if (!Co.call(t, l) || !Je(e[l], t[l])) return !1
    }
    return !0
}
function Iu(e) {
    for (; e && e.firstChild; ) e = e.firstChild
    return e
}
function Fu(e, t) {
    var n = Iu(e)
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
        n = Iu(n)
    }
}
function La(e, t) {
    return e && t
        ? e === t
            ? !0
            : e && e.nodeType === 3
              ? !1
              : t && t.nodeType === 3
                ? La(e, t.parentNode)
                : 'contains' in e
                  ? e.contains(t)
                  : e.compareDocumentPosition
                    ? !!(e.compareDocumentPosition(t) & 16)
                    : !1
        : !1
}
function za() {
    for (var e = window, t = il(); t instanceof e.HTMLIFrameElement; ) {
        try {
            var n = typeof t.contentWindow.location.href == 'string'
        } catch {
            n = !1
        }
        if (n) e = t.contentWindow
        else break
        t = il(e.document)
    }
    return t
}
function Ii(e) {
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
function Dd(e) {
    var t = za(),
        n = e.focusedElem,
        r = e.selectionRange
    if (t !== n && n && n.ownerDocument && La(n.ownerDocument.documentElement, n)) {
        if (r !== null && Ii(n)) {
            if (((t = r.start), (e = r.end), e === void 0 && (e = t), 'selectionStart' in n))
                ((n.selectionStart = t), (n.selectionEnd = Math.min(e, n.value.length)))
            else if (((e = ((t = n.ownerDocument || document) && t.defaultView) || window), e.getSelection)) {
                e = e.getSelection()
                var l = n.textContent.length,
                    o = Math.min(r.start, l)
                ;((r = r.end === void 0 ? o : Math.min(r.end, l)),
                    !e.extend && o > r && ((l = r), (r = o), (o = l)),
                    (l = Fu(n, o)))
                var i = Fu(n, r)
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
var Id = ht && 'documentMode' in document && 11 >= document.documentMode,
    hn = null,
    Bo = null,
    rr = null,
    Wo = !1
function $u(e, t, n) {
    var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument
    Wo ||
        hn == null ||
        hn !== il(r) ||
        ((r = hn),
        'selectionStart' in r && Ii(r)
            ? (r = { start: r.selectionStart, end: r.selectionEnd })
            : ((r = ((r.ownerDocument && r.ownerDocument.defaultView) || window).getSelection()),
              (r = {
                  anchorNode: r.anchorNode,
                  anchorOffset: r.anchorOffset,
                  focusNode: r.focusNode,
                  focusOffset: r.focusOffset,
              })),
        (rr && mr(rr, r)) ||
            ((rr = r),
            (r = pl(Bo, 'onSelect')),
            0 < r.length &&
                ((t = new ji('onSelect', 'select', null, t, n)), e.push({ event: t, listeners: r }), (t.target = hn))))
}
function Ur(e, t) {
    var n = {}
    return ((n[e.toLowerCase()] = t.toLowerCase()), (n['Webkit' + e] = 'webkit' + t), (n['Moz' + e] = 'moz' + t), n)
}
var mn = {
        animationend: Ur('Animation', 'AnimationEnd'),
        animationiteration: Ur('Animation', 'AnimationIteration'),
        animationstart: Ur('Animation', 'AnimationStart'),
        transitionend: Ur('Transition', 'TransitionEnd'),
    },
    oo = {},
    Ta = {}
ht &&
    ((Ta = document.createElement('div').style),
    'AnimationEvent' in window ||
        (delete mn.animationend.animation, delete mn.animationiteration.animation, delete mn.animationstart.animation),
    'TransitionEvent' in window || delete mn.transitionend.transition)
function Dl(e) {
    if (oo[e]) return oo[e]
    if (!mn[e]) return e
    var t = mn[e],
        n
    for (n in t) if (t.hasOwnProperty(n) && n in Ta) return (oo[e] = t[n])
    return e
}
var Ma = Dl('animationend'),
    Ra = Dl('animationiteration'),
    ja = Dl('animationstart'),
    Oa = Dl('transitionend'),
    Da = new Map(),
    Uu =
        'abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel'.split(
            ' ',
        )
function It(e, t) {
    ;(Da.set(e, t), ln(t, [e]))
}
for (var io = 0; io < Uu.length; io++) {
    var uo = Uu[io],
        Fd = uo.toLowerCase(),
        $d = uo[0].toUpperCase() + uo.slice(1)
    It(Fd, 'on' + $d)
}
It(Ma, 'onAnimationEnd')
It(Ra, 'onAnimationIteration')
It(ja, 'onAnimationStart')
It('dblclick', 'onDoubleClick')
It('focusin', 'onFocus')
It('focusout', 'onBlur')
It(Oa, 'onTransitionEnd')
zn('onMouseEnter', ['mouseout', 'mouseover'])
zn('onMouseLeave', ['mouseout', 'mouseover'])
zn('onPointerEnter', ['pointerout', 'pointerover'])
zn('onPointerLeave', ['pointerout', 'pointerover'])
ln('onChange', 'change click focusin focusout input keydown keyup selectionchange'.split(' '))
ln('onSelect', 'focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange'.split(' '))
ln('onBeforeInput', ['compositionend', 'keypress', 'textInput', 'paste'])
ln('onCompositionEnd', 'compositionend focusout keydown keypress keyup mousedown'.split(' '))
ln('onCompositionStart', 'compositionstart focusout keydown keypress keyup mousedown'.split(' '))
ln('onCompositionUpdate', 'compositionupdate focusout keydown keypress keyup mousedown'.split(' '))
var qn =
        'abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting'.split(
            ' ',
        ),
    Ud = new Set('cancel close invalid load scroll toggle'.split(' ').concat(qn))
function Au(e, t, n) {
    var r = e.type || 'unknown-event'
    ;((e.currentTarget = n), Ff(r, t, void 0, e), (e.currentTarget = null))
}
function Ia(e, t) {
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
                    ;(Au(l, u, a), (o = s))
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
                    ;(Au(l, u, a), (o = s))
                }
        }
    }
    if (sl) throw ((e = Uo), (sl = !1), (Uo = null), e)
}
function Y(e, t) {
    var n = t[Xo]
    n === void 0 && (n = t[Xo] = new Set())
    var r = e + '__bubble'
    n.has(r) || (Fa(t, e, 2, !1), n.add(r))
}
function so(e, t, n) {
    var r = 0
    ;(t && (r |= 4), Fa(n, e, r, t))
}
var Ar = '_reactListening' + Math.random().toString(36).slice(2)
function gr(e) {
    if (!e[Ar]) {
        ;((e[Ar] = !0),
            Ws.forEach(function (n) {
                n !== 'selectionchange' && (Ud.has(n) || so(n, !1, e), so(n, !0, e))
            }))
        var t = e.nodeType === 9 ? e : e.ownerDocument
        t === null || t[Ar] || ((t[Ar] = !0), so('selectionchange', !1, t))
    }
}
function Fa(e, t, n, r) {
    switch (Sa(t)) {
        case 1:
            var l = bf
            break
        case 4:
            l = ed
            break
        default:
            l = Mi
    }
    ;((n = l.bind(null, t, n, e)),
        (l = void 0),
        !$o || (t !== 'touchstart' && t !== 'touchmove' && t !== 'wheel') || (l = !0),
        r
            ? l !== void 0
                ? e.addEventListener(t, n, { capture: !0, passive: l })
                : e.addEventListener(t, n, !0)
            : l !== void 0
              ? e.addEventListener(t, n, { passive: l })
              : e.addEventListener(t, n, !1))
}
function ao(e, t, n, r, l) {
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
                    if (((i = Kt(u)), i === null)) return
                    if (((s = i.tag), s === 5 || s === 6)) {
                        r = o = i
                        continue e
                    }
                    u = u.parentNode
                }
            }
            r = r.return
        }
    ia(function () {
        var a = o,
            m = Ni(n),
            h = []
        e: {
            var d = Da.get(e)
            if (d !== void 0) {
                var g = ji,
                    y = e
                switch (e) {
                    case 'keypress':
                        if (qr(n) === 0) break e
                    case 'keydown':
                    case 'keyup':
                        g = md
                        break
                    case 'focusin':
                        ;((y = 'focus'), (g = no))
                        break
                    case 'focusout':
                        ;((y = 'blur'), (g = no))
                        break
                    case 'beforeblur':
                    case 'afterblur':
                        g = no
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
                        g = Lu
                        break
                    case 'drag':
                    case 'dragend':
                    case 'dragenter':
                    case 'dragexit':
                    case 'dragleave':
                    case 'dragover':
                    case 'dragstart':
                    case 'drop':
                        g = rd
                        break
                    case 'touchcancel':
                    case 'touchend':
                    case 'touchmove':
                    case 'touchstart':
                        g = yd
                        break
                    case Ma:
                    case Ra:
                    case ja:
                        g = id
                        break
                    case Oa:
                        g = Sd
                        break
                    case 'scroll':
                        g = td
                        break
                    case 'wheel':
                        g = xd
                        break
                    case 'copy':
                    case 'cut':
                    case 'paste':
                        g = sd
                        break
                    case 'gotpointercapture':
                    case 'lostpointercapture':
                    case 'pointercancel':
                    case 'pointerdown':
                    case 'pointermove':
                    case 'pointerout':
                    case 'pointerover':
                    case 'pointerup':
                        g = Tu
                }
                var S = (t & 4) !== 0,
                    F = !S && e === 'scroll',
                    f = S ? (d !== null ? d + 'Capture' : null) : d
                S = []
                for (var c = a, p; c !== null; ) {
                    p = c
                    var v = p.stateNode
                    if (
                        (p.tag === 5 &&
                            v !== null &&
                            ((p = v), f !== null && ((v = cr(c, f)), v != null && S.push(vr(c, v, p)))),
                        F)
                    )
                        break
                    c = c.return
                }
                0 < S.length && ((d = new g(d, y, null, n, m)), h.push({ event: d, listeners: S }))
            }
        }
        if (!(t & 7)) {
            e: {
                if (
                    ((d = e === 'mouseover' || e === 'pointerover'),
                    (g = e === 'mouseout' || e === 'pointerout'),
                    d && n !== Io && (y = n.relatedTarget || n.fromElement) && (Kt(y) || y[mt]))
                )
                    break e
                if (
                    (g || d) &&
                    ((d = m.window === m ? m : (d = m.ownerDocument) ? d.defaultView || d.parentWindow : window),
                    g
                        ? ((y = n.relatedTarget || n.toElement),
                          (g = a),
                          (y = y ? Kt(y) : null),
                          y !== null && ((F = on(y)), y !== F || (y.tag !== 5 && y.tag !== 6)) && (y = null))
                        : ((g = null), (y = a)),
                    g !== y)
                ) {
                    if (
                        ((S = Lu),
                        (v = 'onMouseLeave'),
                        (f = 'onMouseEnter'),
                        (c = 'mouse'),
                        (e === 'pointerout' || e === 'pointerover') &&
                            ((S = Tu), (v = 'onPointerLeave'), (f = 'onPointerEnter'), (c = 'pointer')),
                        (F = g == null ? d : gn(g)),
                        (p = y == null ? d : gn(y)),
                        (d = new S(v, c + 'leave', g, n, m)),
                        (d.target = F),
                        (d.relatedTarget = p),
                        (v = null),
                        Kt(m) === a &&
                            ((S = new S(f, c + 'enter', y, n, m)), (S.target = p), (S.relatedTarget = F), (v = S)),
                        (F = v),
                        g && y)
                    )
                        t: {
                            for (S = g, f = y, c = 0, p = S; p; p = cn(p)) c++
                            for (p = 0, v = f; v; v = cn(v)) p++
                            for (; 0 < c - p; ) ((S = cn(S)), c--)
                            for (; 0 < p - c; ) ((f = cn(f)), p--)
                            for (; c--; ) {
                                if (S === f || (f !== null && S === f.alternate)) break t
                                ;((S = cn(S)), (f = cn(f)))
                            }
                            S = null
                        }
                    else S = null
                    ;(g !== null && Vu(h, d, g, S, !1), y !== null && F !== null && Vu(h, F, y, S, !0))
                }
            }
            e: {
                if (
                    ((d = a ? gn(a) : window),
                    (g = d.nodeName && d.nodeName.toLowerCase()),
                    g === 'select' || (g === 'input' && d.type === 'file'))
                )
                    var x = zd
                else if (ju(d))
                    if (_a) x = jd
                    else {
                        x = Md
                        var z = Td
                    }
                else
                    (g = d.nodeName) &&
                        g.toLowerCase() === 'input' &&
                        (d.type === 'checkbox' || d.type === 'radio') &&
                        (x = Rd)
                if (x && (x = x(e, a))) {
                    Pa(h, x, n, m)
                    break e
                }
                ;(z && z(e, d, a),
                    e === 'focusout' &&
                        (z = d._wrapperState) &&
                        z.controlled &&
                        d.type === 'number' &&
                        Mo(d, 'number', d.value))
            }
            switch (((z = a ? gn(a) : window), e)) {
                case 'focusin':
                    ;(ju(z) || z.contentEditable === 'true') && ((hn = z), (Bo = a), (rr = null))
                    break
                case 'focusout':
                    rr = Bo = hn = null
                    break
                case 'mousedown':
                    Wo = !0
                    break
                case 'contextmenu':
                case 'mouseup':
                case 'dragend':
                    ;((Wo = !1), $u(h, n, m))
                    break
                case 'selectionchange':
                    if (Id) break
                case 'keydown':
                case 'keyup':
                    $u(h, n, m)
            }
            var T
            if (Di)
                e: {
                    switch (e) {
                        case 'compositionstart':
                            var M = 'onCompositionStart'
                            break e
                        case 'compositionend':
                            M = 'onCompositionEnd'
                            break e
                        case 'compositionupdate':
                            M = 'onCompositionUpdate'
                            break e
                    }
                    M = void 0
                }
            else
                pn
                    ? Ea(e, n) && (M = 'onCompositionEnd')
                    : e === 'keydown' && n.keyCode === 229 && (M = 'onCompositionStart')
            ;(M &&
                (xa &&
                    n.locale !== 'ko' &&
                    (pn || M !== 'onCompositionStart'
                        ? M === 'onCompositionEnd' && pn && (T = ka())
                        : ((Ct = m), (Ri = 'value' in Ct ? Ct.value : Ct.textContent), (pn = !0))),
                (z = pl(a, M)),
                0 < z.length &&
                    ((M = new zu(M, e, null, n, m)),
                    h.push({ event: M, listeners: z }),
                    T ? (M.data = T) : ((T = Ca(n)), T !== null && (M.data = T)))),
                (T = Cd ? Pd(e, n) : _d(e, n)) &&
                    ((a = pl(a, 'onBeforeInput')),
                    0 < a.length &&
                        ((m = new zu('onBeforeInput', 'beforeinput', null, n, m)),
                        h.push({ event: m, listeners: a }),
                        (m.data = T))))
        }
        Ia(h, t)
    })
}
function vr(e, t, n) {
    return { instance: e, listener: t, currentTarget: n }
}
function pl(e, t) {
    for (var n = t + 'Capture', r = []; e !== null; ) {
        var l = e,
            o = l.stateNode
        ;(l.tag === 5 &&
            o !== null &&
            ((l = o),
            (o = cr(e, n)),
            o != null && r.unshift(vr(e, o, l)),
            (o = cr(e, t)),
            o != null && r.push(vr(e, o, l))),
            (e = e.return))
    }
    return r
}
function cn(e) {
    if (e === null) return null
    do e = e.return
    while (e && e.tag !== 5)
    return e || null
}
function Vu(e, t, n, r, l) {
    for (var o = t._reactName, i = []; n !== null && n !== r; ) {
        var u = n,
            s = u.alternate,
            a = u.stateNode
        if (s !== null && s === r) break
        ;(u.tag === 5 &&
            a !== null &&
            ((u = a),
            l
                ? ((s = cr(n, o)), s != null && i.unshift(vr(n, s, u)))
                : l || ((s = cr(n, o)), s != null && i.push(vr(n, s, u)))),
            (n = n.return))
    }
    i.length !== 0 && e.push({ event: t, listeners: i })
}
var Ad = /\r\n?/g,
    Vd = /\u0000|\uFFFD/g
function Hu(e) {
    return (typeof e == 'string' ? e : '' + e)
        .replace(
            Ad,
            `
`,
        )
        .replace(Vd, '')
}
function Vr(e, t, n) {
    if (((t = Hu(t)), Hu(e) !== t && n)) throw Error(w(425))
}
function hl() {}
var Qo = null,
    Yo = null
function Ko(e, t) {
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
    Hd = typeof clearTimeout == 'function' ? clearTimeout : void 0,
    Bu = typeof Promise == 'function' ? Promise : void 0,
    Bd =
        typeof queueMicrotask == 'function'
            ? queueMicrotask
            : typeof Bu < 'u'
              ? function (e) {
                    return Bu.resolve(null).then(e).catch(Wd)
                }
              : Go
function Wd(e) {
    setTimeout(function () {
        throw e
    })
}
function co(e, t) {
    var n = t,
        r = 0
    do {
        var l = n.nextSibling
        if ((e.removeChild(n), l && l.nodeType === 8))
            if (((n = l.data), n === '/$')) {
                if (r === 0) {
                    ;(e.removeChild(l), pr(t))
                    return
                }
                r--
            } else (n !== '$' && n !== '$?' && n !== '$!') || r++
        n = l
    } while (n)
    pr(t)
}
function zt(e) {
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
function Wu(e) {
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
var $n = Math.random().toString(36).slice(2),
    tt = '__reactFiber$' + $n,
    yr = '__reactProps$' + $n,
    mt = '__reactContainer$' + $n,
    Xo = '__reactEvents$' + $n,
    Qd = '__reactListeners$' + $n,
    Yd = '__reactHandles$' + $n
function Kt(e) {
    var t = e[tt]
    if (t) return t
    for (var n = e.parentNode; n; ) {
        if ((t = n[mt] || n[tt])) {
            if (((n = t.alternate), t.child !== null || (n !== null && n.child !== null)))
                for (e = Wu(e); e !== null; ) {
                    if ((n = e[tt])) return n
                    e = Wu(e)
                }
            return t
        }
        ;((e = n), (n = e.parentNode))
    }
    return null
}
function zr(e) {
    return ((e = e[tt] || e[mt]), !e || (e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3) ? null : e)
}
function gn(e) {
    if (e.tag === 5 || e.tag === 6) return e.stateNode
    throw Error(w(33))
}
function Il(e) {
    return e[yr] || null
}
var Zo = [],
    vn = -1
function Ft(e) {
    return { current: e }
}
function K(e) {
    0 > vn || ((e.current = Zo[vn]), (Zo[vn] = null), vn--)
}
function W(e, t) {
    ;(vn++, (Zo[vn] = e.current), (e.current = t))
}
var Dt = {},
    we = Ft(Dt),
    Ne = Ft(!1),
    bt = Dt
function Tn(e, t) {
    var n = e.type.contextTypes
    if (!n) return Dt
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
function Le(e) {
    return ((e = e.childContextTypes), e != null)
}
function ml() {
    ;(K(Ne), K(we))
}
function Qu(e, t, n) {
    if (we.current !== Dt) throw Error(w(168))
    ;(W(we, t), W(Ne, n))
}
function $a(e, t, n) {
    var r = e.stateNode
    if (((t = t.childContextTypes), typeof r.getChildContext != 'function')) return n
    r = r.getChildContext()
    for (var l in r) if (!(l in t)) throw Error(w(108, Tf(e) || 'Unknown', l))
    return ee({}, n, r)
}
function gl(e) {
    return (
        (e = ((e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext) || Dt),
        (bt = we.current),
        W(we, e),
        W(Ne, Ne.current),
        !0
    )
}
function Yu(e, t, n) {
    var r = e.stateNode
    if (!r) throw Error(w(169))
    ;(n ? ((e = $a(e, t, bt)), (r.__reactInternalMemoizedMergedChildContext = e), K(Ne), K(we), W(we, e)) : K(Ne),
        W(Ne, n))
}
var ut = null,
    Fl = !1,
    fo = !1
function Ua(e) {
    ut === null ? (ut = [e]) : ut.push(e)
}
function Kd(e) {
    ;((Fl = !0), Ua(e))
}
function $t() {
    if (!fo && ut !== null) {
        fo = !0
        var e = 0,
            t = B
        try {
            var n = ut
            for (B = 1; e < n.length; e++) {
                var r = n[e]
                do r = r(!0)
                while (r !== null)
            }
            ;((ut = null), (Fl = !1))
        } catch (l) {
            throw (ut !== null && (ut = ut.slice(e + 1)), ca(Li, $t), l)
        } finally {
            ;((B = t), (fo = !1))
        }
    }
    return null
}
var yn = [],
    wn = 0,
    vl = null,
    yl = 0,
    Ue = [],
    Ae = 0,
    en = null,
    ct = 1,
    ft = ''
function Qt(e, t) {
    ;((yn[wn++] = yl), (yn[wn++] = vl), (vl = e), (yl = t))
}
function Aa(e, t, n) {
    ;((Ue[Ae++] = ct), (Ue[Ae++] = ft), (Ue[Ae++] = en), (en = e))
    var r = ct
    e = ft
    var l = 32 - Xe(r) - 1
    ;((r &= ~(1 << l)), (n += 1))
    var o = 32 - Xe(t) + l
    if (30 < o) {
        var i = l - (l % 5)
        ;((o = (r & ((1 << i) - 1)).toString(32)),
            (r >>= i),
            (l -= i),
            (ct = (1 << (32 - Xe(t) + l)) | (n << l) | r),
            (ft = o + e))
    } else ((ct = (1 << o) | (n << l) | r), (ft = e))
}
function Fi(e) {
    e.return !== null && (Qt(e, 1), Aa(e, 1, 0))
}
function $i(e) {
    for (; e === vl; ) ((vl = yn[--wn]), (yn[wn] = null), (yl = yn[--wn]), (yn[wn] = null))
    for (; e === en; )
        ((en = Ue[--Ae]), (Ue[Ae] = null), (ft = Ue[--Ae]), (Ue[Ae] = null), (ct = Ue[--Ae]), (Ue[Ae] = null))
}
var Oe = null,
    Re = null,
    X = !1,
    Ge = null
function Va(e, t) {
    var n = Ve(5, null, null, 0)
    ;((n.elementType = 'DELETED'),
        (n.stateNode = t),
        (n.return = e),
        (t = e.deletions),
        t === null ? ((e.deletions = [n]), (e.flags |= 16)) : t.push(n))
}
function Ku(e, t) {
    switch (e.tag) {
        case 5:
            var n = e.type
            return (
                (t = t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase() ? null : t),
                t !== null ? ((e.stateNode = t), (Oe = e), (Re = zt(t.firstChild)), !0) : !1
            )
        case 6:
            return (
                (t = e.pendingProps === '' || t.nodeType !== 3 ? null : t),
                t !== null ? ((e.stateNode = t), (Oe = e), (Re = null), !0) : !1
            )
        case 13:
            return (
                (t = t.nodeType !== 8 ? null : t),
                t !== null
                    ? ((n = en !== null ? { id: ct, overflow: ft } : null),
                      (e.memoizedState = { dehydrated: t, treeContext: n, retryLane: 1073741824 }),
                      (n = Ve(18, null, null, 0)),
                      (n.stateNode = t),
                      (n.return = e),
                      (e.child = n),
                      (Oe = e),
                      (Re = null),
                      !0)
                    : !1
            )
        default:
            return !1
    }
}
function Jo(e) {
    return (e.mode & 1) !== 0 && (e.flags & 128) === 0
}
function qo(e) {
    if (X) {
        var t = Re
        if (t) {
            var n = t
            if (!Ku(e, t)) {
                if (Jo(e)) throw Error(w(418))
                t = zt(n.nextSibling)
                var r = Oe
                t && Ku(e, t) ? Va(r, n) : ((e.flags = (e.flags & -4097) | 2), (X = !1), (Oe = e))
            }
        } else {
            if (Jo(e)) throw Error(w(418))
            ;((e.flags = (e.flags & -4097) | 2), (X = !1), (Oe = e))
        }
    }
}
function Gu(e) {
    for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; ) e = e.return
    Oe = e
}
function Hr(e) {
    if (e !== Oe) return !1
    if (!X) return (Gu(e), (X = !0), !1)
    var t
    if (
        ((t = e.tag !== 3) &&
            !(t = e.tag !== 5) &&
            ((t = e.type), (t = t !== 'head' && t !== 'body' && !Ko(e.type, e.memoizedProps))),
        t && (t = Re))
    ) {
        if (Jo(e)) throw (Ha(), Error(w(418)))
        for (; t; ) (Va(e, t), (t = zt(t.nextSibling)))
    }
    if ((Gu(e), e.tag === 13)) {
        if (((e = e.memoizedState), (e = e !== null ? e.dehydrated : null), !e)) throw Error(w(317))
        e: {
            for (e = e.nextSibling, t = 0; e; ) {
                if (e.nodeType === 8) {
                    var n = e.data
                    if (n === '/$') {
                        if (t === 0) {
                            Re = zt(e.nextSibling)
                            break e
                        }
                        t--
                    } else (n !== '$' && n !== '$!' && n !== '$?') || t++
                }
                e = e.nextSibling
            }
            Re = null
        }
    } else Re = Oe ? zt(e.stateNode.nextSibling) : null
    return !0
}
function Ha() {
    for (var e = Re; e; ) e = zt(e.nextSibling)
}
function Mn() {
    ;((Re = Oe = null), (X = !1))
}
function Ui(e) {
    Ge === null ? (Ge = [e]) : Ge.push(e)
}
var Gd = yt.ReactCurrentBatchConfig
function Qn(e, t, n) {
    if (((e = n.ref), e !== null && typeof e != 'function' && typeof e != 'object')) {
        if (n._owner) {
            if (((n = n._owner), n)) {
                if (n.tag !== 1) throw Error(w(309))
                var r = n.stateNode
            }
            if (!r) throw Error(w(147, e))
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
        if (typeof e != 'string') throw Error(w(284))
        if (!n._owner) throw Error(w(290, e))
    }
    return e
}
function Br(e, t) {
    throw (
        (e = Object.prototype.toString.call(t)),
        Error(w(31, e === '[object Object]' ? 'object with keys {' + Object.keys(t).join(', ') + '}' : e))
    )
}
function Xu(e) {
    var t = e._init
    return t(e._payload)
}
function Ba(e) {
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
        return ((f = jt(f, c)), (f.index = 0), (f.sibling = null), f)
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
    function u(f, c, p, v) {
        return c === null || c.tag !== 6
            ? ((c = wo(p, f.mode, v)), (c.return = f), c)
            : ((c = l(c, p)), (c.return = f), c)
    }
    function s(f, c, p, v) {
        var x = p.type
        return x === dn
            ? m(f, c, p.props.children, v, p.key)
            : c !== null &&
                (c.elementType === x || (typeof x == 'object' && x !== null && x.$$typeof === St && Xu(x) === c.type))
              ? ((v = l(c, p.props)), (v.ref = Qn(f, c, p)), (v.return = f), v)
              : ((v = ol(p.type, p.key, p.props, null, f.mode, v)), (v.ref = Qn(f, c, p)), (v.return = f), v)
    }
    function a(f, c, p, v) {
        return c === null ||
            c.tag !== 4 ||
            c.stateNode.containerInfo !== p.containerInfo ||
            c.stateNode.implementation !== p.implementation
            ? ((c = So(p, f.mode, v)), (c.return = f), c)
            : ((c = l(c, p.children || [])), (c.return = f), c)
    }
    function m(f, c, p, v, x) {
        return c === null || c.tag !== 7
            ? ((c = qt(p, f.mode, v, x)), (c.return = f), c)
            : ((c = l(c, p)), (c.return = f), c)
    }
    function h(f, c, p) {
        if ((typeof c == 'string' && c !== '') || typeof c == 'number')
            return ((c = wo('' + c, f.mode, p)), (c.return = f), c)
        if (typeof c == 'object' && c !== null) {
            switch (c.$$typeof) {
                case Rr:
                    return (
                        (p = ol(c.type, c.key, c.props, null, f.mode, p)),
                        (p.ref = Qn(f, null, c)),
                        (p.return = f),
                        p
                    )
                case fn:
                    return ((c = So(c, f.mode, p)), (c.return = f), c)
                case St:
                    var v = c._init
                    return h(f, v(c._payload), p)
            }
            if (Zn(c) || An(c)) return ((c = qt(c, f.mode, p, null)), (c.return = f), c)
            Br(f, c)
        }
        return null
    }
    function d(f, c, p, v) {
        var x = c !== null ? c.key : null
        if ((typeof p == 'string' && p !== '') || typeof p == 'number') return x !== null ? null : u(f, c, '' + p, v)
        if (typeof p == 'object' && p !== null) {
            switch (p.$$typeof) {
                case Rr:
                    return p.key === x ? s(f, c, p, v) : null
                case fn:
                    return p.key === x ? a(f, c, p, v) : null
                case St:
                    return ((x = p._init), d(f, c, x(p._payload), v))
            }
            if (Zn(p) || An(p)) return x !== null ? null : m(f, c, p, v, null)
            Br(f, p)
        }
        return null
    }
    function g(f, c, p, v, x) {
        if ((typeof v == 'string' && v !== '') || typeof v == 'number')
            return ((f = f.get(p) || null), u(c, f, '' + v, x))
        if (typeof v == 'object' && v !== null) {
            switch (v.$$typeof) {
                case Rr:
                    return ((f = f.get(v.key === null ? p : v.key) || null), s(c, f, v, x))
                case fn:
                    return ((f = f.get(v.key === null ? p : v.key) || null), a(c, f, v, x))
                case St:
                    var z = v._init
                    return g(f, c, p, z(v._payload), x)
            }
            if (Zn(v) || An(v)) return ((f = f.get(p) || null), m(c, f, v, x, null))
            Br(c, v)
        }
        return null
    }
    function y(f, c, p, v) {
        for (var x = null, z = null, T = c, M = (c = 0), R = null; T !== null && M < p.length; M++) {
            T.index > M ? ((R = T), (T = null)) : (R = T.sibling)
            var k = d(f, T, p[M], v)
            if (k === null) {
                T === null && (T = R)
                break
            }
            ;(e && T && k.alternate === null && t(f, T),
                (c = o(k, c, M)),
                z === null ? (x = k) : (z.sibling = k),
                (z = k),
                (T = R))
        }
        if (M === p.length) return (n(f, T), X && Qt(f, M), x)
        if (T === null) {
            for (; M < p.length; M++)
                ((T = h(f, p[M], v)), T !== null && ((c = o(T, c, M)), z === null ? (x = T) : (z.sibling = T), (z = T)))
            return (X && Qt(f, M), x)
        }
        for (T = r(f, T); M < p.length; M++)
            ((R = g(T, f, M, p[M], v)),
                R !== null &&
                    (e && R.alternate !== null && T.delete(R.key === null ? M : R.key),
                    (c = o(R, c, M)),
                    z === null ? (x = R) : (z.sibling = R),
                    (z = R)))
        return (
            e &&
                T.forEach(function (te) {
                    return t(f, te)
                }),
            X && Qt(f, M),
            x
        )
    }
    function S(f, c, p, v) {
        var x = An(p)
        if (typeof x != 'function') throw Error(w(150))
        if (((p = x.call(p)), p == null)) throw Error(w(151))
        for (var z = (x = null), T = c, M = (c = 0), R = null, k = p.next(); T !== null && !k.done; M++, k = p.next()) {
            T.index > M ? ((R = T), (T = null)) : (R = T.sibling)
            var te = d(f, T, k.value, v)
            if (te === null) {
                T === null && (T = R)
                break
            }
            ;(e && T && te.alternate === null && t(f, T),
                (c = o(te, c, M)),
                z === null ? (x = te) : (z.sibling = te),
                (z = te),
                (T = R))
        }
        if (k.done) return (n(f, T), X && Qt(f, M), x)
        if (T === null) {
            for (; !k.done; M++, k = p.next())
                ((k = h(f, k.value, v)),
                    k !== null && ((c = o(k, c, M)), z === null ? (x = k) : (z.sibling = k), (z = k)))
            return (X && Qt(f, M), x)
        }
        for (T = r(f, T); !k.done; M++, k = p.next())
            ((k = g(T, f, M, k.value, v)),
                k !== null &&
                    (e && k.alternate !== null && T.delete(k.key === null ? M : k.key),
                    (c = o(k, c, M)),
                    z === null ? (x = k) : (z.sibling = k),
                    (z = k)))
        return (
            e &&
                T.forEach(function (le) {
                    return t(f, le)
                }),
            X && Qt(f, M),
            x
        )
    }
    function F(f, c, p, v) {
        if (
            (typeof p == 'object' && p !== null && p.type === dn && p.key === null && (p = p.props.children),
            typeof p == 'object' && p !== null)
        ) {
            switch (p.$$typeof) {
                case Rr:
                    e: {
                        for (var x = p.key, z = c; z !== null; ) {
                            if (z.key === x) {
                                if (((x = p.type), x === dn)) {
                                    if (z.tag === 7) {
                                        ;(n(f, z.sibling), (c = l(z, p.props.children)), (c.return = f), (f = c))
                                        break e
                                    }
                                } else if (
                                    z.elementType === x ||
                                    (typeof x == 'object' && x !== null && x.$$typeof === St && Xu(x) === z.type)
                                ) {
                                    ;(n(f, z.sibling),
                                        (c = l(z, p.props)),
                                        (c.ref = Qn(f, z, p)),
                                        (c.return = f),
                                        (f = c))
                                    break e
                                }
                                n(f, z)
                                break
                            } else t(f, z)
                            z = z.sibling
                        }
                        p.type === dn
                            ? ((c = qt(p.props.children, f.mode, v, p.key)), (c.return = f), (f = c))
                            : ((v = ol(p.type, p.key, p.props, null, f.mode, v)),
                              (v.ref = Qn(f, c, p)),
                              (v.return = f),
                              (f = v))
                    }
                    return i(f)
                case fn:
                    e: {
                        for (z = p.key; c !== null; ) {
                            if (c.key === z)
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
                        ;((c = So(p, f.mode, v)), (c.return = f), (f = c))
                    }
                    return i(f)
                case St:
                    return ((z = p._init), F(f, c, z(p._payload), v))
            }
            if (Zn(p)) return y(f, c, p, v)
            if (An(p)) return S(f, c, p, v)
            Br(f, p)
        }
        return (typeof p == 'string' && p !== '') || typeof p == 'number'
            ? ((p = '' + p),
              c !== null && c.tag === 6
                  ? (n(f, c.sibling), (c = l(c, p)), (c.return = f), (f = c))
                  : (n(f, c), (c = wo(p, f.mode, v)), (c.return = f), (f = c)),
              i(f))
            : n(f, c)
    }
    return F
}
var Rn = Ba(!0),
    Wa = Ba(!1),
    wl = Ft(null),
    Sl = null,
    Sn = null,
    Ai = null
function Vi() {
    Ai = Sn = Sl = null
}
function Hi(e) {
    var t = wl.current
    ;(K(wl), (e._currentValue = t))
}
function bo(e, t, n) {
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
function Nn(e, t) {
    ;((Sl = e),
        (Ai = Sn = null),
        (e = e.dependencies),
        e !== null && e.firstContext !== null && (e.lanes & t && (_e = !0), (e.firstContext = null)))
}
function Be(e) {
    var t = e._currentValue
    if (Ai !== e)
        if (((e = { context: e, memoizedValue: t, next: null }), Sn === null)) {
            if (Sl === null) throw Error(w(308))
            ;((Sn = e), (Sl.dependencies = { lanes: 0, firstContext: e }))
        } else Sn = Sn.next = e
    return t
}
var Gt = null
function Bi(e) {
    Gt === null ? (Gt = [e]) : Gt.push(e)
}
function Qa(e, t, n, r) {
    var l = t.interleaved
    return (l === null ? ((n.next = n), Bi(t)) : ((n.next = l.next), (l.next = n)), (t.interleaved = n), gt(e, r))
}
function gt(e, t) {
    e.lanes |= t
    var n = e.alternate
    for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null; )
        ((e.childLanes |= t), (n = e.alternate), n !== null && (n.childLanes |= t), (n = e), (e = e.return))
    return n.tag === 3 ? n.stateNode : null
}
var kt = !1
function Wi(e) {
    e.updateQueue = {
        baseState: e.memoizedState,
        firstBaseUpdate: null,
        lastBaseUpdate: null,
        shared: { pending: null, interleaved: null, lanes: 0 },
        effects: null,
    }
}
function Ya(e, t) {
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
function pt(e, t) {
    return { eventTime: e, lane: t, tag: 0, payload: null, callback: null, next: null }
}
function Tt(e, t, n) {
    var r = e.updateQueue
    if (r === null) return null
    if (((r = r.shared), H & 2)) {
        var l = r.pending
        return (l === null ? (t.next = t) : ((t.next = l.next), (l.next = t)), (r.pending = t), gt(e, n))
    }
    return (
        (l = r.interleaved),
        l === null ? ((t.next = t), Bi(r)) : ((t.next = l.next), (l.next = t)),
        (r.interleaved = t),
        gt(e, n)
    )
}
function br(e, t, n) {
    if (((t = t.updateQueue), t !== null && ((t = t.shared), (n & 4194240) !== 0))) {
        var r = t.lanes
        ;((r &= e.pendingLanes), (n |= r), (t.lanes = n), zi(e, n))
    }
}
function Zu(e, t) {
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
function kl(e, t, n, r) {
    var l = e.updateQueue
    kt = !1
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
                    var y = e,
                        S = u
                    switch (((d = t), (g = n), S.tag)) {
                        case 1:
                            if (((y = S.payload), typeof y == 'function')) {
                                h = y.call(g, h, d)
                                break e
                            }
                            h = y
                            break e
                        case 3:
                            y.flags = (y.flags & -65537) | 128
                        case 0:
                            if (((y = S.payload), (d = typeof y == 'function' ? y.call(g, h, d) : y), d == null))
                                break e
                            h = ee({}, h, d)
                            break e
                        case 2:
                            kt = !0
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
        ;((nn |= i), (e.lanes = i), (e.memoizedState = h))
    }
}
function Ju(e, t, n) {
    if (((e = t.effects), (t.effects = null), e !== null))
        for (t = 0; t < e.length; t++) {
            var r = e[t],
                l = r.callback
            if (l !== null) {
                if (((r.callback = null), (r = n), typeof l != 'function')) throw Error(w(191, l))
                l.call(r)
            }
        }
}
var Tr = {},
    rt = Ft(Tr),
    wr = Ft(Tr),
    Sr = Ft(Tr)
function Xt(e) {
    if (e === Tr) throw Error(w(174))
    return e
}
function Qi(e, t) {
    switch ((W(Sr, t), W(wr, e), W(rt, Tr), (e = t.nodeType), e)) {
        case 9:
        case 11:
            t = (t = t.documentElement) ? t.namespaceURI : jo(null, '')
            break
        default:
            ;((e = e === 8 ? t.parentNode : t), (t = e.namespaceURI || null), (e = e.tagName), (t = jo(t, e)))
    }
    ;(K(rt), W(rt, t))
}
function jn() {
    ;(K(rt), K(wr), K(Sr))
}
function Ka(e) {
    Xt(Sr.current)
    var t = Xt(rt.current),
        n = jo(t, e.type)
    t !== n && (W(wr, e), W(rt, n))
}
function Yi(e) {
    wr.current === e && (K(rt), K(wr))
}
var q = Ft(0)
function xl(e) {
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
var po = []
function Ki() {
    for (var e = 0; e < po.length; e++) po[e]._workInProgressVersionPrimary = null
    po.length = 0
}
var el = yt.ReactCurrentDispatcher,
    ho = yt.ReactCurrentBatchConfig,
    tn = 0,
    b = null,
    se = null,
    ce = null,
    El = !1,
    lr = !1,
    kr = 0,
    Xd = 0
function ge() {
    throw Error(w(321))
}
function Gi(e, t) {
    if (t === null) return !1
    for (var n = 0; n < t.length && n < e.length; n++) if (!Je(e[n], t[n])) return !1
    return !0
}
function Xi(e, t, n, r, l, o) {
    if (
        ((tn = o),
        (b = t),
        (t.memoizedState = null),
        (t.updateQueue = null),
        (t.lanes = 0),
        (el.current = e === null || e.memoizedState === null ? bd : ep),
        (e = n(r, l)),
        lr)
    ) {
        o = 0
        do {
            if (((lr = !1), (kr = 0), 25 <= o)) throw Error(w(301))
            ;((o += 1), (ce = se = null), (t.updateQueue = null), (el.current = tp), (e = n(r, l)))
        } while (lr)
    }
    if (((el.current = Cl), (t = se !== null && se.next !== null), (tn = 0), (ce = se = b = null), (El = !1), t))
        throw Error(w(300))
    return e
}
function Zi() {
    var e = kr !== 0
    return ((kr = 0), e)
}
function et() {
    var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null }
    return (ce === null ? (b.memoizedState = ce = e) : (ce = ce.next = e), ce)
}
function We() {
    if (se === null) {
        var e = b.alternate
        e = e !== null ? e.memoizedState : null
    } else e = se.next
    var t = ce === null ? b.memoizedState : ce.next
    if (t !== null) ((ce = t), (se = e))
    else {
        if (e === null) throw Error(w(310))
        ;((se = e),
            (e = {
                memoizedState: se.memoizedState,
                baseState: se.baseState,
                baseQueue: se.baseQueue,
                queue: se.queue,
                next: null,
            }),
            ce === null ? (b.memoizedState = ce = e) : (ce = ce.next = e))
    }
    return ce
}
function xr(e, t) {
    return typeof t == 'function' ? t(e) : t
}
function mo(e) {
    var t = We(),
        n = t.queue
    if (n === null) throw Error(w(311))
    n.lastRenderedReducer = e
    var r = se,
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
            if ((tn & m) === m)
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
                ;(s === null ? ((u = s = h), (i = r)) : (s = s.next = h), (b.lanes |= m), (nn |= m))
            }
            a = a.next
        } while (a !== null && a !== o)
        ;(s === null ? (i = r) : (s.next = u),
            Je(r, t.memoizedState) || (_e = !0),
            (t.memoizedState = r),
            (t.baseState = i),
            (t.baseQueue = s),
            (n.lastRenderedState = r))
    }
    if (((e = n.interleaved), e !== null)) {
        l = e
        do ((o = l.lane), (b.lanes |= o), (nn |= o), (l = l.next))
        while (l !== e)
    } else l === null && (n.lanes = 0)
    return [t.memoizedState, n.dispatch]
}
function go(e) {
    var t = We(),
        n = t.queue
    if (n === null) throw Error(w(311))
    n.lastRenderedReducer = e
    var r = n.dispatch,
        l = n.pending,
        o = t.memoizedState
    if (l !== null) {
        n.pending = null
        var i = (l = l.next)
        do ((o = e(o, i.action)), (i = i.next))
        while (i !== l)
        ;(Je(o, t.memoizedState) || (_e = !0),
            (t.memoizedState = o),
            t.baseQueue === null && (t.baseState = o),
            (n.lastRenderedState = o))
    }
    return [o, r]
}
function Ga() {}
function Xa(e, t) {
    var n = b,
        r = We(),
        l = t(),
        o = !Je(r.memoizedState, l)
    if (
        (o && ((r.memoizedState = l), (_e = !0)),
        (r = r.queue),
        Ji(qa.bind(null, n, r, e), [e]),
        r.getSnapshot !== t || o || (ce !== null && ce.memoizedState.tag & 1))
    ) {
        if (((n.flags |= 2048), Er(9, Ja.bind(null, n, r, l, t), void 0, null), fe === null)) throw Error(w(349))
        tn & 30 || Za(n, t, l)
    }
    return l
}
function Za(e, t, n) {
    ;((e.flags |= 16384),
        (e = { getSnapshot: t, value: n }),
        (t = b.updateQueue),
        t === null
            ? ((t = { lastEffect: null, stores: null }), (b.updateQueue = t), (t.stores = [e]))
            : ((n = t.stores), n === null ? (t.stores = [e]) : n.push(e)))
}
function Ja(e, t, n, r) {
    ;((t.value = n), (t.getSnapshot = r), ba(t) && ec(e))
}
function qa(e, t, n) {
    return n(function () {
        ba(t) && ec(e)
    })
}
function ba(e) {
    var t = e.getSnapshot
    e = e.value
    try {
        var n = t()
        return !Je(e, n)
    } catch {
        return !0
    }
}
function ec(e) {
    var t = gt(e, 1)
    t !== null && Ze(t, e, 1, -1)
}
function qu(e) {
    var t = et()
    return (
        typeof e == 'function' && (e = e()),
        (t.memoizedState = t.baseState = e),
        (e = {
            pending: null,
            interleaved: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: xr,
            lastRenderedState: e,
        }),
        (t.queue = e),
        (e = e.dispatch = qd.bind(null, b, e)),
        [t.memoizedState, e]
    )
}
function Er(e, t, n, r) {
    return (
        (e = { tag: e, create: t, destroy: n, deps: r, next: null }),
        (t = b.updateQueue),
        t === null
            ? ((t = { lastEffect: null, stores: null }), (b.updateQueue = t), (t.lastEffect = e.next = e))
            : ((n = t.lastEffect),
              n === null
                  ? (t.lastEffect = e.next = e)
                  : ((r = n.next), (n.next = e), (e.next = r), (t.lastEffect = e))),
        e
    )
}
function tc() {
    return We().memoizedState
}
function tl(e, t, n, r) {
    var l = et()
    ;((b.flags |= e), (l.memoizedState = Er(1 | t, n, void 0, r === void 0 ? null : r)))
}
function $l(e, t, n, r) {
    var l = We()
    r = r === void 0 ? null : r
    var o = void 0
    if (se !== null) {
        var i = se.memoizedState
        if (((o = i.destroy), r !== null && Gi(r, i.deps))) {
            l.memoizedState = Er(t, n, o, r)
            return
        }
    }
    ;((b.flags |= e), (l.memoizedState = Er(1 | t, n, o, r)))
}
function bu(e, t) {
    return tl(8390656, 8, e, t)
}
function Ji(e, t) {
    return $l(2048, 8, e, t)
}
function nc(e, t) {
    return $l(4, 2, e, t)
}
function rc(e, t) {
    return $l(4, 4, e, t)
}
function lc(e, t) {
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
function oc(e, t, n) {
    return ((n = n != null ? n.concat([e]) : null), $l(4, 4, lc.bind(null, t, e), n))
}
function qi() {}
function ic(e, t) {
    var n = We()
    t = t === void 0 ? null : t
    var r = n.memoizedState
    return r !== null && t !== null && Gi(t, r[1]) ? r[0] : ((n.memoizedState = [e, t]), e)
}
function uc(e, t) {
    var n = We()
    t = t === void 0 ? null : t
    var r = n.memoizedState
    return r !== null && t !== null && Gi(t, r[1]) ? r[0] : ((e = e()), (n.memoizedState = [e, t]), e)
}
function sc(e, t, n) {
    return tn & 21
        ? (Je(n, t) || ((n = pa()), (b.lanes |= n), (nn |= n), (e.baseState = !0)), t)
        : (e.baseState && ((e.baseState = !1), (_e = !0)), (e.memoizedState = n))
}
function Zd(e, t) {
    var n = B
    ;((B = n !== 0 && 4 > n ? n : 4), e(!0))
    var r = ho.transition
    ho.transition = {}
    try {
        ;(e(!1), t())
    } finally {
        ;((B = n), (ho.transition = r))
    }
}
function ac() {
    return We().memoizedState
}
function Jd(e, t, n) {
    var r = Rt(e)
    if (((n = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null }), cc(e))) fc(t, n)
    else if (((n = Qa(e, t, n, r)), n !== null)) {
        var l = ke()
        ;(Ze(n, e, r, l), dc(n, t, r))
    }
}
function qd(e, t, n) {
    var r = Rt(e),
        l = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null }
    if (cc(e)) fc(t, l)
    else {
        var o = e.alternate
        if (e.lanes === 0 && (o === null || o.lanes === 0) && ((o = t.lastRenderedReducer), o !== null))
            try {
                var i = t.lastRenderedState,
                    u = o(i, n)
                if (((l.hasEagerState = !0), (l.eagerState = u), Je(u, i))) {
                    var s = t.interleaved
                    ;(s === null ? ((l.next = l), Bi(t)) : ((l.next = s.next), (s.next = l)), (t.interleaved = l))
                    return
                }
            } catch {
            } finally {
            }
        ;((n = Qa(e, t, l, r)), n !== null && ((l = ke()), Ze(n, e, r, l), dc(n, t, r)))
    }
}
function cc(e) {
    var t = e.alternate
    return e === b || (t !== null && t === b)
}
function fc(e, t) {
    lr = El = !0
    var n = e.pending
    ;(n === null ? (t.next = t) : ((t.next = n.next), (n.next = t)), (e.pending = t))
}
function dc(e, t, n) {
    if (n & 4194240) {
        var r = t.lanes
        ;((r &= e.pendingLanes), (n |= r), (t.lanes = n), zi(e, n))
    }
}
var Cl = {
        readContext: Be,
        useCallback: ge,
        useContext: ge,
        useEffect: ge,
        useImperativeHandle: ge,
        useInsertionEffect: ge,
        useLayoutEffect: ge,
        useMemo: ge,
        useReducer: ge,
        useRef: ge,
        useState: ge,
        useDebugValue: ge,
        useDeferredValue: ge,
        useTransition: ge,
        useMutableSource: ge,
        useSyncExternalStore: ge,
        useId: ge,
        unstable_isNewReconciler: !1,
    },
    bd = {
        readContext: Be,
        useCallback: function (e, t) {
            return ((et().memoizedState = [e, t === void 0 ? null : t]), e)
        },
        useContext: Be,
        useEffect: bu,
        useImperativeHandle: function (e, t, n) {
            return ((n = n != null ? n.concat([e]) : null), tl(4194308, 4, lc.bind(null, t, e), n))
        },
        useLayoutEffect: function (e, t) {
            return tl(4194308, 4, e, t)
        },
        useInsertionEffect: function (e, t) {
            return tl(4, 2, e, t)
        },
        useMemo: function (e, t) {
            var n = et()
            return ((t = t === void 0 ? null : t), (e = e()), (n.memoizedState = [e, t]), e)
        },
        useReducer: function (e, t, n) {
            var r = et()
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
                (e = e.dispatch = Jd.bind(null, b, e)),
                [r.memoizedState, e]
            )
        },
        useRef: function (e) {
            var t = et()
            return ((e = { current: e }), (t.memoizedState = e))
        },
        useState: qu,
        useDebugValue: qi,
        useDeferredValue: function (e) {
            return (et().memoizedState = e)
        },
        useTransition: function () {
            var e = qu(!1),
                t = e[0]
            return ((e = Zd.bind(null, e[1])), (et().memoizedState = e), [t, e])
        },
        useMutableSource: function () {},
        useSyncExternalStore: function (e, t, n) {
            var r = b,
                l = et()
            if (X) {
                if (n === void 0) throw Error(w(407))
                n = n()
            } else {
                if (((n = t()), fe === null)) throw Error(w(349))
                tn & 30 || Za(r, t, n)
            }
            l.memoizedState = n
            var o = { value: n, getSnapshot: t }
            return (
                (l.queue = o),
                bu(qa.bind(null, r, o, e), [e]),
                (r.flags |= 2048),
                Er(9, Ja.bind(null, r, o, n, t), void 0, null),
                n
            )
        },
        useId: function () {
            var e = et(),
                t = fe.identifierPrefix
            if (X) {
                var n = ft,
                    r = ct
                ;((n = (r & ~(1 << (32 - Xe(r) - 1))).toString(32) + n),
                    (t = ':' + t + 'R' + n),
                    (n = kr++),
                    0 < n && (t += 'H' + n.toString(32)),
                    (t += ':'))
            } else ((n = Xd++), (t = ':' + t + 'r' + n.toString(32) + ':'))
            return (e.memoizedState = t)
        },
        unstable_isNewReconciler: !1,
    },
    ep = {
        readContext: Be,
        useCallback: ic,
        useContext: Be,
        useEffect: Ji,
        useImperativeHandle: oc,
        useInsertionEffect: nc,
        useLayoutEffect: rc,
        useMemo: uc,
        useReducer: mo,
        useRef: tc,
        useState: function () {
            return mo(xr)
        },
        useDebugValue: qi,
        useDeferredValue: function (e) {
            var t = We()
            return sc(t, se.memoizedState, e)
        },
        useTransition: function () {
            var e = mo(xr)[0],
                t = We().memoizedState
            return [e, t]
        },
        useMutableSource: Ga,
        useSyncExternalStore: Xa,
        useId: ac,
        unstable_isNewReconciler: !1,
    },
    tp = {
        readContext: Be,
        useCallback: ic,
        useContext: Be,
        useEffect: Ji,
        useImperativeHandle: oc,
        useInsertionEffect: nc,
        useLayoutEffect: rc,
        useMemo: uc,
        useReducer: go,
        useRef: tc,
        useState: function () {
            return go(xr)
        },
        useDebugValue: qi,
        useDeferredValue: function (e) {
            var t = We()
            return se === null ? (t.memoizedState = e) : sc(t, se.memoizedState, e)
        },
        useTransition: function () {
            var e = go(xr)[0],
                t = We().memoizedState
            return [e, t]
        },
        useMutableSource: Ga,
        useSyncExternalStore: Xa,
        useId: ac,
        unstable_isNewReconciler: !1,
    }
function Ye(e, t) {
    if (e && e.defaultProps) {
        ;((t = ee({}, t)), (e = e.defaultProps))
        for (var n in e) t[n] === void 0 && (t[n] = e[n])
        return t
    }
    return t
}
function ei(e, t, n, r) {
    ;((t = e.memoizedState),
        (n = n(r, t)),
        (n = n == null ? t : ee({}, t, n)),
        (e.memoizedState = n),
        e.lanes === 0 && (e.updateQueue.baseState = n))
}
var Ul = {
    isMounted: function (e) {
        return (e = e._reactInternals) ? on(e) === e : !1
    },
    enqueueSetState: function (e, t, n) {
        e = e._reactInternals
        var r = ke(),
            l = Rt(e),
            o = pt(r, l)
        ;((o.payload = t),
            n != null && (o.callback = n),
            (t = Tt(e, o, l)),
            t !== null && (Ze(t, e, l, r), br(t, e, l)))
    },
    enqueueReplaceState: function (e, t, n) {
        e = e._reactInternals
        var r = ke(),
            l = Rt(e),
            o = pt(r, l)
        ;((o.tag = 1),
            (o.payload = t),
            n != null && (o.callback = n),
            (t = Tt(e, o, l)),
            t !== null && (Ze(t, e, l, r), br(t, e, l)))
    },
    enqueueForceUpdate: function (e, t) {
        e = e._reactInternals
        var n = ke(),
            r = Rt(e),
            l = pt(n, r)
        ;((l.tag = 2), t != null && (l.callback = t), (t = Tt(e, l, r)), t !== null && (Ze(t, e, r, n), br(t, e, r)))
    },
}
function es(e, t, n, r, l, o, i) {
    return (
        (e = e.stateNode),
        typeof e.shouldComponentUpdate == 'function'
            ? e.shouldComponentUpdate(r, o, i)
            : t.prototype && t.prototype.isPureReactComponent
              ? !mr(n, r) || !mr(l, o)
              : !0
    )
}
function pc(e, t, n) {
    var r = !1,
        l = Dt,
        o = t.contextType
    return (
        typeof o == 'object' && o !== null
            ? (o = Be(o))
            : ((l = Le(t) ? bt : we.current), (r = t.contextTypes), (o = (r = r != null) ? Tn(e, l) : Dt)),
        (t = new t(n, o)),
        (e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null),
        (t.updater = Ul),
        (e.stateNode = t),
        (t._reactInternals = e),
        r &&
            ((e = e.stateNode),
            (e.__reactInternalMemoizedUnmaskedChildContext = l),
            (e.__reactInternalMemoizedMaskedChildContext = o)),
        t
    )
}
function ts(e, t, n, r) {
    ;((e = t.state),
        typeof t.componentWillReceiveProps == 'function' && t.componentWillReceiveProps(n, r),
        typeof t.UNSAFE_componentWillReceiveProps == 'function' && t.UNSAFE_componentWillReceiveProps(n, r),
        t.state !== e && Ul.enqueueReplaceState(t, t.state, null))
}
function ti(e, t, n, r) {
    var l = e.stateNode
    ;((l.props = n), (l.state = e.memoizedState), (l.refs = {}), Wi(e))
    var o = t.contextType
    ;(typeof o == 'object' && o !== null
        ? (l.context = Be(o))
        : ((o = Le(t) ? bt : we.current), (l.context = Tn(e, o))),
        (l.state = e.memoizedState),
        (o = t.getDerivedStateFromProps),
        typeof o == 'function' && (ei(e, t, o, n), (l.state = e.memoizedState)),
        typeof t.getDerivedStateFromProps == 'function' ||
            typeof l.getSnapshotBeforeUpdate == 'function' ||
            (typeof l.UNSAFE_componentWillMount != 'function' && typeof l.componentWillMount != 'function') ||
            ((t = l.state),
            typeof l.componentWillMount == 'function' && l.componentWillMount(),
            typeof l.UNSAFE_componentWillMount == 'function' && l.UNSAFE_componentWillMount(),
            t !== l.state && Ul.enqueueReplaceState(l, l.state, null),
            kl(e, n, l, r),
            (l.state = e.memoizedState)),
        typeof l.componentDidMount == 'function' && (e.flags |= 4194308))
}
function On(e, t) {
    try {
        var n = '',
            r = t
        do ((n += zf(r)), (r = r.return))
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
function vo(e, t, n) {
    return { value: e, source: null, stack: n ?? null, digest: t ?? null }
}
function ni(e, t) {
    try {
        console.error(t.value)
    } catch (n) {
        setTimeout(function () {
            throw n
        })
    }
}
var np = typeof WeakMap == 'function' ? WeakMap : Map
function hc(e, t, n) {
    ;((n = pt(-1, n)), (n.tag = 3), (n.payload = { element: null }))
    var r = t.value
    return (
        (n.callback = function () {
            ;(_l || ((_l = !0), (di = r)), ni(e, t))
        }),
        n
    )
}
function mc(e, t, n) {
    ;((n = pt(-1, n)), (n.tag = 3))
    var r = e.type.getDerivedStateFromError
    if (typeof r == 'function') {
        var l = t.value
        ;((n.payload = function () {
            return r(l)
        }),
            (n.callback = function () {
                ni(e, t)
            }))
    }
    var o = e.stateNode
    return (
        o !== null &&
            typeof o.componentDidCatch == 'function' &&
            (n.callback = function () {
                ;(ni(e, t), typeof r != 'function' && (Mt === null ? (Mt = new Set([this])) : Mt.add(this)))
                var i = t.stack
                this.componentDidCatch(t.value, { componentStack: i !== null ? i : '' })
            }),
        n
    )
}
function ns(e, t, n) {
    var r = e.pingCache
    if (r === null) {
        r = e.pingCache = new np()
        var l = new Set()
        r.set(t, l)
    } else ((l = r.get(t)), l === void 0 && ((l = new Set()), r.set(t, l)))
    l.has(n) || (l.add(n), (e = gp.bind(null, e, t, n)), t.then(e, e))
}
function rs(e) {
    do {
        var t
        if (((t = e.tag === 13) && ((t = e.memoizedState), (t = t !== null ? t.dehydrated !== null : !0)), t)) return e
        e = e.return
    } while (e !== null)
    return null
}
function ls(e, t, n, r, l) {
    return e.mode & 1
        ? ((e.flags |= 65536), (e.lanes = l), e)
        : (e === t
              ? (e.flags |= 65536)
              : ((e.flags |= 128),
                (n.flags |= 131072),
                (n.flags &= -52805),
                n.tag === 1 && (n.alternate === null ? (n.tag = 17) : ((t = pt(-1, 1)), (t.tag = 2), Tt(n, t, 1))),
                (n.lanes |= 1)),
          e)
}
var rp = yt.ReactCurrentOwner,
    _e = !1
function Se(e, t, n, r) {
    t.child = e === null ? Wa(t, null, n, r) : Rn(t, e.child, n, r)
}
function os(e, t, n, r, l) {
    n = n.render
    var o = t.ref
    return (
        Nn(t, l),
        (r = Xi(e, t, n, r, o, l)),
        (n = Zi()),
        e !== null && !_e
            ? ((t.updateQueue = e.updateQueue), (t.flags &= -2053), (e.lanes &= ~l), vt(e, t, l))
            : (X && n && Fi(t), (t.flags |= 1), Se(e, t, r, l), t.child)
    )
}
function is(e, t, n, r, l) {
    if (e === null) {
        var o = n.type
        return typeof o == 'function' &&
            !iu(o) &&
            o.defaultProps === void 0 &&
            n.compare === null &&
            n.defaultProps === void 0
            ? ((t.tag = 15), (t.type = o), gc(e, t, o, r, l))
            : ((e = ol(n.type, null, r, t, t.mode, l)), (e.ref = t.ref), (e.return = t), (t.child = e))
    }
    if (((o = e.child), !(e.lanes & l))) {
        var i = o.memoizedProps
        if (((n = n.compare), (n = n !== null ? n : mr), n(i, r) && e.ref === t.ref)) return vt(e, t, l)
    }
    return ((t.flags |= 1), (e = jt(o, r)), (e.ref = t.ref), (e.return = t), (t.child = e))
}
function gc(e, t, n, r, l) {
    if (e !== null) {
        var o = e.memoizedProps
        if (mr(o, r) && e.ref === t.ref)
            if (((_e = !1), (t.pendingProps = r = o), (e.lanes & l) !== 0)) e.flags & 131072 && (_e = !0)
            else return ((t.lanes = e.lanes), vt(e, t, l))
    }
    return ri(e, t, n, r, l)
}
function vc(e, t, n) {
    var r = t.pendingProps,
        l = r.children,
        o = e !== null ? e.memoizedState : null
    if (r.mode === 'hidden')
        if (!(t.mode & 1))
            ((t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }), W(xn, Me), (Me |= n))
        else {
            if (!(n & 1073741824))
                return (
                    (e = o !== null ? o.baseLanes | n : n),
                    (t.lanes = t.childLanes = 1073741824),
                    (t.memoizedState = { baseLanes: e, cachePool: null, transitions: null }),
                    (t.updateQueue = null),
                    W(xn, Me),
                    (Me |= e),
                    null
                )
            ;((t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }),
                (r = o !== null ? o.baseLanes : n),
                W(xn, Me),
                (Me |= r))
        }
    else (o !== null ? ((r = o.baseLanes | n), (t.memoizedState = null)) : (r = n), W(xn, Me), (Me |= r))
    return (Se(e, t, l, n), t.child)
}
function yc(e, t) {
    var n = t.ref
    ;((e === null && n !== null) || (e !== null && e.ref !== n)) && ((t.flags |= 512), (t.flags |= 2097152))
}
function ri(e, t, n, r, l) {
    var o = Le(n) ? bt : we.current
    return (
        (o = Tn(t, o)),
        Nn(t, l),
        (n = Xi(e, t, n, r, o, l)),
        (r = Zi()),
        e !== null && !_e
            ? ((t.updateQueue = e.updateQueue), (t.flags &= -2053), (e.lanes &= ~l), vt(e, t, l))
            : (X && r && Fi(t), (t.flags |= 1), Se(e, t, n, l), t.child)
    )
}
function us(e, t, n, r, l) {
    if (Le(n)) {
        var o = !0
        gl(t)
    } else o = !1
    if ((Nn(t, l), t.stateNode === null)) (nl(e, t), pc(t, n, r), ti(t, n, r, l), (r = !0))
    else if (e === null) {
        var i = t.stateNode,
            u = t.memoizedProps
        i.props = u
        var s = i.context,
            a = n.contextType
        typeof a == 'object' && a !== null ? (a = Be(a)) : ((a = Le(n) ? bt : we.current), (a = Tn(t, a)))
        var m = n.getDerivedStateFromProps,
            h = typeof m == 'function' || typeof i.getSnapshotBeforeUpdate == 'function'
        ;(h ||
            (typeof i.UNSAFE_componentWillReceiveProps != 'function' &&
                typeof i.componentWillReceiveProps != 'function') ||
            ((u !== r || s !== a) && ts(t, i, r, a)),
            (kt = !1))
        var d = t.memoizedState
        ;((i.state = d),
            kl(t, r, i, l),
            (s = t.memoizedState),
            u !== r || d !== s || Ne.current || kt
                ? (typeof m == 'function' && (ei(t, n, m, r), (s = t.memoizedState)),
                  (u = kt || es(t, n, u, r, d, s, a))
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
            Ya(e, t),
            (u = t.memoizedProps),
            (a = t.type === t.elementType ? u : Ye(t.type, u)),
            (i.props = a),
            (h = t.pendingProps),
            (d = i.context),
            (s = n.contextType),
            typeof s == 'object' && s !== null ? (s = Be(s)) : ((s = Le(n) ? bt : we.current), (s = Tn(t, s))))
        var g = n.getDerivedStateFromProps
        ;((m = typeof g == 'function' || typeof i.getSnapshotBeforeUpdate == 'function') ||
            (typeof i.UNSAFE_componentWillReceiveProps != 'function' &&
                typeof i.componentWillReceiveProps != 'function') ||
            ((u !== h || d !== s) && ts(t, i, r, s)),
            (kt = !1),
            (d = t.memoizedState),
            (i.state = d),
            kl(t, r, i, l))
        var y = t.memoizedState
        u !== h || d !== y || Ne.current || kt
            ? (typeof g == 'function' && (ei(t, n, g, r), (y = t.memoizedState)),
              (a = kt || es(t, n, a, r, d, y, s) || !1)
                  ? (m ||
                        (typeof i.UNSAFE_componentWillUpdate != 'function' &&
                            typeof i.componentWillUpdate != 'function') ||
                        (typeof i.componentWillUpdate == 'function' && i.componentWillUpdate(r, y, s),
                        typeof i.UNSAFE_componentWillUpdate == 'function' && i.UNSAFE_componentWillUpdate(r, y, s)),
                    typeof i.componentDidUpdate == 'function' && (t.flags |= 4),
                    typeof i.getSnapshotBeforeUpdate == 'function' && (t.flags |= 1024))
                  : (typeof i.componentDidUpdate != 'function' ||
                        (u === e.memoizedProps && d === e.memoizedState) ||
                        (t.flags |= 4),
                    typeof i.getSnapshotBeforeUpdate != 'function' ||
                        (u === e.memoizedProps && d === e.memoizedState) ||
                        (t.flags |= 1024),
                    (t.memoizedProps = r),
                    (t.memoizedState = y)),
              (i.props = r),
              (i.state = y),
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
    return li(e, t, n, r, o, l)
}
function li(e, t, n, r, l, o) {
    yc(e, t)
    var i = (t.flags & 128) !== 0
    if (!r && !i) return (l && Yu(t, n, !1), vt(e, t, o))
    ;((r = t.stateNode), (rp.current = t))
    var u = i && typeof n.getDerivedStateFromError != 'function' ? null : r.render()
    return (
        (t.flags |= 1),
        e !== null && i ? ((t.child = Rn(t, e.child, null, o)), (t.child = Rn(t, null, u, o))) : Se(e, t, u, o),
        (t.memoizedState = r.state),
        l && Yu(t, n, !0),
        t.child
    )
}
function wc(e) {
    var t = e.stateNode
    ;(t.pendingContext ? Qu(e, t.pendingContext, t.pendingContext !== t.context) : t.context && Qu(e, t.context, !1),
        Qi(e, t.containerInfo))
}
function ss(e, t, n, r, l) {
    return (Mn(), Ui(l), (t.flags |= 256), Se(e, t, n, r), t.child)
}
var oi = { dehydrated: null, treeContext: null, retryLane: 0 }
function ii(e) {
    return { baseLanes: e, cachePool: null, transitions: null }
}
function Sc(e, t, n) {
    var r = t.pendingProps,
        l = q.current,
        o = !1,
        i = (t.flags & 128) !== 0,
        u
    if (
        ((u = i) || (u = e !== null && e.memoizedState === null ? !1 : (l & 2) !== 0),
        u ? ((o = !0), (t.flags &= -129)) : (e === null || e.memoizedState !== null) && (l |= 1),
        W(q, l & 1),
        e === null)
    )
        return (
            qo(t),
            (e = t.memoizedState),
            e !== null && ((e = e.dehydrated), e !== null)
                ? (t.mode & 1 ? (e.data === '$!' ? (t.lanes = 8) : (t.lanes = 1073741824)) : (t.lanes = 1), null)
                : ((i = r.children),
                  (e = r.fallback),
                  o
                      ? ((r = t.mode),
                        (o = t.child),
                        (i = { mode: 'hidden', children: i }),
                        !(r & 1) && o !== null ? ((o.childLanes = 0), (o.pendingProps = i)) : (o = Hl(i, r, 0, null)),
                        (e = qt(e, r, n, null)),
                        (o.return = t),
                        (e.return = t),
                        (o.sibling = e),
                        (t.child = o),
                        (t.child.memoizedState = ii(n)),
                        (t.memoizedState = oi),
                        e)
                      : bi(t, i))
        )
    if (((l = e.memoizedState), l !== null && ((u = l.dehydrated), u !== null))) return lp(e, t, i, r, u, l, n)
    if (o) {
        ;((o = r.fallback), (i = t.mode), (l = e.child), (u = l.sibling))
        var s = { mode: 'hidden', children: r.children }
        return (
            !(i & 1) && t.child !== l
                ? ((r = t.child), (r.childLanes = 0), (r.pendingProps = s), (t.deletions = null))
                : ((r = jt(l, s)), (r.subtreeFlags = l.subtreeFlags & 14680064)),
            u !== null ? (o = jt(u, o)) : ((o = qt(o, i, n, null)), (o.flags |= 2)),
            (o.return = t),
            (r.return = t),
            (r.sibling = o),
            (t.child = r),
            (r = o),
            (o = t.child),
            (i = e.child.memoizedState),
            (i = i === null ? ii(n) : { baseLanes: i.baseLanes | n, cachePool: null, transitions: i.transitions }),
            (o.memoizedState = i),
            (o.childLanes = e.childLanes & ~n),
            (t.memoizedState = oi),
            r
        )
    }
    return (
        (o = e.child),
        (e = o.sibling),
        (r = jt(o, { mode: 'visible', children: r.children })),
        !(t.mode & 1) && (r.lanes = n),
        (r.return = t),
        (r.sibling = null),
        e !== null && ((n = t.deletions), n === null ? ((t.deletions = [e]), (t.flags |= 16)) : n.push(e)),
        (t.child = r),
        (t.memoizedState = null),
        r
    )
}
function bi(e, t) {
    return ((t = Hl({ mode: 'visible', children: t }, e.mode, 0, null)), (t.return = e), (e.child = t))
}
function Wr(e, t, n, r) {
    return (
        r !== null && Ui(r),
        Rn(t, e.child, null, n),
        (e = bi(t, t.pendingProps.children)),
        (e.flags |= 2),
        (t.memoizedState = null),
        e
    )
}
function lp(e, t, n, r, l, o, i) {
    if (n)
        return t.flags & 256
            ? ((t.flags &= -257), (r = vo(Error(w(422)))), Wr(e, t, i, r))
            : t.memoizedState !== null
              ? ((t.child = e.child), (t.flags |= 128), null)
              : ((o = r.fallback),
                (l = t.mode),
                (r = Hl({ mode: 'visible', children: r.children }, l, 0, null)),
                (o = qt(o, l, i, null)),
                (o.flags |= 2),
                (r.return = t),
                (o.return = t),
                (r.sibling = o),
                (t.child = r),
                t.mode & 1 && Rn(t, e.child, null, i),
                (t.child.memoizedState = ii(i)),
                (t.memoizedState = oi),
                o)
    if (!(t.mode & 1)) return Wr(e, t, i, null)
    if (l.data === '$!') {
        if (((r = l.nextSibling && l.nextSibling.dataset), r)) var u = r.dgst
        return ((r = u), (o = Error(w(419))), (r = vo(o, r, void 0)), Wr(e, t, i, r))
    }
    if (((u = (i & e.childLanes) !== 0), _e || u)) {
        if (((r = fe), r !== null)) {
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
                l !== 0 && l !== o.retryLane && ((o.retryLane = l), gt(e, l), Ze(r, e, l, -1)))
        }
        return (ou(), (r = vo(Error(w(421)))), Wr(e, t, i, r))
    }
    return l.data === '$?'
        ? ((t.flags |= 128), (t.child = e.child), (t = vp.bind(null, e)), (l._reactRetry = t), null)
        : ((e = o.treeContext),
          (Re = zt(l.nextSibling)),
          (Oe = t),
          (X = !0),
          (Ge = null),
          e !== null && ((Ue[Ae++] = ct), (Ue[Ae++] = ft), (Ue[Ae++] = en), (ct = e.id), (ft = e.overflow), (en = t)),
          (t = bi(t, r.children)),
          (t.flags |= 4096),
          t)
}
function as(e, t, n) {
    e.lanes |= t
    var r = e.alternate
    ;(r !== null && (r.lanes |= t), bo(e.return, t, n))
}
function yo(e, t, n, r, l) {
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
function kc(e, t, n) {
    var r = t.pendingProps,
        l = r.revealOrder,
        o = r.tail
    if ((Se(e, t, r.children, n), (r = q.current), r & 2)) ((r = (r & 1) | 2), (t.flags |= 128))
    else {
        if (e !== null && e.flags & 128)
            e: for (e = t.child; e !== null; ) {
                if (e.tag === 13) e.memoizedState !== null && as(e, n, t)
                else if (e.tag === 19) as(e, n, t)
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
    if ((W(q, r), !(t.mode & 1))) t.memoizedState = null
    else
        switch (l) {
            case 'forwards':
                for (n = t.child, l = null; n !== null; )
                    ((e = n.alternate), e !== null && xl(e) === null && (l = n), (n = n.sibling))
                ;((n = l),
                    n === null ? ((l = t.child), (t.child = null)) : ((l = n.sibling), (n.sibling = null)),
                    yo(t, !1, l, n, o))
                break
            case 'backwards':
                for (n = null, l = t.child, t.child = null; l !== null; ) {
                    if (((e = l.alternate), e !== null && xl(e) === null)) {
                        t.child = l
                        break
                    }
                    ;((e = l.sibling), (l.sibling = n), (n = l), (l = e))
                }
                yo(t, !0, n, null, o)
                break
            case 'together':
                yo(t, !1, null, null, void 0)
                break
            default:
                t.memoizedState = null
        }
    return t.child
}
function nl(e, t) {
    !(t.mode & 1) && e !== null && ((e.alternate = null), (t.alternate = null), (t.flags |= 2))
}
function vt(e, t, n) {
    if ((e !== null && (t.dependencies = e.dependencies), (nn |= t.lanes), !(n & t.childLanes))) return null
    if (e !== null && t.child !== e.child) throw Error(w(153))
    if (t.child !== null) {
        for (e = t.child, n = jt(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null; )
            ((e = e.sibling), (n = n.sibling = jt(e, e.pendingProps)), (n.return = t))
        n.sibling = null
    }
    return t.child
}
function op(e, t, n) {
    switch (t.tag) {
        case 3:
            ;(wc(t), Mn())
            break
        case 5:
            Ka(t)
            break
        case 1:
            Le(t.type) && gl(t)
            break
        case 4:
            Qi(t, t.stateNode.containerInfo)
            break
        case 10:
            var r = t.type._context,
                l = t.memoizedProps.value
            ;(W(wl, r._currentValue), (r._currentValue = l))
            break
        case 13:
            if (((r = t.memoizedState), r !== null))
                return r.dehydrated !== null
                    ? (W(q, q.current & 1), (t.flags |= 128), null)
                    : n & t.child.childLanes
                      ? Sc(e, t, n)
                      : (W(q, q.current & 1), (e = vt(e, t, n)), e !== null ? e.sibling : null)
            W(q, q.current & 1)
            break
        case 19:
            if (((r = (n & t.childLanes) !== 0), e.flags & 128)) {
                if (r) return kc(e, t, n)
                t.flags |= 128
            }
            if (
                ((l = t.memoizedState),
                l !== null && ((l.rendering = null), (l.tail = null), (l.lastEffect = null)),
                W(q, q.current),
                r)
            )
                break
            return null
        case 22:
        case 23:
            return ((t.lanes = 0), vc(e, t, n))
    }
    return vt(e, t, n)
}
var xc, ui, Ec, Cc
xc = function (e, t) {
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
ui = function () {}
Ec = function (e, t, n, r) {
    var l = e.memoizedProps
    if (l !== r) {
        ;((e = t.stateNode), Xt(rt.current))
        var o = null
        switch (n) {
            case 'input':
                ;((l = zo(e, l)), (r = zo(e, r)), (o = []))
                break
            case 'select':
                ;((l = ee({}, l, { value: void 0 })), (r = ee({}, r, { value: void 0 })), (o = []))
                break
            case 'textarea':
                ;((l = Ro(e, l)), (r = Ro(e, r)), (o = []))
                break
            default:
                typeof l.onClick != 'function' && typeof r.onClick == 'function' && (e.onclick = hl)
        }
        Oo(n, r)
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
                        (sr.hasOwnProperty(a) ? o || (o = []) : (o = o || []).push(a, null))
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
                            (sr.hasOwnProperty(a)
                                ? (s != null && a === 'onScroll' && Y('scroll', e), o || u === s || (o = []))
                                : (o = o || []).push(a, s))
        }
        n && (o = o || []).push('style', n)
        var a = o
        ;(t.updateQueue = a) && (t.flags |= 4)
    }
}
Cc = function (e, t, n, r) {
    n !== r && (t.flags |= 4)
}
function Yn(e, t) {
    if (!X)
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
function ve(e) {
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
function ip(e, t, n) {
    var r = t.pendingProps
    switch (($i(t), t.tag)) {
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
            return (ve(t), null)
        case 1:
            return (Le(t.type) && ml(), ve(t), null)
        case 3:
            return (
                (r = t.stateNode),
                jn(),
                K(Ne),
                K(we),
                Ki(),
                r.pendingContext && ((r.context = r.pendingContext), (r.pendingContext = null)),
                (e === null || e.child === null) &&
                    (Hr(t)
                        ? (t.flags |= 4)
                        : e === null ||
                          (e.memoizedState.isDehydrated && !(t.flags & 256)) ||
                          ((t.flags |= 1024), Ge !== null && (mi(Ge), (Ge = null)))),
                ui(e, t),
                ve(t),
                null
            )
        case 5:
            Yi(t)
            var l = Xt(Sr.current)
            if (((n = t.type), e !== null && t.stateNode != null))
                (Ec(e, t, n, r, l), e.ref !== t.ref && ((t.flags |= 512), (t.flags |= 2097152)))
            else {
                if (!r) {
                    if (t.stateNode === null) throw Error(w(166))
                    return (ve(t), null)
                }
                if (((e = Xt(rt.current)), Hr(t))) {
                    ;((r = t.stateNode), (n = t.type))
                    var o = t.memoizedProps
                    switch (((r[tt] = t), (r[yr] = o), (e = (t.mode & 1) !== 0), n)) {
                        case 'dialog':
                            ;(Y('cancel', r), Y('close', r))
                            break
                        case 'iframe':
                        case 'object':
                        case 'embed':
                            Y('load', r)
                            break
                        case 'video':
                        case 'audio':
                            for (l = 0; l < qn.length; l++) Y(qn[l], r)
                            break
                        case 'source':
                            Y('error', r)
                            break
                        case 'img':
                        case 'image':
                        case 'link':
                            ;(Y('error', r), Y('load', r))
                            break
                        case 'details':
                            Y('toggle', r)
                            break
                        case 'input':
                            ;(yu(r, o), Y('invalid', r))
                            break
                        case 'select':
                            ;((r._wrapperState = { wasMultiple: !!o.multiple }), Y('invalid', r))
                            break
                        case 'textarea':
                            ;(Su(r, o), Y('invalid', r))
                    }
                    ;(Oo(n, o), (l = null))
                    for (var i in o)
                        if (o.hasOwnProperty(i)) {
                            var u = o[i]
                            i === 'children'
                                ? typeof u == 'string'
                                    ? r.textContent !== u &&
                                      (o.suppressHydrationWarning !== !0 && Vr(r.textContent, u, e),
                                      (l = ['children', u]))
                                    : typeof u == 'number' &&
                                      r.textContent !== '' + u &&
                                      (o.suppressHydrationWarning !== !0 && Vr(r.textContent, u, e),
                                      (l = ['children', '' + u]))
                                : sr.hasOwnProperty(i) && u != null && i === 'onScroll' && Y('scroll', r)
                        }
                    switch (n) {
                        case 'input':
                            ;(jr(r), wu(r, o, !0))
                            break
                        case 'textarea':
                            ;(jr(r), ku(r))
                            break
                        case 'select':
                        case 'option':
                            break
                        default:
                            typeof o.onClick == 'function' && (r.onclick = hl)
                    }
                    ;((r = l), (t.updateQueue = r), r !== null && (t.flags |= 4))
                } else {
                    ;((i = l.nodeType === 9 ? l : l.ownerDocument),
                        e === 'http://www.w3.org/1999/xhtml' && (e = qs(n)),
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
                        (e[tt] = t),
                        (e[yr] = r),
                        xc(e, t, !1, !1),
                        (t.stateNode = e))
                    e: {
                        switch (((i = Do(n, r)), n)) {
                            case 'dialog':
                                ;(Y('cancel', e), Y('close', e), (l = r))
                                break
                            case 'iframe':
                            case 'object':
                            case 'embed':
                                ;(Y('load', e), (l = r))
                                break
                            case 'video':
                            case 'audio':
                                for (l = 0; l < qn.length; l++) Y(qn[l], e)
                                l = r
                                break
                            case 'source':
                                ;(Y('error', e), (l = r))
                                break
                            case 'img':
                            case 'image':
                            case 'link':
                                ;(Y('error', e), Y('load', e), (l = r))
                                break
                            case 'details':
                                ;(Y('toggle', e), (l = r))
                                break
                            case 'input':
                                ;(yu(e, r), (l = zo(e, r)), Y('invalid', e))
                                break
                            case 'option':
                                l = r
                                break
                            case 'select':
                                ;((e._wrapperState = { wasMultiple: !!r.multiple }),
                                    (l = ee({}, r, { value: void 0 })),
                                    Y('invalid', e))
                                break
                            case 'textarea':
                                ;(Su(e, r), (l = Ro(e, r)), Y('invalid', e))
                                break
                            default:
                                l = r
                        }
                        ;(Oo(n, l), (u = l))
                        for (o in u)
                            if (u.hasOwnProperty(o)) {
                                var s = u[o]
                                o === 'style'
                                    ? ta(e, s)
                                    : o === 'dangerouslySetInnerHTML'
                                      ? ((s = s ? s.__html : void 0), s != null && bs(e, s))
                                      : o === 'children'
                                        ? typeof s == 'string'
                                            ? (n !== 'textarea' || s !== '') && ar(e, s)
                                            : typeof s == 'number' && ar(e, '' + s)
                                        : o !== 'suppressContentEditableWarning' &&
                                          o !== 'suppressHydrationWarning' &&
                                          o !== 'autoFocus' &&
                                          (sr.hasOwnProperty(o)
                                              ? s != null && o === 'onScroll' && Y('scroll', e)
                                              : s != null && Ei(e, o, s, i))
                            }
                        switch (n) {
                            case 'input':
                                ;(jr(e), wu(e, r, !1))
                                break
                            case 'textarea':
                                ;(jr(e), ku(e))
                                break
                            case 'option':
                                r.value != null && e.setAttribute('value', '' + Ot(r.value))
                                break
                            case 'select':
                                ;((e.multiple = !!r.multiple),
                                    (o = r.value),
                                    o != null
                                        ? En(e, !!r.multiple, o, !1)
                                        : r.defaultValue != null && En(e, !!r.multiple, r.defaultValue, !0))
                                break
                            default:
                                typeof l.onClick == 'function' && (e.onclick = hl)
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
            return (ve(t), null)
        case 6:
            if (e && t.stateNode != null) Cc(e, t, e.memoizedProps, r)
            else {
                if (typeof r != 'string' && t.stateNode === null) throw Error(w(166))
                if (((n = Xt(Sr.current)), Xt(rt.current), Hr(t))) {
                    if (
                        ((r = t.stateNode),
                        (n = t.memoizedProps),
                        (r[tt] = t),
                        (o = r.nodeValue !== n) && ((e = Oe), e !== null))
                    )
                        switch (e.tag) {
                            case 3:
                                Vr(r.nodeValue, n, (e.mode & 1) !== 0)
                                break
                            case 5:
                                e.memoizedProps.suppressHydrationWarning !== !0 &&
                                    Vr(r.nodeValue, n, (e.mode & 1) !== 0)
                        }
                    o && (t.flags |= 4)
                } else
                    ((r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r)), (r[tt] = t), (t.stateNode = r))
            }
            return (ve(t), null)
        case 13:
            if (
                (K(q),
                (r = t.memoizedState),
                e === null || (e.memoizedState !== null && e.memoizedState.dehydrated !== null))
            ) {
                if (X && Re !== null && t.mode & 1 && !(t.flags & 128)) (Ha(), Mn(), (t.flags |= 98560), (o = !1))
                else if (((o = Hr(t)), r !== null && r.dehydrated !== null)) {
                    if (e === null) {
                        if (!o) throw Error(w(318))
                        if (((o = t.memoizedState), (o = o !== null ? o.dehydrated : null), !o)) throw Error(w(317))
                        o[tt] = t
                    } else (Mn(), !(t.flags & 128) && (t.memoizedState = null), (t.flags |= 4))
                    ;(ve(t), (o = !1))
                } else (Ge !== null && (mi(Ge), (Ge = null)), (o = !0))
                if (!o) return t.flags & 65536 ? t : null
            }
            return t.flags & 128
                ? ((t.lanes = n), t)
                : ((r = r !== null),
                  r !== (e !== null && e.memoizedState !== null) &&
                      r &&
                      ((t.child.flags |= 8192),
                      t.mode & 1 && (e === null || q.current & 1 ? ae === 0 && (ae = 3) : ou())),
                  t.updateQueue !== null && (t.flags |= 4),
                  ve(t),
                  null)
        case 4:
            return (jn(), ui(e, t), e === null && gr(t.stateNode.containerInfo), ve(t), null)
        case 10:
            return (Hi(t.type._context), ve(t), null)
        case 17:
            return (Le(t.type) && ml(), ve(t), null)
        case 19:
            if ((K(q), (o = t.memoizedState), o === null)) return (ve(t), null)
            if (((r = (t.flags & 128) !== 0), (i = o.rendering), i === null))
                if (r) Yn(o, !1)
                else {
                    if (ae !== 0 || (e !== null && e.flags & 128))
                        for (e = t.child; e !== null; ) {
                            if (((i = xl(e)), i !== null)) {
                                for (
                                    t.flags |= 128,
                                        Yn(o, !1),
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
                                return (W(q, (q.current & 1) | 2), t.child)
                            }
                            e = e.sibling
                        }
                    o.tail !== null && oe() > Dn && ((t.flags |= 128), (r = !0), Yn(o, !1), (t.lanes = 4194304))
                }
            else {
                if (!r)
                    if (((e = xl(i)), e !== null)) {
                        if (
                            ((t.flags |= 128),
                            (r = !0),
                            (n = e.updateQueue),
                            n !== null && ((t.updateQueue = n), (t.flags |= 4)),
                            Yn(o, !0),
                            o.tail === null && o.tailMode === 'hidden' && !i.alternate && !X)
                        )
                            return (ve(t), null)
                    } else
                        2 * oe() - o.renderingStartTime > Dn &&
                            n !== 1073741824 &&
                            ((t.flags |= 128), (r = !0), Yn(o, !1), (t.lanes = 4194304))
                o.isBackwards
                    ? ((i.sibling = t.child), (t.child = i))
                    : ((n = o.last), n !== null ? (n.sibling = i) : (t.child = i), (o.last = i))
            }
            return o.tail !== null
                ? ((t = o.tail),
                  (o.rendering = t),
                  (o.tail = t.sibling),
                  (o.renderingStartTime = oe()),
                  (t.sibling = null),
                  (n = q.current),
                  W(q, r ? (n & 1) | 2 : n & 1),
                  t)
                : (ve(t), null)
        case 22:
        case 23:
            return (
                lu(),
                (r = t.memoizedState !== null),
                e !== null && (e.memoizedState !== null) !== r && (t.flags |= 8192),
                r && t.mode & 1 ? Me & 1073741824 && (ve(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : ve(t),
                null
            )
        case 24:
            return null
        case 25:
            return null
    }
    throw Error(w(156, t.tag))
}
function up(e, t) {
    switch (($i(t), t.tag)) {
        case 1:
            return (Le(t.type) && ml(), (e = t.flags), e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null)
        case 3:
            return (
                jn(),
                K(Ne),
                K(we),
                Ki(),
                (e = t.flags),
                e & 65536 && !(e & 128) ? ((t.flags = (e & -65537) | 128), t) : null
            )
        case 5:
            return (Yi(t), null)
        case 13:
            if ((K(q), (e = t.memoizedState), e !== null && e.dehydrated !== null)) {
                if (t.alternate === null) throw Error(w(340))
                Mn()
            }
            return ((e = t.flags), e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null)
        case 19:
            return (K(q), null)
        case 4:
            return (jn(), null)
        case 10:
            return (Hi(t.type._context), null)
        case 22:
        case 23:
            return (lu(), null)
        case 24:
            return null
        default:
            return null
    }
}
var Qr = !1,
    ye = !1,
    sp = typeof WeakSet == 'function' ? WeakSet : Set,
    L = null
function kn(e, t) {
    var n = e.ref
    if (n !== null)
        if (typeof n == 'function')
            try {
                n(null)
            } catch (r) {
                re(e, t, r)
            }
        else n.current = null
}
function si(e, t, n) {
    try {
        n()
    } catch (r) {
        re(e, t, r)
    }
}
var cs = !1
function ap(e, t) {
    if (((Qo = fl), (e = za()), Ii(e))) {
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
    for (Yo = { focusedElem: e, selectionRange: n }, fl = !1, L = t; L !== null; )
        if (((t = L), (e = t.child), (t.subtreeFlags & 1028) !== 0 && e !== null)) ((e.return = t), (L = e))
        else
            for (; L !== null; ) {
                t = L
                try {
                    var y = t.alternate
                    if (t.flags & 1024)
                        switch (t.tag) {
                            case 0:
                            case 11:
                            case 15:
                                break
                            case 1:
                                if (y !== null) {
                                    var S = y.memoizedProps,
                                        F = y.memoizedState,
                                        f = t.stateNode,
                                        c = f.getSnapshotBeforeUpdate(t.elementType === t.type ? S : Ye(t.type, S), F)
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
                                throw Error(w(163))
                        }
                } catch (v) {
                    re(t, t.return, v)
                }
                if (((e = t.sibling), e !== null)) {
                    ;((e.return = t.return), (L = e))
                    break
                }
                L = t.return
            }
    return ((y = cs), (cs = !1), y)
}
function or(e, t, n) {
    var r = t.updateQueue
    if (((r = r !== null ? r.lastEffect : null), r !== null)) {
        var l = (r = r.next)
        do {
            if ((l.tag & e) === e) {
                var o = l.destroy
                ;((l.destroy = void 0), o !== void 0 && si(t, n, o))
            }
            l = l.next
        } while (l !== r)
    }
}
function Al(e, t) {
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
function ai(e) {
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
function Pc(e) {
    var t = e.alternate
    ;(t !== null && ((e.alternate = null), Pc(t)),
        (e.child = null),
        (e.deletions = null),
        (e.sibling = null),
        e.tag === 5 &&
            ((t = e.stateNode), t !== null && (delete t[tt], delete t[yr], delete t[Xo], delete t[Qd], delete t[Yd])),
        (e.stateNode = null),
        (e.return = null),
        (e.dependencies = null),
        (e.memoizedProps = null),
        (e.memoizedState = null),
        (e.pendingProps = null),
        (e.stateNode = null),
        (e.updateQueue = null))
}
function _c(e) {
    return e.tag === 5 || e.tag === 3 || e.tag === 4
}
function fs(e) {
    e: for (;;) {
        for (; e.sibling === null; ) {
            if (e.return === null || _c(e.return)) return null
            e = e.return
        }
        for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
            if (e.flags & 2 || e.child === null || e.tag === 4) continue e
            ;((e.child.return = e), (e = e.child))
        }
        if (!(e.flags & 2)) return e.stateNode
    }
}
function ci(e, t, n) {
    var r = e.tag
    if (r === 5 || r === 6)
        ((e = e.stateNode),
            t
                ? n.nodeType === 8
                    ? n.parentNode.insertBefore(e, t)
                    : n.insertBefore(e, t)
                : (n.nodeType === 8 ? ((t = n.parentNode), t.insertBefore(e, n)) : ((t = n), t.appendChild(e)),
                  (n = n._reactRootContainer),
                  n != null || t.onclick !== null || (t.onclick = hl)))
    else if (r !== 4 && ((e = e.child), e !== null))
        for (ci(e, t, n), e = e.sibling; e !== null; ) (ci(e, t, n), (e = e.sibling))
}
function fi(e, t, n) {
    var r = e.tag
    if (r === 5 || r === 6) ((e = e.stateNode), t ? n.insertBefore(e, t) : n.appendChild(e))
    else if (r !== 4 && ((e = e.child), e !== null))
        for (fi(e, t, n), e = e.sibling; e !== null; ) (fi(e, t, n), (e = e.sibling))
}
var pe = null,
    Ke = !1
function wt(e, t, n) {
    for (n = n.child; n !== null; ) (Nc(e, t, n), (n = n.sibling))
}
function Nc(e, t, n) {
    if (nt && typeof nt.onCommitFiberUnmount == 'function')
        try {
            nt.onCommitFiberUnmount(Rl, n)
        } catch {}
    switch (n.tag) {
        case 5:
            ye || kn(n, t)
        case 6:
            var r = pe,
                l = Ke
            ;((pe = null),
                wt(e, t, n),
                (pe = r),
                (Ke = l),
                pe !== null &&
                    (Ke
                        ? ((e = pe),
                          (n = n.stateNode),
                          e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n))
                        : pe.removeChild(n.stateNode)))
            break
        case 18:
            pe !== null &&
                (Ke
                    ? ((e = pe),
                      (n = n.stateNode),
                      e.nodeType === 8 ? co(e.parentNode, n) : e.nodeType === 1 && co(e, n),
                      pr(e))
                    : co(pe, n.stateNode))
            break
        case 4:
            ;((r = pe), (l = Ke), (pe = n.stateNode.containerInfo), (Ke = !0), wt(e, t, n), (pe = r), (Ke = l))
            break
        case 0:
        case 11:
        case 14:
        case 15:
            if (!ye && ((r = n.updateQueue), r !== null && ((r = r.lastEffect), r !== null))) {
                l = r = r.next
                do {
                    var o = l,
                        i = o.destroy
                    ;((o = o.tag), i !== void 0 && (o & 2 || o & 4) && si(n, t, i), (l = l.next))
                } while (l !== r)
            }
            wt(e, t, n)
            break
        case 1:
            if (!ye && (kn(n, t), (r = n.stateNode), typeof r.componentWillUnmount == 'function'))
                try {
                    ;((r.props = n.memoizedProps), (r.state = n.memoizedState), r.componentWillUnmount())
                } catch (u) {
                    re(n, t, u)
                }
            wt(e, t, n)
            break
        case 21:
            wt(e, t, n)
            break
        case 22:
            n.mode & 1 ? ((ye = (r = ye) || n.memoizedState !== null), wt(e, t, n), (ye = r)) : wt(e, t, n)
            break
        default:
            wt(e, t, n)
    }
}
function ds(e) {
    var t = e.updateQueue
    if (t !== null) {
        e.updateQueue = null
        var n = e.stateNode
        ;(n === null && (n = e.stateNode = new sp()),
            t.forEach(function (r) {
                var l = yp.bind(null, e, r)
                n.has(r) || (n.add(r), r.then(l, l))
            }))
    }
}
function Qe(e, t) {
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
                            ;((pe = u.stateNode), (Ke = !1))
                            break e
                        case 3:
                            ;((pe = u.stateNode.containerInfo), (Ke = !0))
                            break e
                        case 4:
                            ;((pe = u.stateNode.containerInfo), (Ke = !0))
                            break e
                    }
                    u = u.return
                }
                if (pe === null) throw Error(w(160))
                ;(Nc(o, i, l), (pe = null), (Ke = !1))
                var s = l.alternate
                ;(s !== null && (s.return = null), (l.return = null))
            } catch (a) {
                re(l, t, a)
            }
        }
    if (t.subtreeFlags & 12854) for (t = t.child; t !== null; ) (Lc(t, e), (t = t.sibling))
}
function Lc(e, t) {
    var n = e.alternate,
        r = e.flags
    switch (e.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
            if ((Qe(t, e), be(e), r & 4)) {
                try {
                    ;(or(3, e, e.return), Al(3, e))
                } catch (S) {
                    re(e, e.return, S)
                }
                try {
                    or(5, e, e.return)
                } catch (S) {
                    re(e, e.return, S)
                }
            }
            break
        case 1:
            ;(Qe(t, e), be(e), r & 512 && n !== null && kn(n, n.return))
            break
        case 5:
            if ((Qe(t, e), be(e), r & 512 && n !== null && kn(n, n.return), e.flags & 32)) {
                var l = e.stateNode
                try {
                    ar(l, '')
                } catch (S) {
                    re(e, e.return, S)
                }
            }
            if (r & 4 && ((l = e.stateNode), l != null)) {
                var o = e.memoizedProps,
                    i = n !== null ? n.memoizedProps : o,
                    u = e.type,
                    s = e.updateQueue
                if (((e.updateQueue = null), s !== null))
                    try {
                        ;(u === 'input' && o.type === 'radio' && o.name != null && Zs(l, o), Do(u, i))
                        var a = Do(u, o)
                        for (i = 0; i < s.length; i += 2) {
                            var m = s[i],
                                h = s[i + 1]
                            m === 'style'
                                ? ta(l, h)
                                : m === 'dangerouslySetInnerHTML'
                                  ? bs(l, h)
                                  : m === 'children'
                                    ? ar(l, h)
                                    : Ei(l, m, h, a)
                        }
                        switch (u) {
                            case 'input':
                                To(l, o)
                                break
                            case 'textarea':
                                Js(l, o)
                                break
                            case 'select':
                                var d = l._wrapperState.wasMultiple
                                l._wrapperState.wasMultiple = !!o.multiple
                                var g = o.value
                                g != null
                                    ? En(l, !!o.multiple, g, !1)
                                    : d !== !!o.multiple &&
                                      (o.defaultValue != null
                                          ? En(l, !!o.multiple, o.defaultValue, !0)
                                          : En(l, !!o.multiple, o.multiple ? [] : '', !1))
                        }
                        l[yr] = o
                    } catch (S) {
                        re(e, e.return, S)
                    }
            }
            break
        case 6:
            if ((Qe(t, e), be(e), r & 4)) {
                if (e.stateNode === null) throw Error(w(162))
                ;((l = e.stateNode), (o = e.memoizedProps))
                try {
                    l.nodeValue = o
                } catch (S) {
                    re(e, e.return, S)
                }
            }
            break
        case 3:
            if ((Qe(t, e), be(e), r & 4 && n !== null && n.memoizedState.isDehydrated))
                try {
                    pr(t.containerInfo)
                } catch (S) {
                    re(e, e.return, S)
                }
            break
        case 4:
            ;(Qe(t, e), be(e))
            break
        case 13:
            ;(Qe(t, e),
                be(e),
                (l = e.child),
                l.flags & 8192 &&
                    ((o = l.memoizedState !== null),
                    (l.stateNode.isHidden = o),
                    !o || (l.alternate !== null && l.alternate.memoizedState !== null) || (nu = oe())),
                r & 4 && ds(e))
            break
        case 22:
            if (
                ((m = n !== null && n.memoizedState !== null),
                e.mode & 1 ? ((ye = (a = ye) || m), Qe(t, e), (ye = a)) : Qe(t, e),
                be(e),
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
                                    or(4, d, d.return)
                                    break
                                case 1:
                                    kn(d, d.return)
                                    var y = d.stateNode
                                    if (typeof y.componentWillUnmount == 'function') {
                                        ;((r = d), (n = d.return))
                                        try {
                                            ;((t = r),
                                                (y.props = t.memoizedProps),
                                                (y.state = t.memoizedState),
                                                y.componentWillUnmount())
                                        } catch (S) {
                                            re(r, n, S)
                                        }
                                    }
                                    break
                                case 5:
                                    kn(d, d.return)
                                    break
                                case 22:
                                    if (d.memoizedState !== null) {
                                        hs(h)
                                        continue
                                    }
                            }
                            g !== null ? ((g.return = d), (L = g)) : hs(h)
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
                                          (u.style.display = ea('display', i))))
                            } catch (S) {
                                re(e, e.return, S)
                            }
                        }
                    } else if (h.tag === 6) {
                        if (m === null)
                            try {
                                h.stateNode.nodeValue = a ? '' : h.memoizedProps
                            } catch (S) {
                                re(e, e.return, S)
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
            ;(Qe(t, e), be(e), r & 4 && ds(e))
            break
        case 21:
            break
        default:
            ;(Qe(t, e), be(e))
    }
}
function be(e) {
    var t = e.flags
    if (t & 2) {
        try {
            e: {
                for (var n = e.return; n !== null; ) {
                    if (_c(n)) {
                        var r = n
                        break e
                    }
                    n = n.return
                }
                throw Error(w(160))
            }
            switch (r.tag) {
                case 5:
                    var l = r.stateNode
                    r.flags & 32 && (ar(l, ''), (r.flags &= -33))
                    var o = fs(e)
                    fi(e, o, l)
                    break
                case 3:
                case 4:
                    var i = r.stateNode.containerInfo,
                        u = fs(e)
                    ci(e, u, i)
                    break
                default:
                    throw Error(w(161))
            }
        } catch (s) {
            re(e, e.return, s)
        }
        e.flags &= -3
    }
    t & 4096 && (e.flags &= -4097)
}
function cp(e, t, n) {
    ;((L = e), zc(e))
}
function zc(e, t, n) {
    for (var r = (e.mode & 1) !== 0; L !== null; ) {
        var l = L,
            o = l.child
        if (l.tag === 22 && r) {
            var i = l.memoizedState !== null || Qr
            if (!i) {
                var u = l.alternate,
                    s = (u !== null && u.memoizedState !== null) || ye
                u = Qr
                var a = ye
                if (((Qr = i), (ye = s) && !a))
                    for (L = l; L !== null; )
                        ((i = L),
                            (s = i.child),
                            i.tag === 22 && i.memoizedState !== null
                                ? ms(l)
                                : s !== null
                                  ? ((s.return = i), (L = s))
                                  : ms(l))
                for (; o !== null; ) ((L = o), zc(o), (o = o.sibling))
                ;((L = l), (Qr = u), (ye = a))
            }
            ps(e)
        } else l.subtreeFlags & 8772 && o !== null ? ((o.return = l), (L = o)) : ps(e)
    }
}
function ps(e) {
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
                            ye || Al(5, t)
                            break
                        case 1:
                            var r = t.stateNode
                            if (t.flags & 4 && !ye)
                                if (n === null) r.componentDidMount()
                                else {
                                    var l = t.elementType === t.type ? n.memoizedProps : Ye(t.type, n.memoizedProps)
                                    r.componentDidUpdate(l, n.memoizedState, r.__reactInternalSnapshotBeforeUpdate)
                                }
                            var o = t.updateQueue
                            o !== null && Ju(t, o, r)
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
                                Ju(t, i, n)
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
                                        h !== null && pr(h)
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
                            throw Error(w(163))
                    }
                ye || (t.flags & 512 && ai(t))
            } catch (d) {
                re(t, t.return, d)
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
function hs(e) {
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
function ms(e) {
    for (; L !== null; ) {
        var t = L
        try {
            switch (t.tag) {
                case 0:
                case 11:
                case 15:
                    var n = t.return
                    try {
                        Al(4, t)
                    } catch (s) {
                        re(t, n, s)
                    }
                    break
                case 1:
                    var r = t.stateNode
                    if (typeof r.componentDidMount == 'function') {
                        var l = t.return
                        try {
                            r.componentDidMount()
                        } catch (s) {
                            re(t, l, s)
                        }
                    }
                    var o = t.return
                    try {
                        ai(t)
                    } catch (s) {
                        re(t, o, s)
                    }
                    break
                case 5:
                    var i = t.return
                    try {
                        ai(t)
                    } catch (s) {
                        re(t, i, s)
                    }
            }
        } catch (s) {
            re(t, t.return, s)
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
var fp = Math.ceil,
    Pl = yt.ReactCurrentDispatcher,
    eu = yt.ReactCurrentOwner,
    He = yt.ReactCurrentBatchConfig,
    H = 0,
    fe = null,
    ue = null,
    he = 0,
    Me = 0,
    xn = Ft(0),
    ae = 0,
    Cr = null,
    nn = 0,
    Vl = 0,
    tu = 0,
    ir = null,
    Pe = null,
    nu = 0,
    Dn = 1 / 0,
    it = null,
    _l = !1,
    di = null,
    Mt = null,
    Yr = !1,
    Pt = null,
    Nl = 0,
    ur = 0,
    pi = null,
    rl = -1,
    ll = 0
function ke() {
    return H & 6 ? oe() : rl !== -1 ? rl : (rl = oe())
}
function Rt(e) {
    return e.mode & 1
        ? H & 2 && he !== 0
            ? he & -he
            : Gd.transition !== null
              ? (ll === 0 && (ll = pa()), ll)
              : ((e = B), e !== 0 || ((e = window.event), (e = e === void 0 ? 16 : Sa(e.type))), e)
        : 1
}
function Ze(e, t, n, r) {
    if (50 < ur) throw ((ur = 0), (pi = null), Error(w(185)))
    ;(Nr(e, n, r),
        (!(H & 2) || e !== fe) &&
            (e === fe && (!(H & 2) && (Vl |= n), ae === 4 && Et(e, he)),
            ze(e, r),
            n === 1 && H === 0 && !(t.mode & 1) && ((Dn = oe() + 500), Fl && $t())))
}
function ze(e, t) {
    var n = e.callbackNode
    Gf(e, t)
    var r = cl(e, e === fe ? he : 0)
    if (r === 0) (n !== null && Cu(n), (e.callbackNode = null), (e.callbackPriority = 0))
    else if (((t = r & -r), e.callbackPriority !== t)) {
        if ((n != null && Cu(n), t === 1))
            (e.tag === 0 ? Kd(gs.bind(null, e)) : Ua(gs.bind(null, e)),
                Bd(function () {
                    !(H & 6) && $t()
                }),
                (n = null))
        else {
            switch (ha(r)) {
                case 1:
                    n = Li
                    break
                case 4:
                    n = fa
                    break
                case 16:
                    n = al
                    break
                case 536870912:
                    n = da
                    break
                default:
                    n = al
            }
            n = Fc(n, Tc.bind(null, e))
        }
        ;((e.callbackPriority = t), (e.callbackNode = n))
    }
}
function Tc(e, t) {
    if (((rl = -1), (ll = 0), H & 6)) throw Error(w(327))
    var n = e.callbackNode
    if (Ln() && e.callbackNode !== n) return null
    var r = cl(e, e === fe ? he : 0)
    if (r === 0) return null
    if (r & 30 || r & e.expiredLanes || t) t = Ll(e, r)
    else {
        t = r
        var l = H
        H |= 2
        var o = Rc()
        ;(fe !== e || he !== t) && ((it = null), (Dn = oe() + 500), Jt(e, t))
        do
            try {
                hp()
                break
            } catch (u) {
                Mc(e, u)
            }
        while (!0)
        ;(Vi(), (Pl.current = o), (H = l), ue !== null ? (t = 0) : ((fe = null), (he = 0), (t = ae)))
    }
    if (t !== 0) {
        if ((t === 2 && ((l = Ao(e)), l !== 0 && ((r = l), (t = hi(e, l)))), t === 1))
            throw ((n = Cr), Jt(e, 0), Et(e, r), ze(e, oe()), n)
        if (t === 6) Et(e, r)
        else {
            if (
                ((l = e.current.alternate),
                !(r & 30) &&
                    !dp(l) &&
                    ((t = Ll(e, r)), t === 2 && ((o = Ao(e)), o !== 0 && ((r = o), (t = hi(e, o)))), t === 1))
            )
                throw ((n = Cr), Jt(e, 0), Et(e, r), ze(e, oe()), n)
            switch (((e.finishedWork = l), (e.finishedLanes = r), t)) {
                case 0:
                case 1:
                    throw Error(w(345))
                case 2:
                    Yt(e, Pe, it)
                    break
                case 3:
                    if ((Et(e, r), (r & 130023424) === r && ((t = nu + 500 - oe()), 10 < t))) {
                        if (cl(e, 0) !== 0) break
                        if (((l = e.suspendedLanes), (l & r) !== r)) {
                            ;(ke(), (e.pingedLanes |= e.suspendedLanes & l))
                            break
                        }
                        e.timeoutHandle = Go(Yt.bind(null, e, Pe, it), t)
                        break
                    }
                    Yt(e, Pe, it)
                    break
                case 4:
                    if ((Et(e, r), (r & 4194240) === r)) break
                    for (t = e.eventTimes, l = -1; 0 < r; ) {
                        var i = 31 - Xe(r)
                        ;((o = 1 << i), (i = t[i]), i > l && (l = i), (r &= ~o))
                    }
                    if (
                        ((r = l),
                        (r = oe() - r),
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
                                          : 1960 * fp(r / 1960)) - r),
                        10 < r)
                    ) {
                        e.timeoutHandle = Go(Yt.bind(null, e, Pe, it), r)
                        break
                    }
                    Yt(e, Pe, it)
                    break
                case 5:
                    Yt(e, Pe, it)
                    break
                default:
                    throw Error(w(329))
            }
        }
    }
    return (ze(e, oe()), e.callbackNode === n ? Tc.bind(null, e) : null)
}
function hi(e, t) {
    var n = ir
    return (
        e.current.memoizedState.isDehydrated && (Jt(e, t).flags |= 256),
        (e = Ll(e, t)),
        e !== 2 && ((t = Pe), (Pe = n), t !== null && mi(t)),
        e
    )
}
function mi(e) {
    Pe === null ? (Pe = e) : Pe.push.apply(Pe, e)
}
function dp(e) {
    for (var t = e; ; ) {
        if (t.flags & 16384) {
            var n = t.updateQueue
            if (n !== null && ((n = n.stores), n !== null))
                for (var r = 0; r < n.length; r++) {
                    var l = n[r],
                        o = l.getSnapshot
                    l = l.value
                    try {
                        if (!Je(o(), l)) return !1
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
function Et(e, t) {
    for (t &= ~tu, t &= ~Vl, e.suspendedLanes |= t, e.pingedLanes &= ~t, e = e.expirationTimes; 0 < t; ) {
        var n = 31 - Xe(t),
            r = 1 << n
        ;((e[n] = -1), (t &= ~r))
    }
}
function gs(e) {
    if (H & 6) throw Error(w(327))
    Ln()
    var t = cl(e, 0)
    if (!(t & 1)) return (ze(e, oe()), null)
    var n = Ll(e, t)
    if (e.tag !== 0 && n === 2) {
        var r = Ao(e)
        r !== 0 && ((t = r), (n = hi(e, r)))
    }
    if (n === 1) throw ((n = Cr), Jt(e, 0), Et(e, t), ze(e, oe()), n)
    if (n === 6) throw Error(w(345))
    return ((e.finishedWork = e.current.alternate), (e.finishedLanes = t), Yt(e, Pe, it), ze(e, oe()), null)
}
function ru(e, t) {
    var n = H
    H |= 1
    try {
        return e(t)
    } finally {
        ;((H = n), H === 0 && ((Dn = oe() + 500), Fl && $t()))
    }
}
function rn(e) {
    Pt !== null && Pt.tag === 0 && !(H & 6) && Ln()
    var t = H
    H |= 1
    var n = He.transition,
        r = B
    try {
        if (((He.transition = null), (B = 1), e)) return e()
    } finally {
        ;((B = r), (He.transition = n), (H = t), !(H & 6) && $t())
    }
}
function lu() {
    ;((Me = xn.current), K(xn))
}
function Jt(e, t) {
    ;((e.finishedWork = null), (e.finishedLanes = 0))
    var n = e.timeoutHandle
    if ((n !== -1 && ((e.timeoutHandle = -1), Hd(n)), ue !== null))
        for (n = ue.return; n !== null; ) {
            var r = n
            switch (($i(r), r.tag)) {
                case 1:
                    ;((r = r.type.childContextTypes), r != null && ml())
                    break
                case 3:
                    ;(jn(), K(Ne), K(we), Ki())
                    break
                case 5:
                    Yi(r)
                    break
                case 4:
                    jn()
                    break
                case 13:
                    K(q)
                    break
                case 19:
                    K(q)
                    break
                case 10:
                    Hi(r.type._context)
                    break
                case 22:
                case 23:
                    lu()
            }
            n = n.return
        }
    if (
        ((fe = e),
        (ue = e = jt(e.current, null)),
        (he = Me = t),
        (ae = 0),
        (Cr = null),
        (tu = Vl = nn = 0),
        (Pe = ir = null),
        Gt !== null)
    ) {
        for (t = 0; t < Gt.length; t++)
            if (((n = Gt[t]), (r = n.interleaved), r !== null)) {
                n.interleaved = null
                var l = r.next,
                    o = n.pending
                if (o !== null) {
                    var i = o.next
                    ;((o.next = l), (r.next = i))
                }
                n.pending = r
            }
        Gt = null
    }
    return e
}
function Mc(e, t) {
    do {
        var n = ue
        try {
            if ((Vi(), (el.current = Cl), El)) {
                for (var r = b.memoizedState; r !== null; ) {
                    var l = r.queue
                    ;(l !== null && (l.pending = null), (r = r.next))
                }
                El = !1
            }
            if (
                ((tn = 0),
                (ce = se = b = null),
                (lr = !1),
                (kr = 0),
                (eu.current = null),
                n === null || n.return === null)
            ) {
                ;((ae = 1), (Cr = t), (ue = null))
                break
            }
            e: {
                var o = e,
                    i = n.return,
                    u = n,
                    s = t
                if (((t = he), (u.flags |= 32768), s !== null && typeof s == 'object' && typeof s.then == 'function')) {
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
                    var g = rs(i)
                    if (g !== null) {
                        ;((g.flags &= -257), ls(g, i, u, o, t), g.mode & 1 && ns(o, a, t), (t = g), (s = a))
                        var y = t.updateQueue
                        if (y === null) {
                            var S = new Set()
                            ;(S.add(s), (t.updateQueue = S))
                        } else y.add(s)
                        break e
                    } else {
                        if (!(t & 1)) {
                            ;(ns(o, a, t), ou())
                            break e
                        }
                        s = Error(w(426))
                    }
                } else if (X && u.mode & 1) {
                    var F = rs(i)
                    if (F !== null) {
                        ;(!(F.flags & 65536) && (F.flags |= 256), ls(F, i, u, o, t), Ui(On(s, u)))
                        break e
                    }
                }
                ;((o = s = On(s, u)), ae !== 4 && (ae = 2), ir === null ? (ir = [o]) : ir.push(o), (o = i))
                do {
                    switch (o.tag) {
                        case 3:
                            ;((o.flags |= 65536), (t &= -t), (o.lanes |= t))
                            var f = hc(o, s, t)
                            Zu(o, f)
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
                                        (Mt === null || !Mt.has(p))))
                            ) {
                                ;((o.flags |= 65536), (t &= -t), (o.lanes |= t))
                                var v = mc(o, u, t)
                                Zu(o, v)
                                break e
                            }
                    }
                    o = o.return
                } while (o !== null)
            }
            Oc(n)
        } catch (x) {
            ;((t = x), ue === n && n !== null && (ue = n = n.return))
            continue
        }
        break
    } while (!0)
}
function Rc() {
    var e = Pl.current
    return ((Pl.current = Cl), e === null ? Cl : e)
}
function ou() {
    ;((ae === 0 || ae === 3 || ae === 2) && (ae = 4),
        fe === null || (!(nn & 268435455) && !(Vl & 268435455)) || Et(fe, he))
}
function Ll(e, t) {
    var n = H
    H |= 2
    var r = Rc()
    ;(fe !== e || he !== t) && ((it = null), Jt(e, t))
    do
        try {
            pp()
            break
        } catch (l) {
            Mc(e, l)
        }
    while (!0)
    if ((Vi(), (H = n), (Pl.current = r), ue !== null)) throw Error(w(261))
    return ((fe = null), (he = 0), ae)
}
function pp() {
    for (; ue !== null; ) jc(ue)
}
function hp() {
    for (; ue !== null && !Uf(); ) jc(ue)
}
function jc(e) {
    var t = Ic(e.alternate, e, Me)
    ;((e.memoizedProps = e.pendingProps), t === null ? Oc(e) : (ue = t), (eu.current = null))
}
function Oc(e) {
    var t = e
    do {
        var n = t.alternate
        if (((e = t.return), t.flags & 32768)) {
            if (((n = up(n, t)), n !== null)) {
                ;((n.flags &= 32767), (ue = n))
                return
            }
            if (e !== null) ((e.flags |= 32768), (e.subtreeFlags = 0), (e.deletions = null))
            else {
                ;((ae = 6), (ue = null))
                return
            }
        } else if (((n = ip(n, t, Me)), n !== null)) {
            ue = n
            return
        }
        if (((t = t.sibling), t !== null)) {
            ue = t
            return
        }
        ue = t = e
    } while (t !== null)
    ae === 0 && (ae = 5)
}
function Yt(e, t, n) {
    var r = B,
        l = He.transition
    try {
        ;((He.transition = null), (B = 1), mp(e, t, n, r))
    } finally {
        ;((He.transition = l), (B = r))
    }
    return null
}
function mp(e, t, n, r) {
    do Ln()
    while (Pt !== null)
    if (H & 6) throw Error(w(327))
    n = e.finishedWork
    var l = e.finishedLanes
    if (n === null) return null
    if (((e.finishedWork = null), (e.finishedLanes = 0), n === e.current)) throw Error(w(177))
    ;((e.callbackNode = null), (e.callbackPriority = 0))
    var o = n.lanes | n.childLanes
    if (
        (Xf(e, o),
        e === fe && ((ue = fe = null), (he = 0)),
        (!(n.subtreeFlags & 2064) && !(n.flags & 2064)) ||
            Yr ||
            ((Yr = !0),
            Fc(al, function () {
                return (Ln(), null)
            })),
        (o = (n.flags & 15990) !== 0),
        n.subtreeFlags & 15990 || o)
    ) {
        ;((o = He.transition), (He.transition = null))
        var i = B
        B = 1
        var u = H
        ;((H |= 4),
            (eu.current = null),
            ap(e, n),
            Lc(n, e),
            Dd(Yo),
            (fl = !!Qo),
            (Yo = Qo = null),
            (e.current = n),
            cp(n),
            Af(),
            (H = u),
            (B = i),
            (He.transition = o))
    } else e.current = n
    if (
        (Yr && ((Yr = !1), (Pt = e), (Nl = l)),
        (o = e.pendingLanes),
        o === 0 && (Mt = null),
        Bf(n.stateNode),
        ze(e, oe()),
        t !== null)
    )
        for (r = e.onRecoverableError, n = 0; n < t.length; n++)
            ((l = t[n]), r(l.value, { componentStack: l.stack, digest: l.digest }))
    if (_l) throw ((_l = !1), (e = di), (di = null), e)
    return (
        Nl & 1 && e.tag !== 0 && Ln(),
        (o = e.pendingLanes),
        o & 1 ? (e === pi ? ur++ : ((ur = 0), (pi = e))) : (ur = 0),
        $t(),
        null
    )
}
function Ln() {
    if (Pt !== null) {
        var e = ha(Nl),
            t = He.transition,
            n = B
        try {
            if (((He.transition = null), (B = 16 > e ? 16 : e), Pt === null)) var r = !1
            else {
                if (((e = Pt), (Pt = null), (Nl = 0), H & 6)) throw Error(w(331))
                var l = H
                for (H |= 4, L = e.current; L !== null; ) {
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
                                            or(8, m, o)
                                    }
                                    var h = m.child
                                    if (h !== null) ((h.return = m), (L = h))
                                    else
                                        for (; L !== null; ) {
                                            m = L
                                            var d = m.sibling,
                                                g = m.return
                                            if ((Pc(m), m === a)) {
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
                            var y = o.alternate
                            if (y !== null) {
                                var S = y.child
                                if (S !== null) {
                                    y.child = null
                                    do {
                                        var F = S.sibling
                                        ;((S.sibling = null), (S = F))
                                    } while (S !== null)
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
                                        or(9, o, o.return)
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
                                            Al(9, u)
                                    }
                                } catch (x) {
                                    re(u, u.return, x)
                                }
                            if (u === i) {
                                L = null
                                break e
                            }
                            var v = u.sibling
                            if (v !== null) {
                                ;((v.return = u.return), (L = v))
                                break e
                            }
                            L = u.return
                        }
                }
                if (((H = l), $t(), nt && typeof nt.onPostCommitFiberRoot == 'function'))
                    try {
                        nt.onPostCommitFiberRoot(Rl, e)
                    } catch {}
                r = !0
            }
            return r
        } finally {
            ;((B = n), (He.transition = t))
        }
    }
    return !1
}
function vs(e, t, n) {
    ;((t = On(n, t)), (t = hc(e, t, 1)), (e = Tt(e, t, 1)), (t = ke()), e !== null && (Nr(e, 1, t), ze(e, t)))
}
function re(e, t, n) {
    if (e.tag === 3) vs(e, e, n)
    else
        for (; t !== null; ) {
            if (t.tag === 3) {
                vs(t, e, n)
                break
            } else if (t.tag === 1) {
                var r = t.stateNode
                if (
                    typeof t.type.getDerivedStateFromError == 'function' ||
                    (typeof r.componentDidCatch == 'function' && (Mt === null || !Mt.has(r)))
                ) {
                    ;((e = On(n, e)),
                        (e = mc(t, e, 1)),
                        (t = Tt(t, e, 1)),
                        (e = ke()),
                        t !== null && (Nr(t, 1, e), ze(t, e)))
                    break
                }
            }
            t = t.return
        }
}
function gp(e, t, n) {
    var r = e.pingCache
    ;(r !== null && r.delete(t),
        (t = ke()),
        (e.pingedLanes |= e.suspendedLanes & n),
        fe === e &&
            (he & n) === n &&
            (ae === 4 || (ae === 3 && (he & 130023424) === he && 500 > oe() - nu) ? Jt(e, 0) : (tu |= n)),
        ze(e, t))
}
function Dc(e, t) {
    t === 0 && (e.mode & 1 ? ((t = Ir), (Ir <<= 1), !(Ir & 130023424) && (Ir = 4194304)) : (t = 1))
    var n = ke()
    ;((e = gt(e, t)), e !== null && (Nr(e, t, n), ze(e, n)))
}
function vp(e) {
    var t = e.memoizedState,
        n = 0
    ;(t !== null && (n = t.retryLane), Dc(e, n))
}
function yp(e, t) {
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
            throw Error(w(314))
    }
    ;(r !== null && r.delete(t), Dc(e, n))
}
var Ic
Ic = function (e, t, n) {
    if (e !== null)
        if (e.memoizedProps !== t.pendingProps || Ne.current) _e = !0
        else {
            if (!(e.lanes & n) && !(t.flags & 128)) return ((_e = !1), op(e, t, n))
            _e = !!(e.flags & 131072)
        }
    else ((_e = !1), X && t.flags & 1048576 && Aa(t, yl, t.index))
    switch (((t.lanes = 0), t.tag)) {
        case 2:
            var r = t.type
            ;(nl(e, t), (e = t.pendingProps))
            var l = Tn(t, we.current)
            ;(Nn(t, n), (l = Xi(null, t, r, e, l, n)))
            var o = Zi()
            return (
                (t.flags |= 1),
                typeof l == 'object' && l !== null && typeof l.render == 'function' && l.$$typeof === void 0
                    ? ((t.tag = 1),
                      (t.memoizedState = null),
                      (t.updateQueue = null),
                      Le(r) ? ((o = !0), gl(t)) : (o = !1),
                      (t.memoizedState = l.state !== null && l.state !== void 0 ? l.state : null),
                      Wi(t),
                      (l.updater = Ul),
                      (t.stateNode = l),
                      (l._reactInternals = t),
                      ti(t, r, e, n),
                      (t = li(null, t, r, !0, o, n)))
                    : ((t.tag = 0), X && o && Fi(t), Se(null, t, l, n), (t = t.child)),
                t
            )
        case 16:
            r = t.elementType
            e: {
                switch (
                    (nl(e, t),
                    (e = t.pendingProps),
                    (l = r._init),
                    (r = l(r._payload)),
                    (t.type = r),
                    (l = t.tag = Sp(r)),
                    (e = Ye(r, e)),
                    l)
                ) {
                    case 0:
                        t = ri(null, t, r, e, n)
                        break e
                    case 1:
                        t = us(null, t, r, e, n)
                        break e
                    case 11:
                        t = os(null, t, r, e, n)
                        break e
                    case 14:
                        t = is(null, t, r, Ye(r.type, e), n)
                        break e
                }
                throw Error(w(306, r, ''))
            }
            return t
        case 0:
            return ((r = t.type), (l = t.pendingProps), (l = t.elementType === r ? l : Ye(r, l)), ri(e, t, r, l, n))
        case 1:
            return ((r = t.type), (l = t.pendingProps), (l = t.elementType === r ? l : Ye(r, l)), us(e, t, r, l, n))
        case 3:
            e: {
                if ((wc(t), e === null)) throw Error(w(387))
                ;((r = t.pendingProps), (o = t.memoizedState), (l = o.element), Ya(e, t), kl(t, r, null, n))
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
                        ;((l = On(Error(w(423)), t)), (t = ss(e, t, r, n, l)))
                        break e
                    } else if (r !== l) {
                        ;((l = On(Error(w(424)), t)), (t = ss(e, t, r, n, l)))
                        break e
                    } else
                        for (
                            Re = zt(t.stateNode.containerInfo.firstChild),
                                Oe = t,
                                X = !0,
                                Ge = null,
                                n = Wa(t, null, r, n),
                                t.child = n;
                            n;

                        )
                            ((n.flags = (n.flags & -3) | 4096), (n = n.sibling))
                else {
                    if ((Mn(), r === l)) {
                        t = vt(e, t, n)
                        break e
                    }
                    Se(e, t, r, n)
                }
                t = t.child
            }
            return t
        case 5:
            return (
                Ka(t),
                e === null && qo(t),
                (r = t.type),
                (l = t.pendingProps),
                (o = e !== null ? e.memoizedProps : null),
                (i = l.children),
                Ko(r, l) ? (i = null) : o !== null && Ko(r, o) && (t.flags |= 32),
                yc(e, t),
                Se(e, t, i, n),
                t.child
            )
        case 6:
            return (e === null && qo(t), null)
        case 13:
            return Sc(e, t, n)
        case 4:
            return (
                Qi(t, t.stateNode.containerInfo),
                (r = t.pendingProps),
                e === null ? (t.child = Rn(t, null, r, n)) : Se(e, t, r, n),
                t.child
            )
        case 11:
            return ((r = t.type), (l = t.pendingProps), (l = t.elementType === r ? l : Ye(r, l)), os(e, t, r, l, n))
        case 7:
            return (Se(e, t, t.pendingProps, n), t.child)
        case 8:
            return (Se(e, t, t.pendingProps.children, n), t.child)
        case 12:
            return (Se(e, t, t.pendingProps.children, n), t.child)
        case 10:
            e: {
                if (
                    ((r = t.type._context),
                    (l = t.pendingProps),
                    (o = t.memoizedProps),
                    (i = l.value),
                    W(wl, r._currentValue),
                    (r._currentValue = i),
                    o !== null)
                )
                    if (Je(o.value, i)) {
                        if (o.children === l.children && !Ne.current) {
                            t = vt(e, t, n)
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
                                            ;((s = pt(-1, n & -n)), (s.tag = 2))
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
                                            bo(o.return, n, t),
                                            (u.lanes |= n))
                                        break
                                    }
                                    s = s.next
                                }
                            } else if (o.tag === 10) i = o.type === t.type ? null : o.child
                            else if (o.tag === 18) {
                                if (((i = o.return), i === null)) throw Error(w(341))
                                ;((i.lanes |= n),
                                    (u = i.alternate),
                                    u !== null && (u.lanes |= n),
                                    bo(i, n, t),
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
                ;(Se(e, t, l.children, n), (t = t.child))
            }
            return t
        case 9:
            return (
                (l = t.type),
                (r = t.pendingProps.children),
                Nn(t, n),
                (l = Be(l)),
                (r = r(l)),
                (t.flags |= 1),
                Se(e, t, r, n),
                t.child
            )
        case 14:
            return ((r = t.type), (l = Ye(r, t.pendingProps)), (l = Ye(r.type, l)), is(e, t, r, l, n))
        case 15:
            return gc(e, t, t.type, t.pendingProps, n)
        case 17:
            return (
                (r = t.type),
                (l = t.pendingProps),
                (l = t.elementType === r ? l : Ye(r, l)),
                nl(e, t),
                (t.tag = 1),
                Le(r) ? ((e = !0), gl(t)) : (e = !1),
                Nn(t, n),
                pc(t, r, l),
                ti(t, r, l, n),
                li(null, t, r, !0, e, n)
            )
        case 19:
            return kc(e, t, n)
        case 22:
            return vc(e, t, n)
    }
    throw Error(w(156, t.tag))
}
function Fc(e, t) {
    return ca(e, t)
}
function wp(e, t, n, r) {
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
function Ve(e, t, n, r) {
    return new wp(e, t, n, r)
}
function iu(e) {
    return ((e = e.prototype), !(!e || !e.isReactComponent))
}
function Sp(e) {
    if (typeof e == 'function') return iu(e) ? 1 : 0
    if (e != null) {
        if (((e = e.$$typeof), e === Pi)) return 11
        if (e === _i) return 14
    }
    return 2
}
function jt(e, t) {
    var n = e.alternate
    return (
        n === null
            ? ((n = Ve(e.tag, t, e.key, e.mode)),
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
function ol(e, t, n, r, l, o) {
    var i = 2
    if (((r = e), typeof e == 'function')) iu(e) && (i = 1)
    else if (typeof e == 'string') i = 5
    else
        e: switch (e) {
            case dn:
                return qt(n.children, l, o, t)
            case Ci:
                ;((i = 8), (l |= 8))
                break
            case Po:
                return ((e = Ve(12, n, t, l | 2)), (e.elementType = Po), (e.lanes = o), e)
            case _o:
                return ((e = Ve(13, n, t, l)), (e.elementType = _o), (e.lanes = o), e)
            case No:
                return ((e = Ve(19, n, t, l)), (e.elementType = No), (e.lanes = o), e)
            case Ks:
                return Hl(n, l, o, t)
            default:
                if (typeof e == 'object' && e !== null)
                    switch (e.$$typeof) {
                        case Qs:
                            i = 10
                            break e
                        case Ys:
                            i = 9
                            break e
                        case Pi:
                            i = 11
                            break e
                        case _i:
                            i = 14
                            break e
                        case St:
                            ;((i = 16), (r = null))
                            break e
                    }
                throw Error(w(130, e == null ? e : typeof e, ''))
        }
    return ((t = Ve(i, n, t, l)), (t.elementType = e), (t.type = r), (t.lanes = o), t)
}
function qt(e, t, n, r) {
    return ((e = Ve(7, e, r, t)), (e.lanes = n), e)
}
function Hl(e, t, n, r) {
    return ((e = Ve(22, e, r, t)), (e.elementType = Ks), (e.lanes = n), (e.stateNode = { isHidden: !1 }), e)
}
function wo(e, t, n) {
    return ((e = Ve(6, e, null, t)), (e.lanes = n), e)
}
function So(e, t, n) {
    return (
        (t = Ve(4, e.children !== null ? e.children : [], e.key, t)),
        (t.lanes = n),
        (t.stateNode = { containerInfo: e.containerInfo, pendingChildren: null, implementation: e.implementation }),
        t
    )
}
function kp(e, t, n, r, l) {
    ;((this.tag = t),
        (this.containerInfo = e),
        (this.finishedWork = this.pingCache = this.current = this.pendingChildren = null),
        (this.timeoutHandle = -1),
        (this.callbackNode = this.pendingContext = this.context = null),
        (this.callbackPriority = 0),
        (this.eventTimes = bl(0)),
        (this.expirationTimes = bl(-1)),
        (this.entangledLanes =
            this.finishedLanes =
            this.mutableReadLanes =
            this.expiredLanes =
            this.pingedLanes =
            this.suspendedLanes =
            this.pendingLanes =
                0),
        (this.entanglements = bl(0)),
        (this.identifierPrefix = r),
        (this.onRecoverableError = l),
        (this.mutableSourceEagerHydrationData = null))
}
function uu(e, t, n, r, l, o, i, u, s) {
    return (
        (e = new kp(e, t, n, u, s)),
        t === 1 ? ((t = 1), o === !0 && (t |= 8)) : (t = 0),
        (o = Ve(3, null, null, t)),
        (e.current = o),
        (o.stateNode = e),
        (o.memoizedState = {
            element: r,
            isDehydrated: n,
            cache: null,
            transitions: null,
            pendingSuspenseBoundaries: null,
        }),
        Wi(o),
        e
    )
}
function xp(e, t, n) {
    var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null
    return { $$typeof: fn, key: r == null ? null : '' + r, children: e, containerInfo: t, implementation: n }
}
function $c(e) {
    if (!e) return Dt
    e = e._reactInternals
    e: {
        if (on(e) !== e || e.tag !== 1) throw Error(w(170))
        var t = e
        do {
            switch (t.tag) {
                case 3:
                    t = t.stateNode.context
                    break e
                case 1:
                    if (Le(t.type)) {
                        t = t.stateNode.__reactInternalMemoizedMergedChildContext
                        break e
                    }
            }
            t = t.return
        } while (t !== null)
        throw Error(w(171))
    }
    if (e.tag === 1) {
        var n = e.type
        if (Le(n)) return $a(e, n, t)
    }
    return t
}
function Uc(e, t, n, r, l, o, i, u, s) {
    return (
        (e = uu(n, r, !0, e, l, o, i, u, s)),
        (e.context = $c(null)),
        (n = e.current),
        (r = ke()),
        (l = Rt(n)),
        (o = pt(r, l)),
        (o.callback = t ?? null),
        Tt(n, o, l),
        (e.current.lanes = l),
        Nr(e, l, r),
        ze(e, r),
        e
    )
}
function Bl(e, t, n, r) {
    var l = t.current,
        o = ke(),
        i = Rt(l)
    return (
        (n = $c(n)),
        t.context === null ? (t.context = n) : (t.pendingContext = n),
        (t = pt(o, i)),
        (t.payload = { element: e }),
        (r = r === void 0 ? null : r),
        r !== null && (t.callback = r),
        (e = Tt(l, t, i)),
        e !== null && (Ze(e, l, i, o), br(e, l, i)),
        i
    )
}
function zl(e) {
    if (((e = e.current), !e.child)) return null
    switch (e.child.tag) {
        case 5:
            return e.child.stateNode
        default:
            return e.child.stateNode
    }
}
function ys(e, t) {
    if (((e = e.memoizedState), e !== null && e.dehydrated !== null)) {
        var n = e.retryLane
        e.retryLane = n !== 0 && n < t ? n : t
    }
}
function su(e, t) {
    ;(ys(e, t), (e = e.alternate) && ys(e, t))
}
function Ep() {
    return null
}
var Ac =
    typeof reportError == 'function'
        ? reportError
        : function (e) {
              console.error(e)
          }
function au(e) {
    this._internalRoot = e
}
Wl.prototype.render = au.prototype.render = function (e) {
    var t = this._internalRoot
    if (t === null) throw Error(w(409))
    Bl(e, t, null, null)
}
Wl.prototype.unmount = au.prototype.unmount = function () {
    var e = this._internalRoot
    if (e !== null) {
        this._internalRoot = null
        var t = e.containerInfo
        ;(rn(function () {
            Bl(null, e, null, null)
        }),
            (t[mt] = null))
    }
}
function Wl(e) {
    this._internalRoot = e
}
Wl.prototype.unstable_scheduleHydration = function (e) {
    if (e) {
        var t = va()
        e = { blockedOn: null, target: e, priority: t }
        for (var n = 0; n < xt.length && t !== 0 && t < xt[n].priority; n++);
        ;(xt.splice(n, 0, e), n === 0 && wa(e))
    }
}
function cu(e) {
    return !(!e || (e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11))
}
function Ql(e) {
    return !(
        !e ||
        (e.nodeType !== 1 &&
            e.nodeType !== 9 &&
            e.nodeType !== 11 &&
            (e.nodeType !== 8 || e.nodeValue !== ' react-mount-point-unstable '))
    )
}
function ws() {}
function Cp(e, t, n, r, l) {
    if (l) {
        if (typeof r == 'function') {
            var o = r
            r = function () {
                var a = zl(i)
                o.call(a)
            }
        }
        var i = Uc(t, r, e, 0, null, !1, !1, '', ws)
        return ((e._reactRootContainer = i), (e[mt] = i.current), gr(e.nodeType === 8 ? e.parentNode : e), rn(), i)
    }
    for (; (l = e.lastChild); ) e.removeChild(l)
    if (typeof r == 'function') {
        var u = r
        r = function () {
            var a = zl(s)
            u.call(a)
        }
    }
    var s = uu(e, 0, !1, null, null, !1, !1, '', ws)
    return (
        (e._reactRootContainer = s),
        (e[mt] = s.current),
        gr(e.nodeType === 8 ? e.parentNode : e),
        rn(function () {
            Bl(t, s, n, r)
        }),
        s
    )
}
function Yl(e, t, n, r, l) {
    var o = n._reactRootContainer
    if (o) {
        var i = o
        if (typeof l == 'function') {
            var u = l
            l = function () {
                var s = zl(i)
                u.call(s)
            }
        }
        Bl(t, i, e, l)
    } else i = Cp(n, t, e, l, r)
    return zl(i)
}
ma = function (e) {
    switch (e.tag) {
        case 3:
            var t = e.stateNode
            if (t.current.memoizedState.isDehydrated) {
                var n = Jn(t.pendingLanes)
                n !== 0 && (zi(t, n | 1), ze(t, oe()), !(H & 6) && ((Dn = oe() + 500), $t()))
            }
            break
        case 13:
            ;(rn(function () {
                var r = gt(e, 1)
                if (r !== null) {
                    var l = ke()
                    Ze(r, e, 1, l)
                }
            }),
                su(e, 1))
    }
}
Ti = function (e) {
    if (e.tag === 13) {
        var t = gt(e, 134217728)
        if (t !== null) {
            var n = ke()
            Ze(t, e, 134217728, n)
        }
        su(e, 134217728)
    }
}
ga = function (e) {
    if (e.tag === 13) {
        var t = Rt(e),
            n = gt(e, t)
        if (n !== null) {
            var r = ke()
            Ze(n, e, t, r)
        }
        su(e, t)
    }
}
va = function () {
    return B
}
ya = function (e, t) {
    var n = B
    try {
        return ((B = e), t())
    } finally {
        B = n
    }
}
Fo = function (e, t, n) {
    switch (t) {
        case 'input':
            if ((To(e, n), (t = n.name), n.type === 'radio' && t != null)) {
                for (n = e; n.parentNode; ) n = n.parentNode
                for (
                    n = n.querySelectorAll('input[name=' + JSON.stringify('' + t) + '][type="radio"]'), t = 0;
                    t < n.length;
                    t++
                ) {
                    var r = n[t]
                    if (r !== e && r.form === e.form) {
                        var l = Il(r)
                        if (!l) throw Error(w(90))
                        ;(Xs(r), To(r, l))
                    }
                }
            }
            break
        case 'textarea':
            Js(e, n)
            break
        case 'select':
            ;((t = n.value), t != null && En(e, !!n.multiple, t, !1))
    }
}
la = ru
oa = rn
var Pp = { usingClientEntryPoint: !1, Events: [zr, gn, Il, na, ra, ru] },
    Kn = { findFiberByHostInstance: Kt, bundleType: 0, version: '18.3.1', rendererPackageName: 'react-dom' },
    _p = {
        bundleType: Kn.bundleType,
        version: Kn.version,
        rendererPackageName: Kn.rendererPackageName,
        rendererConfig: Kn.rendererConfig,
        overrideHookState: null,
        overrideHookStateDeletePath: null,
        overrideHookStateRenamePath: null,
        overrideProps: null,
        overridePropsDeletePath: null,
        overridePropsRenamePath: null,
        setErrorHandler: null,
        setSuspenseHandler: null,
        scheduleUpdate: null,
        currentDispatcherRef: yt.ReactCurrentDispatcher,
        findHostInstanceByFiber: function (e) {
            return ((e = sa(e)), e === null ? null : e.stateNode)
        },
        findFiberByHostInstance: Kn.findFiberByHostInstance || Ep,
        findHostInstancesForRefresh: null,
        scheduleRefresh: null,
        scheduleRoot: null,
        setRefreshHandler: null,
        getCurrentFiber: null,
        reconcilerVersion: '18.3.1-next-f1338f8080-20240426',
    }
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < 'u') {
    var Kr = __REACT_DEVTOOLS_GLOBAL_HOOK__
    if (!Kr.isDisabled && Kr.supportsFiber)
        try {
            ;((Rl = Kr.inject(_p)), (nt = Kr))
        } catch {}
}
Ie.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Pp
Ie.createPortal = function (e, t) {
    var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null
    if (!cu(t)) throw Error(w(200))
    return xp(e, t, null, n)
}
Ie.createRoot = function (e, t) {
    if (!cu(e)) throw Error(w(299))
    var n = !1,
        r = '',
        l = Ac
    return (
        t != null &&
            (t.unstable_strictMode === !0 && (n = !0),
            t.identifierPrefix !== void 0 && (r = t.identifierPrefix),
            t.onRecoverableError !== void 0 && (l = t.onRecoverableError)),
        (t = uu(e, 1, !1, null, null, n, !1, r, l)),
        (e[mt] = t.current),
        gr(e.nodeType === 8 ? e.parentNode : e),
        new au(t)
    )
}
Ie.findDOMNode = function (e) {
    if (e == null) return null
    if (e.nodeType === 1) return e
    var t = e._reactInternals
    if (t === void 0)
        throw typeof e.render == 'function' ? Error(w(188)) : ((e = Object.keys(e).join(',')), Error(w(268, e)))
    return ((e = sa(t)), (e = e === null ? null : e.stateNode), e)
}
Ie.flushSync = function (e) {
    return rn(e)
}
Ie.hydrate = function (e, t, n) {
    if (!Ql(t)) throw Error(w(200))
    return Yl(null, e, t, !0, n)
}
Ie.hydrateRoot = function (e, t, n) {
    if (!cu(e)) throw Error(w(405))
    var r = (n != null && n.hydratedSources) || null,
        l = !1,
        o = '',
        i = Ac
    if (
        (n != null &&
            (n.unstable_strictMode === !0 && (l = !0),
            n.identifierPrefix !== void 0 && (o = n.identifierPrefix),
            n.onRecoverableError !== void 0 && (i = n.onRecoverableError)),
        (t = Uc(t, null, e, 1, n ?? null, l, !1, o, i)),
        (e[mt] = t.current),
        gr(e),
        r)
    )
        for (e = 0; e < r.length; e++)
            ((n = r[e]),
                (l = n._getVersion),
                (l = l(n._source)),
                t.mutableSourceEagerHydrationData == null
                    ? (t.mutableSourceEagerHydrationData = [n, l])
                    : t.mutableSourceEagerHydrationData.push(n, l))
    return new Wl(t)
}
Ie.render = function (e, t, n) {
    if (!Ql(t)) throw Error(w(200))
    return Yl(null, e, t, !1, n)
}
Ie.unmountComponentAtNode = function (e) {
    if (!Ql(e)) throw Error(w(40))
    return e._reactRootContainer
        ? (rn(function () {
              Yl(null, null, e, !1, function () {
                  ;((e._reactRootContainer = null), (e[mt] = null))
              })
          }),
          !0)
        : !1
}
Ie.unstable_batchedUpdates = ru
Ie.unstable_renderSubtreeIntoContainer = function (e, t, n, r) {
    if (!Ql(n)) throw Error(w(200))
    if (e == null || e._reactInternals === void 0) throw Error(w(38))
    return Yl(e, t, n, !1, r)
}
Ie.version = '18.3.1-next-f1338f8080-20240426'
function Vc() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > 'u' || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != 'function'))
        try {
            __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Vc)
        } catch (e) {
            console.error(e)
        }
}
;(Vc(), (Vs.exports = Ie))
var Np = Vs.exports,
    Ss = Np
;((Eo.createRoot = Ss.createRoot), (Eo.hydrateRoot = Ss.hydrateRoot))
const Lp = [
        { id: 's1', type: 'Curb Cut', length: 20 },
        { id: 's2', type: 'Parking', length: 40 },
        { id: 's3', type: 'Curb Cut', length: 10 },
        { id: 's4', type: 'Loading', length: 30 },
        { id: 's5', type: 'Parking', length: 60 },
        { id: 's6', type: 'Unknown', length: 80 },
    ],
    st = { Parking: '#2a9d8f', 'Curb Cut': '#e76f51', Loading: '#264653', Unknown: 'gray' },
    zp = (e, t, n) => {
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
    Tp = (e, t) => (e === '0' ? t : e + t),
    Mp = e => (e.includes('.') ? e : e + '.'),
    Rp = e => (e.length <= 1 ? '' : e.slice(0, -1)),
    jp = (e, t, n, r, l) => {
        let o = t
        ;(e === 'backspace' ? (o = Rp(t)) : e === '.' ? (o = Mp(t)) : e >= '0' && e <= '9' && (o = Tp(t, e)), l(o))
    },
    Gn = (e, t, n) =>
        E.jsx(
            'button',
            { className: 'number-pad-button number-button', onClick: () => t(e), disabled: !1, children: e },
            e,
        ),
    ko = (e, t, n, r) => {
        const l = e === 'enter',
            o = e === 'cancel',
            i = e === 'backspace',
            u = `number-pad-button ${l ? 'enter-button' : o ? 'cancel-button' : 'function-button'}`,
            s = l && !r,
            a = () => (l ? '✓' : o ? '✗' : i ? '←' : e)
        return E.jsx('button', { className: u, onClick: () => t(e), disabled: s, children: a() }, e)
    },
    Op = (e, t) => {
        e.target === e.currentTarget && t()
    },
    Dp = ({ value: e, min: t = 0, max: n = 999, onSave: r, onCancel: l, label: o = 'Value' }) => {
        const [i, u] = j.useState(e.toString()),
            { isValid: s, errorMessage: a } = zp(i, t, n),
            m = j.useCallback((d, g) => {
                d.key === 'Escape' && g()
            }, [])
        j.useEffect(() => {
            const d = g => m(g, l)
            return (document.addEventListener('keydown', d), () => document.removeEventListener('keydown', d))
        }, [l, m])
        const h = j.useCallback(
            d => {
                d === 'enter' && s ? r(parseFloat(i)) : d === 'cancel' ? l() : jp(d, i, t, n, u)
            },
            [i, s, r, l, t, n],
        )
        return E.jsx('div', {
            className: 'number-pad-backdrop',
            onClick: d => Op(d, l),
            children: E.jsxs('div', {
                className: 'number-pad-container',
                children: [
                    E.jsxs('div', {
                        className: 'number-pad-header',
                        children: [
                            E.jsx('div', { className: 'number-pad-label', children: o }),
                            E.jsx('div', { className: `number-pad-display ${s ? '' : 'error'}`, children: i || '0' }),
                            !s && a && E.jsx('div', { className: 'number-pad-error', children: a }),
                        ],
                    }),
                    E.jsxs('div', {
                        className: 'number-pad-grid',
                        children: [
                            E.jsx('div', { className: 'number-pad-row', children: ['1', '2', '3'].map(d => Gn(d, h)) }),
                            E.jsx('div', { className: 'number-pad-row', children: ['4', '5', '6'].map(d => Gn(d, h)) }),
                            E.jsx('div', { className: 'number-pad-row', children: ['7', '8', '9'].map(d => Gn(d, h)) }),
                            E.jsxs('div', {
                                className: 'number-pad-row',
                                children: [Gn('0', h), Gn('.', h), ko('backspace', h, i, s)],
                            }),
                            E.jsxs('div', {
                                className: 'number-pad-row',
                                children: [ko('enter', h, i, s), ko('cancel', h, i, s)],
                            }),
                        ],
                    }),
                ],
            }),
        })
    },
    Ip = e => ({ id: 's' + Math.random().toString(36).slice(2, 7), type: 'Unknown', length: e }),
    Fp = (e = 'Parking', t = 20) => ({ id: 's' + Math.random().toString(36).slice(2, 7), type: e, length: t }),
    $p = e => {
        let t = 0
        return e.map(n => {
            const r = t
            return ((t += n.length), r)
        })
    },
    Up = (e, t, n) => {
        const r = [...e]
        return ((r[t] = { ...r[t], type: n }), r)
    },
    Ap = (e, t) => {
        const n = e[t]
        if (!n) return { segments: e, newIndex: t }
        const r = e.findIndex(a => a.type === 'Unknown')
        if (r === -1) return { segments: e, newIndex: t }
        const l = e[r],
            o = Math.min(20, l.length)
        if (o <= 0) return { segments: e, newIndex: t }
        const i = Fp('Parking', o),
            u = [...e]
        u[r] = { ...l, length: l.length - o }
        const s = n.type === 'Unknown' ? r : t + 1
        return (u.splice(s, 0, i), { segments: u, newIndex: s })
    },
    Vp = e => {
        const t = e.getBoundingClientRect()
        return { top: t.bottom + 4, left: t.left, width: t.width }
    },
    Hp = (e, t, n) =>
        E.jsx(
            'div',
            { className: 'curb-dropdown-item', style: { backgroundColor: st[e] }, onClick: () => t(n, e), children: e },
            e,
        ),
    Bp = (e, t) =>
        E.jsx('div', {
            className: 'curb-dropdown-item unknown-option',
            onClick: () => e(t, 'Unknown'),
            children: 'Unknown',
        }),
    Wp = (e, t, n) => {
        ;(e.stopPropagation(), n(t))
    },
    Qp = (e, t, n, r, l, o) => {
        const i = Up(n, e, t)
        ;(r(i), l && l(i), o(e))
    },
    Yp = (e, t, n, r, l) => {
        const { segments: o, newIndex: i } = Ap(t, e)
        ;(n(o), r && r(o), setTimeout(() => l(i), 0))
    },
    Kp = (e, t, n, r) => {
        if (t === e) {
            ;(n(null), r(null))
            return
        }
        n(e)
        const l = document.querySelector(`[data-row-index="${e}"] .type-button`)
        if (!l) return
        const o = Vp(l)
        r(o)
    },
    Gp = (e, t, n, r, l) => {
        ;(n(e, t), r(null), l(null))
    },
    Xp = ({ blockfaceLength: e = 240, onSegmentsChange: t, segments: n }) => {
        const [r, l] = j.useState(() => [Ip(e)]),
            [o, i] = j.useState(null),
            [u, s] = j.useState(0),
            [a, m] = j.useState(null),
            [h, d] = j.useState({ isOpen: !1, editingIndex: null, editingField: null, originalValue: 0 })
        j.useEffect(() => {
            n && n.length > 0 && l(n)
        }, [n])
        const g = $p(r),
            y = r.find(R => R.type === 'Unknown'),
            S = y && y.length > 0,
            F = j.useCallback((R, k) => Qp(R, k, r, l, t, s), [r, t]),
            f = j.useCallback(R => Yp(R, r, l, t, s), [r, t]),
            c = j.useCallback(R => Kp(R, o, i, m), [o]),
            p = j.useCallback((R, k) => Gp(R, k, F, i, m), [F]),
            v = j.useCallback((R, k, te) => {
                ;(d({ isOpen: !0, editingIndex: R, editingField: k, originalValue: te }), s(R))
            }, []),
            x = j.useCallback(
                R => {
                    const { editingIndex: k, editingField: te } = h
                    if (k === null || te === null) return
                    const le = [...r]
                    if (te === 'length') le[k] = { ...le[k], length: R }
                    else if (te === 'start' && k > 0) {
                        const de = le[k - 1],
                            Ut = le[k],
                            un = R - g[k - 1],
                            qe = de.length - un
                        qe >= 0 && ((le[k - 1] = { ...de, length: qe }), (le[k] = { ...Ut, length: un }))
                    }
                    ;(l(le), t && t(le), d({ isOpen: !1, editingIndex: null, editingField: null, originalValue: 0 }))
                },
                [h, r, g, t],
            ),
            z = j.useCallback(() => {
                d({ isOpen: !1, editingIndex: null, editingField: null, originalValue: 0 })
            }, []),
            T = () =>
                a
                    ? E.jsxs('div', {
                          className: 'curb-dropdown',
                          style: { top: a.top, left: a.left, width: a.width },
                          children: [Object.keys(st).map(R => Hp(R, p, o)), Bp(p, o)],
                      })
                    : null,
            M = (R, k) => {
                const le = `curb-table-row${k === u ? ' current-row' : ''}`
                return E.jsxs(
                    'tr',
                    {
                        className: le,
                        'data-row-index': k,
                        onClick: () => s(k),
                        style: { cursor: 'pointer' },
                        children: [
                            E.jsx('td', {
                                className: 'type-cell',
                                children: E.jsx('div', {
                                    className: 'type-container',
                                    children: E.jsx('button', {
                                        className: 'type-button',
                                        style: { backgroundColor: st[R.type] || '#666' },
                                        onClick: de => Wp(de, k, c),
                                        children: R.type,
                                    }),
                                }),
                            }),
                            E.jsxs('td', {
                                className: 'length-cell editable-cell',
                                onClick: de => {
                                    ;(de.stopPropagation(), v(k, 'length', R.length))
                                },
                                style: { cursor: 'pointer' },
                                children: [Math.round(R.length), ' ft'],
                            }),
                            E.jsxs('td', {
                                className: 'start-cell editable-cell',
                                onClick: de => {
                                    ;(de.stopPropagation(), v(k, 'start', g[k]))
                                },
                                style: { cursor: 'pointer' },
                                children: [Math.round(g[k]), ' ft'],
                            }),
                            E.jsx('td', {
                                className: 'add-cell',
                                children: E.jsx('button', {
                                    className: 'add-button',
                                    onClick: () => f(k),
                                    disabled: !S,
                                    children: '+',
                                }),
                            }),
                        ],
                    },
                    R.id,
                )
            }
        return E.jsxs('div', {
            className: 'curb-table-container',
            children: [
                E.jsxs('div', {
                    className: 'curb-table-header',
                    children: [
                        E.jsx('h3', { children: 'Curb Configuration' }),
                        E.jsxs('div', {
                            className: 'blockface-info',
                            children: [
                                'Total: ',
                                e,
                                ' ft',
                                y &&
                                    y.length > 0 &&
                                    E.jsxs('span', { children: [' • Remaining: ', Math.round(y.length), ' ft'] }),
                            ],
                        }),
                    ],
                }),
                E.jsx('div', {
                    className: 'curb-table-wrapper',
                    children: E.jsxs('table', {
                        className: 'curb-table',
                        children: [
                            E.jsx('thead', {
                                children: E.jsxs('tr', {
                                    children: [
                                        E.jsx('th', {}),
                                        E.jsx('th', { style: { textAlign: 'right' }, children: 'Length' }),
                                        E.jsx('th', { style: { textAlign: 'right' }, children: 'Start' }),
                                        E.jsx('th', {}),
                                    ],
                                }),
                            }),
                            E.jsx('tbody', { children: r.map(M) }),
                        ],
                    }),
                }),
                T(),
                h.isOpen &&
                    E.jsx(Dp, {
                        value: h.originalValue,
                        min: h.editingField === 'length' ? 1 : 0,
                        max: (h.editingField === 'length', e),
                        onSave: x,
                        onCancel: z,
                        label: h.editingField === 'length' ? 'Length' : 'Start',
                    }),
            ],
        })
    }
var Te = 63710088e-1,
    Hc = {
        centimeters: Te * 100,
        centimetres: Te * 100,
        degrees: 360 / (2 * Math.PI),
        feet: Te * 3.28084,
        inches: Te * 39.37,
        kilometers: Te / 1e3,
        kilometres: Te / 1e3,
        meters: Te,
        metres: Te,
        miles: Te / 1609.344,
        millimeters: Te * 1e3,
        millimetres: Te * 1e3,
        nauticalmiles: Te / 1852,
        radians: 1,
        yards: Te * 1.0936,
    }
function Tl(e, t, n = {}) {
    const r = { type: 'Feature' }
    return (
        (n.id === 0 || n.id) && (r.id = n.id),
        n.bbox && (r.bbox = n.bbox),
        (r.properties = t || {}),
        (r.geometry = e),
        r
    )
}
function Zt(e, t, n = {}) {
    if (!e) throw new Error('coordinates is required')
    if (!Array.isArray(e)) throw new Error('coordinates must be an Array')
    if (e.length < 2) throw new Error('coordinates must be at least 2 numbers long')
    if (!ks(e[0]) || !ks(e[1])) throw new Error('coordinates must contain numbers')
    return Tl({ type: 'Point', coordinates: e }, t, n)
}
function Bc(e, t, n = {}) {
    if (e.length < 2) throw new Error('coordinates must be an array of two or more positions')
    return Tl({ type: 'LineString', coordinates: e }, t, n)
}
function Zp(e, t = 'kilometers') {
    const n = Hc[t]
    if (!n) throw new Error(t + ' units is invalid')
    return e * n
}
function Jp(e, t = 'kilometers') {
    const n = Hc[t]
    if (!n) throw new Error(t + ' units is invalid')
    return e / n
}
function Pr(e) {
    return ((e % (2 * Math.PI)) * 180) / Math.PI
}
function je(e) {
    return ((e % 360) * Math.PI) / 180
}
function ks(e) {
    return !isNaN(e) && e !== null && !Array.isArray(e)
}
function dt(e) {
    if (!e) throw new Error('coord is required')
    if (!Array.isArray(e)) {
        if (e.type === 'Feature' && e.geometry !== null && e.geometry.type === 'Point')
            return [...e.geometry.coordinates]
        if (e.type === 'Point') return [...e.coordinates]
    }
    if (Array.isArray(e) && e.length >= 2 && !Array.isArray(e[0]) && !Array.isArray(e[1])) return [...e]
    throw new Error('coord must be GeoJSON Point or an Array of numbers')
}
function Wc(e) {
    if (Array.isArray(e)) return e
    if (e.type === 'Feature') {
        if (e.geometry !== null) return e.geometry.coordinates
    } else if (e.coordinates) return e.coordinates
    throw new Error('coords must be GeoJSON Feature, Geometry Object or an Array')
}
function qp(e) {
    return e.type === 'Feature' ? e.geometry : e
}
function bp(e, t) {
    return e.type === 'FeatureCollection'
        ? 'FeatureCollection'
        : e.type === 'GeometryCollection'
          ? 'GeometryCollection'
          : e.type === 'Feature' && e.geometry !== null
            ? e.geometry.type
            : e.type
}
function Qc(e, t, n = {}) {
    if (n.final === !0) return eh(e, t)
    const r = dt(e),
        l = dt(t),
        o = je(r[0]),
        i = je(l[0]),
        u = je(r[1]),
        s = je(l[1]),
        a = Math.sin(i - o) * Math.cos(s),
        m = Math.cos(u) * Math.sin(s) - Math.sin(u) * Math.cos(s) * Math.cos(i - o)
    return Pr(Math.atan2(a, m))
}
function eh(e, t) {
    let n = Qc(t, e)
    return ((n = (n + 180) % 360), n)
}
function th(e, t, n, r = {}) {
    const l = dt(e),
        o = je(l[0]),
        i = je(l[1]),
        u = je(n),
        s = Jp(t, r.units),
        a = Math.asin(Math.sin(i) * Math.cos(s) + Math.cos(i) * Math.sin(s) * Math.cos(u)),
        m = o + Math.atan2(Math.sin(u) * Math.sin(s) * Math.cos(i), Math.cos(s) - Math.sin(i) * Math.sin(a)),
        h = Pr(m),
        d = Pr(a)
    return Zt([h, d], r.properties)
}
function at(e, t, n = {}) {
    var r = dt(e),
        l = dt(t),
        o = je(l[1] - r[1]),
        i = je(l[0] - r[0]),
        u = je(r[1]),
        s = je(l[1]),
        a = Math.pow(Math.sin(o / 2), 2) + Math.pow(Math.sin(i / 2), 2) * Math.cos(u) * Math.cos(s)
    return Zp(2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)), n.units)
}
function nh(e, t, n = {}) {
    const l = qp(e).coordinates
    let o = 0
    for (let i = 0; i < l.length && !(t >= o && i === l.length - 1); i++)
        if (o >= t) {
            const u = t - o
            if (u) {
                const s = Qc(l[i], l[i - 1]) - 180
                return th(l[i], u, s, n)
            } else return Zt(l[i])
        } else o += at(l[i], l[i + 1], n)
    return Zt(l[l.length - 1])
}
var Yc = nh
function Kc(e, t, n) {
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
                y = g === 'FeatureCollection',
                S = g === 'Feature',
                F = y ? e.features.length : 1,
                f = 0;
            f < F;
            f++
        ) {
            ;((a = y ? e.features[f].geometry : S ? e.geometry : e),
                (d = a ? a.type === 'GeometryCollection' : !1),
                (u = d ? a.geometries.length : 1))
            for (var c = 0; c < u; c++) {
                var p = 0,
                    v = 0
                if (((i = d ? a.geometries[c] : a), i !== null)) {
                    s = i.coordinates
                    var x = i.type
                    switch (((m = 0), x)) {
                        case null:
                            break
                        case 'Point':
                            if (t(s, h, f, p, v) === !1) return !1
                            ;(h++, p++)
                            break
                        case 'LineString':
                        case 'MultiPoint':
                            for (r = 0; r < s.length; r++) {
                                if (t(s[r], h, f, p, v) === !1) return !1
                                ;(h++, x === 'MultiPoint' && p++)
                            }
                            x === 'LineString' && p++
                            break
                        case 'Polygon':
                        case 'MultiLineString':
                            for (r = 0; r < s.length; r++) {
                                for (l = 0; l < s[r].length - m; l++) {
                                    if (t(s[r][l], h, f, p, v) === !1) return !1
                                    h++
                                }
                                ;(x === 'MultiLineString' && p++, x === 'Polygon' && v++)
                            }
                            x === 'Polygon' && p++
                            break
                        case 'MultiPolygon':
                            for (r = 0; r < s.length; r++) {
                                for (v = 0, l = 0; l < s[r].length; l++) {
                                    for (o = 0; o < s[r][l].length - m; o++) {
                                        if (t(s[r][l][o], h, f, p, v) === !1) return !1
                                        h++
                                    }
                                    v++
                                }
                                p++
                            }
                            break
                        case 'GeometryCollection':
                            for (r = 0; r < i.geometries.length; r++) if (Kc(i.geometries[r], t) === !1) return !1
                            break
                        default:
                            throw new Error('Unknown Geometry Type')
                    }
                }
            }
        }
}
function rh(e, t) {
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
        y = e.type === 'Feature',
        S = g ? e.features.length : 1
    for (n = 0; n < S; n++) {
        for (
            u = g ? e.features[n].geometry : y ? e.geometry : e,
                a = g ? e.features[n].properties : y ? e.properties : {},
                m = g ? e.features[n].bbox : y ? e.bbox : void 0,
                h = g ? e.features[n].id : y ? e.id : void 0,
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
function Gc(e, t) {
    rh(e, function (n, r, l, o, i) {
        var u = n === null ? null : n.type
        switch (u) {
            case null:
            case 'Point':
            case 'LineString':
            case 'Polygon':
                return t(Tl(n, l, { bbox: o, id: i }), r, 0) === !1 ? !1 : void 0
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
            if (t(Tl(h, l), r, a) === !1) return !1
        }
    })
}
function lh(e, t) {
    Gc(e, function (n, r, l) {
        var o = 0
        if (n.geometry) {
            var i = n.geometry.type
            if (!(i === 'Point' || i === 'MultiPoint')) {
                var u,
                    s = 0,
                    a = 0,
                    m = 0
                if (
                    Kc(n, function (h, d, g, y, S) {
                        if (u === void 0 || r > s || y > a || S > m) {
                            ;((u = h), (s = r), (a = y), (m = S), (o = 0))
                            return
                        }
                        var F = Bc([u, h], n.properties)
                        if (t(F, r, l, S, o) === !1) return !1
                        ;(o++, (u = h))
                    }) === !1
                )
                    return !1
            }
        }
    })
}
function oh(e, t, n) {
    var r = n,
        l = !1
    return (
        lh(e, function (o, i, u, s, a) {
            ;(l === !1 && n === void 0 ? (r = o) : (r = t(r, o, i, u, s, a)), (l = !0))
        }),
        r
    )
}
function ih(e, t = {}) {
    return oh(
        e,
        (n, r) => {
            const l = r.geometry.coordinates
            return n + at(l[0], l[1], t)
        },
        0,
    )
}
var Xc = ih,
    uh = Object.defineProperty,
    sh = Object.defineProperties,
    ah = Object.getOwnPropertyDescriptors,
    xs = Object.getOwnPropertySymbols,
    ch = Object.prototype.hasOwnProperty,
    fh = Object.prototype.propertyIsEnumerable,
    Es = (e, t, n) => (t in e ? uh(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : (e[t] = n)),
    Cs = (e, t) => {
        for (var n in t || (t = {})) ch.call(t, n) && Es(e, n, t[n])
        if (xs) for (var n of xs(t)) fh.call(t, n) && Es(e, n, t[n])
        return e
    },
    Ps = (e, t) => sh(e, ah(t))
function _s(e, t, n = {}) {
    if (!e || !t) throw new Error('lines and pt are required arguments')
    const r = dt(t)
    let l = Zt([1 / 0, 1 / 0], { dist: 1 / 0, index: -1, multiFeatureIndex: -1, location: -1 }),
        o = 0
    return (
        Gc(e, function (i, u, s) {
            const a = Wc(i)
            for (let m = 0; m < a.length - 1; m++) {
                const h = Zt(a[m])
                h.properties.dist = at(t, h, n)
                const d = dt(h),
                    g = Zt(a[m + 1])
                g.properties.dist = at(t, g, n)
                const y = dt(g),
                    S = at(h, g, n)
                let F, f
                d[0] === r[0] && d[1] === r[1]
                    ? ([F, , f] = [d, void 0, !1])
                    : y[0] === r[0] && y[1] === r[1]
                      ? ([F, , f] = [y, void 0, !0])
                      : ([F, , f] = hh(h.geometry.coordinates, g.geometry.coordinates, dt(t)))
                let c
                ;(F && (c = Zt(F, { dist: at(t, F, n), multiFeatureIndex: s, location: o + at(h, F, n) })),
                    c &&
                        c.properties.dist < l.properties.dist &&
                        (l = Ps(Cs({}, c), { properties: Ps(Cs({}, c.properties), { index: f ? m + 1 : m }) })),
                    (o += S))
            }
        }),
        l
    )
}
function dh(e, t) {
    const [n, r, l] = e,
        [o, i, u] = t
    return n * o + r * i + l * u
}
function ph(e, t) {
    const [n, r, l] = e,
        [o, i, u] = t
    return [r * u - l * i, l * o - n * u, n * i - r * o]
}
function Ns(e) {
    return Math.sqrt(Math.pow(e[0], 2) + Math.pow(e[1], 2) + Math.pow(e[2], 2))
}
function Bt(e, t) {
    const n = dh(e, t) / (Ns(e) * Ns(t))
    return Math.acos(Math.min(Math.max(n, -1), 1))
}
function xo(e) {
    const t = je(e[1]),
        n = je(e[0])
    return [Math.cos(t) * Math.cos(n), Math.cos(t) * Math.sin(n), Math.sin(t)]
}
function Wt(e) {
    const [t, n, r] = e,
        l = Pr(Math.asin(r))
    return [Pr(Math.atan2(n, t)), l]
}
function hh(e, t, n) {
    const r = xo(e),
        l = xo(t),
        o = xo(n),
        [i, u, s] = o,
        [a, m, h] = ph(r, l),
        d = m * s - h * u,
        g = h * i - a * s,
        y = a * u - m * i,
        S = y * m - g * h,
        F = d * h - y * a,
        f = g * a - d * m,
        c = 1 / Math.sqrt(Math.pow(S, 2) + Math.pow(F, 2) + Math.pow(f, 2)),
        p = [S * c, F * c, f * c],
        v = [-1 * S * c, -1 * F * c, -1 * f * c],
        x = Bt(r, l),
        z = Bt(r, p),
        T = Bt(l, p),
        M = Bt(r, v),
        R = Bt(l, v)
    let k
    return (
        (z < M && z < R) || (T < M && T < R) ? (k = p) : (k = v),
        Bt(r, k) > x || Bt(l, k) > x
            ? at(Wt(k), Wt(r)) <= at(Wt(k), Wt(l))
                ? [Wt(r), !0, !1]
                : [Wt(l), !1, !0]
            : [Wt(k), !1, !1]
    )
}
function mh(e, t, n) {
    var r = Wc(n)
    if (bp(n) !== 'LineString') throw new Error('line must be a LineString')
    var l = _s(n, e),
        o = _s(n, t),
        i
    l.properties.index <= o.properties.index ? (i = [l, o]) : (i = [o, l])
    for (var u = [i[0].geometry.coordinates], s = i[0].properties.index + 1; s < i[1].properties.index + 1; s++)
        u.push(r[s])
    return (u.push(i[1].geometry.coordinates), Bc(u, n.properties))
}
var gh = mh
const vh = e => {
        const t = e.properties,
            n = e.geometry.coordinates,
            r = n[0],
            l = n[n.length - 1],
            o = `${r[0].toFixed(6)},${r[1].toFixed(6)}-${l[0].toFixed(6)},${l[1].toFixed(6)}`
        return `${JSON.stringify(t)}/${o}`
    },
    Ls = e =>
        ({ ...st, 'No Parking': '#E91E63', 'Bus Stop': '#2196F3', Taxi: '#FFEB3B', Disabled: '#9C27B0' })[e] ||
        '#999999',
    zs = e => {
        var n
        if (!((n = e == null ? void 0 : e.geometry) != null && n.coordinates)) return null
        const t = e.geometry.coordinates
        return { ...e, geometry: { ...e.geometry, coordinates: t.length > 2 ? [t[0], t[1]] : t } }
    },
    yh = (e, t, n) =>
        t <= n
            ? { type: 'Feature', geometry: { type: 'Point', coordinates: e.geometry.coordinates[0] }, properties: {} }
            : Yc(e, t, { units: 'kilometers' }),
    wh = (e, t, n, r) => {
        if (t >= n - r) {
            const l = e.geometry.coordinates
            return { type: 'Feature', geometry: { type: 'Point', coordinates: l[l.length - 1] }, properties: {} }
        }
        return Yc(e, t, { units: 'kilometers' })
    },
    Sh = (e, t, n, r, l, o) => {
        const i = u => (
            console.error('Error creating segment:', u, {
                startDistanceKm: n,
                endDistanceKm: r,
                totalGeographicLengthKm: l,
            }),
            {
                type: 'Feature',
                geometry: { type: 'LineString', coordinates: [] },
                properties: { color: Ls(t.type), type: t.type, length: t.length },
            }
        )
        try {
            const u = yh(e, n, o),
                s = wh(e, r, l, o),
                a = zs(u),
                m = zs(s)
            if (!a || !m) throw new Error(`Point normalization failed: startPoint=${!!a}, endPoint=${!!m}`)
            return {
                type: 'Feature',
                geometry: gh(a, m, e).geometry,
                properties: { color: Ls(t.type), type: t.type, length: t.length },
            }
        } catch (u) {
            return i(u)
        }
    },
    kh = (e, t) => {
        if (!(e != null && e.geometry) || e.geometry.type !== 'LineString' || !(t != null && t.length))
            return { type: 'FeatureCollection', features: [] }
        const n = Xc(e),
            r = t.reduce((u, s) => u + s.length, 0),
            l = 1e-6
        let o = 0
        return {
            type: 'FeatureCollection',
            features: t
                .map(u => {
                    const s = u.length / r,
                        a = o,
                        m = o + s,
                        h = a * n,
                        d = m * n
                    return ((o = m), Sh(e, u, h, d, n, l))
                })
                .filter(u => u.geometry.coordinates.length >= 2),
        }
    },
    xh = () => ({ type: 'geojson', data: 'https://data.sfgov.org/resource/pep9-66vw.geojson?$limit=50000' }),
    Eh = () => ({
        id: 'sf-blockfaces',
        type: 'line',
        source: 'sf-blockfaces-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#888888', 'line-width': 4, 'line-opacity': 0.8 },
    }),
    Ch = e => ({ type: 'geojson', data: { type: 'Feature', geometry: e.geometry, properties: e.properties } }),
    Ph = () => ({
        id: 'highlighted-blockface',
        type: 'line',
        source: 'highlighted-blockface-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#ff0000', 'line-width': 4, 'line-opacity': 0.8 },
    }),
    gi = e => {
        try {
            ;(e.getLayer('highlighted-blockface') && e.removeLayer('highlighted-blockface'),
                e.getSource('highlighted-blockface-source') && e.removeSource('highlighted-blockface-source'))
        } catch {}
    },
    _h = (e, t) => {
        ;(e.addSource('highlighted-blockface-source', Ch(t)), e.addLayer(Ph()))
    },
    Nh = (e, t) => {
        e && (gi(e), _h(e, t))
    },
    Lh = e => {
        const t = Xc(e)
        return Math.round(t * 3280.84)
    },
    zh = e => {
        ;(e.on('mouseenter', 'sf-blockfaces', () => (e.getCanvas().style.cursor = 'crosshair')),
            e.on('mouseleave', 'sf-blockfaces', () => (e.getCanvas().style.cursor = '')))
    },
    Th = (e, t) => n => {
        const r = e.queryRenderedFeatures(n.point, { layers: ['sf-blockfaces'] })
        if (r.length === 0) return
        const l = r[0],
            o = vh(l),
            i = Lh(l)
        t.current && t.current({ id: o, feature: l, length: i })
    },
    Mh = (e, t) => n => {
        n.sourceId !== 'sf-blockfaces-source' ||
            !n.isSourceLoaded ||
            e.getLayer('sf-blockfaces') ||
            (e.addLayer(Eh()), zh(e), e.on('click', 'sf-blockfaces', Th(e, t)))
    },
    Rh = (e, t) => {
        ;(e.addSource('sf-blockfaces-source', xh()), e.on('sourcedata', Mh(e, t)))
    },
    jh = e => {
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
    Oh = (e, t, n) => {
        const r = e.getSource('segmented-highlight-source')
        if (r) {
            if (t && n != null && n.length) {
                const l = kh(t, n)
                ;(r.setData(l), gi(e))
                return
            }
            if (t) {
                ;(r.setData({ type: 'FeatureCollection', features: [] }), Nh(e, t))
                return
            }
            ;(r.setData({ type: 'FeatureCollection', features: [] }), gi(e))
        }
    },
    Dh = ({
        accessToken: e = 'your-mapbox-token-here',
        onBlockfaceSelect: t,
        selectedBlockface: n,
        currentSegments: r,
    }) => {
        const l = j.useRef(null),
            o = j.useRef(null),
            i = j.useRef(t)
        return (
            (i.current = t),
            j.useEffect(() => {
                o.current ||
                    ((o.current = new mapboxgl.Map({
                        container: l.current,
                        style: 'mapbox://styles/mapbox/streets-v11',
                        center: [-122.4194, 37.7749],
                        zoom: 16,
                        accessToken: e,
                        collectResourceTiming: !1,
                    })),
                    o.current.on('load', () => Rh(o.current, i)))
            }, [e]),
            j.useEffect(() => {
                var u
                ;(u = o.current) != null && u.isStyleLoaded() && jh(o.current)
            }, [o.current]),
            j.useEffect(() => {
                var u
                ;(u = o.current) != null && u.isStyleLoaded() && Oh(o.current, n == null ? void 0 : n.feature, r)
            }, [n == null ? void 0 : n.feature, n == null ? void 0 : n.id, r]),
            E.jsx('div', {
                ref: l,
                style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 },
            })
        )
    },
    Ih = (e, t) => !(e.bottom < t.top || e.top > t.bottom),
    Fh = (e, t) => !(e.right < t.left || e.left > t.right),
    $h = e => {
        const t = e.map(r => (r == null ? void 0 : r.getBoundingClientRect())),
            n = new Array(t.length).fill(0)
        for (let r = 0; r < t.length; r++)
            if (t[r]) for (let l = 0; l < r; l++) t[l] && Fh(t[r], t[l]) && n[r] <= n[l] && (n[r] = n[l] + 1)
        return n
    },
    Uh = e => {
        const t = e.map(r => (r == null ? void 0 : r.getBoundingClientRect())),
            n = new Array(t.length).fill(0)
        for (let r = 0; r < t.length; r++)
            if (t[r]) for (let l = 0; l < r; l++) t[l] && Ih(t[r], t[l]) && n[r] <= n[l] && (n[r] = n[l] + 1)
        return n
    },
    Ah = e => {
        const t = e.map(r => (r == null ? void 0 : r.style.width))
        e.forEach(r => {
            r && (r.style.width = 'auto')
        })
        const n = e.reduce((r, l) => (l ? Math.max(r, l.offsetWidth) : r), 0)
        return (
            e.forEach((r, l) => {
                r && (r.style.width = t[l] || 'auto')
            }),
            n
        )
    },
    Vh = e => ({ positions: $h(e).map(r => r * 1.5), uniformWidth: 0, contentWidth: 0 }),
    Hh = e => {
        const t = Uh(e),
            r = Ah(e) - 1,
            l = r - 10
        return { positions: t.map(i => i * r), uniformWidth: r, contentWidth: l }
    },
    Bh = (e, t) => (e ? Hh(t) : Vh(t)),
    Wh = ({ onDrag: e, orientation: t = 'horizontal' }) => {
        const n = t === 'vertical',
            r = a => {
                const m = d => {
                        if (a.current === null) return
                        const g = n ? d.clientY : d.clientX,
                            y = g - a.current
                        ;((a.current = g), e(y))
                    },
                    h = () => {
                        ;((a.current = null),
                            window.removeEventListener('mousemove', m),
                            window.removeEventListener('mouseup', h))
                    }
                ;(window.addEventListener('mousemove', m), window.addEventListener('mouseup', h))
            },
            l = a => {
                const m = d => {
                        if (a.current === null) return
                        const g = n ? d.touches[0].clientY : d.touches[0].clientX,
                            y = g - a.current
                        ;((a.current = g), e(y))
                    },
                    h = () => {
                        ;((a.current = null),
                            window.removeEventListener('touchmove', m),
                            window.removeEventListener('touchend', h))
                    }
                ;(window.addEventListener('touchmove', m, { passive: !1 }), window.addEventListener('touchend', h))
            },
            o = (a, m) => {
                ;(m.stopPropagation(), m.preventDefault(), (a.current = n ? m.clientY : m.clientX), r(a))
            },
            i = (a, m) => {
                ;((a.current = n ? m.touches[0].clientY : m.touches[0].clientX), l(a))
            },
            u = j.useRef(null),
            s = n ? 'row-resize' : 'col-resize'
        return E.jsx('div', {
            className: 'draggable-divider',
            style: { width: '100%', height: '100%', cursor: s, touchAction: 'none' },
            onMouseDown: a => o(u, a),
            onTouchStart: a => i(u, a),
        })
    },
    Qh = ({ orientation: e = 'horizontal', blockfaceLength: t = 240, blockfaceId: n, onSegmentsChange: r }) => {
        const l = e === 'vertical',
            o = (P, C = 240) => {
                const N = P / C
                return Lp.map(O => ({ ...O, length: Math.round(O.length * N) }))
            },
            i = P => {
                const C = (N, O) => [...N, N[N.length - 1] + O.length]
                return P.reduce(C, [0])
            },
            u = (P, C) =>
                j.useCallback(
                    (N, O, $) => {
                        C(I => {
                            const ne = $ / P,
                                Q = O / ne,
                                G = I[N],
                                J = I[N + 1]
                            if (!G || !J) return I
                            const $e = G.length + Q,
                                Vt = J.length - Q
                            if ($e < 1 || Vt < 1) return I
                            const Ht = [...I]
                            return ((Ht[N] = { ...G, length: $e }), (Ht[N + 1] = { ...J, length: Vt }), Ht)
                        })
                    },
                    [P],
                ),
            s = P => (C, N) => {
                P($ => {
                    const A = [...$],
                        [I] = A.splice(C, 1)
                    return (A.splice(N, 0, I), A)
                })
            },
            a = (P, C) => (N, O) => {
                ;(P(A => {
                    const I = [...A]
                    return ((I[N] = { ...I[N], type: O }), I)
                }),
                    C(null))
            },
            m = (P, C) => N => {
                ;(P($ => {
                    const I = $[N]
                    if (!I) return $
                    const ne = () => ({ id: 's' + Math.random().toString(36).slice(2, 7), type: 'Parking', length: 10 })
                    if (I.length >= 11) {
                        const J = [...$]
                        return ((J[N] = { ...I, length: I.length - 10 }), J.splice(N, 0, ne()), J)
                    }
                    if (N > 0 && $[N - 1].length >= 11) {
                        const J = [...$]
                        return ((J[N - 1] = { ...$[N - 1], length: $[N - 1].length - 10 }), J.splice(N, 0, ne()), J)
                    }
                    return $
                }),
                    C(null))
            },
            h = (P, C, N) => O => {
                if (O.target.classList.contains('divider')) {
                    O.preventDefault()
                    return
                }
                ;((P.current = { index: N }), C(N), (O.dataTransfer.effectAllowed = 'move'))
            },
            d = (P, C, N, O) => $ => {
                if ($.target.classList.contains('divider')) return
                const A = P.current.index,
                    I = O
                ;(C(null), A !== void 0 && A !== I && N(A, I))
            },
            g = (P, C, N, O, $) => A => {
                var $e
                if (A.target.classList.contains('divider')) return
                A.preventDefault()
                const I = A.touches[0],
                    ne = ($e = O.current) == null ? void 0 : $e.getBoundingClientRect()
                if (!ne) return
                const Q = A.target.getBoundingClientRect(),
                    G = I.clientX - Q.left,
                    J = I.clientY - Q.top
                ;((P.current = {
                    index: N,
                    startY: I.clientY,
                    startX: I.clientX,
                    isDragging: !0,
                    offsetX: G,
                    offsetY: J,
                }),
                    C(N),
                    $({ x: I.clientX - ne.left - G, y: I.clientY - ne.top - J }))
            },
            y = (P, C, N) => O => {
                ;(O.stopPropagation(), C(P === N ? null : N))
            },
            S = (P, C) => (N, O) => {
                ;(N.stopPropagation(), P(C, O))
            },
            F = (P, C) => N => {
                ;(N.stopPropagation(), P(C))
            },
            f = (P, C) => {
                let N = 0
                const O = P.children
                for (let $ = 0; $ < O.length; $++) {
                    const A = O[$]
                    if (!A.classList.contains('segment')) continue
                    const I = l ? A.offsetHeight : A.offsetWidth
                    if (C >= N && C <= N + I) return $
                    N += I
                }
                return -1
            },
            c = (P, C, N, O, $) => ({
                handleTouchMove: ne => {
                    if (C.current.index === void 0) return
                    ne.preventDefault()
                    const Q = ne.touches[0],
                        G = P.current
                    if (!G) return
                    const J = G.getBoundingClientRect(),
                        $e = l ? Q.clientY - J.top : Q.clientX - J.left
                    ;(N({ x: Q.clientX - J.left - C.current.offsetX, y: Q.clientY - J.top - C.current.offsetY }),
                        (C.current.targetIndex = f(G, $e)))
                },
                handleTouchEnd: ne => {
                    if (C.current.index === void 0) return
                    ne.preventDefault()
                    const Q = C.current.index,
                        G = C.current.targetIndex !== void 0 ? C.current.targetIndex : Q
                    ;(Q !== void 0 && Q !== G && O(Q, G), $(null), N({ x: 0, y: 0 }), (C.current = {}))
                },
            }),
            p = (P, C, N, O, $, A, I, ne, Q, G) => {
                const J = (P.length / O) * 100,
                    $e = $ === C,
                    Vt = {
                        backgroundColor: st[P.type] || '#999',
                        ...(l ? { height: `${J}%`, width: '100%' } : { width: `${J}%`, height: '100%' }),
                    }
                return E.jsx(
                    'div',
                    {
                        className: `segment${$e ? ' dragging' : ''}`,
                        style: Vt,
                        draggable: !0,
                        onDragStart: h(A, I, C),
                        onDragOver: Ht => Ht.preventDefault(),
                        onDrop: d(A, I, ne, C),
                        onDragEnd: () => I(null),
                        onTouchStart: g(A, I, C, Q, G),
                    },
                    P.id,
                )
            },
            v = (P, C, N, O, $) => {
                if (P >= C.length - 1) return null
                const I = (() => {
                        let Q = 0
                        for (let G = 0; G <= P; G++) Q += (C[G].length / N) * 100
                        return Q
                    })(),
                    ne = {
                        position: 'absolute',
                        ...(l
                            ? { top: `${I}%`, transform: 'translateY(-50%)', left: 0, width: '100%', height: '40px' }
                            : { left: `${I}%`, transform: 'translateX(-50%)', top: 0, width: '40px', height: '100%' }),
                    }
                return E.jsx(
                    'div',
                    {
                        className: 'divider',
                        style: ne,
                        children: E.jsx(Wh, {
                            orientation: e,
                            onDrag: Q => {
                                if (!$.current) return
                                const G = l ? $.current.offsetHeight : $.current.offsetWidth
                                O(P, Q, G)
                            },
                        }),
                    },
                    `divider-${P}`,
                )
            },
            x = (P, C, N) =>
                E.jsxs(E.Fragment, {
                    children: [
                        Object.keys(st).map(O =>
                            E.jsx(
                                'div',
                                {
                                    className: 'dropdown-item',
                                    style: { backgroundColor: st[O] },
                                    onClick: $ => S(P, N)($, O),
                                    children: O,
                                },
                                O,
                            ),
                        ),
                        E.jsx('div', {
                            className: 'dropdown-item',
                            style: { backgroundColor: 'red', textAlign: 'center', marginTop: '10px' },
                            onClick: F(C, N),
                            children: '+ Add left',
                        }),
                    ],
                }),
            z = (P, C, N, O, $, A, I, ne, Q, G) => {
                const $e = ((N[C] + P.length / 2) / O) * 100,
                    Vt = Math.round((P.length / O) * t),
                    Ht = {
                        backgroundColor: st[P.type] || '#999',
                        ...(l
                            ? {
                                  top: `${$e}%`,
                                  left: `${$[C] || 0}px`,
                                  transform: 'translateY(-50%)',
                                  width: At > 0 ? `${At}px` : 'auto',
                              }
                            : { left: `${$e}%`, top: `${$[C] || 0}em`, transform: 'translateX(-50%)' }),
                    },
                    bc =
                        I === C
                            ? E.jsxs(E.Fragment, {
                                  children: [
                                      E.jsxs('span', { children: [P.type, ' ', Vt, ' ft'] }),
                                      E.jsx('div', { className: 'dropdown', children: x(Q, G, C) }),
                                  ],
                              })
                            : `${P.type} ${Vt} ft`
                return E.jsx(
                    'div',
                    {
                        className: 'floating-label',
                        style: Ht,
                        ref: ef => (A.current[C] = ef),
                        onClick: y(I, ne, C),
                        children: bc,
                    },
                    `label-${P.id}`,
                )
            },
            T = (P, C, N) => {
                const O = Math.round((P / N) * t),
                    $ = (P / N) * 100,
                    A = l ? { top: `${$}%` } : { left: `${$}%` }
                return E.jsxs('div', { className: 'tick', style: A, children: [O, ' ft'] }, `tick-${C}`)
            },
            M = (P, C, N, O) => {
                if (P === null) return null
                const $ = N[P],
                    A = ($.length / O) * 100,
                    I = {
                        position: 'absolute',
                        left: `${C.x}px`,
                        top: `${C.y}px`,
                        backgroundColor: st[$.type] || '#999',
                        border: '2px solid rgba(255, 255, 255, 0.8)',
                        borderRadius: '6px',
                        opacity: 0.9,
                        zIndex: 200,
                        pointerEvents: 'none',
                        transform: 'scale(1.08)',
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
                        filter: 'brightness(1.1)',
                        ...(l ? { width: '80px', height: `${A}%` } : { width: `${A}%`, height: '80px' }),
                    }
                return E.jsx('div', { className: 'drag-preview', style: I })
            },
            R = (P, C, N, O, $) => {
                const A = P.current
                if (!A) return
                const { handleTouchMove: I, handleTouchEnd: ne } = c(P, C, N, O, $)
                return (
                    A.addEventListener('touchmove', I, { passive: !1 }),
                    A.addEventListener('touchend', ne),
                    () => {
                        ;(A.removeEventListener('touchmove', I), A.removeEventListener('touchend', ne))
                    }
                )
            },
            [k, te] = j.useState(() => o(t)),
            le = j.useCallback(P => {
                typeof P == 'function'
                    ? te(C => {
                          const N = P(C)
                          return (
                              setTimeout(() => {
                                  ot.current && ot.current(N)
                              }, 0),
                              N
                          )
                      })
                    : (te(P),
                      setTimeout(() => {
                          ot.current && ot.current(P)
                      }, 0))
            }, []),
            [de, Ut] = j.useState(null),
            [un, qe] = j.useState(null),
            [Un, _] = j.useState({ x: 0, y: 0 }),
            D = j.useRef(null),
            U = j.useRef([]),
            [Z, ie] = j.useState([]),
            [At, lt] = j.useState(0),
            sn = j.useRef({}),
            Ce = k.reduce((P, C) => P + C.length, 0),
            an = u(Ce, le),
            Kl = s(le),
            Zc = a(le, qe),
            Jc = m(le, qe),
            fu = i(k)
        j.useEffect(() => {
            if (n) {
                const P = o(t)
                ;(te(P),
                    setTimeout(() => {
                        ot.current && ot.current(P)
                    }, 0))
            }
        }, [n, t])
        const ot = j.useRef(r)
        ;((ot.current = r),
            j.useEffect(() => {
                ot.current && k.length > 0 && setTimeout(() => ot.current(k), 0)
            }, []),
            j.useEffect(() => R(D, sn, _, Kl, Ut), [Kl]),
            j.useEffect(() => {
                const C = setTimeout(() => {
                    const { positions: N, contentWidth: O } = Bh(l, U.current)
                    ;(ie(N), lt(O))
                }, 0)
                return () => clearTimeout(C)
            }, [k, l]))
        const qc = `segment-container ${l ? 'vertical' : 'horizontal'}`
        return E.jsx(E.Fragment, {
            children: E.jsxs('div', {
                id: 'editor-wrapper',
                children: [
                    E.jsxs('div', {
                        className: qc,
                        ref: D,
                        children: [
                            k.map((P, C) => p(P, C, k, Ce, de, sn, Ut, Kl, D, _)),
                            k.map((P, C) => v(C, k, Ce, an, D)),
                            M(de, Un, k, Ce),
                        ],
                    }),
                    E.jsx('div', {
                        className: 'label-layer',
                        children: k.map((P, C) => z(P, C, fu, Ce, Z, U, un, qe, Zc, Jc)),
                    }),
                    E.jsx('div', { className: 'ruler', children: fu.map((P, C) => T(P, C, Ce)) }),
                ],
            }),
        })
    },
    Yh = 'pk.eyJ1IjoiZ3JhZmZpbyIsImEiOiJjbWRkZ3lkNjkwNG9xMmpuYmt4bHd2YTVvIn0.lzlmjq8mnXOSKB18lKLBpg',
    Kh = () => {
        const [e, t] = j.useState(null),
            [n, r] = j.useState([]),
            [l, o] = j.useState(!1),
            [i, u] = j.useState(!1),
            s = j.useCallback(d => {
                ;(console.log('Selected blockface:', d), t(d), o(!0))
            }, []),
            a = j.useCallback(d => {
                r(d)
            }, []),
            m = j.useCallback(() => {
                o(!1)
            }, []),
            h = j.useCallback(() => {
                u(d => !d)
            }, [])
        return E.jsxs('div', {
            style: { position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' },
            children: [
                E.jsx('h1', {
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
                E.jsx(Dh, { accessToken: Yh, onBlockfaceSelect: s, selectedBlockface: e, currentSegments: n }),
                E.jsx('div', {
                    style: {
                        position: 'absolute',
                        top: 0,
                        right: l ? '0' : '-450px',
                        width: '450px',
                        height: '100vh',
                        backgroundColor: 'white',
                        boxShadow: l ? '-4px 0 20px rgba(0,0,0,0.15)' : 'none',
                        transition: 'right 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        zIndex: 10,
                        pointerEvents: l ? 'auto' : 'none',
                        borderLeft: '1px solid #e0e0e0',
                    },
                    children:
                        l &&
                        E.jsxs('div', {
                            style: {
                                padding: '24px',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                            },
                            children: [
                                E.jsxs('div', {
                                    style: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '24px',
                                        borderBottom: '2px solid #f0f0f0',
                                        paddingBottom: '16px',
                                    },
                                    children: [
                                        E.jsxs('h2', {
                                            style: { margin: 0, color: '#333', fontSize: '20px', fontWeight: '600' },
                                            children: [
                                                'Edit Blockface (',
                                                (e == null ? void 0 : e.length) || 0,
                                                ' ft)',
                                            ],
                                        }),
                                        E.jsx('button', {
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
                                e &&
                                    E.jsx('div', {
                                        style: {
                                            marginBottom: '16px',
                                            padding: '12px',
                                            backgroundColor: '#f8f9fa',
                                            borderRadius: '6px',
                                        },
                                        children: E.jsxs('label', {
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                            },
                                            children: [
                                                E.jsx('input', {
                                                    type: 'checkbox',
                                                    checked: i,
                                                    onChange: h,
                                                    style: { marginRight: '8px' },
                                                }),
                                                'Show Table View (for field data collection)',
                                            ],
                                        }),
                                    }),
                                E.jsx('div', {
                                    style: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 },
                                    children:
                                        e &&
                                        (i
                                            ? E.jsx('div', {
                                                  style: { flex: 1, overflow: 'auto' },
                                                  children: E.jsx(Xp, {
                                                      blockfaceLength: e.length,
                                                      onSegmentsChange: a,
                                                      segments: n,
                                                  }),
                                              })
                                            : E.jsx(Qh, {
                                                  orientation: 'vertical',
                                                  blockfaceLength: e.length,
                                                  blockfaceId: e.id,
                                                  onSegmentsChange: a,
                                              })),
                                }),
                            ],
                        }),
                }),
            ],
        })
    }
Eo.createRoot(document.getElementById('root')).render(E.jsx(Kh, {}))
