const client = mqtt.connect('ws://127.0.0.1:9001/mqtt');

let lista_prep = [];
let lista_finito = [];
let tempo_random = generaTempoRandomico();

document.addEventListener('DOMContentLoaded', () => {
    client.on('connect', () => console.log("Subscriber connesso al Broker!"));
    client.subscribe("Ordini");

    //Ricezione messaggi
    client.on('message', (topic, message) => {
        const msg = JSON.parse(message.toString());
        lista_prep.push(msg);
        renderLists();

        // Cambio dei procesi da una lista all altra
        setTimeout(() => {
        if(lista_prep.length > 0) {
            console.log(tempo_random);
            lista_finito.push(lista_prep.shift());
            renderLists();
            mandaOrdineFinito();
            tempo_random = generaTempoRandomico();
        }
        },tempo_random);

    });
});


function mandaOrdineFinito(){
    console.log(lista_finito[lista_finito.length -1 ].id);
    let str = JSON.stringify(lista_finito[lista_finito.length - 1]);
    console.log("Sto mandando l'ordine finito");
    client.publish("Finito", str);
}

//Carica le 2 liste in preparazione e processo finito . 
function renderLists() {
    const sectionPrep = document.getElementById("listaPrep");
    const sectionFinito = document.getElementById("listaFinito");

    let str_prep = creaContenuto(lista_prep);
    let str_finito = creaContenuto(lista_finito);
    
    
    sectionPrep.innerHTML = str_prep;

    sectionFinito.innerHTML = str_finito;
}

function creaContenuto(lista){
    let str="";
    for(let i=0; i<lista.length; i++){
        str += `<div class="ordine-box">`;
        str += `<h3>Ordine numero: ${lista[i].id}</h3>`;
        
        
        str += "<p>Prodotti: ";
        for (let j = 0; j < lista[i].prodotti.length; j++) {
            str += lista[i].prodotti[j].quantita+" X ";
            str += lista[i].prodotti[j].nome;

            if (j < lista[i].prodotti.length - 1) {
                str += ", ";
            }
        }
        str += "</p>";

        
        str += `</div>`;
    }
    return str;
}

function generaTempoRandomico(){
    return (Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000);
}