const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://paulonbruno:P0agoCOBlc4eCuIg@cluster0.c4xkskb.mongodb.net/designacoes?retryWrites=true&w=majority&appName=Cluster0';

async function main() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('Conectando ao MongoDB...');
    await client.connect();
    console.log('Conectado com sucesso!');
    
    const db = client.db('designacoes');
    
    // 1. Criar privilégios
    console.log('\n1. Criando privilégios...');
    const privilegiosCollection = db.collection('privilegios');
    const privilegios = [
      { nome: "Estudante", ordem: 1, createdAt: new Date() },
      { nome: "Publicador Não Batizado", ordem: 2, createdAt: new Date() },
      { nome: "Publicador Batizado", ordem: 3, createdAt: new Date() },
      { nome: "Pioneiro Auxiliar", ordem: 4, createdAt: new Date() },
      { nome: "Pioneiro Regular", ordem: 5, createdAt: new Date() },
      { nome: "Servo Ministerial", ordem: 6, createdAt: new Date() },
      { nome: "Ancião", ordem: 7, createdAt: new Date() },
      { nome: "Superintendente Viajante", ordem: 8, createdAt: new Date() },
    ];
    
    for (const priv of privilegios) {
      const existing = await privilegiosCollection.findOne({ nome: priv.nome });
      if (!existing) {
        await privilegiosCollection.insertOne(priv);
        console.log(`  - ${priv.nome} criado`);
      } else {
        console.log(`  - ${priv.nome} já existe`);
      }
    }
    
    // 2. Criar usuário admin
    console.log('\n2. Criando usuário admin...');
    const usersCollection = db.collection('users');
    const existingAdmin = await usersCollection.findOne({ email: "admin@congregacao.local" });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await usersCollection.insertOne({
        email: "admin@congregacao.local",
        password: hashedPassword,
        name: "Administrador",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('  - Usuário admin criado (email: admin@congregacao.local, senha: admin123)');
    } else {
      console.log('  - Usuário admin já existe');
    }
    
    // 3. Criar partes
    console.log('\n3. Criando partes...');
    const partesCollection = db.collection('partes');
    const partes = [
      { nome: "Presidente", duracaoMinutos: 0, numParticipantes: 1, tipo: "outros", sala: "A", ordem: 1, privilegiosMinimos: JSON.stringify(["Servo Ministerial", "Ancião", "Superintendente Viajante"]), createdAt: new Date(), updatedAt: new Date() },
      { nome: "Oração Inicial", duracaoMinutos: 1, numParticipantes: 1, tipo: "outros", sala: "A", ordem: 2, createdAt: new Date(), updatedAt: new Date() },
      { nome: "Cânticos", duracaoMinutos: 5, numParticipantes: 1, tipo: "outros", sala: "ambas", ordem: 3, createdAt: new Date(), updatedAt: new Date() },
      { nome: "Leitura da Bíblia", duracaoMinutos: 4, numParticipantes: 1, tipo: "leitura", sala: "ambas", ordem: 4, privilegiosMinimos: JSON.stringify(["Publicador Batizado", "Pioneiro Auxiliar", "Pioneiro Regular", "Servo Ministerial", "Ancião", "Superintendente Viajante"]), createdAt: new Date(), updatedAt: new Date() },
      { nome: "Iniciando conversas", duracaoMinutos: 3, numParticipantes: 2, tipo: "demonstracao", sala: "ambas", ordem: 5, createdAt: new Date(), updatedAt: new Date() },
      { nome: "Cultivando o interesse", duracaoMinutos: 4, numParticipantes: 2, tipo: "demonstracao", sala: "ambas", ordem: 6, createdAt: new Date(), updatedAt: new Date() },
      { nome: "Fazendo discípulos", duracaoMinutos: 5, numParticipantes: 2, tipo: "demonstracao", sala: "ambas", ordem: 7, createdAt: new Date(), updatedAt: new Date() },
      { nome: "Discurso", duracaoMinutos: 30, numParticipantes: 1, tipo: "discurso", sala: "A", ordem: 8, privilegiosMinimos: JSON.stringify(["Servo Ministerial", "Ancião", "Superintendente Viajante"]), createdAt: new Date(), updatedAt: new Date() },
      { nome: "Estudo Bíblico", duracaoMinutos: 6, numParticipantes: 2, tipo: "demonstracao", sala: "ambas", ordem: 9, createdAt: new Date(), updatedAt: new Date() },
      { nome: "Conselheiro", duracaoMinutos: 1, numParticipantes: 1, tipo: "outros", sala: "ambas", ordem: 10, privilegiosMinimos: JSON.stringify(["Servo Ministerial", "Ancião", "Superintendente Viajante"]), createdAt: new Date(), updatedAt: new Date() },
      { nome: "Oração Final", duracaoMinutos: 1, numParticipantes: 1, tipo: "outros", sala: "A", ordem: 11, createdAt: new Date(), updatedAt: new Date() },
    ];
    
    for (const parte of partes) {
      const existing = await partesCollection.findOne({ nome: parte.nome });
      if (!existing) {
        await partesCollection.insertOne(parte);
        console.log(`  - ${parte.nome} criado`);
      } else {
        console.log(`  - ${parte.nome} já existe`);
      }
    }
    
    // 4. Criar configurações
    console.log('\n4. Criando configurações...');
    const configCollection = db.collection('configuracaos');
    const configs = [
      { chave: "nome_congregacao", valor: "Setúbal Bonfim", createdAt: new Date(), updatedAt: new Date() },
      { chave: "horario_reuniao", valor: "19:00", createdAt: new Date(), updatedAt: new Date() },
      { chave: "initialized", valor: "true", createdAt: new Date(), updatedAt: new Date() },
    ];
    
    for (const config of configs) {
      const existing = await configCollection.findOne({ chave: config.chave });
      if (!existing) {
        await configCollection.insertOne(config);
        console.log(`  - ${config.chave} criado`);
      } else {
        await configCollection.updateOne({ chave: config.chave }, { $set: { valor: config.valor, updatedAt: new Date() } });
        console.log(`  - ${config.chave} atualizado`);
      }
    }
    
    console.log('\n✅ Sistema inicializado com sucesso!');
    console.log('\nCredenciais de login:');
    console.log('  Email: admin@congregacao.local');
    console.log('  Senha: admin123');
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await client.close();
    console.log('\nConexão fechada.');
  }
}

main();
