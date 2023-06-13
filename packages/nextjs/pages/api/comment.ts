import { commentThingy } from "./scripts/createComment";
import type { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  if (req.method === "POST") {
    const postId = req.body.postId;
    const description = req.body.description;
    try {
      console.log("text: ", postId, "description:", req.body);
      const postData = await commentThingy(postId, description);

      res.status(200).json({ data: postData, message: "commented" });
    } catch (error: any) {
      res.status(500).json({ error: "Error generating scanner output." });
    }
  } else {
    res.status(405).json({ error: "Method not allowed." });
  }
};
