;(function ( $, window, document ) {
    
	var pluginName = 'soSoSocial',
	obj = null,
	defaults = {
		propertyName: "value",
		bgTwitter: 'http://farm5.static.flickr.com/4057/4494661441_c03e3fe766_o.png',
		bgLastFm: 'http://farm5.static.flickr.com/4007/4495300744_5c8afb3149_o.png',
		bgFacebook: 'http://farm5.static.flickr.com/4022/4494661487_35b0167583_o.png',
		bgFlickr: 'http://farm3.static.flickr.com/2727/4494661413_0228be5f32_o.png',
		bgDelicious: 'http://farm5.static.flickr.com/4064/4495300640_2a7cbbb922_o.png',
		bgTumblr: 'http://farm5.static.flickr.com/4022/4494661551_3d68321873_o.png',
		bgWordPress: 'http://farm5.static.flickr.com/4060/4495300842_3f39a6b514_o.png',
		bgPosterous: 'http://farm5.static.flickr.com/4152/4946030629_65fece60f2_o.png'
	};

	function Plugin( element, options ) {
		obj = this;
		this.contentCount = 0;
		this.arrayCheck = [];
		this.contentArray = [];
		this.html = '';
		this.element = element;
		this.options = $.extend( {}, defaults, options) ;

		this._defaults = defaults;
		this._name = pluginName;

		this.init();
	}

    Plugin.prototype.init = function () {
		jQuery.each(this.options.feeds, function(i,o) {
			$.jsonp({
				url: 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D%22' + encodeURIComponent(o) + '%22&format=json&callback=?',
				success: function(res) {
					// console.log(res.query.results.rss.channel.item);
					
					jQuery.each(res.query.results.rss.channel.item, function(i, o) {
						// console.log(o);
						
						var desc = (
							(o.commentRss != undefined && o.commentRss.indexOf('feeds.delicious.com') > -1) || 
							(o.link != undefined && o.link.indexOf('posterous.com'))) 
							? o.title : o.description;
							
						if ($.isArray(desc)) { desc = desc[0]; }
						
						// Figure out the background icon
						var bg = obj.options.bgWordPress;
						if (o.link.indexOf("twitter.com") > -1) { bg = obj.options.bgTwitter; }
						if (o.commentRss != undefined && o.commentRss.indexOf("delicious.com") > -1) { bg = obj.options.bgDelicious; }
						if (o.link.indexOf("flickr.com") > -1) { bg = obj.options.bgFlickr; }
						if (o.link.indexOf("posterous.com") > -1) { bg = obj.options.bgPosterous; }
						if (o.link.indexOf("tumblr.com") > -1) { bg = obj.options.bgTumblr; }
						
						var html = '<li style="background: url(' + bg + ') no-repeat left center;">' + desc + '<br />Posted: ' + obj.relative_time(o.pubDate.replace(/\,/g,'')) + '</li>';
						obj.contentArray[obj.contentCount] = new Array();
						obj.contentArray[obj.contentCount][0] = html;
						obj.contentArray[obj.contentCount][1] = obj.relative_time(o.pubDate.replace(/\,/g,''));
						obj.contentArray[obj.contentCount][2] = obj.get_delta(o.pubDate.replace(/\,/g,''));
						obj.contentCount ++;
					});
					
					// Array simply to compare length against to know to print feed.
					obj.arrayCheck.push(i);
				}
			});
		});
		
		
		
		
		// Basically check and see if all the YQL calls are done.
		var interval = setInterval(function() {
			if (obj.arrayCheck.length === obj.options.feeds.length) {
				obj.print();
				clearInterval(interval);
			}
		}, 200);
    };

	Plugin.prototype.print = function() {
		console.log('Print!');
		/* console.log(obj.contentArray);
		console.log('------- SORT --------');
		console.log(obj.contentArray.sort(obj.by(2,1))); */
		var printThis = obj.contentArray.sort(obj.by(2,1));
		
		// console.log(printThis[0]);
		obj.html = '<ul>';
		
		jQuery.each(printThis, function(i,o) {
			obj.html += o[0];
		});
		
		obj.html += '</ul>';
		$(obj.element).html(obj.html);
	};
	
	// pubDate delta function
	Plugin.prototype.get_delta = function (time_value) {
		var values = time_value.split(" ");
		time_value = values[2] + " " + values[1] + ", " + values[3] + " " + values[4];
		var parsed_date = Date.parse(time_value);
		var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
		var delta = parseInt((relative_to.getTime() - parsed_date) / 1000);
		if (values[5] == "+0000") {
			delta = delta + (relative_to.getTimezoneOffset() * 60);
		} else {
			delta = delta + relative_to.getTimezoneOffset();
		}


		return delta;
	}

	// Function to return the relative time based off of delta.
	Plugin.prototype.relative_time = function (time_value) {

		var delta = obj.get_delta(time_value);

		if (delta < 60) {
			return 'less than a minute ago';
		} else if(delta < 120) {
			return 'about a minute ago';
		} else if(delta < (60*60)) {
			return (parseInt(delta / 60)).toString() + ' minutes ago';
		} else if(delta < (120*60)) {
			return 'about an hour ago';
		} else if(delta < (24*60*60)) {
			return 'about ' + (parseInt(delta / 3600)).toString() + ' hours ago';
		} else if(delta < (48*60*60)) {
			return '1 day ago';
		} else {
			return (parseInt(delta / 86400)).toString() + ' days ago';
		}
	}
	
	Plugin.prototype.by = function (i,dir) {
		return function(a,b){a = a[i];b = b[i];return a == b ? 0 : (a < b ? -1*dir : dir)}
	}

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
            }
        });
    }

})(jQuery, window, document);





