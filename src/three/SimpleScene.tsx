import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Canvas3D } from "./Canvas3D";
import { loadGLBModel, resolveExampleModel } from "./loaders";
import { describeSimpleSceneSurface, detectWebGLSupport } from "./simpleSceneRuntime";

function normalizeVector3(value, fallback) {
  if (Array.isArray(value) && value.length === 1 && typeof value[0] === "number") {
    return [value[0], value[0], value[0]];
  }
  if (Array.isArray(value) && value.length >= 2 && value.every((component) => typeof component === "number")) {
    return [
      value[0],
      value[1],
      typeof value[2] === "number" ? value[2] : fallback[2],
    ];
  }
  if (typeof value === "number") {
    return [value, value, value];
  }
  return fallback;
}

function toRadiansVector(value, fallback) {
  const source = normalizeVector3(value, fallback);
  return source.map((component, index) => {
    const raw = Array.isArray(value) ? value[index] : value;
    if (typeof raw !== "number") {
      return component;
    }
    return (raw * Math.PI) / 180;
  });
}

function resolveModelPath(modelConfig) {
  if (!modelConfig) {
    return null;
  }
  if (typeof modelConfig.path === "string" && modelConfig.path.length > 0) {
    return modelConfig.path;
  }
  if (modelConfig.example && typeof modelConfig.example === "string") {
    try {
      return resolveExampleModel(modelConfig.example);
    } catch (error) {
      console.warn(`[three] Unknown example model: ${modelConfig.example}`, error);
    }
  }
  return null;
}

function extractErrorCode(error) {
  if (!error || typeof error !== "object") {
    return undefined;
  }
  const candidate = error;
  const code = candidate.code;
  if (typeof code === "string") {
    return code;
  }
  return undefined;
}

function parseBloomConfig(bloom) {
  if (!bloom) {
    return { enabled: false, intensity: 0 };
  }
  if (typeof bloom === "boolean") {
    return { enabled: bloom, intensity: bloom ? 0.6 : 0 };
  }
  return {
    enabled: bloom.enabled !== false,
    intensity: typeof bloom.intensity === "number" ? bloom.intensity : 0.7,
  };
}

function SceneLights({ config, accentColor }) {
  const lights = Array.isArray(config?.lights) ? config.lights : [];
  const shadowConfig = config?.effects?.shadow ?? {};
  const shadowsEnabled = shadowConfig.enabled !== false;
  const mapSize = normalizeVector3(shadowConfig.mapSize, [1024, 1024, 0]);
  const bias = typeof shadowConfig.bias === "number" ? shadowConfig.bias : -0.0005;
  return React.createElement(
    React.Fragment,
    null,
    ...lights.map((light, index) => {
      const key = `${light.type}-${index}`;
      const position = Array.isArray(light.position) ? light.position : [0, 3, 2];
      const intensity = typeof light.intensity === "number" ? light.intensity : 1;
      const lightColor = light.color ?? accentColor;
      const commonProps = {
        key,
        intensity,
        color: lightColor,
        castShadow: shadowsEnabled,
      };
      const shadowProps = shadowsEnabled
        ? {
            "shadow-mapSize-width": mapSize[0] ?? 1024,
            "shadow-mapSize-height": mapSize[1] ?? 1024,
            "shadow-bias": bias,
            "shadow-radius": typeof shadowConfig.radius === "number" ? shadowConfig.radius : 2,
          }
        : {};
      if (light.type === "ambient") {
        return React.createElement("ambientLight", commonProps);
      }
      if (light.type === "directional") {
        return React.createElement(
          "directionalLight",
          { ...commonProps, position, ...shadowProps }
        );
      }
      if (light.type === "point") {
        return React.createElement("pointLight", { ...commonProps, position });
      }
      if (light.type === "spot") {
        return React.createElement(
          "spotLight",
          {
            ...commonProps,
            position,
            angle: 0.5,
            penumbra: 0.35,
            ...shadowProps,
          }
        );
      }
      return null;
    })
  );
}

