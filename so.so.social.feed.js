// Icons via Buddycon Icon Set by Webdesigner Depot & Orman Clark http://www.webdesignerdepot.com and www.ormanclark.com

;(function ( $, window, document ) {
    
	var pluginName = 'soSoSocial',
	obj = null,
	defaults = {
		limit: 25,
		bgTwitter: 'https://s3.amazonaws.com/sososocial/twitter_32.png',
		bgLastFm: 'https://s3.amazonaws.com/sososocial/lastfm_32.png',
		bgFacebook: 'https://s3.amazonaws.com/sososocial/facebook_32.png',
		bgFlickr: 'https://s3.amazonaws.com/sososocial/flickr_32.png',
		bgDelicious: 'https://s3.amazonaws.com/sososocial/delicious_32.png',
		bgGithub: 'https://s3.amazonaws.com/sososocial/github_32.png',
		bgDigg: 'https://s3.amazonaws.com/sososocial/digg_32.png',
		bgLinkedIn: 'https://s3.amazonaws.com/sososocial/linkedin_32.png',
		bgTumblr: 'https://s3.amazonaws.com/sososocial/tumblr_32.png',
		bgReddit: 'https://s3.amazonaws.com/sososocial/reddit_32.png',
		bgStumbleUpon: 'https://s3.amazonaws.com/sososocial/stumbleupon_32.png',
		bgWordPress: 'https://s3.amazonaws.com/sososocial/wordpress_32.png',
		bgPosterous: 'https://s3.amazonaws.com/sososocial/posterous_32.png',
		bgVimeo: 'https://s3.amazonaws.com/sososocial/vimeo_32.png',
		bgYouTube: 'https://s3.amazonaws.com/sososocial/youtube_32.png',
		bgDefault: 'https://s3.amazonaws.com/sososocial/rss_32.png'
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
			// If atom then try to convert it
			if (o.indexOf("atom") > -1) {
				o = 'http://atom2rss.semiologic.com/?atom=' + o;
			}
			
			$.jsonp({
				url: 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D%22' + encodeURIComponent(o) + '%22&format=json&callback=?',
				success: function(res) {
					// console.log(res.query.results.rss.channel.item);
					
					if (res.query.results != null) {
						jQuery.each(res.query.results.rss.channel.item, function(i, o) {
							// console.log(o);

							var desc = (
								(o.commentRss != undefined && o.commentRss.indexOf('feeds.delicious.com') > -1) || 
								(o.link != undefined && o.link.indexOf('posterous.com'))) 
								? o.title : o.description;

							// If the description is an array (flickr!) then grab the zero element
							if ($.isArray(desc)) { desc = desc[0]; }

							// For twitter, dynamically make all URLs clickable
							desc = desc.replace(/((https?|s?ftp|ssh)\:\/\/[^"\s\<\>]*[^.,;'">\:\s\<\>\)\]\!])/g, function(url) {
								return '<a href="'+url+'">'+url+'</a>';
							}).replace(/\B@([_a-z0-9]+)/ig, function(reply) {
								return  reply.charAt(0)+'<a href="http://twitter.com/'+reply.substring(1)+'">'+reply.substring(1)+'</a>';
							});
							
							// Maybe a little humanization of the line item
							if (o.link.indexOf("twitter.com") > -1) { desc = '@' + desc; desc = desc.replace(/\B@([_a-z0-9]+):/ig, ""); }
							if ((o.link.indexOf("posterous.com") > -1) || 
								(o.link.indexOf("flickr.com") > -1) || 
								(o.link.indexOf("tumblr.com") > -1) ||
								(res.query.results.rss.channel.generator != undefined && res.query.results.rss.channel.generator.indexOf('wordpress') > -1) ||
								(o.commentRss != undefined && o.commentRss.indexOf("delicious.com") > -1)) { desc = 'Posted <a href="' + o.link + '" target="_blank">' + desc  + '</a>'}
							if (res.query.results.rss.channel.link != undefined && res.query.results.rss.channel.link.indexOf('github') > -1) { desc = desc  + ' <a href="' + o.link + '">on Github</a>'}

							// Figure out the background icon
							var bg = obj.options.bgDefault;
							if (o.link.indexOf("twitter.com") > -1) { bg = obj.options.bgTwitter; }
							if (o.commentRss != undefined && o.commentRss.indexOf("delicious.com") > -1) { bg = obj.options.bgDelicious; }
							if (o.link.indexOf("flickr.com") > -1) { bg = obj.options.bgFlickr; }
							if (o.link.indexOf("posterous.com") > -1) { bg = obj.options.bgPosterous; }
							if (o.link.indexOf("tumblr.com") > -1) { bg = obj.options.bgTumblr; }
							if (res.query.results.rss.channel.generator != undefined && res.query.results.rss.channel.generator.indexOf('wordpress') > -1) { bg = obj.options.bgWordPress }
							if (res.query.results.rss.channel.link != undefined && res.query.results.rss.channel.link.indexOf('github') > -1) { bg = obj.options.bgGithub }
							if (o.description != undefined && o.description.indexOf("last.fm") > -1) { bg = obj.options.bgLastFm; }

							var html = '<li style="background: url(' + bg + ') no-repeat left center;">' + desc + '<br />Posted: ' + obj.relative_time(o.pubDate.replace(/\,/g,'')) + ' (<a href="' + o.link + '">#</a>)</li>';
							obj.contentArray[obj.contentCount] = new Array();
							obj.contentArray[obj.contentCount][0] = html;
							obj.contentArray[obj.contentCount][1] = obj.relative_time(o.pubDate.replace(/\,/g,''));
							obj.contentArray[obj.contentCount][2] = obj.get_delta(o.pubDate.replace(/\,/g,''));
							obj.contentCount ++;
						});
					}
					
					// Array simply to compare length against to know to print feed.
					obj.arrayCheck.push(i);
				},
				error: function() {
					
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
		
		if (obj.contentArray.length < obj.options.limit) {
			alert('Sorry but you have set a limit (' + obj.options.limit + ') but didn\'t return that many items in your RSS feed.');
			return false;
		}
		
		var ths = obj.contentArray.sort(obj.by(2,1));
		
		// console.log(printThis[0]);
		obj.html = '<ul>';
		
		for (i=0; i < obj.options.limit; i++) {
			obj.html += ths[i][0];
		}
		
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