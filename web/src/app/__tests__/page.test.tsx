import { redirect } from "next/navigation";
import RootPage from "../page";

jest.mock("next/navigation", () => ({ redirect: jest.fn() }));

describe("local profile root route", () => {
  const originalProfile = process.env.NEXT_PUBLIC_GRADEOPS_PROFILE;

  afterEach(() => {
    if (originalProfile === undefined) delete process.env.NEXT_PUBLIC_GRADEOPS_PROFILE;
    else process.env.NEXT_PUBLIC_GRADEOPS_PROFILE = originalProfile;
    jest.clearAllMocks();
  });

  it("enters the mock preview without touching login or Firebase", () => {
    process.env.NEXT_PUBLIC_GRADEOPS_PROFILE = "local-preview";

    RootPage();

    expect(redirect).toHaveBeenCalledWith("/preview");
  });

  it("keeps the real login entry for develop", () => {
    process.env.NEXT_PUBLIC_GRADEOPS_PROFILE = "develop";

    RootPage();

    expect(redirect).toHaveBeenCalledWith("/login");
  });
});
