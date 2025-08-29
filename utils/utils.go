package utils

import (
	"archive/zip"
	"bytes"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha1"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	mathrand "math/rand/v2"
	"os"
	"path/filepath"
	"runtime"
	"strconv"
	"time"

	"github.com/matthewhartstonge/argon2"
	"mappi-3.0/models"
)

const noSecret = "peruspassi"

func GetModifier() string {
	// Convert number to string
	data := strconv.FormatFloat(mathrand.Float64(), 'g', 8, 64) + strconv.FormatInt(time.Now().UnixNano(), 10) + "&HYYGälpåa?))"

	// Create a SHA1 hash
	hasher := sha1.New()
	hasher.Write([]byte(data))
	hash := hasher.Sum(nil)

	// Encode the hash to Base64
	base64Hash := base64.StdEncoding.EncodeToString(hash)

	return base64Hash
}

// GetAppDataFolder returns the hidden folder path for storing app-specific data
func GetAppDataFolder(appName string) (string, error) {
	var appDataDir string

	switch runtime.GOOS {
	case "windows":
		appDataDir = os.Getenv("APPDATA") // Get %APPDATA% directory
	case "darwin":
		homeDir, err := os.UserHomeDir()
		if err != nil {
			return "", fmt.Errorf("failed to get user home directory: %w", err)
		}
		appDataDir = filepath.Join(homeDir, "Library", "Application Support")
	case "linux":
		homeDir, err := os.UserHomeDir()
		if err != nil {
			return "", fmt.Errorf("failed to get user home directory: %w", err)
		}
		appDataDir = filepath.Join(homeDir, ".config")
	default:
		return "", fmt.Errorf("unsupported platform: %s", runtime.GOOS)
	}

	// Add the application name to the path
	finalPath := filepath.Join(appDataDir, appName)

	// Ensure the directory exists
	err := os.MkdirAll(finalPath, os.ModePerm)
	if err != nil {
		return "", fmt.Errorf("failed to create app data directory: %w", err)
	}
	return finalPath, nil
}

func HashPassword(password []byte) (string, error) {
	argon := argon2.DefaultConfig()
	encoded, err := argon.HashEncoded([]byte(password))
	if err != nil {
		return "", err
	}
	return string(encoded), nil
}

func CheckPassword(password string, passwordhash string) bool {
	ok, err := argon2.VerifyEncoded([]byte(password), []byte(passwordhash))
	if err != nil {
		return false
	}
	if ok {
		return true
	}
	return false
}

func Encrypt(stringToEncrypt string, keyString string) (encryptedString string) {

	//Since the key is in string, we need to convert decode it to bytes
	key, _ := hex.DecodeString(keyString)
	plaintext := []byte(stringToEncrypt)

	//Create a new Cipher Block from the key
	block, err := aes.NewCipher(key)
	if err != nil {
		panic(err.Error())
	}

	//Create a new GCM - https://en.wikipedia.org/wiki/Galois/Counter_Mode
	//https://golang.org/pkg/crypto/cipher/#NewGCM
	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		panic(err.Error())
	}

	//Create a nonce. Nonce should be from GCM
	nonce := make([]byte, aesGCM.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		panic(err.Error())
	}

	//Encrypt the data using aesGCM.Seal
	//Since we don't want to save the nonce somewhere else in this case, we add it as a prefix to the encrypted data. The first nonce argument in Seal is the prefix.
	ciphertext := aesGCM.Seal(nonce, nonce, plaintext, nil)
	return fmt.Sprintf("%x", ciphertext)
}

func Decrypt(encryptedString string, keyString string) (decryptedString string) {

	key, _ := hex.DecodeString(keyString)
	enc, _ := hex.DecodeString(encryptedString)

	//Create a new Cipher Block from the key
	block, err := aes.NewCipher(key)
	if err != nil {
		panic(err.Error())
	}

	//Create a new GCM
	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		panic(err.Error())
	}

	//Get the nonce size
	nonceSize := aesGCM.NonceSize()

	//Extract the nonce from the encrypted data
	nonce, ciphertext := enc[:nonceSize], enc[nonceSize:]

	//Decrypt the data
	plaintext, err := aesGCM.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		panic(err.Error())
	}

	return string(plaintext)
}

func generateSHA256(data []byte) string {
	hash := sha256.Sum256(data)
	return hex.EncodeToString(hash[:])
}

func passwordToPassHash(password string) string {
	keyB := sha256.Sum256([]byte("IBUYBSE" + password + "&%)(H#KVGmQ"))
	key := hex.EncodeToString(keyB[:])
	fmt.Println(key)
	return key
}

func CreateZipArchiveWithSHA256(data []byte, encryption bool, password string) (*bytes.Buffer, error) {
	var zipBuffer bytes.Buffer
	zipWriter := zip.NewWriter(&zipBuffer)
	var dataObject string
	if encryption {

		dataObject = Encrypt(string(data), passwordToPassHash(password))
	} else {
		dataObject = Encrypt(string(data), passwordToPassHash(noSecret))
	}
	// Add JSON file to the zip archive
	jsonFile, err := zipWriter.Create("data.json")
	if err != nil {
		return nil, fmt.Errorf("could not create JSON file in ZIP: %v", err)
	}
	if _, err := jsonFile.Write([]byte(dataObject)); err != nil {
		return nil, fmt.Errorf("could not write JSON file content: %v", err)
	}

	// Generate SHA-256 checksum
	checksum := generateSHA256(data)
	var encryptionContent string = "false"
	if encryption {
		encryptionContent = "true"
	}

	// Add SHA-256 checksum file to the zip archive
	checksumFile, err := zipWriter.Create("checksum.sha256")
	if err != nil {
		return nil, fmt.Errorf("could not create checksum file in ZIP: %v", err)
	}
	if _, err := checksumFile.Write([]byte(checksum)); err != nil {
		return nil, fmt.Errorf("could not write checksum content: %v", err)
	}
	encryptionFile, err := zipWriter.Create("encrypted")
	if err != nil {
		return nil, fmt.Errorf("could not create checksum file in ZIP: %v", err)
	}
	if _, err := encryptionFile.Write([]byte(encryptionContent)); err != nil {
		return nil, fmt.Errorf("could not write checksum content: %v", err)
	}

	// Close the zip writer and return the in-memory zip file
	if err := zipWriter.Close(); err != nil {
		return nil, fmt.Errorf("could not close zip writer: %v", err)
	}

	return &zipBuffer, nil
}
func contains[T comparable](slice []T, item T) bool {
	for _, v := range slice {
		if v == item {
			return true
		}
	}
	return false
}

