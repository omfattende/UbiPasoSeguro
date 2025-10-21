import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MissingChild {
  name: string;
  age: number;
  photo: string;
  missingSince: string;
  lastSeen: string;
  contact: string;
}

@Component({
  selector: 'app-ninos-en-problemas',
  templateUrl: './ninos-en-problemas.html',
  styleUrls: ['./ninos-en-problemas.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class NinosEnProblemasPage {
  activeCases: MissingChild[] = [
    {
      name: 'Juan Pérez',
      age: 8,
      photo: 'assets/images/niño1.jpg',
      missingSince: '15/10/2023',
      lastSeen: 'Parque Central, Ciudad de México',
      contact: '55-1234-5678'
    },
    {
      name: 'Ana García',
      age: 10,
      photo: 'assets/images/niña1.jpg',
      missingSince: '18/10/2023',
      lastSeen: 'Mercado San Juan, Guadalajara',
      contact: '33-8765-4321'
    }
  ];

  reportSighting() {
    // Lógica para reportar un avistamiento
    alert('Gracias por tu reporte. Por favor llama al 911 para proporcionar más información.');
  }

  shareCase(missingChild: MissingChild) {
    try {
      // Crear un texto de compartir seguro que maneja valores undefined
      const safeContact = missingChild.contact || 'No disponible';
      const shareText = `Niño desaparecido: ${missingChild.name || 'Nombre no disponible'}, ${missingChild.age || 'Edad no disponible'} años. ` +
                      `Desaparecido desde: ${missingChild.missingSince || 'Fecha no disponible'}. ` +
                      `Última ubicación: ${missingChild.lastSeen || 'Ubicación no disponible'}. ` +
                      `Contacto: ${safeContact}. ` +
                      `Por favor comparte responsablemente.`;
      
      if (navigator.share) {
        navigator.share({
          title: `Alerta AMBER: ${missingChild.name || 'Niño desaparecido'}`,
          text: shareText,
          url: window.location.href
        }).catch(err => {
          console.error('Error al compartir:', err);
          this.fallbackShare(shareText);
        });
      } else {
        this.fallbackShare(shareText);
      }
    } catch (error) {
      console.error('Error en shareCase:', error);
      alert('Ocurrió un error al intentar compartir. Por favor intente nuevamente.');
    }
  }

  // Método para obtener un número de teléfono seguro para usar en enlaces
  getSafeContact(contact: any): string | null {
    try {
      if (!contact) return null;
      const contactStr = String(contact).trim();
      if (!contactStr) return null;
      // Elimina todo excepto números
      const numbers = contactStr.replace(/[^0-9]/g, '');
      return numbers || null;
    } catch (error) {
      console.error('Error procesando contacto:', error);
      return null;
    }
  }

  private fallbackShare(shareText: string) {
    // Fallback para navegadores que no soportan la API de Web Share
    try {
      const shareUrl = `whatsapp://send?text=${encodeURIComponent(shareText)}`;
      window.open(shareUrl, '_blank');
    } catch (e) {
      // Si falla, intentamos copiar al portapapeles
      navigator.clipboard.writeText(shareText).then(() => {
        alert('La información ha sido copiada al portapapeles. Por favor compártela manualmente.');
      }).catch(() => {
        // Si todo falla, mostramos la información en un alert
        alert('No se pudo compartir automáticamente. Por favor copia manualmente esta información:\n\n' + shareText);
      });
    }
  }
}
