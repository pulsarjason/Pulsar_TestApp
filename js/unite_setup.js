let isEditing = false; // Flag to track if the settings are being edited
let log_read = "";
/**
 * Initializes cloud setup by sending a command to the device.
 *
 * This function sends the "+++" command to start the cloud setup process.
 */
function cloud_setup() {
  sendTX("+++");
  CommandSent = "+++";
}

/**
 * Opens the modal for cloud setup and starts the refresh interval.
 *
 * This function displays the modal and the overlay, hides the operator MCC/MNC container,
 * and begins the refresh of the metrics.
 */
function openCloudModal() {
  document.getElementById("modal_setup").style.display = "block";
  document.getElementById("modalOverlay").style.display = "block";
  document.getElementById("operator-mccmnc-container").classList.add("hidden");
  config_modalUI(0); // Disable the modal UI
  startRefresh();
}

/**
 * Closes the modal for cloud setup and stops the refresh interval.
 *
 * This function hides the modal and overlay, stops the refresh interval,
 * and sends a command to reset the host tunnel.
 */
function closeModal() {
  document.getElementById("modal_setup").style.display = "none";
  document.getElementById("modalOverlay").style.display = "none";
  stopRefresh();
  isEditing = false; // Reset the editing flag
  config_modalUI(0); // Disable the modal UI
  sendTX("host tunnel");
  cloudModal_open = 0;
}

/**
 * Saves the updated settings and validates the input values.
 *
 * This function checks if the user input for various settings (e.g., modem radio mode,
 * node name, APN, report interval, etc.) is valid. If any values have changed,
 * the corresponding commands are sent to the device. A reboot may be required based on
 * certain changes.
 */
