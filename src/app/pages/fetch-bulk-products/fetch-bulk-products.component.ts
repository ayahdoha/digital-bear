import { Component, OnInit,  ViewChild, ElementRef } from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Product} from "../../models/product.interface";
import {ApiClientService} from "../../services/api-client.service";
import {utils, read} from "xlsx";
import {ImportFileService} from "../../services/import-file.service";
import * as moment from 'moment';
import {BehaviorSubject} from 'rxjs';
const columnNames = ['ProductName' , 'BrandName', 'Quantity', 'DeleveryDate', 'Email'];
@Component({
  selector: 'app-fetch-bulk-products',
  templateUrl: './fetch-bulk-products.component.html',
  styleUrls: ['./fetch-bulk-products.component.scss']
})
export class FetchBulkProductsComponent implements OnInit {
  @ViewChild('deleveryDateInput', { static: false }) deleveryDateInput!: ElementRef<HTMLInputElement>;
  saveProductsMsg = new BehaviorSubject<string>('');
  saveProductsMsgSuccessfully = new BehaviorSubject<string>('');
  submitting = new BehaviorSubject<boolean>(false);
  showProcessing:boolean = false;
  progress:number = 0;
  bulkProductsForm: FormGroup = new FormGroup({file: new FormControl('', [Validators.required])});
  inValidProductsForm: FormGroup = new FormGroup({});

  data: any;
  errorMsg:string = '';
  fileUpload:boolean = false;

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
              private api: ApiClientService,
              private importFileService: ImportFileService) {
  }
  ngOnInit(): void {
  }

  onFileDropped($event: any): void {
    this.prepareFilesList($event);
  }
  prepareFilesList(files: Array<any>): void{
    this.message = '';
    this.showProcessing = false;
    let mimeType = files[0].type;
    console.log(files[0]);
    console.log(mimeType);
    this.message = this.importFileService.isValidSheetFile(mimeType);
    if (this.message === '') {
      this.fileToProcess = files[0];
      this.bulkProductsForm.get('file')?.setValidators(null);
      this.isDrag = true;
      console.log(this.fileToProcess);
      this.uploadFilesSimulator(mimeType);
    }

  }
  onFileSelect(event: any): void{
    this.message = '';
    this.showProcessing = false;
    this.fileUpload = this.bulkProductsForm.value.file;
    this.fileToProcess = event.target.files[0];
    let mimeType = this.fileToProcess.type;
    console.log(this.fileToProcess.type);
    this.message = this.importFileService.isValidSheetFile(mimeType);
    if (this.message === '') {
      this.uploadFilesSimulator(mimeType);
    }
  }

  uploadFilesSimulator(fileType: string): void{
    this.showProcessing = true;
    this.progress = 0;
    const reader = new FileReader();
    reader.onprogress = (event: ProgressEvent<FileReader>) => {
      if (event.lengthComputable) {
        const percentage = Math.round((event.loaded / event.total) * 100);
        this.progress = percentage;
      }
    };
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const workbook = read(new Uint8Array(e.target?.result as ArrayBuffer));
      const text = reader.result;
      console.log(text);
      if(fileType === 'text/csv'){
        this.productsList = this.importFileService.csvToJSON(text, columnNames);
      } else{
        this.productsList = this.importFileService.xlsxToJSON(workbook, columnNames);
      }

      this.checkValidProducts();
      console.log(this.productsList);
      console.log(this.correctProductsArray);
      console.log(this.wrongProductsArray);
    };
    if(fileType === 'text/csv'){
      reader.readAsText(this.fileToProcess);
    } else{
      reader.readAsArrayBuffer(this.fileToProcess);
    }


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
      deleveryDate: [moment(this.wrongProductsArray[index].deleveryDate, 'M/D/YYYY').format('YYYY-MM-DD'), Validators.required],
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
      const regex1 = /^(0?[1-9]|1[0-2])\/(0?[1-9]|1\d|2\d|3[01])\/\d{4}$/; // date format mm/dd/yyyy
      const regex2 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;  // ISO date like 2023-07-06T13:25:20.095Z
      const regex3 = /^\d{4}-(?:0?[1-9]|1[0-2])-(?:0?[1-9]|[12]\d|3[01])$/; // date format yyyy-mm-dd
      return (regex1.test(deliveryDate) || regex2.test(deliveryDate) || regex3.test(deliveryDate));
    } else {
      return  false;
    }
  }
  validateEmail(email: string) {
    const EMAIL_REGEXP = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i;
    return (email && EMAIL_REGEXP.test(email));
  }
   saveProducts() {
     this.submitting.next(true);
     this.saveProductsMsg.next('');
     this.saveProductsMsgSuccessfully.next('');
    if (!this.inValidProductsForm.valid) {
      this.submitting.next(false);
      this.saveProductsMsg.next('Please check invalid fields');
      console.log('invalid');
      return;
    } else {
      this.correctProductsArray.forEach((element, index) => {
          element.deleveryDate = moment(element.deleveryDate, 'MM/DD/YYYY').toISOString();
          console.log(element.deleveryDate);
      });
      console.log('Valid');
      const dateValue = this.deleveryDateInput.nativeElement.value;
      const isoDate =  moment(dateValue).toISOString();
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
         let apiBody = {
        files: finalValidProductList
      };

         this.api.importProductList(apiBody).subscribe(
           (response) => {
             // Handle the response data
             this.submitting.next(false);
             this.saveProductsMsgSuccessfully.next('Products saved successfully');
             console.log(response);
           },
           (error) => {
             // Handle any errors
             this.submitting.next(false);
             this.saveProductsMsg.next('Something went wrong');
             console.error(error);
           }
         );

       } catch (e) {
         this.submitting.next(false);
         console.log(e);
       }
    }

  }

  startOverReset():void {
    this.deleteFile();
    this.productsControls.clear();
    this.submitting.next(false);
    this.saveProductsMsg.next('');
    this.saveProductsMsgSuccessfully.next('');
    this.showCounters = false;
    this.showUploadForm = true;
    this.showFailedDetails = false;
    this.productsList.length = 0;
    this.correctProductsArray.length = 0;
    this.wrongProductsArray.length = 0;
    this.showInvalidProducts = false;
  }
  deleteFile(): void{
    this.progress = 0;
    this.fileToProcess = null;
    this.bulkProductsForm.get('file')?.setValue(null);
    this.bulkProductsForm.get('file')?.setValidators([Validators.required]);
    this.bulkProductsForm.get('file')?.updateValueAndValidity();
    this.isDrag = false;
  }
}
