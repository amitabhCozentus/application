import { Component, EventEmitter, Input, Output } from "@angular/core";
import { PrimengModule } from "../../primeng/primeng.module";

@Component({
    selector: "app-common-table-search",
    standalone: true,
    imports: [PrimengModule],
    templateUrl: "./common-table-search.component.html",
    styleUrls: ["./common-table-search.component.scss"],
})
export class CommonTableSearchComponent {
    //@Input() placeholder: string = "Type min 3 characters and press enter to Search";
    @Input() value: string = "";
    @Output() valueChange = new EventEmitter<string>();
    @Output() search = new EventEmitter<void>();
    @Output() clear = new EventEmitter<void>();

    onInput(event: Event) {
        const val = (event.target as HTMLInputElement).value;
        this.valueChange.emit(val);
    }

    onEnter() {
        this.search.emit();
    }

    onClear() {
        this.valueChange.emit("");
        this.clear.emit();
    }
}
