import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-steel/30 bg-black">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-display text-lg font-800 text-off-white">CIRCULR</h3>
            <p className="mt-2 text-sm text-pale">
              Consultoría de economía circular para empresas europeas.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-off-white">Servicios</h4>
            <ul className="mt-3 space-y-2">
              <li><Link href="#" className="text-sm text-pale hover:text-off-white">Respuesta CSRD</Link></li>
              <li><Link href="#" className="text-sm text-pale hover:text-off-white">Diagnóstico CE</Link></li>
              <li><Link href="#" className="text-sm text-pale hover:text-off-white">Implementación</Link></li>
              <li><Link href="#" className="text-sm text-pale hover:text-off-white">Formación</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-off-white">Legal</h4>
            <ul className="mt-3 space-y-2">
              <li><Link href="#" className="text-sm text-pale hover:text-off-white">Privacidad</Link></li>
              <li><Link href="#" className="text-sm text-pale hover:text-off-white">Términos</Link></li>
              <li><Link href="#" className="text-sm text-pale hover:text-off-white">Cookies</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-off-white">Contacto</h4>
            <ul className="mt-3 space-y-2">
              <li><span className="text-sm text-pale">info@circulr.es</span></li>
              <li><span className="text-sm text-pale">Barcelona, España</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-steel/30 pt-6">
          <p className="text-center text-xs text-mid">
            &copy; {new Date().getFullYear()} CIRCULR. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
