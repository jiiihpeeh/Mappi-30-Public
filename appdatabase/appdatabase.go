package appdatabase

import (
	"bytes"
	"crypto/sha256"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"mappi-3.0/models"
	"mappi-3.0/utils"
)

type SQLiteDB struct {
	Connection *sql.DB
}

const CreateClientsTableQuery = `CREATE TABLE IF NOT EXISTS clients (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	former_id INTEGER,
	name TEXT NOT NULL,
	address TEXT,
	email TEXT,
	phone TEXT,
	supporter BOOLEAN,
	active_supporter BOOLEAN,
	information TEXT,
	modifier TEXT );`

const CreateEntryTableQuery = `CREATE TABLE IF NOT EXISTS entries (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	date INTEGER,
	textile REAL,
	material REAL,
	modifier TEXT,
	clientId INTEGER
);`

const CreatePasswordHashTableQuery = `CREATE TABLE IF NOT EXISTS hash (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	user TEXT UNIQUE,
	hash TEXT 
);`

var IndexQueries = []string{
	`CREATE INDEX IF NOT EXISTS idx_entries_id ON entries (id);`,
	`CREATE INDEX IF NOT EXISTS idx_entries_date ON entries (date);`,
	`CREATE INDEX IF NOT EXISTS idx_entries_clientId ON entries (clientId);`,
	`CREATE INDEX IF NOT EXISTS idx_entries_name ON clients (name);`,
}

const ClientEntriesQuery = "SELECT id, date, textile, material, modifier, clientId FROM entries WHERE clientId = ?"

const AllClientsQuery = "SELECT * FROM clients;"

const InsertNewEntryQuery = `
		INSERT INTO entries (date, textile, material, modifier, clientId) 
		VALUES (?, ?, ?, ?, ?)
`

const GetHashQuery = "SELECT hash FROM hash WHERE user = ?"

const InsertPasswordQuery = `
		INSERT INTO hash (user, hash) 
		VALUES (?, ?)
		`

const NewClientQuery = `
		INSERT INTO clients (former_id, name, address, email, phone, supporter, active_supporter, information, modifier) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?); 
		`
const clientRecoveryQuery = `
		INSERT INTO clients (id, former_id, name, address, email, phone, supporter, active_supporter, information, modifier) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`

const entryRecoveryQuery = `
	INSERT INTO entries (id, date, textile, material, modifier, clientId) 
	VALUES (?,?,?,?,?,?);
`
const maxClientsQuery = "SELECT COALESCE(MAX(former_id), 0) AS max_value FROM clients;"

const updateClientQuery = `
	UPDATE clients 
	SET
		former_id = ?, 
		name = ?, 
		address = ?, 
		email = ?, 
		phone = ?, 
		supporter = ?, 
		active_supporter = ?, 
		information = ?, 
		modifier = ?
	WHERE id = ? AND modifier = ?`

const updateEntryQuery = `
			UPDATE entries
			SET date = ?, textile = ?, material = ?, modifier = ?, clientId = ?
			WHERE id = ? AND modifier = ?;`

const deleteEntryQuery = "DELETE FROM entries WHERE id = ? AND modifier = ?"

const betweenQuery = "SELECT * FROM entries WHERE date BETWEEN ? AND ?"

const getClientDataQuery = "SELECT id, former_id, name, address, email, phone, supporter, active_supporter, information, modifier FROM clients"

const getEntryDataQuery = "SELECT id, date, textile, material, modifier, clientId FROM entries"

const checkIDAvailQuery = `
				SELECT COUNT(*)
				FROM clients
				WHERE former_id = ? AND id != ?;`

const checkIDAvailNewQuery = `
				SELECT COUNT(*)
				FROM clients
				WHERE former_id = ?;`

const dropClientsQuery = "DROP TABLE  clients;"
const dropEntriesQuery = "DROP TABLE  entries;"

