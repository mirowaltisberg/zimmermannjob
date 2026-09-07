-- Gemeinsam für alle zehn Websites; vor Auslieferung des CV-und-Name-Formulars anwenden.
-- Kontaktangaben können im privaten CV enthalten sein. Fehlende Felder bleiben NULL.
-- Bestehende Dossiers, Rollenrechte und Aufbewahrungsdaten bleiben erhalten.
alter table public.applications
  alter column email drop not null,
  alter column phone drop not null;
