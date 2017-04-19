"use strict";!function(t,e,a){t.upload={showFileName:function(t,e){var a=new FileReader;a.onload=function(a){e.find(".fuu-input-btn").text("Change"),e.find(".fuu-clear").show(),e.find(".fuu-filename").is("input")?e.find(".fuu-filename").val(t.name):e.find(".fuu-filename").txt(t.name)},a.readAsDataURL(t)},clearFileName:function(t){t.find(".fuu-filename").val(""),t.find(".fuu-clear").hide(),t.find(".fuu-input input:file").val(""),t.find(".fuu-input-btn").text("Browse")},progress:function(r,i,n){var o=function(a){a.code&&"1"===a.code?e.isset(a.data.msg)&&e.alert({title:"Alert!",txt:a.data.msg}):t.stdErr(a)},s=new FormData;s.append("file",i[0].files[0]),a.each(r,function(t,e){s.append(e.name,e.value)}),a.ajax({url:e.apiUri+n,data:s,processData:!1,contentType:!1,type:"POST",success:o})}},e.hook("passFile",function(e){var r=e[0].files[0],i=e.data("ta")?a("#"+e.data("ta")):e.closest(".fuu");t.upload.showFileName(r,i)}),e.hook("clearFile",function(e){var r=e.data("ta")?a("#"+e.data("ta")):e.closest(".fuu");t.upload.clearFileName(r)}),e.hook("upload",function(e){var r=e.data("ta")?a("#"+e.data("ta")):e.closest(".fuu"),i=r.find("input:file"),n=e.data("uri");if(""===i.val())return!1;t.upload.progress(r.serializeArray(),i,n)})}(app,gee,jQuery),function(t,e,a){t.member={current:{},chkLogin:function(){var a=function(){this.code&&"0"===this.code?(e.clog("Did not login"),t.body.removeClass("login").addClass("logout")):(e.clog("Logined"),t.body.removeClass("logout").addClass("login"),t.member.current=this.data)};e.yell("/member/chk_login",{},a,a)},login:function(a){var r=function(){this.code&&"1"===this.code?(e.isset(this.data.msg)&&e.alert({title:"Alert!",txt:this.data.msg}),e.isset(this.data.uri)&&(location.href=""===this.data.uri?e.apiUri:this.data.uri)):t.stdErr(this)};e.yell("/member/login",a,r,r)},register:function(t,a){var r=function(){a.removeAttr("disabled").find("i").remove(),"1"==this.code?(e.isset(this.data.msg)&&e.alert({title:"Alert!",txt:this.data.msg}),e.isset(this.data.uri)&&(location.href=""===this.data.uri?e.apiUri:this.data.uri),e.isset(this.data.goback)&&history.go(-1)):e.isset(this.data)&&e.isset(this.data.msg)?e.alert({title:"Alert!",txt:this.data.msg}):e.alert({title:"Error!",txt:"Server Error, Plaese Try Later("+this.code+")"})};e.yell("/member/add_new",t,r,r)},update:function(t,a){var r=function(){a.removeAttr("disabled").find("i").remove(),"1"==this.code?(e.isset(this.data.msg)&&e.alert({title:"Alert!",txt:this.data.msg}),e.isset(this.data.uri)&&(location.href=""===this.data.uri?e.apiUri:this.data.uri),e.isset(this.data.goback)&&history.go(-1)):e.isset(this.data)&&e.isset(this.data.msg)?e.alert({title:"Alert!",txt:this.data.msg}):e.alert({title:"Error!",txt:"Server Error, Plaese Try Later("+this.code+")"})};e.yell("/member/update",t,r,r)},logout:function(){var a=function(){this.code&&"1"===this.code?location.href="/":t.stdErr(this)};e.yell("/member/logout",{},a,a,"GET")}},e.hook("login",function(r){var i=r.data("ta")?a("#"+r.data("ta")):r.closest("form");return!!e.formValidate(i)&&t.member.login(i.serialize())}),e.hook("register",function(r){var i=r.data("ta")?a("#"+r.data("ta")):r.closest("form");if(i.find("input").each(function(){a(this).val()==a(this).attr("placeholder")&&a(this).val("")}),i.find('input[name="agree"]:checked').size())return!!e.formValidate(i)&&(r.attr("disabled","disabled").append('<i class="fa fa-spinner"></i>'),t.member.register(i.serialize(),r));e.alert({title:"Error!",txt:"您尚未同意會員條款"})}),e.hook("modify",function(r){var i=r.data("ta")?a("#"+r.data("ta")):r.closest("form");if(i.find("input").each(function(){a(this).val()==a(this).attr("placeholder")&&a(this).val("")}),!e.formValidate(i))return!1;var n=1,o=[];if(a("#pwd").val()&&(a("#pwd").isPasswdErr()&&(o.push("密碼：請確認是否符合 6~12 字英文及數字"),n=0),a("#cpwd").val()!==a("#pwd").val()&&(o.push("密碼與確認密碼不相同"),n=0)),1===n)return r.attr("disabled","disabled").append('<i class="fa fa-spinner"></i>'),t.member.update(i.serialize(),r);e.alert({title:"Error!",txt:o.join("\r\n")})}),e.hook("logout",function(e){t.member.logout()})}(app,gee,jQuery),function(t,e,a){t.json2sql={},e.hook("convertCode",function(t){var e=a("#json_str").val(),r="{{for rows}}"+a("#ta").val()+"{{/for}}",i=JSON.parse(e),n=a("#sql_str").val(),o=a.templates(r);if(i.data&&(i=i.data),!Array.isArray(i)){var s=[];s.push(i),i=s}var l={intval:function(t){return 1*t}};a.views.helpers(l),n+=o.render({rows:i}),a("#sql_str").val(n)}),e.hook("getData",function(t){var r=a("#json_uri").val();a.getJSON(r,{format:"jsonp"}).done(function(t){e.clog(t),a("#json_str").val(JSON.stringify(t))}).fail(function(t,e,a){})})}(app,gee,jQuery),function(t,e,a){t.cart={store:[],fee:0,total:0,add2Cart:function(a,r,i){var n=function(){if(this.code&&"1"===this.code){var a=e.isset(this.data)&&e.isset(this.data.msg)?this.data.msg:"購物車已更新";t.cart.store=this.data.cart,t.cart.renewCount(this.data.cart.length).renewTotal().renewFee(t.cart.fee).renewSum(),"force"==i?t.cart.renderCart():e.alert({title:"Success",txt:a})}else t.stdErr(this)};e.yell("/cart/add",{qty:r,item_id:a,type:i},n,n)},removeItem:function(a){var r=function(){if(this.code&&"1"===this.code){var a=e.isset(this.data)&&e.isset(this.data.msg)?this.data.msg:"購物車已更新";this.data.cart.length>0?(t.cart.store=this.data.cart,t.cart.renewCount(this.data.cart.length).renewTotal().renewFee(t.cart.fee).renewSum(),t.cart.renderCart(),e.alert({title:"Success",txt:a})):(e.alert({title:"Success",txt:"購物車內無品項"}),location.href=baseUri)}else t.stdErr(this)};e.yell("/cart/remove",{item_id:a},r,r)},renewCount:function(r){if(a.isNumeric(r))a(".cart_count").html(r);else{var i=function(){"1"==this.code?a(".cart_count").html(this.data.count):t.cart._handleErr(this)};e.yell("/cart/count",{},i,i)}return cart},renewTotal:function(){return t.cart.total=0,a(t.cart.store).each(function(){t.cart.total+=this.price*this.qty}),a(".cart_showTotal").html("$"+(t.cart.total+"").formatMoney(0)),cart},renewFee:function(e){return 0===e&&(e=1*a("input[name='shipment']:checked").val()),t.cart.total<1500||e>100?t.cart.fee=e:t.cart.fee=0,a(".cart_shipfee").html("$"+(t.cart.fee+"").formatMoney(0)),cart},renewSum:function(){return a(".cart_showSum").html("$"+(1*t.cart.fee+1*t.cart.total+"").formatMoney(0)),cart},loadCart:function(a){var r=function(){this.code&&"1"===this.code?(t.cart.store=this.data.cart,t.cart.renderCart(),this.data.cart.length<1&&(e.alert({title:"Success",txt:"購物車內無品項"}),location.href=baseUri)):t.stdErr(this)};return e.yell("/cart",{},r,r),cart},renderCart:function(){return t.cart.cartBox.html(a("#itemTmpl").render(t.cart.store)),e.init(),t.cart.renewTotal().renewFee(t.cart.fee).renewSum(),cart}},e.hook("add2Cart",function(e){var r=e.data("item_id"),i=a.isNumeric(a("#qty").val())?a("#qty").val():1;t.cart.add2Cart(r,i,"normal")}),e.hook("toggleATM",function(t){"ATM"==t.find("option:selected").val()?a("#realATM").show():a("#realATM").hide()}),e.hook("toggleInvoice",function(t){"Company"==a("input[name='invoice[type]']:checked").val()?a(".company-invoice").show():a(".company-invoice").hide()}),e.hook("newShipfee",function(){t.cart.renewFee(a("input[name='shipment']:checked").val()).renewSum(),a('input[name="fee"]',"#checkout_form").val(t.cart.fee)}),e.hook("removeItem",function(e){var a=e.data("item_id");t.cart.removeItem(a)}),e.hook("changeQty",function(e){var r=e.data("item_id"),i=e.val(),n=e.attr("max"),o=e.attr("min");a.isNumeric(n)&&Math.min(n,i)==n&&(i=n,e.val(n)),a.isNumeric(o)&&Math.max(o,i)==o&&(i=o,e.val(o)),t.cart.add2Cart(r,i,"force")}),e.hook("syncAll",function(t){var e=(a.fn.geneEH,t.closest("form")),r=t.data("ta"),i=t.data("so");e.find("input[name^='"+r+"']").each(function(){var t=a(this).attr("name").replace(r,i),n=e.find("input[name='"+t+"']").val();a(this).val(n)}).end().find('input[name="invoice[addr]"]').val(e.find('input[name="buyer[address]"]').val())}),e.hook("showInvoice",function(t){a("input[name='invoice[type]']")[0].checked=!0},"init"),e.hook("showShipFee",function(t){t.addClass("cart_shipfee"),a("input[name='shipment']")[0].checked=!0,e.newShipfee()},"init"),e.hook("showTotal",function(t){t.addClass("cart_showTotal")},"init"),e.hook("showSum",function(t){t.addClass("cart_showSum")},"init"),e.hook("loadCart",function(e){t.cart.cartBox=e,t.cart.loadCart()},"init")}(app,gee,jQuery),function(t,e,a){t.editor={init:function(){a(".froalaEditor").froalaEditor({key:"mrumF-11eyF4H-7od1==",placeholderText:"開始打字吧~~~~~~",toolbarInline:!0,toolbarButtons:["bold","italic","underline","strikeThrough","color","indent","outdent","-","paragraphFormat","align","formatOL","formatUL","insertLink","undo","redo"],quickInsertButtons:["image","table","ul","ol","hr"],toolbarButtonsXS:null,toolbarButtonsSM:null,toolbarButtonsMD:null}),a(".datepicker").datepicker({dateFormat:"yy-mm-dd"})}},e.hook("initEditor",function(e){t.editor.init()},"init")}(app,gee,jQuery),function(t,e,a){t.gallery={baseIfrme:function(){return'<div class="gene-iframe app-%(prefix)s"><iframe id="ifr_%(uniqid)s" src="%(taUri)s" width="%(width)s" scrolling="no" frameborder="0" allowtransparency="true" role="application" style="width: %(width)s; z-index: %(zidx)s;" class="app-box"></iframe></div>'},renderOpt:function(t,r,i){var n={uniqid:t+Math.floor(999*Math.random()+1),taUri:e.mainUri+"tmpls/"+t+".html?pc=XXXX&uc=xxxx",width:r,zidx:i,prefix:t};return n.taUri+="&ta="+n.uniqid+"&canonical="+decodeURIComponent(a("link[rel=canonical]").attr("href")),n}},e.hookTag("gee\\:gallery-grid",function(e){var a=t.gallery.renderOpt("gallery-grid","100%","5"),r=t.extractAttr(e);a.taUri+="&page="+r.page,e.replaceWith(sprintf(t.gallery.baseIfrme(),a))})}(app,gee,jQuery);