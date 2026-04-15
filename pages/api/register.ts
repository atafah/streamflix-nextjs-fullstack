import bcrypt from "bcrypt";
import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/lib/prismadb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  try {
    const { email, name, password } = req.body;

    const existingUser = await prismadb.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      res.status(422).json({ error: "Email taken" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prismadb.user.create({
      data: {
        email,
        name,
        hashedPassword,
        image: "",
        emailVerified: new Date(),
      },
    });

    res.status(200).json(user);
    return;
  } catch (error) {
    console.log(error);
    const message =
      error instanceof Error ? error.message : "Unknown registration error";
    res.status(500).json({ error: message });
    return;
  }
}
