# RFID Attendance System with ESP32 and Firebase

This project implements a web-based RFID attendance system using an ESP32 microcontroller, an MFRC522 RFID reader, and Google Firebase for the backend. It allows users to take attendance by scanning RFID cards, with data being stored and managed in real-time.

## Features

*   **RFID Card Scanning:** Utilizes an MFRC522 RFID reader connected to an ESP32 to capture card UIDs.
*   **Bluetooth Low Energy (BLE) Communication:** The ESP32 transmits scanned UIDs to the web application via BLE.
*   **Firebase Integration:**
    *   **Authentication:** Secure user login using Email/Password and Google Sign-In.
    *   **Realtime Database:** Stores user information, batch details, attendance records, and user permissions.
*   **Web-Based Interface:**
    *   User-friendly dashboard to manage attendance batches.
    *   Real-time display of scanned UIDs and corresponding user data.
    *   View and export attendance data.
*   **Batch Management:** Users can create and manage different attendance batches (e.g., for different classes or events).
*   **User Roles/Permissions:** (Implicit) Users can only access and manage data for batches they are authorized for.

## System Architecture

The system consists of three main components:

1.  **ESP32 RFID Scanner (`hardware.ino`):**
    *   Reads RFID card UIDs using the MFRC522 sensor.
    *   Transmits the UID via Bluetooth Low Energy (BLE) to the web application.
2.  **Web Application (HTML, CSS, JavaScript):**
    *   **Login (`login.html`):** Authenticates users via Firebase.
    *   **Dashboard (`index.html`):** Allows users to select an attendance batch.
    *   **Attendance Taking (`attendance.html`, `app.js`):** Connects to the ESP32 via Web Bluetooth API, receives UIDs, fetches user details from Firebase, and records attendance.
    *   **Attendance Data Viewing (`attendancedata.html`):** Displays and allows fetching of recorded attendance data from Firebase.
3.  **Firebase Backend:**
    *   **Authentication:** Manages user accounts.
    *   **Realtime Database:** Stores all application data, including:
        *   User profiles (name, roll number associated with a UID within a batch).
        *   Attendance records (UID, name, roll, timestamp for each scan within a batch).
        *   User permissions (which batches a user can access).

*(You can refer to `connections.png` for a visual representation of hardware connections if it details the ESP32-MFRC522 setup.)*

## Technologies Used

*   **Hardware:**
    *   ESP32 Development Board
    *   MFRC522 RFID Reader/Writer Module
    *   Connecting Wires
*   **Software (ESP32):**
    *   Arduino IDE
    *   `MFRC522.h` library (for RFID)
    *   `NimBLEDevice.h` library (for BLE communication)
*   **Software (Web Application):**
    *   HTML5
    *   CSS3 (with Font Awesome icons and Google Fonts)
    *   JavaScript (Vanilla JS)
    *   Web Bluetooth API
*   **Backend & Database:**
    *   Google Firebase (Authentication, Realtime Database)

## Prerequisites

*   Arduino IDE installed.
*   ESP32 board support package installed in Arduino IDE.
*   A Google Firebase project.
*   A modern web browser that supports the Web Bluetooth API (e.g., Chrome, Edge, Opera).
*   Basic knowledge of Arduino programming, JavaScript, and Firebase.

## Setup Instructions

### 1. Hardware Setup

1.  **Required Components:**
    *   ESP32 development board
    *   MFRC522 RFID module
    *   Jumper wires
2.  **Connections (ESP32 & MFRC522):**
    *   Connect the MFRC522 to the ESP32 as follows (refer to `hardware.ino` for pin definitions):
        *   **SDA/SS (MFRC522)** to **GPIO 5 (ESP32)** (SS_PIN)
        *   **SCK (MFRC522)** to **GPIO 18 (ESP32)** (Default SPI SCK)
        *   **MOSI (MFRC522)** to **GPIO 23 (ESP32)** (Default SPI MOSI)
        *   **MISO (MFRC522)** to **GPIO 19 (ESP32)** (Default SPI MISO)
        *   **RST (MFRC522)** to **GPIO 22 (ESP32)** (RST_PIN)
        *   **GND (MFRC522)** to **GND (ESP32)**
        *   **3.3V (MFRC522)** to **3.3V (ESP32)**
    *   *(Verify pin numbers if your ESP32 board has different default SPI pins, though the code uses standard SPI.)*
3.  **Flash `hardware.ino` to ESP32:**
    *   Open `hardware.ino` in the Arduino IDE.
    *   Select your ESP32 board from Tools > Board.
    *   Select the correct COM port from Tools > Port.
    *   Install the required libraries:
        *   `MFRC522` by GithubCommunity
        *   `NimBLE-Arduino` by h2zero
        (You can install these via the Arduino Library Manager: Sketch > Include Library > Manage Libraries...)
    *   Click Upload to flash the code to the ESP32.
    *   You can monitor serial output (Baud rate: 115200) to see scanned UIDs or debug messages.

### 2. Firebase Setup

