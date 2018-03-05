//create by ziAng.li on 2018.02.05


var canvas  = document.getElementById("DisplayInterface1");
var context = canvas.getContext("2d");
var blankLeft = 20;
var blankTop = 20;
var jsonFile;                                        //用户点选的Json文件信息
var previewButton = document.getElementById("Preview");                     //预览按钮
var payLineColorEB ;                                 //赢钱线颜色
var backGroundPayLineColorEB ;                       //赢钱线背景颜色
var rowNumEB ;                                       //每行显示个数
var numPositionList ;                                //序号位置
var serialNumTypeEB ;                             //序号字体
var serialNumSizeEB  ;                             //序号大小
var serialNumColorEB ;                           //序号颜色
var payLineWidth;                                   //每个赢钱线的长
var payLineHeight;                                   //每个赢钱线的宽
var arrayX;                                    //payline的横向格子数
var arrayY;                                   //payline的总想格子数
var movX;                                   //x方向变换赢钱线的位移
var movy ;                                      //y方向变换赢钱线的位移
var loadJsonFile = false;                   //用来判断json文件是否是已经载入的关卡列表里面的文件
var seleSerialEB1;                           //选择的起始预览序号
var seleSerialEB2;                             //选择的结束预览序号
var PreUrlName = "JsonFile/subject_tmpl_"; //通用路径前缀
var SufUrlName = ".json";     //通用路径后缀
var winWidth = 785;
var winHeight = 460;
var SubjectTmplIdList ;            //载入的关卡数的数组


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
$.getJSON( PreUrlName + "id_list.json",function (data) {
    SubjectTmplIdList = data;
    initSujectList();
});






// 初始化关卡列表
function initSujectList() {

    var length = SubjectTmplIdList.subjectTmplIdList.length;
    var SubjectTempId ;

    for(var i=0;i<length;i++) {

        SubjectTempId=SubjectTmplIdList.subjectTmplIdList[i];
        addSubjectList(SubjectTempId);
    }
}

//根据当前关卡数生成关卡列表和名字
function addSubjectList(SubjectTempId) {

    $.getJSON( PreUrlName + SubjectTempId+ SufUrlName,function (data) {
        var displayName ;
        if (undefined === data.displayName) {

            displayName = data.client.displayName;
        }
        else {

            displayName = data.displayName;
        }
        if(undefined == displayName ){
            alert("当前文件无法解析，请联系程序开发人员");
        }
        if(data.lines[0].length > 1){

            SujectList.options.add(new Option("第" + SubjectTempId + "关" + "：     " + displayName, SubjectTempId));
        }
    });
    canvas.width = winWidth * PIXEL_RATIO;
    canvas.height = winHeight * PIXEL_RATIO;
}




previewButton.onclick = function () {

    payLineColorEB = document.getElementById("PayLineColorEB").value;
    backGroundPayLineColorEB = document.getElementById("BackGroundPayLineColorEB").value;
    numPositionList = document.getElementById("NumPostionList").value;
    serialNumTypeEB = document.getElementById("SerialNumTypeEB").value;
    serialNumColorEB = document.getElementById("SerialNumColorEB").value;

    serialNumSizeEB = document.getElementById("SerialNumSizeEB").value;
    if("" == serialNumSizeEB) {

        serialNumSizeEB = 30;
        document.getElementById("SerialNumSizeEB").value = 30;
    }

    serialNumSizeEB = parseInt(serialNumSizeEB);

    rowNumEB = document.getElementById("RowNumEB").value;
    if("" == rowNumEB) {

        rowNumEB = 5;
        document.getElementById("RowNumEB").value = 5;
    }

    rowNumEB = parseInt(rowNumEB);
    var selectNum = document.getElementById("SujectList").value; //当前关卡数

    context.clearRect(0, 0, winWidth, winHeight);

    GetArrOption(selectNum);
};

//获取json文件里面line的属性
//selectNum:当前选择的关卡数
function GetArrOption(selectNum) {

    if(loadJsonFile == false) {

        $.getJSON(PreUrlName + selectNum + ".json", function (data) {
            var data = data;
            GetInfoPayLine(data)
        });
    }
    else {

        var data = jsonFile;
         selectNum = jsonFile.subjectTmplId;
        GetInfoPayLine(data)
    }

    ShowFileName(selectNum);
}



