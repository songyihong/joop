function cookie(name, value, options){
    if(Object.isUndefined(value)){
        if(!name) return document.cookie;
        var cookieValue = null;
        if(document.cookie && document.cookie != ''){
            var cookies = document.cookie.split(';'),cookie;
            for (var i = 0; i < cookies.length; i++){
                cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }else{
        options = options || {};
        if (value === null) {
            value = '';
            options = Object.clone(options);
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (Object.isNumber(options.expires) || options.expires.toUTCString)) {
            var date;
            if (Object.isNumber(options.expires)) {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString();
        }
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
        return document.cookie;
    }
}