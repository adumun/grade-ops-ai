"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ds/Button";
import Field from "@/components/ds/Field";
import Input from "@/components/ds/Input";
import Textarea from "@/components/ds/Textarea";
import LucideIcon from "@/components/ds/LucideIcon";
import type { Material } from "../domain/types";
import styles from "./ContentSet.module.css";

type Props = {
  open: boolean;
  canEdit: boolean;
  fixtures: Material[];
  onClose: () => void;
  onCreate: (values: { name: string; description: string; materialIds: string[] }) => void;
};

export default function ContentSetCreateDialog({ open, canEdit, fixtures, onClose, onCreate }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [materialIds, setMaterialIds] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setMaterialIds([]);
      setError("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const toggleMaterial = (id: string) => {
    setMaterialIds((current) => current.includes(id) ? current.filter((currentId) => currentId !== id) : [...current, id]);
  };

  const submit = () => {
    const normalizedName = name.trim();
    if (!normalizedName) {
      setError("Ingresa un nombre para crear el contenido.");
      return;
    }
    onCreate({ name: normalizedName, description: description.trim(), materialIds });
  };

  return (
    <div className={styles.dialogBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="create-content-set-title">
        <div className={styles.dialogHeader}>
          <div>
            <span className={styles.kicker}>Nuevo contenido reutilizable</span>
            <h2 id="create-content-set-title">Crea un contenido nuevo</h2>
            <p>Define una base que quedará disponible para esta y futuras evaluaciones.</p>
          </div>
          <Button type="button" variant="ghost" size="sm" aria-label="Cerrar" onClick={onClose} startIcon={<LucideIcon name="x" size={18} />} />
        </div>
        <div className={styles.dialogBody}>
          <Field htmlFor="new-content-set-name" label="Nombre del contenido" required error={error || undefined}>
            <Input id="new-content-set-name" autoFocus value={name} placeholder="Ej. Funciones y modularidad" onChange={(event) => { setName(event.target.value); setError(""); }} />
          </Field>
          <Field htmlFor="new-content-set-description" label="Descripción" hint="Opcional">
            <Textarea id="new-content-set-description" value={description} placeholder="Qué incluye este contenido y para qué conviene reutilizarlo." onChange={(event) => setDescription(event.target.value)} />
          </Field>
          <fieldset className={styles.dialogMaterials}>
            <legend>Materiales iniciales <span>Opcional</span></legend>
            {fixtures.length === 0 ? <p>No hay materiales demo disponibles.</p> : fixtures.map((material) => (
              <label key={material.id} className={styles.dialogMaterial}>
                <input type="checkbox" checked={materialIds.includes(material.id)} onChange={() => toggleMaterial(material.id)} />
                <span><strong>{material.name}</strong><small>{material.type.toUpperCase()} · {material.sourceLabel}</small></span>
              </label>
            ))}
          </fieldset>
        </div>
        <div className={styles.dialogActions}>
          <Button type="button" variant="outline" onClick={onClose} startIcon={<LucideIcon name="x" size={16} />}>Cancelar</Button>
          <Button type="button" disabled={!canEdit} onClick={submit} startIcon={<LucideIcon name="plus" size={16} />}>Crear contenido</Button>
        </div>
      </section>
    </div>
  );
}
