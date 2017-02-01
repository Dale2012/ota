/**
 * @author 愚人码头
 */
(function($){
	$.fn.Slide=function(options){
		var opts = $.extend({},$.fn.Slide.deflunt,options);
		var index=0;
		var targetLi = $("." + opts.claNav + " li", $(this));//目标对象
		var clickNext = $("." + opts.claNav + " .next", $(this));//点击下一个按钮
		var clickPrev = $("." + opts.claNav + " .prev", $(this));//点击上一个按钮
		var ContentBox = $("." + opts.claCon , $(this));//滚动的对象
		var ContentBoxNum=ContentBox.children().size();//滚动对象的子元素个数
		var slideH=ContentBox.children().first().height();//滚动对象的子元素个数高度，相当于滚动的高度
		var slideW=ContentBox.children().first().width();//滚动对象的子元素宽度，相当于滚动的宽度
		var autoPlay;
		var slideWH;
		if(opts.effect=="scroolY"||opts.effect=="scroolTxt"){
			slideWH=slideH;
		}else if(opts.effect=="scroolX"||opts.effect=="scroolLoop"){
			ContentBox.css("width",ContentBoxNum*slideW);
			slideWH=slideW;
		}else if(opts.effect=="fade"){
			ContentBox.children().first().css("z-index","1");
		}
		
		return this.each(function() {
			var $this=$(this);
			//滚动函数
			var doPlay=function(){
                if(index*opts.steps < ContentBoxNum) {
				$.fn.Slide.effect[opts.effect](ContentBox, targetLi, index, slideWH, opts);
                    index++;
                } else{
                    index = 0;
                }
			};

			clickNext.click(function(event){
                if(index*opts.steps < ContentBoxNum) {
                   $.fn.Slide.effect[opts.effect](ContentBox, targetLi, index, slideWH, opts);
                    index++;
                }else{
                    index = 0;
                    $.fn.Slide.effect[opts.effect](ContentBox, targetLi, index, slideWH, opts);
                }
				event.preventDefault();
			});
			clickPrev.click(function(event){
                if(index*opts.steps >0) {
                    index--;
                    $.fn.Slide.effect[opts.effect](ContentBox, targetLi, index, slideWH, opts);
                }
                else{
                    index = ContentBoxNum-1;
                    $.fn.Slide.effect[opts.effect](ContentBox, targetLi, index, slideWH, opts);
                }
                event.preventDefault();
			});


            clickNext.hover(function(){
                if(autoPlay){
                    clearInterval(autoPlay);
                }
            },function(){
                if(autoPlay){
                    clearInterval(autoPlay);
                }
                autoPlay = setInterval(doPlay, opts.timer);
            });

            clickPrev.hover(function(){
                if(autoPlay){
                    clearInterval(autoPlay);
                }
            },function(){
                if(autoPlay){
                    clearInterval(autoPlay);
                }
                autoPlay = setInterval(doPlay, opts.timer);
            });


			//自动播放
			if (opts.autoPlay) {
				autoPlay = setInterval(doPlay, opts.timer);
				ContentBox.hover(function(){
					if(autoPlay){
						clearInterval(autoPlay);
					}
				},function(){
					if(autoPlay){
						clearInterval(autoPlay);
					}
					autoPlay=setInterval(doPlay, opts.timer);
				});
			}
			
			//目标事件
			targetLi.hover(function(){
				if(autoPlay){
					clearInterval(autoPlay);
				}
				index=targetLi.index(this);
				window.setTimeout(function(){$.fn.Slide.effect[opts.effect](ContentBox, targetLi, index, slideWH, opts);},200);
				
			},function(){
				if(autoPlay){
					clearInterval(autoPlay);
				}
				autoPlay = setInterval(doPlay, opts.timer);
			});
    	});
	};
	$.fn.Slide.deflunt={
		effect : "scroolY",
		autoPlay:true,
		speed : "normal",
		timer : 1000,
		defIndex : 0,
		claNav:"JQ-slide-nav",
		claCon:"JQ-slide-content",
		steps:1
	};
	$.fn.Slide.effectLoop={
		scroolLeft:function(contentObj,navObj,i,slideW,opts,callback){
			contentObj.animate({"left":-i*opts.steps*slideW},opts.speed,callback);
			if (navObj) {
				navObj.eq(i).addClass("on").siblings().removeClass("on");
			}
		},
		
		scroolRight:function(contentObj,navObj,i,slideW,opts,callback){
			contentObj.stop().animate({"left":0},opts.speed,callback);
			
		}
	}
	$.fn.Slide.effect={
		fade:function(contentObj,navObj,i,slideW,opts){
			contentObj.children().eq(i).stop().animate({opacity:1},opts.speed).css({"z-index": "1"}).siblings().animate({opacity: 0},opts.speed).css({"z-index":"0"});
			navObj.eq(i).addClass("on").siblings().removeClass("on");
		},
		scroolTxt:function(contentObj,undefined,i,slideH,opts){
			//alert(i*opts.steps*slideH);
			contentObj.animate({"margin-top":-opts.steps*slideH},opts.speed,function(){
                for( var j=0;j<opts.steps;j++){
                	contentObj.find("li:first").appendTo(contentObj);
                }
                contentObj.css({"margin-top":"0"});
            });
		},
		scroolX:function(contentObj,navObj,i,slideW,opts,callback){
			contentObj.stop().animate({"left":-i*opts.steps*slideW},opts.speed,callback);
			if (navObj) {
				navObj.eq(i).addClass("on").siblings().removeClass("on");
			}
		},
		scroolY:function(contentObj,navObj,i,slideH,opts){
			contentObj.stop().animate({"top":-i*opts.steps*slideH},opts.speed);
			if (navObj) {
				navObj.eq(i).addClass("on").siblings().removeClass("on");
			}
		}
	};
})(jQuery);
