import {Injectable} from '@angular/core';
import * as xlsx from 'xlsx';
import {utils, read} from "xlsx";


@Injectable({
  providedIn: 'root'
})
export class ImportFileService {

  constructor() {
  }
  isValidSheetFile(fileType: string): string{
    if(fileType !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && fileType !== 'text/csv'){
      return  "Invalid file type. Only CSV and XLSX files are allowed.";
    } else {
      return '';
    }
  }
  xlsxToJSON(workbook: any, columnNames: string[]): any{
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data: any[] = [];
    let refText ='!ref';
    const range = utils.decode_range(worksheet[refText]);

    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      const rowData: any = {};
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = utils.encode_cell({ r: row, c: col });
        const columnName = columnNames[col];
        if (worksheet[cellAddress]) {
          // rowData[columnName] = worksheet[cellAddress].v;
          const cellValue = worksheet[cellAddress].v;
          console.log(typeof cellValue);
          console.log(columnName);
          const date = new Date(44908);
          if (columnName === 'DeleveryDate' && typeof cellValue === 'number' && !isNaN(date.getTime())) {
            rowData[columnName] = xlsx.SSF.format('m/d/yyyy', cellValue);
          } else {
            rowData[columnName] = cellValue;
          }
        } else {
          rowData[columnName] = null;
        }
      }
      data.push(rowData);
    }
    return data;
  }
  csvToJSON(csv: any, columnNames: string[]): any{
    const lines = csv.split(/\r?\n|\r/);
    const result = [];
    let i = 1;
    for (i; i < lines.length; i++) {
      const obj: { [key: string]: string } = {};
      const currentLine = lines[i].split(',');

      for (let j = 0; j < columnNames.length; j++) {
        obj[columnNames[j]] = currentLine[j];

      }

      if (obj[columnNames[0]] !== '' && obj[columnNames[0]] !== undefined) {
        result.push(obj);
      }
    }
    return result;
  }
}
