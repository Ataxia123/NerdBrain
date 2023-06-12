import { Router } from "express";
import {

    create, broadcast,
    sign 
} from "../lensControllers/index.js";

const router = Router();

// GET - Routes
router.get("/sign", sign);


// POST - Routes
router.post("/create", create);
router.post("/create-post", broadcast);



export default router;