function PlaceholderGem({ color }) {
  const meshRef = useRef(null);

  useFrame((_, delta) => {
    if (!meshRef.current) {
      return;
    }
    meshRef.current.rotation.y += delta * 0.4;
    meshRef.current.rotation.x = 0.6;
  });

  return React.createElement(
    "mesh",
    { ref: meshRef, castShadow: true, receiveShadow: true },
    React.createElement("icosahedronGeometry", { args: [0.9, 1] }),
    React.createElement("meshStandardMaterial", {
      color,
      metalness: 0.6,
      roughness: 0.25,
    })
  );
}

function SceneEffects({ effects }) {
  if (!effects) {
    return null;
  }
  const nodes = [];
  if (effects.fog && typeof effects.fog.color === "string") {
    const near = typeof effects.fog.near === "number" ? effects.fog.near : 6;
    const far = typeof effects.fog.far === "number" ? effects.fog.far : 18;
    nodes.push(
      React.createElement("fog", { key: "fog", attach: "fog", args: [effects.fog.color, near, far] })
    );
  }
  return nodes.length ? React.createElement(React.Fragment, null, ...nodes) : null;
}

function SceneModel({ modelConfig, accentColor, effects, onReady, onError }) {
  const groupRef = useRef(null);
  const [resource, setResource] = useState(null);
  const [error, setError] = useState(null);

  const bloom = parseBloomConfig(effects?.bloom);
  const modelPath = useMemo(() => resolveModelPath(modelConfig), [modelConfig]);

  useEffect(() => {
    setResource(null);
    setError(null);
    if (!modelPath) {
      return undefined;
    }
    const controller = new AbortController();
    loadGLBModel(modelPath, { signal: controller.signal })
      .then((gltf) => {
        setResource(gltf);
      })
      .catch((loadError) => {
        if (loadError?.name === "AbortError") {
          return;
        }
        setError(loadError);
      });
    return () => {
      controller.abort();
    };
  }, [modelPath]);

  useEffect(() => {
    if (resource && onReady) {
      onReady();
    }
  }, [resource, onReady]);

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  const clonedScene = useMemo(() => {
    if (!resource?.scene) {
      return null;
    }
    const clone = resource.scene.clone(true);
    clone.traverse((child) => {
      if (!child?.isMesh) {
        return;
      }
      child.castShadow = true;
      child.receiveShadow = true;
      if (child.material?.clone) {
        child.material = child.material.clone();
      }
      if (child.material?.color?.set) {
        child.material.color.set(accentColor ?? "#ffffff");
      }
      if (child.material?.emissive?.set) {
        if (bloom.enabled) {
          child.material.emissive.set(accentColor ?? "#ffffff");
          child.material.emissiveIntensity = bloom.intensity;
        } else {
          child.material.emissiveIntensity = 0;
        }
      }
    });
    return clone;
  }, [resource, accentColor, bloom]);

  const scale = normalizeVector3(modelConfig?.scale, [1, 1, 1]);
  const position = normalizeVector3(modelConfig?.position, [0, -0.25, 0]);
  const rotation = toRadiansVector(modelConfig?.rotation, [0, 0, 0]);
  const autoRotate = modelConfig?.autoRotate !== false;
  const rotationSpeed = typeof modelConfig?.rotationSpeed === "number" ? modelConfig.rotationSpeed : 0.5;

  useFrame((_, delta) => {
    if (!autoRotate || !groupRef.current) {
      return;
    }
    groupRef.current.rotation.y += delta * rotationSpeed;
  });

  if (!clonedScene) {
    return null;
  }

  return React.createElement(
    "group",
    {
      ref: groupRef,
      position,
      rotation,
      scale,
    },
    React.createElement("primitive", { object: clonedScene })
  );
}

export interface SimpleSceneProps {
  config: any;
  enabled?: boolean;
  className?: string;
  accentColor?: string;
}

