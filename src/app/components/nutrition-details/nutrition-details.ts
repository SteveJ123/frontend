import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Service } from '../../service/service';

@Component({
  selector: 'app-nutrition-details',
  imports: [CommonModule],
  templateUrl: './nutrition-details.html',
  styleUrl: './nutrition-details.css',
})
export class NutritionDetails {
  nutritionItem: any | null = null;
  isLoading: boolean = true;
  currentLanguage: string = 'te';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: Service,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchDetail(id);
    }
  }

  fetchDetail(id: string): void {
    this.service.getNutritionById(id).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.nutritionItem = res.data;
          this.currentLanguage = res.data.language === 'Telugu' ? 'te' : 'en';
        }
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching detail:', err);
        this.isLoading = false;
        this.cd.detectChanges();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/', this.currentLanguage, 'courses-list']);
  }
}
