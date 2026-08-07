
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('modalidades_raw.json', 'utf8'));

data.nodes.forEach(n => {
    if (n.type === 'n8n-nodes-base.supabase') {
        // extract the institute name from the node name (e.g. 'SB GASCTPNA POST1')
        const parts = n.name.split(' ');
        const institute = parts[1]; // GASCTPNA, IBRASE, AUNI, IVEM
        
        n.parameters = {
            ...n.parameters,
            tableId: institute + '_modalidades'
        };
    }
});

fs.writeFileSync('N8N_MODALIDADES_FIX.json', JSON.stringify(data, null, 2));
console.log('Fixed');
