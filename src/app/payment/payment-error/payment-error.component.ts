import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-payment-error',
  imports: [],
  templateUrl: './payment-error.component.html',
  styleUrl: './payment-error.component.css'
})
export class PaymentErrorComponent implements OnInit{
  ngOnInit(): void {
    setTimeout(() => {
      location.href = "/";
    }, 7000)
  }

}
