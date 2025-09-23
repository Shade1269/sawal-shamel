import React, { useMemo } from "react";
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

  const handleChange = (event) => {
    setThemeId(event.target.value);
  };

  return React.createElement(
    "label",
    { style: { display: "inline-flex", flexDirection: "column", gap: "0.25rem" } },
    React.createElement("span", { style: { fontWeight: 600 } }, "اختر الثيم"),
    React.createElement(
      "select",
      { value: themeId, onChange: handleChange, "data-theme-switcher": true },
      options.map((option) =>
        React.createElement(
          "option",
          { key: option.id, value: option.id, "data-theme-option": option.id },
          option.label
        )
      )
    )
  );
}

export default ThemeSwitcher;
