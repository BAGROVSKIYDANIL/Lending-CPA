import {inject, Injectable} from "@angular/core";
import {toSignal} from "@angular/core/rxjs-interop";
import { map } from 'rxjs';
import {BreakpointObserver} from "@angular/cdk/layout";


@Injectable ({providedIn: 'root'})

export class ViewportService {
    private readonly breakpointObserver = inject(BreakpointObserver);

    readonly isMobile = toSignal(this.breakpointObserver
        .observe('(max-width: 768px)')
        .pipe(map(result => result.matches)),
        { initialValue: false}
    );
}