const client = mqtt.connect('ws://127.0.0.1:9001/mqtt');
let ordine = [];
let costo = 0;
let matrix_id = Math.floor(Math.random() * 900) + 100;

function aggiungi(nome, prezzo) {
    ordine.push({ nome: nome, prezzo: prezzo });
    costo += prezzo;
}

window.mandaPagamento = function(){
    if (client.connected) {
        const pacchettoDati = {
            id: matrix_id,
            prodotti: ordine,
            prezzo: costo,
        };
        client.publish("Ordini",JSON.stringify(pacchettoDati));
        
        matrix_id++;
        ordine = [];
        costo = 0;
        console.log(`Inviato: ${JSON.stringify(pacchettoDati)}`);

        document.getElementById("contenuto").innerHTML = `<h1>Grazie per aver ordinato</h1>`;
    }
    else {alert("Non sei ancora connesso al broker!");}
}


document.addEventListener('DOMContentLoaded', (event) => {
    client.on('connect', (event) => console.log("Publisher connesso al Broker!"));

    document.getElementById("mostraMenu").addEventListener('click',(event)=>{
        event.preventDefault();
        const container = document.getElementById("contenuto");

        container.innerHTML = 
        `<div class="voce-menu"><h3>Big Mac - 8€</h3><button class="pulsante-aggiungi" onclick="aggiungi('Big Mac', 8)">AGGIUNGI</button></div>
        <div class="voce-menu"><h3>McChicken - 7€</h3><button class="pulsante-aggiungi" onclick="aggiungi('McChicken', 7)">AGGIUNGI</button></div>
        <div class="voce-menu"><h3>Menù Kids - 11€</h3><button class ="pulsante-aggiungi" onclick="aggiungi('Menù Kids', 11)">AGGIUNGI</button></div>`;
    });

    

    document.getElementById("mostraPagamento").addEventListener('click', (event) => {
        event.preventDefault();
        const container = document.getElementById("contenuto");
        let listaProdottiHTML = "";
        
        if (ordine.length === 0) {
            listaProdottiHTML = "<p>Il tuo carrello è vuoto! Torna al menu.</p>";
        } else {
            for (let i = 0; i < ordine.length; i++) {
                listaProdottiHTML += `
                    <div class="item-carrello" style="display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px dashed #ccc; padding-bottom: 4px;">
                        <span>${ordine[i].nome}</span>
                        <span>${ordine[i].prezzo}€</span>
                    </div>`;
            }
        }

        container.innerHTML = `
            <h3>Riepilogo dell'Ordine</h3>
            <div id="riepilogo-prodotti" style="margin-top: 15px; margin-bottom: 20px;">
                ${listaProdottiHTML}
            </div>
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 20px;">
                Conto Totale: <span id="prezzoTotale">${costo}</span>€
            </div>
            <button onclick="mandaPagamento()">Paga e Invia Ordine in Cucina</button>`;     
    });
});