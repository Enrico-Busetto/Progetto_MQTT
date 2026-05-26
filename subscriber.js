const client = mqtt.connect('ws://broker.hivemq.com:8000/mqtt');

client.on('connect', () => {
    console.log("Connesso al broker, pronto per l'iscrizione.");
});

document.getElementById('subBtn').addEventListener('click', () => {
    const topic = document.getElementById('subTopic').value;
    
    // Controlliamo se siamo connessi prima di iscriverci
    if (client.connected) {
        client.subscribe(topic);
        console.log("Iscritto a: " + topic);
    } else {
        alert("Errore: non sei ancora connesso al broker.");
    }
});
