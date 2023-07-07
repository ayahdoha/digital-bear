import { Component, OnInit,  ViewChild, ElementRef } from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import * as xlsx from 'xlsx';

import APIS from '../../../app/apis';
import {Product} from "../../models/product.interface";
import {ApiClientService} from "../../services/api-client.service";
import {utils, read} from "xlsx";

const columnNames = ['ProductName' , 'BrandName', 'Quantity', 'DeleveryDate', 'Email'];
@Component({
  selector: 'app-fetch-bulk-products',
  templateUrl: './fetch-bulk-products.component.html',
  styleUrls: ['./fetch-bulk-products.component.scss']
})
export class FetchBulkProductsComponent implements OnInit {
  @ViewChild('deleveryDateInput', { static: false }) deleveryDateInput!: ElementRef<HTMLInputElement>;

  showProcessing:boolean = false;
  progress:number = 0;
  bulkProductsForm: FormGroup = new FormGroup({file: new FormControl('', [Validators.required])});
  inValidProductsForm: FormGroup = new FormGroup({});
  submitted:boolean = false;
  data: any;
  errorMsg:string = '';
  fileUpload:boolean = false;
  submitting:boolean = false;
  showUploadForm:boolean = true;
  showProcessingCSV:boolean = false;
  showCounters:boolean = false;
  showFailedDetails = false;
  fileToProcess: any;
  productsList: any;
  correctProductsArray: Product[] = [];
  wrongProductsArray: Product[] = [];
  message:string = '';
  isDrag:boolean = false;
  showInvalidProducts:boolean = false;
  constructor(private formBuilder: FormBuilder,
              private api: ApiClientService) {
  }
  ngOnInit(): void {
  }
  get f() { return this.bulkProductsForm.controls; }
  onFileDropped($event: any): void {
    this.prepareFilesList($event);
  }
  prepareFilesList(files: Array<any>): void{
    this.showProcessing = false;
    this.message = '';
    var mimeType = files[0].type;
    console.log(files[0]);
    console.log(mimeType);
    if (mimeType !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && mimeType !== 'text/csv') {
      this.message = "Invalid file type. Only CSV and XLSX files are allowed.";
      return;
    } else {
      this.fileToProcess = files[0];
      this.bulkProductsForm.get('file')?.setValidators(null);
      this.isDrag = true;
      console.log(this.fileToProcess);
      if(mimeType === 'text/csv'){
        this.uploadFilesSimulator();
      } else {
        this.handleXlsxFile();
      }
    }

  }
  handleXlsxFile(): void{
    this.showProcessing = true;
    this.progress = 0;
      const fileReader = new FileReader();

      fileReader.onload = (e: ProgressEvent<FileReader>) => {
        const workbook = read(new Uint8Array(e.target?.result as ArrayBuffer));
        this.productsList = this.xlsxToJSON(workbook);
        this.checkValidProducts();
        console.log(this.productsList);
        console.log(this.correctProductsArray);
        console.log(this.wrongProductsArray);
      };
      fileReader.readAsArrayBuffer(this.fileToProcess);
  }
  xlsxToJSON(workbook: any): any{
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const columnNames = ['ProductName', 'BrandName', 'Quantity', 'DeleveryDate', 'Email'];
    const data: any[] = [];
    let refText ='!ref';
    const range = utils.decode_range(worksheet[refText]);

    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      const rowData: any = {};
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = utils.encode_cell({ r: row, c: col });
        const columnName = columnNames[col];
        this.getProgress(col, range.e.r);
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
  deleteFile(): void{
    this.progress = 0;
    this.submitted = false;
    this.fileToProcess = null;
    this.bulkProductsForm.get('file')?.setValue(null);
    this.bulkProductsForm.get('file')?.setValidators([Validators.required]);
    this.bulkProductsForm.get('file')?.updateValueAndValidity();
    this.isDrag = false;
  }
  startOverReset():void {
    this.deleteFile();
    this.productsControls.clear();
    this.showCounters = false;
    this.showUploadForm = true;
    this.showFailedDetails = false;
    this.productsList.length = 0;
    this.correctProductsArray.length = 0;
    this.wrongProductsArray.length = 0;
    this.showInvalidProducts = false;
  }
  uploadFilesSimulator(): void{
    this.showProcessing = true;
    this.progress = 0;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      console.log(text);
      // convert text to json here
      this.productsList = this.csvToJSON(text);
      this.checkValidProducts();
      console.log(this.productsList);
      console.log(this.correctProductsArray);
      console.log(this.wrongProductsArray);
    };
    reader.readAsText(this.fileToProcess);
  }
  onFileSelect(event: any): void{
    this.message = '';
    this.showProcessing = false;
    this.fileUpload = this.bulkProductsForm.value.file;
    this.fileToProcess = event.target.files[0];
    //console.log(this.fileToProcess);

    var mimeType = this.fileToProcess.type;
    console.log(this.fileToProcess.type);
    if (mimeType !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && mimeType !== 'text/csv') {
      this.message = "Invalid file type. Only CSV and XLSX files are allowed.";
      return;
    } else {
      if(mimeType === 'text/csv'){
        this.uploadFilesSimulator();
      } else {
        this.handleXlsxFile();
      }

    }
  }
  csvToJSON(csv: any): any{
    const lines = csv.split(/\r?\n|\r/);
    const result = [];
    let i = 1;
    for (i; i < lines.length; i++) {
      const obj: { [key: string]: string } = {};
      const currentLine = lines[i].split(',');

        for (let j = 0; j < columnNames.length; j++) {
          obj[columnNames[j]] = currentLine[j];
          this.getProgress(j, lines.length);
        }

      if (obj[columnNames[0]] !== '' && obj[columnNames[0]] !== undefined) {
        result.push(obj);
      }
    }
    return result;
  }
  processData(): void{
    debugger
    this.submitted = true;
    if (this.bulkProductsForm.invalid && !this.isDrag) {
      return;
    }
    this.showUploadForm = false;
    this.showProcessingCSV = true;
  }
  getProgress(currentLine: number, totalLines: number): void{
    setTimeout(() => {

      const progressInterval = setInterval(() => {
        if (this.progress === 100) {
          clearInterval(progressInterval);
        } else {
          this.progress = Math.round(currentLine / totalLines * 100);;
        }
      }, 100);

    }, 400);
  }
  checkValidProducts(): void{
    this.productsList.forEach((element: any) => {
      let product: Product = {
        productName: element.ProductName,
        brandName: element.BrandName,
        quantity: element.Quantity + '',
        deleveryDate: element.DeleveryDate,
        email: element.Email
      };
      if ((this.validateProductName(product.productName)
        && this.validateBrandName(product.brandName)
        && this.validateQuantity(product.quantity)
        && this.validateDeliveryDate(product.deleveryDate)
        && this.validateEmail(product.email))) {
        this.correctProductsArray.push(product)
      } else {
        this.wrongProductsArray.push(product);
      }
    });

    this.inValidProductsForm = this.formBuilder.group({
      productsControls: this.formBuilder.array([])
    });
      this.wrongProductsArray.forEach((product, index) => this.addProductControls(index));
  }


