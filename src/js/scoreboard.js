var xjs = require('xjs');
var App = new xjs.App();

window.onload = init;

var isXsplit = false;

var xhr = new XMLHttpRequest();

var timestampOld=0;
var timestamp=0;
var cacheBusterValiable=Date.now();
var cacheBuster=0;

var firstupdate = true;

var scObj;

var currPlayer1;
var currPlayer2;

var currFighter1;
var currFighter2;

var currScore1;
var currScore2;

var isPreview = false;

function init() {
    //アニメーションは、基本init()内部で GSAP の TweenMax を用いて描写。
    xjs.ready().then(xjs.Source.getCurrentSource).then(function(curItem) {
        var sourceWindow = xjs.SourcePluginWindow.getInstance();
        App.getVersion().then(function(res) {
            var version = res;
            console.log(version);
        });
        isXsplit = true;

        XJSitem = curItem;

        XJSitem.setBrowserCustomSize(xjs.Rectangle.fromDimensions(1280,720));
        XJSitem.setPosition(xjs.Rectangle.fromCoordinates(0,0,1,0.0666666666666667));
        XJSitem.setPositionLocked(true);

        XJSitem.getView().then(function(view) {
            console.log("view:" +view);
            if (view != 0) {
                isPreview = true;
            }
        });

        App.getTransition().then(function(res) {
            var currTransition = res._value;
            console.log(currTransition);
            if (currTransition.indexOf(".webm") == -1 ){
                setTimeout(update,300);
            } else {
                var transitionDuration = currTransition.split('.webm,')[1] / 10000 ;
                if (!transitionDuration) {
                    transitionDuration = 2000;
                }
                console.log(transitionDuration);
                setTimeout(update,transitionDuration);
            }
        });
    });

    //真下の行は、Xsplit専用の式。Xsplitでhtmlを60fpsとするのに必要。
    //ブラウザで動作チェックする分には、コメントアウトして頂いて問題ナッシング
    if (isXsplit) {
        window.external.SetLocalProperty("prop:Browser60fps","1");
    }

    //以下から普通に必要な式
    xhr.overrideMimeType('application/json');
    
	xhr.onreadystatechange = scLoaded;
	pollHandler();
	setInterval(function() {
		pollHandler();
	}, 500);
}

function pollHandler() {
	xhr.open('GET', "streamcontrol.json?"+cacheBusterValiable+"="+cacheBuster,true);
	xhr.send();
	cacheBuster++;
}

function scLoaded() {
    
	if (xhr.readyState === 4) {
        
		scObj = JSON.parse(xhr.responseText);
        
		timestampOld = timestamp;
		timestamp = scObj["timestamp"];
		//console.log(timestamp);
        if (timestamp != timestampOld || firstupdate) {
            update();
        }
	}
}

