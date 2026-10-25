import { Component } from '@angular/core';
import {RouterLink} from "@angular/router";

@Component({
  imports: [RouterLink],
  selector: 'app-navigation',
  styleUrl: './navigation.scss',
  templateUrl: './navigation.html',
})
export class Navigation {}
