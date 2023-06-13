import { createPost } from "./scripts/createGatedPost";
import type { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  if (req.method === "POST") {
    const text = req.body.text;
    const messageSender = req.body.msgSender;
    const value = req.body.value;
    const description = req.body.description;
    console.log("text: ", text, "msgSender: ", messageSender, "value: ", value);
    try {
      const textData = await createPost(text, messageSender, value, description);
      res.status(200).json({ data: textData, message: "updated" });
    } catch (error: any) {
      res.status(500).json({ error: "Error generating scanner output." });
    }
  } else {
    res.status(405).json({ error: "Method not allowed." });
  }
};
