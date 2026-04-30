"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, CheckCircle2, Loader2, Zap, X, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useHaptic } from "@/hooks/use-haptic";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

interface ApplyModalProps {
  jobId: string;
  jobTitle: string;
  company: string;
  onOpen?: () => void;
}

export function ApplyModal({ jobId, jobTitle, company, onOpen }: ApplyModalProps) {
  const { trigger } = useHaptic();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setCvFile(null);
    setError(null);
    setIsSuccess(false);
    setIsSubmitting(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setTimeout(resetForm, 300);
    }
  };

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Bitte lade eine PDF- oder DOCX-Datei hoch.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Die Datei darf maximal 10 MB gross sein.";
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    const fileError = validateFile(file);
    if (fileError) {
      trigger("error");
      setError(fileError);
      return;
    }
    trigger("selection");
    setError(null);
    setCvFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("jobId", jobId);
      formData.append("jobTitle", jobTitle);
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      if (cvFile) {
        formData.append("cv", cvFile);
      }

      const res = await fetch("/api/applications", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error || "Bewerbung konnte nicht gesendet werden."
        );
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      trigger("success");

      setTimeout(() => {
        setIsOpen(false);
        setTimeout(resetForm, 300);
      }, 2500);
    } catch (err) {
      setIsSubmitting(false);
      trigger("error");
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten.");
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
        <Button
          className="w-full h-12 text-base sm:text-lg font-bold shadow-lg shadow-primary/20 rounded-xl btn-interactive"
          onClick={onOpen}
        >
          Jetzt bewerben
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[calc(100%-1rem)] sm:w-full max-w-none sm:max-w-[min(425px,calc(100vw-2rem))] max-h-[92dvh] sm:max-h-[85dvh] overflow-y-auto rounded-2xl p-4 sm:p-6 animate-modal-in top-auto bottom-2 sm:top-[50%] sm:bottom-auto translate-y-0 sm:translate-y-[-50%]">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 break-words pr-8">
                Bewerben für {jobTitle}
              </DialogTitle>
              <DialogDescription className="text-slate-500">
                Schnell und unkompliziert in unter 2 Minuten
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 mt-4">
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apply-name">Vollständiger Name</Label>
                  <Input
                    id="apply-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Max Muster"
                    className="h-11 rounded-lg transition-shadow duration-200 focus-visible:shadow-[0_0_0_3px_oklch(0.795_0.155_75_/_20%)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apply-email">E-Mail-Adresse</Label>
                  <Input
                    id="apply-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="max@beispiel.ch"
                    className="h-11 rounded-lg transition-shadow duration-200 focus-visible:shadow-[0_0_0_3px_oklch(0.795_0.155_75_/_20%)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apply-phone">Telefonnummer</Label>
                  <Input
                    id="apply-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+41 79 123 45 67"
                    className="h-11 rounded-lg transition-shadow duration-200 focus-visible:shadow-[0_0_0_3px_oklch(0.795_0.155_75_/_20%)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lebenslauf / CV</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="sr-only"
                    onChange={handleFileChange}
                  />

                  {!cvFile ? (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => fileInputRef.current?.click()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
                      }}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={`border-2 border-dashed rounded-xl p-5 sm:p-6 flex flex-col items-center justify-center text-center transition-colors duration-200 cursor-pointer group ${
                        isDragging
                          ? "border-primary bg-primary/5"
                          : "border-slate-200 hover:bg-slate-50 hover:border-primary/50"
                      }`}
                    >
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200 ease-out">
                        <UploadCloud className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-sm font-medium text-slate-900">
                        Klicken zum Hochladen oder Datei hineinziehen
                      </p>
                      <p className="text-xs text-slate-500 mt-1">PDF, DOCX bis 10 MB</p>
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{cvFile.name}</p>
                        <p className="text-xs text-slate-500">{formatFileSize(cvFile.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          trigger("selection");
                          setCvFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-bold btn-interactive"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Bewerbung wird gesendet...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5 fill-current" />
                    Bewerbung absenden
                  </>
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="py-10 sm:py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-2 animate-success-pop">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Bewerbung gesendet!</h2>
            <p className="text-slate-500">
              Deine Bewerbung wurde erfolgreich übermittelt. Viel Erfolg!
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
