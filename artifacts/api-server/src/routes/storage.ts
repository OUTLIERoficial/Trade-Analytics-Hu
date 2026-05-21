import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { Readable } from "stream";
import { ObjectStorageService, ObjectNotFoundError } from "../lib/objectStorage";

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

router.post("/storage/uploads/request-url", async (req: Request, res: Response) => {
  const { name, size, contentType } = req.body ?? {};
  if (!name || !contentType) {
    res.status(400).json({ error: "Missing required fields: name, contentType" });
    return;
  }
  try {
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);
    res.json({ uploadURL, objectPath, metadata: { name, size, contentType } });
  } catch (error) {
    req.log.error({ error }, "Failed to generate presigned upload URL");
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

router.use("/storage/objects", async (req: Request, res: Response, next: NextFunction) => {
  if (req.method !== "GET") { next(); return; }
  const objectPath = `/objects${req.path}`;
  try {
    const file = await objectStorageService.getObjectEntityFile(objectPath);
    const response = await objectStorageService.downloadObject(file, 3600);
    const headers = Object.fromEntries(response.headers.entries());
    res.set(headers);
    res.status(response.status);
    if (response.body) {
      Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0]).pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "Object not found" });
    } else {
      req.log.error({ error }, "Failed to serve object");
      res.status(500).json({ error: "Failed to retrieve object" });
    }
  }
});

router.use("/storage/public-objects", async (req: Request, res: Response, next: NextFunction) => {
  if (req.method !== "GET") { next(); return; }
  const filePath = req.path.replace(/^\//, "");
  try {
    const file = await objectStorageService.searchPublicObject(filePath);
    if (!file) {
      res.status(404).json({ error: "Object not found" });
      return;
    }
    const response = await objectStorageService.downloadObject(file, 86400);
    const headers = Object.fromEntries(response.headers.entries());
    res.set(headers);
    res.status(response.status);
    if (response.body) {
      Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0]).pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    req.log.error({ error }, "Failed to serve public object");
    res.status(500).json({ error: "Failed to retrieve object" });
  }
});

export default router;
