const client = mqtt.connect('ws://broker.hivemq.com:8000/mqtt');

// Usiamo una variabile di stato per sapere se siamo connessi
let isConnected = false;

client.on('connect', () => {
    console.log("Connessione stabilita con successo!");
    isConnected = true;
});

document.getElementById('pubBtn').addEventListener('click', () => {
    if (!isConnected) {
        alert("Aspetta un secondo, il client si sta connettendo...");
        return;
    }
    const topic = document.getElementById('topic').value;
    const msg = document.getElementById('msg').value;
    client.publish(topic, msg);
});
