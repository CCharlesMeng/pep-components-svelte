import { promises } from 'fs';
import path from 'path';

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

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 2;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BRvNsrvU.js')).default;
const server_id = "src/routes/[...catchall]/+page.server.ts";
const imports = ["_app/immutable/nodes/2.B_K6RGQb.js","_app/immutable/chunks/Dlc_SMu7.js","_app/immutable/chunks/BfU0bO0h.js"];
const stylesheets = ["_app/immutable/assets/2.Bbgck-ta.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=2-BbT_7cPK.js.map
