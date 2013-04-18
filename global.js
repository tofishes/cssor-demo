/* global static variable */
var LOADING = LOADING || "<p class='t-c land'><q class='loading'></q></p>";
var LOADING_INLINE = LOADING_INLINE || "<q class='loading'></q>";

//redirect
var uri = location.hash.match(/\#\!(.*)$/);
if (uri !== null) {
    location.replace(uri[1]);
}
var loading = 0;
var loading_img;

jQuery().ready(function(){
    /**
     * system message define
     */

    var $message = $("#message");
    window.sysMsg = {
        "tip": $message,
        "tipShow": function(msg, type){
            msg = msg || "正在处理您的请求...";
            type = type || "";
            var meta = $(["<em class='", type, "'>", msg, "</em><br />"].join(""));
            sysMsg.tip.append(meta);
            return meta;
        },
        "tipHide": function(meta){
        	meta ? meta.fadeOut() : sysMsg.tip.children().fadeOut();
            return sysMsg;
        },
        "tipAuto": function(msg, type, time){ 
            time = time || + type || sysMsg.delay; //如果type可以被转换为数值，将被认为是时间参数，因此可以调用tipAuto("message", 2000);
            var meta = sysMsg.tipShow(msg, type);
            if(type == "sys-warn") {
            	time = time * 2;
            } else if(type == "sys-error") {
            	time = time * 3;
            };
            setTimeout(function(){sysMsg.tipHide(meta)}, time);
            return sysMsg;
        },
        "debug": function(msg){
        	sysMsg.tipShow(msg);
        },
        "delay": 3000
    };

    /* system message panel fixed position */
    $message.jFixed({top: 0});
    
    //global ajax setup
    jQuery.ajaxSetup({
        "cache": false,
        "timeout": 5000
    });
    jQuery(document).ajaxError(function(event, xhr, ajaxOptions, thrownError) {
    	alert(xhr.status);
        if(xhr.status == 500){
            sysMsg.tipAuto('暂时无法完成您的请求, 请稍候再试', 'sys-error');
        }else if (xhr.status == 404){
            sysMsg.tipAuto('您请求的地址不存在','sys-error');
        }else if (xhr.status == 401){
            window.location.href="/login";
        }else if (xhr.status == 0){
        	sysMsg.tipAuto('您的网络连接可能故障, 请稍后重试.','sys-error');
        }
    });    
//    jQuery(document).ajaxSend(
//        function() {
//            sysMsg.tipHide();
//    });
    
    //validation setup
    jQuery.validator.setDefaults({
        "highlight": function(element, errorClass) {
            jQuery(element).parent().addClass('error');
        },
        "unhighlight": function(element, errorClass) {
            jQuery(element).parent().removeClass('error');
        },
        "errorClass": 'tip',
        "errorElement": 'p'
    });

    jQuery.extend(jQuery.validator.messages, {    
        "required": $lang.required,    
        "remote": $lang.remote,    
        "email": $lang.email,    
        "url": $lang.url,    
        "date": $lang.date,    
        "dateISO": $lang.dateISO,    
        "number": $lang.number,    
        "digits": $lang.digits,    
        "creditcard": $lang.creditcard,    
        "equalTo": $lang.equalTo,    
        "accept": $lang.accept,    
        "maxlength": jQuery.validator.format($lang.maxlength),    
        "minlength": jQuery.validator.format($lang.minlength),    
        "rangelength": jQuery.validator.format($lang.rangelength),    
        "range": jQuery.validator.format($lang.range),    
        "max": jQuery.validator.format($lang.max),    
        "min": jQuery.validator.format($lang.min),
        "username": jQuery.validator.format($lang.username),
        "realname": jQuery.validator.format($lang.realname),
        "phone": jQuery.validator.format($lang.phone),
        "fax": jQuery.validator.format($lang.fax),
        "mobile": jQuery.validator.format($lang.mobile)
    });
    jQuery.validator.addMethod('nequal',function(value, element, param){
        return  this.optional(element) || value != param;
    });
    jQuery.validator.addMethod("username", function(value, element, param){ //验证用户名
    	var pattern = /^[a-zA-Z]{1}([a-zA-Z0-9]|[_]){4,19}$/;
    	return this.optional(element) || pattern.test(value);
    });
    jQuery.validator.addMethod("realname", function(value, element, param){ //验证姓名
    	var pattern = /^[\u4E00-\u9FA5A-Za-z\s]+$/;
    	return this.optional(element) || pattern.test(value);
    });
    jQuery.validator.addMethod("phone", function(value, element, param){ //校验普通电话、传真号码：可以“+”开头，除数字外，可含有“-”
    	var pattern = /^[+]{0,1}(\d){1,3}[ ]?([-]?((\d)|[ ]){1,12})+$/;
    	return this.optional(element) || pattern.test(value);
    });
    jQuery.validator.addMethod("fax", function(value, element, param){ //校验普通电话、传真号码：可以“+”开头，除数字外，可含有“-”
    	var pattern = /^[+]{0,1}(\d){1,3}[ ]?([-]?((\d)|[ ]){1,12})+$/;
    	return  this.optional(element) || pattern.test(value);
    });
    jQuery.validator.addMethod("mobile", function(value, element, param){ //校验手机号码：13，15，18开头”
    	var pattern = /^0*(13|15|18)\d{9}$/;
    	return  this.optional(element) || pattern.test(value);
    });
    jQuery.validator.addClassRules({
    	username: {
    		username: true
    	},
    	realname: {
    		realname: true
    	},
    	phone: {
    		phone: true
    	},
    	fax: {
    	    fax: true
    	},
    	mobile: {
    		mobile: true
    	} 
    });
    
    /* 全局的form绑定验证，但排除有ID的Form，一般有id的认为是单独编写了 验证 */
    $("form").each(function(){
    	var _t = $(this).attr("autocomplete", "off") , hasId = _t.attr("id"); //阻止FF等表单内容遗留

    	if( ! hasId || ! hasId.split ) { //无id或者获取到的id不是字符串(当有name='id'的表单元素存在时，获取到的值就是htmlElement对象了)
    		if(_t.parent().find("textarea.editor").length == 0) {
    			_t.validate();
    		} else {
    			_t.submit(function(){  //为tinymce的验证添加支持
    				tinymce.triggerSave();
        		}).validate({
    				errorPlacement: function(label, element) {
	    				if (element.is("textarea.editor")) {
	    					label.insertAfter(element.next()); //在textarea后面的后面显示错误
	    				} else {
	    					label.insertAfter(element);
	    				};
	    			}
    			});
    		};
    	};
    });

    /* 全局按钮样式 */
    var btnAt = "active";
    $(".btn").live("mousedown",function(){
        $(this).addClass(btnAt).one("mouseup", function(){
            $(this).removeClass(btnAt);
        }).one("mouseout", function(){
            $(this).removeClass(btnAt);
        });
    });

    //note box close
    jQuery("a.note-close").live('click', function(){
        jQuery(this).parent().parent().slideUp('slow');
    });

    //left nav menu
    var $menuItem;
    jQuery("#menu-main li a").click(function(){
        $menuItem || ($menuItem = $("#menu-main li"));
        if (loading) {
            return false;
        }	
        var url = $(this).attr("href").replace("#!", "");

        if(url) {
            loading = 1;
            var start = new Date().getTime();
            $menuItem.removeClass("curr");
            var $this = jQuery(this);
            $this.before('<img src="/img-res/loading/menu-load.gif" alt="" />').parent().addClass("curr");
            loading_img = $this.prev('img');
            jQuery.ajax({
                'url': url,
                'success': function(ret){
                    jQuery("#main-con").html(ret);
                },
                'complete': function(){
                    var duration = new Date().getTime() - start;
                    if (duration < 2500) {
                        duration = 2500 - duration;
                    } else {
                        duration = 0;
                    };
                    setTimeout("loading_img.remove();loading = 0;", duration);
                },
                'dataType': 'html'
            });
        }
    });

    /* advanced applications panel */
    var $appPanel = $("#app-panel").jFixed({bottom:0}), $appList;
    $("#app-panel h4").click(function(){
        $appList || ($appList = $("#app-list"));
        $appList.slideToggle(function(){
            $appPanel.toggleClass("opening");
        });
    });	    
    //textarea autogrow
    jQuery(".autogrow").growfield({
        "min": 150,
        "max": 500
    });
    //top search select
    $("#search-select").jSelect({width:-1,con:'.db-con',widthFix:5});
    
    /* tip-card for username link */
    $("a.clean").poshytip({
    	content: function(update){
    		var _t = $(this), url = _t.attr("rel") || "/html/mini-card.html", con = _t.data("mini-card"); //提取缓存
    		if(!con) { //如果找不到缓存，get
    			$.get(url, function(info){
    				_t.data("mini-card", info);
    				update(info);
    			});
    		}
    		return con || LOADING;
    	},
    	className: 'tip-gaoren',
    	alignTo: 'target',
    	alignX: 'right',
    	alignY: 'inner-top',
    //	showOn: "none",
    	offsetX: 13,
    	offsetY: -17
    })//.poshytip("show");
    
});

/* 举报功能
 * 传入a的原始引用
 * <a onclick="return report(this)"
 *  */
function report(t) {
	var $t = $(t), url = $t.attr("href"), cn = "reported";
	if(! $t.hasClass(cn)) {
		$.get(url, function(){
			$t.html("感谢您的帮助，我们会尽快处理").addClass(cn).removeAttr("href");
		});
	};
	return false;
};

function load_school(){
	var $panel = $("#school-select-panel");
//    $panel.prependTo("body");
    $('input.select-school').live('click', function(){
    	var $country = $panel.find(".colleges-country");
    	var $city = $panel.find(".colleges-city");
    	var $school = $panel.find(".colleges-school");
        $country.add($city).add($school).html('');

        var $school_target = $(this);
        var $index_target = $school_target.next("input");

        //初始化country
        var ar = data['countries'];
        var country = []
        for (i = 0; i < ar.length; i++) {
           	country.push('<li><a href="javascript:void(0);" index="' + i + '">' + ar[i] + '</a></li>');
        };
        $country.append(country.join(""));
        //弹出面板
        $.jOpenPanel({
            message: $("#school-select-panel")
        });     
        //点击country
        var $countryItem = $country.find('a'); 
        $countryItem.click(function(){
        	$countryItem.removeClass('active');
            $(this).addClass('active');

            var index = $(this).attr('index');
            var ar = data['regions'][index] || [];
            var province = [""];
            for (i = 0; i < ar.length; i++) {
                province.push('<li><a href="javascript:void(0);" index="' + index + '-' + i + '">' + ar[i] + '</a></li>');
            };
            $city.html(province.join(""));
            $('ul.colleges-city a').eq(0).click();
        });
        
        $('.colleges-city a').live('click', function(){
        	$city.find('a').removeClass('active');
            $(this).addClass('active');

            var index = $(this).attr('index');
            var ar = data['schools'][index] || [];
            var school = [""];
            for (i = 0; i < ar.length; i++) {
                school.push('<li><a href="javascript:void(0);" index="' + index + '-' + i + '">' + ar[i] + '</a></li>');
            }
            $school.html(school.join(""));
        });
        //choose
        $('.colleges-school a').live('click', function(){        	
            var idx = $(this).attr('index');            
            if(idx != '0-0-0'){
                $school_target.val($(this).html());
                $index_target.val(idx);
                $.jOpenPanel.closePanel();
            }
            return false;
        });

        //init
        $countryItem.eq(1).click();
    });
}

function company_suggest_bind(id)
{
	var $id_input = $("#"+id).next("input");
	var $more = $id_input.next("ul");
	
    var sug3 = new KISSY.Suggest("#" + id, "/public/companySearch", {submitOnSelect: false});
    sug3.on('itemSelect', function(data) {
    	$companyKey = $(data.currentTarget.selectedItem).find('span.ks-suggest-result').html();
        $(this.textInput).next('input').val($companyKey);
        $more.hide();
    });
    
    $("#"+id).focus(function(){
    	$(this).val("").next("input").val("");
    	$more.slideUp();
    }).blur(function(){
    	if($.trim($(this).val()) !="" && $id_input.val() == ""){
    		$more.slideDown();
    	}else{
    		$more.slideUp();
    	}
    });
};

function company_suggest_bind_simple(id){
    var sug3 = new KISSY.Suggest("#" + id, "/public/companySearch", {submitOnSelect: false});
    sug3.on('itemSelect', function(data) {
        $(this.textInput).next('input').val( $(data.currentTarget.selectedItem).find('span.ks-suggest-result').html() );
    });
}
