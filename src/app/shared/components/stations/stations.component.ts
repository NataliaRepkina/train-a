import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ViewChild,
  inject,
} from '@angular/core';
import * as L from 'leaflet';
import { Observable, Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AbstractControl, FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { loadStations, createStation, canDelete } from '../../../core/store/trips/trips.actions';
import { selectStations, selectLoading } from '../../../core/store/trips/trips.selectors';
import { PopUpService } from '../../../features/admin/services/popup.service';
import { Station } from '../../../features/trips/models/station.model';

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
const redIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-stations',
  templateUrl: './stations.component.html',
  styleUrl: './stations.component.scss',
})
export class StationsComponent implements AfterViewInit {
  protected stations$: Observable<Station[]>;

  private map!: L.Map;

  protected visualisation$!: Observable<Station[]>;

  private dataSource = new MatTableDataSource<Station>();

  private markers: L.Marker[] = [];

  private marker: L.Marker | undefined;

  protected isLoading$!: Observable<boolean>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private destroyRef;

  private formGroupSubscriptions: Subscription[] = [];

  protected stationForm = this.formBuilder.nonNullable.group({
    city: ['', Validators.required],
    latitude: [0, [Validators.required, Validators.min(-180), Validators.max(180)]],
    longitude: [0, [Validators.required, Validators.min(-180), Validators.max(180)]],
    relations: this.formBuilder.array([this.createRelation(0)]),
  });

  constructor(
    private store: Store,
    private popupService: PopUpService,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) {
    this.destroyRef = inject(DestroyRef);
    this.store.dispatch(loadStations());
    this.stations$ = this.store.select(selectStations);
    this.isLoading$ = this.store.select(selectLoading);
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.stations$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((stations) => {
      this.updateMap(stations);
    });
    this.stationForm.controls.latitude.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((lat) => {
        this.updateMarkerPosition(lat, this.stationForm.controls.longitude.value);
      });

    this.stationForm.controls.longitude.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((lng) => {
        this.updateMarkerPosition(this.stationForm.controls.latitude.value, lng);
      });
    this.cdr.detectChanges();
  }

  get relations(): FormArray {
    return this.stationForm.get('relations') as FormArray;
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [39.8282, -98.5795],
      zoom: 3,
    });
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    });
    tiles.addTo(this.map);
    const southWest = L.latLng(-90, -180);
    const northEast = L.latLng(90, 180);
    const bounds = L.latLngBounds(southWest, northEast);

    this.map.setMaxBounds(bounds);
    this.map.on('drag', () => {
      this.map.panInsideBounds(bounds, { animate: false });
    });
    this.map.on('click', this.onMapClick.bind(this));
  }

  private updateMap(stations: Station[]): void {
    this.markers.forEach((marker) => {
      return this.map.removeLayer(marker);
    });
    this.markers = [];
    this.dataSource.data = stations;
    this.visualisation$ = this.dataSource.connect();
    this.dataSource.paginator = this.paginator;
    stations.forEach((station) => {
      const lon = station.longitude;
      const lat = station.latitude;
      const marker = L.marker([lat, lon]);
      marker.bindPopup(this.popupService.makeCapitalPopup(station.city));
      marker.addTo(this.map);
      this.markers.push(marker);
    });
  }

  private updateMarkerPosition(lat: number, lng: number): void {
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }
    this.marker = L.marker([lat, lng], {
      icon: redIcon,
      draggable: true,
    }).addTo(this.map);
  }

  private onMapClick(e: L.LeafletMouseEvent): void {
    const { lat } = e.latlng;
    const { lng } = e.latlng;
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }
    this.marker = L.marker([lat, lng], {
      icon: redIcon,
      draggable: true,
    }).addTo(this.map);
    this.stationForm.patchValue({
      latitude: lat,
      longitude: lng,
    });
  }

  private createRelation(index: number): FormControl {
    const control = this.formBuilder.control('');
    const subscription = control.valueChanges.subscribe(() => {
      this.checkAndAddOrRemoveRelation(index);
    });
    this.formGroupSubscriptions.push(subscription);

    return control;
  }

  private addRelation(index: number) {
    const control = this.createRelation(index);
    this.relations.push(control);
  }

  private deleteRelation(index: number): void {
    if (this.relations.length > 1) {
      this.relations.removeAt(index);
      const subscription = this.formGroupSubscriptions[index];
      if (subscription) {
        subscription.unsubscribe();
      }
      this.formGroupSubscriptions.splice(index, 1);
    }
  }

  private checkAndAddOrRemoveRelation(changedIndex: number) {
    const allFilled = this.relations.controls.every((control) => {
      return control.value;
    });
    if (allFilled) {
      this.addRelation(this.relations.controls.length - 1);
    } else {
      const emptyControls = this.relations.controls.filter((control) => {
        return !control.value;
      });
      if (emptyControls.length > 1) {
        this.deleteRelation(changedIndex);
      }
    }
  }

  protected onSubmit(): void {
    if (this.stationForm.valid) {
      const formValue = this.stationForm.value as {
        city: string;
        latitude: number;
        longitude: number;
        relations: number[];
      };
      this.store.dispatch(
        createStation({
          city: formValue.city,
          latitude: formValue.latitude,
          longitude: formValue.longitude,
          relations: formValue.relations,
        }),
      );
      if (this.marker) {
        this.map.removeLayer(this.marker);
      }
      this.resetForm();
    }
  }

  private resetForm() {
    this.stationForm.reset({
      city: '',
      latitude: 0,
      longitude: 0,
    });
    this.resetRelations();
  }

  protected updateOptions() {
    const selectedValues = this.relations.controls.map((control) => {
      return control.value;
    });
    this.relations.controls.forEach((control) => {
      control.setValidators([Validators.required, this.forbidSelectedValues(selectedValues)]);
      control.updateValueAndValidity();
    });
  }

  private resetRelations() {
    const relationsArray = this.stationForm.get('relations') as FormArray;
    while (relationsArray.length) {
      relationsArray.removeAt(0);
      const subscription = this.formGroupSubscriptions[0];
      if (subscription) {
        subscription.unsubscribe();
      }
    }
    relationsArray.push(this.createRelation(0));
  }

  private forbidSelectedValues(selectedValues: string[]) {
    return (control: AbstractControl) => {
      return selectedValues.includes(control.value)
        ? { forbiddenValue: { value: control.value } }
        : null;
    };
  }

  protected isOptionSelected(option: number): boolean {
    const selectedValues = this.relations.controls.map((control) => {
      return control.value;
    });
    return selectedValues.includes(option);
  }

  protected onDelete(id: number, stations: Station[]) {
    const station = stations.find((s) => {
      return s.id === id;
    });
    if (!station) {
      throw new Error('Station not found');
    }

    const coordinates = station.connectedTo.map((connection) => {
      const connectedStation = stations.find((s) => {
        return s.id === connection.id;
      });
      if (!connectedStation) {
        throw new Error(`Connected station with id ${connection.id} not found`);
      }
      return {
        latitude: connectedStation.latitude,
        longitude: connectedStation.longitude,
      };
    });
    this.store.dispatch(canDelete({ station, coordinates }));
  }

  protected findStationNameById(id: number, stations: Station[]): string {
    const foundStation = stations.find((station) => {
      return station.id === id;
    });
    return foundStation ? foundStation.city : 'Station not found';
  }
}