func (s *SQLiteDB) InitDB() {
	_, e := s.Connection.Exec(CreateClientsTableQuery)
	if e != nil {
		panic(e)
	}
	_, e = s.Connection.Exec(CreateEntryTableQuery)
	if e != nil {
		panic(e)
	}
	_, e = s.Connection.Exec(CreatePasswordHashTableQuery)
	if e != nil {
		panic(e)
	}
	for _, query := range IndexQueries {
		_, e = s.Connection.Exec(query)
		if e != nil {
			panic(e)
		}
	}

}

func (s *SQLiteDB) Connect(file string) interface{} {
	//db, err := sql.Open("sqlite3", "./untamo.db")
	db, err := sql.Open("sqlite", file)
	if err != nil {
		panic(err)
	}
	fmt.Println("enbaling db")
	db.SetMaxOpenConns(6)
	s.Connection = db
	s.InitDB()
	return *s
}

func GetClients(db *SQLiteDB, key string) ([]models.Client, error) {

	rows, err := db.Connection.Query(AllClientsQuery)
	if err != nil {
		return []models.Client{}, err
	}
	defer rows.Close()

	var clients []models.Client
	for rows.Next() {
		var clientNew models.Client
		err := rows.Scan(
			&clientNew.ID,
			&clientNew.FormerID,
			&clientNew.Name,
			&clientNew.Address,
			&clientNew.Email,
			&clientNew.Phone,
			&clientNew.Supporter,
			&clientNew.ActiveSupporter,
			&clientNew.Information,
			&clientNew.Modifier)
		if err != nil {
			return []models.Client{}, err
		}
		decClients := models.Client{}
		decClients.Name = utils.Decrypt(clientNew.Name, key)
		decClients.Address = utils.Decrypt(clientNew.Address, key)
		decClients.Phone = utils.Decrypt(clientNew.Phone, key)
		decClients.Email = utils.Decrypt(clientNew.Email, key)
		decClients.Information = utils.Decrypt(clientNew.Information, key)
		decClients.Email = utils.Decrypt(clientNew.Email, key)
		decClients.FormerID = clientNew.FormerID
		decClients.ID = clientNew.ID
		decClients.Modifier = clientNew.Modifier
		decClients.Supporter = clientNew.Supporter
		decClients.ActiveSupporter = clientNew.ActiveSupporter
		clients = append(clients, decClients)
	}

	if err = rows.Err(); err != nil {
		return []models.Client{}, err
	}
	if len(clients) < 1 {
		return []models.Client{}, nil
	}
	return clients, nil
}

