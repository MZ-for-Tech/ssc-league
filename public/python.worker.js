const PYODIDE_VERSION = "0.23.4";
const PACKAGE_CACHE_NAME = `ssc-python-assets-v${PYODIDE_VERSION}`;
const IMPORT_TO_PACKAGE = {
  numpy: "numpy",
  scipy: "scipy",
  pandas: "pandas",
  matplotlib: "matplotlib",
  seaborn: "seaborn",
  sklearn: "scikit-learn",
};
const PACKAGE_LABELS = {
  numpy: "NumPy",
  scipy: "SciPy",
  pandas: "pandas",
  matplotlib: "Matplotlib",
  seaborn: "Seaborn",
  "scikit-learn": "scikit-learn",
};
const SEABORN_VERSION = "0.13.2";
let runtime = null;
let activeRunId = null;
let seabornInstalled = false;

async function enablePersistentPackageCache() {
  if (!self.caches || typeof self.fetch !== "function") return;

  try {
    const cache = await self.caches.open(PACKAGE_CACHE_NAME);
    const fetchFromNetwork = self.fetch.bind(self);

    self.fetch = async (input, init) => {
      const request = new Request(input, init);
      const url = new URL(request.url);
      const isPyodideAsset =
        url.origin === "https://cdn.jsdelivr.net" &&
        url.pathname.startsWith(`/pyodide/v${PYODIDE_VERSION}/full/`);
      const isPythonWheel =
        url.origin === "https://files.pythonhosted.org" &&
        url.pathname.endsWith(".whl");

      if (request.method !== "GET" || (!isPyodideAsset && !isPythonWheel)) {
        return fetchFromNetwork(request);
      }

      try {
        const cached = await cache.match(request);
        if (cached) return cached;
      } catch {
        // A cache read failure should not prevent Python from loading online.
      }

      const response = await fetchFromNetwork(request);
      if (response.ok && response.type !== "opaque") {
        try {
          await cache.put(request, response.clone());
        } catch {
          // Quota limits or browser storage restrictions should not block a run.
        }
      }
      return response;
    };
  } catch {
    // CacheStorage is optional; the browser's regular HTTP cache remains usable.
  }
}

function getImportedPackages(code) {
  const getImports = runtime.globals.get("_ssc_get_imports");
  try {
    const imports = getImports(code);
    try {
      return Array.from(imports.toJs())
        .map((moduleName) => IMPORT_TO_PACKAGE[moduleName])
        .filter(Boolean);
    } finally {
      imports.destroy();
    }
  } finally {
    getImports.destroy();
  }
}

async function loadImportedPackages(code, runId) {
  const requested = [...new Set(getImportedPackages(code))];
  if (requested.length === 0) return requested;

  const labels = requested.map((name) => PACKAGE_LABELS[name]);
  self.postMessage({ type: "package-loading", runId, packages: labels });

  const builtInPackages = requested.filter((name) => name !== "seaborn");
  if (builtInPackages.length > 0) {
    const notLoaded = builtInPackages.filter((name) => !runtime.loadedPackages?.[name]);
    if (notLoaded.length > 0) await runtime.loadPackage(notLoaded);
  }

  if (requested.includes("seaborn") && !seabornInstalled) {
    // Seaborn is a pure Python package that is not included in Pyodide 0.23.4.
    // Load its compiled scientific dependencies from Pyodide before installing it.
    const seabornDependencies = ["numpy", "pandas", "matplotlib", "scipy"]
      .filter((name) => !runtime.loadedPackages?.[name]);
    if (seabornDependencies.length > 0) await runtime.loadPackage(seabornDependencies);
    if (!runtime.loadedPackages?.micropip) await runtime.loadPackage("micropip");

    const micropip = runtime.pyimport("micropip");
    try {
      await micropip.install(`seaborn==${SEABORN_VERSION}`);
      seabornInstalled = true;
    } finally {
      micropip.destroy();
    }
  }

  return requested;
}

async function postFigures(runId) {
  const figures = await runtime.runPythonAsync("_ssc_capture_figures()");
  try {
    for (const [index, base64Png] of Array.from(figures.toJs()).entries()) {
      self.postMessage({
        type: "plot",
        runId,
        index: index + 1,
        dataUrl: `data:image/png;base64,${base64Png}`,
      });
    }
  } finally {
    figures.destroy();
  }
}

async function initializeRuntime() {
  try {
    const indexURL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
    await enablePersistentPackageCache();
    importScripts(`${indexURL}pyodide.js`);
    runtime = await loadPyodide({ indexURL });

    runtime.runPython(`
import ast

def _ssc_get_imports(source):
    tree = ast.parse(source)
    imported = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            imported.update(alias.name.split(".", 1)[0] for alias in node.names)
        elif isinstance(node, ast.ImportFrom) and node.module:
            imported.add(node.module.split(".", 1)[0])
    return sorted(imported)

def _ssc_capture_figures():
    import base64
    import io
    import matplotlib.pyplot as plt

    images = []
    for number in plt.get_fignums():
        buffer = io.BytesIO()
        plt.figure(number).savefig(buffer, format="png", bbox_inches="tight", dpi=120)
        images.append(base64.b64encode(buffer.getvalue()).decode("ascii"))
        buffer.close()
    plt.close("all")
    return images
`);

    runtime.setStdout({
      batched: (text) => {
        if (activeRunId !== null) self.postMessage({ type: "stdout", runId: activeRunId, text });
      },
    });
    runtime.setStderr({
      batched: (text) => {
        if (activeRunId !== null) self.postMessage({ type: "stderr", runId: activeRunId, text });
      },
    });

    const pythonVersion = await runtime.runPythonAsync("import sys; sys.version.split()[0]");
    self.postMessage({
      type: "ready",
      pythonVersion: String(pythonVersion),
      pyodideVersion: runtime.version,
    });
  } catch (error) {
    self.postMessage({
      type: "load-error",
      message: error instanceof Error ? error.message : "The Python runtime could not be loaded.",
    });
  }
}

self.onmessage = async ({ data }) => {
  if (data.type !== "run" || !runtime) return;
  activeRunId = data.runId;
  let hasPlottingLibrary = false;

  try {
    const importedPackages = await loadImportedPackages(data.code, data.runId);
    hasPlottingLibrary = importedPackages.includes("matplotlib") || importedPackages.includes("seaborn");
    if (hasPlottingLibrary) {
      await runtime.runPythonAsync(`
import matplotlib
matplotlib.use("Agg", force=True)
import matplotlib.pyplot as plt
plt.show = lambda *args, **kwargs: None
`);
    }

    const result = await runtime.runPythonAsync(data.code);
    if (result !== undefined && result !== null) {
      const isProxy = typeof result === "object" && typeof result.destroy === "function";
      const text = typeof result === "string" ? result : String(result);
      if (text && text !== "[object Object]") {
        self.postMessage({ type: "result", runId: data.runId, text });
      }
      if (isProxy) result.destroy();
    }
  } catch (error) {
    self.postMessage({
      type: "stderr",
      runId: data.runId,
      text: error instanceof Error ? error.message : String(error),
    });
  } finally {
    if (hasPlottingLibrary) {
      try {
        await postFigures(data.runId);
      } catch (error) {
        self.postMessage({
          type: "stderr",
          runId: data.runId,
          text: `Could not render plot: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }
    self.postMessage({ type: "complete", runId: data.runId });
    activeRunId = null;
  }
};

void initializeRuntime();
