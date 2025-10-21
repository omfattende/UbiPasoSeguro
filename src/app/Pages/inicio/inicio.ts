import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Footer } from '../../Components/Footer/footer/footer';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, Footer],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio implements OnInit, OnDestroy {
  private observer: IntersectionObserver | null = null;

  ngOnInit() {
    this.setupScrollAnimations();
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupScrollAnimations() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          const animationType = entry.target.getAttribute('data-animation');
          if (animationType) {
            entry.target.classList.add(animationType);
          }
        }
      });
    }, options);

    // Observar todas las secciones
    const sections = document.querySelectorAll('.fullscreen-section');
    sections.forEach(section => {
      this.observer?.observe(section);
    });
  }
}
