import axios from "axios";
import { ClientData, ClientInfo, Entry, useClient } from "./stores/clientInfoStore";
import { SummaryData, SummaryInfo } from "./stores/summaryStore";
import { formatDate } from "./utils";
//import { useNotification } from "./stores/notificationStore";
import {GetAllClients, GetClientEntries, InsertNewEntry, InsertClient, InsertOldClient, EditClient, EditEntry, RemoveEntry, GetEntriesBetween, GetSummarySheet, GetClientSheet } from "../wailsjs/go/main/App";
import { models } from "../wailsjs/go/models";

// Define your API client with a base URL (replace with your production URL if needed)
const api = axios.create({
  baseURL: "http://localhost:3001/api", // Replace with your server URL
  headers: {
    "Content-Type": "application/json", // Make sure to set the proper content type
  },
});

// You might need to modify axios to handle credentials if you're using cookies
// api.defaults.withCredentials = true; // Uncomment if using cookies or sessions

// Fetch clients
export async function getClients (): Promise<ClientData[]>  {
  try {
    const response = await GetAllClients();
    //useNotification.setState({ message: "minä tääällä tänään"})
    return response as ClientData[]
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw error;
  }
}

// Fetch entries for a specific client
export async function getClientEntries(id: number): Promise<Entry[]> {
  try {
    const response = await GetClientEntries(id);
    return response as Entry[]
  } catch (error) {
    console.error(`Error fetching entries for client ${id}:`, error);
    throw error;
  }
}

// Insert a new entry
export async function insertEntry(entryData: Entry): Promise<Entry>  {
  try {
    const response = await InsertNewEntry(entryData);
    return response as Entry
  } catch (error) {
    console.error("Error inserting entry:", error);
    throw error;
  }
}

// Insert a new client
export async function insertClient(clientData: ClientData): Promise<ClientData>  {
  try {
    const response = await InsertClient(clientData);
    return response
  } catch (error) {
    console.error("Error inserting client:", error);
    throw error;
  }
}

export async function insertOldClient(clientData: ClientData): Promise<ClientData>  {
  try {
    const response = await InsertOldClient(clientData);
    return response
  } catch (error) {
    console.error("Error inserting old client:", error);
    throw error;
  }
}

// Modify an entry
export async function modifyEntry(id: number, entryData: Entry): Promise<Entry>  {
  try {
    const response = await EditEntry(entryData);
    return response
  } catch (error) {
    console.error(`Error modifying entry ${id}:`, error);
    throw error;
  }
}

// Modify a client
export async function modifyClient(id: number, clientData: ClientData): Promise<ClientData>  {
  try {
    const response = await EditClient(clientData);
    return response
  } catch (error) {
    console.error(`Error modifying client ${id}:`, error);
    throw error;
  }
}

// Delete an entry
export async function deleteEntry(id: number): Promise<void> {
  let modifier = useClient.getState().entries.filter(e => e.id === id)[0].modifier;
  if (!modifier) {
    console.warn("Modifier not found for entry:", id);
    return;
  }

  try {
    const response = await RemoveEntry(id, modifier);
    if (! response){
      throw new Error(`Modifier not found for entry: ${id}`);
    }
  } catch (error) {
    console.error(`Error deleting entry ${id}:`, error);
    throw error;
  }
}

// Fetch entries between two timestamps
export async function getEntriesBetween(from: number, to: number): Promise<Entry[]> {
  try {
    const response = await GetEntriesBetween(from, to);
    return response
  } catch (error) {
    console.error("Error fetching entries between timestamps:", error);
    throw error;
  }
}

export async function restoreBackup(backup: ArrayBuffer, file: File): Promise<void> {
  const blob = new Blob([backup], { type: file.type });

  // Create a FormData object and append the file (as a Blob)
  const formData = new FormData();
  formData.append('file', blob, file.name)
  try {
    const response = await api.post(`/restore/` , formData, {
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    })
    return response.data;
  } catch (error) {
    console.error("Error fetching entries between timestamps:", error);
    throw error;
  }
}
 
 
// Fetch entries between two timestamps
export async function getClientSheet(clientInfo: ClientInfo ): Promise<void> {
  try {
    let name = `Asiakas-${clientInfo.client.name.slice(0, 15).replace(/ /g, '_')}_${clientInfo.client.formerId}-${formatDate()}.xlsx`
    const response = await GetClientSheet(clientInfo as models.ClientData,name)

  } catch (error) {
    console.error("Error downloading the Excel file:", error);
  }
  return
}
// Fetch entries between two timestamps
export async function getSummarySheet(summary: SummaryInfo): Promise<void> {
  try {
    let name = `Yhteenveto-${formatDate()}.xlsx`
    const response = await GetSummarySheet( summary as models.SummaryData, name)

  } catch (error) {
    console.error("Error downloading the Excel file:", error);
  }
}

export async function getBackup(): Promise<void> {
  try {
    // Make the GET request to fetch the Excel file as a blob
    const response = await api.get(`/backup/`, {
      responseType: "blob", // Ensure we receive the file as binary data
    });

    // Create a URL object for the downloaded file
    const blob = new Blob([response.data], {
      type: "application/octet-stream",
    });
    const downloadUrl = URL.createObjectURL(blob);

    // Create a temporary link to trigger the download
    const link = document.createElement("a");
    link.href = downloadUrl;

    // Extract the filename from the `Content-Disposition` header, if available
    const contentDisposition = response.headers["content-disposition"];
    const filenameMatch = contentDisposition?.match(/filename="?(.+)"?/);
    const filename = filenameMatch ? filenameMatch[1] : `Varmuuskopio-${formatDate()}.dbb`;

    link.download = filename; // Set the downloaded filename
    document.body.appendChild(link);
    link.click(); // Trigger the download
    document.body.removeChild(link); // Clean up the link
    URL.revokeObjectURL(downloadUrl); // Revoke the object URL
  } catch (error) {
    console.error("Error downloading the Excel file:", error);
  }
}