function update() {

	if (firstupdate) {
        currPlayer1 = scObj["pName1"].toString();
        currPlayer2 = scObj["pName2"].toString();
            
        $("#player1").html(currPlayer1);
        $("#player2").html(currPlayer2);

        currTwitter1 = scObj["pTwitter1"].toString();
        currTwitter2 = scObj["pTwitter2"].toString();
            
        $("#twitter1").html("<img src='src/img/twitter-brands.svg'>" + currTwitter1);
        $("#twitter2").html("<img src='src/img/twitter-brands.svg'>" + currTwitter2);

        currScore1 = scObj["pScore1"];
        currScore1 = currScore1 > 2 && scObj["bestOf"] == "bo3" ? 2 : currScore1;
        currScore2 = scObj["pScore2"];
        currScore2 = currScore2 > 2 && scObj["bestOf"] == "bo3" ? 2 : currScore2;
        currBestOf = scObj["bestOf"];
        $("#score1").html("<img src='src/img/"+ currBestOf +"-"+ currScore1 +".png'>");
        $("#score2").html("<img src='src/img/"+ currBestOf +"-"+ currScore2 +".png'>");

        currFighter1 = scObj["pFighter1"].toString();
        currFighter2 = scObj["pFighter2"].toString();
        $("#fighter1").html("<img src='src/img/fighter/"+ currFighter1 +".png'>");
        $("#fighter2").html("<img src='src/img/fighter/"+ currFighter2 +".png'>");

        $("#stage").html(scObj['stage']);

        TweenMax.from($("#player1")[0],0.5,{x:"+50",opacity:0,delay:1.5});
        TweenMax.from($("#player2")[0],0.5,{x:"-50",opacity:0,delay:1.5});

        TweenMax.from($("#fighter1")[0],0.5,{x:"-50",opacity:0,delay:1.5});
        TweenMax.from($("#fighter2")[0],0.5,{x:"+50",opacity:0,delay:1.5});

        TweenMax.from($("#twitter1")[0],0.5,{x:"+50",opacity:0,delay:1.5});
        TweenMax.from($("#twitter2")[0],0.5,{x:"-50",opacity:0,delay:1.5});

        TweenMax.from($("#score1")[0],0.5,{opacity:0,delay:1.5});
        TweenMax.from($("#score2")[0],0.5,{opacity:0,delay:1.5});

        TweenMax.from($("#stage")[0],0.5,{opacity:0,delay:1.5});

        $("#container").css("display", "block");
        textFit($("#stage")[0], {minFontSize:10, maxFontSize: 14,multiLine: false});

        textFit($("#player1")[0], {minFontSize:15, maxFontSize: 20,multiLine: false});
        textFit($("#player2")[0], {minFontSize:15, maxFontSize: 20,multiLine: false});

        textFit($("#twitter1")[0], {minFontSize:15, maxFontSize: 20,multiLine: false});
        textFit($("#twitter2")[0], {minFontSize:15, maxFontSize: 20,multiLine: false});

        firstupdate = false;

    } else {

		if (currPlayer1 != scObj["pName1"].toString()) {
            currPlayer1 = scObj["pName1"].toString();
    		TweenMax.to($("#player1")[0],0.5,{x:"+50",opacity:0,ease:Quad.easeIn,onComplete: function() {
                $("#player1").html(currPlayer1);
                textFit($("#player1")[0], {minFontSize:15, maxFontSize: 20,multiLine: false});
            }});
            TweenMax.to($("#player1")[0],0.5,{x:"-0",opacity:1,ease:Quad.easeOut,delay:0.5});
        }
        if (currPlayer2 != scObj["pName2"].toString()) {
            currPlayer2 = scObj["pName2"].toString();
            TweenMax.to($("#player2")[0],0.5,{x:"-50",opacity:0,ease:Quad.easeIn,onComplete: function() {
                $("#player2").html(currPlayer2);
                textFit($("#player2")[0], {minFontSize:15, maxFontSize: 20,multiLine: false});
            }});
            TweenMax.to($("#player2")[0],0.5,{x:"+0",opacity:1,ease:Quad.easeOut,delay:0.5});
        }

        if (currFighter1 != scObj["pFighter1"].toString()) {
    		TweenMax.to($("#fighter1")[0],0.5,{x:"-50",opacity:0,ease:Quad.easeIn,onComplete: function() {
                currFighter1 = scObj["pFighter1"].toString();
                $("#fighter1").html("<img src='src/img/fighter/"+ currFighter1 +".png'>");
            }});
            TweenMax.to($("#fighter1")[0],0.5,{x:"-0",opacity:1,ease:Quad.easeOut,delay:0.5});
        }

        if (currFighter2 != scObj["pFighter2"].toString()) {
            TweenMax.to($("#fighter2")[0],0.5,{x:"+50",opacity:0,ease:Quad.easeIn,onComplete: function() {
                currFighter2 = scObj["pFighter2"].toString();
                $("#fighter2").html("<img src='src/img/fighter/"+ currFighter2 +".png'>");
            }});
            TweenMax.to($("#fighter2")[0],0.5,{x:"+0",opacity:1,ease:Quad.easeOut,delay:0.5});
        }
        
        if (currTwitter1 != scObj["pTwitter1"].toString()) {
            currTwitter1 = scObj["pTwitter1"].toString();
    		TweenMax.to($("#twitter1")[0],0.5,{x:"+50",opacity:0,ease:Quad.easeIn,onComplete: function() {
                $("#twitter1").html("<img src='src/img/twitter-brands.svg'>" + currTwitter1);
                textFit($("#twitter1")[0], {minFontSize:15, maxFontSize: 20,multiLine: false});
            }});
            TweenMax.to($("#twitter1")[0],0.5,{x:"-0",opacity:1,ease:Quad.easeOut,delay:0.5});
        }
        if (currTwitter2 != scObj["pTwitter2"].toString()) {
            currTwitter2 = scObj["pTwitter2"].toString();
            TweenMax.to($("#twitter2")[0],0.5,{x:"-50",opacity:0,ease:Quad.easeIn,onComplete: function() {
                $("#twitter2").html("<img src='src/img/twitter-brands.svg'>" + currTwitter2);
                textFit($("#twitter2")[0], {minFontSize:15, maxFontSize: 20,multiLine: false});
            }});
            TweenMax.to($("#twitter2")[0],0.5,{x:"+0",opacity:1,ease:Quad.easeOut,delay:0.5});
    	}

        if (currScore1 != scObj["pScore1"].toString() || currBestOf != scObj["bestOf"]) {
            currScore1 = scObj['pScore1'].toString();
            currScore1 = currScore1 > 2 && scObj["bestOf"] == "bo3" ? 2 : currScore1;
            TweenMax.to($("#score1")[0],0.5,{opacity:0,ease:Quad.easeIn,onComplete: function() {
                $("#score1").html("<img src='src/img/"+ scObj["bestOf"] +"-"+ currScore1 +".png'>");
            }});
            TweenMax.to($("#score1")[0],0.5,{opacity:1,ease:Quad.easeOut,delay:0.5});
        }
        if (currScore2 != scObj["pScore2"].toString() || currBestOf != scObj["bestOf"]) {
            currScore2 = scObj['pScore2'].toString();
            currScore2 = currScore2 > 2 && scObj["bestOf"] == "bo3" ? 2 : currScore2;
            currBestOf = scObj['bestOf'];
            TweenMax.to($("#score2")[0],0.5,{opacity:0,ease:Quad.easeIn,onComplete: function() {
                $("#score2").html("<img src='src/img/"+ scObj["bestOf"] +"-"+ currScore2 +".png'>");
            }});
            TweenMax.to($("#score2")[0],0.5,{opacity:1,ease:Quad.easeOut,delay:0.5});
        }
        if ($("#stage .textFitted").html() != scObj['stage']) {
            TweenMax.to($("#stage")[0],0.5,{opacity:0,ease:Quad.easeIn,onComplete: function() {
                $("#stage").html(scObj['stage']);
                textFit($("#stage")[0], {minFontSize:10, maxFontSize: 14,multiLine: false});
            }});
            TweenMax.to($("#stage")[0],0.5,{opacity:1,delay:0.5,ease:Quad.easeOut});
        }
	}
}