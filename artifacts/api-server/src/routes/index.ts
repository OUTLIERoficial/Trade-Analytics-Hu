import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import accountsRouter from "./accounts";
import tradesRouter from "./trades";
import psychologyRouter from "./psychology";
import analyticsRouter from "./analytics";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(accountsRouter);
router.use(tradesRouter);
router.use(psychologyRouter);
router.use(analyticsRouter);
router.use(storageRouter);

export default router;
