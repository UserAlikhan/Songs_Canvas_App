import fs from 'fs'
import csv from 'csv-parser'

export async function readCSV(filePath: string): Promise<any[]> {
    const results: any[] = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on("end", () => resolve(results))
            .on('error', (error) => reject(error))
        })
}