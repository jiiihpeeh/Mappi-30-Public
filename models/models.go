package models

type Entry struct {
	ID       int64   `json:"id"`       // Unique identifier for the entry
	Date     int64   `json:"date"`     // Unix timestamp for the entry date
	Textile  float64 `json:"textile"`  // Weight of textiles in kilograms
	Material float64 `json:"material"` // Weight of materials in kilograms
	Modifier string  `json:"modifier"` // Unix timestamp for the last modification
	ClientID int64   `json:"clientId"` // Identifier for the associated client
}
type Client struct {
	ID              int64  `json:"id"`
	FormerID        int64  `json:"formerId"`
	Name            string `json:"name"`
	Address         string `json:"address"`
	Supporter       bool   `json:"supporter"`
	ActiveSupporter bool   `json:"activeSupporter"`
	Phone           string `json:"phone"`
	Email           string `json:"email"`
	Information     string `json:"information"`
	Modifier        string `json:"modifier"`
}

type BackUp struct {
	Clients   []Client `json:"clients"`
	Entries   []Entry  `json:"entries"`
	Encrypted bool     `json:"encrypted"`
}

type Between struct {
	From int64 `json:"from"`
	To   int64 `json:"to"`
}

type Summary struct {
	EntryID        int     `json:"entryId"`        // Maps to `entryId`
	Date           int64   `json:"date"`           // Maps to `date`
	ClientName     string  `json:"clientName"`     // Maps to `clientName`
	ClientID       int64   `json:"clientId"`       // Maps to `clientId`
	ClientFormerID int64   `json:"clientFormerId"` // Maps to `clientFormerId`
	Textile        float64 `json:"textile"`        // Maps to `textile`
	Material       float64 `json:"material"`       // Maps to `material`
}

type SummaryData struct {
	Summary   []Summary `json:"summary"`
	StartDate int64     `json:"startDate"`
	EndDate   int64     `json:"endDate"`
}

type ClientData struct {
	Client  Client  `json:"client"`
	Entries []Entry `json:"entries"`
}

type BackupInfo struct {
	Filename  string `json:"fileName"`
	Encrypted bool   `json:"encrypted"`
	Valid     bool   `json:"valid"`
	Password  string `json:"password"`
}
