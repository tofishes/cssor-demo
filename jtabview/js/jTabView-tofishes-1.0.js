/**
 * @author: ToFishes@163.com
 * @date: 2010年4月16日
 * @update: 2010-7-29 增加手风琴式切换风格， 2010-8-12 发现并修复同一个页面不同选择器分别调用时cookiename重复问题。
 * @version: 2.1
 * @description: 选项卡式内容切换插件  
 * @require  如果要开启选项卡记忆功能（防刷新），则 依赖jquery.cookie插件
 */
;(function($){
	$.fn.jTabView = function(c){
		c = $.extend({
			tab:".jtab", //选项卡选择器, 在选项卡区域内部,允许为jQuery对象
			con:".jtab-con", // 选项卡对应的内容元素，确保选项卡数与内容数一致。选项卡区域内部,允许为jQuery对象
			event: "click", //设置触发tab切换的事件，默认是单击，也可以设定为mousehover,这样鼠标悬浮就会切换
			curr: "curr", //设置当前激活中的选项卡样式类
		
			auto: 0, //是否自动切换， 默认否
			time: 5000, //自动切换的时间间隔， 默认5秒
			hoverTime: 300, //如果是鼠标悬浮切换，为了提高体验，设置一定的延迟然后再触发切换
			
			retain: 0, //在浏览器刷新的情况下，是否记忆保持选项卡的激活位置，这样可以防刷新，默认不开启,依赖jquery.cookie插件
			expires:1, //开启记忆保持功能的过期时间，过了这个时间将不再保留选项卡的记忆，默认1天
			
			accordion: 0 //设置开启手风琴风格的切换，点击当前项会在显示与隐藏之间切换，默认否
		}, c);	
		var _t = $(this).selector;//解决同一页面不同选择器分别调用插件时的Cookiename相同问题
		return this.each(function(id){//为了下文生成唯一cookiename
			var $this = $(this);
			var $tab = c.tab.jquery ? c.tab : $(c.tab, $this);
			var $con = c.con.jquery ? c.con : $(c.con, $this); 
			var count = $tab.size(); //选项卡总数，自动切换时有用
			if(! count){$.plubug($this, "插件jTabView错误:获取选项卡数目为0，请检查tab参数设置!"); return;};
			if(count != $con.size()) {$.plubug($this, "插件jTabView错误: 选项卡"+ count +"个，内容数目"+$con.size()+"个，不一致！"); return;};
			/* hoverId为延迟， autoId为自动切换， index初始化索引为当前拥有c.curr类元素的索引，否则为0 */
			var hoverId, autoId, index = $tab.index($tab.filter("."+c.curr)), cookiename = "";
			index = index == -1 ? 0 : index;  
			//如果开启了记忆功能，则为每个标签组初始化一个唯一的cookiename(要可以防不同文件才行),并读取index
			if(c.retain){
			    cookiename = [location.host, location.port, location.pathname,"jTabView", id ,_t].join("");//生成一个唯一的固定id名称
			    index = $.cookie(cookiename) || index;
			};
			//根据index切换，index的获取由事件触发时获取
			var toggle = function(_curr, init){ //借用init区分初始化，否则出现初始化bug，tab加了class，但是内容不显示。
				//var _curr = $tab.eq(index);是否通过参数传进？！
			    if(!init && c.accordion && _curr.hasClass(c.curr)) { //处理手风琴效果
			        $con.eq(index).toggle();
			        _curr.toggleClass(c.curr);
			        return false;
			    }
				if(!init && _curr.hasClass(c.curr)) //如果点击的已经是当前项，就不处理
					return false;
				$tab.removeClass(c.curr);
				_curr.addClass(c.curr).blur();
				$con.hide().eq(index).show();			
			};
            //初始化，如果开启记忆功能，则更新index
            toggle($tab.eq(index), 1);
			$tab.bind(c.event, function(e){
				var _this = $(this);
				index = $tab.index(_this);//触发时更新维护索引
                //处理记忆功能
				c.retain && ($.cookie(cookiename, index));
				if(c.event == "mouseover") {//为了延迟
					hoverId = setTimeout(function(){
						toggle(_this);
					}, c.hoverTime);
					_this.mouseout(function(){
						clearTimeout(hoverId);
					});
				} else {
					toggle(_this);
				};
			});
			/* 以下是定义自动切换的行为 */
			if(c.auto){
				/* 选项卡区域鼠标停留移出时，取消恢复tab自动切换*/
				$this.hover(function(){
						clearTimeout(autoId);
					}, function(){
						autoId = setTimeout(autoF, c.time);
				});
				/* 定义自动tab切换 */
				var autoF = function(){
					if(++index >= count) {
						index = 0;
					};
					toggle($tab.eq(index));
					autoId = setTimeout(autoF, c.time);
				};
				autoId = setTimeout(autoF, c.time);
			};						
		});
	};	
})(jQuery);
jQuery.plubug = function(obj, msg){
    obj = obj.jquery ? obj : $(obj);
    obj.css({position:"relative", background:"#c30"})
        .append("<div style='background:#099;position:absolute;top:0;left:0;line-height:20px;color:#fff;'>" + msg + "</div>");
};
/* 下面就是Cookie插件，不是必须的 */
jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        // CAUTION: Needed to parenthesize options.path and options.domain
        // in the following expressions, otherwise they evaluate to undefined
        // in the packed version for some reason...
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};