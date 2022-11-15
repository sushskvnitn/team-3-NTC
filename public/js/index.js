let quarter = [[],["Jan","Feb","Mar"],["Apr","May","Jun"],["Jul","Aug","Sep"],["Oct","Nov","Dec"]];
let currID_code = {};

async function getCurr() {
  const response = await fetch("/json_data/2022.json");
  const data = await response.json();
  let optionList1 = document.getElementById("curr-1").options;
  let optionList2 = document.getElementById("curr-2").options;
  
  let currIDs = Object.keys(data[0]);
  currIDs.shift();
  var regExp = /\(([^)]+)\)/;
  for (let i = 1; i <= currIDs.length; i++) {
    var matches = regExp.exec(currIDs[i - 1]);
    currID_code[currIDs[i-1]] = matches[1];
    optionList1.add(new Option(matches[1], currIDs[i - 1]));
    optionList2.add(new Option(matches[1], currIDs[i - 1]));
  }
  optionList1[optionList1.length-2].selected = true;
  optionList2[11].selected = true;
}
getCurr();  

async function conversion(amt, currId1, year, month, day){
  
  const response = await fetch("/json_data/"+year.toString()+".json");
  const data = await response.json();
  let currIDs = Object.keys(data[0]);
  currIDs.shift();
  let conversions = [];
  let date = day+"-"+month+"-"+year.toString().substring(2,4);
  for (obj of data) {
    var curDate = obj["Date"].toString();
    if(curDate === date){
      for(cc in obj){
        var text = amt+" "+currID_code[currId1]+"/"+currID_code[cc]+" = ERROR : Data Not Available";
        if(currID_code[cc] !== obj[currId1]){
          if (obj[currId1].length != 0 && obj[cc].length != 0){
            let val1 = parseFloat(obj[currId1]);
            let val2 = parseFloat(obj[cc]);
            let mult = parseFloat(amt);
            let val = (val2/val1)*mult;
            text = amt+" "+currID_code[currId1]+"/"+currID_code[cc]+" = " + val.toFixed(5);
          }   
          if(currID_code[cc] != undefined) { 
            conversions.push(text);
          }
        }
      }
    }
  }
  console.log(conversions);
  document.getElementById("converse").innerHTML="";
  for(s of conversions){
    console.log(s);
    document.getElementById("converse").innerHTML+="<hr>"+s;
  }
}

async function chartItP(currId1, currId2, year, month, day, duration, xlabel, sf,method) {
  let priceData = await getDataP(currId1, currId2, year, month, day, duration);
  let chart = new CanvasJS.Chart("myChart", {
    animationEnabled: true,
    animationDuration: 700,
    title:{
      text: "Currency Exchange graph",
      fontColor: "red",
      fontFamily: "Arial, sans-serif",
      fontWeight: "bold",
      fontSize: 20,
      padding: 10
    },
    axisX: {
      title: "Date",
      interval: 1,
      intervalType: xlabel,
      valueFormatString: sf,
      titleFontFamily: "Arial, sans-serif"
    },
    axisY: {
      title: document.getElementById("curr-2").value,
      gridThickness: 0.2,
      titleFontFamily: "Arial, sans-serif"
    },
    data: [
      {
        type: method,
        dataPoints: priceData,
      },
    ],
  });
  chart.render();
}

