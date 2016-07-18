/*
* ## 动态添加标签 
* @param {Object} [global] 待挂载其上的全局对象,一般为window
* @author ttghost@126.com 
*/
;(function(global,undefined){
    var TTtag= function(){
	this.version = '0.0.1';	
    }; 
    TTtag.prototype = (function(){
	var TTtagPro = {
		/*
		* ## 单例化标签
		* @param {Object} [opt] 单例数据对象
		* @param {Array} [opt.data] 每个标签文字等相关信息
		* @param {String} [opt.pSelector] 需要将标签组放入的直接父对象 
		* @param {Belena} [opt.jump] 选填，默认值：false，点击标签是否直接新窗口打开 
		* @param {String} [opt.icon] 选填， 标签组前面的icon图标dom字符串，也可替换为其他标签 
		* @return {Object} 方法返回值，为[opt.pSelector]的jQuery对象 
		* @example 
		*    opt对象demo
		*        {
		*        	pSlector:'#wmd',
		*        	data:[
		*        		{url:'aaa/dd',title:'xiaoming'},
		*        		{url:'aaa/dd',title:'xiaoming'}
		*        	],
		*        	jump:false 
		*        }
		*/
		set:function(opt){
			var isJump = opt.jump ? ' target="_blank"':'';
			var domStr = '';
			var icon = opt.icon ? opt.icon : '';
			for(var i = 0,dataLen = opt.data.length; i<dataLen; i++){
				var thisTile = opt.data[i].title;
				var thisUrl = opt.data[i].url ? ' href="' +opt.data[i].url + '"' : '';
				var fullTitle = opt.data[i].fullTitle ? ' title="'+ opt.data[i].fullTitle +'"' : '';
				domStr += '<a ' + thisUrl + isJump + fullTitle + '>' + thisTile + '</a>';
			}
			var allDom = '<span class="tt-tag">' + icon + domStr + '</span>';
			return	$(opt.pSlector).append(allDom);
		},
		/*
		* ## 批量化标签
		* @param {Array} 由set方法参数opt组成的数组 
		*/
		setList: function(dataList){
			for(var j=0,dataListLen = dataList.length; j < dataListLen;j++){
				this.set(dataList[j])	
			}
		}
	}	
	return TTtagPro;
    })();
	//AMD模块输出
	if(typeof defined === "function"){
		defined('TTtag',['jquery'],function(){
			return TTtag;
		})
	};
	global.TTtag = TTtag;
})(Cy);
