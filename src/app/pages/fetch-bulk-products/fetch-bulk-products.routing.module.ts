import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {FetchBulkProductsComponent} from "./fetch-bulk-products.component";

const routes: Routes = [
  {
    path: '',
    component: FetchBulkProductsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FetchBulkProductsRoutingModule {
}
