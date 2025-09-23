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
        colors: {
          primary: theme.colors.primary,
          secondary: theme.colors.secondary ?? theme.colors.primary,
          surface: theme.colors.surface ?? theme.colors.bg,
        },
      })),
    []
  );

  const handleSelect = (event) => {
    setThemeId(event.target.value);
  };

  const handleClick = (id) => {
    setThemeId(id);
  };

  return React.createElement(
    "fieldset",
    {
      "data-theme-switcher": true,
      style: {
        margin: 0,
        padding: 0,
        border: "none",
        display: "grid",
        gap: "0.75rem",
      },
    },
    React.createElement(
      "legend",
      {
        style: {
          fontWeight: 700,
          fontSize: "0.95rem",
        },
      },
      "اختر الثيم"
    ),
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
        },
      },
      options.map((option) => {
        const isActive = option.id === themeId;
        const swatches = [option.colors.primary, option.colors.secondary, option.colors.surface];
        return React.createElement(
          "label",
          {
            key: option.id,
            "data-theme-option": option.id,
            style: {
              position: "relative",
              cursor: "pointer",
              display: "grid",
              gap: "0.5rem",
              minWidth: "156px",
              padding: "0.75rem 0.9rem",
              borderRadius: "var(--radius-md)",
              border: isActive
                ? "2px solid var(--focus-ring, #58a6ff)"
                : "1px solid var(--surface-border, var(--border))",
              boxShadow: isActive ? "var(--shadow-soft)" : "none",
              background: "var(--surface, rgba(255,255,255,0.02))",
              transition: "box-shadow 0.25s ease, transform 0.25s ease",
            },
            onClick: () => handleClick(option.id),
          },
          React.createElement("input", {
            type: "radio",
            name: "theme-option",
            value: option.id,
            checked: isActive,
            onChange: handleSelect,
            style: {
              position: "absolute",
              opacity: 0,
              width: "1px",
              height: "1px",
              margin: 0,
            },
          }),
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.75rem",
              },
            },
            React.createElement(
              "span",
              {
                style: {
                  fontWeight: 600,
                  fontSize: "0.95rem",
                },
              },
              option.label
            ),
            React.createElement(
              "span",
              {
                "aria-hidden": "true",
                style: {
                  display: "inline-flex",
                  gap: "0.35rem",
                },
              },
              swatches.map((color, index) =>
                React.createElement("span", {
                  key: `${option.id}-swatch-${index}`,
                  style: {
                    width: "14px",
                    height: "14px",
                    borderRadius: "999px",
                    border: "1px solid rgba(0,0,0,0.15)",
                    background: color,
                  },
                })
              )
            )
          ),
          React.createElement("span", {
            style: {
              fontSize: "0.75rem",
              opacity: 0.8,
              display: "block",
            },
          }, `Primary: ${option.colors.primary}`)
        );
      })
    ),
    React.createElement(
      "select",
      {
        value: themeId,
        onChange: handleSelect,
        style: {
          display: "none",
        },
        "aria-hidden": "true",
      },
      options.map((option) =>
        React.createElement(
          "option",
          { key: option.id, value: option.id },
          option.label
        )
      )
    )
  );
}

export default ThemeSwitcher;
