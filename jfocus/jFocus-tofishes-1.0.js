/**
    author: ToFishes
    email: tofishes@163.com
    date: 2010年4月15日
    name: jFocus-焦点图切换
    version： 1.0 Beta
    require: jQuery, jfocus.css, self
    description： 用了很基本的jQuery方法，jQuery版本1.2以上应该都是支持的。
    about IE: 半透明遮罩层的问题，ie下的滤镜在fade时变成灰色的了，同时固定层之间的z-index覆盖有问题，只好把描述和图片分离处理。
*/
;(function($){
    jQuery.fn.jFocus = function(o){
        o = jQuery.extend({
            meta: "li", //指定需要循环切换的元素标签
            event: "click", //绑定触发切换的事件，比如设置为mouseover
            currClass: "curr", //当前数字高亮的class
            firstShow: 0, //指定第一次显示的图片索引，从0开始
            width: 0, //设置一个宽度，默认0代表自动获取宽度，如果获取失败可以尝试手动设置
            height:0, //设置一个高度，默认0代表自动获取高度，如果获取失败可以尝试手动设置

            auto: 0, //是否开启自动切换,默认否
            time: 3000 //自动切换的时间间隔
        },o);
        return this.each(function(){
            var $this = $(this);
            var wrapper = "<div class='jfocus'></div>";
            $this.wrapInner(wrapper);
            var $meta = $(o.meta, $this), count = $meta.size(), index = [];//index前期是数字html片段数组，之后是数字索引
            for(var i = 1; i <= count; i++) {
                index.push("<a href='#'><em>" + i + "</em></a>");
            };
            var opt = "<span class='index'>" + index.join("") + "</span><p class='overlay'></p>";
            var $infos = $meta.find(".infos"),  $jfocus = $(".jfocus", $this); 
            
            //为了流畅的淡入淡出，wrapper必须静态定位，内部绝对定位达到层叠效果(否则是跳动的淡入淡出)，那么高宽就必须设置
            $jfocus.append(opt).css({height: o.height || $this.height(), width: o.width || $this.width()});
            $infos.appendTo($jfocus);//为了妥协万恶的ie6,ie7，因为其设置了半透明的层在fade时不和谐。
            var $num = $(".index a", $this);
            //初始化
            var init = function(con){
                con.hide().eq(o.firstShow).show().add($num.eq(o.firstShow)).addClass(o.currClass);
            };
            var toggle = function(con,index){
                con.filter("." + o.currClass).fadeOut().removeClass(o.currClass).end().eq(index).fadeIn().addClass(o.currClass);
            };
            init($meta);init($infos);//两次初始化。。。为了万恶的IE
            //切换定义
            index = 0;//更换为代表数字的索引,提供给自动切换使用
            $num.bind(o.event, function(){
                if($(this).hasClass(o.currClass)) {
                    return false;
                };
                index= $num.removeClass(o.currClass).index($(this));
                $(this).addClass(o.currClass);
                toggle($meta,index);toggle($infos,index);//两次切换。。。为了万恶的IE
                $(this).blur();
                return false;
            }); 
            /* 内容区域鼠标停留移出时，取消恢复自动切换 */
            if(o.auto) {
                var autoId;
                $jfocus.hover(function(){
                        clearTimeout(autoId);
                    }, function(){
                        autoId = setTimeout(autoF, o.time);       
                });
                /* 以下为自动切换的定义 */
                var autoF = function(){
                    if(++index >= count) {
                        index = 0;
                    };
                    $num.eq(index).trigger(o.event);//去触发切换的事件
                    autoId = setTimeout(autoF, o.time);
                };
                autoId = setTimeout(autoF, o.time);
            };
        });
    };
})(jQuery);