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
      // eslint-disable-next-line no-console
      console.warn(`[three] Unknown example model: ${modelConfig.example}`, error);
    }
  }
  return null;
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

function PlaceholderGem({ color, animate }) {
  const meshRef = useRef(null);

  useFrame((_, delta) => {
    if (!meshRef.current || !animate) {
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

function SceneModel({ modelConfig, accentColor, effects, onReady, onError, allowAnimation }) {
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
  const autoRotate = allowAnimation && modelConfig?.autoRotate !== false;
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

export const SimpleScene = memo(function SimpleScene({
  config,
  enabled = true,
  className,
  accentColor = "#58a6ff",
  CanvasComponent,
}) {
  const surface = describeSimpleSceneSurface({
    enabled,
    webglAvailable: detectWebGLSupport(),
  });

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

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false;
    }
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const [documentHidden, setDocumentHidden] = useState(() => {
    if (typeof document === "undefined") {
      return false;
    }
    return document.hidden;
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = (event) => setPrefersReducedMotion(event.matches);
    update(query);
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", update);
      return () => query.removeEventListener("change", update);
    }
    if (typeof query.addListener === "function") {
      query.addListener(update);
      return () => query.removeListener(update);
    }
    return undefined;
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }
    const onVisibilityChange = () => {
      setDocumentHidden(document.hidden);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  const [modelReady, setModelReady] = useState(false);

  useEffect(() => {
    setModelReady(false);
  }, [config?.model]);

  const [OrbitControlsComponent, setOrbitControlsComponent] = useState(null);

  useEffect(() => {
    let disposed = false;

    const shouldLoadOrbitControls =
      !CanvasComponent &&
      typeof window !== "undefined" &&
      typeof document !== "undefined" &&
      typeof window.requestAnimationFrame === "function";

    if (!shouldLoadOrbitControls) {
      setOrbitControlsComponent(null);
      return () => {
        disposed = true;
      };
    }

    setOrbitControlsComponent(null);

    import("@react-three/drei")
      .then((mod) => {
        if (disposed) {
          return;
        }
        const Candidate = mod?.OrbitControls ?? mod?.default?.OrbitControls;
        if (Candidate) {
          setOrbitControlsComponent(() => Candidate);
        }
      })
      .catch((error) => {
        if (typeof console !== "undefined") {
          // eslint-disable-next-line no-console
          console.warn("[three] Failed to load OrbitControls", error);
        }
      });

    return () => {
      disposed = true;
    };
  }, [CanvasComponent]);

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
  }, []);

  const handleError = useCallback((error) => {
    if (error && error.name !== "AbortError") {
      // eslint-disable-next-line no-console
      console.warn("[three] Failed to load GLB model", error);
    }
    setModelReady(false);
  }, []);

  const shouldAnimate = enabled && !prefersReducedMotion && !documentHidden;

  return React.createElement(
    Canvas3D,
    {
      camera,
      shadows: shadowsEnabled,
      dpr: [1, 1.75],
      CanvasComponent,
      onCreated: (state) => {
        if (state?.gl?.setPixelRatio) {
          const ratio =
            typeof window === "undefined" ? 1 : Math.min(1.75, window.devicePixelRatio || 1);
          state.gl.setPixelRatio(ratio);
        }
      },
      containerProps: {
        className,
        "data-scene-surface": surface,
        style: { borderRadius: "var(--radius-lg)" },
      },
      fallback: null,
    },
    React.createElement("color", { attach: "background", args: [backgroundColor] }),
    React.createElement(SceneEffects, { effects }),
    React.createElement(SceneLights, { config, accentColor }),
    CanvasComponent || !OrbitControlsComponent
      ? null
      : React.createElement(OrbitControlsComponent, {
          makeDefault: true,
          enablePan: false,
          enableZoom: false,
          enableDamping: true,
          dampingFactor: 0.08,
          minPolarAngle: Math.PI * 0.3,
          maxPolarAngle: Math.PI * 0.55,
        }),
    React.createElement(SceneModel, {
      modelConfig: config?.model,
      accentColor,
      effects,
      onReady: handleReady,
      onError: handleError,
      allowAnimation: shouldAnimate,
    }),
    !modelReady
      ? React.createElement(PlaceholderGem, { color: accentColor, animate: shouldAnimate })
      : null
  );
});

export default SimpleScene;
