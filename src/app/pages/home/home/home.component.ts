import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  HostListener,
} from "@angular/core";
import mapboxgl from "mapbox-gl";
import { environment } from "../../../../environments/environment";
import { PrimengModule } from "../../../shared/primeng/primeng.module";
import { HomeService } from "../../../shared/service/home/home.service";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { KpiIndicatorsComponent } from '../../../shared/component/kpi-indicators/kpi-indicators.component';
import { Popover } from "primeng/popover";
import { ShipmentStatus } from "../../../shared/enumeration/home";

interface  countryList{
  locationId: number;
  locationCode: String;
  locationName: String;
  latitude: number;
  longitude: number;
  totalShipmentCount: number;
  modeOfTransport: string;
}

interface mapApiResponse{
  data: {
    locationStatsList: countryList[];
  };
}

interface kpiData {
  label: string;
  transportModes: transportModeData[];
  totalCount: number;
}

interface transportModeData {
  mode: string;
  count: number;
}

export interface KpiRequestBody {
  shipmentStatus: string;
  globalFilter: Record<string, any>;
  companyCodes: number[];
}

export interface MapRequestBody {
  globalFilter: Record<string, any>;
  companyCodes: number[];
  level: number;
  locationType: String;
  locationId: number;
}

export const kpiRequestBody: KpiRequestBody = {
  shipmentStatus: "",
  globalFilter: {},
  companyCodes: [419]
};
export const mapDataRequestBody: MapRequestBody = {
  globalFilter: {},
  companyCodes: [419],
  level: 0,
  locationType: "ORIGIN",
  locationId: 0
};

