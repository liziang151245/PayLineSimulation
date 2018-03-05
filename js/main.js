function InitSerial() {

    var selectNum = document.getElementById("subjectList").value; //当前关卡数
    $.getJSON(preUrlName + selectNum + sufUrlName, function (data) {
        var numOfLines =0;
        while (undefined != data.lines[0][numOfLines]) {

            numOfLines++;
        }
        beginSerial = 0;
        endSerial = GetChangeNum(numOfLines);
        InitColor();
    });
}