//解析每条payline的信息
//data：从文件里面读取出来的属性
function GetInfoPayLine(data) {
    var i = 0;
    var j = 0;
    var data = data;
    arrayX = (data.lines[0][0]).rows.length;
    arrayY = 0;
    while (undefined != data.lines[0][i]) {

        for (j = 0; undefined != (data.lines[0][i]).rows[j]; j++) {

            if (arrayY < (data.lines[0][i]).rows[j]) {

                arrayY = (data.lines[0][i]).rows[j];
            }
        }

        i++;
    }

    arrayY = arrayY + 1;
    document.getElementById("NumOfJsonEb").value = i;
    CountData(i,data);
}


//根据当前选择关卡数生成保存后的文件名
//selectNum:当前选择的关卡数
function ShowFileName(selectNum) {

    var selectNum =selectNum;

    $.getJSON( PreUrlName + selectNum + SufUrlName,function (data) {

        var displayName ;

        if (undefined === data.displayName) {

            displayName = data.client.displayName;
        }
        else {

            displayName = data.displayName;
        }

        if(undefined == displayName ){

            alert("当前文件无法解析，请联系程序开发人员");
        }
        displayName = displayName.replace(" " ,"_").toLowerCase()
        document.getElementById("FileNameEB").value =  selectNum + "_" + displayName +"_paytable.png";
    });
    loadJsonFile = false;
}



//根据获得的用户输入参数 对每个payline的位置数据进行计算
function CountData(serialNum,data) {

    var data = data;

    if("up" == numPositionList || "down" == numPositionList) {                         //当前序号位置为上下

        payLineWidth = ((winWidth - 2 * blankLeft) * arrayX) / (rowNumEB * ( arrayX + 1 ) - 1);
        payLineHeight = payLineWidth / arrayX * arrayY;
        movX = payLineWidth + payLineWidth / arrayX;
        movy = payLineHeight +  serialNumSizeEB + 2 * payLineHeight / arrayY ;
        DrawPayTable(serialNum, data);
    }
    else if("left" == numPositionList || "right" == numPositionList){                             //当前序号位置为左右

        payLineWidth = (((winWidth - 2 * blankLeft) - rowNumEB * serialNumSizeEB) * arrayX)/ (rowNumEB* arrayX + 2*rowNumEB-1);
        payLineHeight = payLineWidth / arrayX * arrayY;
        movX = payLineWidth + serialNumSizeEB + 2 * payLineWidth /arrayX;
        movy = payLineHeight + payLineHeight / arrayY;
        DrawPayTable(serialNum,data);
    }
}

//根据数据绘制整个paytable
function DrawPayTable(serialNum,data) {

    var count = 0;
    var x =blankLeft;
    var y =blankTop;
    if("up" == numPositionList) {

        y = blankTop + serialNumSizeEB;
    }else if("left" == numPositionList){

        x = blankLeft + serialNumSizeEB;
    }

    seleSerialEB1 = document.getElementById("SeleSerialEB1").value;
    if("" == seleSerialEB1) {

        seleSerialEB1 = 1;
        document.getElementById("SeleSerialEB1").value = seleSerialEB1;

    }

    seleSerialEB1 = parseInt(seleSerialEB1);
    seleSerialEB2 = document.getElementById("SeleSerialEB2").value;

    if("" == seleSerialEB2) {

        seleSerialEB2 = serialNum;
        document.getElementById("SeleSerialEB2").value = seleSerialEB2;

    }
    seleSerialEB2 = parseInt(seleSerialEB2);

    if(seleSerialEB2<seleSerialEB1) {

        window.alert("输入的参数不正确，请修改");
        return;
    }
    for(var j =(seleSerialEB1 -1);j<seleSerialEB2 ;j++) {

        if( y + payLineHeight > winHeight){

            window.alert("当前设定每行元素数过少，或者选择的绘制赢钱线过多，请调整输入的参数");
            break;
        }

        DrawPayLine(x,y,payLineWidth,payLineHeight,data,j);
        x = x + movX;
        count++;

        if(rowNumEB == count){

            x=blankLeft;

            if("left" == numPositionList) {

                x = blankLeft + serialNumSizeEB;
            }

            y = y + movy;
            y = Math.round(y);
            count =0;
        }
    }
}


