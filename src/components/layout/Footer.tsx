import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-forest">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Image src="/logo.svg" alt="CIRCULR" width={160} height={36} className="h-9 w-auto" />
            <p className="mt-3 text-sm text-sage">
              Consultoría de economía circular para empresas europeas.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-white">Servicios</h4>
            <ul className="mt-3 space-y-2">
              <li><Link href="#" className="text-sm text-sage hover:text-white transition-colors">Respuesta CSRD</Link></li>
              <li><Link href="#" className="text-sm text-sage hover:text-white transition-colors">Diagnóstico CE</Link></li>
              <li><Link href="#" className="text-sm text-sage hover:text-white transition-colors">Implementación</Link></li>
              <li><Link href="#" className="text-sm text-sage hover:text-white transition-colors">Formación</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-white">Legal</h4>
            <ul className="mt-3 space-y-2">
              <li><Link href="#" className="text-sm text-sage hover:text-white transition-colors">Privacidad</Link></li>
              <li><Link href="#" className="text-sm text-sage hover:text-white transition-colors">Términos</Link></li>
              <li><Link href="#" className="text-sm text-sage hover:text-white transition-colors">Cookies</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-white">Contacto</h4>
            <ul className="mt-3 space-y-2">
              <li><span className="text-sm text-sage">info@circulr.es</span></li>
              <li><span className="text-sm text-sage">Barcelona, España</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="text-center text-xs text-sage">
            &copy; {new Date().getFullYear()} CIRCULR. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
