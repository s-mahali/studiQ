import cron from "node-cron";
import User from "../models/user.model.js";

export const removeUnverifiedAccount = () => {
    cron.schedule("*/30 * * * *", async () => {
           const thirtyminutesAgo = new Date(Date.now() - 30 * 60 * 1000);
           await User.deleteMany({
            createdAt: { $lt: thirtyminutesAgo },
            accountVerified: false,
           });
    })
}

// This cron job will run every 30 minutes and delete unverified accounts that have not been verified within 30 minutes of their creation.