interface ApiResponse {
  status: number;
  message: string;
  data: {
    locationStatsList: countryList[];
    totalShipmentCount: number;
  };
}
@Component({
  selector: "app-home",
  imports: [PrimengModule, FormsModule, CommonModule, KpiIndicatorsComponent],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild("mapContainer", { static: true }) mapContainer!: ElementRef;
  @ViewChild('mapTypeOptionPanel') mapTypeOptionPanel!: Popover;
  @ViewChild('mapTypeButton', { static: false }) mapTypeButton!: ElementRef;
  map!: mapboxgl.Map;
  stateOptions: any[] = [
    { label: "Origin", value: "origin" },
    { label: "Destination", value: "destination" },
  ];
  shipmentStatus: string[] = ["NOT_STARTED", "IN_TRANSIT", "ARRIVED"]
  locationType: string = "origin";
  headerName: string = "Global Shipment OverView";
  mapType: string = "road";
  kpiData: kpiData[] = [];
  totalShipmentCount: number = 0;
  totaltotalShipmentCount: number = 0;
  countryList: mapApiResponse[] = [];
  position: string = "right";
  displaySearchDialog: boolean = false;
  searchQuery: string = "";
  filteredLocations: countryList[] = [];
  isSearching: boolean = false;
  private searchSubject = new Subject<string>();
  private currentZoomLevel: number = 1;
  private currentBounds: mapboxgl.LngLatBounds | null = null;
  private isLoadingMapData: boolean = false;
  private mapInteractionSubject = new Subject<{ type: string, data: any }>();

  // Track selected location for API calls
  private selectedLocationCode: number = 0;
  private selectedLocation: countryList | null = null;

  // Transport modes for dialog
  transportModes = [
    { label: 'Ocean', value: 'ocean' },
    { label: 'Air', value: 'air' },
    { label: 'Rail', value: 'rail' },
    { label: 'Road', value: 'road' }
  ];
  selectedTransportMode: string = 'ocean';

  // Hardcoded KPI data for each shipment type and transport modes with different shipment counts


  constructor(private homeService: HomeService) {
    for (const status of this.shipmentStatus) {
      const kpiRequestBody: KpiRequestBody = {
        shipmentStatus: status,
        globalFilter: {},
        companyCodes: [419]
      };
      this.homeService.getKpisData(kpiRequestBody).subscribe((response: any) => {
        if (response && response.data) {
          this.kpiData.push({
            label: ShipmentStatus[status as keyof typeof ShipmentStatus],
            transportModes: response.data,
            totalCount: response.data.totalCount
          });
        }
      });
    }
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((query) => {
        //this.onSearch(query);
      });
    this.mapInteractionSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((interaction) => {
        this.handleDebouncedMapInteraction(interaction);
      });
  }
  ngOnInit(): void {

    (mapboxgl as any).accessToken =
      "pk.eyJ1IjoibWFoZW5kcmE5MzI5IiwiYSI6ImNrcHpld25pNzBsdGEycG82aTh2NjI0YnAifQ.AD4EUC9iCaDZMT36sNq50w";
  }

  async ngAfterViewInit(): Promise<void> {
     const response: ApiResponse = await this.homeService.getMapdata(mapDataRequestBody).toPromise();
    (mapboxgl as any).accessToken = "pk.eyJ1IjoibWFoZW5kcmE5MzI5IiwiYSI6ImNrcHpld25pNzBsdGEycG82aTh2NjI0YnAifQ.AD4EUC9iCaDZMT36sNq50w";
    this.map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/light-v10",
      center: [0, 20],
      zoom: 2,
      attributionControl: false
    });
    const navControl = new mapboxgl.NavigationControl({
      showCompass: true,
      showZoom: true,
    });
    this.map.addControl(navControl, "top-left");

    const scale = new mapboxgl.ScaleControl({
      maxWidth: 80,
      unit: "nautical",
    });
    this.map.addControl(scale, "bottom-left");

    scale.setUnit("nautical");

    this.map.on("load", () => {
      this.map.addSource("shipment", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: response.data.locationStatsList.map((country) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [country.longitude, country.latitude],
            },
            properties: {
              locationCode: country.locationCode,
              locationName: country.locationName,
              totalShipmentCount: country.totalShipmentCount,
            },
          })),
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      this.map.addLayer({
        id: "clusters",
        type: "circle",
        source: "shipment",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#51bbd6",
            100,
            "#f1f075",
            750,
            "#f28cb1",
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            20,
            100,
            30,
            750,
            40,
          ],
        },
      });

      this.map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "shipment",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": [
            "DIN Offc Pro Medium",
            "Arial Unicode MS Bold",
          ],
          "text-size": 12,
        },
      });

      this.map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "shipment",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": [
            "step",
            ["get", "totalShipmentCount"],
            "#11b4da",
            1000,
            "#f1f075",
            10000,
            "#f28cb1",
          ],
          "circle-radius": [
            "step",
            ["get", "totalShipmentCount"],
            8,
            1000,
            12,
            10000,
            16,
          ],
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fff",
        },
      });
      this.map.addLayer({
        id: "unclustered-point-labels",
        type: "symbol",
        source: "shipment",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "text-field": ["get", "totalShipmentCount"],
          "text-font": [
            "DIN Offc Pro Medium",
            "Arial Unicode MS Bold",
          ],
          "text-size": 10,
          "text-offset": [0, 0],
          "text-anchor": "center",
        },
        paint: {
          "text-color": "#ffffff",
          "text-halo-color": "rgba(0,0,0,0.7)",
          "text-halo-width": 1,
        },
      });

      this.map.on("click", "clusters", async (e) => {
        const features = this.map.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        const clusterId = features[0].properties?.cluster_id;
        const source = this.map.getSource(
          "shipment"
        ) as mapboxgl.GeoJSONSource;

        source.getClusterExpansionZoom(clusterId, async (err, zoom) => {
          if (err) return;

          // Zoom to cluster
          this.map.easeTo({
            center: (features[0].geometry as any).coordinates,
            zoom,
          });

          // Get cluster coordinates for API call
          const clusterCoordinates = (features[0].geometry as any).coordinates;

          // Call API for cluster expand with specific location
          await this.fetchDataForClusterExpand(clusterCoordinates, zoom);
        });
      });

      this.map.on("click", "unclustered-point", (e: any) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const locationName = e.features[0].properties.locationName;
        const locationCode = e.features[0].properties.locationCode;
        const totalShipmentCount = e.features[0].properties.totalShipmentCount;

        // Store selected location for future API calls
        this.selectedLocationCode = locationCode;
        // this.selectedLocation = {
        //   locationCode: locationCode,
        //   locationName: locationName,
        //   latitude: coordinates[1],
        //   longitude: coordinates[0],
        //   totalShipmentCount: totalShipmentCount
        // };

        console.log('Selected location:', this.selectedLocationCode, this.selectedLocation);

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] +=
            e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup({ offset: 25 })
          .setLngLat(coordinates)
          .setHTML(
            `
            <div class="kpi-header flex justify-content-between">
            <span class="kpi-label">{{ card.label }}</span>
            <span class="kpi-value">{{ card.totalCount }}</span>
        </div>
        <!-- <div class="kpi-text">{{ card.text }}</div> -->
        <div class="kpi-modes flex justify-content-between">
            <div *ngFor="let mode of card.transportModes" class="kpi-mode-row flex">  
                <img [src]="getModeIcon(mode.mode)" alt="icon" class="kpi-icon mr-2" />
                <span class="kpi-count">{{ mode.count }}</span>
            </div>
        </div>
    </div>
          `
          )
          .addTo(this.map);
      });

      this.map.on("mouseenter", "clusters", () => {
        this.map.getCanvas().style.cursor = "pointer";
      });
      this.map.on("mouseleave", "clusters", () => {
        this.map.getCanvas().style.cursor = "";
      });

      this.map.on("mouseenter", "unclustered-point", () => {
        this.map.getCanvas().style.cursor = "pointer";
      });
      this.map.on("mouseleave", "unclustered-point", () => {
        this.map.getCanvas().style.cursor = "";
      });

      this.map.on("mouseenter", "unclustered-point-labels", () => {
        this.map.getCanvas().style.cursor = "pointer";
      });
      this.map.on("mouseleave", "unclustered-point-labels", () => {
        this.map.getCanvas().style.cursor = "";
      });

      // Add map interaction event listeners
      this.setupMapInteractionListeners();

      // Add click event on map (empty areas) to clear selection
      this.map.on('click', (e) => {
        // Check if click was on empty area (not on any layer)
        const features = this.map.queryRenderedFeatures(e.point);
        const hasShipmentFeatures = features.some(feature =>
          feature.layer.id === 'clusters' ||
          feature.layer.id === 'unclustered-point' ||
          feature.layer.id === 'unclustered-point-labels'
        );
      });
    });
    this.totalShipmentCount=response.data.totalShipmentCount;
    this.ensureMapTypeButtonPlacement();
  }

  // Setup map interaction listeners for zoom, drag, and cluster expand
  private setupMapInteractionListeners(): void {
    // Zoom end event
    this.map.on('zoomend', () => {
      const newZoomLevel = this.map.getZoom();
      if (Math.abs(newZoomLevel - this.currentZoomLevel) >= 1) {
        this.currentZoomLevel = newZoomLevel;
        this.onMapViewChange('zoom');
      }
    });

    // Drag end event
    this.map.on('dragend', () => {
      this.onMapViewChange('drag');
    });

    // Move end event (covers both zoom and drag)
    this.map.on('moveend', () => {
      const newBounds = this.map.getBounds();
      if (!this.currentBounds || !this.boundsEqual(this.currentBounds, newBounds)) {
        this.currentBounds = newBounds;
        this.onMapViewChange('move');
      }
    });
  }

  // Helper method to compare bounds
  private boundsEqual(bounds1: mapboxgl.LngLatBounds, bounds2: mapboxgl.LngLatBounds): boolean {
    const tolerance = 0.001;
    return Math.abs(bounds1.getNorth() - bounds2.getNorth()) < tolerance &&
      Math.abs(bounds1.getSouth() - bounds2.getSouth()) < tolerance &&
      Math.abs(bounds1.getEast() - bounds2.getEast()) < tolerance &&
      Math.abs(bounds1.getWest() - bounds2.getWest()) < tolerance;
  }
  private async onMapViewChange(eventType: 'zoom' | 'drag' | 'move'): Promise<void> {
    const zoomLevel = this.map.getZoom();
    const bounds = this.map.getBounds();
    const center = this.map.getCenter();
    this.mapInteractionSubject.next({
      type: eventType,
      data: {
        zoom: zoomLevel,
        center: [center.lng, center.lat],
      }
    });
  }
  private async handleDebouncedMapInteraction(interaction: { type: string, data: any }): Promise<void> {
    if (this.isLoadingMapData) {
      return;
    }

    console.log(`Map ${interaction.type} event:`, interaction.data);
    const bounds = {
      getNorth: () => interaction.data.bounds.north,
      getSouth: () => interaction.data.bounds.south,
      getEast: () => interaction.data.bounds.east,
      getWest: () => interaction.data.bounds.west
    } as mapboxgl.LngLatBounds;
    await this.fetchDataForCurrentView(interaction.data.zoom, bounds);
  }
  private async fetchDataForCurrentView(zoomLevel: number, bounds: mapboxgl.LngLatBounds): Promise<void> {
    this.isLoadingMapData = true;

    try {
      let level = 1; // Country level
      if (zoomLevel >= 4) level = 2; // State/Province level
      if (zoomLevel >= 6) level = 3; // City level
      if (zoomLevel >= 8) level = 4; // Port/Terminal level

      const body: MapRequestBody = {
        globalFilter: {},
        companyCodes: [419],
        level: level,
        locationId: this.selectedLocationCode,
        locationType: this.locationType.toUpperCase()
      };

      console.log('Fetching data for view with locationCode:', this.selectedLocationCode, body);

      const response: ApiResponse = await this.homeService.getMapdata(body).toPromise();

      if (response.status === 200 && response.data && response.data.locationStatsList) {
        await this.updateMapWithNewData(response.data.locationStatsList);

        this.totaltotalShipmentCount = response.data.locationStatsList.reduce((acc, loc) => acc + loc.totalShipmentCount, 0);
        this.totalShipmentCount = this.totaltotalShipmentCount;
      }
    } catch (error) {
      console.error('Error fetching map data:', error);
    } finally {
      this.isLoadingMapData = false;
    }
  }

  // Update map with new data
  private async updateMapWithNewData(newData: any): Promise<void> {
    // Update country list
    this.countryList = newData.locationStatsList;

    // Update map source data
    const source = this.map.getSource('shipment') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: this.countryList[0].data.locationStatsList.map((country) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [country.longitude, country.latitude],
          },
          properties: {
            locationCode: country.locationCode,
            locationName: country.locationName,
            totalShipmentCount: country.totalShipmentCount,
          },
        }))
      });
    }
  }

  private async fetchDataForClusterExpand(coordinates: [number, number], zoomLevel: number): Promise<void> {
    if (this.isLoadingMapData) {
      return;
    }

    this.isLoadingMapData = true;

    try {
      const buffer = 0.5; // Adjust buffer size based on zoom level
      const bounds = {
        north: coordinates[1] + buffer,
        south: coordinates[1] - buffer,
        east: coordinates[0] + buffer,
        west: coordinates[0] - buffer
      };

      // Determine level based on zoom
      let level = 2;
      if (zoomLevel >= 6) level = 3;
      if (zoomLevel >= 8) level = 4;

      const body: MapRequestBody = {
        globalFilter: {},
        companyCodes: [],
        level: level,
        locationId: this.selectedLocationCode,
        locationType: this.locationType.toUpperCase()
      };

      console.log('Fetching data for cluster expand with locationCode:', this.selectedLocationCode, body);

      const response: mapApiResponse = await this.homeService.getMapdata(body).toPromise();

      if (response.data && response.data.locationStatsList) {
        // Update map with expanded cluster data
        await this.updateMapWithNewData(response.data);
        console.log('Cluster expanded with new data:', response.data.locationStatsList.length, 'locations');
      }
    } catch (error) {
      console.error('Error fetching cluster expand data:', error);
    } finally {
      this.isLoadingMapData = false;
    }
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
    this.searchSubject.complete();
    this.mapInteractionSubject.complete();
  }

  @HostListener("window:keydown", ["$event"])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key === "k") {
      event.preventDefault();
      this.openSearchDialog();
    }
    if (event.key === "Escape" && this.displaySearchDialog) {
      this.closeSearchDialog();
    }
  }

  openSearchDialog(): void {
    this.displaySearchDialog = true;
    this.searchQuery = "";
    this.filteredLocations = [];

    // Focus the search input after dialog opens
    setTimeout(() => {
      const searchInput = document.getElementById('searchInput') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }, 100);
  }
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  }

  closeSearchDialog(): void {
    this.displaySearchDialog = false;
    this.searchQuery = "";
    this.filteredLocations = [];
    this.isSearching = false;
  }

  onSearchInput(): void {
    this.isSearching = true;
    this.searchSubject.next(this.searchQuery);
  }

  // private onSearch(query: string): void {
  //   if (query.trim().length === 0) {
  //     this.filteredLocations = [];
  //     this.isSearching = false;
  //     return;
  //   }

  //   const lowerCaseQuery = query.toLowerCase();
  //   this.filteredLocations = this.countryList
  //     .filter(
  //       (location) =>
  //         location.locationName
  //           .toLowerCase()
  //           .includes(lowerCaseQuery) ||
  //         location.locationCode.toLowerCase().includes(lowerCaseQuery)
  //     )
  //     .slice(0, 10);

  //   this.isSearching = false;
  // }

  selectLocation(location: countryList): void {
    //this.selectedLocationCode = location.locationCode;
    this.selectedLocation = location;
    this.map.easeTo({
      center: [location.longitude, location.latitude],
      zoom: 8,
      duration: 2000,
    });

    // Create a modern popup for the selected location
    const popup = new mapboxgl.Popup({
      offset: 25,
      closeButton: true,
      closeOnClick: false
    })
      .setLngLat([location.longitude, location.latitude])
      .setHTML(
        `
        <div class="kpi-header flex justify-content-between">
            <span class="kpi-label">{{ card.label }}</span>
            <span class="kpi-value">{{ card.totalCount }}</span>
        </div>
        <!-- <div class="kpi-text">{{ card.text }}</div> -->
        <div class="kpi-modes flex justify-content-between">
            <div *ngFor="let mode of card.transportModes" class="kpi-mode-row flex">  
                <img [src]="getModeIcon(mode.mode)" alt="icon" class="kpi-icon mr-2" />
                <span class="kpi-count">{{ mode.count }}</span>
            </div>
        </div>
    </div>
      `
      )
      .addTo(this.map);

    // Close the search dialog
    this.closeSearchDialog();
  }
  onToggleChange(): void {
    //console.log('Toggle changed to:', this.value);
    const bounds = this.map.getBounds();
    const zoomLevel = this.map.getZoom();
    this.fetchDataForCurrentView(zoomLevel, bounds);
  }



  // Method to get current selected location info
  getSelectedLocationInfo(): string {
    if (this.selectedLocation) {
      return `${this.selectedLocation.locationName} (${this.selectedLocationCode})`;
    }
    return 'No location selected';
  }

  // Select transport mode
  selectTransportMode(mode: string): void {
    this.selectedTransportMode = mode;
    // Trigger search with new transport mode if there's a query
    if (this.searchQuery) {
      this.onSearchInput();
    }
  }

  // Methods for Mumbai-style search dialog
  getDialogHeader(): string {
    return this.selectedLocation ?
      `${this.selectedLocation.locationName}` :
      'Search Location';
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredLocations = [];
  }

  // Check if location has specific transport mode (mock data for demo)
  hasTransportMode(location: countryList, mode: string): boolean {
    // This would typically check the location's available transport modes
    // For demo purposes, we'll return true for some locations
    const locationName = location.locationName.toString().toLowerCase();

    switch (mode) {
      case 'ocean':
        return locationName.includes('port') || locationName.includes('mumbai') ||
          locationName.includes('singapore') || locationName.includes('hamburg');
      case 'air':
        return locationName.includes('airport') || locationName.includes('mumbai') ||
          locationName.includes('delhi') || locationName.includes('london');
      case 'rail':
        return locationName.includes('mumbai') || locationName.includes('delhi') ||
          locationName.includes('chennai') || locationName.includes('kolkata');
      case 'road':
        return true; // Most locations have road connectivity
      default:
        return false;
    }
  }

  // Get top locations for suggestions
  // getTopLocations(): countryList[] {
  //   // Return top 5 locations by shipment count
  //   return this.countryList
  //     .sort((a, b) => b.totaltotalShipmentCount - a.totaltotalShipmentCount)
  //     .slice(0, 5);
  // }

  mapTypeOptionPanelClick(event: any) {
    this.mapTypeOptionPanel.toggle(event);
  }

  changeMapStyle(styleType: 'light' | 'satellite' | 'street') {


    // const map = this.homeMap?.getChart();
    //if (!map) return;
    const mapStyle = this.getMapBoxStyleByMapType(styleType);
    //map.setStyle(mapStyle);
    this.map = new mapboxgl.Map({
      container: "map",
      style: mapStyle,
      center: [0, 20],
      zoom: 2,
      attributionControl: false
    });
  }

  // Returns appropriate Mapbox style URL based on current map type
  getMapBoxStyleByMapType(styleType: string): string {
    switch (styleType) {
      case 'satellite':
        return 'mapbox://styles/mapbox/satellite-v9';
      case 'street':
        return 'mapbox://styles/mapbox/streets-v11';
      case 'light':
      default:
        return 'mapbox://styles/mapbox/light-v10';
    }
  }

  private ensureMapTypeButtonPlacement(): void {
    setTimeout(() => {
      const mapboxCtrlContainer = document.querySelector('.mapboxgl-ctrl-top-left');
      const existingButton = document.querySelector('.custom-map-type-button-group');

      // Remove existing button if it exists
      if (existingButton) {
        existingButton.remove();
      }

      // Add button to map container
      if (mapboxCtrlContainer && this.mapTypeButton?.nativeElement) {
        mapboxCtrlContainer.appendChild(this.mapTypeButton.nativeElement);
      }
    }, 100);
  }

}