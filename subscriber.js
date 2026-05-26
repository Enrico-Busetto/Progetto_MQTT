const client = mqtt.connect('ws://127.0.0.1:9001/mqtt');

let lista_prep = [];
let lista_finito = [];

document.addEventListener('DOMContentLoaded', (event) => {
    client.on('connect', (event) => console.log("Subscriber connesso al Broker!"));


    setInterval(() => operazioneFinita(),7000);
    
    function operazioneFinita(){
        if(lista_prep.length > 0){
            console.log("Sono entrato");
            lista_finito.push(lista_prep.shift());
            console.log(lista_prep);
            console.log(lista_finito);
            caricaListaFinito();
            caricaListaPrep();
        }
    }

    document.getElementById('btnSub').addEventListener('click', (event) => {
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
        const nuovoElemento = {
            topic: topic,
            message: message.toString()
        };

        lista_prep.push(nuovoElemento);
        caricaListaPrep();
    });
});

function caricaListaPrep(){
    const sezione = document.getElementById("listaPrep");
    sezione.innerHTML = "";
    let contenutoTemporaneo = "";

    for (let i = 0; i < lista_prep.length; i++) {
        contenutoTemporaneo += `<p><b>${lista_prep[i].topic}:</b> ${lista_prep[i].message}</p>`;
    }

    sezione.innerHTML += contenutoTemporaneo;     
}

function caricaListaFinito(){
    const sezione = document.getElementById("listaFinito");
    sezione.innerHTML = "";
    let contenutoTemporaneo = "";

    for (let i = 0; i < lista_finito.length; i++) {
        contenutoTemporaneo += `<p><b>${lista_finito[i].topic}:</b> ${lista_finito[i].message}</p>`;
    }
    sezione.innerHTML += contenutoTemporaneo;
}