async function getDataP(currId1, currId2, year, month, day, duration) {
   let xlabels = [];
  let yOutput = [];
  let priceData = [];
  const response = await fetch("/json_data/"+year.toString()+".json");
  const data = await response.json();
  let jsondata = [];
  let monthly = [];
  let quarterly = ["Jan", "Apr", "Jul", "Oct"];
  let cnt = 0;
  var dmin, dmax;
  var min = 10000000, max = 0;

  for (obj of data) {
    var regExp = /\-([^)]+)\-/;
    var matches = regExp.exec(obj.Date);

    if(duration === 1){
      if (obj[currId1].length != 0 && obj[currId2].length != 0) jsondata.push(obj);
    }else if(duration === 7){
      cnt++;
      cnt%=7;
      if (obj[currId1].length != 0 && obj[currId2].length != 0 && cnt === 1){
         jsondata.push(obj);      
      }
    }else if(duration === 12 || duration === 95){
      if (obj[currId1].length != 0 && obj[currId2].length != 0 && !monthly.includes(matches[1])){
        monthly.push(matches[1]);
        if(duration === 12) jsondata.push(obj);
        else{
          if(quarterly.includes(matches[1])) jsondata.push(obj);
        }         
      }  
    }else if(duration === 30){ 
      if (obj[currId1].length != 0 && obj[currId2].length != 0 && matches[1] === month.toString()) jsondata.push(obj);
    }else if(duration > 90 && duration < 95){
      let id = duration-90;
      if (obj[currId1].length != 0 && obj[currId2].length != 0 && quarter[id].includes(matches[1])) jsondata.push(obj);

    }else if(duration === 360){
      if (obj[currId1].length != 0 && obj[currId2].length != 0) jsondata.push(obj);
    }
  }
  cnt = 1;
  for (ele of jsondata) {
    let date = new Date(ele["Date"]);
    let val1 = parseFloat(ele[currId1]);
    let val2 = parseFloat(ele[currId2]);
    let val = (val2/val1);
    priceData.push({ x: date, y: val});
    xlabels.push(date);
    yOutput.push(val);
    if (val >= max) {
      max = val;
      dmax = date;
    }
    if (val <= min) {
      min = val;
      dmin = date;
    }
    cnt++;
  }
  dmax = dmax.toString().substring(8, 10) + "-" + dmax.toString().substring(4, 7) + "-" + dmax.toString().substring(11, 15);
  dmin = dmin.toString().substring(8, 10) + "-" + dmin.toString().substring(4, 7) + "-" + dmin.toString().substring(11, 15);
  document.getElementById("c1").innerHTML = max.toFixed(5) + " " + currID_code[currId2] + "<br>" + dmax;
  document.getElementById("c2").innerHTML = min.toFixed(5) + " " + currID_code[currId2] + "<br>" + dmin;
  return priceData;

}

function chartChange() {
    document.querySelectorAll(".btn-check").forEach((button)=> {
    let check = button.checked;
    if(check) {
      let type = button.value;
      let currId1 = document.getElementById('curr-1').value;
      let currId2 = document.getElementById('curr-2').value;
      let year = document.getElementById('year').value;
      let month = document.getElementById('month').value;
      let day = document.getElementById('day').value;
      let amt = document.getElementById('takeInp').value;
      let method = document.getElementById('changegraph').value;
      console.log(method);
      switch(type){
        case "weekly":
          chartItP(currId1, currId2, year, month, day, 7, "month", "MMM",method);
        break;

        case "quarterly":
          chartItP(currId1, currId2, year, month, day, 95, "month", "MMM",method);
        break;

        case "monthly":
          chartItP(currId1, currId2, year, month, day, 12, "month", "MMM",method);
        break;

        case "yearly":
          chartItP(currId1, currId2, year, month, day, 360, "month", "MMM",method);
        break;
      }
    }
    })
}

function currConvert() {
  let currId1 = document.getElementById('curr-1').value;
  let year = document.getElementById('year').value;
  let month = document.getElementById('month').value;
  let day = document.getElementById('day').value;
  let amt = document.getElementById('takeInp').value;
  
  conversion(amt, currId1, year, month, day);
}

function toggleChart() {
  document.getElementById('tab1').style.display = 'flex';
  document.getElementById('tab2').style.display = 'none';
  document.getElementById('btn-grp').style.display = "flex";
  document.getElementById('foot').style.display = "block";
  document.getElementById('toID').style.display = "block";
}

