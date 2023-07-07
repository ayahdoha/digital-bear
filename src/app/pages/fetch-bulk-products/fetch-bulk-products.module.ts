import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FetchBulkProductsComponent } from './fetch-bulk-products.component';
import { FetchBulkProductsRoutingModule} from "./fetch-bulk-products.routing.module";
import { ReactiveFormsModule } from '@angular/forms';
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FetchBulkProductsRoutingModule
  ],
  declarations: [FetchBulkProductsComponent],
  exports:[FetchBulkProductsComponent]
})
export class FetchBulkProductsModule { }
