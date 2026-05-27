const client = mqtt.connect('ws://127.0.0.1:9001/mqtt');

let lista_prep = [];
let lista_finito = [];
let tempo_random = generaTempoRandomico();

document.addEventListener('DOMContentLoaded', () => {
    client.on('connect', () => console.log("Subscriber connesso al Broker!"));

    // Cambio dei procesi da una lista all altra
    setInterval(() => {
        if(lista_prep.length > 0) {
            lista_finito.push(lista_prep.shift());
            renderLists();
            tempo_random = generaTempoRandomico();
        }
    },tempo_random);

    // Gestione Iscrizione
    document.getElementById('btnSub').addEventListener('click', () => {
        const topic = document.getElementById('topicSub').value;
        if(topic) {
            client.subscribe(topic);
            console.log("Iscritto a:", topic);
        } else {
            alert("Inserisci un topic!");
        }
    });

    // Ricezione Messaggi
    client.on('message', (topic, message) => {
        lista_prep.push({ topic, message: message.toString() });
        renderLists();
    });
});

//Carica le 2 liste in preparazione e processo finito . 
function renderLists() {
    const sectionPrep = document.getElementById("listaPrep");
    const sectionFinito = document.getElementById("listaFinito");

    sectionPrep.innerHTML = lista_prep.map(item => 
        `<p><b>${item.topic}:</b> ${item.message}</p>`).join('');
    
    sectionFinito.innerHTML = lista_finito.map(item => 
        `<p><b>${item.topic}:</b> ${item.message}</p>`).join('');
}

function generaTempoRandomico(){
    return (Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000);
}