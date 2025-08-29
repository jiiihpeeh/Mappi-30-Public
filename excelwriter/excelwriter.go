package excelwriter

import (
	"bytes"
	"fmt"
	"strconv"
	"time"

	"github.com/xuri/excelize/v2"
	"mappi-3.0/models"
)

func excelDate(unixTime int64) int64 {
	t := time.Unix(unixTime, 0)

	// Excel serial date starts from January 1, 1900
	excelDate := float64(t.Unix())/86400 + 25569 // Days since 1900-01-01
	return int64(excelDate)
}

func clientState(state bool) string {
	if state {
		return "✔"
	}
	return "❌"
}

func GetClientSheet(data models.ClientData) (*bytes.Buffer, error) {
	// Create a new spreadsheet
	f := excelize.NewFile()
	sheet := strconv.FormatInt(data.Client.FormerID, 10) + "-" + data.Client.Name
	// Create a new sheet
	err := f.SetSheetName(f.GetSheetName(0), sheet)
	if err != nil {
		return nil, err
	}

	origWidth, _ := f.GetColWidth(sheet, "A")

	f.SetColWidth(sheet, "D", "E", origWidth*2.0)
	f.SetColWidth(sheet, "C", "C", origWidth*2.0)
	f.SetColWidth(sheet, "B", "B", origWidth*1.5)
	f.SetColWidth(sheet, "A", "A", origWidth*2.5)

	if err = f.SetCellValue(sheet, "C1", "Asiakasnumero"); err != nil {
		return nil, fmt.Errorf("failed to set cell valu: %w", err)
	}
	if err = f.SetCellValue(sheet, "D1", data.Client.FormerID); err != nil {
		return nil, fmt.Errorf("failed to set cell valu: %w", err)
	}
	// Write some data to one of the cells
	headerStyle, err := f.NewStyle(&excelize.Style{
		Fill: excelize.Fill{
			Type:    "pattern",
			Color:   []string{"#00FF00"},
			Pattern: 1,
		},
	})
	if err != nil {
		return nil, err
	}
	headers := []string{"Nimi", "Osoite", "Puhelin", "Sähköposti", "Lisätietoa"}
	var start int = 2
	for i, header := range headers {
		cell := fmt.Sprintf("A%d", i+1+start)
		if err = f.SetCellValue(sheet, cell, header); err != nil {
			return nil, fmt.Errorf("failed to set cell value for %s: %w", cell, err)
		}

	}
	clientValues := []string{data.Client.Name, data.Client.Address, data.Client.Phone, data.Client.Email, data.Client.Information}
	for i, header := range clientValues {
		cell := fmt.Sprintf("B%d", i+1+start)
		if err = f.SetCellValue(sheet, cell, header); err != nil {
			return nil, fmt.Errorf("failed to set cell value for %s: %w", cell, err)
		}
	}

	if err = f.SetCellValue(sheet, "B8", "Kannattaja"); err != nil {
		return nil, fmt.Errorf("failed to set cell value : %w", err)
	}
	if err = f.SetCellValue(sheet, "C8", clientState(data.Client.Supporter)); err != nil {
		return nil, fmt.Errorf("failed to set cell value : %w", err)
	}
	if err = f.SetCellValue(sheet, "D8", "Aktiivinen"); err != nil {
		return nil, fmt.Errorf("failed to set cell value: %w", err)
	}
	if err = f.SetCellValue(sheet, "E8", clientState(data.Client.ActiveSupporter)); err != nil {
		return nil, fmt.Errorf("failed to set cell value : %w", err)
	}

	tableHeaders := []string{"Päivämäärä", "Tekstiili (kg)", "Materiaali (kg)"}

	for i, header := range tableHeaders {
		cell := fmt.Sprintf("%c10", 'B'+i)
		if err = f.SetCellValue(sheet, cell, header); err != nil {
			return nil, fmt.Errorf("failed to set cell value for %s: %w", cell, err)
		}
		if err := f.SetCellStyle(sheet, cell, cell, headerStyle); err != nil {
			return nil, fmt.Errorf("failed to set cell style for %s: %w", cell, err)
		}
	}
	pane := excelize.Panes{
		Freeze:      true,
		YSplit:      10,
		TopLeftCell: "B10",
		ActivePane:  "bottomLeft",
	}
	if err := f.SetPanes(sheet, &pane); err != nil {
		fmt.Println("Failed to freeze panes:", err)
		return nil, err
	}

	if err := f.MergeCell(sheet, "B3", "E3"); err != nil {
		return nil, fmt.Errorf("failed to merge cells: %w", err)
	}
	if err := f.MergeCell(sheet, "B4", "E4"); err != nil {
		return nil, fmt.Errorf("failed to merge cells: %w", err)
	}
	if err := f.MergeCell(sheet, "B5", "E5"); err != nil {
		return nil, fmt.Errorf("failed to merge cells: %w", err)
	}
	if err := f.MergeCell(sheet, "B6", "E6"); err != nil {
		return nil, fmt.Errorf("failed to merge cells: %w", err)
	}
	if err := f.MergeCell(sheet, "B7", "E7"); err != nil {
		return nil, fmt.Errorf("failed to merge cells: %w", err)
	}
	exp := "DD.MM.YYYY;@"
	dateStyle, err := f.NewStyle(&excelize.Style{CustomNumFmt: &exp})
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	var datarow int = 10
	for _, entry := range data.Entries {
		datarow = datarow + 1
		f.SetCellValue(sheet, fmt.Sprintf("B%d", datarow), excelDate(entry.Date))
		err = f.SetCellStyle(sheet, fmt.Sprintf("B%d", datarow), fmt.Sprintf("A%d", datarow), dateStyle)
		if err != nil {
			return nil, err
		}
		f.SetCellValue(sheet, fmt.Sprintf("C%d", datarow), entry.Textile)
		f.SetCellValue(sheet, fmt.Sprintf("D%d", datarow), entry.Material)
	}
	// Save the file to an in-memory buffer
	var buffer bytes.Buffer
	if err := f.Write(&buffer); err != nil {
		return nil, fmt.Errorf("failed to save file to memory: %w", err)
	}

	return &buffer, nil
}

