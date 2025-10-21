import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Footer } from '../../Components/Footer/footer/footer';

@Component({
  selector: 'app-contactanos',
  imports: [FormsModule, Footer],
  templateUrl: './contactanos.html',
  styleUrl: './contactanos.css'
})
export class Contactanos {
  formData = {
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: ''
  };

  sending: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor() {}

  async onSubmit() {
    if (this.sending) return;

    this.sending = true;
    this.successMessage = '';
    this.errorMessage = '';

    try {
      // Enviar correo usando EmailJS
      await this.sendEmail();
      
      this.successMessage = '¡Mensaje enviado exitosamente! Te responderemos pronto a tu correo.';
      this.resetForm();
      
      // Limpiar mensaje de éxito después de 5 segundos
      setTimeout(() => {
        this.successMessage = '';
      }, 5000);
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
      this.errorMessage = 'Hubo un error al enviar el mensaje. Por favor, intenta nuevamente o contáctanos directamente a valadezandoni22@gmail.com';
      
      // Limpiar mensaje de error después de 7 segundos
      setTimeout(() => {
        this.errorMessage = '';
      }, 7000);
    } finally {
      this.sending = false;
    }
  }

  private async sendEmail(): Promise<void> {
    // Configuración de EmailJS
    const serviceID = 'service_hkbyw9p'; // Tu Service ID de Gmail
    const templateID = 'template_3tlfiyb'; // Debes crear este template en EmailJS
    const publicKey = 'ZrsOJwWq9uivlG_xJ'; // Reemplaza con tu Public Key de EmailJS (Account > General)

    const templateParams = {
      from_name: this.formData.nombre,
      from_email: this.formData.email,
      phone: this.formData.telefono || 'No proporcionado',
      subject: this.formData.asunto,
      message: this.formData.mensaje,
      to_email: 'valadezandoni22@gmail.com',
      reply_to: this.formData.email
    };

    // Usar EmailJS API
    const emailJSUrl = 'https://api.emailjs.com/api/v1.0/email/send';
    
    const response = await fetch(emailJSUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: serviceID,
        template_id: templateID,
        user_id: publicKey,
        template_params: templateParams
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('EmailJS Error:', errorText);
      throw new Error('Error al enviar el correo');
    }
  }

  resetForm() {
    this.formData = {
      nombre: '',
      email: '',
      telefono: '',
      asunto: '',
      mensaje: ''
    };
  }
}