async function saveSettings() {
  const selectedRadioMode = document.getElementById("modemRadioMode").value;
  const nodeName = document.getElementById("nodeName").value;
  const reportInterval = document.getElementById("reportInterval").value;
  const apnstring = document.getElementById("modemAPN").value;
  let eDRX = document.getElementById("modemeDRX").value;
  const rebootDelay = document.getElementById("rebootDelay").value;
  const OperatorSelect = document.getElementById("modeOperatorSelect").value;
  const gnssInterval = document.getElementById("GNSSinterval").value;
  const mqttBrokerHostname = document.getElementById("mqttBrokerHostname").value;
  const mqttBrokerPort = document.getElementById("mqttBrokerPort").value;
  const mqttBrokerUsername = document.getElementById("mqttUsername").value;
  const mqttBrokerPassword = document.getElementById("mqttPassword").value;
  const mqttTLS = document.getElementById("mqttTLS").value;
  const mqttTLSSec_tag = document.getElementById("mqttTLSSecTag").value;

  // Validate the report interval
  if (Number(reportInterval) < Number(report_interval_min) || Number(reportInterval) > Number(43200)) {
    alert(lang_map[283] + ` ${report_interval_min} - 43200`);
    return;
  }

  // Validate the APN string length
  if (apnstring.length > 64) {
    alert(lang_map[284]);
    return;
  }

  // Validate GNSS interval
  if (Number(gnssInterval) < 0 || Number(gnssInterval) > 64800) {
    alert(lang_map[285]);
    return;
  }

  // Validate reboot delay
  if (rebootDelay < 0 && rebootDelay >= 240) {
    alert(lang_map[286]);
    return;
  }

  // Construct previous settings object to check changes
  const previousSettings = {
    selectedRadioMode: prevSelectedRadioMode,
    nodeName: prevNodeName,
    reportInterval: prevReportInterval,
    apnstring: prevApnstring,
    eDRX: prevSelectedeDRX,
    rebootDelay: prevrebootDelay,
    OperatorSelect: prevOpSelect,
    gnssInterval: prevgnssInterval,
    mqttBrokerHostname: prevMQTTBrokerHostname,
    mqttBrokerPort: prevMQTTBrokerPort,
    mqttBrokerUsername: prevMQTTBrokerUsername,
    mqttTLS: prevMQTTTLS,
    mqttTLSSec_tag: prevMQTTTLSSec_tag,
  };

  let rebootNeeded = false; // Flag to indicate if a reboot is needed
  let mqttConfigChanged = false; // Flag to indicate if MQTT config has changed

  // Check if modem radio mode has changed
  if (selectedRadioMode !== previousSettings.selectedRadioMode) {
    rebootNeeded = true; // Reboot required
    await sendTX(`modem mode ${selectedRadioMode}`);
    await delay(500);
  }

  // Check if node name has changed
  if (nodeName && String(nodeName) !== String(previousSettings.nodeName)) {
    await sendTX(`node name ${nodeName}`);
    await delay(500);
  }

  // Check if report interval has changed
  if (reportInterval && Number(reportInterval) !== previousSettings.reportInterval) {
    await sendTX(`node report interval ${reportInterval}`);
    await delay(500);
  }

  // Check if APN string has changed
  if (apnstring && apnstring !== previousSettings.apnstring) {
    rebootNeeded = true; // Reboot required
    await sendTX(`modem apn ${apnstring}`);
    await delay(500);
  }

  // Check if eDRX has changed
  if (eDRX === "disable") {
    eDRX = "Disabled";
  } else if (eDRX === "factory_reset") {
    eDRX = "Enabled";
  }
  if (eDRX !== previousSettings.eDRX) {
    if (eDRX === "Enabled") {
      eDRX = "factory_reset";
    } else if (eDRX === "Disabled") {
      eDRX = "disable";
    }
    await sendTX(`modem edrx ${eDRX}`);
    await delay(500);
  }

  // Check if MQTT broker hostname has changed
  if (mqttBrokerHostname && mqttBrokerHostname !== previousSettings.mqttBrokerHostname) {
    mqttConfigChanged = true;
    await sendTX(`mqtt hostname ${mqttBrokerHostname}`);
    await delay(500);
  }

  // Check if MQTT broker port has changed
  if (mqttBrokerPort && mqttBrokerPort !== String(previousSettings.mqttBrokerPort)) {
    mqttConfigChanged = true;
    await sendTX(`mqtt port ${mqttBrokerPort}`);
    await delay(500);
  }

  // Check if MQTT broker username has changed
  if (mqttBrokerUsername && mqttBrokerUsername !== previousSettings.mqttBrokerUsername) {
    mqttConfigChanged = true;
    await sendTX(`mqtt username ${mqttBrokerUsername}`);
    await delay(500);
  }

  // only send the password if it is not hidden (i.e., the user has changed it) and it is not empty
  if (document.getElementById("mqttPassword").style.display !== "none" && mqttBrokerPassword !== "") {
    mqttConfigChanged = true;
    await sendTX(`mqtt password ${mqttBrokerPassword}`);
    await delay(500);
  }

  // Check if MQTT TLS level has changed
  if (mqttTLS && mqttTLS !== previousSettings.mqttTLS) {
    mqttConfigChanged = true;
    await sendTX(`mqtt tls level ${mqttTLS}`);
    await delay(500);
  }

  // Check if MQTT TLS security tag has changed
  if (mqttTLSSec_tag && mqttTLSSec_tag !== previousSettings.mqttTLSSec_tag) {
    mqttConfigChanged = true;
    await sendTX(`mqtt tls sec_tag ${mqttTLSSec_tag}`);
    await delay(500);
  }

  // Check if reboot delay has changed
  if (rebootDelay && Number(rebootDelay) !== previousSettings.rebootDelay) {
    await sendTX(`node reboot delay ${rebootDelay}`);
    await delay(500);
  }

  // Check if operator selection has changed
  if (OperatorSelect && OperatorSelect !== previousSettings.OperatorSelect) {
    await sendTX(`modem operator ${OperatorSelect}`);
    await delay(500);
  }

  // Check if GNSS interval has changed
  if (gnssInterval && Number(gnssInterval) !== previousSettings.gnssInterval) {
    await sendTX(`gnss interval ${gnssInterval}`);
    await delay(500);
    if (Number(gnssInterval) == 0) {
      await sendTX(`gnss stop`);
      await delay(500);
      await sendTX(`gnss priority disable`);
      await delay(500);
    }
  }

  // Handle reboot if needed
  if (rebootNeeded) {
    if (confirm(lang_map[288])) {
      reboot_flag = 1;
      await sendTX("reboot");
      CommandSent = "reboot";
      stopRefresh();
      showLoadingScreen();
      rebootTimeout = setTimeout(() => {
        reboot_flag = 0;
        hideLoadingScreen_fail();
      }, 100000); // Reboot timeout
    } else {
      alert(lang_map[287]);
    }
  }
  CommandSent = "update";
}

