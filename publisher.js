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
        if(ordine.length > 0){
            client.publish("Ordini",JSON.stringify(pacchettoDati));
            matrix_id++;
            ordine = [];
            costo = 0;
            console.log(`Inviato: ${JSON.stringify(pacchettoDati)}`);
            document.getElementById("contenuto").innerHTML = `<h1>Grazie per aver ordinato</h1>`;
        }
        else{
            document.getElementById("contenuto").innerHTML = `<h1>Non hai ancora ordinato niente,devi ordinare qualcosa!!!</h1>`;
        }
    }
    else {alert("Non sei ancora connesso al broker!");}
}


document.addEventListener('DOMContentLoaded', (event) => {
    client.on('connect', (event) => console.log("Publisher connesso al Broker!"));

    document.getElementById("mostraMenu").addEventListener('click',(event)=>{
        event.preventDefault();
        const container = document.getElementById("contenuto");

        container.innerHTML =  `<div class="voce-menu"><h3>Crunch - 9,50€</h3><button class="pulsante-aggiungi" onclick="aggiungi('Crunch', 9.50)">AGGIUNGI</button></div>
        <div class="voce-menu"><h3>Golden - 10,50€</h3><button class="pulsante-aggiungi" onclick="aggiungi('Golden', 10.50)">AGGIUNGI</button></div>
        <div class="voce-menu"><h3>Smash - 11,50€</h3><button class ="pulsante-aggiungi" onclick="aggiungi('Smash', 11.50)">AGGIUNGI</button></div>
        <div class="voce-menu"><h3>Smoke - 12,50€</h3><button class ="pulsante-aggiungi" onclick="aggiungi('Smoke', 12.50)">AGGIUNGI</button></div>
        <div class="voce-menu"><h3>Iconic - 13,50€</h3><button class ="pulsante-aggiungi" onclick="aggiungi('Iconic', 13.50)">AGGIUNGI</button></div>
        <div class="voce-menu"><h3>Acqua(0,5L) - 1,50€</h3><button class ="pulsante-aggiungi" onclick="aggiungi('Acqua', 1.50)">AGGIUNGI</button></div>
        <div class="voce-menu"><h3>Bibite in lattina - 3,00€</h3><button class ="pulsante-aggiungi" onclick="aggiungi('Bibite', 3.00)">AGGIUNGI</button></div>
        <div class="voce-menu"><h3>Birra alla spina (0,3l) - 4,50€</h3><button class ="pulsante-aggiungi" onclick="aggiungi('Bibite',4.50)">AGGIUNGI</button></div>`;
    });

    

    document.getElementById("mostraPagamento").addEventListener('click', (event) => {
        event.preventDefault();
        const container = document.getElementById("contenuto");
        let listaProdottiHTML = "";
        
        if (ordine.length === 0) {
            listaProdottiHTML = "<p style='text-align:center; color:#777;'>Il tuo carrello è vuoto! Torna al menu.</p>";
        } else {
            for (let i = 0; i < ordine.length; i++) {
                listaProdottiHTML += `
                    <div class="item-carrello" style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px dashed #ccc; padding-bottom: 6px;">
                        <span>${ordine[i].nome}</span>
                        <span>${ordine[i].prezzo}€</span>
                    </div>`;
            }
        }

        container.innerHTML = `
            <div class="box-carrello">
                <h3>Riepilogo dell'Ordine</h3>
                
                <div id="riepilogo-prodotti" style="margin-top: 15px;">
                    ${listaProdottiHTML}
                </div>
                
                <div class="totale-carrello">
                    <span>Conto Totale:</span>
                    <span><span id="prezzoTotale">${costo}</span>€</span>
                </div>
                
                <button class="pulsante-paga" onclick="mandaPagamento()">Paga e Invia Ordine</button>
            </div>`;
    });    
    
});