func GetSummarySheet(summary models.SummaryData) (*bytes.Buffer, error) {
	f := excelize.NewFile()

	// Set the active sheet
	sheet := "Yhteenveto"

	f.SetSheetName(f.GetSheetName(0), sheet)

	// Write headers
	headerStyle, err := f.NewStyle(&excelize.Style{
		Fill: excelize.Fill{
			Type:    "pattern",
			Color:   []string{"#00FF00"}, // Pink background
			Pattern: 1,
		},
	})
	if err != nil {
		return nil, err
	}
	headers := []string{"Päivämäärä", "Asiakas", "Asiakasnumero", "Tekstiili (kg)", "Materiaali (kg)"}
	for i, header := range headers {
		cell := fmt.Sprintf("%c1", 'A'+i) // Columns A, B, C, ...
		f.SetCellValue(sheet, cell, header)
		f.SetCellStyle(sheet, cell, cell, headerStyle)
	}
	origWidth, _ := f.GetColWidth(sheet, "A")

	f.SetColWidth(sheet, "C", "C", origWidth*1.5)

	f.SetColWidth(sheet, "D", "E", origWidth*2.0)
	f.SetColWidth(sheet, "B", "B", origWidth*4.0)
	f.SetColWidth(sheet, "A", "A", origWidth*2.5)

	pane := excelize.Panes{
		Freeze:      true,
		YSplit:      1,
		TopLeftCell: "A2",
		ActivePane:  "bottomLeft",
	}
	if err := f.SetPanes(sheet, &pane); err != nil {
		fmt.Println("Failed to freeze panes:", err)
		return nil, err
	}
	exp := "DD.MM.YYYY;@"
	dateStyle, err := f.NewStyle(&excelize.Style{CustomNumFmt: &exp})
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	// // Write the data rows
	var row int
	for rowIndex, entry := range summary.Summary {
		row = rowIndex + 2
		f.SetCellValue(sheet, fmt.Sprintf("A%d", row), excelDate(entry.Date))
		err = f.SetCellStyle(sheet, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), dateStyle)
		if err != nil {
			return nil, err
		}
		f.SetCellValue(sheet, fmt.Sprintf("B%d", row), entry.ClientName)
		f.SetCellValue(sheet, fmt.Sprintf("C%d", row), entry.ClientFormerID)
		f.SetCellValue(sheet, fmt.Sprintf("D%d", row), entry.Textile)
		f.SetCellValue(sheet, fmt.Sprintf("E%d", row), entry.Material)
	}

	endStyle, err := f.NewStyle(&excelize.Style{
		Fill: excelize.Fill{
			Type:    "pattern",
			Color:   []string{"#0096FF"},
			Pattern: 1,
		},
	})
	if err != nil {
		return nil, err
	}
	startDate := time.Unix(summary.StartDate, 0)
	endDate := time.Unix(summary.EndDate, 0)
	f.SetCellValue(sheet, fmt.Sprintf("A%d", row+1), startDate.Format("02.01.2006")+"-"+endDate.Format("02.01.2006"))
	f.SetCellValue(sheet, fmt.Sprintf("B%d", row+1), "Yhteensä")
	if err := f.SetCellFormula(sheet, fmt.Sprintf("D%d", row+1), "SUM(D2:"+fmt.Sprintf("D%d", row)+")"); err != nil {
		fmt.Println("Failed to set formula:", err)
		return nil, err
	}

	if err := f.SetCellFormula(sheet, fmt.Sprintf("E%d", row+1), "SUM(E2:"+fmt.Sprintf("E%d", row)+")"); err != nil {
		fmt.Println("Failed to set formula:", err)
		return nil, err
	}
	columns := []string{"A", "B", "C", "D", "E"}

	for _, col := range columns {
		cell := fmt.Sprintf("%s%d", col, row+1)
		if err := f.SetCellStyle(sheet, cell, cell, endStyle); err != nil {
			return nil, fmt.Errorf("failed to set cell style for %s: %w", cell, err)
		}
	}

	// Save the file to an in-memory buffer
	var buffer bytes.Buffer
	if err := f.Write(&buffer); err != nil {
		return nil, fmt.Errorf("failed to save file to memory: %w", err)
	}
	return &buffer, nil
}