/**
 * Sends a command to disable sleep mode.
 *
 * This function disables the sleep mode of the device and updates the CommandSent flag.
 */
function refresh_metrics() {
  sendTX("sleep disable");
  CommandSent = "sleep disable";
}
let intervalId_Refresh;
/**
 * Starts refreshing metrics at regular intervals.
 *
 * This function starts an interval to refresh the metrics every 5 seconds.
 */
function startRefresh() {
  intervalId_Refresh = setInterval(refresh_metrics, 5000); // Start refreshing every 5 seconds
}

/**
 * Stops refreshing metrics.
 *
 * This function stops the interval that was previously started for refreshing metrics.
 */
function stopRefresh() {
  clearInterval(intervalId_Refresh); // Stop the interval using the stored ID
}

/**
 * Displays host report.
 *
 * This function sends a command to show the host report and updates the CommandSent flag.
 */
function hostshow() {
  sendTX("host report show");
  CommandSent = "host report show";
}

/**
 * Toggles the edit mode for settings.
 *
 * This function enables or disables the editing mode for various input fields in the UI.
 * When editing is enabled, the inputs are made editable, and the refresh is stopped.
 * When editing is disabled, the inputs are made readonly, and the refresh is started again.
 */
function edit_metrics() {
  if (isEditing) {
    startRefresh(); // Resume refreshing
    isEditing = false; // If editing was enabled, disable it
    config_modalUI(0); // Disable the modal UI
  } else {
    stopRefresh(); // Stop refreshing
    isEditing = true; // If not editing, enable it
    config_modalUI(1); // Enable the modal UI
  }
}

let clientID = Number(document.getElementById("modemIMEI").value);
/**
 * Sends a command to set the MQTT broker address to Signal Fire.
 *
 * This function sends the "mqtt hostname mosquitto.signal-fire.cloud" command to the device.
 */
function brokeraddress_sf() {
  sendTX("mqtt hostname mosquitto.signal-fire.cloud");
  CommandSent = "mqtt hostname sf";
}

/**
 * Sends a command to set the MQTT broker address to Mission.
 *
 * This function sends the "mqtt hostname 192.168.12.30" command to the device.
 */
function brokeraddress_mission() {
  sendTX("mqtt hostname 192.168.12.30");
  CommandSent = "mqtt hostname mission";
}

/**
 * Sends a command to set the MQTT broker port.
 *
 * This function sends the "mqtt port 1883" command to the device.
 */
function brokerport() {
  sendTX("mqtt port 1883");
  CommandSent = "mqtt port";
}

/**
 * Sends a command to set the MQTT username for Signal Fire.
 *
 * This function sends the "mqtt username pulsar" command to the device.
 */
function username_sf() {
  sendTX("mqtt username pulsar");
  CommandSent = "mqtt username";
}

/**
 * Sends a command to set the MQTT password for Signal Fire.
 *
 * This function sends the "mqtt password signalfire" command to the device.
 */
function password_sf() {
  sendTX("mqtt password signalfire");
  CommandSent = "mqtt password";
}

/**
 * Sends a command to set the MQTT username for Mission.
 *
 * This function sends the "mqtt username" command with the client ID to the device.
 */