export const SimpleScene = memo(function SimpleScene({
  config,
  enabled = true,
  className,
  accentColor = "#58a6ff",
}: SimpleSceneProps) {
  const surface = describeSimpleSceneSurface({
    enabled,
    webglAvailable: detectWebGLSupport(),
  });

  const [modelReady, setModelReady] = useState(false);
  const [modelError, setModelError] = useState(null);

  useEffect(() => {
    setModelReady(false);
    setModelError(null);
  }, [config?.model]);

  const camera = useMemo(() => {
    const position = Array.isArray(config?.camera?.position)
      ? config.camera.position
      : [0, 1.25, 4];
    return {
      position,
      fov: typeof config?.camera?.fov === "number" ? config.camera.fov : 45,
      near: 0.1,
      far: 100,
    };
  }, [config]);

  const effects = config?.effects ?? {};
  const backgroundColor = typeof config?.background === "string" ? config.background : "#050505";
  const shadowsEnabled = effects?.shadow?.enabled !== false;

  const handleReady = useCallback(() => {
    setModelReady(true);
    setModelError(null);
  }, []);

  const handleError = useCallback((error) => {
    if (!error || error.name === "AbortError") {
      return;
    }
    console.warn("[three] Failed to load GLB model", error);
    setModelError(error);
    setModelReady(false);
  }, []);

  if (surface !== "canvas") {
    return React.createElement(
      "div",
      {
        className,
        "data-scene-surface": surface,
        style: {
          position: "relative",
          width: "100%",
          height: "100%",
          display: "grid",
          placeItems: "center",
          background: "var(--bg)",
          borderRadius: "var(--radius-lg)",
        },
      },
      React.createElement(
        "span",
        { style: { color: "var(--fg)", fontSize: "0.875rem" } },
        "متصفحك لا يدعم WebGL"
      )
    );
  }

  const errorCode = extractErrorCode(modelError);
  const errorTitle =
    errorCode === "MODEL_NOT_FOUND"
      ? "ملف النموذج غير متوفر"
      : "تعذر تحميل النموذج ثلاثي الأبعاد";
  const errorDescription =
    errorCode === "MODEL_NOT_FOUND"
      ? "تحقق من مسار ملف GLB أو استخدم إعدادًا مختلفًا للثيم."
      : "حدث خطأ أثناء تحميل النموذج. جرّب تحديث الصفحة أو اختيار ثيم آخر.";

  return React.createElement(
    "div",
    {
      className,
      "data-scene-surface": surface,
      style: {
        position: "relative",
        width: "100%",
        height: "100%",
      },
    },
    React.createElement(
      Canvas3D,
      {
        camera,
        shadows: shadowsEnabled,
        dpr: [1, 1.5],
        containerProps: {
          className: "h-full w-full",
          style: { borderRadius: "var(--radius-lg)" },
        },
        fallback: null,
      },
      React.createElement("color", { attach: "background", args: [backgroundColor] }),
      React.createElement(SceneEffects, { effects }),
      React.createElement(SceneLights, { config, accentColor }),
      React.createElement(SceneModel, {
        modelConfig: config?.model,
        accentColor,
        effects,
        onReady: handleReady,
        onError: handleError,
      }),
      !modelReady && !modelError
        ? React.createElement(PlaceholderGem, { color: accentColor })
        : null
    ),
    modelError
      ? React.createElement(
          "div",
          {
            style: {
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              padding: "1rem",
              textAlign: "center",
              color: "var(--foreground)",
              backgroundColor: "rgba(15, 23, 42, 0.75)",
              backdropFilter: "blur(6px)",
            },
          },
          React.createElement(
            "div",
            {
              style: {
                display: "grid",
                gap: "0.5rem",
                maxWidth: "18rem",
              },
            },
            React.createElement("strong", null, errorTitle),
            React.createElement(
              "span",
              {
                style: {
                  fontSize: "0.75rem",
                  color: "var(--muted-foreground)",
                  lineHeight: 1.6,
                },
              },
              errorDescription
            )
          )
        )
      : null
  );
});

export default SimpleScene;
