import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ReciclajePage } from './reciclaje.page';

describe('ReciclajePage', () => {
  let component: ReciclajePage;
  let fixture: ComponentFixture<ReciclajePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReciclajePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ReciclajePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
