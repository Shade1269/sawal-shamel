export class GLTF {
  constructor(scene = createStubScene()) {
    this.scene = scene;
  }
}

export class GLTFLoader {
  constructor() {}

  load(path, onLoad, _onProgress, onError) {
    if (typeof path !== 'string' || !path.length) {
      if (typeof onError === 'function') {
        queueMicrotask(() => onError(new Error('Invalid path')));
      }
      return;
    }

    queueMicrotask(() => {
      if (typeof onLoad === 'function') {
        onLoad(new GLTF());
      }
    });
  }
}

function createStubScene() {
  return {
    clone() {
      return createStubScene();
    },
    traverse(callback) {
      if (typeof callback === 'function') {
        callback({
          isMesh: true,
          material: {
            clone() {
              return {
                clone: this.clone,
                color: this.color,
                emissive: this.emissive,
              };
            },
            color: { set() {} },
            emissive: { set() {} },
            emissiveIntensity: 0,
          },
        });
      }
    },
  };
}
