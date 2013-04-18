/**
 * @author ToFishes
 * @date 2010-11-23
 * @desc jQuery 多用插件集合包
 *  
 */
;(function($){
    var ie6 = !-[1,] && !window.XMLHttpRequest;
    var win = $(window), body;
    $(function(){
    	body = $("body");
    });
    
    /**
     * @author ToFishes
     * @date 2010-11-23
     * @desc 该插件获取针对当前视窗，元素居中的左，上坐标值
     */
    $.fn.centerPos = function(){
        win = $(window);         
        var pos = {}, w = $(this).outerWidth(), h = $(this).outerHeight();
        pos.left = (win.width() - w) / 2;
        pos.top = (win.height() - h) / 2;
        return pos;
    };

    /**
     * @author ToFishes
     * @date 2010-11-23
     * @desc 固定位置的插件，不给参数则默认上下左右居中
     * @depend $.fn.centerPos
     * 
     */
    $.fn.jFixed = function(c){
        c = $.extend({
            left:null,
            right:null,
            top:null,
            bottom:null        
        }, c);
        $.jFixed = {};
        $.jFixed.className = "j-fixed";
        /* style */
        var style = "<style>." + $.jFixed.className + " {position:fixed !important;}</style><!--[if IE 6]><style>." + $.jFixed.className
        		+ " {position:absolute !important;}body {position:relative;}</style><[endif]-->";
        $("head").append(style);
        /* 帮助方法，获取到定位的坐标，并附带一个参数center，判断是否是居中的情况 */
        function getPos(o){
            var pos = o.centerPos(); //TODO: 这里不是必须计算的，是个性能提升点
            var h = c.left != null ? c.left : c.right;//水平位置, 左优先
            var v = c.top != null ? c.top : c.bottom;//垂直位置，上优先
            var css = {};
            if(h == null || v == null) {
                h = h == null ? pos.left : h;
                v = v == null ? pos.top : v;
                css.center = true; //顺便返回一下是居中的
            }; 

            if(ie6) {
                v += win.scrollTop(); //修正ie6下的位置
            };
            
            c.right != null ? css.right = h : css.left = h;
            c.bottom != null ? css.bottom = v : css.top = v;
            if(ie6) {            	
            	css.bottom = body.height() - win.height() - v;
            };
            return css;                                    
        };
        
        return this.each(function(){
            var _t = $(this).addClass($.jFixed.className);
            var css;
            var fixed = function(){
            	css = getPos(_t); //需要利用到居中的情况
            	_t.css(css);
            };
            fixed();
     
            if(css.center) {
                win.bind("resize", fixed);
            };
            if(ie6) {
                win.bind("scroll", fixed);
            };
        });
    };
    
    /**
     * @author ToFishes
     * @date 2010-11-23
     * @desc 当窗口滚到到该元素原本位置时，固定该元素位置，回到原位置时取消固定 
     * 
     */
  
    $.fn.jUntilFixed = function(c){
    	c = $.extend({
        },c);

    	return this.each(function(){
    		var _t = $(this);
    		var dom = $(document);
			var os = _t.offset();
			var css = {};
			function fixed(){
    			var top = dom.scrollTop();

    			if(top >= os.top) {
    				css.position = "fixed";
    				css.top = 0;
    				if(ie6) {
    					css.position = "absolute";
    					css.top = top;
    					css.zoom = 1;
    				};
    				css.left = os.left;
    			} else {
    				css.position = "static";
    			};
    			_t.css(css);
    		}
    		win.scroll(fixed);
    		win.resize(function(){
    			css.position = "static";
    			_t.css(css);
    			os = _t.offset();
    			fixed();
    		});
    	});
    };
    

    /**
     * @author Tofishes
     * 下拉面板插件
     */
    $.fn.jDropPanel = function(c){
    	c = $.extend({
    		wrap: null, //上级元素，包裹单组drop和panel的元素，其作用是为了在下拉状态时增加一个curr当前类，类名可以配置，以便于某些样式控制。
    		drop: ".j-drop",
    		panel: ".j-panel",
    		curr: "dropping", //下拉状态时对 父级 对象增加一个当前class
    		autoHideTime: 1000,
    		
    		ondrop: function(index, $drop, $panel){} //下拉以后的回调函数, 传入当前触发下拉的元素索引及所有的下拉按钮与面板
        },c);
    	    	
    	return this.each(function(){
    		var $wrap = _t = $(this);
    		var $drop = c.drop.jquery ? c.drop : _t.find(c.drop);
            var $panel = c.panel.jquery ? c.panel : _t.find(c.panel);
            var dropid;
            var currPanel;

            $drop.click(function(){
            	var i = $drop.index($(this));
                currPanel = $panel.eq(i);
                $panel.not(currPanel).hide();
            	c.wrap && ($wrap = $(this).parents(c.wrap));
                currPanel.toggle().unbind("click").bind("click", function(e){
                    e.stopPropagation();
                });
            	$wrap.toggleClass(c.curr);
            
                if(currPanel.is(":visible")) //实际应用这个更有效，bug出现在一组下拉拥有同一个$wrap,原代码是判断wrap.hasClass不行
                	c.ondrop(i, $drop, $panel); //处于下拉时，执行回调
                return false;
            });
            _t.add($panel).mouseover(function(){
                clean();
                /* close event */
                $("body").unbind("mouseover").one({
                	"mouseover": function(){
                        dropid = setTimeout(close_panel, 1000);
                    },
                    "click": close_panel
                });
                return false;
            });
            var clean = function(){ //清理
                if(dropid){
                    clearTimeout(dropid);
                    dropid = null;
                };
            };
            function close_panel(){
            	$wrap.removeClass(c.curr);
            	currPanel && currPanel.hide();
            };
    	});
    };
    
    
    /**
     * @author ToFishes
     * @desc 简单选项卡切换
     * url: http://localhost/something#tab-current
     * html:
     * <div id="jtabsimple">
     * 	<div class="tabs">
     *      <li id="current"><a class="curr">标题1</a></li>
     * 		<li><a>标题2</a></li>
     * 		<li><a>标题3</a></li>
     * 	</div>
     * 	<div class="jtab-con">
     * 		内容1
     * 	</div>
     * 	<div class="jtab-con" style="display:none;">
     * 		内容2
     * 	</div>
     * 	<div class="jtab-con" style="display:none;">
     * 		内容3
     * 	</div>
     * </div>
     * 
     * js:
     * 
     * $(function(){
     * 		$("#jtabsimple").jTabSimple({
     * 			tab: ".tabs a",
     * 			con: ".jtab-con"
     *      });
     * });
     */
    $.fn.jTabSimple = function(c){
        c = $.extend({
            tab: ".tabs li", //标题项
            con: ".tab-con", //内容项
            curr: "curr",  //当前高亮的css类名
            index: 0,      //默认显示的tab
            remote: false, //远程加载
            loading: '<p class="panel  t-c"><em class="loading"></em></p>', //自定义loading的提示html片段
            event: "click", //触发的事件，jQuery所支持的所有事件
            callback: function(i, tab, con){} //传递一个索引，tab集合，con集合
        },c);
        return this.each(function(){
            var tab = $(this).find(c.tab);
            var con = $(this).find(c.con);
            
            function toggle(i){
                i = (i < 0) ? c.index : i; 
                tab.removeClass(c.curr).eq(i).addClass(c.curr); 
                if(c.remote){
                    con.html(c.loading);            
                    $.get(tab.eq(i).find("a").attr("href"), function(ret){
                        con.html(ret);
                    });
                } else {
                    con.hide().eq(i).show();
                }
                c.callback(i, tab, con);
            };
            
            tab.bind(c.event, function(){
                var i = tab.index($(this));
                toggle(i);
                return false;
            });
            
            //init
            var uri = location.hash.match(/\#tab\-(.*)$/);
            if(uri != null){
                $("#"+uri[1]).addClass(c.curr);
            }
            var index = tab.index(tab.filter("." + c.curr));
            toggle(index);
        });
    };
    /**
     * @author ToFishes
     * @desc 各类弹出确认框的接口
     * 
     * sysDialog 是原生弹出框的实现
     */
    var sysDialog = {
    	'alert': function(c){
			c = $.extend({
				title: "Alert Dialog", 
				msg:"",
				time: 5000, //默认5秒自动消失
				callback: function(){} //按下确定后的回调函数,比如页面跳转    			
			}, c);
			
			alert(c.msg);
		},
		'confirm': function(c){
    		c = $.extend({
    			title: "Confirm Dialog", 
    			msg:"",
    			callback: function(flag){} //按下确定后的回调函数,比如页面跳转    			
    		}, c);
    		
        	c.callback(confirm(c.msg));	
    	} 
    };        
    /* 扩展接口 */
    $.extend({
		alert: sysDialog.alert,
		confirm: sysDialog.confirm
    });

    /**
     * @author ToFishes
     * @date 2010-9-21
     * @desc 提供对checkbox的选择操作
     * 
     *  
     * Example:
     * 
     * html:
     * 
     * <div id="check-list">
     * 	<input type="checkbox" />
     * 	<input type="checkbox" />
     * 	<input type="checkbox" />
     * 	<input type="checkbox" />
     * </div>
     * 	<input id="#check-all-posts" type="checkbox" />
     * 
    	<script type="text/javascript">
    		$("#check-list").jChecked({
    			all: "#check-all-posts",
    			target: ":checkbox"
    		});
    	</script> 
     * 
     */
    $.fn.jChecked = function(c){
    	c = $.extend({
            all: ".checked-all", //触发全选的元素
            invert: ".checked-invert", //触发反选的元素
            target: ":checkbox", //内容项
            	
            flag: "jchecked-status", //插件内部使用的表示状态的css类名，无需修改
            onchecked: function(items, vals){}, //当所有选中时执行，会传入所选中的集合及值的数组。
    		unchecked: function(items){} //传入未被选择的集合
            //event: "click" //触发的事件，jQuery所支持的所有事件
        },c);
    	
    	return this.each(function(){
    		var _t = $(this);
    		var _a = c.all.jquery ? c.all : _t.find(c.all);
    		var _iv = c.invert.jquery ? c.invert : _t.find(c.invert);
    		var _tg = c.target.jquery ? c.target : _t.find(c.target).not(_a).not(_iv);
    	
    		/* checked all or none */
    		_a.click(function(){    			
    			if(!$(this).hasClass(c.flag)) {
    				_tg.attr("checked",true);
    				$(this).addClass(c.flag);
    				c.onchecked(_tg, vals(_tg));
    			} else {
    				$(this).removeClass(c.flag);
    				_tg.attr("checked",false);
    				c.unchecked(_tg);
    			};    			
    		}).bind("unall-status", function(){ //释放非全选状态的动作，由外部去调用，非插件自动调用
    			$(this).removeClass(c.flag).attr("checked",false);
    		}).bind("all-status", function(){ //全选状态的动作，由外部去调用，非插件自动调用
    			$(this).addClass(c.flag).attr("checked",true);
    		});
    		_tg.bind("change", function(){ //每一次选项的点击检查是否已经全选
    			if(_tg.filter(":checked").length == _tg.length){
    				_a.trigger("all-status");
    			} else {
    				_a.trigger("unall-status");
    			};
    		});
    		/* checked invert */
    		_iv.click(function(){     
    			_tg.each(function(){
	    			$(this).attr("checked", !$(this).attr("checked"));
	    		});
    			var checked = _tg.filter(":checked");
    			c.onchecked(checked, vals(checked));
    			c.unchecked(_tg.not(checked));
    		});
    		function vals(input){
    			var vs = new Array();
    			input.each(function(){
    				vs.push($(this).val());
    			});
    			return vs;
    		};
    	});
    };
   /**
    * 选中与取消选中： $(":checkbox").uncheck();
    */
    $.fn.extend({
  	  check: function() {
	    return this.each(function() { this.checked = true; });
	  },
	  uncheck: function() {
	    return this.each(function() { this.checked = false; });
	  }
	});
})(jQuery);

/**
 * author: ToFishes@163.com
 * date: 2010年4月23日
 * version: 1.0
 * description: form表单的美化插件，支持radio,checkbox,select
 * @Example:
 * 1、单选(多选结构类似，class名不一样而已，属性name是值)：
 *   <em class="jradio"><a name="all">原创</a><a name="red">转载</a><a name="red">改编</a>
 *      <input type="hidden" name="" value="" />
 *  </em>
 * 2、下拉菜单
 * <div class="jdropbox">      
 *  <p class="jtext" ><input type="hidden" name="" value="" />--请选择分类--<em></em></p>
 *  <div class="db-con">
 *      下拉的内容
 *  </div>
 * </div>     
 */
;(function($){
    /* 下拉jSelect， 使用这个插件时，要非常注意其他js行为冒泡到body的单击事件
     */
    $.fn.jSelect = function(c){
        c = $.extend({
            item: ".option", //相当于select的option元素，下拉的选择项目，默认为此dom元素内部的class为option的元素。
            attr: "value", //指定item选项的值存放在哪个属性中，比如 <li value="value" />, 其值存储在value属性上(value只能存储数值)
            input: "input", //挂载值的表单元素，多个值以逗号相隔，默认为此dom元素内部的<input>元素,可以是任何表单元素，一般为隐藏文本域
            checked: "checked", //被选中状态下item选项元素的class定义 
			event: "click", //下拉的触发事件，默认单击展开下拉
            
            show: ".jtext", //用于显示所选择的项目的元素，同时也是点击此处显示下拉内容文字的元素。默认为此dom元素内class为jtext的元素。
            con: ".jdcon", //存储下拉的内容的元素
            width: 0, // 设置下啦内容的宽度，0表示自适应宽度, -1表示同show等宽，大于0的数值则会被设置此数值宽度
            widthFix: 0, //设置宽度增减量，用于与show等宽时的宽度误差
            curr: "curr", // 显示下拉内容时给本元素设置一个当前的样式类class定义，比如用于设置下拉箭头的指向
                
            onchange: function(v, index){} //当值发生改变时执行某个函数动作,当前值及项目索引作为参数传入该函数
        }, c);
        return this.each(function(){
            var _t = $(this);
            var zindex = parseInt(_t.css("zIndex")) || 20;
            var flag = false; //减少body单击事件的多次执行
            var $s = $(c.show, _t), $c = $(c.con, _t), w = c.width;
            var $i = $(this).find(c.item);
            var $in = $(c.input, _t);
            $s.append("<q class='jselect-show-text'></q>");
            var $st = $(".jselect-show-text", $s);
            var index = -1; //避免选中的元素再次被选,从而使onchange事件更有效      
            
            /* 初始化处理 */
            var $ch = $i.filter("." + c.checked);
            if($ch.length != 0) {
                index = $i.index($ch);
            };
            var o = getVals();
            $in.val(o.val);
            $st.html(o.t);
            /* 选项动作 */
            $i.bind("click",function(e){
                var i = $i.index($(this));
                if(index == i) {
                    return;
                };
                index = i;
                $i.removeClass(c.checked);
                var v = $(this).addClass(c.checked).attr(c.attr);
                $in.val(v);
                $st.html($(this).html());
                c.onchange(v, index);
                e.preventDefault();//取消默认行为但不阻止事件冒泡，为了激发body单击事件。                
            });
            //对于select下拉框取值，这个取值原先考虑是可以多选，但暂时没实现，也就保留了多值的获取。
            function getVals(){
                 var $checked = $i.filter("." + c.checked), o = {val: "", t: ""};
                 $checked.each(function(){
                     o.val = ($(this).attr(c.attr));
                     o.t = ($(this).html());
                 });
                 return o;
            };
            //下拉动作
            $s.bind(c.event,function(e){
                if(c.width < 0) {
                    w = $s.width() + c.widthFix;//如果整个下了框事先是被隐藏的，之后被显示，在这里才能正确获取到$s.width()
                };
                if(c.width != 0) {
                    $c.width(w); //设置下拉内容宽度               
                };
                _t.toggleClass(c.curr).css("z-index", ++zindex);
                $c.toggle();
                flag = !flag;
                e.stopPropagation();//阻止事件冒泡到body上
            });
            $("body").click( function(){
                if(flag) {
                    _t.removeClass(c.curr);
                    $c.hide();
                    flag = !flag;
                };
            });
        });
    };
})(jQuery);

/**
 * @author ToFishes
 * @date 2010-9-21
 * @desc 输入框显示一个灰色的默认值
 * 
 * Example: 
 * 
 * $("#card-edit .text, textarea").jDefault({ 
 *     value: function(t){
 *         return t.prev().html();
 *     }  //or  value: "一个默认提示"
 * });
 * 
 */
;(function($){
    $.fn.jDefault = function(c){
    	c = $.extend({
    		value: function(t){return t.attr("title");t.attr("title","");}, //设置默认值,可以是字符串, 也可以是function计算返回的字符串。
    		css: {color: "#999"} //提示信息的样式定义
        },c);
    	c.css = $.extend({
    		position:"absolute",
    		margin:0,
    		padding:0
    	}, c.css);
    	function css(el, prop) {
    	    return parseInt($.css(el[0], prop)) || 0;
    	};
    	function width(el) {
    	    return  el[0].offsetWidth + css(el, 'marginLeft') + css(el, 'marginRight');
    	};
    	function height(el) {
    	    return el[0].offsetHeight + css(el, 'marginTop') + css(el, 'marginBottom');
    	};
    	
    	return this.each(function(){
    		var _t = $(this);
    		if($.trim(_t.val()) != "") return; //如果输入框非空值，则不予以处理
    		var left = parseInt(_t.css("paddingLeft")) + parseInt(_t.css("marginLeft"));
    		var top = parseInt(_t.css("marginTop")) + parseInt(_t.css("paddingTop"));
    		var h = height(_t), fs = _t.css("fontSize");
    		var def = c.value.call ? c.value(_t) : (c.value || "");
    		var info = $("<q style='top:"+ top +"px;left:"+left+"px;font-size:"+fs+"'>" + c.value(_t) + "</q>");
    		info.css(c.css);
    		var wrap = $("<span style='display:inline-block;position:relative;margin:0;padding:0;width:"+width(_t)+";height:"+h+";vertical-align:"+_t.css("verticalAlign")+"' class='jdefault-wrap'></span>");
    		_t.wrap(wrap).after(info)
	    		.focus(function(){
	    			info.hide();
	    		}).blur(function(){
	    			var val = $.trim(_t.val());
	    			if(val == "") {
	    				info.show();
	    			};
	    		});
    		info.click(function(){
    			_t.focus();
    		});
    	});
    };
})(jQuery);
/* 一个默认的执行者, 凡是有class='j-default'的输入框(input, textarea)，其标题会成为默认值提示 */
$(function(){
	$(".j-default").jDefault();
});
/**
 * @author ToFishes
 * 根据指定css属性闪烁的插件
 */
;(function($){
	$.fn.jFlash = function(c){
		c = $.extend({
			css: {}, //闪烁变化的css属性
			time: 100, //interval time 闪烁间隔时间
			count: 20, //闪烁的次数
			status: "jFlashing", //表示闪烁中
			onStop: function(t){} //闪烁完的回调函数，传入闪烁对象的引用
		}, c);

		return this.each(function(){		
			var _t = $(this), init = {};
			/* 如果正在闪烁中，则回避再次调用闪烁 */
			if(_t.hasClass(c.status))
				return;

			for(var n in c.css) {
				init[n] = _t.css(n);
			};

			var params = {
				"0": init,
				"1": c.css
			},  flashId, count = c.count % 2 == 0 ? c.count : c.count + 1; //count保证为偶，这样最后的css才是最初的状态。

			function flash(){
				_t.css(params[count % 2]).addClass(c.status);
				count--;	
				if(count < 0) {
					c.onStop(_t.removeClass(c.status));
					flashId && clearTimeout(flashId);
					return;
				};
				flashId = setTimeout(flash, c.time);
			};
			flash();		
		});
	};
})(jQuery);
