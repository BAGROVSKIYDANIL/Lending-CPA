import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {NgOptimizedImage} from "@angular/common";

@Component({
  selector: 'app-not-found',
  standalone: true,
    imports: [RouterLink, NgOptimizedImage],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
})
export class NotFound {
  protected readonly isRussian = __APP_LOCALE__ === 'ru';
}
