import React, { useMemo, ChangeEvent } from "react";
import { useTheme } from "../hooks/useTheme";
import { THEMES } from "@/themes/registry";

export function ThemeSwitcher() {
  const { themeId, setThemeId } = useTheme();

  const options = useMemo(
    () =>
      Object.values(THEMES).map((theme) => ({
        id: theme.id,
        label: theme.name,
      })),
    []
  );

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setThemeId(event.target.value);
  };

  return (
    <label style={{ display: "inline-flex", flexDirection: "column", gap: "0.25rem" }}>
      <span style={{ fontWeight: 600 }}>اختر الثيم</span>
      <select value={themeId} onChange={handleChange} data-theme-switcher>
        {options.map((option) => (
          <option key={option.id} value={option.id} data-theme-option={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default ThemeSwitcher;
