package main

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"log"
	"math"
	"os"
	"path/filepath"
	"strings"

	"github.com/denisbrodbeck/machineid"
	_ "github.com/glebarez/go-sqlite"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"mappi-3.0/appdatabase"
	"mappi-3.0/excelwriter"
	"mappi-3.0/models"
	"mappi-3.0/utils"
)

// App struct
type App struct {
	ctx              context.Context
	db               *appdatabase.SQLiteDB
	authentification bool
	key              string
}

// NewApp creates a new App application struct
func NewApp() *App {

	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {

	// //go:embed build/appicon.png
	// var icon []byte
	mid, err := machineid.ID()
	if err != nil {
		log.Fatal(err)
	}
	keyB := sha256.Sum256([]byte("äöWQ&" + mid + "4_?"))
	key := hex.EncodeToString(keyB[:])
	a.key = key
	var db appdatabase.SQLiteDB
	appfolder, err := utils.GetAppDataFolder("mappi_3.0")
	if err != nil {
		panic(err)
	}
	dbfile := filepath.Join(appfolder, "database.db")

	db.Connect(dbfile)

	a.ctx = ctx
	a.db = &db
	a.authentification = false
	runtime.WindowSetTitle(a.ctx, "Mappi 3.0")
}

func (a *App) SetAppSize(x int, y int) {

	// Get window dimensions
	windowWidth, windowHeight := runtime.WindowGetSize(a.ctx)

	// Calculate centered position
	wx := math.Floor(float64(x-windowWidth) / 4)
	wy := math.Floor(float64(y-windowHeight) / 4)

	// Set the window position to the center
	runtime.WindowSetSize(a.ctx, int(math.Floor(float64(x)*0.8)), int(math.Floor(float64(y)*0.8)))
	runtime.WindowSetPosition(a.ctx, int(wx), int(wy))

}

func (a *App) GetAllClients() []models.Client {
	if !a.authentification {
		return nil
	}
	res, err := appdatabase.GetClients(a.db, a.key)
	if err != nil {
		return nil
	}
	return res
}

func (a *App) GetClientEntries(id int64) []models.Entry {
	if !a.authentification {
		return nil
	}
	res, err := appdatabase.GetClientEntries(id, a.db)
	if err != nil {
		return nil
	}
	return res
}

func (a *App) InsertNewEntry(entry models.Entry) models.Entry {
	if !a.authentification {
		return models.Entry{}
	}
	res, err := appdatabase.InsertNewEntry(entry, a.db)
	if err != nil {
		return models.Entry{}
	}
	return res
}

func (a *App) InsertClient(client models.Client) models.Client {

	if !a.authentification {
		return models.Client{}
	}
	res, err := appdatabase.InsertNewClient(client, a.db, a.key)
	if err != nil {
		return models.Client{}
	}
	return res
}

func (a *App) InsertOldClient(client models.Client) models.Client {

	if !a.authentification {
		return models.Client{}
	}
	res, err := appdatabase.InsertNewOldClient(client, a.db, a.key)
	if err != nil {
		return models.Client{}
	}
	return res
}

func (a *App) EditClient(client models.Client) models.Client {

	if !a.authentification {
		return models.Client{}
	}
	res, err := appdatabase.ModifyClient(client, a.db, a.key)
	if err != nil {
		return models.Client{}
	}
	return res
}

func (a *App) EditEntry(entry models.Entry) models.Entry {

	if !a.authentification {
		return models.Entry{}
	}
	res, err := appdatabase.ModifyEntry(entry, a.db)
	if err != nil {
		return models.Entry{}
	}
	return res
}

func (a *App) CheckIDAvail(id int64, formerId int64) bool {
	result, err := appdatabase.IsIDInUse(a.db, formerId, id)
	if err != nil {
		return false
	}
	return result
}

func (a *App) CheckIDAvailNew(formerId int64) bool {
	result, err := appdatabase.IsIDInUseNew(a.db, formerId)
	if err != nil {
		return false
	}
	return result
}

func (a *App) RemoveEntry(id int64, modifier string) bool {
	if !a.authentification {
		return false
	}
	err := appdatabase.DeleteEntry(id, modifier, a.db)

	return err == nil
}

func (a *App) GetEntriesBetween(from int64, to int64) []models.Entry {
	if !a.authentification {
		return nil
	}
	res, err := appdatabase.GetEntriesBetween(from, to, a.db)
	if err != nil {
		return []models.Entry{}
	}
	return res
}

func saveToFile(path string, content *bytes.Buffer) error {

	if content == nil {
		return fmt.Errorf("content is nil")
	}

	// Write the buffer content to the file
	return os.WriteFile(path, content.Bytes(), 0644)
}

func (a *App) GetSummarySheet(summary models.SummaryData, defaultFilename string) bool {
	if !a.authentification {
		return false
	}
	file, err := excelwriter.GetSummarySheet(summary)
	if err != nil {
		fmt.Println(err)
		return false
	}
	options := runtime.SaveDialogOptions{
		DefaultFilename: defaultFilename,
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Excel-tiedostot (*.xlsx)",
				Pattern:     "*.xlsx",
			},
			{
				DisplayName: "All Files (*.*)",
				Pattern:     "*.*",
			},
		},
	}
	filePath, err := runtime.SaveFileDialog(a.ctx, options)
	if err != nil {
		fmt.Println(err)
		return false
	}
	saveToFile(filePath, file)
	return true
}

