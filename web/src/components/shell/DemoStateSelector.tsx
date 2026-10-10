"use client";

import { DEMO_STATE_OPTIONS, useDemoState } from "./ShellContext";
import styles from "./DemoStateSelector.module.css";

export default function DemoStateSelector() {
  const { demoState, setDemoState } = useDemoState();

  return (
    <label className={styles.control}>
      <span>Estado de demo</span>
      <select aria-label="Estado de demo" value={demoState} onChange={(event) => setDemoState(event.target.value as typeof demoState)}>
        {DEMO_STATE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}
