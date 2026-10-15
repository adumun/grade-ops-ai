import { useEffect, useState } from "react";
import Button from "@/components/ds/Button";
import Field from "@/components/ds/Field";
import Input from "@/components/ds/Input";
import Textarea from "@/components/ds/Textarea";
import LucideIcon from "@/components/ds/LucideIcon";
import styles from "./ContentSet.module.css";

type Props = {
  open: boolean;
  canEdit: boolean;
  onClose: () => void;
  onCreate: (values: { name: string; description: string }) => void;
};

export default function ContentSetCreateDialog({ open, canEdit, onClose, onCreate }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setError("");
    }
  }, [open]);

  if (!open) return null;

  const submit = () => {
    const normalizedName = name.trim();
    if (!normalizedName) {
      setError("Ingresa un nombre para crear el conjunto.");
      return;
    }
    onCreate({ name: normalizedName, description: description.trim() });
  };

  return (
    <div className={styles.dialogBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="create-content-set-title">
        <div className={styles.dialogHeader}>
          <div>
            <span className={styles.kicker}>Nuevo contenido reutilizable</span>
            <h2 id="create-content-set-title">Crea un conjunto nuevo</h2>
            <p>Define la base que quedará disponible para esta y futuras evaluaciones.</p>
          </div>
          <Button type="button" variant="ghost" size="sm" aria-label="Cerrar" onClick={onClose} startIcon={<LucideIcon name="x" size={18} />} />
        </div>
        <div className={styles.dialogBody}>
          <Field htmlFor="new-content-set-name" label="Nombre del conjunto" required error={error || undefined}>
            <Input id="new-content-set-name" autoFocus value={name} placeholder="Ej. Funciones y modularidad" onChange={(event) => { setName(event.target.value); setError(""); }} />
          </Field>
          <Field htmlFor="new-content-set-description" label="Descripción" hint="Opcional">
            <Textarea id="new-content-set-description" value={description} placeholder="Qué reúne este conjunto y para qué conviene reutilizarlo." onChange={(event) => setDescription(event.target.value)} />
          </Field>
        </div>
        <div className={styles.dialogActions}>
          <Button type="button" variant="outline" onClick={onClose} startIcon={<LucideIcon name="x" size={16} />}>Cancelar</Button>
          <Button type="button" disabled={!canEdit} onClick={submit} startIcon={<LucideIcon name="plus" size={16} />}>Crear conjunto</Button>
        </div>
      </section>
    </div>
  );
}