function username_mission() {
  sendTX("mqtt username " + clientID);
  CommandSent = "mqtt username";
}

/**
 * Sends a command to set the MQTT password for Mission.
 *
 * This function sends the "mqtt password" command with the reversed client ID to the device.
 */
function password_mission() {
  // Reverse the clientID string
  let reversedClientID = clientID.toString().split("").reverse().join("");
  sendTX("mqtt password " + reversedClientID);
  CommandSent = "mqtt password";
}

/**
 * Sends a command to set the MQTT TLS level.
 *
 * This function sends the "mqtt tls level 0" command to the device.
 */
function mqttTLSLevel() {
  sendTX("mqtt tls level 0");
  CommandSent = "mqtt tls level";
}

/**
 * Sends a command to set the MQTT TLS security tag for Signal Fire.
 *
 * This function sends the "mqtt tls securitytag 1" command to the device.
 */
function mqttTLSSecurityTag_sf() {
  sendTX("mqtt tls securitytag 1");
  CommandSent = "mqtt tls securitytag1"; // factory certificate
}

/**
 * Sends a command to set the MQTT TLS security tag for Mission.
 *
 * This function sends the "mqtt tls securitytag 0" command to the device.
 */
function mqttTLSSecurityTag_mission() {
  sendTX("mqtt tls securitytag 0");
  CommandSent = "mqtt tls securitytag0"; // no certificate
}
/**
 * Sends a command to connect to the MQTT broker.
 *
 * This function sends the "mqtt connect" command to the device and updates the CommandSent flag.
 */
function mqttConnect() {
  sendTX("mqtt connect");
  CommandSent = "mqtt connect";
}
/**
 * Toggles the visibility of the password input field and its label.
 * When the password field is hidden, it will be displayed, and vice versa.
 */
function togglePassword() {
  const passwordField = document.getElementById("mqttPassword");
  const passwordLabel = passwordField.previousElementSibling;

  if (passwordField.style.display === "none") {
    passwordField.style.display = "block";
    passwordLabel.style.display = "block";
  } else {
    passwordField.style.display = "none";
    passwordLabel.style.display = "none";
  }
}
function toggleMQTTConnection() {
  if (document.getElementById("mqttState").value === "CONNECTED") {
    sendTX("mqtt disconnect");
    CommandSent = "mqtt disconnect";
  } else {
    sendTX("mqtt connect");
    CommandSent = "mqtt connect";
  }
}
function config_modalUI(config) {
  const editButton = document.querySelector(".edit-btn");
  const inputsToToggle = [
    document.getElementById("modeOperatorSelect"),
    document.getElementById("modemAPN"),
    document.getElementById("nodeName"),
    document.getElementById("reportInterval"),
    document.getElementById("rebootDelay"),
    document.getElementById("GNSSinterval"),
    document.getElementById("mqttBrokerHostname"),
    document.getElementById("mqttBrokerPort"),
    document.getElementById("mqttUsername"),
    document.getElementById("mqttPassword"),
    document.getElementById("mqttTLS"),
    document.getElementById("mqttTLSSecTag"),
  ];

  const selectsToToggle = [document.getElementById("modemRadioMode"), document.getElementById("modemeDRX")];
  if (config === 1) {
    editButton.style.backgroundColor = "#33B34A"; // Set editing color
    // Enable the password button toggle "PasswordtoggleButton"
    document.getElementById("PasswordtoggleButton").disabled = false;

    // Make all text inputs editable
    inputsToToggle.forEach((input) => input.removeAttribute("readonly"));

    // Enable select elements
    selectsToToggle.forEach((select) => select.removeAttribute("disabled"));
  } else {
    editButton.style.backgroundColor = "#f37021"; // Set default color

    // Disable the password toggle button and hide the password field and its label when editing is disabled
    document.getElementById("PasswordtoggleButton").disabled = true;
    document.getElementById("mqttPassword").style.display = "none";
    document.getElementById("mqttPassword").previousElementSibling.style.display = "none";

    // Make all text inputs readonly
    inputsToToggle.forEach((input) => input.setAttribute("readonly", true));

    // Disable select elements
    selectsToToggle.forEach((select) => select.setAttribute("disabled", true));
  }
}
async function shell_enable() {
  closeModal();
  await delay(500);
  openShellModal();
}
async function openShellModal() {
  document.getElementById("modal_shell").style.display = "block";
  document.getElementById("modalOverlayshell").style.display = "block";
  document.getElementById("shell_textbox").innerHTML = "";
  await delay(500);
  sendTX("+++");
  CommandSent = "shell_open";
  shell_open = 1;
}
async function closeShellModal() {
  document.getElementById("modal_shell").style.display = "none";
  document.getElementById("modalOverlayshell").style.display = "none";
  await delay(500);
  sendTX("host tunnel");
}
const shellTextbox = document.getElementById("shell_textbox");
let inputLocked = false; // Prevent multiple inputs at once