/*
 * jQuery JSONP Core Plugin 2.1.4 (2010-11-17)
 * 
 * http://code.google.com/p/jquery-jsonp/
 *
 * Copyright (c) 2010 Julian Aubourg
 *
 * This document is licensed as free software under the terms of the
 * MIT License: http://www.opensource.org/licenses/mit-license.php
 */
;(function($,setTimeout){function noop(){}function genericCallback(data){lastValue=[data]}function appendScript(node){head.insertBefore(node,head.firstChild)}function callIfDefined(method,object,parameters){return method&&method.apply(object.context||object,parameters)}function qMarkOrAmp(url){return/\?/.test(url)?"&":"?"}var STR_ASYNC="async",STR_CHARSET="charset",STR_EMPTY="",STR_ERROR="error",STR_JQUERY_JSONP="_jqjsp",STR_ON="on",STR_ONCLICK=STR_ON+"click",STR_ONERROR=STR_ON+STR_ERROR,STR_ONLOAD=STR_ON+"load",STR_ONREADYSTATECHANGE=STR_ON+"readystatechange",STR_REMOVE_CHILD="removeChild",STR_SCRIPT_TAG="<script/>",STR_SUCCESS="success",STR_TIMEOUT="timeout",browser=$.browser,head=$("head")[0]||document.documentElement,pageCache={},count=0,lastValue,xOptionsDefaults={callback:STR_JQUERY_JSONP,url:location.href};function jsonp(xOptions){xOptions=$.extend({},xOptionsDefaults,xOptions);var completeCallback=xOptions.complete,dataFilter=xOptions.dataFilter,callbackParameter=xOptions.callbackParameter,successCallbackName=xOptions.callback,cacheFlag=xOptions.cache,pageCacheFlag=xOptions.pageCache,charset=xOptions.charset,url=xOptions.url,data=xOptions.data,timeout=xOptions.timeout,pageCached,done=0,cleanUp=noop;xOptions.abort=function(){!done++&&cleanUp()};if(callIfDefined(xOptions.beforeSend,xOptions,[xOptions])===false||done){return xOptions}url=url||STR_EMPTY;data=data?((typeof data)=="string"?data:$.param(data,xOptions.traditional)):STR_EMPTY;url+=data?(qMarkOrAmp(url)+data):STR_EMPTY;callbackParameter&&(url+=qMarkOrAmp(url)+encodeURIComponent(callbackParameter)+"=?");!cacheFlag&&!pageCacheFlag&&(url+=qMarkOrAmp(url)+"_"+(new Date()).getTime()+"=");url=url.replace(/=\?(&|$)/,"="+successCallbackName+"$1");function notifySuccess(json){!done++&&setTimeout(function(){cleanUp();pageCacheFlag&&(pageCache[url]={s:[json]});dataFilter&&(json=dataFilter.apply(xOptions,[json]));callIfDefined(xOptions.success,xOptions,[json,STR_SUCCESS]);callIfDefined(completeCallback,xOptions,[xOptions,STR_SUCCESS])},0)}function notifyError(type){!done++&&setTimeout(function(){cleanUp();pageCacheFlag&&type!=STR_TIMEOUT&&(pageCache[url]=type);callIfDefined(xOptions.error,xOptions,[xOptions,type]);callIfDefined(completeCallback,xOptions,[xOptions,type])},0)}pageCacheFlag&&(pageCached=pageCache[url])?(pageCached.s?notifySuccess(pageCached.s[0]):notifyError(pageCached)):setTimeout(function(script,scriptAfter,timeoutTimer){if(!done){timeoutTimer=timeout>0&&setTimeout(function(){notifyError(STR_TIMEOUT)},timeout);cleanUp=function(){timeoutTimer&&clearTimeout(timeoutTimer);script[STR_ONREADYSTATECHANGE]=script[STR_ONCLICK]=script[STR_ONLOAD]=script[STR_ONERROR]=null;head[STR_REMOVE_CHILD](script);scriptAfter&&head[STR_REMOVE_CHILD](scriptAfter)};window[successCallbackName]=genericCallback;script=$(STR_SCRIPT_TAG)[0];script.id=STR_JQUERY_JSONP+count++;if(charset){script[STR_CHARSET]=charset}function callback(result){(script[STR_ONCLICK]||noop)();result=lastValue;lastValue=undefined;result?notifySuccess(result[0]):notifyError(STR_ERROR)}if(browser.msie){script.event=STR_ONCLICK;script.htmlFor=script.id;script[STR_ONREADYSTATECHANGE]=function(){/loaded|complete/.test(script.readyState)&&callback()}}else{script[STR_ONERROR]=script[STR_ONLOAD]=callback;browser.opera?((scriptAfter=$(STR_SCRIPT_TAG)[0]).text="jQuery('#"+script.id+"')[0]."+STR_ONERROR+"()"):script[STR_ASYNC]=STR_ASYNC}script.src=url;appendScript(script);scriptAfter&&appendScript(scriptAfter)}},0);return xOptions}jsonp.setup=function(xOptions){$.extend(xOptionsDefaults,xOptions)};$.jsonp=jsonp})(jQuery,setTimeout);