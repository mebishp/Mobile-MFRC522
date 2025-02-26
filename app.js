let device;
let characteristic;

async function connectBLE() {
    try {
        console.log("Requesting Bluetooth device...");
        device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ["0000181c-0000-1000-8000-00805f9b34fb"]
        });

        device.addEventListener('gattserverdisconnected', onDisconnected);

        console.log("Connecting to GATT Server...");
        const server = await device.gatt.connect();
        
        console.log("Getting Service...");
        const service = await server.getPrimaryService("0000181c-0000-1000-8000-00805f9b34fb");

        console.log("Getting Characteristic...");
        characteristic = await service.getCharacteristic("00002a99-0000-1000-8000-00805f9b34fb");

        // Enable notifications
        await characteristic.startNotifications();
        characteristic.addEventListener("characteristicvaluechanged", handleNotifications);

        document.getElementById("connection-status").innerText = "Connection Status: Connected (" + device.name + ")";
        console.log("Connected!");
    } catch (error) {
        console.error("Connection failed:", error);
        document.getElementById("connection-status").innerText = "Connection Status: Connection failed";
    }
}

function handleNotifications(event) {
    let value = new TextDecoder().decode(event.target.value);
    value = value.toUpperCase();
    document.getElementById("uid").innerText = value;
    console.log("New UID:", value);
}

function onDisconnected() {
    document.getElementById("connection-status").innerText = "Connection Status: Disconnected";
    console.log("Device disconnected");
}
