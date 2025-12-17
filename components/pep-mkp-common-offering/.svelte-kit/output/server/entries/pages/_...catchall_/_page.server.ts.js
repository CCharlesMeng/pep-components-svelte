import { promises } from "fs";
import path from "path";
const COMPONENT_DATA_HEADER = "x-component-data";
function isDevMode() {
  return process.env.NODE_ENV === "development";
}
function createDataLoader(jsonPath = "data.json") {
  return async ({ request }) => {
    if (request.componentData) {
      console.log("[BFF Mode] Data loaded from req.componentData");
      return request.componentData;
    }
    const bffDataHeader = request.headers.get(COMPONENT_DATA_HEADER);
    if (bffDataHeader) {
      try {
        const decodedData = decodeURIComponent(bffDataHeader);
        const parsedData = JSON.parse(decodedData);
        console.log("[BFF Mode] Data loaded from header");
        return parsedData;
      } catch (error) {
        console.error("Failed to parse BFF data from header:", error);
      }
    }
    if (isDevMode()) {
      try {
        const absolutePath = path.resolve(jsonPath);
        const fileContent = await promises.readFile(absolutePath, "utf-8");
        const data = JSON.parse(fileContent);
        console.log(`[Dev Mode] Data loaded from ${jsonPath}`);
        return data;
      } catch (error) {
        console.error(`Error loading ${jsonPath}:`, error);
        return {};
      }
    }
    throw new Error(
      `[Production Mode] No data source available. Please ensure BFF passes data via req.componentData or x-component-data header.`
    );
  };
}
const load = createDataLoader("data.json");
export {
  load
};
