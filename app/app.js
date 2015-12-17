// JavaScript code for the BLE Scan example app.
Phoenix = require('phoenix')

// Application object.
var app = {};

// Device list.
app.devices = {};

// UI methods.
app.ui = {};

// Timer that updates the device list and removes inactive
// devices in case no devices are found by scan.
app.ui.updateTimer = null;

app.initialize = function()
{
	document.addEventListener(
		'deviceready',
		function() { evothings.scriptsLoaded(app.onDeviceReady) },
		false);
};

app.onDeviceReady = function()
{
	// Here you can update the UI to say that
	// the device (the phone/tablet) is ready
	// to use BLE and other Cordova functions.
	console.log("Creating Phoenix socket...");

	// For this example I hard coded the host and port of my Phoenix application
	var socket = new Phoenix.Socket("wss://padme.krampe.se:1443/socket",
	                                { params: { token: "dummy" } })

	// Nice with some logging in the Workbench when trying it all out
	socket.onError(function (err) {
	  console.log("Error Phoenix channel: "+JSON.stringify(err)
	)});
	socket.onClose(function () {
	  console.log("Closed Phoenix channel")
	});
	console.log("Connecting...");
	socket.connect();

	// Now that we are connected we can join a channel with a topic.
	// Let's join the topic 'scan:public'
	app.channel = socket.channel("scan:public", {});
	console.log("Joining...");
	app.channel.join().receive("ok", function (resp) {
	  console.log("Joined successfully");
	}).receive("error", function (resp) {
	  console.log("Unable to join");
	});

	// Also register a handler for added devices
	app.channel.on("scan:device", function (msg) {
	  app.phoenixReceive(msg);
	});

	// And start updating list
	app.ui.updateTimer = setInterval(app.ui.displayDeviceList, 500);
};

// Start the scan. Call the callback function when a device is found.
// Format:
//   callbackFun(deviceInfo, errorCode)
//   deviceInfo: address, rssi, name
//   errorCode: String
app.startScan = function(callbackFun)
{
	app.stopScan();

	evothings.ble.startScan(
		function(device)
		{
			// Report success. Sometimes an RSSI of +127 is reported.
			// We filter out these values here.
			if (device.rssi <= 0)
			{
				callbackFun(device, null);
			}
		},
		function(errorCode)
		{
			// Report error.
			callbackFun(null, errorCode);
		}
	);
};

// Called when we get a device from Phoenix
app.phoenixReceive = function(msg)
{
	// Insert the device into table of found devices.
	var device = JSON.parse(msg.body);
	app.devices[device.address] = device;
};

// Send a device back to Phoenix
app.phoenixSend = function(device)
{
	app.channel.push("scan:device", {
    user: "Arne",
    body: device
  });
};

// Stop scanning for devices.
app.stopScan = function()
{
	evothings.ble.stopScan();
};

// Called when Start Scan button is selected.
app.ui.onStartScanButton = function()
{
	app.startScan(app.ui.deviceFound);
	app.ui.displayStatus('Scanning...');
};

// Called when Stop Scan button is selected.
app.ui.onStopScanButton = function()
{
	app.stopScan();
	app.devices = {};
	app.ui.displayStatus('Scan Paused');
	app.ui.displayDeviceList();
};

// Called when a device is found.
app.ui.deviceFound = function(device, errorCode)
{
	if (device)
	{
		// Set timestamp for device, this is used to remove inactive devices.
		device.timeStamp = Date.now();

		// Report device to Phoenix backend.
		app.phoenixSend(JSON.stringify(device));
	}
	else if (errorCode)
	{
		app.ui.displayStatus('Scan Error: ' + errorCode);
	}
};

// Display the device list.
app.ui.displayDeviceList = function()
{
	// Clear device list.
	$('#found-devices').empty();

	var timeNow = Date.now();

	$.each(app.devices, function(key, device)
	{
		// Only show devices that are updated during the last 10 seconds.
		if (device.timeStamp + 10000 > timeNow)
		{
			// Map the RSSI value to a width in percent for the indicator.
			var rssiWidth = 100; // Used when RSSI is zero or greater.
			if (device.rssi < -100) { rssiWidth = 0; }
			else if (device.rssi < 0) { rssiWidth = 100 + device.rssi; }

			// Create tag for device data.
			var element = $(
				'<li>'
				+	'<strong>' + device.name + '</strong><br />'
				// Do not show address on iOS since it can be confused
				// with an iBeacon UUID.
				+	(evothings.os.isIOS() ? '' : device.address + '<br />')
				+	device.rssi + '<br />'
				+ 	'<div style="background:rgb(225,0,0);height:20px;width:'
				+ 		rssiWidth + '%;"></div>'
				+ '</li>'
			);

			$('#found-devices').append(element);
		}
	});
};

// Display a status message
app.ui.displayStatus = function(message)
{
	$('#scan-status').html(message);
};

app.initialize();
