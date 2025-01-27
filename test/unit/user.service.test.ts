import { User } from "../../src/entities/User";
import { AppDataSource } from "../../src/database/data-source";

describe("User Service", () => {
  const userRepository = AppDataSource.getRepository(User);

  beforeEach(async () => {
    await userRepository.clear();
  });

  test("should create new user", async () => {
    const user = userRepository.create({
      email: "test@example.com",
      name: "Test User",
      role: "user",
    });

    await userRepository.save(user);
    const savedUser = await userRepository.findOne({
      where: { email: "test@example.com" },
    });
    expect(savedUser).toBeDefined();
    expect(savedUser?.name).toBe("Test User");
  });
});