1.  **Create a Firebase Project:**
    *   Go to the [Firebase Console](https://console.firebase.google.com/).
    *   Click "Add project" and follow the on-screen instructions.
2.  **Add a Web App to your Project:**
    *   In your Firebase project dashboard, click on the Web icon (`</>`) to add a new web app.
    *   Register your app (give it a nickname). You don't need Firebase Hosting for this setup if you plan to run it locally.
    *   After registering, Firebase will provide you with a `firebaseConfig` object. **Copy this object.**
3.  **Enable Authentication:**
    *   In the Firebase console, go to "Authentication" (under Build).
    *   Click on the "Sign-in method" tab.
    *   Enable "Email/Password" and "Google" as sign-in providers.
4.  **Set up Realtime Database:**
    *   In the Firebase console, go to "Realtime Database" (under Build).
    *   Click "Create Database."
    *   Choose a location for your database.
    *   Start in **test mode** for initial setup and development (allows open read/write access).
        ```json
        {
          "rules": {
            ".read": true,
            ".write": true
          }
        }
        ```
    *   **Important:** For production, you **must** configure security rules to protect your data (e.g., only authenticated users can write, users can only access their own data).
    *   **Database Structure:** You can use `db.json` as a reference for the initial data structure. You might need to manually create the top-level nodes like `data`, `attendance`, and `users` or let the application create them on first use.
        *   `data/{batchName}/{uid}`: Stores user details (name, roll).
        *   `attendance/{batchName}/{uid}/{timestamp}`: Stores attendance records.
        *   `users/{safeEmail}/batches/{batchName}`: Stores boolean `true` if the user (identified by their email with '.' replaced by ',') has access to `batchName`.

5.  **Update Firebase Configuration in HTML Files:**
    *   Open the following HTML files:
        *   `attendance.html`
        *   `attendancedata.html`
        *   `index.html`
        *   `login.html`
    *   In each file, find the `firebaseConfig` JavaScript object:
    *   Put the firebaseConfig values from the Firebase Project.

### 3. Web Application Setup

1.  **Accessing the Web Pages:**
    *   Since the web application uses JavaScript modules and makes API calls (like Web Bluetooth), you need to serve the files through a web server. Simply opening the `index.html` file directly from your file system (`file:///...`) might not work correctly due to browser security restrictions.
    *   **Using a Simple HTTP Server (for local development):**
        *   If you have Python installed, navigate to the project directory in your terminal and run:
            *   Python 3: `python -m http.server`
            *   Python 2: `python -m SimpleHTTPServer`
        *   Then open your browser and go to `http://localhost:8000` (or the port shown by the server).
        *   Alternatively, use other tools like Node.js `http-server` (`npx http-server`) or the Live Server extension in VS Code.
2.  **Browser Compatibility:**
    *   Ensure you are using a modern web browser that supports the Web Bluetooth API (e.g., Chrome, Edge on Windows/Mac/Linux/Android). Safari and Firefox do not fully support Web Bluetooth at the time of writing.

## Usage

1.  **Login:**
    *   Open `login.html` (or `index.html`, which will redirect to login if not authenticated).
    *   Log in using your email/password or Google account that you've configured in Firebase and potentially given batch access to in the database.
2.  **Dashboard (`index.html`):**
    *   After logging in, you'll see the dashboard.
    *   It will display buttons for the batches your account has access to (configured in Firebase under `users/{safeEmail}/batches`).
3.  **Start Attendance Session (`attendance.html`):**
    *   Click on a batch button from the dashboard. This will take you to `attendance.html` and set the selected batch.
    *   Click the "Connect Scanner" button. A browser pop-up will appear asking you to pair with a Bluetooth device.
    *   Select your ESP32 device (usually named "ESP32-RFID" as per `hardware.ino`).
    *   Once connected, the status will update.
    *   Scan RFID cards using the MFRC522 reader. The UID will appear, and the system will fetch user data (name, class/roll) from Firebase for that UID within the selected batch. Attendance will be recorded automatically.
    *   Recent scans are displayed on this page.
4.  **View Attendance Data (`attendancedata.html`):**
    *   Navigate to `attendancedata.html` (link available on the dashboard).
    *   Select a batch from the dropdown (only batches you have access to will be listed).
    *   Click "Fetch Data" to see a table of all attendance records for that batch.

## Project Structure

```
.
├── README.md               // This file
├── app.js                  // Core JavaScript for attendance.html (BLE, Firebase interaction)
├── attendance.html         // Page for taking attendance
├── attendancedata.html     // Page for viewing attendance records
├── connections.png         // (Assumed) Diagram of hardware connections
├── db.json                 // Example Firebase Realtime Database structure
├── favicon.ico             // Website icon
├── hardware.ino            // Arduino code for the ESP32 RFID scanner
├── index.html              // Dashboard page, shows accessible batches
├── login.html              // User login page
└── style.css               // Main CSS styles for all pages
```

## Contributing

Contributions are welcome! If you have suggestions or improvements, please feel free to fork the repository, make your changes, and submit a pull request.


---

Made with ❤️ by Team Four - Build Club
