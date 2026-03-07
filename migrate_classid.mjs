import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute('SHOW COLUMNS FROM scheduleEntries');
console.log('Colunas atuais:', rows.map(r => r.Field).join(', '));

const hasClassId = rows.some(r => r.Field === 'classId');
if (!hasClassId) {
  await conn.execute('ALTER TABLE scheduleEntries ADD COLUMN classId INT NULL DEFAULT NULL');
  console.log('✅ Coluna classId adicionada com sucesso!');
} else {
  console.log('✅ Coluna classId já existe');
}
await conn.end();
