import {Component, inject} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FallbackPopup } from '@shared/ui/fallback-popup';
import {MultiplyWithUs} from "@widgets/multiply-with-us";
import {Header} from "@widgets/header/header";
import {ViewportService} from "@shared/services/viewport.service";

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [RouterOutlet, FallbackPopup, Header],
})
export class App {
  readonly viewport = inject(ViewportService)
}
