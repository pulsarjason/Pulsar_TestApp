let testmodalopen = 0;
let sensorAlwaysOn1 = false;

function testmodal_open() {
  document.getElementById("id_testmodal").style.display = "block";
  document.getElementById("id_testmodal_overlay").style.display = "block";
  // Set the same footer for copyright
  document.getElementById("id_testmodal_copyright_label").innerHTML = document.getElementById("copyright-label").innerHTML;
  testmodalopen = 1;
}

function testmodal_close() {
  document.getElementById("id_testmodal").style.display = "none";
  document.getElementById("id_testmodal_overlay").style.display = "none";
  testmodalopen = 0;
}

function testmodal_add() {
  // Get number from inputbox 3
  let number1 = document.getElementById("id_testmodal_inputbox1_text").value;
  let number2 = document.getElementById("id_testmodal_inputbox2_text").value;

  // Check if it is a valid number
  if (isNaN(number1)) {
    // Not a number
    alert(`Error: Inputbox1 - Invalid\n`);
    return;
  }

  if (number1 < 1 || number1 > 100) {
    alert(`Error: Inputbox1 - Out of range\n`);
    return;
  }

  // Check if it is a valid number
  if (isNaN(number2)) {
    // Not a number
    alert(`Error: Inputbox2 - Invalid\n`);
    return;
  }

  let number = Number(number1) + Number(number2);

  // Set number to inputbox 1
  document.getElementById("id_testmodal_inputbox3_text").value = number;
}

function testmodal_action1() {
  let CellType = document.getElementById("CellType").value;
  let modemRadioMode_batt = document.getElementById("modemRadioMode_batt").value;
  let reportInterval_batt = document.getElementById("reportInterval_batt").value;
  let SensorSampleInterval = document.getElementById("SensorSampleInterval").value;
  let GPSUpdateInterval = document.getElementById("GPSUpdateInterval").value;
  let AvgSensorCurrent = document.getElementById("AvgSensorCurrent").value;
  let BattEst = document.getElementById("BattEst").value;
  let AvgCurrent = document.getElementById("AvgCurrent").value;
  let SensorOnTime;
  if (sensorAlwaysOn) {
    SensorOnTime = -1;
  } else {
    SensorOnTime = document.getElementById("SensorOnTime").value;
  }

  alert(
    `Cell Type: ${CellType}\n` +
      `Modem Radio Mode: ${modemRadioMode_batt}\n` +
      `Report Interval: ${reportInterval_batt}\n` +
      `Sensor Sample Interval: ${SensorSampleInterval}\n` +
      `Sensor On Time: ${SensorOnTime}\n` +
      `GPS Update Interval: ${GPSUpdateInterval}\n` +
      `Average Sensor Current: ${AvgSensorCurrent}\n` +
      `Battery Estimate: ${BattEst}\n` +
      `Average Current: ${AvgCurrent}`
  );
}

/*
// Directly add listener here
document.getElementById("SensorOnTime-checkbox").addEventListener("change", function () {
  if (this.checked) {
    document.getElementById("SensorOnTime").readOnly = true;
    sensorAlwaysOn = true;
  } else {
    document.getElementById("SensorOnTime").readOnly = false;
    sensorAlwaysOn = false;
  }
});
*/

function testmodal_onchange() {
  if (document.getElementById("SensorOnTime-checkbox").checked) {
    document.getElementById("SensorOnTime").readOnly = true;
    sensorAlwaysOn = true;
  } else {
    document.getElementById("SensorOnTime").readOnly = false;
    sensorAlwaysOn = false;
  }
}

function create_csv() {
  let csvFilePath = "lang1.csv";

  // Step 3: Write to CSV
  const writer = new FileWriter(csvFilePath);
  {
    // Write header
    let header = "Index,English,German";
    writer.writeNext(header);

    // Write data
    for (let i = 0; i < lang_array.length(); i++) {
      //JSONObject obj = jsonArray.getJSONObject(i);
      var data = i + "," + slang_array[i].English + "," + lang_array[i].German;
      writer.writeNext(data);
    }

    System.out.println("CSV file was written successfully");
  }
}
