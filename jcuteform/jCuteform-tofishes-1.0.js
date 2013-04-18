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
    /* 单选 */
    $.fn.jRadio = function(c){
        c = $.extend({
            item: ".radio", //单选项元素，默认为此dom元素内部的class为radio的元素。
            input: "input", //挂载值的表单元素，默认为此dom元素内部的<input>元素,可以是任何表单元素，一般为隐藏文本域
            attr: "name", //指定item单选项的值存放在哪个属性中，比如 <a class="radio" name="value" />, 其值存储在name属性上
            checked: "checked", //被选中元素的class定义
            onchange: function(v){} //当值发生改变时执行某个函数动作,当前值作为参数传入该函数
        }, c);
        return this.each(function(){
            var _t = $(this);
            var $i = $(c.item, _t);
            var $in = $(c.input, _t);
            /* 初始化赋值 */
            var $c = $i.filter("." + c.checked);
            if($c.length != 0) { 
                $in.val($c.attr(c.attr));
            };
			_t.bind("click",function(e){ //事件绑定到父元素,貌似可以达到子元素动态生成也可以被事件处理的效果,感谢幻之(qq116764624)提示
				var op = $(e.target); //利用e.target获取被点击的子元素
				if(op.hasClass(c.checked)){//避免选中的元素再次被选,从而使onchange事件更有效
					return;
				};
				$("."+c.checked, _t).removeClass(c.checked);
                var v = op.addClass(c.checked).attr(c.attr);
                $in.val(v);
                c.onchange(v);
                e.preventDefault();//取消默认行为但不阻止事件冒泡，为了jSelect的body单击事件。
			});
        });
    };
    /* 多选 */
    $.fn.jCheckbox = function(c){
        c = $.extend({
            item: ".checkbox", //多选项元素，默认为此dom元素内部的class为checkbox的元素。
            input: "input", //挂载值的表单元素，多个值以逗号相隔，默认为此dom元素内部的<input>元素,可以是任何表单元素，一般为隐藏文本域
            attr: "name", //指定item单选项的值存放在哪个属性中，比如 <a class="checkbox" name="value" />, 其值存储在name属性上
            checked: "checked", //被选中元素的class定义
            onchange: function(v){} //当值发生改变时执行某个函数动作,当前值作为参数传入该函数
        }, c);
        return this.each(function(){
            var _t = $(this);
            var $i = $(c.item, _t);
            var $in = $(c.input, _t);
            /* 初始化赋值 */
            $in.val(getVals());
			_t.bind("click",function(e){//事件绑定到父元素,貌似可以达到子元素动态生成也可以被事件处理的效果,感谢幻之(qq116764624)提示
				var op = $(e.target);//利用e.target获取被点击的子元素
                op.toggleClass(c.checked);
                var v = getVals();
                $in.val(v);
                c.onchange(v);
                e.preventDefault();//取消默认行为但不阻止事件冒泡，为了jSelect的body单击事件。
			});
            function getVals(){
                 var $checked = $i.filter("." + c.checked), vals = [];
                 $checked.each(function(){
                     vals.push($(this).attr(c.attr));
                 });
                 return vals;
            };
        });
    };
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