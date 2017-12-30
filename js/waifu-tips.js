function render(template, context) {

    var tokenReg = /(\\)?\{([^\{\}\\]+)(\\)?\}/g;

    return template.replace(tokenReg, function (word, slash1, token, slash2) {
        if (slash1 || slash2) {
            return word.replace('\\', '');
        }

        var variables = token.replace(/\s/g, '').split('.');
        var currentObject = context;
        var i, length, variable;

        for (i = 0, length = variables.length; i < length; ++i) {
            variable = variables[i];
            currentObject = currentObject[variable];
            if (currentObject === undefined || currentObject === null) return '';
        }
        return currentObject;
    });
}
String.prototype.render = function (context) {
    return render(this, context);
};

var re = /x/;
console.log("%c", "padding:100px 200px;line-height:120px;background:url('http://img.mp.itc.cn/upload/20170713/60965fb171e241309e6ae55761a8e08f_th.jpg");
console.log(re);
re.toString = function() {
    showMessage('你打开了控制台，是想要看看我的秘密吗？', 5000);
    return '';
};

$(document).on('copy', function (){
    showMessage('你都复制了些什么呀，转载要记得加上出处哦', 5000);
});

$('#hitokoto').mouseover(function (){
  var text = '这句一言出处是 <span style="color:#0099cc;">『{source}』</span>，是 <span style="color:#0099cc;">{author}</span> 在 {date} 时投稿的！'
  var hitokoto = JSON.parse($(this)[0].dataset.raw);
  text = text.render({source: hitokoto.source, author: hitokoto.author, date: hitokoto.date});
  showMessage(text, 3000);
});

$('.waifu-tool .fui-home').click(function (){
  window.location = 'http://www.xuanbiyijue.com/';
});

$('.waifu-tool .fui-eye').click(function (){
  switchNightMode();
  showMessage('注意休息，不要用眼过度哦~', 3000, true);
});

$('.waifu').click(function (){
  $(".waifu-tool").toggle();
});

$('.waifu-tool .fui-chat').click(function (){
  showHitokoto();
});

$('.waifu-tool .fui-user').click(function (){
  loadRandModel();
  showMessage('我的新衣服好看嘛', 3000, true);
});

$('.waifu-tool .fui-photo').click(function (){
  showMessage('照好了，是不是很可爱呢？', 5000, true);
  window.Live2D.captureName = 'Pio.png';
  window.Live2D.captureFrame = true;
});

$('.waifu-tool .fui-info-circle').click(function (){
  showMessage('关注公众号或者加QQ群，让我主人告诉你，我是怎么诞生的吧~😝', 5000, true);
});

$('.waifu-tool .fui-cross').click(function (){
  sessionStorage.setItem('waifu-dsiplay', 'none');
  showMessage('刷新我就会出来的，一会见~', 3000, true);
  window.setTimeout(function() {$('.waifu').hide();}, 3000);
});


$.ajax({
    cache: true,
    url: "/js/waifu-tips.json",
    dataType: "json",
    success: function (result){
        $.each(result.mouseover, function (index, tips){
            $(document).on("mouseover", tips.selector, function (){
                var text = tips.text;
                if(Array.isArray(tips.text)) text = tips.text[Math.floor(Math.random() * tips.text.length + 1)-1];
                text = text.render({text: $(this).text()});
                showMessage(text, 3000);
            });
        });
        $.each(result.click, function (index, tips){
            $(document).on("click", tips.selector, function (){
                var text = tips.text;
                if(Array.isArray(tips.text)) text = tips.text[Math.floor(Math.random() * tips.text.length + 1)-1];
                text = text.render({text: $(this).text()});
                showMessage(text, 3000);
            });
        });
    }
});

(function (){
    var text;
    if(document.referrer !== ''){
        var referrer = document.createElement('a');
        referrer.href = document.referrer;
        text = 'Hello! 来自 <span style="color:#0099cc;">' + referrer.hostname + '</span> 的朋友';
        var domain = referrer.hostname.split('.')[1];
        if (domain == 'baidu') {
            text = 'Hello! 来自 百度搜索 的朋友<br>你是搜索 <span style="color:#0099cc;">' + referrer.search.split('&wd=')[1].split('&')[0] + '</span> 找到的我吗？';
        }else if (domain == 'so') {
            text = 'Hello! 来自 360搜索 的朋友<br>你是搜索 <span style="color:#0099cc;">' + referrer.search.split('&q=')[1].split('&')[0] + '</span> 找到的我吗？';
        }else if (domain == 'google') {
            text = 'Hello! 来自 谷歌搜索 的朋友<br>欢迎访问<span style="color:#0099cc;">『' + document.title.split(' - ')[0] + '』</span>';
        }
    }else {
        if (window.location.href == 'http://www.xuanbiyijue.com/') { //如果是主页
            var now = (new Date()).getHours();
            if (now > 23 || now <= 5) {
                text = '你是夜猫子呀？这么晚还不睡觉，明天起的来嘛';
            } else if (now > 5 && now <= 7) {
                text = '早上好！一日之计在于晨，美好的一天就要开始了';
            } else if (now > 7 && now <= 11) {
                text = '上午好！工作顺利嘛，不要久坐，多起来走动走动哦！';
            } else if (now > 11 && now <= 14) {
                text = '中午了，工作了一个上午，现在是午餐时间！';
            } else if (now > 14 && now <= 17) {
                text = '午后很容易犯困呢，今天的运动目标完成了吗？';
            } else if (now > 17 && now <= 19) {
                text = '傍晚了！窗外夕阳的景色很美丽呢，最美不过夕阳红~';
            } else if (now > 19 && now <= 21) {
                text = '晚上好，今天过得怎么样？';
            } else if (now > 21 && now <= 23) {
                text = '已经这么晚了呀，早点休息吧，晚安~';
            } else {
                text = '嗨~ 快来逗我玩吧！';
            }
        }else {
            text = '欢迎访问<span style="color:#0099cc;">『' + document.title.split(' - ')[0] + '』</span>';
        }
    }
    showMessage(text, 6000);
})();

window.setInterval(showHitokoto,30000);

function showHitokoto(){
    $.getJSON('https://api.imjad.cn/hitokoto/?cat=&charset=utf-8&length=28&encode=json',function(result){
        showMessage(result.hitokoto, 5000);
    });
}

function showMessage(text, timeout){
    if(Array.isArray(text)) text = text[Math.floor(Math.random() * text.length + 1)-1];
    // console.log(text);
    $('.waifu-tips').stop();
    $('.waifu-tips').html(text).fadeTo(200, 1);
    if (timeout === null) timeout = 5000;
    hideMessage(timeout);
}

function hideMessage(timeout){
    $('.waifu-tips').stop().css('opacity',1);
    if (timeout === null) timeout = 5000;
    $('.waifu-tips').delay(timeout).fadeTo(200, 0);
}

var night = 0;
function switchNightMode(){
  if(night == '0'){
      document.body.classList.add('night');
      night = '1';
      console.log('夜间模式开启');
  }else{
      document.body.classList.remove('night');
      night = '0'
      console.log('夜间模式关闭');
  }
}

function loadRandModel(){
  var skinIndex = Math.floor(Math.random() * 16 + 1);
  var modelJSON = "/js/Skin/Pio/model" + skinIndex +".json";
  loadlive2d("live2d", modelJSON, console.log('更换为皮肤',skinIndex));
}
