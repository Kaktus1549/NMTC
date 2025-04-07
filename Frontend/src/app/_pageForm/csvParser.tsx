"use client";

import { usePapaParse } from 'react-papaparse';


export function CsvParser(csvText: string): Promise<string[][]> {
    const { readString } = usePapaParse();
    return new Promise((resolve, reject) => {
        readString(csvText, {
            worker: true,
            complete: (results: { data: string[][] }) => {
                resolve(results.data);
            },
            error: (error: any) => {
                reject(error);
            }
        });
    });
};

export function JsonToCSV(json: any[]): Promise<string>{
    const { jsonToCSV } = usePapaParse();
    return new Promise((resolve, reject) => {
        try {
            const csv = jsonToCSV(json);
            resolve(csv);
        } catch (error) {
            reject(error);
        }
    });
}