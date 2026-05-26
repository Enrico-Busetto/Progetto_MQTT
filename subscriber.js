const client = mqtt.connect('ws://127.0.0.1:9001/mqtt');

document.addEventListener('DOMContentLoaded', (event) => {
    client.on('connect', (event) => console.log("Subscriber connesso al Broker!"));

    document.getElementById('btnSub').addEventListener('click', () => {
        const topic = document.getElementById('topicSub').value;
        if(topic != "") {
            client.subscribe(topic);
            console.log("Iscritto a:", topic);
        }
        else{
            alert("Topic vuoto devi inserirlo!!!");
        }

    });

    client.on('message', (topic, message) => {
        const div = document.getElementById('ricezione');
        div.innerHTML += `<p><b>${topic}:</b> ${message.toString()}</p>`;
        console.log(`Ricevuto su ${topic}: ${message.toString()}`);
    });
    
});