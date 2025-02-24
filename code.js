        class BluetoothTerminal {
            constructor() {
                this.device = null;
                this.characteristic = null;
                this.decoder = new TextDecoder();
                this.encoder = new TextEncoder();
                
                // DOM elements
                this.connectBtn = document.getElementById('connectBtn');
                this.disconnectBtn = document.getElementById('disconnectBtn');
                this.clearBtn = document.getElementById('clearBtn');
                this.terminal = document.getElementById('terminal');
                this.messageInput = document.getElementById('messageInput');
                this.sendBtn = document.getElementById('sendBtn');
                this.statusBar = document.getElementById('statusBar');

                // Bind event listeners
                this.connectBtn.addEventListener('click', () => this.connect());
                this.disconnectBtn.addEventListener('click', () => this.disconnect());
                this.clearBtn.addEventListener('click', () => this.clearTerminal());
                this.sendBtn.addEventListener('click', () => this.sendMessage());
                this.messageInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.sendMessage();
                });
            }

            async connect() {
                try {
                    // Request device with Serial Port UUID
                    this.device = await navigator.bluetooth.requestDevice({
                        filters: [{ services: ['0000fff0-0000-1000-8000-00805f9b34fb'] }]
                    });

                    this.log('Connecting to device...');
                    const server = await this.device.gatt.connect();

                    const service = await server.getPrimaryService('0000fff0-0000-1000-8000-00805f9b34fb');
                    this.characteristic = await service.getCharacteristic('0000fff1-0000-1000-8000-00805f9b34fb');

                    // Enable notifications
                    await this.characteristic.startNotifications();
                    this.characteristic.addEventListener('characteristicvaluechanged',
                        (event) => this.handleNotification(event));

                    this.updateConnectionStatus(true);
                    this.log('Connected successfully!');
                } catch (error) {
                    this.log('Error: ' + error);
                    this.updateConnectionStatus(false);
                }
            }

            async disconnect() {
                if (this.device && this.device.gatt.connected) {
                    await this.device.gatt.disconnect();
                }
                this.updateConnectionStatus(false);
                this.log('Disconnected');
            }

            async sendMessage() {
                if (!this.characteristic) return;

                const message = this.messageInput.value;
                if (!message) return;

                try {
                    await this.characteristic.writeValue(this.encoder.encode(message + '\n'));
                    this.log(`Sent: ${message}`);
                    this.messageInput.value = '';
                } catch (error) {
                    this.log('Error sending message: ' + error);
                }
            }

            handleNotification(event) {
                const value = this.decoder.decode(event.target.value);
                this.log(`Received: ${value}`);
            }

            log(message) {
                const line = document.createElement('div');
                line.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
                this.terminal.appendChild(line);
                this.terminal.scrollTop = this.terminal.scrollHeight;
            }

            clearTerminal() {
                this.terminal.innerHTML = '';
            }

            updateConnectionStatus(connected) {
                this.statusBar.className = `status ${connected ? 'connected' : 'disconnected'}`;
                this.statusBar.textContent = connected ? 'Connected' : 'Not connected';
                
                this.connectBtn.disabled = connected;
                this.disconnectBtn.disabled = !connected;
                this.messageInput.disabled = !connected;
                this.sendBtn.disabled = !connected;
            }
        }

        // Initialize the terminal when the page loads
        window.addEventListener('load', () => {
            if (!navigator.bluetooth) {
                alert('Web Bluetooth API is not available in your browser!');
                return;
            }
            new BluetoothTerminal();
        });
    
