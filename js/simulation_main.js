//create by ziAng.li on 2018 2 28


var canvas  = document.getElementById("displayInterface");
var context = canvas.getContext("2d");
var preUrlName = "JsonFile/subject_tmpl_"; //通用路径前缀
var sufUrlName = ".json";     //通用路径后缀
var winWidth = 1136;
var winHeight = 768;
var refreshButton = document.getElementById("refreshButton");
var nextButton = document.getElementById("nextButton");
var outButton = document.getElementById("outButton");
var subjectTempIdList ;            //载入的关卡数的数组
var colorArray = new Array(60);
var beginSerial;
var endSerial;
var isNextUp = false;
//获取当前浏览器逻辑分辨率与物理分辨率的比值
var PIXEL_RATIO = (function () {
    var ctx = document.createElement("canvas").getContext("2d"),
        dpr = window.devicePixelRatio || 1,
        bsr = ctx.webkitBackingStorePixelRatio ||
            ctx.mozBackingStorePixelRatio ||
            ctx.msBackingStorePixelRatio ||
            ctx.oBackingStorePixelRatio ||
            ctx.backingStorePixelRatio || 1;

    return dpr / bsr;
})();


//读取主关卡数文件
$.getJSON( preUrlName + "id_list.json",function (data) {
    subjectTempIdList = data;
    initSujectList();
    beginSerial = 0;
    endSerial = GetChangeNum(9);

});


// 初始化关卡列表
function initSujectList() {

    var length = subjectTempIdList.subjectTmplIdList.length;
    var subjectTempId ;

    for(var i=0;i<length;i++) {

        subjectTempId=subjectTempIdList.subjectTmplIdList[i];
        addSubjectList(subjectTempId);

    }
}


//根据当前关卡数生成关卡列表和名字
function addSubjectList(subjectTempId) {

    $.getJSON( preUrlName + subjectTempId+ sufUrlName,function (data) {

        var displayName ;
        if (undefined === data.displayName) {

            displayName = data.client.displayName;
        }
        else {

            displayName = data.displayName;
        }

        subjectList.options.add(new Option("第" + subjectTempId + "关" + ":" + displayName, subjectTempId));
    });


    canvas.width = winWidth * PIXEL_RATIO;
    canvas.height = winHeight * PIXEL_RATIO;
}


//获取当前选择的同时展现线数
function GetChangeNum(numOfLines) {


        var changeNum;
        if ("all" == $("input[name='numberOfLines']:checked").val()) {
            changeNum = numOfLines;
        }
        else if ("1" == $("input[name='numberOfLines']:checked").val()) {
            changeNum = 1;
        }
        else if ("2" == $("input[name='numberOfLines']:checked").val()) {
            changeNum = 2;
        }
        else if ("5" == $("input[name='numberOfLines']:checked").val()) {
            changeNum = 5;
        }
        else if ("10" == $("input[name='numberOfLines']:checked").val()) {
            changeNum = 10;
        }

    return changeNum;

}


//读取选择的背景图文件显示到预览界面上
$("#background").on("change", function(e) {

    var file = e.target.files[0]; //获取图片资源

    // 只选择图片文件
    if (!file.type.match('image.*')) {

        return false;
    }

    var reader = new FileReader();

    reader.readAsDataURL(file); // 读取文件

    // 渲染文件
    reader.onload = function(arg) {

        document.getElementById("imgInput").src = arg.target.result;
    }
});

//点击next按钮功能
nextButton.onclick = function () {
    var numOfLines = 0;
    var selectNum = document.getElementById("subjectList").value; //当前关卡数
    $.getJSON(preUrlName + selectNum + sufUrlName, function (data) {

        while (undefined != data.lines[0][numOfLines]) {

            numOfLines++;
        }

        beginSerial = beginSerial + GetChangeNum(numOfLines);
        endSerial = beginSerial + GetChangeNum(numOfLines);
        if (endSerial > numOfLines) {
            endSerial = numOfLines;
        }
        if(beginSerial >= numOfLines) {
            beginSerial = 0;
            endSerial = GetChangeNum(numOfLines);
        }

        DrawPayLines(data);
    });
    isNextUp = true;
};

//点击预览按钮功能
refreshButton.onclick = function(){
    var numOfLines = 0;

    var selectNum = document.getElementById("subjectList").value; //当前关卡数
    $.getJSON(preUrlName + selectNum + sufUrlName, function (data) {

        while (undefined != data.lines[0][numOfLines]) {

            numOfLines++;
        }
        if(isNextUp == false || "all" == $("input[name='numberOfLines']:checked").val()) {
            beginSerial = 0;
            endSerial = GetChangeNum(numOfLines);
        }
        DrawPayLines(data);
    });
};

//点击输出按钮功能
outButton.onclick = function () {
    $.getJSON(preUrlName + (document.getElementById("subjectList").value) + sufUrlName, function (data) {
        var count = 0;
        var a =new Array();
        while (undefined != data.lines[0][count]) {

            colorArray[count] = data.lines[0][count].color;
            count++;
        }
        var saveArray = new Array(count);
        for(var i = 0;i<count;i++){
            saveArray[i] = new Object();
        }
        for(var i=0;i<count;i++){
            saveArray[i] =  Hex2RGB(document.getElementById("color" + (i+1).toString()).value,saveArray[i]);
        }
        var json =JSON.stringify(saveArray,null,1);
        Download(json,("subject_tmpl_" + (document.getElementById("subjectList").value) + sufUrlName));

    });

};
//将json格式数据保存成文件
function Download(content, filename) {

    var eleLink = document.createElement('a');
    eleLink.download = filename;
    eleLink.style.display = 'none';
    var blob = new Blob([content]);
    eleLink.href = URL.createObjectURL(blob);
    document.body.appendChild(eleLink);
    eleLink.click();
    document.body.removeChild(eleLink);
}

