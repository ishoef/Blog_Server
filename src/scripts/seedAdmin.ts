import { prisma } from "../lib/prisma";
import { UserRole } from "../middleware/authMiddleware";

async function seedAdmin() {
  try {
    // admin data - put in env
    const adminData = {
      name: "Ismail Nayef",
      email: "ismailnayef31@gmail.com",
      role: UserRole.ADMIN,
      password: "admin123",
    };

    // check user exists on db or not
    const existingUser = await prisma.user.findUnique({
      where: {
        email: adminData.email,
      },
    });

    if (existingUser) {
      throw new Error("User already exists!!");
    }

    const signUpAdmin = await fetch(
      "http://localhost:3000/api/auth/sign-up/email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(adminData),
      },
    );

    console.log(signUpAdmin);
  } catch (e) {
    console.log("SeedAdmin Error: ", e);
  }
}

seedAdmin();
