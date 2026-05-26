const client = mqtt.connect('ws://127.0.0.1:9001/mqtt');

document.addEventListener('DOMContentLoaded', (event) => {
    client.on('connect', (event) => console.log("Publisher connesso al Broker!"));

    document.getElementById('btnPub').addEventListener('click', (event) => {
        const topic = document.getElementById('topic').value;
        const msg = document.getElementById('msg').value;

        if (client.connected) {
            if(topic != "" && msg !=""){
                client.publish(topic, msg);
                console.log(`Inviato: ${msg} su ${topic}`);
            }

            else if(msg == "" && topic == ""){
                alert("Topic vuoto e Messaggio vuoto !!!");
            }
            else if(topic ==""){
                alert("Topic vuoto !!!");
            }
            else{
                alert("Messaggio vuoto !!!");
            }

        } else {
            alert("Non sei ancora connesso al broker!");
        }
    });
});