//serial当前pay所画的位置及长度宽度和当前是文件中的第几条赢钱线
//根据数据绘制赢钱线
function DrawPayLine(x , y , payLineWidth , payLineHeight , data , serial) {
//根据json文件里面的配置画图，

    var serialPosX = 0;
    var serialPosY = 0;
    var payLineCeilX = x;
    var payLineCeilY = y;
    var indexY = y;
    var payLineCeilWidth = payLineWidth/arrayX - 2;
    var payLineCeilHeight = payLineHeight/arrayY - 2;


    if("up" == numPositionList) {

        serialPosX = x + payLineWidth/2;
        serialPosY = y - serialNumSizeEB/2;
    }
    else if ("down" == numPositionList) {

        serialPosX = x + payLineWidth/2;
        serialPosY = y + payLineHeight + serialNumSizeEB;
    }
    else if("left" == numPositionList){

        serialPosX = x - serialNumSizeEB;
        serialPosY = y + payLineHeight/2 + (serialNumSizeEB-10)/2;
    }
    else if("right" == numPositionList){

        serialPosX = x + payLineWidth +  serialNumSizeEB/2 + payLineCeilWidth;
        serialPosY = y + payLineHeight/2 + (serialNumSizeEB-10)/2;
    }


    for(var i =0;i<arrayX ;i++) {

        for(var j =0; j<arrayY;j++){

            if (((arrayY-j-1) == (data.lines[0][serial]).rows[i])) {

                context.fillStyle = payLineColorEB;
            }
            else {

                context.fillStyle = backGroundPayLineColorEB;
            }

            context.fillRect(payLineCeilX, payLineCeilY, payLineCeilWidth, payLineCeilHeight);
            payLineCeilY = payLineCeilY + payLineCeilHeight +2;
            payLineCeilY = Math.round(payLineCeilY);
        }

        payLineCeilX = payLineCeilX + payLineCeilWidth +2;
        payLineCeilX = Math.round(payLineCeilX);
        payLineCeilY = indexY;
        payLineCeilY = Math.round(payLineCeilY);
    }

    context.font = serialNumSizeEB + "px " + serialNumTypeEB;
    context.fillStyle = serialNumColorEB;
    context.textAlign = "center";
    context.fillText(serial + 1, serialPosX, serialPosY);

}


//读取选择的背景图文件显示到预览界面上
$("#Files").on("change", function(e) {

    var file = e.target.files[0]; //获取图片资源

    // 只选择图片文件
    if (!file.type.match('image.*')) {

        return false;
    }

    var reader = new FileReader();

    reader.readAsDataURL(file); // 读取文件

    // 渲染文件
    reader.onload = function(arg) {

        document.getElementById("ImgInput").src = arg.target.result;
    }
});


//通过选取获取Json文件内容

$("#SeleFiles").on("change", function(e) {

    var file = e.target.files[0]; //获取Json资源

    loadJsonFile = true;

    var reader = new FileReader();

    reader.readAsText(file); // 读取文件

    reader.onload = function(arg) {

        jsonFile =  JSON.parse(arg.target.result);
        var count = 0;

        while (undefined != jsonFile.lines[0][count]) {

            count++;
        }

        document.getElementById("NumOfJsonEb").value = count;
        seleSerialEB2 = count;
        seleSerialEB1 = 1;
        document.getElementById("SeleSerialEB2").value = seleSerialEB2;
        document.getElementById("SeleSerialEB1").value = seleSerialEB1;

    }


});

//实时更新Json文件赢钱线总数，和预设预览的赢钱线序号为最大
$("#SujectList").change(function () {

    var count;
    var selectNum = document.getElementById("SujectList").value;

    $.getJSON(PreUrlName + selectNum + ".json", function (data) {

        count = 0;

        while (undefined != data.lines[0][count]) {

            count++;
        }

        document.getElementById("NumOfJsonEb").value = count;
        seleSerialEB2 = count;
        seleSerialEB1 = 1;
        document.getElementById("SeleSerialEB2").value = seleSerialEB2;
        document.getElementById("SeleSerialEB1").value = seleSerialEB1;
    });
});