func GetClientEntries(id int64, db *SQLiteDB) ([]models.Entry, error) {

	rows, err := db.Connection.Query(ClientEntriesQuery, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []models.Entry
	for rows.Next() {
		var entryNew models.Entry
		err := rows.Scan(&entryNew.ID, &entryNew.Date, &entryNew.Textile, &entryNew.Material, &entryNew.Modifier, &entryNew.ClientID)
		if err != nil {
			return nil, err
		}
		entries = append(entries, entryNew)
	}

	if err = rows.Err(); err != nil { // Handling errors after iterating rows
		return nil, err
	}

	if len(entries) < 1 {
		return nil, err
	}
	return entries, nil
}

func InsertNewEntry(entry models.Entry, db *SQLiteDB) (models.Entry, error) {

	entry.Modifier = utils.GetModifier()

	entry.Date = time.Now().Unix()

	// Execute the query
	result, err := db.Connection.Exec(InsertNewEntryQuery, entry.Date, entry.Textile, entry.Material, entry.Modifier, entry.ClientID)
	if err != nil {
		return models.Entry{}, err
	}
	entry.ID, _ = result.LastInsertId()

	return entry, nil
}

func InsertNewClient(newClient models.Client, db *SQLiteDB, key string) (models.Client, error) {

	newClient.Modifier = utils.GetModifier()
	encClient := models.Client{}
	encClient.Name = utils.Encrypt(newClient.Name, key)
	encClient.Address = utils.Encrypt(newClient.Address, key)
	encClient.Phone = utils.Encrypt(newClient.Phone, key)
	encClient.Information = utils.Encrypt(newClient.Information, key)
	encClient.Email = utils.Encrypt(newClient.Email, key)
	encClient.FormerID = newClient.FormerID
	encClient.Modifier = newClient.Modifier
	encClient.Supporter = newClient.Supporter
	encClient.ActiveSupporter = newClient.ActiveSupporter
	var formerID int64
	err := db.Connection.QueryRow(maxClientsQuery).Scan(&formerID)
	if err != nil {
		return models.Client{}, err
	}
	if formerID < 30000 {
		formerID = 30000
	} else {
		formerID = formerID + 1
	}
	newClient.FormerID = formerID
	encClient.FormerID = formerID

	result, err := db.Connection.Exec(NewClientQuery,
		newClient.FormerID,
		encClient.Name,
		encClient.Address,
		encClient.Email,
		encClient.Phone,
		encClient.Supporter,
		encClient.ActiveSupporter,
		encClient.Information,
		newClient.Modifier,
	)

	if err != nil {
		return models.Client{}, err
	}
	newClient.ID, _ = result.LastInsertId()

	return newClient, nil
}

func InsertNewOldClient(newClient models.Client, db *SQLiteDB, key string) (models.Client, error) {

	newClient.Modifier = utils.GetModifier()
	encClient := models.Client{}
	encClient.Name = utils.Encrypt(newClient.Name, key)
	encClient.Address = utils.Encrypt(newClient.Address, key)
	encClient.Phone = utils.Encrypt(newClient.Phone, key)
	encClient.Information = utils.Encrypt(newClient.Information, key)
	encClient.Email = utils.Encrypt(newClient.Email, key)
	encClient.FormerID = newClient.FormerID
	encClient.Modifier = newClient.Modifier
	encClient.Supporter = newClient.Supporter
	encClient.ActiveSupporter = newClient.ActiveSupporter

	result, err := db.Connection.Exec(NewClientQuery,
		encClient.FormerID,
		encClient.Name,
		encClient.Address,
		encClient.Email,
		encClient.Phone,
		encClient.Supporter,
		encClient.ActiveSupporter,
		encClient.Information,
		encClient.Modifier,
	)

	if err != nil {
		return models.Client{}, err
	}
	newClient.ID, _ = result.LastInsertId()

	return newClient, nil
}

func ModifyClient(client models.Client, db *SQLiteDB, key string) (models.Client, error) {

	modifier := utils.GetModifier()
	/* 	former_id = ? ,
	   	name = ? ,
	   	address = ?,
	   	email = ?,
	   	phone ?,
	   	supporter = ?,
	   	active_supporter = ?,
	   	information = ?,
	   	modifier ? */
	encClient := models.Client{}
	encClient.Name = utils.Encrypt(client.Name, key)
	encClient.Address = utils.Encrypt(client.Address, key)
	encClient.Phone = utils.Encrypt(client.Phone, key)
	encClient.Information = utils.Encrypt(client.Information, key)
	encClient.Email = utils.Encrypt(client.Email, key)
	encClient.FormerID = client.FormerID
	encClient.ID = client.ID
	encClient.Modifier = client.Modifier
	encClient.Supporter = client.Supporter
	encClient.ActiveSupporter = client.ActiveSupporter
	result, err := db.Connection.Exec(updateClientQuery,
		encClient.FormerID,
		encClient.Name,
		encClient.Address,
		encClient.Email,
		encClient.Phone,
		encClient.Supporter,
		encClient.ActiveSupporter,
		encClient.Information,
		modifier,
		encClient.ID,
		encClient.Modifier)

	if err != nil {
		fmt.Println(err)
		return models.Client{}, err
	}
	client.Modifier = modifier

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		fmt.Println(err)
		return models.Client{}, err
	}
	// If no rows were affected, the entry doesn't exist or the modified timestamp doesn't match
	if rowsAffected == 0 {
		return models.Client{}, fmt.Errorf("nothing found")
	}
	return client, nil
}

