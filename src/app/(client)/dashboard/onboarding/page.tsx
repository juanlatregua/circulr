import { OnboardingWizard } from "@/components/client/OnboardingWizard";

export default function OnboardingPage() {
  return (
    <div className="py-8">
      <div className="mx-auto max-w-2xl text-center mb-8">
        <h1 className="font-display text-3xl font-800 text-off-white">
          Bienvenido a CIRCULR
        </h1>
        <p className="mt-2 text-sm text-pale">
          Completa tu perfil para empezar tu transición circular.
        </p>
      </div>
      <OnboardingWizard />
    </div>
  );
}
