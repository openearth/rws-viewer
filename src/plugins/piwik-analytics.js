const CONTAINER_URL = '//statistiek.rijksoverheid.nl'

export default {
  install(Vue, { containerUrl = CONTAINER_URL } = {}) {

    let initialized = false
    let containerId = process.env.VUE_APP_PIWIK_CONTAINER_ID || null

    const ALLOWED_ORIGINS = [ 'https://viewer.openearth.nl' ]
    const isAllowedOrigin = () => {
        try {
            return ALLOWED_ORIGINS.some(p => window.location.origin.startsWith(p))
        } catch (_e) {
            return false
        }
    }


    Vue.mixin({
        beforeRouteEnter(to, _from, next) {
            if (!initialized && isAllowedOrigin()) {
                initializePiwikScript()
                initialized = true
            }
            next()  
        },

        methods: {
            $trackEvent(category, action, name, value, dimensions) {
                // Documentation https://help.piwik.pro/support/tag-manager/about-a-data-layer/
                if (window.Piwik) {
                    const tracker = window.Piwik.getTracker()
                    tracker.trackEvent(category, action, name, value, dimensions)
                }
            },
        },

    })

    function initializePiwikScript() {
        if (!isAllowedOrigin()) {
            return
        }

        if (!containerId) {
            console.log('No piwik container id found so Piwik was not installed')
            return
        }

        const s = document.createElement('script')
        s.async = false
        s.text = `(function(window, document, dataLayerName, id) {
            window[dataLayerName]=window[dataLayerName]||[],window[dataLayerName].push({start:(new Date).getTime(),event:"stg.start"});var scripts=document.getElementsByTagName('script')[0],tags=document.createElement('script');
            function stgCreateCookie(a,b,c){var d="";if(c){var e=new Date;e.setTime(e.getTime()+24*c*60*60*1e3),d="; expires="+e.toUTCString()}document.cookie=a+"="+b+d+"; path=/"}
            var isStgDebug=(window.location.href.match("stg_debug")||document.cookie.match("stg_debug"))&&!window.location.href.match("stg_disable_debug");stgCreateCookie("stg_debug",isStgDebug?1:"",isStgDebug?14:-1);
            var qP=[];dataLayerName!=="dataLayer"&&qP.push("data_layer_name="+dataLayerName),isStgDebug&&qP.push("stg_debug");var qPString=qP.length>0?("?"+qP.join("&")):"";
            tags.async=!0,tags.src="${ containerUrl }/containers/"+id+".js"+qPString,scripts.parentNode.insertBefore(tags,scripts);
            !function(a,n,i){a[n]=a[n]||{};for(var c=0;c<i.length;c++)!function(i){a[n][i]=a[n][i]||{},a[n][i].api=a[n][i].api||function(){var a=[].slice.call(arguments,0);"string"==typeof a[0]&&window[dataLayerName].push({event:n+"."+i+":"+a[0],parameters:[].slice.call(arguments,1)})}}(i[c])}(window,"ppms",["tm","cm"]);
            })(window, document, 'dataLayer', '${ containerId }')`

        const head = document.getElementsByTagName('body')[0]
        head.appendChild(s)
    }

  },
}