func ModifyEntry(entry models.Entry, db *SQLiteDB) (models.Entry, error) {

	modifier := utils.GetModifier()

	result, err := db.Connection.Exec(updateEntryQuery,
		&entry.Date,
		&entry.Textile,
		&entry.Material,
		&modifier,
		&entry.ClientID,
		&entry.ID,
		&entry.Modifier,
	)
	if err != nil {
		return models.Entry{}, err
	}
	entry.Modifier = modifier

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return models.Entry{}, err
	}

	// If no rows were affected, the entry doesn't exist or the modified timestamp doesn't match
	if rowsAffected == 0 {
		return models.Entry{}, fmt.Errorf("nothing found")
	}
	return entry, nil
}

func DeleteEntry(id int64, modifier string, db *SQLiteDB) error {
	result, err := db.Connection.Exec(deleteEntryQuery, id, modifier)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("not found")
	}
	return nil
}

func GetEntriesBetween(from int64, to int64, db *SQLiteDB) ([]models.Entry, error) {

	rows, err := db.Connection.Query(betweenQuery, from, to)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entriesBetween []models.Entry
	for rows.Next() {
		var entryBetween models.Entry
		err := rows.Scan(
			&entryBetween.ID,
			&entryBetween.Date,
			&entryBetween.Textile,
			&entryBetween.Material,
			&entryBetween.Modifier,
			&entryBetween.ClientID)
		if err != nil {
			return nil, err

		}
		entriesBetween = append(entriesBetween, entryBetween)
	}
	if len(entriesBetween) < 1 {
		return nil, err

	}
	return entriesBetween, nil
}

func GetHash(db *SQLiteDB) (string, error) {
	rows, err := db.Connection.Query(GetHashQuery, "admin")
	if err != nil {
		return "", fmt.Errorf("failed to execute query: %w", err)
	}
	defer rows.Close()

	var hashes []string
	for rows.Next() {
		var hash string
		if err := rows.Scan(&hash); err != nil {
			return "", fmt.Errorf("failed to scan row: %w", err)
		}
		hashes = append(hashes, hash)
	}
	// Check for errors during row iteration
	if err = rows.Err(); err != nil {
		return "", fmt.Errorf("row iteration error: %w", err)
	}

	// Handle cases based on the number of hashes found
	switch len(hashes) {
	case 0:
		return "", nil // No hash found
	case 1:
		return hashes[0], nil // Single hash found
	default:
		return "", fmt.Errorf("multiple hashes found for the user")
	}
}

func InsertNewPassword(hash string, db *SQLiteDB) (int64, error) {
	result, err := db.Connection.Exec(InsertPasswordQuery, "admin", hash)
	if err != nil {
		return -1, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return -1, err
	}
	return id, nil
}

func ResetTables(db *SQLiteDB) error {
	result, err := db.Connection.Exec(dropClientsQuery)
	if err != nil {
		return err
	}
	fmt.Println(result)
	result, err = db.Connection.Exec(dropEntriesQuery)
	if err != nil {
		return err
	}
	fmt.Println(result)

	db.InitDB()
	return nil

}

