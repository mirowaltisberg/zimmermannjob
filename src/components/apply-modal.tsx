"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, FileText, Loader2, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useHaptic } from "@/hooks/use-haptic";
import {
  MAX_APPLICATION_PDF_BYTES,
  hasPdfMagic,
  isValidEmail,
  isValidPdfFilename,
  isValidPhone,
} from "@/lib/application-validation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ApplyModalProps {
  jobId: string;
  jobTitle: string;
  onOpen?: () => void;
}

export function ApplyModal({ jobId, jobTitle, onOpen }: ApplyModalProps) {
  const { trigger } = useHaptic();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [consent, setConsent] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const formStartedAtRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setWebsite("");
    setConsent(false);
    setCvFile(null);
    setError(null);
    setIsSuccess(false);
    setIsSubmitting(false);
    formStartedAtRef.current = 0;
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      formStartedAtRef.current = Date.now();
      onOpen?.();
    } else {
      window.setTimeout(resetForm, 300);
    }
  };

  const validateFile = async (file: File): Promise<string | null> => {
    const filename = file.name.normalize("NFKC").trim();
    if (
      file.type !== "application/pdf" ||
      !isValidPdfFilename(filename)
    ) {
      return "Bitte lade ausschliesslich eine PDF-Datei mit einem gültigen Dateinamen hoch.";
    }
    if (file.size < 10 || file.size > MAX_APPLICATION_PDF_BYTES) {
      return "Die PDF-Datei darf maximal 5 MB gross sein.";
    }

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (!hasPdfMagic(bytes)) {
        return "Die ausgewählte Datei ist keine gültige PDF-Datei.";
      }
    } catch {
      return "Die PDF-Datei konnte nicht gelesen werden.";
    }
    return null;
  };

  const handleFileSelect = async (file: File) => {
    const fileError = await validateFile(file);
    if (fileError) {
      trigger("error");
      setCvFile(null);
      setError(fileError);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    trigger("selection");
    setError(null);
    setCvFile(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void handleFileSelect(file);
  };

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) void handleFileSelect(file);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!isValidEmail(email.trim()) || !isValidPhone(phone.trim())) {
      setError("Bitte prüfe deine E-Mail-Adresse und Telefonnummer.");
      trigger("error");
      return;
    }
    if (!cvFile || !consent) {
      setError("Bitte füge einen PDF-Lebenslauf hinzu und bestätige die Einwilligung.");
      trigger("error");
      return;
    }

    const fileError = await validateFile(cvFile);
    if (fileError) {
      setError(fileError);
      trigger("error");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("jobId", jobId);
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("phone", phone.trim());
      formData.append("website", website);
      formData.append("formStartedAt", String(formStartedAtRef.current));
      formData.append("consent", "yes");
      formData.append("cv", cvFile);

      const response = await fetch("/api/applications", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error || "Online-Bewerbungen sind derzeit nicht verfügbar."
        );
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      trigger("success");
    } catch (submissionError) {
      setIsSubmitting(false);
      trigger("error");
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Online-Bewerbungen sind derzeit nicht verfügbar."
      );
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full h-12 text-base sm:text-lg font-bold shadow-lg shadow-primary/20 rounded-xl btn-interactive">
          Angaben übermitteln
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[calc(100%-1rem)] sm:w-full max-w-none sm:max-w-[min(480px,calc(100vw-2rem))] max-h-[92dvh] sm:max-h-[85dvh] overflow-y-auto rounded-2xl p-4 sm:p-6 animate-modal-in top-auto bottom-2 sm:top-[50%] sm:bottom-auto translate-y-0 sm:translate-y-[-50%]">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 break-words pr-8">
                Angaben für {jobTitle}
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Die Angaben werden vom Betreiber dieser Plattform zur internen Prüfung gespeichert. Es erfolgt keine automatische Weiterleitung an einen Arbeitgeber.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              <div className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                <Label htmlFor="apply-website">Website</Label>
                <Input
                  id="apply-website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apply-name">Vollständiger Name</Label>
                  <Input
                    id="apply-name"
                    autoComplete="name"
                    maxLength={100}
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Max Muster"
                    className="h-11 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apply-email">E-Mail-Adresse</Label>
                  <Input
                    id="apply-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    maxLength={254}
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="max@beispiel.ch"
                    className="h-11 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apply-phone">Telefonnummer</Label>
                  <Input
                    id="apply-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={40}
                    required
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+41 79 123 45 67"
                    className="h-11 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apply-cv">Lebenslauf / CV als PDF</Label>
                  <input
                    id="apply-cv"
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    required
                    className="sr-only"
                    onChange={handleFileChange}
                  />

                  {!cvFile ? (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => fileInputRef.current?.click()}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") fileInputRef.current?.click();
                      }}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
                        isDragging ? "border-primary bg-primary/5" : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <UploadCloud className="h-7 w-7 text-primary mb-2" />
                      <p className="text-sm font-medium text-slate-900">PDF auswählen oder hineinziehen</p>
                      <p className="text-xs text-slate-500 mt-1">Ausschliesslich PDF, maximal 5 MB</p>
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{cvFile.name}</p>
                        <p className="text-xs text-slate-500">{formatFileSize(cvFile.size)}</p>
                      </div>
                      <button
                        type="button"
                        aria-label="PDF entfernen"
                        onClick={() => {
                          setCvFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <label className="flex items-start gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300"
                />
                <span>
                  Ich willige ein, dass der in der{" "}
                  <Link
                    href="/datenschutz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    Datenschutzerklärung
                  </Link>{" "}
                  genannte Verantwortliche meine Angaben und den CV zur Prüfung dieser Anfrage verarbeitet. Mir ist bekannt, dass keine automatische Weiterleitung an den Arbeitgeber erfolgt.
                </span>
              </label>

              {error && (
                <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3" role="alert">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-bold"
                disabled={isSubmitting || !cvFile || !consent}
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Angaben werden geprüft...</>
                ) : (
                  "Angaben zur Prüfung speichern"
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
            <CheckCircle2 className="h-14 w-14 text-green-600" />
            <h2 className="text-2xl font-bold text-slate-900">Angaben gespeichert</h2>
            <p className="text-slate-600">
              Deine Angaben wurden zur internen Prüfung gespeichert. Dies bestätigt keine Weiterleitung an den Arbeitgeber.
            </p>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Schliessen
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
