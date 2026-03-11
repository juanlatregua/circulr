interface ConsultantProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ConsultantProjectPage({ params }: ConsultantProjectPageProps) {
  const { id } = await params;

  return (
    <div>
      <h1 className="font-display text-2xl font-800 text-off-white">
        Proyecto
      </h1>
      <p className="mt-1 text-sm text-pale">ID: {id}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-steel/30 bg-smoke p-6">
            <h2 className="font-display text-lg font-700 text-off-white">
              Detalles del proyecto
            </h2>
            <p className="mt-2 text-sm text-mid">
              Los detalles y el generador IA se cargarán aquí.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-steel/30 bg-smoke p-6">
            <h3 className="text-sm font-medium text-off-white">Info del cliente</h3>
            <p className="mt-2 text-sm text-mid">
              Datos del cliente se cargarán aquí.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