func GetBackup(db *SQLiteDB, key string, encryption bool, password string) (*bytes.Buffer, error) {
	rows, err := db.Connection.Query(getClientDataQuery)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Slice to hold all client data
	var clients []models.Client

	// Loop through the rows and add each client to the slice
	for rows.Next() {
		var client models.Client
		err := rows.Scan(
			&client.ID,
			&client.FormerID,
			&client.Name,
			&client.Address,
			&client.Email,
			&client.Phone,
			&client.Supporter,
			&client.ActiveSupporter,
			&client.Information,
			&client.Modifier,
		)
		if err != nil {
			return nil, err
		}
		decClient := models.Client{}
		decClient.Name = utils.Decrypt(client.Name, key)
		decClient.Address = utils.Decrypt(client.Address, key)
		decClient.Phone = utils.Decrypt(client.Phone, key)
		decClient.Email = utils.Decrypt(client.Email, key)
		decClient.Information = utils.Decrypt(client.Information, key)
		decClient.Email = utils.Decrypt(client.Email, key)
		decClient.FormerID = client.FormerID
		decClient.ID = client.ID
		decClient.Modifier = client.Modifier
		decClient.Supporter = client.Supporter
		decClient.ActiveSupporter = client.ActiveSupporter
		clients = append(clients, decClient)
	}

	// Check if there were any errors during the iteration
	if err = rows.Err(); err != nil {
		return nil, err
	}

	rows, err = db.Connection.Query(getEntryDataQuery)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var entries []models.Entry

	// Loop through the rows and add each entry to the slice
	for rows.Next() {
		var entry models.Entry
		err := rows.Scan(
			&entry.ID,
			&entry.Date,
			&entry.Textile,
			&entry.Material,
			&entry.Modifier,
			&entry.ClientID,
		)
		if err != nil {
			return nil, err
		}
		entries = append(entries, entry)
	}

	// Check if there were any errors during the iteration
	if err = rows.Err(); err != nil {
		return nil, err
	}

	// Convert the entries slice to JSON
	backup := models.BackUp{Clients: clients, Entries: entries}
	backupJSON, err := json.MarshalIndent(backup, "", "    ")
	if err != nil {
		log.Fatal(err)
		return nil, err
	}
	checksum := sha256.New()
	checksum.Write(backupJSON)

	archive, err := utils.CreateZipArchiveWithSHA256(backupJSON, encryption, password)

	return archive, err

}

func RecoverEntry(entry models.Entry, db *SQLiteDB) error {
	entry.Modifier = utils.GetModifier()
	// Execute the query
	_, err := db.Connection.Exec(entryRecoveryQuery,
		entry.ID,
		entry.Date,
		entry.Textile,
		entry.Material,
		entry.Modifier,
		entry.ClientID,
	)
	if err != nil {
		return err
	}

	return nil
}

func RecoverClient(client models.Client, db *SQLiteDB, key string) error {
	encClient := models.Client{}
	encClient.ID = client.ID
	encClient.FormerID = client.FormerID
	encClient.Modifier = utils.GetModifier()
	encClient.Name = utils.Encrypt(client.Name, key)
	encClient.Address = utils.Encrypt(client.Address, key)
	encClient.Phone = utils.Encrypt(client.Phone, key)
	encClient.Information = utils.Encrypt(client.Information, key)
	encClient.Email = utils.Encrypt(client.Email, key)
	encClient.Supporter = client.Supporter
	encClient.ActiveSupporter = client.ActiveSupporter

	// Execute the query
	_, err := db.Connection.Exec(clientRecoveryQuery,
		encClient.ID,
		encClient.FormerID,
		encClient.Name,
		encClient.Address,
		encClient.Email,
		encClient.Phone,
		encClient.Supporter,
		encClient.ActiveSupporter,
		encClient.Information,
		encClient.Modifier,
	)
	if err != nil {
		return err
	}

	return nil
}

func IsIDInUse(db *SQLiteDB, formerID int64, excludeID int64) (bool, error) {
	var count int
	err := db.Connection.QueryRow(checkIDAvailQuery, formerID, excludeID).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("error checking former_id usage: %v", err)
	}
	return count > 0, nil
}

func IsIDInUseNew(db *SQLiteDB, formerID int64) (bool, error) {
	var count int
	err := db.Connection.QueryRow(checkIDAvailNewQuery, formerID).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("error checking former_id usage: %v", err)
	}
	return count > 0, nil
}