  get productsControls(): FormArray{
    return this.inValidProductsForm.get('productsControls') as FormArray;
  }

  addProductControls(index: number) : void{
    const productGroup = this.formBuilder.group({
      productName: [this.wrongProductsArray[index].productName, Validators.required],
      brandName: [this.wrongProductsArray[index].brandName, Validators.required],
      quantity: [this.wrongProductsArray[index].quantity, Validators.required],
      deleveryDate: [this.wrongProductsArray[index].deleveryDate, Validators.required],
      email: [this.wrongProductsArray[index].email, [Validators.required, Validators.email]]
    });

    this.productsControls.push(productGroup);
  }
  validateProductName(productName: string) {
    return productName && productName !== "";
  }
  validateBrandName(brandName: string) {
    return brandName && brandName !== "";
  }
  validateQuantity(quantity: string | number) {
    return quantity && !isNaN(Number(quantity));
  }
  validateDeliveryDate(deliveryDate: string) {
    if(deliveryDate && deliveryDate !== ""){
      const regex1 = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/\d{4}$/; // date format mm/dd/yyyy
      const regex2 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;  // ISO date like 2023-07-06T13:25:20.095Z
      return (regex1.test(deliveryDate) || regex2.test(deliveryDate));
    } else {
      return  false;
    }
  }
  validateEmail(email: string) {
    const EMAIL_REGEXP = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i;
    return (email && EMAIL_REGEXP.test(email));
  }


  async saveProducts(): Promise<void> {
    if (!this.inValidProductsForm.valid) {
      console.log('invalid');
      return ;
    } else {
      console.log('Valid');
      const dateValue = this.deleveryDateInput.nativeElement.value;
      const date = new Date(dateValue);
      const isoDate = date.toISOString();
      console.log(isoDate);
      this.productsControls.controls.forEach((productGroup, index) => {
        let product: Product = {
          productName: productGroup.get('productName')?.value,
          brandName: productGroup.get('brandName')?.value,
          quantity: productGroup.get('quantity')?.value,
          deleveryDate: productGroup.get('deleveryDate')?.value,
          email: productGroup.get('email')?.value
        };
        this.wrongProductsArray[index] = product;
      });

       let finalValidProductList = [...this.correctProductsArray, ...this.wrongProductsArray];
       try {
         const result = await this.api.call({
           path: APIS.IMPORT_PRODUCT_LIST,
           method: 'POST',
           data: {
             files: finalValidProductList
           }
         });
           console.log(result);
       } catch (e) {
         console.log(e);
       }
    }

  }

}