func (a *App) RecheckPassword(password string) bool {
	if !a.authentification {
		return false
	}
	hash, err := appdatabase.GetHash(a.db)
	if err != nil {
		return false
	}
	pass := utils.CheckPassword(strings.Trim(password, " "), hash)

	return pass
}

func (a *App) GetClientSheet(clientData models.ClientData, defaultFilename string) bool {
	if !a.authentification {
		return false
	}
	file, err := excelwriter.GetClientSheet(clientData)
	if err != nil {
		fmt.Println(err)
		return false
	}
	options := runtime.SaveDialogOptions{
		DefaultFilename: defaultFilename,
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Excel-tiedostot (*.xlsx)",
				Pattern:     "*.xlsx",
			},
			{
				DisplayName: "All Files (*.*)",
				Pattern:     "*.*",
			},
		},
	}
	filePath, err := runtime.SaveFileDialog(a.ctx, options)
	if err != nil {
		fmt.Println(err)
		return false
	}
	saveToFile(filePath, file)
	return true
}

func (a *App) HasPassword() bool {
	hash, err := appdatabase.GetHash(a.db)
	if err != nil {
		fmt.Println(err)
		return false
	}
	if hash == "" {
		return false
	}
	return true
}

func (a *App) NewPassword(password string) bool {
	hash, err := utils.HashPassword([]byte(strings.Trim(password, " ")))
	if err != nil {

		return false
	}
	_, err = appdatabase.InsertNewPassword(hash, a.db)
	if err != nil {
		return err == nil
	}
	return true
}

func (a *App) CheckPassword(password string) bool {
	hash, err := appdatabase.GetHash(a.db)
	if err != nil {
		return false
	}
	pass := utils.CheckPassword(strings.Trim(password, " "), hash)

	if pass {
		a.authentification = true
	}
	return pass
}

func (a *App) RestoreCheck() models.BackupInfo {
	if !a.authentification {
		return models.BackupInfo{Valid: false}
	}
	options := runtime.OpenDialogOptions{
		Filters: []runtime.FileFilter{
			{
				DisplayName: "varmuuskopio-tiedostot (*.dbb)",
				Pattern:     "*.dbb",
			},
			{
				DisplayName: "Kaikki tiedostot (*.*)",
				Pattern:     "*.*",
			},
		},
	}
	fileName, err := runtime.OpenFileDialog(a.ctx, options)
	if err != nil {
		runtime.EventsEmit(a.ctx, "failed", true)

	}
	backUp := models.BackupInfo{}
	backUp.Filename = fileName
	checkBackup := utils.IsValidBackup(backUp)
	return checkBackup
}
func (a *App) RestoreFromArchive(info models.BackupInfo) bool {
	if !a.authentification {
		return false
	}
	fmt.Println("restoring.........")
	database, err := utils.RestoreFromArchive(info)
	if err != nil {
		return false
	}
	fmt.Println(database)

	err = appdatabase.ResetTables(a.db)
	if err != nil {
		fmt.Println(err)
		return false
	}
	for _, value := range database.Entries {
		err = appdatabase.RecoverEntry(value, a.db)
		fmt.Println(err)
	}
	for _, value := range database.Clients {
		err = appdatabase.RecoverClient(value, a.db, a.key)
		fmt.Println(err)

	}

	return true
}
func (a *App) GetBackUp(encryption bool, password string) {
	if !a.authentification {
		return
	}
	result, err := appdatabase.GetBackup(a.db, a.key, encryption, password)
	if err != nil {
		return
	}
	options := runtime.SaveDialogOptions{
		DefaultFilename: "backup",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "varmuuskopio-tiedostot (*.dbb)",
				Pattern:     "*.dbb",
			},
			{
				DisplayName: "All Files (*.*)",
				Pattern:     "*.*",
			},
		},
	}
	filePath, err := runtime.SaveFileDialog(a.ctx, options)
	if err != nil {
		fmt.Println(err)
		return
	}
	saveToFile(filePath, result)
}

func (a *App) LogOut() {
	if !a.authentification {
		return
	}
	a.authentification = false
}
