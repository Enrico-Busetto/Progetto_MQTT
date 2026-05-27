const client = mqtt.connect('ws://127.0.0.1:9001/mqtt');

let lista_prep = [];
let lista_finito = [];
let tempo_random = generaTempoRandomico();

document.addEventListener('DOMContentLoaded', () => {
    client.on('connect', () => console.log("Subscriber connesso al Broker!"));
    client.subscribe("Ordini");

    // Cambio dei procesi da una lista all altra
/*
    setInterval(() => {
        if(lista_prep.length > 0) {
            lista_finito.push(lista_prep.shift());
            renderLists();
            tempo_random = generaTempoRandomico();
        }
    },tempo_random);
*/

    // Ricezione Messaggi
    client.on('message', (topic, message) => {
        const msg = JSON.parse(message.toString());
        lista_prep.push(msg);
        renderLists();
    });
});

//Carica le 2 liste in preparazione e processo finito . 
function renderLists() {
    const sectionPrep = document.getElementById("listaPrep");
    const sectionFinito = document.getElementById("listaFinito");

    let str_prep ="";
    let str_finito = "";
    
    for(let i=0; i<lista_prep.length; i++){
        str_prep += `<div class="ordine-box">`;
        str_prep += `<h3>Ordine numero: ${lista_prep[i].id}</h3>`;

        if (lista_prep[i].prodotti && lista_prep[i].prodotti.length > 0) {
            
            str_prep += "<p>Prodotti: ";
            for (let j = 0; j < lista_prep[i].prodotti.length; j++) {
                str_prep += lista_prep[i].prodotti[j].nome;
                
                // Mette una virgola di separazione tranne che dopo l'ultimo elemento
                if (j < lista_prep[i].prodotti.length - 1) {
                    str_prep += ", ";
                }
            }
            str_prep += "</p>";

        } else {
            str_prep += "<p>Nessun dettaglio prodotto trovato</p>";
        }
        str_prep += `</div>`;
    }
    
    sectionPrep.innerHTML = str_prep;
}

function generaTempoRandomico(){
    return (Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000);
}