//画出整个payLines
function DrawPayLines(data) {


    var rotaryTableX = data.panels[0].spinRegion[0]+ (1136-960)/2;//轮盘坐标x
    var rotaryTableY = data.panels[0].spinRegion[1] + (768-640)/2;//轮盘坐标y
    var lineBeginX = rotaryTableX;//线开始位置x
    var lineBeginY = rotaryTableY;//线开始位置y；
    var countArray = new Array(data.reelRow);
    for(var i = 0;i<data.reelRow;i++){
        countArray[i] = 0;
    }
    context.clearRect(0,0,1136,768);
    for(var j =beginSerial;j<endSerial ;j++) {
        lineBeginX = rotaryTableX;
        lineBeginY = rotaryTableY;
        DrawPayLine(data,lineBeginX,lineBeginY,j,countArray);
    }

}

//画一条payLine
function DrawPayLine(data,lineBeginX,lineBeginY,serial,countArray) {

    var numOfCol = data.reelCol;//列
    var numOfRow = data.reelRow;//行
    var rotaryTableWidth = data.panels[0].spinRegion[2];//轮盘宽度
    var rotaryTableHeight = data.panels[0].spinRegion[3];//轮盘高度
    var ceilDisplacementX = rotaryTableWidth/(numOfCol*2);//x方向每次改变位移
    var ceilDisplacementY = rotaryTableHeight/numOfRow;//y方向每次改变位移
    var ceilBeginX = lineBeginX ;
    var ceilBeginY = lineBeginY + (data.lines[0][serial].rows[0])*ceilDisplacementY +ceilDisplacementY/2;
    var ceilEndX = ceilBeginX + ceilDisplacementX;
    var ceilEndY = lineBeginY + (data.lines[0][serial].rows[0])*ceilDisplacementY+ceilDisplacementY/2;
    var lineColor = document.getElementById("color" + (serial+1).toString()).value ;
    var serialX = ceilBeginX - (countArray[data.lines[0][serial].rows[0]] * 22) - 10;
    countArray[data.lines[0][serial].rows[0]] +=1;
    var serialY = ceilBeginY;

    DrawSerial(serial + 1 , serialX , 768-serialY , lineColor);
    DrawPayLinesCeil(ceilBeginX,768-ceilBeginY,ceilEndX,768-ceilEndY,lineColor);
    for(var i = 0;i<numOfCol-1;i++){
        ceilBeginX = ceilEndX;
        ceilBeginY = ceilEndY;
        ceilEndX = ceilBeginX + ceilDisplacementX*2;
        ceilEndY = lineBeginY + (data.lines[0][serial].rows[i+1])*ceilDisplacementY+ceilDisplacementY/2;
        lineColor = document.getElementById("color" + (serial+1).toString()).value;
        DrawPayLinesCeil(ceilBeginX,768-ceilBeginY,ceilEndX,768-ceilEndY,lineColor);
    }
    ceilBeginX = ceilEndX;
    ceilBeginY = ceilEndY;
    ceilEndX = ceilBeginX + ceilDisplacementX;
    DrawPayLinesCeil(ceilBeginX,768-ceilBeginY,ceilEndX,768-ceilEndY,lineColor);


}
//画序号
function DrawSerial(serial,serialX,serialY,serialColor) {
    context.font = "15px Arial";
    context.fillStyle = serialColor;
    context.textAlign = "center";
    context.fillText(serial , serialX, serialY);
}

//画payLines上的每一小段
function DrawPayLinesCeil(ceilBeginX,ceilBeginY,ceilEndX,ceilEndY,lineColor) {

    context.beginPath();
    context.strokeStyle = lineColor;
    context.lineWidth = 5;
    context.moveTo(ceilBeginX,ceilBeginY);
    context.lineTo(ceilEndX,ceilEndY);
    context.stroke();
    context.closePath();
}

//初始化每条赢钱线的颜色
function InitColor() {

    for(var i = 0;i<60;i++) {
        colorArray[i] = undefined;
        document.getElementById("color" + (i+1).toString()).disabled=false;
    }

    var selectNum = document.getElementById("subjectList").value; //当前关卡数
    var count = 0;
    var hex;
    $.getJSON(preUrlName + selectNum + sufUrlName, function (data) {

        while (undefined != data.lines[0][count]) {

            colorArray[count] = data.lines[0][count].color;
            count++;
        }
        if(0 == colorArray[0][3]){
            window.alert("当前关卡赢钱线程序配置不显示");
        }
        for(var x = 0; x<60;x++) {

            document.getElementById("color" + (x+1).toString()).value ="#000000" ;
            document.getElementById("color" + (x+1).toString()).style.border = "1px solid #00FF25"
        }
        for(var i = count;i<60;i++){
            document.getElementById("color" + (i+1).toString()).disabled="disabled";
            document.getElementById("color" + (i+1).toString()).style.border ="1px solid #FF0018";
        }

        for(var j = 0;j<count;j++) {

            hex = "#";
            for (var i = 0; i < 3; i++) {
                hex += ("0" + Number(colorArray[j][i]).toString(16)).slice(-2);
            }
            document.getElementById("color" + (j+1).toString()).value =hex ;
            colorArray[j] = hex;
        }

    });
    isNextUp =false;
}


//16进制转化成rgba
function Hex2RGB(hex,saveArray){

    saveArray.color = new Array(4);
    for(var i =0 ;i<3;i++){
        saveArray.color[i] = parseInt("0x"+hex[(2*i)+1]+hex[(2*i)+2]);
    }
    saveArray.color[3] = 255;

    return saveArray;
}












