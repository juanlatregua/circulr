"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";

export default function SettingsPage() {
  const { user, profile, loading: userLoading } = useUser();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    company_name: "",
    sector: "",
    company_size: "",
    phone: "",
  });
  const [initialized, setInitialized] = useState(false);

  // Hydrate form once profile loads
  if (profile && !initialized) {
    setForm({
      full_name: profile.full_name || "",
      company_name: profile.company_name || "",
      sector: profile.sector || "",
      company_size: profile.company_size || "",
      phone: profile.phone || "",
    });
    setInitialized(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update(form)
      .eq("id", user.id);

    setSaving(false);

    if (updateError) {
      setError("Error al guardar. Inténtalo de nuevo.");
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  if (userLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-pale" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-800 text-off-white">
        Configuraci&oacute;n
      </h1>
      <p className="mt-1 text-sm text-pale">
        Gestiona tu perfil y preferencias.
      </p>

      <form onSubmit={handleSave} className="mt-8 max-w-lg space-y-5">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-pale">
            Nombre completo
          </label>
          <input
            id="full_name"
            type="text"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-steel/30 bg-smoke px-3 py-2 text-sm text-off-white placeholder:text-mid focus:border-lime focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="company_name" className="block text-sm font-medium text-pale">
            Empresa
          </label>
          <input
            id="company_name"
            type="text"
            value={form.company_name}
            onChange={(e) => setForm({ ...form, company_name: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-steel/30 bg-smoke px-3 py-2 text-sm text-off-white placeholder:text-mid focus:border-lime focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="sector" className="block text-sm font-medium text-pale">
            Sector
          </label>
          <input
            id="sector"
            type="text"
            value={form.sector}
            onChange={(e) => setForm({ ...form, sector: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-steel/30 bg-smoke px-3 py-2 text-sm text-off-white placeholder:text-mid focus:border-lime focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="company_size" className="block text-sm font-medium text-pale">
            Tama&ntilde;o de empresa
          </label>
          <select
            id="company_size"
            value={form.company_size}
            onChange={(e) => setForm({ ...form, company_size: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-steel/30 bg-smoke px-3 py-2 text-sm text-off-white focus:border-lime focus:outline-none"
          >
            <option value="">Seleccionar...</option>
            <option value="1-10">1-10 empleados</option>
            <option value="11-50">11-50 empleados</option>
            <option value="51-250">51-250 empleados</option>
            <option value="251-1000">251-1000 empleados</option>
            <option value="1000+">1000+ empleados</option>
          </select>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-pale">
            Tel&eacute;fono
          </label>
          <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-steel/30 bg-smoke px-3 py-2 text-sm text-off-white placeholder:text-mid focus:border-lime focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <p className="text-xs text-mid">
            Email: {user?.email}
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
        {success && (
          <p className="text-sm text-emerald-400">Cambios guardados.</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-lime px-5 py-2.5 text-sm font-medium text-black hover:bg-lime-dim disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
