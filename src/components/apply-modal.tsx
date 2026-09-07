"use client";

import { getApplicationAnalytics, getTestRunId, getTestRunToken, readSavedApplication } from "@/lib/application-client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AlertCircle, CheckCircle2, FileText, Loader2, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useHaptic } from "@/hooks/use-haptic";
import {
  MAX_APPLICATION_PDF_BYTES,
  hasPdfMagic,
  hasDisallowedPdfFeatures,
  isAcceptedPdfMimeType,
  isValidPdfFilename,
} from "@/lib/application-validation";
import { trackEvent } from "@/lib/analytics";
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
  controllerName?: string;
}

export function ApplyModal({ jobId, jobTitle, onOpen, controllerName }: ApplyModalProps) {
  const { trigger } = useHaptic();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [consent, setConsent] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const submissionIdRef = useRef<string | null>(null);
  const fileSelectionRef = useRef(0);
  const [isValidatingFile, setIsValidatingFile] = useState(false);
  const formStartedAtRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submissionInFlight = useRef(false);

  const resetForm = () => {
    submissionIdRef.current = null;
    setName("");
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
    if (submissionInFlight.current || isValidatingFile) return;
    setIsOpen(open);
    if (open) {
      if (isSuccess) resetForm();
      if (!formStartedAtRef.current) formStartedAtRef.current = Date.now();
      submissionIdRef.current ??= crypto.randomUUID();
      trackEvent("application_open", { job_id: jobId });
      onOpen?.();
    }
  };

  const validateFile = async (file: File): Promise<string | null> => {
    const filename = file.name.normalize("NFKC").trim();
    if (
      !isAcceptedPdfMimeType(file.type) ||
      !isValidPdfFilename(filename)
    ) {
      return "Bitte lade ausschliesslich eine PDF-Datei mit einem gültigen Dateinamen hoch.";
    }
    if (file.size < 10 || file.size > MAX_APPLICATION_PDF_BYTES) {
      return "Die PDF-Datei darf maximal 4 MB gross sein.";
    }

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (hasDisallowedPdfFeatures(bytes)) return "Bitte exportiere den Lebenslauf als PDF ohne Passwortschutz oder ausführbare Inhalte.";
      if (!hasPdfMagic(bytes)) {
        return "Die ausgewählte Datei ist keine gültige PDF-Datei.";
      }
    } catch {
      return "Die PDF-Datei konnte nicht gelesen werden.";
    }
    return null;
  };

  const handleFileSelect = async (file: File) => {
    const selection = ++fileSelectionRef.current;
    setIsValidatingFile(true);
    const fileError = await validateFile(file);
    if (selection !== fileSelectionRef.current) return;
    setIsValidatingFile(false);
    if (fileError) {
      trackEvent("application_error", {
        job_id: jobId,
        error_kind: "file_validation",
      });
      trigger("error");
      setError(fileError);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    trigger("selection");
    setError(null);
    setCvFile(file);
    trackEvent("application_file_selected", {
      job_id: jobId,
      file_size_bucket:
        file.size < 1_000_000
          ? "under_1mb"
          : file.size < 3_000_000
            ? "1_to_3mb"
            : "3_to_4mb",
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void handleFileSelect(file);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) void handleFileSelect(file);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submissionInFlight.current || isValidatingFile || isSuccess) return;
    submissionInFlight.current = true;
    try {
      setError(null);

      if (!cvFile || !consent) {
        trackEvent("application_error", {
          job_id: jobId,
          error_kind: "missing_file_or_consent",
        });
        setError("Bitte füge einen PDF-Lebenslauf hinzu und bestätige die Einwilligung.");
        trigger("error");
        return;
      }

      setIsSubmitting(true);
      const fileError = await validateFile(cvFile);
      if (fileError) {
        trackEvent("application_error", {
          job_id: jobId,
          error_kind: "file_validation",
        });
        setError(fileError);
        trigger("error");
        return;
      }

      setIsSubmitting(true);
      trackEvent("application_submit", { job_id: jobId });
      try {
        const formData = new FormData();
        formData.append("jobId", jobId);
        formData.append("name", name.trim());
        formData.append("website", website);
        formData.append("formStartedAt", String(formStartedAtRef.current));
        formData.append("consent", "yes");
        formData.append("cv", cvFile);
        submissionIdRef.current ??= crypto.randomUUID();
        formData.append("submissionId", submissionIdRef.current);
        formData.append("analytics", getApplicationAnalytics());
        formData.append("testRunId", getTestRunId() ?? "");
        formData.append("testToken", getTestRunToken() ?? "");

        const response = await fetch("/api/applications", {
          method: "POST",
          body: formData,
          credentials: "same-origin",
          signal: AbortSignal.timeout(45_000),
          headers: { Accept: "application/json" },
        });

        await readSavedApplication(response);


        setIsSubmitting(false);
        setIsSuccess(true);
        trigger("success");
      } catch (submissionError) {
        formStartedAtRef.current = Date.now() - 3_000;
        trackEvent("application_error", {
          job_id: jobId,
          error_kind: "submission",
        });
        setIsSubmitting(false);
        trigger("error");
        setError(
          submissionError instanceof TypeError || (submissionError instanceof DOMException && ["AbortError", "TimeoutError"].includes(submissionError.name))
            ? "Die Verbindung wurde unterbrochen. Deine Angaben bleiben erhalten. Bitte versuche es erneut."
            : submissionError instanceof Error
            ? submissionError.message
            : "Online-Bewerbungen sind derzeit nicht verfügbar."
        );
      }
    } finally {
      setIsSubmitting(false);
      submissionInFlight.current = false;
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
          Bewerbung starten
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[calc(100%-1rem)] sm:w-full max-w-none sm:max-w-[min(480px,calc(100vw-2rem))] max-h-[92dvh] sm:max-h-[85dvh] overflow-y-auto rounded-2xl p-4 sm:p-6 animate-modal-in top-auto bottom-2 sm:top-[50%] sm:bottom-auto translate-y-0 sm:translate-y-[-50%]">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 break-words pr-8">
                Bewerbung für {jobTitle}
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Nur dein Name und dein CV. {controllerName ?? "Das Team dieser Plattform"} prüft dein Dossier; es wird nicht automatisch weitergeleitet.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} aria-busy={isSubmitting} className="space-y-4 mt-2">
              <fieldset disabled={isSubmitting} className="space-y-4 min-w-0">
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
                    className="h-11 rounded-lg text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apply-cv">Lebenslauf / CV als PDF</Label>
                  <input
                    id="apply-cv"
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    aria-describedby="apply-cv-help"
                    tabIndex={-1}
                    className="sr-only"
                    onChange={handleFileChange}
                  />

                  <p id="apply-cv-help" className="text-sm text-slate-600">PDF bis 4 MB. Bitte verwende einen CV mit Telefonnummer oder E-Mail-Adresse.</p>
                  {isValidatingFile && <p role="status" className="text-sm">PDF wird geprüft...</p>}

                  {!cvFile ? (
                    <button
                      type="button"
                      aria-label="PDF-Lebenslauf auswählen"
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={`w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
                        isDragging ? "border-primary bg-primary/5" : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <UploadCloud className="h-7 w-7 text-primary mb-2" />
                      <span className="text-sm font-semibold text-slate-900">CV auswählen</span>
                      <span className="text-xs text-slate-500 mt-1">Oder die PDF hier hineinziehen</span>
                    </button>
                  ) : (
                    <div className="border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{cvFile.name}</p>
                        <p className="text-xs text-slate-500">{formatFileSize(cvFile.size)}</p>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="min-h-11 text-sm underline">Anderen CV wählen</button>
                      </div>
                      <button
                        type="button"
                        aria-label="PDF entfernen"
                        onClick={() => {
                          fileSelectionRef.current += 1;
                          setIsValidatingFile(false);
                          setCvFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="flex min-h-11 min-w-11 items-center justify-center rounded-md hover:bg-slate-100 text-slate-500"
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
                  className="mt-1 h-5 w-5 shrink-0 rounded border-slate-300"
                />
                <span>
                  Ich stimme der Verarbeitung meiner Angaben und meines CV gemäss der{" "}
                  <Link
                    href="/datenschutz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    Datenschutzerklärung
                  </Link>{" "}
                  zur Prüfung meiner Bewerbung zu.
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
                disabled={isSubmitting || isValidatingFile}
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Bewerbung wird gespeichert...</>
                ) : (
                  "Bewerbung zur Prüfung senden"
                )}
              </Button>
              <Link href="/kontakt" target="_blank" rel="noopener noreferrer" className="inline-block text-sm underline">Kontakt aufnehmen</Link>
              </fieldset>
            </form>
          </>
        ) : (
          <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
            <CheckCircle2 className="h-14 w-14 text-green-600" />
            <DialogTitle className="text-2xl font-bold text-slate-900">Bewerbung gespeichert</DialogTitle>
            <DialogDescription className="text-slate-600">
              Dein Name und CV sind zur Prüfung eingegangen. Das Team nutzt die Kontaktdaten in deinem CV für Rückfragen. Dein Dossier wurde nicht automatisch an einen Arbeitgeber weitergeleitet.
            </DialogDescription>
            <Link href="/kontakt" className="text-sm underline">Rückfrage zu deiner Bewerbung</Link>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Schliessen
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
