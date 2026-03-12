export const EMAIL_TEMPLATES = {
  welcome: (name: string) => ({
    subject: "Bienvenido a CIRCULR",
    html: `
      <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0A0A0A;">Hola ${name},</h1>
        <p>Bienvenido a CIRCULR. Tu cuenta ha sido creada correctamente.</p>
        <p>Estamos listos para ayudarte en tu transición hacia la economía circular.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
           style="display: inline-block; background: #C8F060; color: #0A0A0A; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
          Ir al Dashboard
        </a>
      </div>
    `,
  }),

  project_created: (name: string, projectTitle: string) => ({
    subject: `Nuevo proyecto: ${projectTitle}`,
    html: `
      <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0A0A0A;">Nuevo proyecto creado</h1>
        <p>Hola ${name},</p>
        <p>Tu proyecto <strong>${projectTitle}</strong> ha sido creado y está pendiente de asignación.</p>
        <p>Te notificaremos cuando un consultor sea asignado.</p>
      </div>
    `,
  }),

  deliverable_ready: (name: string, projectTitle: string) => ({
    subject: `Entregable listo: ${projectTitle}`,
    html: `
      <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0A0A0A;">Tu entregable está listo</h1>
        <p>Hola ${name},</p>
        <p>El entregable de <strong>${projectTitle}</strong> está listo para revisión.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
           style="display: inline-block; background: #C8F060; color: #0A0A0A; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
          Ver entregable
        </a>
      </div>
    `,
  }),
} as const;
