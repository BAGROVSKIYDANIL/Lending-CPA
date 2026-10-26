import {Component, inject} from '@angular/core';
import {RouterLink} from "@angular/router";
import {ViewportService} from "@shared/services/viewport.service";

@Component({
  imports: [RouterLink],
  selector: 'app-navigation',
  styleUrl: './navigation.scss',
  templateUrl: './navigation.html',
})
export class Navigation {
  readonly viewport = inject(ViewportService);
}