func IsValidBackup(backupFile models.BackupInfo) models.BackupInfo {
	z, err := zip.OpenReader(backupFile.Filename)
	if err != nil {
		backupFile.Encrypted = false
		backupFile.Valid = false
		return backupFile
	}
	files := []string{}
	for _, file := range z.File {

		files = append(files, file.Name)
	}
	fmt.Println("Files:", files)
	if (len(files) == 3) && (contains(files, "data.json")) && (contains(files, "checksum.sha256")) && (contains(files, "encrypted")) {
		for _, file := range z.File {
			if file.Name == "encrypted" {
				fmt.Println("found encrypted")
				// Open the file inside the ZIP
				rc, err := file.Open()
				if err != nil {
					backupFile.Encrypted = false
					backupFile.Valid = false
					return backupFile
				}
				defer rc.Close()

				// Read the file's content
				var buf bytes.Buffer
				if _, err := io.Copy(&buf, rc); err != nil {
					backupFile.Encrypted = false
					backupFile.Valid = false
					return backupFile
				}
				content := buf.String()
				fmt.Println(content)
				if content == "true" {
					backupFile.Encrypted = true
					backupFile.Valid = true
					return backupFile
				} else if content == "false" {
					backupFile.Encrypted = false
					backupFile.Valid = true
					return backupFile
				}
			}
		}
		backupFile.Encrypted = false
		backupFile.Valid = false
		return backupFile
	}
	backupFile.Encrypted = false
	backupFile.Valid = false
	return backupFile
}
func compareHexStrings(hex1, hex2 string) (bool, error) {
	// Decode the first hex string
	bytes1, err := hex.DecodeString(hex1)
	if err != nil {
		return false, fmt.Errorf("failed to decode hex1: %v", err)
	}

	// Decode the second hex string
	bytes2, err := hex.DecodeString(hex2)
	if err != nil {
		return false, fmt.Errorf("failed to decode hex2: %v", err)
	}

	// Compare the byte slices
	return bytes.Equal(bytes1, bytes2), nil
}

func RestoreFromArchive(archieve models.BackupInfo) (models.BackUp, error) {
	z, err := zip.OpenReader(archieve.Filename)
	if err != nil {
		return models.BackUp{}, err
	}
	data := ""
	checksum := ""
	for _, file := range z.File {
		if file.Name == "data.json" {
			// Open the file inside the ZIP
			rc, err := file.Open()
			if err != nil {
				return models.BackUp{}, err
			}
			defer rc.Close()

			// Read the file's content
			var buf bytes.Buffer
			if _, err := io.Copy(&buf, rc); err != nil {
				return models.BackUp{}, err
			}
			data = buf.String()

		}
		if file.Name == "checksum.sha256" {
			// Open the file inside the ZIP
			rc, err := file.Open()
			if err != nil {
				return models.BackUp{}, err
			}
			defer rc.Close()

			// Read the file's content
			var buf bytes.Buffer
			if _, err := io.Copy(&buf, rc); err != nil {
				return models.BackUp{}, err
			}
			checksum = buf.String()
		}
	}
	if archieve.Encrypted {
		data = Decrypt(data, passwordToPassHash(archieve.Password))
	} else {
		data = Decrypt(data, passwordToPassHash(noSecret))
	}
	sumB := sha256.Sum256([]byte(data))
	sum := hex.EncodeToString(sumB[:])
	compare, err := compareHexStrings(sum, checksum)
	if err != nil {
		return models.BackUp{}, err
	}
	if !compare {
		return models.BackUp{}, fmt.Errorf("hash check failed")
	}
	var database models.BackUp

	// Unmarshal the JSON string into the struct
	err = json.Unmarshal([]byte(data), &database)
	if err != nil {
		return models.BackUp{}, err
	}
	fmt.Println(database)
	fmt.Println("Success")

	return database, nil
}

// func CheckZipEncryption(content *bytes.Buffer) ([]byte, error) {
// 	// Open the zip file for reading

// 	// Find the specific file inside the archive
// 	zipReader, err := zip.NewReader(bytes.NewReader(content.Bytes()), int64(content.Len()))
// 	if err != nil {
// 		return nil, err
// 	}
// 	for _, file := range zipReader.File {
// 		if file.Name == "encryption" {
// 			// Open the file inside the zip archive
// 			rc, err := file.Open()
// 			if err != nil {
// 				return nil, fmt.Errorf("failed to open file in zip: %v", err)
// 			}
// 			defer rc.Close()

// 			// Read the contents of the file into a buffer
// 			var buffer bytes.Buffer
// 			_, err = io.Copy(&buffer, rc)
// 			if err != nil {
// 				return nil, fmt.Errorf("failed to read file content: %v", err)
// 			}

// 			// Return the file content as bytes
// 			return buffer.Bytes(), nil
// 		}
// 	}

// 	return nil, fmt.Errorf("file %s not found in the zip", fileName)
// }
