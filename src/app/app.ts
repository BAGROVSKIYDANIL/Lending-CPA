import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MultiBenefits} from "@widgets/multi-benefits";

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [
    RouterOutlet, MultiBenefits
  ]
})
export class App {}
