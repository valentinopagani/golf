const mysql = require('mysql2');

const db = mysql.createConnection({
	host: 'localhost',
	port: 3307,
	user: 'root',
	password: '0000',
	database: 'golf'
});

db.connect((err) => {
	if (err) {
		console.error('Error al conectar:', err.message);
	} else {
		console.log('Conectado correctamente!');
	}
});

module.exports = db;
