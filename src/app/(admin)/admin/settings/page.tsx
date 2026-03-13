"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";

export default function AdminSettingsPage() {
  const { user, profile, loading: userLoading } = useUser();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
  });
  const [initialized, setInitialized] = useState(false);

  if (profile && !initialized) {
    setForm({
      full_name: profile.full_name || "",
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
        <Loader2 size={24} className="animate-spin text-mid" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-800 text-forest">
        Configuraci&oacute;n
      </h1>
      <p className="mt-1 text-sm text-mid">
        Ajustes de tu cuenta de administrador.
      </p>

      <form onSubmit={handleSave} className="mt-8 max-w-lg space-y-5">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-mid">
            Nombre completo
          </label>
          <input
            id="full_name"
            type="text"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-sand bg-white px-3 py-2 text-sm text-forest placeholder:text-stone focus:border-teal focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-mid">
            Tel&eacute;fono
          </label>
          <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-sand bg-white px-3 py-2 text-sm text-forest placeholder:text-stone focus:border-teal focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <p className="text-xs text-stone">
            Email: {user?.email}
          </p>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && (
          <p className="text-sm text-emerald-400">Cambios guardados.</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
