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
function onDisconnected() {
    document.getElementById("connection-status").innerText = "Connection Status: Disconnected";
    console.log("Device disconnected");
}
function handleNotifications(event) {
    let value = new TextDecoder().decode(event.target.value);
    document.getElementById("uid").innerText = value;
    console.log("New UID:", value);

    fetchUserData(value); // Call the new fetchUserData function
}

function fetchUserData(uid) {
    const batch = localStorage.getItem("batch");
    console.log("Batch from localStorage:", batch);
    const userRef = database.ref(`data/${batch}/${uid}`);    
    console.log("Firebase Ref:", userRef.toString()); // <--- Very Important!

    if (typeof database === 'undefined') {
        console.error("Firebase database is not initialized!");
        document.getElementById("userData").innerHTML = "Firebase not initialized.";
        return;
    }

    userRef.on("value", (snapshot) => {
        const userData = snapshot.val();
        console.log("User Data:", userData); // <--- Inspect the entire object!

        if (userData) {
            const name = userData.name;
            const className = userData.roll;  // Corrected! Assuming "roll" is the class
            console.log("Name:", name);
            console.log("Class:", className);
            document.getElementById("userData").innerHTML = `Name: ${name}, Class: ${className}`;
            const now = new Date();
            const hh = String(now.getHours()).padStart(2, '0');
            const mm = String(now.getMinutes()).padStart(2, '0');
            const dd = String(now.getDate()).padStart(2, '0');
            const MM = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
            const yy = String(now.getFullYear()).slice(2);
            const attendanceKey = `${hh}${mm}${dd}${MM}${yy}`;

            // Create a reference to the attendance data
            const attendanceRef = database.ref(`attendance/${batch}/${uid}/${attendanceKey}`);

            // Set the attendance data
            attendanceRef.set({
                name: name,
                roll: className
            })
            .then(() => {
                console.log("Attendance data saved successfully!");
            })
            .catch((error) => {
                console.error("Error saving attendance data:", error);
            });

        } else {
            document.getElementById("userData").innerHTML = "User not found.";
        }
    });
}

