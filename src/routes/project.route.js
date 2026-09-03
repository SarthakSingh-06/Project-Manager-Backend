import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyUserRole } from "../middlewares/role.middleware.js";

const router = Router();

router.use(verifyJWT); // verify user JWT token

router.router("/")
    .get(getUserProjects)
    .post(createProject);

router.route("/:projectId")
    .get(getProjectDetails)
    .put(updateProjectDetails)
    .delete(deleteProjectDetails);

router.route("/:projectId/members")
    .get(listProjectMembers)
    .post(addProjectMembers);

router.route("/:projectId/members/:userId")
    .put(updateUserRole)
    .delete(removeUser);

router.use();
