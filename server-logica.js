const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');
const TOPIC_ORDINI = "Ordini";
const TOPIC_PRONTO = "OrdinePronto";
client.on('connect', () => {
    console.log("Regista della Logica Centrale Connesso al Broker Pubblico!");
    client.subscribe(TOPIC_ORDINI);
});

client.on('message', (topic, message) => {
    if (topic === "Ordini") {
        const ordine = JSON.parse(message.toString());
        console.log(`Logica: Ricevuto ordine Numero ${ordine.id}.`);
        
        if (!ordine.orarioInizio) {
            ordine.orarioInizio = Date.now();
        }

        let tempoRandom = Math.floor(Math.random() * (20000 - 1000 + 1)) + 1000;
        console.log(`L'ordine ${ordine.id} sarà pronto tra ${tempoRandom / 1000} secondi.`);

        setTimeout(() => {
            let payload = { 
                id: ordine.id,
            };
            
            client.publish(TOPIC_PRONTO, JSON.stringify(payload));
            console.log(`Logica: Inviato comando 'OrdinePronto' per ordine ${ordine.id}`);
        }, tempoRandom);
    }
});