function appendShell(response, toSend = false) {
  const newLine = document.createElement("div");
  if (toSend) {
    newLine.style.color = "#F37021";
  } else {
    response = parseResponse(response).output;
    newLine.style.color = "#33B34A";
  }
  newLine.textContent = response;
  document.getElementById("shell_textbox").appendChild(newLine);
  document.getElementById("shell_textbox").scrollTop = document.getElementById("shell_textbox").scrollHeight;
}

function parseResponse(rawResponse) {
  // Remove all ANSI escape sequences
  const cleaned = rawResponse.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "");

  // Split into segments using prompt as delimiter
  const promptRegex = /[a-zA-Z0-9_-]+:~\$\s*/g;
  const segments = cleaned
    .split(promptRegex)
    .map((s) => s.trim())
    .filter((s) => s !== "");

  const commands = [];
  const outputs = [];
  const timestampRegex = /^\[\d{2}:\d{2}:\d{2}\.\d{3},\d{3}\]/;

  for (const segment of segments) {
    const lines = segment.split("\n").filter((line) => line.trim() !== "");
    if (lines.length === 0) continue;

    if (timestampRegex.test(lines[0])) {
      // System-generated output (starts with timestamp)
      outputs.push(lines.join("\n"));
    } else {
      // User command followed by output
      commands.push(lines[0]);
      if (lines.length > 1) {
        outputs.push(lines.slice(1).join("\n"));
      }
    }
  }
  return {
    commands: commands,
    output: outputs.join("\n"),
  };
}

function shell_textbox_copyText() {
  const textBox = document.getElementById("shell_textbox");
  // Get the text content of the "blTextBox" element (either innerText or textContent)
  const text = textBox.innerText || textBox.textContent;
  // Create a temporary text area to hold the text to be copied
  const textArea = document.createElement("textarea");
  textArea.value = text;
  // Append the text area to the document body to make it selectable
  document.body.appendChild(textArea);
  // Select the content inside the text area
  textArea.select();
  // Execute the copy command to copy the selected text to the clipboard
  document.execCommand("copy");
  // Remove the temporary text area after copying
  document.body.removeChild(textArea);
}
function sendShellCommand() {
  sendTX(document.getElementById("shellInput").value);
  appendShell(document.getElementById("shellInput").value, true);
  CommandSent = "shell_command";
  if (document.getElementById("shellInput").value.includes("log read")) {
    CommandSent = "log_read";
    stop_accum = 0;
    log_read = "";
  }
  document.getElementById("shellInput").value = "";
}
function handleshellInputKeyPress(event) {
  if (event.key === "Enter") {
    event.preventDefault(); // Prevent the default action
    sendShellCommand();
  }
}
// This function is used to store the log read data in a log_read string, this is done because the log_read
// data is too large, and sometimes gets cut off due to concurrent characters coming after 50ms
let stop_accum = 0;
function store_to_log() {
  log_read += receiveBufferASCII;
  if (log_read.includes("End of File")) {
    stop_accum = 1;
    appendShell(log_read);
    log_read = "";
  }
}
