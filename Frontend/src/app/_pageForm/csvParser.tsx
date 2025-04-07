"use client";

import { usePapaParse } from 'react-papaparse';


export default function CsvParser(csvText: string): Promise<string[][]> {
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
