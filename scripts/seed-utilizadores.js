const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://paulonbruno:P0agoCOBlc4eCuIg@cluster0.c4xkskb.mongodb.net/designacoes?retryWrites=true&w=majority&appName=Cluster0';

const utilizadores = [
  {
    nomePrimeiro: 'Jorge',
    nomeMeio: 'M. C.',
    nomeUltimo: 'Caeiro',
    nomeCompleto: 'Jorge M. C. Caeiro',
    morada: 'Rua Dr. António Manuel Gamito, 19, 7 Dto',
    codigoPostal: '2900',
    cidade: 'Setúbal',
    grupoCampo: 'G-5',
    grupoLimpeza: 'Grupo Limpeza A',
    email: 'jgsj57@gmail.com',
    telemovel: '926 612 885',
    genero: 'masculino',
    tipoPublicador: 'publicador_batizado',
    privilegioServico: 'nenhum',
    status: 'ativo',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    nomePrimeiro: 'João',
    nomeMeio: 'Miguel D.',
    nomeUltimo: 'Calisto',
    nomeCompleto: 'João Miguel D. Calisto',
    morada: 'Rua S. João de Deus, Lt 107 - 3 Esq Br. Afonso Costa',
    codigoPostal: '2910-059',
    cidade: 'Setúbal',
    grupoCampo: 'G-8',
    grupoLimpeza: 'Grupo Limpeza C',
    email: 'miguel.calisto2013@gmail.com',
    telemovel: '964 709 128',
    telefoneCasa: '265 403 622',
    contactoFamilia: 'Vanda Calisto',
    genero: 'masculino',
    tipoPublicador: 'publicador_batizado',
    privilegioServico: 'nenhum',
    status: 'ativo',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    nomePrimeiro: 'Miguel',
    nomeMeio: 'R. C.',
    nomeUltimo: 'Cascalheira',
    nomeCompleto: 'Miguel R. C. Cascalheira',
    morada: 'Rua Olival da Varzinha, 55',
    codigoPostal: '2900',
    cidade: 'Setúbal',
    grupoCampo: 'G-5',
    grupoLimpeza: 'Grupo Limpeza A',
    email: 'miguelrosacascalheira65@hotmail.com',
    telemovel: '913 015 485',
    telefoneCasa: '265 501 191',
    genero: 'masculino',
    tipoPublicador: 'publicador_batizado',
    privilegioServico: 'nenhum',
    status: 'ativo',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    nomePrimeiro: 'António',
    nomeMeio: 'A.',
    nomeUltimo: 'Fernandes',
    nomeCompleto: 'António A. Fernandes',
    morada: 'Rua Damão 20, 5º H',
    codigoPostal: '2900-340',
    cidade: 'Setúbal',
    grupoCampo: 'G-7',
    grupoLimpeza: 'Grupo Limpeza D',
    email: 'toniesanta@gmail.com',
    telemovel: '965 884 477',
    telefoneCasa: '265 403 468',
    genero: 'masculino',
    tipoPublicador: 'publicador_batizado',
    privilegioServico: 'nenhum',
    status: 'ativo',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    nomePrimeiro: 'Jessé',
    nomeMeio: 'G.',
    nomeUltimo: 'Francisco',
    nomeCompleto: 'Jessé G. Francisco',
    morada: 'Av. dos Ciprestes 86, 5F',
    codigoPostal: '2900-316',
    cidade: 'Setúbal',
    grupoCampo: 'G-8',
    grupoLimpeza: 'Grupo Limpeza C',
    email: 'martinsnayol@gmail.com',
    telemovel: '965 036 602',
    genero: 'masculino',
    tipoPublicador: 'publicador_batizado',
    privilegioServico: 'nenhum',
    status: 'ativo',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    nomePrimeiro: 'Florivaldo',
    nomeMeio: 'A. S.',
    nomeUltimo: 'Gomes',
    nomeCompleto: 'Florivaldo A. S. Gomes',
    morada: 'Av. Dr. António Rodrigues Manito, N°151, 2º Dt',
    codigoPostal: '2900-069',
    cidade: 'Setúbal',
    grupoCampo: 'G-9',
    grupoLimpeza: 'Grupo Limpeza E',
    email: 'florivaldogomes@gmail.com',
    telemovel: '934 392 619',
    telefoneCasa: '265 102 562',
    contactoFamilia: 'Joana Gomes',
    genero: 'masculino',
    tipoPublicador: 'publicador_batizado',
    privilegioServico: 'nenhum',
    status: 'ativo',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    nomePrimeiro: 'Edson',
    nomeMeio: 'C.',
    nomeUltimo: 'Nascimento',
    nomeCompleto: 'Edson C. Nascimento',
    morada: 'Rua Olavo Bilac 12 1 esquerdo',
    codigoPostal: '2900-517',
    cidade: 'Setúbal',
    grupoCampo: 'G-6',
    grupoLimpeza: null,
    email: 'carvalhonil94@hotmail.com',
    telemovel: '961 569 883',
    genero: 'masculino',
    tipoPublicador: 'publicador_batizado',
    privilegioServico: 'nenhum',
    status: 'ativo',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    nomePrimeiro: 'Filipe',
    nomeMeio: 'P.',
    nomeUltimo: 'Paulino',
    nomeCompleto: 'Filipe P. Paulino',
    morada: 'Rua Álvaro Perdigão, 6 1º Dto',
    codigoPostal: '2900-163',
    cidade: 'Setúbal',
    grupoCampo: 'G-3',
    grupoLimpeza: null,
    email: 'filipe.paulino1@gmail.com',
    telemovel: '919 408 554',
    contactoFamilia: 'Marta Paulino',
    genero: 'masculino',
    tipoPublicador: 'publicador_batizado',
    privilegioServico: 'nenhum',
    status: 'ativo',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    nomePrimeiro: 'David',
    nomeMeio: 'M. O.',
    nomeUltimo: 'Resende',
    nomeCompleto: 'David M. O. Resende',
    morada: 'Rua Amílcar Cabral 10, 5 C',
    codigoPostal: '2900-219',
    cidade: 'Setúbal',
    grupoCampo: 'G-4',
    grupoLimpeza: 'Grupo Limpeza B',
    email: 'david_m_resende@hotmail.com',
    telemovel: '914 761 169',
    genero: 'masculino',
    tipoPublicador: 'publicador_batizado',
    privilegioServico: 'nenhum',
    status: 'ativo',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    nomePrimeiro: 'Manuel',
    nomeMeio: '',
    nomeUltimo: 'Ribeiro',
    nomeCompleto: 'Manuel Barão Ribeiro',
    morada: 'Rua Dona Maria Batista 18, R/C',
    codigoPostal: '2910-598',
    cidade: 'Setúbal',
    grupoCampo: 'G-4',
    grupoLimpeza: 'Grupo Limpeza B',
    email: 'manuelbarao@sapo.pt',
    telemovel: '928 150 046',
    telefoneCasa: '265 232 222',
    genero: 'masculino',
    tipoPublicador: 'publicador_batizado',
    privilegioServico: 'nenhum',
    status: 'ativo',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    nomePrimeiro: 'Jorge',
    nomeMeio: 'S.',
    nomeUltimo: 'Sanches',
    nomeCompleto: 'Jorge S. Sanches',
    morada: 'Av. Dr. António Rodrigues Manito, 56 5º Frente',
    codigoPostal: '2900-060',
    cidade: 'Setúbal',
    grupoCampo: 'G-1',
    grupoLimpeza: 'Grupo Limpeza F',
    email: 'jorgedssanches@gmail.com',
    telemovel: '914 345 945',
    telefoneCasa: '265 551 245',
    genero: 'masculino',
    tipoPublicador: 'publicador_batizado',
    privilegioServico: 'nenhum',
    status: 'ativo',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    nomePrimeiro: 'João',
    nomeMeio: '',
    nomeUltimo: 'Sebastião',
    nomeCompleto: 'João Pedro Sebastião',
    morada: 'Travessa das Donzelas 2, 1andar',
    codigoPostal: '2900-351',
    cidade: 'Setúbal',
    grupoCampo: 'G-2',
    grupoLimpeza: 'Grupo Limpeza G',
    telemovel: '961 915 969',
    genero: 'masculino',
    tipoPublicador: 'publicador_batizado',
    privilegioServico: 'nenhum',
    status: 'ativo',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function main() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('Conectando ao MongoDB...');
    await client.connect();
    console.log('Conectado com sucesso!');
    
    const db = client.db('designacoes');
    const collection = db.collection('publicadors');
    
    // Verificar quantos documentos existem
    const countBefore = await collection.countDocuments();
    console.log(`Documentos existentes: ${countBefore}`);
    
    // Inserir os utilizadores
    console.log('Inserindo utilizadores...');
    const result = await collection.insertMany(utilizadores);
    console.log(`${result.insertedCount} utilizadores inseridos!`);
    
    // Verificar quantos documentos existem agora
    const countAfter = await collection.countDocuments();
    console.log(`Documentos após inserção: ${countAfter}`);
    
    // Listar os nomes dos utilizadores inseridos
    const inserted = await collection.find({}).sort({ nomeCompleto: 1 }).toArray();
    console.log('\nUtilizadores no banco:');
    inserted.forEach((u, i) => {
      console.log(`${i + 1}. ${u.nomeCompleto} - ${u.grupoCampo || 'Sem grupo'}`);
    });
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await client.close();
    console.log('\nConexão fechada.');
  }
}

main();
