import { Species } from "../crate/pkg/sandtable";

export function rgbaToSpecies(r, g, b, a) {
  // Transparent to Empty
  if (a < 250) {
    return 0;
  }

  r /= 255;
  g /= 255;
  b /= 255;

  // https://github.com/Qix-/color-convert/blob/master/conversions.js#L58
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  const delta = max - min;
  let h;
  let s;

  if (max === min) {
    h = 0;
  } else if (r === max) {
    h = (g - b) / delta;
  } else if (g === max) {
    h = 2 + (b - r) / delta;
  } else if (b === max) {
    h = 4 + (r - g) / delta;
  }

  h = Math.min(h * 60, 360);

  if (h < 0) {
    h += 360;
  }

  const l = (min + max) / 2;

  if (max === min) {
    s = 0;
  } else if (l <= 0.5) {
    s = delta / (max + min);
  } else {
    s = delta / (2 - max - min);
  }

  // Greyscale options
  if (s < 0.05) {
    // Black to Wall
    if (l < 0.05) {
      return Species.Wall;
    }
    // White to Empty
    if (l > 0.95) {
      return Species.Empty;
    }
    // Light grey to Sand
    if (l > 0.5) {
      return Species.Sand;
    }
  }

  // Color options
  let hueIndex = Math.floor((h + 25.7) / 360 * 7);
  let lightnessIndex = Math.floor(l * 4 - 0.25);

  const colorsToSpecies = [
    [ Species.Fire, Species.Lava, Species.Rocket], // Red
    [ Species.Wood, null, Species.Gas], // Yellow
    [ Species.Plant, Species.Dust, Species.Acid], // Green
    [ Species.Plant, Species.Dust, Species.Acid ], // Green2: duplicate b/c they are perceptually close
    [ Species.Water, Species.Ice, Species.Stone ], // Blue
    [ Species.Oil, Species.Seed, Species.Fungus], // Purple
    [ Species.Cloner, Species.Mite, null ], // Violet
  ];

  const species = colorsToSpecies?.[hueIndex]?.[lightnessIndex];

  return species ? species : Species.Empty;
}

const MAX_SVG_INPUT_BYTES = 1_000_000;
const MAX_SVG_NODE_COUNT = 10_000;
const FORBIDDEN_SVG_ELEMENTS = new Set([
  "script",
  "foreignobject",
  "iframe",
  "object",
  "embed",
  "image",
  "audio",
  "video",
  "use",
  "link",
  "style",
]);

function validateSvgDocument(doc, svgString) {
  if (!svgString || /<!DOCTYPE|<!ENTITY/i.test(svgString)) {
    throw new Error("SVG contains a forbidden document declaration.");
  }

  const root = doc.documentElement;
  if (!root || root.localName.toLowerCase() !== "svg") {
    throw new Error("SVG root element is missing.");
  }

  const elements = doc.querySelectorAll("*");
  if (elements.length > MAX_SVG_NODE_COUNT) {
    throw new Error("SVG contains too many elements.");
  }

  for (const element of elements) {
    const elementName = element.localName.toLowerCase();
    if (FORBIDDEN_SVG_ELEMENTS.has(elementName)) {
      throw new Error("SVG contains a forbidden element.");
    }

    for (const attribute of element.attributes) {
      const attributeName = attribute.name.toLowerCase();
      const attributeValue = attribute.value.trim();

      if (
        attributeName.startsWith("on") ||
        attributeName === "src" ||
        attributeName === "xml:base" ||
        attributeName === "action" ||
        attributeName === "formaction"
      ) {
        throw new Error("SVG contains an executable or external attribute.");
      }
      if (
        attributeName === "href" ||
        attributeName === "xlink:href"
      ) {
        if (!attributeValue.startsWith("#")) {
          throw new Error("SVG contains an external reference.");
        }
      }
      if (/url\s*\(|@import|expression\s*\(/i.test(attributeValue)) {
        throw new Error("SVG contains an external CSS reference.");
      }
    }
  }
}

export async function svgToImageData(svgString) {
  const width = 300;
  const height = 300;
  if (typeof svgString !== "string") {
    throw new TypeError("SVG input must be a string.");
  }
  if (new Blob([svgString]).size > MAX_SVG_INPUT_BYTES) {
    throw new Error("SVG input is too large.");
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const errorNode = doc.querySelector("parsererror");
  if (errorNode) {
    throw new Error("Error while parsing SVG.");
  }
  validateSvgDocument(doc, svgString);

  // We want to fit any pasted SVG to the default Sandspiel universe size.
  doc.documentElement.setAttribute("width", width + "px");
  doc.documentElement.setAttribute("height", height + "px");

  const serializer = new XMLSerializer();
  const svgStringSized = serializer.serializeToString(doc);
  const blob = new Blob([svgStringSized], { type: "image/svg+xml" });

  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.width = width;
    img.height = height;
    let objectUrl = null;

    const cleanup = () => {
      if (objectUrl !== null) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = null;
      }
      img.removeEventListener("load", handleLoad);
      img.removeEventListener("error", handleError);
    };
    const handleError = (error) => {
      cleanup();
      reject(error);
    };
    const handleLoad = () => {
      try {
        // Then we write the image pixels to a canvas.
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Unable to create a 2D canvas context.");
        }

        // Transform context to match Sandspiel Universe.
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((-90 * Math.PI) / 180);
        ctx.scale(-1, 1.0);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

        ctx.drawImage(img, 0, 0);
        resolve(ctx.getImageData(0, 0, width, height));
      } catch (error) {
        reject(error);
      } finally {
        cleanup();
      }
    };

    img.addEventListener("load", handleLoad, { once: true });
    img.addEventListener("error", handleError, { once: true });
    try {
      objectUrl = URL.createObjectURL(blob);
      img.src = objectUrl;
    } catch (error) {
      handleError(error);
    }
  });
}
